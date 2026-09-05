"""Deterministic practice assessment over the shared synthetic curriculum."""
from __future__ import annotations

import json
from pathlib import Path

CASE_PATH = Path(__file__).resolve().parents[2] / "data" / "training_cases.json"


def load_cases() -> list[dict]:
    return json.loads(CASE_PATH.read_text(encoding="utf-8"))["cases"]


def assess(case_id: str, answers: dict[str, int], notes: str) -> dict:
    case = next((c for c in load_cases() if c["id"] == case_id), None)
    if case is None:
        raise ValueError("Unknown training case")
    if not isinstance(notes, str) or not 40 <= len(notes.strip()) <= 12000:
        raise ValueError("Write a handover between 40 and 12,000 characters for self-review.")
    if set(answers) != {q["id"] for q in case["questions"]}:
        raise ValueError("Answer every decision before submitting.")
    feedback = []
    for q in case["questions"]:
        value = answers[q["id"]]
        if type(value) is not int or not 0 <= value < len(q["options"]):
            raise ValueError("Each answer must be a valid option index.")
        feedback.append({"question": q["prompt"], "correct": value == q["answer"],
                         "selected": q["options"][value], "expected": q["options"][q["answer"]],
                         "explanation": q["explanation"], "skill": q["skill"]})
    correct = sum(row["correct"] for row in feedback)
    return {"correct": correct, "total": len(feedback),
            "score": round(correct / len(feedback) * 100), "feedback": feedback}
