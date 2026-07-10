# DeliveryOps AI — Demo Guide

Guías breves para demostrar los vertical slices E2E en local y en producción.

> **Alcance:** esta guía describe la demo en desarrollo local y su equivalente en producción. La configuración de producción (`CORS_ORIGINS`, cookies, `VITE_API_URL`) está documentada en `apps/*/.env.example` y [public-deployment-spec.md](public-deployment-spec.md).

| Slice | Spec |
|-------|------|
| Authentication (US-001) | [auth-mvp.md](auth-mvp.md) |
| User Stories CSV import (US-002) | [user-stories-import-mvp.md](user-stories-import-mvp.md) |
| Sprint Capacity (US-003) | [sprint-capacity-mvp.md](sprint-capacity-mvp.md) |
| Sprint Absences (US-004) | [sprint-absences-mvp.md](sprint-absences-mvp.md) |
| Sprint Analysis (US-005) | [sprint-analysis-mvp.md](sprint-analysis-mvp.md) |
| Export Excel (US-009) | [export-sprint-analysis-mvp.md](export-sprint-analysis-mvp.md) |
| Refinement MVP (US-006–008) | [refinement-mvp.md](refinement-mvp.md) |

**Evidencia académica (issue #4 / GH-02):**

- [prompts.md](../prompts.md) — P-001–P-017 (foundation + CSV import); P-018–P-022 (DEMO, CI, ADRs, governance)
- [docs/adr/](adr/) — ADR-001 (AI-first SDLC) · ADR-002 (pnpm monorepo) · ADR-003 (Nest+Prisma+PG) · ADR-004 (vertical slices) · ADR-005 (Cursor rules)

---

## Demo Checklist

Use this checklist to validate the local demo before closing Delivery 1 evidence (GH-02 / issue #4).

| # | Check | Expected outcome |
|---|-------|------------------|
| 0 | **Auth validated** | Demo user created; `/login` works; protected routes redirect without session; logout returns to `/login` |
| 1 | **API starts successfully** | `pnpm --filter api start:dev` → `GET /api/health` returns `{ "status": "ok" }` |
| 2 | **Web starts successfully** | `pnpm --filter web dev` → Vite URL loads; navigation renders without errors |
| 3 | **CSV import validated** | Import `fixtures/sample-user-stories.csv` → **9 imported**, **0 failed**; table shows 9 rows |
| 4 | **Sprint Capacity validated** | Settings → create capacity for `Sprint 2` / `Gerencia Riesgo` / `Riesgo` with **20** points |
| 5 | **Sprint Absences validated** | Settings → register absence for same triple (optional); adjusted capacity reflects absence days |
| 6 | **Sprint Analysis validated** | `/sprint-analysis` → `Sprint 2` / `Gerencia Riesgo` / `Riesgo` shows demand **21** vs capacity **20** → **OVERLOADED** |
| 7 | **Refinement MVP validated** | `/refinement` → upload `fixtures/requirements.pdf` → editable refined story, AC, and gaps displayed |
| 8 | **Expected outcomes documented** | Results match sections below; Swagger at `/api/docs` documents all endpoints |

**Build validation (optional):**

```bash
pnpm --filter api build && pnpm --filter api test
pnpm --filter web build
pnpm test:e2e
```

---

## Demo objective

Show that DeliveryOps AI supports the **operational planning and refinement workflow** end-to-end in local development:

0. **Authenticate** with demo credentials (HttpOnly session cookie)
1. **Import User Stories from CSV** (with optional team/project)
2. **Configure sprint capacity** and **register absences** in Settings
3. **Run sprint analysis** — demand vs adjusted capacity grouped by `(sprint, teamName, projectName)`
4. **Refine requirements from PDF** — mock provider returns editable story, acceptance criteria, and gaps

---

## Prerequisites

- Node.js 20+ and pnpm 10+
- Docker (PostgreSQL local)
- API and web dependencies installed (`pnpm install` from repo root)

Environment:

- `apps/api/.env` with `DATABASE_URL` pointing to `localhost:5433` and auth vars (see `apps/api/.env.example`)
- `apps/web/.env` with `VITE_API_URL=http://localhost:3000`

**Demo credentials (local only):**

| Field | Value |
|-------|-------|
| Email | `pm@deliveryops.local` |
| Password | `DeliveryOps123!` |

Create or refresh the demo user:

```bash
pnpm --filter api auth:create-demo-user
```

Sample files:

- [fixtures/sample-user-stories.csv](../fixtures/sample-user-stories.csv) — includes optional columns `team_name`, `project_name` aligned with Settings demo data
- [fixtures/requirements.pdf](../fixtures/requirements.pdf) — text-based PDF for Refinement MVP demo

> **Backward compatibility:** `team_name` and `project_name` are optional CSV columns. Legacy files without them still import, but those rows do **not** contribute demand in Sprint Analysis. Meaningful analysis requires matching `(sprint, teamName, projectName)` across User Stories, Sprint Capacity, and Sprint Absences.

---

## Startup commands

```bash
# 1. Database
docker compose up -d

# 2. API (terminal 1)
pnpm --filter api start:dev

# 3. Web (terminal 2)
pnpm --filter web dev
```

Optional — apply migrations if the database is fresh:

```bash
pnpm --filter api prisma migrate dev
pnpm --filter api auth:create-demo-user
```

---

## URLs

| Service | URL |
|---------|-----|
| Web app | URL shown by Vite (e.g. `http://localhost:5173`) |
| Login | `/login` |
| Dashboard | `/dashboard` |
| User Stories page | `/user-stories` |
| Settings (capacity / absences) | `/settings` |
| Sprint Analysis | `/sprint-analysis` |
| Refinement | `/refinement` |
| API health | http://localhost:3000/api/health |
| Swagger | http://localhost:3000/api/docs |

---

## Production Demo

El mismo flujo funcional de esta guía puede ejecutarse en producción usando:

- Frontend: `https://ai-4-devs-finalproject-gl29whagg-david-dlp.vercel.app`
- API base: `https://api-production-e119.up.railway.app`
- Health: `https://api-production-e119.up.railway.app/api/health`
- Swagger: `https://api-production-e119.up.railway.app/api/docs`

La validación funcional completa en producción ya fue realizada para login, sesión con cookie HttpOnly, User Stories, Sprint Capacity, Sprint Absences, Sprint Analysis y Export Excel.

---

## E2E demo steps — Authentication (US-001)

1. Ensure migrations are applied and the demo user exists (`pnpm --filter api auth:create-demo-user`).
2. Open the Vite URL while logged out (or use a private window).
3. Navigate to `/settings` or `/user-stories` — confirm redirect to `/login`.
4. Sign in with `pm@deliveryops.local` / `DeliveryOps123!`.
5. Confirm redirect to `/dashboard` and user label in the navigation (e.g. `Demo PM`).
6. Open **User Stories**, **Settings**, **Sprint Analysis**, and **Refinement** — all load without redirect to login.
7. Click **Log out** — confirm redirect to `/login` and protected routes redirect again without session.

### Expected result (auth)

- `POST /api/auth/login` returns `{ user, message }` without JWT in JSON; `Set-Cookie` HttpOnly present.
- `GET /api/auth/me` returns `{ user }` with a valid session cookie; `401` without cookie.
- `POST /api/auth/logout` clears the session cookie.
- Frontend never stores JWT in `localStorage`, `sessionStorage`, or `document.cookie`.
- Playwright smoke: `pnpm test:e2e e2e/auth-login.spec.ts` (3 tests).

---

## E2E demo steps — User Stories import

1. Open the Vite URL and go to **User Stories** in the navigation.
2. Confirm the empty state: *"No user stories yet. Import a CSV to get started."* (if the database has no rows).
3. Click **Choose file** and select `fixtures/sample-user-stories.csv`.
4. Click **Import CSV**.
5. Check the success banner: **9 imported**, **0 failed** (with the sample file).
6. Verify the table shows 9 rows with External ID, Title, Story Points, Status, Sprint, **Gerencia**, **Proyecto**, and Created.
7. *(Optional)* Open Swagger → `POST /api/user-stories/import` or `GET /api/user-stories` to show the API contract.
8. *(Optional)* Re-import the same file to observe duplicate rows (known MVP limitation).

### Expected result (import)

- HTTP **201** on import with `{ "imported": 9, "failed": 0, "errors": [] }`.
- Table refreshed with 9 User Stories across Sprint 1–3 and both gerencias.
- No browser console CORS or network errors when API runs on port `3000` and `VITE_API_URL` is set.

---

## E2E demo steps — Sprint Capacity (US-003)

After importing the sample CSV (or on a fresh database before analysis):

1. Go to **Settings** → **Sprint Capacity** section.
2. Select Sprint: `Sprint 2`, Gerencia: `Gerencia Riesgo`, Proyecto: `Riesgo`.
3. Enter available points: **20**.
4. Click **Save capacity**.
5. Confirm the capacity appears in the list with the correct triple and points.

### Expected result (capacity)

- HTTP **201** on `POST /api/sprint-capacity`.
- Capacity row visible in Settings; duplicate triple returns conflict (409).

---

## E2E demo steps — Sprint Absences (US-004)

1. In **Settings** → **Sprint Absences** section.
2. Select the same triple: `Sprint 2` / `Gerencia Riesgo` / `Riesgo`.
3. Enter absence days (e.g. **2**) and a short reason.
4. Click **Save absence**.
5. Confirm the absence appears in the list and **adjusted capacity** reflects reduced points where shown.

### Expected result (absences)

- HTTP **201** on `POST /api/sprint-absences`.
- Adjusted capacity = `max(0, availablePoints − sum(absenceDays))` for the combination.

---

## E2E demo steps — Sprint Analysis (US-005)

After importing the sample CSV:

1. Go to **Settings** and register **Sprint Capacity** for:
   - Sprint: `Sprint 2`
   - Gerencia: `Gerencia Riesgo`
   - Proyecto: `Riesgo`
   - Available points: **20**
2. *(Optional)* Register absences for the same triple if demonstrating adjusted capacity.
3. Open **Sprint Analysis**.
4. Locate the row for `Sprint 2` / `Gerencia Riesgo` / `Riesgo`.
5. Confirm **demand 21** (US-201 + US-202 + US-203 = 5 + 8 + 8) vs capacity **20** → status **OVERLOADED** (~105% utilization).
6. Click **Export Excel** → the browser downloads the sprint analysis workbook (`.xlsx`).

Other combinations in the sample file (e.g. `Gerencia Ahorro` + `Ahorro` on Sprint 2) appear when capacity or absences exist for that triple; otherwise demand may show with zero capacity depending on seeded data.

### Expected result (analysis)

- `GET /api/sprint-analysis` returns rows with `demand`, `capacity`, `adjustedCapacity`, `utilization`, and `status` (`HEALTHY`, `WARNING`, or `OVERLOADED`).
- UI table matches API data for the configured triple.
- `GET /api/sprint-analysis/export` returns an Excel file; filename pattern `sprint-analysis-YYYY-MM-DD.xlsx` (UTC date).

---

## E2E demo steps — Refinement MVP (US-006–008)

1. Go to **Refinement** in the navigation.
2. Click **Choose file** and select `fixtures/requirements.pdf`.
3. Click **Analyze**.
4. Wait for the analysis to complete (synchronous, mock provider).
5. Verify the UI shows:
   - **Refined user story** (editable textarea)
   - **Acceptance criteria** (editable list)
   - **Gaps / questions** (editable list)
6. *(Optional)* Edit fields to demonstrate human-in-the-loop review.
7. *(Optional)* Click **Clear** to reset the form.

### Expected result (refinement)

- HTTP **200** on `POST /api/refinement/analyze` with structured JSON (`refinedStory`, `acceptanceCriteria`, `gaps`).
- Output is **not persisted** — refresh clears results (MVP limitation).
- Mock provider only; no real OpenAI/Azure call.

---

## What these slices demonstrate (technical)

- **Authentication (US-001):** JWT in HttpOnly cookie, protected API and routes, `AuthProvider` session hydration
- **Spec-first delivery** aligned with slice specs in `docs/*-mvp.md`
- **Monorepo** with independent `apps/api` and `apps/web`
- **NestJS modules** per feature: auth, user-stories, sprint-capacity, sprint-absences, sprint-analysis, refinement
- **Partial CSV import**: invalid rows reported without blocking valid ones
- **Sprint planning chain**: capacity → absences → demand vs adjusted capacity analysis
- **Refinement MVP**: PDF upload, text extraction, mock `RefinementProvider`, editable UI output
- **OpenAPI** documentation at `/api/docs`
- **React UI** with local state, `fetch`, and `VITE_API_URL`
- **AI-assisted workflow** traceability via [prompts.md](../prompts.md) and [docs/adr/](adr/)

---

## Current MVP limitations

Not shown in this demo (planned for later deliveries):

- PDF export
- Real LLM provider (OpenAI / Azure) — mock only today
- Persistence of refinement results
- Edit/delete User Stories, deduplication on re-import
- CI with PostgreSQL runner or Playwright in GitHub Actions

Smoke E2E (Playwright): `pnpm test:e2e` from repo root (9 tests, incl. auth).

---

**Duration:** ~10–15 minutes for full checklist (import + settings + analysis + refinement).
