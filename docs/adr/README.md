# Architecture Decision Records (ADR)

Registro ligero de decisiones arquitectónicas y de ingeniería **ya tomadas** en DeliveryOps AI (MVP LIDR / AI4Devs 2026).

Los ADRs complementan — no sustituyen — [ARCHITECTURE.md](../../ARCHITECTURE.md), [AGENTS.md](../../AGENTS.md) y las specs de slice en `docs/`.

---

## Índice

| ADR | Título | Estado |
|-----|--------|--------|
| [ADR-001](ADR-001-ai-first-sdlc.md) | AI-first SDLC | Accepted |
| [ADR-002](ADR-002-pnpm-monorepo.md) | Monorepo pnpm simple | Accepted |
| [ADR-003](ADR-003-nestjs-prisma-postgresql.md) | Backend NestJS + Prisma + PostgreSQL | Accepted |
| [ADR-004](ADR-004-vertical-slice-first.md) | Entrega por vertical slices | Accepted |
| [ADR-005](ADR-005-cursor-rules-governance.md) | Gobernanza Cursor: AGENTS.md + `.cursor/rules` | Accepted |

---

## Cuándo crear un nuevo ADR

Crear un ADR cuando se tome una decisión que:

- afecte estructura del repo, stack, contratos o forma de trabajar con IA;
- sea difícil de revertir o tenga tradeoffs claros;
- deba quedar explícita para humanos y agentes en iteraciones futuras.

**No hace falta ADR** para: bugs puntuales, renombres locales, ajustes de copy en UI o cambios ya cubiertos por una spec de slice.

### Proceso sugerido (MVP)

1. Numerar secuencialmente: `ADR-00N-titulo-corto.md`.
2. Mantener el formato: Status, Context, Decision, Consequences, Related artifacts.
3. Marcar estado: `Proposed` → `Accepted` (o `Superseded` / `Deprecated` si aplica).
4. Enlazar el ADR desde `ARCHITECTURE.md` o `AGENTS.md` solo si la decisión es estructural y recurrente.

---

## Principios de esta colección

- Documentar **lo implementado o acordado**, no roadmap aspiracional.
- ADRs breves (una pantalla); el detalle operativo vive en specs y código.
- Un ADR por decisión significativa; evitar duplicar contenido de `docs/user-stories-import-mvp.md` u otras mini-specs.
