import fs from 'node:fs'
import path from 'node:path'
import type {
  ContractFinding,
  ContractMetric,
  DocumentInput,
  ReviewMatrixRow,
} from './types.js'

export type ContractReviewSignals = {
  policyPack: {
    id: string
    name: string
    version: string
  }
  missingClauses: ContractFinding[]
  keyMetrics: ContractMetric[]
  reviewMatrix: ReviewMatrixRow[]
  risks: string[]
  actionItems: string[]
  brief: string
}

type PolicyPack = {
  id: string
  name: string
  version: string
  description: string
  slaPrefixes: string[]
  missingClauses: Array<{
    id: string
    title: string
    category: string
    severity: 'high' | 'medium' | 'low'
    requiredPatterns: string[]
    evidencePattern: string
    risk: string
    action: string
    amendmentDraft: string
  }>
  keyMetrics: Array<{
    id: string
    label: string
    category: string
    severity: 'high' | 'medium' | 'low'
    pattern: string
    value: string
    risk?: string
    recommendation: string
  }>
}

const POLICY_PACK = loadPolicyPack()

export function reviewContractLocally(
  documents: DocumentInput[],
): ContractReviewSignals {
  const text = documents.map((document) => document.text).join('\n\n')
  const lines = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)

  const missingClauses: ContractFinding[] = []
  const clauseRows: ReviewMatrixRow[] = []

  for (const check of POLICY_PACK.missingClauses) {
    const requiredPatterns = check.requiredPatterns.map((pattern) =>
      toRegex(pattern),
    )
    const presentEvidence = findLineByAnyPattern(lines, requiredPatterns)

    if (presentEvidence) {
      clauseRows.push({
        id: check.id,
        category: check.category,
        requirement: check.title.replace(/^Missing /iu, ''),
        status: 'present',
        severity: check.severity,
        evidence: presentEvidence,
        evidenceAnchor: presentEvidence,
        recommendation: 'Maintain this clause and keep evidence traceable.',
      })
      continue
    }

    const anchor =
      findLine(lines, toRegex(check.evidencePattern)) ||
      lines.find((line) => /^#{0,3}\s*\d+\./u.test(line)) ||
      lines[0] ||
      'No local contract passage available.'
    const evidence = `No explicit clause detected. Closest reviewed passage: "${anchor}"`

    missingClauses.push({
      title: check.title,
      evidence,
      evidenceAnchor: anchor,
      risk: `${check.title}: ${check.risk} Evidence: "${evidence}"`,
      action: `${check.title}: ${check.action}`,
      amendmentDraft: check.amendmentDraft,
    })
    clauseRows.push({
      id: check.id,
      category: check.category,
      requirement: check.title.replace(/^Missing /iu, ''),
      status: 'missing',
      severity: check.severity,
      evidence,
      evidenceAnchor: anchor,
      recommendation: check.action,
    })
  }

  const keyMetrics = extractKeyMetrics(lines)
  const metricRows = buildMetricRows(keyMetrics)
  const reviewMatrix = [...clauseRows, ...metricRows]
  const risks = [
    ...missingClauses.map((finding) => finding.risk),
    ...deriveMetricRisks(keyMetrics),
  ]
  const actionItems = [
    ...missingClauses.map((finding) => finding.action),
    ...deriveMetricActions(keyMetrics),
  ]

  return {
    policyPack: {
      id: POLICY_PACK.id,
      name: POLICY_PACK.name,
      version: POLICY_PACK.version,
    },
    missingClauses,
    keyMetrics,
    reviewMatrix,
    risks,
    actionItems,
    brief: buildBrief(missingClauses, keyMetrics),
  }
}

function extractKeyMetrics(lines: string[]) {
  const metrics: ContractMetric[] = []

  for (const prefix of POLICY_PACK.slaPrefixes) {
    const evidence = findLine(lines, new RegExp(`^${prefix}\\b`, 'iu'))
    if (!evidence) continue

    const compact = evidence.replace(/\s+/gu, ' ')
    metrics.push({
      label: 'Incident response SLA',
      value: compact,
      evidence: compact,
    })
  }

  for (const metric of POLICY_PACK.keyMetrics) {
    const evidence = findLine(lines, toRegex(metric.pattern))
    if (!evidence) continue

    metrics.push({
      label: metric.label,
      value: metric.value,
      evidence,
    })
  }

  return dedupeByEvidence(metrics)
}

function buildMetricRows(metrics: ContractMetric[]) {
  return metrics.map((metric, index): ReviewMatrixRow => {
    const policyMetric = POLICY_PACK.keyMetrics.find(
      (item) => item.label === metric.label,
    )

    return {
      id: policyMetric?.id ?? `incident-response-sla-${index + 1}`,
      category: policyMetric?.category ?? 'Incident Response',
      requirement: metric.label,
      status: 'present',
      severity: policyMetric?.severity ?? 'medium',
      evidence: metric.evidence,
      evidenceAnchor: metric.evidence,
      recommendation:
        policyMetric?.recommendation ??
        'Verify owner, clock-start definition, escalation path, and evidence trail.',
    }
  })
}

function deriveMetricRisks(metrics: ContractMetric[]) {
  return metrics.flatMap((metric) => {
    const policyMetric = POLICY_PACK.keyMetrics.find(
      (item) => item.label === metric.label,
    )
    if (!policyMetric?.risk) return []

    return [`${policyMetric.risk} Evidence: "${metric.evidence}"`]
  })
}

function deriveMetricActions(metrics: ContractMetric[]) {
  const actions = new Set<string>()

  for (const metric of metrics) {
    const policyMetric = POLICY_PACK.keyMetrics.find(
      (item) => item.label === metric.label,
    )
    if (policyMetric?.recommendation) actions.add(policyMetric.recommendation)
  }

  if (metrics.some((metric) => metric.label === 'Incident response SLA')) {
    actions.add(
      'Verify that each P1-P4 SLA has an owner, clock-start definition, escalation path, and evidence trail.',
    )
  }

  return Array.from(actions)
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

function loadPolicyPack() {
  const policyPath = path.resolve('policy-packs', 'vendor-contract.json')
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8')) as PolicyPack
  return policy
}

function toRegex(pattern: string) {
  return new RegExp(pattern, 'iu')
}

function findLine(lines: string[], pattern: RegExp) {
  return lines.find((line) => pattern.test(line)) ?? ''
}

function findLineByAnyPattern(lines: string[], patterns: RegExp[]) {
  return lines.find((line) => patterns.some((pattern) => pattern.test(line))) ?? ''
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
