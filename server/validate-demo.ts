import fs from 'node:fs/promises'
import path from 'node:path'
import { analyzeDocuments } from './analysis.js'

const sampleDir = path.resolve('evidence', 'sample-documents')
const reportPath = path.resolve('evidence', 'logs', 'validation-report.json')

const samples = [
  {
    file: 'vendor-contract-risky.md',
    expectedMissingClauses: 5,
    expectedKeyMetrics: 9,
    purpose: 'high-risk contract with all target missing clauses',
  },
  {
    file: 'vendor-contract-partial.md',
    expectedMissingClauses: 3,
    expectedKeyMetrics: 9,
    purpose: 'partially compliant contract with breach notification and audit rights present',
  },
  {
    file: 'vendor-contract-complete.md',
    expectedMissingClauses: 0,
    expectedKeyMetrics: 9,
    purpose: 'complete contract used to check false positives',
  },
]

const question =
  'Review the uploaded confidential vendor contract. Summarize core obligations, identify legal and security risks, extract missing clauses or missing information, and create an action list.'

const sampleReports = []

for (const sample of samples) {
  const samplePath = path.join(sampleDir, sample.file)
  const text = await fs.readFile(samplePath, 'utf8')
  const result = await analyzeDocuments({
    documents: [
      {
        id: `validation-${sample.file}`,
        name: sample.file,
        text,
      },
    ],
    question,
  })

  const missingClauseCount = result.contractReview.missingClauses.length
  const keyMetricCount = result.contractReview.keyMetrics.length
  const amendmentDraftCount = result.contractReview.missingClauses.filter((finding) =>
    Boolean(finding.amendmentDraft?.trim()),
  ).length

  const checks = [
    check('provider is qvac', result.log.provider === 'qvac'),
    check('no remote AI calls', result.log.remote_api_calls.length === 0),
    check(
      `missing clause count is ${sample.expectedMissingClauses}`,
      missingClauseCount === sample.expectedMissingClauses,
    ),
    check(
      `key metric count is ${sample.expectedKeyMetrics}`,
      keyMetricCount === sample.expectedKeyMetrics,
    ),
    check(
      'all missing clauses have evidence chunks',
      result.contractReview.missingClauses.every((finding) => finding.evidenceChunkId),
    ),
    check(
      'all missing clauses have amendment drafts',
      result.contractReview.missingClauses.every((finding) =>
        Boolean(finding.amendmentDraft?.trim()),
      ),
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

  sampleReports.push({
    file: path.relative(process.cwd(), samplePath),
    purpose: sample.purpose,
    ok: checks.every((item) => item.ok),
    checks,
    expected: {
      missing_clause_count: sample.expectedMissingClauses,
      key_metric_count: sample.expectedKeyMetrics,
    },
    actual: {
      provider: result.log.provider,
      model: result.log.model,
      qvac_sdk_version: result.log.qvac_sdk_version,
      remote_api_calls: result.log.remote_api_calls,
      missing_clause_count: missingClauseCount,
      amendment_draft_count: amendmentDraftCount,
      key_metric_count: keyMetricCount,
      citation_count: result.citations.length,
      generation_ttft_ms: result.log.generation_ttft_ms,
      generation_ms: result.log.generation_ms,
      model_load_ms: result.log.model_load_ms,
      total_inference_ms: result.log.total_inference_ms,
      tokens_per_second: result.log.tokens_per_second,
      end_to_end_tokens_per_second: result.log.end_to_end_tokens_per_second,
      document_hash: result.log.document_hashes[0]?.sha256,
      prompt_hash: result.log.system_prompt_hash,
    },
  })
}

const report = {
  ok: sampleReports.every((item) => item.ok),
  timestamp: new Date().toISOString(),
  samples: sampleReports,
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
