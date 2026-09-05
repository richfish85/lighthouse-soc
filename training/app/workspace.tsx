"use client";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { registerTrainingTools } from "./webmcp";
import { ArrowRight, ArrowLeft, BookOpen, Check, CheckCircle2, ChevronRight, Clock3, Download, FileText, FlaskConical, GraduationCap, LayoutDashboard, RotateCcw, Search, Shield, Target } from "lucide-react";
import dataset from "./cases.json";
import AnalystSkills from "./analyst-skills";
import Brand from "./brand";
import { HANDOVER_TEMPLATE, handoverContent } from "./handover";
import { skills, skillEvidence } from "./skills";
import { grade, readProgress, type Progress, type Attempt } from "./training";
const cases = dataset.cases;
const storageKey = "lighthouse-training-v1";
const stages = ["Briefing", "Evidence", "Decisions", "Debrief"];
export default function Home({ initialView = "path" }: { initialView?: string }) {
  const [view, setView] = useState(initialView);
  const [selected, setSelected] = useState(cases[0].id);
  const [stage, setStage] = useState(0);
  const [evidence, setEvidence] = useState(0);
  const [progress, setProgress] = useState<Progress>({});
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [formError, setFormError] = useState("");
  const [reset, setReset] = useState(false);
  const c = cases.find(item => item.id === selected)!;
  const attempt: Attempt = progress[c.id] ?? { answers: {}, notes: HANDOVER_TEMPLATE, submitted: false, tries: 0 };
  const completed = cases.filter(item => progress[item.id]?.submitted).length;
  const passed = cases.filter(item => progress[item.id]?.submitted && grade(item, progress[item.id].answers).score === 100).length;
  const next = cases.find(item => !progress[item.id]?.submitted) ?? cases[0];
  useEffect(() => registerTrainingTools(document.modelContext, id => {
    flushSync(() => { setSelected(id); setView("case"); setStage(0); setEvidence(0); setFormError(""); });
  }), []);
  useEffect(() => {
    // Hydrate browser-only storage after the server render to avoid a hydration mismatch.
    // oxlint-disable-next-line react/react-compiler
    try { setProgress(readProgress(localStorage.getItem(storageKey))); }
    catch { setStorageError("Device storage is unavailable. You can still practise, but download your report before leaving."); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); }
    // Surface external storage failures while leaving the practice flow available.
    // oxlint-disable-next-line react/react-compiler
    catch { setStorageError("Progress could not be saved on this device. Download your report before leaving."); }
  }, [progress, ready]);
  function update(patch: Partial<Attempt>) { setProgress(previous => ({ ...previous, [c.id]: { ...attempt, ...patch } })); }
  function openCase(id: string) { setSelected(id); setView("case"); setStage(0); setEvidence(0); setFormError(""); }
  function submit() {
    if (!c.questions.every(q => Number.isInteger(attempt.answers[q.id]))) { setFormError("Choose an answer for each decision before submitting."); return; }
    if (handoverContent(attempt.notes).length < 40) { setFormError("Add a handover of at least 40 characters to your notebook. It is for self-review, not automatically graded."); return; }
    update({ submitted: true, tries: attempt.tries + 1 }); setStage(3); setFormError("");
  }
  function exportReport() {
    const lines = ["# Lighthouse SOC — practice report", "", `Exported: ${new Date().toISOString()}`, "Synthetic, self-paced practice. Not a certification or independently assessed qualification.", "Decision scores are automatic; written handovers require self-review.", ""];
    for (const item of cases) {
      const a = progress[item.id]; if (!a) continue;
      lines.push(`## ${item.id}: ${item.title}`, `Status: ${a.submitted ? "Submitted" : "In progress"}`, `Submitted attempts: ${a.tries}`);
      if (a.submitted) lines.push(`Decision score: ${grade(item, a.answers).score}%`);
      lines.push("", "### My handover", a.notes || "No notes yet.", "");
      if (a.submitted) item.questions.forEach(q => lines.push(`- ${q.prompt}`, `  Selected: ${q.options[a.answers[q.id]] ?? "Unanswered"}`, `  Feedback: ${q.explanation}`));
      lines.push("");
    }
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "lighthouse-practice-report.md"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <aside className="sidebar">
      <Brand light/>
      <div className="sidebar-label">WORKSPACE</div>
      <nav aria-label="Main navigation">
        <button className={view === "path" ? "nav active" : "nav"} onClick={() => setView("path")}><LayoutDashboard size={18}/> Learning path</button>
        <button className={view === "case" ? "nav active" : "nav"} onClick={() => openCase(selected)}><Search size={18}/> Investigation lab</button>
        <button className={view === "skills" ? "nav active" : "nav"} onClick={() => setView("skills")}><Target size={18}/> Analyst Skills</button>
        <button className={view === "progress" ? "nav active" : "nav"} onClick={() => setView("progress")}><GraduationCap size={18}/> My progress</button>
        <button className={view === "guide" ? "nav active" : "nav"} onClick={() => setView("guide")}><BookOpen size={18}/> Field guide</button>
      </nav>
      <div className="sidebar-course"><span className="eyebrow">YOUR LEARNING PATH</span><strong>Junior analyst foundations</strong><div className="progress-track"><span style={{ width: `${completed / cases.length * 100}%` }}/></div><span>{completed} of {cases.length} cases submitted</span></div>
      <a className="nav" href="/profile">Your profile</a><a className="nav" href="/">About Lighthouse ↗</a><div className="sidebar-bottom"><span className="local-dot"/> Practice environment<p>Fictional cases. Real reasoning.</p><a href="https://github.com/richfish85/lighthouse-soc" target="_blank" rel="noreferrer">View project on GitHub ↗</a></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><span>Training workspace <ChevronRight size={14}/> {view === "case" ? c.id : view === "skills" ? "Analyst Skills" : view === "progress" ? "My progress" : view === "guide" ? "Field guide" : "Learning path"}</span><span className="demo-tag"><FlaskConical size={15}/> SYNTHETIC LAB</span></header>
      <main id="main" tabIndex={-1}>
        {storageError && <output className="notice">{storageError}</output>}
        {!ready ? <output>Loading your local progress…</output> : <>
        {view === "skills" && <AnalystSkills progress={progress} openCase={openCase}/>}
        {view === "path" && <>
          <div className="page-heading"><div><p className="eyebrow">LEARN TO INVESTIGATE</p><h1>Make the next call<br/><span>with evidence.</span></h1><p className="lede">Work the alert. Build the picture. Leave a handover<br className="desktop-break"/> another analyst can act on.</p></div><div className="path-stamp"><Target size={30}/><strong>6 practical cases</strong><span>About 1 hr 45 min · Self-paced</span></div></div>
          <section className="featured" aria-labelledby="resume-title"><div><span className="eyebrow">{completed === cases.length ? "KEEP PRACTISING" : progress[next.id] ? "CONTINUE YOUR CASE" : "YOUR NEXT INVESTIGATION"}</span><h2 id="resume-title">{next.title}</h2><p>{next.summary}</p><div className="meta"><span>{next.id}</span><span>{next.level}</span><span><Clock3 size={14}/>{next.minutes} min</span></div></div><button className="primary" onClick={() => openCase(next.id)}>{progress[next.id] ? "Open case" : "Start investigation"}<ArrowRight size={18}/></button></section>
          <div className="section-heading"><div><h2>Your learning path</h2><p>Start with the foundations, then work towards your shift handover.</p></div><span className="muted">All cases unlocked</span></div>
          <div className="case-grid">{cases.map((item, index) => { const a = progress[item.id]; return <button className="case-card" key={item.id} onClick={() => openCase(item.id)}><div className="card-top"><span className="case-number">0{index + 1}</span><span className={`status ${a?.submitted ? "done" : ""}`}>{a?.submitted ? <><Check size={13}/> {grade(item, a.answers).score}%</> : a ? "In progress" : item.level}</span></div><span className="category">{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><div className="card-footer"><span><Clock3 size={14}/>{item.minutes} min · 3 decisions</span><ArrowRight size={18}/></div></button>; })}</div>
          <div className="method-strip"><span><FileText size={18}/> Read the briefing</span><ChevronRight size={16}/><span><Search size={18}/> Inspect the evidence</span><ChevronRight size={16}/><span><Target size={18}/> Make your decisions</span><ChevronRight size={16}/><span><BookOpen size={18}/> Review the reasoning</span></div>
        </>}
        {view === "case" && <>
          <button className="text-button" onClick={() => setView("path")}><ArrowLeft size={16}/> Back to learning path</button>
          <div className="case-heading"><div><p className="eyebrow">{c.id} / {c.category}</p><h1>{c.title}</h1><p className="muted">{c.level} · {c.minutes} min · All timestamps UTC</p></div>{attempt.submitted && <span className="status done"><CheckCircle2 size={16}/> {grade(c, attempt.answers).score}% decisions</span>}</div>
          <nav className="stage-nav" aria-label="Investigation stages">{stages.map((label, i) => <button key={label} disabled={i === 3 && !attempt.submitted} className={stage === i ? "selected" : ""} aria-current={stage === i ? "step" : undefined} onClick={() => setStage(i)}><span>{i + 1}</span>{label}</button>)}</nav>
          <div className="investigation-grid"><section className="investigation-content">
            {stage === 0 && <><div className="panel"><span className="eyebrow">THE SITUATION</span><h2>Your shift starts here.</h2><p>{c.brief}</p><h3>What you’ll practise</h3><ul className="objectives">{c.objectives.map(x => <li key={x}><CheckCircle2 size={17}/>{x}</li>)}</ul></div><div className="lesson"><BookOpen size={20}/><div><h3>Before you investigate</h3><p>{c.lesson}</p></div></div><button className="primary" onClick={() => setStage(1)}>Open evidence room<ArrowRight size={18}/></button></>}
            {stage === 1 && <><div className="section-heading"><div><h2>Evidence room</h2><p>Read all three records. Cite their IDs in your notebook.</p></div></div><fieldset className="evidence-tabs" aria-label="Evidence records">{c.evidence.map((item, i) => <button aria-pressed={evidence === i} className={evidence === i ? "selected" : ""} key={item.id} onClick={() => setEvidence(i)}>{item.id} · {item.title}</button>)}</fieldset><article className="evidence-record"><div><span className="evidence-id">{c.evidence[evidence].id}</span><h3>{c.evidence[evidence].title}</h3><p>{c.evidence[evidence].source}</p></div><pre>{c.evidence[evidence].body}</pre></article><p className="small muted">All records and addresses are synthetic. Suspicious destinations are inert training text.</p><button className="primary" onClick={() => setStage(2)}>Make your decisions<ArrowRight size={18}/></button></>}
            {stage === 2 && <><h2>What does the evidence support?</h2><p className="muted">Choose one answer per decision. You can return to the evidence at any time.</p><form onSubmit={event => { event.preventDefault(); submit(); }}>{c.questions.map((q, i) => <fieldset className="question" key={q.id} disabled={attempt.submitted}><legend><span className="eyebrow">DECISION 0{i + 1} · {q.skill}</span>{q.prompt}</legend>{q.options.map((option, oi) => <label className={attempt.answers[q.id] === oi ? "option chosen" : "option"} key={option}><input type="radio" name={q.id} value={oi} checked={attempt.answers[q.id] === oi} onChange={() => update({ answers: { ...attempt.answers, [q.id]: oi } })}/><span>{option}</span></label>)}</fieldset>)}{formError && <p role="alert" className="notice">{formError}</p>}{attempt.submitted ? <button type="button" className="primary" onClick={() => setStage(3)}>View debrief<ArrowRight size={18}/></button> : <><p className="small muted">Add a short handover to your notebook before submitting. Only the three decisions are automatically scored.</p><button type="submit" className="primary">Submit investigation<ArrowRight size={18}/></button></>}</form></>}
            {stage === 3 && attempt.submitted && <><div className="score-panel"><span className="eyebrow">INVESTIGATION DEBRIEF</span><strong>{grade(c, attempt.answers).score}<span>%</span></strong><h2>{grade(c, attempt.answers).score === 100 ? "Your decisions are evidence-led." : "Good practice starts with a review."}</h2><p>{grade(c, attempt.answers).correct} of 3 decisions correct. Your written handover is for self-review.</p></div>{c.questions.map(q => <div key={q.id} className="feedback"><span className={`status ${attempt.answers[q.id] === q.answer ? "done" : "review"}`}>{attempt.answers[q.id] === q.answer ? "Correct" : "Review this decision"} · {q.skill}</span><h3>{q.prompt}</h3><p><strong>You chose:</strong> {q.options[attempt.answers[q.id]]}</p>{attempt.answers[q.id] !== q.answer && <p><strong>Best supported:</strong> {q.options[q.answer]}</p>}<p>{q.explanation}</p></div>)}<div className="panel"><h3>Review your handover</h3><p>{c.reflection}</p><p className="small muted">Check for: timing, scope, evidence IDs, facts versus unknowns, response state, next action, and owner.</p><details><summary>Compare with an example handover</summary><p>{c.handover}</p></details></div><div className="button-row"><button className="secondary" onClick={() => { update({ answers: {}, submitted: false }); setStage(1); setFormError(""); }}><RotateCcw size={16}/> Retry decisions</button><button className="primary" onClick={() => { const i = cases.indexOf(c); if (i < cases.length - 1) openCase(cases[i + 1].id); else setView("progress"); }}>{cases.indexOf(c) < cases.length - 1 ? "Next case" : "View progress"}<ArrowRight size={18}/></button></div><p className="small muted">Retry replaces your current answers and score. Your notes and submitted-attempt count stay saved.</p></>}
          </section><aside className="notebook"><div className="notebook-title"><FileText size={18}/><h2>Analyst notebook</h2></div><p>Build a handover as you investigate. Separate facts, assumptions, and open questions.</p><label htmlFor="notes">Your working notes & handover</label><textarea id="notes" maxLength={12000} value={attempt.notes} onChange={event => update({ notes: event.target.value })} placeholder={"Facts + evidence IDs:\n\nScope / time:\n\nUnknowns:\n\nActions taken / proposed:\n\nNext owner:"}/><span className="small muted">{attempt.notes.length}/12,000 · {storageError ? "Not saved to device" : "Saved on this device"}</span><details className="template-reference"><summary>Recommended handover structure</summary><pre>{HANDOVER_TEMPLATE}</pre><p className="small">Keep these headings and add your findings below them. Template headings do not count as your written response.</p></details><div className="notebook-tip"><strong>A useful analyst habit</strong><p>“Not observed” is different from “did not happen.” Always name the limits of your evidence.</p></div></aside></div>
        </>}
        {view === "progress" && <><p className="eyebrow">YOUR PRACTICE RECORD</p><h1>Progress you can explain.</h1><p className="lede">Track your decisions and take your written reasoning with you.</p><div className="metric-grid"><div><span>Cases submitted</span><strong>{completed}<small> / 6</small></strong></div><div><span>All decisions correct</span><strong>{passed}<small> / 6</small></strong></div><div><span>Storage</span><strong className="text-metric">This device</strong></div></div><div className="panel"><h2>Your reusable capabilities</h2><p>{skills.filter(skill => skillEvidence(skill, progress).successfulCases.length > 0).length} of {skills.length} library skills have a successful mapped decision. Written handovers remain self-reviewed.</p><button className="text-button" onClick={() => setView("skills")}>Explore Analyst Skills <ArrowRight size={16}/></button></div><div className="progress-list">{cases.map(item => { const a = progress[item.id]; return <button onClick={() => openCase(item.id)} key={item.id}><span><small>{item.id} · {item.category}</small><strong>{item.title}</strong></span><span>{a?.submitted ? `${grade(item, a.answers).score}% · ${a.tries} attempt${a.tries === 1 ? "" : "s"}` : a ? "In progress" : "Not started"}<ChevronRight size={18}/></span></button>; })}</div><div className="button-row"><button className="primary" onClick={exportReport}><Download size={18}/> Download practice report</button><button className="text-button" onClick={() => setReset(true)}><RotateCcw size={16}/> Reset progress</button></div>{reset && <div className="notice" role="alert"><p>Delete all answers and notes from this device? Download your report first if you want to keep it.</p><div className="button-row"><button className="secondary" onClick={() => setReset(false)}>Keep my progress</button><button className="danger" onClick={() => { setProgress({}); setReset(false); setStage(0); }}>Delete my local progress</button></div></div>}<p className="small muted">No account or cross-device sync. Clearing browser data removes your practice record. Scores are self-paced practice, not certification.</p></>}
        {view === "guide" && <><p className="eyebrow">FIELD GUIDE</p><h1>A repeatable investigation.</h1><p className="lede">Use this structure when the alert is noisy and the next step isn’t obvious.</p><div className="guide-grid">{[["01", "Triage", "Identify the signal, affected identity or asset, time window, and potential impact. Explain your priority with the available evidence."], ["02", "Correlate", "Compare independent sources. Build a timeline. Look for both supporting evidence and a benign explanation that you can test."], ["03", "Respond", "Recommend the least disruptive effective action under the authorised playbook. Preserve evidence and confirm whether an action actually succeeded."], ["04", "Hand over", "Record facts, scope, unknowns, completed versus proposed actions, and the next owner. Another analyst should be able to continue without guessing."]].map(([n, title, body]) => <article className="panel" key={n}><span className="case-number">{n}</span><h2>{title}</h2><p>{body}</p></article>)}</div><div className="panel"><h2>Common terms</h2><dl><dt>Triage</dt><dd>The initial assessment of urgency, credibility, and scope.</dd><dt>Containment</dt><dd>An authorised action to limit ongoing harm, such as isolating a workstation or revoking a session.</dd><dt>False positive / explained detection</dt><dd>An alert whose suspicious pattern is explained by verified legitimate activity. Document why this instance is safe to close.</dd><dt>Evidence gap</dt><dd>A missing source, delayed log, or unreviewed time window. State it explicitly instead of treating missing evidence as certainty.</dd></dl></div><div className="lesson"><Shield size={22}/><div><h3>About this lab</h3><p>Lighthouse SOC is a synthetic learning project by Richard Fisher. Actions are recommendations inside fictional cases. The original local Streamlit simulator provides the Reporter → Analyst → SOC Lead incident workflow. This web lab adds guided investigations and feedback.</p><p>Decision feedback is a published practice rubric. Notes are not graded by AI or a human instructor. Don’t paste real incidents or personal information into this demo.</p></div></div></>}
        </>}
        <footer><span>LIGHTHOUSE SOC <span className="footer-dot">/</span> Learn the reasoning behind the response.</span><span>Built by Richard Fisher · Synthetic training</span></footer>
      </main>
    </div>
  </div>;
}
