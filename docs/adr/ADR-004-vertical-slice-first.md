# ADR-004 - Entrega por vertical slices

## Status

Accepted

## Context

Tras la foundation (monorepo, API, web shell, Prisma, health), el producto aún no demostraba valor de negocio E2E. Construir por capas horizontales (todo el dominio, luego toda la UI) retrasaría feedback y validación del máster.

Había que priorizar un flujo acotado que pruebe UI → API → base de datos con documentación y tests acotados.

## Decision

Entregar por **vertical slices pequeños**, cada uno con:

- Mini-spec en `docs/` antes del código.
- Flujo E2E demostrable en local.
- Módulo NestJS cohesivo por feature.
- Tests unitarios en lógica pura (parser, validadores).
- Actualización de `prompts.md` y guía de demo en la misma iteración.

**Primer slice implementado:** User Stories CSV Import (`POST/GET /api/user-stories`, UI `/user-stories`, modelo `UserStory`).

## Consequences

**Ventajas**

- Prueba temprana de integración real (CSV → PostgreSQL → tabla).
- PRs y prompts acotados; menor riesgo de scope creep.
- Patrón reutilizable documentado en spec y código de `user-stories`.

**Tradeoffs**

- Deuda transversal explícita (sin auth, sin `packages/shared`, dashboard/settings placeholder).
- Comportamientos de plataforma (dedup, paginación) se abordan slice a slice, no de golpe.
- Tests E2E del slice de import no automatizados aún (smoke manual + Swagger).

## Related artifacts

- [docs/user-stories-import-mvp.md](../user-stories-import-mvp.md) — spec del primer slice
- [docs/DEMO.md](../DEMO.md) — guía E2E
- [fixtures/sample-user-stories.csv](../../fixtures/sample-user-stories.csv)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — First vertical slice flow
- [prompts.md](../../prompts.md) — P-013 a P-016 (slice user-stories)
