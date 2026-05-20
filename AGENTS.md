# AGENTS.md — DeliveryOps AI

Guía de contexto persistente para agentes de IA (Cursor, LLMs) y desarrolladores humanos. Describe **qué existe hoy** en el repositorio y **cómo trabajar** sin desviarse del alcance real.

**Referencias complementarias:** [README.md](README.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [docs/user-stories-import-mvp.md](docs/user-stories-import-mvp.md) · [prompts.md](prompts.md) · [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)

---

## Project purpose

**DeliveryOps AI** es una plataforma SaaS asistida por IA para operaciones de delivery: planificación de sprints, análisis de capacidad, refinamiento de requisitos y reporting operativo.

Este repositorio es el **proyecto final del máster AI4Devs (2026)**. El enfoque es **AI-first SDLC**: spec-first, vertical slices pequeños, documentación viva, OpenAPI-first, trazabilidad de prompts y validación humana obligatoria en decisiones críticas.

El MVP académico (LIDR) prioriza un producto **realista y mantenible**, no complejidad enterprise prematura.

---

## Current implemented scope

### Infraestructura y foundation

| Área | Estado |
|------|--------|
| Monorepo `pnpm` (`apps/web`, `apps/api`, `packages/shared` vacío) | Implementado |
| PostgreSQL local vía `docker-compose.yml` (puerto `5433`) | Implementado |
| NestJS + `ConfigModule` + prefijo global `/api` | Implementado |
| Prisma ORM + migraciones | Implementado |
| Swagger/OpenAPI en `/api/docs` | Implementado |
| Health endpoint `GET /api/health` | Implementado |
| React + Vite + TypeScript + Tailwind + React Router | Implementado |
| Páginas shell: `/dashboard`, `/settings` (placeholders) | Implementado |
| CORS dev para puertos Vite (`5173`–`5178`) | Implementado |

### Primer vertical slice E2E (funcional)

**User Stories CSV import** — especificación: [docs/user-stories-import-mvp.md](docs/user-stories-import-mvp.md)

- `POST /api/user-stories/import` — multipart CSV, validación por fila, import parcial
- `GET /api/user-stories` — listado ordenado por `createdAt` desc
- Modelo Prisma `UserStory` persistido en PostgreSQL
- UI `/user-stories` — upload, feedback, tabla, refetch tras import
- Tests unitarios Jest: `parse-csv`, `validate-user-story-row`
- Fixture de demo: [fixtures/sample-user-stories.csv](fixtures/sample-user-stories.csv)
- Guía E2E: [docs/DEMO.md](docs/DEMO.md)
- Prompts registrados en `prompts.md` (P-013 a P-016)

### No implementado (no inventar ni asumir)

- Autenticación / autorización
- Entidades `Project`, `Sprint`, `TeamMember`, capacity, absences
- Refinamiento con IA (PDF, gaps, acceptance criteria)
- Export Excel/PDF
- `packages/shared` con tipos compartidos (directorio vacío)
- CI/CD, despliegue cloud
- Tests E2E del slice user-stories (solo health e2e base)
- Tests frontend (Vitest/RTL/Playwright planificados, no presentes)
- shadcn/ui, TanStack Query, Zustand, React Hook Form, Zod en web

---

## Tech stack

| Capa | Tecnologías (implementadas) |
|------|----------------------------|
| Monorepo | pnpm 10+, workspaces |
| API | Node.js, NestJS 11, Prisma 7, PostgreSQL 16, `csv-parse`, Swagger |
| Web | React 19, Vite 8, TypeScript, Tailwind CSS 4, React Router 7 |
| DB local | Docker `postgres:16-alpine` |
| Tests API | Jest (unit en `src/**/*.spec.ts`), Supertest e2e mínimo (`/api/health`) |

Variables de entorno relevantes:

- API: `DATABASE_URL`, `PORT` (default `3000`) en `apps/api/.env`
- Web: `VITE_API_URL` (default implícito `http://localhost:3000`) en `apps/web/.env`

---

## Repository structure

```text
AI4Devs-finalproject/
├── AGENTS.md              ← este archivo
├── ARCHITECTURE.md        ← arquitectura técnica actual
├── README.md
├── PROJECT_CONTEXT.md     ← contexto histórico del máster (puede incluir stack planificado)
├── prompts.md             ← registro de prompts (no modificar sin tarea explícita)
├── docker-compose.yml
├── fixtures/
├── docs/                  ← producto, arquitectura, backlog, workflow AI
├── apps/
│   ├── api/               ← NestJS, Prisma, módulo user-stories
│   └── web/               ← React, UserStoriesPage, API client fetch
└── packages/
    └── shared/            ← vacío; reservado para tipos/DTOs compartidos
```

Documentación numerada en `docs/01-` … `docs/08-` describe visión de producto y diseño objetivo; **la fuente de verdad del slice implementado** es `docs/user-stories-import-mvp.md` + código + Swagger.

---

## AI-first workflow rules

1. **Analizar antes de implementar** — Leer spec del slice, código existente, OpenAPI y `prompts.md` antes de generar cambios.
2. **Spec-first** — Nuevo comportamiento: mini-spec en `docs/` (o extensión de spec existente) **antes** del código.
3. **Vertical slices pequeños** — Un flujo E2E acotado por iteración; evitar múltiples dominios en un solo PR.
4. **OpenAPI-first** — Contratos REST documentados con decoradores Swagger; no añadir endpoints no especificados.
5. **No inventar APIs** — Solo los endpoints y shapes existentes o definidos explícitamente en spec aprobada.
6. **Documentación durante el flujo** — Actualizar `docs/`, `README.md` o `prompts.md` **en la misma iteración** que el cambio, no como afterthought post-merge.
7. **Trazabilidad** — Cada slice relevante: entrada en `prompts.md` con ID, objetivo, resultado verificable.
8. **Human-in-the-loop** — Revisión humana de specs, límites de negocio, seguridad y comportamiento E2E antes de dar por cerrado.
9. **Claridad sobre velocidad** — Preferir diffs pequeños, nombres explícitos y validación reproducible.

Orden sugerido para un nuevo slice:

```text
Spec (docs/) → revisión humana → backlog/prompts → implementación API+Prisma → Swagger → tests críticos → UI → smoke manual → prompts.md + docs
```

---

## How to work on a new change

### 1. Entender el estado actual

- Leer [ARCHITECTURE.md](ARCHITECTURE.md) y la spec del dominio en `docs/`.
- Inspeccionar módulos en `apps/api/src/` y páginas en `apps/web/src/pages/`.
- Verificar contrato en `http://localhost:3000/api/docs` (con API levantada).

### 2. Acotar el slice

- Definir entrada/salida E2E, fuera de alcance explícito y DoD.
- Reutilizar patrones del slice `user-stories` (módulo NestJS, DTOs Swagger, cliente `fetch`, estado local en página).

### 3. Implementar por capas (mínimo viable)

- Prisma model + migration (si aplica)
- Service + validación + controller + DTOs
- Tests unitarios de lógica pura (parser, validadores, reglas de negocio)
- Página React + cliente API
- Actualizar spec y `prompts.md`

### 4. Validar localmente

```bash
docker compose up -d
pnpm --filter api prisma migrate dev   # si hay migraciones nuevas
pnpm --filter api build && pnpm --filter api test
pnpm --filter web build
# Smoke manual según docs/DEMO.md o checklist BDD de la spec
```

### 5. Entregar

- Diff acotado al slice; sin refactors colaterales no solicitados.
- PR con resumen, plan de prueba y referencia a spec/prompt ID.

---

## Documentation rules

| Documento | Cuándo actualizar |
|-----------|-------------------|
| `docs/<slice>-mvp.md` o spec nueva | Al definir o cerrar un slice |
| `README.md` | Cambios en setup, stack implementado o estado del MVP |
| `ARCHITECTURE.md` / `AGENTS.md` | Decisiones estructurales o reglas de trabajo |
| `prompts.md` | Tras cada iteración significativa asistida por IA (nuevo ID P-xxx) |
| `docs/DEMO.md` | Nuevos flujos demostrables en entregas del máster |

**No modificar** `prompts.md` salvo tarea explícita del usuario.

**No añadir** `.cursor/rules` ni skills del repo hasta que el equipo lo decida (fuera de alcance actual).

Mantener coherencia: si la spec dice "implementado", el estado en cabecera debe reflejarlo; si algo es planificado, marcarlo como *planned*, no como hecho.

---

## Testing and validation rules

### Implementado hoy

- **Unit (API):** `parse-csv.spec.ts`, `validate-user-story-row.spec.ts`
- **E2E (API):** solo `GET /api/health` en `test/app.e2e-spec.ts`
- **Build:** `pnpm --filter api build`, `pnpm --filter web build`
- **Manual:** escenarios BDD en `user-stories-import-mvp.md`, guía [docs/DEMO.md](docs/DEMO.md)

### Expectativas para nuevos cambios

- Lógica de validación/parseo: tests unitarios Jest obligatorios.
- Endpoints nuevos: documentar en Swagger; smoke manual mínimo; e2e del controller recomendado cuando el slice sea crítico.
- UI: build sin errores TypeScript; checklist manual del flujo E2E.
- No añadir suites de test pesadas sin justificación en la spec del slice.

---

## Commit / PR expectations

- **Commits:** solo cuando el usuario lo pida explícitamente.
- Mensajes claros, en imperativo, describiendo el *por qué* del cambio.
- **PRs:** título conciso; cuerpo con Summary + Test plan + enlace a spec/`prompts.md` ID.
- No incluir secretos (`.env`, credenciales).
- No `force push` a `main`/`master` sin confirmación explícita.
- Un PR por vertical slice cuando sea posible.

---

## Human-in-the-loop principles

- La IA **propone**; el humano **aprueba** specs, límites (p. ej. máx. 200 filas CSV), y comportamiento ante errores parciales.
- Revisar imports duplicados, mensajes de error y UX antes de merge.
- Validar que el LLM no haya ampliado el modelo de datos más allá de `docs/04-data-model.md` MVP scope sin spec.
- Registrar desviaciones reales vs spec en `prompts.md` o nota en la spec.

---

## Things not to do

- Inventar endpoints, campos Prisma o pantallas no especificadas.
- Añadir dependencias npm sin justificación en spec o comentario de PR.
- Implementar auth, multi-tenant o IA en slices que no lo incluyan.
- Refactorizar a Clean Architecture completa sin necesidad del slice actual.
- Modificar `prompts.md` retroactivamente para "encajar" código ya escrito sin registro honesto.
- Actualizar solo README tras implementar omitiendo la spec del slice.
- Asumir que `packages/shared` o `docs/04-data-model.md` completo ya están en código.
- Crear commits o push sin petición del usuario.
- Tocar `package.json` raíz/apps sin necesidad acordada en la tarea.

---

## Current MVP limitations

| Limitación | Impacto |
|------------|---------|
| Sin autenticación | Cualquier cliente con acceso a la API en local puede importar/listar |
| Sin `projectId` / `Sprint` entity | `sprint` en CSV es texto libre |
| Re-import duplica filas | Mismo `external_id` crea nuevos registros |
| Import parcial | Filas válidas se insertan; inválidas se reportan sin rollback de las válidas |
| Parser CSV simple | Comas en campos sin comillas pueden fallar; documentado en spec |
| Límites: 1 MB, 200 filas | Constantes en `apps/api/src/user-stories/constants.ts` |
| Tipos FE/BE duplicados | Sin `packages/shared` aún |
| Dashboard/Settings | Placeholders sin lógica de negocio |
| CORS | Configurado para dev local, no producción |
| Tests UI/E2E slice | No automatizados |

---

## Quick commands

```bash
pnpm install
docker compose up -d
pnpm --filter api start:dev
pnpm --filter web dev
pnpm --filter api build && pnpm --filter api test
pnpm --filter web build
```

**Smoke del slice actual:** [docs/DEMO.md](docs/DEMO.md)

---

*Última revisión alineada con el repositorio: mayo 2026.*
