# Optimizely Research Notes

_Distilled from the official docs + reference repos. Grounding for build decisions. Citations
at the bottom of each section. (Graph section appended when that research completes.)_

---

## A. Visual Builder (SaaS CMS)

### Core concepts
- **Experience vs Page** — a Page is standard routable content; an **Experience** adds the
  layout/composition system and is the Visual Builder entry point. Queried in Graph as
  `_Experience`; uses an **`outline`** layout (ordered sequence of sections).
- **Section** — a vertical "chunk", modeled as an extension of a block, using a **`grid`**
  layout (rows → columns → elements). Reusable across experiences.
- **Rows / Columns** — structural nodes inside a section grid (`CompositionStructureNode`).
- **Elements / Components** — leaf content nodes (`CompositionComponentNode`). A content type
  becomes usable when flagged **"Available for composition in Visual Builder"** +
  **"Display as Element"**.
- **Composition node tree** — each node has a `nodeType` discriminator: `experience` /
  `section` / `row` / `column` / `component`. Traversed in GraphQL via nested `nodes` with
  inline fragments.
- **Display templates / display settings** — developer-defined templates bound to a base type
  (`experience`/`section`/`component`) or node type (`row`/`column`), exposing `select` and
  `checkbox` settings. Values surface as `displayTemplateKey` / `displaySettings`, passed to a
  component's `layoutProps` in the `@remkoj` SDK.

### Rendering an Experience (query shape)
Experience → `composition { grids: nodes { ...on CompositionStructureNode { rows: nodes {
columns: nodes { elements: nodes { ...compositionComponentNode }}}}}}`. Leaf elements resolve
via a fragment on `CompositionComponentNode` that spreads one fragment per registered element
type and switches on `component.__typename`. **Adding an element type = add its fragment +
spread it + handle its `__typename`.**

### On-page editing / live preview — the 5 required pieces
1. **Preview route** the CMS calls:
   `{host}/preview?key={key}&ver={version}&loc={locale}&ctx={context}` where `ctx` is `edit`
   or `preview`; CMS auto-appends `&preview_token=<TOKEN>`.
2. **Edit-mode detection** = presence of `preview_token` in the URL.
3. **Two Graph auth modes**: public delivery (`/content/v2?auth=<SINGLE_KEY>`, published only)
   vs **preview** (`Authorization: Bearer <preview_token>`, returns drafts). Preview tokens are
   **short-lived (~5 min)**, refreshed via the contentSaved event.
4. **Communication injector** — in preview, inject
   `https://<CMS_URL>/util/javascript/communicationinjector.js`. It bridges CMS↔frontend over
   postMessage, fires `optimizely:cms:contentSaved` on save, and powers property overlays.
   Frontend listens and refetches the new version. CSP must allow being iframed by / loading
   scripts from `https://app-<UUID>.cms.optimizely.com`.
5. **Edit overlay attributes** (when `ctx=edit`): `data-epi-block-id` on each node (= node
   key), `data-epi-edit="<propertyName>"` to make a single property clickable.

### CMS configuration to point at the frontend
Settings → **Applications** → create app → set start page + **hostname** of the Next.js app
(HTTPS; local dev uses `next dev --experimental-https`) → CMS uses the default preview URL
template and auto-appends the preview token → get the **single key** + Graph/CMS URLs into env.

### Practical takeaway
The `cms-visual-builder-hello-world` repo is a **minimal Pages-Router** demo (one element type,
non-recursive, no `data-epi-edit`). For our build, the **`@remkoj` App-Router SDK is the path**
— specifically `<OptimizelyComposition>` (full recursive Experience renderer) + `<CmsContent>`
+ `<CmsEditable>` from `@remkoj/optimizely-cms-react`, and `createPage`/`createPublishApi` from
`@remkoj/optimizely-cms-nextjs`. This is exactly what our forked baseline
(`cms-saas-vercel-demo`) already uses — so Visual Builder wiring comes "for free" and we extend
it by registering new components (see ARCHITECTURE.md §6).

⚠️ **Version gotcha:** `@remkoj/*` **< 5.1.6** breaks on current SaaS ("Component not found" /
empty pages). Pin ≥ 5.1.7.

**Sources:** docs `visual-builder`, `configure-visual-builder`, `enable-live-preview-saas`,
`live-preview-with-react`, `on-page-editing-using-content-graph`, `quick-start-guide-next-js`;
repos `cms-visual-builder-hello-world`, `remkoj/optimizely-dxp-clients`, `optimizely-saas-starter`.

---

## B. Optimizely Graph

### What it is
GraphQL-based, **read-only** content delivery service (no mutations, no subscriptions). CMS is
the source; Graph is the queryable delivery layer. Content is synced via a CMS sync package.
- **Sync latency:** ~5–15 min scheduled, ~1–3 s event-driven. **Schema changes take minutes to
  propagate** — wait 5–10 min before deploying dependent code.
- **Media** referenced by URL only (binaries not stored). Items **> 1 MB** cause timeouts.

