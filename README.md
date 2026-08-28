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

## Internal Product Agent (`/admin`) — Phase 1 + Phase 2

Phase 1 built the foundation (data model, economics calculator, scoring
system, state machine, dashboard). Phase 2 connected it to real external
data: a query-directed Scout that does real web/ad-library/storefront
research, a Validator that scores from that real evidence, and real
supplier sourcing (CJ Dropshipping + Zendrop) with real US shipping quotes
and a compliance gate for regulated products. See `docs/ARCHITECTURE.md`
for how it fits together and `docs/NEXT_STEPS.md` for Phase 3.

### 1. What real data sources work

- **Web Search (Brave)**, **Meta Ad Library**, and **Competitor
  Storefronts** (public Shopify `/products.json` feeds) are real,
  finished integrations — set their env vars and they work.
- **CJ Dropshipping** (official API 2.0) and **Zendrop** (official MCP
  server) are real, finished sourcing integrations — same story.
- Google Trends, TikTok Shop, and Amazon Marketplace have no accessible
  self-serve API for this use case (see `.env.example` for why each one
  specifically) and stay `NOT_CONFIGURED`, same for HyperSKU and
  AliExpress on the sourcing side.

### 2. Which providers are connected (in this environment, right now)

None. This session has zero API credentials configured for any provider —
every research and supplier source reports `NOT_CONFIGURED` on the
dashboard and opportunity detail page.

### 3. Which providers are not configured

All of them — see #2. The dashboard's Run Scout panel and each
opportunity's Sourcing panel show a live status badge (`CONNECTED` /
`NOT_CONFIGURED` / `ERROR`) per provider so this is never ambiguous.

### 4. What API keys / accounts you need

| Provider | What you need | Env vars |
|---|---|---|
| Web Search | Brave Search API key (has a free tier) | `BRAVE_SEARCH_API_KEY` |
| Meta Ad Library | A Graph API access token with Ad Library access | `META_AD_LIBRARY_ACCESS_TOKEN` |
| Competitor Storefronts | Nothing — just list domains you want checked | `COMPETITOR_STORE_DOMAINS` |
| CJ Dropshipping | A CJ account + API key from your CJ dashboard | `CJ_API_KEY` or `CJ_ACCESS_TOKEN` |
| Zendrop | A Zendrop account + API key (Settings → API) | `ZENDROP_API_KEY` |
| HyperSKU | Contact HyperSKU's integration team (no self-serve API) | — |
| AliExpress | An approved Open Platform Dropshipping application | — |

Full list with comments: `.env.example`.

### 5. One real product search result

I couldn't get a real Scout run to search anything live — this sandbox has
no provider credentials configured, and this session's outbound network
policy also blocks the actual provider hosts (`api.search.brave.com`,
`graph.facebook.com`, `app.zendrop.com` all returned "Host not in
allowlist" when I tested with placeholder credentials — see
`docs/NEXT_STEPS.md`). So instead of faking a result, I used my own
web research (not the app) to find one real, current product and entered
it as a real (non-demo) opportunity with real sources:
**"Portable Mini Thermal Printer"** — evidence includes TikTok's live
discovery page for the dropshipping niche and active B2B sourcing listings
(Alibaba, Doba). Script: `scripts/real-test-part17.ts`. Open it at
`/admin/opportunities/<id>` after seeding, or re-run the script yourself.

### 6. One real supplier result

None yet — honestly, and this needed a correction. A real `CJ_API_KEY` was
provided, but this development sandbox's own outbound network policy
blocks `developers.cjdropshipping.com` entirely (same allowlist policy
that blocked Brave/Meta/Zendrop earlier). An earlier version of this
report misread that block's `403 Forbidden` as a real response from CJ's
API — it wasn't; the response body was literally "Host not in allowlist,"
from this sandbox's proxy, not from CJ. That's a sandbox limitation, not
an app bug: the code and the key are both plausibly fine, this environment
just can't reach the host to prove it. The real test is one `npx tsx
scripts/real-test-cj-live.ts` away on your own machine or once this app is
deployed anywhere with normal outbound internet access.

### 7. Real landed cost if available

Not available for the reason above — no real supplier quote exists yet.
The math itself (`lib/economics.ts`, `SupplierQuote.landedCost =
unitCost + usShippingCost`) is implemented, tested, and will produce a
real number the moment a real quote exists.

### 8. What is still mock

- The three seeded demo opportunities (Creatine Gummies, Magnesium
  Recovery Complex, Men's Performance Gummies) — flagged `isDemoData:
  true`, badged "Demo data" everywhere in the UI.
- Manually-entered scores/economics on opportunities created via the "New
  Opportunity" form (same as Phase 1 — nothing new here is mocked, it's
  just not evidence-backed until you run the Validator against real
  evidence).

Nothing else is mocked: every provider either does real work or says
`NOT_CONFIGURED`/`ERROR` — never a fabricated result.

### 9. What we build in Phase 3

Domain checks/purchasing, Shopify draft creation, Brand/Creative agents,
and (much later, after Approval) Meta/TikTok campaign launch. Full
reasoning in `docs/NEXT_STEPS.md`. **Not started automatically** — this is
a deliberate stop point per the brief.

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
