# US-009 — Export Excel de análisis de sprint — SPEC DRAFT

**Proyecto:** DeliveryOps AI  
**Vertical slice:** Export Excel Sprint Analysis MVP  
**Estado:** SPEC DRAFT — pendiente de aprobación humana antes de código  
**Referencia producto:** US-009 (Export Sprint Analysis Report) en `docs/05-user-stories.md`  
**Issue GitHub:** [#13](https://github.com/dpuente75marble/AI4Devs-finalproject/issues/13) — [D2] US-009 Export Excel de análisis de sprint
**Backlog interno:** GH-11  
**Stack actual:** monorepo pnpm · `apps/api` (NestJS + Prisma + Swagger) · `apps/web` (React + Vite + Tailwind + React Router) · Playwright (`e2e/`)  
**Prerequisitos implementados:** US-005 (Sprint Analysis — `docs/sprint-analysis-mvp.md`)

---

## 1. Objetivo funcional

Como Project Manager, quiero **descargar en Excel** el resultado del análisis de sprint ya calculado en DeliveryOps AI, para compartir un informe operativo con stakeholders sin copiar manualmente la tabla de la UI.

El slice añade **generación y descarga de un fichero `.xlsx`** a partir de los mismos datos que expone `GET /api/sprint-analysis`. No introduce nuevas reglas de negocio ni modifica el motor de análisis existente.

---

## 2. Alcance MVP

| Área | Entregable MVP |
|------|----------------|
| **Backend** | Nuevo endpoint `GET /api/sprint-analysis/export` que devuelve un workbook XLSX binario |
| **Fuente de datos** | Reutilizar `SprintAnalysisService.findAll()` (misma agregación y cálculos que US-005) |
| **Generación Excel** | Función pura `buildSprintAnalysisWorkbook(rows)` testeable; librería `exceljs` en `apps/api` |
| **Frontend** | Botón **Export Excel** en `/sprint-analysis` con loading y error visible |
| **API client** | Función `downloadSprintAnalysisExport()` en `sprintAnalysisApi.ts` |
| **Swagger** | Endpoint documentado con respuesta binaria y headers esperados |
| **Tests backend** | Unitarios de mapeo filas → hoja Excel (headers, valores, formato utilization) |
| **Build** | `pnpm --filter api build` y `pnpm --filter web build` en verde |
| **E2E** | Playwright smoke: botón visible, descarga mock exitosa y mensaje de error en fallo |

### Backend (`apps/api`)

- Extender módulo `sprint-analysis` sin tocar `domain/sprint-analysis.utils.ts` ni las reglas de cálculo.
- Nuevo método de aplicación, p. ej. `SprintAnalysisService.exportToXlsx()`, que:
  1. Llama a `findAll()`.
  2. Delega en `buildSprintAnalysisWorkbook(rows)` para construir el buffer.
- Nuevo handler en `SprintAnalysisController`: `GET export` → respuesta binaria con headers HTTP correctos.
- Dependencia nueva: `exceljs` (única librería de generación XLSX en este slice).
- Sin migración Prisma, sin entidad `ExportJob`, sin colas ni jobs asíncronos.

### Frontend (`apps/web`)

- Botón **Export Excel** en el encabezado de `SprintAnalysisPage` (junto al título o sobre la tabla).
- Estado `exportLoading` independiente del loading de la tabla.
- Descarga vía `fetch` + `Blob` + enlace temporal `<a download>` (patrón estándar del navegador).
- Banner de error (`role="alert"`) si la exportación falla; no bloquea la visualización de la tabla.
- El botón permanece habilitado con análisis vacío (exporta workbook con solo cabeceras).

---

## 3. Fuera de alcance explícito

| Área | Motivo |
|------|--------|
| Export PDF | Fuera de US-009 MVP |
| Export de refinamiento IA | Slice separado |
| Filtros por sprint, gerencia o proyecto | Sin query params en MVP |
| Múltiples hojas / pestañas en el Excel | Una hoja `Sprint Analysis` es suficiente |
| Formato avanzado (gráficos, colores por status, macros) | Sobreingeniería para MVP académico |
| Persistencia `ExportJob` | Modelo objetivo en `docs/04-data-model.md`; no requerido aquí |
| Autenticación y autorización (US-001) | Endpoints abiertos como en slices anteriores |
| Cambiar lógica de `GET /api/sprint-analysis` | Prohibido en este slice |
| Duplicar reglas de agregación/cálculo | La exportación consume el resultado de `findAll()` |
| `packages/shared` con tipos compartidos | Duplicación mínima FE/BE aceptable |
| Programación de exports / envío por email | Fuera de alcance |
| Validación del contenido del fichero en E2E | Smoke de UI y API mock; parsing XLSX en E2E opcional |

---

## 4. Flujo E2E esperado

```text
Usuario en /sprint-analysis
        │
        ▼
Tabla cargada desde GET /api/sprint-analysis (flujo US-005 existente)
        │
        ▼
Usuario pulsa "Export Excel"
        │
        ▼
UI → estado loading en botón ("Exporting…" o spinner textual)
        │
        ▼
GET /api/sprint-analysis/export
        │
        ├─► 200 + XLSX → navegador descarga fichero
        │                 nombre: sprint-analysis-YYYY-MM-DD.xlsx
        │
        └─► 4xx/5xx → banner de error visible en la página
```

### Secuencia detallada (happy path)

1. El usuario navega a `/sprint-analysis` y ve el análisis (o empty state si no hay datos).
2. Pulsa **Export Excel**.
3. El frontend solicita `GET /api/sprint-analysis/export`.
4. El backend obtiene filas con `findAll()` y genera el workbook.
5. La respuesta incluye `Content-Type` y `Content-Disposition` adecuados.
6. El frontend crea un `Blob`, dispara la descarga y restaura el botón.

### Análisis vacío

- `findAll()` devuelve `[]`.
- El endpoint responde `200` con un XLSX válido que contiene **fila de cabeceras** y **cero filas de datos**.
- La UI no muestra error; el usuario obtiene un Excel usable como plantilla.

---

## 5. Contrato API propuesto

### `GET /api/sprint-analysis/export`

Lectura. Sin query parameters en MVP (exporta el mismo conjunto completo que `GET /api/sprint-analysis`).

**Response:** `200 OK` — cuerpo binario XLSX.

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `Content-Disposition` | `attachment; filename="sprint-analysis-YYYY-MM-DD.xlsx"` |

- `YYYY-MM-DD` = fecha UTC del servidor al generar el fichero.
- Nombre de archivo sin espacios; caracteres seguros para descarga cross-browser.

**Ejemplo de cabeceras:**

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="sprint-analysis-2026-06-25.xlsx"
```

### Respuestas de error

| Caso | HTTP | Cuerpo | UI |
|------|------|--------|-----|
| Éxito con datos | `200` | Binario XLSX | Descarga iniciada |
| Éxito sin datos | `200` | XLSX solo con headers | Descarga iniciada |
| Error de base de datos / generación | `500` | JSON NestJS estándar `{ "statusCode", "message" }` | Banner de error |

> **Nota:** En error `500` el `Content-Type` será `application/json` (comportamiento NestJS por defecto). El cliente web debe tratar respuestas no-OK y no asumir siempre binario.

### Reutilización de datos

```text
SprintAnalysisService.findAll()
        │
        ▼
SprintAnalysisRow[]   ← mismos campos que GET /api/sprint-analysis
        │
        ▼
buildSprintAnalysisWorkbook(rows) → Buffer
```

No se vuelven a consultar Prisma con lógica distinta ni se reimplementan `buildSprintAnalysisRows` / status / utilization.

---

## 6. Columnas del Excel

Una hoja llamada **`Sprint Analysis`**.

| # | Columna Excel | Campo origen | Formato en celda |
|---|---------------|--------------|------------------|
| 1 | Sprint | `sprint` | Texto |
| 2 | Gerencia / Team | `teamName` | Texto |
| 3 | Proyecto | `projectName` | Texto |
| 4 | Demand | `demand` | Entero |
| 5 | Capacity | `capacity` | Entero |
| 6 | Absences | `absences` | Entero |
| 7 | Adjusted Capacity | `adjustedCapacity` | Entero |
| 8 | Utilization % | `utilization` | Número con 2 decimales + sufijo `%`, o `—` si `null` (misma regla que UI) |
| 9 | Status | `status` | Texto: `HEALTHY` \| `WARNING` \| `OVERLOADED` |

- Orden de filas: el mismo que devuelve `findAll()` (alfabético por `sprint`, `teamName`, `projectName`).
- Fila 1 = cabeceras (texto en negrita opcional vía `exceljs`; no requerido para DoD).
- Sin fila de totales ni resumen en MVP.

---

## 7. UI

### Ubicación

Página existente `/sprint-analysis` (`SprintAnalysisPage.tsx`).

### Elementos nuevos

| Elemento | Comportamiento |
|----------|----------------|
| Botón **Export Excel** | `type="button"`; visible siempre que la página esté montada (con o sin filas) |
| Estado loading | Texto `Exporting…` o botón deshabilitado mientras dura la petición |
| Error de export | Banner `role="alert"` separado del error de carga de tabla; mensaje legible |

### UX mínima

- El botón no sustituye ni oculta la tabla.
- Si falla la exportación, la tabla y su estado previo permanecen intactos.
- No se requiere confirmación modal antes de descargar.
- Accesibilidad: botón con nombre accesible `Export Excel` (`getByRole('button', { name: 'Export Excel' })` en Playwright).

### API client propuesto

```typescript
// apps/web/src/api/sprintAnalysisApi.ts (firma orientativa)
export async function downloadSprintAnalysisExport(): Promise<{
  blob: Blob
  filename: string
}>
```

- Parsear `Content-Disposition` para obtener `filename` cuando el servidor lo envíe; fallback local `sprint-analysis.xlsx`.

---

## 8. Escenarios BDD

### Export correcto con análisis disponible

```gherkin
Given imported user stories and configured sprint capacity for at least one combination
And the sprint analysis page shows one or more rows
When the user clicks "Export Excel"
Then the system downloads an Excel file
And the file contains the same sprint analysis rows as the on-screen table
```

### Export con análisis vacío

```gherkin
Given no sprint analysis data exists
And the sprint analysis page shows the empty state message
When the user clicks "Export Excel"
Then the system downloads an Excel file
And the file contains only the column headers
And no error message is shown
```

### Fallo técnico de export

```gherkin
Given the sprint analysis page is loaded
When the user clicks "Export Excel"
And the export request fails
Then the system shows a visible error message
And the on-screen analysis table remains unchanged
```

---

## 9. Testing esperado

### Backend — unitarios (TDD)

Archivo sugerido: `apps/api/src/sprint-analysis/domain/sprint-analysis-export.utils.spec.ts` (o colocado junto al builder).

| Escenario | Verificación |
|-----------|--------------|
| Filas con datos | Workbook con 1 hoja, 9 columnas, N filas de datos + 1 header |
| Headers correctos | Orden y texto exacto de las 9 columnas definidas en sección 6 |
| Mapeo de campos | Valores numéricos y textos coinciden con `SprintAnalysisRow` de entrada |
| `utilization: null` | Celda con `—` (coherente con `formatUtilization` de la web) |
| `utilization: 105` | Celda `105.00%` (o equivalente acordado en implementación) |
| Array vacío | Workbook válido XLSX con solo fila de cabeceras |

La aserción puede leer la hoja vía `exceljs` en el propio test o inspeccionar filas serializadas expuestas por el builder puro.

### Backend — build

```bash
pnpm --filter api build
pnpm --filter api test
```

### Frontend — build

```bash
pnpm --filter web build
```

Tests de componente opcionales; no bloquean DoD si el smoke Playwright cubre el botón.

### Playwright — smoke (`e2e/sprint-analysis.spec.ts` o `e2e/sprint-analysis-export.spec.ts`)

Patrón alineado con mocks de `e2e/sprint-analysis.spec.ts`:

| Caso | Pasos |
|------|-------|
| Botón visible | Navegar a `/sprint-analysis` → `Export Excel` visible |
| Descarga mock OK | Mock `GET **/api/sprint-analysis/export` → `200` + body binario mínimo o fixture `.xlsx` → click → sin banner de error |
| Fallo de export | Mock → `500` → click → mensaje de error visible |

> No es obligatorio validar el parsing del XLSX en Playwright; basta con verificar interacción UI y manejo de error.

### Swagger

- Tag existente: `sprint-analysis`.
- `@ApiOperation` describiendo exportación Excel.
- `@ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')`.
- Documentar header `Content-Disposition` en descripción (Swagger no modela bien binarios; descripción textual es suficiente en MVP).

---

## 10. Diseño de implementación (orientativo, no ejecutar en fase spec)

```text
apps/api/src/sprint-analysis/
├── sprint-analysis.controller.ts      # + GET export
├── sprint-analysis.service.ts         # + exportToXlsx() reutilizando findAll()
├── domain/
│   ├── sprint-analysis-export.utils.ts   # buildSprintAnalysisWorkbook(rows)
│   └── sprint-analysis-export.utils.spec.ts
```

- Controller devuelve `StreamableFile` de `@nestjs/common` o `Buffer` con `@Res()` — preferir `StreamableFile` para mantener estilo NestJS.
- Instalar `exceljs` solo en fase de implementación.

---

## 11. Trazabilidad

| Referencia | Relación |
|------------|----------|
| **GitHub issue #13** | Gate spec-first antes de implementación |
| **Backlog GH-11** | US-009 en `docs/09-github-backlog-bootstrap.md` |
| **US-009** | Historia de usuario origen (`docs/05-user-stories.md`) |
| **US-005** | Prerequisito: motor y UI de análisis (`docs/sprint-analysis-mvp.md`) |
| `docs/08-delivery-plan.md` | Priority 4 — Export and Deployment |
| `docs/adr/ADR-004-vertical-slice-first.md` | Vertical slice pequeño E2E |

### Cadena de dependencias

```text
US-005 (Sprint Analysis) ✅
        │
        ▼
US-009 (este spec) ──► GET /api/sprint-analysis/export + botón Export Excel
```

---

## 12. Definición de hecho (DoD)

- [ ] Spec `docs/export-sprint-analysis-mvp.md` aprobada por revisión humana
- [ ] Endpoint `GET /api/sprint-analysis/export` implementado y documentado en Swagger
- [ ] Generación XLSX reutilizando `findAll()` sin duplicar reglas de negocio
- [ ] Botón **Export Excel** en `/sprint-analysis` con loading y error visible
- [ ] Tests unitarios de `buildSprintAnalysisWorkbook` / filas en verde
- [ ] `pnpm --filter api build` y `pnpm --filter api test` OK
- [ ] `pnpm --filter web build` OK
- [ ] Playwright smoke de export (botón + error básico) en verde si encaja con CI actual
- [ ] Entrada añadida en `prompts.md` (nuevo **P-xxx** para este slice)
- [ ] PR enlazada a issue **#13** (`Closes #13` o referencia explícita)

---

## 13. Próximo paso recomendado

1. **Revisión y aprobación humana** de esta spec (cierre del gate spec-first de Issue #13 / GH-11).
2. **Implementación incremental** en orden: tests unitarios del builder → servicio + endpoint → cliente web + botón → Playwright smoke → Swagger → `prompts.md`.
3. **Iteración futura:** filtros de export, segunda hoja resumen, PDF, `ExportJob` persistido.

---

**Documento:** `docs/export-sprint-analysis-mvp.md`  
**Última actualización:** 2026-06-25 (SPEC DRAFT — US-009 Export Excel)
