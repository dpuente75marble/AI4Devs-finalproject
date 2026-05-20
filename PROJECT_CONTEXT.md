# PROJECT_CONTEXT.md — DeliveryOps AI

**Referencia operativa principal** para nuevos chats, Cursor, handoffs y continuidad del máster AI4Devs (2026).

> Describe **qué existe hoy** en el repo. Setup → [README.md](README.md). Reglas agente → [AGENTS.md](AGENTS.md). Arquitectura → [ARCHITECTURE.md](ARCHITECTURE.md).

**Última alineación:** 20 may 2026 · MVP LIDR · módulos 1–10 del máster aplicados progresivamente (producto, arquitectura, workflow IA, foundation técnica, primer slice E2E).

### Referencia rápida (local)

| Recurso | Ubicación |
|---------|-----------|
| API + Swagger | `http://localhost:3000` · `/api/docs` |
| Health | `GET /api/health` |
| Slice UI | `/user-stories` |
| PostgreSQL | Docker `5433` (`docker-compose.yml`) |
| Demo E2E | [docs/DEMO.md](docs/DEMO.md) |
| Validación | `pnpm --filter api build && pnpm --filter api test` · `pnpm --filter web build` |

---

## 1. Qué es este proyecto

**DeliveryOps AI** — SaaS asistida por IA para operaciones de delivery (planificación, capacidad, refinamiento de requisitos, reporting).

- **Tipo:** proyecto final máster AI4Devs 2026 (LIDR).
- **Enfoque:** AI-first SDLC, spec-first, vertical slices, documentación viva, MVP realista.
- **Autor:** David de la Puente (ver [README.md](README.md)).

---

## 2. Estado actual REAL

### Implementado

| Área | Detalle |
|------|---------|
| **Monorepo** | `pnpm` workspaces: `apps/api`, `apps/web`, `packages/shared` (vacío) |
| **Backend** | NestJS 11, `ConfigModule`, prefijo `/api`, `UserStoriesModule`, `GET /api/health` |
| **Persistencia** | Prisma 7 + PostgreSQL 16 (`docker-compose.yml`, puerto `5433`) |
| **API docs** | Swagger en `/api/docs` |
| **Frontend** | React 19, Vite 8, TypeScript, Tailwind 4, React Router 7 |
| **Rutas web** | `/` → `/dashboard`, `/user-stories` (slice), `/settings` (placeholder) |
| **Vertical slice E2E** | **User Stories CSV Import** — §3 |
| **Tests API** | Jest unit: `parse-csv`, `validate-user-story-row`, `app.controller`; e2e Supertest: health (`test/app.e2e-spec.ts`) |
| **Docs producto** | `docs/01`–`docs/08`, [user-stories-import-mvp.md](docs/user-stories-import-mvp.md), [DEMO.md](docs/DEMO.md) |
| **Governance IA** | `AGENTS.md`, `ARCHITECTURE.md`, `docs/adr/` (ADR-001–005), `.cursor/rules/` (6 reglas), `prompts.md` (P-001–P-017) |
| **GitHub** | `workflows/ci.yml`, issue `feature-request`, PR template |

### Planificado (documentado en `docs/`, no en código)

- Autenticación / autorización
- `Project`, `Sprint`, `TeamMember`, capacity, absences
- Refinamiento IA (PDF, gaps, acceptance criteria)
- Export Excel/PDF
- `packages/shared` con tipos/contratos
- Deploy cloud, CI con PostgreSQL en runner, e2e import
- Tests frontend (Vitest / RTL / Playwright)
- shadcn/ui, TanStack Query, Zustand, React Hook Form, Zod

### En curso (según README)

- Estabilización MVP y preparación de entregas
- Hardening documental (coherencia entre artefactos)
- Rama `feature-entrega1-DLP` activa para cierre Delivery 1

---

## 3. Vertical slice implementado

**User Stories CSV Import** — spec: [docs/user-stories-import-mvp.md](docs/user-stories-import-mvp.md)

```text
CSV (usuario) → /user-stories (web)
  → POST /api/user-stories/import (multipart, validación por fila, import parcial)
  → Prisma UserStory → PostgreSQL
  → GET /api/user-stories → tabla refrescada
```

| Aspecto | Detalle |
|---------|---------|
| **Prompts del slice** | P-013 (spec) → P-014 (Prisma) → P-015 (API) → P-016 (UI) → P-017 (CORS dev) |
| **Demo** | [docs/DEMO.md](docs/DEMO.md) · [fixtures/sample-user-stories.csv](fixtures/sample-user-stories.csv) |
| **Límites** | Sin auth; re-import duplica filas; `sprint` texto libre; máx. 200 filas / 1 MB; tipos FE/BE duplicados; parser CSV simple (comas sin comillas) |

---

## 4. Entregas del máster

