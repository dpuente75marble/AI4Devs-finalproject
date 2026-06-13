# Sprint Absences MVP Specification

**Proyecto:** DeliveryOps AI  
**Vertical slice:** Sprint Absences MVP  
**Estado:** Spec-first — revisión v1 (ausencias por sprint, gerencia y proyecto)  
**Referencia producto:** US-004 (Register Vacations and Absences) en `docs/05-user-stories.md`  
**Issue GitHub:** #10 (spec incremental requerida antes de código)  
**Backlog interno:** GH-08  
**Stack actual:** monorepo pnpm · `apps/api` (NestJS + Prisma + Swagger) · `apps/web` (React + Vite + Tailwind + React Router)  
**Prerequisitos implementados:** US-002 (import CSV) · US-003 (Sprint Capacity — `docs/sprint-capacity-mvp.md`)

---

## 1. Objetivo

Permitir que un Project Manager **registre ausencias por sprint, gerencia y proyecto** en DeliveryOps AI, de forma que los datos queden persistidos en PostgreSQL y puedan usarse para calcular una **capacidad ajustada simplificada** que alimente el siguiente slice de análisis **demand vs capacity** (US-005 / GH-09).

Este vertical slice cierra el tercer eslabón del flujo de planificación sprint:

**Configurar capacidad (US-003) → registrar ausencias → visualizar capacidad ajustada → habilitar análisis US-005.**

No implementa calendarios laborales, ausencias por persona ni el motor de overload. Su propósito es introducir un registro mínimo de días de ausencia agregados por combinación sprint + gerencia + proyecto, reutilizando el catálogo y las convenciones de US-003.

---

## 2. Alcance MVP

### Backend (`apps/api`)

- Modelo Prisma `SprintAbsence` (entidad mínima, ver sección 4).
- Migración Prisma incremental sobre el esquema existente (`SprintCapacity` ya presente).
- Módulo NestJS `sprint-absences` con responsabilidades acotadas:
  - validación de entrada,
  - persistencia vía `PrismaService`,
  - exposición REST documentada en Swagger.
- Endpoints:
  - `GET /api/sprint-absences` — listado de ausencias registradas.
  - `POST /api/sprint-absences` — crear un nuevo registro de ausencia.
- Validaciones de negocio (ver sección 5).
- Función pura de cálculo de capacidad ajustada (ver sección 6), testeable en unitarios.
- Tests unitarios de reglas de validación y de la regla de ajuste; test de integración o e2e mínimo del controller.

### Frontend (`apps/web`)

- Sección **Sprint Absences** en **Settings** (`/settings`), **debajo** de la sección Sprint Capacity existente.
- Formulario con campos: `sprint`, `teamName`, `projectName`, `absenceDays`, `reason`.
- `teamName` como **desplegable** con valores cerrados de gerencia (mismo catálogo que US-003).
- `projectName` como **desplegable dependiente** de la gerencia seleccionada.
- Precarga automática de `sprint` reutilizando la misma lógica de sugerencia que Sprint Capacity (ver `docs/sprint-capacity-mvp.md`, sección 7).
- Listado/tabla de ausencias guardadas (lectura desde `GET /api/sprint-absences`).
- Columna o indicador de **capacidad ajustada** calculada en UI cuando exista un `SprintCapacity` para la misma combinación `(sprint, teamName, projectName)`.
- Feedback de éxito/error tras envío del formulario.
- Refetch del listado tras creación exitosa.
- Sin estado global; estado local de página suficiente para MVP.

### Contrato y calidad

- DTOs y decoradores Swagger en endpoints del slice.
- Escenarios BDD (sección 9) como base de pruebas manuales y automatizadas.
- Registro del prompt de implementación en `prompts.md` al cerrar el slice.

---

## 3. Fuera de alcance

Explícitamente **no** forma parte de este slice:

