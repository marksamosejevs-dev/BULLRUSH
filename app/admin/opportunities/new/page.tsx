import { OpportunityForm } from "@/app/admin/_components/OpportunityForm";
import { createOpportunity } from "@/app/admin/actions";
import styles from "@/app/admin/dashboard.module.css";

export const metadata = { title: "New Opportunity" };

export default function NewOpportunityPage() {
  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>New Product Opportunity</h1>
          <p className={styles.subtitle}>
            Manual entry — no Scout agent is connected yet. New opportunities start as DISCOVERED.
          </p>
        </div>
      </div>

      <OpportunityForm
        action={createOpportunity}
        submitLabel="Create opportunity"
        defaultValues={{
          name: "",
          category: "",
          description: "",
          source: "Manual entry",
          trendSignal: "",
          trendEvidence: "",
          scoreTrendVelocity: 5,
          scoreCreativePotential: 5,
          scoreMarginPotential: 5,
          scoreMarketDemand: 5,
          scoreCompetition: 5,
          scoreFulfillmentSimplicity: 5,
          scoreRepeatPurchase: 5,
          scoreRegulatoryRisk: 5,
          scoreBrandability: 5,
          sellingPrice: 0,
          cogs: 0,
          shippingCost: 0,
          packagingCost: 0,
          paymentFeePct: 2.9,
          discountPct: 0,
          refundRatePct: 0,
        }}
      />
    </div>
  );
}
