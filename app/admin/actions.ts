"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ApprovalAction,
  ApprovalStatus,
  CreativeType,
  RiskLevel as PrismaRiskLevel,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateOverallScore, deriveRiskLevel, ScoringInput } from "@/lib/scoring";
import { canTransition, OpportunityStatus } from "@/lib/state-machine";

function num(formData: FormData, key: string, fallback = 0): number {
  const raw = formData.get(key);
  const parsed = typeof raw === "string" ? parseFloat(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function str(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function optionalStr(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value.length > 0 ? value : null;
}

// ---------------------------------------------------------------------------
// Status transitions
// ---------------------------------------------------------------------------

async function applyTransition(id: string, to: OpportunityStatus) {
  const opportunity = await prisma.productOpportunity.findUniqueOrThrow({
    where: { id },
  });
  const from = opportunity.status as OpportunityStatus;
  if (!canTransition(from, to)) {
    throw new Error(`Cannot move opportunity from ${from} to ${to}`);
  }

  await prisma.productOpportunity.update({
    where: { id },
    data: { status: to },
  });

  // Approving a test is the milestone: it starts the concrete Product
  // record that later carries brand name, domain, and Shopify draft info.
  if (to === "APPROVED_FOR_TEST") {
    await prisma.product.upsert({
      where: { opportunityId: id },
      create: {
        opportunityId: id,
        name: opportunity.name,
        category: opportunity.category,
      },
      update: {},
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/opportunities/${id}`);
}

export async function transitionFromDashboard(formData: FormData) {
  const id = str(formData, "id");
  const to = str(formData, "to") as OpportunityStatus;
  await applyTransition(id, to);
}

export async function transitionFromDetail(formData: FormData) {
  const id = str(formData, "id");
  const to = str(formData, "to") as OpportunityStatus;
  await applyTransition(id, to);
}

// ---------------------------------------------------------------------------
// Create opportunity
// ---------------------------------------------------------------------------

export async function createOpportunity(formData: FormData) {
  const scores: ScoringInput = {
    trendVelocity: num(formData, "scoreTrendVelocity"),
    creativePotential: num(formData, "scoreCreativePotential"),
    marginPotential: num(formData, "scoreMarginPotential"),
    marketDemand: num(formData, "scoreMarketDemand"),
    competition: num(formData, "scoreCompetition"),
    fulfillmentSimplicity: num(formData, "scoreFulfillmentSimplicity"),
    repeatPurchase: num(formData, "scoreRepeatPurchase"),
    regulatoryRisk: num(formData, "scoreRegulatoryRisk"),
    brandability: num(formData, "scoreBrandability"),
  };

  const created = await prisma.productOpportunity.create({
    data: {
      name: str(formData, "name"),
      category: str(formData, "category"),
      description: str(formData, "description"),
      source: str(formData, "source") || "Manual entry",
      trendSignal: str(formData, "trendSignal"),
      trendEvidence: optionalStr(formData, "trendEvidence"),
      scoreTrendVelocity: scores.trendVelocity,
      scoreCreativePotential: scores.creativePotential,
      scoreMarginPotential: scores.marginPotential,
      scoreMarketDemand: scores.marketDemand,
      scoreCompetition: scores.competition,
      scoreFulfillmentSimplicity: scores.fulfillmentSimplicity,
      scoreRepeatPurchase: scores.repeatPurchase,
      scoreRegulatoryRisk: scores.regulatoryRisk,
      scoreBrandability: scores.brandability,
      overallScore: calculateOverallScore(scores),
      riskLevel: deriveRiskLevel(scores) as PrismaRiskLevel,
      sellingPrice: num(formData, "sellingPrice"),
      cogs: num(formData, "cogs"),
      shippingCost: num(formData, "shippingCost"),
      packagingCost: num(formData, "packagingCost"),
      paymentFeePct: num(formData, "paymentFeePct", 2.9),
      discountPct: num(formData, "discountPct", 0),
      refundRatePct: num(formData, "refundRatePct", 0),
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/opportunities/${created.id}`);
}

// ---------------------------------------------------------------------------
// Edit opportunity (info + scoring + economics in one form)
// ---------------------------------------------------------------------------

export async function updateOpportunity(formData: FormData) {
  const id = str(formData, "id");

  const scores: ScoringInput = {
    trendVelocity: num(formData, "scoreTrendVelocity"),
    creativePotential: num(formData, "scoreCreativePotential"),
    marginPotential: num(formData, "scoreMarginPotential"),
    marketDemand: num(formData, "scoreMarketDemand"),
    competition: num(formData, "scoreCompetition"),
    fulfillmentSimplicity: num(formData, "scoreFulfillmentSimplicity"),
    repeatPurchase: num(formData, "scoreRepeatPurchase"),
    regulatoryRisk: num(formData, "scoreRegulatoryRisk"),
    brandability: num(formData, "scoreBrandability"),
  };

  await prisma.productOpportunity.update({
    where: { id },
    data: {
      name: str(formData, "name"),
      category: str(formData, "category"),
      description: str(formData, "description"),
      source: str(formData, "source"),
      trendSignal: str(formData, "trendSignal"),
      trendEvidence: optionalStr(formData, "trendEvidence"),
      scoreTrendVelocity: scores.trendVelocity,
      scoreCreativePotential: scores.creativePotential,
      scoreMarginPotential: scores.marginPotential,
      scoreMarketDemand: scores.marketDemand,
      scoreCompetition: scores.competition,
      scoreFulfillmentSimplicity: scores.fulfillmentSimplicity,
      scoreRepeatPurchase: scores.repeatPurchase,
      scoreRegulatoryRisk: scores.regulatoryRisk,
      scoreBrandability: scores.brandability,
      overallScore: calculateOverallScore(scores),
      riskLevel: deriveRiskLevel(scores) as PrismaRiskLevel,
      sellingPrice: num(formData, "sellingPrice"),
      cogs: num(formData, "cogs"),
      shippingCost: num(formData, "shippingCost"),
      packagingCost: num(formData, "packagingCost"),
      paymentFeePct: num(formData, "paymentFeePct", 2.9),
      discountPct: num(formData, "discountPct", 0),
      refundRatePct: num(formData, "refundRatePct", 0),
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/opportunities/${id}`);
}

// ---------------------------------------------------------------------------
// Suppliers & quotes
// ---------------------------------------------------------------------------

export async function addSupplierQuote(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  const existingSupplierId = str(formData, "existingSupplierId");

  let supplierId = existingSupplierId;

  if (!supplierId) {
    const supplier = await prisma.supplier.create({
      data: {
        name: str(formData, "supplierName") || "UNKNOWN",
        platform: optionalStr(formData, "platform"),
        productUrl: optionalStr(formData, "productUrl"),
        usWarehouse: parseOptionalBool(formData, "usWarehouse"),
        moq: parseOptionalInt(formData, "moq"),
        rating: parseOptionalFloat(formData, "rating"),
        ordersCount: parseOptionalInt(formData, "ordersCount"),
        privateLabelAvailable: parseOptionalBool(formData, "privateLabelAvailable"),
        shopifyIntegration: parseOptionalBool(formData, "shopifyIntegration"),
        notes: optionalStr(formData, "supplierNotes"),
      },
    });
    supplierId = supplier.id;
  }

  await prisma.supplierQuote.create({
    data: {
      opportunityId,
      supplierId,
      unitCost: parseOptionalFloat(formData, "unitCost"),
      usShippingCost: parseOptionalFloat(formData, "usShippingCost"),
      estimatedDeliveryDays: parseOptionalInt(formData, "estimatedDeliveryDays"),
      moq: parseOptionalInt(formData, "quoteMoq"),
      notes: optionalStr(formData, "quoteNotes"),
    },
  });

  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

export async function setRecommendedSupplierQuote(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  const quoteId = str(formData, "quoteId");

  await prisma.$transaction([
    prisma.supplierQuote.updateMany({
      where: { opportunityId },
      data: { isRecommended: false },
    }),
    prisma.supplierQuote.update({
      where: { id: quoteId },
      data: { isRecommended: true },
    }),
  ]);

  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

// ---------------------------------------------------------------------------
// Brand concepts
// ---------------------------------------------------------------------------

export async function addBrandConcept(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  const domainCandidates = str(formData, "domainCandidates")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  await prisma.brandConcept.create({
    data: {
      opportunityId,
      productName: optionalStr(formData, "productName"),
      brandName: optionalStr(formData, "brandName"),
      tagline: optionalStr(formData, "tagline"),
      offer: optionalStr(formData, "offer"),
      positioning: optionalStr(formData, "positioning"),
      domainCandidates,
    },
  });

  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

export async function selectBrandConcept(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  const conceptId = str(formData, "conceptId");

  await prisma.$transaction([
    prisma.brandConcept.updateMany({
      where: { opportunityId },
      data: { isSelected: false },
    }),
    prisma.brandConcept.update({
      where: { id: conceptId },
      data: { isSelected: true },
    }),
  ]);

  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

// ---------------------------------------------------------------------------
// Creatives
// ---------------------------------------------------------------------------

export async function addCreative(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");

  await prisma.creative.create({
    data: {
      opportunityId,
      type: str(formData, "type") as CreativeType,
      title: str(formData, "title"),
      content: optionalStr(formData, "content"),
      status: "DRAFT",
    },
  });

  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

// ---------------------------------------------------------------------------
// Approvals — recording a decision NEVER executes the underlying action.
// ---------------------------------------------------------------------------

export async function requestApproval(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");

  await prisma.approval.create({
    data: {
      opportunityId,
      action: str(formData, "action") as ApprovalAction,
      requestedBy: optionalStr(formData, "requestedBy"),
      estimatedCost: parseOptionalFloat(formData, "estimatedCost"),
      notes: optionalStr(formData, "notes"),
    },
  });

  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

export async function decideApproval(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  const approvalId = str(formData, "approvalId");
  const decision = str(formData, "decision") as ApprovalStatus;

  await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: decision,
      decidedBy: optionalStr(formData, "decidedBy"),
      decidedAt: new Date(),
    },
  });

  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function parseOptionalFloat(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalInt(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalBool(formData: FormData, key: string): boolean | null {
  const raw = formData.get(key);
  if (raw !== "true" && raw !== "false") return null;
  return raw === "true";
}
