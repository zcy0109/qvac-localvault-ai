# LocalVault AI

LocalVault AI is a local-first confidential contract intelligence workspace for the QVAC Hackathon General Purpose Devices track. It runs on consumer Windows hardware and uses QVAC SDK for local inference, deterministic policy checks, citation-bound evidence, amendment drafting, and auditable report export without remote AI APIs.

## Track Fit

- Track: General Purpose Devices
- Device: consumer Windows laptop, 16 GB RAM, RTX 3050 Ti Laptop GPU
- Scenario: confidential vendor contracts, internal security policies, and private business documents
- Core value: sensitive documents stay local while reviewers still get structured AI-assisted analysis, source citations, hashes, hardware metadata, and reproducible validation

## Core Features

- Upload PDF, TXT, or Markdown documents.
- Clear workspace isolation to prevent old-document contamination.
- QVAC local inference for confidential document review.
- JSON Policy Pack: `policy-packs/vendor-contract.json`.
- Policy Matrix with requirement, status, evidence, and recommendation.
- Deterministic detection of contract key metrics and missing clauses.
- Evidence-bound findings that link metrics and risks to local document chunks.
- Suggested amendment drafts for missing clauses.
- Scope guardrails for empty files and non-contract documents.
- Prompt-injection robustness validation for untrusted document content.
- Audit Evidence Pack showing QVAC provider, zero remote AI calls, hashes, hardware, and reproduction paths.
- Exported reports:
  - `evidence/logs/latest-demo-run.json`
  - `evidence/logs/validation-report.json`
  - `evidence/logs/robustness-report.json`
  - `evidence/logs/review-report.json`

## QVAC Integration

- SDK: `@qvac/sdk@0.10.2`
- Model: `QWEN3_600M_INST_Q4`
- Inference entry: `server/inference.ts`
- Review orchestration: `server/analysis.ts`
- API disclosure: `evidence/api-disclosure.json`

Final logs should show:

```text
provider: qvac
remote_api_calls: []
```

## Run Locally

```powershell
npm install
$env:LOCALVAULT_PROVIDER='qvac'
$env:LOCALVAULT_REQUIRE_QVAC='true'
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Automated Validation

```powershell
$env:LOCALVAULT_PROVIDER='qvac'
$env:LOCALVAULT_REQUIRE_QVAC='true'
npm run validate:demo
npm run validate:robustness
```

The validation set checks three local contracts:

| Document | Expected Missing Clauses | Expected Key Metrics | Expected Matrix Rows |
| --- | ---: | ---: | ---: |
| `vendor-contract-risky.md` | 5 | 9 | 14 |
| `vendor-contract-partial.md` | 3 | 9 | 14 |
| `vendor-contract-complete.md` | 0 | 9 | 14 |

The report must show:

- `ok: true`
- `provider: qvac`
- `remote_api_calls: []`
- policy pack ID and version recorded
- all missing clauses have evidence chunks and amendment drafts
- all key metrics have evidence chunks
- all Policy Matrix rows have evidence chunks
- document SHA-256 and prompt SHA-256 recorded

The robustness report checks:

| Document | Expected Behavior |
| --- | --- |
| `vendor-contract-prompt-injection.md` | embedded instruction is ignored; missing clause count remains 5 |
| `unrelated-meeting-notes.md` | rejected as outside the confidential vendor contract scope |
| `empty-contract.md` | rejected before inference because no readable local text exists |

## Evidence Directory

```text
evidence/
  README.md
  api-disclosure.json
  demo-script.md
  offline-proof-checklist.md
  submission-notes.md
  logs/
    latest-demo-run.json
    validation-report.json
    robustness-report.json
    review-report.json
  sample-documents/
    vendor-contract-risky.md
    vendor-contract-partial.md
    vendor-contract-complete.md
    vendor-contract-prompt-injection.md
    unrelated-meeting-notes.md
    empty-contract.md
  hardware-screenshots/
```

## Demo Highlights

1. Show hardware: CPU, RAM, GPU, Windows.
2. Start in QVAC mode and show `provider: qvac`.
3. Upload `vendor-contract-risky.md`.
4. Show 5 missing clauses, 9 key metrics, and 14 Policy Matrix rows.
5. Click evidence chunk buttons to prove source grounding.
6. Show suggested amendment drafts.
7. Export or open `review-report.json`.
8. Show `remote_api_calls: []` and zero-cloud evidence.
9. Run `npm run validate:demo`.
10. Run `npm run validate:robustness` to show prompt-injection and invalid-input defense.

## License

Apache-2.0
