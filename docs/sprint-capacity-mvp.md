# Sprint Capacity MVP Specification

**Proyecto:** DeliveryOps AI  
**Vertical slice:** Sprint Capacity MVP  
**Estado:** Spec-first — revisión v2 (gerencias, proyectos y sugerencia de sprint)  
**Referencia producto:** US-003 (Configure Team Capacity) en `docs/05-user-stories.md`  
**Issue GitHub:** #9 (spec incremental requerida antes de código)  
**Backlog interno:** GH-07  
**Stack actual:** monorepo pnpm · `apps/api` (NestJS + Prisma + Swagger) · `apps/web` (React + Vite + Tailwind + React Router)  
**Prerequisito implementado:** US-002 — importación CSV de User Stories (`docs/user-stories-import-mvp.md`)

---

## 1. Objetivo

Permitir que un Project Manager configure la **capacidad disponible por sprint, gerencia y proyecto** en DeliveryOps AI, de forma que los datos queden persistidos en PostgreSQL y puedan consumirse en el siguiente slice de análisis **demand vs capacity** (US-005 / GH-09).

Este vertical slice cierra el segundo eslabón del flujo de planificación sprint:

**Configurar capacidad → persistir en base de datos → listar configuraciones desde la UI.**

No implementa el motor de análisis ni la gestión avanzada de equipos. Su propósito es habilitar US-005 con un modelo mínimo coherente con las User Stories ya importadas (campo `sprint` como texto libre) y con la estructura organizativa real del dominio (gerencias y proyectos).

---

## 2. Alcance MVP

### Backend (`apps/api`)

- Modelo Prisma `SprintCapacity` (entidad mínima, ver sección 4).
- Migración Prisma incremental sobre el esquema existente (`UserStory` y `SprintCapacity` previo si aplica).
- Módulo NestJS `sprint-capacity` con responsabilidades acotadas:
  - validación de entrada,
  - persistencia vía `PrismaService`,
  - exposición REST documentada en Swagger.
- Endpoints:
  - `GET /api/sprint-capacity` — listado de configuraciones guardadas.
  - `POST /api/sprint-capacity` — crear una nueva configuración.
- Validaciones de negocio (ver sección 5).
- Tests unitarios de reglas de validación y test de integración o e2e mínimo del controller.

### Frontend (`apps/web`)

- Sección de configuración de capacidad en **Settings** (`/settings`).
- Formulario con campos: `sprint`, `teamName`, `projectName`, `availablePoints`.
- `teamName` como **desplegable** con valores cerrados de gerencia.
- `projectName` como **desplegable dependiente** de la gerencia seleccionada.
- Precarga automática de `sprint` con el siguiente sprint sugerido (ver sección 7).
- Listado/tabla de configuraciones guardadas (lectura desde `GET`).
- Feedback de éxito/error tras envío del formulario.
- Refetch del listado tras creación exitosa.
- Sin estado global; estado local de página suficiente para MVP.

### Contrato y calidad

- DTOs y decoradores Swagger en endpoints del slice.
- Escenarios BDD (sección 8) como base de pruebas manuales y automatizadas.
- Registro del prompt de implementación en `prompts.md` al cerrar el slice.

---

## 3. Fuera de alcance

Explícitamente **no** forma parte de este slice:

| Área | Motivo |
|------|--------|
| Ausencias y vacaciones (US-004) | Slice posterior; requiere `TeamMember` y fechas |
| Entidad `TeamMember` completa | Sustituida por catálogo cerrado de gerencias en MVP |
| `ProjectAssignment` y asignaciones cross-departamento | Complejidad organizacional fuera del slice |
| Entidades `Department`, `Project`, `Sprint` relacionales | Workspace implícito; `sprint` y `projectName` como strings alineados al dominio |
| CRUD dinámico de gerencias o proyectos | Catálogo fijo en código para MVP |
| Multi-tenant / aislamiento por organización | MVP académico local |
| Autenticación y autorización (US-001) | Endpoints abiertos como en slice CSV |
| Histórico avanzado, versionado o auditoría | Solo create + list en MVP |
| Edición (`PUT`/`PATCH`) y borrado (`DELETE`) | Fuera del contrato mínimo; iteración futura |
| Motor de análisis demand vs capacity (US-005) | Prerequisito de datos, no parte de este slice |
| Cálculo automático de capacidad desde miembros | `availablePoints` es valor manual |
| Export Excel / reporting (US-009) | Slice de reporting |
| IA / refinamiento de requisitos | Epic separada |
| `packages/shared` con tipos compartidos | Duplicación mínima FE/BE aceptable en este slice |

