# ARCHITECTURE.md — DeliveryOps AI

Descripción técnica de la arquitectura **implementada** en el monorepo. Para reglas de trabajo con IA, ver [AGENTS.md](AGENTS.md). Para visión de producto y modelo objetivo completo, ver `docs/01-` … `docs/08-`.

---

## Project overview

DeliveryOps AI es un **modular monolith**: frontend React y API NestJS desplegables por separado, una base PostgreSQL, sin microservicios en el MVP.

Principios aplicados hoy:

- Entrega por **vertical slices** — implementados: `user-stories`, `sprint-capacity`, `sprint-absences`, `sprint-analysis`, `refinement` (mock provider)
- **Pragmatic modular monolith** en backend (módulo por feature, no capas hexagonales completas)
- **OpenAPI-first** para contratos REST visibles
- **Spec-first** con documentación viva en `docs/`
- Desacoplamiento de proveedores IA vía interfaz `RefinementProvider` — **mock implementado**; proveedor real pendiente

---

## Monorepo structure

```text
pnpm workspace (pnpm-workspace.yaml)
├── apps/api          NestJS application
├── apps/web          Vite + React SPA
└── packages/shared   Placeholder vacío (tipos compartidos futuros)
```

Scripts raíz (`package.json`):

| Script | Acción |
|--------|--------|
| `pnpm dev:api` | API en watch |
| `pnpm dev:web` | Vite dev server |
| `pnpm build` | Build recursivo |
| `pnpm test` | Tests recursivos (hoy principalmente API) |

---

## Backend architecture

### Stack y bootstrap

- **Framework:** NestJS 11
- **Entry:** `apps/api/src/main.ts`
  - Prefijo global: `api`
  - CORS: orígenes Vite locales `5173`–`5178`
  - Swagger: `/api/docs` (`DocumentBuilder` + `SwaggerModule`)
  - Puerto: `process.env.PORT ?? 3000`

### Módulos

```text
AppModule
├── ConfigModule.forRoot()
├── PrismaModule              → PrismaService (infraestructura)
├── UserStoriesModule         → US-002 CSV import
├── SprintCapacityModule      → US-003 capacidad por sprint/gerencia/proyecto
├── SprintAbsencesModule      → US-004 ausencias
├── SprintAnalysisModule      → US-005 análisis demanda vs capacidad ajustada
├── RefinementModule          → US-006–008 refinamiento PDF (mock provider)
└── AppController             → GET /api/health
```

Cada módulo de negocio sigue el mismo patrón pragmático: controller → service → Prisma (o provider en `refinement`).

**Patrón del slice `user-stories` (representativo):**

```text
user-stories/
├── user-stories.controller.ts   REST + decoradores Swagger
├── user-stories.service.ts      Orquestación + Prisma
├── dto/                         Respuestas tipadas OpenAPI
├── constants.ts                 Límites y enums de validación
└── utils/
    ├── parse-csv.ts             csv-parse/sync, cabeceras
    └── validate-user-story-row.ts
```

No hay capa de dominio rica ni repositorios abstractos: el servicio llama a `PrismaService` directamente (decisión pragmática MVP).

### Endpoints implementados

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado del API |
| `GET` | `/api/user-stories` | Lista `{ data, total }`, orden `createdAt desc` |
| `POST` | `/api/user-stories/import` | `multipart/form-data`, campo `file`, HTTP 201 |
| `GET` / `POST` | `/api/sprint-capacity` | Listar / crear configuración de capacidad |
| `GET` / `POST` | `/api/sprint-absences` | Listar / crear ausencias |
| `GET` | `/api/sprint-analysis` | Análisis demanda vs capacidad ajustada (`utilization`, `status`: `HEALTHY` / `WARNING` / `OVERLOADED`) |
| `POST` | `/api/refinement/analyze` | Análisis PDF con mock provider (sin persistencia) |

### Import CSV — comportamiento

1. `FileInterceptor('file')` con límite `MAX_CSV_FILE_SIZE_BYTES` (1 MB).
2. Validación de presencia, extensión `.csv` y tamaño.
3. `parseCsv(buffer)` — cabeceras obligatorias: `external_id`, `title`, `story_points`, `status`; columnas permitidas según `ALLOWED_CSV_COLUMNS`; máx. `MAX_CSV_DATA_ROWS` (200).
4. Por cada fila: `validateUserStoryRow` — estados permitidos: `draft`, `ready`, `in_progress`, `done`, `blocked`.
5. `prisma.userStory.createMany` solo con filas válidas.
6. Respuesta: `{ imported, failed, errors: [{ row, message }] }` — import **parcial** (no transacción all-or-nothing).

