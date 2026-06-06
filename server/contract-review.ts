import type { ContractFinding, ContractMetric, DocumentInput } from './types.js'

export type ContractReviewSignals = {
  missingClauses: ContractFinding[]
  keyMetrics: ContractMetric[]
  risks: string[]
  actionItems: string[]
  brief: string
}

const MISSING_CLAUSE_CHECKS: Array<{
  title: string
  requiredPatterns: RegExp[]
  evidencePattern: RegExp
  risk: string
  action: string
  amendmentDraft: string
}> = [
  {
    title: 'Missing data breach notification deadline',
    requiredPatterns: [
      /data breach[^.]{0,120}notif/i,
      /notif[^.]{0,120}data breach/i,
      /security incident[^.]{0,120}notif/i,
      /notif[^.]{0,120}security incident/i,
    ],
    evidencePattern: /P1.*data breach risk|Party A reserves the right to terminate.*breach/i,
    risk: 'The contract does not define how quickly Party B must notify Party A after a data breach, which can delay incident response and regulatory handling.',
    action:
      'Add a breach notification clause with a concrete deadline, escalation channel, required evidence, and incident owner.',
    amendmentDraft:
      'Data Breach Notification. Party B shall notify Party A in writing within 24 hours after becoming aware of any actual or suspected data breach, security incident, unauthorized access, or loss of Confidential Information. The notice must include the time discovered, affected systems, data categories, mitigation steps, responsible incident owner, and follow-up remediation plan. Party B shall provide material updates at least every 24 hours until containment is complete.',
  },
  {
    title: 'Missing Party A audit right',
    requiredPatterns: [
      /Party A[^.]{0,120}right[^.]{0,80}audit/i,
      /Party A[^.]{0,120}audit[^.]{0,80}Party B/i,
      /inspect[^.]{0,80}Party B[^.]{0,80}data processing/i,
    ],
    evidencePattern: /Audit Logs:.*minimum of 180 days|Access Control:.*least privilege/i,
    risk: 'Party A lacks an explicit right to inspect Party B data processing practices, making compliance verification difficult.',
    action:
      'Add an audit-right clause covering audit frequency, scope, notice period, evidence access, and remediation obligations.',
    amendmentDraft:
      'Audit Rights. Party A may, upon reasonable prior notice and no more than twice per calendar year unless a security incident occurs, audit Party B\'s compliance with this agreement. Party B shall provide access to relevant policies, access logs, personnel records, subcontractor records, and technical evidence reasonably necessary to verify data processing, confidentiality, and security controls. Party B shall remediate confirmed findings within a mutually agreed remediation period.',
  },
  {
    title: 'Missing force majeure liability allocation',
    requiredPatterns: [/force majeure/i, /act of god/i, /unforeseeable event/i],
    evidencePattern: /Liability for Breach|Dispute Resolution|Miscellaneous/i,
    risk: 'The contract does not explain which obligations survive force majeure or how liability is allocated during exceptional events.',
    action:
      'Add a force majeure clause that separates excused delay from confidentiality, security, notification, and mitigation duties.',
    amendmentDraft:
      'Force Majeure. Neither party shall be liable for delay caused by events beyond reasonable control, provided that the affected party promptly notifies the other party and uses commercially reasonable efforts to mitigate the impact. Force majeure shall not excuse Party B from confidentiality, data protection, breach notification, access control, return or destruction of data, or incident mitigation obligations.',
  },
  {
    title: 'Missing intellectual property ownership',
    requiredPatterns: [
      /intellectual property/i,
      /IP ownership/i,
      /ownership[^.]{0,120}deliverables/i,
      /deliverables[^.]{0,120}ownership/i,
    ],
    evidencePattern: /technical documents|code snippets|documentation updates/i,
    risk: 'Ownership of service deliverables is undefined, which may create disputes over scripts, reports, configurations, or documentation.',
    action:
      'Add an IP ownership clause defining deliverables, background IP, license scope, source materials, and post-termination rights.',
    amendmentDraft:
      'Intellectual Property and Deliverables. Party A shall own all reports, configurations, scripts, documentation, remediation records, and other deliverables specifically created for Party A under this agreement. Each party retains ownership of its pre-existing intellectual property. Party B grants Party A a perpetual, royalty-free license to use any Party B background materials embedded in the deliverables solely as necessary to operate and maintain Party A systems.',
  },
  {
    title: 'Missing regular security reporting requirement',
    requiredPatterns: [
      /security report/i,
      /periodic security/i,
      /regular security/i,
      /security summary/i,
    ],
    evidencePattern: /authorized personnel.*monthly|Audit Logs:.*minimum of 180 days|Access Control/i,
    risk: 'Party A does not receive a recurring security reporting commitment, reducing ongoing visibility into vendor controls.',
    action:
      'Add a reporting clause requiring periodic security summaries, incident statistics, access-review results, and open remediation items.',
    amendmentDraft:
      'Security Reporting. Party B shall provide Party A with a written security report at least monthly. The report must include access review results, privileged account changes, incident and near-miss statistics, subcontractor activity, unresolved remediation items, and confirmation that data localization, encryption, access control, and retention requirements remain satisfied.',
  },
]

