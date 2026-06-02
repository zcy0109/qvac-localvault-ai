import { performance } from 'node:perf_hooks'
import crypto from 'node:crypto'
import { getDeviceInfo } from './device.js'
import type { InferenceLog, SourceChunk } from './types.js'

type CompletionInput = {
  prompt: string
  purpose: string
  selectedChunks: SourceChunk[]
}

type CompletionOutput = {
  text: string
  log: InferenceLog
}

let qvacModelId: string | undefined
let qvacModelLoadMs = 0

export async function runCompletion({
  prompt,
  purpose,
  selectedChunks,
}: CompletionInput): Promise<CompletionOutput> {
  const provider = process.env.LOCALVAULT_PROVIDER ?? 'auto'

  if (provider !== 'mock') {
    try {
      return await runQvacCompletion({ prompt, purpose, selectedChunks })
    } catch (error) {
      if (process.env.LOCALVAULT_REQUIRE_QVAC === 'true') {
        throw error
      }

      console.warn('[LocalVault] QVAC provider unavailable, using mock provider.')
      console.warn(error)
    }
  }

  return runMockCompletion({ prompt, purpose, selectedChunks })
}

async function runQvacCompletion({
  prompt,
  purpose,
  selectedChunks,
}: CompletionInput): Promise<CompletionOutput> {
  const started = performance.now()
  const qvac = await import('@qvac/sdk')
  const modelSrc = qvac.QWEN3_600M_INST_Q4 ?? qvac.LLAMA_3_2_1B_INST_Q4_0
  const model = modelSrc.name ?? 'QWEN3_600M_INST_Q4'

  if (!qvacModelId) {
    const loadStarted = performance.now()
    qvacModelId = await qvac.loadModel({
      modelSrc,
        modelType: 'llamacpp-completion',
        modelConfig: { ctx_size: 4096 },
      onProgress: (progress: unknown) => console.info('[QVAC]', progress),
    })
    qvacModelLoadMs = Math.round(performance.now() - loadStarted)
  }

  const result = qvac.completion({
    modelId: qvacModelId,
    history: [{ role: 'user', content: prompt }],
    stream: true,
    generationParams: {
      temp: 0.2,
      predict: 512,
    },
  })

  let text = ''
  let firstTokenAt = 0
  for await (const event of result.events) {
    if (event.type === 'contentDelta') {
      if (!firstTokenAt) firstTokenAt = performance.now()
      text += event.text
    }
    if (event.type === 'completionDone' && event.stopReason === 'error') {
      throw new Error(event.error.message)
    }
  }
  const final = await result.final
  text = final.contentText || final.raw.fullText || text

  const totalMs = Math.round(performance.now() - started)
  const outputTokens = estimateTokens(text)

  return {
    text,
    log: makeLog({
      provider: 'qvac',
      purpose,
      model,
      modelLoadMs: qvacModelLoadMs,
      prompt,
      output: text,
      ttftMs: firstTokenAt ? Math.round(firstTokenAt - started) : totalMs,
      totalMs,
      tokensPerSecond: outputTokens / Math.max(totalMs / 1000, 0.001),
      selectedChunks,
      remoteApiCalls: [],
    }),
  }
}

async function runMockCompletion({
  prompt,
  purpose,
  selectedChunks,
}: CompletionInput): Promise<CompletionOutput> {
  const started = performance.now()
  const context = selectedChunks.map((chunk) => chunk.text).join('\n\n')
  const keyLines = context
    .split(/[。\n.]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6)

  await new Promise((resolve) => setTimeout(resolve, 120))

  const text = JSON.stringify(
    {
      summary:
        keyLines.slice(0, 2).join('。 ') ||
        'The document set is ready for local review.',
      answer:
        'Development provider response. Replace with QVAC by installing a working @qvac/sdk release and setting LOCALVAULT_PROVIDER=qvac.',
      risks: [
        'Verify that every final inference log uses provider=qvac.',
        'Keep source citations aligned with the selected local chunks.',
        'Disclose any non-AI remote calls before submission.',
      ],
      actionItems: [
        'Run npm run qvac:smoke on the target laptop.',
        'Record a final demo run with provider=qvac.',
        'Export evidence/demo-run.json before DoraHacks submission.',
      ],
    },
    null,
    2,
  )

  const totalMs = Math.round(performance.now() - started)
  const outputTokens = estimateTokens(text)

  return {
    text,
    log: makeLog({
      provider: 'mock-development',
      purpose,
      model: 'local-heuristic-development-provider',
      modelLoadMs: 0,
      prompt,
      output: text,
      ttftMs: 120,
      totalMs,
      tokensPerSecond: outputTokens / Math.max(totalMs / 1000, 0.001),
      selectedChunks,
      remoteApiCalls: [],
    }),
  }
}

function makeLog(input: {
  provider: string
  purpose: string
  model: string
  modelLoadMs: number
  prompt: string
  output: string
  ttftMs: number
  totalMs: number
  tokensPerSecond: number
  selectedChunks: SourceChunk[]
  remoteApiCalls: string[]
}): InferenceLog {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    provider: input.provider,
    purpose: input.purpose,
    model: input.model,
    model_load_ms: input.modelLoadMs,
    prompt_chars: input.prompt.length,
    prompt_tokens_estimate: estimateTokens(input.prompt),
    output_chars: input.output.length,
    output_tokens_estimate: estimateTokens(input.output),
    ttft_ms: input.ttftMs,
    tokens_per_second: Number(input.tokensPerSecond.toFixed(2)),
    total_inference_ms: input.totalMs,
    selected_chunks: input.selectedChunks.map((chunk) => chunk.id),
    device_info: getDeviceInfo(),
    remote_api_calls: input.remoteApiCalls,
  }
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4))
}
