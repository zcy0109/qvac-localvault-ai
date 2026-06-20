# LocalVault AI Final Video Recording Guide

Target length: 4:30 to 5:00 minutes.

Use English narration in the final video. The Chinese notes below are only for you to understand what to show and why it matters.

## Before Recording

Open PowerShell and run:

```powershell
cd "C:\Users\张晨宇\Documents\Codex\2026-06-02\new-chat\qvac-localvault-ai"
$env:LOCALVAULT_PROVIDER="qvac"
$env:LOCALVAULT_REQUIRE_QVAC="true"
npm run dev
```

Open this URL:

```text
http://127.0.0.1:5173
```

Use this demo document:

```text
C:\Users\张晨宇\Documents\Codex\2026-06-02\new-chat\qvac-localvault-ai\evidence\sample-documents\vendor-contract-risky.md
```

Do not show private PDFs, personal contracts, tokens, or private browser pages.

## Recording Structure

### 0:00 - 0:25 Opening: Problem And Product

Chinese note:

这一段只需要打开 LocalVault AI 首页。目的不是演示功能，而是先告诉评委：这个项目解决的是“机密合同不能随便上传云端 AI”的真实问题。

Screen to show:

- LocalVault AI title.
- The main upload/review interface.

English narration:

```text
This is LocalVault AI, a local-first confidential contract review workspace built for the QVAC general-purpose device track.

The problem is simple: vendor contracts can contain customer PII, security obligations, incident response terms, pricing terms, and internal business risk. These documents should not be uploaded to a cloud AI API just to get a review.
```

Meaning:

你在说：这是一个本地优先的机密合同审查工具，核心价值是隐私和合规。

### 0:25 - 0:55 Architecture: QVAC, Policy Pack, Evidence Pack

Chinese note:

这一段解释项目不是单纯“调用模型总结文档”。它有三层：QVAC 负责本地推理，Policy Pack 负责确定性检查，Evidence Pack 负责给评委验证。

Screen to show:

- 先停留在首页或成功运行后的右侧证据栏。
- 如果已经运行过结果，可以露出 `provider=qvac` 和 `remote AI calls=0`。

English narration:

```text
LocalVault AI combines three layers. QVAC performs local inference. A deterministic Policy Pack checks contract requirements. An Evidence Pack records citations, document hashes, prompt hashes, performance metrics, device metadata, and zero remote AI calls.

The goal is not only to summarize a document. The goal is to produce a review that a security, legal, or compliance reviewer can actually audit.
```

Meaning:

你在说：项目比普通 RAG 多了“确定性规则”和“证据链”，这是评委最容易理解的亮点。

### 0:55 - 1:45 Run A High-Risk Contract Review

Chinese note:

这一段是主要演示。你要上传官方样本文档 `vendor-contract-risky.md`，不要上传私人 PDF。运行后让评委看到 5 个缺失条款和 QVAC 本地推理。

Screen actions:

1. Click `清空工作区`.
2. Drag or upload `vendor-contract-risky.md`.
3. Click `运行本地审查`.
4. Wait until the result appears.

Screen to show after run:

- `推理提供方`: `qvac`
- `远程 AI 调用`: `0`
- Missing clauses: `5`
- Key metrics in the summary.

English narration:

```text
Now I will upload a synthetic high-risk vendor contract. This is a public demo document included in the repository, not a private real contract.

The review prompt asks the app to summarize core obligations, identify legal and security risks, extract missing clauses or missing information, and create an action list.

The review is running locally through QVAC. No remote AI API is used.
```

After the result appears:

```text
The app detects five missing clauses and extracts the important operational metrics from the contract, including incident response SLAs, audit log retention, liquidated damages, confidentiality survival period, data retention, and local-only data processing.
```

Meaning:

你在说：这个演示文档故意设计了风险，系统能稳定抓出来，而且不是云端 AI。

### 1:45 - 2:45 Policy Matrix

Chinese note:

这一段是核心竞争力之一。评委会担心小模型不稳定，所以你要强调 Policy Matrix 不是纯靠模型猜，而是用结构化 Policy Pack 检查。这里显示“通过/缺失/证据/建议”。

Screen actions:

1. Scroll to `政策矩阵`.
2. Slowly show several rows.
3. Show both red missing rows and green passed rows.

Screen to show:

- Missing data breach notification deadline.
- Missing Party A audit right.
- Missing force majeure liability allocation.
- Missing intellectual property ownership.
- Missing regular security reporting requirement.
- Passed rows: incident response SLA, audit log retention, local-only data processing.

English narration:

