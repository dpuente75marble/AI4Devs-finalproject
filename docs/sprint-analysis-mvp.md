# US-005 — Sprint Analysis MVP Spec

**Proyecto:** DeliveryOps AI  
**Vertical slice:** Sprint Analysis MVP  
**Estado:** Spec-first — revisión v1 (demand vs capacity, overload detection)  
**Referencia producto:** US-005 (Analyze Sprint Capacity vs Demand) en `docs/05-user-stories.md`  
**Issue GitHub:** #11 (spec incremental requerida antes de código)  
**Backlog interno:** GH-09  
**Stack actual:** monorepo pnpm · `apps/api` (NestJS + Prisma + Swagger) · `apps/web` (React + Vite + Tailwind + React Router) · Playwright (`e2e/`)  
**Prerequisitos implementados:** US-002 (import CSV) · US-003 (Sprint Capacity — `docs/sprint-capacity-mvp.md`) · US-004 (Sprint Absences — `docs/sprint-absences-mvp.md`)

---

## Objective

Define the MVP behavior for calculating sprint demand versus capacity and detecting overload risk.

This vertical slice closes the fourth link in the sprint planning flow:

**Import User Stories → configure Sprint Capacity → register Sprint Absences → analyze demand vs adjusted capacity per sprint.**

The slice delivers a read-only analysis engine: aggregate existing data by `sprint`, compute utilization, assign a status (`HEALTHY`, `WARNING`, `OVERLOADED`), expose a minimal API, and render a minimal table view. No charts, exports, filters, forecasting, drag-and-drop, or AI recommendations.

---

## Scope

### Include

| Area | MVP deliverable |
|------|-----------------|
| **User Stories** | Demand sourced from imported CSV records (`UserStory.storyPoints`) |
| **Sprint Capacity** | Capacity sourced from Settings configuration (`SprintCapacity.availablePoints`) |
| **Sprint Absences** | Absences sourced from Settings configuration (`SprintAbsence.absenceDays`) |
| **Analysis** | Sprint-level aggregation and demand/capacity comparison |
| **Backend** | NestJS module `sprint-analysis`, pure calculation functions, `GET /api/sprint-analysis` |
| **Frontend** | Minimal Sprint Analysis page (`/sprint-analysis`) with table |
| **Backend tests** | TDD unit tests for calculation and status logic |
| **Frontend tests** | Rendering test for the analysis table |
| **E2E** | Playwright happy path verifying `OVERLOADED` status |

### Backend (`apps/api`)

- Módulo NestJS `sprint-analysis` con capas mínimas:
  - **domain:** funciones puras de agregación, cálculo y clasificación de estado.
  - **application:** servicio que consulta `UserStory`, `SprintCapacity` y `SprintAbsence` vía `PrismaService` y delega en las funciones puras.
  - **presentation:** controller con un único endpoint de lectura documentado en Swagger.
- Sin migración Prisma nueva: el slice **solo lee** entidades existentes.
- Reutilizar `computeAdjustedCapacity` de US-004 cuando sea posible (`apps/api/src/sprint-absences/utils/compute-adjusted-capacity.ts`).
- Tests unitarios TDD de la lógica de cálculo y status; test de integración o e2e mínimo del controller (opcional si el repo no tiene PostgreSQL en CI).

### Frontend (`apps/web`)

- Página **Sprint Analysis** en ruta `/sprint-analysis`.
- Enlace en navegación principal (`AppNav`) junto a Dashboard, User Stories y Settings.
- Tabla con columnas definidas en la sección UI; estados visuales mínimos por status (p. ej. badge o color de fila).
- Fetch desde `GET /api/sprint-analysis` al montar la página; estado local suficiente.
- Empty state cuando no hay sprints con datos.
- Sin gráficos ni filtros.

### Exclude

| Area | Motivo |
|------|--------|
| Charts | Fuera del contrato MVP |
| Exporting | Slice US-009 / reporting |
| Advanced filters | Sin filtro por gerencia/proyecto en MVP |
| Forecasting | Fuera de alcance académico |
| Drag and drop | Fuera de alcance |
| AI recommendations | Epic separada (Requirement Refinement) |
| CRUD de capacidad o ausencias | Ya cubierto en US-003 / US-004 |
| Autenticación y autorización (US-001) | Endpoints abiertos como en slices anteriores |
| Persistir resultados de análisis | Cálculo derivado en lectura |
| `packages/shared` con tipos compartidos | Duplicación mínima FE/BE aceptable |

---

## Inputs

### User Stories

Demand is calculated as the sum of `storyPoints` grouped by `sprint`.

