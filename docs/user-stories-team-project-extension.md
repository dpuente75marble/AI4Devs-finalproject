# User Stories — teamName / projectName extension (pre PR #23)

**Proyecto:** DeliveryOps AI · Máster LIDR  
**Tipo:** Extensión mínima del slice US-002 (import CSV)  
**Estado:** Spec-first — implementación pendiente  
**Bloquea:** merge de PR #23 (US-005 Sprint Analysis)  
**Referencias:** `docs/user-stories-import-mvp.md` · `docs/sprint-analysis-mvp.md` · US-002 / US-005 en `docs/05-user-stories.md`  
**Stack:** monorepo pnpm · `apps/api` (NestJS + Prisma) · `apps/web` (React) · Playwright (`e2e/`)

---

## Problem

US-005 (Sprint Analysis) aggregates demand, capacity and absences by `(sprint, teamName, projectName)`.

| Source | Grouping fields today |
|--------|----------------------|
| `SprintCapacity` | `sprint`, `teamName`, `projectName` ✓ |
| `SprintAbsence` | `sprint`, `teamName`, `projectName` ✓ |
| `UserStory` (CSV import) | `sprint` only ✗ |

Imported User Stories cannot be assigned to a team or project. Sprint Analysis therefore receives **zero demand** for combinations that already have capacity/absences configured — a data inconsistency that breaks the end-to-end planning flow.

The sprint-analysis domain layer already expects `teamName` and `projectName` on User Story inputs; the Prisma model and CSV import pipeline do not persist them yet.

---

## Objective

Extend the User Stories CSV import with **optional** `teamName` and `projectName` fields so demand can be aggregated on the same key as capacity and absences, without introducing Team/Project entities or new UI beyond a simple table display.

---

## Scope

### Include

| Area | Deliverable |
|------|-------------|
| **Prisma** | Add optional `teamName String?` and `projectName String?` to `UserStory` + migration |
| **CSV** | Accept optional columns `team_name`, `project_name` (snake_case, aligned with existing columns) |
| **Import** | Map CSV → DB; empty/missing values → `null` |
| **Validation** | Allow unknown extra columns only if already allowed; add new columns to `ALLOWED_CSV_COLUMNS` |
| **API list** | Expose `teamName` and `projectName` in `GET /api/user-stories` response |
| **Sprint Analysis** | Select persisted fields from Prisma so `aggregateDemandBySprint` receives real data |
| **Frontend** | Show Gerencia / Proyecto columns in User Stories table if straightforward; update import help text |
| **Tests** | Unit tests for row validation + import mapping; adjust existing specs/e2e fixtures as needed |

### Exclude

| Area | Reason |
|------|--------|
| `Team` / `Project` entities or FKs | Explicit out of scope |
| Filters, dashboards, charts | US-005 MVP already excludes these |
| Required team/project on every row | Backward compatibility with old CSVs |
| CRUD for team/project | Text fields only |
| Changes to Sprint Analysis calculation rules | Logic already implemented in `sprint-analysis.utils.ts` |
| `packages/shared` | Same convention as prior slices |

---

## Data model

### `UserStory` (Prisma) — delta

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `teamName` | `String?` | no | Gerencia; free text, same semantics as `SprintCapacity.teamName` |
| `projectName` | `String?` | no | Proyecto; free text, same semantics as `SprintCapacity.projectName` |

Existing fields unchanged. No new indexes required for MVP.

**Normalization on read (Sprint Analysis):** existing rule — `trim()` all three grouping fields; exclude row if any is empty after trim. No validation error on import when columns are absent or blank.

---

## CSV format

### Columns (delta)

| CSV column | DB field | Required |
|------------|----------|----------|
| `team_name` | `teamName` | no |
| `project_name` | `projectName` | no |

All existing columns (`external_id`, `title`, `description`, `story_points`, `status`, `sprint`) remain unchanged.

### Backward compatibility

- CSV **without** `team_name` / `project_name` headers → import succeeds; both fields stored as `null`.
- CSV **with** headers but empty cell → `null` (same as optional `sprint`).
- CSV **with** values → `trim()` then persist; whitespace-only → `null`.

