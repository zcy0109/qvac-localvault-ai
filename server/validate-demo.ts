import fs from 'node:fs/promises'
import path from 'node:path'
import { analyzeDocuments } from './analysis.js'

const samplePath = path.resolve(
  'evidence',
  'sample-documents',
  'confidential-vendor-contract.md',
)
const reportPath = path.resolve('evidence', 'logs', 'validation-report.json')

const text = await fs.readFile(samplePath, 'utf8')
const result = await analyzeDocuments({
  documents: [
    {
      id: 'validation-confidential-vendor-contract',
      name: 'confidential-vendor-contract.md',
      text,
    },
  ],
  question:
    'Review the uploaded confidential vendor contract. Summarize core obligations, identify legal and security risks, extract missing clauses or missing information, and create an action list.',
})

const checks = [
  check('provider is qvac', result.log.provider === 'qvac'),
  check('no remote AI calls', result.log.remote_api_calls.length === 0),
  check('five missing clauses detected', result.contractReview.missingClauses.length === 5),
  check('nine key metrics detected', result.contractReview.keyMetrics.length === 9),
  check(
    'all missing clauses have evidence chunks',
    result.contractReview.missingClauses.every((finding) => finding.evidenceChunkId),
  ),
  check(
    'all key metrics have evidence chunks',
    result.contractReview.keyMetrics.every((metric) => metric.evidenceChunkId),
  ),
  check(
    'public analysis note has no hidden reasoning leak',
    !/<think>|<\u601d\u8003>|```|json/iu.test(result.answer),
  ),
  check('document hash recorded', Boolean(result.log.document_hashes[0]?.sha256)),
  check('prompt hash recorded', Boolean(result.log.system_prompt_hash)),
]

const report = {
  ok: checks.every((item) => item.ok),
  timestamp: new Date().toISOString(),
  sample: path.relative(process.cwd(), samplePath),
  checks,
  metrics: {
    provider: result.log.provider,
    model: result.log.model,
    qvac_sdk_version: result.log.qvac_sdk_version,
    remote_api_calls: result.log.remote_api_calls,
    missing_clause_count: result.contractReview.missingClauses.length,
    key_metric_count: result.contractReview.keyMetrics.length,
    citation_count: result.citations.length,
    generation_ttft_ms: result.log.generation_ttft_ms,
    generation_ms: result.log.generation_ms,
    model_load_ms: result.log.model_load_ms,
    total_inference_ms: result.log.total_inference_ms,
    tokens_per_second: result.log.tokens_per_second,
    end_to_end_tokens_per_second: result.log.end_to_end_tokens_per_second,
  },
  evidence: {
    latest_demo_run: 'evidence/logs/latest-demo-run.json',
    validation_report: 'evidence/logs/validation-report.json',
    api_disclosure: 'evidence/api-disclosure.json',
  },
}

await fs.mkdir(path.dirname(reportPath), { recursive: true })
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(JSON.stringify(report, null, 2))

process.exit(report.ok ? 0 : 1)

function check(name: string, ok: boolean) {
  return { name, ok }
}
