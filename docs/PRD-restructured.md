# Orbis PRD & Task List — Post-Review Restructure

---

> **Progress update**
>
> - Phase 1 (Security & AI Standardization) is complete: CSP tightening, sandbox timeouts, and Gemini AI routes now follow the new schema and envelope.
> - Phase 2 (Data Layer & Performance) is complete: `lib/db.ts` now exposes a typed `OrbisSchema`, cursor-backed lookups, and pagination helpers for chat/error data.
> - Phase 3 (Landing + Observability) is complete: marketing landing sections, “Test the coach” widget, and `/api/health/ai` ship with correlated request IDs/logging.
> - Phase 4 remains in flight; see Section 11 for the task list (updated statuses tracked separately).

## 1. Summary & Objectives

**Mission**: Build Orbis as a supportive, focused daily coding practice space with AI coaching—designed for learners who want realistic problems, helpful guidance, and reflection without guilt or chaos.

**Current state**: Solid MVP with clean UI, local-first IndexedDB persistence, AI coach via Gemini API routes, in-browser code runner using Web Workers.

**Goals for this iteration**:
- **Security**: Harden CSP and sandbox to production-grade safety
- **Reliability**: Standardize AI endpoints, response shapes, error handling
- **Performance**: Use IndexedDB indexes; add pagination for chat/error bank
- **Observability**: Structured logging, health checks, request correlation
- **UX**: Launch marketing landing page; improve AI coach discoverability
- **Testing**: Lock down scheduling logic, worker termination, API contracts

---

## 2. Non-Goals (This Iteration)

- Multi-device sync or server-side DB (future: export/import for now)
- PWA manifest / offline mode beyond IndexedDB
- User accounts, authentication, or social features
- Custom model fine-tuning or prompt experimentation UI

---

## 3. Architecture Updates

### 3.1 AI Coach Endpoints (Standardization)

**Current issues**:
- Inconsistent model resolution: some routes hardcode `"gemini-2.5-flash"`, others use `resolveModel()`
- Mixed response shapes: `{ ok, data }` vs `{ error }` vs `{ ok: false, error, details }`
- HTTP codes inconsistent: 503 for model errors vs 502/500

**Changes**:
1. **Unified model resolution**: All routes call `getClientAndModel()` and use the returned `modelName`
2. **Standard response envelope**:
   ```ts
   { ok: boolean; data?: T; error?: string; details?: unknown; requestId?: string }
   ```
3. **HTTP codes**:
   - `400` – invalid request body
   - `503` – missing/invalid API key
   - `502` – upstream Gemini error
   - `500` – internal server error
4. **Request validation**: Add Zod schemas for all POST bodies; clamp input lengths

**New routes structure**:
- Keep: `/api/gemini/chat` (conversational coach)
- Keep: `/api/gemini/models` (list available models)
- Add (or refactor from existing): 
  - `/api/gemini/hint` (nudge/strategy/specific)
  - `/api/gemini/explain` (longer breakdown)
  - `/api/gemini/panic` (full help via Panic Token)
- Deprecate: `/api/gemini` (generic task endpoint) → split into hint/explain/panic

### 3.2 Web Worker Sandbox (Hardening)

**Current issues**:
- `setTimeout` cannot interrupt synchronous infinite loops
- `'unsafe-eval'` in production CSP
- Worker reused across runs; no forced termination

**Changes**:
1. **Create-per-run worker**: Instantiate fresh `Worker` for each test execution
2. **Termination on timeout**: Call `worker.terminate()` after timeout threshold
3. **CSP tightening**: Remove `'unsafe-eval'` from main document `script-src`; keep `worker-src 'self' blob:`
4. **Shadowing globals**: Freeze or redefine `self`, `postMessage`, `performance` inside worker to limit surface

**New flow**:
```
User clicks "Run Tests"
→ Create new Worker('/sandbox-worker.js')
→ Post { type: 'run', code, tests, timeout: 5000 }
→ Start timeout timer in main thread
→ On timeout: worker.terminate() + return "timeout" result
→ On completion: worker.terminate() + display results
```

### 3.3 IndexedDB Query Optimization

**Current issues**:
- `getAll('errorBank')` + in-memory filter defeats indexing
- No pagination for chat or error bank