Fuente de fechas y alcance objetivo: [docs/08-delivery-plan.md](docs/08-delivery-plan.md).

| Entrega | Fecha objetivo | Estado respecto al repo |
|---------|----------------|-------------------------|
| **Delivery 1** — Documentación técnica | 27 may 2026 | **Casi cerrada / avanzada:** docs 01–08, ADRs, AGENTS, ARCHITECTURE, workflow IA ([docs/07-ai-development-workflow.md](docs/07-ai-development-workflow.md)), backlog, DEMO, prompts P-001–P-017, **primer slice E2E** y CI foundation. *Nota:* el plan original de Delivery 1 excluía implementación; el repo ya supera ese alcance documental con código funcional local. |
| **Delivery 2** — MVP funcional | 24 jun 2026 | **Parcial:** foundation + CSV import hechos; **pendiente** auth, sprint/capacity, refinamiento IA MVP, exports, tests ampliados, deploy básico. |
| **Final Delivery** — MVP desplegado + evidencia | 14 jul 2026 | **Pendiente:** deploy público, E2E/CI robusto, tests UI, evidencia completa de workflow IA y PRs. |

**Regla:** el MVP **objetivo** del máster ≠ lo **implementado hoy**. No asumir auth, IA, capacity ni exports como hechos.

---

## 5. Governance AI-first

| Artefacto | Rol |
|-----------|-----|
| [AGENTS.md](AGENTS.md) | Alcance real, workflow, prohibiciones, comandos para agentes |
| [docs/adr/](docs/adr/) | ADR-001 AI-first SDLC · ADR-002 pnpm monorepo · ADR-003 Nest+Prisma+PG · ADR-004 vertical slices · ADR-005 Cursor rules |
| [.cursor/rules/](.cursor/rules/) | `project-base`, `architecture`, `nestjs`, `react`, `testing`, `documentation` |
| [prompts.md](prompts.md) | Trazabilidad `P-xxx` y decisiones humanas; **no modificar** sin instrucción explícita |
| [.github/](.github/) | CI, templates issue/PR |
| Specs `docs/` | Verdad por slice; `docs/01`–`08` = visión producto (mayoría **no** en Prisma aún) |

**Principios operativos**

- **Spec-first** → revisión humana → issue/PR → código → docs/prompts en la misma iteración
- **OpenAPI-first** para contratos REST visibles
- **Human-in-the-loop:** specs, límites de negocio, seguridad, smoke E2E y commits relevantes
- **Documentación viva:** actualizar spec/DEMO/PROJECT_CONTEXT al cerrar slices, no solo al final del máster
- **TDD selectivo:** lógica pura (parser/validator); no TDD exhaustivo en UI aún

---

## 6. Arquitectura actual REAL

**Patrón:** modular monolith pragmático — módulo Nest por feature; sin hexagonal/Clean Architecture completa.

| Capa | Stack implementado |
|------|-------------------|
| Monorepo | pnpm 10.33+, workspaces |
| API | NestJS 11, Prisma 7, `csv-parse`, Swagger |
| DB | PostgreSQL 16 Docker local, migraciones Prisma |
| Web | React 19, Vite 8, Tailwind 4, `fetch` nativo (sin TanStack Query) |
| Integración | `VITE_API_URL`, CORS dev puertos Vite `5173`–`5178` |

**Modelos Prisma:** `HealthCheck`, `UserStory` (`apps/api/prisma/schema.prisma`).  
**Modelo en** [docs/04-data-model.md](docs/04-data-model.md) = diseño **objetivo**, no estado DB.

**Endpoints de negocio hoy:** `GET /api/health`, `GET /api/user-stories`, `POST /api/user-stories/import`.

**Estructura API relevante:** `apps/api/src/user-stories/` (controller, service, DTOs, utils parser/validator), `infrastructure/prisma/`.

---

## 7. Workflow actual

```text
Spec (docs/) → revisión humana → issue (opcional) → PR
  → API + Prisma + Swagger → tests unitarios (lógica pura)
  → UI → smoke manual (DEMO.md) → entrada prompts.md (si aplica)
  → merge → CI (build + test API + build web)
```

| Práctica | Detalle |
|----------|---------|
| **PR-driven** | Un vertical slice por PR cuando sea posible; usar PR template |
| **Validación local** | `pnpm --filter api build\|test`, `pnpm --filter web build`, demo [DEMO.md](docs/DEMO.md) |
| **Validación humana** | Aprobar spec y comportamiento E2E antes de dar slice por cerrado |
| **CI** | `pnpm install` → `prisma generate` → build API → test API → build web |
| **CI límites** | Sin PostgreSQL en runner; sin lint gate; sin e2e browser |

Detalle metodológico: [docs/07-ai-development-workflow.md](docs/07-ai-development-workflow.md).

---

