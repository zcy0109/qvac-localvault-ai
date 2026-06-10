# DoraHacks Submission Notes

## Project Name

LocalVault AI

## Tagline

Local-first confidential contract intelligence powered by QVAC SDK.

## Track

General Purpose Devices

## Short Description

LocalVault AI is a local-first confidential document intelligence workspace for consumer laptops and desktops. It uses QVAC SDK for local inference and combines it with deterministic contract-review checks to extract key obligations, identify missing clauses, draft amendments, bind findings to local evidence chunks, and export auditable performance logs without cloud AI APIs.

The review rules are packaged as `policy-packs/vendor-contract.json`, producing a Policy Matrix with requirement status, evidence, and recommendations. This makes the demo extensible beyond one hard-coded sample.

Core narrative:

- QVAC performs local AI inference on a consumer Windows device.
- Policy Pack performs deterministic compliance checks.
- Evidence Pack records citations, hashes, performance, hardware metadata, and zero-remote-AI disclosure.

## Key QVAC Evidence

- Provider: `qvac`
- Model: `QWEN3_600M_INST_Q4`
- QVAC SDK: `0.10.2`
- Remote AI calls: `[]`
- Evidence log: `evidence/logs/latest-demo-run.json`
- Validation report: `evidence/logs/validation-report.json`
- Robustness report: `evidence/logs/robustness-report.json`
- Review report: `evidence/logs/review-report.json`
- API disclosure: `evidence/api-disclosure.json`
- Reproduce demo validation: `npm run validate:demo`
- Reproduce robustness validation: `npm run validate:robustness`

## Validation Set

| Document | Expected Missing Clauses | Expected Key Metrics | Expected Matrix Rows |
| --- | ---: | ---: | ---: |
| `vendor-contract-risky.md` | 5 | 9 | 14 |
| `vendor-contract-partial.md` | 3 | 9 | 14 |
| `vendor-contract-complete.md` | 0 | 9 | 14 |

The final validation report should show `ok: true` across all three samples.

## Robustness Set

| Document | Expected Behavior |
| --- | --- |
| `vendor-contract-prompt-injection.md` | Ignore embedded instructions and continue contract review. |
| `unrelated-meeting-notes.md` | Reject as out of scope. |
| `empty-contract.md` | Reject as empty or insufficient content. |

The final robustness report should show `ok: true`. This evidence is important because it demonstrates that the system is not only a happy-path demo.

## File Handling

- Drag-and-drop upload is supported for Markdown, TXT, and parseable text-layer PDFs.
- Button-based upload is also supported.
- Text-layer PDFs can be extracted locally in the browser.
- Scanned image-only PDFs are rejected with a clear error because OCR is intentionally not included in this submission.
- Private user PDFs and real contracts must not be committed or uploaded as sample evidence.

## Hardware

- CPU: Intel Core i5-11400H
- RAM: 16 GB
- GPU: NVIDIA RTX 3050 Ti Laptop GPU, 4 GB VRAM
- OS: Windows

## What To Upload

- GitHub repository link
- YouTube unlisted demo video
- Hardware screenshots
- Zero-cloud or disconnected-run screenshot
- Evidence log
- Validation report
- Robustness report
- Review report
- API disclosure
- Offline proof checklist
- Final submission checklist

## Final Pre-Recording Commands

Run these before recording the final video:

```powershell
npm run lint
npm run build
npm run validate:demo
npm run validate:robustness
```

## Video Checklist

- Show the GitHub repository and Apache-2.0 license.
- Show hardware evidence: CPU, RAM, GPU, and OS.
- Show LocalVault AI running with `provider=qvac`.
- Show `Remote AI calls: 0`.
- Upload `vendor-contract-risky.md`.
- Show missing clauses `5`, key metrics `9`, and the Policy Matrix.
- Click at least two evidence chunk links.
- Show suggested amendments.
- Show `validation-report.json` and `robustness-report.json`.
- Show `api-disclosure.json`.
- Show Resource Monitor or another zero-cloud proof screenshot.

Do not show or upload private personal PDF files in the final DoraHacks submission.
