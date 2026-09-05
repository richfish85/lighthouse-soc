import { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { skills, skillEvidence } from './skills';
import type { Progress } from './training';
import dataset from './cases.json';
export default function AnalystSkills({ progress, openCase }: { progress: Progress; openCase: (id: string) => void }) {
  const [filter, setFilter] = useState('All domains');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const domains = [...new Set(skills.map(s => s.domain))];
  const visible = skills.filter(s => (filter === 'All domains' || s.domain === filter) && `${s.title} ${s.description}`.toLowerCase().includes(query.toLowerCase()));
  return <><p className="eyebrow">YOUR CAPABILITY MAP</p><h1>Analyst Skills</h1><p className="lede">Cases are situations. Skills are capabilities you can use again.</p>
    <div className="skill-key"><span>Introduced</span><ArrowRight size={15}/><span>Practised</span><ArrowRight size={15}/><span>Demonstrated</span><ArrowRight size={15}/><span>Repeatedly demonstrated</span></div>
    <p className="small muted">A correct mapped decision is one practice demonstration. Repeated demonstration requires two different cases; retrying one case does not add evidence. Written handovers remain self-reviewed.</p>
    <div className="skill-filters"><label><Search size={16}/> <input aria-label="Find an analyst skill" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a capability…"/></label><label className="domain-filter">Domain<select value={filter} onChange={e => setFilter(e.target.value)}>{['All domains', ...domains].map(d => <option key={d}>{d}</option>)}</select></label></div>
    {!visible.length && <p className="panel">No skills match that search. Try another term or domain.</p>}
    {domains.map(domain => { const rows = visible.filter(s => s.domain === domain); return rows.length > 0 && <section className="skill-domain" key={domain}><h2>{domain}</h2><div className="skills-grid">{rows.map(skill => { const evidence = skillEvidence(skill, progress); return <article className="skill-card" key={skill.id}><div className="card-top"><span className={`status ${evidence.successfulCases.length ? 'done' : ''}`}>{evidence.level}</span><span className="small muted">{evidence.successfulCases.length} demonstrated</span></div><h3>{skill.title}</h3><p>{skill.description}</p><button className="text-button" aria-expanded={expanded === skill.id} onClick={() => setExpanded(expanded === skill.id ? null : skill.id)}>View practice evidence <ArrowRight size={15}/></button>{expanded === skill.id && <div className="skill-evidence"><p>{evidence.successfulCases.length} distinct successful cases · {evidence.types} investigation types</p>{!skill.evidence.length && <p>No linked case yet. Introduced means this capability is in the library, not that you have demonstrated it.</p>}{[...new Set(skill.evidence.map(r => r.caseId))].map(id => <button key={id} onClick={() => openCase(id)}><span>{evidence.successfulCases.includes(id) ? '✓' : evidence.practisedCases.includes(id) ? '◐' : '○'}</span>{dataset.cases.find(c => c.id === id)!.title}</button>)}{skill.evidence.some(r => !r.questionId) && <p className="small muted">Contextual practice is linked here, but unassessed actions do not award demonstrations.</p>}<strong>Related capabilities</strong><p>{skill.related.map(id => skills.find(s => s.id === id)?.title).join(' · ')}</p></div>}</article>; })}</div></section>; })}
  </>;
}
