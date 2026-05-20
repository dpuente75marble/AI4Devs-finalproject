# ADR-002 - Monorepo pnpm simple

## Status

Accepted

## Context

El MVP requiere frontend (`apps/web`), backend (`apps/api`) y un paquete compartido reservado (`packages/shared`) en un solo repositorio, con lockfile único y scripts coherentes para desarrollo local y entregas del máster.

Había que elegir herramienta de monorepo sin introducir complejidad de build graph, caching distribuido o convenciones enterprise que el equipo aún no necesita.

## Decision

Usar **pnpm workspaces** con configuración mínima:

- `pnpm-workspace.yaml` con `apps/*` y `packages/*`.
- Scripts raíz en `package.json`: `dev:api`, `dev:web`, `build`, `test`, `lint` vía `pnpm --filter` / `pnpm -r`.
- **No** adoptar Nx, Turborepo ni Lerna en esta fase del MVP.

## Consequences

**Ventajas**

- Setup rápido y transparente para AI4Devs.
- Un solo `pnpm install` y dependencias hoisted eficientemente.
- Filtros por app (`pnpm --filter api`, `pnpm --filter web`) suficientes para el alcance actual.

**Tradeoffs**

- Sin pipeline de build/cache entre paquetes; builds recursivos manuales.
- Sin generadores ni boundaries enforcement de Nx.
- `packages/shared` existe como placeholder; tipos FE/BE siguen duplicados hasta una decisión explícita futura.

## Related artifacts

- [pnpm-workspace.yaml](../../pnpm-workspace.yaml)
- [package.json](../../package.json)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — sección Monorepo structure
- [README.md](../../README.md) — setup local