| Fuente | Campo | Regla de agregación |
|--------|-------|---------------------|
| `UserStory` | `sprint` | Clave de agrupación (normalizar con `trim()`) |
| `UserStory` | `storyPoints` | Sumar todos los registros del mismo sprint |

- User Stories con `storyPoints` nulo o ausente se tratan como **0** en la suma.
- User Stories con `sprint` vacío tras `trim()` se **excluyen** del análisis (no generan fila).

### Sprint Capacity

Capacity is calculated as the sum of `availablePoints` grouped by `sprint`.

| Fuente | Campo | Regla de agregación |
|--------|-------|---------------------|
| `SprintCapacity` | `sprint` | Clave de agrupación (normalizar con `trim()`) |
| `SprintCapacity` | `availablePoints` | Sumar todos los registros del mismo sprint (todas las gerencias/proyectos) |

- Un sprint puede tener varias filas de capacidad (distintas combinaciones `teamName` + `projectName`); el MVP **agrega a nivel sprint** únicamente.

### Sprint Absences

Absences are calculated as the sum of `absenceDays` grouped by `sprint`.

| Fuente | Campo | Regla de agregación |
|--------|-------|---------------------|
| `SprintAbsence` | `sprint` | Clave de agrupación (normalizar con `trim()`) |
| `SprintAbsence` | `absenceDays` | Sumar todos los registros del mismo sprint |

- Regla heredada de US-004: **1 día de ausencia = 1 story point** de reducción de capacidad.
- Varios registros de ausencia en el mismo sprint se suman antes del ajuste.

### Unión de sprints

El conjunto de sprints analizados es la **unión** de sprints presentes en cualquiera de las tres fuentes (`UserStory`, `SprintCapacity`, `SprintAbsence`).

| Sprint en… | Demand | Capacity | Absences |
|------------|--------|----------|----------|
| Solo User Stories | SUM(storyPoints) | 0 | 0 |
| Solo Sprint Capacity | 0 | SUM(availablePoints) | 0 |
| Solo Sprint Absences | 0 | 0 | SUM(absenceDays) |
| Varias fuentes | valores agregados correspondientes | | |

---

## Calculation Rules

```text
Demand           = SUM(storyPoints)        grouped by sprint
Capacity         = SUM(availablePoints)    grouped by sprint
Absences         = SUM(absenceDays)        grouped by sprint
Adjusted Capacity = max(0, Capacity - Absences)
Utilization      = (Demand / Adjusted Capacity) × 100   when Adjusted Capacity > 0
```

### Utilization when Adjusted Capacity is 0

| Demand | Utilization | Notes |
|--------|-------------|-------|
| 0 | `0` | No work planned; no division |
| > 0 | `null` | Not calculable; sprint is **OVERLOADED** (see Status Rules) |

Utilization is rounded to **two decimal places** when calculable (example: `42 / 37 × 100 → 113.51`).

### Overload edge case

If **Adjusted Capacity is 0** and **Demand is greater than 0**, the sprint is **OVERLOADED** regardless of percentage thresholds.

### Funciones puras propuestas (backend)

| Función | Responsabilidad |
|---------|-----------------|
| `aggregateDemandBySprint(userStories)` | Mapa `sprint → demand` |
| `aggregateCapacityBySprint(capacities)` | Mapa `sprint → capacity` |
| `aggregateAbsencesBySprint(absences)` | Mapa `sprint → absences` |
| `computeAdjustedCapacity(capacity, absences)` | Reutilizar helper US-004 |
| `computeUtilization(demand, adjustedCapacity)` | Porcentaje o `null` |
| `computeSprintStatus(demand, adjustedCapacity)` | `HEALTHY` \| `WARNING` \| `OVERLOADED` |
| `buildSprintAnalysisRows(...)` | Orquesta agregación + cálculo por sprint; orden alfabético por `sprint` |

---

## Status Rules

Thresholds apply to **Adjusted Capacity** (not raw Capacity).

### HEALTHY

```text
Demand <= 80% of Adjusted Capacity
```

When `Adjusted Capacity = 0` and `Demand = 0` → **HEALTHY**.

### WARNING

```text
Demand > 80% of Adjusted Capacity
AND
Demand <= Adjusted Capacity
```

Requires `Adjusted Capacity > 0`.

### OVERLOADED

```text
Demand > Adjusted Capacity
```

Also applies when:

```text
Adjusted Capacity = 0 AND Demand > 0
```

### Ejemplos numéricos

