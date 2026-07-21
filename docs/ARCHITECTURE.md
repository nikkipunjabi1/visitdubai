# Architecture — Visit Dubai

_Baseline: **Optimizely's official JavaScript SDK, `@optimizely/cms-sdk`**, scaffolded with
`@optimizely/cms-create-app`. The `@remkoj/*` community demo (`cms-saas-vercel-demo`) is kept as
a **reference** to crib patterns from, not forked._

> Note on precision: exact SDK function names/paths below are described at the level our research
> established. The **`optimizely-setup` skill + `create-app` scaffold produce the authoritative
> structure in Phase 1 (S1.1)** — we document exact APIs then. Anything not yet confirmed is
> marked _(confirm at scaffold)_.

## 1. Stack
- **Next.js (App Router)**, React, **TypeScript** (code-first, type-safe content modeling).
- **`@optimizely/cms-sdk`** — official SDK: content modeling, GraphQL delivery, React/Next
  rendering, rich text, DAM/assets, display templates, live preview.
- **`@optimizely/cms-cli`** — sync TS content-type definitions to the CMS (`config push`/`pull`),
  `login`, content ops.
- **`@optimizely/cms-create-app`** — scaffolder for the Next.js project.
- **Optimizely Graph** under the hood for content delivery; **Visual Builder** for composition.
- **Node.js 22+**. Deploy to **Vercel (Hobby/free)**.
- **CMS Skills** (`optimizely-setup/model/model-react/preview`) drive scaffolding, content-type
  modeling, component generation, and preview setup.

## 2. Scaffold structure (from `create-app`) _(confirm at scaffold)_
- `optimizely.config.mjs` — project config; declares the **components directory** (the model
  skill reads this to place content types).
- `optimizely.ts` — SDK client/init.
- Catch-all App Router page (e.g. `app/[[...slug]]/page.tsx`) for routable content.
- `.env` — CMS + Graph credentials (exact var names captured at scaffold).
- Content types authored in TS under the components dir; pushed to CMS via the CLI.

## 3. Official SDK packages
| Package | Role |
|---------|------|
| `@optimizely/cms-sdk` | Core: content modeling, `src/graph/` GraphQL client (createQuery, filters), `src/react/` (+ `nextjs.tsx`) rendering, rich-text, DAM, display templates, live preview |
| `@optimizely/cms-cli` (dev) | `optimizely-cms-cli` — `login`, `config push`/`config pull` to sync TS content types ↔ CMS |
| `@optimizely/cms-create-app` | `cms-create-app` — scaffolds the Next.js project + config |

## 4. Content modeling (code-first)
- Content types, **display templates**, and contracts are defined in **TypeScript** (driven by the
  **`optimizely-model` skill**), then **pushed to the CMS** with `optimizely-cms-cli config push`
  (pull to reconcile CMS-side changes).
- Our types (CONTENT-MODEL.md): PointOfInterest, Event, Article, Tour, Hotel, Area, Itinerary,
  Category, SeoMetadata + listing/home pages.
- **Display templates** encode the Light/Dark + Full-Width/Container settings (COMPONENT-STANDARDS.md).

## 5. Content delivery via Optimizely Graph
- The SDK's GraphQL client queries **Optimizely Graph** (all of OPTIMIZELY-RESEARCH.md §B applies:
  filtering, facets, pagination, **semantic search**, autocomplete, synonyms, boosting, webhooks).
- **Two credentials:** public **single key** (frontend, published only) vs **app key + secret**
  (server-only, drafts/preview, super-user). Never ship the secret to the browser.
- Semantic search recipe unchanged: `orderBy: { _ranking: SEMANTIC, _semanticWeight: 0.3–0.5 }` +
  `_fulltext: { match: $q }`. We may query via the SDK client or a thin direct-GraphQL layer where
  we need semantic/facet features _(confirm SDK coverage at scaffold)_.

## 6. React/Next rendering + component mapping
- The SDK renders content types → React components (server + client), with a mapping between CMS
  types and components _(the `optimizely-model-react` skill generates these, incl. preview
  attributes + rich-text)_.
- **Component standards are binding** — anatomy, the Light/Dark + Full-Width/Container display-
  settings matrix, the 12-col grid, and the `<SectionShell>`/`<Container>`/`<Grid>` primitives are
  in COMPONENT-STANDARDS.md. Theme/width live on **Sections** (children inherit) + banner-type
  components; no component hand-rolls width/theming. Display-template values arrive as layout props.

## 7. Live preview / on-page editing (Visual Builder)
- The SDK provides **live preview / click-to-edit** for React (the **`optimizely-preview` skill**
  sets this up + debugs blank-screen/communication issues).
- Concepts from research still hold: CMS iframes the app at a preview route, a short-lived preview
  token authorizes draft content via Graph, a communication script bridges edits, and edit-overlay
  attributes make properties clickable. Exact SDK API _(confirm at scaffold)_.

## 8. Environment & secrets
- CMS URL + credentials in `.env` (exact names at scaffold) — includes a public **Graph single
  key** (frontend-safe) and server-only **app key + secret**.
- Additional: `PREVIEW_SIGNING_SECRET` (§9), later `ANTHROPIC_API_KEY` (Phase 4) — server scope
  only, never `NEXT_PUBLIC_*`.

## 9. Stakeholder preview-before-publish (see PREVIEW-WORKFLOW.md)
- **Layer 1:** the SDK's built-in live preview for the author (short-lived token).
- **Layer 2 (we build):** durable, login-free, shareable links. `/api/preview/share` mints an
  HMAC/JWT-signed token (`PREVIEW_SIGNING_SECRET`) scoped to `{contentKey, locale, exp}`; opening
  `/preview/share?token=…` verifies it, enables **Next Draft Mode**, and renders the draft version
  via **Graph app-key/HMAC** (server-side super-user). Draft pages are `force-dynamic` +
  `robots: noindex` with a "PREVIEW" banner. Publish → webhook → `revalidatePath` → live.

## 10. SEO rendering (see SEO.md)
- Every route: server-side `generateMetadata()` via a shared `buildMetadata(content, fallbacks)`
  (never blank); `hreflang` when AR lands.
- **JSON-LD** in the initial HTML via a server `<JsonLd>` component (`buildJsonLd(content)` →
  schema.org per type). Per-page `opengraph-image`. CI check asserts title + description + ≥1
  JSON-LD block on key routes.

## 11. Revalidation / webhooks
- Register an Optimizely Graph webhook (`doc.updated`, `bulk.completed`, `status=Published`) → a
  Next route handler → `revalidatePath`/`revalidateTag`. Keeps ISR fresh on publish.

## 12. Vercel free (Hobby) tier
- App Router SSR/ISR/RSC, Draft Mode, dynamic routes, serverless functions, per-push deploy
  previews all work. Non-commercial use (demo qualifies). Watch function time + bandwidth limits.
  Secrets in Vercel env vars (server scope).

## 13. What we crib from the `@remkoj` demo (reference only)
- The demo's **Visual Builder node-tree rendering**, **component-registry** organization, publish
  webhook route, and middleware patterns are useful references — we reimplement equivalents on the
  official SDK rather than copying `@remkoj` code.

## 14. AI services (Phase 4, planned)
- Next.js route handlers under `app/api/ai/*` call the Anthropic API **server-side**. Retrieval:
  Graph semantic query → context → Claude → structured card/itinerary JSON → render with existing
  components (AI Search + Trip Planner → `Itinerary`). Opal for AR translation (Phase 4, guided).
