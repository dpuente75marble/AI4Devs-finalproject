# US-006–008 — Refinement MVP Spec

**Proyecto:** DeliveryOps AI  
**Vertical slice:** Refinement MVP  
**Estado:** Spec-first — pendiente de aprobación humana  
**Referencia producto:** US-006, US-007, US-008 en `docs/05-user-stories.md`  
**Issue GitHub:** #12 [D2] US-006–008: Refinamiento IA MVP  
**Backlog interno:** GH-10  
**Rama:** `feature/us-006-008-refinement-mvp-DLP`  
**Stack actual:** monorepo pnpm · `apps/api` (NestJS + Prisma + Swagger) · `apps/web` (React + Vite + Tailwind + React Router) · Playwright (`e2e/`)  
**Prerequisitos implementados:** US-002 (import CSV) · US-003 (Sprint Capacity) · US-004 (Sprint Absences) · US-005 (Sprint Analysis)

---

## 1. Objective

Define the MVP behavior for AI-assisted requirement refinement from uploaded PDF documents.

This vertical slice closes the fifth link in the delivery planning flow:

**Upload requirement PDF → extract text → mock refinement provider → display editable output → human review.**

The slice delivers a synchronous, demo-ready refinement pipeline with a provider abstraction and deterministic mock responses. It does not call real LLM APIs, persist refinement results, or integrate with imported User Stories.

---

## 2. Scope

### Include

| Area | MVP deliverable |
|------|-----------------|
| **PDF upload** | `multipart/form-data` upload of a single `.pdf` file per request |
| **Text extraction** | Basic text extraction from text-based PDFs (no OCR) |
| **Refinement provider interface** | `RefinementProvider` abstraction decoupled from transport and UI |
| **Mock refinement provider** | Deterministic output for demos and automated tests |
| **Refined user story** | Structured narrative output editable in the UI |
| **Acceptance criteria** | Generated list in Given/When/Then format |
| **Gaps / ambiguity questions** | Generated list of missing information or unclear rules |
| **Editable UI output** | All generated fields remain editable after analysis |
| **Human-in-the-loop** | User must review and may edit before treating output as final; no auto-save or auto-publish |

### Backend (`apps/api`)

- NestJS module `refinement` with minimal layers:
  - **domain:** `RefinementProvider` interface, types for analysis result.
  - **application:** orchestration service (extract → refine).
  - **infrastructure:** `PdfTextExtractor`, `MockRefinementProvider`.
  - **presentation:** controller with `POST /api/refinement/analyze` documented in Swagger.
- PDF validation: MIME/extension, max size, non-empty extracted text.
- Unit tests for extraction validation, mock provider determinism, and controller contract.
- No new Prisma models or migrations in this slice.

### Frontend (`apps/web`)

- Page **Refinement** at route `/refinement`.
- Nav link in `AppNav` alongside existing pages.
- Upload control, Analyze action, loading/error states.
- Editable areas for refined story, acceptance criteria, and gaps.
- Clear/reset action to discard current results.
- Local page state only; no global store.

### Exclude

| Area | Motivo |
|------|--------|
| Real OpenAI / Azure OpenAI integration | Fuera de alcance MVP; slice usa mock provider |
| RAG / vector database | Complejidad enterprise; no aporta valor al demo académico |
| Async workers / queues / event bus | Análisis síncrono acotado |
| Autenticación y autorización (US-001) | Endpoints abiertos como en slices anteriores |
| Persistencia de documentos o resultados | Salida efímera en UI; sin `RequirementDocument` / `RefinementResult` en BD |
| OCR para PDFs escaneados | Solo PDFs con texto seleccionable |
| Export de refinamiento (US-009) | Slice de reporting posterior |
| Vincular refinamiento a User Stories importadas | Iteración futura |
| Prompt templates productivos (TB-030) | Mock no invoca LLM; interfaz preparada para futuro |
| Enterprise orchestration / multi-step workflows | Un upload → una respuesta |

---

## 3. Functional Flow

