# User Stories Import MVP — Mini especificación

**Proyecto:** DeliveryOps AI  
**Vertical slice:** User Stories Import MVP  
**Estado:** Implementado y validado manualmente (spec-first completado)  
**Referencia producto:** US-002 (Upload User Stories CSV) en `docs/05-user-stories.md`  
**Stack actual:** monorepo pnpm · `apps/api` (NestJS + Prisma + Swagger) · `apps/web` (React + Vite + Tailwind + React Router)

---

## 1. Objetivo del vertical slice

Demostrar el primer flujo de valor end-to-end del producto:

**Subir un CSV de User Stories → el backend valida y persiste → el frontend lista las User Stories importadas.**

Este slice valida la cadena técnica completa (UI → API → Prisma → PostgreSQL → UI) sin introducir complejidad de plataforma enterprise.

---

## 2. Problema que resuelve

Los equipos de delivery suelen trabajar con User Stories dispersas en hojas de cálculo o exports de herramientas externas. Antes de planificar sprints o refinar requisitos con IA, necesitan una **fuente única y consultable** dentro de DeliveryOps AI.

Antes de este slice, el proyecto tenía foundation técnica pero **no persistía ni mostraba User Stories de negocio**. Este MVP cerró esa brecha con importación CSV y listado; el flujo E2E está operativo en local (ver [DEMO.md](DEMO.md)).

---

## 3. Flujo E2E completo

```text
[Usuario]                    [Frontend web]              [API NestJS]              [PostgreSQL]
    |                              |                          |                          |
    | 1. Abre /user-stories        |                          |                          |
    |----------------------------->|                          |                          |
    |                              | 2. GET /api/user-stories |                          |
    |                              |------------------------->|                          |
    |                              |                          | 3. SELECT user_stories   |
    |                              |                          |------------------------->|
    |                              |                          |<-------------------------|
    |                              |<-------------------------|  (lista vacía o previa)  |
    | 4. Ve tabla (vacía o datos)  |                          |                          |
    |                              |                          |                          |
    | 5. Selecciona archivo .csv   |                          |                          |
    | 6. Pulsa "Importar"          |                          |                          |
    |----------------------------->|                          |                          |
    |                              | 7. POST multipart CSV    |                          |
    |                              |    /api/user-stories/import                         |
    |                              |------------------------->|                          |
    |                              |                          | 8. Parse + validate rows |
    |                              |                          | 9. INSERT válidas (tx)   |
    |                              |                          |------------------------->|
    |                              |                          |<-------------------------|
    |                              |<-------------------------| 10. Resumen importación  |
    | 11. Ve mensaje éxito/errores |                          |                          |
    |                              | 12. Refetch GET list     |                          |
    |                              |------------------------->|                          |
    | 13. Ve tabla actualizada     |<-------------------------|                          |
```

**Resultado esperado:** al finalizar un import válido, las filas persistidas son visibles en la página User Stories sin recargar manualmente la aplicación (refetch tras éxito).

---

## 4. Alcance MVP

### Backend (`apps/api`)

- Modelo Prisma `UserStory` (mínimo, ver sección 6).
- Migración Prisma aplicada en entorno local.
- Módulo NestJS `user-stories` con responsabilidades acotadas:
  - parseo CSV en servidor,
  - validación de filas,
  - persistencia vía `PrismaService`,
  - exposición REST documentada en Swagger.
- Endpoints:
  - `POST /api/user-stories/import` — subida CSV (`multipart/form-data`, campo `file`).
  - `GET /api/user-stories` — listado ordenado por `createdAt` descendente.
- Respuesta de import con resumen: `imported`, `failed`, `errors[]` (fila + motivo).
- Validaciones mínimas de negocio (ver sección 6 y reglas CSV).
- Tests unitarios del parser/validador y test e2e o integración del controller (alcance mínimo).

### Frontend (`apps/web`)