| Área | Motivo |
|------|--------|
| Fechas de inicio/fin de ausencia | Simplificación MVP; se registra solo `absenceDays` agregados |
| Calendarios laborales y días hábiles | Complejidad fuera del slice académico |
| Entidad `TeamMember` y ausencias por persona | Slice posterior; MVP agrega días a nivel sprint + gerencia + proyecto |
| Festivos y días no laborables | Requiere calendario organizacional |
| Medias jornadas | Solo días enteros en MVP |
| Edición (`PUT`/`PATCH`) y borrado (`DELETE`) | Fuera del contrato mínimo; iteración futura |
| Reglas reales de conversión día → story points | MVP usa **1 día = 1 punto** como simplificación explícita (ver sección 7) |
| Cálculo final de overload / demand vs capacity (US-005) | Consumidor downstream; no parte de este slice |
| Modificar `SprintCapacity.availablePoints` al registrar ausencia | La capacidad base permanece intacta; el ajuste es derivado |
| Autenticación y autorización (US-001) | Endpoints abiertos como en slices CSV y Sprint Capacity |
| Histórico avanzado, versionado o auditoría | Solo create + list en MVP |
| Multi-tenant / aislamiento por organización | MVP académico local |
| CRUD dinámico de gerencias o proyectos | Catálogo fijo reutilizado de US-003 |
| `packages/shared` con tipos compartidos | Duplicación mínima FE/BE aceptable en este slice |
| Export Excel / reporting (US-009) | Slice de reporting |
| IA / refinamiento de requisitos | Epic separada |

---

## 4. Modelo de datos mínimo propuesto

### Catálogo de dominio (reutilizado de US-003)

**Gerencias (`teamName`):**

| Valor | Notas |
|-------|-------|
| `Gerencia Riesgo` | Una gerencia |
| `Gerencia Ahorro` | Una gerencia |

**Proyectos (`projectName`) por gerencia:**

| Gerencia | Proyectos permitidos |
|----------|---------------------|
| `Gerencia Ahorro` | `Ahorro`, `Pasarelas`, `Gestionados` |
| `Gerencia Riesgo` | `Riesgo` (valor único esperado en MVP) |

> Mismos valores y reglas de dependencia que `docs/sprint-capacity-mvp.md`. La implementación puede duplicar constantes en el módulo `sprint-absences` o extraer un helper compartido interno en `apps/api` si reduce drift; no es obligatorio en MVP.

### Entidad `SprintAbsence` (Prisma)

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| `id` | `String` (cuid) | sí | PK |
| `sprint` | `String` | sí | Texto libre; alineado con `UserStory.sprint` y `SprintCapacity.sprint` |
| `teamName` | `String` | sí | Gerencia; valor del catálogo cerrado |
| `projectName` | `String` | sí | Proyecto dentro de la gerencia; valor del catálogo dependiente |
| `absenceDays` | `Int` | sí | Días de ausencia agregados; **> 0** |
| `reason` | `String` | sí | Motivo breve; máximo 100 caracteres |
| `createdAt` | `DateTime` | sí | auto |
| `updatedAt` | `DateTime` | sí | auto |

**Índice recomendado:** `@@index([sprint])` para consultas futuras de análisis por sprint.

**Índice compuesto recomendado:** `@@index([sprint, teamName, projectName])` para localizar rápidamente ausencias de una combinación al calcular capacidad ajustada.

**Unicidad:** **no** se impone unicidad en MVP. Pueden coexistir varios registros para la misma combinación `(sprint, teamName, projectName)` con distintos motivos; la capacidad ajustada **suma** todos los `absenceDays` de esa combinación (ver sección 6).

### Relación con `SprintCapacity`

No hay FK en MVP. La relación es **lógica** por coincidencia de `(sprint, teamName, projectName)` normalizados con `trim()`.

| Entidad | Rol |
|---------|-----|
| `SprintCapacity` | Capacidad base (`availablePoints`) configurada en US-003 |
| `SprintAbsence` | Registro(s) de días de ausencia que reducen capacidad de forma derivada |
| Capacidad ajustada | Valor calculado en lectura; **no persistido** en base de datos |

