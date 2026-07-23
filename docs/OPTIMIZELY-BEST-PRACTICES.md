# Optimizely SaaS CMS — Website Development Best Practices

_A practical playbook for building a Next.js website on Optimizely SaaS CMS + Graph + Visual
Builder with the official `@optimizely/cms-sdk`. Distilled from the official docs, the CMS Skills,
and hard-won lessons on this project. Pairs with ARCHITECTURE.md, CONTENT-MODEL.md,
COMPONENT-STANDARDS.md, SEO.md, PREVIEW-WORKFLOW.md, QUALITY.md._

## 1. Project & SDK setup
- Use the **official `@optimizely/cms-sdk`** (+ `@optimizely/cms-cli`) — first-party, code-first,
  and what the CMS Agent Skills target. **Node 22+.**
- Keep the app **latest** but green: track newest versions, hold a major back only when the
  toolchain doesn't support it yet, and document why (see §12 gotchas: TS 7 / ESLint 10).
- One place for client config (`config({ apiKey, graphUrl })`); import it wherever `getClient()`
  is used (root layout + any standalone route like `robots.ts`).

## 2. Content modeling
- **Model deliberately, up front** — re-modeling after content exists triggers *breaking* pushes.
- Base types: `_page` (routable), `_experience` (Visual Builder canvas), `_component` (blocks +
  data records), `_folder`, `_image`/`_media`/`_video`.
- **Contracts** (`contract()`) for reusable property sets (e.g. `SeoMetadata`) → `extends` on
  every page. DRY + consistent.
- **Taxonomy is foundational** — make it faceted + hierarchical (a `dimension` discriminator,
  a `_self` parent, plus `synonyms`/`description`). It powers filtering **and** AI/semantic search.
- Mark fields **`indexingType: 'searchable'`** (for `match`/`contains`) and filterable as needed —
  Graph can only query what's indexed.
- Group fields (`group: 'content' | 'seo' | …`) and set `sortOrder` for a clean editor UI. Note:
  `content` is a **read-only system group** — don't redeclare it in `propertyGroups`.
- References: base types as **strings** (`['_image']`); custom types as **object refs**
  (`[AreaContentType]`) — and import them. Single ref = `contentReference`; list = `array` of
  `{ type: 'content', allowedTypes: [...] }`.

## 3. Visual Builder & display templates
- **Experience** = routable VB canvas (composition of nodes). **Section** = a band; **Element** =
  a leaf block. Flag components with `compositionBehaviors: ['sectionEnabled', 'elementEnabled']`.
- Put **layout/presentation choices in display templates** (`select`/`checkbox`), not content
  fields. Author picks arrive as `displaySettings` on the component.
- **One shared default display template** (bound to `baseType: '_component'`) is a clean way to
  give every block the same **Theme (Light/Dark)** + **Width (Full/Contained)** + spacing controls.
- Keep theme/width on **sections** (children inherit) + a few banner components; don't bloat every
  leaf. Route all of it through a single `<SectionShell>` primitive — components never hand-roll
  width/theming.
- Register in all three: `initContentTypeRegistry`, `initReactComponentRegistry` (resolver key =
  content-type key; display-template variants via `tags`), `initDisplayTemplateRegistry`.

## 4. Optimizely Graph (delivery)
- **Two credentials, two worlds:** public **single key** (`?auth=…`, published-only, frontend-safe)
  vs **app key + secret** (HMAC, server-only, drafts/preview, super-user). Never ship the secret.
- Query custom types by key **without** the `_` prefix (`PointOfInterest`, not `_PointOfInterest`);
  system types use `_` (`_Page`, `_Content`).
- Use **`item`** (singular) for single-record lookups (better caching); paginate lists; use
  **cursor** beyond 10k; project only needed fields; use variables + fragments.
- **Semantic search** is built in — `orderBy: { _ranking: SEMANTIC, _semanticWeight: 0.3–0.5 }` +
  `_fulltext: { match: $q }`. No external vector DB needed for CMS content. Add facets, synonyms,
  and Gaussian date-decay for relevance.
- **Stored query templates** (`?stored=true`) in production for repeated shapes.
- **Latency:** content sync 5–15 min scheduled / 1–3 s event-driven; **schema changes take minutes
  to propagate** — don't query a brand-new type immediately.

## 5. Rendering (Next.js App Router)
- Server components by default; `"use client"` only for real interactivity.
- Content pages: `getClient().getContentByPath(path)` → `<OptimizelyComponent content={…} />`.
  Experiences: `<OptimizelyComposition nodes={…} />`.
- Use the SDK's **preview utils** (`getPreviewUtils` → `pa()`) on editable props so on-page editing
  works; `RichText` for rich text; `next/image` + `damAssets`/`src` for images.
- **Guard every server-side fetch** (`try/catch`) so a Graph hiccup degrades gracefully (fallback
  UI / fail-closed), and the build succeeds without secrets.

## 6. Preview & publishing
- **Live preview** needs the app on **HTTPS** (CMS iframes it). Configure an **Application** in the
  CMS (host + `usePreviewTokens`); default preview URL `{host}/preview?key=…&ver=…&loc=…&ctx=…`.
- Preview tokens are short-lived (~5 min); the CMS `communicationinjector.js` bridges edits.
- For **stakeholder sign-off before publish**, build durable, login-free, signed preview links
  (Next Draft Mode + server-side HMAC) — not shipped by the CMS. See PREVIEW-WORKFLOW.md.
