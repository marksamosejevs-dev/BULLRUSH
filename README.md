# BULLRUSH

Men's performance standard — Next.js 16 / TypeScript / CSS Modules, no UI framework.

## Run locally

```
npm install
npm run dev
```

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
