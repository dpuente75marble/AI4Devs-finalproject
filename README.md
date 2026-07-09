# DeliveryOps AI

AI-assisted SaaS platform for sprint planning, capacity analysis, requirement refinement, and operational delivery management.

![Status](https://img.shields.io/badge/status-MVP%20E2E%20slice-green)
![MVP](https://img.shields.io/badge/MVP-AI--assisted-success)
![License](https://img.shields.io/badge/license-Master%20Project-lightgrey)

---

# Project Information

| Field | Value |
|-------|-------|
| **Program** | AI4Devs / LIDR — Final Master Project 2026 |
| **Delivery** | Delivery 2 — Functional MVP (target: 24 Jun 2026) · Delivery 1 closed |
| **Author** | David de la Puente |
| **Repository** | [github.com/dpuente75marble/AI4Devs-finalproject](https://github.com/dpuente75marble/AI4Devs-finalproject) |
| **Approach** | AI-first SDLC · spec-first · vertical slices · human-in-the-loop |

Operational handoff and **real repository state:** [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)

---

# Delivery Status

| Category | Status |
|----------|--------|
| **Delivery 1** | Closed — product/architecture package, ADRs, governance, CI, DEMO evidence |
| **Delivery 2** | **Functionally complete** — vertical slices **US-001–US-009** (auth, CSV import, sprint planning, refinement MVP, Excel export) — [docs/DEMO.md](docs/DEMO.md) |
| **Final Delivery** | Planned — public deployment (#14), PostgreSQL CI (#15), extended E2E in GitHub Actions |

| **Documented** | Product and architecture package (`docs/01`–`08`), ADRs, [AGENTS.md](AGENTS.md), [ARCHITECTURE.md](ARCHITECTURE.md), [prompts.md](prompts.md) (P-001–P-025), [docs/09-github-backlog-bootstrap.md](docs/09-github-backlog-bootstrap.md) |
| **Implemented** | Monorepo foundation, local PostgreSQL (Docker), **GitHub Actions CI**, vertical slices **US-001–US-009** — [docs/DEMO.md](docs/DEMO.md); GitHub backlog bootstrapped (issues #3–#16, milestones, labels) |

> Delivery 1 originally scoped documentation only; the repository already includes working local E2E slices and CI as evidence of the AI-first workflow.

---

# Project Overview

DeliveryOps AI is an AI-assisted delivery operations platform designed to help Project Managers, Tech Leads, and Delivery Managers improve software delivery workflows.

The platform focuses on solving common operational problems such as:

- fragmented project information
- manual sprint planning
- capacity calculation complexity
- incomplete User Stories
- inconsistent requirement quality
- operational reporting overhead

The system combines operational planning workflows with AI-assisted requirement refinement.

---

# Project Goals

The project aims to:

- reduce manual delivery management work
- improve sprint planning visibility
- improve User Story quality
- accelerate delivery workflows using AI assistance
- demonstrate a modern AI Engineering workflow
- provide a scalable foundation for future operational automation

---

# MVP Goal

The MVP aims to deliver a complete end-to-end operational workflow including:

- authentication *(implemented — US-001)*
- User Story CSV import *(implemented — US-002)*
- sprint capacity planning *(implemented — US-003)*
- absence management *(implemented — US-004)*
- sprint overload analysis *(implemented — US-005)*
- AI-assisted User Story refinement *(implemented — US-006–008, mock provider)*
- Excel export generation *(implemented — US-009)*

The project intentionally prioritizes a realistic and maintainable MVP over excessive enterprise scope.

---

# Main Features

## Sprint Planning

- CSV import for User Stories
- team capacity configuration
- absence and vacation management
- sprint demand vs capacity analysis
- overload detection

---

## AI-Assisted Requirement Refinement

- PDF upload
- text extraction
- gap detection
- refined User Story generation
- acceptance criteria generation

---

## Operational Reporting

- Excel export of sprint analysis *(implemented — US-009)*
- sprint operational summaries *(via sprint analysis view)*
- refinement export support *(planned — PDF/export beyond US-009)*

---

# Technical Stack

## Frontend

**Implemented in current MVP:**

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

**Planned for upcoming iterations:**

- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod

---

## Backend

- Node.js
- NestJS
- Prisma ORM
- PostgreSQL
- Swagger / OpenAPI

---

## Testing

**Implemented in current MVP:**

- Jest (API unit tests)
- Playwright (E2E smoke en `e2e/`, incl. auth)

**Planned for upcoming iterations:**

- Vitest
- React Testing Library

---

## Infrastructure

**Implemented in current MVP:**

- Docker (local PostgreSQL via `docker-compose.yml`)
- GitHub Actions CI (`.github/workflows/ci.yml` — build and test on push/PR)

**Planned for upcoming iterations:**

- Public deployment (Vercel + Railway + Railway PostgreSQL) — production configuration prepared in VS-01; deploy not executed yet

---

# Architecture Overview

## Target vs Current Implementation

| Layer | Target design | Current implementation |
|-------|---------------|------------------------|
| **Style** | Clean Architecture and Hexagonal Architecture (modular boundaries, ports/adapters for AI) | **Pragmatic modular monolith** — NestJS module per feature, service → Prisma directly |
| **Detail** | [docs/03-technical-design.md](docs/03-technical-design.md), [ARCHITECTURE.md](ARCHITECTURE.md) | Feature modules: `auth`, `user-stories`, `sprint-capacity`, `sprint-absences`, `sprint-analysis`, `refinement` (mock provider) |

Clean/Hexagonal principles guide future slices; the running codebase prioritizes maintainable vertical delivery over full layered architecture.

## Architecture Principles

The architecture follows:

- modular monolith design (current)
- feature-based frontend organization
- AI-provider decoupling (target)
- specification-first development
- AI-assisted engineering workflows
- pragmatic Clean Architecture and Hexagonal Architecture as **direction**, not fully applied in code today

~~~text
React Frontend
      |
      v
NestJS Backend API
      |
      v
PostgreSQL Database

Backend
      |
      v
AI Provider Adapter
      |
      +--> OpenAI
      +--> Azure OpenAI
      +--> Mock AI Provider
~~~

The architecture prioritizes:

- maintainability
- modularity
- AI-provider decoupling
- testability
- incremental delivery
- free-tier deployment

---

# AI Engineering Workflow

The project follows an AI-assisted engineering workflow using:

- Cursor
- SpecKit
- BDD
- selective TDD
- reusable prompts
- AI rules (`.cursor/rules/`)
- development agents

**Governance and traceability:**

- [prompts.md](prompts.md) — prompt registry (P-001–P-024: foundation, vertical slices, Delivery 1 evidence, US-001 auth)
- [AGENTS.md](AGENTS.md) — scope, prohibitions, and workflow rules for AI agents and developers
- [docs/07-ai-development-workflow.md](docs/07-ai-development-workflow.md) — full AI-first SDLC methodology

AI is used throughout the full software lifecycle: product definition, architecture, backlog generation, implementation, testing, and documentation.

**Human-in-the-loop:** specs, business limits, security, and E2E behavior must be reviewed and approved by a human before a slice is considered done. The AI proposes; the human validates.

---

# Implemented API

Business endpoints available today (local development):

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/auth/login` | Login with email/password; sets HttpOnly session cookie |
| `POST` | `/api/auth/logout` | Clears session cookie |
| `GET` | `/api/auth/me` | Current authenticated user (requires session cookie) |
| `GET` | `/api/user-stories` | List imported User Stories |
| `POST` | `/api/user-stories/import` | CSV import (multipart, per-row validation) |
| `GET` | `/api/sprint-capacity` | List sprint capacity configurations |
| `POST` | `/api/sprint-capacity` | Create sprint capacity configuration |
| `GET` | `/api/sprint-absences` | List sprint absence records |
| `POST` | `/api/sprint-absences` | Create sprint absence record |
| `GET` | `/api/sprint-analysis` | Demand vs adjusted capacity analysis |
| `POST` | `/api/refinement/analyze` | PDF refinement analysis (mock provider) |

Interactive contract: Swagger UI at `http://localhost:3000/api/docs` (with API running).

---

# Current Database State

**Implemented in PostgreSQL (Prisma):**

- `User` — authentication (US-001)
- `UserStory` — CSV import (US-002)
- `SprintCapacity` — sprint capacity configuration (US-003)
- `SprintAbsence` — sprint absence records (US-004)
- `HealthCheck` — persistence foundation

Sprint analysis (US-005) and refinement (US-006–008) are computed in-memory; results are not persisted.

**Target data model (documented, not yet in database):**

Full MVP design in [docs/04-data-model.md](docs/04-data-model.md) — `User`, `Project`, `Sprint`, `TeamMember`, `Absence`, `RequirementDocument`, `RefinementResult`, `ExportJob`, and related entities.

---

# User Stories and Backlog

- **User Stories:** [docs/05-user-stories.md](docs/05-user-stories.md) (US-001–US-011)
- **Technical backlog:** [docs/06-technical-backlog.md](docs/06-technical-backlog.md) (TB-xxx)
- **GitHub backlog:** [docs/09-github-backlog-bootstrap.md](docs/09-github-backlog-bootstrap.md) (bootstrap strategy and traceability) — **GH-01–GH-14** materialized as GitHub Issues **#3–#16**

**Slice coverage (implemented):** US-001 (auth), US-002 (CSV import), US-003 (sprint capacity), US-004 (sprint absences), US-005 (sprint analysis), US-006–008 (refinement MVP), US-009 (Excel export). Specs per slice in `docs/*-mvp.md`; traceability matrix in [docs/09-github-backlog-bootstrap.md](docs/09-github-backlog-bootstrap.md).

---

# GitHub Workflow

- **PR-driven development** — prefer one vertical slice per PR; [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)
- **CI** — [`.github/workflows/ci.yml`](.github/workflows/ci.yml): `pnpm install` → Prisma generate → API build/test → web build (no PostgreSQL service on runner, no deploy)
- **Milestones (created):** Delivery 1 — Technical Documentation · Delivery 2 — Functional MVP · Final Delivery — Deployed MVP (aligned with [docs/08-delivery-plan.md](docs/08-delivery-plan.md))
- **Labels (created):** `area:*`, `epic:*`, `type:*`, `status:*`, plus `testing`, `devops`, `documentation`
- **Issues (created):** GH-01–GH-14 → GitHub Issues **#3–#16**; bootstrap strategy and US/TB mapping in [docs/09-github-backlog-bootstrap.md](docs/09-github-backlog-bootstrap.md)
- **New work** — feature requests via `.github/ISSUE_TEMPLATE/`

---

# Documentation

## Project Governance

- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — real repository state and handoff
- [AGENTS.md](AGENTS.md) — AI agent and developer workflow rules
- [ARCHITECTURE.md](ARCHITECTURE.md) — implemented architecture
- [prompts.md](prompts.md) — AI prompt traceability (P-001–P-025)

---

## Product and Architecture

- [01-product-definition.md](docs/01-product-definition.md)
- [02-functional-specification.md](docs/02-functional-specification.md)
- [03-technical-design.md](docs/03-technical-design.md)
- [04-data-model.md](docs/04-data-model.md)
- [adr/README.md](docs/adr/README.md) — Architecture Decision Records (ADR-001–ADR-005)

---

## Delivery and Planning

- [05-user-stories.md](docs/05-user-stories.md)
- [06-technical-backlog.md](docs/06-technical-backlog.md)
- [07-ai-development-workflow.md](docs/07-ai-development-workflow.md)
- [08-delivery-plan.md](docs/08-delivery-plan.md)
- [09-github-backlog-bootstrap.md](docs/09-github-backlog-bootstrap.md) — bootstrap strategy (issues #3–#16 = GH-01–GH-14, milestones, labels)
- [user-stories-import-mvp.md](docs/user-stories-import-mvp.md) — US-002 CSV import spec
- [sprint-capacity-mvp.md](docs/sprint-capacity-mvp.md) — US-003 sprint capacity spec
- [sprint-absences-mvp.md](docs/sprint-absences-mvp.md) — US-004 sprint absences spec
- [sprint-analysis-mvp.md](docs/sprint-analysis-mvp.md) — US-005 sprint analysis spec
- [refinement-mvp.md](docs/refinement-mvp.md) — US-006–008 refinement MVP spec
- [auth-mvp.md](docs/auth-mvp.md) — US-001 login JWT and protected routes spec
- [export-sprint-analysis-mvp.md](docs/export-sprint-analysis-mvp.md) — US-009 Excel export spec
- [DEMO.md](docs/DEMO.md) — E2E demo guide and checklist

---

# Repository Structure

~~~text
AI4Devs-finalproject/
│
├── README.md
├── PROJECT_CONTEXT.md
├── AGENTS.md
├── ARCHITECTURE.md
├── prompts.md
│
├── .github/              workflows, PR/issue templates
├── docs/                 product, architecture, backlog, DEMO, ADRs
├── fixtures/             sample CSV for demo
│
├── apps/
│   ├── web/
│   └── api/
│
└── packages/
    └── shared/
~~~

---

# Current Status

## Implemented

- monorepo (`pnpm` workspace: `apps/web`, `apps/api`, `packages/shared`)
- frontend foundation (React + Vite + TypeScript + Tailwind CSS + React Router)
- backend foundation (NestJS + ConfigModule + modular structure)
- Prisma + PostgreSQL (local Docker database)
- Swagger / OpenAPI (`/api/docs`)
- **US-001:** Login JWT — HttpOnly cookie, protected routes, `AuthProvider` + `ProtectedRoute`
- **US-002:** User Stories CSV import E2E
- **US-003:** Sprint capacity configuration (Settings UI + API)
- **US-004:** Sprint absences (Settings UI + API)
- **US-005:** Sprint analysis — demand vs adjusted capacity (`/sprint-analysis`)
- **US-006–008:** Refinement MVP — PDF upload, mock provider, editable output (`/refinement`)
- **US-009:** Sprint analysis Excel export — `GET /api/sprint-analysis/export`, **Export Excel** button on `/sprint-analysis`
- frontend/backend integration (`VITE_API_URL`, CORS via `CORS_ORIGINS` with local Vite defaults `5173`–`5178`)
- production readiness configuration (VS-01): env-based CORS and cookie settings documented in `apps/api/.env.example` and `apps/web/.env.example` — **not deployed yet**
- Docker local database (`postgres:16-alpine` on port `5433`)
- GitHub Actions CI (build + API tests + web build on push/PR)
- product, architecture, and AI-assisted traceability documentation (`docs/`, `prompts.md`)

---

## Planned (Final Delivery)

- public deployment (Vercel + Railway + Railway PostgreSQL) — issue #14; configuration prep done in VS-01, deploy pending
- CI with PostgreSQL service on runner — issue #15
- extended E2E and UI test coverage (Playwright in GitHub Actions)

---

# Implemented Vertical Slices

Six operational slices plus authentication and Excel export are implemented end-to-end in local development (PRs #27–#28 and prior slice PRs). Full walkthrough: [docs/DEMO.md](docs/DEMO.md).

| User Story | Slice | Spec | UI route |
|------------|-------|------|----------|
| US-001 | Login JWT | [auth-mvp.md](docs/auth-mvp.md) | `/login` · rutas protegidas |
| US-002 | CSV import | [user-stories-import-mvp.md](docs/user-stories-import-mvp.md) | `/user-stories` |
| US-003 | Sprint capacity | [sprint-capacity-mvp.md](docs/sprint-capacity-mvp.md) | `/settings` |
| US-004 | Sprint absences | [sprint-absences-mvp.md](docs/sprint-absences-mvp.md) | `/settings` |
| US-005 | Sprint analysis | [sprint-analysis-mvp.md](docs/sprint-analysis-mvp.md) | `/sprint-analysis` |
| US-006–008 | Refinement MVP | [refinement-mvp.md](docs/refinement-mvp.md) | `/refinement` |
| US-009 | Excel export | [export-sprint-analysis-mvp.md](docs/export-sprint-analysis-mvp.md) | `/sprint-analysis` (Export Excel) |

**Planning flow (US-002 → US-005):**

~~~text
CSV upload (/user-stories)
      |
      v
POST /api/user-stories/import  →  PostgreSQL (UserStory)
      |
      v
Settings: Sprint Capacity + Absences (/settings)
      |
      v
GET /api/sprint-analysis  →  demand vs adjusted capacity (/sprint-analysis)
      |
      v
GET /api/sprint-analysis/export  →  Excel download (US-009)
~~~

**Refinement flow (US-006–008):**

~~~text
PDF upload (/refinement)
      |
      v
POST /api/refinement/analyze  →  mock provider
      |
      v
Editable refined story, acceptance criteria, gaps (UI only — not persisted)
~~~

**Still out of scope:** public production deployment (URLs not live yet), real LLM provider, persistence of refinement results.

**Production readiness (VS-01, preparación sin despliegue):** CORS configurable (`CORS_ORIGINS`), cookies vía `AUTH_COOKIE_SECURE` / `AUTH_COOKIE_SAME_SITE`. Valores recomendados para Vercel + Railway documentados en `apps/api/.env.example` y `apps/web/.env.example`. Ver [docs/public-deployment-spec.md](docs/public-deployment-spec.md).

**Auth (US-001):** sesión vía cookie HttpOnly; el frontend no almacena JWT. Usuario demo local:

| Campo | Valor |
|-------|-------|
| Email | `pm@deliveryops.local` |
| Password | `DeliveryOps123!` |

Crear o actualizar el usuario demo:

```bash
pnpm --filter api auth:create-demo-user
```

**E2E demo:** [docs/DEMO.md](docs/DEMO.md) · fixtures: [sample-user-stories.csv](fixtures/sample-user-stories.csv), [requirements.pdf](fixtures/requirements.pdf)

---

# Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker (for local PostgreSQL)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

Database runs on `localhost:5433` (see `docker-compose.yml`).

### 3. Configure environment

**API** — ensure `apps/api/.env` includes a valid `DATABASE_URL` and auth variables (see `apps/api/.env.example`), for example:

```env
DATABASE_URL=postgresql://deliveryops:deliveryops@localhost:5433/deliveryops_ai
JWT_SECRET=change-me-in-local-dev
JWT_EXPIRES_IN=30m
AUTH_COOKIE_NAME=deliveryops_access_token
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
# CORS_ORIGINS optional locally — omit to allow Vite ports 5173–5178 (see apps/api/.env.example)
```

For recommended production values (Vercel + Railway), see commented blocks in `apps/api/.env.example`.

Apply Prisma migrations if needed:

```bash
pnpm --filter api prisma migrate dev
```

Create the demo user (idempotent):

```bash
pnpm --filter api auth:create-demo-user
```

**Web** — copy the example env and adjust if required:

```bash
cp apps/web/.env.example apps/web/.env
```

`apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Production build-time value documented (commented) in `apps/web/.env.example`. Changing it requires a new Vercel deployment.

> Restart the Vite dev server after changing `VITE_*` variables.

### 4. Run applications

Terminal 1 — API:

```bash
pnpm --filter api start:dev
```

API: `http://localhost:3000`  
Swagger: `http://localhost:3000/api/docs`  
Health: `http://localhost:3000/api/health`

Terminal 2 — Web:

```bash
pnpm --filter web dev
```

Open the URL shown by Vite (e.g. `http://localhost:5173`). Unauthenticated users are redirected to `/login`. After login, navigate to `/user-stories` or other protected routes.

### 5. Quick validation

```bash
pnpm --filter api build && pnpm --filter api test
pnpm --filter web build
pnpm test:e2e
```

**Smoke test:** follow [docs/DEMO.md](docs/DEMO.md), import [fixtures/sample-user-stories.csv](fixtures/sample-user-stories.csv) (9 rows with `team_name` / `project_name`), and confirm rows appear in the table. For Sprint Analysis, configure matching capacity in Settings and verify demand on `/sprint-analysis`.

---

# Master Project Deliveries

## Delivery 1 - Technical Documentation

Target:

~~~text
27 May 2026
~~~

Includes:

- architecture
- backlog
- User Stories
- AI workflow
- delivery strategy

---

## Delivery 2 - Functional MVP

Target:

~~~text
24 June 2026
~~~

Status: **functionally complete** (local MVP validated).

Includes:

- backend
- frontend
- database
- authentication *(implemented — US-001)*
- CSV import *(implemented — US-002)*
- sprint capacity, absences, and analysis *(implemented — US-003–005)*
- AI refinement MVP *(implemented — US-006–008, mock provider)*
- Excel export *(implemented — US-009)*
- initial testing
- CI/CD setup *(CI implemented; deploy deferred to Final Delivery)*

---

## Final Delivery

Target:

~~~text
14 July 2026
~~~

Includes:

- deployed MVP
- E2E flow
- tests
- CI/CD
- prompts documentation
- AI workflow evidence

---

# Engineering Principles

The project prioritizes:

- realistic MVP scope
- maintainable architecture
- AI-assisted productivity
- human validation
- incremental delivery
- operational usability
- pragmatic engineering decisions

The project intentionally avoids unnecessary enterprise complexity in the initial MVP.

---

# Future Vision

Potential future evolution includes:

- Rally integration
- Jira integration
- Confluence synchronization
- AI planning assistants
- historical analytics
- dependency detection
- vector search
- Retrieval-Augmented Generation (RAG)
- operational product agents

---

# Author

David de la Puente  
AI4Devs Final Master Project  
DeliveryOps AI  
2026