```text
[Usuario]                 [Frontend web]              [API NestJS]                    [Mock Provider]
    |                           |                          |                                |
    | 1. Abre /refinement       |                          |                                |
    |-------------------------->|                          |                                |
    | 2. Selecciona PDF         |                          |                                |
    | 3. Pulsa "Analyze"        |                          |                                |
    |-------------------------->|                          |                                |
    |                           | 4. POST multipart PDF    |                                |
    |                           |    /api/refinement/analyze                                |
    |                           |------------------------->|                                |
    |                           |                          | 5. Validar PDF                 |
    |                           |                          | 6. Extraer texto               |
    |                           |                          | 7. refine(sourceText)          |
    |                           |                          |------------------------------->|
    |                           |                          |<-------------------------------|
    |                           |                          | 8. Respuesta estructurada      |
    |                           |<-------------------------|                                |
    | 9. Ve resultado editable  |                          |                                |
    | 10. Edita story / AC / gaps                          |                                |
    | 11. Revisa manualmente    |                          |                                |
    | (opcional) Clear/reset    |                          |                                |
```

**Expected outcome:** after a valid PDF upload, the user sees extracted context (optional read-only preview or collapsed section), a refined user story, acceptance criteria, and gap questions — all editable. The output is considered **draft** until the human reviewer accepts it mentally or copies it elsewhere; the system does not mark it as final.

---

## 4. API Contract

### `POST /api/refinement/analyze`

Upload a requirement PDF and receive structured refinement output.

**Request**

- Content-Type: `multipart/form-data`
- Field: `file` (required) — PDF document

**Validation rules**

| Rule | Error (HTTP 400) |
|------|------------------|
| Missing `file` | `File is required` |
| Not `.pdf` / invalid MIME | `Only PDF files are supported` |
| File exceeds limit (e.g. ≤ 5 MB) | `File exceeds maximum size` |
| Extracted text empty or whitespace only | `No readable text found in PDF` |

**Response 200**

```json
{
  "sourceText": "The system shall allow users to...",
  "refinedStory": "As a Tech Lead, I want ... so that ...",
  "acceptanceCriteria": [
    "Given a valid PDF requirement document When the user uploads it Then the system extracts readable text",
    "Given extracted requirement content When refinement runs Then a refined user story is generated"
  ],
  "gaps": [
    "Missing business rule for error handling when upload fails",
    "Unclear non-functional requirement for response time"
  ],
  "provider": "mock"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `sourceText` | `string` | Text extracted from PDF (truncated in logs if needed; full text in response) |
| `refinedStory` | `string` | Mock-generated improved user story |
| `acceptanceCriteria` | `string[]` | Testable criteria in Given/When/Then style |
| `gaps` | `string[]` | Ambiguity or missing-information questions |
| `provider` | `string` | Provider identifier; always `"mock"` in this slice |

**Response 400** — validation errors (see table above).  
**Response 500** — unexpected extraction or internal failure (generic message; no stack trace in body).

Swagger: `@ApiConsumes('multipart/form-data')`, `@ApiBody` with binary `file`, response DTO mirroring JSON above.

---

## 5. Provider Design

### `RefinementProvider` interface

```typescript
export interface RefinementInput {
  sourceText: string;
}

export interface RefinementOutput {
  refinedStory: string;
  acceptanceCriteria: string[];
  gaps: string[];
}

