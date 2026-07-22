# Visit Dubai — Optimizely SaaS CMS + Next.js Demo

> ⚠️ **Unofficial, independent demo project — for learning and showcase purposes only. Not
> affiliated with, sponsored by, or endorsed by any official tourism authority, destination
> brand, or government entity.** Built on **Optimizely SaaS CMS**, **Optimizely Graph**, and
> **Optimizely Visual Builder** with a **Next.js** frontend on Vercel. All branding here is
> **original**; imagery is **royalty-free** only (see `ASSETS.md`). Real place names/facts are
> used descriptively.

Repo: https://github.com/nikkipunjabi1/visitdubai · Hosting: Vercel (Hobby/free tier).

## Why this project exists

1. **Learn** the Optimizely SaaS stack deeply (CMS, Graph, Visual Builder, multisite,
   localization, personalization).
2. **Build** something genuinely cool — a beautiful, fast, content-rich tourism site with
   semantic search and (later) an AI trip planner powered by Claude.
3. **Share** with the Optimizely community — blog the journey, publish a module/plugin, and
   work toward **Optimizely MVP** recognition.

## What we're showcasing

- ✅ Optimizely **Graph** — GraphQL content delivery + **semantic search**
- ✅ Optimizely **Visual Builder** — on-page editing, experiences, sections, components
- ✅ **Multisite + localization** on SaaS CMS
- ✅ **Next.js** App Router best practices (RSC, ISR/on-demand revalidation, Core Web Vitals)
- ✅ A distinctive **sleek-modern-luxury** design system (not a generic AI-looking template)
- ✅ **Stakeholder preview-before-publish** — durable, shareable, login-free preview links
- ✅ **SEO on every page, server-rendered** — title/meta/OG + JSON-LD in the initial HTML
- 🔜 **AI Search** (Claude-powered) over Events / Articles / Tours / Hotels / Places
- 🔜 **AI Trip Planner** (outputs an `Itinerary`)
- 🔜 **Opal** for Arabic (AR) translation + a reusable **community module/plugin**

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/BRAINSTORM.md](docs/BRAINSTORM.md) | Vision, ideas, open questions, "what are we missing" |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phased plan from small → full site → AI features |
| [docs/SPRINTS.md](docs/SPRINTS.md) | Small credit-efficient sprints + exit checks + phase gates |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech stack, repo structure, integration patterns |
| [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md) | Content types, components, taxonomy |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Sleek-modern-luxury brand, tokens, typography, grid |
| [docs/COMPONENT-STANDARDS.md](docs/COMPONENT-STANDARDS.md) | Component best practices, Light/Dark + Full/Container display settings, grid |
| [docs/PREVIEW-WORKFLOW.md](docs/PREVIEW-WORKFLOW.md) | Stakeholder preview-before-publish workflow |
| [docs/SEO.md](docs/SEO.md) | Server-rendered SEO tags + JSON-LD requirements |
| [docs/AI-SEARCH.md](docs/AI-SEARCH.md) | AI search + trip planner (Graph semantic + Claude; no pgvector) |
| [docs/AI-PLATFORM.md](docs/AI-PLATFORM.md) | AI observability, prompt admin, guardrails, safety, scaling |
| [docs/MCP-SERVER.md](docs/MCP-SERVER.md) | "Visit Dubai Concierge" MCP server (Graph-backed tools) |
| [docs/OPTIMIZELY-RESEARCH.md](docs/OPTIMIZELY-RESEARCH.md) | Findings from official docs + reference repos |
| [docs/BLOG-PLAN.md](docs/BLOG-PLAN.md) | Community blogging cadence toward MVP |

## Status

🟡 **Phase 0 — Brainstorming & planning.** Planning docs written and grounded in the official
Optimizely docs + reference repos. **Baseline: official `@optimizely/cms-sdk`** (scaffolded via
`create-app`; the `@remkoj` demo is a reference only). Next (Phase 1): add the CMS Skills, create
the GitHub repo, scaffold the app, and get it running against the dev CMS. See
[docs/SPRINTS.md](docs/SPRINTS.md).
