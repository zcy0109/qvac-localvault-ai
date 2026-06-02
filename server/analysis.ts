import fs from 'node:fs/promises'
import path from 'node:path'
import { reviewContractLocally } from './contract-review.js'
import { chunkDocuments, retrieveChunks } from './rag.js'
import { runCompletion } from './inference.js'
import type { AnalysisResult, DocumentInput } from './types.js'

export async function analyzeDocuments(input: {
  documents: DocumentInput[]
  question: string
}) {
  const cleanDocuments = input.documents.filter((document) =>
    document.text.trim(),
  )
  const contractSignals = reviewContractLocally(cleanDocuments)
  const chunks = chunkDocuments(cleanDocuments)
  const selectedChunks = retrieveChunks(
    chunks,
    `${input.question} summary risks action items confidentiality obligations missing clauses breach notification audit rights force majeure intellectual property security reports incident response SLA retention liquidated damages`,
    6,
  )

  const prompt = buildPrompt(input.question, selectedChunks, contractSignals)
  const completion = await runCompletion({
    prompt,
    purpose: 'confidential-document-review',
    selectedChunks,
  })

  const parsed = parseStructuredCompletion(stripThinking(completion.text))
  const merged = mergeContractSignals(parsed, contractSignals)
  const citations = selectedChunks.slice(0, 6).map((chunk) => ({
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
    chunks: selectedChunks,
    log: completion.log,
  }

  await persistEvidence(result)

  return result
}

function buildPrompt(
  question: string,
  chunks: ReturnType<typeof retrieveChunks>,
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
  const answer = joinSections([
    deterministicSummary ? `Local deterministic review: ${deterministicSummary}` : '',
    parsed.answer,
  ])
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

function joinSections(values: string[]) {
  return uniqueStrings(values.map((value) => value.trim()).filter(Boolean)).join(
    '\n\n',
  )
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
