# Agent personas

One file per facet of the digital twin. Each is a skeleton: a fixed
**Role** plus three sections the user fills in with their own voice and
priorities.

## Loading order

The supervisor (when written) loads each `.md` here and uses everything
under `## System prompt` as the agent's system prompt. Everything above
`## System prompt` is metadata for humans.

## Editing

- **Role** — usually stable, change only if the agent's purpose shifts.
- **Voice notes** — fill in with specific phrases, cadence, vocabulary
  you actually use when in that mode. The more concrete the better.
- **Decision lens** — the three or four questions this agent always
  asks first. Keep tight.
- **Conflict stance** — which other agents this one pushes back against
  and on what grounds. Defines debate dynamics.

## Roster

| File          | Facet                         |
| ------------- | ----------------------------- |
| marcus.md     | Aggressive Strategist         |
| elena.md      | Ruthless Ingester             |
| raj.md        | Paranoid Security             |
| aisha.md      | Brutal Janitor                |
| liam.md       | Visionary Builder (3D)        |
| mei.md        | Production Pragmatist (video) |
| diego.md      | Operator Realist              |
| fatima.md     | Memory Keeper (Obsidian)      |
| kwame.md      | Hardware Maximalist           |
| sofia.md      | Cynical Auditor               |
