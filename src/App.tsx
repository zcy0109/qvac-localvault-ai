import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
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
    }>
    missingClauses: Array<{
      title: string
      evidence: string
      risk: string
      action: string
    }>
    risks: string[]
    actionItems: string[]
    brief: string
  }
  log: {
    provider: string
    purpose: string
    model: string
    model_load_ms: number
    prompt_tokens_estimate: number
    output_tokens_estimate: number
    ttft_ms: number
    tokens_per_second: number
    total_inference_ms: number
    selected_chunks: string[]
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
  const [status, setStatus] = useState('Ready for local analysis.')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const totalChars = useMemo(
    () => documents.reduce((total, document) => total + document.text.length, 0),
    [documents],
  )

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return

    setError('')
    setStatus('Extracting local files...')

    const extracted: DocumentInput[] = []
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        setError(`Could not extract ${file.name}. Try a TXT or Markdown file.`)
        continue
      }

      extracted.push(await response.json())
    }

    setDocuments(extracted)
    setResult(null)
    setStatus(
      `${extracted.length} file(s) staged for private review. Previous workspace cleared.`,
    )
  }

  function removeDocument(id: string) {
    setDocuments((current) => current.filter((document) => document.id !== id))
    setResult(null)
    setStatus('Document removed from the local review workspace.')
  }

  function clearWorkspace() {
    setDocuments([])
    setResult(null)
    setError('')
    setStatus('Workspace cleared. Upload the next document set to review.')
  }

  async function analyze() {
    if (!documents.length) {
      setError('Upload at least one document first.')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setStatus('Running local confidential review...')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents, question }),
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error ?? 'Analysis failed.')
      }

      setResult(await response.json())
      setStatus('Analysis complete. Evidence log exported locally.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Analysis failed.')
      setStatus('Analysis stopped.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">QVAC Hackathon · General Purpose Devices</p>
          <h1>LocalVault AI</h1>
        </div>
        <div className="privacy-badge">
          <Lock size={18} />
          Local-first document intelligence
        </div>
      </header>

      <section className="metrics">
        <Metric label="Documents" value={documents.length.toString()} />
        <Metric label="Local text" value={`${totalChars.toLocaleString()} chars`} />
        <Metric
          label="Provider"
          value={result?.log.provider ?? 'auto'}
          warning={result?.log.provider === 'mock-development'}
        />
        <Metric
          label="Remote AI calls"
          value={result?.log.remote_api_calls.length.toString() ?? '0'}
        />
      </section>

      <section className="workspace">
        <aside className="panel upload-panel">
          <div className="panel-title">
            <Upload size={18} />
            <h2>Files</h2>
          </div>
          <button
            type="button"
            className="ghost-button"
            onClick={clearWorkspace}
            disabled={!documents.length || isAnalyzing}
          >
            <Trash2 size={16} />
            Clear workspace
          </button>
          <label className="dropzone">
            <input
              type="file"
              multiple
              accept=".txt,.md,.markdown,.pdf"
              onChange={(event) => handleFiles(event.target.files)}
            />
            <FileText size={28} />
            <span>Upload PDF, TXT, or Markdown</span>
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
            <h2>Confidential Review</h2>
          </div>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            aria-label="Review instruction"
          />
          <button type="button" onClick={analyze} disabled={isAnalyzing}>
            <Play size={17} />
            {isAnalyzing ? 'Analyzing...' : 'Run local review'}
          </button>
          <p className="status">{status}</p>
          {error && (
            <p className="error">
              <AlertTriangle size={16} />
              {error}
            </p>
          )}

          {result && (
            <ContractReviewPanel result={result} />
          )}
        </section>

        <aside className="panel evidence-panel">
          <div className="panel-title">
            <Gauge size={18} />
            <h2>Evidence</h2>
          </div>

          {result ? (
            <>
              <div className="log-grid">
                <Metric label="TTFT" value={`${result.log.ttft_ms} ms`} />
                <Metric label="TPS" value={result.log.tokens_per_second.toString()} />
                <Metric label="Total" value={`${result.log.total_inference_ms} ms`} />
                <Metric label="Model load" value={`${result.log.model_load_ms} ms`} />
              </div>
              <div className="audit">
                <CheckCircle2 size={17} />
                <span>Latest log exported to evidence/logs/latest-demo-run.json</span>
              </div>
              <h3>Citations</h3>
              <div className="citation-list">
                {result.citations.map((citation) => (
                  <article key={citation.chunkId} className="citation">
                    <strong>{citation.documentName}</strong>
                    <span>{citation.chunkId}</span>
                    <p>{citation.quote}</p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p className="empty">
              Run a review to generate citations, device metadata, and an
              auditable performance log.
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

function ContractReviewPanel({ result }: { result: AnalysisResult }) {
  const review = result.contractReview
  const missingClauses = review.missingClauses
  const keyMetrics = review.keyMetrics
  const risks = cleanList(review.risks)
  const actionItems = cleanList(review.actionItems)

  return (
    <div className="output review-output">
      <section className="review-hero">
        <div>
          <h3>Contract Overview</h3>
          <p>{cleanDisplayText(result.summary, 'summary')}</p>
        </div>
        <div className="review-score">
          <span>Missing clauses</span>
          <strong>{missingClauses.length}</strong>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <ListChecks size={17} />
          <h3>Key Metrics</h3>
        </div>
        <div className="metric-list">
          {keyMetrics.map((metric) => (
            <article key={`${metric.label}-${metric.evidence}`} className="metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.evidence}</p>
            </article>
          ))}
          {!keyMetrics.length && <p>No key numeric terms were extracted.</p>}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <ShieldAlert size={17} />
          <h3>Missing Clauses</h3>
        </div>
        <div className="finding-list">
          {missingClauses.map((finding) => (
            <article key={finding.title} className="finding-card high">
              <div>
                <span className="severity">High</span>
                <h4>{finding.title}</h4>
              </div>
              <p>{finding.risk}</p>
              <blockquote>{finding.evidence}</blockquote>
            </article>
          ))}
          {!missingClauses.length && (
            <article className="finding-card clean">
              <div>
                <span className="severity">Clear</span>
                <h4>No explicit missing-clause marker found</h4>
              </div>
              <p>The local deterministic review did not detect the demo missing-clause patterns.</p>
            </article>
          )}
        </div>
      </section>

      <section className="two-column">
        <div>
          <div className="section-heading">
            <ShieldCheck size={17} />
            <h3>Risk Register</h3>
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
            <h3>Action Plan</h3>
          </div>
          <ul className="compact-list">
            {actionItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h3>QVAC Local Analysis</h3>
        <p>{cleanDisplayText(result.answer, 'answer')}</p>
      </section>
    </div>
  )
}

function cleanDisplayText(text: string, key?: string) {
  const clean = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<鎬濊€?[\s\S]*?<\/鎬濊€?/g, '')
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

function cleanList(items: string[]) {
  return items
    .map((item) => cleanDisplayText(item))
    .filter((item) => item && !item.includes('```json'))
}

function extractJsonLikeField(text: string, key: string) {
  const quoted = text.match(
    new RegExp(`["']${key}["']\\s*:\\s*["']([^"']+)`, 'u'),
  )
  if (quoted?.[1]) return quoted[1].trim()

  const bare = text.match(new RegExp(`${key}\\s*[:锛歖\\s*([^\\n{]+)`, 'iu'))
  return bare?.[1]?.trim() ?? ''
}

export default App

