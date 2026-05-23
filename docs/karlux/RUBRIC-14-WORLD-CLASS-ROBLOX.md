# RUBRIC-14 — World-Class Roblox Experience Analysis

**Version:** 1.0 · **Product:** Palm Springs Paradise (KarLux)  
**Method:** Each criterion scores **1** (pass) or **0** (fail). **14/14** = launch-candidate vertical slice per Roblox production guidance, not “AAA live ops at 50k DAU” unless evidence supports it.

## Research basis (primary sources)

| Source | Used for |
|--------|----------|
| [Roblox Core loops](https://create.roblox.com/docs/production/game-design/core-loops) | Minute-to-minute → repeated actions → progression engine |
| [Roblox Onboarding / FTUE](https://create.roblox.com/docs/production/game-design/onboarding) | D1 retention, teach essentials, fast fun, goals |
| [Roblox Experiments](https://create.roblox.com/docs/production/experiments) | Iteration & funnel measurement (design intent) |
| Project `roblox-mcm.md` + `GameConfig.lua` | Art/performance contract |
| Industry pattern: server authority, DataStore session lock, rate limits | Security & economy |

---

## The 14 criteria

### R01 — Core loop is named and playable in one session
**Pass if:** Player can complete one full loop (claim home → earn currency → spend or compete → visible reward) in Play Solo without dev-only hacks.  
**Fail if:** Pillars exist in docs only or remotes error on use.

### R02 — Minute-to-minute interaction is clear
**Pass if:** HUD/nav tells player what to do next; at least one system updates every &lt;60s (garden tick, event timer, or economy feedback).  
**Fail if:** Player spawns with no affordance except free chat.

### R03 — Progression engine moves numbers up
**Pass if:** SunCoins and/or Prestige increase from gameplay (garden, fashion, shop, plot) with leaderstats sync.  
**Fail if:** Only `/coins` cheat grants currency in production path.

### R04 — FTUE exists (not a single toast)
**Pass if:** First-session script: ≥3 guided steps (teach control + first goal + “what’s next”) per Roblox onboarding doc.  
**Fail if:** Only “Welcome” notification.

### R05 — Retention hooks are designed (daily / events)
**Pass if:** Timed fashion/events OR weekly theme config OR documented day-phase loop in `src/` (not only `staging/`).  
**Fail if:** No scheduled re-engagement.

### R06 — Server authority on economy & inventory
**Pass if:** All grants/debits server-side; client cannot set currency; rate limits on spend path.  
**Fail if:** Client fires unvalidated rewards.

### R07 — Exploit surface gated for production
**Pass if:** Dev/test chat commands disabled outside Studio OR admin allowlist; `TriggerEvent` not open in live.  
**Fail if:** `/coins` works in published experience.

### R08 — Performance budget enforced
**Pass if:** `StreamingEnabled`; documented part cap; `/partcount` or builder sums; homes built on demand.  
**Fail if:** Uncapped generation or no measurement.

### R09 — Monetization path is real (even if IDs unset)
**Pass if:** `ProcessReceipt` + game pass checks wired to gameplay (multiplier/perk), not dead code.  
**Fail if:** Pass perks only print chat.

### R10 — Persistence hot path is coherent
**Pass if:** Join load + leave save; plot/shop IDs in DataStore; rehydrate world flags on join.  
**Fail if:** Saved `plotId` but world shows unclaimed plot.

### R11 — Cold path (Supabase) is schema-aligned
**Pass if:** Table names match migration; writers exist OR explicit mock-only doc; Secrets path documented.  
**Fail if:** Client calls wrong table names silently.

### R12 — Art direction is locked and testable
**Pass if:** `GameConfig.Colors` + MCM rules; sky/lighting in project; single-story constraint documented.  
**Fail if:** Competing palettes in code.

### R13 — Analytics / observability hook
**Pass if:** `AnalyticsService` or Supabase `analytics_events` queue OR structured server logs for economy actions.  
**Fail if:** Zero telemetry design.

### R14 — Developer pipeline enables iteration
**Pass if:** Rojo `serve` works (fixed `default.project.json`); verify script; rubric + audit trail in repo.  
**Fail if:** `rojo serve` class conflict blocks all dev.

---

## Scoring protocol (internal iteration)

1. Score all 14 with **evidence** (file path or Studio behavior).  
2. Any **0** → list blocking fix.  
3. Re-score only after fix merged or patch documented in `palm-springs-excellence/`.  
4. **Five consecutive 14/14** required before calling “RUBRIC satisfied.”  
5. Do not inflate: “planned” = **0** until shipped in `src/` or wired config.

---

## Phase mapping

| Phase | Target score | Meaning |
|-------|--------------|---------|
| Prototype | ≥10/14 | Playable vertical slice |
| Beta | ≥12/14 | Rehydration + FTUE + prod gates |
| Live | 14/14 + live IDs + experiments | D1 retention tuning |