Errores de cabecera/formato → `400 Bad Request` vía `BadRequestException`.

---

## Frontend architecture

### Stack

- React 19 + TypeScript
- Vite 8 (dev/build)
- Tailwind CSS 4 (`@tailwindcss/vite`)
- React Router 7

### Estructura relevante

```text
apps/web/src/
├── main.tsx
├── App.tsx                 Rutas: /dashboard, /user-stories, /settings, /sprint-analysis, /refinement
├── components/AppNav.tsx
├── pages/
│   ├── DashboardPage.tsx       Placeholder
│   ├── UserStoriesPage.tsx     US-002 CSV import
│   ├── SettingsPage.tsx        US-003 capacity + US-004 absences
│   ├── SprintAnalysisPage.tsx  US-005 análisis sprint
│   └── RefinementPage.tsx      US-006–008 refinamiento PDF
└── api/                        Clientes fetch por módulo (sin TanStack Query)
```

### Estado y datos

- **Sin** store global (Zustand planificado, no usado).
- `UserStoriesPage`: estado local (`useState`) + `useEffect` para carga inicial.
- API base: `import.meta.env.VITE_API_URL` con fallback `http://localhost:3000`.

### Cliente HTTP

`userStoriesApi.ts`:

- `fetchUserStories()` → `GET /api/user-stories`
- `importUserStoriesCsv(file)` → `POST /api/user-stories/import` con `FormData`
- Tipos TypeScript duplicados respecto a DTOs Nest (sin `packages/shared`).

---

## Data model actual

### Prisma (`apps/api/prisma/schema.prisma`)

Modelos **persistidos**:

#### `HealthCheck`

Tabla de validación inicial de Prisma/migraciones.

#### `UserStory`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `String` @id @default(cuid()) | PK |
| `externalId` | `String` | ID del CSV |
| `title` | `String` | |
| `description` | `String` @default("") | |
| `storyPoints` | `Int` | ≥ 0, entero |
| `status` | `String` | Enum lógico en validación, no enum Prisma |
| `sprint` | `String?` | Texto libre |
| `teamName` / `projectName` | `String?` | Opcionales; usados en análisis sprint |
| `source` | `String` @default("csv") | |
| `createdAt` / `updatedAt` | `DateTime` | |
| Índice | `@@index([createdAt])` | Listado |

#### `SprintCapacity`

Capacidad disponible por combinación `(sprint, teamName, projectName)`; `@@unique` en la tripleta.

#### `SprintAbsence`

Días de ausencia agregados por combinación `(sprint, teamName, projectName)`; ajustan capacidad en análisis.

**No implementado** respecto a `docs/04-data-model.md`: `User`, `Project`, `Sprint`, `TeamMember` como entidades relacionales, `RequirementDocument`, `RefinementResult`, `ExportJob`, FKs entre entidades. Refinement no persiste resultados.

### Migraciones

- `20260507173123_init_healthcheck`
- `20260517111232_add_user_story`

### Conexión

- `DATABASE_URL` en `apps/api/.env`
- Docker: `postgresql://deliveryops:deliveryops@localhost:5433/deliveryops_ai`
- Prisma 7 con adapter PostgreSQL (`@prisma/adapter-pg`, `pg`)

---

## Vertical slice flows

### US-002 — CSV import (detalle)

Flujo completo **implementado y validado manualmente** (ver [docs/DEMO.md](docs/DEMO.md)):

```mermaid
sequenceDiagram
    participant U as Usuario
    participant W as UserStoriesPage
    participant C as userStoriesApi (fetch)
    participant API as UserStoriesController
    participant S as UserStoriesService
    participant P as parseCsv / validateRow
    participant DB as PostgreSQL

    U->>W: Abre /user-stories
    W->>C: fetchUserStories()
    C->>API: GET /api/user-stories
    API->>S: findAll()
    S->>DB: findMany orderBy createdAt desc
    DB-->>W: Tabla o empty state

    U->>W: Selecciona .csv + Import CSV
    W->>C: importUserStoriesCsv(file)
    C->>API: POST /api/user-stories/import (multipart)
    API->>S: importFromCsv(file)
    S->>P: parseCsv + validateUserStoryRow por fila
    S->>DB: createMany (filas válidas)
    API-->>W: { imported, failed, errors }
    W->>C: fetchUserStories() refetch
    C->>API: GET /api/user-stories
    API-->>W: Tabla actualizada
```

