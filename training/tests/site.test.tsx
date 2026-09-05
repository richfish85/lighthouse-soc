import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Site from '../app/site';
import Home from '../app/workspace';
import { HANDOVER_TEMPLATE } from '../app/handover';
import { orientation } from '../app/orientation';

beforeEach(() => { localStorage.clear(); window.history.replaceState({}, '', '/'); });
afterEach(cleanup);

it('makes the landing value proposition and guest entry available immediately', () => {
  render(<Site/>);
  expect(screen.getByRole('heading', { name: /Learn to investigate/ })).toBeTruthy();
  expect(screen.getByRole('link', { name: /Start as a Guest/ }).getAttribute('href')).toBe('/training');
  expect(screen.getByRole('link', { name: /Create Your Profile/ }).getAttribute('href')).toBe('/profile');
  expect(screen.getByLabelText('Example Lighthouse investigation')).toBeTruthy();
});
for (const article of orientation) {
  it(`renders direct orientation route ${article.path}`, async () => {
    window.history.replaceState({}, '', article.path);
    render(<Site/>);
    expect(await screen.findByRole('heading', { name: article.title })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Start as a Guest/ }).getAttribute('href')).toBe('/training');
  });
}
it('opens Analyst Skills directly and supports empty search results', async () => {
  window.history.replaceState({}, '', '/training/skills'); render(<Site/>);
  expect(await screen.findByRole('heading', { name: 'Analyst Skills' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Find an analyst skill'), { target: { value: 'no-such-skill' } });
  expect(screen.getByText(/No skills match/)).toBeTruthy();
});
it('starts notes with persistent editable headings and keeps them after reload', async () => {
  render(<Home/>);
  fireEvent.click(await screen.findByRole('button', { name: /Start investigation/ }));
  const notes = screen.getByLabelText('Your working notes & handover') as HTMLTextAreaElement;
  expect(notes.value).toBe(HANDOVER_TEMPLATE);
  const updated = HANDOVER_TEMPLATE.replace('Facts and evidence IDs:', 'Facts and evidence IDs:\nE1 suggests sender misalignment.');
  fireEvent.change(notes, { target: { value: updated } });
  expect(notes.value).toContain('Next owner / escalation:');
  cleanup(); render(<Home/>);
  fireEvent.click(await screen.findByRole('button', { name: /Open case/ }));
  expect((screen.getByLabelText('Your working notes & handover') as HTMLTextAreaElement).value).toBe(updated);
});
it('creates and removes a local profile without touching case progress', async () => {
  window.history.replaceState({}, '', '/profile'); localStorage.setItem('lighthouse-training-v1','{}');
  render(<Site/>);
  fireEvent.change(await screen.findByLabelText('Display name'), { target: { value: 'Alex' } });
  fireEvent.change(screen.getByLabelText('Learning focus'), { target: { value: 'Identity' } });
  fireEvent.click(screen.getByRole('button', { name: /Create local profile/ }));
  expect(screen.getByRole('heading', { name: 'Welcome back, Alex.' })).toBeTruthy();
  expect(JSON.parse(localStorage.getItem('lighthouse-profile-v1')!)).toEqual({ name: 'Alex', focus: 'Identity' });
  fireEvent.click(screen.getByRole('button', { name: 'Remove this local profile' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove profile' }));
  await waitFor(() => expect(localStorage.getItem('lighthouse-profile-v1')).toBeNull());
  expect(localStorage.getItem('lighthouse-training-v1')).toBe('{}');
});
