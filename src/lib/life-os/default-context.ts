import type { LifeContext } from "@/types/life-context";

export const DEFAULT_LIFE_CONTEXT: LifeContext = {
  owner: "Karl",
  timezone: "America/New_York",
  northStar:
    "Build sovereign AI systems that compound leverage — karl-twin, AI Bridge Sync, and income streams — without sacrificing health or relationships.",
  priorities: [
    { rank: 1, label: "Ship karl-twin approval loop end-to-end", area: "work" },
    { rank: 2, label: "Keep AI Bridge Sync context current across LLMs", area: "work" },
    { rank: 3, label: "Move KRLX setup forward (RTX 5090 workstation)", area: "work" },
    { rank: 4, label: "Protect sleep and training blocks", area: "health" },
    { rank: 5, label: "Clear admin/finance backlog weekly", area: "admin" },
  ],
  goals: [
    {
      id: "goal-karl-twin-v1",
      title: "karl-twin v0.1: voice → approve → execute on Pixel",
      area: "work",
      status: "active",
      notes: "file.write + code.execute handlers live; memory + gmail next",
    },
    {
      id: "goal-bridge-sync",
      title: "AI Bridge Sync: single source of truth for LLM context",
      area: "work",
      status: "active",
    },
    {
      id: "goal-krlx",
      title: "Set up KRLX workstation (RTX 5090)",
      area: "work",
      targetDate: "2026-05-25",
      status: "active",
    },
  ],
  routines: [
    {
      id: "routine-morning",
      title: "Morning briefing + top 3 focus",
      cadence: "daily",
      timeOfDay: "08:00",
      area: "admin",
      enabled: true,
    },
    {
      id: "routine-midday",
      title: "Midday life check (cron agent)",
      cadence: "daily",
      timeOfDay: "13:00",
      area: "admin",
      enabled: true,
    },
    {
      id: "routine-evening",
      title: "Evening shutdown: log wins + set tomorrow",
      cadence: "daily",
      timeOfDay: "21:00",
      area: "admin",
      enabled: true,
    },
    {
      id: "routine-weekly-review",
      title: "Weekly review: goals, finances, inbox zero",
      cadence: "weekly",
      timeOfDay: "Sunday 10:00",
      area: "admin",
      enabled: true,
    },
  ],
  version: 1,
  updatedAt: new Date().toISOString(),
};
