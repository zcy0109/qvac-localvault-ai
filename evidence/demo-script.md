# LocalVault AI Demo Script

Target length: under 5 minutes.

## 0:00 - 0:30 Problem

Sensitive documents such as contracts, research notes, and internal policies should not be uploaded to cloud AI APIs just to get a useful summary or review.

LocalVault AI runs a confidential document intelligence workflow locally on consumer hardware with QVAC SDK.

## 0:30 - 1:00 Hardware And QVAC

Show the laptop hardware:

- Intel Core i5-11400H
- 16 GB RAM
- NVIDIA RTX 3050 Ti Laptop GPU
- Windows

Show the app metric:

- Provider: `qvac`
- Remote AI calls: `0`

## 1:00 - 2:00 Local Document Review

Upload `sample-confidential-review.md`.

Run the default confidential review prompt:

```text
Summarize the files, identify risks, extract missing information, and create an action list.
```

## 2:00 - 3:20 Results

Show:

- Summary
- Answer
- Risks
- Action items
- Source citations

Explain that citations are local chunks selected from uploaded documents.

## 3:20 - 4:20 Evidence

Show the evidence panel:

- TTFT
- TPS
- Total inference time
- Model load time

Open `evidence/logs/latest-demo-run.json` and point out:

- `provider: qvac`
- `model: QWEN3_600M_INST_Q4`
- `remote_api_calls: []`
- hardware metadata

## 4:20 - 5:00 Close

LocalVault AI demonstrates a practical local-first AI workflow for confidential documents on general purpose consumer devices, using QVAC SDK for local inference and auditable evidence.