**Changes**:
1. **Use cursor-based queries**: Replace `getAll + filter` with indexed `openCursor` on `by_problemId` and `by_date`
2. **Add pagination helpers**: `getChatMessages(problemId, { limit, offset })`, `getErrorEntries({ limit, offset, filters })`
3. **Typed wrappers**: Introduce `TypedIDBPDatabase<OrbisSchema>` to remove `any` casts

---

## 4. Feature: Marketing Landing Page

**Route**: `/` (replaces or sits above current app entry)

### 4.1 Sections
1. **Hero**: Title, subtitle, dual CTAs ("Start today's challenge", "View on GitHub"), reassurance text
2. **How Orbis Helps**: 5 feature cards (daily problem, hint ladder, two-minute start, panic token, coach rail)
3. **Session Timeline**: 3-step flow (set vibe → solve & coached → reflect)
4. **Test the Coach**: Live AI test widget; calls `/api/gemini/hint` or `/api/gemini/explain` with sample problem; shows response or "coach offline" message
5. **Learner Story**: Personal narrative + signature
6. **Footer**: Links (Demo, GitHub, About) + credit

### 4.2 Components
- `<LandingPage />` (route container)
- `<HeroSection />` – static copy + CTAs
- `<FeatureGrid features={...} />` – 5 cards, responsive
- `<SessionTimeline />` – 3-column mini-timeline
- `<TestCoachSection />` – interactive AI test with state (idle/loading/success/error)
- `<LearnerStorySection />` – static narrative
- `<LandingFooter />` – nav + credit

### 4.3 Visual Notes
- Dark background with purple radial glow behind hero
- Subtle sparkle/star accents near H1
- Use exact copy from content doc (no rewrites)

### 4.4 Integration Points
- **Test the Coach**: POST to `/api/gemini/hint` with sample problem; display response or offline message
- **Start CTA**: Navigate to `/app` or `/demo` (existing Orbis route)
- **GitHub CTA**: Link to repo

---

## 5. Observability & Health

**New endpoints**:
- `GET /api/health/ai` → `{ ok: boolean; model?: string; keyConfigured: boolean }`
  - Returns current model name if key is valid
  - 503 if key missing/invalid

**Structured logging**:
- Add `requestId` (nanoid or UUID) to all API responses
- Log format: `{ timestamp, requestId, route, method, statusCode, duration, error?, userId? }`
- Redact sensitive fields (API keys, user code snippets in prod logs)

**Client correlation**:
- Surface `requestId` in error toasts so users can report issues with ID

---

## 6. Testing Strategy

### 6.1 Unit Tests
- **Scheduling logic** (`lib/scheduling.ts`):
  - 1★ trails (1d → 3d → 7d)
  - Leech detection (2+ consecutive 1★)
  - Snooze calculation (7 days)
  - Edge cases: empty history, all 5★, mixed ratings

### 6.2 Integration Tests
- **Worker sandbox**:
  - Success: code runs, tests pass
  - Compilation error: syntax error in user code
  - Runtime error: thrown exception in test
  - Timeout: infinite loop forces termination
- **AI endpoints**:
  - Valid request → 200 + `{ ok: true, data }`
  - Missing API key → 503 + `{ ok: false, error }`
  - Upstream timeout → 502 + `{ ok: false, error }`
  - Invalid body → 400 + validation errors

### 6.3 Contract Tests
- Lock response schemas for `/api/gemini/hint`, `/api/gemini/explain`, `/api/gemini/panic`, `/api/gemini/chat`
- Use snapshot tests or JSON schema validation

---

## 7. Developer Experience

**Centralized utilities**:
- `lib/server/apiError.ts`: Standardized error handler with prod/dev detail toggling
- `types/assistance.ts`: Shared `AssistanceLevel` type for client + server
- `lib/aiClient.ts`: Return discriminated unions (`{ success: true, data } | { success: false, error }`) instead of throwing

**Environment variables**:
- Document in `README.md`:
  - `GEMINI_API_KEY` or `GOOGLE_API_KEY` (precedence: `GEMINI_API_KEY` first)
  - `GEMINI_MODEL` or `GOOGLE_GEMINI_MODEL` (default: `gemini-2.5-flash`)
- Error messages should clarify precedence

