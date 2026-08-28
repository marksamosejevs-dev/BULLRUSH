# BULLRUSH

Men's performance standard — Next.js 16 / TypeScript / CSS Modules, no UI framework.

This repo has two parts:

- **The public site** (`app/`, root route) — the BULLRUSH marketing/e-commerce
  homepage. See below.
- **The internal product agent** (`app/admin`, `/admin` route) — an internal
  tool for taking a product opportunity from discovery through an internal
  approval to "ready for review." Not public, no user accounts, no
  autonomous spending. See `docs/ARCHITECTURE.md` and `docs/NEXT_STEPS.md`.

## Run locally

```
npm install
cp .env.example .env   # set DATABASE_URL to a local Postgres instance
npx prisma migrate dev
npx prisma db seed     # loads 3 demo opportunities, clearly marked as demo
npm run dev
```

Visit `/` for the public site and `/admin` for the internal dashboard.

## Internal Product Agent (`/admin`) — Phase 1

**What's actually working:**

- Full data model: `ProductOpportunity`, `Product`, `Supplier`,
  `SupplierQuote`, `BrandConcept`, `Creative`, `Approval`, `JobRun`
  (`prisma/schema.prisma`).
- Product economics calculator (`lib/economics.ts`): landed cost, gross
  profit, gross margin %, contribution margin, break-even CPA, break-even
  ROAS — computed live from the numbers you enter.
- Product scoring system (`lib/scoring.ts`): nine weighted 0–10
  dimensions → one overall score and a derived risk level.
- Product test state machine (`lib/state-machine.ts`) enforced on every
  status change: `DISCOVERED → VALIDATING → WATCH/REJECTED/APPROVED_FOR_TEST
  → SOURCING → READY_TO_BUILD → BUILDING → READY_FOR_REVIEW → LIVE ⇄ PAUSED`,
  with `ARCHIVED` reachable from any non-terminal state.
- Approving an opportunity for test automatically creates its `Product`
  record — the milestone the brief asked for.
- Approval workflow for every billable/external action (`BUY_DOMAIN`,
  `ORDER_SAMPLE`, `PUBLISH_PRODUCT`, `LAUNCH_META`, `LAUNCH_TIKTOK`,
  `INCREASE_BUDGET`, `ORDER_INVENTORY`) — requesting or deciding an
  approval only changes its status, it never executes the action.
- Admin dashboard at `/admin`: opportunity list with score/margin/risk/
  status, status filter, quick actions (Approve test / Watch / Reject).
- Opportunity detail page: full scoring breakdown, live economics, status
  transition buttons, an edit form, and manual-entry panels for suppliers,
  brand concepts, creatives, and approvals.
- "New Opportunity" form for manual entry.

**What's mock / demo data:**

- The three seeded opportunities (Creatine Gummies, Magnesium Recovery
  Complex, Men's Performance Gummies) are illustrative examples only,
  flagged `isDemoData: true` and visibly badged "Demo data" in the UI.
  Every "trend" note on them says explicitly that it's a placeholder, not
  real market research.
- All scoring and economics numbers are entered by a human (or the seed
  script) — there is no live trend/market data feed yet.

**What needs API credentials (none of this runs in Phase 1):**

- Shopify Admin API (`SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN`)
  — `services/shopify`
- A domain registrar API (`DOMAIN_REGISTRAR_API_KEY`) — `services/domains`
- A supplier sourcing data source (`SUPPLIER_SOURCING_API_KEY`) —
  `services/suppliers`
- An image generation API (`IMAGE_GENERATION_API_KEY`) — `services/images`
- Meta Marketing API (`META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`) —
  `services/meta`
- TikTok Marketing API (`TIKTOK_ACCESS_TOKEN`, `TIKTOK_ADVERTISER_ID`) —
  `services/tiktok`

Every one of these is checked via `lib/env.ts` and returns an explicit
`NOT_CONFIGURED` result rather than pretending to work. See
`.env.example` for the full list.

**What we should build next:** see `docs/NEXT_STEPS.md` — Phase 2 is a
real Scout agent and real supplier sourcing.

---

## Public site

## Assets

Real BULLRUSH product photography and the brand-deck-sourced horn mark are
in place: `/public/images/*.jpg` (14 supplied photos) and
`components/HornMark` (exact SVG path data from `mark-black.svg`, plus a
static seal variant baked into `public/favicon.svg`). `components/Plate`
(`data/plates.ts`) renders each real photo via `next/image`; a scene not
yet backed by a file falls back to an art-directed CSS material study
instead of a broken image or stock/AI photography — add the key to
`availablePlates` the same day you drop the file in.

Typography, color, motion timing and the two-tier mark system follow the
supplied brand deck (`data/brand.ts`, the `--font-*`/`--ease-*`/`--dur-*`
tokens in `app/globals.css`, and the `.card-title` utility for the deck's
"Card title" type role).

## What's real vs. placeholder

Four production claims are confirmed and used throughout the site
(`data/trust.ts`): CGMP facility, Non-GMO, Made in USA, third-party tested.
Everything else the brief says not to invent is left as an empty array /
`null` in `data/`, each with a comment on what to fill in:

- `data/product.ts` — `price` (checkout currently reads "confirmed at checkout")
- `data/formula.ts` — `ingredients` (Formula section shows a holding state until populated)
- `data/evidence.ts` — `clinicalReferences` (same pattern)

`data/transparency.ts` is now populated from the four confirmed claims —
extend it once further documentation (batch records, sourcing detail)
exists. The consistency chart (`components/ConsistencyChart`) is explicitly
labeled illustrative/conceptual, not measured data or a clinical outcome.

Checkout is not wired to a payment processor — the cart is fully functional
(add/remove/quantity, localStorage-persisted) but the CHECKOUT button shows
an explicit "not connected yet" message rather than faking a transaction.