### Equivalente en texto

```text
CSV file (usuario)
    → UserStoriesPage (input file + botón Import CSV)
    → userStoriesApi.importUserStoriesCsv (FormData POST)
    → UserStoriesController.import (FileInterceptor)
    → UserStoriesService.importFromCsv
        → parseCsv (csv-parse)
        → validateUserStoryRow (por fila)
        → Prisma createMany
    → PostgreSQL UserStory
    → respuesta 201 + resumen
    → UserStoriesPage muestra banner + loadStories()
    → GET /api/user-stories → tabla refrescada
```

### Otros slices implementados

| Módulo | Flujo resumido | Spec |
|--------|----------------|------|
| `sprint-capacity` | Settings → `POST /api/sprint-capacity` → Prisma | [sprint-capacity-mvp.md](docs/sprint-capacity-mvp.md) |
| `sprint-absences` | Settings → `POST /api/sprint-absences` → Prisma | [sprint-absences-mvp.md](docs/sprint-absences-mvp.md) |
| `sprint-analysis` | `GET /api/sprint-analysis` agrega UserStory + capacity + absences | [sprint-analysis-mvp.md](docs/sprint-analysis-mvp.md) |
| `refinement` | `POST /api/refinement/analyze` → mock provider → UI editable | [refinement-mvp.md](docs/refinement-mvp.md) |

---

## API and OpenAPI / Swagger approach

- Documentación generada en runtime desde decoradores `@nestjs/swagger`.
- Tag `user-stories` en el controller del slice.
- DTOs de respuesta: `ListUserStoriesResponseDto`, `ImportUserStoriesResponseDto`, `UserStoryResponseDto`.
- `POST import`: `@ApiConsumes('multipart/form-data')`, `@ApiBody` con `format: binary`.
- Exploración manual: `http://localhost:3000/api/docs`.

**Regla:** nuevos endpoints deben llevar `@ApiOperation`, respuestas tipadas y códigos de error documentados antes de considerarse cerrados.

---

## Database and Prisma approach

| Aspecto | Decisión actual |
|---------|-----------------|
| ORM | Prisma Client v7 |
| DB | PostgreSQL 16 (Docker local) |
| Migraciones | `prisma migrate` en desarrollo |
| Acceso | `PrismaService` inyectable global (`PrismaModule`) |
| Transacciones slice import | `createMany` sin `$transaction` envolvente (parcial por diseño) |
| Seed | No hay seed script; datos vía CSV import |

Comandos habituales:

```bash
pnpm --filter api prisma migrate dev
pnpm --filter api prisma generate
```

---

## Testing strategy actual

| Nivel | Alcance | Herramienta |
|-------|---------|-------------|
| Unit (API) | Lógica pura: parsers, validators, utilidades sprint-analysis, refinement mock | Jest en `apps/api/src` |
| API E2E | `GET /api/health` | Jest + Supertest (`apps/api/test/app.e2e-spec.ts`) |
| Playwright smoke/E2E | Specs en `e2e/`: `user-stories`, `settings-sprint-absences`, `sprint-analysis`, `refinement` — UI smoke con API mockeada o sin backend según spec | Playwright (`@playwright/test`, `playwright.config.ts`) |
| Frontend unit | Solo compilación TypeScript en build | Sin Vitest / React Testing Library |

Ejecutar:

```bash
pnpm --filter api test          # unit + API e2e (Jest)
pnpm test:e2e                   # Playwright smoke/E2E desde raíz del monorepo
```

Playwright arranca el dev server de `apps/web` automáticamente (`webServer` en `playwright.config.ts`). Los specs de `e2e/` validan renderizado y flujos UI de los slices implementados; no sustituyen pruebas de integración API+PostgreSQL en CI.

Los escenarios BDD en `docs/*-mvp.md` complementan validación manual y Swagger; [docs/DEMO.md](docs/DEMO.md) define el checklist E2E local con backend real.

---

## AI-first architecture principles

