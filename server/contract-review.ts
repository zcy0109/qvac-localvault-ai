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
  pattern: RegExp
  risk: string
  action: string
}> = [
  {
    title: 'Missing data breach notification deadline',
    pattern: /No specified time limit for notifying Party A in case of a data breach/i,
    risk: 'The contract does not define how quickly Party B must notify Party A after a data breach, which can delay incident response and regulatory handling.',
    action:
      'Add a breach notification clause with a concrete deadline, escalation channel, required evidence, and incident owner.',
  },
  {
    title: 'Missing Party A audit right',
    pattern:
      /No provision granting Party A the right to audit Party B's data processing activities/i,
    risk: 'Party A lacks an explicit right to inspect Party B data processing practices, making compliance verification difficult.',
    action:
      'Add an audit-right clause covering audit frequency, scope, notice period, evidence access, and remediation obligations.',
  },
  {
    title: 'Missing force majeure liability allocation',
    pattern: /No clarification of liability in case of force majeure events/i,
    risk: 'The contract does not explain which obligations survive force majeure or how liability is allocated during exceptional events.',
    action:
      'Add a force majeure clause that separates excused delay from confidentiality, security, notification, and mitigation duties.',
  },
  {
    title: 'Missing intellectual property ownership',
    pattern:
      /No specification of intellectual property rights for any deliverables created during the service/i,
    risk: 'Ownership of service deliverables is undefined, which may create disputes over scripts, reports, configurations, or documentation.',
    action:
      'Add an IP ownership clause defining deliverables, background IP, license scope, source materials, and post-termination rights.',
  },
  {
    title: 'Missing regular security reporting requirement',
    pattern: /No requirement for Party B to provide regular security reports to Party A/i,
    risk: 'Party A does not receive a recurring security reporting commitment, reducing ongoing visibility into vendor controls.',
    action:
      'Add a reporting clause requiring periodic security summaries, incident statistics, access-review results, and open remediation items.',
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
    const evidence = findLine(lines, check.pattern)
    if (!evidence) return []

    return [
      {
        title: check.title,
        evidence,
        risk: `${check.title}: ${check.risk} Evidence: "${evidence}"`,
        action: `${check.title}: ${check.action}`,
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

function deriveMetricRisks(metrics: Metric[]) {
  return metrics.flatMap((metric) => {
    if (metric.label !== 'Liquidated damages') return []

    return [
      `Liquidated damages are fixed at ${metric.value}; check whether this cap is sufficient for customer PII, financial records, and internal business data. Evidence: "${metric.evidence}"`,
    ]
  })
}

function deriveMetricActions(metrics: Metric[]) {
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
