"""ReasoningProvider abstraction.

The LLM is *only* a reasoner. It never invokes tools (invariant #1). The
Claude Agent SDK is configured with empty tool registry; tool-calls in
model output are translated into ActionEnvelope proposals by the planner
node, never executed in-process.

The abstract base is designed so a future LocalProvider (Llama/Qwen via
vLLM or llama.cpp) can drop in by re-implementing reason() and
score_confidence().
"""

from __future__ import annotations

import json
import os
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class ReasoningRequest:
    system: str
    user: str
    context: dict[str, Any]
    json_schema: Optional[dict[str, Any]] = None  # if set, ask for structured output


@dataclass
class ReasoningResult:
    text: str
    parsed: Optional[dict[str, Any]]
    confidence: float
    model: str
    tokens_in: int
    tokens_out: int


class ReasoningProvider(ABC):
    @abstractmethod
    def reason(self, req: ReasoningRequest) -> ReasoningResult: ...


class ClaudeAgentProvider(ReasoningProvider):
    """Claude Agent SDK wrapper.

    The Agent SDK is initialised with NO tools. Per invariant #1 the LLM
    cannot invoke anything; it can only emit structured JSON which the
    planner converts into Action Envelopes for human review.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY", "")
        self.model = model or os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5-20250929")
        if not self.api_key:
            raise RuntimeError("ANTHROPIC_API_KEY missing; cannot create ClaudeAgentProvider.")

    def reason(self, req: ReasoningRequest) -> ReasoningResult:
        # Use anthropic client directly for structured + confidence scoring.
        # Claude Agent SDK is wrapped here for ergonomic agent loops in
        # other nodes (planner subgraph), but interpret() needs strict JSON
        # so we use the Messages API directly.
        from anthropic import Anthropic

        client = Anthropic(api_key=self.api_key)
        sys_prompt = req.system
        if req.json_schema is not None:
            sys_prompt += (
                "\n\nReturn ONLY a JSON object matching this JSON Schema. "
                "Include a top-level 'confidence' field in [0.0, 1.0] reflecting "
                "your certainty in the parse. Schema: "
                + json.dumps(req.json_schema)
            )
        user_msg = req.user
        if req.context:
            user_msg += "\n\nContext:\n" + json.dumps(req.context, default=str)[:4000]

        resp = client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=sys_prompt,
            messages=[{"role": "user", "content": user_msg}],
        )
        text = "".join(block.text for block in resp.content if getattr(block, "type", None) == "text")
        parsed: Optional[dict[str, Any]] = None
        confidence = 0.0
        if req.json_schema is not None:
            parsed = _safe_parse_json(text)
            if parsed is not None:
                try:
                    confidence = float(parsed.get("confidence", 0.0))
                except (TypeError, ValueError):
                    confidence = 0.0
        return ReasoningResult(
            text=text,
            parsed=parsed,
            confidence=max(0.0, min(1.0, confidence)),
            model=self.model,
            tokens_in=getattr(resp.usage, "input_tokens", 0) or 0,
            tokens_out=getattr(resp.usage, "output_tokens", 0) or 0,
        )


def _safe_parse_json(text: str) -> Optional[dict[str, Any]]:
    s = text.strip()
    # Strip markdown fences if the model wrapped JSON.
    if s.startswith("```"):
        s = s.strip("`")
        if s.lower().startswith("json"):
            s = s[4:]
    s = s.strip()
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        # Last-ditch: find the first '{' .. matching '}'.
        start = s.find("{")
        end = s.rfind("}")
        if start >= 0 and end > start:
            try:
                return json.loads(s[start:end + 1])
            except json.JSONDecodeError:
                return None
        return None