---

## 4. Modelo de datos mínimo propuesto

### Catálogo de dominio (MVP)

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

> Para **Gerencia Riesgo**, `projectName` es obligatorio y se modela como valor simple fijo (`Riesgo`). No hay desglose multi-proyecto en esta gerencia en el MVP.

### Entidad `SprintCapacity` (Prisma)

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| `id` | `String` (cuid) | sí | PK |
| `sprint` | `String` | sí | Texto libre; debe alinearse con `UserStory.sprint` importado |
| `teamName` | `String` | sí | Gerencia; valor del catálogo cerrado |
| `projectName` | `String` | sí | Proyecto dentro de la gerencia; valor del catálogo dependiente |
| `availablePoints` | `Int` | sí | Capacidad disponible en story points; **> 0** |
| `createdAt` | `DateTime` | sí | auto |
| `updatedAt` | `DateTime` | sí | auto |

**Índice recomendado:** `@@index([sprint])` para consultas futuras de análisis por sprint.

**Unicidad recomendada:** `@@unique([sprint, teamName, projectName])` — una sola configuración activa por combinación sprint + gerencia + proyecto. Si se intenta duplicar → error de validación/conflicto (ver sección 5).

### Esquema Prisma propuesto (referencia)

```prisma
model SprintCapacity {
  id              String   @id @default(cuid())
  sprint          String
  teamName        String
  projectName     String
  availablePoints Int
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([sprint, teamName, projectName])
  @@index([sprint])
}
```

### Por qué se reduce respecto a `docs/04-data-model.md`

El modelo completo define una jerarquía operativa rica:

- `Sprint` ligado a `Project`, con fechas, `capacityPoints` y `demandPoints` calculados.
- `TeamMember` con `baseDepartmentId`, `defaultCapacityPoints` y rol.
- `ProjectAssignment` para asignaciones temporales y porcentaje de dedicación.
- `Absence` para reducir capacidad neta por vacaciones y bajas.

Esa granularidad es correcta para un SaaS maduro, pero **bloquea el delivery incremental** del MVP académico: obligaría a implementar TB-010 y TB-011 (proyecto, departamento, miembros, asignaciones) antes de poder guardar un solo dato de capacidad útil.

**Decisiones de simplificación:**

| Modelo completo (`docs/04`) | MVP `SprintCapacity` | Razón |
|----------------------------|----------------------|-------|
| `Sprint` entidad + FK | `sprint: String` | Misma estrategia que `UserStory.sprint` en US-002; evita FK sin gestión de proyectos |
| `Department` + `TeamMember` | `teamName` catálogo cerrado | Refleja gerencias reales sin CRUD de personas |
| `Project` entidad + FK | `projectName` catálogo cerrado | Separa capacidad por proyecto sin modelo relacional completo |
| `Sprint.capacityPoints` calculado | `availablePoints` manual | Valor explícito introducido por el PM |
| `Absence` reduce capacidad | omitido | US-004 en slice posterior |
| `ProjectAssignment.allocationPercentage` | omitido | Sin reparto multi-proyecto dinámico en MVP |

El slice **no contradice** el modelo objetivo: introduce una entidad puente que US-005 podrá sumar por `sprint` (y opcionalmente filtrar por `teamName` / `projectName`) y comparar contra la demanda agregada de `UserStory.storyPoints`. En iteraciones futuras, `SprintCapacity` puede evolucionar hacia FK a `Sprint`/`Project`/`Department` o sustituirse por cálculo derivado de `TeamMember`.

---

## 5. Reglas de validación

### Campos obligatorios

| Campo | Regla |
|-------|-------|
| `sprint` | Obligatorio; tras `trim()`, longitud ≥ 1 |
| `teamName` | Obligatorio; debe ser uno de: `Gerencia Riesgo`, `Gerencia Ahorro` |
| `projectName` | Obligatorio; debe ser válido para la `teamName` seleccionada (ver catálogo) |
| `availablePoints` | Obligatorio; entero; **estrictamente mayor que 0** |

### Reglas de catálogo

| Gerencia | `projectName` permitidos |
|----------|-------------------------|
| `Gerencia Ahorro` | `Ahorro`, `Pasarelas`, `Gestionados` |
| `Gerencia Riesgo` | `Riesgo` |

Si `projectName` no pertenece al catálogo de la gerencia indicada → `400 Bad Request`.

### Reglas adicionales