**React 19 + Strict Mode**:
- Enable `reactStrictMode` in `next.config.js`
- Verify no double-effect issues with IndexedDB init or worker creation

---

## 8. UX & Accessibility

**Chat improvements**:
- Add `role="list"` to message container, `role="listitem"` to messages
- Announce send errors via `aria-live="polite"` region
- Group messages by sender with semantic headings

**Model selector (optional)**:
- Add read-only dropdown in Chat panel header to show active model
- Fetch from `/api/gemini/models` and display current selection
- Future: allow switching models per session (low priority)

---

## 9. Deployment & Configuration

**Vercel setup**:
1. Set `GEMINI_API_KEY` or `GOOGLE_API_KEY` in Project Settings → Environment Variables
2. Optionally set `GEMINI_MODEL` (defaults to `gemini-2.5-flash`)
3. Deploy; verify `/ok` and `/api/health/ai` endpoints

**CSP updates**:
- Remove `'unsafe-eval'` from `script-src` in production
- Keep `worker-src 'self' blob:`
- Test that worker still loads and executes

---

## 10. Migration Plan

**Phase 1: Foundation (Week 1)**
- Security: CSP tightening + worker termination
- AI: Standardize model resolution + response envelopes
- Validation: Add Zod schemas to all AI routes

**Phase 2: Data & Performance (Week 2)**
- IndexedDB: Replace `getAll + filter` with indexed queries
- Pagination: Add helpers for chat + error bank
- Typed wrappers: Remove `any` casts

**Phase 3: Landing & Observability (Week 3)**
- Landing page: Scaffold components + content
- Health checks: `/api/health/ai`
- Logging: Add `requestId` + structured logs

**Phase 4: Testing & Polish (Week 4)**
- Unit tests: Scheduling edge cases
- Integration tests: Worker + AI contracts
- A11y: Chat improvements + model selector

---

## 11. Task List (Bite-Sized)

### Phase 1: Security & AI Standardization

**P0 – Critical Security**
- [ ] Remove `'unsafe-eval'` from production CSP `script-src` in `next.config.js`
- [ ] Update worker flow: create fresh `Worker` per run, call `worker.terminate()` on timeout
- [ ] Test infinite loop: verify termination after 5s

**P0 – AI Model Resolution**
- [ ] Replace hardcoded `"gemini-2.5-flash"` in `/api/gemini/route.ts` with `modelName` from `getClientAndModel()`
- [ ] Add Zod schema for `/api/gemini/chat` request body (validate `messages`, `assistanceLevel`, `code` length)
- [ ] Standardize response: return `{ ok, data?, error?, requestId }` from all AI routes

**P1 – AI Route Refactor**
- [ ] Split `/api/gemini` (generic task endpoint) into:
  - `/api/gemini/hint` (nudge/strategy/specific)
  - `/api/gemini/explain` (longer breakdown)
  - `/api/gemini/panic` (full help)
- [ ] Update `lib/aiClient.ts` to call new endpoints
- [ ] Add Zod validation to each new route

**P1 – Error Handling**
- [ ] Create `lib/server/apiError.ts` with standardized error handler
- [ ] Use consistent HTTP codes: 400 (validation), 503 (no key), 502 (upstream), 500 (internal)
- [ ] Add `requestId` (nanoid) to all responses

---

### Phase 2: Data & Performance

**P0 – IndexedDB Query Optimization**
- [ ] Replace `getLatestErrorEntryByProblemId` with indexed cursor query on `by_problemId` + `by_date`
- [ ] Add `getChatMessages(problemId, { limit: 50, offset: 0 })` with pagination
- [ ] Add `getErrorEntries({ limit: 20, offset: 0, filters? })` with pagination

**P1 – Typed Wrappers**
- [ ] Define `OrbisSchema` type for IndexedDB stores
- [ ] Replace `(db as any).getAll(...)` with typed `db.getAll<ProblemRecord>('problems')`
- [ ] Remove all `any` casts in `lib/db.ts`

---

### Phase 3: Landing Page & Observability