- Evolución de `UserStoriesPage` (`/user-stories`):
  - selector de archivo `.csv`,
  - botón de importación,
  - feedback de éxito/error,
  - tabla simple con columnas visibles al usuario.
- Cliente HTTP mínimo (p. ej. `fetch`) apuntando a API local (`VITE_API_URL` o proxy Vite en dev).
- Sin estado global; estado local de página suficiente para MVP.

### Contrato y calidad

- DTOs y decoradores Swagger en endpoints del slice.
- Escenarios BDD (sección 12) como base de pruebas manuales y automatizadas.
- Registro del prompt de implementación en `prompts.md` al cerrar el slice.

---

## 5. Fuera de alcance

Explícitamente **no** forma parte de este slice:

| Área | Motivo |
|------|--------|
| Autenticación / autorización | Foundation sin usuarios aún |
| Multi-tenant / `Project` | Un workspace implícito en MVP |
| Entidades `Sprint`, `TeamMember`, capacity | Siguiente vertical slice |
| Refinamiento con IA | Slice posterior (US-007+) |
| Colas async / workers / event bus | Import síncrono y acotado |
| Procesamiento masivo (miles de filas) | Límite de filas bajo (p. ej. ≤ 200) |
| Edición / borrado / merge de stories | Solo create + list |
| Import incremental por `externalId` | Re-import crea nuevos registros o se define en implementación; no deduplicación avanzada |
| shadcn/ui, tablas avanzadas, paginación server-side | UI mínima con Tailwind |
| `packages/shared` con tipos compartidos | Opcional post-MVP; duplicación mínima aceptable en slice 1 |
| Export CSV/PDF | Slice de reporting |

---

## 6. Modelo de datos mínimo

### Entidad `UserStory` (Prisma)

Campos para este MVP (sin `Project` ni FK a `Sprint`):

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| `id` | `String` (cuid/uuid) | sí | PK |
| `externalId` | `String` | sí | ID del CSV (`story_id` / `id`) |
| `title` | `String` | sí | |
| `description` | `String` | no | Vacío → `""` |
| `storyPoints` | `Int` | sí | ≥ 0 |
| `status` | `String` | sí | Valores permitidos acotados (ver abajo) |
| `sprint` | `String?` | no | Texto libre del CSV; sin entidad Sprint |
| `source` | `String` | sí | Default: `csv` |
| `createdAt` | `DateTime` | sí | auto |
| `updatedAt` | `DateTime` | sí | auto |

**`status` permitidos (MVP):** `draft`, `ready`, `in_progress`, `done`, `blocked`  
Si el CSV trae otro valor → error de validación en esa fila.

**Índices (recomendado):** `@@index([createdAt])` para listado.

> **Simplificación:** se omite `projectId` y `sprintId` del modelo completo (`docs/04-data-model.md`) hasta exista gestión de proyectos.

### Formato CSV esperado

Separador: **coma** (`,`). Primera fila: **cabecera**.

| Columna CSV | Campo destino | Obligatorio |
|-------------|---------------|-------------|
| `external_id` | `externalId` | sí |
| `title` | `title` | sí |
| `description` | `description` | no |
| `story_points` | `storyPoints` | sí |
| `status` | `status` | sí |
| `sprint` | `sprint` | no |

Nombres en **snake_case** para alinear con convenciones API/DB del proyecto.

**Ejemplo:**

```csv
external_id,title,description,story_points,status,sprint
US-101,Login de usuario,Como usuario quiero iniciar sesión,5,ready,Sprint 1
US-102,Recuperar contraseña,,3,draft,Sprint 1
```

---

## 7. API mínima necesaria

Prefijo global existente: `/api`.

### `POST /api/user-stories/import`

- **Content-Type:** `multipart/form-data`
- **Body:** `file` (`.csv`, max ~1 MB en MVP)
- **Proceso:** leer buffer → parsear → validar fila a fila → insertar válidas en transacción → devolver resumen
- **201 Created** (éxito parcial o total):

