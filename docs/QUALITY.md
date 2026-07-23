# Engineering Quality & CI

_Free/OSS quality gates. Staged so we don't over-engineer, but the foundation is in from early._

## In place now
| Gate | Tool | Command | Enforced |
|------|------|---------|----------|
| Types | TypeScript | `npm run type-check` | ✅ CI |
| Lint | ESLint (flat config, eslint-config-next) | `npm run lint` | ✅ CI |
| Unit tests | **Vitest** | `npm run test` / `test:run` | ✅ CI |
| Build | Next.js | `npm run build` | ✅ CI |
| Formatting | **Prettier** | `npm run format` / `format:check` | ⏳ local now; CI gate after a baseline pass |
| CI | **GitHub Actions** (`.github/workflows/ci.yml`) | on push/PR to `main` | ✅ |
| Deps + security | **Dependabot** (`.github/dependabot.yml`) + `npm audit` | weekly PRs | ✅ |
| Git flow | branch → PR → review → merge; Conventional Commits | — | ✅ (CONTRIBUTING.md) |

**Why Prettier isn't a CI gate yet:** enabling `format:check` requires a one-time repo-wide
`npm run format` baseline. We'll run that on a clean `main` (after the in-flight feature branches
merge) to avoid noisy reformat diffs + merge conflicts, then flip `format:check` on in CI.

## Coming as features land (Phase 3)
| Gate | Tool | When |
|------|------|------|
| E2E / integration | **Playwright** | Once pages render real content — smoke (`/`, `/robots.txt`, `/styleguide`) → preview + search flows |
| Accessibility | **@axe-core/playwright** | With E2E — enforces our WCAG 2.1 AA commitment |
| Performance | **Lighthouse CI** | Enforce the Core Web Vitals budget (SEO.md) |
| Pre-commit | **Husky + lint-staged** | Optional — run lint/format on staged files |
| SEO assertions | CI check | Assert title + description + ≥1 JSON-LD block per key route (SEO.md) |

## Testing strategy
- **Unit (Vitest, node):** pure logic — `src/lib/*` (geo/distance, upcoming `buildMetadata`/
  `buildJsonLd`, AI retrieval helpers, robots decision). First test: `src/lib/geo.test.ts`.
- **Component (later):** Vitest + React Testing Library (jsdom) for presentational logic.
- **E2E (later):** Playwright against a running app with seed content.
- Keep tests close to code (`*.test.ts` co-located).

## Principles
- CI must be green to merge (types, lint, unit, build).
- No secrets in the repo; the build fails closed without creds (guarded fetches).
- Add a test with the logic it covers — especially SEO, robots, AI, and money-path code.
