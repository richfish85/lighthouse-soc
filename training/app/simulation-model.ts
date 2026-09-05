import alerts from './simulation-data/sample_alerts.json';
import assets from './simulation-data/sample_assets.json';
import identities from './simulation-data/sample_users.json';
import reputations from './simulation-data/sample_ip_reputation.json';
export { default as playbooks } from './simulation-data/sample_playbooks.json';
export const STORAGE_KEY = 'lighthouse-simulation-v1';
export const statuses = [
  'New',
  'In Review',
  'Escalated',
  'Contained',
  'Closed',
  'False Positive',
] as const;
export type Status = (typeof statuses)[number];
export type Role = 'Reporter' | 'Analyst' | 'SOC Lead';
export type Incident = {
  id: string;
  type: string;
  description: string;
  user: string;
  asset: string;
  ip: string;
  severity: string;
  confidence: string;
  criticality: string;
  account: string;
  reputation: string;
  location: string;
  baseline: string;
  repeats: number;
  status: Status;
  assigned: string;
  evidence: string;
  steps: number[];
  notes: { text: string; public: boolean; time: string }[];
  audit: { text: string; time: string }[];
};
export const resolved = (i: Incident) =>
  i.status === 'Closed' || i.status === 'False Positive';
export function priority(
  i: Pick<Incident, 'severity' | 'confidence' | 'criticality' | 'account'>,
) {
  const weight = (s: string) =>
    ({ Low: 1, Medium: 2, High: 3, Critical: 4 })[s] ?? 2;
  const score =
    weight(i.severity) +
    weight(i.confidence) +
    weight(i.criticality) +
    (i.account === 'Privileged' ? 2 : i.account === 'Service' ? 1 : 0);
  return {
    score,
    label:
      score >= 11
        ? 'P1'
        : score >= 9
          ? 'P2'
          : score >= 7
            ? 'P3'
            : score >= 5
              ? 'P4'
              : 'P5',
  };
}
export function seed(): Incident[] {
  return alerts.map((a) => ({
    id: a.incident.incident_id,
    type: a.alert_type,
    description: a.description,
    user: a.affected_user,
    asset: a.affected_asset,
    ip: a.source_ip,
    severity: a.incident.severity,
    confidence: a.incident.confidence,
    criticality: a.enrichment.asset_criticality,
    account: a.enrichment.account_type,
    reputation: a.enrichment.ip_reputation,
    location: a.enrichment.geo_location,
    baseline: a.enrichment.user_typical_location,
    repeats: a.enrichment.repeat_alert_count,
    status: a.incident.incident_status as Status,
    assigned: a.incident.assigned_to ?? '',
    evidence: `${a.evidence_name} (sample reference only)\n${JSON.stringify(a.raw_payload, null, 2)}\n${a.enrichment.notes}`,
    steps: [],
    notes: a.notes.map((n) => ({
      text: n.content,
      public: n.visible_to_reporter,
      time: n.created_at,
    })),
    audit: [
      {
        text: `Seeded scenario: ${a.incident.incident_status}`,
        time: a.incident.updated_at,
      },
    ],
  }));
}
export type Report = Pick<
  Incident,
  'type' | 'description' | 'user' | 'asset' | 'ip' | 'severity' | 'evidence'
