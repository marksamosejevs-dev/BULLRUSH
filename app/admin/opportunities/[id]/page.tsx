import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateEconomics, suggestPricingScenarios } from "@/lib/economics";
import {
  SCORE_DIMENSION_ORDER,
  SCORE_DIMENSION_LABELS,
  ScoreDimension,
} from "@/lib/scoring";
import { getAllowedTransitions, OpportunityStatus, STATUS_LABELS } from "@/lib/state-machine";
import { RISK_CATEGORIES, requiresComplianceReview, RiskCategory } from "@/lib/compliance";
import { ScoreDetails } from "@/lib/validator";
import { formatCurrency, formatPercent, formatMultiplier, formatDate } from "@/lib/format";
import {
  StatusBadge,
  RiskBadge,
  DemoBadge,
  ApprovalStatusBadge,
  ProviderStatusBadge,
  RecommendedActionBadge,
} from "@/app/admin/_components/Badge";
import { OpportunityForm, OpportunityFormValues } from "@/app/admin/_components/OpportunityForm";
import {
  transitionFromDetail,
  updateOpportunity,
  addSupplierQuote,
  selectValidationSupplierQuote,
  addBrandConcept,
  selectBrandConcept,
  addCreative,
  requestApproval,
  decideApproval,
  runSourcingAction,
  rerunValidatorAction,
  updateComplianceDetails,
  clearCompliance,
  reopenCompliance,
} from "@/app/admin/actions";
import { SUPPLIER_PROVIDERS } from "@/services/suppliers/registry";
import formStyles from "@/app/admin/_components/Form.module.css";
import styles from "./detail.module.css";

export const dynamic = "force-dynamic";

