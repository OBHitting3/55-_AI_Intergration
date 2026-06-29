from karl_twin.agents.providers import ReasoningProvider, ReasoningRequest, ReasoningResult
from karl_twin.intent import interpret_user_intent


class IntentProvider(ReasoningProvider):
    def reason(self, req: ReasoningRequest) -> ReasoningResult:
        assert "Karl's Intent Interpreter" in req.system
        assert req.json_schema is not None
        parsed = {
            "corrected_text": "Help me build systems that can create serious income.",
            "intended_meaning": "The user wants Karl to prioritize high-leverage business execution.",
            "business_goal": "Build and ship profitable products and workflows.",
            "next_action": "Create a focused business command center plan.",
            "action_type_hint": "respond",
            "needs_clarification": False,
            "clarification_question": None,
            "confidence": 0.91,
        }
        return ReasoningResult(
            text="{}",
            parsed=parsed,
            confidence=0.91,
            model="intent-stub",
            tokens_in=20,
            tokens_out=30,
        )


def test_interprets_messy_business_intent():
    result = interpret_user_intent(IntentProvider(), "make up milliionares")

    assert result.raw_text == "make up milliionares"
    assert result.corrected_text == "Help me build systems that can create serious income."
    assert "business execution" in result.intended_meaning
    assert result.action_type_hint == "respond"
    assert result.needs_clarification is False
    assert result.confidence == 0.91
    assert result.model == "intent-stub"


def test_intent_dict_feeds_existing_graph_contract():
    result = interpret_user_intent(IntentProvider(), "messy thought")
    intent = result.as_intent()

    assert intent["action_hint"] == "respond"
    assert intent["summary"] == result.intended_meaning
    assert intent["business_goal"] == result.business_goal
    assert intent["next_action"] == result.next_action
