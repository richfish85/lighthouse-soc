"""Session-isolated training; no writes to the shared incident database."""
from __future__ import annotations

import json
import streamlit as st
from app.services.training import assess, load_cases


def render() -> None:
    cases = load_cases()
    progress = st.session_state.setdefault("training_progress", {})
    st.title("Lighthouse SOC · Training Lab")
    st.write("Practise the reasoning behind an investigation: brief, evidence, decisions, and handover.")
    st.caption("Six synthetic cases · about 1 hr 45 min · local session practice, not certification")
    st.progress(sum(bool(a.get("result")) for a in progress.values()) / len(cases))
    case_id = st.selectbox("Learning path", [c["id"] for c in cases],
                           format_func=lambda value: next(f"{c['id']} · {c['title']} ({c['level']})" for c in cases if c["id"] == value))
    case = next(c for c in cases if c["id"] == case_id)
    attempt = progress.setdefault(case_id, {"tries": 0})
    st.subheader(case["title"])
    st.write(case["summary"])
    brief, evidence, decisions, debrief = st.tabs(["Briefing", "Evidence", "Decisions", "Debrief"])
    with brief:
        st.write(case["brief"])
        st.markdown("### Learning objectives")
        for objective in case["objectives"]:
            st.write(f"• {objective}")
        st.info(case["lesson"])
    with evidence:
        for record in case["evidence"]:
            with st.expander(f"{record['id']} · {record['title']}", expanded=True):
                st.caption(record["source"])
                st.code(record["body"], language=None)
    with decisions:
        if attempt.get("result"):
            st.info("This attempt is submitted. Review the Debrief tab or retry below.")
        with st.form(f"training-{case_id}-{attempt['tries']}"):
            answers = {}
            for q in case["questions"]:
                answers[q["id"]] = st.radio(q["prompt"], range(len(q["options"])),
                    format_func=lambda i, q=q: q["options"][i], index=None,
                    disabled=bool(attempt.get("result")))
            notes = st.text_area("Your handover: facts, evidence IDs, scope, unknowns, actions, and next owner",
                                 value=attempt.get("notes", ""), max_chars=12000, height=200,
                                 disabled=bool(attempt.get("result")))
            st.caption("Only decisions are automatically scored. Written handovers require self-review.")
            if st.form_submit_button("Submit investigation", disabled=bool(attempt.get("result"))):
                try:
                    result = assess(case_id, answers, notes)
                except ValueError as error:
                    st.error(str(error))
                else:
                    attempt.update(answers=answers, notes=notes, result=result, tries=attempt["tries"] + 1)
                    st.rerun()
    with debrief:
        result = attempt.get("result")
        if not result:
            st.info("Submit your decisions and handover to reveal the debrief.")
        else:
            st.metric("Decision score", f"{result['score']}%")
            for row in result["feedback"]:
                st.markdown(f"**{'Correct' if row['correct'] else 'Review'} · {row['question']}**")
                st.write(f"You chose: {row['selected']}")
                st.write(row["explanation"])
            st.markdown("### Review your handover")
            st.write(attempt["notes"])
            st.write(case["reflection"])
            with st.expander("Compare with an example handover"):
                st.write(case["handover"])
            if st.button("Retry decisions", key=f"retry-{case_id}"):
                attempt.pop("result", None)
                st.rerun()
    st.divider()
    st.download_button("Download session practice record", json.dumps(progress, indent=2),
                       file_name="lighthouse-session-practice.json", mime="application/json")
    st.caption("This local simulator saves training only for the current Streamlit session. Download before leaving. The web demo saves progress in browser storage.")
