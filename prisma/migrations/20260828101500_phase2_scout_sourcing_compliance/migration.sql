-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('UNKNOWN', 'STANDARD', 'COSMETIC', 'INGESTIBLE', 'SUPPLEMENT', 'MEDICAL_DEVICE', 'REGULATED');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('NOT_REQUIRED', 'REQUIRED', 'IN_REVIEW', 'CLEARED');

-- AlterEnum
ALTER TYPE "OpportunityStatus" ADD VALUE 'COMPLIANCE_REQUIRED';

-- AlterTable
ALTER TABLE "JobRun" ADD COLUMN     "itemsProcessed" INTEGER,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "claimsReviewStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "coaUrl" TEXT,
ADD COLUMN     "complianceNotes" TEXT,
ADD COLUMN     "complianceReviewedAt" TIMESTAMP(3),
ADD COLUMN     "complianceReviewedBy" TEXT,
ADD COLUMN     "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN     "fdaRelevantStatus" TEXT NOT NULL DEFAULT 'NOT_REVIEWED',
ADD COLUMN     "gmpCertified" BOOLEAN,
ADD COLUMN     "ingredients" TEXT,
ADD COLUMN     "labelingReviewStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "manufacturingCountry" TEXT,
ADD COLUMN     "riskCategory" "RiskCategory" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "selectedSupplierQuoteId" TEXT,
ADD COLUMN     "testingDocumentsUrl" TEXT;

-- AlterTable
ALTER TABLE "ProductOpportunity" ADD COLUMN     "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "firstSeenAt" TIMESTAMP(3),
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "market" TEXT NOT NULL DEFAULT 'US',
ADD COLUMN     "normalizedName" TEXT,
ADD COLUMN     "recommendedAction" TEXT,
ADD COLUMN     "recommendedActionReason" TEXT,
ADD COLUMN     "riskCategory" "RiskCategory" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "scoreDetails" JSONB,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "SupplierQuote" DROP COLUMN "isRecommended",
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "dataConfidenceScore" DOUBLE PRECISION,
ADD COLUMN     "estimatedDeliveryDaysMax" INTEGER,
ADD COLUMN     "estimatedDeliveryDaysMin" INTEGER,
ADD COLUMN     "externalProductId" TEXT,
ADD COLUMN     "externalVariantId" TEXT,
ADD COLUMN     "fulfillmentAutomationScore" DOUBLE PRECISION,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isSelectedForValidation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSystemRecommended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "landedCost" DOUBLE PRECISION,
ADD COLUMN     "landedCostScore" DOUBLE PRECISION,
ADD COLUMN     "matchScore" DOUBLE PRECISION,
ADD COLUMN     "moqFlexibilityScore" DOUBLE PRECISION,
ADD COLUMN     "privateLabelScore" DOUBLE PRECISION,
ADD COLUMN     "productUrl" TEXT,
ADD COLUMN     "providerKey" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "quoteCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "quoteDate" TIMESTAMP(3),
ADD COLUMN     "rawResponse" JSONB,
ADD COLUMN     "reliabilityScore" DOUBLE PRECISION,
ADD COLUMN     "shippingMethod" TEXT,
ADD COLUMN     "totalScore" DOUBLE PRECISION,
ADD COLUMN     "usDeliveryScore" DOUBLE PRECISION,
ADD COLUMN     "variantName" TEXT,
ADD COLUMN     "warehouse" TEXT;

-- CreateTable
CREATE TABLE "TrendEvidence" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opportunityId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION,
    "metricUnit" TEXT,
    "source" TEXT NOT NULL,
    "url" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TrendEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrendEvidence_opportunityId_idx" ON "TrendEvidence"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_selectedSupplierQuoteId_key" ON "Product"("selectedSupplierQuoteId");

-- CreateIndex
CREATE INDEX "ProductOpportunity_normalizedName_idx" ON "ProductOpportunity"("normalizedName");

-- AddForeignKey
ALTER TABLE "TrendEvidence" ADD CONSTRAINT "TrendEvidence_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "ProductOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_selectedSupplierQuoteId_fkey" FOREIGN KEY ("selectedSupplierQuoteId") REFERENCES "SupplierQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

