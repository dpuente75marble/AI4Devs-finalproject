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
| **Delivery** | Delivery 1 — Technical Documentation (target: 27 May 2026) |
| **Author** | David de la Puente |
| **Repository** | [github.com/dpuente75marble/AI4Devs-finalproject](https://github.com/dpuente75marble/AI4Devs-finalproject) |
| **Approach** | AI-first SDLC · spec-first · vertical slices · human-in-the-loop |

Operational handoff and **real repository state:** [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)

---

# Delivery 1 Status

| Category | Status |
|----------|--------|
| **Documented** | Product and architecture package (`docs/01`–`08`), ADRs, [AGENTS.md](AGENTS.md), [ARCHITECTURE.md](ARCHITECTURE.md), [prompts.md](prompts.md) (P-001–P-017), [docs/09-github-backlog-bootstrap.md](docs/09-github-backlog-bootstrap.md) |
| **Implemented** | Monorepo foundation, local PostgreSQL (Docker), **GitHub Actions CI**, **User Stories CSV import E2E** — [docs/DEMO.md](docs/DEMO.md); GitHub backlog bootstrapped (issues #3–#16, milestones, labels) |
| **Planned** (Delivery 2+) | Authentication, sprint capacity, AI refinement, exports, **public deployment** |

> Delivery 1 originally scoped documentation only; the repository already includes a working local E2E slice and CI as evidence of the AI-first workflow.

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

- authentication
- User Story CSV import
- sprint capacity planning
- absence management
- sprint overload analysis
- AI-assisted User Story refinement
- Excel export generation

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

- Excel export generation
- sprint operational summaries
- refinement export support

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

- Jest (API unit tests for CSV parser/validator)

**Planned for upcoming iterations:**

- Vitest
- React Testing Library
- Playwright

---

## Infrastructure

**Implemented in current MVP:**

- Docker (local PostgreSQL via `docker-compose.yml`)
- GitHub Actions CI (`.github/workflows/ci.yml` — build and test on push/PR)

**Planned for upcoming iterations:**

- Public deployment (Vercel, Render, Neon PostgreSQL)

---

# Architecture Overview

## Target vs Current Implementation

| Layer | Target design | Current implementation |
|-------|---------------|------------------------|
| **Style** | Clean Architecture and Hexagonal Architecture (modular boundaries, ports/adapters for AI) | **Pragmatic modular monolith** — NestJS module per feature, service → Prisma directly |
| **Detail** | [docs/03-technical-design.md](docs/03-technical-design.md), [ARCHITECTURE.md](ARCHITECTURE.md) | First slice: `user-stories` module; AI adapter **not implemented** yet |

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

- [prompts.md](prompts.md) — prompt registry (P-001–P-017: foundation + CSV import slice)
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
| `GET` | `/api/user-stories` | List imported User Stories |
| `POST` | `/api/user-stories/import` | CSV import (multipart, per-row validation) |

Interactive contract: Swagger UI at `http://localhost:3000/api/docs` (with API running).

---

# Current Database State

**Implemented in PostgreSQL (Prisma):**

- `UserStory` — CSV import vertical slice
- `HealthCheck` — persistence foundation

**Target data model (documented, not yet in database):**

Full MVP design in [docs/04-data-model.md](docs/04-data-model.md) — `User`, `Project`, `Sprint`, `TeamMember`, `Absence`, `RequirementDocument`, `RefinementResult`, `ExportJob`, and related entities.

---

# User Stories and Backlog

- **User Stories:** [docs/05-user-stories.md](docs/05-user-stories.md) (US-001–US-011)
- **Technical backlog:** [docs/06-technical-backlog.md](docs/06-technical-backlog.md) (TB-xxx)
- **GitHub backlog:** [docs/09-github-backlog-bootstrap.md](docs/09-github-backlog-bootstrap.md) (bootstrap strategy and traceability) — **GH-01–GH-14** materialized as GitHub Issues **#3–#16**

**Slice coverage:** US-002 (CSV import) is partially implemented via [user-stories-import-mvp.md](docs/user-stories-import-mvp.md); remaining Must-Have stories are planned for Delivery 2+.

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
- [prompts.md](prompts.md) — AI prompt traceability (P-001–P-017)

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
- [user-stories-import-mvp.md](docs/user-stories-import-mvp.md) — first vertical slice specification
- [DEMO.md](docs/DEMO.md) — E2E demo guide (Delivery 1 evidence)

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
- **User Stories CSV import E2E** (first functional vertical slice)
- frontend/backend integration (`VITE_API_URL`, local CORS for Vite dev ports)
- Docker local database (`postgres:16-alpine` on port `5433`)
- GitHub Actions CI (build + API tests + web build on push/PR)
- product, architecture, and AI-assisted traceability documentation (`docs/`, `prompts.md`)

---

## In Progress

- MVP stabilization
- delivery preparation
- documentation hardening

---

## Planned

- authentication
- sprint planning and capacity analysis
- AI-assisted requirement refinement
- export generation
- public deployment (Vercel / Render / Neon)
- extended E2E and UI test coverage

---

# Current Implemented Vertical Slice

**User Stories CSV Import MVP** — spec: [user-stories-import-mvp.md](docs/user-stories-import-mvp.md)

End-to-end flow currently working in local development:

~~~text
CSV upload (web /user-stories)
      |
      v
POST /api/user-stories/import  (multipart, validation per row)
      |
      v
Valid rows persisted via Prisma
      |
      v
PostgreSQL (UserStory table)
      |
      v
GET /api/user-stories  →  frontend table refresh
~~~

**What it demonstrates:** specification-first delivery, AI-assisted implementation, OpenAPI-documented API, pragmatic MVP backend module (`user-stories`), and a minimal React UI without advanced state libraries.

**Out of scope in this slice:** auth, sprint capacity, AI refinement, exports, multi-tenant, and async processing.

**E2E demo (Delivery 1):** step-by-step guide in [docs/DEMO.md](docs/DEMO.md) · sample file [fixtures/sample-user-stories.csv](fixtures/sample-user-stories.csv)

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

**API** — ensure `apps/api/.env` includes a valid `DATABASE_URL`, for example:

```env
DATABASE_URL=postgresql://deliveryops:deliveryops@localhost:5433/deliveryops_ai
```

Apply Prisma migrations if needed:

```bash
pnpm --filter api prisma migrate dev
```

**Web** — copy the example env and adjust if required:

```bash
cp apps/web/.env.example apps/web/.env
```

`apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000
```

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

Open the URL shown by Vite (e.g. `http://localhost:5173`) and navigate to `/user-stories`.

### 5. Quick validation

```bash
pnpm --filter api build && pnpm --filter api test
pnpm --filter web build
```

**Smoke test:** follow [docs/DEMO.md](docs/DEMO.md), import [fixtures/sample-user-stories.csv](fixtures/sample-user-stories.csv), and confirm rows appear in the table.

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

Includes:

- backend
- frontend
- database
- authentication
- sprint analysis
- AI refinement MVP

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