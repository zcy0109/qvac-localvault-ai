import crypto from 'node:crypto'
import type { DocumentInput, SourceChunk } from './types.js'

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'into',
  'your',
  'about',
  'what',
  'when',
  'where',
  'how',
  'why',
  'are',
  'is',
  'to',
  'of',
  'in',
  'on',
  'a',
  'an',
])

export function normalizeText(text: string) {
  return text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim()
}

export function chunkDocuments(documents: DocumentInput[]) {
  const chunks: SourceChunk[] = []

  for (const document of documents) {
    const text = normalizeText(document.text)
    const size = 900
    const overlap = 140
    let index = 0

    for (let start = 0; start < text.length; start += size - overlap) {
      const chunkText = text.slice(start, start + size).trim()
      if (chunkText.length < 80) continue

      chunks.push({
        id: crypto
          .createHash('sha1')
          .update(`${document.id}:${index}:${chunkText.slice(0, 60)}`)
          .digest('hex')
          .slice(0, 12),
        documentId: document.id,
        documentName: document.name,
        index,
        text: chunkText,
        score: 0,
      })
      index += 1
    }
  }

  return chunks
}

export function retrieveChunks(chunks: SourceChunk[], query: string, limit = 5) {
  const queryTerms = Array.from(terms(query))

  return chunks
    .map((chunk) => {
      const chunkTerms = terms(chunk.text)
      const matches = queryTerms.reduce(
        (total, term) => total + (chunkTerms.has(term) ? 1 : 0),
        0,
      )
      const densityBoost = Math.min(chunk.text.length / 900, 1)

      return {
        ...chunk,
        score: Number((matches * 2 + densityBoost).toFixed(3)),
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

function terms(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 2 && !STOP_WORDS.has(term)),
  )
}