export interface RefinementProvider {
  readonly name: string;
  refine(input: RefinementInput): Promise<RefinementOutput>;
}
```

- Lives in `refinement/domain/` (or equivalent).
- Application service depends on the interface, not on a concrete LLM client.
- NestJS DI binds `MockRefinementProvider` as the default implementation in this slice.

### `MockRefinementProvider`

- `name`: `"mock"`.
- **Deterministic:** same `sourceText` (normalized: `trim()`, collapse whitespace) always yields the same `RefinementOutput`.
- **Derivation strategy (MVP):** derive outputs from normalized text length, first line, or a simple hash — no randomness, no external calls.
- **Minimum content:** if `sourceText` is shorter than a threshold (e.g. 20 chars), return a valid but generic refinement plus at least one gap noting insufficient input.
- **Acceptance criteria format:** each item must contain `Given`, `When`, and `Then` (mock can template from keywords in `sourceText`).

### Future OpenAI provider (explicitly out of scope)

- `OpenAiRefinementProvider` implementing `RefinementProvider` is **not** part of this slice.
- Future implementation will: read API key from env, use prompt templates (TB-030), and apply output validation (TB-031).
- No feature flag or runtime switching required in MVP; code structure only needs the interface + mock binding.

### `PdfTextExtractor`

- Infrastructure utility: accepts buffer, returns `string`.
- Uses a single PDF parsing library (e.g. `pdf-parse`); choice fixed at implementation time.
- Rejects empty extraction; does not attempt OCR.

---

## 6. UI

### Route

`/refinement` — registered in `App.tsx`; link label **Refinement** in `AppNav`.

### Page elements

| Element | Behavior |
|---------|----------|
| **Heading** | Page title, e.g. "Requirement Refinement" |
| **Upload PDF** | File input accepting `.pdf` only; shows selected filename |
| **Analyze** | Disabled until file selected; triggers `POST /api/refinement/analyze` |
| **Loading state** | Visible while request in flight; disables Analyze and upload |
| **Error state** | Inline message from API or network failure |
| **Refined story** | Editable `<textarea>` (or contenteditable region) bound to `refinedStory` |
| **Acceptance criteria** | Editable list (textarea with one criterion per line, or dynamic list inputs) |
| **Gaps / questions** | Editable list same pattern as AC |
| **Source text** (optional) | Read-only collapsible section showing `sourceText` for transparency |
| **Clear / reset** | Clears file selection and all output fields; returns to initial state |

### UX rules

- After successful analyze, all output fields are editable immediately (US-007).
- No "Save" or "Approve" button in MVP — human review is implicit via manual edit.
- Tailwind styling consistent with `UserStoriesPage` and `SprintAnalysisPage`.
- API base URL via existing `VITE_API_URL` / proxy pattern.

---

## 7. Testing Strategy

### Backend (Jest)

| Scenario | Expectation |
|----------|-------------|
| Valid PDF with text | 200 + structured body; `provider === "mock"` |
| Missing file | 400 |
| Non-PDF file (e.g. `.csv`, `.txt`) | 400 |
| PDF with no extractable text | 400 |
| Oversized file | 400 |
| Mock provider determinism | Same input twice → identical `RefinementOutput` |
| Mock AC format | Each criterion includes Given/When/Then |
| Short source text | Still returns structured output + ≥1 gap |

Prefer TDD for `MockRefinementProvider` and validation helpers; controller test with mocked extractor/provider acceptable for HTTP contract.

### Frontend (Vitest + React Testing Library)

| Scenario | Expectation |
|----------|-------------|
| Page render | `/refinement` shows upload, Analyze, headings |
| Happy path | Mock `fetch` returns sample JSON → editable fields populated |
| Error path | Mock 400 → error message visible |
| Clear/reset | Output cleared after analyze |

### Playwright (`e2e/refinement.spec.ts`)

1. **Arrange:** mock `POST /api/refinement/analyze` (pattern from `e2e/settings-sprint-absences.spec.ts`) **or** upload `fixtures/sample-requirement.pdf` if added at implementation time.
2. **Act:** navigate to `/refinement`, select file, click Analyze.
3. **Assert:** refined story, at least one acceptance criterion, and at least one gap are visible and editable (e.g. `fill()` succeeds on textareas).

---

## 8. Acceptance Criteria Mapping

| Criterio (Issue #12 / producto) | Cobertura en este spec |
|--------------------------------|------------------------|
| Spec approved | Gate spec-first; DoD checklist below |
| BDD US-006 — upload + extract | Scope + API + Functional Flow + PDF validation tests |
| BDD US-006 — reject unsupported format | Exclude table + validation rules + invalid file tests |
| BDD US-007 — generate refined story | `refinedStory` in API response + Mock provider |
| BDD US-007 — editable output | UI editable text area + frontend tests |
| BDD US-008 — structured AC | `acceptanceCriteria[]` Given/When/Then + mock format rule |
| BDD US-008 — identify missing info | `gaps[]` + mock gap generation |
| Adapter IA + Mock provider | Section 5 — `RefinementProvider` + `MockRefinementProvider` |
| Human-in-the-loop | Functional Flow step 11; no auto-finalize |
| No RAG / workers / enterprise orchestration | Exclude table |

### BDD reference (`docs/05-user-stories.md`)

```gherkin
Given a supported requirement document
When the user uploads the file
Then the system extracts the document content
```

```gherkin
Given extracted requirement content
When the AI refinement process is executed
Then the system generates a refined User Story
```

```gherkin
Given generated refinement output
When the user reviews the result
Then the refined content remains editable
```

```gherkin
Given a refinement process
When the system generates acceptance criteria
Then the output follows a structured and testable format
```

```gherkin
Given ambiguous requirements
When the refinement is executed
Then the system identifies missing information
```

---

## 9. Traceability

| Referencia | Relación |
|------------|----------|
| **GitHub Issue #12** | Gate spec-first antes de implementación |
| **Backlog ID GH-10** | US-006–008 en `docs/09-github-backlog-bootstrap.md` |
| **US-006** | Upload requirement document |
| **US-007** | Generate refined user story |
| **US-008** | Generate acceptance criteria and gaps |
| `docs/05-user-stories.md` | BDD y prioridad Must-Have (Epic 3) |
| `docs/06-technical-backlog.md` | TB-015, TB-016, TB-017, TB-018, TB-019, TB-027, TB-028 (TB-030, TB-031 diferidos) |
| `docs/07-ai-development-workflow.md` | AI-first workflow, provider abstraction, human validation |
| `docs/03-technical-design.md` | Módulos `refinement/` y `AI Provider Module` |
| `docs/adr/ADR-001-ai-first-sdlc.md` | Spec-first, human-in-the-loop, OpenAPI-first |
| `docs/adr/ADR-004-vertical-slice-first.md` | Vertical slice E2E sin persistencia innecesaria |

### Dependency chain

```text
US-002 (import CSV) ✅
        │
        ├── US-003 (Sprint Capacity) ✅
        ├── US-004 (Sprint Absences) ✅
        └── US-005 (Sprint Analysis) ✅
                │
                ▼
