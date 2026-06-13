# DeliveryOps AI — Demo Guide

Guías breves para demostrar los vertical slices E2E en local.

| Slice | Spec |
|-------|------|
| User Stories CSV import (US-002) | [user-stories-import-mvp.md](user-stories-import-mvp.md) |
| Sprint Analysis (US-005) | [sprint-analysis-mvp.md](sprint-analysis-mvp.md) |

---

## Demo objective

Show that DeliveryOps AI can **import User Stories from CSV** (with optional team/project), persist them in PostgreSQL, **list them in the web UI**, and — together with Sprint Capacity and Absences — **run Sprint Analysis** grouped by `(sprint, teamName, projectName)`.

---

## Prerequisites

- Node.js 20+ and pnpm 10+
- Docker (PostgreSQL local)
- API and web dependencies installed (`pnpm install` from repo root)

Environment:

- `apps/api/.env` with `DATABASE_URL` pointing to `localhost:5433`
- `apps/web/.env` with `VITE_API_URL=http://localhost:3000`

Sample file for import:

- [fixtures/sample-user-stories.csv](../fixtures/sample-user-stories.csv) — includes optional columns `team_name`, `project_name` aligned with Settings demo data

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
```

---

## URLs

| Service | URL |
|---------|-----|
| Web app | URL shown by Vite (e.g. `http://localhost:5173`) |
| User Stories page | `/user-stories` |
| Settings (capacity / absences) | `/settings` |
| Sprint Analysis | `/sprint-analysis` |
| API health | http://localhost:3000/api/health |
| Swagger | http://localhost:3000/api/docs |

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

Other combinations in the sample file (e.g. `Gerencia Ahorro` + `Ahorro` on Sprint 2) appear when capacity or absences exist for that triple; otherwise demand may show with zero capacity depending on seeded data.

---

## What these slices demonstrate (technical)

- **Spec-first delivery** aligned with slice specs in `docs/`
- **Monorepo** with independent `apps/api` and `apps/web`
- **NestJS modules** with CSV parse, validation, Prisma persistence, and read-only analysis
- **Partial import**: invalid rows reported without blocking valid ones
- **Optional CSV columns** `team_name` / `project_name` with backward compatibility
- **Sprint Analysis** demand aggregation by `(sprint, teamName, projectName)`
- **OpenAPI** documentation at `/api/docs`
- **React UI** with local state, `fetch`, and `VITE_API_URL`
- **AI-assisted workflow** traceability via [prompts.md](../prompts.md)

---

## Current MVP limitations

Not shown in this demo (planned for later deliveries):

- Authentication and multi-tenant workspaces
- AI-assisted requirement refinement
- Excel/PDF export
- Edit/delete User Stories, deduplication on re-import
- Production deployment and CI/CD

Smoke E2E (Playwright, frontend-only): `pnpm test:e2e` from repo root.

---

**Duration:** ~5–8 minutes for import + Sprint Analysis walkthrough.
