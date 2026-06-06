# Zero-Cloud / Offline Proof Checklist

Use this checklist before recording the final DoraHacks demo.

## Required In-App Evidence

- The app shows `Provider: qvac`.
- The app shows `Remote AI calls: 0`.
- Audit Evidence Pack shows `Validation ready`.
- `evidence/logs/latest-demo-run.json` contains `"remote_api_calls": []`.
- `evidence/api-disclosure.json` contains an empty remote AI call list.

## Recommended System Evidence

Capture screenshots into `evidence/hardware-screenshots/`:

- Windows Task Manager CPU tab.
- Windows Task Manager Memory tab.
- Windows Task Manager GPU tab.
- Windows Resource Monitor Network tab during review.
- Optional: Wi-Fi disabled or disconnected network icon during review.

## Offline Demo Flow

1. Start the app while the QVAC model is already cached.
2. Open `http://127.0.0.1:5173`.
3. Disconnect Wi-Fi or disable the active network adapter.
4. Upload `vendor-contract-risky.md`.
5. Run local review.
6. Verify the result still shows:
   - Missing clauses: `5`
   - Key metrics: `9`
   - Provider: `qvac`
   - Remote AI calls: `0`
7. Save screenshots of the result and network state.

## Important Note

The first-ever QVAC model download may need network access. The offline proof should be recorded after the model is cached locally. The demo claim should be: document review and AI inference run locally without remote AI API calls.
