# Lighthouse SOC Analyst Casebook

## What

Four completed analyst write-ups based on Lighthouse SOC's seeded scenarios. They show how a junior analyst can record evidence, scope, priority, disposition, escalation, and handover without overstating what the available telemetry proves.

## Assumptions

- Every case is a simulation; the people, assets, organisation, and events are fictional.
- The IP addresses use documentation-only ranges (`192.0.2.0/24`, `198.51.100.0/24`, and `203.0.113.0/24`).
- ATT&CK mappings are investigation hypotheses, not declarations that an intrusion occurred.
- A real analyst would validate identity, endpoint, email, and change-management records in the authorised tools available to the employer.

## Case 1 — Privileged impossible-travel sign-in

- **Case:** `INC-2001` / `ALT-1001`
- **Simulated signal:** A privileged finance account signed in from Melbourne and then Jakarta within an implausible interval. Seven related events and repeated MFA prompts were reported.
- **Affected scope:** Identity `olivia.chen`; critical endpoint `FIN-WS-01`; cloud sessions associated with source `203.0.113.19`.

**Triage outcome:** P1, high severity/high confidence. The privileged identity, critical asset, geo mismatch, suspicious source reputation, and user's denial of travel justify urgent action. The source IP alone does not prove compromise.

**Evidence reviewed**

- sign-in locations, times, session identifiers, client applications, and device posture
- MFA result and prompt history
- user's travel/VPN confirmation
- source-IP reputation and prior alerts
- activity performed after the suspicious authentication

**ATT&CK-informed hypothesis:** `T1078.004 — Valid Accounts: Cloud Accounts`. This is appropriate as a hypothesis because the signal is an authenticated cloud sign-in; it remains unconfirmed until session and identity evidence is correlated.

**Actions and disposition**

- Escalated to identity/incident response due to privileged-account risk.
- Recommended session revocation, credential reset, MFA-method review, and preservation of authentication logs.
- Requested a search for the same source, session, device, or user agent across other accounts.

**Handover:** User denies travel and reports repeated MFA prompts. Validate whether any prompt was approved, identify actions performed by the suspect session, and widen scope before declaring containment complete.

## Case 2 — Payroll-themed phishing link

- **Case:** `INC-2003` / `ALT-1003`
- **Simulated signal:** A marketing user reported a payroll-themed message containing a suspicious link.
- **Affected scope:** Mailbox `nina.rojas`; endpoint `MKT-LAPTOP-22`; message and URL indicators.

**Triage outcome:** P4, medium severity/medium confidence. The lure is plausible, but no click, credential submission, payload execution, or secondary affected recipient was observed.

**Evidence reviewed**

- sender, reply-to, return-path, subject, message ID, and mail-gateway verdict
- URL target and redirect chain in an approved analysis environment
- delivery/search results for other recipients
- Safe Links/proxy, browser, sign-in, and endpoint telemetry around delivery time
- user confirmation of whether the link or attachment was opened

**ATT&CK-informed hypothesis:** `T1566.002 — Phishing: Spearphishing Link`. The link-based lure supports the mapping; it does not establish successful initial access.

**Actions and disposition**

- Confirmed the link was blocked upstream and no interaction was observed.
- Recommended blocking the indicators and removing matching messages if any other deliveries are found.
- Closed as a reported phishing attempt with no confirmed user or endpoint impact.

**Handover:** No responder handover required. Reopen and escalate if later telemetry shows a click, credential entry, new inbox rule, suspicious sign-in, or endpoint execution.

## Case 3 — Encoded PowerShell on an admin workstation

- **Case:** `INC-2004` / `ALT-1004`
- **Simulated signal:** A privileged workstation launched encoded PowerShell followed by outbound network activity. Nine related events were recorded.
- **Affected scope:** Identity `harper.lee`; critical admin workstation `IT-ADMIN-01`; process tree and connection to `198.51.100.77`.

**Triage outcome:** P1, high severity/high confidence. Encoded execution, a privileged endpoint, a suspicious child/network sequence, malicious lab reputation, and repeated alerts justify immediate investigation. Approved administration remains a live alternative explanation until change records and command content are checked.

**Evidence reviewed**

- complete command line, decoded content, parent/child process chain, signer, hash, and initiating user
- endpoint network events and DNS resolution near execution time
- approved change/ticket records and administrator confirmation
- persistence, credential access, and lateral-movement signals on the host
- occurrence of the same command, hash, domain, or destination elsewhere

**ATT&CK-informed hypothesis:** `T1059.001 — Command and Scripting Interpreter: PowerShell`. The observed PowerShell execution directly supports this technique; malicious intent still requires contextual validation.

**Actions and disposition**

- Kept the incident in review while preserving process and network evidence.
- Recommended endpoint isolation if the activity is not immediately linked to an approved change.
- Recommended escalation to L2/incident response because the device is a privileged administration workstation.

**Handover:** Decode and review the command in a safe environment, validate the initiating logon session, confirm the change record, and hunt for the same indicators before choosing containment or false-positive closure.

## Case 4 — Failed logins during an approved exercise

- **Case:** `INC-2005` / `ALT-1005`
- **Simulated signal:** Fourteen failed logins targeted an executive laptop/account from `203.0.113.88`.
- **Affected scope:** Identity `ava.brooks`; high-criticality endpoint `EXEC-LAPTOP-07`; authentication source and any other identities it targeted.

**Triage outcome:** P4, medium severity/low confidence after validation. The pattern first warranted review, but the activity aligned with an approved red-team exercise and no successful authentication or follow-on activity was found.

**Evidence reviewed**

- failure count, time window, targeted identities, applications, and failure reasons
- successful sign-ins from the same source or against targeted identities
- source-IP reputation and pattern across other accounts
- exercise scope, time window, source ranges, and named authorisation contact
- account lockout, MFA, and post-authentication activity

**ATT&CK-informed hypothesis:** `T1110.001 — Brute Force: Password Guessing`. The authentication pattern matches a technique worth testing, even though authorised testing made the incident a false positive for malicious activity.

**Actions and disposition**

- Validated the exercise through the approved change/engagement record rather than relying on an informal claim.
- Confirmed no successful login or out-of-scope target in the simulated evidence.
- Closed as false positive: authorised security testing.

**Handover:** None required. Feed the approved test source and window into detection-tuning notes, but avoid a permanent allow-list that could conceal later misuse.

## Threat/Risk Notes

- These write-ups model documentation quality, not access to a real SIEM or production response authority.
- Enrichment such as IP reputation is supporting context and must not be the sole basis for declaring compromise.
- False-positive closure requires evidence and an authorised source of truth.
- Containment actions can disrupt users and systems; follow the employer's approval and incident-response process.

## Validation Steps

- Compare case IDs, assets, priorities, and dispositions with `data/sample_alerts.json`.
- Seed the simulator with `python -m app.cli seed --reset` and inspect the four cases in the analyst view.
- Adapt and validate the companion queries in `docs/kql/soc_triage_queries.kql` against a lab workspace before use.
- Record any schema, time-zone, or retention assumptions when presenting query results.
