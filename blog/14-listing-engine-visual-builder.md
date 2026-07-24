---
title: "A Reusable, Server-Rendered Listing Engine on Optimizely SaaS + Visual Builder (Next.js)"
status: draft
audience: Optimizely community / dev.to / LinkedIn (long-form)
author: Nikki Punjabi
tags: [optimizely, saas-cms, optimizely-graph, visual-builder, nextjs, listing, pagination, faceted-search]
---

> **Draft for your review.** Edit the voice/details freely before publishing. A LinkedIn variant
> can be spun off from the intro + the three "gotcha" boxes.

> ⚠️ _Independent, unofficial learning project — not affiliated with any tourism authority or brand.
> Original wordmark and royalty-free assets only._

## What I set out to build

Every content site has the same workhorse page: a **listing**. Places to visit, events,
neighbourhoods — a hero, some intro copy, a grid of cards, and controls to page, sort, and filter.
I wanted one **reusable listing engine** on Optimizely SaaS CMS that:

- lets editors compose the page in **Visual Builder** (hero above, rich text below the grid),
- is **100% server-rendered and URL-driven** (shareable, cacheable, no client JS),
- does **server-side pagination, sort, and faceted filters** through Optimizely Graph,
- and keeps the **content tree mirroring the URLs**, so authoring stays intuitive.

Here's how it came together — and the three gotchas that cost me the most time, so they don't cost you.

## The shape: section pages are *experiences*, the grid is a *block*

The key design decision: each section page (`/places-to-visit`, `/events`, `/neighbourhoods`) is a
Visual Builder **`_experience`**, and the grid itself is a **`SectionListing` block** the author
drops onto the canvas. "Content above/below the list" is just blocks before/after it. One shared
renderer drives all three sections; the listed items are **children** of the page, so the tree and
the URLs stay in lockstep (`/places-to-visit/burj-khalifa`).

The block has a `source` reference (the section it lists) and a CMS-managed `pageSize` (9/12/15).
The heavy lifting is one query helper that auto-detects the child type and paginates/sorts/filters
server-side.

## Gotcha #1 — searchParams don't reach a block inside a composition

Pagination/sort/filter state lives in the URL (`?page=2&sort=-name&tag=luxury`). But in Next.js App
Router, **`searchParams` is only available in the route (`page.tsx`)** — and my grid renders *deep
inside* the Visual Builder composition, where those params don't reach. `OptimizelyComposition`
doesn't forward arbitrary props to blocks either.

The fix: a tiny **request-scoped store** using React's `cache()`. The route (the one place with
`searchParams`) seeds it; the block reads it. `cache()` gives you a fresh object per request, so
there's no cross-request leakage — and it keeps everything server-rendered.

```ts
// listing-context.ts
import { cache } from 'react';
const store = cache(() => ({ page: 1, path: '/', query: {} as Record<string, string> }));
export const seedListingState = (s) => Object.assign(store(), s); // called in page.tsx
export const getListingState = () => store();                     // read in the block
```

That one pattern unlocked pagination, sort, *and* filters without a line of client JavaScript.

## Gotcha #2 — deleting a parent page **cascade-deletes its children**

While migrating the old `_page` listings to experiences, my migration script's "find the children
to move" query silently returned empty — so it happily **deleted the old pages while they still had
children, taking all of them with it.** Ten POIs, three areas, three events — gone.

Two lessons, both now baked into the script:

1. **Optimizely Graph caps `limit` at 100.** My query used `limit: 200`, which is an *error*, not a
   clamp — so the call failed and returned nothing. Treating "error" as "no children" was the bug.
2. **Never delete a container on an empty result you didn't verify.** The script now refuses to
   delete if the child query errored:

```js
if (kids.errors) { log('child query errored — skipping delete to avoid cascade'); return; }
```

Recovery was clean because everything is re-seedable — but a guard is cheaper than a recovery.

## Gotcha #3 — not every field is filterable, and references filter by `key`

Two Graph modelling surprises when I built the facets:

- **A scalar field isn't filterable until it's indexed.** `priceBand` simply wasn't in the
  `where` input until I added `indexingType: 'queryable'` to the property (and re-published the
  content so it re-indexed). Changing a field's indexing is a *breaking* config change, so it needs
  a `--force` push.
- **A content reference filters by `key`, not by a friendly field.** There's no `tags: { slug: … }`
  on the reference `where` — only `tags: { key: { eq } }`. So the URL carries a readable slug
  (`?tag=luxury`) and the app resolves slug→key before querying. Clean URLs, correct query.

Also worth knowing: the generic `_Page` *interface* only exposes interface-level fields in `where`
(`_metadata`, `_fulltext`). To filter on type-specific fields (`priceBand`, `tags`) you have to
query the **concrete type** (`PointOfInterest`, `Event`), so the engine peeks at one child to detect
the type, then queries it directly.

## Two smaller wins

- **Breadcrumbs from the tree.** A single `<Breadcrumbs>` resolves each ancestor by its cumulative
  URL in one Graph query and emits `BreadcrumbList` JSON-LD — automatic on every listing and detail
  page, no per-page wiring.
- **No scroll jank.** Sort/filter/pagination links are Next.js `<Link>`s; by default navigation
  resets scroll and the page jumps. `scroll={false}` keeps the reader exactly where they were.

## The result

A single `SectionListing` block now powers every section: editor-composed canvas, server-side
pagination (9/12/15), A–Z / Z–A / Newest sort, and Price + Tag facets — all URL-driven, all
server-rendered, cards mirroring the CMS tree. Adding a new section is a new experience + a card + a
config entry.

## What's next

Making global config (site settings) and taxonomy easier for editors to manage as **shared blocks**,
then semantic search over the same content with Optimizely Graph.

_Repo: github.com/nikkipunjabi1/thisisdubai — built in the open toward Optimizely MVP._
