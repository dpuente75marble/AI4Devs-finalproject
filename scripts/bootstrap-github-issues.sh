#!/usr/bin/env bash
# DeliveryOps AI — Bootstrap GitHub issues from docs/09-github-backlog-bootstrap.md
# Creates labels (idempotent) and 14 academic backlog issues. Does NOT create milestones.
# Usage: ./scripts/bootstrap-github-issues.sh
# Prerequisite: gh auth login

set -euo pipefail

REPO_FULL="dpuente75marble/AI4Devs-finalproject"

MILESTONE_D1="Delivery 1 — Technical Documentation"
MILESTONE_D2="Delivery 2 — Functional MVP"
MILESTONE_FD="Final Delivery — Deployed MVP"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log() { printf '==> %s\n' "$*"; }

ensure_label() {
  local name="$1"
  local color="$2"
  local description="$3"
  gh label create "$name" --repo "$REPO_FULL" --color "$color" --description "$description" 2>/dev/null || true
}

create_issue() {
  local title="$1"
  local milestone="$2"
  local labels="$3"
  local body="$4"

  log "Creating issue: $title"
  gh issue create --repo "$REPO_FULL" \
    --title "$title" \
    --milestone "$milestone" \
    --label "$labels" \
    --body "$body"
}

# ---------------------------------------------------------------------------
# Preflight
# ---------------------------------------------------------------------------

log "Checking GitHub CLI authentication..."
gh auth status

log "Repository: $REPO_FULL"
log "Milestones must already exist (this script does not create them)."

# ---------------------------------------------------------------------------
# Labels (idempotent: ignore if already exists)
# ---------------------------------------------------------------------------

log "Ensuring labels..."

ensure_label "documentation" "0075ca" "Documentation, ADRs, specs, academic evidence"
ensure_label "testing" "d4c5f9" "Unit, integration, E2E tests"
ensure_label "devops" "0e8a16" "CI/CD, deployment, infrastructure"
ensure_label "area:api" "1d76db" "NestJS apps/api"
ensure_label "area:web" "fbca04" "React apps/web"
ensure_label "area:docs" "c5def5" "docs/, PROJECT_CONTEXT, prompts"
ensure_label "area:ci" "bfdadc" "GitHub Actions workflows"
ensure_label "area:ai" "7057ff" "AI refinement, prompts, providers"
ensure_label "epic:auth" "e99695" "Epic 1 - Authentication"
ensure_label "epic:sprint-planning" "f9d0c4" "Epic 2 - Sprint planning"
ensure_label "epic:refinement" "fef2c0" "Epic 3 - AI refinement"
ensure_label "epic:export" "d93f0b" "Epic 4 - Export"
ensure_label "type:spec-first" "5319e7" "Requires approved mini-spec in docs/ before code"
ensure_label "status:blocked" "000000" "Blocked on spec, dependency, or human review"

# enhancement — default GitHub/template label; create only if missing
ensure_label "enhancement" "a2eeef" "New feature or vertical slice"

# ---------------------------------------------------------------------------
# Issues GH-01 … GH-14
# ---------------------------------------------------------------------------

log "Creating 14 backlog issues..."

# GH-01
create_issue \
  "[D1] Coherencia documental: docs 01–08, PROJECT_CONTEXT, README y ARCHITECTURE" \
  "$MILESTONE_D1" \
  "documentation,area:docs" \
  "$(cat <<'EOF'
**Backlog ID:** GH-01

## Objetivo

Eliminar desfases entre la visión MVP documentada (`docs/02`–`04`) y el **estado real** del repositorio (slice CSV import implementado, CI en GitHub Actions, sin auth/IA/deploy).

## Criterios de aceptación

- [ ] `PROJECT_CONTEXT.md` y `README.md` sin contradicciones sobre CI, slice E2E y features no implementadas
- [ ] `docs/08-delivery-plan.md` refleja que Delivery 1 incluye evidencia del slice E2E y CI foundation
- [ ] `ARCHITECTURE.md` alineado con `docs/04-data-model.md` para entidades aún no migradas a Prisma
- [ ] Revisión humana registrada (comentario en issue o nota en PR doc-only)

## Trazabilidad documental

