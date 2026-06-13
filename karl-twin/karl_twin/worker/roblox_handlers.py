"""Roblox / Luau pipeline handlers for karl-twin.

All file paths are sandboxed to GAME_ROOT (default: repo game/PalmLuxeTycoon).
"""

from __future__ import annotations

import os
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def _game_root() -> Path:
    raw = os.environ.get("GAME_ROOT", "")
    if raw:
        return Path(raw).resolve()
    # Default: sibling of karl-twin package root (monorepo layout).
    repo_game = Path(__file__).resolve().parents[3] / "game" / "PalmLuxeTycoon"
    return repo_game.resolve()


def _resolve_under_game_root(raw_path: str) -> Path:
    root = _game_root()
    target = Path(raw_path)
    if not target.is_absolute():
        target = root / target
    target = target.resolve()
    try:
        target.relative_to(root)
    except ValueError:
        raise PermissionError(f"game path rejected: {target} is outside {root}")
    return target


def _run_tool(cmd: list[str], *, cwd: Path, timeout_sec: int = 120) -> dict[str, Any]:
    proc = subprocess.run(
        cmd,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        timeout=timeout_sec,
    )
    return {
        "returncode": proc.returncode,
        "stdout": proc.stdout[-8000:] if proc.stdout else "",
        "stderr": proc.stderr[-8000:] if proc.stderr else "",
        "ok": proc.returncode == 0,
    }


def _tool_path(env_key: str, default_name: str) -> str:
    explicit = os.environ.get(env_key, "").strip()
    if explicit:
        return explicit
    found = shutil.which(default_name)
    if found:
        return found
    raise FileNotFoundError(
        f"{env_key} not set and '{default_name}' not on PATH. "
        f"Run game/aftman install or install-roblox.ps1 on Windows."
    )


def game_luau_write(payload: dict[str, Any]) -> dict[str, Any]:
    """Write a .luau file under GAME_ROOT.

    Payload: { "path": "<relative>", "content": "<text>", "mode": "w"|"a" }
    """
    raw_path = payload.get("path")
    if not raw_path:
        raise ValueError("game.luau.write payload missing 'path'")
    if not str(raw_path).endswith(".luau"):
        raise ValueError("game.luau.write only accepts .luau paths")

    target = _resolve_under_game_root(str(raw_path))
    target.parent.mkdir(parents=True, exist_ok=True)
    content = payload.get("content", "")
    mode = payload.get("mode", "w")
    if mode not in ("w", "a"):
        raise ValueError(f"unsupported mode: {mode}")
    if mode == "w":
        target.write_text(content, encoding="utf-8")
    else:
        with target.open("a", encoding="utf-8") as fh:
            fh.write(content)

    return {
        "path": str(target),
        "bytes_written": len(content.encode("utf-8")),
        "written_at": datetime.now(timezone.utc).isoformat(),
    }


def rojo_build(payload: dict[str, Any]) -> dict[str, Any]:
    """Run `rojo build` into GAME_ROOT/out/PalmLuxeTycoon.rbxlx by default."""
    root = _game_root()
    out_name = payload.get("output", "PalmLuxeTycoon.rbxlx")
    out_dir = root / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / out_name

    rojo = _tool_path("ROJO_PATH", "rojo")
    project = root / "default.project.json"
    if not project.is_file():
        raise FileNotFoundError(f"Rojo project missing: {project}")

    result = _run_tool(
        [rojo, "build", str(project), "--output", str(out_file)],
        cwd=root,
        timeout_sec=int(payload.get("timeout_sec", 120)),
    )
    result["output_file"] = str(out_file)
    if not result["ok"]:
        raise RuntimeError(f"rojo build failed: {result['stderr'] or result['stdout']}")
    return result


def luau_lint(payload: dict[str, Any]) -> dict[str, Any]:
    """Run selene on GAME_ROOT (non-fatal warnings allowed)."""
    root = _game_root()
    selene = _tool_path("SELENE_PATH", "selene")
    result = _run_tool(
        [selene, str(root)],
        cwd=root,
        timeout_sec=int(payload.get("timeout_sec", 60)),
    )
    if not result["ok"] and payload.get("strict", False):
        raise RuntimeError(f"selene failed: {result['stderr'] or result['stdout']}")
    return result


HANDLERS = {
    "game.luau.write": game_luau_write,
    "rojo.build": rojo_build,
    "luau.lint": luau_lint,
}
