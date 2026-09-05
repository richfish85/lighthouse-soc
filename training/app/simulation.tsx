import { useState } from 'react';
import Brand from './brand';
import {
  playbooks,
  priority,
  report,
  resolved,
  restore,
  seed,
  statuses,
  STORAGE_KEY,
  update,
  type Incident,
  type Role,
} from './simulation-model';
import './simulation.css';

export default function Simulation() {
  const [loaded] = useState(() => {
    try {
      return { items: restore(localStorage.getItem(STORAGE_KEY)), error: '' };
    } catch (e) {
      return { items: [] as Incident[], error: String(e) };
    }
  });
  const [items, setItems] = useState(loaded.items);
  const [error, setError] = useState(loaded.error);
  const [role, setRole] = useState<Role>('Analyst');
  const [selected, setSelected] = useState('');
  const [filter, setFilter] = useState('Open');
  const [search, setSearch] = useState('');
  const [note, setNote] = useState('');
  const [shared, setShared] = useState(false);
  const [message, setMessage] = useState('');
  const [resetting, setResetting] = useState(false);
  const current = items.find((i) => i.id === selected);
  function save(next: Incident[]) {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setError('');
    } catch {
      setError(
        'Browser storage is unavailable or full. Changes work for this visit but will not survive a reload.',
      );
    }
  }
  function act(
    action: 'assign' | 'note' | 'status' | 'step',
    text = '',
    step = 0,
  ) {
    if (!current) return;
    try {
      const changed = update(current, role, action, text, shared, step);
      save(items.map((i) => (i.id === current.id ? changed : i)));
      if (action === 'note') setNote('');
      setMessage('Incident updated.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }
  function choose(id: string) {
    setSelected(id);
    setNote('');
    setMessage('');
    setShared(false);
  }
  const visible = items
    .filter(
      (i) =>
        (filter === 'All' ||
          (filter === 'Open' && !resolved(i)) ||
          filter === i.status) &&
        `${i.id} ${i.type} ${i.user} ${i.asset} ${priority(i).label}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => priority(b).score - priority(a).score);
  return (
    <div className="app-shell simulation">
      <aside className="sidebar">
        <Brand />
        <p className="sidebar-label">TRAINING</p>
        <a className="nav" href="/training">
          Learning Path
        </a>
        <a className="nav" href="/training">
          Investigation Lab
        </a>
        <a className="nav" href="/training/skills">
          Analyst Skills
        </a>
        <a className="nav" href="/training/progress">
          My progress
        </a>
        <a className="nav" href="/training/guide">
          Field guide
        </a>
        <a className="nav active" href="/simulation" aria-current="page">
          Incident Simulator
        </a>
        <a className="nav" href="/profile">
          Your profile
        </a>
        <a className="nav" href="/">
          About Lighthouse
        </a>
      </aside>
      <div className="workspace">
        <header className="topbar">
          Incident Simulator <span className="demo-tag">SYNTHETIC LAB</span>
        </header>
        <main>
          <p className="eyebrow">REPORT → INVESTIGATE → RESPOND → REVIEW</p>
          <h1>Work the SOC queue.</h1>
          <p className="lede">
            Follow a signal across the Reporter Portal, Analyst Console, and SOC
            Lead dashboard.
          </p>
          <p className="notice">
            A separate, device-local simulation using the original repository’s
            six incidents and playbooks. Role switching is for practice, not
            secure sign-in. Response actions affect fictional records only. Use
            synthetic information.
          </p>
          <div className="sim-roles" aria-label="Simulation role">
            {(['Reporter', 'Analyst', 'SOC Lead'] as Role[]).map((r) => (
              <button
                key={r}
                className={role === r ? 'primary' : 'secondary'}
                aria-pressed={role === r}
                onClick={() => {
                  setRole(r);
                  choose('');
                }}
              >
                {r}
              </button>
            ))}
          </div>
          {error && (
            <p role="alert" className="notice">
              {error}
            </p>
          )}
          {message && <output className="notice">{message}</output>}
          {role === 'Reporter' ? (
            <>
              <h2>Reporter Portal</h2>
              <form
                className="panel sim-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const data = new FormData(form);
                  const field = (key: string) => {
                    const value = data.get(key);
                    return typeof value === 'string' ? value : '';
                  };
                  try {
                    const incident = report(items, {
                      type: field('type'),
                      severity: field('severity'),
                      description: field('description'),
                      user: field('user').trim(),
                      asset: field('asset').trim(),
                      ip: field('ip').trim(),
                      evidence: field('evidence'),
                    });
                    save([incident, ...items]);
                    setMessage(
                      `${incident.id} opened. Switch to Analyst to investigate it.`,
                    );
                    form.reset();
                  } catch (err) {
                    setMessage(
                      err instanceof Error ? err.message : String(err),
                    );
                  }
                }}
              >
                <h3>Submit a signal</h3>
                <label>
                  Alert type
                  <select name="type">
                    {playbooks.map((p) => (
                      <option key={p.alert_type}>{p.alert_type}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Estimated severity
                  <select name="severity" defaultValue="Medium">
                    {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Affected identity
                  <input
                    name="user"
                    required
                    maxLength={80}
                    placeholder="olivia.chen"
                  />
                </label>
                <label>
                  Affected asset
                  <input
                    name="asset"
                    required
                    maxLength={80}
                    placeholder="FIN-WS-01"
                  />
                </label>
                <label>
                  Source IP
                  <input name="ip" maxLength={60} placeholder="203.0.113.19" />
                </label>
                <label className="sim-wide">
                  What happened?
                  <textarea
                    name="description"
                    required
                    minLength={20}
                    maxLength={4000}
                  />
                </label>
                <label className="sim-wide">
                  Evidence / timeline (fictional text only)
                  <textarea name="evidence" maxLength={8000} />
                </label>
                <button className="primary" type="submit">
                  Submit signal
                </button>
              </form>
              <h2>My alerts</h2>
              <p>
                Demo reporter: reporter01. Track the incident and any updates
                the analyst chose to share.
              </p>
              {items.map((i) => (
                <article className="panel" key={i.id}>
                  <h3>
                    {i.id} · {i.type}
                  </h3>
                  <p>{i.description}</p>
                  <strong>{i.status}</strong>
                  {i.notes
                    .filter((n) => n.public)
                    .map((n, index) => (
                      <p key={index}>{n.text}</p>
                    ))}
                </article>
              ))}
            </>
          ) : (
            <>
              <h2>
                {role === 'SOC Lead' ? 'SOC Lead dashboard' : 'Analyst Console'}
              </h2>
              <div className="sim-metrics">
                {[
                  ['Incidents', items.length],
                  ['Open backlog', items.filter((i) => !resolved(i)).length],
                  [
                    'P1 open',
                    items.filter(
                      (i) => !resolved(i) && priority(i).label === 'P1',
                    ).length,
                  ],
                  [
                    'Unassigned open',
                    items.filter((i) => !resolved(i) && !i.assigned).length,
                  ],
                ].map(([label, value]) => (
                  <div className="panel" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              {role === 'SOC Lead' && (
                <section className="panel">
                  <h3>Status overview</h3>
                  <div className="sim-roles">
                    {statuses.map((s) => (
                      <span key={s}>
                        {s}:{' '}
                        <strong>
                          {items.filter((i) => i.status === s).length}
                        </strong>
                      </span>
                    ))}
                  </div>
                  <p>
                    Team workload · analyst01:{' '}
                    {
                      items.filter(
                        (i) => !resolved(i) && i.assigned === 'analyst01',
                      ).length
                    }{' '}
                    open incidents. Seed timestamps describe the original
                    scenario; this is not a live operational trend.
                  </p>
                </section>
              )}
              <div className="sim-filters">
                <label>
                  Queue status
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    {['Open', 'All', ...statuses].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Search incidents
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ID, type, identity, asset or priority"
                  />
                </label>
              </div>
              <div className="panel sim-table">
                <table>
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Incident</th>
                      <th>Signal</th>
                      <th>Status</th>
                      <th>Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((i) => (
                      <tr key={i.id}>
                        <td>
                          <strong>{priority(i).label}</strong>
                        </td>
                        <td>
                          <button
                            className="text-button"
                            onClick={() => choose(i.id)}
                          >
                            {i.id}
                          </button>
                        </td>
                        <td>
                          {i.type}
                          <small>
                            {i.asset} · {i.user}
                          </small>
                        </td>
                        <td>{i.status}</td>
                        <td>{i.assigned || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visible.length && <p>No incidents match these filters.</p>}
              </div>
              {current && (
                <section className="panel" aria-label="Incident investigation">
                  <h2>
                    {current.id} · {current.type}
                  </h2>
                  <p>{current.description}</p>
                  <div className="sim-detail">
                    <div>
                      <h3>Evidence & enrichment</h3>
                      <dl>
                        <dt>Identity / asset</dt>
                        <dd>
                          {current.user} / {current.asset}
                        </dd>
                        <dt>Source IP / reputation</dt>
                        <dd>
                          {current.ip || 'Not supplied'} / {current.reputation}
                        </dd>
                        <dt>Network location / user baseline</dt>
                        <dd>
                          {current.location} / {current.baseline}
                        </dd>
                        <dt>Prior related alerts</dt>
                        <dd>{current.repeats}</dd>
                      </dl>
                      <pre>
                        {current.evidence || 'No evidence text supplied.'}
                      </pre>
                      <h3>Explainable priority · {priority(current).label}</h3>
                      <p>
                        Severity {current.severity} + confidence{' '}
                        {current.confidence} + asset criticality{' '}
                        {current.criticality} + account {current.account} ={' '}
                        {priority(current).score}.
                      </p>
                      <p className="small muted">
                        Low=1, Medium=2, High=3, Critical=4; Standard account=0,
                        Service=1, Privileged=2. P1 ≥11 · P2 ≥9 · P3 ≥7 · P4 ≥5
                        · P5 below 5. Enrichment comes from sample records, not
                        live lookups.
                      </p>
                    </div>
                    <div>
                      <h3>Response playbook</h3>
                      {playbooks
                        .find((p) => p.alert_type === current.type)
                        ?.steps.map((s, index) => (
                          <label className="sim-step" key={s}>
                            <input
                              type="checkbox"
                              checked={current.steps.includes(index)}
                              disabled={role !== 'Analyst'}
                              onChange={() => act('step', '', index)}
                            />
                            {s}
                          </label>
                        ))}
                      <p className="small muted">
                        Check steps you have practised. No endpoint, account, or
                        network changes occur.
                      </p>
                      {role === 'Analyst' && (
                        <>
                          <button
                            className="secondary"
                            onClick={() => act('assign')}
                          >
                            Assign to me
                          </button>
                          <label>
                            Analyst note
                            <textarea
                              value={note}
                              maxLength={8000}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="Evidence, findings, unknowns, action rationale and next owner"
                            />
                          </label>
                          <label className="sim-step">
                            <input
                              type="checkbox"
                              checked={shared}
                              onChange={(e) => setShared(e.target.checked)}
                            />
                            Share note with reporter
                          </label>
                          <button
                            className="primary"
                            disabled={!note.trim()}
                            onClick={() => act('note', note)}
                          >
                            Save note
                          </button>
                          <label>
                            Record response
                            <select
                              aria-label="Record response"
                              value={current.status}
                              onChange={(e) => act('status', e.target.value)}
                            >
                              {statuses.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </label>
                          <p className="small muted">
                            Save your rationale before escalation, containment,
                            or closure.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <h3>Analyst notes</h3>
                  {current.notes.length ? (
                    current.notes.map((n, index) => (
                      <article key={index}>
                        <small>
                          {n.time} ·{' '}
                          {n.public ? 'Reporter-visible' : 'Internal'}
                        </small>
                        <p className="sim-note">{n.text}</p>
                      </article>
                    ))
                  ) : (
                    <p>No analyst notes yet.</p>
                  )}
                  <h3>Audit trail</h3>
                  <ul>
                    {current.audit.map((a, index) => (
                      <li key={index}>
                        {a.time} · {a.text}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
          <footer className="panel">
            <h3>Try the whole workflow</h3>
            <p>
              Submit a signal as Reporter → switch to Analyst → open its
              incident → inspect evidence and complete the playbook → save a
              rationale → record a response → switch to SOC Lead to review the
              backlog.
            </p>
            <button className="secondary" onClick={() => setResetting(true)}>
              Reset simulation
            </button>
            {resetting && (
              <div role="alert">
                <p>
                  Replace this simulation’s notes and incidents with the six
                  original samples? Guided training and your profile are kept.
                </p>
                <button
                  className="danger"
                  onClick={() => {
                    save(seed());
                    choose('');
                    setResetting(false);
                  }}
                >
                  Restore sample incidents
                </button>{' '}
                <button
                  className="secondary"
                  onClick={() => setResetting(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </footer>
        </main>
      </div>
    </div>
  );
}