- `docs/01-product-definition.md` … `docs/08-delivery-plan.md`
- `PROJECT_CONTEXT.md` §2, §8
- `README.md` (Current Status / Planned)
- `ARCHITECTURE.md`
- `docs/09-github-backlog-bootstrap.md` §7

## Notas

- **Sin cambios de código de aplicación** salvo correcciones documentales menores acordadas.
EOF
)"

# GH-02
create_issue \
  "[D1] Paquete de evidencia: DEMO.md, prompts P-001–P-017 y ADRs 001–005" \
  "$MILESTONE_D1" \
  "documentation,area:docs" \
  "$(cat <<'EOF'
**Backlog ID:** GH-02

## Objetivo

Preparar evidencia académica verificable del workflow AI-first para la entrega del máster (demo E2E, trazabilidad de prompts, decisiones arquitectónicas).

## Criterios de aceptación

- [ ] `docs/DEMO.md` ejecutable de punta a punta con `fixtures/sample-user-stories.csv`
- [ ] `prompts.md` alineado con slices implementados (P-013–P-017 ↔ User Stories CSV import)
- [ ] `docs/adr/` indexado y referenciado desde README y/o `PROJECT_CONTEXT.md`
- [ ] Checklist de demo completada (pasos DEMO + resultado esperado documentado)

## Trazabilidad documental

- `docs/DEMO.md`
- `prompts.md` §4–5
- `docs/adr/README.md` (ADR-001–005)
- `docs/07-ai-development-workflow.md`
- `fixtures/sample-user-stories.csv`
- US-002 (evidencia del slice implementado)

## Notas

- No ampliar alcance funcional; foco en evidencia y reproducibilidad.
EOF
)"

# GH-03
create_issue \
  "[D1] Matriz de trazabilidad: US-xxx / TB-xxx ↔ milestones e issues" \
  "$MILESTONE_D1" \
  "documentation,area:docs" \
  "$(cat <<'EOF'
**Backlog ID:** GH-03

## Objetivo

Cumplir el requisito del máster de backlog con trazabilidad explícita entre historias de usuario, backlog técnico, milestones GitHub e issues.

## Criterios de aceptación

- [ ] Tabla publicada en `docs/06-technical-backlog.md` o `docs/09-github-backlog-bootstrap.md` (Anexo ampliado) con columnas: US, TB, Issue #, Milestone, Estado
- [ ] US-002 marcada como *implemented* con enlace a GH-04 / spec del slice
- [ ] TB-001–007, TB-007A, TB-013 (parcial), TB-024 (parcial) marcados *done* según estado real del repo
- [ ] Issues GH-06–14 enlazados desde la matriz

## Trazabilidad documental

- `docs/05-user-stories.md` §6 (Traceability)
- `docs/06-technical-backlog.md` §11
- `docs/08-delivery-plan.md`
- `docs/09-github-backlog-bootstrap.md` Anexo B

## Notas

- Actualizar números de issue GitHub (#) tras ejecutar el bootstrap script.
EOF
)"

# GH-04
create_issue \
  "[D1] Cerrar vertical slice US-002: spec, DoD y límites MVP documentados" \
  "$MILESTONE_D1" \
  "documentation,epic:sprint-planning,area:docs,area:api,area:web" \
  "$(cat <<'EOF'
**Backlog ID:** GH-04

## Objetivo

Dar por cerrado documentalmente el único vertical slice E2E **ya implementado** (User Stories CSV Import), con límites MVP explícitos.

## Criterios de aceptación

- [ ] `docs/user-stories-import-mvp.md` con estado *Implementado* y Definition of Done completo
- [ ] Escenarios BDD de la spec referenciados en `docs/DEMO.md`
- [ ] Límites conocidos documentados: re-import duplica filas, máx. 200 filas / 1 MB, import parcial, parser CSV simple, sin auth
- [ ] Sin cambios de código salvo typo doc; fixes de código → issue separada en Delivery 2

## Trazabilidad documental

- `docs/user-stories-import-mvp.md`
- `docs/05-user-stories.md` — US-002
- `docs/06-technical-backlog.md` — TB-013, TB-024, TB-036
- `prompts.md` — P-013, P-014, P-015, P-016, P-017

## Estado implementado (referencia)

CSV → React (`/user-stories`) → NestJS → Prisma → PostgreSQL — **ya operativo en local**.
EOF
)"

