# Lighthouse SOC Training

The browser training workspace for [Lighthouse SOC](https://github.com/richfish85/lighthouse-soc).

## What

Six self-paced synthetic investigations: email phishing, impossible travel, suspicious endpoint execution, data exposure, scanner noise, and a shift-handover capstone. Each contains a lesson, three evidence records, three scored decisions, a notebook, and an explained debrief. Reports download as Markdown.

## Why

Practise evidence-led triage and proportionate response without live infrastructure, real incident data, or shared demo accounts. Scores are practice feedback, not certification. Written handovers are self-reviewed against an example and checklist.

## How

Requires Node 22.13+ and npm. From this directory:

```powershell
npm ci
npm run dev
```

Open the URL printed by the development server. To verify:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm audit
```

The app uses React and Vinext. Sites hosts the built Worker and public assets. `.openai/hosting.json` identifies the deployment; it contains no credentials. Keep source-push tokens out of files and Git configuration.

## Curriculum source

The parent repository's `data/training_cases.json` is authoritative. `app/cases.json` is its delivery copy so this folder is independently buildable. After authoring a case, copy the JSON to `app/cases.json` and run the parent Python tests; they check exact parity.

## State and assumptions

- Progress and notes remain in browser local storage under `lighthouse-training-v1`.
- There is no learner account, backend progress database, or cross-device sync.
- Clear browser storage or use the confirmed reset action to remove local records.
- Download the practice report before resetting or switching devices.
- If storage is denied or full, an inline message tells the learner to export before leaving.
- Retry replaces current answers and score while preserving notes and the submission count.
- Evidence timestamps are synthetic UTC; addresses use reserved documentation ranges and `.example` domains.
- The answer key is included in the client. This is open practice, not a secure examination.
- Optional WebMCP navigation starts an existing case. Unsupported browsers use normal buttons. Contract tests use a mocked registration context; live WebMCP integration remains unverified.

## Validation boundaries

Component tests exercise the learner flow in jsdom, including validation, feedback, reload, retry, download initiation, and reset. They are not browser layout or accessibility certification. Responsive styles, labels, focus outlines, reduced-motion support, and a skip link are implemented; real-browser visual review remains a separate check.
