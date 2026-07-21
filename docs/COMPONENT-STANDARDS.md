# Component Standards — Visit Dubai

_How every Visual Builder component/section is built, registered, themed, sized, and laid out.
This is the contract; PRs that add components must satisfy it._

---

## 1. Anatomy of a component (the one-way-to-do-it)
Built with the **official `@optimizely/cms-sdk`** — content types are **code-first TypeScript**
and their React components are generated/scaffolded by the **`optimizely-model` +
`optimizely-model-react` skills**. Exact file layout/APIs come from `create-app` _(confirm at
scaffold, S1.1)_; the rules below are SDK-agnostic and binding:

- **One content type (TS) → one React component**, wired via the SDK's content-type→component
  mapping. Content types are pushed to the CMS with `optimizely-cms-cli config push`. See
  ARCHITECTURE §4/§6.
- **Display templates** (theme/width/etc., §3) are defined alongside the content type in TS and
  arrive at the component as layout props.
- Components are **presentational and pure** — content arrives typed as props; no ad-hoc fetching
  inside a leaf component (composition/data loading is the page's job).
- **Server components by default**; add `"use client"` only for genuine interactivity
  (carousels, search box, accordions).
- Always render a **graceful empty/fallback state** — preview and partially-authored content must
  never crash or render blank holes.
- **Edit-mode aware:** use the SDK's preview/edit attributes (click-to-edit) so properties are
  editable on-page in Visual Builder (the `optimizely-model-react` skill adds these).
- **Accessible & responsive per component** (semantic landmarks, alt text, focus states, keyboard
  support, fluid at every breakpoint). See §5.

> Reference: the `@remkoj` demo achieved the equivalent via co-located `*.graphql` fragments +
> a `getDataFragment()` factory registry — useful to look at, but we follow the official SDK's
> patterns, not that API.

## 2. Sections vs components — where layout options live
Best practice on Visual Builder: **theme and width are layout concerns, so they live primarily
on the Section** (the horizontal band that wraps content). Leaf components **inherit** from their
section by default. In addition, a small set of **self-contained "banner-type" components** that
are often dropped directly onto the canvas expose their own Light/Dark + Width settings.

This gives authors the control the requirement asks for **without** cluttering every leaf
component with redundant options.

## 3. Display settings (Light/Dark + Full-Width/Container)
Implemented as Optimizely **display templates** bound to a base type / content type / node type,
using the two editor kinds Visual Builder supports: **`select`** (dropdown) and **`checkbox`**.
Chosen values arrive as **`layoutProps`** on the component in the `@remkoj` SDK.

### Standard settings vocabulary (shared across the site)
| Setting | Key | Kind | Options (values) | Default |
|---------|-----|------|------------------|---------|
| Theme | `theme` | select | `inherit` · `light` · `dark` | `inherit` |
| Width | `width` | select | `contained` · `full` | `contained` |
| Vertical spacing | `spacing` | select | `none` · `compact` · `normal` · `spacious` | `normal` |
| Content alignment | `align` | select | `start` · `center` | `start` |

- `theme: inherit` → take the ancestor section's theme (or page default). `light`/`dark` force it.
- `width: full` → break out to full-bleed; `contained` → sit inside the grid container (§4).
- These map to CSS-variable scopes + Tailwind utility sets — one `<SectionShell>` /
  `<ComponentShell>` wrapper reads `layoutProps` and applies `data-theme` + width/spacing classes,
  so no component re-implements theming.

### Which types expose which options (the matrix)
"Own" = the type exposes its own display settings. "Inherit" = it takes them from its section.

| Type | Theme (Light/Dark) | Width (Full/Container) | Notes |
|------|:---:|:---:|-------|
| **Section** (layout band) | **Own** | **Own** | Primary place to set theme + width; children inherit. |
| Row / Column (nodes) | Inherit | n/a (grid spans) | Column count/spans are grid settings (§4). |
| Hero | **Own** (default `dark`) | **Own** (default `full`) | Cinematic full-bleed banner. |
| MediaBanner / ImageGallery | **Own** | **Own** (default `full`) | Edge-to-edge imagery. |
| CTABanner / Newsletter | **Own** | **Own** | Standalone promo bands. |
| StatStrip | **Own** | **Own** | Often a full-width accent band. |
| MapEmbed | Inherit | **Own** | Full or contained. |
| POICardGrid / EventCarousel / TourGrid / HotelGrid / ArticleGrid | **Own** (theme) | Inherit (default `contained`; `full` allowed for carousels) | Themeable, but width usually from section. |
| SectionHeading | Inherit | Inherit | — |
| RichText | Inherit (theme) | **Contained only** | Never full-bleed — protects reading measure (~66ch). |
| Accordion / FAQ | Inherit | Contained | — |
| Breadcrumbs | Inherit | Contained | — |
| ItineraryTimeline | **Own** (theme) | Contained | — |

> Governance: keep the **vocabulary identical** across templates (`light`/`dark`, `contained`/`full`)
> so authors learn it once. Don't invent per-component synonyms.

## 4. Grid system (frontend, from the design system)
Maps the Visual Builder section → row → column tree onto a real editorial grid. Tokens live with
the design system (DESIGN-SYSTEM.md); the numbers below are the contract.

- **Base unit:** 8px. All spacing = multiples of 8 (4px allowed for hairline/optical only).
- **Columns:** **12-column** grid. Gutter **24px** (desktop) / **16px** (≤ md).
- **Container:** `contained` width = **max 1240px** + responsive side padding
  (24px mobile → 40px → 64px desktop). `full` width = 100vw, content can still opt into an inner
  grid.
- **Breakpoints** (Tailwind-aligned): `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.
- **Column-span behavior:** VB columns declare spans; we render them as CSS Grid
  `grid-template-columns` with span mapping. Default responsive collapse: 12→ stack to 1–2 cols
  on mobile, editorial asymmetric spans (e.g. 7/5, 8/4) on `lg+`.
- **Editorial asymmetry is allowed and encouraged** — the grid supports off-balance feature spans,
  intentional overlap, and full-bleed breakouts (not just even thirds). This is a key
  anti-"AI-look" lever.
- **Implementation:** one `<Grid>` / `<Container>` primitive pair. Sections render a
  `<SectionShell>` that applies theme + width + spacing from `layoutProps`, then a `<Container>`
  (unless `full`), then the grid. Components never hand-roll container/max-width logic.

### Section render pipeline (pseudo)
```
<SectionShell theme={lp.theme} width={lp.width} spacing={lp.spacing}>  // sets data-theme, bg, py
  {lp.width === 'contained' ? <Container><Grid>…</Grid></Container>
                            : <Grid full>…</Grid>}
</SectionShell>
```

## 5. Accessibility & responsive baseline (per component)
- Semantic HTML + one logical heading order per page; sections use `<section>`/`aria-label`.
- Color contrast **WCAG AA in both light and dark** (gold accent never as body text on light).
- Full keyboard operability; visible focus (gold focus ring); respects `prefers-reduced-motion`.
- Images: `next/image`, explicit dimensions, meaningful `alt` (from `MediaAsset`).
- No fixed heights that clip content; test at 320px → 1536px.

## 6. Definition of done for a new component
- [ ] TS content type defined + `optimizely-cms-cli config push`'d; React component mapped; build clean.
- [ ] Typed layout props; exposes the correct display settings per the §3 matrix (no more/less).
- [ ] Uses `<SectionShell>`/`<Container>`/`<Grid>` — no bespoke width/theme code.
- [ ] Edit-mode attributes via `<CmsEditable>`; graceful empty state.
- [ ] Light + dark verified; responsive at all breakpoints; a11y checks pass.
- [ ] SEO/JSON-LD handled at the page level (SEO.md) — components don't duplicate it.
