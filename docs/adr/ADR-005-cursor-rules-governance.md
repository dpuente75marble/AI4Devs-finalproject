# ADR-005 - Gobernanza Cursor: AGENTS.md + `.cursor/rules`

## Status

Accepted

## Context

El desarrollo asistido por Cursor y LLMs requiere contexto persistente y reglas ejecutables; sin ellas, los agentes tienden a inventar APIs, ampliar el modelo de datos o omitir spec-first y validación humana.

Había que fijar una gobernanza mínima, versionada en el repo, alineada con el alcance **realmente implementado** del MVP.

## Decision

Usar dos capas complementarias de gobernanza para Cursor/AI-assisted development:

1. **[AGENTS.md](../../AGENTS.md)** — contexto persistente: propósito, alcance implementado vs no implementado, stack, workflow AI-first, reglas de testing, PR y limitaciones del MVP.
2. **`.cursor/rules/*.mdc`** — reglas por ámbito con `alwaysApply` o globs:
   - `project-base.mdc` — workflow y prohibiciones globales
   - `architecture.mdc`, `nestjs.mdc`, `react.mdc`, `testing.mdc`, `documentation.mdc` — convenciones por capa

Las reglas referencian AGENTS, ARCHITECTURE y la spec del slice activo; no duplican specs de dominio completas.

## Consequences

**Ventajas**

- Contexto estable para cada sesión de agente sin re-explicar el MVP.
- Límites explícitos (no auth, no IA, no inventar endpoints) reducen alucinaciones.
- Reglas evolucionables por archivo sin tocar código de aplicación.

**Tradeoffs**

- Mantener AGENTS y rules sincronizados con el código requiere disciplina.
- Reglas demasiado largas pueden competir con el contexto del modelo; se priorizan reglas cortas y enlaces a docs.
- `prompts.md` sigue siendo inmutable salvo instrucción explícita del usuario (regla reforzada en rules y AGENTS).

## Related artifacts

- [AGENTS.md](../../AGENTS.md)
- [.cursor/rules/](../../.cursor/rules/) — `project-base.mdc`, `architecture.mdc`, `nestjs.mdc`, `react.mdc`, `testing.mdc`, `documentation.mdc`
- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [docs/07-ai-development-workflow.md](../07-ai-development-workflow.md) — estrategia de AI rules (visión)
