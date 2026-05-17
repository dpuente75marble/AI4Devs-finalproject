# DeliveryOps AI — Demo Guide (May Delivery)

Guía breve para demostrar el **primer vertical slice E2E**: importación CSV de User Stories.

Spec de referencia: [user-stories-import-mvp.md](user-stories-import-mvp.md)

---

## Demo objective

Show that DeliveryOps AI can **import User Stories from CSV**, persist them in PostgreSQL, and **list them in the web UI** — validating the full local stack (React → NestJS → Prisma → DB).

---

## Prerequisites

- Node.js 20+ and pnpm 10+
- Docker (PostgreSQL local)
- API and web dependencies installed (`pnpm install` from repo root)

Environment:

- `apps/api/.env` with `DATABASE_URL` pointing to `localhost:5433`
- `apps/web/.env` with `VITE_API_URL=http://localhost:3000`

Sample file for import:

- [fixtures/sample-user-stories.csv](../fixtures/sample-user-stories.csv)

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
| API health | http://localhost:3000/api/health |
| Swagger | http://localhost:3000/api/docs |

---

## E2E demo steps

1. Open the Vite URL and go to **User Stories** in the navigation.
2. Confirm the empty state: *"No user stories yet. Import a CSV to get started."* (if the database has no rows).
3. Click **Choose file** and select `fixtures/sample-user-stories.csv`.
4. Click **Import CSV**.
5. Check the success banner: **6 imported**, **0 failed** (with a valid sample file).
6. Verify the table shows 6 rows with External ID, Title, Story Points, Status, Sprint, and Created.
7. *(Optional)* Open Swagger → `POST /api/user-stories/import` or `GET /api/user-stories` to show the API contract.
8. *(Optional)* Re-import the same file to observe duplicate rows (known MVP limitation).

---

## Expected result

- HTTP **201** on import with `{ "imported": 6, "failed": 0, "errors": [] }`.
- Table refreshed with 6 User Stories from Sprint 1 and Sprint 2.
- No browser console CORS or network errors when API runs on port `3000` and `VITE_API_URL` is set.

---

## What this vertical slice demonstrates (technical)

- **Spec-first delivery** aligned with `user-stories-import-mvp.md`
- **Monorepo** with independent `apps/api` and `apps/web`
- **NestJS module** (`user-stories`) with CSV parse, row validation, and Prisma persistence
- **Partial import**: invalid rows reported without blocking valid ones
- **OpenAPI** documentation at `/api/docs`
- **React UI** with local state, `fetch`, and `VITE_API_URL`
- **AI-assisted workflow** traceability via [prompts.md](../prompts.md) (P-013 → P-017)

---

## Current MVP limitations

Not shown in this demo (planned for later deliveries):

- Authentication and multi-tenant workspaces
- Sprint capacity planning and overload analysis
- AI-assisted requirement refinement
- Excel/PDF export
- Edit/delete User Stories, deduplication on re-import
- Production deployment and CI/CD
- Automated E2E/UI tests

---

**Duration:** ~3–5 minutes for the full walkthrough.