| Regla | Comportamiento |
|-------|----------------|
| Tipo numérico | `availablePoints` debe ser número entero válido (rechazar decimales y no numéricos) |
| Unicidad | No puede existir otra fila con el mismo `(sprint, teamName, projectName)` normalizado |
| Normalización | Aplicar `trim()` a `sprint`, `teamName` y `projectName` antes de persistir |
| Límite de longitud | `sprint`, `teamName` y `projectName` ≤ 100 caracteres (defensa básica) |
| Capacidad negativa o cero | Rechazar con mensaje claro: *"availablePoints must be greater than 0"* |
| `teamName` fuera de catálogo | Rechazar con mensaje: *"teamName must be a valid gerencia"* |
| `projectName` inválido para gerencia | Rechazar con mensaje indicando proyecto no permitido |

### Respuestas de error esperadas

| Caso | HTTP | Mensaje orientativo |
|------|------|---------------------|
| Campo ausente o vacío | `400 Bad Request` | Indicar campo concreto |
| `teamName` no permitido | `400 Bad Request` | Gerencia inválida |
| `projectName` no permitido para gerencia | `400 Bad Request` | Proyecto inválido para la gerencia |
| `availablePoints` ≤ 0 o no entero | `400 Bad Request` | Regla de puntos positivos |
| Duplicado `(sprint, teamName, projectName)` | `409 Conflict` | *"Capacity already configured for this sprint, team and project"* |
| Error de base de datos | `500 Internal Server Error` | Mensaje genérico en UI |

---

## 6. API mínima propuesta

Prefijo global existente: `/api`.

### `GET /api/sprint-capacity`

- **Descripción:** devuelve todas las configuraciones de capacidad guardadas.
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
      "availablePoints": 40,
      "createdAt": "2026-06-13T10:00:00.000Z",
      "updatedAt": "2026-06-13T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

### `POST /api/sprint-capacity`

- **Content-Type:** `application/json`
- **Body:**

```json
{
  "sprint": "Sprint 1",
  "teamName": "Gerencia Ahorro",
  "projectName": "Pasarelas",
  "availablePoints": 40
}
```

- **201 Created:** objeto creado (misma forma que un elemento de `data` en GET).
- **400 Bad Request:** validación fallida (campos obligatorios, catálogo, puntos inválidos).
- **409 Conflict:** duplicado `sprint` + `teamName` + `projectName`.

### OpenAPI / Swagger

- Tag: `sprint-capacity`
- Documentar schemas de request/response, catálogo de valores permitidos y códigos de error.
- Probar manualmente en `/api/docs`.

### CORS (dev)

- Mantener la misma configuración CORS del slice US-002 para el dev server Vite.

---

## 7. UI mínima propuesta

**Ubicación preferida:** sección **Sprint Capacity** dentro de `/settings` (`SettingsPage`).

| Bloque | Comportamiento |
|--------|----------------|
| Título de sección | "Sprint Capacity" + descripción breve del propósito |
| Formulario | Inputs: Sprint (text), Gerencia (select), Proyecto (select), Available Points (number, min 1) |
| Desplegable Gerencia | Opciones fijas: `Gerencia Riesgo`, `Gerencia Ahorro` |
| Desplegable Proyecto | Depende de gerencia seleccionada (ver catálogo sección 4) |
| Precarga de Sprint | Al cargar página, sugerir automáticamente el siguiente sprint (ver abajo) |
| Botón guardar | `POST /api/sprint-capacity`; deshabilitado durante envío |
| Mensaje de resultado | Banner éxito (verde) o error (rojo/ámbar) según respuesta API |
| Tabla de configuraciones | Columnas: Sprint, Gerencia, Proyecto, Available Points, Created |
| Estado vacío | Texto: *"No sprint capacity configured yet. Add a configuration to get started."* |
| Loading | Spinner o texto durante carga inicial y tras guardar |

### Criterio UI — sugerencia automática de sprint

Al montar la página (tras `GET /api/sprint-capacity`):

1. Extraer de las configuraciones existentes los valores de `sprint` que sigan el patrón `Sprint N` (N entero ≥ 1).
2. Calcular el máximo `N` encontrado.
3. Precargar el campo sprint con `Sprint {N+1}`.
4. Si **no hay configuraciones**, precargar con `Sprint 1`.
5. Ejemplo: si existe configuración con `Sprint 2` y es el máximo, sugerir `Sprint 3`.

**Notas de implementación:**

