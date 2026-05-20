# ADR-003 - Backend NestJS + Prisma + PostgreSQL

## Status

Accepted

## Context

El MVP necesita una API REST mantenible, tipada, con persistencia relacional y documentación de contratos para el flujo E2E y para agentes de IA. El stack debía alinearse con el diseño del máster y soportar desarrollo local reproducible (Docker).

## Decision

Establecer la **foundation del backend** con:

- **NestJS 11** — modular monolith pragmático (módulo por feature, p. ej. `UserStoriesModule`).
- **Prisma 7** — ORM, migraciones y acceso vía `PrismaService` inyectable.
- **PostgreSQL 16** — base local con `docker-compose.yml` (puerto `5433`).
- **Swagger/OpenAPI** — documentación en `/api/docs`.
- Prefijo global `/api`, `ConfigModule`, health en `GET /api/health`.

Patrón MVP: el servicio llama a Prisma directamente (sin capa de repositorios abstracta ni dominio rico).

## Consequences

**Ventajas**

- Ecosistema maduro (Nest + Prisma) y curva razonable para el proyecto académico.
- Migraciones versionadas y modelo visible en `schema.prisma`.
- OpenAPI integrado con decoradores del controller.

**Tradeoffs**

- Acoplamiento servicio ↔ Prisma; refactors a arquitectura hexagonal completos pospuestos.
- PostgreSQL obliga Docker local; sin despliegue cloud en el slice actual.
- Import CSV usa `createMany` sin transacción global (import parcial por diseño).

## Related artifacts

- [ARCHITECTURE.md](../../ARCHITECTURE.md) — Backend, Data model, Prisma
- [apps/api/prisma/schema.prisma](../../apps/api/prisma/schema.prisma)
- [docker-compose.yml](../../docker-compose.yml)
- [docs/04-data-model.md](../04-data-model.md) — modelo objetivo (mayoría no migrada aún)
- [docs/03-technical-design.md](../03-technical-design.md)
