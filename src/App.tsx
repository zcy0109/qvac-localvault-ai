import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  ListChecks,
  Lock,
  Play,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react'
import './App.css'

type DocumentInput = {
  id: string
  name: string
  text: string
}

type AnalysisResult = {
  summary: string
  answer: string
  risks: string[]
  actionItems: string[]
  citations: Array<{
    chunkId: string
    documentName: string
    quote: string
  }>
  contractReview: {
    keyMetrics: Array<{
      label: string
      value: string
      evidence: string
      evidenceChunkId?: string
      evidenceDocumentName?: string
      evidenceChunkIndex?: number
    }>
    missingClauses: Array<{
      title: string
      evidence: string
      evidenceAnchor?: string
      risk: string
      action: string
      amendmentDraft: string
      evidenceChunkId?: string
      evidenceDocumentName?: string
      evidenceChunkIndex?: number
    }>
    reviewMatrix: Array<{
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
    }>
    risks: string[]
    actionItems: string[]
    brief: string
  }
  log: {
    timestamp: string
    provider: string
    purpose: string
    analysis_mode?: string
    model: string
    qvac_sdk_version?: string
    model_load_ms: number
    prompt_chars?: number
    system_prompt_hash?: string
    prompt_tokens_estimate: number
    output_tokens_estimate: number
    ttft_ms: number
    generation_ttft_ms?: number
    generation_ms?: number
    tokens_per_second: number
    end_to_end_tokens_per_second?: number
    total_inference_ms: number
    document_count?: number
    input_file_names?: string[]
    document_hashes?: Array<{
      name: string
      sha256: string
      chars: number
    }>
    chunk_count?: number
    retrieved_chunks?: Array<{
      id: string
      documentName: string
      index: number
      score: number
    }>
    selected_chunks: string[]
    policy_pack_id?: string
    policy_pack_version?: string
    review_matrix_count?: number
    missing_clause_count?: number
    key_metric_count?: number
    device_info: {
      os: string
      cpu: string
      cpu_count: number
      total_ram_gb: number
      free_ram_gb: number
      node: string
    }
    remote_api_calls: string[]
  }
}

