import dataset from './cases.json';
import type { Progress } from './training';
export type Skill = { id: string; title: string; domain: string; description: string; related: string[]; evidence: { caseId: string; questionId?: string }[] };
const refs = (...values: string[]) => values.map(v => { const [caseId, questionId] = v.split('/'); return { caseId, questionId }; });
export const skills: Skill[] = [
  { id: 'triage', title: 'Alert triage', domain: 'Investigation', description: 'Classify a signal using corroborated evidence and a plausible alternative explanation.', related: ['hypotheses', 'conclusions'], evidence: refs('LH-101/verdict','LH-102/verdict','LH-201/verdict','LH-202/verdict','LH-203/verdict') },
  { id: 'collection', title: 'Evidence collection', domain: 'Investigation', description: 'Choose the records needed to resolve an investigation question.', related: ['scope','timeline'], evidence: refs('LH-201/evidence','LH-202/evidence') },
  { id: 'timeline', title: 'Timeline reconstruction', domain: 'Investigation', description: 'Correlate activity across sources by identity, asset, session, and time.', related: ['authentication','process-tree'], evidence: refs('LH-102/evidence','LH-301/evidence') },
  { id: 'scope', title: 'Scope determination', domain: 'Investigation', description: 'Name the affected population and the limits of the reviewed evidence.', related: ['collection','conclusions'], evidence: refs('LH-101/scope','LH-202/verdict') },
  { id: 'hypotheses', title: 'Hypothesis testing', domain: 'Investigation', description: 'Test benign and malicious explanations instead of treating an alert as a verdict.', related: ['network','triage'], evidence: refs('LH-102/verdict','LH-203/evidence') },
  { id: 'network', title: 'Establish network context', domain: 'Identity', description: 'Explain an address or apparent location using verified network context.', related: ['travel','authentication'], evidence: refs('LH-102/evidence','LH-203/verdict') },
  { id: 'authentication', title: 'Authentication analysis', domain: 'Identity', description: 'Correlate identity, device, session, and authentication evidence.', related: ['travel','mfa'], evidence: refs('LH-102/evidence','LH-301/evidence') },
  { id: 'travel', title: 'Impossible-travel analysis', domain: 'Identity', description: 'Distinguish an approved VPN exit from evidence of account compromise.', related: ['network','account-risk'], evidence: refs('LH-102/verdict') },
  { id: 'mfa', title: 'MFA investigation', domain: 'Identity', description: 'Consider user verification and repeated prompts when assessing a successful sign-in.', related: ['authentication','account-risk'], evidence: refs('LH-301/priority') },
  { id: 'account-risk', title: 'Account compromise assessment', domain: 'Identity', description: 'Assess whether identity and follow-on activity justify urgent response.', related: ['mfa','severity'], evidence: refs('LH-102/action','LH-301/priority') },
  { id: 'process-tree', title: 'Process-tree analysis', domain: 'Endpoint', description: 'Use a parent-child execution chain to explain suspicious behaviour.', related: ['command-line','containment'], evidence: refs('LH-201/verdict') },
  { id: 'command-line', title: 'Command-line interpretation', domain: 'Endpoint', description: 'Read the available command context without running suspicious content.', related: ['process-tree'], evidence: refs('LH-201') },
  { id: 'persistence', title: 'Persistence identification', domain: 'Endpoint', description: 'Recognise mechanisms that allow unwanted access to survive a restart or new session. No dedicated exercise yet.', related: ['process-tree'], evidence: [] },
  { id: 'containment', title: 'Host containment assessment', domain: 'Endpoint', description: 'Recommend authorised isolation while preserving useful evidence.', related: ['collection','escalation'], evidence: refs('LH-201/action') },
  { id: 'headers', title: 'Email header analysis', domain: 'Email', description: 'Interpret authentication and alignment clues without treating SPF as a complete verdict.', related: ['sender','urls'], evidence: refs('LH-101/verdict') },
  { id: 'sender', title: 'Sender validation', domain: 'Email', description: 'Compare claimed identity, authentication, and known business context.', related: ['headers'], evidence: refs('LH-101/verdict') },
  { id: 'urls', title: 'URL analysis', domain: 'Email', description: 'Compare a displayed link and actual destination with an approved service.', related: ['sender'], evidence: refs('LH-101') },
  { id: 'attachments', title: 'Attachment investigation', domain: 'Email', description: 'Assess attachment behaviour safely using suitable evidence. No dedicated assessment yet.', related: ['process-tree','collection'], evidence: refs('LH-201') },
  { id: 'severity', title: 'Severity assessment', domain: 'Analyst Practice', description: 'Use the stated impact rubric to explain urgency without inventing an outage.', related: ['triage','escalation'], evidence: refs('LH-301/priority') },
  { id: 'escalation', title: 'Escalation decisions', domain: 'Analyst Practice', description: 'Choose an appropriate responder and proportionate next action.', related: ['severity','containment'], evidence: refs('LH-201/action','LH-202/action','LH-301/action') },
  { id: 'conclusions', title: 'Evidence-based conclusions', domain: 'Analyst Practice', description: 'Separate observed behaviour, potential impact, and unknown outcomes.', related: ['scope','handover'], evidence: refs('LH-101/verdict','LH-201/verdict','LH-202/verdict','LH-301/evidence') },
  { id: 'handover', title: 'Handover writing', domain: 'Analyst Practice', description: 'Document facts, gaps, response state, next action, and owner. Written work is self-reviewed, not automatically assessed.', related: ['documentation','conclusions'], evidence: refs(...dataset.cases.map(c => c.id)) },
  { id: 'documentation', title: 'Incident documentation', domain: 'Analyst Practice', description: 'Leave a useful practice record for another analyst. Notes require self-review.', related: ['handover'], evidence: refs(...dataset.cases.map(c => c.id)) },
];
export function skillEvidence(skill: Skill, progress: Progress) {
  const demonstrations = skill.evidence.filter(ref => {
    const attempt = progress[ref.caseId];
    const question = dataset.cases.find(c => c.id === ref.caseId)?.questions.find(q => q.id === ref.questionId);
    return attempt?.submitted && question && attempt.answers[question.id] === question.answer;
  });
  const successfulCases = [...new Set(demonstrations.map(ref => ref.caseId))];
  const practisedCases = [...new Set(skill.evidence.filter(ref => progress[ref.caseId]?.submitted).map(ref => ref.caseId))];
  const types = new Set(successfulCases.map(id => dataset.cases.find(c => c.id === id)!.category));
  const level = successfulCases.length >= 2 ? 'Repeatedly demonstrated' : successfulCases.length === 1 ? 'Demonstrated' : practisedCases.length ? 'Practised' : 'Introduced';
  return { level, demonstrations, successfulCases, practisedCases, types: types.size };
}
