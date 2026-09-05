import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Site from '../app/site';
import Simulation from '../app/simulation';
import {
  priority,
  report,
  restore,
  seed,
  STORAGE_KEY,
  update,
} from '../app/simulation-model';

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/simulation');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it('routes to the separate simulator and retains the training navigation', async () => {
  render(<Site />);
  expect(
    await screen.findByRole('heading', { name: 'Work the SOC queue.' }),
  ).toBeTruthy();
  expect(
    screen.getByRole('link', { name: 'Learning Path' }).getAttribute('href'),
  ).toBe('/training');
});
it('carries a reporter signal through analyst response, reporter updates and lead review; persists and resets independently', () => {
  localStorage.setItem('lighthouse-training-v1', '{"preserved":true}');
  const view = render(<Simulation />);
  fireEvent.click(screen.getByRole('button', { name: 'Reporter' }));
  fireEvent.change(screen.getByLabelText('Affected identity'), {
    target: { value: 'olivia.chen' },
  });
  fireEvent.change(screen.getByLabelText('Affected asset'), {
    target: { value: 'FIN-WS-01' },
  });
  fireEvent.change(screen.getByLabelText('What happened?'), {
    target: {
      value: 'Fictional payroll email requested an unexpected sign-in.',
    },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit signal' }));
  expect(screen.getByText(/INC-2007 opened/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Analyst' }));
  fireEvent.click(screen.getByRole('button', { name: 'INC-2007' }));
  fireEvent.click(screen.getByRole('button', { name: 'Assign to me' }));
  fireEvent.change(screen.getByLabelText('Record response'), {
    target: { value: 'Contained' },
  });
  expect(screen.getByText(/Save an evidence-based note/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Analyst note'), {
    target: {
      value: 'Internal evidence: fictional session requires containment.',
    },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
  fireEvent.change(screen.getByLabelText('Analyst note'), {
    target: { value: 'Your simulated report has been investigated.' },
  });
  fireEvent.click(screen.getByLabelText('Share note with reporter'));
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
  fireEvent.change(screen.getByLabelText('Record response'), {
    target: { value: 'Contained' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Reporter' }));
  expect(
    screen.queryByText(
      'Internal evidence: fictional session requires containment.',
    ),
  ).toBeNull();
  expect(
    screen.getByText('Your simulated report has been investigated.'),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'SOC Lead' }));
  fireEvent.click(screen.getByRole('button', { name: 'INC-2007' }));
  expect(screen.getByText(/Analyst recorded Contained/)).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Save note' })).toBeNull();
  view.unmount();
  render(<Simulation />);
  fireEvent.click(screen.getByRole('button', { name: 'INC-2007' }));
  expect(screen.getByDisplayValue('Contained')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Reset simulation' }));
  fireEvent.click(
    screen.getByRole('button', { name: 'Restore sample incidents' }),
  );
  expect(screen.queryByRole('button', { name: 'INC-2007' })).toBeNull();
  expect(localStorage.getItem('lighthouse-training-v1')).toBe(
    '{"preserved":true}',
  );
});
it('uses the original additive scoring thresholds, and enriches unknown indicators without inventing intelligence', () => {
  expect(seed().map((i) => priority(i).label)).toEqual([
    'P1',
    'P2',
    'P4',
    'P1',
    'P4',
    'P3',
  ]);
  const i = report(seed(), {
    type: 'Phishing Reported',
    description: 'A synthetic email asked for a password.',
    user: 'unknown',
    asset: 'unknown',
    ip: '192.0.2.200',
    severity: 'Low',
    evidence: '',
  });
  expect(i.reputation).toBe('Unknown');
  expect(i.confidence).toBe('Low');
  expect(priority(i)).toEqual({ score: 4, label: 'P5' });
  expect(() => update(i, 'Reporter', 'assign')).toThrow();
  expect(() => update(i, 'SOC Lead', 'status', 'Closed')).toThrow();
  expect(() => update(i, 'Analyst', 'status', 'invalid')).toThrow();
});
it('handles invalid saved data without silently overwriting it', () => {
  expect(() => restore('[{}]')).toThrow();
  localStorage.setItem(STORAGE_KEY, 'broken');
  render(<Simulation />);
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(localStorage.getItem(STORAGE_KEY)).toBe('broken');
});
it('reports unavailable persistence', () => {
  render(<Simulation />);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('full');
  });
  fireEvent.click(screen.getByRole('button', { name: 'INC-2006' }));
  fireEvent.click(screen.getByRole('button', { name: 'Assign to me' }));
  expect(screen.getByRole('alert').textContent).toContain(
    'will not survive a reload',
  );
});
