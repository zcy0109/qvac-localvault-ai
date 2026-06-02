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

  const parsed = parseStructuredCompletion(completion.text)
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

Use only the local context below. Do not invent facts. Return strict JSON with these keys:
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
  const jsonMatch = text.match(/\{[\s\S]*\}/)
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

  return {
    summary: text.slice(0, 600),
    answer: text,
    risks: ['Review the cited chunks manually before making a decision.'],
    actionItems: ['Run a final QVAC-backed analysis before submission.'],
  }
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