### Endpoint & auth
- Gateway: `https://cg.optimizely.com/content/v2` (staging: `https://staging.cg.optimizely.com`).
- **Single key** → `?auth=<SINGLE_KEY>`: **public, read-only, published content only.** The only
  frontend-safe credential — use it for the client-side search UI.
- **App key + Secret** (Basic `base64(APP_KEY:SECRET)` or **HMAC** `epi-hmac
  APP_KEY:TIMESTAMP:NONCE:SIGNATURE`): **super-user** (returns unpublished + bypasses RBAC unless
  you send `cg-username` / `cg-roles`). **Server-only, never in the browser.** Used for
  preview/edit (drafts) and webhook management.
- ⚠️ Verify exact HMAC signing steps on the docs HMAC page before writing signing code (use the
  `epi-hmac` form, not `hmac`).

### Query capabilities
- Each content type = a root query (`Place`, `Event`…) + generic `Content`. Use **`item`**
  (singular) for single-record lookups — much better caching.
- **Filter (`where`):** `eq`, `neq`, `gt/gte/lt/lte`, `contains`, `startsWith`, `endsWith`,
  `like`, `match` (full-text), `in`/`notIn`/`exist`, logical `_and`/`_or`/`_not`. Fields must be
  **filterable** (for `where`) and **searchable** (for `match`/`contains`) in the CMS.
- **Order:** `orderBy` ASC/DESC + `_ranking`: `RELEVANCE` (BM25 default) / `SEMANTIC` / `DOC`.
- **Pagination:** `skip`/`limit` (default 20, max 100); results capped at **top 10,000** — use
  **cursor** (state lives 10 min; sort by `_ranking: DOC`, project ≥1 field) for larger sets.
- **Facets:** root `facets` (name + count). String/bool (`orderType`, `filters` multi-select),
  date histograms (`unit`/`value`), number `ranges`. → region, category, price, date facets.
- **Full-text:** `_fulltext` = concatenation of searchable fields; `where: { _fulltext: { match:
  $q } }`, project `_score`.

### Semantic search (the headline feature)
- Vector-embedding search matching on **meaning** — "family-friendly beach getaway" surfaces
  "kid-friendly coastal resort". Applies to searchable string fields via `contains`/`match`.
- **Enable:** `orderBy: { _ranking: SEMANTIC }`. **Tune blend:** `_semanticWeight` (default 0.2;
  higher = more meaning, negative disables). e.g. `{ _ranking: SEMANTIC, _semanticWeight: 0.4 }`.
- **28 languages** (incl. `ar`, `en`); unsupported locales silently fall back to keyword ranking.
- **Autocomplete:** root `autocomplete` field on string fields (words ≤10 chars, `limit` ≤1000).
- **Synonyms:** CSV via REST `PUT <GATEWAY>/resources/synonyms`; bi-directional
  (`beach, coast, seaside`) or uni-directional (`H2O => water`); works with `contains`/`eq`/`in`.
- **Boosting:** predicate `boost` (Int), Gaussian `decay` on dates (favor upcoming events/recent),
  numeric `factor` (blend popularity). No negative boosting.

### Localization & multisite
- **`locale` argument** on every query (`Content(locale: en)`) — also selects semantic-search
  language. **Query locales explicitly** — Graph fallback can differ from CMS behavior.
- **Multisite:** no dedicated construct — scope by a content field (e.g.
  `where: { SiteId: { eq: "..." } }`); webhook filters use a case-sensitive `siteId`.
- System fields: `_id`, `_score`, `_fulltext`, `_metadata`, `_modified`, `_link`, `_ranking`.

### Webhooks (revalidation)
- REST-managed (Basic/HMAC): `POST/GET/DELETE https://cg.optimizely.com/api/webhooks`.
- Register with `topic` (`doc.updated`, `bulk.completed`, `*.*`…) + `filters`
  (`{ "status": { "eq": "Published" } }`). Payload `bulk.completed` = sync chunk done (rebuild);
  `doc.expired` = stop-publish (purge). This is how our `/api/content/publish` route revalidates.

### Best practices & gotchas
- **Stored query templates** in prod: `?stored=true` + header `cg-stored-query: template`.
- Request only needed fields; always paginate; use variables + fragments; `item` for singles.
- Read-only + no subscriptions → webhooks/polling for freshness. Never ship app key/secret to
  browser. Semantic search only helps the 28 supported languages.

### Our semantic-search recipe (tourism site)
1. Frontend → single key. 2. Query `_ranking: SEMANTIC, _semanticWeight: 0.3–0.5` +
`_fulltext: { match: $q }`, project `_score`/`total`, pass `locale`. 3. Autocomplete on names/tags.
4. Facets: region / price ranges / date. 5. Seed bi-directional synonyms. 6. Gaussian `decay` on
event dates. 7. Webhook (`doc.updated`, `bulk.completed`, `status=Published`) → revalidation;
stored templates in prod.

**Sources:** docs — overview, get-started (CMS SaaS), authentication, hmac-auth, filter-content,
querying-examples, facets, search-content-with-graphql, cursor, semantic-search, autocomplete,
synonyms, boosting, graphql-schema, webhooks, manage-webhooks, graphql-best-practices,
known-limitations.