### Esquema Prisma propuesto (referencia)

```prisma
model SprintAbsence {
  id           String   @id @default(cuid())
  sprint       String
  teamName     String
  projectName  String
  absenceDays  Int
  reason       String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([sprint])
  @@index([sprint, teamName, projectName])
}
```

### Por qué se reduce respecto a `docs/04-data-model.md`

El modelo completo define `Absence` ligada a `TeamMember`, con fechas, tipos de ausencia y impacto granular en la capacidad del sprint. Esa granularidad es correcta para un SaaS maduro, pero **bloquea el delivery incremental** del MVP académico.

**Decisiones de simplificación:**

| Modelo completo (`docs/04`) | MVP `SprintAbsence` | Razón |
|----------------------------|---------------------|-------|
| `Absence` + FK a `TeamMember` | `absenceDays` agregados por sprint + gerencia + proyecto | Sin gestión de personas en MVP |
| Fechas inicio/fin | Campo entero `absenceDays` | Evita calendarios y validación de rangos |
| Tipo de ausencia (vacaciones, baja…) | Campo texto `reason` | Motivo libre acotado a 100 caracteres |
| Reducción automática en `Sprint.capacityPoints` | Cálculo derivado en lectura | No muta capacidad base de US-003 |
| Conversión día hábil → puntos | **1 día = 1 punto** | Simplificación explícita para habilitar US-005 |

El slice **no contradice** el modelo objetivo: introduce una entidad puente que US-005 podrá usar junto con `SprintCapacity` y la demanda agregada de `UserStory.storyPoints`.

---

## 5. Reglas de validación

### Campos obligatorios

| Campo | Regla |
|-------|-------|
| `sprint` | Obligatorio; tras `trim()`, longitud ≥ 1 |
| `teamName` | Obligatorio; debe ser uno de: `Gerencia Riesgo`, `Gerencia Ahorro` |
| `projectName` | Obligatorio; debe ser válido para la `teamName` seleccionada (ver catálogo) |
| `absenceDays` | Obligatorio; entero; **estrictamente mayor que 0** |
| `reason` | Obligatorio; tras `trim()`, longitud ≥ 1 y ≤ 100 caracteres |

### Reglas de catálogo

| Gerencia | `projectName` permitidos |
|----------|-------------------------|
| `Gerencia Ahorro` | `Ahorro`, `Pasarelas`, `Gestionados` |
| `Gerencia Riesgo` | `Riesgo` |

Si `projectName` no pertenece al catálogo de la gerencia indicada → `400 Bad Request`.

### Reglas adicionales

| Regla | Comportamiento |
|-------|----------------|
| Tipo numérico | `absenceDays` debe ser número entero válido (rechazar decimales y no numéricos) |
| Normalización | Aplicar `trim()` a `sprint`, `teamName`, `projectName` y `reason` antes de persistir |
| Límite de longitud | `sprint`, `teamName` y `projectName` ≤ 100 caracteres; `reason` ≤ 100 caracteres |
| Ausencia cero o negativa | Rechazar con mensaje claro: *"absenceDays must be greater than 0"* |
| `reason` vacío | Rechazar tras trim con mensaje indicando campo obligatorio |
| `teamName` fuera de catálogo | Rechazar con mensaje: *"teamName must be a valid gerencia"* |
| `projectName` inválido para gerencia | Rechazar con mensaje indicando proyecto no permitido |
| Capacidad base inexistente | **No bloquea** el alta de ausencia; solo afecta la visualización de capacidad ajustada |

### Respuestas de error esperadas