```json
{
  "imported": 2,
  "failed": 1,
  "errors": [
    { "row": 3, "message": "story_points must be a non-negative integer" }
  ]
}
```

- **400 Bad Request:** archivo ausente, no CSV, cabecera inválida, archivo vacío
- **413 / 400:** supera límite de filas o tamaño (definir en implementación)

### `GET /api/user-stories`

- **200 OK:**

```json
{
  "data": [
    {
      "id": "clx...",
      "externalId": "US-101",
      "title": "Login de usuario",
      "description": "Como usuario quiero iniciar sesión",
      "storyPoints": 5,
      "status": "ready",
      "sprint": "Sprint 1",
      "source": "csv",
      "createdAt": "2026-05-17T10:00:00.000Z",
      "updatedAt": "2026-05-17T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

### OpenAPI / Swagger

- Tag: `user-stories`
- Documentar schemas de request/response y códigos de error
- Probar manualmente en `/api/docs` (foundation ya disponible)

### CORS (dev)

- Habilitar origen del dev server Vite (`http://localhost:5173` / puerto alternativo) en `main.ts` para este slice.

---

## 8. UI mínima necesaria

**Ruta:** `/user-stories` (`UserStoriesPage`)

| Bloque | Comportamiento |
|--------|----------------|
| Título + descripción breve | Contexto del módulo |
| Zona de upload | `<input type="file" accept=".csv">` + botón "Importar CSV" |
| Mensaje de resultado | Banner éxito (verde) o errores (rojo/ámbar) según respuesta API |
| Tabla | Columnas: External ID, Title, Story Points, Status, Sprint, Created |
| Estado vacío | Texto: "No user stories yet. Import a CSV to get started." |
| Loading | Deshabilitar botón y spinner/texto durante import y carga inicial |

**No incluir:** modales complejos, filtros, paginación, drag-and-drop, preview del CSV fila a fila antes de enviar.

---

## 9. Flujo frontend/backend

```text
UserStoriesPage mount
  → GET /api/user-stories
  → render table | empty state

User selects file + clicks Import
  → POST /api/user-stories/import (FormData)
  → if 2xx: show summary (imported/failed/errors)
  → GET /api/user-stories (refetch)
  → update table

Network error / 5xx
  → show generic error message (no crash)
```

**Configuración dev recomendada:**

- Variable `VITE_API_URL=http://localhost:3000` en `apps/web/.env.example`
- Alternativa: proxy en `vite.config.ts` (`/api` → backend)

---

## 10. Riesgos y simplificaciones

| Riesgo | Mitigación MVP |
|--------|----------------|
| CSV mal formado (comas en texto) | Documentar que descripción no debe incluir comas sin comillas; parser simple; mejoras posteriores |
| Re-import duplica stories | Aceptado en MVP; documentar; deduplicación por `externalId` en slice futuro |
| Archivos grandes bloquean request | Límite ~200 filas y ~1 MB; rechazar con mensaje claro |
| Sin auth: cualquiera importa | Aceptable en entorno local/MVP académico |
| Tipos duplicados FE/BE | Aceptable en slice 1; extraer a `packages/shared` después |
| CORS en producción | Fuera de scope; solo dev local |
| Transacción parcial | Insertar solo filas válidas; reportar fallidas (no rollback total si hay mezcla) |

**Simplificaciones arquitectónicas aceptadas:**

- Un módulo NestJS por vertical slice (`user-stories/`), Sin Clean Architecture completa; se aplicará una estructura modular simple con separación básica controller/service/parser/DTOs.

- Parser CSV con librería ligera (p. ej. `csv-parse`) en lugar de lógica custom extensa.
- Sin capa de dominio rica; servicio + DTOs suficientes.

---

## 11. Estrategia AI-first aplicada

