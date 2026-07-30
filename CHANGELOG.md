# CHANGELOG

All notable changes to Lighthouse SOC are documented here.

## Unreleased

### Added
- Core app structure under `app/`, `data/`, `diagrams/`, `docs/`, `db/`, and `tests/`.
- SQLite schema for users, alerts, incidents, enrichment, notes, playbooks, and audit log.
- Seed loaders for demo users, sample incidents, asset context, IP reputation, and playbooks.
- RBAC helpers for `Reporter`, `Analyst`, and `Admin`.
- Service layer for alert intake, enrichment, scoring, incident lifecycle, playbooks, and metrics.
- Streamlit screens for login, reporter submission, alert tracking, analyst queue, investigation, playbooks, admin dashboard, and incident oversight.
- CLI commands for database init, bootstrap, seed, and smoke validation.
- Mermaid diagrams and walkthrough documentation.
- Root-level delivery docs: roadmap, architecture, threat model, detection ideas, and this changelog.
- Four-case synthetic analyst casebook covering evidence, scope, prioritisation, false positives, escalation, and handover.
- KQL lab query pack for cloud sign-ins, failed logins, PowerShell, phishing scope, and case handover.
- GitHub Actions validation for Pytest and the incident lifecycle smoke path.

### Changed
- `README.md` was expanded from a one-line description into a full project guide.
- The repo now presents as a portfolio-ready security product demo instead of a starter folder.
- README positioning now leads with junior SOC analyst practice rather than software-engineering career framing.
- ATT&CK technique mappings are documented as investigation hypotheses, with evidence limits made explicit.
- Audit logging is described consistently as implemented for key lifecycle actions, with stronger integrity controls deferred.

### Validation
- `python -m app.cli smoke`
  Result: passed.
- `python -m compileall app tests`
  Result: passed.
- `python -m pytest`
  Result: blocked in the active environment because `pytest` is not installed.

### Notes
- The active Python runtime is MSYS2-managed and currently lacks a ready `pip` / `pytest` workflow for this repo.
- The code-level test suite is present and ready to run once the environment provides `pytest`.
