# LocalVault AI Demo Script

Target length: under 5 minutes.

## 0:00 - 0:25 Problem

Confidential vendor contracts often contain customer PII, internal security requirements, pricing terms, and operational risk. Uploading them to a cloud AI API can create privacy and compliance exposure.

LocalVault AI reviews these documents locally on consumer hardware with QVAC SDK.

## 0:25 - 0:55 Hardware And QVAC

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

## 2:00 - 2:50 Evidence-Bound Findings

Scroll to the Policy Matrix and missing clauses sections.

Show that the Policy Matrix is generated from `policy-packs/vendor-contract.json` and contains requirement, status, evidence, and recommendation columns.

Show the five high-risk missing clauses:

- Missing data breach notification deadline
- Missing Party A audit right
- Missing force majeure liability allocation
- Missing intellectual property ownership
- Missing regular security reporting requirement

For two findings, click the evidence chunk button and show the right-side citation panel. Explain that every conclusion is bound to a local document chunk, not a cloud response.

## 2:50 - 3:35 Amendment Drafts

Show the Suggested amendment sections and the export button. Explain that the app does not only flag risk; it drafts concrete replacement clauses and exports a review report that a legal or security reviewer can audit.

## 3:35 - 4:20 Robustness Check

Briefly mention the automated validation set:

- `vendor-contract-risky.md`: expected missing clauses `5`
- `vendor-contract-partial.md`: expected missing clauses `3`
- `vendor-contract-complete.md`: expected missing clauses `0`

Run or show `npm run validate:demo` and open `evidence/logs/validation-report.json`.

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

## 4:20 - 5:00 Zero-Cloud Close

Show `evidence/api-disclosure.json`.

If available, show Windows Resource Monitor or Task Manager network screenshot from the disconnected or zero-cloud run.

Close with:

LocalVault AI demonstrates a production-shaped local-first document intelligence workflow: QVAC local inference, deterministic contract checks, citation-bound evidence, amendment drafts, and reproducible validation on a general purpose consumer device.
