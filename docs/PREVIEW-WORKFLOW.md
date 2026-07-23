# Stakeholder Preview & Publish Workflow

_Standard requirement: authors must be able to **share a link to unpublished content** (a new
page, or new/edited components on a page) with stakeholders **before** it goes live. Stakeholders
review via the link; once approved, the author publishes and it appears live._

This is a first-class feature of This is Dubai — and a strong **community-module / MVP** candidate,
because Optimizely SaaS CMS does **not** ship a durable, login-free, shareable preview link out of
the box (its built-in preview token is short-lived, ~5 min, tied to the editor session).

---

## The two layers of preview

### Layer 1 — Built-in on-page editing preview (works out of the box)
- The CMS editor iframes our app at `/preview?key=…&ver=…&loc=…&ctx=edit&preview_token=…`.
- The `preview_token` (~5 min, refreshed on save) authorizes Graph to return the **draft
  version**; the `communicationinjector.js` script bridges edits live.
- ✅ Great for the **author** while editing. ❌ Not shareable with external stakeholders (token
  expires fast, requires the editor context). Comes free with the forked baseline.

### Layer 2 — Durable, shareable stakeholder preview links (we build this)
The thing you actually asked for. A link an author generates and sends to a stakeholder who has
**no CMS login**, that stays valid for a chosen window (e.g. 7 days) and always shows the
**current unpublished draft** of that content.

**How it works:**
1. **Generate a signed link.** A route `/api/preview/share` (author-triggered) mints a **signed
   token** (JWT/HMAC, server-side secret) encoding `{ contentKey, version | "latest-draft",
   locale, exp }`. Returns a URL like:
   `https://this-is-dubai.vercel.app/preview/share?token=<signed>`.
2. **Stakeholder opens the link.** The `/preview/share` route:
   - verifies the signed token (rejects expired/tampered) — no CMS auth needed by the viewer;
   - enables **Next.js Draft Mode** (sets the draft cookie) and redirects to the content's path;
   - the page, in draft mode, fetches that **specific draft version** from **Optimizely Graph
     using server-side HMAC/app-key + `client.enablePreview()`** (super-user can read unpublished).
3. **Rendering.** Draft-mode pages render **dynamically** (`force-dynamic`, no cache) so the
   stakeholder always sees the latest saved draft, including new/edited components. A subtle
   "PREVIEW — not yet published" banner is shown.
4. **Approve → Publish.** Author publishes in the CMS → the Graph **publish webhook** hits
   `/api/content/publish` → `revalidatePath` → the live (non-preview) URL now shows the content.
   The preview link then simply matches live.

**Why this is safe:** the viewer never gets Graph credentials; the signed token only unlocks
draft rendering of one content item for a limited time. The Graph secret/app-key stays
**server-side only**.

---

## Key design decisions
- **Token signing:** HMAC-signed (or JWT) with a server secret (`PREVIEW_SIGNING_SECRET`), short
  default TTL, explicit `contentKey`+`locale` scope (a link previews only its item).
- **Version targeting:** default to "latest draft" so re-edits after sharing stay visible without
  reissuing the link; optionally pin a version for a frozen snapshot.
- **New pages not yet routable:** a brand-new page may not have a public URL yet. The preview
  route renders by `contentKey` directly (via `getContentById`), so it works before first publish.
- **Access hardening (optional):** add a light gate (link + optional passphrase) if stakeholders
  are external; log link generation for auditability.
- **Revalidation on publish:** already handled by the baseline's `createPublishApi` +
  `opti-graph webhook:create`; we confirm `optimizePublish` targets the right paths.

## Vercel free-tier notes
- Draft Mode + dynamic rendering + serverless routes all work on **Hobby (free)**.
- Every git push already gets a **Vercel deployment preview URL** — useful for *code* review, but
  distinct from *content* preview (Layer 2 above). Don't conflate them for stakeholders.
- Hobby is non-commercial use; a learning/demo tourism site qualifies. Watch function
  execution/bandwidth limits (fine for this scale). No cron/queue needed for this feature.

## Build phase
Implemented in **Phase 3** (after the site + content model exist), but the route + draft-mode
scaffolding is stubbed in **Phase 1/2** since the baseline already has `/preview`. This is the
**#1 module/blog candidate** — see BLOG-PLAN.md and ROADMAP Phase 5.

## To validate against the live CMS in Phase 1
- Exact SDK calls to fetch a **specific draft version** via HMAC + `enablePreview()`
  (`getContentById` shape in `@remkoj/optimizely-cms-nextjs`).
- Whether the SaaS CMS "Applications" preview-URL config can point at our `/preview/share`
  generator, or whether we drive link generation entirely from our own admin UI/route.
- Content **status/versioning** model (Draft → Ready/In-review → Published) and whether we key the
  shareable link off "Ready for review" status.
