# DeliveryOps AI - Trazabilidad de Prompts de IA

## 1. Introducción

Este documento registra el uso real de prompts durante la implementación del MVP de DeliveryOps AI bajo un enfoque AI-first.

Su objetivo es aportar trazabilidad académica sobre:

- qué se solicitó a la IA,
- qué alcance tuvo cada solicitud,
- y qué decisiones finales fueron tomadas por criterio humano.

Solo se incluyen prompts efectivamente utilizados en la implementación realizada hasta este punto.

---

## 2. Criterio de registro de prompts

Reglas aplicadas para este registro:

1. Se registra un prompt cuando generó cambios concretos en el repositorio o validaciones técnicas ejecutadas.
2. Se documenta el objetivo funcional/técnico del prompt, no conversaciones accesorias.
3. Se evita inventar resultados no ejecutados o no validados.
4. Se separan claramente acciones de IA y decisiones humanas.
5. Se mantiene foco MVP (sin sobreingeniería ni alcance empresarial avanzado).

---

## 3. Herramientas IA utilizadas

- ChatGPT: apoyo en definición de pasos, revisión técnica, toma de decisiones y generación de prompts para Cursor.
- Cursor: implementación asistida sobre el repositorio.
- Modelos LLM OpenAI-compatible: asistencia para generación, revisión y validación de código/documentación.
- Supervisión humana: todas las decisiones técnicas relevantes fueron revisadas antes de consolidarse en commits.

---

## 4. Tabla de prompts usados

