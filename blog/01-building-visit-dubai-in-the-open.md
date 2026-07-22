---
title: "Building Visit Dubai in the Open: A Learning Project on Optimizely SaaS CMS"
status: draft
audience: Optimizely community / dev.to / LinkedIn (long-form)
author: Nikki Punjabi
tags: [optimizely, saas-cms, optimizely-graph, visual-builder, nextjs, headless]
---

> **Draft for your review.** Edit the voice/details freely before publishing. A short LinkedIn
> variant can be spun off from the intro + "what I'll be sharing" section.

> ⚠️ _This is an independent, unofficial learning project — for learning and showcase purposes
> only. It is not affiliated with, sponsored by, or endorsed by any official tourism authority,
> destination brand, or government entity. It uses an original wordmark and royalty-free imagery only._

## Why I'm doing this in public

I've decided to build a full, production-shaped website on **Optimizely SaaS CMS** — and document
every step of it in the open.

The project is **"Visit Dubai"**: an unofficial, demo destination-marketing site inspired by the
kind of rich, content-heavy tourism experiences we all know. Places to visit, events, guides,
tours, hotels — the sort of site where content modeling, search, and editorial design actually
matter.

I'm doing it for three reasons:

1. **To learn the modern Optimizely SaaS stack deeply** — not from slides, but by shipping.
2. **To build something genuinely cool** — semantic search, a slick editor experience, and later
   some AI features I'm excited about.
3. **To give back to the community** — sharing what works, what breaks, and the reusable bits,
   as I work toward becoming an **Optimizely MVP**.

Building in the open keeps me honest, and hopefully the write-ups save someone else a few hours.

## The stack

Here's what Visit Dubai is built on:

- **Optimizely SaaS CMS** — the headless, cloud-native CMS.
- **Optimizely Graph** — the GraphQL content-delivery layer, with **semantic search** (this is
  the feature I'm most keen to show off).
- **Optimizely Visual Builder** — drag-and-drop composition and on-page editing for authors.
- **The official `@optimizely/cms-sdk`** — Optimizely's first-party TypeScript SDK, with
  code-first content modeling and a CLI that syncs your types straight to the CMS.
- **Next.js (App Router)** on **Vercel** — server components, great SEO, fast.

One early decision worth mentioning: I started out planning to fork a community demo (built on a
well-known community SDK), but pivoted to the **official SDK** once I realized Optimizely now ships
**Agent Skills** for it — small, installable guides that teach an AI coding assistant how to model
content types, generate components, and set up live preview the "Optimizely way." Aligning with
the first-party tooling felt like the more future-proof foundation. (More on those skills in a
later post.)

## What I'll be sharing along the way

Rather than one big reveal, I'm shipping in small phases and writing up each one. On the roadmap:

- **Content modeling for Visual Builder** — the difference between pages, experiences, sections,
  and components, and how to model them so authors get a clean drag-and-drop experience with
  proper **display settings** (light/dark, full-width vs. contained).
- **Semantic search with Optimizely Graph** — going beyond keyword matching so "family-friendly
  beach day" surfaces the right content even when those exact words aren't on the page.
- **Shareable stakeholder previews** — a durable, login-free preview link an editor can send to
  stakeholders *before* publishing, with a proper approve-then-publish flow. (This one isn't
  handled out of the box, so it may become a reusable module.)
- **SEO done right** — server-rendered titles, meta, and JSON-LD structured data on *every* page.
- **AI features, later** — an AI-powered search and an AI trip planner, grounded in the CMS
  content, plus exploring **Opal** for Arabic localization.

## Doing it responsibly

Because this is public and I want to open-source it, I'm being deliberate about assets: original
branding, royalty-free imagery only, and a clear "unofficial demo" disclaimer. Real place names
and facts are fair game; someone else's logo and photo library are not. If you're building your
own portfolio clone, I'd encourage the same.

## How I'm working

- **Small sprints**, each ending in something deployable.
- **Everything on GitHub**, with a proper branch → pull request → review → merge flow.
- **A blog post at each meaningful milestone** — especially when something is new, something broke
  and I fixed it, or I extracted something reusable.

## Follow along

I'll link the repo and live demo as they come online. If you're working with Optimizely SaaS —
or thinking about it — I'd love your feedback, corrections, and ideas as I go. That's the whole
point of building in the open.

Next up: scaffolding the app with the official SDK and getting Visual Builder + live preview
working end-to-end. I'll report back on what was smooth and what wasn't.

_Onwards._ 🏜️
