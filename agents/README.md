# Agents

Phase 1 ships these as empty modules that return `NOT_CONFIGURED`. None of
them run autonomously, on a schedule, or against live data yet. They exist
so Phase 2 has a place to land without restructuring the app.

- `scout/` — finds candidate product opportunities (Phase 2)
- `validator/` — checks trend/demand signals on a discovered opportunity (Phase 2)
- `sourcing/` — finds and quotes suppliers (Phase 2)
- `brand/` — generates brand concepts, names, offers (Phase 2)
- `creative/` — generates UGC scripts and campaign briefs (Phase 2)

See `docs/NEXT_STEPS.md` for what Phase 2 actually builds.