Alineado con `docs/07-ai-development-workflow.md` (visión) y práctica real del repo:

1. **Specification before code** — `user-stories-import-mvp.md` precedió al módulo `user-stories`.
2. **Contract visibility** — Swagger como contrato ejecutable para humanos y LLMs.
3. **Thin vertical proof** — Un flujo demuestra UI → API → DB sin esperar auth ni IA.
4. **Test where logic is pure** — Parser/validator con Jest; UI deferida.
5. **Prompt traceability** — `prompts.md` IDs P-013…P-016 documentan generación asistida.
6. **Progressive complexity** — `packages/shared`, auth y dominio rico se posponen explícitamente.
7. **Human validation gate** — Demo manual y revisión de límites antes de entrega máster.

**No implementado aún:** proveedor IA real (OpenAI/Azure), RAG, workers async.

---

## Current technical decisions

| Tema | Decisión | Razón MVP |
|------|----------|-----------|
| Monorepo pnpm | Sí | Separación apps, lockfile único |
| Módulo Nest por feature | Un módulo por slice (`user-stories`, `sprint-*`, `refinement`) | Cohesión vertical |
| `csv-parse` | Sync en buffer | Simplicidad, archivo pequeño |
| Import parcial | `createMany` tras validar filas | UX útil con CSVs mixtos |
| Sin dedup `externalId` | Aceptado | Slice futuro |
| fetch nativo en web | Sin TanStack Query | Menos dependencias en slice 1 |
| Estado local React | Suficiente para una página | Sin Zustand aún |
| CORS lista fija | Solo dev Vite | Producción fuera de scope |
| `packages/shared` vacío | Tipos duplicados FE/BE | Evitar premature abstraction |
| Prisma sin enums DB para `status` | String + validación app | Flexibilidad CSV |

---

## Known limitations and future evolution

### Limitaciones actuales

- Sin seguridad ni multi-tenant.
- Modelo de datos: `UserStory`, `SprintCapacity`, `SprintAbsence`, `HealthCheck` (sin FKs ni entidades de refinamiento/export).
- Dashboard sin funcionalidad.
- Refinement usa mock provider; resultados no persistidos.
- Re-importación genera duplicados.
- Sin paginación, filtros ni edición/borrado de stories.
- Sin colas ni procesamiento async de imports grandes.
- Tests E2E del import no en CI.
- CORS y `VITE_API_URL` orientados a desarrollo local.

### Evolución prevista (documentada, no en código)

Orden típico sugerido en specs y backlog:

1. Deduplicación/upsert por `externalId`
2. Entidad `Project` y FKs en `UserStory`
3. Autenticación y aislamiento por workspace (US-001)
4. Tipos en `packages/shared`
5. Proveedor IA real (sustituir mock en `refinement`)
6. Export operativo Excel (US-009)
7. CI/CD con PostgreSQL en runner, despliegue (Vercel/Render), Neon PostgreSQL

Consultar `docs/06-technical-backlog.md`, `docs/08-delivery-plan.md` y README sección *Planned* para el roadmap completo del máster.

---

## Local runtime topology

```text
┌─────────────────┐     HTTP (VITE_API_URL)      ┌─────────────────┐
│  apps/web       │ ───────────────────────────► │  apps/api       │
│  Vite :5173+    │                              │  Nest :3000     │
└─────────────────┘                              └────────┬────────┘
                                                            │ Prisma
                                                            ▼
                                                   ┌─────────────────┐
                                                   │  PostgreSQL     │
                                                   │  Docker :5433   │
                                                   └─────────────────┘
```

---

## Related documentation map

| Documento | Contenido |
|-----------|-----------|
| [docs/adr/README.md](docs/adr/README.md) | ADRs: decisiones arquitectónicas aceptadas (MVP) |
| [docs/user-stories-import-mvp.md](docs/user-stories-import-mvp.md) | Spec y BDD del slice implementado |
| [docs/04-data-model.md](docs/04-data-model.md) | Modelo objetivo completo (mayoría no migrada) |
| [docs/03-technical-design.md](docs/03-technical-design.md) | Diseño objetivo y principios |
| [docs/DEMO.md](docs/DEMO.md) | Pasos demo E2E |
| [prompts.md](prompts.md) | Trazabilidad prompts IA |

---

*Última revisión alineada con el repositorio: junio 2026.*
