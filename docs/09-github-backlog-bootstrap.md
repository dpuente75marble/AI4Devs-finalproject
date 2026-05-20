# DeliveryOps AI — GitHub Backlog Bootstrap

**Proyecto:** DeliveryOps AI · AI4Devs / LIDR Final Master Project  
**Estado del documento:** Estrategia y roadmap documentados — **issues GitHub aún no creados**  
**Última alineación:** Mayo 2026  
**Referencias:** [05-user-stories.md](05-user-stories.md) · [06-technical-backlog.md](06-technical-backlog.md) · [08-delivery-plan.md](08-delivery-plan.md) · [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)

---

## 1. Objetivo del backlog GitHub

Este documento define la **estrategia de backlog en GitHub** para el MVP académico de DeliveryOps AI. No sustituye la documentación de producto ni el backlog técnico detallado; los **complementa** con un plan de trabajo ejecutable, trazable y alineado con las entregas del máster.

### Backlog incremental

El backlog se organiza en **fases incrementales** (Delivery 1 → Delivery 2 → Final Delivery), no como un único bloque de implementación. Cada fase aporta valor verificable antes de abrir la siguiente, reduciendo riesgo de integración tardía y scope creep.

### Vertical slices

Cada issue de implementación (Delivery 2 y Final Delivery) representa preferentemente **un vertical slice E2E acotado**: spec aprobada → API/Prisma → UI → validación manual o automatizada → PR. El primer slice demostrado en el repo es **User Stories CSV Import** (CSV → React → NestJS → Prisma → PostgreSQL).

### Roadmap MVP

El roadmap refleja el **MVP objetivo del máster** (auth, planificación sprint, refinamiento IA, export, deploy), no el inventario completo de código actual. La priorización sigue [08-delivery-plan.md](08-delivery-plan.md) y las User Stories Must-Have de [05-user-stories.md](05-user-stories.md).

### Trazabilidad

Cada issue GitHub propuesto enlaza explícitamente:

- **US-xxx** — historias de usuario de producto
- **TB-xxx** — tareas del backlog técnico
- **Documentos** — specs, ADRs, DEMO, prompts
- **Milestone** — entrega académica correspondiente

La matriz detallada US/TB ↔ issues se completará en el issue **GH-03** (Delivery 1).

### Workflow AI-first

El backlog en GitHub es la capa **operativa** del flujo ya documentado en [07-ai-development-workflow.md](07-ai-development-workflow.md) y [AGENTS.md](../AGENTS.md):

```text
Spec (docs/) → revisión humana → issue GitHub → PR → código → docs/prompts → merge → CI
```

Los issues no reemplazan las specs en `docs/`; las **derivan** y las **obligan** a existir antes del código (spec-first).

---

## 2. Estrategia AI-first / human-in-the-loop

### IA propone, humano valida

- La IA (Cursor, LLMs) puede **proponer** issues, criterios de aceptación, desgloses técnicos y borradores de implementación.
- El **humano** aprueba specs, prioridades, límites de negocio, seguridad y el cierre E2E antes de dar un slice por terminado.
- [prompts.md](../prompts.md) registra trazabilidad académica (P-001–P-017 cubren foundation + primer slice); nuevos prompts se añaden por iteración significativa, no de forma autónoma.

### Spec-first

Ningún issue de Delivery 2 o Final Delivery con cambio de código debe iniciarse sin **mini-spec en `docs/`** (o extensión de spec existente) revisada y aprobada. El label `type:spec-first` marca este requisito.

### PR-driven workflow

- Un vertical slice por PR cuando sea posible.
- Plantilla PR: Summary + Test plan + referencia a spec / prompt ID.
- CI actual (`.github/workflows/ci.yml`): `pnpm install` → Prisma generate → build API → test API → build web. **Sin PostgreSQL en runner** ni E2E browser hoy.

### Sin automatización autónoma completa

Deliberadamente **no** se automatiza en esta fase:

- Creación masiva de issues sin revisión humana
- Generación de código mergeable sin PR review
- Agents autónomos cerrando issues

El bootstrap documenta la estrategia; la **ejecución** de comandos `gh` y la creación de issues queda bajo control explícito del autor del proyecto.

---

## 3. Estrategia de milestones

Los milestones de GitHub reflejan las tres entregas del máster ([08-delivery-plan.md](08-delivery-plan.md)).

