export type DocumentInput = {
  id: string
  name: string
  text: string
}

export type SourceChunk = {
  id: string
  documentId: string
  documentName: string
  index: number
  text: string
  score: number
}

export type InferenceLog = {
  id: string
  timestamp: string
  provider: string
  purpose: string
  model: string
  model_load_ms: number
  prompt_chars: number
  prompt_tokens_estimate: number
  output_chars: number
  output_tokens_estimate: number
  ttft_ms: number
  tokens_per_second: number
  total_inference_ms: number
  selected_chunks: string[]
  device_info: DeviceInfo
  remote_api_calls: string[]
}

export type DeviceInfo = {
  os: string
  arch: string
  cpu: string
  cpu_count: number
  total_ram_gb: number
  free_ram_gb: number
  node: string
}

export type AnalysisResult = {
  summary: string
  answer: string
  risks: string[]
  actionItems: string[]
  citations: Array<{
    chunkId: string
    documentName: string
    quote: string
  }>
  chunks: SourceChunk[]
  log: InferenceLog
}
