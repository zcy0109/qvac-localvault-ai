import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { reviewContractLocally } from './contract-review.js'
import { chunkDocuments, retrieveChunks } from './rag.js'
import { runCompletion } from './inference.js'
import type {
  AnalysisResult,
  ContractFinding,
  ContractMetric,
  DocumentInput,
  InferenceLog,
  SourceChunk,
} from './types.js'

export async function analyzeDocuments(input: {
  documents: DocumentInput[]
  question: string
}) {
  const cleanDocuments = input.documents.filter((document) =>
    document.text.trim(),
  )
  const contractSignals = reviewContractLocally(cleanDocuments)
  const chunks = chunkDocuments(cleanDocuments)
  const signalsWithEvidence = attachEvidenceReferences(contractSignals, chunks)
  const selectedChunks = uniqueChunks([
    ...retrieveChunks(
      chunks,
      `${input.question} summary risks action items confidentiality obligations missing clauses breach notification audit rights force majeure intellectual property security reports incident response SLA retention liquidated damages`,
      6,
    ),
    ...evidenceChunks(signalsWithEvidence, chunks),
  ])

  const prompt = buildPrompt(input.question, selectedChunks, signalsWithEvidence)
  const completion = await runCompletion({
    prompt,
    purpose: 'confidential-document-review',
    selectedChunks,
  })

  const parsed = parseStructuredCompletion(stripThinking(completion.text))
  const merged = mergeContractSignals(parsed, signalsWithEvidence)
  const log = await enrichEvidenceLog({
    log: completion.log,
    prompt,
    cleanDocuments,
    chunks,
    selectedChunks,
    missingClauseCount: signalsWithEvidence.missingClauses.length,
    keyMetricCount: signalsWithEvidence.keyMetrics.length,
  })
  const citations = selectedChunks.slice(0, 10).map((chunk) => ({
    chunkId: chunk.id,
    documentName: chunk.documentName,
    quote: chunk.text.slice(0, 260),
  }))

  const result: AnalysisResult = {
    summary: merged.summary,
    answer: merged.answer,
    risks: merged.risks,
    actionItems: merged.actionItems,
    citations,
    contractReview: {
      ...signalsWithEvidence,
      risks: merged.risks,
      actionItems: merged.actionItems,
    },
    chunks: selectedChunks,
    log,
  }

  await persistEvidence(result)

  return result
}

