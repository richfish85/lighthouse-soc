# Lighthouse SOC Architecture

## Training platform extension · v0.2

The shared `data/training_cases.json` curriculum feeds `app/services/training.py` and its independent web delivery copy in `training/app/cases.json`. Python tests require exact parity. Streamlit training uses session state without opening the incident database. The React/Vinext lab uses versioned browser local storage and generates local Markdown reports; it has no learner-data API. Decision scores are recomputed from the rubric rather than trusted from stored scores. The original incident architecture below remains in use for the Incident Simulator.

See [Training walkthrough](docs/TRAINING_WALKTHROUGH.md) for the data-flow diagram, assumptions, threat notes, and validation boundaries.

## What

Lighthouse SOC is a single local application with three role-oriented views, a reusable Python service layer, one SQLite database, and synthetic JSON context.

```text
Reporter / Analyst / Admin
            |
        Streamlit UI
            |
       Service layer
   intake | enrichment | scoring
   incidents | playbooks | metrics
            |
        SQLite database
            |
      JSON demo context
```

## Why

The design keeps the MVP easy to run and easy to explain:

- triage logic is testable without rendering the UI
- the UI remains a thin presentation layer
- seeded data makes a review reproducible
- service boundaries leave a clean path to a future API without requiring one now

## How

### Main modules

| Module | Responsibility |
| --- | --- |
| `app/database.py` | Schema creation and SQLite connections |
| `app/seed.py` | Deterministic users, alerts, assets, reputation, and playbooks |
| `app/auth.py`, `app/roles.py` | Demo identity and role/permission checks |
| `app/services/intake.py` | Alert creation and incident opening |
| `app/services/enrichment.py` | Synthetic IP, asset, and identity context |
| `app/services/scoring.py` | Explainable severity and priority calculation |
| `app/services/incidents.py` | Assignment, notes, escalation, containment, and status changes |
| `app/services/playbooks.py` | Alert-type response guidance |
| `app/services/metrics.py` | Admin totals and chart-ready aggregations |
| `app/ui/` | Streamlit role views and shared visual components |

### Core data model

```text
users 1 ---- * alerts 1 ---- 1 incidents
                         |          |
                         |          +---- * notes
                         |          +---- 1 enrichment
                         |          +---- * audit_log
                         |
                         +---- 1 playbook selection by alert type
```

The one-alert-to-one-incident mapping is a deliberate v0.1 simplification. It keeps the case lifecycle visible while leaving room for a richer case model later.

### Request flows

Reporter:

1. A seeded reporter submits a suspicious activity report.
2. Intake writes the alert and opens its incident.
3. Enrichment and scoring attach synthetic context and a priority.

Analyst / Responder:

1. The queue loads incidents with filters.
2. The investigation view joins alert, enrichment, notes, assignee, and playbook data.
3. Actions write lifecycle changes and audit records.

Admin / SOC Lead:

1. Dashboard metrics aggregate current alert and incident state.
2. Oversight exposes backlog and case details without changing the analyst workflow.

## Design decisions and assumptions

- **SQLite over an ORM:** fewer moving parts for a deterministic local lab.
- **Streamlit over a larger frontend:** fast to run and sufficient for the current prototype.
- **Rule-based scoring over ML:** reviewers can inspect why a case reached P1-P5.
- **Seeded login:** acceptable for a demo, not an authentication control.
- **Synthetic enrichment:** demonstrates evidence handling without contacting external services or processing real data.
- **Low concurrency:** the current data model assumes one demonstrator or a small local session.

## Validation hooks

```powershell
python -m app.cli seed --reset
python -m app.cli smoke
python -m pytest
streamlit run app/main.py
```

For trust boundaries and deferred security controls, see [THREAT_MODEL.md](THREAT_MODEL.md).
