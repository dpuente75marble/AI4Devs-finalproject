# DeliveryOps AI

AI-assisted SaaS platform for sprint planning, capacity analysis, requirement refinement, and operational delivery management.

![Status](https://img.shields.io/badge/status-MVP%20E2E%20slice-green)
![MVP](https://img.shields.io/badge/MVP-AI--assisted-success)
![License](https://img.shields.io/badge/license-Master%20Project-lightgrey)

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

**Planned for upcoming iterations:**

- GitHub Actions
- Vercel
- Render
- Neon PostgreSQL

---

# Architecture Overview

## Architecture Principles

The architecture follows:

- modular monolith design
- pragmatic Clean Architecture
- Hexagonal Architecture
- feature-based frontend organization
- AI-provider decoupling
- specification-first development
- AI-assisted engineering workflows

The platform uses a modular monolith architecture designed around pragmatic Clean Architecture and Hexagonal Architecture principles.

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
- AI rules
- development agents
- human validation

AI is used throughout the full software lifecycle:

- product definition
- architecture
- backlog generation
- implementation
- testing
- documentation

Human validation remains mandatory for all critical decisions.

---

# Documentation

## Product and Architecture

- [01-product-definition.md](docs/01-product-definition.md)
- [02-functional-specification.md](docs/02-functional-specification.md)
- [03-technical-design.md](docs/03-technical-design.md)
- [04-data-model.md](docs/04-data-model.md)

---

## Delivery and Planning

- [05-user-stories.md](docs/05-user-stories.md)
- [06-technical-backlog.md](docs/06-technical-backlog.md)
- [07-ai-development-workflow.md](docs/07-ai-development-workflow.md)
- [08-delivery-plan.md](docs/08-delivery-plan.md)
- [user-stories-import-mvp.md](docs/user-stories-import-mvp.md) — first vertical slice specification

---

## Prompt Engineering

- [prompts.md](prompts.md)

---

# Repository Structure

~~~text
AI4Devs-finalproject/
│
├── README.md
├── prompts.md
│
├── docs/
│   ├── 01-product-definition.md
│   ├── 02-functional-specification.md
│   ├── 03-technical-design.md
│   ├── 04-data-model.md
│   ├── 05-user-stories.md
│   ├── 06-technical-backlog.md
│   ├── 07-ai-development-workflow.md
│   └── 08-delivery-plan.md
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
- deployment and CI/CD
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