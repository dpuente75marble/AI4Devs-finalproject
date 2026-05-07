# PROJECT_CONTEXT.md

# DeliveryOps AI - Project Context

## Project Type

AI-assisted SaaS platform for sprint planning, delivery operations, capacity analysis, and requirement refinement.

This project is the final Master project for AI4Devs 2026.

---

# Main Objective

Build a realistic end-to-end SaaS MVP capable of:

- importing User Stories from CSV
- managing sprint capacity
- handling absences and vacations
- analyzing sprint overload
- refining requirements using AI
- exporting operational reports

The project prioritizes:

- realistic implementation
- maintainable architecture
- AI-assisted engineering workflows
- free-tier deployment
- pragmatic scope control

---

# Technical Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Vitest
- Playwright

---

## Backend

- Node.js
- NestJS
- Prisma ORM
- PostgreSQL
- Swagger / OpenAPI
- Jest
- Supertest

---

## Infrastructure

- GitHub
- GitHub Actions
- Docker
- Docker Compose
- Vercel
- Render
- Neon PostgreSQL

---

# Architecture Principles

The project follows:

- modular monolith architecture
- pragmatic Clean Architecture
- Hexagonal Architecture
- feature-based frontend organization
- AI-provider decoupling
- specification-first development
- AI-assisted engineering workflows

---

# Frontend Principles

- small focused components
- feature-based organization
- server-driven state
- avoid unnecessary global state
- reusable UI components
- operational usability over visual complexity

---

# Backend Principles

- thin controllers
- business logic inside use cases
- Prisma isolated inside infrastructure
- domain independent from frameworks
- provider abstraction for AI integrations
- independently testable modules

---

# AI Engineering Workflow

The project uses:

- Cursor
- SpecKit-inspired workflow
- BDD
- selective TDD
- reusable prompts
- AI rules
- development agents
- human validation

AI assists the software lifecycle but does not replace engineering decisions.

---

# TDD Strategy

Selective pragmatic TDD is applied to:

- sprint calculations
- absence impact calculations
- CSV validation
- AI orchestration logic
- export validation logic

TDD follows:

~~~text
RED → GREEN → REFACTOR
~~~

---

# AI Strategy

The project differentiates:

## Development Agents

Used during engineering workflows:

- backend agent
- frontend agent
- testing agent
- documentation agent

---

## Product Agents

Potential future platform capabilities:

- refinement agent
- sprint planning assistant
- operational assistant

---

# Scope Control

The MVP intentionally excludes:

- microservices
- event-driven architecture
- advanced enterprise RBAC
- complex multi-tenancy
- autonomous production agents
- advanced OCR
- excessive analytics
- unnecessary enterprise complexity

---

# Repository Structure

~~~text
AI4Devs-finalproject/
│
├── README.md
├── PROJECT_CONTEXT.md
├── prompts.md
│
├── docs/
│
├── apps/
│   ├── web/
│   └── api/
│
└── packages/
    └── shared/
~~~

---

# Important Documentation

## Core Documentation

- docs/01-product-definition.md
- docs/02-functional-specification.md
- docs/03-technical-design.md
- docs/04-data-model.md

---

## Planning Documentation

- docs/05-user-stories.md
- docs/06-technical-backlog.md
- docs/07-ai-development-workflow.md
- docs/08-delivery-plan.md

---

## AI Documentation

- prompts.md

---

# Development Workflow

Recommended implementation order:

~~~text
1. Monorepo setup
2. Frontend/backend initialization
3. Prisma/PostgreSQL
4. Authentication
5. Sprint planning flow
6. CSV import
7. Sprint analysis
8. PDF upload
9. AI refinement
10. Export generation
11. Testing
12. Deployment
~~~

---

# Current Project Status

## Completed

- product definition
- architecture design
- technical backlog
- AI workflow documentation
- prompt documentation
- delivery planning

---

## Current Focus

- repository initialization
- monorepo structure
- technical foundation
- implementation preparation

---

# Important Constraints

- free-tier infrastructure only
- realistic Master project scope
- maintainable architecture
- no overengineering
- AI-first mindset
- implementation must remain achievable by a single developer

---

# Chat Strategy

This project may use multiple specialized chats:

- architecture
- backend
- frontend
- DevOps
- AI engineering

This file acts as persistent shared project context between chats and AI-assisted workflows.

---

# Human Validation Rule

Human validation is mandatory for:

- architecture decisions
- business logic
- security-sensitive logic
- AI-generated outputs
- testing strategy
- deployment decisions

AI outputs are treated as engineering assistance, not unquestionable truth.

---

# Project Vision

The final objective is to demonstrate:

- a realistic SaaS MVP
- modern AI-assisted engineering workflows
- maintainable architecture
- pragmatic engineering decisions
- AI Engineering best practices
- end-to-end software delivery capability