import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Gauge,
  Lock,
  Play,
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
    'Summarize the files, identify risks, extract missing information, and create an action list.',
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

    setDocuments((current) => [...current, ...extracted])
    setStatus(`${extracted.length} file(s) staged for private review.`)
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
            <div className="output">
              <section>
                <h3>Summary</h3>
                <p>{result.summary}</p>
              </section>
              <section>
                <h3>Answer</h3>
                <p>{result.answer}</p>
              </section>
              <section className="two-column">
                <ListBlock title="Risks" items={result.risks} />
                <ListBlock title="Action Items" items={result.actionItems} />
              </section>
            </div>
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

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
