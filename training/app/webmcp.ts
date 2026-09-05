import dataset from './cases.json';
type Tool = { name: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean }; execute: (input: unknown) => unknown };
type Context = { registerTool: (tool: Tool, options: { signal: AbortSignal }) => void | Promise<void> };
export function registerTrainingTools(context: Context | undefined, start: (id: string) => void) {
  const lifetime = new AbortController();
  if (!context?.registerTool) return () => lifetime.abort();
  const tool: Tool = {
    name: 'start_lighthouse_case',
    description: 'Open a synthetic Lighthouse SOC case at its briefing. Preserves saved answers and notes; does not submit an assessment.',
    inputSchema: { type: 'object', properties: { caseId: { type: 'string', enum: dataset.cases.map(c => c.id) } }, required: ['caseId'], additionalProperties: false },
    annotations: { readOnlyHint: false },
    execute(input) {
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Provide a caseId.');
      const value = input as Record<string, unknown>;
      if (Object.keys(value).length !== 1 || typeof value.caseId !== 'string' || !dataset.cases.some(c => c.id === value.caseId)) throw new Error('Unknown caseId.');
      start(value.caseId);
      return { caseId: value.caseId, stage: 'Briefing' };
    },
  };
  try { void Promise.resolve(context.registerTool(tool, { signal: lifetime.signal })).catch(() => {}); }
  catch { /* Optional browser integration must not block learner navigation. */ }
  return () => lifetime.abort();
}
declare global { interface Document { modelContext?: Context } }
