import fs from 'node:fs/promises'
import path from 'node:path'
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
  const chunks = chunkDocuments(cleanDocuments)
  const selectedChunks = retrieveChunks(
    chunks,
    `${input.question} summary risks action items confidentiality obligations`,
    6,
  )

  const prompt = buildPrompt(input.question, selectedChunks)
  const completion = await runCompletion({
    prompt,
    purpose: 'confidential-document-review',
    selectedChunks,
  })

  const parsed = parseStructuredCompletion(stripThinking(completion.text))
  const citations = selectedChunks.slice(0, 4).map((chunk) => ({
    chunkId: chunk.id,
    documentName: chunk.documentName,
    quote: chunk.text.slice(0, 260),
  }))

  const result: AnalysisResult = {
    summary: parsed.summary,
    answer: parsed.answer,
    risks: parsed.risks,
    actionItems: parsed.actionItems,
    citations,
    chunks: selectedChunks,
    log: completion.log,
  }

  await persistEvidence(result)

  return result
}

function buildPrompt(question: string, chunks: ReturnType<typeof retrieveChunks>) {
  const context = chunks
    .map(
      (chunk) =>
        `[${chunk.id}] ${chunk.documentName} / chunk ${chunk.index + 1}\n${chunk.text}`,
    )
    .join('\n\n---\n\n')

  return `You are LocalVault AI, a local-first confidential document intelligence agent running on consumer hardware.

Use only the local context below. Do not invent facts. Do not reveal hidden reasoning or thinking tags. Return strict JSON with these keys:
summary: string
answer: string
risks: string[]
actionItems: string[]

User question:
${question}

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
        summary: String(parsed.summary ?? ''),
        answer: String(parsed.answer ?? ''),
        risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
        actionItems: Array.isArray(parsed.actionItems)
          ? parsed.actionItems.map(String)
          : [],
      }
    } catch {
      // Fall through to plain text handling.
    }
  }

  const looseSummary = extractLooseString(cleanText, 'summary')
  const looseAnswer = extractLooseString(cleanText, 'answer')
  const looseRisks = extractLooseList(cleanText, 'risks')
  const looseActionItems = extractLooseList(cleanText, 'actionItems')

  return {
    summary: looseSummary || cleanText.slice(0, 600),
    answer: looseAnswer || cleanText,
    risks: looseRisks.length
      ? looseRisks
      : ['Review the cited chunks manually before making a decision.'],
    actionItems: looseActionItems.length
      ? looseActionItems
      : ['Run a final QVAC-backed analysis before submission.'],
  }
}

function stripCodeFence(text: string) {
  return text
    .replace(/^```(?:json|JSON)?\s*/u, '')
    .replace(/\s*```\s*$/u, '')
    .trim()
}

function stripThinking(text: string) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<思考>[\s\S]*?<\/思考>/g, '')
    .replace(
      /^\s*(?:思考|thinking)[:：][\s\S]*?(?=\n\s*(?:\{|summary|answer|risks|actionItems|摘要|回答|风险|行动))/i,
      '',
    )
    .trim()
}

function extractLooseString(text: string, key: string) {
  const match = text.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)`, 'u'))
  return match?.[1]?.trim() ?? ''
}

function extractLooseList(text: string, key: string) {
  const block = text.match(new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)(?:\\]|$)`, 'u'))
  if (!block) return []

  return Array.from(block[1].matchAll(/"([^"]+)"/gu))
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