- El usuario puede editar manualmente el valor sugerido antes de guardar.
- Sprints con formato no estándar (p. ej. `Sprint Q2`) no participan del cálculo numérico; en ese caso, si no hay `Sprint N` parseables, usar `Sprint 1`.
- Tras guardar con éxito, recalcular sugerencia para el siguiente alta.

### Comportamiento del desplegable Proyecto

| Gerencia seleccionada | Opciones de `projectName` |
|----------------------|---------------------------|
| `Gerencia Ahorro` | `Ahorro`, `Pasarelas`, `Gestionados` |
| `Gerencia Riesgo` | `Riesgo` (única opción; seleccionada por defecto) |

Al cambiar de gerencia, resetear `projectName` a la primera opción válida de la nueva gerencia.

**Flujo UI:**

```text
SettingsPage mount
  → GET /api/sprint-capacity
  → calcular sprint sugerido
  → precargar formulario.sprint
  → render table | empty state

User selects gerencia
  → actualizar opciones de proyecto
  → seleccionar proyecto por defecto

User fills/edits form + clicks Save
  → validación local (campos + puntos > 0)
  → POST /api/sprint-capacity
  → if 2xx: show success, limpiar gerencia/proyecto/puntos, recalcular sprint sugerido, refetch GET
  → if 4xx: show field-level or summary error

Network error / 5xx
  → show generic error message (no crash)
```

**No incluir:** wizards multi-paso, gestión de miembros, calendarios de ausencias, gráficos de análisis, edición inline, confirmaciones modales complejas, CRUD de catálogo de gerencias/proyectos.

---

## 8. Criterios de aceptación BDD

Alineados con US-003 en `docs/05-user-stories.md` y ampliados para el contrato MVP v2.

### Escenario 1 — Configuración exitosa (Gerencia Ahorro)

```gherkin
Given the API is running and the database is available
And the user is on the "/settings" page
And no capacity exists for sprint "Sprint 1", team "Gerencia Ahorro" and project "Pasarelas"
When the user selects gerencia "Gerencia Ahorro"
And selects project "Pasarelas"
And submits sprint "Sprint 1" and available points 40
Then the API responds with HTTP 201
And the capacity configuration is persisted
And the settings page lists the new configuration with 40 available points
```

### Escenario 2 — Configuración exitosa (Gerencia Riesgo)

```gherkin
Given the user is on the "/settings" page
And gerencia "Gerencia Riesgo" is selected
When the user submits sprint "Sprint 1", project "Riesgo", and available points 30
Then the API responds with HTTP 201
And the configuration is persisted with teamName "Gerencia Riesgo" and projectName "Riesgo"
```

### Escenario 3 — Valores inválidos rechazados

```gherkin
Given the user is on the "/settings" page
When the user submits available points equal to 0
Then the API responds with HTTP 400
And no capacity configuration is created
And the UI shows a validation error message
```

### Escenario 4 — Campo obligatorio ausente

```gherkin
Given the user is on the "/settings" page
When the user submits the form without project name
Then the API responds with HTTP 400
And no capacity configuration is created
```

### Escenario 5 — Proyecto inválido para gerencia

```gherkin
Given the user is on the "/settings" page
When the user attempts to save teamName "Gerencia Riesgo" with projectName "Pasarelas"
Then the API responds with HTTP 400
And no capacity configuration is created
```

### Escenario 6 — Listado de configuraciones existentes

```gherkin
Given two sprint capacity configurations exist in the database
When the user opens the "/settings" page
Then the API returns both configurations
And the UI displays both rows in the capacity table
```

### Escenario 7 — Duplicado sprint + gerencia + proyecto

```gherkin
Given a capacity configuration already exists for sprint "Sprint 1", team "Gerencia Ahorro" and project "Ahorro"
When the user attempts to create another configuration with the same sprint, gerencia and project
Then the API responds with HTTP 409
And the existing configuration remains unchanged
And the UI shows an error message about duplicate configuration
```

### Escenario 8 — Puntos no enteros o negativos

```gherkin
Given the user is on the "/settings" page
When the user submits available points -5 or a non-integer value
Then the API responds with HTTP 400
And no capacity configuration is created
```

### Escenario 9 — Precarga automática de sprint

```gherkin
Given no sprint capacity configurations exist
When the user opens the "/settings" page
Then the sprint field is prefilled with "Sprint 1"

Given a capacity configuration exists for sprint "Sprint 2" and no higher sprint number exists
When the user opens the "/settings" page
Then the sprint field is prefilled with "Sprint 3"
```

### Escenario 10 — Misma gerencia, distintos proyectos