| Milestone | Fecha objetivo | Descripción |
|-----------|----------------|-------------|
| **Delivery 1 — Technical Documentation** | 27 may 2026 | Cierre del paquete documental, trazabilidad US/TB ↔ issues, evidencia del slice E2E ya implementado (DEMO, prompts, ADRs). **Sin nuevas features de código.** |
| **Delivery 2 — Functional MVP** | 24 jun 2026 | Slices funcionales: autenticación, planificación sprint (capacidad, ausencias, análisis), refinamiento IA MVP, export Excel. Spec-first por slice. |
| **Final Delivery — Deployed MVP** | 14 jul 2026 | MVP desplegado públicamente, CI con PostgreSQL para tests de integración, E2E automatizado (Playwright), evidencia final de workflow IA y PRs. |

**Nota académica:** El plan original de Delivery 1 excluía implementación; el repositorio **ya supera** ese alcance con foundation técnica, primer slice E2E y CI en PRs reales. Delivery 1 en GitHub se centra por tanto en **coherencia documental y evidencia**, no en reimplementar lo existente.

---

## 4. Estrategia de labels

Conjunto **mínimo pero completo** para filtrar, priorizar y trazar sin ruido.

### Convención general

- Prefijos por categoría: `area:`, `epic:`, `type:`, `status:`
- Cada issue: **1 epic** (si aplica) + **1–2 area** + **1 type** (+ `testing` / `devops` si aplica)
- Reutilizar `enhancement` (ya presente en `.github/ISSUE_TEMPLATE/feature-request.md`) para capacidades funcionales

### type

| Label | Propósito |
|-------|-----------|
| `documentation` | Docs, ADRs, specs, evidencia académica, matrices de trazabilidad |
| `enhancement` | Capacidad o vertical slice funcional (template existente) |
| `testing` | Tests unitarios, integración, E2E |
| `devops` | CI/CD, deploy, infraestructura |
| `type:spec-first` | Requiere mini-spec aprobada en `docs/` antes de código |

### area

| Label | Propósito |
|-------|-----------|
| `area:api` | `apps/api` — NestJS, Prisma, Swagger |
| `area:web` | `apps/web` — React, Vite, UI |
| `area:docs` | `docs/`, `PROJECT_CONTEXT.md`, `prompts.md` |
| `area:ci` | `.github/workflows`, pipelines |
| `area:ai` | Refinamiento IA, providers, prompts de dominio |

### epic

| Label | Propósito | User Stories |
|-------|-----------|--------------|
| `epic:auth` | Autenticación y acceso | US-001 |
| `epic:sprint-planning` | Planificación sprint y capacidad | US-002–005 |
| `epic:refinement` | Refinamiento asistido por IA | US-006–008 |
| `epic:export` | Exportación operativa | US-009 |

### status

| Label | Propósito |
|-------|-----------|
| `status:blocked` | Bloqueado por spec pendiente, dependencia upstream o revisión humana |

*Estados de ciclo de vida (`in-progress`, `done`) se gestionan con milestones, asignación y cierre de issues; no se duplican con labels salvo bloqueo explícito.*

---

## 5. Tabla resumen de backlog

**14 issues propuestos** — resumen ejecutivo. Los cuerpos completos (objetivo, criterios de aceptación, trazabilidad) se definirán al crear cada issue en GitHub; aquí solo la vista de roadmap.

