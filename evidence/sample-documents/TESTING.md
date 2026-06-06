# LocalVault AI Test Documents

Use these documents to test whether the review workflow is stable, not overfitted to one sample.

## Expected Results

| Document | Expected missing clauses | Purpose |
| --- | ---: | --- |
| `confidential-vendor-contract.md` | 5 | Main demo sample without explicit answer hints |
| `vendor-contract-risky.md` | 5 | Alternate risky vendor contract |
| `vendor-contract-partial.md` | 3 | Contract with breach notification and audit rights already present |
| `vendor-contract-complete.md` | 0 | Complete contract, used to check false positives |

## Manual Test Flow

1. Open `http://127.0.0.1:5173`.
2. Click `Clear workspace`.
3. Upload one document at a time.
4. Run local review.
5. Check provider is `qvac` and remote AI calls is `0`.
6. Compare the missing-clause count with the expected result above.
7. For risky and partial contracts, verify each missing clause has a suggested amendment and evidence chunk.
8. For the complete contract, verify the result does not report the five demo missing clauses.
