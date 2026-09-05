# Lighthouse SOC Changelog

## v0.2 — 2026-09-05

- Added six guided synthetic investigations, 18 evidence records, 18 scored decisions, explanations, and handover self-review.
- Added a responsive React training workspace with local progress, retries, a notebook, field guide, and downloadable reports.
- Added the shared curriculum to Streamlit as its initial Training Lab; the original incident simulator remains selectable.
- Added Python assessment and UI checks, web scoring/state/component checks, and curriculum parity validation.
- Added a training walkthrough, deployment setup, and explicit privacy and assessment limitations.
- Updated generated web dependencies to resolve the installation audit findings.
- Published the public [training demo](https://lighthouse-soc-training.richfish85245111.chatgpt.site).
- Validated 26 Python tests, 14 web tests, the incident smoke workflow, web typecheck/lint/build, and a clean dependency audit. Public page and favicon returned HTTP 200 without login.

## v0.1 — 2026-08-19

This is the presentable portfolio baseline.

### Added

- Reporter, Analyst / Responder, and Admin / SOC Lead role flows.
- SQLite-backed alerts, incidents, enrichment, notes, playbooks, and audit records.
- Transparent priority scoring, incident lifecycle actions, seeded demo data, and CLI smoke validation.
- Streamlit screens, Mermaid diagrams, synthetic analyst casebook, KQL lab queries, threat model, and MIT licensing.
- GitHub Actions validation for the Python test suite and lifecycle smoke path.

### Documentation

- Reworked the README into a concise project landing page.
- Added a focused architecture overview and phased roadmap.
- Recorded the current MVP boundary and deferred production controls.

### Validation

- `python -m app.cli smoke` — passed.
- `py -m pytest` — 12 passed.

## Earlier development

The prototype was previously developed as an incident-triage assistant and then reframed as Lighthouse SOC: a junior-SOC practice environment rather than a production security product. Earlier implementation work remains in the repository history.
