# Listing Page Pattern — the canonical dynamic listing

_The reusable blueprint for **every** listing/section page (Places to Visit, Events, Areas,
Hotels, Tours…). Defines the anatomy, content model, data flow, SEO and accessibility so each
section page stays thin and consistent. Pairs with COMPONENT-STANDARDS.md, SEO.md, CONTENT-MODEL.md._

## 1. Anatomy (top → bottom)
1. **Breadcrumbs** — derived from the CMS content tree, + `BreadcrumbList` JSON-LD.
2. **Top composition zone** — editor-managed content area (Hero, RichText, SectionHeading…) rendered *above* the list.
3. **Header** — heading + intro (page fields).
4. **Toolbar** — result count, active-filter chips (clearable), **filters**, **sort**.
5. **Results grid** — the section's cards on the 12-col grid, **server-paginated**.
6. **Pagination** — page-number links (server-rendered).
7. **Bottom composition zone** — editor-managed content area rendered *below* the list.

## 2. URL is the source of truth (100% server-rendered)
All state lives in the query string so pages are shareable, cacheable, and need **no client JS**:
```
/places-to-visit?page=2&category=fine-dining&price=$$$&area=downtown-dubai&sort=name
```
The server component reads `searchParams`, builds one Graph query (filter + sort + skip/limit),
and renders. Filter/sort/pagination controls are `<a>`/`<form>` that change the query string — the
server re-renders. (No `useState`, no client fetching. Requirement #4.)

## 3. Content model (dedicated page per section)
Each section is its own routable `_page` type (`PlacesToVisitPage`, `EventsPage`, …), all sharing
the same field set so the engine is uniform:
- `extends SeoMetadata`
- `heading` (string, required), `intro` (string)
- **`pageSize`** — `selectOne` enum **9 / 12 / 15** (default 12). CMS-manageable (requirement #3).
- **`topContent`** — content area (`type: 'content'`, allowed: Hero, RichText, SectionHeading…).
- **`bottomContent`** — content area, same allowed types.
- `mayContainTypes: [<ItemType>]` — the listed items are authored as **children** (tree = URL).
- (optional) `defaultSort`, `enabledFacets` — to configure the toolbar per section from the CMS.

The **items** (POIs, Events…) remain children of the page, so the content tree mirrors the URLs.

## 4. Pagination (server-side, Graph)
- Read `?page=N` (default 1). Query Graph with `skip = (N-1) * pageSize`, `limit = pageSize`, and
  request `total` for the page count.
- Render numbered page links (`?page=2` …), prev/next, and "showing X–Y of T".
- Beyond ~10k items switch to cursor paging (not needed at demo scale).

## 5. Filters + sort (faceted, server-side)
- **Facets:** Category (grouped by `dimension` — theme/cuisine/audience…), `priceBand`, `Area`.
  Multi-select via repeated query params; combined into a Graph `where`.
- **Facet source:** the `Category` taxonomy (`synonyms`/`description` also feed later AI search).
- **Sort:** `?sort=name|-name|price` → Graph `orderBy`.
- **UX:** result count, active-filter **chips** (each clears its param), a **"Clear all"**, and an
  **empty state** when a combination yields nothing.
- **Dependency:** Category/Area facets require the **POI→Category / POI→Area relationships** to be
  seeded (seed v2). `priceBand` + `sort` work immediately (scalar). Facets render only when data exists.

## 6. Breadcrumbs
- Built from the content tree: `Home / Places to Visit / Burj Khalifa`, each segment a link derived
  from `_metadata.url` up the hierarchy (or resolved via the path). Emits `BreadcrumbList` JSON-LD.
- A shared `<Breadcrumbs>` primitive used by **all** pages (listings + detail), addressing the
  "no way back to Home" gap (requirement #1).

## 7. SEO for listings (avoid thin/duplicate content)
- Base page (`/places-to-visit`) is indexable with its CMS title/description.
- **Filtered/sorted variants** → `canonical` back to the clean listing URL, and `noindex` to avoid
  crawling every facet combination. Page 2+ keep a self-canonical (or `rel=prev/next`).
- `CollectionPage` + `BreadcrumbList` JSON-LD.

## 8. Reuse — one engine, thin pages
A shared **`<Listing>`** engine (query builder + toolbar + grid + pagination) is configured per
section by a small descriptor: `{ itemType, cardComponent, facets, defaultSort, defaultPageSize }`.
Dedicated page types stay thin — they render composition zones + `<Listing config={…}>`. Adding a new
section = new `_page` type + a card + a config entry.

## 9. Accessibility & performance
- Filters are a real `<form>` (works without JS); controls are keyboard-navigable; pagination uses
  `aria-current`. RSC streaming (Suspense) renders the shell while the grid resolves. Cards use
  `next/image` once imagery lands.

## 10. Build phases
1. **Breadcrumbs** primitive (+ JSON-LD) on listing & detail.
2. **Composition zones** — add `topContent`/`bottomContent` + `pageSize` to `PlacesToVisitPage`; render Hero/RichText above & below.
3. **Server pagination** — `?page`, skip/limit, numbered controls.
4. **Sort + priceBand filter** — works today (scalar).
5. **Category/Area facets** — after seed v2 relationships.
6. Extract the shared `<Listing>` engine; document the descriptor; apply to Events/Areas next.
