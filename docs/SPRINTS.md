# Sprints — Visit Dubai

_Small, credit-efficient sprints. Each sprint has a single clear goal, a short task list, a
concrete **deliverable**, and an **exit check**. **I always ask before starting a new phase.**_

## Credit discipline (how we keep cost low)
- One sprint at a time; stop at the exit check and summarize briefly.
- Reuse the research/docs already produced — no re-fetching what we know.
- Targeted edits over full rewrites; batch independent work; avoid redundant re-reads.
- Detail the **current + next** sprint; keep later sprints as light headlines until they're up.
- Verify with the cheapest sufficient check (typecheck/lint/one query) before moving on.
- **Effort tags:** 🟢 small · 🟡 medium · 🔴 large (large sprints get split further when reached).

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · 🚦 = phase gate (I ask you before starting).

---

## Phase 0 — Foundations 🟢 (planning)
- [x] Kickoff decisions, research, and the full planning doc set.
- [x] SDK decision: **official `@optimizely/cms-sdk`** (demo = reference); skills via marketplace.
- [ ] **S0.1** Draft blog post #1 outline ("building in the open"). 🟢
- [ ] **S0.2** Add the **Optimizely CMS Skills** (user runs in interactive Claude Code):
  `/plugin marketplace add episerver/content-js-sdk` →
  `/plugin install optimizely-cms-skills@episerver-content-js-sdk`. Prereq: Node 22+. 🟢

## 🚦 Phase 1 — Scaffold & baseline running  _(ask before starting)_
Goal: a fresh official-SDK Next.js app runs locally against your dev CMS and deploys to Vercel,
with Visual Builder + live preview confirmed working — **before** we add Visit Dubai specifics.

- [ ] **S1.1 — Scaffold with the official SDK** 🟡
  Tasks: use the **`optimizely-setup` skill** → `@optimizely/cms-create-app` to scaffold into the
  repo `github.com/nikkipunjabi1/visitdubai` (you create the empty repo; I scaffold locally, you
  push). Installs `@optimizely/cms-sdk` + `@optimizely/cms-cli`; creates `optimizely.config.mjs`,
  `optimizely.ts`, catch-all page, `.env` template. Deliverable: app installs + builds. Exit:
  `npm run build` + typecheck clean. **Document the real scaffold structure back into ARCHITECTURE.md.**
- [ ] **S1.2 — Connect CMS + Graph** 🟢
  Tasks: you fill `.env` with dev-CMS credentials; `optimizely-cms-cli login`; run dev; one real
  Graph query. Deliverable: local app renders content from your dev CMS. Exit: a page loads real
  CMS data; a Graph query returns items.
- [ ] **S1.3 — Verify Visual Builder + live preview** 🟡
  Tasks: use the **`optimizely-preview` skill**; configure the CMS Application → preview at local
  HTTPS; confirm click-to-edit. Deliverable: editing content in CMS shows in preview. Exit: live
  preview refresh works; no blank-screen/communication/CSP errors.
- [ ] **S1.4 — Deploy to Vercel** 🟢
  Tasks: import repo to Vercel (Hobby); set env vars; deploy; wire the Graph publish webhook →
  revalidation route. Deliverable: prod + preview URLs live. Exit: a publish in CMS revalidates
  the live page.
- [ ] **S1.5 — Blog #2 outline** (official-SDK setup & gotchas). 🟢
- 🏁 Phase-1 done = official-SDK baseline verified end-to-end + deployed; ARCHITECTURE.md updated
  with the real scaffold + SDK APIs.

## 🚦 Phase 2 — Content model + multi-page site  _(ask before starting)_
Goal: Visit Dubai content types, the luxury design system, and all page templates — a real
multi-page site. 🔴 → split into these sprints:

- [ ] **S2.1 — Design foundation + layout primitives** 🟡
  Tokens (light/dark), Tailwind theme, `next/font`, `<SectionShell>`/`<Container>`/`<Grid>`,
  original wordmark, `/styleguide`. Exit: styleguide renders; grid + theming primitives work.
- [ ] **S2.2 — Content types (data) in CMS** 🟡
  PointOfInterest, Event, Article, Tour, Hotel, Area, Itinerary, Category, SeoMetadata (per
  CONTENT-MODEL.md). Exit: types exist; sample item queryable in Graph.
- [ ] **S2.3 — VB sections + first components + display templates** 🟡
  `<SectionShell>` display settings (theme/width/spacing), Hero, SectionHeading, POICardGrid,
  RichText — per COMPONENT-STANDARDS.md matrix. Exit: components editable in VB with Light/Dark +
  Full/Container working.
- [ ] **S2.4 — Home page experience** 🟡
- [ ] **S2.5 — Listing pages + faceting** (Places/Events/Articles/Tours/Hotels) 🟡
- [ ] **S2.6 — Detail pages** per type 🟡
- [ ] **S2.7 — SEO helpers** (`buildMetadata`, `buildJsonLd`, sitemap, OG images) per SEO.md 🟡
- [ ] **S2.8 — Seed content + royalty-free imagery + `ASSETS.md`** 🟡
- [ ] **S2.9 — Blog #3 + #4 outlines** (content modeling; SEO/JSON-LD) 🟢
- 🏁 Phase-2 done = full site renders from CMS, styled, SEO on every page.

## 🚦 Phase 3 — Optimizely superpowers  _(ask before starting)_
- [ ] **S3.1 — Stakeholder preview-link module** (the headline feature) 🔴
- [ ] **S3.2 — Semantic search** (autocomplete, synonyms, boosting, facets) 🔴
- [ ] **S3.3 — AR semantic search + localization showcase** 🟡
- [ ] **S3.4 — Performance + accessibility pass** (CWV, images, a11y) 🟡
- [ ] (optional) **S3.5 — Multisite** 🟡
- 🏁 + Blog #5–#8 outlines.

## 🚦 Phase 4 — AI features (Claude)  _(ask before starting)_
- [ ] **S4.1 — AI Search** (Graph retrieval → Claude → cards) 🔴
- [ ] **S4.2 — AI Trip Planner** (→ `Itinerary`) 🔴
- [ ] **S4.3 — Opal for Arabic translation** (guided) 🟡

## 🚦 Phase 5 — Give back / MVP  _(ask before starting)_
- [ ] **S5.1 — Extract + open-source the preview-link module** 🔴
- [ ] **S5.2 — Publish + MVP retrospective post** 🟢

---

### Sprint ritual
Start: restate the sprint goal + task list. End: run the exit check, summarize what shipped +
what's next, flag any blog trigger, then **stop and ask** before the next sprint/phase.
