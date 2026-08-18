# Lighthouse SOC Changelog

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
