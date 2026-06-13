# PRD Blueprint — Palm Springs Paradise (KarLux)

**Purpose:** Fill every `[BRACKET]` section to produce your final **Product Requirements Document**.  
**Sources to pull from:** `README.md`, `docs/karlux/`, `src/shared/GameConfig.lua`, `.cursor/rules/roblox-mcm.md`, PR #24 staging.  
**Governance:** KarLux **10-80-10** — PRD describes *what*; `staging/` holds *how* until Karl/Eddie approve merge to `src/`.

---

## How to use this blueprint

1. Copy this file to `docs/karlux/PRD-v1.0.md` (or Notion/Google Doc).
2. Replace every `[BRACKET]` with a concrete answer. Delete helper text in *italics*.
3. Mark sections **MUST** / **SHOULD** / **COULD** (MoSCoW) per release slice.
4. Link each requirement to a **REQ-ID** (e.g. `PSP-ECON-001`) for tickets and merge checklists.
5. Get sign-off from **Karl + Eddie** before treating PRD as locked.

---

## Document control

| Field | Your answer |
|-------|-------------|
| **Product name** | Palm Springs Paradise |
| **Entity** | KarLux LLC / Iron Forge Studios |
| **PRD version** | `[e.g. 1.0-draft]` |
| **Author** | `[Name]` |
| **Reviewers** | Karl, Eddie, `[Manus/Cursor as needed]` |
| **Status** | Draft / In review / Approved |
| **Last updated** | `[YYYY-MM-DD]` |
| **Related repos** | [Gemini-discovers-Diamonds](https://github.com/OBHitting3/Gemini-discovers-Diamonds) · branch `cursor/karlux-foundation-292d` · PR #24 |
| **Target platforms** | Roblox (PC, mobile, console) · Creator Hub publish |
| **Release slices** | `[MVP / Vertical Slice 1 / Live ops]` |

---

## 1. Executive summary (1 page max)

### 1.1 One-liner
*[Template]*  
**Palm Springs Paradise** is a `[genre]` Roblox experience where `[primary player fantasy]` in a `[setting + art style]` world.

**Your one-liner:**  
`[WRITE HERE]`

### 1.2 Problem
What player or business problem does this solve?

| Stakeholder | Pain today | How PSP fixes it |
|-------------|------------|------------------|
| Players (8–16+) | `[e.g. lack of creative social sims with taste]` | `[e.g. MCM decorating + fashion without combat grind]` |
| KarLux / studio | `[e.g. no owned IP loop on Roblox]` | `[e.g. boutique economy + events drive retention]` |
| Partners (optional) | `[Modernism Week, brands]` | `[webhooks, themed events]` |

### 1.3 Solution summary
Bullet the **four pillars** (from README) in player language:

1. **Desert Dream Homes** — `[claim plot, build MCM home, Vibes Score — define]`  
2. **Poolside Fashion & Runway** — `[events, voting, runway — define]`  
3. **Community Desert Gardens** — `[16 plots, water/harvest — define]`  
4. **Boutique Economy** — `[El Paseo shops, trade — define]`

### 1.4 Success definition (12 months)
| Metric | Target | How measured |
|--------|--------|--------------|
| DAU / CCU | `[e.g. 50k DAU aspirational]` | Roblox Analytics |
| Session length | `[e.g. 18 min median]` | Analytics |
| D1 / D7 retention | `[e.g. 40% / 15%]` | Analytics |
| Revenue (Robux) | `[e.g. 1.8M over 6 mo — or revise]` | Developer stats |
| UGC / social | `[e.g. % players with decorated home]` | Custom events |
| Safety / compliance | `[Belgium/NL no lootboxes]` | Design audit |

### 1.5 Non-goals (v1)
List what you are **not** building in the first shipped slice:

- `[ ] Battle royale / combat loop`  
- `[ ] Cross-universe economy (unless defined)`  
- `[ ] Full Tarmac CI pipeline before Studio import OK`  
- `[ ] Live Supabase without Secrets in production`  
- `[OTHER]`

---

## 2. Vision & positioning

### 2.1 Vision statement
`[3–5 years: what does Palm Springs Paradise become on Roblox and off-platform?]`

### 2.2 Positioning statement
For **`[target player]`** who wants **`[job to be done]`**, Palm Springs Paradise is a **`[category]`** that **`[key benefit]`**. Unlike **`[competitor A/B]`**, we **`[differentiator]`**.

### 2.3 Brand & art direction (locked — cite rules)
Reference: `.cursor/rules/roblox-mcm.md`, `GameConfig.Colors`

| Rule | Requirement | REQ-ID |
|------|-------------|--------|
| Architecture | Single-story MCM only; flat/butterfly roof; max 12 studs | `PSP-ART-001` |
| Sky | Bright blue gradient #87CEEB → #E0F0FF; ClockTime 12 default | `PSP-ART-002` |
| Night | Script toggle only for events; auto-revert | `PSP-ART-003` |
| Performance | &lt;5k parts, StreamingEnabled, 30fps mobile, 40 players | `PSP-ART-004` |
| Economy | Server-authoritative; no client-trusted currency | `PSP-ART-005` |

**Open PRD decisions:**  
- `[ ] Exact monetization ethics (direct purchase only — confirm SKUs]`  
- `[ ] Licensed real-world brands vs fictional MCM`

---

## 3. Target users & personas

### 3.1 Primary segments
| Persona | Age | Motivation | Session behavior | Monetization likelihood |
|---------|-----|------------|------------------|-------------------------|
| **Decorator** | `[9–14]` | Home flex, Vibes Score | Afternoon loop | `[low/medium]` |
| **Fashionista** | `[10–16]` | Runway, outfits | Evening loop | `[medium/high]` |
| **Entrepreneur** | `[12–17]` | Shop profit, trade | Morning + evening | `[high]` |
| **Social hangout** | `[8–13]` | Friends, garden | All phases | `[low]` |

### 3.2 Jobs to be done
| When I… | I want to… | So I can… | Feature area |
|---------|------------|-----------|--------------|
| `[join first time]` | `[onboard]` | `[feel welcome]` | Tutorial / plot claim |
| `[log in daily]` | `[tend garden]` | `[earn currency]` | GardenService |
| `[evening]` | `[enter fashion event]` | `[win status]` | FashionService |
| `[...]` | | | |

### 3.3 Accessibility & safety
- Chat / moderation: `[Roblox default + custom?]`  
- COPPA / regional: `[age gates, Belgium/NL compliance]`  
- Content Shield / external validation: `[link content-shield repo if in scope]`

---

## 4. Core experience — game design

### 4.1 Core loop (day phases)
*Staged in PR #24: `DayPhaseConfig`, `CoreLoopService`, `DayPhaseController`*

| Phase | Server time (local) | Player verbs | Systems involved | REQ-ID |
|-------|---------------------|--------------|------------------|--------|
| **Morning** | `[6:00–11:00]` | Garden, shop stock | GardenService, ShopService | `PSP-LOOP-001` |
| **Afternoon** | `[11:00–17:00]` | Decorate, outfits | PlotService, Fashion prep | `PSP-LOOP-002` |
| **Evening** | `[17:00–22:00]` | Runway, trade, festivals | FashionService, EventService | `PSP-LOOP-003` |

**Acceptance criteria (vertical slice):**  
- [ ] Server logs phase transitions  
- [ ] HUD shows phase + suggested action  
- [ ] `/fashion` gated by evening (configurable)  
- [ ] Night key only when `DayPhaseController:isNightAllowed()`

### 4.2 Feature matrix (MoSCoW)

| Feature | Description | Priority | Status in repo | Owner lane |
|---------|-------------|----------|----------------|------------|
| Plot claim + 4 home styles | Kaufmann, Frey, Wexler, Neutra | MUST | `src/` | Cursor |
| Shared desert garden (16 plots) | Plant, water, wilt, harvest | MUST | `src/` | Cursor |
| Fashion runway + voting | Themed events | MUST | `src/` | Cursor |
| El Paseo boutiques | Buy/sell/trade | MUST | `src/` | Cursor |
| Day-phase orchestrator | Morning/Afternoon/Evening | MUST | `staging/` PR #24 | Cursor → merge |
| AssetRegistry + imports | slug → rbxassetid | SHOULD | `staging/` | Manus |
| Weekly events / Modernism Week | EventService themes | SHOULD | `src/` partial | Cursor |
| Supabase cold path | Analytics, signups | COULD | `staging/supabase/` | Manus |
| n8n webhooks | CF7, scheduling | COULD | placeholders | Manus |
| Game Pass / VIP | GamePassService | `[define]` | `src/` | Karl decision |

### 4.3 Economy & currencies

| Currency | Scope | Faucets | Sinks | Anti-exploit |
|----------|-------|---------|-------|--------------|
| **Coins** (or rename) | Per-player | `[garden, races, rent…]` | `[taxes, fees, decor]` | Server authority |
| **Prestige / Vibes** | Social score | `[decor quality]` | `[none]` | `[formula]` |

**Pricing / inflation:**  
- Dynamic pricing: `[yes/no — PalmLuxe prototype has Lotka-Volterra; PSP uses?]`  
- Starting balance: `[from GameConfig]`  
- Trade tax: `[ % ]`

### 4.4 Progression & retention
| System | Unlock cadence | Purpose |
|--------|----------------|---------|
| Plot tiers | `[...]` | |
| Garden plots | `[1–16 community]` | |
| Shop ownership | `[...]` | |
| Fashion rank | `[...]` | |

### 4.5 Social & multiplayer
- Max players per server: `[40]`  
- Trading: server-mediated atomic transfers — `AssetBridge` pattern or PSP equivalent  
- Leaderboards: `LeaderboardService` — metrics: `[coins, vibes, …]`

### 4.6 Monetization (non-predatory)
| SKU type | Example | Robux | Rules |
|----------|---------|-------|-------|
| Cosmetic | Jeep skin, outfit pack | `[400]` | No lootboxes |
| VIP | 2× income | `[800]` | Direct purchase |
| Limited build | Custom home slot | `[1600]` | Limited quantity |

**Compliance:** Belgium/NL — document in PRD legal appendix.

---

## 5. Content & world

### 5.1 Places / universe map
| Place | In-world name | Primary loop | Place ID | Status |
|-------|---------------|--------------|----------|--------|
| Hub / main | `[Palm Springs town]` | All | `[TBD]` | |
| `[Future place]` | | | | |

### 5.2 Asset pipeline
Reference: `docs/karlux/01-asset-taxonomy-tree.md`

| Stage | Location | Agent | Output |
|-------|----------|-------|--------|
| Raw import | `vendor-imports/_incoming/` | Manus | Folder + LICENSE |
| Manifest | `vendor-imports/_manifests/asset-index.yaml` | Manus | slug → rbxassetid |
| Registry | `AssetRegistry.lua` | Cursor | Runtime lookup |
| Studio | ReplicatedStorage/Assets | Karl/Eddie | Published |

**PRD content budget:**

| Category | Target count v1 | Poly budget each |
|----------|-----------------|------------------|
| Furniture | `[e.g. 40]` | `[studs]` |
| Fashion | `[e.g. 30]` | |
| Plants | `[e.g. 20]` | |

### 5.3 Audio / UI
- UI: programmatic ScreenGui, mobile-first — `HUDTemplate.lua`  
- Sound list: `[pool ambience, UI clicks, runway music]`  
- Localization: `[en-US only v1?]`

---

## 6. Technical requirements

### 6.1 Architecture diagram
*Copy or adapt from `docs/karlux/05-unified-dev-stack.md`*

```
[IDE: Cursor/VS Code] → Git → Rokit (Rojo, Wally, Selene, StyLua) → Studio
Studio → DataStore (hot) + Supabase (cold) + HttpService webhooks
```

### 6.2 Module map (production `src/`)
| Layer | Modules | Responsibility |
|-------|---------|----------------|
| `shared` | GameConfig, ItemCatalog, RemoteManager, SupabaseClient, Types | Constants, remotes |
| `server/Services` | Economy, Plot, Garden, Fashion, Shop, Event, Persistence, Leaderboard, GamePass | Authority |
| `server/Builders` | Environment, Home, Storefront, Garden, Runway | Procedural + templates |
| `client/Controllers` | UI, Plot, Garden, Fashion, Shop, NightToggle | Input + display |
| `staging` (pre-merge) | CoreLoopService, DayPhase*, AssetRegistry | Gated slice |

### 6.3 Data & persistence
| Store | Data | TTL / schema | Failure mode |
|-------|------|--------------|--------------|
| DataStore `PlayerData` | Profile, inventory, trust | ProfileService wrapper | Retry + session lock |
| Supabase | Cold path, signups | `staging/supabase/migrations/` | Mock in Play Solo |
| MessagingService | Cross-place sync | `[if multi-place]` | |

### 6.4 Performance SLAs
| Metric | Target | Test method |
|--------|--------|-------------|
| Part count | &lt; 5,000 | `/partcount` |
| Mobile FPS | ≥ 30 | Studio device emulator |
| DataStore op | &lt; 150ms p95 | Studio + metrics |
| Rojo sync | serve-based dev loop | Task: Rojo Serve |

### 6.5 Security & anti-exploit
| Threat | Mitigation | REQ-ID |
|--------|------------|--------|
| Coin dupe | Server authority, atomic UpdateAsync | `PSP-SEC-001` |
| Speed / teleport | `[define]` | |
| Inventory dup | Rolling hash / trust score | `[if ported from PalmLuxe]` |

### 6.6 Toolchain (dev)
| Tool | Version pin | Owner |
|------|-------------|-------|
| Rokit | `staging/toolchain/rokit.toml` | Cursor |
| Rojo | 7.4.x | Cursor |
| Wally | package `karlux/palm-springs-paradise` | Cursor |
| Selene / StyLua | lint + format | CI |
| Blender | FBX → vendor-imports | Manus |

### 6.7 Agent lanes (who builds what)
| Agent | Owns | Must not |
|-------|------|----------|
| **Cursor** | `src/`, `staging/` Luau, Rojo, PRs | Publish secrets, bulk rbxassetid |
| **Manus** | vendor-imports, Supabase push, secrets | Change GameConfig palette |
| **Karl/Eddie** | Merge, Studio publish, SKU pricing | — |

---

## 7. User stories & acceptance criteria

Use format: **As a** `[persona]`, **I want** `[action]`, **so that** `[outcome]`.

### 7.1 Onboarding
| ID | Story | Acceptance criteria | Priority |
|----|-------|---------------------|----------|
| PSP-US-001 | As a new player, I want a plot tutorial, so I claim my first home. | `[ ]` `/claimplot 1` works; home spawns MCM rules | MUST |

### 7.2 Garden
| ID | Story | Acceptance criteria | Priority |
|----|-------|---------------------|----------|
| PSP-US-010 | As a gardener, I want to water plants in Morning, so crops grow faster. | `[ ]` multiplier from DayPhaseConfig | MUST |

### 7.3 Fashion
| ID | Story | Acceptance criteria | Priority |
|----|-------|---------------------|----------|
| PSP-US-020 | As a player, I want to walk the runway Evening, so I can win votes. | `[ ]` FashionService + controller | MUST |

### 7.4 Economy
| ID | Story | Acceptance criteria | Priority |
|----|-------|---------------------|----------|
| PSP-US-030 | As a shop owner, I want to list items on El Paseo, so I earn coins. | `[ ]` ShopService buy/sell | MUST |

*Add 15–30 stories minimum for a shippable PRD.*

---

## 8. Analytics & telemetry

| Event name | When fired | Properties | Use |
|------------|------------|------------|-----|
| `session_start` | Join | `userId`, `device` | Retention |
| `phase_change` | CoreLoopService | `phase`, `serverTime` | Loop validation |
| `purchase` | Receipt | `sku`, `robux` | Revenue |
| `[custom]` | | | |

**Dashboards:** Roblox Analytics + `[Supabase / external]`

---

## 9. Release plan

### 9.1 Phases
| Phase | Scope | Exit criteria | Target date |
|-------|-------|---------------|-------------|
| **0 — Foundation** | PR #24 merge, toolchain, docs | `verify.ps1` green; Studio connect | `[DATE]` |
| **1 — Vertical slice** | Day phase + HUD merge to `src/` | Play Solo phase log + HUD | `[DATE]` |
| **2 — Content** | AssetRegistry populated | 20 furniture slugs live | `[DATE]` |
| **3 — Beta** | Friends & family | 100 CCU test | `[DATE]` |
| **4 — Public** | Creator Hub publish | KPIs §1.4 tracking | `[DATE]` |

### 9.2 Dependencies
| Dependency | Owner | Blocks |
|------------|-------|--------|
| Roblox place/universe IDs | Karl | Publish |
| Manus asset-index | Manus | AssetRegistry |
| Anthropic/E2B (if karl-twin) | Optional | AI iteration |
| Supabase project | Manus | Cold path live |

### 9.3 Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `rojo build` class conflict | High | Med | Use `rojo serve` |
| Part budget exceeded | Med | High | `/partcount` in CI |
| Supabase without Secrets | Med | Low | Mock mode documented |

---

## 10. Legal, compliance & ops

- Roblox ToS / advertising disclosure  
- UGC policy for player-placed decor  
- Refund / support process  
- `[IP: MCM inspired — not trademark infringement note]`

---

## 11. Open questions log

| # | Question | Owner | Decision by | Resolution |
|---|----------|-------|-------------|------------|
| 1 | Merge PR #24 as-is or split toolchain vs gameplay? | Eddie | | |
| 2 | Single place vs universe for v1? | Karl | | |
| 3 | Coin name: Coins vs Luxe Coins vs Palm Bucks? | Karl | | |
| 4 | | | | |

---

## 12. Appendices

### A. Glossary
| Term | Definition |
|------|------------|
| MCM | Mid-Century Modern |
| Vibes Score | `[define]` |
| 10-80-10 | 10% plan, 80% staged build, 10% polish — merge gate |
| Cold path | Supabase / async persistence |
| Hot path | DataStore session data |

### B. Reference commands (Studio)
```
/coins 5000
/claimplot 1
/buildhouse kaufmann
/status
/partcount
/fashion
```

### C. Traceability matrix (fill last)
| REQ-ID | PRD § | Module / file | Test | Release phase |
|--------|-------|---------------|------|---------------|
| PSP-LOOP-001 | 4.1 | CoreLoopService | Play Solo log | 1 |
| PSP-ART-001 | 2.3 | roblox-mcm.md | Visual review | 0 |

### D. Links
- PR #24: https://github.com/OBHitting3/Gemini-discovers-Diamonds/pull/24  
- Merge guide: `docs/karlux/03-vertical-slice-merge-guide.md`  
- Windows install: `docs/karlux/07-step-by-step-install-windows.md`  
- Handoff: `docs/karlux/HANDOFF-condensed.md`

---

## PRD completion checklist

- [ ] All `[BRACKET]` fields replaced  
- [ ] MoSCoW priorities on every feature  
- [ ] REQ-IDs assigned and matrix started  
- [ ] Art rules referenced, not duplicated inconsistently  
- [ ] Monetization reviewed for regional compliance  
- [ ] Karl + Eddie signed §1 and §9  
- [ ] Open questions §11 empty or deferred with dates  

**When complete:** Store as `docs/karlux/PRD-v1.0.md` in Gemini-discovers-Diamonds and link from README.
