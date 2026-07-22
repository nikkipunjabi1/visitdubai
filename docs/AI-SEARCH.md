# AI Search & Trip Planner — Architecture (Phase 4)

_Retrieval + generation design for the Claude-powered features. Companion: AI-PLATFORM.md
(observability, prompt management, guardrails, safety, scalability)._

## Headline decision: **no separate vector DB for CMS content**
**Optimizely Graph already provides semantic (vector) search** (`orderBy: { _ranking: SEMANTIC }`,
`_semanticWeight`). For content that lives in the CMS (restaurants/POIs, news, events, articles),
**Graph *is* our vector search.** Adding Supabase pgvector to search CMS content would duplicate
this and force a second index kept in sync with Graph — avoid it. Showcasing Graph's semantic
power is a project goal, so we lean into it.

## A query is not one thing — decompose it
Example: *"nearest Michelin-star restaurant"* → three distinct capabilities:

| Part | Capability | Handled by |
|------|-----------|-----------|
| "Michelin-star restaurant" (meaning) | **Semantic search** | **Optimizely Graph** (`_ranking: SEMANTIC` + synonyms) |
| "nearest" (proximity) | **Geospatial** — *not* vectors | **App layer** — Graph returns each POI's lat/lng; we compute distance (Haversine) from the user's location and sort |
| "restaurants + news + other info" | **Multi-type retrieval + facets** | **Graph** — federated query across `PointOfInterest`, `Article`/News, `Event` |

> Key insight: **"nearest" is geo, not semantic** — a vector DB wouldn't help. Graph gives the
> semantically-relevant candidate set + coordinates; the API route ranks by distance.

## Flow: retrieval (Graph) → generation (Claude)
```
User query + location
  → (optional) Claude: parse intent → { entities, keywords, filters, location }
  → Optimizely Graph: semantic + faceted query across POI / News / Events → candidates (lat/lng, categories, _score)
  → App (Next.js route /api/ai/search): compute distance, sort "nearest", assemble grounded context
  → Claude: generate (a) creative card copy per result, (b) 3 follow-up questions
            grounded in the query + the ACTUAL facets/related data returned
  → Frontend: render rich cards (restaurant + related news + info) + 3 clickable follow-ups
```
- **Graph = retrieval. Claude = reasoning/generation.** Claude never invents data — it only
  phrases/curates what Graph returns → cards stay grounded, hallucination stays low.
- **The 3 follow-ups are grounded**: generated from real available facets (categories, areas,
  "open now", nearby events) so each maps to a real query returning real results — e.g. "Only
  ones open now?", "Michelin restaurants in [nearby area]?", "Events near [restaurant] this weekend?"
- **Creative card** = a structured JSON card model Claude fills from retrieved data, rendered by
  our design-system card components (COMPONENT-STANDARDS.md).

## AI Trip Planner (same spine)
Constraints (dates/interests/budget/pace) → Graph retrieval (POI/Event/Tour/Hotel, semantic +
facet + geo) → Claude assembles a day-by-day plan → output written as an **`Itinerary`** content
type (CONTENT-MODEL.md), shareable.

## Content-model implications (already mostly covered)
- `PointOfInterest` has **geo (lat/lng)** + `categories` ✓ → add an **accolades/rating** field or
  a "Michelin" `Category` for restaurants.
- `Article` (news) + `Event` exist ✓ → multi-type results work out of the box.
- Ensure fields used for search are marked **searchable/filterable** in the CMS (Graph requirement).

## When pgvector (or another vector DB) *would* earn its place — later, if ever
- Ingesting data **not in the CMS** (external reviews, PDFs, a large knowledge base) → embed those.
- **Conversational memory** (embedding chat history for retrieval).
- Hybrid retrieval logic Graph can't express.
Until one of those is real, **Graph semantic search + app-side geo + Claude** is the right,
simpler, cheaper, lower-latency stack.

## Implementation notes (Phase 4)
- Server-only Next.js route handlers under `app/api/ai/*`; `ANTHROPIC_API_KEY` server-scope only.
- Use **structured outputs** (tool/JSON schema) so card + follow-up payloads are always valid.
- **Stream** responses for perceived speed; cache hot queries.
- Gate the feature behind **Optimizely Feature Experimentation** to roll out / A-B safely.
- All observability, prompt config, and guardrails: see **AI-PLATFORM.md**.
