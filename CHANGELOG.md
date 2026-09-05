# Lighthouse SOC Changelog

## v0.3 — 2026-09-05

Public URL: [lighthouse-soc.vercel.app](https://lighthouse-soc.vercel.app), hosted on the Vercel Hobby plan.

- Added the public landing page, About, SOC overview, analyst role, skills orientation, and learning-loop pages with direct guest entry.
- Implemented the supplied signal-tower Lighthouse logo across the public site and workspace.
- Added Analyst Skills with 23 reusable capabilities, mapped decision evidence, related skills, and non-binary practice levels. Repeated demonstrations require distinct cases; handovers remain self-reviewed.
- Replaced disappearing notebook placeholders with editable template text in web and Streamlit training. Template labels do not count towards the required written response.
- Added a clearly labelled device-local profile that preserves guest progress and does not imply cloud authentication or sync.
- Added a static React/Vite Vercel deployment configuration for the free Hobby plan, retaining the legacy Sites build separately.
- Added regression coverage for orientation links, template persistence, skill evidence, and local profile handling. Local validation: 27 Python tests and 28 web tests passed, plus typecheck, lint, and production build.

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