function App() {
  const [documents, setDocuments] = useState<DocumentInput[]>([])
  const [question, setQuestion] = useState(
    'Review the uploaded confidential vendor contract. Summarize core obligations, identify legal and security risks, extract missing clauses or missing information, and create an action list.',
  )
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [status, setStatus] = useState('准备进行本地审查。')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [activeCitationId, setActiveCitationId] = useState('')

  const totalChars = useMemo(
    () => documents.reduce((total, document) => total + document.text.length, 0),
    [documents],
  )

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return

    setError('')
    setStatus('正在提取本地文件...')

    const extracted: DocumentInput[] = []
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        setError(`无法提取 ${file.name}。请尝试 TXT、Markdown 或可解析的 PDF。`)
        continue
      }

      extracted.push(await response.json())
    }

    setDocuments(extracted)
    setResult(null)
    setActiveCitationId('')
    setStatus(
      `已载入 ${extracted.length} 个文件用于本地保密审查，旧工作区已清空。`,
    )
  }

  function removeDocument(id: string) {
    setDocuments((current) => current.filter((document) => document.id !== id))
    setResult(null)
    setActiveCitationId('')
    setStatus('文件已从本地审查工作区移除。')
  }

  function clearWorkspace() {
    setDocuments([])
    setResult(null)
    setActiveCitationId('')
    setError('')
    setStatus('工作区已清空。请上传下一组待审查文件。')
  }

  async function analyze() {
    if (!documents.length) {
      setError('请先上传至少一个文件。')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setStatus('正在运行本地保密审查...')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents, question }),
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error ?? '分析失败。')
      }

      const payload = await response.json()
      setResult(payload)
      setActiveCitationId(payload.citations?.[0]?.chunkId ?? '')
      setStatus('分析完成。证据日志已导出到本地。')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '分析失败。')
      setStatus('分析已停止。')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">QVAC 黑客马拉松 · 通用设备赛道</p>
          <h1>LocalVault AI</h1>
        </div>
        <div className="privacy-badge">
          <Lock size={18} />
          本地优先的文档智能
        </div>
      </header>

      <section className="metrics">
        <Metric label="文件" value={documents.length.toString()} />
        <Metric label="本地文本" value={`${totalChars.toLocaleString()} 个字符`} />
        <Metric
          label="推理提供方"
          value={result?.log.provider ?? 'auto'}
          warning={result?.log.provider === 'mock-development'}
        />
        <Metric
          label="远程 AI 调用"
          value={result?.log.remote_api_calls.length.toString() ?? '0'}
        />
      </section>

      <section className="workspace">
        <aside className="panel upload-panel">
          <div className="panel-title">
            <Upload size={18} />
            <h2>文件</h2>
          </div>
          <button
            type="button"
            className="ghost-button"
            onClick={clearWorkspace}
            disabled={!documents.length || isAnalyzing}
          >
            <Trash2 size={16} />
            清空工作区
          </button>
          <label className="dropzone">
            <input
              type="file"
              multiple
              accept=".txt,.md,.markdown,.pdf"
              onChange={(event) => handleFiles(event.target.files)}
            />
            <FileText size={28} />
            <span>上传 PDF、TXT 或 Markdown 文件</span>
          </label>

          <div className="doc-list">
            {documents.map((document) => (
              <article key={document.id} className="doc-row">
                <FileText size={16} />
                <div>
                  <strong>{document.name}</strong>
                  <span>{document.text.length.toLocaleString()} chars</span>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove ${document.name}`}
                  onClick={() => removeDocument(document.id)}
                  disabled={isAnalyzing}
                >
                  <Trash2 size={15} />
                </button>
              </article>
            ))}
          </div>
        </aside>

        <section className="panel command-panel">
          <div className="panel-title">
            <Activity size={18} />
            <h2>保密审查</h2>
          </div>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            aria-label="Review instruction"
          />
          <button type="button" onClick={analyze} disabled={isAnalyzing}>
            <Play size={17} />
            {isAnalyzing ? '正在分析...' : '运行本地审查'}
          </button>
          <p className="status">{status}</p>
          {error && (
            <p className="error">
              <AlertTriangle size={16} />
              {error}
            </p>
          )}

          {result && (
            <ContractReviewPanel
              activeCitationId={activeCitationId}
              result={result}
              onSelectCitation={setActiveCitationId}
            />
          )}
        </section>

        <aside className="panel evidence-panel">
          <div className="panel-title">
            <Gauge size={18} />
            <h2>证据</h2>
          </div>

          {result ? (
            <>
              <div className="log-grid">
                <Metric
                  label="首 token 延迟"
                  value={`${result.log.generation_ttft_ms ?? result.log.ttft_ms} ms`}
                />
                <Metric
                  label="生成速度 TPS"
                  value={result.log.tokens_per_second.toString()}
                />
                <Metric
                  label="生成耗时"
                  value={`${result.log.generation_ms ?? result.log.total_inference_ms} ms`}
                />
                <Metric label="模型加载" value={`${result.log.model_load_ms} ms`} />
              </div>
              <div className="audit">
                <CheckCircle2 size={17} />
                <span>最新日志已导出到 evidence/logs/latest-demo-run.json</span>
              </div>
              <AuditEvidencePack result={result} />
              <div className="evidence-meta">
                <EvidenceItem label="QVAC SDK" value={result.log.qvac_sdk_version} />
                <EvidenceItem label="分析模式" value={result.log.analysis_mode} />
                <EvidenceItem
                  label="文档 SHA-256"
                  value={shortHash(result.log.document_hashes?.[0]?.sha256)}
                />
                <EvidenceItem
                  label="Prompt SHA-256"
                  value={shortHash(result.log.system_prompt_hash)}
                />
                <EvidenceItem
                  label="分片 / 检索"
                  value={`${result.log.chunk_count ?? 0} / ${
                    result.log.retrieved_chunks?.length ??
                    result.log.selected_chunks.length
                  }`}
                />
                <EvidenceItem
                  label="缺失条款 / 关键指标"
                  value={`${result.log.missing_clause_count ?? 0} / ${
                    result.log.key_metric_count ?? 0
                  }`}
                />
                <EvidenceItem
                  label="端到端总耗时"
                  value={`${result.log.total_inference_ms} ms`}
                />
                <EvidenceItem
                  label="端到端 TPS"
                  value={
                    result.log.end_to_end_tokens_per_second ??
                    result.log.tokens_per_second
                  }
                />
              </div>
              <h3>引用证据</h3>
              <div className="citation-list">
                {result.citations.map((citation) => (
                  <article
                    key={citation.chunkId}
                    className={
                      citation.chunkId === activeCitationId
                        ? 'citation active'
                        : 'citation'
                    }
                  >
                    <strong>{citation.documentName}</strong>
                    <span>{citation.chunkId}</span>
                    <p>{citation.quote}</p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p className="empty">
              运行审查后将生成引用、设备元数据和可审计性能日志。
            </p>
          )}
        </aside>
      </section>
    </main>
  )
}

function Metric({
  label,
  value,
  warning = false,
}: {
  label: string
  value: string
  warning?: boolean
}) {
  return (
    <div className={warning ? 'metric warning' : 'metric'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function EvidenceItem({
  label,
  value,
}: {
  label: string
  value?: string | number
}) {
  const displayValue = value === undefined || value === null || value === '' ? '未记录' : value

  return (
    <div className="evidence-item">
      <span>{label}</span>
      <strong>{displayValue}</strong>
    </div>
  )
}

function AuditEvidencePack({ result }: { result: AnalysisResult }) {
  const validationPass =
    result.log.provider === 'qvac' &&
    result.log.remote_api_calls.length === 0 &&
    Boolean(result.log.document_hashes?.[0]?.sha256) &&
    Boolean(result.log.system_prompt_hash)
  const device = result.log.device_info

  return (
    <section className="evidence-pack">
      <div className="section-heading">
        <ShieldCheck size={17} />
        <h3>Audit Evidence Pack</h3>
      </div>
      <div className={validationPass ? 'pack-status pass' : 'pack-status warn'}>
        <CheckCircle2 size={16} />
        <strong>{validationPass ? 'Validation ready' : 'Needs review'}</strong>
        <span>
          QVAC local inference, zero remote AI calls, hashes and hardware metadata
          recorded.
        </span>
      </div>
      <div className="pack-grid">
        <EvidenceItem label="Provider" value={result.log.provider} />
        <EvidenceItem
          label="Remote AI calls"
          value={result.log.remote_api_calls.length}
        />
        <EvidenceItem label="Model" value={result.log.model} />
        <EvidenceItem
          label="Device"
          value={`${device.cpu_count} threads / ${device.total_ram_gb} GB RAM`}
        />
      </div>
      <div className="pack-paths">
        <span>Reproduce: npm run validate:demo</span>
                <span>Log: evidence/logs/latest-demo-run.json</span>
                <span>Report: evidence/logs/validation-report.json</span>
                <span>Review report: evidence/logs/review-report.json</span>
              </div>
            </section>
  )
}

function ContractReviewPanel({
  activeCitationId,
  result,
  onSelectCitation,
}: {
  activeCitationId: string
  result: AnalysisResult
  onSelectCitation: (chunkId: string) => void
}) {
  const review = result.contractReview ?? {
    keyMetrics: [],
    missingClauses: [],
    reviewMatrix: [],
    risks: result.risks,
    actionItems: result.actionItems,
    brief: result.summary,
  }
  const missingClauses = Array.isArray(review.missingClauses)
    ? review.missingClauses
    : []
  const keyMetrics = Array.isArray(review.keyMetrics) ? review.keyMetrics : []
  const reviewMatrix = Array.isArray(review.reviewMatrix)
    ? review.reviewMatrix
    : []
  const risks = cleanList(Array.isArray(review.risks) ? review.risks : result.risks)
  const actionItems = cleanList(
    Array.isArray(review.actionItems) ? review.actionItems : result.actionItems,
  )

  return (
    <div className="output review-output">
      <section className="review-hero">
        <div>
          <h3>合同概述</h3>
          <p>{cleanDisplayText(result.summary, 'summary')}</p>
        </div>
        <div className="review-score">
          <span>缺失条款</span>
          <strong>{missingClauses.length}</strong>
        </div>
      </section>

      <section>
        <div className="section-heading split-heading">
          <div>
            <ListChecks size={17} />
            <h3>Policy Matrix</h3>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => downloadReviewReport(result)}
          >
            <Download size={15} />
            导出报告
          </button>
        </div>
        <div className="matrix-table" role="table" aria-label="Policy review matrix">
          <div className="matrix-row matrix-header" role="row">
            <span>要求项</span>
            <span>状态</span>
            <span>证据</span>
            <span>建议</span>
          </div>
          {reviewMatrix.map((row) => (
            <div
              key={row.id}
              className={`matrix-row matrix-${row.status}`}
              role="row"
            >
              <div>
                <strong>{row.requirement}</strong>
                <small>{row.category}</small>
              </div>
              <span className={`matrix-status ${row.status}`}>
                {formatMatrixStatus(row.status)}
              </span>
              <p>{row.evidence}</p>
              <p>{row.recommendation}</p>
              {row.evidenceChunkId && (
                <button
                  type="button"
                  className="evidence-link matrix-link"
                  onClick={() => onSelectCitation(row.evidenceChunkId ?? '')}
                >
                  证据分片 {shortHash(row.evidenceChunkId)}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <ListChecks size={17} />
          <h3>关键指标</h3>
        </div>
        <div className="metric-list">
          {keyMetrics.map((metric) => (
            <article
              key={`${metric.label}-${metric.evidence}`}
              className={
                metric.evidenceChunkId === activeCitationId
                  ? 'metric-card linked'
                  : 'metric-card'
              }
            >
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.evidence}</p>
              {metric.evidenceChunkId && (
                <button
                  type="button"
                  className="evidence-link"
                  onClick={() => onSelectCitation(metric.evidenceChunkId ?? '')}
                >
                  证据分片 {shortHash(metric.evidenceChunkId)}
                </button>
              )}
            </article>
          ))}
          {!keyMetrics.length && <p>未提取到关键数值条款。</p>}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <ShieldAlert size={17} />
          <h3>缺失条款</h3>
        </div>
        <div className="finding-list">
          {missingClauses.map((finding) => (
            <article
              key={finding.title}
              className={
                finding.evidenceChunkId === activeCitationId
                  ? 'finding-card high linked'
                  : 'finding-card high'
              }
            >
              <div>
                <span className="severity">高风险</span>
                <h4>{finding.title}</h4>
              </div>
              <p>{finding.risk}</p>
              <blockquote>{finding.evidence}</blockquote>
              {finding.amendmentDraft && (
                <div className="amendment-draft">
                  <span>Suggested amendment</span>
                  <p>{finding.amendmentDraft}</p>
                </div>
              )}
              {finding.evidenceChunkId && (
                <button
                  type="button"
                  className="evidence-link"
                  onClick={() => onSelectCitation(finding.evidenceChunkId ?? '')}
                >
                  证据分片 {shortHash(finding.evidenceChunkId)}
                </button>
              )}
            </article>
          ))}
          {!missingClauses.length && (
            <article className="finding-card clean">
              <div>
                <span className="severity">通过</span>
                <h4>未检测到预设缺失条款</h4>
              </div>
              <p>本地确定性审查未发现需要补充的预设缺失条款。</p>
            </article>
          )}
        </div>
      </section>

      <section className="two-column">
        <div>
          <div className="section-heading">
            <ShieldCheck size={17} />
            <h3>风险登记</h3>
          </div>
          <ul className="compact-list">
            {risks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="section-heading">
            <CheckCircle2 size={17} />
            <h3>行动计划</h3>
          </div>
          <ul className="compact-list">
            {actionItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h3>本地分析说明</h3>
        <p>{cleanDisplayText(result.answer, 'answer')}</p>
      </section>
    </div>
  )
}

function cleanDisplayText(text: unknown, key?: string) {
  const raw = typeof text === 'string' ? text : String(text ?? '')
  const clean = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\u601d\u8003>[\s\S]*?<\/\u601d\u8003>/gu, '')
    .replace(/^\s*```(?:json|JSON)?\s*/u, '')
    .replace(/\s*```\s*$/u, '')
    .replace(/```(?:json|JSON)?/gu, '')
    .trim()

  if (key) {
    const extracted = extractJsonLikeField(clean, key)
    if (extracted) return extracted
  }

  return clean
}

function cleanList(items: unknown[]) {
  return items
    .map((item) => cleanDisplayText(item))
    .filter((item) => item && !item.includes('```json'))
}

function extractJsonLikeField(text: string, key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  const quoted = text.match(
    new RegExp(`["']${escapedKey}["']\\s*:\\s*["']([^"']+)`, 'u'),
  )
  if (quoted?.[1]) return quoted[1].trim()

  const bare = text.match(
    new RegExp(`${escapedKey}\\s*[:\uFF1A]\\s*([^\\n{]+)`, 'iu'),
  )
  return bare?.[1]?.trim() ?? ''
}

function shortHash(value?: string) {
  if (!value) return ''
  return `${value.slice(0, 10)}...${value.slice(-8)}`
}

function formatMatrixStatus(status: 'present' | 'missing' | 'review') {
  if (status === 'present') return '通过'
  if (status === 'missing') return '缺失'
  return '复核'
}

function downloadReviewReport(result: AnalysisResult) {
  const report = {
    generated_at: result.log.timestamp ?? new Date().toISOString(),
    project: 'LocalVault AI',
    analysis_mode: result.log.analysis_mode,
    policy_pack: {
      id: result.log.policy_pack_id,
      version: result.log.policy_pack_version,
    },
    local_inference: {
      provider: result.log.provider,
      model: result.log.model,
      qvac_sdk_version: result.log.qvac_sdk_version,
      remote_api_calls: result.log.remote_api_calls,
      device_info: result.log.device_info,
    },
    evidence: {
      document_hashes: result.log.document_hashes,
      system_prompt_hash: result.log.system_prompt_hash,
      retrieved_chunks: result.log.retrieved_chunks,
    },
    performance: {
      model_load_ms: result.log.model_load_ms,
      generation_ttft_ms: result.log.generation_ttft_ms,
      generation_ms: result.log.generation_ms,
      total_inference_ms: result.log.total_inference_ms,
      tokens_per_second: result.log.tokens_per_second,
      end_to_end_tokens_per_second: result.log.end_to_end_tokens_per_second,
    },
    summary: result.summary,
    review_matrix: result.contractReview.reviewMatrix,
    missing_clauses: result.contractReview.missingClauses,
    key_metrics: result.contractReview.keyMetrics,
    risks: result.risks,
    action_items: result.actionItems,
  }
  const url = URL.createObjectURL(
    new Blob([`${JSON.stringify(report, null, 2)}\n`], {
      type: 'application/json',
    }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'localvault-review-report.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export default App

