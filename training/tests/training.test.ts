import { describe, it, expect } from 'vitest';
import { grade, readProgress } from '../app/training';
import dataset from '../app/cases.json';
describe('practice scoring and local state recovery', () => {
  for (const c of dataset.cases) {
    it(`scores all answer combinations for ${c.id}`, () => {
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let d = 0; d < 3; d++) {
        const indices = [a, b, d];
        const answers = Object.fromEntries(c.questions.map((q, i) => [q.id, indices[i]]));
        const count = c.questions.filter((q, i) => q.answer === indices[i]).length;
        expect(grade(c, answers)).toEqual({ correct: count, total: 3, score: Math.round(count / 3 * 100) });
      }
    });
  }
  it('recovers corrupt storage without crashing', () => {
    for (const value of [null, '{', 'null', '[]', '4', '"oops"']) expect(readProgress(value)).toEqual({});
  });
  it('does not accept forged completion, invalid options, or oversized notes', () => {
    const result = readProgress(JSON.stringify({ 'LH-101': { submitted: true, tries: -1, notes: 'x'.repeat(13000), answers: { verdict: 8, scope: true, action: '0' } }, unknown: {} }));
    expect(Object.keys(result)).toEqual(['LH-101']);
    expect(result['LH-101']).toEqual({ submitted: false, tries: 0, notes: 'x'.repeat(12000), answers: {} });
  });
  it('restores a completed attempt with no score supplied by storage', () => {
    const c = dataset.cases[0];
    const a = { answers: Object.fromEntries(c.questions.map(q => [q.id, q.answer])), notes: c.handover, submitted: true, tries: 1 };
    expect(readProgress(JSON.stringify({ [c.id]: a }))[c.id]).toEqual(a);
  });
});
