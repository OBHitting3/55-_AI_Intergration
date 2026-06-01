# One place for all your work

You asked to stop juggling many GitHub repositories. **This repo is now your single home.**

Original repos are still on GitHub (nothing was deleted). Their code was **copied** into `projects/<name>/`. Each imported folder has an `ORIGIN.md` file with the old repo link.

## What is a repository?

A **repository** (repo) is one project folder that Git tracks over time. You had **8 repos** on GitHub; they now live as **folders inside this one repo**.

| Old GitHub repo | New folder |
|-----------------|------------|
| `55-_AI_Intergration` (this repo) | Root + `src/` (dashboard) |
| `Gemini-discovers-Diamonds` | `projects/gemini-discovers-diamonds/` |
| `Content_Shield` | `projects/content-shield/` |
| `Iron-Forge-Studios` | `projects/iron-forge-studios-site/` |
| `Faceless_Shorts` | `projects/faceless-shorts/` |
| `joshua7` | `projects/joshua7/` |
| `yt-autopilot` | `projects/yt-autopilot/` |
| `FreeLance` | `projects/freelance/` (was empty) |

Projects that were already being merged into this repo:

| Idea | Folder |
|------|--------|
| AI Bridge Sync (web dashboard) | `src/` |
| Karl Twin | `projects/karl-twin/` |
| Palm Luxe Tycoon (Roblox) | `projects/palm-luxe-tycoon/` |
| Estate Memory | `projects/estate-memory/` |
| Stuff from your D: drive (later) | `drive-import/` → `projects/_inbox/` |

## How to open ONE folder in Cursor

1. Close extra Cursor windows if you can (or keep them, but use one as “main”).
2. **File → Open Folder**
3. Choose the folder where you cloned this repo (the folder that contains `README.md`, `projects/`, and `src/`).
4. In the left sidebar, expand **`projects/`** — every old repo is a subfolder.

You do **not** need to open each old GitHub repo separately anymore.

## Suggested review order

Work through folders top to bottom in `PROJECTS.md`. For each folder:

1. Open its `README.md` (or `ORIGIN.md` if there is no README).
2. Decide: **keep**, **merge with another folder**, or **archive**.
3. Move anything you are unsure about into `projects/_inbox/` (create subfolders by date if helpful).

## Overlaps to expect (not mistakes)

Some ideas appear in more than one place because they evolved separately:

- **Joshua 7 / Content Shield:** `projects/joshua7/` and `projects/content-shield/` (and a `content-shield` folder inside Gemini repo).
- **Palm games:** `projects/palm-luxe-tycoon/` vs Palm Springs code in `projects/gemini-discovers-diamonds/`.

Pick one folder as the “source of truth” later; for now, keep both so nothing is lost.

## Files still on your Windows `D:\` drive

This cloud workspace cannot see your `D:\` drive. On your PC:

```powershell
.\scripts\scan-drive-windows.ps1
```

Or copy folders from `D:\` into `drive-import/`, then run:

```bash
npm run drive:inventory
```

## After you are comfortable

When a project folder is fully reviewed and you no longer need the old GitHub repo:

1. On GitHub: repo **Settings → Archive** (safer than delete).
2. Keep working only in `projects/<slug>/` here.

## Quick commands

```bash
npm install          # once, for the web dashboard
npm run dev          # AI Bridge Sync at http://localhost:3000
```

Python projects (joshua7, karl-twin, etc.) each have their own `README.md` inside their folder.