>;
export function report(items: Incident[], input: Report): Incident {
  if (
    !alerts.some((a) => a.alert_type === input.type) ||
    !['Low', 'Medium', 'High', 'Critical'].includes(input.severity) ||
    input.description.trim().length < 20 ||
    !input.user.trim() ||
    !input.asset.trim()
  )
    throw new Error(
      'Add an affected identity, asset, and at least 20 characters describing the signal.',
    );
  const asset = assets.find((a) => a.asset_name === input.asset);
  const identity = identities.identity_profiles.find(
    (i) => i.username === input.user,
  );
  const ip = reputations.find((r) => r.source_ip === input.ip);
  const repeats = items.filter(
    (i) => i.user === input.user || i.asset === input.asset,
  ).length;
  return {
    ...input,
    id: `INC-${Math.max(2000, ...items.map((i) => Number(i.id.slice(4)))) + 1}`,
    confidence:
      ip?.reputation === 'Malicious' || repeats >= 3
        ? 'High'
        : ip?.reputation === 'Suspicious' || repeats >= 1
          ? 'Medium'
          : 'Low',
    criticality: asset?.asset_criticality ?? 'Medium',
    account: identity?.account_type ?? 'Standard',
    reputation: ip?.reputation ?? 'Unknown',
    location: ip?.geo_location ?? 'Unknown',
    baseline: identity?.typical_location ?? 'Unknown',
    repeats,
    status: 'New',
    assigned: '',
    steps: [],
    notes: [],
    audit: [
      {
        text: 'Reporter submitted signal; incident opened and enriched from demo records.',
        time: new Date().toISOString(),
      },
    ],
  };
}
export function update(
  i: Incident,
  role: Role,
  action: 'assign' | 'note' | 'status' | 'step',
  text = '',
  publicNote = false,
  step = 0,
): Incident {
  if (role !== 'Analyst')
    throw new Error('Switch to Analyst to work an incident.');
  if (action === 'status' && !statuses.includes(text as Status))
    throw new Error('Choose a valid incident status.');
  if ((action === 'note' || action === 'status') && text.trim().length === 0)
    throw new Error('Add a note first.');
  if (
    action === 'status' &&
    ['Escalated', 'Contained', 'Closed', 'False Positive'].includes(text) &&
    !i.notes.length
  )
    throw new Error(
      'Save an evidence-based note before recording this response.',
    );
  const time = new Date().toISOString();
  return {
    ...i,
    assigned: action === 'assign' ? 'analyst01' : i.assigned,
    status: action === 'status' ? (text as Status) : i.status,
    notes:
      action === 'note'
        ? [...i.notes, { text: text.trim(), public: publicNote, time }]
        : i.notes,
    steps:
      action === 'step'
        ? i.steps.includes(step)
          ? i.steps.filter((s) => s !== step)
          : [...i.steps, step]
        : i.steps,
    audit: [
      ...i.audit,
      {
        text:
          action === 'assign'
            ? 'Analyst assigned incident to analyst01.'
            : action === 'status'
              ? `Analyst recorded ${text} (simulation).`
              : action === 'step'
                ? `Analyst updated playbook step ${step + 1}.`
                : `Analyst saved ${publicNote ? 'reporter-visible' : 'internal'} note.`,
        time,
      },
    ],
  };
}
export function restore(raw: string | null): Incident[] {
  if (!raw) return seed();
  const data: unknown = JSON.parse(raw);
  if (
    !Array.isArray(data) ||
    data.length > 500 ||
    !data.every(
      (i) =>
        i &&
        [
          'id',
          'type',
          'description',
          'user',
          'asset',
          'ip',
          'severity',
          'confidence',
          'criticality',
          'account',
          'reputation',
          'location',
          'baseline',
          'assigned',
          'evidence',
        ].every((k) => typeof i[k] === 'string') &&
        /^INC-\d+$/.test(i.id) &&
        statuses.includes(i.status) &&
        Number.isFinite(i.repeats) &&
        Array.isArray(i.steps) &&
        i.steps.every((s: unknown) => Number.isInteger(s)) &&
        Array.isArray(i.notes) &&
        i.notes.every(
          (n: { text: unknown; public: unknown; time: unknown }) =>
            n &&
            typeof n.text === 'string' &&
            typeof n.public === 'boolean' &&
            typeof n.time === 'string',
        ) &&
        Array.isArray(i.audit) &&
        i.audit.every(
          (a: { text: unknown; time: unknown }) =>
            a && typeof a.text === 'string' && typeof a.time === 'string',
        ),
    )
  )
    throw new Error(
      'Saved simulation could not be read. Reset the simulation to load sample incidents.',
    );
  return data as Incident[];
}
