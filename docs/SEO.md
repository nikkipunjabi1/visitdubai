# SEO Requirements — Visit Dubai

_Hard requirement: **every page must render its SEO tags server-side, on page load** — page
title, meta description, canonical, Open Graph/Twitter, and **JSON-LD** structured data. Nothing
SEO-critical may be injected only on the client or skipped for any page type._

## Non-negotiables
- ✅ Server-rendered `<title>` + `<meta name="description">` on **every** route.
- ✅ Canonical URL, `og:*` + `twitter:*`, `robots` directives.
- ✅ **JSON-LD** (`<script type="application/ld+json">`) present in the **initial HTML** (RSC),
  not added by client JS.
- ✅ `hreflang` alternates once localization is on (EN now, AR later).
- ✅ `sitemap.xml` + `robots.txt` (baseline already has `sitemap.ts` / `robots.ts`).
- ✅ No page ships with a missing/empty title or duplicate/boilerplate meta.

## How we guarantee it (Next.js App Router)
- **Metadata:** every route implements `generateMetadata()` (async, server-side) pulling
  title/description/OG from the CMS content's `SeoMetadata`. The forked baseline already wires
  `generateMetadata` through `createPage` — we ensure our content types expose SEO fields and
  provide **sensible fallbacks** (never blank).
- **JSON-LD:** a server component `<JsonLd data={…} />` renders per page in `layout`/`page`. We
  build a small **schema generator** mapping each Opti content type → schema.org type:
  | Content type | schema.org type |
  |--------------|-----------------|
  | HomePage | `WebSite` (+ `SearchAction` for sitelinks search box) |
  | PointOfInterest (Places to Visit) | `TouristAttraction` |
  | Event | `Event` |
  | Article / News | `Article` / `NewsArticle` |
  | Tour | `TouristTrip` |
  | Hotel | `Hotel` / `LodgingBusiness` |
  | Area | `Place` |
  | Breadcrumbs (all) | `BreadcrumbList` |
  | Org (global) | `Organization` |
- **Images:** dynamic **OG images** per page (Next `opengraph-image` / `ImageResponse`), using
  royalty-free hero art.

## Enforcement (so nothing slips)
- A shared `buildMetadata(content, fallbacks)` helper — no route hand-rolls metadata.
- A shared `buildJsonLd(content)` — every detail template calls it; a lint/test asserts each
  page type emits JSON-LD.
- A Phase-3 **automated check**: crawl key routes in CI and assert title + description +
  ≥1 JSON-LD block exist in the server HTML.

## The reusable-module angle
The **JSON-LD generator for Optimizely content types** is a clean, community-useful extract —
secondary MVP/blog candidate after the preview-link module. See BLOG-PLAN.md.

> Note: this pairs with the preview workflow — preview/draft pages should set `robots: noindex`
> so unpublished content is never indexed while shared with stakeholders.