**P0 – Landing Page Scaffold**
- [ ] Create route `/` (or `/landing` if keeping `/` as app entry)
- [ ] Scaffold components:
  - `<HeroSection />` with copy + CTAs
  - `<FeatureGrid features={...} />` with 5 cards
  - `<SessionTimeline />` with 3-step flow
  - `<TestCoachSection />` with state (idle/loading/success/error)
  - `<LearnerStorySection />` with narrative
  - `<LandingFooter />` with links
- [ ] Wire "Start today's challenge" CTA to `/app` or `/demo`
- [ ] Wire "View on GitHub" CTA to repo URL

**P1 – Test the Coach Widget**
- [ ] Add button in `<TestCoachSection />` to POST sample problem to `/api/gemini/hint`
- [ ] Show loading skeleton while request in-flight
- [ ] Display AI response text or "coach offline" message on error

**P1 – Health Checks**
- [ ] Add `GET /api/health/ai` route: return `{ ok, model?, keyConfigured }`
- [ ] Add structured logging to AI routes: `{ timestamp, requestId, route, statusCode, duration, error? }`
- [ ] Redact sensitive fields in prod logs (API keys, code snippets)

---

### Phase 4: Testing & Polish

**P0 – Unit Tests**
- [ ] Add tests for `calculateNextDue()` in `lib/scheduling.ts`:
  - 1★ trail (1d → 3d → 7d)
  - Leech detection (2+ consecutive 1★)
  - Snooze (7 days)
  - Edge cases (empty history, all 5★)

**P1 – Worker Integration Tests**
- [ ] Test success: code runs, tests pass
- [ ] Test compilation error: syntax error in user code
- [ ] Test runtime error: exception thrown in test
- [ ] Test timeout: infinite loop forces termination after 5s

**P1 – API Contract Tests**
- [ ] Lock response schemas for `/api/gemini/hint`, `/api/gemini/explain`, `/api/gemini/panic`, `/api/gemini/chat`
- [ ] Use snapshot tests or JSON schema validation

**P2 – A11y Improvements**
- [ ] Add `role="list"` to chat message container
- [ ] Add `aria-live="polite"` region for send errors
- [ ] Test with screen reader (VoiceOver / NVDA)

**P2 – Model Selector (Optional)**
- [ ] Add dropdown in Chat panel header to show active model
- [ ] Fetch from `/api/gemini/models` and display current selection
- [ ] (Future) Allow switching models per session

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| CSP changes break worker | High | Test in staging; keep `worker-src 'self' blob:` intact |
| Worker termination causes memory leaks | Medium | Profile memory usage; ensure cleanup in `useCodeRunner` |
| IndexedDB migration breaks existing data | High | Version DB to v5; add migration logic for existing stores |
| AI routes return inconsistent shapes | Medium | Add contract tests; lock schemas with Zod |
| Landing page delays app entry | Low | Keep landing at `/` and app at `/app`; fast CTA |

---

## 13. Success Metrics

**Security**:
- ✅ `'unsafe-eval'` removed from prod CSP
- ✅ Worker timeouts terminate deterministically (tested with infinite loop)

**Reliability**:
- ✅ All AI routes return `{ ok, data?, error?, requestId }`
- ✅ HTTP codes consistent: 400/502/503/500
- ✅ <5% error rate on AI endpoints (monitor via Vercel logs)

**Performance**:
- ✅ IndexedDB queries use indexes (no `getAll + filter`)
- ✅ Chat + error bank paginated (50/20 per page)

**UX**:
- ✅ Landing page live at `/` with "Test the Coach" widget
- ✅ AI coach responds in <3s (p95)
- ✅ Chat accessible (screen reader tested)

**Testing**:
- ✅ 80%+ coverage on scheduling logic
- ✅ Worker integration tests pass (success, error, timeout)
- ✅ API contract tests lock response schemas

---

## 14. Long-Term Roadmap (Post-MVP)

- **Persistence sync**: Export/import IndexedDB data to JSON
- **Server DB**: PostgreSQL + auth for multi-device continuity
- **PWA manifest**: Offline-first with service worker caching
- **Model experimentation**: Let users switch models or adjust temperature
- **Analytics**: Track problem completion rates, hint usage, panic token frequency
- **Social features**: Share favorite problems, leaderboard (optional)

---

**End of PRD & Task List**

Ready to implement? Start with **Phase 1 (P0 tasks)**: CSP tightening, worker termination, AI standardization.

