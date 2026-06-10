# LocalVault AI Final Submission Checklist

Use this checklist when filling the DoraHacks submission form and recording the final video.

## DoraHacks Fields

- Project name: `LocalVault AI`
- Tagline: `Local-first confidential contract intelligence powered by QVAC SDK.`
- Track: `General Purpose Devices`
- Category tags: `AI`, `Edge AI`, `Privacy`, `Developer Tools`, `Document Intelligence`
- GitHub repository: `https://github.com/zcy0109/qvac-localvault-ai`
- License: `Apache-2.0`
- Demo video: upload an unlisted YouTube video and paste the URL into DoraHacks.

## Short Description

LocalVault AI is a local-first confidential contract review workspace for consumer Windows laptops and desktops. It uses QVAC SDK for local inference, a deterministic Policy Pack for contract compliance checks, and an Evidence Pack for auditable citations, hashes, performance metrics, hardware metadata, and zero-remote-AI disclosure.

## Hardware Declaration

- CPU: Intel Core i5-11400H
- RAM: 16 GB
- GPU: NVIDIA RTX 3050 Ti Laptop GPU, 4 GB VRAM
- OS: Windows
- Track fit: General Purpose Devices, consumer hardware within the 32 GB RAM limit

## Reproducibility Commands

Run these from the repository root before final recording:

```powershell
npm install
$env:LOCALVAULT_PROVIDER='qvac'
$env:LOCALVAULT_REQUIRE_QVAC='true'
npm run lint
npm run build
npm run validate:demo
npm run validate:robustness
```

Expected validation:

- `vendor-contract-risky.md`: missing clauses `5`, key metrics `9`, matrix rows `14`
- `vendor-contract-partial.md`: missing clauses `3`, key metrics `9`, matrix rows `14`
- `vendor-contract-complete.md`: missing clauses `0`, key metrics `9`, matrix rows `14`
- prompt injection is ignored
- unrelated and empty files are rejected

## Evidence Files To Reference

- `evidence/logs/latest-demo-run.json`
- `evidence/logs/validation-report.json`
- `evidence/logs/robustness-report.json`
- `evidence/logs/review-report.json`
- `evidence/api-disclosure.json`
- `evidence/offline-proof-checklist.md`
- `evidence/demo-script.md`

## Screenshots And Video Evidence

Capture these manually before submission:

- Windows Task Manager CPU view
- Windows Task Manager RAM view
- Windows Task Manager GPU view
- Windows Resource Monitor network view during a review
- LocalVault AI app showing `provider=qvac`
- LocalVault AI app showing `Remote AI calls: 0`
- Missing-clause count and Policy Matrix
- Audit Evidence Pack
- Optional disconnected run after the QVAC model is cached

Save public screenshots under `evidence/hardware-screenshots/`.

## Do Not Submit

- Do not commit or upload private PDFs.
- Do not include real personal contracts.
- Do not use the mock provider as final evidence.
- Do not claim guaranteed prizes or unsupported benchmark comparisons.

## Five-Minute Video Structure

Follow `evidence/demo-script.md`:

1. Problem and local-first product framing.
2. Hardware and QVAC evidence.
3. High-risk contract review.
4. Policy Matrix and citation-bound findings.
5. Amendment drafts and report export.
6. Validation and robustness reports.
7. PDF/drag-drop boundary.
8. Zero-cloud close.
