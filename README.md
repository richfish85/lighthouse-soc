# Lighthouse SOC

[![Tests](https://github.com/richfish85/lighthouse-soc/actions/workflows/tests.yml/badge.svg)](https://github.com/richfish85/lighthouse-soc/actions/workflows/tests.yml)

**A guided SOC training platform for practising evidence-led triage, investigation, response, and analyst handover.**

Lighthouse SOC is built around one question: can a junior analyst turn an incoming signal into a clear, evidence-led next action? The training lab offers six guided investigations, evidence records, decision feedback, a working notebook, and downloadable practice reports. The original Streamlit incident simulator retains SQLite persistence, role-based screens, and a tested incident lifecycle.

## Training Lab · v0.2

**[Try the public training demo](https://lighthouse-soc-training.richfish85245111.chatgpt.site)** — no learner account required; progress stays on your device.

- Six cases covering phishing, identity, endpoint activity, data exposure, detection tuning, and incident handover.
- Briefing → evidence room → three decisions → explained debrief.
- Browser-local progress, retry support, and Markdown practice reports.
- The same curriculum is available in the local Streamlit Training Lab.
- Written handovers use an example and self-review checklist; only decisions are automatically scored.

Read the [training walkthrough](docs/TRAINING_WALKTHROUGH.md) or [web app setup](training/README.md). No certification or professional-experience claim is attached to practice scores.

> This is a learning simulator, not a production SIEM and not a claim of commercial SOC experience. All people, organisations, events, hostnames, and IP addresses are fictional or reserved for documentation.

## What

The MVP models a simple path:

```text
Reporter submits signal
        -> incident is opened and enriched
        -> analyst triages, investigates, and documents
        -> responder escalates, contains, closes, or records a false positive
        -> SOC lead reviews backlog and operational metrics
```

### Roles

| Role | Main view | Can demonstrate |
| --- | --- | --- |
| Reporter | Reporter Portal | Submit suspicious activity and track submitted alerts |
| Analyst / Responder | Analyst Console | Review evidence, assign priority, use playbooks, write notes, escalate, and close |
| Admin / SOC Lead | Admin Console | Review incidents, backlog health, trends, and team-level metrics |

## Why

The project makes entry-level SOC habits visible:

- establish scope before deciding impact
- separate evidence from assumptions and open questions
- use severity, confidence, asset criticality, and privilege consistently
- document false positives as carefully as suspicious cases
- leave a concise handover another responder can continue from

## How

The current implementation uses:

| Area | Choice |
| --- | --- |
| UI | Streamlit |
| Language | Python |
| Persistence | SQLite |
| Demo context | JSON seed files |
| Validation | Pytest, CLI smoke workflow, GitHub Actions |
| Diagrams | Mermaid |

The code is organised around reusable services rather than putting triage logic inside the UI. See [ARCHITECTURE.md](ARCHITECTURE.md) for the data flow and design trade-offs.

## Original incident simulator scope

- role-based demo login for Reporter, Analyst, and Admin
- reporter intake and alert tracking
- automatic incident creation, enrichment, and transparent P1-P5 scoring
- analyst queue, investigation view, playbook guidance, notes, escalation, containment, closure, and false-positive handling
- admin dashboard and incident oversight
- SQLite schema, deterministic seed data, CLI bootstrap, and audit records
- synthetic analyst casebook and KQL lab queries for investigation practice

## Run locally

```powershell
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install -r requirements.txt
python -m app.cli seed --reset
streamlit run app/main.py
```

Useful checks:

```powershell
python -m app.cli smoke
python -m pytest
```

The application opens in **Training Lab**. Choose **Incident Simulator** in the sidebar for the original workflow. Demo accounts are seeded as `reporter01`, `analyst01`, and `admin01`.

## Walkthrough material

- [Analyst casebook](docs/ANALYST_CASEBOOK.md): four completed synthetic investigations
- [KQL lab queries](docs/kql/soc_triage_queries.kql): example investigation queries with schema caveats
- [Architecture diagrams](diagrams/): architecture, RBAC, incident lifecycle, and screen flow
- [Threat model](THREAT_MODEL.md): current trust boundaries and deferred controls
- [Roadmap](ROADMAP.md): what is complete, next, and deliberately deferred

![Lighthouse SOC workflow](image/workflow/lighthouse_soc_app_workflow.svg)

## Design boundaries

The MVP favours portability and explainability over production infrastructure:

- SQLite keeps the demo easy to run and inspect.
- Rule-based scoring keeps priority decisions reviewable.
- Seeded login is suitable for a local demo; real authentication is future work.
- External enrichment is represented by synthetic JSON context; no live customer or production data is used.
- The React/Vinext web training surface is independently deployable from `training/`. It does not expose the local incident database or seeded logins.

## Screenshots

### Login gateway
<img width="1845" height="918" alt="Lighthouse SOC login gateway with role-based demo access" src="https://github.com/user-attachments/assets/7e031f33-b5b5-41b6-b990-24d4ad39d6ae" />

### Analyst queue
<img width="1919" height="907" alt="Analyst queue showing prioritised SOC incidents and filtering controls" src="https://github.com/user-attachments/assets/dd67d515-bcda-4022-bedf-cab6784f5ca6" />

### Investigation view
<img width="1919" height="906" alt="Incident investigation view with enrichment, playbook actions, and analyst notes" src="https://github.com/user-attachments/assets/b275dc24-e6ec-481e-b68b-ac510645e26d" />

### Admin dashboard
<img width="1919" height="908" alt="Admin dashboard showing SOC metrics, incident trends, and oversight panels" src="https://github.com/user-attachments/assets/9d9e72fd-e6de-4a23-aa09-d87f5c6832c9" />

## License

MIT. See [LICENSE](LICENSE).

## Author

Richard Fisher · [github.com/richfish85](https://github.com/richfish85)
