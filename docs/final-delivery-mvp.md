# Final Delivery MVP Specification

Version: 1.0

Status: Draft

Owner: DeliveryOps AI Team

---

# 1. Context

DeliveryOps AI has successfully completed Delivery 1 and Delivery 2 of the AI4Devs/LIDR Master's project.

The application currently provides a functional MVP including:

- CSV User Story Import
- Sprint Capacity Management
- Sprint Absences Management
- Sprint Analysis
- JWT Authentication using HttpOnly Cookies
- Protected Routes
- Refinement MVP
- Excel Export
- Swagger API Documentation
- Unit Tests
- Playwright End-to-End Tests
- Continuous Integration

The objective of the Final Delivery is **not to add new business functionality**, but to transform the existing MVP into a deployable, demonstrable and production-ready application.

---

# 2. Objectives

The Final Delivery must provide:

- Public deployment
- Production-ready configuration
- Improved CI pipeline
- Complete technical documentation
- AI-first development evidence
- Final demonstration environment

---

# 3. Scope

## Included

### Infrastructure

- Deploy Backend API
- Deploy Frontend
- Deploy PostgreSQL database
- Configure production environment variables

### Quality

- PostgreSQL integration inside GitHub Actions
- Production validation
- Final smoke tests

### Documentation

- README
- PROJECT_CONTEXT
- ARCHITECTURE
- DEMO
- Prompts documentation

---

# 4. Out of Scope

The following items will NOT be implemented during Final Delivery:

- New business features
- Sprint Calendar
- Reporting dashboards
- AI providers integration
- Multi-tenancy
- RBAC
- Performance optimizations not required for deployment

---

# 5. Current Architecture

Current architecture already follows a vertical slice approach.

Frontend

React + Vite

↓

NestJS REST API

↓

Prisma ORM

↓

PostgreSQL

Authentication

JWT

↓

HttpOnly Cookie

↓

Protected Frontend Routes

Testing

Jest

Playwright

Swagger

GitHub Actions

---

# 6. Target Architecture

The production architecture extends the current one. **Hosting (decided, not deployed):**

- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

See [public-deployment-spec.md](public-deployment-spec.md) for the full deployment specification.

Frontend

↓

Public Hosting (Vercel)

↓

Backend API (Railway)

↓

Managed PostgreSQL (Railway)

↓

GitHub Actions

↓

Production validation

---

# 7. Work Packages

## WP1

Final deployment preparation

Expected output

- Production configuration
- Environment variables
- CORS validation

**Status (VS-01):** implemented in repository — `CORS_ORIGINS`, cookie env vars, `.env.example` updates, documentation alignment. Public deploy not executed.

---

## WP2

CI Improvements

Expected output

- PostgreSQL service
- Integration validation
- Green pipeline

**Status (VS-02):** PostgreSQL service container + `prisma migrate deploy` in `.github/workflows/ci.yml`. API integration tests in CI pending (GH-13).

---

## WP3

Public Deployment

Expected output

- Public frontend
- Public backend
- Public Swagger
- Public demo

---

## WP4

Documentation

Expected output

Updated documentation aligned with implementation.

---

# 8. Risks

## Authentication

Risk

Cross-origin cookies may fail in production.

Mitigation

Environment-specific cookie configuration (`AUTH_COOKIE_SECURE=true`, `AUTH_COOKIE_SAME_SITE=none` for Vercel + Railway cross-site). Documented in `apps/api/.env.example`; deploy validation pending.

---

## Database

Risk

Migration failures.

Mitigation

Use Prisma migrate deploy only.

---

## Deployment

Risk

Different providers may require different environment settings.

Mitigation

Validate deployment incrementally.

---

# 9. Validation Strategy

The Final Delivery will only be considered complete after validating:

- Backend build
- Frontend build
- Unit tests
- Existing Playwright suite
- Production login
- Protected routes
- CSV import
- Sprint Analysis
- Excel export
- Swagger
- Health endpoint

---

# 10. Definition of Done

The Final Delivery is considered finished when:

- MVP is publicly accessible.
- CI pipeline is green.
- PostgreSQL integration is validated.
- Documentation is fully aligned.
- Demo can be executed using only the public URLs.
- GitHub issues related to Final Delivery are closed.

---

# 11. AI-First Development

This project follows an AI-First Software Engineering approach as promoted during the AI4Devs/LIDR Master's programme.

The development process follows these principles:

- Spec-first development
- Vertical slices
- Incremental implementation
- Continuous validation
- Documentation-driven development
- Human-in-the-loop
- AI-assisted implementation using Cursor and ChatGPT
- Continuous code review before each commit
