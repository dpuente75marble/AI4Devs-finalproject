---
name: Feature request
about: Propose a vertical slice or MVP capability (spec-first)
title: "[Feature] "
labels: enhancement
assignees: ""
---

## Summary

Brief description of the capability or vertical slice. What user or delivery problem does it address?

## Business value

Why does this matter for DeliveryOps AI / LIDR MVP? Who benefits (PM, Tech Lead, Delivery Manager)?

## Scope

### In scope

- 

### Out of scope

- 

> Prefer **one E2E vertical slice** per issue. Avoid bundling multiple domains (auth + IA + exports) in a single request.

## Acceptance criteria

- [ ] 
- [ ] 
- [ ] 

> Use testable, observable outcomes (API contract, UI behavior, data persisted). Align with BDD-style scenarios when possible.

## Technical notes

- Affected apps: `apps/api` / `apps/web` / both
- API endpoints (if any): 
- Prisma / data model impact: 
- OpenAPI / Swagger updates required: yes / no

## Risks / dependencies

- Blockers or upstream specs: 
- Known tradeoffs (performance, partial import, etc.): 

## Related docs / specs / ADRs

- Spec (create or link before implementation): `docs/...`
- [docs/adr/README.md](../../docs/adr/README.md) — ADR impact (new ADR needed? which ADR applies?)
- [AGENTS.md](../../AGENTS.md) · [ARCHITECTURE.md](../../ARCHITECTURE.md)
- Related user story / backlog: `docs/05-user-stories.md` · `docs/06-technical-backlog.md`
