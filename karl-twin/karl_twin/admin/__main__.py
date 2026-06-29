"""Admin CLI.

  python -m karl_twin.admin pause           halts worker (leaves API running)
  python -m karl_twin.admin resume          resumes worker
  python -m karl_twin.admin status          queue depth, last events
  python -m karl_twin.admin doctor          local setup readiness checks
  python -m karl_twin.admin generate_env    create .env from .env.example
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import httpx

from karl_twin.api.event_log import EventLog, default_path
from karl_twin.identity import secrets as sec

PAUSE_FLAG = Path(__file__).resolve().parents[2] / "data" / ".secrets" / "worker.paused"
PROJECT_ROOT = Path(__file__).resolve().parents[2]


def cmd_pause(_args: argparse.Namespace) -> int:
    PAUSE_FLAG.parent.mkdir(parents=True, exist_ok=True)
    PAUSE_FLAG.write_text("paused", encoding="utf-8")
    print(f"worker paused; flag at {PAUSE_FLAG}")
    return 0


def cmd_resume(_args: argparse.Namespace) -> int:
    if PAUSE_FLAG.exists():
        PAUSE_FLAG.unlink()
        print("worker resumed")
    else:
        print("worker was not paused")
    return 0


def cmd_status(_args: argparse.Namespace) -> int:
    sec.load()
    paused = PAUSE_FLAG.exists()
    events = EventLog(default_path())
    recent = events.recent(limit=20)
    print(f"paused: {paused}")
    print(f"event log: {default_path()}")
    print(f"last {len(recent)} events:")
    for e in recent:
        print(
            f"  {e['ts']} [{e['event_type']:>20}] "
            f"node={e.get('node') or '-':>8} "
            f"action={(e.get('action_id') or '-')[:8]} "
            f"tier={e.get('cac_tier')}"
        )
    return 0


def cmd_doctor(_args: argparse.Namespace) -> int:
    sec.load()
    checks: list[tuple[str, bool, str]] = []
    env_path = PROJECT_ROOT / ".env"
    provider = os.environ.get("KARL_TWIN_PROVIDER", "anthropic").strip().lower()
    output_dir = Path(os.environ.get("OUTPUT_DIR", PROJECT_ROOT / "data" / "outputs"))
    event_db = Path(os.environ.get("EVENT_DB_PATH", PROJECT_ROOT / "data" / "events.db"))

    checks.append(("env_file", env_path.exists(), str(env_path)))
    checks.append(("provider_supported", provider in {"anthropic", "claude", "ollama", "local"}, provider or "<empty>"))
    checks.append(("output_dir_configured", bool(str(output_dir)), str(output_dir)))
    checks.append(("event_db_configured", bool(str(event_db)), str(event_db)))

    if provider in {"anthropic", "claude"}:
        checks.append(("anthropic_key", bool(os.environ.get("ANTHROPIC_API_KEY", "").strip()), "ANTHROPIC_API_KEY"))
    if provider in {"ollama", "local"}:
        base_url = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
        model = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")
        api_key = os.environ.get("OLLAMA_API_KEY", "")
        checks.extend(_ollama_checks(base_url, model, api_key))

    failures = 0
    print("Karl setup doctor")
    for name, ok, detail in checks:
        status = "OK" if ok else "FAIL"
        print(f"{status:4} {name}: {detail}")
        failures += 0 if ok else 1
    return 0 if failures == 0 else 1


def _ollama_checks(base_url: str, model: str, api_key: str = "") -> list[tuple[str, bool, str]]:
    checks: list[tuple[str, bool, str]] = [
        ("ollama_base_url", bool(base_url), base_url or "<empty>"),
        ("ollama_model_configured", bool(model), model or "<empty>"),
    ]
    headers = _ollama_headers(api_key)
    if _is_ollama_cloud(base_url):
        checks.append(("ollama_api_key_configured", bool((api_key or "").strip()), "OLLAMA_API_KEY"))
    try:
        resp = httpx.get(f"{base_url}/api/tags", headers=headers, timeout=5.0)
        resp.raise_for_status()
        models = [item.get("name") for item in resp.json().get("models", [])]
    except Exception as e:
        checks.append(("ollama_reachable", False, f"{type(e).__name__}: {e}"))
        return checks

    checks.append(("ollama_reachable", True, base_url))
    model_downloaded = model in models
    checks.append(("ollama_model_downloaded", model_downloaded, f"{model}; available={models}"))
    if model_downloaded:
        checks.append(_ollama_generate_check(base_url, model, headers=headers))
    return checks


def _ollama_generate_check(base_url: str, model: str, *, headers: dict[str, str] | None = None) -> tuple[str, bool, str]:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Reply with OK."}],
        "stream": False,
        "options": {"num_predict": 8},
    }
    try:
        resp = httpx.post(f"{base_url}/api/chat", json=payload, headers=headers or {}, timeout=30.0)
        resp.raise_for_status()
        content = str((resp.json().get("message") or {}).get("content") or "").strip()
    except Exception as e:
        return ("ollama_model_generates", False, f"{type(e).__name__}: {e}")
    return ("ollama_model_generates", bool(content), content or "<empty response>")


def _ollama_headers(api_key: str | None) -> dict[str, str]:
    key = (api_key or "").strip()
    return {"Authorization": f"Bearer {key}"} if key else {}


def _is_ollama_cloud(base_url: str) -> bool:
    return base_url.rstrip("/").lower() == "https://ollama.com"


def cmd_generate_env(args: argparse.Namespace) -> int:
    try:
        path = sec.generate_env(force=args.force)
        print(f"wrote {path}")
        print("Edit it to add ANTHROPIC_API_KEY and E2B_API_KEY.")
        return 0
    except FileExistsError as e:
        print(str(e), file=sys.stderr)
        return 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="karl_twin.admin")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("pause").set_defaults(func=cmd_pause)
    sub.add_parser("resume").set_defaults(func=cmd_resume)
    sub.add_parser("status").set_defaults(func=cmd_status)
    sub.add_parser("doctor").set_defaults(func=cmd_doctor)
    g = sub.add_parser("generate_env")
    g.add_argument("--force", action="store_true", help="overwrite existing .env")
    g.set_defaults(func=cmd_generate_env)
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
