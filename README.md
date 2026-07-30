# Lighthouse SOC — Incident Triage Simulator

[![Tests](https://github.com/richfish85/lighthouse-soc/actions/workflows/tests.yml/badge.svg)](https://github.com/richfish85/lighthouse-soc/actions/workflows/tests.yml)

*A local, synthetic SOC lab for practising alert triage, evidence review, priority decisions, escalation, false-positive handling, and analyst handover.*

**Built to demonstrate the working habits expected of a junior SOC analyst: establish scope, separate evidence from assumptions, choose a defensible severity, document actions, and hand a case to the next responder.**


## What is this?

**Lighthouse SOC** is a lightweight security operations simulation platform built to model how incidents move from reporting through triage, investigation, escalation, closure, and oversight.

Rather than claiming to be a full SIEM, this project focuses on a believable junior-analyst workflow:

* Review the alert and enrichment evidence
* Identify affected identities, assets, and likely scope
* Prioritise by severity, confidence, asset criticality, and privilege
* Apply a playbook and record analyst notes
* Escalate, contain, close, or classify a false positive
* Preserve a clear handover and audit trail

It simulates three user roles:

### Reporter

* Submit suspicious activity reports
* Track submitted alerts
* View incident outcomes

### Analyst

* Triage incoming incidents
* Review enrichment context
* Apply playbooks
* Add notes and update status

### Admin

* Review incident trends
* Monitor backlog health
* View operational metrics and oversight dashboards

---

# Why I Built This

This project was designed as both:

## 1. A SOC Analyst Practice Environment

To demonstrate practical skills in:

* Alert and incident triage
* Evidence-led severity and scope decisions
* Playbook use and escalation judgment
* False-positive documentation
* Incident notes and responder handover
* MITRE ATT&CK-informed investigation hypotheses

## 2. A Security Systems Exercise

To model how software components interact:

* Intake → Processing → Scoring → Workflow → Reporting

It intentionally emphasises transparent decisions and reproducible evidence over unnecessary complexity.

---

# Example Workflow

Example incident:

**Impossible Travel Login**

1. Reporter submits alert
2. System opens incident record
3. Asset/IP context is enriched
4. Priority is calculated
5. Analyst investigates and updates status
6. Admin dashboards reflect incident impact

---

# Core Features

## Implemented

* Role-based workflow simulation
* SQLite-backed incident and alert data
* Streamlit UI with three user views
* Seeded demo data and users
* Priority scoring engine
* CLI smoke tests
* Pytest validation
* Mermaid architecture diagrams

---

# Tech Stack

| Area     | Technology      |
| -------- | --------------- |
| Language | Python          |
| Data     | SQLite, JSON    |
| UI       | Streamlit       |
| Testing  | Pytest          |
| Diagrams | Mermaid         |
| CLI      | Python argparse |

---

# Architecture

Project uses a simple service-first structure:

```text
app/
├── main.py
├── cli.py
├── database.py
├── seed.py
├── services/
├── ui/
└── tests/
```

### Layers

**Database**

* Schema creation
* Seed loading
* Persistence

**Services**

* Alert intake
* Enrichment
* Scoring
* Incident lifecycle
* Metrics

**UI**

* Thin presentation layer over services

**CLI**

* Bootstrap
* Smoke tests
* Validation flows

---

# Priority Scoring Logic

Priority is intentionally transparent:

```text
Severity
+ Confidence
+ Asset Criticality
+ Privileged Account Weight
= Priority Score
```

Example:

High severity
High confidence
Critical asset
Privileged account

→ maps to **P1**

---

# Quick Start

## Install

```bash
python -m pip install -r requirements.txt
```

## Seed Demo Data

```bash
python -m app.cli seed --reset
```

## Run App

```bash
streamlit run app/main.py
```

## Run Smoke Tests

```bash
python -m app.cli smoke
```

## Run Test Suite

```bash
python -m pytest
```

---

# Demo Workflow

Use the app as a three-role walkthrough:

1. Start as `reporter01` and submit a suspicious activity report.
2. Switch to `analyst01` and investigate the generated incident.
3. Review enrichment, apply playbook guidance, add notes, and update status.
4. Switch to `admin01` and review dashboard metrics and incident oversight.

![Lighthouse SOC app workflow](image/workflow/lighthouse_soc_app_workflow.svg)

---

# Demo Accounts

| User       | Role     |
| ---------- | -------- |
| reporter01 | Reporter |
| analyst01  | Analyst  |
| admin01    | Admin    |

---

# Sample Incident Scenarios

* Impossible Travel Login
* Malware Detection
* Phishing Reported
* Suspicious PowerShell
* Repeated Failed Logins
* Privilege Escalation Attempt

---

# Analyst Casebook and KQL

All people, organisations, events, hostnames, and IP addresses in this repository are fictional or reserved for documentation. No production or customer data is included.

The [analyst casebook](docs/ANALYST_CASEBOOK.md) contains four completed simulated investigations. Each write-up records:

* initial signal and affected scope
* evidence reviewed and assumptions still open
* severity/priority rationale
* MITRE ATT&CK hypothesis
* containment, disposition, escalation, and handover

The accompanying [KQL query pack](docs/kql/soc_triage_queries.kql) provides lab queries for the same scenarios. Table availability and field names vary by Microsoft Sentinel and Defender connector, so each query must be validated against the target workspace schema.

| Simulated scenario | Disposition | ATT&CK-informed hypothesis |
| --- | --- | --- |
| Impossible travel on a privileged account | Escalated | T1078.004 Valid Accounts: Cloud Accounts |
| Payroll-themed phishing link | Closed, no interaction observed | T1566.002 Phishing: Spearphishing Link |
| Encoded PowerShell on an admin workstation | In review; L2 escalation recommended | T1059.001 Command and Scripting Interpreter: PowerShell |
| Repeated failed logins during an approved exercise | False positive | T1110.001 Brute Force: Password Guessing |

ATT&CK mappings describe investigation hypotheses, not proof of compromise.

---

# Documentation

## Diagrams

* Architecture
* RBAC Matrix
* Incident Lifecycle
* Screen Flow

Located in:

```text
diagrams/
```

## Supporting Docs

* ROADMAP.md
* ARCHITECTURE.md
* THREAT_MODEL.md
* DETECTION_IDEAS.md
* docs/ANALYST_CASEBOOK.md
* docs/kql/soc_triage_queries.kql

---

# Validation

```bash
python -m pytest
python -m app.cli smoke
streamlit run app/main.py
```

---


# Engineering Principles Demonstrated

This project applies:
- Modular software design
- Role-based access concepts
- Data modelling and persistence
- Test-driven validation
- Reproducible CLI workflows
- Secure-by-design thinking

# Design Tradeoffs

This MVP deliberately uses:

- SQLite over PostgreSQL for portability
- Streamlit over heavier frontend stacks for rapid prototyping
- Rule-based scoring over ML for transparency and explainability

# Future Extensions

Planned ideas:
* Identity integration (SSO / RBAC expansion)
* Richer case management workflow
* Policy compliance mapping
* Richer MITRE ATT&CK mapping in the application data model and UI
* IOC enrichment integrations
* Detection rule tuning
* Expanded RBAC permissions
* API-backed alert sources

---

# Why This Project Matters

This project turns introductory security knowledge into visible analyst work:

* triage a queue without treating every alert as an incident
* distinguish evidence, assumptions, and unanswered questions
* explain severity, confidence, and affected scope
* recognise when privileged assets require faster escalation
* document false positives as carefully as confirmed threats
* leave concise notes another analyst can continue from

The supporting Python, SQLite, Streamlit, RBAC, testing, and audit features make those decisions reproducible. The goal is not to claim production SOC experience; it is to show a credible, honest foundation for an entry-level SOC or security-operations role.

---

## Screenshots


<img width="1845" height="918" alt="Lighthouse SOC login gateway with role-based demo access" src="https://github.com/user-attachments/assets/7e031f33-b5b5-41b6-b990-24d4ad39d6ae" />
### Login gateway


<img width="1919" height="907" alt="Analyst queue showing prioritized SOC incidents and filtering controls" src="https://github.com/user-attachments/assets/dd67d515-bcda-4022-bedf-cab6784f5ca6" />
### Analyst queue


<img width="1919" height="906" alt="Incident investigation view with enrichment, playbook actions, and analyst notes" src="https://github.com/user-attachments/assets/b275dc24-e6ec-481e-b68b-ac510645e26d" />
### Investigation view


<img width="1919" height="908" alt="Admin dashboard showing SOC metrics, incident trends, and oversight panels" src="https://github.com/user-attachments/assets/9d9e72fd-e6de-4a23-aa09-d87f5c6832c9" />
### Admin dashboard

---

## License

MIT License. See [LICENSE](LICENSE).

---

## Author

Richard Fisher
GitHub: [https://github.com/richfish85](https://github.com/richfish85)