US-006–008 (este spec) ──► POST /api/refinement/analyze + vista /refinement
```

Refinement is **functionally independent** of sprint data; prereqs listed for delivery sequencing only.

### Technical backlog mapping

| TB ID | MVP coverage |
|-------|----------------|
| TB-015 | PDF upload handling |
| TB-016 | PDF text extraction |
| TB-017 | `RefinementProvider` interface |
| TB-018 | `MockRefinementProvider` |
| TB-019 | Refinement orchestration service |
| TB-027 | Upload UI |
| TB-028 | Editable results UI |
| TB-030 | Deferred (mock only) |
| TB-031 | Deferred (minimal format check in mock) |

---

## 10. Definition of Done

- [ ] Spec `docs/refinement-mvp.md` approved by human review
- [ ] `RefinementProvider` interface and `MockRefinementProvider` with deterministic unit tests green
- [ ] `PdfTextExtractor` with validation tests green
- [ ] `POST /api/refinement/analyze` operational and documented in Swagger
- [ ] Page `/refinement` with upload, analyze, loading, error, editable outputs, clear/reset
- [ ] Link in `AppNav`
- [ ] Frontend render and happy-path tests green
- [ ] Playwright spec: upload or mocked route → refined story, AC, gaps visible
- [ ] Invalid file cases covered in backend tests
- [ ] `pnpm --filter api build` and `pnpm --filter api test` OK
- [ ] `pnpm --filter web build` and web tests OK
- [ ] Fixture `fixtures/sample-requirement.pdf` added (minimal text PDF for manual demo)
- [ ] Entry added to `prompts.md` upon slice completion
- [ ] `DEMO.md` updated with refinement walkthrough (post-implementation)

---

## Recommended Next Steps

1. **Human approval** of this spec (closes spec-first gate for Issue #12 / GH-10).
2. **Implementation order:** domain types + mock provider tests → PDF extractor → service → controller → UI + nav → Playwright.
3. **Future iteration:** OpenAI provider, persistence (`RefinementResult`), link to imported User Stories, export (US-009).

---

**Document:** `docs/refinement-mvp.md`  
**Última actualización:** 2026-06-13 (v1 — spec-first US-006–008, mock provider, human-in-the-loop)
