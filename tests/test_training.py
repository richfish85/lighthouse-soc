import json
from pathlib import Path
import pytest
from app.services.training import assess, load_cases, HANDOVER_TEMPLATE, handover_content

CASES = load_cases()

@pytest.mark.parametrize("case", CASES, ids=lambda c: c["id"])
def test_training_assessment_and_feedback(case):
    answers = {q["id"]: q["answer"] for q in case["questions"]}
    result = assess(case["id"], answers, case["handover"])
    assert result["score"] == 100
    assert len(result["feedback"]) == 3
    assert all(row["explanation"] for row in result["feedback"])
    q = case["questions"][0]
    answers[q["id"]] = (q["answer"] + 1) % len(q["options"])
    assert assess(case["id"], answers, case["handover"])["score"] == 67

@pytest.mark.parametrize("bad", [None, -1, 9, True, "1"])
def test_invalid_answers_do_not_award_completion(bad):
    c = CASES[0]
    answers = {q["id"]: q["answer"] for q in c["questions"]}
    answers[c["questions"][0]["id"]] = bad
    with pytest.raises(ValueError):
        assess(c["id"], answers, c["handover"])

def test_incomplete_submission_and_unknown_case_rejected():
    with pytest.raises(ValueError):
        assess("missing", {}, "x" * 50)
    with pytest.raises(ValueError):
        assess(CASES[0]["id"], {}, "x" * 50)
    with pytest.raises(ValueError):
        assess(CASES[0]["id"], {}, "   ")

def test_shared_curriculum_matches_web_copy():
    web = Path(__file__).resolve().parents[1] / "training/app/cases.json"
    assert json.loads(web.read_text(encoding="utf-8-sig"))["cases"] == CASES
    assert len({c["id"] for c in CASES}) == 6
    for c in CASES:
        assert len({e["id"] for e in c["evidence"]}) == 3
        assert len({q["id"] for q in c["questions"]}) == 3

def test_training_ui_has_no_errors():
    from streamlit.testing.v1 import AppTest
    entrypoint = Path(__file__).resolve().parents[1] / "app" / "main.py"
    app = AppTest.from_file(str(entrypoint)).run()
    assert not app.exception
    assert app.title[0].value == "Lighthouse SOC · Training Lab"
    assert app.text_area[0].value == HANDOVER_TEMPLATE
    for q in CASES[0]["questions"]:
        next(r for r in app.radio if r.label == q["prompt"]).set_value(q["answer"])
    app.text_area[0].set_value(CASES[0]["handover"])
    next(b for b in app.button if b.label == "Submit investigation").click().run()
    assert not app.exception
    assert app.metric[0].value == "100%"

def test_template_headings_are_not_assessed_as_written_work():
    c = CASES[0]
    answers = {q["id"]: q["answer"] for q in c["questions"]}
    assert handover_content(HANDOVER_TEMPLATE) == ""
    with pytest.raises(ValueError):
        assess(c["id"], answers, HANDOVER_TEMPLATE)
    assert handover_content(HANDOVER_TEMPLATE.replace("Situation / alert:", "Situation / alert: Phishing")) == "Phishing"