# GH-05
create_issue \
  "[D1] Checklist de entrega: merge rama entrega, PR doc-only y revisión tutor" \
  "$MILESTONE_D1" \
  "documentation,area:docs" \
  "$(cat <<'EOF'
**Backlog ID:** GH-05

## Objetivo

Cierre formal de Delivery 1 (27 may 2026): PR limpio, sin scope creep, listo para revisión del tutor.

## Criterios de aceptación

- [ ] PR con plantilla: Summary + Test plan (demo manual) + referencias a specs / prompts
- [ ] Builds documentados en PR: `pnpm --filter api build && test`, `pnpm --filter web build`
- [ ] Rama de entrega (`feature-entrega1-DLP` o equivalente) mergeada o lista para merge tras revisión
- [ ] Issues GH-01–GH-04 cerradas o con estado acordado con tutor

## Trazabilidad documental

- `docs/08-delivery-plan.md` — Milestone 1
- `PROJECT_CONTEXT.md` §4, §9
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/ci.yml` (CI ya validada en PR real)

## Notas

- No incluir features nuevas en el PR de cierre de Delivery 1.
EOF
)"

# GH-06
create_issue \
  "[D2] US-001: Login JWT y rutas protegidas (spec-first)" \
  "$MILESTONE_D2" \
  "enhancement,type:spec-first,epic:auth,area:api,area:web" \
  "$(cat <<'EOF'
**Backlog ID:** GH-06

## Objetivo

Implementar acceso autenticado al MVP como base para proteger endpoints y rutas web futuras.

## Criterios de aceptación

- [ ] Mini-spec `docs/auth-mvp.md` (o equivalente) aprobada **antes** de código
- [ ] BDD US-001: credenciales válidas → acceso; inválidas → acceso denegado
- [ ] JWT en API; rutas web protegidas; contrato documentado en Swagger
- [ ] Entrada en `prompts.md` (nuevo P-xxx) tras merge del slice
- [ ] PR con Test plan y validación local documentada

## Trazabilidad documental

- `docs/05-user-stories.md` — US-001
- `docs/06-technical-backlog.md` — TB-008, TB-009, TB-022
- `docs/04-data-model.md`, `docs/03-technical-design.md`
- `docs/adr/` — ADR-003 (stack)
- `AGENTS.md`, `ARCHITECTURE.md`

## Fuera de alcance

- RBAC enterprise, OAuth social, multi-tenant.
EOF
)"

# GH-07
create_issue \
  "[D2] US-003: Configurar capacidad de sprint (TeamMember + UI)" \
  "$MILESTONE_D2" \
  "enhancement,type:spec-first,epic:sprint-planning,area:api,area:web" \
  "$(cat <<'EOF'
**Backlog ID:** GH-07

## Objetivo

Persistir y configurar la capacidad disponible del equipo para habilitar análisis sprint vs demanda.

## Criterios de aceptación

- [ ] Spec incremental en `docs/` (capacity MVP) aprobada antes de código
- [ ] BDD US-003: configuración de capacidad persistida; valores inválidos rechazados
- [ ] Prisma: solo entidades mínimas acordadas en spec (migración incremental, no modelo completo de `docs/04` de una vez)
- [ ] UI mínima + tests unitarios Jest en reglas de negocio puras
- [ ] Swagger actualizado

## Trazabilidad documental

- `docs/05-user-stories.md` — US-003
- `docs/06-technical-backlog.md` — TB-010, TB-011, TB-025
- `docs/02-functional-specification.md`, `docs/04-data-model.md`

## Dependencias

- Preferible tras GH-06 (auth) o spec que defina alcance sin auth si el tutor lo prioriza.
EOF
)"

# GH-08
create_issue \
  "[D2] US-004: Registrar ausencias y ajustar capacidad disponible" \
  "$MILESTONE_D2" \
  "enhancement,type:spec-first,epic:sprint-planning,area:api,area:web" \
  "$(cat <<'EOF'
**Backlog ID:** GH-08

## Objetivo

Registrar vacaciones y ausencias para que el cálculo de capacidad refleje disponibilidad real del equipo.

## Criterios de aceptación

- [ ] Spec ausencias MVP aprobada en `docs/`
- [ ] BDD US-004: ausencia registrada → capacidad reducida; fechas inválidas → rechazo
- [ ] API + UI acotadas al slice; Swagger documentado
- [ ] Tests unitarios en validación de fechas/reglas

## Trazabilidad documental

- `docs/05-user-stories.md` — US-004
- `docs/06-technical-backlog.md` — TB-012
- `docs/02-functional-specification.md`

## Dependencias

- GH-07 (capacidad / TeamMember foundation).
EOF
)"

# GH-09
create_issue \
  "[D2] US-005: Motor de análisis sprint (overload detection)" \
  "$MILESTONE_D2" \
  "enhancement,type:spec-first,epic:sprint-planning,area:api,area:web,testing" \
  "$(cat <<'EOF'
**Backlog ID:** GH-09

## Objetivo

Calcular demanda (story points de User Stories importadas) vs capacidad neta y detectar riesgo de sobrecarga del sprint.

## Criterios de aceptación

- [ ] BDD US-005: con US importadas + capacidad configurada → cálculo capacity vs demand
- [ ] BDD US-005: demanda excesiva → sprint marcado como overloaded
- [ ] TDD en lógica de cálculo (RED-GREEN según TB-014)
- [ ] Vista mínima de análisis (TB-026); build API/web sin errores

## Trazabilidad documental

- `docs/05-user-stories.md` — US-005
- `docs/06-technical-backlog.md` — TB-014, TB-026, TB-035
- `docs/03-technical-design.md`
- Depende de US-002 (import) — **ya implementado**

## Dependencias

- GH-07, GH-08.
EOF
)"

# GH-10
create_issue \
  "[D2] US-006–008: Refinamiento IA MVP (PDF, gaps, AC generados)" \
  "$MILESTONE_D2" \
  "enhancement,type:spec-first,epic:refinement,area:ai,area:api,area:web" \
  "$(cat <<'EOF'
**Backlog ID:** GH-10

## Objetivo

Entregar flujo de refinamiento asistido por IA con provider desacoplado y mock para demo académica predecible.

## Criterios de aceptación

- [ ] Spec `docs/refinement-mvp.md` (o equivalente) aprobada: PDF upload, extracción, refinamiento, AC estructurados, gaps si requisitos ambiguos
- [ ] BDD US-006, US-007, US-008 cubiertos en alcance MVP
- [ ] Adapter IA + Mock provider (TB-017, TB-018); salida editable en UI (US-007)
- [ ] Human-in-the-loop: revisión humana obligatoria antes de cerrar slice
- [ ] Sin RAG, workers async ni orquestación enterprise

## Trazabilidad documental

- `docs/05-user-stories.md` — US-006, US-007, US-008
- `docs/06-technical-backlog.md` — TB-015–019, TB-027, TB-028, TB-030, TB-031
- `docs/07-ai-development-workflow.md`
- `docs/adr/` — ADR-001 (AI-first SDLC)

## Notas

- Priorizar mock provider para demos y tests deterministas.
EOF
)"

# GH-11
create_issue \
  "[D2] US-009: Export Excel de análisis de sprint" \
  "$MILESTONE_D2" \
  "enhancement,type:spec-first,epic:export,area:api,area:web" \
  "$(cat <<'EOF'
**Backlog ID:** GH-11

## Objetivo

Generar reporting operativo descargable (Excel) para compartir resultados de análisis de sprint con stakeholders.

## Criterios de aceptación

- [ ] Spec export MVP aprobada en `docs/`
- [ ] BDD US-009: análisis completado → archivo Excel descargable
- [ ] BDD US-009: fallo de generación → mensaje de error visible en UI
- [ ] Endpoint documentado en Swagger; PR con Test plan

## Trazabilidad documental

- `docs/05-user-stories.md` — US-009
- `docs/06-technical-backlog.md` — TB-020, TB-029
- `docs/02-functional-specification.md`

## Dependencias

- GH-09 (datos de análisis de sprint).
EOF
)"

# GH-12
create_issue \
  "[Final] Deploy MVP público (web + API + PostgreSQL gestionado)" \
  "$MILESTONE_FD" \
  "devops,area:api,area:web" \
  "$(cat <<'EOF'
**Backlog ID:** GH-12

## Objetivo

Publicar el MVP en entornos accesibles para evaluación final del máster (frontend, API, base de datos gestionada).

## Criterios de aceptación

- [ ] Frontend desplegado (TB-041 — p. ej. Vercel según plan del proyecto)
- [ ] API desplegada (TB-042 — p. ej. Render u equivalente)
- [ ] PostgreSQL gestionado configurado (TB-043 — p. ej. Neon)
- [ ] Variables de entorno documentadas en README/spec (TB-039); **sin secretos en el repositorio**
- [ ] Smoke post-deploy del flujo principal acordado con tutor

## Trazabilidad documental

- `docs/08-delivery-plan.md` — Final Delivery scope
- `docs/06-technical-backlog.md` — TB-039, TB-040, TB-041, TB-042, TB-043
- `README.md` — Infrastructure (planned → implemented)
- `PROJECT_CONTEXT.md` §9

## Notas

- No desplegar antes de slices funcionales críticos de Delivery 2 acordados con tutor.
EOF
)"

# GH-13
create_issue \
  "[Final] CI: job PostgreSQL y tests e2e API (import + health)" \
  "$MILESTONE_FD" \
  "devops,testing,area:ci,area:api" \
  "$(cat <<'EOF'
**Backlog ID:** GH-13

## Objetivo

Validar en GitHub Actions lo que hoy solo se prueba en local: Prisma, persistencia e import CSV de User Stories.

## Criterios de aceptación

- [ ] Service container PostgreSQL en workflow cuando tests de integración lo requieran
- [ ] E2E Supertest: `GET /api/health` + `POST /api/user-stories/import` con fixture CSV
- [ ] Pipeline existente (build + test API + build web) sigue en verde en PR
- [ ] Documentado en `ARCHITECTURE.md` o spec de CI los límites del job

## Trazabilidad documental

- `.github/workflows/ci.yml`
- `docs/06-technical-backlog.md` — TB-007, TB-033, TB-038
- `PROJECT_CONTEXT.md` §7
- `AGENTS.md` — Testing rules
- `fixtures/sample-user-stories.csv`

## Estado actual

CI valida build/test **sin** PostgreSQL en runner.
EOF
)"

# GH-14
create_issue \
  "[Final] Playwright E2E flujo operativo + evidencia final prompts/PRs" \
  "$MILESTONE_FD" \
  "testing,documentation,area:web,area:docs" \
  "$(cat <<'EOF'
**Backlog ID:** GH-14

## Objetivo

Automatizar validación E2E del flujo operativo principal y completar paquete de evidencia final del máster.

## Criterios de aceptación

- [ ] Playwright (o herramienta acordada) cubre flujo mínimo definido en spec (p. ej. login → import o ruta crítica MVP)
- [ ] `prompts.md` actualizado con prompts de iteraciones Delivery 2 / Final (P-018+)
- [ ] README y docs de mantenimiento al día (TB-045, TB-046)
- [ ] Criterios de éxito en `docs/08-delivery-plan.md` §10 verificables y referenciados
- [ ] Historial de PRs referenciable para evaluación académica

## Trazabilidad documental

- `docs/06-technical-backlog.md` — TB-034, TB-038, TB-045, TB-046
- `docs/08-delivery-plan.md` §10–11
- `prompts.md` §6 (próximos prompts)
- `docs/07-ai-development-workflow.md`

## Dependencias

- GH-12, GH-13 recomendados antes o en paralelo según prioridad tutor.
EOF
)"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo ""
log "Bootstrap complete."
echo ""
echo "  Repository:  $REPO_FULL"
echo "  Issues:      14 created (GH-01 … GH-14)"
echo "  Milestones:  not modified (must exist beforehand)"
echo ""
echo "List open issues:"
echo "  gh issue list --repo $REPO_FULL"
echo ""
echo "List by milestone:"
echo "  gh issue list --repo $REPO_FULL --milestone \"$MILESTONE_D1\""
echo "  gh issue list --repo $REPO_FULL --milestone \"$MILESTONE_D2\""
echo "  gh issue list --repo $REPO_FULL --milestone \"$MILESTONE_FD\""
echo ""
echo "Next step: update traceability matrix (GH-03) with GitHub issue numbers."
echo ""