```text
This is the Policy Matrix. It is the core review workflow.

Instead of relying only on a small local model to guess the answer, LocalVault AI checks the contract against a structured vendor-contract policy pack.

Each row has a requirement, a status, cited evidence, and a recommendation. Green rows are satisfied. Red rows are missing or incomplete.
```

Meaning:

你在说：这个系统不是简单聊天机器人，而是一个可审计的合同检查工作台。

### 2:45 - 3:30 Evidence-Bound Findings And Amendment Drafts

Chinese note:

这一段要展示“不是只报错，还给修改建议”。你可以滚到缺失条款区域，展示 2-3 个风险卡片，比如数据泄露通知、甲方审计权、知识产权。点一下 `证据分片` 如果右边会高亮引用。

Screen actions:

1. Scroll to `缺失条款`.
2. Show two or three high-risk cards.
3. Show `Suggested amendment` / `建议的修改`.
4. Click one `证据分片` button if convenient.

English narration:

```text
For each missing clause, the app explains the risk and provides a suggested amendment.

For example, this contract is missing a concrete data breach notification deadline, a Party A audit right, and clear intellectual property ownership.

Each finding is tied back to local document chunks. The reviewer can inspect where the conclusion came from instead of trusting an opaque AI response.
```

Meaning:

你在说：输出有业务价值，能直接帮助合同修改，而且有引用来源。

### 3:30 - 4:05 Audit Evidence Pack

Chinese note:

这一段要给评委“验收材料”。重点看右侧证据包：provider、remote calls、model、device、hash、日志路径。不要讲太久，但一定要让画面停一下。

Screen actions:

1. Scroll or look at the right evidence panel.
2. Show `Audit Evidence Pack`.
3. Show log/report paths.

Screen to show:

- `provider=qvac`
- `remote AI calls=0`
- `QWEN3_600M_INST_Q4`
- device metadata
- document SHA-256
- prompt SHA-256
- `latest-demo-run.json`
- `validation-report.json`
- `robustness-report.json`
- `review-report.json`

English narration:

```text
The Evidence Pack is designed for hackathon verification.

It records the QVAC provider, zero remote AI calls, the model name, device metadata, document hash, prompt hash, retrieved chunks, runtime metrics, and exported report paths.

This makes the demo reproducible and easier for judges to verify.
```

Meaning:

你在说：评委不需要只听你说，本地推理和证据链都有文件可查。

### 4:05 - 4:35 Validation And Robustness

Chinese note:

这一段不用现场跑命令，除非很顺。你可以口头说明仓库里有验证脚本。如果要展示，可以打开右侧证据包里的路径或 PowerShell 命令。核心是告诉评委：risky/partial/complete 三种合同都测了，prompt injection、空文档、无关文档、坏 PDF 都测了。

Screen to show:

- Right evidence panel with validation paths.
- Or File Explorer showing `evidence/logs`.

English narration:

```text
The repository includes automated validation.

The risky, partial, and complete contracts are expected to produce five, three, and zero missing clauses. The robustness test checks prompt injection, empty documents, unrelated documents, and unsupported PDFs.

Text-layer PDFs, TXT, and Markdown are supported. Scanned or garbled PDFs are rejected with a clear error instead of being silently misread.
```

Meaning:

你在说：这个产品知道自己的边界，失败时不会装作成功，这比错误解析 PDF 更可靠。

### 4:35 - 5:00 Closing

Chinese note:

最后总结一句，不要夸张说“全球前三”或“保证获奖”。重点重复三个词：QVAC local inference、Policy Pack、Evidence Pack。

Screen to show:

- Return to top summary or evidence panel.

English narration:

```text
LocalVault AI demonstrates a production-shaped local AI workflow on a general-purpose consumer device.

It combines QVAC local inference, deterministic contract checks, citation-bound evidence, amendment drafts, reproducible validation, and zero remote AI calls.

Thank you.
```

Meaning:

你在说：这是一个完整、可验证、适合 QVAC 赛道的本地 AI 应用。

## If Your English Gets Stuck

Use these shorter backup lines.

```text
This app reviews confidential vendor contracts locally.
```

```text
QVAC is used for local inference, and remote AI calls are zero.
```

```text
The Policy Matrix checks contract requirements in a deterministic way.
```

```text
Each finding has evidence from local document chunks.
```

```text
The Evidence Pack records hashes, performance metrics, and validation reports.
```

```text
Scanned PDFs are rejected clearly, instead of being silently misread.
```

## Final Checks Before Uploading

- Video length is under 5 minutes.
- The video shows `qvac`, not `mock`.
- The video shows `remote AI calls = 0`.
- The demo uses only `vendor-contract-risky.md`.
- No private PDFs or personal information are visible.
- The UI does not show broken PDF text or garbled filenames.
- The YouTube video is uploaded as unlisted.
