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
  analysis_mode: string
  model: string
  qvac_sdk_version: string
  model_load_ms: number
  prompt_chars: number
  system_prompt_hash: string
  prompt_tokens_estimate: number
  output_chars: number
  output_tokens_estimate: number
  ttft_ms: number
  generation_ttft_ms: number
  generation_ms: number
  tokens_per_second: number
  end_to_end_tokens_per_second: number
  total_inference_ms: number
  document_count: number
  input_file_names: string[]
  document_hashes: Array<{
    name: string
    sha256: string
    chars: number
  }>
  chunk_count: number
  retrieved_chunks: Array<{
    id: string
    documentName: string
    index: number
    score: number
  }>
  selected_chunks: string[]
  policy_pack_id?: string
  policy_pack_version?: string
  review_matrix_count?: number
  missing_clause_count: number
  key_metric_count: number
  device_info: DeviceInfo
  remote_api_calls: string[]
}

export type ContractFinding = {
  title: string
  evidence: string
  evidenceAnchor?: string
  risk: string
  action: string
  amendmentDraft: string
  evidenceChunkId?: string
  evidenceDocumentName?: string
  evidenceChunkIndex?: number
}

export type ContractMetric = {
  label: string
  value: string
  evidence: string
  evidenceChunkId?: string
  evidenceDocumentName?: string
  evidenceChunkIndex?: number
}

export type ReviewMatrixRow = {
  id: string
  category: string
  requirement: string
  status: 'present' | 'missing' | 'review'
  severity: 'high' | 'medium' | 'low'
  evidence: string
  evidenceAnchor?: string
  recommendation: string
  evidenceChunkId?: string
  evidenceDocumentName?: string
  evidenceChunkIndex?: number
}

export type ContractReview = {
  keyMetrics: ContractMetric[]
  missingClauses: ContractFinding[]
  reviewMatrix: ReviewMatrixRow[]
  risks: string[]
  actionItems: string[]
  brief: string
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
  contractReview: ContractReview
  chunks: SourceChunk[]
  log: InferenceLog
}
