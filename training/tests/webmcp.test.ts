import { expect, it, vi } from 'vitest';
import { registerTrainingTools } from '../app/webmcp';
it('registers optional navigation with validation and lifecycle cleanup', () => {
  const registerTool = vi.fn(); const start = vi.fn();
  const stop = registerTrainingTools({ registerTool }, start);
  const [tool, options] = registerTool.mock.calls[0];
  expect(tool.name).toBe('start_lighthouse_case');
  expect(tool.annotations.readOnlyHint).toBe(false);
  expect(tool.execute({ caseId: 'LH-201' })).toEqual({ caseId: 'LH-201', stage: 'Briefing' });
  expect(start).toHaveBeenCalledWith('LH-201');
  expect(() => tool.execute({ caseId: 'bad' })).toThrow();
  expect(() => tool.execute({ caseId: 'LH-201', extra: true })).toThrow();
  expect(start).toHaveBeenCalledOnce();
  stop(); expect(options.signal.aborted).toBe(true);
});
it('does not require browser WebMCP support', () => { expect(() => registerTrainingTools(undefined, vi.fn())()).not.toThrow(); });
