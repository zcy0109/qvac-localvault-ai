# DoraHacks Submission Notes

## Project Name

LocalVault AI

## Tagline

Local-first confidential contract intelligence powered by QVAC SDK.

## Track

General Purpose Devices

## Short Description

LocalVault AI is a local-first confidential document intelligence workspace for consumer laptops and desktops. It uses QVAC SDK for local inference and combines it with deterministic contract-review checks to extract key obligations, identify missing clauses, draft amendments, bind findings to local evidence chunks, and export auditable performance logs without cloud AI APIs.

## Key QVAC Evidence

- Provider: `qvac`
- Model: `QWEN3_600M_INST_Q4`
- QVAC SDK: `0.10.2`
- Remote AI calls: `[]`
- Evidence log: `evidence/logs/latest-demo-run.json`
- Validation report: `evidence/logs/validation-report.json`
- API disclosure: `evidence/api-disclosure.json`
- Reproduce: `npm run validate:demo`

## Validation Set

| Document | Expected Missing Clauses | Expected Key Metrics |
| --- | ---: | ---: |
| `vendor-contract-risky.md` | 5 | 9 |
| `vendor-contract-partial.md` | 3 | 9 |
| `vendor-contract-complete.md` | 0 | 9 |

The final validation report should show `ok: true` across all three samples.

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
- API disclosure
