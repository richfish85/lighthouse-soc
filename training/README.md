# Lighthouse SOC Training

The browser training workspace for [Lighthouse SOC](https://github.com/richfish85/lighthouse-soc).

## What

The public landing page and five orientation pages introduce SOC work. Six self-paced synthetic investigations cover email phishing, impossible travel, suspicious endpoint execution, data exposure, scanner noise, and a shift-handover capstone. Each contains a lesson, three evidence records, three scored decisions, an editable handover template, and an explained debrief. Analyst Skills maps 23 reusable capabilities to actual practice evidence. Reports download as Markdown.

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

The primary app uses React and Vite and builds to `dist-static/`. `vercel.json` configures the public Vercel deployment and direct page links. It runs as static assets on the Hobby plan, without paid server or database resources. The prior Vinext/Sites build remains available through `npm run build:sites`; `.openai/hosting.json` records the legacy deployment. The Vercel account link in `.vercel/` is ignored by Git.

## Page map

- `/`: landing page, guest entry, and orientation pathway
- `/about`: About Lighthouse
- `/learn/soc`, `/learn/analyst`, `/learn/skills`, `/learn/how-it-works`: public educational pages
- `/training`: learning path and investigation workspace
- `/training/skills`: capability map; distinct from public skills orientation
- `/training/progress`, `/training/guide`: practice progress and reference
- `/profile`: optional device-local profile, not online sign-in

Guest learners can access every case. Profile copy does not promise locked pathways or cloud sync that are not implemented.

## Curriculum source

The parent repository's `data/training_cases.json` is authoritative. `app/cases.json` is its delivery copy so this folder is independently buildable. After authoring a case, copy the JSON to `app/cases.json` and run the parent Python tests; they check exact parity.

## State and assumptions

- Progress and notes remain in browser local storage under `lighthouse-training-v1`.
- There is no learner account, backend progress database, or cross-device sync.
- Optional display name and learning focus use `lighthouse-profile-v1`. Removing the profile preserves case progress.
- Browser storage belongs to an origin. Progress at the old Sites address does not automatically move to the Vercel domain; export the old practice report before leaving if needed.
- Clear browser storage or use the confirmed reset action to remove local records.
- Download the practice report before resetting or switching devices.
- If storage is denied or full, an inline message tells the learner to export before leaving.
- Retry replaces current answers and score while preserving notes and the submission count.
- Skill evidence is derived from current submitted answers, not stored mastery claims. One correct mapped decision demonstrates a skill; at least two distinct cases are needed for repeated demonstration. Retrying one case cannot inflate the count. Incorrect decisions still record practice. Written and unassessed contextual actions cannot earn automatic demonstrations.
- Introduced means a capability is listed in the library, not that a learner has earned an assessment result. Skills with no linked case are clearly labelled.
- New notes start with editable template text. Heading labels are excluded from minimum-response validation; existing notes remain intact.
- Evidence timestamps are synthetic UTC; addresses use reserved documentation ranges and `.example` domains.
- The answer key is included in the client. This is open practice, not a secure examination.
- Optional WebMCP navigation starts an existing case. Unsupported browsers use normal buttons. Contract tests use a mocked registration context; live WebMCP integration remains unverified.

## Validation boundaries

Component tests exercise the learner flow in jsdom, including validation, feedback, reload, retry, download initiation, and reset. They are not browser layout or accessibility certification. Responsive styles, labels, focus outlines, reduced-motion support, and a skip link are implemented; real-browser visual review remains a separate check.

## Logo provenance

`public/lighthouse-mark.png` implements the user-supplied signal-tower reference: navy tower, gold lamp and beams, and slate signal arcs. The transparent production asset was generated from that reference. The hero is a product evidence fragment based on LH-102, not a stock SOC photograph or a claim of live telemetry.
