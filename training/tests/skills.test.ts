import { expect, it } from 'vitest';
import { skills, skillEvidence } from '../app/skills';
import dataset from '../app/cases.json';
import { HANDOVER_TEMPLATE, handoverContent } from '../app/handover';
import type { Progress } from '../app/training';

function completed(ids: string[]): Progress {
  return Object.fromEntries(ids.map(id => { const c = dataset.cases.find(c => c.id === id)!; return [id, { submitted: true, tries: 30, notes: c.handover, answers: Object.fromEntries(c.questions.map(q => [q.id, q.answer])) }]; }));
}
it('links every assessed capability to a real case decision', () => {
  expect(new Set(skills.map(s => s.id)).size).toBe(skills.length);
  skills.forEach(skill => {
    skill.related.forEach(id => expect(skills.some(s => s.id === id)).toBe(true));
    skill.evidence.forEach(ref => {
      const c = dataset.cases.find(c => c.id === ref.caseId);
      expect(c).toBeTruthy();
      if (ref.questionId) expect(c!.questions.some(q => q.id === ref.questionId)).toBe(true);
    });
  });
});
it('counts distinct cases rather than retries as repeat demonstrations', () => {
  const skill = skills.find(s => s.id === 'triage')!;
  expect(skillEvidence(skill, {}).level).toBe('Introduced');
  const progress = completed(['LH-101']);
  expect(skillEvidence(skill, progress).level).toBe('Demonstrated');
  expect(skillEvidence(skill, progress).successfulCases).toHaveLength(1);
  Object.assign(progress, completed(['LH-102']));
  expect(skillEvidence(skill, progress).level).toBe('Repeatedly demonstrated');
  expect(skillEvidence(skill, progress).types).toBe(2);
});
it('does not award demonstrations for incorrect or unsubmitted answers', () => {
  const skill = skills.find(s => s.id === 'triage')!;
  const p = completed(['LH-101']); p['LH-101'].answers.verdict = 0;
  expect(skillEvidence(skill, p).level).toBe('Practised');
  p['LH-101'].submitted = false;
  expect(skillEvidence(skill, p).level).toBe('Introduced');
});
it('does not automatically assess written handovers or unassessed contextual actions', () => {
  const p = completed(dataset.cases.map(c => c.id));
  expect(skillEvidence(skills.find(s => s.id === 'handover')!, p).level).toBe('Practised');
  expect(skillEvidence(skills.find(s => s.id === 'command-line')!, p).level).toBe('Practised');
  expect(skillEvidence(skills.find(s => s.id === 'persistence')!, p).successfulCases).toHaveLength(0);
});
it('only counts learner-authored handover text, even when typed beside headings', () => {
  expect(handoverContent(HANDOVER_TEMPLATE)).toBe('');
  expect(handoverContent(HANDOVER_TEMPLATE.replace('Situation / alert:', 'Situation / alert: Phishing'))).toBe('Phishing');
  expect(handoverContent('My original handover stays valid.')).toBe('My original handover stays valid.');
});