| ID | Título | Milestone | Objetivo corto | Estado esperado |
|----|--------|-----------|----------------|-----------------|
| GH-01 | Coherencia documental docs 01–08, PROJECT_CONTEXT, README, ARCHITECTURE | Delivery 1 | Alinear docs con estado real del repo (CI, slice CSV, sin auth/IA) | Abierto → cerrar en D1 |
| GH-02 | Paquete evidencia: DEMO, prompts P-001–P-017, ADRs | Delivery 1 | Evidencia académica workflow AI-first verificable | Abierto → cerrar en D1 |
| GH-03 | Matriz trazabilidad US/TB ↔ issues GitHub | Delivery 1 | Tabla US-xxx / TB-xxx / Issue / Milestone / Estado | Abierto → cerrar en D1 |
| GH-04 | Cerrar slice US-002 (spec, DoD, límites MVP) | Delivery 1 | Verificación documental del slice CSV import (sin código nuevo) | Abierto → cerrar en D1 |
| GH-05 | Checklist entrega Delivery 1 (PR, rama, tutor) | Delivery 1 | Cierre formal entrega: PR doc-only, builds documentados | Abierto → cerrar en D1 |
| GH-06 | US-001: Login JWT y rutas protegidas | Delivery 2 | Autenticación mínima spec-first | Planificado |
| GH-07 | US-003: Configurar capacidad de sprint | Delivery 2 | TeamMember / capacidad persistida + UI mínima | Planificado |
| GH-08 | US-004: Registrar ausencias | Delivery 2 | Ausencias ajustan capacidad disponible | Planificado |
| GH-09 | US-005: Análisis capacidad vs demanda | Delivery 2 | Motor overload + vista análisis | Planificado |
| GH-10 | US-006–008: Refinamiento IA MVP | Delivery 2 | PDF, mock provider, AC y gaps | Planificado |
| GH-11 | US-009: Export Excel análisis sprint | Delivery 2 | Reporting descargable | Planificado |
| GH-12 | Deploy MVP público (web + API + PG) | Final Delivery | Vercel / Render / Neon (según plan) | Planificado |
| GH-13 | CI: PostgreSQL + tests e2e API import | Final Delivery | Validar Prisma/import en GitHub Actions | Planificado |
| GH-14 | Playwright E2E + evidencia final prompts/PRs | Final Delivery | Flujo automatizado + paquete entrega final | Planificado |

**Fuera del backlog inicial (Should-Have / opcional):** US-010, US-011; deduplicación CSV por `externalId`; lint gate (TB-006); `packages/shared`.

---

## 6. Relación entre documentación y backlog

```text
docs/01–08 (visión, diseño, plan)
        │
        ├── docs/05-user-stories.md ──────► US-001 … US-011 (producto)
        │
        ├── docs/06-technical-backlog.md ─► TB-001 … TB-046 (técnico)
        │
        ├── docs/<slice>-mvp.md ──────────► spec por vertical slice
        │
        └── docs/09-github-backlog-bootstrap.md (este doc)
                    │
                    ▼
            GitHub: milestones + labels + issues GH-01…14
                    │
                    ▼
            PRs (1 slice preferible) → merge → CI
```

| Artefacto | Rol respecto al backlog GitHub |
|-----------|--------------------------------|
| [05-user-stories.md](05-user-stories.md) | **Qué** debe lograr el usuario (BDD, Must/Should-Have). Los issues GH-06–11 mapean US-001, US-003–009. US-002 está **implementada** (GH-04 = cierre doc). |
| [06-technical-backlog.md](06-technical-backlog.md) | **Cómo** descomponer técnicamente (TB-xxx). GH-03 enlaza TB con issues. TB-001–007, 007A, 013 (parcial), 024 (parcial) reflejan trabajo **ya hecho** en repo. |
| [08-delivery-plan.md](08-delivery-plan.md) | **Cuándo** — milestones y alcance por entrega. |
| [user-stories-import-mvp.md](user-stories-import-mvp.md) | Spec del **único slice E2E en código**; referencia para GH-04, DEMO, US-002. |
| [DEMO.md](DEMO.md) | Guion de validación humana; evidencia Delivery 1 (GH-02). |
| Milestones GitHub | Agrupación temporal académica; no sustituyen epics ni specs. |
| PRs | Unidad de entrega y revisión; enlace obligatorio a spec + prompt ID cuando aplique. |

---

## 7. Implementado vs planificado

> **Principio clave:** *backlog completo ≠ funcionalidades implementadas.*

El backlog GitHub describe el **roadmap del MVP máster**, incluyendo trabajo futuro documentado en `docs/05` y `docs/06`. El estado **real del código** es más acotado.

### Implementado hoy (código + foundation)

| Área | Estado |
|------|--------|
| Monorepo pnpm (`apps/api`, `apps/web`, `packages/shared` vacío) | ✅ |
| NestJS + Prisma + PostgreSQL local (Docker `5433`) | ✅ |
| Swagger `/api/docs`, health `GET /api/health` | ✅ |
| React + Vite + Tailwind + Router; rutas shell dashboard/settings | ✅ |
| **Vertical slice US-002:** CSV import + listado User Stories | ✅ |
| Tests API unitarios (parser, validator); e2e solo health | ✅ |
| CI GitHub Actions: build + test API + build web (PR/push) | ✅ |
| Documentación 01–08, ADRs, AGENTS, ARCHITECTURE, prompts P-001–P-017 | ✅ |
| DEMO + fixture CSV | ✅ |

### Planificado — Delivery 2 (issues GH-06–11)

No implementado en código a fecha de este documento:

