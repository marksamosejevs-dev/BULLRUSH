"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ApprovalAction,
  ApprovalStatus,
  CreativeType,
  ComplianceStatus as PrismaComplianceStatus,
  RiskCategory as PrismaRiskCategory,
  RiskLevel as PrismaRiskLevel,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateOverallScore, deriveRiskLevel, ScoringInput } from "@/lib/scoring";
import { canTransition, OpportunityStatus } from "@/lib/state-machine";
import { initialComplianceStatus, requiresComplianceReview, RiskCategory } from "@/lib/compliance";
import { runScout } from "@/agents/scout";
import { runSourcing } from "@/agents/sourcing";
import { runValidator } from "@/agents/validator";

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
  // Risk category and the compliance gate's starting status are copied in
  // at creation time so the gate can never be skipped by omission.
  if (to === "APPROVED_FOR_TEST") {
    await prisma.product.upsert({
      where: { opportunityId: id },
      create: {
        opportunityId: id,
        name: opportunity.name,
        category: opportunity.category,
        riskCategory: opportunity.riskCategory,
        complianceStatus: initialComplianceStatus(opportunity.riskCategory as RiskCategory) as PrismaComplianceStatus,
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
      riskCategory: (str(formData, "riskCategory") || "UNKNOWN") as PrismaRiskCategory,
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
      riskCategory: (str(formData, "riskCategory") || "UNKNOWN") as PrismaRiskCategory,
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
// Scout (Part 1, 16) — real, query-directed research
// ---------------------------------------------------------------------------

export async function runScoutAction(formData: FormData) {
  const query = str(formData, "query");
  if (!query) return;
  await runScout(query);
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Sourcing (Parts 4-11, 16) — real supplier search + shipping quotes
// ---------------------------------------------------------------------------

export async function runSourcingAction(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  await runSourcing(opportunityId);
  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

export async function rerunValidatorAction(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  await runValidator(opportunityId);
  revalidatePath(`/admin/opportunities/${opportunityId}`);
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

  const unitCost = parseOptionalFloat(formData, "unitCost");
  const usShippingCost = parseOptionalFloat(formData, "usShippingCost");

  await prisma.supplierQuote.create({
    data: {
      opportunityId,
      supplierId,
      providerKey: "MANUAL",
      unitCost,
      usShippingCost,
      landedCost: unitCost !== null && usShippingCost !== null ? unitCost + usShippingCost : null,
      estimatedDeliveryDays: parseOptionalInt(formData, "estimatedDeliveryDays"),
      moq: parseOptionalInt(formData, "quoteMoq"),
      notes: optionalStr(formData, "quoteNotes"),
    },
  });

  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

// Explicit human selection (Part 12/13) — separate from the matching
// engine's automatic isSystemRecommended pick. Persists the supplier/
// variant mapping on Product and applies the compliance gate (Part 14):
// a regulated risk category that hasn't been cleared routes to
// COMPLIANCE_REQUIRED instead of READY_TO_BUILD. Never places an order.
export async function selectValidationSupplierQuote(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  const quoteId = str(formData, "quoteId");

  const [opportunity, product] = await Promise.all([
    prisma.productOpportunity.findUniqueOrThrow({ where: { id: opportunityId } }),
    prisma.product.findUnique({ where: { opportunityId } }),
  ]);

  await prisma.$transaction([
    prisma.supplierQuote.updateMany({ where: { opportunityId }, data: { isSelectedForValidation: false } }),
    prisma.supplierQuote.update({ where: { id: quoteId }, data: { isSelectedForValidation: true } }),
  ]);

  if (!product) {
    // No Product record yet (opportunity was never approved for test) —
    // record the selection but there's no compliance gate or status to
    // move without a Product to attach it to.
    revalidatePath(`/admin/opportunities/${opportunityId}`);
    return;
  }

  await prisma.product.update({ where: { id: product.id }, data: { selectedSupplierQuoteId: quoteId } });

  const requiresReview = requiresComplianceReview(product.riskCategory as RiskCategory);
  const cleared = product.complianceStatus === "CLEARED";
  const target: OpportunityStatus = requiresReview && !cleared ? "COMPLIANCE_REQUIRED" : "READY_TO_BUILD";

  if (canTransition(opportunity.status as OpportunityStatus, target)) {
    await prisma.productOpportunity.update({ where: { id: opportunityId }, data: { status: target } });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

// ---------------------------------------------------------------------------
// Compliance gate (Part 14)
// ---------------------------------------------------------------------------

export async function updateComplianceDetails(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  const productId = str(formData, "productId");
  const riskCategory = (str(formData, "riskCategory") || "UNKNOWN") as PrismaRiskCategory;

  const requiresReview = requiresComplianceReview(riskCategory as RiskCategory);
  const current = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

  // Changing risk category (or editing details before a review is done)
  // never auto-clears — only the explicit "Mark cleared" action below can
  // set CLEARED. It only resets an already-cleared status if the category
  // itself changed, since that invalidates the prior review.
  const categoryChanged = current.riskCategory !== riskCategory;
  const complianceStatus: PrismaComplianceStatus = !requiresReview
    ? "NOT_REQUIRED"
    : current.complianceStatus === "CLEARED" && !categoryChanged
      ? "CLEARED"
      : "IN_REVIEW";

  await prisma.product.update({
    where: { id: productId },
    data: {
      riskCategory,
      complianceStatus,
      ingredients: optionalStr(formData, "ingredients"),
      manufacturer: optionalStr(formData, "manufacturer"),
      manufacturingCountry: optionalStr(formData, "manufacturingCountry"),
      coaUrl: optionalStr(formData, "coaUrl"),
      gmpCertified: parseOptionalBool(formData, "gmpCertified"),
      testingDocumentsUrl: optionalStr(formData, "testingDocumentsUrl"),
      labelingReviewStatus: str(formData, "labelingReviewStatus") || "NOT_STARTED",
      fdaRelevantStatus: str(formData, "fdaRelevantStatus") || "NOT_REVIEWED",
      claimsReviewStatus: str(formData, "claimsReviewStatus") || "NOT_STARTED",
      complianceNotes: optionalStr(formData, "complianceNotes"),
    },
  });

  // Keep the opportunity's own risk category in sync too, so re-running
  // Sourcing or viewing the opportunity list reflects the same category.
  await prisma.productOpportunity.update({ where: { id: opportunityId }, data: { riskCategory } });

  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

// A deliberate, separate action — clearing compliance is a human decision
// that must be explicit, never a side effect of editing other fields.
export async function clearCompliance(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  const productId = str(formData, "productId");

  await prisma.product.update({
    where: { id: productId },
    data: {
      complianceStatus: "CLEARED",
      complianceReviewedBy: optionalStr(formData, "reviewedBy"),
      complianceReviewedAt: new Date(),
    },
  });

  // If the opportunity was blocked on this gate, it can now proceed —
  // still requires a validation supplier to already be selected.
  const opportunity = await prisma.productOpportunity.findUniqueOrThrow({ where: { id: opportunityId } });
  if (
    opportunity.status === "COMPLIANCE_REQUIRED" &&
    canTransition(opportunity.status as OpportunityStatus, "READY_TO_BUILD")
  ) {
    await prisma.productOpportunity.update({ where: { id: opportunityId }, data: { status: "READY_TO_BUILD" } });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

export async function reopenCompliance(formData: FormData) {
  const opportunityId = str(formData, "opportunityId");
  const productId = str(formData, "productId");

  await prisma.product.update({
    where: { id: productId },
    data: { complianceStatus: "IN_REVIEW", complianceReviewedBy: null, complianceReviewedAt: null },
  });

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
