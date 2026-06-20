import express from 'express'
import cors from 'cors'
import multer from 'multer'
import crypto from 'node:crypto'
import { InputValidationError, analyzeDocuments } from './analysis.js'
import { getDeviceInfo } from './device.js'
import type { DocumentInput } from './types.js'

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const port = Number(process.env.PORT ?? 4173)

app.use(cors())
app.use(express.json({ limit: 15 * 1024 * 1024 }))

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    provider: process.env.LOCALVAULT_PROVIDER ?? 'auto',
    requireQvac: process.env.LOCALVAULT_REQUIRE_QVAC === 'true',
    device: getDeviceInfo(),
  })
})

app.post('/api/extract', upload.single('file'), async (request, response) => {
  if (!request.file) {
    response.status(400).json({ error: 'Missing file.' })
    return
  }

  const file = request.file
  const fileName = decodeUploadName(file.originalname)
  const isPdf =
    file.mimetype === 'application/pdf' ||
    fileName.toLowerCase().endsWith('.pdf')

  try {
    const text = isPdf
      ? await extractPdfText(file.buffer)
      : file.buffer.toString('utf8')

    response.json({
      id: crypto.randomUUID(),
      name: fileName,
      text,
    })
  } catch (error) {
    response.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to extract text from file.',
    })
  }
})

app.post('/api/analyze', async (request, response) => {
  const documents = request.body.documents as DocumentInput[] | undefined
  const question = String(
    request.body.question ??
      'Summarize the material, identify risks, and produce action items.',
  )

  if (!documents?.length) {
    response.status(400).json({ error: 'At least one document is required.' })
    return
  }

  try {
    response.json(await analyzeDocuments({ documents, question }))
  } catch (error) {
    response.status(error instanceof InputValidationError ? 400 : 500).json({
      error: error instanceof Error ? error.message : 'Analysis failed.',
    })
  }
})

app.listen(port, () => {
  console.info(`[LocalVault] API listening on http://127.0.0.1:${port}`)
})

async function extractPdfText(buffer: Buffer) {
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: buffer })

  try {
    const result = await parser.getText()
    const text = result.text.trim()
    if (!text) {
      throw new Error(
        'No selectable text was found in this PDF. If it is a scanned image PDF, convert it with OCR before review.',
      )
    }
    validatePdfTextQuality(text)
    return text
  } finally {
    await parser.destroy()
  }
}

function validatePdfTextQuality(text: string) {
  if (text.length < 300) {
    throw new Error(
      `Only ${text.length} characters could be extracted from this PDF. It is likely scanned, image-based, or has an unsupported text layer. Use TXT, Markdown, or an OCR/text-layer PDF for review.`,
    )
  }

  const mojibakeMatches = text.match(
    /[�ÃÂÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/g,
  )
  const mojibakeRatio =
    (mojibakeMatches?.length ?? 0) / Math.max(text.length, 1)
  if (mojibakeRatio > 0.04) {
    throw new Error(
      'The PDF text layer appears to be garbled after extraction. Use TXT, Markdown, or regenerate the PDF with a selectable UTF-8 text layer before review.',
    )
  }
}

function decodeUploadName(name: string) {
  const decoded = Buffer.from(name, 'latin1').toString('utf8')
  return looksLikeMojibake(name) && !looksLikeMojibake(decoded) ? decoded : name
}

function looksLikeMojibake(value: string) {
  return /[�ÃÂãäåæçèéêëìíîïðñòóôõöøùúûü]/.test(value)
}