| Fase | Práctica |
|------|----------|
| **Spec-first** | Este documento es la fuente de verdad antes de codificar el slice |
| **Prompt trazable** | Tras implementación, registrar prompt en `prompts.md` (ID consecutivo) con resultado real |
| **OpenAPI-first** | Contrato REST visible en Swagger; la IA genera DTOs/controllers alineados al spec |
| **BDD como guía** | Escenarios Given/When/Then (sección 12) alimentan tests e2e y checklist manual |
| **Implementación asistida** | Cursor/LLM implementa módulo Prisma, endpoints y página a partir de esta spec + foundation existente |
| **Revisión humana** | Validar CSV de ejemplo, límites de filas y respuesta de errores antes de merge |
| **Validaciones ejecutables** | `pnpm --filter api build/test`, `pnpm --filter web build`, smoke manual del flujo E2E |

**Orden sugerido de prompts de implementación:**

1. Prisma model + migration  
2. Backend module + import/list endpoints + tests  
3. Frontend UserStoriesPage + API client  
4. Smoke E2E + actualización `prompts.md`

---

## 12. Criterios BDD (Given / When / Then)

### Escenario 1 — Importación exitosa

```gherkin
Given the API is running and the database is available
And the user is on the "/user-stories" page
And a valid CSV file with header "external_id,title,description,story_points,status,sprint"
And the CSV contains 2 valid data rows
When the user uploads the CSV and confirms import
Then the API responds with imported count equal to 2
And the user stories table displays 2 rows
And each row shows external ID, title, story points, and status
```

### Escenario 2 — CSV con filas inválidas (éxito parcial)

```gherkin
Given the user is on the "/user-stories" page
And a CSV file with 3 data rows where 1 row has non-numeric story_points
When the user uploads the CSV and confirms import
Then the API responds with imported count equal to 2
And failed count equal to 1
And an error message references the invalid row
And the table displays only the 2 valid imported rows
```

### Escenario 3 — Cabecera inválida

```gherkin
Given the user is on the "/user-stories" page
And a CSV file missing the "title" column
When the user uploads the CSV and confirms import
Then the API responds with HTTP 400
And no new user stories are created
And the UI shows a validation error message
```

### Escenario 4 — Listado sin datos previos

```gherkin
Given no user stories exist in the database
When the user opens the "/user-stories" page
Then the API returns an empty list
And the UI shows the empty state message
```

### Escenario 5 — Archivo no CSV

```gherkin
Given the user is on the "/user-stories" page
When the user attempts to import a .txt or .xlsx file
Then the UI prevents submission or the API returns HTTP 400
And no user stories are created
```

---

## 13. Próximos pasos tras este MVP

1. **Deduplicación / upsert** por `externalId` en re-importaciones.  
2. **Entidad `Project`** y asociación `projectId` en `UserStory`.  
3. **Vertical slice Team Capacity** (US-003) usando stories importadas.  
4. **Tipos compartidos** en `packages/shared` (DTOs FE/BE).  
5. **Paginación y filtros** en listado cuando el volumen crezca.  
6. **Refinamiento IA** (US-007) sobre stories ya persistidas.  
7. **Auth** y aislamiento por workspace cuando deje de ser MVP local.

---

## Definición de hecho (DoD) del slice

- [x] Migración Prisma `UserStory` aplicada  
- [x] `POST /api/user-stories/import` y `GET /api/user-stories` operativos y documentados en Swagger  
- [x] `UserStoriesPage` permite import + listado  
- [x] Escenarios BDD 1, 3 y 4 verificados manualmente (mínimo)  
- [x] `pnpm --filter api build` y `pnpm --filter api test` OK  
- [x] `pnpm --filter web build` OK  
- [x] Entrada añadida en `prompts.md`

> **Implemented and manually validated on 2026-05-17.**

---

**Documento:** `docs/user-stories-import-mvp.md`  
**Última actualización:** 2026-05-20
