# ADR-001 - AI-first SDLC

## Status

Accepted

## Context

DeliveryOps AI es el proyecto final del máster AI4Devs (2026). El objetivo académico y de producto incluye demostrar un ciclo de vida de software asistido por IA de forma **mantenible y auditable**, no solo generar código rápido.

Había que definir cómo combinar velocidad de la IA con calidad de ingeniería: evitar endpoints o modelos inventados, mantener trazabilidad de prompts y asegurar que decisiones críticas pasen por revisión humana.

## Decision

Adoptar un **AI-first SDLC** con estas prácticas obligatorias en el repositorio:

- **Spec-first:** comportamiento nuevo documentado en `docs/` antes de implementación.
- **Human-in-the-loop:** aprobación humana de specs, límites de negocio y validación E2E antes de cerrar un slice.
- **Trazabilidad de prompts:** iteraciones relevantes registradas en `prompts.md` con IDs (`P-xxx`), objetivo y resultado verificable.
- **Documentación viva:** actualizar specs, README, DEMO y artefactos de arquitectura **en la misma iteración** que el código.
- **OpenAPI-first:** contratos REST visibles en Swagger como fuente ejecutable para humanos y LLMs.
- **Analizar antes de implementar:** leer spec, código existente y OpenAPI; no asumir features de documentos de visión no migrados a Prisma/código.

## Consequences

**Ventajas**

- Menor deriva entre intención, spec y código.
- Evidencia clara para entregas del máster (workflow IA + validación humana).
- Agentes y desarrolladores comparten el mismo orden de trabajo (spec → implementación → docs/prompts).

**Tradeoffs**

- Más overhead documental por slice que en un MVP “solo código”.
- Dependencia de disciplina del equipo para no saltarse spec-first o `prompts.md`.
- La IA acelera implementación, pero no sustituye juicio en límites (p. ej. tamaño CSV, import parcial).

## Related artifacts

- [AGENTS.md](../../AGENTS.md) — reglas operativas AI-first
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — principios AI-first aplicados
- [docs/07-ai-development-workflow.md](../07-ai-development-workflow.md) — visión del workflow
- [prompts.md](../../prompts.md) — registro de prompts (no modificar sin tarea explícita)