- **On publish → revalidate:** register a Graph webhook (`doc.updated`/`bulk.completed`,
  `status=Published`) → a route that calls `revalidatePath`/`revalidateTag`. ISR stays fresh.

## 7. SEO (server-rendered, every page)
- `generateMetadata()` on every route — title/description/canonical/OG/Twitter in the **initial
  HTML**, never client-only.
- **Global title template from CMS settings:** root layout sets `title.template` from a
  `SiteSettings` singleton → rebrand in **one publish**. Gotcha: the template does **not** wrap the
  **root page** (same route segment) — build its title explicitly with the same settings.
- **JSON-LD** per type (`TouristAttraction`, `Event`, `Hotel`, `Article`, `BreadcrumbList`,
  `Organization`) in a server `<JsonLd>` component. `hreflang` for locales. Dynamic OG images.
- **Robots fail-closed:** a global CMS switch (default OFF) + `robots.txt` that disallows all until
  indexing is explicitly enabled; per-page `noindex`/`nofollow`. Keeps demos out of search.

## 8. Performance (Core Web Vitals)
- `next/image` for all imagery; `remotePatterns` for the CMS/DAM host.
- ISR + on-demand revalidation (webhook) over SSR-on-every-request; cache Graph responses; stored
  query templates. Budget with Lighthouse CI (QUALITY.md).
- Self-host fonts via `next/font`; avoid layout shift; stream with RSC.

## 9. Security
- Secrets **server-side only**; the Graph **single key** is the only browser-safe credential.
- CLI/API keys are **least-privilege**: our key pushes *types* but is **Forbidden from creating
  content instances/apps** — content authoring is a CMS-UI (or scoped-key) activity, by design.
- CSP must allow the CMS origin to iframe the app + load the injector for preview.
- Never put PII in URLs/logs; hash session ids; `.env` is gitignored (`.env.example` documents keys).

## 10. Environments & config workflow
- `optimizely-cms-cli login` (verifies env creds) → `config push` (sync types) / `config pull`
  (snapshot). Scope the `components` glob so only *your* types are pushed.
- **Breaking changes** (e.g. adding a required field to an existing type) need `--force` — safe
  when there's no content, careful when there is (data loss). `config pull --json` first as backup.
- Every env-var change → redeploy.

## 11. Dev workflow & quality (all free/OSS)
- Trunk-based Git: short-lived branch → PR → review → **squash-merge**; Conventional Commits.
- **CI gates** (GitHub Actions): type-check + lint + unit tests + build on every PR.
- **TypeScript** strict, **ESLint** (flat config), **Prettier**, **Vitest** for pure logic,
  **Playwright + axe + Lighthouse** as pages appear, **Dependabot** for updates. See QUALITY.md.
- Keep secrets out of CI; the build must fail closed without them.

## 12. Gotchas we actually hit (save yourself the time)
- **`create-app` doesn't emit `.env`** (README implies one) → add `.env.example` yourself.
- **`opti-push` script hardcoded `pnpm`** in the scaffold → fix for your package manager.
- **`next lint` was removed in Next 16** → run `eslint` directly with a native flat config.
- **TypeScript 7 / ESLint 10** aren't supported by the Next 16 toolchain yet → pin TS 5.x / ESLint
  9.x; revisit later.
- **Tailwind v4 flattens `@theme` vars** → use **`@theme inline`** for tokens that flip in dark mode.
- **`config push` can't create content instances** with a type-only API key (`Forbidden`) → author
  content in the CMS UI or use a content-scoped key / seed script.
- **Graph query field names drop the `_` for custom types** (`PointOfInterest`, not `_…`).
- **Schema propagation delay** — a just-pushed type isn't queryable in Graph for a few minutes.
- **Title template doesn't wrap the root page** (same segment as root layout) → set it explicitly.
- **Local HTTPS:** `next dev --experimental-https` needs a trusted local CA — run `mkcert -install`
  once (it needs your keychain password) or the cert step fails and falls back to HTTP (breaks preview).
- **Registry ↔ CMS drift breaks preview.** The React registry must *mirror* the CMS model. A type
  registered locally but **deleted from Graph** makes the generated delivery/preview query fail
  (`GraphContentResponseError: HTTP 400: N errors in the GraphQL query` — one per stale type). A type
  **in Graph but not registered** throws `GraphMissingContentTypeError` when it's resolved. After
  cleaning a scaffold, **prune its demo types from `initContentTypeRegistry`/`initReactComponentRegistry`**
  the moment they're gone from the CMS — don't defer it. Keep the SDK system types (`BlankExperience`,
  `BlankSection`).
- **Register the image asset type (`ImageMedia`, `baseType: '_image'`).** Uploaded images get this
  concrete type, and any `contentReference` with `allowedTypes: ['_image']` (e.g. a Hero background)
  resolves to it — so it *must* be registered or preview throws `GraphMissingContentTypeError`. Give it
  **empty `properties: {}`**: the SDK auto-selects `_assetMetadata`/`_imageMetadata`, so the query stays
  valid even if the CMS asset type carries extra fields.

> These gotchas are prime blog material (BLOG-PLAN.md #2/#3) — they're exactly what the community
> searches for.
