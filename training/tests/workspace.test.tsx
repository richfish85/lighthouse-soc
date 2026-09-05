import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../app/workspace';
import dataset from '../app/cases.json';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

it('completes a case, reviews feedback, restores progress, and retries without losing notes', async () => {
  render(<Home/>);
  fireEvent.click(await screen.findByRole('button', { name: /Start investigation/ }));
  fireEvent.click(screen.getByRole('button', { name: /Open evidence room/ }));
  expect(screen.getByText(/spf=pass/, { exact: false })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /E3 ·/ }));
  expect(screen.getByText(/personal mobile activity is unavailable/, { exact: false })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /Make your decisions/ }));
  fireEvent.click(screen.getByRole('button', { name: /Submit investigation/ }));
  expect(screen.getByRole('alert').textContent).toContain('each decision');
  const c = dataset.cases[0];
  c.questions.forEach(q => fireEvent.click(screen.getByRole('radio', { name: q.options[q.answer] })));
  fireEvent.click(screen.getByRole('button', { name: /Submit investigation/ }));
  expect(screen.getByRole('alert').textContent).toContain('40 characters');
  fireEvent.change(screen.getByLabelText('Your working notes & handover'), { target: { value: c.handover } });
  fireEvent.click(screen.getByRole('button', { name: /Submit investigation/ }));
  expect(screen.getByText('Your decisions are evidence-led.')).toBeTruthy();
  expect(screen.getByText(/3 of 3 decisions correct/)).toBeTruthy();
  cleanup();
  render(<Home/>);
  fireEvent.click(await screen.findByRole('button', { name: /My progress/ }));
  expect(screen.getByText('100% · 1 attempt')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /LH-101/ }));
  fireEvent.click(screen.getByRole('button', { name: /Debrief/ }));
  fireEvent.click(screen.getByRole('button', { name: /Retry decisions/ }));
  expect((screen.getByLabelText('Your working notes & handover') as HTMLTextAreaElement).value).toBe(c.handover);
  expect(JSON.parse(localStorage.getItem('lighthouse-training-v1')!)['LH-101'].submitted).toBe(false);
});

it('exports notes and requires confirmation before resetting progress', async () => {
  const create = vi.fn(() => 'blob:test');
  vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: vi.fn() });
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  render(<Home/>);
  fireEvent.click(await screen.findByRole('button', { name: /Start investigation/ }));
  fireEvent.change(screen.getByLabelText('Your working notes & handover'), { target: { value: 'E1 evidence and a proposed responder action; scope remains unknown.' } });
  fireEvent.click(screen.getByRole('button', { name: /My progress/ }));
  fireEvent.click(screen.getByRole('button', { name: /Download practice report/ }));
  expect(create).toHaveBeenCalledOnce();
  expect(click).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: /Reset progress/ }));
  expect(JSON.parse(localStorage.getItem('lighthouse-training-v1')!)['LH-101']).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /Delete my local progress/ }));
  await waitFor(() => expect(localStorage.getItem('lighthouse-training-v1')).toBe('{}'));
  click.mockRestore(); vi.unstubAllGlobals();
});

it('keeps the lab usable when device storage is denied', async () => {
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Denied'); });
  render(<Home/>);
  expect(await screen.findByText(/Progress could not be saved/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /Start investigation/ }));
  expect(screen.getByText('Your shift starts here.')).toBeTruthy();
  spy.mockRestore();
});
