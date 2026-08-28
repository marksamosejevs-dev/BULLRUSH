# Architecture — Internal E-Commerce Agent (Phase 1 + Phase 2)

This is an internal tool for BULLRUSH's own use: take a product opportunity
from real discovery through real sourcing to an internal approval, ready
for review. It is not a SaaS, has no user accounts, and performs no
billable action on its own.

## Stack

- **Next.js 16 (App Router) + TypeScript** — same stack as the existing
  public BULLRUSH site (`app/`), extended rather than replaced.
- **PostgreSQL + Prisma 6** — persistent, cloud-deployable database. The
  agent must work with your computer turned off, so nothing depends on
  local disk state beyond `.env`.
- **CSS Modules** — no UI framework, consistent with the rest of the repo.
- **No auth** — this is explicitly single-operator/internal. Restrict
  access at the network/hosting layer (e.g. deploy behind a private URL or
  VPN) until real access control is in scope.

## Two apps, one repo

- `app/` (root) — the public BULLRUSH marketing/e-commerce site. Untouched
  by this work except for shared root layout/fonts.
- `app/admin/` — the internal agent dashboard, at `/admin`. Fully
  independent styling (its own dark theme, its own CSS Modules) so it never
  collides with the public site's brand system.

## Data model

See `prisma/schema.prisma` for the source of truth. Summary:

- **ProductOpportunity** — the central pipeline record. One `status` field
  (see State machine below) drives the whole lifecycle. Holds scoring
  inputs (`lib/scoring.ts`), economics inputs (`lib/economics.ts`), and
  discovery metadata (`normalizedName`/`aliases`/`confidence`/
  `riskCategory`) written by the Scout/Validator.
- **TrendEvidence** — one real, sourced data point behind an opportunity
  (label, description, optional real metric, source, URL, observed date,
  confidence). Written by research providers via the Scout; never
  invented. `ProductOpportunity.scoreDetails` (JSON) holds the Validator's
  per-dimension score/reason/evidence/confidence derived from these rows.
- **Product** — created automatically the moment an opportunity is moved to
  `APPROVED_FOR_TEST`. Holds the concrete, buildable product record (brand
  name, domain, landing page, Shopify draft id) plus the compliance gate
  fields (see below) and the selected validation `SupplierQuote`.
- **Supplier** / **SupplierQuote** — `Supplier` is a reusable
  company/platform record (for automated providers, one row per provider —
  e.g. "CJ Dropshipping" — since the provider itself is the merchant of
  record). `SupplierQuote` is one candidate's real quote against one
  opportunity: unit cost, US shipping quote, landed cost, warehouse,
  delivery estimate, the Part 9 match-score breakdown, and
  `isSystemRecommended`/`isSelectedForValidation` flags. Every numeric
  field is nullable — unknown is UNKNOWN, never fabricated.
- **BrandConcept** — candidate names/taglines/offers/domain ideas for an
  opportunity. Domain candidates are ideas only; nothing here is checked
  for availability or purchased.
- **Creative** — UGC scripts, visual asset briefs, Meta/TikTok campaign
  briefs. Entered manually — no Creative agent yet.
- **Approval** — the gate for every billable/external action
  (`BUY_DOMAIN`, `ORDER_SAMPLE`, `PUBLISH_PRODUCT`, `LAUNCH_META`,
  `LAUNCH_TIKTOK`, `INCREASE_BUDGET`, `ORDER_INVENTORY`). Creating or
  deciding an Approval record **never** performs the action — see
  "No autonomous financial action" below.
- **JobRun** — one row per agent run (`SCOUT_PRODUCTS`, `VALIDATE_PRODUCT`,
  `SOURCE_PRODUCT`), with `provider`, `itemsProcessed`, `summary`,
  `errorMessage`, `startedAt`/`finishedAt`. Every Scout/Validator/Sourcing
  run writes one of these — no silent failures.

## Business logic modules (`lib/`)

- `lib/economics.ts` — pure functions turning selling price, COGS,
  shipping, packaging, payment fees, discount and refund assumptions into
  landed cost, gross profit, gross margin %, contribution margin,
  break-even CPA and break-even ROAS, plus `suggestPricingScenarios()`
  (Part 11) — a landed-cost-driven CONSERVATIVE/BASE/PREMIUM heuristic,
  always labeled SUGGESTED RETAIL, never presented as market data.
- `lib/scoring.ts` — nine 0–10 dimensions (trend velocity, creative
  potential, margin potential, market demand, competition, fulfillment
  simplicity, repeat purchase, regulatory risk, brandability), combined
  into one weighted overall score and a derived risk level.
- `lib/validator.ts` — connects real `TrendEvidence` to the scoring system
  above. Most dimensions genuinely can't be inferred from web search/ad
  data — those are left at a neutral score with LOW confidence and an
  explicit "no automated signal" reason rather than a guess. Also computes
  the TEST/WATCH/REJECT recommendation against `lib/config.ts` thresholds.
- `lib/normalize.ts` — deterministic product-name normalization ("Creatine
  Monohydrate Gummies" / "Creatine Gummies" / "5g Creatine Chews" all
  reduce to "Creatine Gummies") so the Scout doesn't create duplicate
  opportunities for the same product.
- `lib/matching.ts` — the Part 9 supplier match score (product match, US
  delivery, landed cost, reliability, fulfillment automation, private
  label, MOQ flexibility, data confidence — 100 points total). A field the
  provider didn't return contributes 0, never a comfortable default.