| Caso | HTTP | Mensaje orientativo |
|------|------|---------------------|
| Campo ausente o vacío | `400 Bad Request` | Indicar campo concreto |
| `teamName` no permitido | `400 Bad Request` | Gerencia inválida |
| `projectName` no permitido para gerencia | `400 Bad Request` | Proyecto inválido para la gerencia |
| `absenceDays` ≤ 0 o no entero | `400 Bad Request` | Regla de días positivos |
| `reason` vacío o > 100 caracteres | `400 Bad Request` | Regla de motivo |
| Error de base de datos | `500 Internal Server Error` | Mensaje genérico en UI |

---

## 6. Regla simple de ajuste de capacidad

### Fórmula MVP

Para una combinación `(sprint, teamName, projectName)`:

```text
totalAbsenceDays = SUM(absenceDays) de todos los SprintAbsence coincidentes
adjustedCapacity = MAX(0, availablePoints - totalAbsenceDays)
```

Donde `availablePoints` proviene del registro `SprintCapacity` con la misma combinación normalizada.

### Simplificación explícita: 1 día = 1 story point

En el dominio real, un día de ausencia no equivale necesariamente a un story point de capacidad perdida (depende de calendario laboral, dedicación parcial, velocity del equipo, etc.).

**En este MVP se adopta la regla 1 día = 1 punto** de forma consciente y temporal:

- Permite calcular una capacidad ajustada sin implementar calendarios ni `TeamMember`.
- Hace visible el impacto de las ausencias en la UI de Settings.
- Entrega a US-005 un dato derivado coherente (`adjustedCapacity`) listo para comparar contra demanda agregada.

Esta regla **debe documentarse en UI** con una nota breve (p. ej. *"MVP: each absence day reduces capacity by 1 story point"*) para evitar malentendidos operativos.

### Casos borde

| Caso | Comportamiento |
|------|----------------|
| No existe `SprintCapacity` para la combinación | Mostrar ausencia registrada; capacidad ajustada = `—` o *"No capacity configured"* |
| `availablePoints - totalAbsenceDays < 0` | Mostrar `adjustedCapacity = 0` (piso en cero) |
| Varios registros de ausencia misma combinación | Sumar `absenceDays` antes de aplicar la fórmula |
| Capacidad base = 40, una ausencia = 5 días | `adjustedCapacity = 35` |
| Capacidad base = 10, ausencias suman 15 días | `adjustedCapacity = 0` (no negativo) |

### Dónde se calcula

| Capa | Responsabilidad MVP |
|------|---------------------|
| Backend | Función pura `computeAdjustedCapacity(availablePoints, totalAbsenceDays)` testeada en unitarios; opcionalmente expuesta en helper reutilizable por US-005 |
| Frontend | Tras `GET /api/sprint-absences` y datos de capacidad ya cargados en Settings, calcular y mostrar `adjustedCapacity` por fila o por combinación en la tabla |

> **No persistir** `adjustedCapacity` en base de datos en este slice. US-005 recalculará o reutilizará la misma función al analizar overload.

---

## 7. API mínima propuesta

Prefijo global existente: `/api`.

### `GET /api/sprint-absences`

- **Descripción:** devuelve todas las ausencias registradas.
- **Orden:** `createdAt` descendente (más recientes primero).
- **200 OK:**

```json
{
  "data": [
    {
      "id": "clx...",
      "sprint": "Sprint 1",
      "teamName": "Gerencia Ahorro",
      "projectName": "Pasarelas",
      "absenceDays": 3,
      "reason": "Team offsite",
      "createdAt": "2026-06-13T14:00:00.000Z",
      "updatedAt": "2026-06-13T14:00:00.000Z"
    }
  ],
  "total": 1
}
```

### `POST /api/sprint-absences`

- **Content-Type:** `application/json`
- **Body:**

```json
{
  "sprint": "Sprint 1",
  "teamName": "Gerencia Ahorro",
  "projectName": "Pasarelas",
  "absenceDays": 3,
  "reason": "Team offsite"
}
```

