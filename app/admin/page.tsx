import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateEconomics } from "@/lib/economics";
import {
  getAllowedTransitions,
  OpportunityStatus,
  OPPORTUNITY_STATUSES,
} from "@/lib/state-machine";
import { formatCurrency, formatPercent } from "@/lib/format";
import { StatusBadge, RiskBadge, DemoBadge, ProviderStatusBadge } from "./_components/Badge";
import { transitionFromDashboard, runScoutAction } from "./actions";
import { RESEARCH_PROVIDERS } from "@/services/research/registry";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status && OPPORTUNITY_STATUSES.includes(status as OpportunityStatus)
    ? (status as OpportunityStatus)
    : undefined;

  const opportunities = await prisma.productOpportunity.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: [{ overallScore: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Opportunities</h1>
          <p className={styles.subtitle}>
            {opportunities.length} opportunit{opportunities.length === 1 ? "y" : "ies"}
            {filter ? ` · filtered by ${filter}` : ""}
          </p>
        </div>
        <Link href="/admin/opportunities/new" className={styles.newButton}>
          + New Opportunity
        </Link>
      </div>

      <div className={styles.scoutPanel}>
        <div className={styles.scoutHeader}>
          <span className={styles.scoutTitle}>Run Scout</span>
          <span className={styles.scoutSubtitle}>
            Searches every configured research provider for a real query and creates/updates real
            opportunities (never demo data). See docs/ARCHITECTURE.md for what each source needs.
          </span>
        </div>
        <form action={runScoutAction} className={styles.scoutForm}>
          <input
            type="text"
            name="query"
            required
            placeholder="e.g. creatine gummies, portable mini thermal printer"
            className={styles.scoutInput}
          />
          <button type="submit" className={styles.scoutButton}>
            Run Scout
          </button>
        </form>
        <div className={styles.scoutProviders}>
          {RESEARCH_PROVIDERS.map((p) => (
            <ProviderStatusBadge
              key={p.key}
              label={p.label}
              status={p.isConfigured() ? "CONNECTED" : "NOT_CONFIGURED"}
            />
          ))}
        </div>
      </div>

      <div className={styles.filters}>
        <Link
          href="/admin"
          className={`${styles.filterLink} ${!filter ? styles.filterLinkActive : ""}`}
        >
          All
        </Link>
        {OPPORTUNITY_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin?status=${s}`}
            className={`${styles.filterLink} ${filter === s ? styles.filterLinkActive : ""}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className={styles.tableWrap}>
        {opportunities.length === 0 ? (
          <div className={styles.empty}>No opportunities match this filter.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Score</th>
                <th>Trend signal</th>
                <th>Est. retail</th>
                <th>Est. landed cost</th>
                <th>Margin</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => {
                const econ = calculateEconomics(opp);
                const currentStatus = opp.status as OpportunityStatus;
                const allowed = getAllowedTransitions(currentStatus);
                return (
                  <tr key={opp.id}>
                    <td>
                      <div className={styles.productCell}>
                        <span className={styles.productName}>
                          <Link href={`/admin/opportunities/${opp.id}`}>{opp.name}</Link>
                        </span>
                        {opp.isDemoData && (
                          <span className={styles.demoTag}>
                            <DemoBadge />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{opp.category}</td>
                    <td>
                      <div className={styles.score}>{opp.overallScore.toFixed(1)}</div>
                      {opp.recommendedAction && (
                        <div className={styles.recommendedAction} title={opp.recommendedActionReason ?? undefined}>
                          {opp.recommendedAction}
                        </div>
                      )}
                    </td>
                    <td className={styles.trend} title={opp.trendSignal}>
                      {opp.trendSignal}
                    </td>
                    <td className={styles.mono}>{formatCurrency(opp.sellingPrice)}</td>
                    <td className={styles.mono}>{formatCurrency(econ.landedCost)}</td>
                    <td className={styles.mono}>{formatPercent(econ.grossMarginPct)}</td>
                    <td>
                      <RiskBadge level={opp.riskLevel} />
                    </td>
                    <td>
                      <StatusBadge status={currentStatus} />
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/admin/opportunities/${opp.id}`} className={styles.viewLink}>
                          View
                        </Link>
                        {allowed.includes("APPROVED_FOR_TEST") && (
                          <form action={transitionFromDashboard}>
                            <input type="hidden" name="id" value={opp.id} />
                            <input type="hidden" name="to" value="APPROVED_FOR_TEST" />
                            <button type="submit" className={`${styles.actionButton} ${styles.actionApprove}`}>
                              Approve test
                            </button>
                          </form>
                        )}
                        {allowed.includes("WATCH") && (
                          <form action={transitionFromDashboard}>
                            <input type="hidden" name="id" value={opp.id} />
                            <input type="hidden" name="to" value="WATCH" />
                            <button type="submit" className={styles.actionButton}>
                              Watch
                            </button>
                          </form>
                        )}
                        {allowed.includes("REJECTED") && (
                          <form action={transitionFromDashboard}>
                            <input type="hidden" name="id" value={opp.id} />
                            <input type="hidden" name="to" value="REJECTED" />
                            <button type="submit" className={`${styles.actionButton} ${styles.actionReject}`}>
                              Reject
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
