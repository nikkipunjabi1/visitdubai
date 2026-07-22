# AI Platform — Observability, Prompt Management, Guardrails, Safety, Scalability

_How we operate the AI features responsibly. Free/OSS-first, but architected to scale. Companion:
AI-SEARCH.md (retrieval + generation)._

## Design principle: a pluggable AI pipeline
Every AI request flows through one server-side pipeline with swappable stages, so we can add
providers, guardrails, or a vector DB later without rewrites:

```
request → [input guardrails] → [prompt assembly] → [retrieval: Graph] → [model: Claude]
        → [output guardrails] → [logging/telemetry] → response
```
Each stage is an interface (`Retriever`, `ModelProvider`, `Guardrail`, `PromptStore`, `Logger`).
Free/OSS implementations now; managed/scaled implementations later — same seams.

---

## 1. Reporting dashboard — "what users asked, what AI answered, tokens burnt"
**Log every interaction** with a record like:
```
id, ts, sessionId, userHash, feature (search|planner),
query, intent, retrievedRefs[], responseSummary,
model, inputTokens, outputTokens, costUSD, latencyMs,
guardrailVerdicts[], followUpsShown[], error?
```
- **Token/cost is free data:** the Anthropic API returns `usage {input_tokens, output_tokens}`
  on every response → compute cost from the model's per-token price. No extra tooling needed to
  capture it.
- **Don't build the dashboard from scratch — use an LLM-observability tool** (free tiers / OSS):
  | Tool | Why | Cost |
  |------|-----|------|
  | **Langfuse** (recommended) | Open-source, self-hostable; tracing, token/cost, **prompt management**, evals, dashboards | Free (self-host) / generous cloud free tier |
  | **Helicone** | 1-line proxy in front of Anthropic; auto-logs tokens/cost/latency + dashboard | Free tier |
  | Phoenix (Arize) | OSS tracing/evals | Free (OSS) |
- **Product-specific view:** a protected admin route **`/admin/ai`** in the Next app reads from a
  **Supabase (free Postgres)** table (or Neon/Vercel Postgres) for our own charts: top queries,
  cost/day, latency p95, guardrail blocks, zero-result queries.
  > Note: this is Supabase used as a **logging store**, not a vector DB (see AI-SEARCH.md).
- Protect `/admin/*` with auth; store only a **hashed** session id (privacy) — see §5.

## 2. Prompt configuration — an "admin panel" for prompts
Two complementary options; **primary is the CMS itself**:
- **★ Prompts as Optimizely CMS content** (recommended, and a differentiator): model a
  `PromptTemplate` content type (name, system prompt, instructions, model, temperature, version).
  Admins edit prompts **in the Optimizely UI**, and it **reuses the workflow we already built** —
  draft → **stakeholder preview** → **publish** (PREVIEW-WORKFLOW.md) — fetched at runtime via
  **Graph**. Change a prompt with no redeploy; full versioning + audit via CMS. (Blog-worthy:
  "Manage your AI prompts in Optimizely CMS.")
- **Langfuse Prompt Management** (complement): versioned prompts, labels (prod/staging), and
  prompt **experiments/A-B** when we want to optimize — pairs with the observability above.

## 3. Guardrails (input + output rails)
A `Guardrail` stage on both sides of the model call; **verdicts are logged** (§1):
- **Input rails:** prompt-injection / jailbreak detection, PII/sensitive-data screen, **topic-scope
  check** (only tourism/Visit-Dubai intents), length/rate limits.
- **Grounding:** answer **only** from Graph-retrieved CMS content (RAG grounding) → low hallucination.
- **Output rails:** **schema validation** (must be valid card/itinerary JSON — enforced via
  structured outputs), toxicity/PII scan, **citation/grounding check** (does the answer reference
  retrieved items?), safe-refusal handling.
- Deterministic guards are cheap and effective: input allowlists, output schemas, max tokens,
  per-session rate limiting, timeouts.

## 4. "Model Armor"-equivalent safety — free/OSS options
Google Model Armor screens prompts/responses for injection, jailbreak, sensitive data, and harmful
content. Free/open equivalents we can compose:
| Need | Free/OSS option |
|------|-----------------|
| Prompt-injection / jailbreak detection | **Meta Prompt Guard** (open weights) |
| Input/output content safety classification | **Meta Llama Guard 3** (open weights) |
| Programmable rails (topic/safety/jailbreak) | **NVIDIA NeMo Guardrails** (OSS) |
| I/O validators (PII, toxicity, structure) | **Guardrails AI** (OSS) |
| PII detection/redaction | **Microsoft Presidio** (OSS) |
| Baseline model safety | **Claude's native safety** + a strict **system prompt** with scope + refusal rules |
Start with Claude-native safety + a strong system prompt + deterministic schema/PII checks; add
Prompt Guard / Llama Guard (small, self-hostable) as the "armor" layer. All free; each can scale
(self-host bigger, or swap to a managed safety API later) behind the same `Guardrail` interface.

## 5. Privacy & data handling
- Log **hashed** session ids, not raw PII; redact PII from stored queries (Presidio) where feasible.
- `ANTHROPIC_API_KEY` and all keys **server-side only** (never `NEXT_PUBLIC_*`).
- Retention policy on logs; admin dashboard behind auth; comply with the demo's privacy notice.

## 6. Scaling the AI implementation (later)
- **Provider-agnostic** `ModelProvider` seam (default: Claude via Anthropic SDK; latest models).
- **Streaming** + **semantic response cache** (cut cost/latency on repeat queries).
- **Async/queue** for heavy tasks (batch itinerary generation) if needed.
- **Evals** (Langfuse) to catch regressions when prompts/models change.
- **Optimizely Feature Experimentation** to gate AI features and **A/B prompts/models** — ties AI
  rollout into the same platform we're already showcasing.
- Add a **vector DB (e.g. Supabase pgvector)** only when non-CMS sources appear (AI-SEARCH.md).

## Free-first → scale-later summary
| Concern | Free/now | Scale-later |
|---------|----------|-------------|
| Retrieval | Optimizely Graph semantic | + pgvector for non-CMS data |
| Observability/tokens | Langfuse (self-host) / Helicone free | Langfuse/Datadog paid tiers |
| Prompt admin | CMS `PromptTemplate` content | + Langfuse experiments |
| Guardrails | Claude safety + Prompt/Llama Guard + Guardrails AI | Managed safety API |
| Logs/dashboard | Supabase free Postgres + `/admin/ai` | Managed warehouse/BI |
| Rollout/experiments | Optimizely Feature Experimentation | — |
