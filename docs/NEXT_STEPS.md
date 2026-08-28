# Next Steps

## Phase 1 — done

The foundation described in the project brief: data model, economics
calculator, scoring system, state machine, and an internal dashboard to
drive opportunities through the pipeline by hand. See the top-level
`README.md` for the "what's working / what's mock" summary.

## Phase 2 — Real Product Scout + Sourcing

The next module to build. In priority order:

1. **Scout agent** (`agents/scout`) — connect a real trend/ad-library data
   source (e.g. TikTok Creative Center, a paid trend API, or manual
   scraping with review) and have it create `ProductOpportunity` rows with
   `status: DISCOVERED`, real `trendSignal`/`trendEvidence`, and a
   `JobRun` record for every run. Do not auto-approve anything it finds.

2. **Validator agent** (`agents/validator`) — given a `DISCOVERED`
   opportunity, populate the nine scoring dimensions from real signals
   instead of manual entry. Keep `lib/scoring.ts` as the single scoring
   function; the agent should call it, not reimplement it.

3. **Sourcing agent + `services/suppliers`** — search real supplier
   platforms and write `Supplier`/`SupplierQuote` rows. Keep the UNKNOWN
   convention: never fill a field the agent couldn't actually verify.

4. **`services/domains`** — real availability checks for
   `BrandConcept.domainCandidates`. Purchasing stays gated behind an
   `Approval` with action `BUY_DOMAIN` — the service should expose
   `checkAvailability()` freely, but `purchaseDomain()` should only ever
   be called from an approved-Approval code path, never automatically.

5. **`services/shopify`** — create *draft* (unpublished) products from an
   approved `Product` record. Publishing live stays gated behind
   `Approval` action `PUBLISH_PRODUCT`.

Only after the above are solid:

6. **Brand agent** (`agents/brand`) — generate `BrandConcept` candidates.
7. **Creative agent** (`agents/creative`) + `services/images` — generate
   UGC scripts and visual assets as `Creative` rows.
8. **`services/meta` / `services/tiktok`** — explicitly out of scope until
   the rest of the pipeline is trustworthy. Campaign creation and budget
   changes must stay behind `Approval` (`LAUNCH_META`, `LAUNCH_TIKTOK`,
   `INCREASE_BUDGET`) with no automatic spend, same as everything else.

## Things intentionally deferred past Phase 2

Per the original brief, these are out of scope until the internal tool has
actually proven useful:

- Public SaaS packaging, billing/subscriptions, multi-tenancy
- User accounts, teams, roles/permissions
- Public onboarding flow
- Affiliate systems
- Enterprise architecture (multi-region, SSO, audit logging beyond what
  `Approval`/`JobRun` already give you)

## Smaller improvements worth doing alongside Phase 2

- A lightweight status-change history (who/when) if more than one person
  starts using the dashboard — Phase 1 deliberately skipped this to avoid
  a permissions system, but a simple append-only log is cheap.
- Server-side validation (zod is already a dependency) on the admin forms,
  currently relying on HTML `required`/`type="number"` plus Prisma's
  schema types.
- A real seed/reset script for local development separate from the
  demo-data seed, once the schema has evolved past Phase 1.
