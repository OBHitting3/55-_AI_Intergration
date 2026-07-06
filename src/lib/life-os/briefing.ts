import type {
  LifeBriefing,
  LifeContext,
  LifeSnapshot,
  ExternalIssueSnapshot,
  ExternalProjectSnapshot,
} from "@/types/life-context";

function formatDate(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(iso));
}

function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function openIssues(issues: ExternalIssueSnapshot[]): ExternalIssueSnapshot[] {
  return issues.filter(
    (i) => !["done", "completed", "canceled", "cancelled"].includes(i.status.toLowerCase())
  );
}

function overdueProjects(projects: ExternalProjectSnapshot[]): ExternalProjectSnapshot[] {
  return projects.filter((p) => isOverdue(p.targetDate));
}

export function generateBriefing(
  context: LifeContext,
  snapshot: LifeSnapshot
): LifeBriefing {
  const now = snapshot.capturedAt;
  const open = openIssues(snapshot.issues);
  const overdue = overdueProjects(snapshot.projects);
  const activeGoals = context.goals.filter((g) => g.status === "active");
  const enabledRoutines = context.routines.filter((r) => r.enabled);
  const topPriorities = [...context.priorities].sort((a, b) => a.rank - b.rank).slice(0, 3);

  const topActions: string[] = [];
  const risks: string[] = [];

  for (const p of overdue) {
    risks.push(`Project "${p.name}" is past target date (${p.targetDate})`);
    topActions.push(`Review or reschedule: ${p.name}`);
  }

  for (const g of activeGoals) {
    if (g.targetDate && isOverdue(g.targetDate)) {
      risks.push(`Goal overdue: ${g.title} (target ${g.targetDate})`);
    }
  }

  if (open.length > 0) {
    const sample = open.slice(0, 3).map((i) => i.title);
    topActions.push(`Triage ${open.length} open issue(s): ${sample.join("; ")}`);
  }

  for (const priority of topPriorities) {
    topActions.push(`#${priority.rank}: ${priority.label}`);
  }

  const sections = [
    {
      title: "North star",
      items: [context.northStar],
    },
    {
      title: "Active goals",
      items:
        activeGoals.length > 0
          ? activeGoals.map((g) => {
              const due = g.targetDate ? ` (target ${g.targetDate})` : "";
              return `${g.title}${due}`;
            })
          : ["No active goals configured."],
    },
    {
      title: "Today's routines",
      items: enabledRoutines
        .filter((r) => r.cadence === "daily" || r.cadence === "weekday")
        .map((r) => `${r.timeOfDay ?? "anytime"} — ${r.title}`),
    },
    {
      title: "Work queue",
      items:
        open.length > 0
          ? open.map((i) => {
              const pri = i.priority ? ` [${i.priority}]` : "";
              return `${i.id}: ${i.title}${pri}`;
            })
          : ["No open issues in snapshot."],
    },
    {
      title: "Projects",
      items:
        snapshot.projects.length > 0
          ? snapshot.projects.map((p) => {
              const due = p.targetDate ? ` → ${p.targetDate}` : "";
              const flag = isOverdue(p.targetDate) ? " ⚠️ overdue" : "";
              return `${p.name} (${p.status})${due}${flag}`;
            })
          : ["No projects in snapshot."],
    },
  ];

  if (snapshot.notes?.length) {
    sections.push({ title: "Agent notes", items: snapshot.notes });
  }

  const summaryParts = [
    `${activeGoals.length} active goal(s)`,
    `${open.length} open issue(s)`,
    overdue.length > 0 ? `${overdue.length} overdue project(s)` : null,
  ].filter(Boolean);

  return {
    id: `briefing-${Date.now()}`,
    generatedAt: now,
    greeting: `Good day, ${context.owner}. Today is ${formatDate(now, context.timezone)}.`,
    summary: summaryParts.join(" · "),
    sections,
    topActions: Array.from(new Set(topActions)).slice(0, 6),
    risks,
  };
}

export function briefingToMarkdown(briefing: LifeBriefing): string {
  const lines = [
    `# Life briefing`,
    briefing.greeting,
    "",
    `**Summary:** ${briefing.summary}`,
    "",
  ];

  if (briefing.risks.length > 0) {
    lines.push("## Risks", ...briefing.risks.map((r) => `- ${r}`), "");
  }

  lines.push("## Top actions", ...briefing.topActions.map((a) => `- ${a}`), "");

  for (const section of briefing.sections) {
    lines.push("", `## ${section.title}`, ...section.items.map((i) => `- ${i}`));
  }

  return lines.join("\n");
}
