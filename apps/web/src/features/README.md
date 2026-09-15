# features/

One folder per business capability. This is the layer that actually holds the
application; `app/` above it only does routing and composition.

## Rules

1. **`app/` holds no business logic.** A `page.tsx` should read as: resolve
   params, fetch, compose components from here. If it grows past ~40 lines,
   the logic belongs in a feature.

2. **Import across features through `index.ts` only.**
   `import { productListQuery } from "@/features/catalog"` — never
   `@/features/catalog/api/queries`. That single boundary is what keeps the
   slices from fusing together once the project gets real.

3. **Server Components by default.** Push `"use client"` down to the leaf that
   genuinely needs interactivity (`VariantPicker`, `AddToCartButton`), not up to
   the page.

4. **Ant Design imports are legal only in `admin-*` features.** Everything
   rendered under `(storefront)` uses Tailwind + shadcn/ui.

## Shape of a feature

```
catalog/
├── api/         fetchers + TanStack queryOptions
├── components/  UI owned by this feature
├── hooks/       feature-local hooks
├── schemas.ts   Zod — shared with the API via packages/shared later
├── types.ts
└── index.ts     public API — the only path others may import
```