- `lib/compliance.ts` — the Part 14 compliance gate: which risk categories
  require a human review, and the NOT_REQUIRED/REQUIRED/IN_REVIEW/CLEARED
  state machine for a `Product`'s compliance status.
- `lib/state-machine.ts` — the only place that decides which
  `ProductOpportunity.status` transitions are legal. Server actions call
  `canTransition()` before writing a new status.
- `lib/config.ts` — the handful of non-secret, tunable values the brief
  asked not to hardcode (market, validation shipping destination,
  Validator thresholds), all overridable via env vars.

## State machine

```
DISCOVERED → VALIDATING → WATCH / REJECTED / APPROVED_FOR_TEST
APPROVED_FOR_TEST → SOURCING
SOURCING → READY_TO_BUILD  (risk category doesn't require compliance review)
         → COMPLIANCE_REQUIRED  (it does, and hasn't been cleared)
COMPLIANCE_REQUIRED → READY_TO_BUILD  (once a human clears it)
READY_TO_BUILD → BUILDING → READY_FOR_REVIEW
READY_FOR_REVIEW → LIVE ⇄ PAUSED
any non-terminal status → ARCHIVED (manual escape hatch)
```

Which of the two SOURCING exits applies is decided the moment a human
clicks "Select as validation supplier" — see `selectValidationSupplierQuote`
in `app/admin/actions.ts`. Full transition table: `lib/state-machine.ts`.

## The pipeline, end to end

```
RUN SCOUT (query)                     app/admin/page.tsx -> runScoutAction
  -> agents/scout: searches every configured ResearchProvider,
     normalizes + merges results (lib/normalize.ts), writes
     ProductOpportunity + TrendEvidence, then runs the Validator
  -> agents/validator: lib/validator.ts scores from real evidence,
     writes scoreDetails + recommendedAction (TEST/WATCH/REJECT)

OPEN OPPORTUNITY -> see evidence + scoring

APPROVE TEST                          transitionFromDetail -> APPROVED_FOR_TEST
  -> Product created, riskCategory + complianceStatus copied in

FIND SUPPLIERS                        app/admin/opportunities/[id]/page.tsx
  -> agents/sourcing: searches every configured SupplierProvider,
     filters obviously-unrelated results (lib/matching.ts), requests a
     real US shipping quote per candidate, scores each one, persists
     SupplierQuote rows, flags the top score isSystemRecommended
  -> opportunity moves to SOURCING

SELECT SUPPLIER (as validation supplier)
  -> persists Product.selectedSupplierQuoteId
  -> opportunity moves to READY_TO_BUILD, or COMPLIANCE_REQUIRED if the
     risk category requires a review that hasn't happened yet
```

## No autonomous financial action

This is the most important architectural rule in this codebase. Nothing
here:

- purchases a domain,
- places a supplier order,
- publishes a Shopify product live,
- launches or spends on a Meta or TikTok campaign,

...without a human clicking "Approve" on an `Approval` record first, and
even then, **approving the record only changes its status** — no
`/services/*` client is wired up to actually execute anything yet.
Sourcing (Parts 4-11) is entirely read-only research: product search,
product detail, variants, inventory, shipping quotes. `createOrder`/
`getOrder`/`getTracking` are documented as future interface methods in
`services/suppliers/supplierProvider.ts` but deliberately not implemented.

## Provider architecture — real integrations vs. honest stubs

Every research/supplier source implements a common interface
(`services/research/researchProvider.ts`, `services/suppliers/
supplierProvider.ts`) with `isConfigured()`/`status()` gates. A provider
either does real, credentialed work, or it reports `NOT_CONFIGURED`/
`ERROR` — there is no fabricated middle ground.

**Real, working integrations** (once you provide credentials):

- `services/research/providers/webSearch.ts` — Brave Search API
- `services/research/providers/metaAdLibrary.ts` — Meta's official public
  Ad Library API (`ads_archive`)
- `services/research/providers/competitorStores.ts` — public, unauthenticated
  Shopify `/products.json` storefront feeds, opt-in per domain
- `services/suppliers/providers/cj/` — CJ Dropshipping's official API 2.0
  (token auth, product search/detail/variants, real freight/shipping
  quotes)
- `services/suppliers/providers/zendrop/` — Zendrop's official MCP server,
  reached over the Streamable HTTP transport with dynamic tool discovery
  (`tools/list`) rather than hardcoded endpoint guesses

**Architecture-only, always `NOT_CONFIGURED`** (no accessible self-serve
API exists, or approval is a business decision, not an engineering one):

- Google Trends, TikTok Shop, Amazon Marketplace (research)
- HyperSKU, AliExpress (sourcing)

See the top-level `README.md` for exactly what was verified to actually
reach each real provider's servers in this environment, and what each one
needs from you to go live.

## Compliance gate

`SUPPLEMENT`, `INGESTIBLE`, `COSMETIC`, `MEDICAL_DEVICE`, and `REGULATED`
risk categories (`lib/compliance.ts`) block `COMPLIANCE_REQUIRED` →
`READY_TO_BUILD` until a human explicitly marks the review CLEARED. A
supplier can still be selected for research/sample while gated. Nothing —
not a listing existing, not seller marketing copy — is ever read as
compliance clearance.

## Deployment

The app is stateless aside from PostgreSQL — deploy the Next.js app to any
Node-compatible host (Vercel, Fly, Render, a container platform, etc.) and
point `DATABASE_URL` at a managed Postgres instance. Run
`prisma migrate deploy` as part of your deploy step; do not run
`prisma migrate dev` in production. There is no local-file storage
anywhere in the app.
