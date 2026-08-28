// Validator agent (Part 3) — connects the existing scoring system
// (lib/scoring.ts) to real evidence (lib/validator.ts) instead of pretending
// every dimension is objectively measured. Runs automatically right after
// the Scout saves evidence for an opportunity, and can be re-run by hand
// from the opportunity detail page.
//
// This agent only ever writes scores/recommendation fields — it never
// changes ProductOpportunity.status. A human still clicks Approve/Watch/
// Reject.

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateOverallScore, deriveRiskLevel } from "@/lib/scoring";
import { evaluateFromEvidence, recommendAction } from "@/lib/validator";
import { AgentResult } from "../types";

export async function runValidator(opportunityId: string): Promise<AgentResult> {
  const startedAt = new Date();
  const jobRun = await prisma.jobRun.create({
    data: {
      opportunityId,
      agent: "VALIDATE_PRODUCT",
      status: "RUNNING",
      startedAt,
      input: { opportunityId },
    },
  });

  try {
    const opportunity = await prisma.productOpportunity.findUniqueOrThrow({
      where: { id: opportunityId },
      include: { trendEvidenceItems: true },
    });

    if (opportunity.trendEvidenceItems.length === 0) {
      // Hand-entered opportunity with no structured evidence — nothing to
      // recompute automatically, but still surface a recommendation off
      // whatever score is already on file.
      const { action, reason } = recommendAction(opportunity.overallScore);
      await prisma.productOpportunity.update({
        where: { id: opportunityId },
        data: { recommendedAction: action, recommendedActionReason: reason },
      });
      await prisma.jobRun.update({
        where: { id: jobRun.id },
        data: {
          status: "SUCCEEDED",
          finishedAt: new Date(),
          itemsProcessed: 0,
          summary: "No structured evidence on file — scores left as entered manually; recommendation recomputed from current overall score.",
        },
      });
      return { status: "SUCCEEDED", message: "No structured evidence — recommendation only.", data: { action } };
    }

    const { scores, details } = evaluateFromEvidence(
      opportunity.trendEvidenceItems.map((e) => ({
        label: e.label,
        source: e.source,
        url: e.url,
        observedAt: e.observedAt,
        confidence: e.confidence,
        metricValue: e.metricValue,
      })),
    );

    const overallScore = calculateOverallScore(scores);
    const riskLevel = deriveRiskLevel(scores);
    const { action, reason } = recommendAction(overallScore);

    await prisma.productOpportunity.update({
      where: { id: opportunityId },
      data: {
        scoreTrendVelocity: scores.trendVelocity,
        scoreCreativePotential: scores.creativePotential,
        scoreMarginPotential: scores.marginPotential,
        scoreMarketDemand: scores.marketDemand,
        scoreCompetition: scores.competition,
        scoreFulfillmentSimplicity: scores.fulfillmentSimplicity,
        scoreRepeatPurchase: scores.repeatPurchase,
        scoreRegulatoryRisk: scores.regulatoryRisk,
        scoreBrandability: scores.brandability,
        scoreDetails: details as unknown as Prisma.InputJsonValue,
        overallScore,
        riskLevel,
        recommendedAction: action,
        recommendedActionReason: reason,
      },
    });

    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "SUCCEEDED",
        finishedAt: new Date(),
        itemsProcessed: opportunity.trendEvidenceItems.length,
        summary: `Scored from ${opportunity.trendEvidenceItems.length} evidence row(s). Overall ${overallScore.toFixed(1)}/10 -> ${action}.`,
      },
    });

    return { status: "SUCCEEDED", message: `Recommendation: ${action}`, data: { action, overallScore } };
  } catch (err) {
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: String(err instanceof Error ? err.message : err),
      },
    });
    return { status: "FAILED", message: `Validator failed: ${String(err)}`, data: null };
  }
}
