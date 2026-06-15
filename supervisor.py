"""Sovereign-node debate supervisor.

Runs a sequential N-round debate across the agents defined in `agents/*.md`,
using a local vLLM server (OpenAI-compatible endpoint) as the single shared
model. Each agent sees concise excerpts of prior agents' turns, injected by
the supervisor — no agent reads the journal directory directly.

Design contract (matches the verified plan):
  - One model, ten personas. The vLLM server is loaded once with the
    prequantized 70B (or whatever you choose) and reused across all turns.
  - Append-only per-agent journals at `obsidian/journals/<name>-YYYYMMDD.log`.
  - The supervisor composes the final consensus note in a single writer step.

Usage:
    python supervisor.py "Should we ship the AVAI 4K demo this week?"
    python supervisor.py --rounds 3 --agents marcus,raj,sofia "..."
    python supervisor.py --vllm-url http://localhost:8000/v1 ...

Run via `./run-debate.sh "topic"` to get the FA2 env var set.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re
import sys
import urllib.request
import urllib.error

ROOT = pathlib.Path(__file__).resolve().parent
AGENTS_DIR = ROOT / "agents"
JOURNAL_DIR = ROOT / "obsidian" / "journals"

DEFAULT_VLLM_URL = "http://localhost:8000/v1"
DEFAULT_MODEL = "nvidia/Llama-3.3-70B-Instruct-NVFP4"
DEFAULT_ROUNDS = 3
DEFAULT_ROSTER = ["marcus", "elena", "raj", "aisha", "fatima", "sofia"]
EXCERPT_CHARS = 400  # per prior-agent excerpt injected into the next prompt


def load_agent(name: str) -> tuple[str, str]:
    """Return (display_name, system_prompt) for an agent file."""
    path = AGENTS_DIR / f"{name}.md"
    if not path.exists():
        raise FileNotFoundError(f"No agent file at {path}")
    text = path.read_text(encoding="utf-8")
    m = re.search(r"^##\s+System prompt\s*\n(.+)$", text, re.MULTILINE | re.DOTALL)
    if not m:
        raise ValueError(f"{path} has no '## System prompt' section")
    title_line = text.splitlines()[0].lstrip("# ").strip()
    return title_line, m.group(1).strip()


def chat_completion(vllm_url: str, model: str, system: str, user: str,
                    max_tokens: int = 512, temperature: float = 0.7) -> str:
    """Single blocking call to vLLM's OpenAI-compatible /chat/completions."""
    body = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{vllm_url}/chat/completions",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            payload = json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"vLLM HTTP {exc.code}: {exc.read().decode('utf-8', 'replace')}")
    return payload["choices"][0]["message"]["content"].strip()


def excerpt(text: str, limit: int = EXCERPT_CHARS) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[:limit].rstrip() + " …"


def journal_path(name: str, day: dt.date) -> pathlib.Path:
    return JOURNAL_DIR / f"{name}-{day.strftime('%Y%m%d')}.log"


def append_journal(name: str, day: dt.date, header: str, body: str) -> None:
    JOURNAL_DIR.mkdir(parents=True, exist_ok=True)
    with journal_path(name, day).open("a", encoding="utf-8") as fh:
        fh.write(f"\n--- {dt.datetime.now().isoformat(timespec='seconds')} | {header} ---\n")
        fh.write(body.rstrip() + "\n")


def build_user_message(topic: str, round_idx: int, prior_turns: list[tuple[str, str]]) -> str:
    parts = [f"DEBATE TOPIC: {topic}", f"ROUND: {round_idx + 1}"]
    if prior_turns:
        parts.append("\nPRIOR TURNS (most recent first):")
        for who, what in reversed(prior_turns[-6:]):  # cap to last 6 turns of context
            parts.append(f"\n[{who}]\n{excerpt(what)}")
    parts.append(
        "\nRespond in character. Be concise — 2-4 short paragraphs. "
        "If you agree with a prior agent, say so and add one thing they missed. "
        "If you disagree, name the agent and the specific point."
    )
    return "\n".join(parts)


def synthesize_consensus(vllm_url: str, model: str, topic: str,
                         turns: list[tuple[str, str]]) -> str:
    transcript = "\n\n".join(f"[{who}]\n{what}" for who, what in turns)
    system = (
        "You are the supervisor of a digital-twin debate. Synthesize the agents' "
        "turns into a single decision note. Be terse. State (1) the decision, "
        "(2) the dissents that were not resolved, (3) the next concrete action."
    )
    user = f"DEBATE TOPIC: {topic}\n\nTRANSCRIPT:\n{transcript}"
    return chat_completion(vllm_url, model, system, user, max_tokens=400, temperature=0.3)


def run_debate(topic: str, roster: list[str], rounds: int, vllm_url: str, model: str) -> None:
    today = dt.date.today()
    agents = [(name, *load_agent(name)) for name in roster]
    turns: list[tuple[str, str]] = []  # (display_name, content)

    print(f"\n=== debate: {topic} ===")
    print(f"roster: {', '.join(roster)} | rounds: {rounds} | model: {model}\n")

    for round_idx in range(rounds):
        print(f"\n--- round {round_idx + 1} ---")
        for slug, display_name, system_prompt in agents:
            user_msg = build_user_message(topic, round_idx, turns)
            print(f"  → {display_name} …", flush=True)
            reply = chat_completion(vllm_url, model, system_prompt, user_msg)
            turns.append((display_name, reply))
            append_journal(slug, today,
                           header=f"round {round_idx + 1} | topic: {topic}",
                           body=reply)

    print("\n--- consensus ---")
    consensus = synthesize_consensus(vllm_url, model, topic, turns)
    append_journal("consensus", today, header=f"topic: {topic}", body=consensus)
    print(consensus)
    print(f"\nWrote to {JOURNAL_DIR}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("topic", help="The decision / question for the agents to debate.")
    parser.add_argument("--rounds", type=int, default=DEFAULT_ROUNDS)
    parser.add_argument("--agents", default=",".join(DEFAULT_ROSTER),
                        help="Comma-separated agent slugs (must match agents/<slug>.md).")
    parser.add_argument("--vllm-url", default=DEFAULT_VLLM_URL)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    args = parser.parse_args()

    roster = [s.strip() for s in args.agents.split(",") if s.strip()]
    run_debate(args.topic, roster, args.rounds, args.vllm_url, args.model)
    return 0


if __name__ == "__main__":
    sys.exit(main())
