# Visit Dubai Concierge — MCP Server (Phase 4)

_An MCP server that exposes Visit Dubai's CMS content (via Optimizely Graph) as tools any
MCP client can use — Claude Desktop/Code, claude.ai connectors, and eventually **Opal**._

## Why we're building it
1. **Learning** — build a real Model Context Protocol server end-to-end.
2. **Stakeholder demo** — show MCP doing "cool things for the end user": the *same content*
   powering the website also powers any AI assistant, with no bespoke per-app integration.
3. **Community / MVP** — publish it open-source as an **"Optimizely Graph MCP server"** — genuinely
   reusable, blog-worthy, strong MVP contribution (alongside the preview-link module).

## Decisions
| | |
|---|---|
| Use case | **Visit Dubai Concierge** — Graph-backed content tools (end-user facing) |
| Transport | **Start local (stdio)** for learning → **promote to remote streamable-HTTP on Vercel** (stakeholders add it as a **claude.ai connector**) |
| Timing | **Phase 4**, with the AI features — after there's real CMS content to query |
| SDK | `@modelcontextprotocol/sdk` (TypeScript) |

## Tools exposed (read-only, Graph-backed)
- `search_places(query, location?, category?)` — semantic search over `PointOfInterest`
- `find_events(dateRange?, area?)` — upcoming `Event`s
- `get_news(topic?)` — `Article`/news
- `get_place_details(slug)` — full POI + related news/events
- `plan_trip(days, interests, budget?)` — itinerary grounded in CMS content (→ `Itinerary` shape)
- (Resources: expose select POIs/articles as MCP resources.)

## Architecture — reuse, don't rebuild
The MCP tools call the **same Graph retrieval layer** as the website's AI Search (AI-SEARCH.md).
Build retrieval once; expose it **two ways**:
```
Optimizely Graph (semantic + facet + geo)
        │
        ├── Next.js /api/ai/*        → website AI search + trip planner
        └── MCP server (tools)       → Claude Desktop / claude.ai / Opal / any MCP client
```
- Semantic understanding via Graph `_ranking: SEMANTIC`; "nearest" via app-side distance from
  lat/lng (same as AI-SEARCH.md).
- Reuses the pluggable pipeline + guardrails + logging from AI-PLATFORM.md (log MCP calls too).

## Demo script (stakeholders)
In Claude Desktop / claude.ai with the connector added:
> "Plan me a 3-day luxury Dubai trip with Michelin dining and a desert day."
→ Claude calls `plan_trip` / `search_places` on our MCP server → returns a grounded itinerary
built from **our Visit Dubai CMS content**. Then: *"What's on this weekend near the marina?"* →
`find_events`. The wow: our content, live, inside any AI — via MCP.

## Security & ops
- **Read-only** tools; server-side **Graph single key** (public/read) — no secrets to the client.
- Rate limiting + input validation + the same **guardrails** as the web AI (AI-PLATFORM.md §3).
- Remote server auth for the hosted connector; log tool calls + tokens to observability (Langfuse).

## Build steps (Phase 4)
1. Local **stdio** server with the tools above → connect via `claude mcp add` (Claude Code) or
   Claude Desktop config → verify against seed content.
2. Wrap the shared Graph retrieval module (same one the website uses).
3. Promote to **remote streamable-HTTP** on Vercel → add as a **claude.ai connector** for the demo.
4. Open-source + blog ("Building an Optimizely Graph MCP server").