## 8. Estado del repositorio

| Aspecto | Estado (20 may 2026) |
|---------|----------------------|
| **Rama activa** | `feature-entrega1-DLP` → `origin/feature-entrega1-DLP` |
| **Rama principal** | `main` |
| **CI** | `.github/workflows/ci.yml`: `push` en `main`/`master`; `pull_request` en cualquier rama |
| **Últimos commits recientes** | CI workflow, ADRs, Cursor rules foundation |

### Mapa de documentación (no duplicar contenido)

| Documento | Uso |
|-----------|-----|
| **PROJECT_CONTEXT.md** | Este archivo — estado real y handoff |
| [README.md](README.md) | Overview, setup, visión MVP |
| [AGENTS.md](AGENTS.md) | Reglas operativas para IA y devs |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura implementada y limitaciones |
| [docs/user-stories-import-mvp.md](docs/user-stories-import-mvp.md) | Spec slice actual |
| [docs/DEMO.md](docs/DEMO.md) | Guion demo local |
| [docs/08-delivery-plan.md](docs/08-delivery-plan.md) | Hitos y alcance por entrega |
| [prompts.md](prompts.md) | Historial prompts |

**Desfase documental conocido:** [README.md](README.md) sección *Planned* aún lista «deployment and CI/CD»; **CI básica ya existe** (sin deploy). Este archivo prevalece para estado real.

---

## 9. Próximos pasos recomendados

Alineados con Delivery 2, [docs/06-technical-backlog.md](docs/06-technical-backlog.md) y módulos 10+ del máster (testing, CI/CD, deploy, E2E) — **priorizar spec-first**:

1. **Cerrar Delivery 1** — merge/revisión rama entrega, coherencia docs, evidencia DEMO + `prompts.md`, PR con historial limpio.
2. **Siguiente slice (elegir uno, mini-spec primero)** — auth mínima **o** upsert/dedup por `externalId` en User Stories **o** fixture + tests e2e API import (según prioridad académica).
3. **Entidades planificación** — `Project` / `Sprint` cuando el backlog lo priorice; migrar Prisma de forma incremental.
4. **CI evolutiva** — job con PostgreSQL solo cuando existan tests de integración que lo requieran; después lint opcional.
5. **Delivery 2** — capacity/absences **o** refinamiento IA MVP (según acuerdo con tutor/plan).
6. **Final Delivery prep** — deploy (p. ej. Vercel + Render/Neon según plan), Playwright mínimo, ampliar `prompts.md`.
7. **ADR nuevo** — solo decisiones estructurales (estrategia auth, `packages/shared`).

Candidatos de trazabilidad en [prompts.md](prompts.md) §6: demo/CI ya cubiertos parcialmente; pendientes naturales — segundo slice, e2e import, deploy.

---

## 10. Riesgos y límites actuales

| Límite | Impacto |
|--------|---------|
| Sin autenticación | API local abierta en dev |
| CI sin DB | No valida import Prisma ni e2e de negocio en GitHub |
| Sin deploy | Demo solo local |
| Sin tests frontend | Solo compilación Vite/TS |
| Import parcial | Filas válidas persisten si otras fallan |
| Re-import duplica | Mismo `externalId` → nuevos registros |
| `packages/shared` vacío | Contratos duplicados FE/BE |
| Parser CSV simple | Edge cases de comillas documentados en spec |
| Visión docs >> código | Riesgo de que IA asuma features de `docs/02`–`08` ya implementadas |

---

## 11. Qué NO hacer todavía

- Microservicios, event-driven, multi-tenant enterprise, RAG/workers async
- Clean/hexagonal architecture completa sin necesidad del slice
- TanStack Query, Zustand, shadcn, Zod sin spec que lo exija
- Inventar endpoints, campos Prisma o pantallas no especificadas
- Deploy o pipelines complejos antes de slices funcionales clave de Delivery 2
- Modificar `prompts.md` o **commits** sin petición explícita del usuario
- Migrar todo [docs/04-data-model.md](docs/04-data-model.md) de una vez

---

## 12. Uso en chats y handoffs

**Al abrir un chat o tarea:**

1. `PROJECT_CONTEXT.md` (este archivo)
2. [AGENTS.md](AGENTS.md)
3. Spec del slice en `docs/` si aplica
4. [ARCHITECTURE.md](ARCHITECTURE.md) + Swagger local

**Al cerrar un slice:** actualizar spec, DEMO si aplica, `PROJECT_CONTEXT.md` si cambió alcance, `prompts.md` (si se pidió), ADR solo si hubo decisión estructural.

**Regla de oro:** la IA propone; el humano aprueba specs, límites y E2E antes de cerrar.

---

*Documento vivo. Actualizar cuando cambie alcance implementado, entregas o governance — sin duplicar README ni ADRs completos.*