| Demand | Capacity | Absences | Adjusted Capacity | Utilization | Status |
|--------|----------|----------|-------------------|-------------|--------|
| 30 | 40 | 0 | 40 | 75.00 | HEALTHY |
| 33 | 40 | 0 | 40 | 82.50 | WARNING |
| 40 | 40 | 0 | 40 | 100.00 | WARNING |
| 42 | 40 | 3 | 37 | 113.51 | OVERLOADED |
| 10 | 0 | 0 | 0 | null | OVERLOADED |
| 0 | 40 | 5 | 35 | 0.00 | HEALTHY |
| 0 | 0 | 0 | 0 | 0.00 | HEALTHY |

---

## API Contract

### `GET /api/sprint-analysis`

Read-only. No query parameters in MVP.

**Response:** `200 OK` — JSON array of sprint analysis rows, sorted alphabetically by `sprint`.

**Example response:**

```json
[
  {
    "sprint": "Sprint 4",
    "demand": 42,
    "capacity": 40,
    "absences": 3,
    "adjustedCapacity": 37,
    "utilization": 113.51,
    "status": "OVERLOADED"
  }
]
```

### Response field definitions

| Field | Type | Description |
|-------|------|-------------|
| `sprint` | `string` | Sprint identifier (normalized trim) |
| `demand` | `number` | Sum of story points (integer ≥ 0) |
| `capacity` | `number` | Sum of available points (integer ≥ 0) |
| `absences` | `number` | Sum of absence days (integer ≥ 0) |
| `adjustedCapacity` | `number` | `max(0, capacity - absences)` |
| `utilization` | `number \| null` | Percentage; `null` when `adjustedCapacity = 0` and `demand > 0` |
| `status` | `"HEALTHY" \| "WARNING" \| "OVERLOADED"` | Derived status |

### Error responses

| Case | HTTP | Notes |
|------|------|-------|
| Success, no data | `200` | `[]` empty array |
| Database error | `500` | Generic message in UI |

### Swagger

- Tag: `sprint-analysis`
- Document response DTO and enum `SprintAnalysisStatus`.

---

## UI

Add a minimal **Sprint Analysis** view at route `/sprint-analysis`.

### Table columns

| Column | Source field | Format |
|--------|--------------|--------|
| Sprint | `sprint` | Plain text |
| Demand | `demand` | Integer |
| Capacity | `capacity` | Integer |
| Absences | `absences` | Integer |
| Adjusted Capacity | `adjustedCapacity` | Integer |
| Utilization | `utilization` | Percentage with 2 decimals, or `—` when `null` |
| Status | `status` | Badge: HEALTHY (green), WARNING (amber), OVERLOADED (red) |

### UX mínima

- Page title: **Sprint Analysis**
- Subtitle breve: *Compare sprint demand against adjusted team capacity.*
- Loading state while fetching.
- Error banner if `GET` fails.
- Empty state: *No sprint data yet. Import user stories and configure capacity in Settings.*
- **No charts** in this MVP.

### Navegación

Add **Sprint Analysis** link to `AppNav`, visible on all main routes.

---

## Testing Strategy

### Backend — unit (TDD)

Calculation logic must be developed test-first in pure functions under `apps/api/src/sprint-analysis/`.

| Scenario | Expected |
|----------|----------|
| **Healthy** | Demand 30, adjusted capacity 40 → `HEALTHY`, utilization 75.00 |
| **Warning** | Demand 33, adjusted capacity 40 → `WARNING`, utilization 82.50 |
| **Overloaded** | Demand 42, capacity 40, absences 3 → adjusted 37, `OVERLOADED`, 113.51 |
| **Zero adjusted capacity + demand** | Demand 10, capacity 0, absences 0 → `OVERLOADED`, utilization `null` |
| **Sprint without absences** | Absences 0 → adjusted capacity equals capacity |
| **Sprint without capacity** | Capacity 0, demand 5 → adjusted 0 (after absences 0), `OVERLOADED` |
| **Sprint without user stories** | Demand 0, capacity 40 → `HEALTHY` |
| **Union of sprints** | Sprint only in capacity appears in result with demand 0 |

File naming convention (align with existing slices): `*.spec.ts` colocated with utils.

### Backend — integration / e2e (optional)

| Case | Verification |
|------|--------------|
| `GET /api/sprint-analysis` with seeded data | Returns correct aggregated row |
| Empty database | Returns `[]` |

> **Nota CI:** el runner actual puede no incluir PostgreSQL; tests de integración en local con Docker (`5433`), coherente con US-003/US-004.

### Frontend

| Case | Verification |
|------|--------------|
| Render Sprint Analysis table | Columns visible; rows match mock API response |
| Empty response | Empty state message shown |
| `utilization: null` | Cell shows `—` |
| Status badges | `OVERLOADED` row renders expected badge/class |