const CREATIVE_TYPES = ["UGC_SCRIPT", "VISUAL_ASSET", "META_BRIEF", "TIKTOK_BRIEF", "LANDING_PAGE_COPY"];
const APPROVAL_ACTIONS = [
  "BUY_DOMAIN",
  "ORDER_SAMPLE",
  "PUBLISH_PRODUCT",
  "LAUNCH_META",
  "LAUNCH_TIKTOK",
  "INCREASE_BUDGET",
  "ORDER_INVENTORY",
];

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const opportunity = await prisma.productOpportunity.findUnique({
    where: { id },
    include: {
      suppliers: {
        include: { supplier: true },
        orderBy: [{ isSelectedForValidation: "desc" }, { isSystemRecommended: "desc" }, { totalScore: "desc" }],
      },
      brandConcepts: { orderBy: { createdAt: "asc" } },
      creatives: { orderBy: { createdAt: "asc" } },
      approvals: { orderBy: { createdAt: "desc" } },
      jobRuns: { orderBy: { createdAt: "desc" } },
      trendEvidenceItems: { orderBy: { observedAt: "desc" } },
      product: true,
    },
  });

  if (!opportunity) notFound();

  const allSuppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  const supplierProviderStatuses = await Promise.all(
    SUPPLIER_PROVIDERS.map(async (p) => ({ key: p.key, label: p.label, status: await p.status() })),
  );

  const econ = calculateEconomics(opportunity);
  const status = opportunity.status as OpportunityStatus;
  const allowedTransitions = getAllowedTransitions(status);
  const scoreDetails = opportunity.scoreDetails as ScoreDetails | null;

  const referenceQuote =
    opportunity.suppliers.find((q) => q.isSelectedForValidation) ??
    opportunity.suppliers.find((q) => q.isSystemRecommended) ??
    null;
  const pricingScenarios =
    referenceQuote && referenceQuote.unitCost !== null && referenceQuote.usShippingCost !== null
      ? suggestPricingScenarios({
          cogs: referenceQuote.unitCost,
          shippingCost: referenceQuote.usShippingCost,
          packagingCost: opportunity.packagingCost,
          paymentFeePct: opportunity.paymentFeePct,
          discountPct: opportunity.discountPct,
          refundRatePct: opportunity.refundRatePct,
        })
      : null;

  const defaultValues: OpportunityFormValues = {
    name: opportunity.name,
    category: opportunity.category,
    description: opportunity.description,
    source: opportunity.source,
    trendSignal: opportunity.trendSignal,
    trendEvidence: opportunity.trendEvidence ?? "",
    riskCategory: opportunity.riskCategory,
    scoreTrendVelocity: opportunity.scoreTrendVelocity,
    scoreCreativePotential: opportunity.scoreCreativePotential,
    scoreMarginPotential: opportunity.scoreMarginPotential,
    scoreMarketDemand: opportunity.scoreMarketDemand,
    scoreCompetition: opportunity.scoreCompetition,
    scoreFulfillmentSimplicity: opportunity.scoreFulfillmentSimplicity,
    scoreRepeatPurchase: opportunity.scoreRepeatPurchase,
    scoreRegulatoryRisk: opportunity.scoreRegulatoryRisk,
    scoreBrandability: opportunity.scoreBrandability,
    sellingPrice: opportunity.sellingPrice,
    cogs: opportunity.cogs,
    shippingCost: opportunity.shippingCost,
    packagingCost: opportunity.packagingCost,
    paymentFeePct: opportunity.paymentFeePct,
    discountPct: opportunity.discountPct,
    refundRatePct: opportunity.refundRatePct,
  };

  const scoreFieldMap: Record<(typeof SCORE_DIMENSION_ORDER)[number], number> = {
    trendVelocity: opportunity.scoreTrendVelocity,
    creativePotential: opportunity.scoreCreativePotential,
    marginPotential: opportunity.scoreMarginPotential,
    marketDemand: opportunity.scoreMarketDemand,
    competition: opportunity.scoreCompetition,
    fulfillmentSimplicity: opportunity.scoreFulfillmentSimplicity,
    repeatPurchase: opportunity.scoreRepeatPurchase,
    regulatoryRisk: opportunity.scoreRegulatoryRisk,
    brandability: opportunity.scoreBrandability,
  };

  return (
    <div>
      <Link href="/admin" className={styles.back}>
        ← Back to opportunities
      </Link>

      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{opportunity.name}</h1>
          <div className={styles.badgeRow}>
            <StatusBadge status={status} />
            <RiskBadge level={opportunity.riskLevel} />
            {opportunity.recommendedAction && <RecommendedActionBadge action={opportunity.recommendedAction} />}
            {opportunity.isDemoData && <DemoBadge />}
            <span className={styles.category}>{opportunity.category}</span>
          </div>
          {opportunity.recommendedActionReason && (
            <p className={styles.recommendationReason}>{opportunity.recommendedActionReason}</p>
          )}
        </div>
        <div className={styles.overallScore}>
          <div className={styles.overallScoreValue}>{opportunity.overallScore.toFixed(1)}</div>
          <div className={styles.overallScoreLabel}>Overall score / 10</div>
          {opportunity.confidence !== null && (
            <div className={styles.overallScoreLabel}>{Math.round(opportunity.confidence * 100)}% confidence</div>
          )}
        </div>
      </div>

      <p className={styles.description}>{opportunity.description}</p>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Source</div>
          <div className={styles.metaValue}>{opportunity.source}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Trend signal</div>
          <div className={styles.metaValue}>{opportunity.trendSignal}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Discovered</div>
          <div className={styles.metaValue}>{formatDate(opportunity.createdAt)}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Last updated</div>
          <div className={styles.metaValue}>{formatDate(opportunity.updatedAt)}</div>
        </div>
        {opportunity.trendEvidence && (
          <div className={`${styles.metaItem} ${formStyles.fieldWide}`}>
            <div className={styles.metaLabel}>Trend evidence (notes)</div>
            <div className={styles.metaValue}>{opportunity.trendEvidence}</div>
          </div>
        )}
      </div>

      {opportunity.trendEvidenceItems.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            Trend evidence ({opportunity.trendEvidenceItems.length} real data point(s))
          </div>
          <table className={styles.simpleTable}>
            <thead>
              <tr>
                <th>Evidence</th>
                <th>Metric</th>
                <th>Source</th>
                <th>Observed</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {opportunity.trendEvidenceItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.label}</strong>
                    <div className={styles.evidenceDescription}>{item.description}</div>
                  </td>
                  <td>{item.metricValue !== null ? `${item.metricValue} ${item.metricUnit ?? ""}` : "—"}</td>
                  <td>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer" className={styles.evidenceLink}>
                        {item.source}
                      </a>
                    ) : (
                      item.source
                    )}
                  </td>
                  <td>{formatDate(item.observedAt)}</td>
                  <td>{Math.round(item.confidence * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.transitions}>
        {allowedTransitions.map((target) => (
          <form action={transitionFromDetail} key={target}>
            <input type="hidden" name="id" value={opportunity.id} />
            <input type="hidden" name="to" value={target} />
            <button
              type="submit"
              className={`${styles.transitionButton} ${target === "ARCHIVED" ? styles.transitionArchive : ""}`}
            >
              Move to {STATUS_LABELS[target]}
            </button>
          </form>
        ))}
      </div>

      <div className={styles.tabGrid}>
        <div>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              Scoring breakdown
              <form action={rerunValidatorAction}>
                <input type="hidden" name="opportunityId" value={opportunity.id} />
                <button type="submit" className={styles.smallButton}>
                  Re-run Validator
                </button>
              </form>
            </div>
            <div className={styles.scoreRows}>
              {SCORE_DIMENSION_ORDER.map((dimension) => {
                const value = scoreFieldMap[dimension];
                const detail = scoreDetails?.[dimension];
                return (
                  <div key={dimension}>
                    <div className={styles.scoreRow}>
                      <span className={styles.scoreLabel}>{SCORE_DIMENSION_LABELS[dimension]}</span>
                      <span className={styles.scoreTrack}>
                        <span className={styles.scoreFill} style={{ width: `${(value / 10) * 100}%` }} />
                      </span>
                      <span className={styles.scoreValue}>{value.toFixed(1)}</span>
                    </div>
                    {detail && (
                      <div className={styles.scoreDetail}>
                        {detail.reason} {detail.evidence.length > 0 && `(${detail.evidence.length} evidence row(s), ${Math.round(detail.confidence * 100)}% confidence)`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {!scoreDetails && (
              <div className={styles.notConfiguredNote}>
                No evidence-backed scoring yet — these are hand-entered values. Run Scout or click
                "Re-run Validator" once trend evidence exists.
              </div>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Economics</div>
            <div className={styles.econGrid}>
              <EconItem label="Selling price" value={formatCurrency(opportunity.sellingPrice)} />
              <EconItem label="Landed cost" value={formatCurrency(econ.landedCost)} />
              <EconItem label="Payment fee" value={formatCurrency(econ.paymentFee)} />
              <EconItem label="Discount" value={formatCurrency(econ.discountAmount)} />
              <EconItem
                label="Contribution margin"
                value={formatCurrency(econ.contributionMarginPerUnit)}
                tone={econ.contributionMarginPerUnit >= 0 ? "positive" : "negative"}
              />
              <EconItem
                label="Gross profit / unit"
                value={formatCurrency(econ.grossProfitPerUnit)}
                tone={econ.grossProfitPerUnit >= 0 ? "positive" : "negative"}
              />
              <EconItem label="Gross margin" value={formatPercent(econ.grossMarginPct)} />
              <EconItem label="Break-even CPA" value={formatCurrency(econ.breakEvenCpa)} />
              <EconItem
                label="Break-even ROAS"
                value={econ.breakEvenRoas ? formatMultiplier(econ.breakEvenRoas) : "No margin"}
              />
            </div>
          </div>

          {pricingScenarios && (
            <div className={styles.panel}>
              <div className={styles.panelTitle}>Suggested pricing scenarios</div>
              <p className={styles.evidenceDescription} style={{ marginBottom: 12 }}>
                A landed-cost heuristic from the reference supplier quote below — not market or
                competitor data. Labeled SUGGESTED RETAIL on purpose.
              </p>
              <div className={styles.scenarioGrid}>
                {pricingScenarios.map((scenario) => (
                  <div className={styles.scenarioCard} key={scenario.label}>
                    <div className={styles.scenarioLabel}>{scenario.label}</div>
                    <div className={styles.scenarioPrice}>SUGGESTED RETAIL {formatCurrency(scenario.sellingPrice)}</div>
                    <EconItem label="Gross profit / unit" value={formatCurrency(scenario.result.grossProfitPerUnit)} />
                    <EconItem label="Gross margin" value={formatPercent(scenario.result.grossMarginPct)} />
                    <EconItem label="Break-even CPA" value={formatCurrency(scenario.result.breakEvenCpa)} />
                    <EconItem
                      label="Break-even ROAS"
                      value={scenario.result.breakEvenRoas ? formatMultiplier(scenario.result.breakEvenRoas) : "No margin"}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <details className={styles.detailsToggle}>
            <summary>Edit opportunity (info, scoring, economics)</summary>
            <OpportunityForm
              action={updateOpportunity}
              defaultValues={defaultValues}
              submitLabel="Save changes"
              hiddenId={opportunity.id}
            />
          </details>

          <div className={styles.panel} style={{ marginTop: 20 }}>
            <div className={styles.panelTitle}>
              Sourcing
              <form action={runSourcingAction}>
                <input type="hidden" name="opportunityId" value={opportunity.id} />
                <button type="submit" className={styles.smallButton}>
                  Find Suppliers
                </button>
              </form>
            </div>

            <div className={styles.scoutProviders} style={{ marginBottom: 14 }}>
              {supplierProviderStatuses.map((p) => (
                <ProviderStatusBadge key={p.key} label={p.label} status={p.status} />
              ))}
            </div>

            {opportunity.suppliers.length === 0 ? (
              <div className={styles.emptyState}>
                No supplier candidates yet. Click "Find Suppliers" to search configured providers, or
                add a real quote below by hand.
              </div>
            ) : (
              <div className={styles.tableScroll}>
                <table className={`${styles.simpleTable} ${styles.comparisonTable}`}>
                  <thead>
                    <tr>
                      <th>Supplier</th>
                      <th>Platform</th>
                      <th>Product</th>
                      <th>Variant</th>
                      <th>Unit cost</th>
                      <th>US shipping</th>
                      <th>Landed cost</th>
                      <th>Warehouse</th>
                      <th>Delivery</th>
                      <th>MOQ</th>
                      <th>Score</th>
                      <th>Confidence</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {opportunity.suppliers.map((quote) => (
                      <tr key={quote.id}>
                        <td>{quote.supplier.name}</td>
                        <td>{quote.supplier.platform ?? quote.providerKey}</td>
                        <td>
                          {quote.productUrl ? (
                            <a href={quote.productUrl} target="_blank" rel="noreferrer" className={styles.evidenceLink}>
                              {quote.externalProductId ?? "listing"}
                            </a>
                          ) : (
                            quote.externalProductId ?? "—"
                          )}
                        </td>
                        <td>{quote.variantName ?? "—"}</td>
                        <td>{quote.unitCost !== null ? formatCurrency(quote.unitCost) : "UNKNOWN"}</td>
                        <td>{quote.usShippingCost !== null ? formatCurrency(quote.usShippingCost) : "UNKNOWN"}</td>
                        <td>{quote.landedCost !== null ? formatCurrency(quote.landedCost) : "UNKNOWN"}</td>
                        <td>{quote.warehouse ?? "UNKNOWN"}</td>
                        <td>
                          {quote.estimatedDeliveryDaysMin !== null
                            ? `${quote.estimatedDeliveryDaysMin}-${quote.estimatedDeliveryDaysMax}d`
                            : quote.estimatedDeliveryDays !== null
                              ? `${quote.estimatedDeliveryDays}d`
                              : "UNKNOWN"}
                        </td>
                        <td>{quote.moq ?? "UNKNOWN"}</td>
                        <td>{quote.totalScore !== null ? `${quote.totalScore}/100` : "—"}</td>
                        <td>{quote.confidence !== null ? `${Math.round(quote.confidence * 100)}%` : "—"}</td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                            {quote.isSystemRecommended && <span className={styles.recommendedTag}>Best for validation</span>}
                            {quote.isSelectedForValidation ? (
                              <span className={styles.recommendedTag}>Selected</span>
                            ) : (
                              <form action={selectValidationSupplierQuote}>
                                <input type="hidden" name="opportunityId" value={opportunity.id} />
                                <input type="hidden" name="quoteId" value={quote.id} />
                                <button type="submit" className={styles.smallButton}>
                                  Select as validation supplier
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <details className={styles.detailsToggle}>
              <summary>Add supplier quote by hand</summary>
              <form action={addSupplierQuote}>
                <input type="hidden" name="opportunityId" value={opportunity.id} />
                <div className={formStyles.grid3} style={{ marginTop: 12 }}>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Existing supplier</label>
                    <select name="existingSupplierId" className={formStyles.select} defaultValue="">
                      <option value="">— New supplier —</option>
                      {allSuppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>New supplier name</label>
                    <input className={formStyles.input} name="supplierName" placeholder="UNKNOWN" />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Platform</label>
                    <input className={formStyles.input} name="platform" placeholder="Alibaba, domestic, ..." />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Product URL</label>
                    <input className={formStyles.input} name="productUrl" />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Unit cost (USD)</label>
                    <input className={formStyles.input} type="number" step={0.01} name="unitCost" />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>US shipping (USD)</label>
                    <input className={formStyles.input} type="number" step={0.01} name="usShippingCost" />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Estimated delivery (days)</label>
                    <input className={formStyles.input} type="number" name="estimatedDeliveryDays" />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>MOQ</label>
                    <input className={formStyles.input} type="number" name="quoteMoq" />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>US warehouse?</label>
                    <select className={formStyles.select} name="usWarehouse" defaultValue="">
                      <option value="">UNKNOWN</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className={`${formStyles.field} ${formStyles.fieldWide}`}>
                    <label className={formStyles.label}>Notes</label>
                    <textarea className={formStyles.textarea} name="quoteNotes" />
                  </div>
                </div>
                <div className={formStyles.submitRow}>
                  <button type="submit" className={formStyles.primaryButton}>
                    Add quote
                  </button>
                </div>
              </form>
            </details>
          </div>

          {opportunity.product && <CompliancePanel opportunityId={opportunity.id} product={opportunity.product} />}

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Brand concepts</div>
            {opportunity.brandConcepts.length === 0 ? (
              <div className={styles.emptyState}>No brand concepts yet.</div>
            ) : (
              <table className={styles.simpleTable}>
                <thead>
                  <tr>
                    <th>Product name</th>
                    <th>Brand</th>
                    <th>Tagline</th>
                    <th>Offer</th>
                    <th>Domain candidates</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {opportunity.brandConcepts.map((concept) => (
                    <tr key={concept.id}>
                      <td>{concept.productName ?? "—"}</td>
                      <td>
                        {concept.brandName ?? "—"}
                        {concept.isSelected && <div className={styles.recommendedTag}>Selected</div>}
                      </td>
                      <td>{concept.tagline ?? "—"}</td>
                      <td>{concept.offer ?? "—"}</td>
                      <td>
                        {concept.domainCandidates.length > 0
                          ? concept.domainCandidates.join(", ")
                          : "None entered"}
                      </td>
                      <td>
                        {!concept.isSelected && (
                          <form action={selectBrandConcept}>
                            <input type="hidden" name="opportunityId" value={opportunity.id} />
                            <input type="hidden" name="conceptId" value={concept.id} />
                            <button type="submit" className={styles.smallButton}>
                              Select
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className={styles.notConfiguredNote}>
              Domain availability is NOT_CONFIGURED — candidates are ideas only, not checked or
              purchased. See /services/domains.
            </div>

            <details className={styles.detailsToggle}>
              <summary>Add brand concept</summary>
              <form action={addBrandConcept}>
                <input type="hidden" name="opportunityId" value={opportunity.id} />
                <div className={formStyles.grid3} style={{ marginTop: 12 }}>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Product name</label>
                    <input className={formStyles.input} name="productName" />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Brand name</label>
                    <input className={formStyles.input} name="brandName" />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Tagline</label>
                    <input className={formStyles.input} name="tagline" />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Offer</label>
                    <input className={formStyles.input} name="offer" />
                  </div>
                  <div className={`${formStyles.field} ${formStyles.fieldWide}`}>
                    <label className={formStyles.label}>Positioning</label>
                    <textarea className={formStyles.textarea} name="positioning" />
                  </div>
                  <div className={`${formStyles.field} ${formStyles.fieldWide}`}>
                    <label className={formStyles.label}>Domain candidates (comma-separated)</label>
                    <input className={formStyles.input} name="domainCandidates" placeholder="example.com, example.co" />
                  </div>
                </div>
                <div className={formStyles.submitRow}>
                  <button type="submit" className={formStyles.primaryButton}>
                    Add concept
                  </button>
                </div>
              </form>
            </details>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Creative strategy</div>
            {opportunity.creatives.length === 0 ? (
              <div className={styles.emptyState}>No creatives yet.</div>
            ) : (
              <table className={styles.simpleTable}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunity.creatives.map((creative) => (
                    <tr key={creative.id}>
                      <td>{creative.type.replaceAll("_", " ")}</td>
                      <td>{creative.title}</td>
                      <td>{creative.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className={styles.notConfiguredNote}>
              Visual asset generation is NOT_CONFIGURED — see /services/images. Scripts/briefs below are
              entered manually until the Creative agent exists.
            </div>

            <details className={styles.detailsToggle}>
              <summary>Add creative</summary>
              <form action={addCreative}>
                <input type="hidden" name="opportunityId" value={opportunity.id} />
                <div className={formStyles.grid3} style={{ marginTop: 12 }}>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Type</label>
                    <select className={formStyles.select} name="type" defaultValue={CREATIVE_TYPES[0]}>
                      {CREATIVE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Title</label>
                    <input className={formStyles.input} name="title" required />
                  </div>
                  <div className={`${formStyles.field} ${formStyles.fieldWide}`}>
                    <label className={formStyles.label}>Content / script / brief</label>
                    <textarea className={formStyles.textarea} name="content" />
                  </div>
                </div>
                <div className={formStyles.submitRow}>
                  <button type="submit" className={formStyles.primaryButton}>
                    Add creative
                  </button>
                </div>
              </form>
            </details>
          </div>
        </div>

        <div>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>Product record</div>
            {opportunity.product ? (
              <div className={styles.metaGrid} style={{ gridTemplateColumns: "1fr" }}>
                <MetaRow label="Name" value={opportunity.product.name} />
                <MetaRow label="Brand" value={opportunity.product.brandName ?? "Not set"} />
                <MetaRow label="Domain" value={opportunity.product.domain ?? "Not purchased"} />
                <MetaRow
                  label="Landing page"
                  value={opportunity.product.landingPageUrl ?? "Not generated"}
                />
                <MetaRow label="Shopify draft" value={opportunity.product.shopifyStatus} />
              </div>
            ) : (
              <div className={styles.emptyState}>
                No Product record yet — created automatically the moment this opportunity is approved
                for test.
              </div>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Approvals</div>
            {opportunity.approvals.length === 0 ? (
              <div className={styles.emptyState}>
                No approvals requested. Nothing billable happens automatically — every external
                action needs one of these, approved by hand.
              </div>
            ) : (
              <table className={styles.simpleTable}>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Est. cost</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {opportunity.approvals.map((approval) => (
                    <tr key={approval.id}>
                      <td>{approval.action.replaceAll("_", " ")}</td>
                      <td>
                        <ApprovalStatusBadge status={approval.status} />
                      </td>
                      <td>{approval.estimatedCost !== null ? formatCurrency(approval.estimatedCost) : "—"}</td>
                      <td>
                        {approval.status === "PENDING" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <form action={decideApproval}>
                              <input type="hidden" name="opportunityId" value={opportunity.id} />
                              <input type="hidden" name="approvalId" value={approval.id} />
                              <input type="hidden" name="decision" value="APPROVED" />
                              <button type="submit" className={`${styles.smallButton} ${styles.smallButtonPositive}`}>
                                Approve
                              </button>
                            </form>
                            <form action={decideApproval}>
                              <input type="hidden" name="opportunityId" value={opportunity.id} />
                              <input type="hidden" name="approvalId" value={approval.id} />
                              <input type="hidden" name="decision" value="REJECTED" />
                              <button type="submit" className={`${styles.smallButton} ${styles.smallButtonNegative}`}>
                                Reject
                              </button>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <details className={styles.detailsToggle}>
              <summary>Request approval</summary>
              <form action={requestApproval}>
                <input type="hidden" name="opportunityId" value={opportunity.id} />
                <div className={formStyles.grid} style={{ marginTop: 12 }}>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Action</label>
                    <select className={formStyles.select} name="action" defaultValue={APPROVAL_ACTIONS[0]}>
                      {APPROVAL_ACTIONS.map((a) => (
                        <option key={a} value={a}>
                          {a.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Estimated cost (USD)</label>
                    <input className={formStyles.input} type="number" step={0.01} name="estimatedCost" />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Requested by</label>
                    <input className={formStyles.input} name="requestedBy" placeholder="Your name" />
                  </div>
                  <div className={`${formStyles.field} ${formStyles.fieldWide}`}>
                    <label className={formStyles.label}>Notes</label>
                    <textarea className={formStyles.textarea} name="notes" />
                  </div>
                </div>
                <div className={formStyles.submitRow}>
                  <button type="submit" className={formStyles.primaryButton}>
                    Submit request
                  </button>
                </div>
              </form>
            </details>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Automation / job runs</div>
            {opportunity.jobRuns.length === 0 ? (
              <div className={styles.emptyState}>
                No agent runs recorded. Scout/Validator/Sourcing/Brand/Creative agents are not
                implemented yet — see docs/NEXT_STEPS.md.
              </div>
            ) : (
              <table className={styles.simpleTable}>
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Status</th>
                    <th>Started</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunity.jobRuns.map((run) => (
                    <tr key={run.id}>
                      <td>{run.agent}</td>
                      <td>{run.status}</td>
                      <td>{formatDate(run.startedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EconItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const toneClass =
    tone === "positive" ? styles.econValuePositive : tone === "negative" ? styles.econValueNegative : "";
  return (
    <div className={styles.econItem}>
      <div className={styles.econLabel}>{label}</div>
      <div className={`${styles.econValue} ${toneClass}`}>{value}</div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metaItem}>
      <div className={styles.metaLabel}>{label}</div>
      <div className={styles.metaValue}>{value}</div>
    </div>
  );
}

type ProductWithCompliance = NonNullable<
  Awaited<ReturnType<typeof prisma.product.findUnique>>
>;

// Part 14 — the compliance gate. A supplier can be selected for research/
// sample at any time; this panel is what has to say CLEARED before the
// opportunity can leave COMPLIANCE_REQUIRED.
function CompliancePanel({
  opportunityId,
  product,
}: {
  opportunityId: string;
  product: ProductWithCompliance;
}) {
  const requiresReview = requiresComplianceReview(product.riskCategory as RiskCategory);
  const statusColor: Record<string, string> = {
    CLEARED: "#4fd995",
    IN_REVIEW: "#e6c04a",
    REQUIRED: "#f08383",
    NOT_REQUIRED: "#9aa2ad",
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Compliance</div>
      <div className={styles.badgeRow} style={{ marginBottom: 12 }}>
        <span className={formStyles.label}>{product.riskCategory}</span>
        <span
          className={styles.recommendedTag}
          style={{ color: statusColor[product.complianceStatus] ?? "#9aa2ad" }}
        >
          {product.complianceStatus.replace("_", " ")}
        </span>
      </div>
      {!requiresReview ? (
        <div className={styles.emptyState}>
          Risk category {product.riskCategory} does not require a compliance review. This is never
          inferred from seller marketing text — set it explicitly on the opportunity/edit form if that
          changes.
        </div>
      ) : (
        <>
          <div className={styles.notConfiguredNote}>
            {product.complianceStatus === "CLEARED"
              ? `Cleared by ${product.complianceReviewedBy ?? "unknown reviewer"} on ${formatDate(product.complianceReviewedAt)}.`
              : "This risk category requires a human compliance review before the opportunity can proceed to READY_TO_BUILD. A supplier may still be selected for research/sample."}
          </div>

          {product.complianceStatus === "CLEARED" ? (
            <form action={reopenCompliance} style={{ marginTop: 10 }}>
              <input type="hidden" name="opportunityId" value={opportunityId} />
              <input type="hidden" name="productId" value={product.id} />
              <button type="submit" className={styles.smallButton}>
                Reopen review
              </button>
            </form>
          ) : (
            <form action={clearCompliance} style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <input type="hidden" name="opportunityId" value={opportunityId} />
              <input type="hidden" name="productId" value={product.id} />
              <input
                className={formStyles.input}
                name="reviewedBy"
                placeholder="Reviewer name"
                style={{ maxWidth: 200 }}
              />
              <button type="submit" className={`${styles.smallButton} ${styles.smallButtonPositive}`}>
                Mark cleared
              </button>
            </form>
          )}
        </>
      )}

      <details className={styles.detailsToggle}>
        <summary>Compliance details</summary>
        <form action={updateComplianceDetails}>
          <input type="hidden" name="opportunityId" value={opportunityId} />
          <input type="hidden" name="productId" value={product.id} />
          <div className={formStyles.grid3} style={{ marginTop: 12 }}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Risk category</label>
              <select className={formStyles.select} name="riskCategory" defaultValue={product.riskCategory}>
                {RISK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Manufacturer</label>
              <input className={formStyles.input} name="manufacturer" defaultValue={product.manufacturer ?? ""} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Manufacturing country</label>
              <input
                className={formStyles.input}
                name="manufacturingCountry"
                defaultValue={product.manufacturingCountry ?? ""}
              />
            </div>
            <div className={`${formStyles.field} ${formStyles.fieldWide}`}>
              <label className={formStyles.label}>Ingredients (never inferred — enter from real documentation)</label>
              <textarea className={formStyles.textarea} name="ingredients" defaultValue={product.ingredients ?? ""} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Certificate of Analysis URL</label>
              <input className={formStyles.input} name="coaUrl" defaultValue={product.coaUrl ?? ""} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Testing documents URL</label>
              <input
                className={formStyles.input}
                name="testingDocumentsUrl"
                defaultValue={product.testingDocumentsUrl ?? ""}
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>GMP certified?</label>
              <select
                className={formStyles.select}
                name="gmpCertified"
                defaultValue={product.gmpCertified === null ? "" : String(product.gmpCertified)}
              >
                <option value="">UNKNOWN</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Labeling review</label>
              <select className={formStyles.select} name="labelingReviewStatus" defaultValue={product.labelingReviewStatus}>
                <option value="NOT_STARTED">NOT_STARTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETE">COMPLETE</option>
              </select>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Claims review</label>
              <select className={formStyles.select} name="claimsReviewStatus" defaultValue={product.claimsReviewStatus}>
                <option value="NOT_STARTED">NOT_STARTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETE">COMPLETE</option>
              </select>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>
                FDA-relevant status (never claim approval — this is a status note, not a certification)
              </label>
              <select className={formStyles.select} name="fdaRelevantStatus" defaultValue={product.fdaRelevantStatus}>
                <option value="NOT_REVIEWED">NOT_REVIEWED</option>
                <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
                <option value="REVIEW_IN_PROGRESS">REVIEW_IN_PROGRESS</option>
                <option value="DISCLAIMER_REQUIRED">DISCLAIMER_REQUIRED</option>
              </select>
            </div>
            <div className={`${formStyles.field} ${formStyles.fieldWide}`}>
              <label className={formStyles.label}>Notes</label>
              <textarea className={formStyles.textarea} name="complianceNotes" defaultValue={product.complianceNotes ?? ""} />
            </div>
          </div>
          <div className={formStyles.submitRow}>
            <button type="submit" className={formStyles.primaryButton}>
              Save compliance details
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