| ID | Prompt principal | Objetivo | Resultado real |
|---|---|---|---|
| P-001 | Inicialización del monorepo | Crear base `pnpm workspace` con estructura `apps/web`, `apps/api`, `packages/shared` | Estructura creada, `package.json` raíz, `pnpm-workspace.yaml`, `.editorconfig`, `.gitignore` |
| P-002 | Inicialización backend NestJS | Crear app NestJS standalone en `apps/api` (sin monorepo Nest) | App NestJS creada con `name: "api"` y ejecución por `pnpm --filter api start:dev` |
| P-003 | Healthcheck backend | Reemplazar endpoint demo por endpoint profesional de salud | `GET /api/health` operativo con respuesta `{ "status": "ok", "service": "deliveryops-api" }` y tests ajustados |
| P-004 | Inicialización frontend React/Vite | Crear app frontend React + TypeScript + Vite en `apps/web` | App creada con `name: "web"`, build validado, dev server operativo |
| P-005 | Limpieza frontend | Eliminar demo de Vite/React y dejar landing mínima | Landing base de producto implementada, assets demo eliminados, build validado |
| P-006 | Scripts raíz monorepo | Agregar scripts simples de trabajo en raíz | Scripts `workspace:check`, `dev:api`, `dev:web`, `build`, `test`, `lint` agregados y validados |
| P-007 | Foundation Prisma + PostgreSQL | Preparar base mínima de persistencia para `apps/api` | Prisma instalado en `apps/api`, `docker-compose.yml` con `postgres:16-alpine`, migración inicial aplicada y Prisma Client generado |
| P-008 | Integración Prisma en NestJS | Integrar `PrismaService` y `PrismaModule` en `apps/api` con foundation mínima reusable y lifecycle correcto | Se implementó `PrismaService` con `OnModuleInit` y `$connect()`, Prisma quedó ubicado en `infrastructure`, se ajustó `PrismaModule` para quitar `@Global()` por decisión arquitectónica y se validó con `pnpm --filter api build` + `pnpm --filter api test` |
| P-009 | ConfigModule y gestión de variables de entorno | Sustituir `dotenv` directo por `ConfigModule` de NestJS | `@nestjs/config` instalado en `apps/api`, `ConfigModule.forRoot()` configurado en `AppModule`, eliminado `import 'dotenv/config'` de `main.ts`, `build`/`test` OK y `start:dev` bloqueado solo por puerto `3000` ocupado |
| P-010 | Swagger/OpenAPI foundation | Preparar documentación OpenAPI mínima alineada con enfoque OpenAPI-first | Se instalaron `@nestjs/swagger` y `swagger-ui-express`, se configuró Swagger en `main.ts`, documentación disponible en `/api/docs`, endpoint `GET /api/health` documentado, validaciones `build`/`test` correctas y Swagger validado manualmente en navegador |
| P-011 | Tailwind frontend foundation | Preparar foundation frontend moderna y MVP-friendly usando Tailwind CSS | Instalación de `tailwindcss` y `@tailwindcss/vite`, integración en `vite.config.ts`, configuración de `index.css`, landing refactorizada usando utilidades Tailwind, `build`/`dev` validados correctamente, uso de Tailwind v4 sin `tailwind.config.ts` ni PostCSS manual |
| P-012 | React Router frontend foundation | Preparar foundation mínima de navegación frontend para futuros vertical slices | Instalación de `react-router-dom`, configuración `BrowserRouter`, navegación base con `AppNav`, creación de páginas placeholder (`DashboardPage`, `UserStoriesPage`, `SettingsPage`), redirects básicos hacia `/dashboard`, `build`/`dev` validados correctamente |
| P-013 | User Stories Import MVP spec | Definir el primer vertical slice real del producto siguiendo enfoque spec-first | Creación de `docs/user-stories-import-mvp.md`, definición de flujo E2E CSV → API → Prisma → UI, alcance MVP, API mínima, UI mínima, modelo de datos, escenarios BDD y DoD del slice |
| P-014 | UserStory Prisma model | Implementar el modelo mínimo UserStory siguiendo la spec del vertical slice | Creación del modelo Prisma `UserStory`, migración `add_user_story`, índice en `createdAt`, validaciones `prisma migrate dev`, `prisma generate`, `build` y `test` |
| P-015 | User Stories CSV import backend | Implementar el backend MVP completo para importación CSV de User Stories | Creación módulo `user-stories`, endpoints `GET /api/user-stories` y `POST /api/user-stories/import`, parser CSV con `csv-parse`, validación de filas, persistencia Prisma, import parcial con errores por fila, Swagger documentado, tests parser/validator, smoke test manual validado |
| P-016 | User Stories import frontend | Implementar el frontend MVP E2E para importación y visualización de User Stories | Creación de `userStoriesApi.ts`, integración con backend NestJS, carga inicial de User Stories, upload CSV, feedback de import, refetch automático, tabla de User Stories, soporte `VITE_API_URL`, smoke test E2E validado |
| P-017 | Dev CORS adjustment | Permitir comunicación frontend/backend en puertos dinámicos Vite durante desarrollo | Ampliación whitelist CORS localhost 5173-5178, resolución de error `Failed to fetch`, validación E2E frontend/backend correcta |
| P-018 | Demo E2E y fixture CSV | Documentar guion de demostración Delivery 1 y archivo de prueba para el slice de importación | `docs/DEMO.md`, `fixtures/sample-user-stories.csv`; referencias alineadas en spec y DoD del slice |
| P-019 | CI GitHub Actions y plantillas PR | Validación automática en pull request y checklist de entrega | `.github/workflows/ci.yml` (`pnpm install` → Prisma generate → build/test API → build web), `.github/PULL_REQUEST_TEMPLATE.md`; sin PostgreSQL en runner, lint gate ni deploy |
| P-020 | ADRs de arquitectura y governance IA | Registrar decisiones estructurales del enfoque AI-first, monorepo, stack y vertical slices | `docs/adr/ADR-001` a `ADR-005` y `docs/adr/README.md`; ADR-005 documenta foundation de `.cursor/rules/` |
| P-021 | AGENTS.md y ARCHITECTURE.md | Definir reglas operativas para agentes IA y arquitectura implementada real del repo | `AGENTS.md` y `ARCHITECTURE.md` alineados con slice CSV, límites MVP, workflow spec-first y human-in-the-loop |
| P-022 | Alineación README y PROJECT_CONTEXT (Delivery 1) | Sincronizar overview y handoff operativo con el estado real del repositorio | `README.md` y `PROJECT_CONTEXT.md` actualizados (CI, DEMO, slice E2E, backlog GitHub issues #3–#16, governance) |
| P-023 | US-009 Export Excel sprint analysis | Cerrar vertical slice spec-first: spec → TDD builder XLSX → service → endpoint → UI descarga → Playwright | `docs/export-sprint-analysis-mvp.md`; builder `buildSprintAnalysisWorkbook` con `exceljs` y tests unitarios; `SprintAnalysisService.exportToXlsx()`; `GET /api/sprint-analysis/export` (`StreamableFile` + Swagger); botón **Export Excel** en `/sprint-analysis`; `e2e/sprint-analysis-export.spec.ts`; validado: `pnpm --filter api test`, `pnpm --filter api build`, `pnpm --filter web build`, `pnpm test:e2e` (6 tests) |
| P-024 | US-001 Login JWT y rutas protegidas | Spec-first + TDD: Prisma User, AuthService/Controller, JWT en cookie HttpOnly, JwtGuard explícito, AuthProvider/ProtectedRoute, Playwright auth | `docs/auth-mvp.md`; `AuthModule` + migración `User`; `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`; `pnpm --filter api auth:create-demo-user`; frontend sin JWT en cliente (`credentials: 'include'`); `e2e/auth-login.spec.ts` + `e2e/helpers/auth-api-mocks.ts`; validado: API **135/135**, E2E **9/9**, builds API/web OK; `pnpm lint` global con errores preexistentes fuera de US-001 |
| P-025 | Validación local Delivery 2 y fix arranque API | Diagnosticar y corregir bloqueo de `start:dev` detectado en validación manual Delivery 2 | Validación manual OK: PostgreSQL, Prisma, demo user, health, Swagger, login JWT HttpOnly, `/api/auth/me`, rutas protegidas, Sprint Analysis, export Excel, logout; causa: `ConfigService` no resolvía en `JwtStrategy` porque `ConfigModule.forRoot()` no era global; fix mínimo: `ConfigModule.forRoot({ isGlobal: true })` en `AppModule`; variables JWT/cookies requeridas en `apps/api/.env` según `.env.example`; validado: **135/135** tests API, **9/9** Playwright, builds API/web OK |

**Trazabilidad del vertical slice (Delivery 1):** P-013 → P-017 ↔ **US-002** ↔ **GH-04** ↔ [docs/user-stories-import-mvp.md](docs/user-stories-import-mvp.md) ↔ [docs/DEMO.md](docs/DEMO.md)

**Trazabilidad US-001:** P-024 ↔ **US-001** ↔ **GH-06** / issue **#8** ↔ [docs/auth-mvp.md](docs/auth-mvp.md)

**Trazabilidad US-009:** P-023 ↔ **US-009** ↔ **GH-11** / issue **#13** ↔ [docs/export-sprint-analysis-mvp.md](docs/export-sprint-analysis-mvp.md)

---

## 5. Decisiones humanas aplicadas

Decisiones de ingeniería tomadas con criterio humano durante la ejecución:

- Mantener alcance MVP y postergar Clean Architecture completa para fases posteriores.
- No introducir Nx, Turborepo, Lerna ni tooling adicional en esta etapa.
- Postergar modelos de negocio complejos (`Project`, `Sprint`, relaciones); `HealthCheck` como validación inicial de Prisma; primer modelo de dominio: `UserStory` plano sin FKs.
- No incorporar aún shadcn/ui, TanStack Query ni Zustand (auth US-001 implementada con `AuthProvider` + `fetch`).
- Se mantiene configuración mínima de Tailwind v4 para evitar complejidad innecesaria en fase foundation.
- Se mantienen layouts y rutas simples; primer vertical slice E2E completado en User Stories Import; `Dashboard` y `Settings` permanecen placeholder.
- Se prioriza vertical slice funcional end-to-end e integración E2E antes de state management avanzado o arquitectura enterprise prematura.
- Issues GitHub **GH-01–GH-14** (remotos **#3–#16**) creados con `scripts/bootstrap-github-issues.sh` y revisión humana; estrategia en `docs/09-github-backlog-bootstrap.md` — **sin prompt IA registrado** en esta tabla.
- Ajustar el puerto de PostgreSQL local a `5433` por conflicto real en `5432`.
- Priorizar trazabilidad y validaciones ejecutables sobre documentación teórica extensa.
- Preferir imports explícitos frente a módulos globales para mantener boundaries arquitectónicos claros.
- Se pospone validation schema de variables de entorno para mantener scope MVP.
- Se pospone versionado y seguridad Swagger para mantener simplicidad MVP.

---

## 6. Prompts futuros y alcance por entrega

### Ya implementado o documentado en Delivery 1

Registrado en la tabla anterior (P-001–P-025):

- Foundation técnica del monorepo, API, web, Prisma y OpenAPI (P-001–P-012).
- Primer vertical slice User Stories CSV Import (P-013–P-017).
- Evidencia demo local y fixture (P-018).
- CI básica en GitHub Actions y plantilla PR (P-019).
- ADRs y governance IA, incl. referencia a reglas Cursor (P-020).
- `AGENTS.md` y `ARCHITECTURE.md` operativos (P-021).
- Alineación `README.md` y `PROJECT_CONTEXT.md` con estado real del repo (P-022).

### Delivery 2 — slice US-001 (registrado)

- Login JWT y rutas protegidas (P-024 ↔ US-001 / GH-06 / #8).

### Delivery 2 — slice US-009 (registrado)

- Export Excel análisis sprint (P-023 ↔ US-009 / GH-11 / #13).

### Delivery 2 — validación local y fix arranque (registrado)

- Validación manual Delivery 2 y fix `ConfigModule.forRoot({ isGlobal: true })` (P-025).

Fuera de `prompts.md` pero parte del cierre Delivery 1: backlog GitHub (GH-01–GH-14 → issues #3–#16) vía script y revisión humana; matriz US/TB ↔ issues (**GH-03**) **cerrada**.

### Pendiente Delivery 2+ (registrar P-xxx al ejecutar)

- Planificación sprint: capacidad, ausencias, análisis overload (US-003–005 / GH-07–09) — **implementado en repo**.
- Refinamiento IA MVP: PDF, gaps, acceptance criteria (US-006–008 / GH-10) — **implementado en repo**.

### Estado actual Final Delivery (jul 2026)

- Deploy público (frontend Vercel + API Railway + PostgreSQL Railway): **completado** y validado en producción.
- PostgreSQL service + `migrate deploy` en GitHub Actions: **completado**.
- Tests de integración API con DB en CI (#15): **pendientes**.
- Playwright en GitHub Actions: **pendiente**.
- Matriz trazabilidad GH-03: **cerrada**.
- Tests API vigentes: **140/140** (`pnpm --filter api test`).

### Pendiente Final Delivery (registrar P-xxx al ejecutar)

- Tests integración API con DB en CI (#15).
- Playwright E2E en GitHub Actions.
- Paquete evidencia final ampliado (historial PRs y prompts de iteraciones finales).

---

**Última actualización:** 2026-07-12

**Alcance cubierto:** Foundation P-001–P-012; vertical slice User Stories Import P-013–P-017; evidencia Delivery 1 P-018–P-022 (DEMO, CI, ADRs, AGENTS/ARCHITECTURE, README/PROJECT_CONTEXT); smoke E2E manual del import CSV validado; US-009 Export Excel P-023; US-001 Login JWT P-024; validación local Delivery 2 y fix arranque API P-025.
