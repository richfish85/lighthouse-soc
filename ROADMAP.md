# Lighthouse SOC Roadmap

## What

Lighthouse SOC v0.3 adds public SOC orientation, a reusable Analyst Skills map, editable handover templates, and a device-local profile to the guided training platform. It supports an individual learner practising synthetic investigations; cloud accounts, cohort administration, and secure examinations are outside the current scope.

## v0.1 — Presentable baseline

Completed:

- [x] Reporter, Analyst / Responder, and Admin / SOC Lead flows
- [x] SQLite persistence with deterministic JSON seed data
- [x] Enrichment, transparent P1-P5 scoring, playbooks, notes, escalation, and status changes
- [x] Admin metrics and incident oversight
- [x] CLI bootstrap and smoke workflow
- [x] Pytest coverage and GitHub Actions validation
- [x] Casebook, KQL lab queries, diagrams, threat model, and portfolio documentation

## v0.2 — Guided training platform

- [x] Six cases with lessons, evidence, decisions, feedback, and handovers
- [x] Browser training workspace with device-local progress and export
- [x] Shared curriculum in the original Streamlit app
- [x] Scoring, state validation, curriculum parity, and learner-flow tests
- [x] Training walkthrough and explicit assessment boundaries

## Candidate follow-up — Make the incident workflow deeper

The next milestone is intentionally narrow. Each item should improve a visible analyst or responder decision:

- [ ] Reporter: validate intake edge cases and make follow-up evidence requests clearer
- [ ] Analyst: show score explanations and a richer incident timeline in the investigation view
- [ ] Analyst: add focused search across users, assets, and prior alerts
- [ ] Admin: add CSV export and backlog/triage trend views
- [ ] Platform: replace seeded login with a stronger local session and authentication boundary
- [ ] Quality: add regression tests for role permissions and the most important UI actions

## Later, if the project earns it

- simulated JSONL/CSV detection feeds
- richer playbook and detection-rule management
- API routes that mirror the service layer
- multi-user persistence options beyond SQLite
- expanded ATT&CK mapping and response reporting

These are candidates, not promises. The project should keep one coherent triage story before adding integrations or infrastructure.

## GitHub workflow

Issues are grouped by role or platform area and tracked against the v0.2 milestone. The repository now has a small issue workflow using the milestone plus role/area labels. When a GitHub Projects board is enabled, use the same flow:

```text
Backlog -> Ready -> In progress -> Review -> Done
```

Keep issues small enough to demonstrate one decision, one workflow improvement, or one validation result. Update the changelog when a user-visible behaviour or scope decision changes.

## Demo path

For a quick review, use:

```text
reporter01 -> submit an alert
analyst01  -> investigate, document, and update it
admin01    -> review the resulting metrics and oversight view
```