- **201 Created:** objeto creado (misma forma que un elemento de `data` en GET).
- **400 Bad Request:** validación fallida (campos obligatorios, catálogo, días inválidos, reason inválido).

### OpenAPI / Swagger

- Tag: `sprint-absences`
- Documentar schemas de request/response, catálogo de valores permitidos y códigos de error.
- Probar manualmente en `/api/docs`.

### CORS (dev)

- Mantener la misma configuración CORS del slice US-002 / US-003 para el dev server Vite.

---

## 8. UI mínima propuesta

**Ubicación preferida:** sección **Sprint Absences** dentro de `/settings` (`SettingsPage`), **inmediatamente debajo** de la sección Sprint Capacity.

| Bloque | Comportamiento |
|--------|----------------|
| Título de sección | "Sprint Absences" + descripción breve del propósito |
| Nota MVP | Texto visible: conversión 1 día = 1 story point es simplificación |
| Formulario | Inputs: Sprint (text), Gerencia (select), Proyecto (select), Absence Days (number, min 1), Reason (text, max 100) |
| Desplegable Gerencia | Opciones fijas: `Gerencia Riesgo`, `Gerencia Ahorro` |
| Desplegable Proyecto | Depende de gerencia seleccionada (mismo catálogo US-003) |
| Precarga de Sprint | Reutilizar lógica de sugerencia de Sprint Capacity (`Sprint N+1`) |
| Botón guardar | `POST /api/sprint-absences`; deshabilitado durante envío |
| Mensaje de resultado | Banner éxito (verde) o error (rojo/ámbar) según respuesta API |
| Tabla de ausencias | Columnas: Sprint, Gerencia, Proyecto, Absence Days, Reason, Adjusted Capacity, Created |
| Capacidad ajustada | Si existe `SprintCapacity` para la fila → mostrar valor calculado; si no → `—` |
| Estado vacío | Texto: *"No sprint absences registered yet. Add an absence to adjust capacity."* |
| Loading | Spinner o texto durante carga inicial y tras guardar |

### Comportamiento del desplegable Proyecto

| Gerencia seleccionada | Opciones de `projectName` |
|----------------------|---------------------------|
| `Gerencia Ahorro` | `Ahorro`, `Pasarelas`, `Gestionados` |
| `Gerencia Riesgo` | `Riesgo` (única opción; seleccionada por defecto) |

Al cambiar de gerencia, resetear `projectName` a la primera opción válida de la nueva gerencia.

### Cálculo de capacidad ajustada en tabla

Para cada fila de ausencia (o agrupando visualmente por combinación si se prefiere en implementación):

1. Buscar `SprintCapacity` con mismo `(sprint, teamName, projectName)`.
2. Sumar `absenceDays` de **todas** las ausencias con esa combinación.
3. Aplicar `adjustedCapacity = MAX(0, availablePoints - totalAbsenceDays)`.
4. Mostrar el resultado numérico o `—` si no hay capacidad base.

**Flujo UI:**

```text
SettingsPage mount
  → GET /api/sprint-capacity (ya existente)
  → GET /api/sprint-absences
  → calcular sprint sugerido (misma lógica que Sprint Capacity)
  → render absence table | empty state

User selects gerencia
  → actualizar opciones de proyecto

User fills form + clicks Save
  → validación local (campos + absenceDays > 0 + reason no vacío)
  → POST /api/sprint-absences
  → if 2xx: show success, limpiar campos excepto sprint sugerido, refetch GET absences
  → if 4xx: show field-level or summary error

Network error / 5xx
  → show generic error message (no crash)
```

**No incluir:** calendarios, selección de miembros, edición/borrado inline, gráficos de overload, wizards multi-paso.

---

## 9. Criterios de aceptación BDD

Alineados con US-004 en `docs/05-user-stories.md`, adaptados al contrato MVP acotado (sin fechas ni `TeamMember`).

### Escenario 1 — Registro exitoso de ausencia (Gerencia Ahorro)