Use Vitest + React Testing Library, following patterns in existing web tests if present.

### Playwright

Happy path in `e2e/sprint-analysis.spec.ts`:

1. **Arrange:** mock or seed data for one overloaded sprint:
   - User Stories with total demand > adjusted capacity for `Sprint 4` (e.g. demand 42).
   - Sprint Capacity totaling 40 for `Sprint 4`.
   - Sprint Absences totaling 3 days for `Sprint 4` (adjusted capacity 37).
2. **Act:** navigate to `/sprint-analysis`.
3. **Assert:** table shows `Sprint 4` with status **OVERLOADED** (and utilization consistent with spec).

Prefer API route mocking (pattern from `e2e/settings-sprint-absences.spec.ts`) when full stack seeding is impractical in CI.

---

## Acceptance Criteria Mapping

| Criterio | Cobertura en este spec |
|----------|------------------------|
| BDD US-005 — capacity vs demand calculation | Inputs + Calculation Rules + API `GET /api/sprint-analysis` |
| BDD US-005 — overloaded sprint | Status Rules (`OVERLOADED`) + Playwright happy path |
| TDD calculation logic | Testing Strategy — backend unit scenarios |
| Minimal analysis view | UI section — table at `/sprint-analysis` |
| API and web builds must pass | DoD — `pnpm --filter api build`, `pnpm --filter web build` |

### BDD reference (`docs/05-user-stories.md`)

```gherkin
Given imported User Stories and configured team capacity
When the sprint analysis is executed
Then the system calculates capacity versus demand
```

```gherkin
Given a sprint with excessive demand
When the analysis is completed
Then the system marks the sprint as overloaded
```

---

## Traceability

| Referencia | Relación |
|------------|----------|
| **GitHub issue #11** | Gate spec-first antes de implementación |
| **Backlog ID GH-09** | US-005 en `docs/09-github-backlog-bootstrap.md` |
| **US-005** | Historia de usuario origen |
| **US-002** | Prerequisito: User Stories importadas (`docs/user-stories-import-mvp.md`) |
| **US-003** | Prerequisito: Sprint Capacity (`docs/sprint-capacity-mvp.md`) |
| **US-004** | Prerequisito: Sprint Absences + `computeAdjustedCapacity` (`docs/sprint-absences-mvp.md`) |
| `docs/05-user-stories.md` | BDD y prioridad Must-Have |
| `docs/06-technical-backlog.md` | TB-014, TB-026, TB-035 |
| `docs/03-technical-design.md` | Módulo `sprint-analysis/` en arquitectura NestJS |
| `docs/04-data-model.md` | Estados `healthy` / overload en modelo objetivo (adaptados a enum MVP) |
| `docs/adr/ADR-004-vertical-slice-first.md` | Enfoque vertical slice E2E |

### Cadena de dependencias

```text
US-002 (import CSV) ✅
        │
        ▼
US-003 (Sprint Capacity) ✅
        │
        ▼
US-004 (Sprint Absences) ✅
        │
        ▼
US-005 (este spec) ──► GET /api/sprint-analysis + vista /sprint-analysis
```

---

## Definición de hecho (DoD) del slice

- [ ] Spec `docs/sprint-analysis-mvp.md` aprobada por revisión humana
- [ ] Funciones puras de agregación, utilización y status con tests unitarios TDD en verde
- [ ] `GET /api/sprint-analysis` operativo y documentado en Swagger
- [ ] Página `/sprint-analysis` con tabla y badges de status
- [ ] Enlace en `AppNav`
- [ ] Test de render frontend en verde
- [ ] Playwright happy path `OVERLOADED` en verde
- [ ] Escenarios healthy, warning y zero adjusted capacity cubiertos en unitarios
- [ ] `pnpm --filter api build` y `pnpm --filter api test` OK
- [ ] `pnpm --filter web build` y tests web OK
- [ ] Entrada añadida en `prompts.md`

---

## Próximo paso recomendado

1. **Revisión y aprobación humana** de esta spec (cierre del gate spec-first de Issue #11 / GH-09).
2. **Implementación incremental** en orden: funciones puras + unit tests → servicio + controller → UI + nav → Playwright.
3. **Iteración futura:** filtros por gerencia/proyecto, gráficos, export (US-009), recomendaciones IA.

---

**Documento:** `docs/sprint-analysis-mvp.md`  
**Última actualización:** 2026-06-13 (v1 — agregación por sprint, status HEALTHY/WARNING/OVERLOADED, API y tabla mínima)
