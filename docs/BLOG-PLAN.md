# Blog & Community Plan — toward Optimizely MVP

_Goal: consistent, genuinely useful community content that documents building Visit Vela.
I (Claude) will nudge you to blog at the trigger points below — especially anything **new**, a
**challenge solved**, or a **reusable module** created._

## Why blogging matters here
Optimizely MVP is awarded for community contribution — content, code, and helping others.
A public build-in-the-open project is one of the strongest, most sustainable ways to earn it.

## Where to publish
- **Optimizely community / World** — primary (counts most toward MVP).
- **dev.to** and/or personal blog — reach + SEO.
- **LinkedIn** — short posts linking to the long-form; visibility with the Opti ecosystem.
- **GitHub repo** — the code + README is itself a contribution (template/module).

## Blogging trigger checklist (Claude will flag these)
Blog when we hit any of:
- 🆕 **Something new** — a feature/API we used that isn't well documented publicly.
- 🧩 **A challenge solved** — a setup gotcha, an integration quirk, a workaround.
- 🔧 **A reusable module** — anything extractable others could use.
- 🎯 **A phase completed** — natural milestone recap.
- 📊 **A measurable result** — perf win, search relevance improvement, experiment outcome.

## Planned posts (mapped to roadmap)
| # | Working title | Trigger | Phase |
|---|---------------|---------|-------|
| 1 | Why I'm building Visit Dubai on Optimizely SaaS (in the open) | Kickoff | 0 |
| 2 | Optimizely SaaS CMS + Visual Builder on Vercel with Next.js — setup & gotchas | Challenge | 1 |
| 2b | **Connecting a Next.js app to Optimizely CMS SaaS for live Visual Builder preview** — Application + preview tokens, local HTTPS (mkcert), and the registry-must-mirror-the-model gotcha (`13 errors in the GraphQL query` / `GraphMissingContentTypeError`) | 🧩 Challenge solved | 2 |
| 3 | Content modeling for Visual Builder: pages vs experiences vs components | New/learning | 2 |
| 4 | Server-rendered SEO + JSON-LD for every Optimizely SaaS page (Next.js) | New/learning | 2 |
| 5 | **Shareable stakeholder previews for Optimizely SaaS + Next.js** (preview-before-publish) | New (headline) | 3 |
| 6 | Semantic search with Optimizely Graph — a practical guide | New (headline) | 3 |
| 7 | EN + AR semantic search & localization on Optimizely SaaS | New/learning | 3 |
| 8 | Core Web Vitals + on-demand revalidation with Graph webhooks (Vercel free) | Result | 3 |
| 9 | Building an AI Trip Planner on Optimizely Graph + Claude | New (headline) | 4 |
| 9b | Building an Optimizely Graph **MCP server** (content as tools for any AI) | New (headline) | 4 |
| 10 | Using Optimizely Opal for Arabic translation | New/learning | 4 |
| 11 | I open-sourced a stakeholder-preview module for Optimizely SaaS — here's how | Module | 5 |
| 12 | **How to connect Optimizely CMP (Content Marketing Platform) with Optimizely SaaS CMS** — publishing/asset flow between CMP and CMS SaaS _(outline only for now; detailed write-up later)_ | New/learning | TBD |

## Post skeleton (reuse for each)
1. The problem / what I set out to do
2. Context (Optimizely SaaS + the specific feature)
3. How I did it — code, config, screenshots
4. What broke and how I fixed it (the most valuable part)
5. Result + what's next
6. Links: repo, live demo, related docs

## Cadence
Aim for **1 post per completed phase** minimum; capture drafts/outlines *as we build* (not
after) so nothing is lost. Keep a `blog/` folder of drafts in the repo.

## Assets for posts
Screenshots, short screen-recordings (the `gif_creator` browser tool is handy), and
before/after perf numbers. Keep them in `blog/assets/`.