```gherkin
Given the API is running and the database is available
And a sprint capacity exists for sprint "Sprint 1", team "Gerencia Ahorro" and project "Pasarelas" with 40 available points
And the user is on the "/settings" page
When the user selects gerencia "Gerencia Ahorro"
And selects project "Pasarelas"
And submits sprint "Sprint 1", absence days 3, and reason "Team offsite"
Then the API responds with HTTP 201
And the absence is persisted
And the settings page lists the new absence
And the adjusted capacity shown for that combination is 37
```

### Escenario 2 — Registro exitoso (Gerencia Riesgo)

```gherkin
Given the user is on the "/settings" page
And gerencia "Gerencia Riesgo" is selected
When the user submits sprint "Sprint 1", project "Riesgo", absence days 2, and reason "Training"
Then the API responds with HTTP 201
And the absence is persisted with teamName "Gerencia Riesgo" and projectName "Riesgo"
```

### Escenario 3 — Ausencia registrada sin capacidad base configurada

```gherkin
Given no sprint capacity exists for sprint "Sprint 2", team "Gerencia Ahorro" and project "Ahorro"
And the user is on the "/settings" page
When the user submits a valid absence for that combination
Then the API responds with HTTP 201
And the absence appears in the table
And the adjusted capacity column shows no value or "No capacity configured"
```

### Escenario 4 — Valores inválidos rechazados (absenceDays)

```gherkin
Given the user is on the "/settings" page
When the user submits absence days equal to 0
Then the API responds with HTTP 400
And no absence is created
And the UI shows a validation error message
```

### Escenario 5 — Campo reason inválido

```gherkin
Given the user is on the "/settings" page
When the user submits the form with an empty reason
Or with a reason longer than 100 characters
Then the API responds with HTTP 400
And no absence is created
```

### Escenario 6 — Proyecto inválido para gerencia

```gherkin
Given the user is on the "/settings" page
When the user attempts to save teamName "Gerencia Riesgo" with projectName "Pasarelas"
Then the API responds with HTTP 400
And no absence is created
```

### Escenario 7 — Capacidad ajustada con piso en cero

```gherkin
Given a sprint capacity exists for sprint "Sprint 1", team "Gerencia Ahorro" and project "Ahorro" with 5 available points
And absences totaling 8 days already exist for that combination
When the user views the absences table
Then the adjusted capacity shown is 0
And not a negative number
```

### Escenario 8 — Múltiples ausencias misma combinación

```gherkin
Given a sprint capacity exists for sprint "Sprint 1", team "Gerencia Ahorro" and project "Gestionados" with 30 available points
And an absence of 4 days already exists for that combination
When the user registers another absence of 3 days for the same sprint, gerencia and project
Then the API responds with HTTP 201
And the adjusted capacity shown is 23
```

### Escenario 9 — Listado de ausencias existentes

```gherkin
Given two sprint absence records exist in the database
When the user opens the "/settings" page
Then the API returns both absences
And the UI displays both rows in the absences table
```

### Escenario 10 — Campo sprint obligatorio

```gherkin
Given the user is on the "/settings" page
When the user submits the form without sprint
Then the API responds with HTTP 400
And no absence is created
```

---

## 10. Testing esperado

### Backend — unitarios (Jest)

| Área | Casos mínimos |
|------|----------------|
| Validación `sprint` | vacío, solo espacios, válido tras trim |
| Validación `teamName` | vacío, valor fuera de catálogo, valores permitidos |
| Validación `projectName` | vacío, inválido para gerencia, válido por gerencia |
| Validación `absenceDays` | 0, negativo, decimal, no numérico, entero positivo |
| Validación `reason` | vacío, solo espacios, 100 caracteres OK, 101 caracteres → rechazo |
| Catálogo cruzado | `Gerencia Riesgo` + `Pasarelas` → rechazo |
| `computeAdjustedCapacity` | 40 − 3 = 37; 5 − 8 = 0; 0 − 5 = 0; sin capacidad base → helper documentado |

