# Architecture — Internal E-Commerce Agent (Phase 1)

This is an internal tool for BULLRUSH's own use: take a product opportunity
from discovery through an internal approval to "ready for review." It is
not a SaaS, has no user accounts, and performs no billable action on its
own.

## Stack

- **Next.js 16 (App Router) + TypeScript** — same stack as the existing
  public BULLRUSH site (`app/`), extended rather than replaced.
- **PostgreSQL + Prisma 6** — persistent, cloud-deployable database. The
  agent must work with your computer turned off, so nothing depends on
  local disk state beyond `.env`.
- **CSS Modules** — no UI framework, consistent with the rest of the repo.
- **No auth** — Phase 1 is explicitly single-operator/internal. Restrict
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
  inputs (`lib/scoring.ts`) and economics inputs (`lib/economics.ts`).
- **Product** — created automatically the moment an opportunity is moved to
  `APPROVED_FOR_TEST`. Holds the concrete, buildable product record (brand
  name, domain, landing page, Shopify draft id) as those get filled in.
- **Supplier** / **SupplierQuote** — suppliers are shared across
  opportunities; a `SupplierQuote` is one supplier's quote against one
  opportunity. Every numeric/boolean field is nullable — unknown is
  UNKNOWN, never fabricated.
- **BrandConcept** — candidate names/taglines/offers/domain ideas for an
  opportunity. Domain candidates are ideas only; nothing here is checked
  for availability or purchased.
- **Creative** — UGC scripts, visual asset briefs, Meta/TikTok campaign
  briefs. Entered manually in Phase 1.
- **Approval** — the gate for every billable/external action
  (`BUY_DOMAIN`, `ORDER_SAMPLE`, `PUBLISH_PRODUCT`, `LAUNCH_META`,
  `LAUNCH_TIKTOK`, `INCREASE_BUDGET`, `ORDER_INVENTORY`). Creating or
  deciding an Approval record **never** performs the action — see
  "No autonomous financial action" below.
- **JobRun** — a log line for one agent/service invocation. Exists for
  Phase 2 agents to write to; nothing writes to it automatically yet.

## Business logic modules (`lib/`)

- `lib/economics.ts` — pure functions turning selling price, COGS,
  shipping, packaging, payment fees, discount and refund assumptions into
  landed cost, gross profit, gross margin %, contribution margin,
  break-even CPA and break-even ROAS. No external calls, no fabricated
  numbers — every output is a deterministic function of the inputs you
  entered.
- `lib/scoring.ts` — nine 0–10 dimensions (trend velocity, creative
  potential, margin potential, market demand, competition, fulfillment
  simplicity, repeat purchase, regulatory risk, brandability), combined
  into one weighted overall score and a derived risk level. Scores are
  entered by a human until the Validator agent exists.
- `lib/state-machine.ts` — the only place that decides which status
  transitions are legal. Server actions call `canTransition()` before
  writing a new status so the lifecycle can't be corrupted by a stray
  request.

## State machine

```
DISCOVERED → VALIDATING → WATCH / REJECTED / APPROVED_FOR_TEST
APPROVED_FOR_TEST → SOURCING → READY_TO_BUILD → BUILDING → READY_FOR_REVIEW
READY_FOR_REVIEW → LIVE ⇄ PAUSED
any non-terminal status → ARCHIVED (manual escape hatch)
```

Full transition table: `lib/state-machine.ts`.

## No autonomous financial action

This is the most important architectural rule in Phase 1. Nothing in this
codebase:

- purchases a domain,
- places a supplier order,
- publishes a Shopify product live,
- launches or spends on a Meta or TikTok campaign,

...without a human clicking "Approve" on an `Approval` record first, and
even then, **approving the record only changes its status** — no
`/services/*` client is wired up to actually execute anything yet. That
wiring is explicitly Phase 2+ work (see `docs/NEXT_STEPS.md`).

## `/agents` and `/services` — stubs, not fake integrations

Every file under `agents/*/index.ts` and `services/*/index.ts` returns a
`NOT_CONFIGURED` result. `lib/env.ts` checks whether credentials exist for
a given service; if they don't, the stub says so explicitly rather than
silently doing nothing or pretending to succeed. This is intentional: a
Phase 1 reviewer should never be able to mistake a stub for a working
integration.

- `agents/scout`, `agents/validator`, `agents/sourcing`, `agents/brand`,
  `agents/creative` — will call the services below and write to the models
  above.
- `services/shopify`, `services/domains`, `services/suppliers`,
  `services/images`, `services/meta`, `services/tiktok` — will wrap the
  actual external APIs.

## Deployment

The app is stateless aside from PostgreSQL — deploy the Next.js app to any
Node-compatible host (Vercel, Fly, Render, a container platform, etc.) and
point `DATABASE_URL` at a managed Postgres instance. Run
`prisma migrate deploy` as part of your deploy step; do not run
`prisma migrate dev` in production. There is no local-file storage
anywhere in the app.
