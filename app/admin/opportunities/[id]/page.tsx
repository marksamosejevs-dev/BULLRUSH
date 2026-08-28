import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateEconomics } from "@/lib/economics";
import {
  SCORE_DIMENSION_ORDER,
  SCORE_DIMENSION_LABELS,
} from "@/lib/scoring";
import { getAllowedTransitions, OpportunityStatus, STATUS_LABELS } from "@/lib/state-machine";
import { formatCurrency, formatPercent, formatMultiplier, formatDate } from "@/lib/format";
import { StatusBadge, RiskBadge, DemoBadge, ApprovalStatusBadge } from "@/app/admin/_components/Badge";
import { OpportunityForm, OpportunityFormValues } from "@/app/admin/_components/OpportunityForm";
import {
  transitionFromDetail,
  updateOpportunity,
  addSupplierQuote,
  setRecommendedSupplierQuote,
  addBrandConcept,
  selectBrandConcept,
  addCreative,
  requestApproval,
  decideApproval,
} from "@/app/admin/actions";
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
      suppliers: { include: { supplier: true }, orderBy: { createdAt: "asc" } },
      brandConcepts: { orderBy: { createdAt: "asc" } },
      creatives: { orderBy: { createdAt: "asc" } },
      approvals: { orderBy: { createdAt: "desc" } },
      jobRuns: { orderBy: { createdAt: "desc" } },
      product: true,
    },
  });

  if (!opportunity) notFound();

  const allSuppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });

  const econ = calculateEconomics(opportunity);
  const status = opportunity.status as OpportunityStatus;
  const allowedTransitions = getAllowedTransitions(status);

  const defaultValues: OpportunityFormValues = {
    name: opportunity.name,
    category: opportunity.category,
    description: opportunity.description,
    source: opportunity.source,
    trendSignal: opportunity.trendSignal,
    trendEvidence: opportunity.trendEvidence ?? "",
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
            {opportunity.isDemoData && <DemoBadge />}
            <span className={styles.category}>{opportunity.category}</span>
          </div>
        </div>
        <div className={styles.overallScore}>
          <div className={styles.overallScoreValue}>{opportunity.overallScore.toFixed(1)}</div>
          <div className={styles.overallScoreLabel}>Overall score / 10</div>
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
            <div className={styles.panelTitle}>Scoring breakdown</div>
            <div className={styles.scoreRows}>
              {SCORE_DIMENSION_ORDER.map((dimension) => {
                const value = scoreFieldMap[dimension];
                return (
                  <div className={styles.scoreRow} key={dimension}>
                    <span className={styles.scoreLabel}>{SCORE_DIMENSION_LABELS[dimension]}</span>
                    <span className={styles.scoreTrack}>
                      <span className={styles.scoreFill} style={{ width: `${(value / 10) * 100}%` }} />
                    </span>
                    <span className={styles.scoreValue}>{value.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
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
            <div className={styles.panelTitle}>Supplier shortlist</div>
            {opportunity.suppliers.length === 0 ? (
              <div className={styles.emptyState}>
                No supplier quotes yet. Nothing is fabricated here — add a real quote below, or leave
                fields UNKNOWN.
              </div>
            ) : (
              <table className={styles.simpleTable}>
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Platform</th>
                    <th>Unit cost</th>
                    <th>US shipping</th>
                    <th>Delivery</th>
                    <th>MOQ</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {opportunity.suppliers.map((quote) => (
                    <tr key={quote.id}>
                      <td>
                        {quote.supplier.name}
                        {quote.isRecommended && (
                          <div className={styles.recommendedTag}>Recommended</div>
                        )}
                      </td>
                      <td>{quote.supplier.platform ?? "UNKNOWN"}</td>
                      <td>{quote.unitCost !== null ? formatCurrency(quote.unitCost) : "UNKNOWN"}</td>
                      <td>
                        {quote.usShippingCost !== null ? formatCurrency(quote.usShippingCost) : "UNKNOWN"}
                      </td>
                      <td>{quote.estimatedDeliveryDays !== null ? `${quote.estimatedDeliveryDays}d` : "UNKNOWN"}</td>
                      <td>{quote.moq ?? "UNKNOWN"}</td>
                      <td>
                        {!quote.isRecommended && (
                          <form action={setRecommendedSupplierQuote}>
                            <input type="hidden" name="opportunityId" value={opportunity.id} />
                            <input type="hidden" name="quoteId" value={quote.id} />
                            <button type="submit" className={styles.smallButton}>
                              Recommend
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <details className={styles.detailsToggle}>
              <summary>Add supplier quote</summary>
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
