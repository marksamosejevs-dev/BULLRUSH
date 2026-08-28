import { SCORE_DIMENSION_ORDER, SCORE_DIMENSION_LABELS } from "@/lib/scoring";
import styles from "./Form.module.css";

export interface OpportunityFormValues {
  name: string;
  category: string;
  description: string;
  source: string;
  trendSignal: string;
  trendEvidence: string;
  scoreTrendVelocity: number;
  scoreCreativePotential: number;
  scoreMarginPotential: number;
  scoreMarketDemand: number;
  scoreCompetition: number;
  scoreFulfillmentSimplicity: number;
  scoreRepeatPurchase: number;
  scoreRegulatoryRisk: number;
  scoreBrandability: number;
  sellingPrice: number;
  cogs: number;
  shippingCost: number;
  packagingCost: number;
  paymentFeePct: number;
  discountPct: number;
  refundRatePct: number;
}

const SCORE_FIELD_KEY: Record<(typeof SCORE_DIMENSION_ORDER)[number], keyof OpportunityFormValues> = {
  trendVelocity: "scoreTrendVelocity",
  creativePotential: "scoreCreativePotential",
  marginPotential: "scoreMarginPotential",
  marketDemand: "scoreMarketDemand",
  competition: "scoreCompetition",
  fulfillmentSimplicity: "scoreFulfillmentSimplicity",
  repeatPurchase: "scoreRepeatPurchase",
  regulatoryRisk: "scoreRegulatoryRisk",
  brandability: "scoreBrandability",
};

export function OpportunityForm({
  action,
  defaultValues,
  submitLabel,
  hiddenId,
}: {
  action: (formData: FormData) => void;
  defaultValues: OpportunityFormValues;
  submitLabel: string;
  hiddenId?: string;
}) {
  return (
    <form action={action}>
      {hiddenId && <input type="hidden" name="id" value={hiddenId} />}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Opportunity</div>
        <div className={styles.grid}>
          <Field label="Product name">
            <input className={styles.input} name="name" defaultValue={defaultValues.name} required />
          </Field>
          <Field label="Category">
            <input className={styles.input} name="category" defaultValue={defaultValues.category} required />
          </Field>
          <Field label="Source">
            <input
              className={styles.input}
              name="source"
              defaultValue={defaultValues.source}
              placeholder="Manual entry"
            />
          </Field>
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              name="description"
              defaultValue={defaultValues.description}
              required
            />
          </div>
          <Field label="Trend signal (short)">
            <input className={styles.input} name="trendSignal" defaultValue={defaultValues.trendSignal} required />
          </Field>
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <label className={styles.label}>Trend evidence (notes)</label>
            <textarea
              className={styles.textarea}
              name="trendEvidence"
              defaultValue={defaultValues.trendEvidence}
              placeholder="No live trend data source yet — enter research notes manually."
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Scoring (0–10 each)</div>
        <div className={styles.grid3}>
          {SCORE_DIMENSION_ORDER.map((dimension) => {
            const key = SCORE_FIELD_KEY[dimension];
            return (
              <Field label={SCORE_DIMENSION_LABELS[dimension]} key={dimension}>
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  name={key}
                  defaultValue={defaultValues[key]}
                  required
                />
              </Field>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Economics inputs (USD)</div>
        <div className={styles.grid3}>
          <Field label="Selling price">
            <input
              className={styles.input}
              type="number"
              step={0.01}
              min={0}
              name="sellingPrice"
              defaultValue={defaultValues.sellingPrice}
              required
            />
          </Field>
          <Field label="COGS (unit cost)">
            <input
              className={styles.input}
              type="number"
              step={0.01}
              min={0}
              name="cogs"
              defaultValue={defaultValues.cogs}
              required
            />
          </Field>
          <Field label="US shipping cost">
            <input
              className={styles.input}
              type="number"
              step={0.01}
              min={0}
              name="shippingCost"
              defaultValue={defaultValues.shippingCost}
              required
            />
          </Field>
          <Field label="Packaging cost">
            <input
              className={styles.input}
              type="number"
              step={0.01}
              min={0}
              name="packagingCost"
              defaultValue={defaultValues.packagingCost}
            />
          </Field>
          <Field label="Payment fees (%)">
            <input
              className={styles.input}
              type="number"
              step={0.1}
              min={0}
              name="paymentFeePct"
              defaultValue={defaultValues.paymentFeePct}
            />
          </Field>
          <Field label="Typical discount (%)">
            <input
              className={styles.input}
              type="number"
              step={0.1}
              min={0}
              name="discountPct"
              defaultValue={defaultValues.discountPct}
            />
          </Field>
          <Field label="Refund assumption (%)">
            <input
              className={styles.input}
              type="number"
              step={0.1}
              min={0}
              name="refundRatePct"
              defaultValue={defaultValues.refundRatePct}
            />
          </Field>
        </div>
      </div>

      <div className={styles.submitRow}>
        <button type="submit" className={styles.primaryButton}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}