export function reviewContractLocally(
  documents: DocumentInput[],
): ContractReviewSignals {
  const text = documents.map((document) => document.text).join('\n\n')
  const lines = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)

  const missingClauses = MISSING_CLAUSE_CHECKS.flatMap((check) => {
    const hasRequiredClause = check.requiredPatterns.some((pattern) =>
      pattern.test(text),
    )
    if (hasRequiredClause) return []

    const anchor =
      findLine(lines, check.evidencePattern) ||
      lines.find((line) => /^#{0,3}\s*\d+\./u.test(line)) ||
      lines[0] ||
      'No local contract passage available.'
    const evidence = `No explicit clause detected. Closest reviewed passage: "${anchor}"`

    return [
      {
        title: check.title,
        evidence,
        evidenceAnchor: anchor,
        risk: `${check.title}: ${check.risk} Evidence: "${evidence}"`,
        action: `${check.title}: ${check.action}`,
        amendmentDraft: check.amendmentDraft,
      },
    ]
  })

  const keyMetrics = extractKeyMetrics(lines)
  const risks = [
    ...missingClauses.map((finding) => finding.risk),
    ...deriveMetricRisks(keyMetrics),
  ]
  const actionItems = [
    ...missingClauses.map((finding) => finding.action),
    ...deriveMetricActions(keyMetrics),
  ]

  return {
    missingClauses,
    keyMetrics,
    risks,
    actionItems,
    brief: buildBrief(missingClauses, keyMetrics),
  }
}

function extractKeyMetrics(lines: string[]) {
  const metrics: ContractMetric[] = []

  for (const line of lines) {
    if (/^P[1-4]\b/i.test(line)) {
      const compact = line.replace(/\s+/gu, ' ')
      metrics.push({
        label: 'Incident response SLA',
        value: compact,
        evidence: compact,
      })
    }
  }

  addMetric(
    metrics,
    'Audit log retention',
    lines,
    /Audit Logs:.*minimum of 180 days/i,
  )
  addMetric(
    metrics,
    'Liquidated damages',
    lines,
    /liquidated damages equal to 20% of the total contract value/i,
  )
  addMetric(
    metrics,
    'Confidentiality survival period',
    lines,
    /Confidentiality obligations survive.*3 years/i,
  )
  addMetric(
    metrics,
    'Data retention limit',
    lines,
    /Data Retention:.*may not retain any copies.*after service completion/i,
  )
  addMetric(
    metrics,
    'Local-only data processing',
    lines,
    /Data Localization:.*on-premises servers.*No data may be transferred/i,
  )

  return dedupeByEvidence(metrics)
}

function addMetric(
  metrics: ContractMetric[],
  label: string,
  lines: string[],
  pattern: RegExp,
) {
  const evidence = findLine(lines, pattern)
  if (!evidence) return

  metrics.push({
    label,
    value: summarizeMetricValue(label, evidence),
    evidence,
  })
}

function summarizeMetricValue(label: string, evidence: string) {
  if (label === 'Audit log retention') return 'minimum 180 days'
  if (label === 'Liquidated damages') return '20% of total contract value'
  if (label === 'Confidentiality survival period') return '3 years'
  if (label === 'Data retention limit') return 'no copies after service completion'
  if (label === 'Local-only data processing') return 'on-premises only; no cloud/off-site transfer'
  return evidence
}

function deriveMetricRisks(metrics: ContractMetric[]) {
  return metrics.flatMap((metric) => {
    if (metric.label !== 'Liquidated damages') return []

    return [
      `Liquidated damages are fixed at ${metric.value}; check whether this cap is sufficient for customer PII, financial records, and internal business data. Evidence: "${metric.evidence}"`,
    ]
  })
}

function deriveMetricActions(metrics: ContractMetric[]) {
  const actions: string[] = []
  const hasAuditLogs = metrics.some((metric) => metric.label === 'Audit log retention')
  const hasIncidentSla = metrics.some((metric) => metric.label === 'Incident response SLA')

  if (hasAuditLogs) {
    actions.push(
      'Preserve the 180-day audit-log requirement and add who can inspect logs, export format, and tamper-evidence controls.',
    )
  }

  if (hasIncidentSla) {
    actions.push(
      'Verify that each P1-P4 SLA has an owner, clock-start definition, escalation path, and evidence trail.',
    )
  }

  return actions
}

function buildBrief(
  missingClauses: ContractFinding[],
  keyMetrics: ContractMetric[],
) {
  const parts: string[] = []

  if (keyMetrics.length) {
    parts.push(
      `Key extracted metrics: ${keyMetrics
        .map((metric) => `${metric.label} = ${metric.value}`)
        .join('; ')}.`,
    )
  }

  if (missingClauses.length) {
    parts.push(
      `Detected ${missingClauses.length} missing clauses: ${missingClauses
        .map((finding) => finding.title)
        .join('; ')}.`,
    )
  }

  return parts.join(' ')
}

function findLine(lines: string[], pattern: RegExp) {
  return lines.find((line) => pattern.test(line)) ?? ''
}

function dedupeByEvidence(metrics: ContractMetric[]) {
  const seen = new Set<string>()
  return metrics.filter((metric) => {
    const key = `${metric.label}:${metric.evidence}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
