# LocalVault AI Demo Script

Target length: under 5 minutes.

## 0:00 - 0:25 Problem And Product

Confidential vendor contracts often contain customer PII, internal security requirements, incident-response obligations, pricing terms, and operational risk. Uploading them to a cloud AI API can create privacy and compliance exposure.

LocalVault AI is a local-first confidential contract review workspace running on consumer Windows hardware. QVAC provides local inference, the Policy Pack provides deterministic compliance checks, and the Evidence Pack records auditable proof.

## 0:25 - 0:55 Hardware And QVAC Evidence

Show the laptop hardware screenshots:

- Intel Core i5-11400H
- 16 GB RAM
- NVIDIA RTX 3050 Ti Laptop GPU
- Windows

Then show the app evidence panel:

- Provider: `qvac`
- Model: `QWEN3_600M_INST_Q4`
- Remote AI calls: `0`
- Device: `12 threads / 15.71 GB RAM`
- QVAC SDK: `0.10.2`

## 0:55 - 2:00 High-Risk Contract Review

Upload `evidence/sample-documents/vendor-contract-risky.md`.

Run the default review prompt:

```text
Review the uploaded confidential vendor contract. Summarize core obligations, identify legal and security risks, extract missing clauses or missing information, and create an action list.
```

Show:

- Missing clauses: `5`
- Key metrics: `9`
- Policy Matrix rows: `14`
- Incident response SLA P1-P4
- Audit log retention
- Liquidated damages
- Confidentiality survival period
- Local-only data processing

## 2:00 - 2:45 Policy Matrix And Evidence-Bound Findings

Scroll to the Policy Matrix and missing clauses sections.

Show that the Policy Matrix is generated from `policy-packs/vendor-contract.json` and contains requirement, status, evidence, and recommendation columns.

Show the five high-risk missing clauses:

- Missing data breach notification deadline
- Missing Party A audit right
- Missing force majeure liability allocation
- Missing intellectual property ownership
- Missing regular security reporting requirement

For two findings, click the evidence chunk button and show the right-side citation panel. Explain that every conclusion is bound to a local document chunk, not a cloud response.

## 2:45 - 3:20 Amendment Drafts And Report Export

Show the Suggested amendment sections and the export button. Explain that the app does not only flag risk; it drafts concrete replacement clauses and exports a review report that a legal or security reviewer can audit.

Open or mention:

- `evidence/logs/review-report.json`
- `evidence/logs/latest-demo-run.json`

## 3:20 - 4:15 Validation And Robustness

Show the automated validation set:

- `vendor-contract-risky.md`: expected missing clauses `5`
- `vendor-contract-partial.md`: expected missing clauses `3`
- `vendor-contract-complete.md`: expected missing clauses `0`

Run or show:

```powershell
npm run validate:demo
npm run validate:robustness
```

Open:

- `evidence/logs/validation-report.json`
- `evidence/logs/robustness-report.json`

Point out:

- `ok: true`
- `provider: qvac`
- `remote_api_calls: []`
- document SHA-256 hashes
- prompt SHA-256 hashes
- policy pack ID and version
- review matrix row count
- QVAC SDK version
- performance metrics
- prompt injection was not followed
- empty and unrelated files were rejected

## 4:15 - 4:45 PDF And Drag-Drop Boundary

Briefly show that drag-and-drop upload works for Markdown/TXT and parseable text-layer PDFs. Mention the intentional limit: scanned image-only PDFs are rejected with a clear error because OCR is outside this submission scope.

Do not show private user PDF files in the final video.

## 4:45 - 5:00 Zero-Cloud Close

Show:

- `evidence/api-disclosure.json`
- `evidence/offline-proof-checklist.md`

If available, show Windows Resource Monitor or Task Manager network screenshot from the disconnected or zero-cloud run.

Close with:

LocalVault AI demonstrates a production-shaped local-first document intelligence workflow: QVAC local inference, deterministic contract checks, citation-bound evidence, amendment drafts, and reproducible validation on a general purpose consumer device.
