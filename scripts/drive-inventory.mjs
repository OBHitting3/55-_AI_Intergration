#!/usr/bin/env node
/**
 * Read-only inventory of drive-import/ and repo project roots.
 * Outputs docs/drive-inventory.json
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SCAN_ROOTS = [
  { id: "drive-import", abs: path.join(ROOT, "drive-import") },
  { id: "workspace", abs: ROOT },
];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "out",
  "build",
  "coverage",
  "System Volume Information",
  "$RECYCLE.BIN",
]);

const PROJECT_MARKERS = [
  { marker: "package.json", type: "web-app" },
  { marker: "pyproject.toml", type: "python-app" },
  { marker: "requirements.txt", type: "python-app" },
  { marker: "Cargo.toml", type: "rust-app" },
  { marker: "default.project.json", type: "roblox-game" },
  { marker: "rojo.json", type: "roblox-game" },
  { marker: "docker-compose.yml", type: "infra" },
];

const MAX_DEPTH = 6;
const MAX_FILES_PER_ROOT = 8000;

function sha256File(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
  } catch {
    return null;
  }
}

function walk(dir, depth, stats, fileHashes) {
  if (depth > MAX_DEPTH || stats.fileCount >= MAX_FILES_PER_ROOT) return;

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const ent of entries) {
    if (stats.fileCount >= MAX_FILES_PER_ROOT) break;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      stats.dirCount++;
      walk(full, depth + 1, stats, fileHashes);
    } else if (ent.isFile()) {
      stats.fileCount++;
      const rel = path.relative(ROOT, full);
      const hash = sha256File(full);
      if (hash) {
        const key = `${ent.name}:${hash}`;
        if (!fileHashes.has(key)) fileHashes.set(key, []);
        fileHashes.get(key).push(rel);
      }
      for (const { marker } of PROJECT_MARKERS) {
        if (ent.name === marker) {
          stats.markersFound.push({ marker, at: rel });
        }
      }
      if (/\.luau$/i.test(ent.name)) stats.hasLuau = true;
    }
  }
}

function detectType(markers, hasLuau, name) {
  for (const m of markers) {
    const found = PROJECT_MARKERS.find((p) => p.marker === m.marker);
    if (found) return found.type;
  }
  if (hasLuau) return "roblox-game";
  if (/\.(md|txt|pdf|docx)$/i.test(name)) return "docs-only";
  return "unknown";
}

function inventoryRoot({ id, abs }) {
  if (!fs.existsSync(abs)) {
    return { id, path: abs, exists: false, clusters: [] };
  }

  const topEntries = fs.readdirSync(abs, { withFileTypes: true });
  const clusters = [];

  for (const ent of topEntries) {
    if (!ent.isDirectory()) continue;
    if (SKIP_DIRS.has(ent.name)) continue;
    if (
      id === "workspace" &&
      [
        "drive-import",
        "docs",
        "scripts",
        "projects",
        "node_modules",
        ".git",
        "src",
        "eslint-plugin-no-sdk",
      ].includes(ent.name)
    ) {
      continue;
    }

    const clusterPath = path.join(abs, ent.name);
    const stats = { fileCount: 0, dirCount: 0, markersFound: [], hasLuau: false };
    const fileHashes = new Map();
    walk(clusterPath, 0, stats, fileHashes);

    const dupes = [...fileHashes.entries()]
      .filter(([, paths]) => paths.length > 1)
      .map(([key, paths]) => ({ key, paths: paths.slice(0, 5) }));

    const slug = ent.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    clusters.push({
      name: ent.name,
      slug,
      relativePath: path.relative(ROOT, clusterPath),
      fileCount: stats.fileCount,
      dirCount: stats.dirCount,
      markers: stats.markersFound,
      type: detectType(stats.markersFound, stats.hasLuau, ent.name),
      duplicateFileHints: dupes.slice(0, 20),
    });
  }

  return {
    id,
    path: abs,
    exists: true,
    scannedAt: new Date().toISOString(),
    clusters,
  };
}

function projectCatalogEntries() {
  const indexPath = path.join(ROOT, "projects", "index.json");
  if (!fs.existsSync(indexPath)) return [];
  try {
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    return (index.projects || []).map((p) => ({
      name: p.name,
      slug: p.slug,
      relativePath: p.path,
      type: p.type || "unknown",
      source: "catalog",
      status: p.status,
    }));
  } catch {
    return [];
  }
}

const roots = SCAN_ROOTS.map(inventoryRoot);
const inventory = {
  version: 1,
  generatedAt: new Date().toISOString(),
  roots,
  catalogProjects: projectCatalogEntries(),
  notes:
    "Populate drive-import/ from Windows USB path, then re-run npm run drive:inventory.",
};

fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });
const outPath = path.join(ROOT, "docs", "drive-inventory.json");
fs.writeFileSync(outPath, JSON.stringify(inventory, null, 2));
console.log(`Wrote ${outPath}`);
console.log(
  `Clusters: ${roots.flatMap((r) => r.clusters || []).length} | Catalog: ${inventory.catalogProjects.length}`
);