La lógica de validación debe vivir en funciones puras testeables (servicio o helper dedicado), siguiendo el patrón del slice US-003.

### Backend — integración / e2e

| Caso | Verificación |
|------|----------------|
| `POST` válido → `201` + registro en DB | Persistencia real o DB de test |
| `GET` tras `POST` | El registro aparece en listado |
| `POST` proyecto inválido → `400` | Sin persistencia |
| `POST` reason inválido → `400` | Sin persistencia |
| `POST` inválido → `400` | Sin persistencia |

> **Nota CI:** el runner actual no incluye PostgreSQL; los tests de integración pueden ejecutarse en local con Docker (`5433`) y documentarse en el Test plan del PR, coherente con el estado del repo.

### Frontend

| Caso | Verificación |
|------|----------------|
| Render vacío | Mensaje de empty state |
| Desplegable gerencia / proyecto | Mismo comportamiento que Sprint Capacity |
| Envío exitoso | Refetch y fila visible |
| Capacidad ajustada | Con capacity 40 y absence 3 → muestra 37 |
| Sin capacity base | Columna ajustada muestra `—` |
| Error API | Banner de error sin romper la página |
| Reason maxlength | Input limitado o validación local a 100 caracteres |

### Validación manual (smoke)

Checklist mínimo antes de cerrar el slice:

1. Crear ausencia válida para `Gerencia Ahorro` + `Pasarelas` con capacity previa configurada.
2. Verificar capacidad ajustada correcta en tabla.
3. Registrar ausencia sin capacity base → fila visible, ajuste no numérico.
4. Rechazar `absenceDays = 0` y reason vacío.
5. Rechazar `Gerencia Riesgo` + `Pasarelas`.
6. Registrar dos ausencias misma combinación → suma correcta en ajuste.
7. Verificar piso en cero cuando ausencias superan capacity.
8. Swagger muestra ambos endpoints documentados.

---

## 11. Trazabilidad con Issue #10 y documentación existente

| Referencia | Relación con este slice |
|------------|-------------------------|
| **GitHub Issue #10** | Requiere spec incremental aprobada antes de código; este documento es la entrega spec-first solicitada |
| **GH-08** | Backlog ID formal para US-004 en `docs/09-github-backlog-bootstrap.md` |
| **US-004** | Historia de usuario origen: registrar vacaciones y ausencias |
| **US-003 / GH-07** | Prerequisito implementado: `SprintCapacity` con catálogo gerencia/proyecto |
| **US-002** | User Stories importadas con campo `sprint` usable en análisis futuro |
| **US-005 / GH-09** | Consumidor downstream: análisis demand vs capacity (usa `availablePoints`, ausencias y demanda) |
| **TB-012** | Tarea técnica original de ausencias en `docs/06-technical-backlog.md`; **reducida** en este MVP |
| `docs/sprint-capacity-mvp.md` | Patrón spec-first, catálogo, API/UI y convenciones de este slice |
| `docs/02-functional-specification.md` | Módulo Team Capacity — subconjunto "Configure absences" simplificado |
| `docs/04-data-model.md` | Modelo objetivo con `Absence` + `TeamMember`; este slice implementa subconjunto mínimo |
| `docs/05-user-stories.md` | BDD US-004 base (adaptado sin fechas ni miembro) |
| `docs/user-stories-import-mvp.md` | Patrón de referencia para vertical slice spec-first |
| `docs/adr/ADR-004-vertical-slice-first.md` | Justificación del enfoque por slice E2E |
| `docs/adr/ADR-003-nestjs-prisma-postgresql.md` | Stack de persistencia |

### Cadena de dependencias

```text
US-002 (import CSV) ✅ implementado
        │
        ▼
US-003 (Sprint Capacity) ✅ implementado
        │
        ▼
US-004 (este spec) ──► SprintAbsence persistido + capacidad ajustada derivada
        │
        └──► US-005 (análisis overload) ──► demand vs adjustedCapacity
```

