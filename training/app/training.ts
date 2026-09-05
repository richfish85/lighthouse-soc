import dataset from './cases.json';
export type Attempt = { answers: Record<string, number>; notes: string; submitted: boolean; tries: number };
export type Progress = Record<string, Attempt>;
type Case = (typeof dataset.cases)[number];
export function grade(c: Case, answers: Record<string, number>) {
  const correct = c.questions.filter(q => answers[q.id] === q.answer).length;
  return { correct, total: c.questions.length, score: Math.round(correct / c.questions.length * 100) };
}
export function readProgress(raw: string | null): Progress {
  if (!raw) return {};
  try {
    const input = JSON.parse(raw);
    if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
    const result: Progress = {};
    for (const c of dataset.cases) {
      const a = input[c.id];
      if (!a || typeof a !== 'object') continue;
      const answers: Record<string, number> = {};
      for (const q of c.questions) {
        const value = a.answers?.[q.id];
        if (Number.isInteger(value) && value >= 0 && value < q.options.length) answers[q.id] = value;
      }
      const notes = typeof a.notes === 'string' ? a.notes.slice(0, 12000) : '';
      result[c.id] = { answers, notes, submitted: a.submitted === true && Object.keys(answers).length === c.questions.length && notes.trim().length >= 40, tries: Number.isSafeInteger(a.tries) && a.tries >= 0 ? a.tries : 0 };
    }
    return result;
  } catch { return {}; }
}
