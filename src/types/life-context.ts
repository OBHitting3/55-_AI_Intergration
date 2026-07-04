export type LifeArea =
  | "health"
  | "work"
  | "finance"
  | "relationships"
  | "learning"
  | "creative"
  | "admin";

export type RoutineCadence = "daily" | "weekday" | "weekly";

export interface LifeGoal {
  id: string;
  title: string;
  area: LifeArea;
  targetDate?: string;
  status: "active" | "paused" | "done";
  notes?: string;
}

export interface LifeRoutine {
  id: string;
  title: string;
  cadence: RoutineCadence;
  timeOfDay?: string;
  area: LifeArea;
  enabled: boolean;
}

export interface LifePriority {
  rank: number;
  label: string;
  area: LifeArea;
}

export interface LifeContext {
  owner: string;
  timezone: string;
  northStar: string;
  priorities: LifePriority[];
  goals: LifeGoal[];
  routines: LifeRoutine[];
  version: number;
  updatedAt: string;
}

export interface ExternalIssueSnapshot {
  id: string;
  title: string;
  status: string;
  priority?: string;
  url?: string;
  dueDate?: string | null;
}

export interface ExternalProjectSnapshot {
  name: string;
  status: string;
  targetDate?: string | null;
  priority?: string;
  url?: string;
}

export interface LifeSnapshot {
  capturedAt: string;
  issues: ExternalIssueSnapshot[];
  projects: ExternalProjectSnapshot[];
  notes?: string[];
}

export interface LifeBriefingSection {
  title: string;
  items: string[];
}

export interface LifeBriefing {
  id: string;
  generatedAt: string;
  greeting: string;
  summary: string;
  sections: LifeBriefingSection[];
  topActions: string[];
  risks: string[];
}

export interface LifeRunResult {
  briefing: LifeBriefing;
  contextVersion: number;
  syncedToBridge: boolean;
}