```gherkin
Given a capacity configuration exists for sprint "Sprint 1", team "Gerencia Ahorro" and project "Ahorro"
When the user creates another configuration for sprint "Sprint 1", team "Gerencia Ahorro" and project "Pasarelas"
Then the API responds with HTTP 201
And both configurations coexist in the list
```

---

## 9. Testing esperado

### Backend — unitarios (Jest)

| Área | Casos mínimos |
|------|----------------|
| Validación `sprint` | vacío, solo espacios, válido tras trim |
| Validación `teamName` | vacío, valor fuera de catálogo, valores permitidos |
| Validación `projectName` | vacío, inválido para gerencia, válido por gerencia |
| Validación `availablePoints` | 0, negativo, decimal, no numérico, entero positivo |
| Unicidad lógica | detección de duplicado `(sprint, teamName, projectName)` |
| Catálogo cruzado | `Gerencia Riesgo` + `Pasarelas` → rechazo |

La lógica de validación debe vivir en funciones puras testeables (servicio o helper dedicado), siguiendo el patrón del slice US-002.

### Backend — integración / e2e

| Caso | Verificación |
|------|----------------|
| `POST` válido → `201` + registro en DB | Persistencia real o DB de test |
| `GET` tras `POST` | El registro aparece en listado con `projectName` |
| `POST` duplicado triple → `409` | Unicidad respetada |
| `POST` proyecto inválido → `400` | Sin persistencia |
| `POST` inválido → `400` | Sin persistencia |

> **Nota CI:** el runner actual no incluye PostgreSQL; los tests de integración pueden ejecutarse en local con Docker (`5433`) y documentarse en el Test plan del PR, coherente con el estado del repo.

### Frontend

| Caso | Verificación |
|------|----------------|
| Render vacío | Mensaje de empty state + sprint precargado `Sprint 1` |
| Desplegable gerencia | Solo opciones del catálogo |
| Desplegable proyecto | Cambia según gerencia; Riesgo → solo `Riesgo` |
| Precarga sprint | `Sprint 2` existente → sugerir `Sprint 3` |
| Envío exitoso | Refetch y fila visible con Gerencia + Proyecto |
| Error API / duplicado | Banner de error sin romper la página |

### Validación manual (smoke)

Checklist mínimo antes de cerrar el slice:

1. Crear configuración válida para `Gerencia Ahorro` + `Pasarelas` desde Settings.
2. Crear configuración válida para `Gerencia Riesgo` + `Riesgo`.
3. Verificar persistencia tras recargar la página.
4. Rechazar `availablePoints = 0`.
5. Rechazar duplicado mismo sprint + gerencia + proyecto.
6. Permitir mismo sprint + gerencia con **distinto** proyecto.
7. Verificar precarga de sprint (`Sprint 1` sin datos; `Sprint 3` si existe `Sprint 2`).
8. Swagger muestra ambos endpoints documentados con `projectName`.

---

## 10. Trazabilidad con Issue #9 y documentación existente

| Referencia | Relación con este slice |
|------------|-------------------------|
| **GitHub Issue #9** | Requiere spec incremental aprobada antes de código; este documento es la entrega spec-first solicitada |
| **GH-07** | Backlog ID formal para US-003 en `docs/09-github-backlog-bootstrap.md` |
| **US-003** | Historia de usuario origen: configurar capacidad de sprint del equipo |
| **US-002** | Prerequisito: User Stories importadas con campo `sprint` usable en análisis futuro |
| **US-005 / GH-09** | Consumidor downstream: análisis demand vs capacity (depende de datos de este slice) |
| **TB-010, TB-011, TB-025** | Tareas técnicas originales del backlog completo; **reducidas** en este MVP (catálogo fijo sin `TeamMember` relacional) |
| `docs/02-functional-specification.md` | Módulo 2.3 Team Capacity — subconjunto "Configure sprint capacity" |
| `docs/04-data-model.md` | Modelo objetivo; este slice implementa subconjunto mínimo con `projectName` |
| `docs/05-user-stories.md` | BDD US-003 base |
| `docs/06-technical-backlog.md` | Fase 3 Sprint Planning — entrega incremental previa al motor TB-014 |
| `docs/user-stories-import-mvp.md` | Patrón de referencia para estructura spec-first y convenciones API/UI |
| `docs/adr/ADR-004-vertical-slice-first.md` | Justificación del enfoque por slice E2E |
| `docs/adr/ADR-003-nestjs-prisma-postgresql.md` | Stack de persistencia |

