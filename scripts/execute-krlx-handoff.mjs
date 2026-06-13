#!/usr/bin/env node
/**
 * Read KRLX_CURSOR_HANDOFF.md from PC_Transfer_Kit and execute in-repo steps.
 * Kit path: PC_TRANSFER_KIT env, or drive-import/PC_Transfer_Kit, or D:\ via WSL /mnt/d/
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CANDIDATE_KITS = [
  process.env.PC_TRANSFER_KIT,
  path.join(ROOT, "drive-import", "PC_Transfer_Kit"),
  "/mnt/d/PC_Transfer_Kit",
  "D:/PC_Transfer_Kit",
].filter(Boolean);

function resolveKitDir() {
  for (const p of CANDIDATE_KITS) {
    const resolved = path.resolve(p);
    if (fs.existsSync(resolved)) return resolved;
  }
  return null;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function syncKitDirsToProjects(kitDir) {
  const skip = new Set([
    "KRLX_CURSOR_HANDOFF.md",
    "README.md",
    ".DS_Store",
    "Thumbs.db",
  ]);
  const synced = [];

  for (const ent of fs.readdirSync(kitDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    if (skip.has(ent.name) || ent.name.startsWith(".")) continue;

    const src = path.join(kitDir, ent.name);
    const slug = slugify(ent.name);
    const dest = path.join(ROOT, "projects", slug);

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest)) {
      console.log(`[sync] merge ${ent.name} -> projects/${slug}/`);
      fs.cpSync(src, dest, { recursive: true, force: true });
    } else {
      console.log(`[sync] copy ${ent.name} -> projects/${slug}/`);
      fs.cpSync(src, dest, { recursive: true });
    }
    synced.push({ name: ent.name, slug, path: `projects/${slug}` });
  }
  return synced;
}

function parseHandoff(md) {
  const steps = [];
  const copies = [];
  const runs = [];

  const copyRe = /^COPY:\s*(.+?)\s*->\s*(.+)\s*$/gim;
  let m;
  while ((m = copyRe.exec(md))) {
    copies.push({ from: m[1].trim(), to: m[2].trim() });
  }

  const blocks = [...md.matchAll(/```(?:bash|sh|shell)\n([\s\S]*?)```/gi)];
  for (const b of blocks) {
    const lines = b[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    runs.push(...lines);
  }

  const headings = [...md.matchAll(/^##+\s+(.+)$/gm)];
  for (const h of headings) {
    steps.push(h[1].trim());
  }

  return { steps, copies, runs };
}

function safeRun(cmd, cwd = ROOT) {
  const allowed =
    /^(npm run |npm install|node scripts\/|npm run drive:inventory|npm run build|npm run type-check)/;
  if (!allowed.test(cmd)) {
    console.log(`[skip] ${cmd}`);
    return;
  }
  console.log(`[run] ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", env: process.env });
}

function regenerateProjectsIndex(synced) {
  const projectsDir = path.join(ROOT, "projects");
  const entries = [];

  for (const ent of fs.readdirSync(projectsDir, { withFileTypes: true })) {
    if (!ent.isDirectory() || ent.name.startsWith("_")) continue;
    if (ent.name === "ai-bridge-sync") continue;
    const readme = path.join(projectsDir, ent.name, "README.md");
    let description = "";
    if (fs.existsSync(readme)) {
      const text = fs.readFileSync(readme, "utf8");
      const line = text.split("\n").find((l) => l.trim() && !l.startsWith("#"));
      description = line?.trim().slice(0, 120) || "";
    }
    const bridge = path.join(projectsDir, ent.name, ".bridge-target.json");
    let type = "unknown";
    if (fs.existsSync(path.join(projectsDir, ent.name, "pyproject.toml"))) type = "agent-tooling";
    if (fs.existsSync(path.join(projectsDir, ent.name, "package.json"))) type = "web-app";
    if (fs.existsSync(path.join(projectsDir, ent.name, "ServerScriptService"))) type = "roblox-game";

    entries.push({
      name: ent.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      slug: ent.name,
      status: ent.name === "_inbox" ? "triage" : "active",
      path: `projects/${ent.name}`,
      type,
      description,
    });
  }

  entries.unshift({
    name: "AI Bridge Sync",
    slug: "ai-bridge-sync",
    status: "active",
    path: "src",
    type: "web-app",
    description: "MCP-only LLM context sync dashboard",
  });

  const index = {
    version: 1,
    updatedAt: new Date().toISOString(),
    projects: entries,
    syncedFromKit: synced,
  };

  fs.writeFileSync(
    path.join(ROOT, "projects", "index.json"),
    JSON.stringify(index, null, 2)
  );
  console.log(`[index] projects/index.json (${entries.length} projects)`);
}

function applyCopyDirectives(copies, kitDir) {
  for (const { from, to } of copies) {
    const src = path.isAbsolute(from)
      ? from
      : path.join(kitDir, from.replace(/^PC_Transfer_Kit[/\\]/i, ""));
    const dest = path.isAbsolute(to) ? to : path.join(ROOT, to);
    if (!fs.existsSync(src)) {
      console.warn(`[copy] missing source: ${src}`);
      continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`[copy] ${src} -> ${dest}`);
  }
}

const inRepoOnly = process.argv.includes("--in-repo-only");
const kitDir = resolveKitDir();
if (!kitDir) {
  if (!inRepoOnly) {
    console.error(`
PC_Transfer_Kit not found. This cloud VM cannot read D:\\ directly.

On your Windows PC (repo root), run:
  .\\scripts\\import-pc-transfer-kit.ps1
  git add drive-import docs
  git commit -m "import PC_Transfer_Kit from D:"
  git push

Then re-run: npm run handoff:execute

Or set PC_TRANSFER_KIT to a mounted path (WSL: /mnt/d/PC_Transfer_Kit).
`);
    process.exit(1);
  }
  console.warn("[kit] not found; --in-repo-only: updating catalog only.");
}

let synced = [];
let handoffMd = "";

const docsHandoff = path.join(ROOT, "docs", "KRLX_CURSOR_HANDOFF.md");

if (kitDir) {
  const handoffPath = path.join(kitDir, "KRLX_CURSOR_HANDOFF.md");
  console.log(`[kit] ${kitDir}`);

  if (fs.existsSync(handoffPath)) {
    handoffMd = fs.readFileSync(handoffPath, "utf8");
    fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });
    fs.writeFileSync(docsHandoff, handoffMd);
    console.log(`[handoff] copied to docs/KRLX_CURSOR_HANDOFF.md`);
  } else {
    console.warn(`[handoff] missing ${handoffPath}; running kit sync only.`);
  }

  synced = syncKitDirsToProjects(kitDir);
} else if (fs.existsSync(docsHandoff)) {
  handoffMd = fs.readFileSync(docsHandoff, "utf8");
  console.log(`[handoff] using cached ${docsHandoff}`);
}

if (handoffMd && kitDir) {
  const { steps, copies, runs } = parseHandoff(handoffMd);
  console.log(
    `[handoff] ${steps.length} sections, ${copies.length} COPY lines, ${runs.length} shell lines`
  );
  applyCopyDirectives(copies, kitDir);
  for (const cmd of runs) safeRun(cmd);
} else if (handoffMd) {
  console.log("[handoff] parsed cached handoff; kit dir required for COPY/sync steps.");
}

safeRun("npm run drive:inventory");
regenerateProjectsIndex(synced);

const logPath = path.join(ROOT, "docs", "consolidation-log.md");
const note = `\n## KRLX handoff execute (${new Date().toISOString().slice(0, 10)})\n\n- Kit: \`${kitDir}\`\n- Synced folders: ${synced.map((s) => s.slug).join(", ") || "(none)"}\n`;
if (fs.existsSync(logPath)) {
  fs.appendFileSync(logPath, note);
} else {
  fs.writeFileSync(logPath, `# Consolidation log\n${note}`);
}

console.log("[done] handoff execute complete");
