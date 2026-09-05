export const HANDOVER_TEMPLATE = `Situation / alert:

Affected identity or asset:

Timeline (UTC):

Facts and evidence IDs:

Assumptions / alternative explanations:

Unknowns and visibility limits:

Actions completed:

Recommended next action and reason:

Next owner / escalation:
`;

// Template labels do not count as learner-authored reasoning.
export function handoverContent(notes: string): string {
  const labels = new Set(HANDOVER_TEMPLATE.split('\n').filter(Boolean));
  return notes.split('\n').map(line => {
    const trimmed = line.trim();
    const label = [...labels].find(item => trimmed.startsWith(item));
    return label ? trimmed.slice(label.length) : trimmed;
  }).join('\n').trim();
}
