# PROJECT_CONTEXT.md — DeliveryOps AI

**Referencia operativa principal** para nuevos chats, Cursor, handoffs y continuidad del máster AI4Devs (2026).

> Describe **qué existe hoy** en el repo. Setup → [README.md](README.md). Reglas agente → [AGENTS.md](AGENTS.md). Arquitectura → [ARCHITECTURE.md](ARCHITECTURE.md).

**Última alineación:** 10 jul 2026 · MVP LIDR · Final Delivery en curso · deploy público validado · slices US-001–US-009 implementados

### Referencia rápida (local)

| Recurso | Ubicación |
|---------|-----------|
| API + Swagger | `http://localhost:3000` · `/api/docs` |
| Health | `GET /api/health` |
| Login | `/login` |
| Slice UI | `/dashboard` · `/user-stories` · `/settings` · `/sprint-analysis` · `/refinement` |
| PostgreSQL | Docker `5433` (`docker-compose.yml`) |
| Demo E2E | [docs/DEMO.md](docs/DEMO.md) |
| Usuario demo | `pm@deliveryops.local` / `DeliveryOps123!` · `pnpm --filter api auth:create-demo-user` |
| Validación | `pnpm --filter api build && pnpm --filter api test` · `pnpm --filter web build` · `pnpm test:e2e` |

### Referencia rápida (producción)

| Recurso | Ubicación |
|---------|-----------|
| Frontend | `https://ai-4-devs-finalproject-gl29whagg-david-dlp.vercel.app` |
| API | `https://api-production-e119.up.railway.app` |
| Health | `https://api-production-e119.up.railway.app/api/health` |
| Swagger | `https://api-production-e119.up.railway.app/api/docs` |

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
| **Backend** | NestJS 11, `ConfigModule`, prefijo `/api`, módulos: `Auth`, `UserStories`, `SprintCapacity`, `SprintAbsences`, `SprintAnalysis`, `Refinement` (mock provider), `GET /api/health` |
| **Persistencia** | Prisma 7 + PostgreSQL 16 (`docker-compose.yml`, puerto `5433`); modelos `User`, `UserStory`, `SprintCapacity`, `SprintAbsence`, `HealthCheck` |
| **API docs** | Swagger en `/api/docs` (CookieAuth para sesión) |
| **Frontend** | React 19, Vite 8, TypeScript, Tailwind 4, React Router 7 |
| **Auth web** | `AuthProvider`, `ProtectedRoute`, `LoginPage`, `AppNav` logout; sesión vía `GET /api/auth/me`; `credentials: 'include'`; sin `localStorage` / `sessionStorage` / `document.cookie` |
| **Rutas web** | `/login` pública · `/` → `/dashboard`, `/user-stories`, `/settings`, `/sprint-analysis`, `/refinement` protegidas |
| **Vertical slices E2E** | **US-001** auth JWT cookie HttpOnly · **US-002** CSV import · **US-003** sprint capacity · **US-004** sprint absences · **US-005** sprint analysis · **US-006–008** refinement MVP · **US-009** Excel export — §3 |
| **Tests API** | Jest unit + auth protection specs; e2e Supertest: health |
| **Tests E2E** | Playwright `e2e/` — 9 specs (incl. `auth-login.spec.ts`) |
| **Docs producto** | `docs/01`–`docs/08`, specs `docs/*-mvp.md` (incl. `auth-mvp.md`), [DEMO.md](docs/DEMO.md) |
| **Governance IA** | `AGENTS.md`, `ARCHITECTURE.md`, `docs/adr/` (ADR-001–005), `.cursor/rules/` (6 reglas), `prompts.md` (P-001–P-025) |
| **GitHub** | `workflows/ci.yml`, issue `feature-request`, PR template |

### Planificado (documentado en `docs/`, no en código)