function buildPrompt(
  question: string,
  chunks: SourceChunk[],
  contractSignals: ReturnType<typeof reviewContractLocally>,
) {
  const context = chunks
    .map(
      (chunk) =>
        `[${chunk.id}] ${chunk.documentName} / chunk ${chunk.index + 1}\n${chunk.text}`,
    )
    .join('\n\n---\n\n')
  const deterministicSignals = [
    contractSignals.brief,
    contractSignals.keyMetrics.length
      ? `Key metrics detected locally:\n${contractSignals.keyMetrics
          .map(
            (metric) =>
              `- ${metric.label}: ${metric.value}. Evidence: ${metric.evidence}`,
          )
          .join('\n')}`
      : '',
    contractSignals.missingClauses.length
      ? `Missing clauses detected locally:\n${contractSignals.missingClauses
          .map(
            (finding) =>
              `- ${finding.title}. Evidence: ${finding.evidence}`,
          )
          .join('\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  return `You are LocalVault AI, a local-first confidential document intelligence agent running on consumer hardware.

Use only the local context below. Do not invent facts. Do not reveal hidden reasoning or thinking tags. Do not wrap the response in markdown fences.

Return strict JSON with these keys:
summary: string
answer: string
risks: string[]
actionItems: string[]

For contract review, explicitly list concrete obligations, key numeric terms, missing clauses, legal/security risks, and required amendments. If deterministic local signals are provided, include them in the final JSON instead of replacing them with generic advice.

User question:
${question}

Deterministic local signals:
${deterministicSignals || 'No deterministic contract signals detected.'}

Local context:
${context}`
}

function parseStructuredCompletion(text: string) {
  const cleanText = stripCodeFence(text)
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        summary: String(parsed.summary ?? '').trim(),
        answer: String(parsed.answer ?? '').trim(),
        risks: Array.isArray(parsed.risks)
          ? parsed.risks.map(String).map((item) => item.trim()).filter(Boolean)
          : [],
        actionItems: Array.isArray(parsed.actionItems)
          ? parsed.actionItems
              .map(String)
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      }
    } catch {
      // Fall through to tolerant extraction for truncated JSON.
    }
  }

  const looseSummary = extractLooseString(cleanText, 'summary')
  const looseAnswer = extractLooseString(cleanText, 'answer')
  const looseRisks = extractLooseList(cleanText, 'risks')
  const looseActionItems = extractLooseList(cleanText, 'actionItems')

  return {
    summary: looseSummary || cleanText.slice(0, 600),
    answer: looseAnswer || cleanText,
    risks: looseRisks,
    actionItems: looseActionItems,
  }
}

function mergeContractSignals(
  parsed: {
    summary: string
    answer: string
    risks: string[]
    actionItems: string[]
  },
  contractSignals: ReturnType<typeof reviewContractLocally>,
) {
  const modelRisks = parsed.risks.filter(isBusinessFinding)
  const modelActions = parsed.actionItems.filter(isBusinessFinding)
  const deterministicSummary = contractSignals.brief
  const summary = deterministicSummary || parsed.summary
  const answer = buildPublicAnalysisNote(deterministicSummary, {
    modelRiskCount: modelRisks.length,
    modelActionCount: modelActions.length,
  })
  const risks = uniqueStrings([...contractSignals.risks, ...modelRisks])
  const actionItems = uniqueStrings([
    ...contractSignals.actionItems,
    ...modelActions,
  ])

  return {
    summary: summary || 'Local contract review completed.',
    answer: answer || summary || 'Local contract review completed.',
    risks: risks.length
      ? risks
      : ['No concrete contract risk was extracted from the selected local context.'],
    actionItems: actionItems.length
      ? actionItems
      : ['Re-run the review with a larger or more specific local document set.'],
  }
}

function buildPublicAnalysisNote(
  deterministicSummary: string,
  counts: { modelRiskCount: number; modelActionCount: number },
) {
  const parts = [
    deterministicSummary
      ? `\u672C\u5730\u786E\u5B9A\u6027\u5BA1\u67E5\u5DF2\u5B8C\u6210\uFF1A${deterministicSummary}`
      : '\u672C\u5730\u786E\u5B9A\u6027\u5BA1\u67E5\u5DF2\u5B8C\u6210\u3002',
    `QVAC \u672C\u5730\u6A21\u578B\u5DF2\u57FA\u4E8E\u68C0\u7D22\u7247\u6BB5\u5B8C\u6210\u8865\u5145\u5BA1\u67E5\uFF0C\u6A21\u578B\u8F93\u51FA\u5DF2\u5408\u5E76\u5230\u98CE\u9669\u767B\u8BB0\u548C\u884C\u52A8\u8BA1\u5212\u4E2D\u3002\u8865\u5145\u98CE\u9669 ${counts.modelRiskCount} \u6761\uFF0C\u8865\u5145\u884C\u52A8\u9879 ${counts.modelActionCount} \u6761\u3002`,
    '\u6240\u6709\u5C55\u793A\u7ED3\u8BBA\u5747\u6765\u81EA\u672C\u5730\u6587\u6863\u7247\u6BB5\u3001\u786E\u5B9A\u6027\u89C4\u5219\u6216\u672C\u673A QVAC \u63A8\u7406\uFF1B\u672A\u8C03\u7528\u8FDC\u7A0B AI API\u3002',
  ]

  return parts.join('\n\n')
}

function attachEvidenceReferences(
  contractSignals: ReturnType<typeof reviewContractLocally>,
  chunks: SourceChunk[],
) {
  return {
    ...contractSignals,
    missingClauses: contractSignals.missingClauses.map((finding) =>
      attachFindingReference(finding, chunks),
    ),
    keyMetrics: contractSignals.keyMetrics.map((metric) =>
      attachMetricReference(metric, chunks),
    ),
  }
}

function attachFindingReference(
  finding: ContractFinding,
  chunks: SourceChunk[],
): ContractFinding {
  const chunk = findEvidenceChunk(
    finding.evidenceAnchor || finding.evidence,
    chunks,
  )
  if (!chunk) return finding

  return {
    ...finding,
    evidenceChunkId: chunk.id,
    evidenceDocumentName: chunk.documentName,
    evidenceChunkIndex: chunk.index,
  }
}

function attachMetricReference(
  metric: ContractMetric,
  chunks: SourceChunk[],
): ContractMetric {
  const chunk = findEvidenceChunk(metric.evidence, chunks)
  if (!chunk) return metric

  return {
    ...metric,
    evidenceChunkId: chunk.id,
    evidenceDocumentName: chunk.documentName,
    evidenceChunkIndex: chunk.index,
  }
}

function evidenceChunks(
  contractSignals: ReturnType<typeof reviewContractLocally>,
  chunks: SourceChunk[],
) {
  const evidenceIds = new Set([
    ...contractSignals.missingClauses
      .map((finding) => finding.evidenceChunkId)
      .filter(Boolean),
    ...contractSignals.keyMetrics
      .map((metric) => metric.evidenceChunkId)
      .filter(Boolean),
  ])

  return chunks.filter((chunk) => evidenceIds.has(chunk.id))
}

function findEvidenceChunk(evidence: string, chunks: SourceChunk[]) {
  const normalizedEvidence = normalizeForEvidence(evidence)
  return chunks.find((chunk) =>
    normalizeForEvidence(chunk.text).includes(normalizedEvidence),
  )
}

function uniqueChunks(chunks: SourceChunk[]) {
  const seen = new Set<string>()
  return chunks.filter((chunk) => {
    if (seen.has(chunk.id)) return false
    seen.add(chunk.id)
    return true
  })
}

function normalizeForEvidence(value: string) {
  return value.toLowerCase().replace(/\s+/gu, ' ').trim()
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>()
  return values.filter((value) => {
    const normalized = value.toLowerCase().replace(/\s+/gu, ' ').trim()
    if (!normalized || seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
}

function isBusinessFinding(value: string) {
  const normalized = value.toLowerCase()
  return ![
    'qvac',
    'submission',
    'dorahacks',
    'provider=qvac',
    'final qvac',
    'cited chunks manually',
    'source citations',
    'selected local chunks',
    'remote calls',
  ].some((phrase) => normalized.includes(phrase))
}

function stripCodeFence(text: string) {
  return text
    .replace(/^\s*```(?:json|JSON)?\s*/u, '')
    .replace(/\s*```\s*$/u, '')
    .replace(/```(?:json|JSON)?/gu, '')
    .trim()
}

