# Next Steps

## Phase 1 — done

The foundation described in the project brief: data model, economics
calculator, scoring system, state machine, and an internal dashboard to
drive opportunities through the pipeline by hand.

## Phase 2 — done

Real product discovery → real supplier sourcing → real US shipping quotes
→ real economics → an opportunity ready for test, with a compliance gate
in front of anything regulated. See the top-level `README.md` for the
detailed "what's real / what's mock / what needs API keys" breakdown, and
`docs/ARCHITECTURE.md` for how the provider architecture works.

Summary of what shipped:

- **Scout** (`agents/scout`) — query-directed, provider-backed research
  that creates real `ProductOpportunity` + `TrendEvidence` rows.
  Providers: Web Search (Brave, real), Meta Ad Library (real), Competitor
  Storefronts (real, opt-in), Google Trends / TikTok Shop / Amazon
  (architecture only, `NOT_CONFIGURED` — no supported self-serve API
  exists for any of them yet).
- **Normalization** (`lib/normalize.ts`) — deterministic name/alias
  merging so the same product isn't discovered twice under different
  names.
- **Validator** (`agents/validator`, `lib/validator.ts`) — connects real
  evidence to the existing 9-dimension scoring system, storing a
  score/reason/evidence/confidence per dimension and a configurable
  TEST/WATCH/REJECT recommendation (`lib/config.ts`) — never applied
  automatically.
- **Sourcing** (`agents/sourcing`, `lib/matching.ts`) — real supplier
  search + real US shipping quotes + a documented, unknown-punishing
  100-point match score, run against CJ Dropshipping (real, official API
  2.0) and Zendrop (real, official MCP server, dynamic tool discovery).
  HyperSKU and AliExpress are architecture-only `NOT_CONFIGURED` — no
  accessible self-serve API for either from this environment.
- **Compliance gate** (`lib/compliance.ts`) — `SUPPLEMENT` / `INGESTIBLE`
  / `COSMETIC` / `MEDICAL_DEVICE` / `REGULATED` risk categories block the
  `COMPLIANCE_REQUIRED` → `READY_TO_BUILD` transition until a human
  explicitly clears it. Nothing infers compliance from a listing existing.

## Phase 3 — candidates

Nothing below is started. In roughly the order the brief's Phase 1/2
sequencing implies:

1. **`services/domains`** — real availability checks for
   `BrandConcept.domainCandidates`. Purchasing stays gated behind an
   `Approval` with action `BUY_DOMAIN` — expose `checkAvailability()`
   freely, but `purchaseDomain()` should only ever be called from an
   approved-Approval code path, never automatically.
2. **`services/shopify`** — create *draft* (unpublished) products from an
   approved `Product` record. Publishing live stays gated behind
   `Approval` action `PUBLISH_PRODUCT`.
3. **Brand agent** (`agents/brand`) — generate `BrandConcept` candidates,
   ideally seeded from the same evidence the Validator already collected.
4. **Creative agent** (`agents/creative`) + `services/images` — generate
   UGC scripts and visual assets as `Creative` rows.
5. **`services/meta` / `services/tiktok`** — explicitly out of scope until
   the rest of the pipeline is trustworthy. Campaign creation and budget
   changes must stay behind `Approval` (`LAUNCH_META`, `LAUNCH_TIKTOK`,
   `INCREASE_BUDGET`) with no automatic spend, same as everything else.
6. **Autonomous Scout runs** — Phase 2's Scout is query-directed (a human
   types a search term). Autonomous, scheduled trend scanning across
   categories — the "prioritize products showing recent acceleration"
   language from the brief in its fullest form — is real scope creep
   beyond what one un-authenticated pass can respect: it needs a job
   scheduler, a much larger provider set (Google Trends/TikTok
   Shop/Amazon all need approved access — see README), and careful design
   so it doesn't flood the dashboard with low-quality opportunities.
7. **HyperSKU / AliExpress** — revisit once real API access exists.
   AliExpress specifically needs an approved Open Platform Dropshipping
   application (openservice.aliexpress.com) — that's a business decision,
   not an engineering one.
8. **Alibaba / private-label sourcing ("Best for Scale")** — Part 13 of
   the Phase 2 brief explicitly deferred this; `lib/matching.ts` has a
   `privateLabelScore` component ready but always 0 until a provider
   supplies real data for it.

## Things intentionally deferred past Phase 3

Per the original brief, these are out of scope until the internal tool has
actually proven useful:

- Public SaaS packaging, billing/subscriptions, multi-tenancy
- User accounts, teams, roles/permissions
- Public onboarding flow
- Affiliate systems
- Enterprise architecture (multi-region, SSO, audit logging beyond what
  `Approval`/`JobRun` already give you)
- Domain purchasing, Shopify publishing, Meta/TikTok campaign launch,
  automatic supplier payment or order placement, automatic ad spend,
  private label ordering, Alibaba bulk ordering (Part 18 of the Phase 2
  brief — all of it stays behind `Approval` + a human, indefinitely, until
  a later phase explicitly takes it on)

## Smaller improvements worth doing alongside Phase 3

- A lightweight status-change history (who/when) if more than one person
  starts using the dashboard — deliberately skipped so far to avoid a
  permissions system, but a simple append-only log is cheap.
- Server-side validation (zod is already a dependency) on the admin forms,
  currently relying on HTML `required`/`type="number"` plus Prisma's
  schema types.
- CJ's real endpoint paths/field names were confirmed via search-engine
  snippets of their official docs (this environment's network policy
  blocks fetching the docs pages directly) but NOT verified against a
  live account — this dev sandbox's own outbound network policy also
  blocks `developers.cjdropshipping.com` itself, so a real `CJ_API_KEY`
  could not be tested from here. Run `scripts/real-test-cj-live.ts` from
  an environment with normal outbound internet access the first time
  real credentials are added, and adjust `services/suppliers/providers/
  cj/mapping.ts` if the actual response shape differs from what's coded.
- Zendrop's MCP tool names are discovered dynamically at runtime rather
  than hardcoded (see `services/suppliers/providers/zendrop/mcpClient.ts`)
  because this environment couldn't fetch their tool reference either —
  confirm the fuzzy tool-matching picks the right tools once real
  credentials exist, and tighten it if the server exposes multiple
  similarly-named tools.