- Export PDF / reporting avanzado (fuera de US-009 Excel)
- `Project`, `Sprint`, `TeamMember` como entidades relacionales completas
- `packages/shared` con tipos/contratos
- Tests de integración API con DB en CI (#15)
- Tests frontend unitarios (Vitest / RTL)
- shadcn/ui, TanStack Query, Zustand, React Hook Form, Zod
- Proveedor IA real (OpenAI / Azure) — hoy solo mock en refinement
- Playwright en GitHub Actions (Final Delivery)

---

## 3. Vertical slices implementados

| US | Slice | Spec | Rutas / endpoints |
|----|-------|------|-------------------|
| US-001 | Auth JWT | [auth-mvp.md](docs/auth-mvp.md) | `/login` · `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` |
| US-002 | CSV import | [user-stories-import-mvp.md](docs/user-stories-import-mvp.md) | `/user-stories` · `GET/POST /api/user-stories` |
| US-003 | Sprint capacity | [sprint-capacity-mvp.md](docs/sprint-capacity-mvp.md) | `/settings` · `GET/POST /api/sprint-capacity` |
| US-004 | Sprint absences | [sprint-absences-mvp.md](docs/sprint-absences-mvp.md) | `/settings` · `GET/POST /api/sprint-absences` |
| US-005 | Sprint analysis | [sprint-analysis-mvp.md](docs/sprint-analysis-mvp.md) | `/sprint-analysis` · `GET /api/sprint-analysis` |
| US-006–008 | Refinement MVP | [refinement-mvp.md](docs/refinement-mvp.md) | `/refinement` · `POST /api/refinement/analyze` |
| US-009 | Excel export | [export-sprint-analysis-mvp.md](docs/export-sprint-analysis-mvp.md) | `/sprint-analysis` · `GET /api/sprint-analysis/export` |

**Flujo planificación (US-002 → US-005):**

```text
CSV → UserStory (PostgreSQL)
  → Settings: SprintCapacity + SprintAbsence
  → SprintAnalysis: demanda vs capacidad ajustada (OVERLOADED / OK)
```

**Flujo refinamiento (US-006–008):**

```text
PDF → POST /api/refinement/analyze → mock provider
  → UI editable (story, AC, gaps) — sin persistencia en BD
```

| Aspecto | Detalle |
|---------|---------|
| **Demo** | [docs/DEMO.md](docs/DEMO.md) · [fixtures/sample-user-stories.csv](fixtures/sample-user-stories.csv) · [fixtures/requirements.pdf](fixtures/requirements.pdf) |
| **Límites** | Sin RBAC ni refresh token; re-import CSV duplica filas; refinement sin LLM real ni persistencia; análisis sin calendario laboral por persona; `pnpm lint` global con errores preexistentes fuera de US-001 |

---

## 4. Entregas del máster

Fuente de fechas y alcance objetivo: [docs/08-delivery-plan.md](docs/08-delivery-plan.md).

| Entrega | Fecha objetivo | Estado respecto al repo |
|---------|----------------|-------------------------|
| **Delivery 1** — Documentación técnica | 27 may 2026 | **Cerrada:** docs 01–08, ADRs, AGENTS, ARCHITECTURE, workflow IA, backlog, DEMO + checklist, prompts P-001–P-022, matriz trazabilidad (#5). |
| **Delivery 2** — MVP funcional | 24 jun 2026 | **Funcionalmente completa:** foundation + US-001–US-009 implementados y validados en local; CI básica OK; deploy básico y lint gate global → Final Delivery. |
| **Final Delivery** — MVP desplegado + evidencia | 14 jul 2026 | **En curso:** deploy público validado en producción; tests integración API en CI (#15), Playwright en CI y cierre de evidencia aún en progreso. |

**Regla:** deploy público **sí** está completado y validado en producción (Vercel + Railway + Railway PostgreSQL). CI incluye PostgreSQL service + `migrate deploy` (VS-02); tests integración API en runner → #15. US-009 (export Excel) **sí** está implementada en el repo.

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
| Integración | `VITE_API_URL`, CORS dev puertos Vite `5173`–`5178`, `credentials: true` |

**Auth (US-001):** JWT en cookie HttpOnly (`deliveryops_access_token`); payload `{ sub }`; `AuthService` sin JWT/cookies; `AuthController` firma y gestiona cookie; `JwtStrategy` lee solo cookie; `JwtAuthGuard` explícito en controllers de negocio (sin `APP_GUARD` global).

**Modelos Prisma:** `HealthCheck`, `User`, `UserStory`, `SprintCapacity`, `SprintAbsence` (`apps/api/prisma/schema.prisma`).  
**Modelo en** [docs/04-data-model.md](docs/04-data-model.md) = diseño **objetivo**, no estado DB completo.

**Endpoints de negocio hoy:** `GET /api/health`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET/POST /api/user-stories`, `GET/POST /api/sprint-capacity`, `GET/POST /api/sprint-absences`, `GET /api/sprint-analysis`, `GET /api/sprint-analysis/export`, `POST /api/refinement/analyze`.

**Estructura API relevante:** `apps/api/src/auth/`, `user-stories/`, `sprint-capacity/`, `sprint-absences/`, `sprint-analysis/`, `refinement/`, `infrastructure/prisma/`.

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
| **Validación local** | `pnpm --filter api build\|test`, `pnpm --filter web build`, `pnpm test:e2e`, demo [DEMO.md](docs/DEMO.md) |
| **Validación humana** | Aprobar spec y comportamiento E2E antes de dar slice por cerrado |
| **CI** | `pnpm install` → `prisma generate` → `prisma migrate deploy` → build API → test API → build web (PostgreSQL service container en runner) |
| **CI límites** | Sin tests de integración API con DB en CI; sin lint gate en CI; Playwright no en CI; sin e2e browser en GitHub Actions |

Detalle metodológico: [docs/07-ai-development-workflow.md](docs/07-ai-development-workflow.md).

---

## 8. Estado del repositorio

| Aspecto | Estado (10 jul 2026) |
|---------|----------------------|
| **Rama principal** | `main` (slices US-001–US-009 mergeados; fix ConfigModule global en `d1222d4`) |
| **CI** | `.github/workflows/ci.yml`: `push` en `main`/`master`; `pull_request` en cualquier rama |
| **Issues Delivery 2** | #8–#13 cerradas (US-001, US-003–US-009) |
| **Deploy público** | Frontend Vercel + API Railway + PostgreSQL Railway, validado funcionalmente en producción |

### Mapa de documentación (no duplicar contenido)

| Documento | Uso |
|-----------|-----|
| **PROJECT_CONTEXT.md** | Este archivo — estado real y handoff |
| [README.md](README.md) | Overview, setup, visión MVP |
| [AGENTS.md](AGENTS.md) | Reglas operativas para IA y devs |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura implementada y limitaciones |
| [docs/user-stories-import-mvp.md](docs/user-stories-import-mvp.md) | Spec US-002 |
| [docs/sprint-capacity-mvp.md](docs/sprint-capacity-mvp.md) | Spec US-003 |
| [docs/sprint-absences-mvp.md](docs/sprint-absences-mvp.md) | Spec US-004 |
| [docs/sprint-analysis-mvp.md](docs/sprint-analysis-mvp.md) | Spec US-005 |
| [docs/auth-mvp.md](docs/auth-mvp.md) | Spec US-001 |
| [docs/refinement-mvp.md](docs/refinement-mvp.md) | Spec US-006–008 |
| [docs/export-sprint-analysis-mvp.md](docs/export-sprint-analysis-mvp.md) | Spec US-009 |
| [docs/DEMO.md](docs/DEMO.md) | Guion demo local + checklist |
| [docs/09-github-backlog-bootstrap.md](docs/09-github-backlog-bootstrap.md) | Matriz trazabilidad US/TB ↔ issues |
| [docs/08-delivery-plan.md](docs/08-delivery-plan.md) | Hitos y alcance por entrega |
| [prompts.md](prompts.md) | Historial prompts |

**Desfase documental conocido:** ninguno crítico tras la corrección documental final (jul 2026); README, PROJECT_CONTEXT, ARCHITECTURE, DEMO y prompts §6 alineados sobre deploy, CI y pendientes Final Delivery. Si README y este archivo divergen, **PROJECT_CONTEXT.md** prevalece para estado real.

---

## 9. Próximos pasos recomendados

Alineados con **Final Delivery**, [docs/06-technical-backlog.md](docs/06-technical-backlog.md) y módulos 10+ del máster (testing, CI/CD, deploy, E2E):

1. **CI con PostgreSQL** — issue #15 (tests de integración / import API en runner).
2. **Final Delivery prep** — Playwright en GitHub Actions, lint gate opcional, historial PRs y evidencia IA ampliada.

Candidatos de trazabilidad en [prompts.md](prompts.md) §6: deploy, CI PostgreSQL, E2E en CI.

---

## 10. Riesgos y límites actuales

| Límite | Impacto |
|--------|---------|
| CI sin tests integración API | `migrate deploy` validado en runner; import/e2e API de negocio aún solo local (#15) |
| CI sin Playwright | E2E browser solo local (`pnpm test:e2e`) |
| `pnpm lint` global | Errores preexistentes en web (Settings/SprintAnalysis/UserStories) y API (refinement, user-stories.service, prisma.service); no bloquean build/test |
| Sin tests frontend unitarios | Solo compilación Vite/TS + Playwright smoke |
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
- Cerrar Final Delivery sin evidencia mínima de CI/E2E pendiente
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
