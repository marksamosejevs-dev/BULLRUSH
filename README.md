# BULLRUSH

Men's performance standard — Next.js 16 / TypeScript / CSS Modules, no UI framework.

## Run locally

```
npm install
npm run dev
```

## What's real vs. placeholder

No brand-deck PDF or product photography reached this build — only reference
screenshots visible in chat, which aren't exportable files. Everything here
was built directly from the brief's design tokens and copy rules, with the
horn mark reproduced as vector (`components/HornMark`) and every photography
slot rendered as an art-directed CSS material study (`components/Plate`,
`data/plates.ts`) instead of stock/AI imagery.

To drop in real photography: add the file to `/public/images/<key>.jpg`
using the filename already referenced in `data/plates.ts`, then add that
key to `availablePlates` in the same file. The component picks it up with
no other code changes.

Facts the brief explicitly says not to invent are left as empty arrays /
`null` in `data/`, each with a comment on what to fill in:

- `data/product.ts` — `price` (checkout currently reads "confirmed at checkout")
- `data/formula.ts` — `ingredients` (Formula section shows a holding state until populated)
- `data/evidence.ts` — `clinicalReferences` (same pattern)
- `data/transparency.ts` — `transparencyItems` (sourcing/testing/manufacturing facts)

Checkout is not wired to a payment processor — the cart is fully functional
(add/remove/quantity, localStorage-persisted) but the CHECKOUT button shows
an explicit "not connected yet" message rather than faking a transaction.
