# Design System — Visit Dubai

_Direction: **sleek, modern, luxury.** Think a high-end destination brand / luxury travel
magazine — restrained, confident, expensive-feeling. It must read as crafted product design,
**not** a generic AI/template look._

## Mood
Obsidian & champagne. Vast negative space. Cinematic full-bleed photography. Fine gold hairlines.
Quiet, precise typography with dramatic scale contrast. Motion is slow, weighted, deliberate.
The luxury signal comes from **restraint + craft**, not decoration.

## Anti-"AI-generated" principles (avoid the tells)
- ❌ Generic purple/blue gradients, centered-everything, three identical rounded cards.
- ❌ Inter/Roboto at default weights; drop-shadow + rounded-2xl on everything.
- ❌ Symmetric, evenly-spaced, low-contrast "safe" layouts.
- ✅ Editorial asymmetry, oversized display type, intentional overlap, full-bleed imagery.
- ✅ A palette and type system with a clear point of view (below).
- ✅ Photography as the hero; UI recedes. Gold used sparingly as an accent, never filled areas.

## Palette (sleek-modern-luxury)
| Token | Value (draft) | Use |
|-------|---------------|-----|
| `--obsidian` | `#0B0B0D` | primary dark ground / hero overlays |
| `--ink` | `#16171A` | dark surfaces |
| `--porcelain` | `#F7F5F1` | light background (warm off-white) |
| `--mist` | `#E7E4DD` | muted surfaces, dividers |
| `--champagne` | `#C9A96A` | primary accent (gold), hairlines, CTAs |
| `--champagne-hi` | `#E4CE9E` | hover/highlight gold |
| `--sand-deep` | `#7A6A4F` | secondary warm neutral |
| `--desert-night` | `#12233A` | optional deep-blue accent (night desert) |
| `--text-dark` | `#111114` | text on light |
| `--text-light` | `#F5F3EE` | text on dark |

- **Light + dark both first-class.** Luxury sites lean dark for hero/immersive sections and light
  for editorial reading. Ensure **WCAG AA** contrast in both; gold text only at large sizes or on
  dark grounds (gold-on-white fails contrast for body).

## Typography
- **Display:** an elegant high-contrast serif *or* a refined grotesk — candidates:
  *Canela / Ogg*-style serif, or *PP Editorial*, or a characterful grotesk like *Söhne*/*Neue
  Montreal*. Tight leading, slightly negative tracking, dramatic sizes.
- **Body:** a clean, quiet workhorse — *Söhne*, *Geist*, or *General Sans* — comfortable ~66ch.
- **Eyebrow/caption:** small, uppercase, wide tracking, gold or muted.
- Fluid scale via `clamp()`. Self-host via `next/font` (no layout shift). Confirm license for any
  non-free typeface, or use excellent free equivalents (e.g. *Fraunces* display + *Geist* body).

## Layout & grid (contract — see COMPONENT-STANDARDS.md §4)
- **Base unit 8px**; all spacing = multiples of 8 (4px only for hairline/optical).
- **12-column** editorial grid. Gutter **24px** desktop / **16px** ≤ md.
- **Container** (`contained`) = **max 1240px** + side padding 24→40→64px; **`full`** = 100vw.
- **Breakpoints:** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
- **Asymmetric feature spans** (7/5, 8/4) on `lg+`; stack on mobile. Immersive full-bleed bands
  alternate with contained editorial columns; hero imagery may break the grid.
- One `<Container>` + `<Grid>` primitive pair; a `<SectionShell>` applies theme/width/spacing
  from Visual Builder `layoutProps`. Components never hand-roll width/theme.

## Components (visual language)
- **Hero:** full-bleed cinematic image, obsidian scrim, oversized display headline, thin gold
  divider, floating luxury search.
- **Cards:** image-forward, almost no chrome; gold eyebrow (category), strong title, hairline meta
  row. No heavy shadows.
- **Buttons:** primary = champagne on obsidian (or outline-gold on light); generous hit areas;
  subtle, weighted hover.
- **Search:** prominent, refined — the entry point to semantic search later.
- **Motion:** slow parallax on hero, gentle scroll reveals, easing that feels weighted. Never busy.

## Implementation
- **Tailwind CSS** custom theme mapping the tokens to `theme.extend` (replace demo defaults).
- **CSS variables** for tokens (light/dark + future Visual Builder display settings).
- Respect Visual Builder display/style settings where the SDK exposes them (`layoutProps`).
- Use the **`anthropic-skills:frontend-design` skill** when implementing to push past defaults.

## Deliverables (Phase 2)
- [ ] `globals` CSS variables (light + dark)
- [ ] `tailwind.config` theme extension
- [ ] `/styleguide` route (type + color + components)
- [ ] Core components: Hero, Card, Button, Nav, Footer, SearchBar — all in the luxury language
- [ ] Original **"Visit Dubai" wordmark** (not the official logo) + favicon