### Example (extended)

```csv
external_id,title,description,story_points,status,sprint,team_name,project_name
US-201,Riesgo scoring,,8,ready,Sprint 2,Gerencia Riesgo,Riesgo
US-202,Alertas,,5,in_progress,Sprint 2,Gerencia Riesgo,Riesgo
US-203,Legacy import,,3,draft,Sprint 1,,,
```

Row `US-203` illustrates an old-style row inside an extended file: no team/project → excluded from demand aggregation but still listed in User Stories.

---

## API

### `POST /api/user-stories/import`

No contract change. Response shape unchanged (`imported`, `failed`, `errors`).

Implementation detail: persist `teamName` and `projectName` in `createMany` when validation succeeds.

### `GET /api/user-stories`

Add to each item in `data[]`:

```json
{
  "teamName": "Gerencia Riesgo",
  "projectName": "Riesgo"
}
```

Both nullable (`null` when not set). Update Swagger DTO accordingly.

### Sprint Analysis (`GET /api/sprint-analysis`)

No endpoint change. Service must `select` `teamName` and `projectName` from `UserStory` (replacing the current empty-string fallback caused by missing DB columns).

---

## Frontend (`apps/web`)

Minimal changes on `/user-stories`:

1. Import section copy: mention optional `team_name`, `project_name`.
2. Table: add columns **Gerencia** (`teamName`) and **Proyecto** (`projectName`); display `—` when `null`.
3. Update `UserStory` type in `userStoriesApi.ts`.

No new routes, filters or forms.

---

## Tests

| Layer | What to cover |
|-------|----------------|
| `validate-user-story-row.spec.ts` | Maps `team_name` / `project_name`; missing columns → `null`; trim / blank → `null` |
| `parse-csv.spec.ts` | Extended header accepted; old header still valid |
| `user-stories.service` (if present) or integration | Import persists new fields |
| `sprint-analysis.service.spec.ts` | Demand counted when User Stories include team/project |
| `UserStoriesPage` test (if present) | Renders new columns |
| `e2e/` | Keep green; optionally extend user-stories e2e with extended CSV fixture |

Existing Sprint Analysis unit tests in `sprint-analysis.utils.spec.ts` need no rule changes — only data plumbing.

---

## Acceptance criteria

1. **Extended CSV:** file with `team_name` and `project_name` imports successfully and values appear in `GET /api/user-stories`.
2. **Legacy CSV:** file without those columns still imports with the same behavior as today (`teamName` / `projectName` = `null`).
3. **Sprint Analysis demand:** for a `(sprint, teamName, projectName)` triple present in capacity/absences settings, imported stories with matching fields contribute `storyPoints` to `demand`.
4. **Incomplete triple:** stories missing any of `sprint`, `teamName`, or `projectName` (after trim) do not contribute demand (unchanged US-005 rule).
5. **Quality gate:** `pnpm` test/build and Playwright e2e remain green.

---

## Implementation notes (non-normative)

Touch points likely involved:

- `apps/api/prisma/schema.prisma` + migration
- `apps/api/src/user-stories/constants.ts`
- `apps/api/src/user-stories/utils/validate-user-story-row.ts`
- `apps/api/src/user-stories/user-stories.service.ts`
- `apps/api/src/user-stories/dto/*` (list response)
- `apps/api/src/sprint-analysis/sprint-analysis.service.ts` (Prisma `select`)
- `apps/web/src/api/userStoriesApi.ts`
- `apps/web/src/pages/UserStoriesPage.tsx`
- Test/fixture CSV samples under `apps/api` or `e2e/`

Align sample values with existing Settings fixtures (`Gerencia Riesgo`, `Riesgo`, `Sprint 2`) used in sprint capacity/absences demos.

---

## Definition of done

- [ ] Spec reviewed (this document)
- [ ] Prisma migration applied locally
- [ ] Import + list API updated
- [ ] Sprint Analysis reads demand from persisted fields
- [ ] User Stories UI shows optional columns
- [ ] Tests updated; CI green
- [ ] PR #23 unblocked for merge
