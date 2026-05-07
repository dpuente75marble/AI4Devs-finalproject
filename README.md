# DeliveryOps AI

AI-assisted SaaS platform for sprint planning, capacity analysis, requirement refinement, and operational delivery management.

![Status](https://img.shields.io/badge/status-in%20progress-blue)
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

- React
- TypeScript
- Vite
- Tailwind CSS
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

- Jest
- Vitest
- React Testing Library
- Playwright

---

## Infrastructure

- GitHub Actions
- Docker
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

## Completed

- product definition
- architecture design
- data model
- technical backlog
- AI workflow
- delivery planning
- prompt engineering documentation

---

## In Progress

- monorepo initialization
- frontend foundation
- backend foundation
- database initialization

---

## Planned

- authentication
- CSV import
- sprint analysis
- AI refinement
- export generation
- deployment
- E2E testing

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