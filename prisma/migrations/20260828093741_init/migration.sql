-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DISCOVERED', 'VALIDATING', 'WATCH', 'REJECTED', 'APPROVED_FOR_TEST', 'SOURCING', 'READY_TO_BUILD', 'BUILDING', 'READY_FOR_REVIEW', 'LIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('UNKNOWN', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('UNKNOWN', 'UNVERIFIED', 'CONTACTED', 'QUOTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CreativeType" AS ENUM ('UGC_SCRIPT', 'VISUAL_ASSET', 'META_BRIEF', 'TIKTOK_BRIEF', 'LANDING_PAGE_COPY');

-- CreateEnum
CREATE TYPE "CreativeStatus" AS ENUM ('NOT_CONFIGURED', 'DRAFT', 'READY');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('BUY_DOMAIN', 'ORDER_SAMPLE', 'PUBLISH_PRODUCT', 'LAUNCH_META', 'LAUNCH_TIKTOK', 'INCREASE_BUDGET', 'ORDER_INVENTORY');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobRunStatus" AS ENUM ('NOT_CONFIGURED', 'QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "ProductOpportunity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DISCOVERED',
    "isDemoData" BOOLEAN NOT NULL DEFAULT false,
    "trendSignal" TEXT NOT NULL,
    "trendEvidence" TEXT,
    "scoreTrendVelocity" DOUBLE PRECISION NOT NULL,
    "scoreCreativePotential" DOUBLE PRECISION NOT NULL,
    "scoreMarginPotential" DOUBLE PRECISION NOT NULL,
    "scoreMarketDemand" DOUBLE PRECISION NOT NULL,
    "scoreCompetition" DOUBLE PRECISION NOT NULL,
    "scoreFulfillmentSimplicity" DOUBLE PRECISION NOT NULL,
    "scoreRepeatPurchase" DOUBLE PRECISION NOT NULL,
    "scoreRegulatoryRisk" DOUBLE PRECISION NOT NULL,
    "scoreBrandability" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'UNKNOWN',
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "cogs" DOUBLE PRECISION NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL,
    "packagingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentFeePct" DOUBLE PRECISION NOT NULL DEFAULT 2.9,
    "discountPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refundRatePct" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT,
    "productUrl" TEXT,
    "usWarehouse" BOOLEAN,
    "moq" INTEGER,
    "rating" DOUBLE PRECISION,
    "ordersCount" INTEGER,
    "privateLabelAvailable" BOOLEAN,
    "shopifyIntegration" BOOLEAN,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'UNKNOWN',
    "status" "SupplierStatus" NOT NULL DEFAULT 'UNKNOWN',
    "notes" TEXT,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierQuote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "usShippingCost" DOUBLE PRECISION,
    "estimatedDeliveryDays" INTEGER,
    "moq" INTEGER,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "SupplierQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandConcept" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "productName" TEXT,
    "brandName" TEXT,
    "tagline" TEXT,
    "offer" TEXT,
    "positioning" TEXT,
    "domainCandidates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isSelected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BrandConcept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creative" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "type" "CreativeType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "assetUrl" TEXT,
    "status" "CreativeStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',

    CONSTRAINT "Creative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "action" "ApprovalAction" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT,
    "decidedBy" TEXT,
    "notes" TEXT,
    "estimatedCost" DOUBLE PRECISION,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opportunityId" TEXT,
    "agent" TEXT NOT NULL,
    "status" "JobRunStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "input" JSONB,
    "output" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandName" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT,
    "landingPageUrl" TEXT,
    "shopifyProductId" TEXT,
    "shopifyStatus" TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductOpportunity_status_idx" ON "ProductOpportunity"("status");

-- CreateIndex
CREATE INDEX "ProductOpportunity_isDemoData_idx" ON "ProductOpportunity"("isDemoData");

-- CreateIndex
CREATE INDEX "SupplierQuote_opportunityId_idx" ON "SupplierQuote"("opportunityId");

-- CreateIndex
CREATE INDEX "SupplierQuote_supplierId_idx" ON "SupplierQuote"("supplierId");

-- CreateIndex
CREATE INDEX "BrandConcept_opportunityId_idx" ON "BrandConcept"("opportunityId");

-- CreateIndex
CREATE INDEX "Creative_opportunityId_idx" ON "Creative"("opportunityId");

-- CreateIndex
CREATE INDEX "Approval_opportunityId_idx" ON "Approval"("opportunityId");

-- CreateIndex
CREATE INDEX "Approval_status_idx" ON "Approval"("status");

-- CreateIndex
CREATE INDEX "JobRun_opportunityId_idx" ON "JobRun"("opportunityId");

-- CreateIndex
CREATE INDEX "JobRun_agent_idx" ON "JobRun"("agent");

-- CreateIndex
CREATE UNIQUE INDEX "Product_opportunityId_key" ON "Product"("opportunityId");

-- AddForeignKey
ALTER TABLE "SupplierQuote" ADD CONSTRAINT "SupplierQuote_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "ProductOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierQuote" ADD CONSTRAINT "SupplierQuote_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandConcept" ADD CONSTRAINT "BrandConcept_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "ProductOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creative" ADD CONSTRAINT "Creative_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "ProductOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "ProductOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRun" ADD CONSTRAINT "JobRun_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "ProductOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "ProductOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