---

## 12. Decisiones de alcance

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|----------------------|--------|
| D1 | Entidad `SprintAbsence` agregada | `Absence` + `TeamMember` + fechas | Desbloquea valor en un slice sin TB-010/011 |
| D2 | `absenceDays` entero manual | Rango de fechas con calendario laboral | Evita complejidad de días hábiles y festivos |
| D3 | **1 día = 1 story point** | Conversión por velocity o dedicación | Simplificación explícita para MVP y US-005 |
| D4 | Capacidad ajustada **calculada**, no persistida | Actualizar `SprintCapacity.availablePoints` | Preserva capacidad base; trazabilidad clara |
| D5 | Reutilizar catálogo US-003 | Catálogo independiente | Coherencia gerencia/proyecto en todo el flujo |
| D6 | Sin unicidad en `(sprint, teamName, projectName)` | Una sola fila por combinación | Permite varios motivos; suma en ajuste |
| D7 | Piso `MAX(0, …)` en capacidad ajustada | Permitir valores negativos | Evita capacidad negativa confusa en UI y US-005 |
| D8 | Solo `GET` + `POST` | CRUD completo | Mínimo contrato para registrar y consultar |
| D9 | UI debajo de Sprint Capacity en Settings | Página `/sprint-absences` separada | Settings ya concentra configuración de planificación |
| D10 | Alta permitida sin `SprintCapacity` previo | Requerir capacity antes de ausencia | Flexibilidad operativa; ajuste visible solo cuando aplique |
| D11 | Campo `reason` texto (≤ 100) | Enum de tipos de ausencia | Suficiente para MVP sin catálogo de tipos |
| D12 | Sin autenticación | Esperar a US-001 | Misma decisión que slices anteriores |

### Decisión D3 — 1 día = 1 story point

Esta regla es una **simplificación consciente**, no una regla de negocio definitiva. Documenta explícitamente la deuda técnica para iteraciones futuras (calendario laboral, `%` dedicación, conversión por equipo). Su único objetivo en MVP es **habilitar US-005** con un número derivado coherente (`adjustedCapacity`) sin implementar el modelo relacional completo de `docs/04-data-model.md`.

---

## 13. Definición de hecho (DoD) del slice

- [ ] Spec `docs/sprint-absences-mvp.md` aprobada por revisión humana
- [ ] Migración Prisma `SprintAbsence` aplicada en local
- [ ] `POST /api/sprint-absences` y `GET /api/sprint-absences` operativos y documentados en Swagger
- [ ] Validación de catálogo gerencia/proyecto y campos en backend
- [ ] Función `computeAdjustedCapacity` con tests unitarios
- [ ] Sección Sprint Absences en Settings debajo de Sprint Capacity: formulario + listado + columna capacidad ajustada
- [ ] Nota UI sobre simplificación 1 día = 1 punto visible
- [ ] Escenarios BDD 1, 3, 4, 7 y 8 verificados manualmente (mínimo)
- [ ] Tests unitarios de validación en verde
- [ ] `pnpm --filter api build` y `pnpm --filter api test` OK
- [ ] `pnpm --filter web build` OK
- [ ] Entrada añadida en `prompts.md`

---

## Próximo paso recomendado

1. **Revisión y aprobación humana** de esta spec (cierre del gate spec-first de Issue #10 / GH-08).
2. **Implementación incremental** en orden: migración Prisma → validaciones/API + helper de ajuste → UI en Settings → smoke manual.
3. **Spec de US-005** (análisis demand vs capacity) consumiendo `SprintCapacity`, suma de `SprintAbsence` y demanda de `UserStory`.

---

**Documento:** `docs/sprint-absences-mvp.md`  
**Última actualización:** 2026-06-13 (v1 — ausencias agregadas, regla 1 día = 1 punto, capacidad ajustada derivada)
