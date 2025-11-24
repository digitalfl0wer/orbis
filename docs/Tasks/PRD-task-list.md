# Orbis PRD Task List

Focused implementation roadmap derived from `docs/PRD-restructured.md`. Tasks are grouped by the four migration phases in that PRD plus a bonus section for longer-term work.

## Phase 1 — Security & AI Standardization (P0)

> **Status:** ✅ Completed — CSP tightening, worker + timeout hardening, and the Gemini chat endpoint refactor are live.

1. **Tighten CSP before release**
   - Remove `'unsafe-eval'` from `script-src` in `next.config.js` while retaining `worker-src 'self' blob:` so the sandbox can load.
   - Verify in dev/staging that the sandbox worker still boots and that the landing page renders without CSP violations.
   - Document the CSP change in `docs/README` or the PRD notes.

2. **Harden the sandbox worker**
   - Instantiate a new worker for every test run and terminate it immediately on timeout (5s default) instead of reusing a long-lived worker.
   - Track the timeout timer in the main thread; if it fires, terminate the worker and surface a deterministic “timeout” result to `useCodeRunner`.
   - Shadow or freeze worker globals (`self`, `postMessage`, `performance`) so executed user code cannot reach outside the sandbox.

 3. **Standardize Gemini model resolution & responses** ✅
   - Update every Gemini endpoint (chat, future hint/explain/panic routes) to call `getClientAndModel()` and use the normalized `modelName`.
   - Wrap responses in `{ ok, data?, error?, details?, requestId }`; include `requestId` (nanoid) for correlation.
   - Use Zod schemas to validate each POST payload; clamp text lengths (e.g., messages, code, problem prompts).

 4. **Create shared API error helper** ✅
   - Add `lib/server/apiError.ts`: central handler that toggles detail output between dev/prod and attaches `requestId`.
   - Ensure each route (AI + health) returns consistent HTTP codes (400/502/503/500) with documented semantics.

## Phase 2 — Data Layer & Performance (P0/P1)

> **Status:** ✅ Completed — Typed schema + indexed helpers are live; chat history can paginate.

5. **IndexedDB query optimization** ✅
   - Replace `getLatestErrorEntryByProblemId` with an indexed cursor query that reads via `by_problemId`.
   - Provide pagination-friendly helpers for chat (`getChatMessages(problemId, { limit, offset })`).
   - Validate against existing sample data to ensure records are still returned.

6. **Typed `idb` schema** ✅
   - Define an `OrbisSchema` interface covering `problems`, `schedules`, `favorites`, `errorBank`, `chat`.
   - Teach `lib/db.ts` to use `IDBPDatabase<OrbisSchema>` so `getAll`/`get`/`put` return strongly typed records.
   - Remove remaining `as any` casts from `lib/db.ts` functions.

## Phase 3 — Landing Page & Observability (P1)

> **Status:** ✅ Completed — marketing landing, “Test the coach”, and health endpoint are live with Correlated request IDs.

7. **Ship the marketing landing page** ✅
   - Build `/` (or `/landing` if needed) that renders `HeroSection`, `FeatureGrid`, `SessionTimeline`, `TestCoachSection`, `LearnerStorySection`, and `LandingFooter` using the provided copy verbatim.
   - Layout: dark background, purple radial glow, sparkle accents, large dual CTAs (stacked on mobile).
   - CTA behaviors: “Start today’s challenge” → `/app` or `/demo`; “View the code on GitHub” → repository URL.

8. **Implement “Test the coach” widget** ✅
   - In `TestCoachSection`, wire a mock (TODO: replace with real Gemini call) to POST a sample prompt to `/api/gemini/hint` (later `/explain` if deeper).
   - Manage idle/loading/success/error states with skeleton bubble + copy from PRD.
   - On failure show “AI coach is offline…” message; on success display the example explanation text.

9. **Health + observability endpoints** ✅
   - Add `GET /api/health/ai`: returns `{ ok, model?, keyConfigured }`; status 503 if keys missing/invalid.
   - Log `{ timestamp, requestId, route, method, statusCode, duration, error? }` for every AI request; redact sensitive data.
   - Surface `requestId` (from structured logs) to clients so reported issues can include it.

## Phase 4 — Testing & Polish (P1/P2)

10. **Unit tests for scheduling**
    - Cover `calculateNextDue` for each star rating (1★ trail, 2★, 3★, 4★, 5★) plus leech detection and snooze rule.
    - Assert `updateScheduleEntry` preserves history, clears snooze, and increments leech count appropriately.
    - Add tests for `formatTimeUntilDue` helper for “Due now”, “Due tomorrow”, “Due in Xd/w”.

11. **Worker integration & contract tests**
    - Worker tests: success result, compilation error, runtime exception, and timeout termination.
    - Gemini routes contract tests: valid request (`200` ok), validation error (`400`), missing key (`503`), upstream failure (`502`).
    - Lock JSON schema (via snapshot or Zod inference) for `hint`, `explain`, `panic`, and `chat` responses.

12. **Accessibility polish**
    - Chat panel: message container `role="list"`, message bubble `role="listitem"`, `aria-live="polite"` for errors.
    - Ensure “Test the coach” state changes are announced (aria-live) and buttons disable while loading.
    - Wave keyboard focus states across landing CTAs and widget flows.

## Bonus — Long-Term / Future Phases

13. **Persistence sync / import-export**
    - Add UI to export IndexedDB state to JSON and re-import (useful for demo sharing).
    - Document the format and provide recovery instructions.

14. **Server-side expansion (future)**
    - Plan for optional PostgreSQL sync and auth for multi-device continuity.
    - Keep `lib/db.ts` abstraction ready for future server DB adapters.

15. **PWA & offline polish (optional)**
    - Add manifest + icons + service worker to pre-cache static assets and seeds.
    - Ensure demo mode (hard-blocking network) continues to work with new caching layer.

