# LocalVault AI Evidence Bundle

This directory stores reproducible evidence for the QVAC Hackathon submission. The goal is to prove that LocalVault AI performs confidential contract review locally with QVAC SDK, without remote AI APIs.

## What This Evidence Proves

- Documents are parsed, retrieved, reviewed, and summarized locally.
- AI inference provider is QVAC.
- Remote AI call list is empty.
- Findings are bound to local evidence chunks.
- Policy checks come from `policy-packs/vendor-contract.json`.
- A Policy Matrix is generated for every reviewed contract.
- The same workflow distinguishes risky, partial, and complete contracts.

## Required Files

- `logs/latest-demo-run.json`: latest local inference log from the app.
- `logs/validation-report.json`: automated validation report from `npm run validate:demo`.
- `logs/review-report.json`: exported contract review report with matrix, findings, citations, hashes, and performance.
- `api-disclosure.json`: remote API disclosure file.
- `hardware-screenshots/`: CPU, RAM, GPU, system, and network screenshots.
- `sample-documents/`: local test documents for demo and validation.

## Final Validation Command

```powershell
$env:LOCALVAULT_PROVIDER='qvac'
$env:LOCALVAULT_REQUIRE_QVAC='true'
npm run validate:demo
```

Expected result:

- `ok: true`
- `vendor-contract-risky.md`: missing clauses `5`, key metrics `9`, matrix rows `14`
- `vendor-contract-partial.md`: missing clauses `3`, key metrics `9`, matrix rows `14`
- `vendor-contract-complete.md`: missing clauses `0`, key metrics `9`, matrix rows `14`
- each sample uses `provider: qvac`
- each sample has `remote_api_calls: []`
- each matrix row has an evidence chunk
- logs include QVAC SDK version, policy pack ID, document hash, prompt hash, hardware metadata, and performance metrics

## Zero-Cloud / Offline Proof

Recommended evidence:

1. In-app evidence: `Remote AI calls: 0` and `remote_api_calls: []`.
2. System evidence: Windows Resource Monitor or Task Manager network panel during the review.
3. Optional disconnected run: after the QVAC model is cached, disable Wi-Fi and run `vendor-contract-risky.md`.

Save screenshots to:

```text
evidence/hardware-screenshots/
```

## Recording Checklist

1. Run `npm run lint` and `npm run build`.
2. Start the app in QVAC mode.
3. Upload `vendor-contract-risky.md`.
4. Show missing clauses `5`, key metrics `9`, and Policy Matrix rows `14`.
5. Click evidence chunk buttons.
6. Show amendment drafts.
7. Show Audit Evidence Pack.
8. Export or open `review-report.json`.
9. Run `npm run validate:demo`.

Final DoraHacks evidence must come from the real QVAC provider, not the mock provider.