- Autenticación JWT (US-001)
- Capacidad de equipo (US-003)
- Ausencias (US-004)
- Análisis sprint vs demanda / overload (US-005)
- Refinamiento IA MVP: PDF, refinamiento, AC (US-006–008)
- Export Excel (US-009)
- Entidades `Project`, `Sprint`, `TeamMember` completas según [04-data-model.md](04-data-model.md) — solo diseño objetivo, no esquema Prisma completo

### Planificado — Final Delivery (issues GH-12–14)

- Deploy público (web + API + PostgreSQL gestionado)
- CI con servicio PostgreSQL y tests e2e de import
- Playwright u otro E2E UI del flujo operativo principal
- Paquete evidencia final ampliado (`prompts.md`, historial PRs)

### Delivery 1 (issues GH-01–05)

**Solo documentación, trazabilidad y evidencia** — no implica nuevas features. Incluye cerrar formalmente US-002 a nivel spec/DoD/DEMO sin reescribir el slice.

---

## 8. Principios de trabajo

| Principio | Aplicación en el backlog |
|-----------|---------------------------|
| **Incremental delivery** | Milestones acotados; no “big bang” de todo el MVP en un issue. |
| **Spec-first** | Label `type:spec-first`; spec en `docs/` antes de código en D2/Final. |
| **AI-first** | IA asiste en redacción de issues, código y tests; humano aprueba specs y merge. |
| **Governance ligera** | ADRs solo para decisiones estructurales; sin BMAD/Spec Kit completo si no aporta valor inmediato. |
| **No overengineering** | Sin microservicios, RAG, multi-tenant, ni stack UI avanzado sin spec explícita. |
| **Documentación viva** | Al cerrar slices: actualizar spec, DEMO, PROJECT_CONTEXT según [AGENTS.md](../AGENTS.md). |
| **PR-driven development** | Issue → PR → CI → merge; evidencia para evaluación del máster. |

---

## 9. Estrategia futura

### Evolución del backlog

- Los 14 issues iniciales son un **mínimo profesional completo**, no un catálogo cerrado.
- Issues GH-06–14 se **refinarán** al crear specs (`docs/auth-mvp.md`, `docs/refinement-mvp.md`, etc.): criterios de aceptación más granulares, dependencias explícitas, estimación opcional.
- Nuevos issues pueden surgir (dedup CSV, `packages/shared`, lint CI) según prioridad del tutor — sin inflar el backlog base.

### Automatizaciones diferidas

Posibles mejoras **post–Delivery 1**, no prioritarias ahora:

- Script `bootstrap-github-issues.sh` o `gh` batch tras revisión humana
- Templates de issue por epic
- Vinculación automática PR ↔ issue
- Agents que abran PRs (solo con governance explícita)

### Prioridad actual

**Foco y simplicidad:** cerrar Delivery 1 en documentación y trazabilidad; abrir Delivery 2 solo con specs aprobadas y un slice por iteración.

---

## Anexo A — Comandos `gh` (referencia, no ejecutar)

Los comandos para crear labels, milestones e issues se mantendrán en un anexo o script separado **después** de revisión humana de:

- `OWNER` / `REPO` correctos
- Ausencia de issues duplicados en el remoto
- Nombres exactos de milestones
- Prioridad tutor en Delivery 2 (orden auth → sprint → IA → export)

*Este documento no ejecuta ni incluye scripts ejecutables por diseño.*

---

## Anexo B — Trazabilidad rápida US / TB → issues

| User Story | Backlog técnico (principal) | Issue GitHub |
|------------|----------------------------|--------------|
| US-002 (implementada) | TB-013, TB-024, TB-036 | GH-04 (+ evidencia GH-02) |
| US-001 | TB-008, TB-009, TB-022 | GH-06 |
| US-003 | TB-010, TB-011, TB-025 | GH-07 |
| US-004 | TB-012 | GH-08 |
| US-005 | TB-014, TB-026, TB-035 | GH-09 |
| US-006–008 | TB-015–019, TB-027–028, TB-030–031 | GH-10 |
| US-009 | TB-020, TB-029 | GH-11 |
| — (deploy/CI/E2E) | TB-038–043, TB-045–046 | GH-12–14 |

La matriz autoritativa y con columnas *Estado* se completará en **GH-03**.

---

*Documento vivo. Actualizar cuando se creen milestones/issues en GitHub o cambie el alcance implementado del repo — sin duplicar PROJECT_CONTEXT ni ADRs completos.*