### Cadena de dependencias

```text
US-002 (import CSV) ✅ implementado
        │
        ▼
US-003 (este spec) ──► SprintCapacity persistido (sprint + gerencia + proyecto)
        │
        ├──► US-004 (ausencias) — futuro
        │
        └──► US-005 (análisis overload) — requiere capacidad + demanda
```

---

## 11. Decisiones de alcance

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|----------------------|--------|
| D1 | Entidad única `SprintCapacity` | Implementar `TeamMember` + `Sprint` + FK | Desbloquea valor en un slice; evita TB-010/011 completos |
| D2 | `sprint` como `String` | Entidad `Sprint` con fechas y `projectId` | Consistencia con `UserStory.sprint` del CSV importado |
| D3 | `teamName` como catálogo cerrado de gerencias | Texto libre o CRUD de `TeamMember` | Refleja dominio real (Riesgo / Ahorro) sin gestión de personas |
| D4 | `projectName` obligatorio | Capacidad solo por gerencia | Permite separar capacidades dentro de una misma gerencia (p. ej. Ahorro vs Pasarelas vs Gestionados) |
| D5 | Catálogo de proyectos dependiente de gerencia | Lista global de proyectos | Evita combinaciones inválidas y simplifica la UI |
| D6 | `availablePoints` manual | Cálculo desde miembros − ausencias | Sin US-004; el PM introduce capacidad neta directamente |
| D7 | Solo `GET` + `POST` | CRUD completo | Mínimo contrato para configurar y consultar |
| D8 | Unicidad `(sprint, teamName, projectName)` | Unicidad solo por sprint + gerencia | Varias configuraciones por gerencia en el mismo sprint, una por proyecto |
| D9 | UI en Settings | Página `/sprint-capacity` separada | Settings ya existe como shell; sección dedicada reduce rutas nuevas |
| D10 | Sin autenticación | Esperar a US-001 | Misma decisión que slice CSV; coherencia MVP local |
| D11 | Validación `availablePoints > 0` (estricto) | Permitir ≥ 0 | Capacidad cero no aporta valor al análisis |
| D12 | Precarga automática de sprint en UI | Campo siempre vacío | Reduce fricción operativa; sugiere el siguiente sprint de forma predecible |

### Decisión D4 — `projectName` separa capacidades dentro de una gerencia

En organizaciones con varias líneas de producto bajo la misma gerencia (caso **Gerencia Ahorro**), la capacidad de sprint no es homogénea: equipos de `Ahorro`, `Pasarelas` y `Gestionados` pueden tener disponibilidad distinta en el mismo sprint. El campo `projectName` permite registrar esa granularidad **sin** introducir aún el modelo relacional `Project` de `docs/04-data-model.md`. Para **Gerencia Riesgo**, un único proyecto (`Riesgo`) simplifica el MVP manteniendo el mismo contrato de datos.

---

## 12. Definición de hecho (DoD) del slice

- [ ] Spec `docs/sprint-capacity-mvp.md` aprobada por revisión humana (v2 gerencias + proyectos)
- [ ] Migración Prisma `SprintCapacity` con `projectName` y unicidad triple aplicada en local
- [ ] `POST /api/sprint-capacity` y `GET /api/sprint-capacity` operativos y documentados en Swagger
- [ ] Validación de catálogo gerencia/proyecto en backend
- [ ] Sección Sprint Capacity en Settings: formulario con desplegables + listado
- [ ] Precarga automática de sprint según configuraciones existentes
- [ ] Escenarios BDD 1, 3, 6, 7, 9 y 10 verificados manualmente (mínimo)
- [ ] Tests unitarios de validación en verde (incl. catálogo y unicidad triple)
- [ ] `pnpm --filter api build` y `pnpm --filter api test` OK
- [ ] `pnpm --filter web build` OK
- [ ] Entrada añadida en `prompts.md`

---

## Próximo paso recomendado

1. **Revisión y aprobación humana** de esta spec v2 (cierre del gate spec-first de Issue #9 / GH-07).
2. **Ajuste incremental de código** en orden: migración Prisma (`projectName` + unicidad) → validaciones/API → UI con desplegables y precarga de sprint → smoke manual.
3. **Spec de US-005** (análisis demand vs capacity) usando `SprintCapacity` agregado por `sprint` y/o filtrado por gerencia/proyecto.

---

**Documento:** `docs/sprint-capacity-mvp.md`  
**Última actualización:** 2026-06-13 (v2 — gerencias, projectName, sugerencia de sprint)
