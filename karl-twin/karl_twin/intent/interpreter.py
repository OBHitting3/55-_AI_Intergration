"""Intent Interpreter: turn messy user language into clear operator intent."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from karl_twin.agents.providers import ReasoningProvider, ReasoningRequest


@dataclass
class IntentInterpretation:
    raw_text: str
    corrected_text: str
    intended_meaning: str
    business_goal: str
    next_action: str
    action_type_hint: str
    needs_clarification: bool
    clarification_question: str | None
    confidence: float
    model: str
    tokens_in: int
    tokens_out: int

    def as_intent(self) -> dict[str, Any]:
        return {
            "action_hint": self.action_type_hint,
            "summary": self.intended_meaning,
            "confidence": self.confidence,
            "corrected_text": self.corrected_text,
            "business_goal": self.business_goal,
            "next_action": self.next_action,
            "needs_clarification": self.needs_clarification,
            "clarification_question": self.clarification_question,
        }


def interpret_user_intent(
    provider: ReasoningProvider,
    raw_text: str,
    *,
    context: dict[str, Any] | None = None,
) -> IntentInterpretation:
    """Infer what the user meant, not just what they typed.

    The model still cannot execute tools. This function produces a structured
    interpretation that downstream planner/approval nodes can inspect.
    """

    res = provider.reason(ReasoningRequest(
        system=(
            "You are Karl's Intent Interpreter. The user may type messy, emotional, "
            "misspelled, incomplete thoughts. Infer what they meant in plain English. "
            "Do not flatter. Do not execute. Preserve urgency, business intent, and "
            "product intent. Ask for clarification only if action would be unsafe or "
            "materially ambiguous."
        ),
        user=raw_text,
        context=context or {},
        json_schema={
            "type": "object",
            "required": [
                "corrected_text",
                "intended_meaning",
                "business_goal",
                "next_action",
                "action_type_hint",
                "needs_clarification",
                "clarification_question",
                "confidence",
            ],
            "properties": {
                "corrected_text": {"type": "string"},
                "intended_meaning": {"type": "string"},
                "business_goal": {"type": "string"},
                "next_action": {"type": "string"},
                "action_type_hint": {
                    "type": "string",
                    "description": "Best action_type hint for the planner, e.g. file.write, code.execute, respond.",
                },
                "needs_clarification": {"type": "boolean"},
                "clarification_question": {"type": ["string", "null"]},
                "confidence": {"type": "number"},
            },
        },
    ))

    parsed = res.parsed or {}
    return IntentInterpretation(
        raw_text=raw_text,
        corrected_text=_string(parsed.get("corrected_text"), raw_text),
        intended_meaning=_string(parsed.get("intended_meaning"), raw_text),
        business_goal=_string(parsed.get("business_goal"), "Clarify the user's goal and move it forward."),
        next_action=_string(parsed.get("next_action"), "Clarify the request before acting."),
        action_type_hint=_action_hint(parsed.get("action_type_hint")),
        needs_clarification=bool(parsed.get("needs_clarification", False)),
        clarification_question=_optional_string(parsed.get("clarification_question")),
        confidence=_confidence(parsed.get("confidence", res.confidence)),
        model=res.model,
        tokens_in=res.tokens_in,
        tokens_out=res.tokens_out,
    )


def _string(value: Any, default: str) -> str:
    if isinstance(value, str) and value.strip():
        return value.strip()
    return default


def _optional_string(value: Any) -> str | None:
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def _action_hint(value: Any) -> str:
    if isinstance(value, str) and value.strip():
        return value.strip()
    return "respond"


def _confidence(value: Any) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        parsed = 0.5
    return max(0.0, min(1.0, parsed))