function stripThinking(text: string) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\u601d\u8003>[\s\S]*?<\/\u601d\u8003>/gu, '')
    .replace(
      /^\s*(?:\u601d\u8003|thinking)[:\uFF1A][\s\S]*?(?=\n\s*(?:\{|summary|answer|risks|actionItems|\u6458\u8981|\u56DE\u7B54|\u98CE\u9669|\u884C\u52A8))/iu,
      '',
    )
    .trim()
}

function extractLooseString(text: string, key: string) {
  const match = text.match(
    new RegExp(`["']${key}["']\\s*:\\s*["']([^"']+)`, 'u'),
  )
  return match?.[1]?.trim() ?? ''
}

function extractLooseList(text: string, key: string) {
  const block = text.match(
    new RegExp(`["']${key}["']\\s*:\\s*\\[([\\s\\S]*?)(?:\\]|$)`, 'u'),
  )
  if (!block) return []

  return Array.from(block[1].matchAll(/["']([^"']+)["']/gu))
    .map((match) => match[1].trim())
    .filter(Boolean)
}

async function persistEvidence(result: AnalysisResult) {
  const evidenceDir = path.resolve('evidence')
  await fs.mkdir(evidenceDir, { recursive: true })
  await fs.mkdir(path.join(evidenceDir, 'logs'), { recursive: true })
  await fs.writeFile(
    path.join(evidenceDir, 'logs', 'latest-demo-run.json'),
    `${JSON.stringify(result.log, null, 2)}\n`,
  )
}

async function enrichEvidenceLog(input: {
  log: InferenceLog
  prompt: string
  cleanDocuments: DocumentInput[]
  chunks: SourceChunk[]
  selectedChunks: SourceChunk[]
  missingClauseCount: number
  keyMetricCount: number
}): Promise<InferenceLog> {
  return {
    ...input.log,
    analysis_mode: 'hybrid-deterministic-contract-review',
    qvac_sdk_version: await readQvacSdkVersion(),
    system_prompt_hash: sha256(input.prompt),
    document_count: input.cleanDocuments.length,
    input_file_names: input.cleanDocuments.map((document) => document.name),
    document_hashes: input.cleanDocuments.map((document) => ({
      name: document.name,
      sha256: sha256(document.text),
      chars: document.text.length,
    })),
    chunk_count: input.chunks.length,
    retrieved_chunks: input.selectedChunks.map((chunk) => ({
      id: chunk.id,
      documentName: chunk.documentName,
      index: chunk.index,
      score: chunk.score,
    })),
    missing_clause_count: input.missingClauseCount,
    key_metric_count: input.keyMetricCount,
  }
}

async function readQvacSdkVersion() {
  try {
    const packageJson = await fs.readFile(
      path.resolve('node_modules', '@qvac', 'sdk', 'package.json'),
      'utf8',
    )
    const parsed = JSON.parse(packageJson) as { version?: string }
    return parsed.version ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}
