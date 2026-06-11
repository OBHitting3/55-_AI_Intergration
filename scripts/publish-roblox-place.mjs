#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_FILE = ".env.local";
const DEFAULT_VERSION_TYPE = "Published";
const VALID_VERSION_TYPES = new Set(["Published", "Saved"]);

function loadLocalEnv() {
  if (!existsSync(ENV_FILE)) return;

  const lines = readFileSync(ENV_FILE, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function validateConfig({ placeFile, requireApiKey }) {
  const missing = [];
  const apiKey = requireEnv("ROBLOX_API_KEY");
  const universeId = requireEnv("ROBLOX_UNIVERSE_ID");
  const placeId = requireEnv("ROBLOX_PLACE_ID");

  if (requireApiKey && !apiKey) missing.push("ROBLOX_API_KEY");
  if (!universeId) missing.push("ROBLOX_UNIVERSE_ID");
  if (!placeId) missing.push("ROBLOX_PLACE_ID");
  if (!placeFile) missing.push("ROBLOX_PLACE_FILE or --file");

  const resolvedPlaceFile = placeFile ? resolve(placeFile) : undefined;
  if (resolvedPlaceFile && !existsSync(resolvedPlaceFile)) {
    missing.push(`place file not found: ${placeFile}`);
  }

  return {
    apiKey,
    universeId,
    placeId,
    placeFile: resolvedPlaceFile,
    missing,
  };
}

async function main() {
  loadLocalEnv();

  const checkOnly = hasFlag("--check");
  const dryRun = hasFlag("--dry-run") || checkOnly;
  const placeFile = getArgValue("--file") ?? requireEnv("ROBLOX_PLACE_FILE");
  const versionType = getArgValue("--versionType") ?? DEFAULT_VERSION_TYPE;

  if (!VALID_VERSION_TYPES.has(versionType)) {
    throw new Error(
      `Invalid --versionType "${versionType}". Use Published or Saved.`
    );
  }

  const config = validateConfig({ placeFile, requireApiKey: !dryRun });
  if (config.missing.length > 0) {
    console.error("Roblox publishing is not ready. Missing:");
    for (const item of config.missing) {
      console.error(`- ${item}`);
    }
    process.exit(1);
  }

  const url =
    `https://apis.roblox.com/universes/v1/${config.universeId}` +
    `/places/${config.placeId}/versions?versionType=${versionType}`;

  if (dryRun) {
    console.log("Roblox publishing configuration is ready.");
    console.log(`Universe ID: ${config.universeId}`);
    console.log(`Place ID: ${config.placeId}`);
    console.log(`Place file: ${config.placeFile}`);
    console.log(`Version type: ${versionType}`);
    console.log(`Endpoint: ${url}`);
    return;
  }

  const contentType = config.placeFile.endsWith(".rbxlx")
    ? "application/xml"
    : "application/octet-stream";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      "x-api-key": config.apiKey,
    },
    body: readFileSync(config.placeFile),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(
      `Roblox publish failed (${response.status}): ${body.slice(0, 500)}`
    );
  }

  console.log("Roblox publish request completed.");
  if (body) console.log(body);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
