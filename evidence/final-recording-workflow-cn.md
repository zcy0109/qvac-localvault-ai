# LocalVault AI Final Recording Workflow

用途：这个文档用于最终录制 DoraHacks 提交视频。你可以在另一台电脑或手机上打开本文件，一边看步骤，一边在当前电脑上录制。

目标视频长度：4 分 30 秒到 5 分钟以内。

推荐方式：先录屏，不现场口播；录完后用 CapCut/剪映添加英文旁白和英文字幕。这样最稳，不会因为英文或操作紧张导致重录。

## 0. 最终视频目标

评委看完视频后应该立刻明白：

1. LocalVault AI 是什么：一个本地优先的机密合同审查工作台。
2. 为什么适合 QVAC：所有 AI 推理使用 QVAC 在本机运行。
3. 为什么不是普通 RAG：有 Policy Pack 做确定性合同检查。
4. 为什么可信：Evidence Pack 记录引用、哈希、设备信息、性能和零远程 AI 调用。
5. 为什么有产品价值：能找出缺失条款、风险、行动计划和建议修改。

不要在视频中承诺“全球前三”或“稳拿奖金”。视频里只展示项目能力和证据。

## 1. 录制前准备

### 1.1 启动项目

在 PowerShell 中运行：

```powershell
cd "C:\Users\张晨宇\Documents\Codex\2026-06-02\new-chat\qvac-localvault-ai"
$env:LOCALVAULT_PROVIDER="qvac"
$env:LOCALVAULT_REQUIRE_QVAC="true"
npm run dev
```

浏览器打开：

```text
http://127.0.0.1:5173
```

### 1.2 准备演示文件

最终主视频只用这个文件：

```text
C:\Users\张晨宇\Documents\Codex\2026-06-02\new-chat\qvac-localvault-ai\evidence\sample-documents\vendor-contract-risky.md
```

不要使用私人 PDF、真实合同、个人信息文件。

### 1.3 OBS 设置

OBS 中推荐：

- 来源：显示器采集。
- 麦克风：如果后期配音，可以静音。
- 桌面音频：建议静音，避免消息提示音。
- 录制格式：MP4 或 MKV。
- 分辨率：1920x1080。
- 帧率：30 fps。

录制前隐藏 Windows 任务栏，避免杂乱图标影响观感。

### 1.4 浏览器准备

录制前确认：

- 页面 UI 是英文。
- 不开启 Chrome 自动翻译。
- 页面顶部能看到 `LocalVault AI`。
- 没有私人标签页、账号页面、聊天窗口、微信通知。
- 浏览器缩放建议 100% 或 90%，以便右侧 Evidence Panel 显示完整。

## 2. 视频总时间安排

建议总时长：约 4 分 40 秒。

| 时间 | 内容 | 目标 |
|---|---|---|
| 0:00-0:25 | 开场问题和产品定位 | 让评委知道为什么需要这个项目 |
| 0:25-0:55 | 架构说明 | 讲清 QVAC + Policy Pack + Evidence Pack |
| 0:55-1:45 | 上传并运行 risky contract | 展示真实工作流 |
| 1:45-2:35 | Policy Matrix | 展示确定性检查能力 |
| 2:35-2:55 | Key Metrics | 展示量化条款抽取 |
| 2:55-3:35 | Missing Clauses 和 Amendment Drafts | 展示业务价值 |
| 3:35-4:10 | Audit Evidence Pack | 展示本地、零云、可审计 |
| 4:10-4:40 | Validation 和 robustness | 展示鲁棒性和边界 |
| 4:35-5:00 | 结尾总结 | 强化项目卖点 |

## 3. 录屏操作全流程

### Step 1：开场首页

操作：

1. 打开 `http://127.0.0.1:5173`。
2. 停留在首页 3-5 秒。
3. 画面显示 `LocalVault AI`、上传区、Evidence 面板。

这一段要证明：

- 项目是一个完整应用，不是命令行脚本。
- 界面第一眼能看懂用途。

英文字幕/旁白：

```text
This is LocalVault AI, a local-first confidential contract review workspace built for the QVAC general-purpose device track.
```

```text
Vendor contracts can contain customer PII, security obligations, incident response terms, pricing terms, and internal business risk.
```

```text
These documents should not be uploaded to a cloud AI API just to get a review.
```

### Step 2：说明三层架构

操作：

1. 仍停留在首页，或稍微指向右侧 Evidence 区。
2. 不需要打开代码。

这一段要证明：

- QVAC 负责本地推理。
- Policy Pack 负责确定性规则检查。
- Evidence Pack 负责可审计证明。

英文字幕/旁白：

```text
LocalVault AI combines three layers.
```

```text
QVAC performs local inference.
```

```text
A deterministic Policy Pack checks contract requirements.
```

```text
An Evidence Pack records citations, hashes, performance metrics, device metadata, and zero remote AI calls.
```

```text
The goal is not only to summarize a document, but to produce a review that a legal, security, or compliance reviewer can audit.
```

### Step 3：清空工作区并上传演示文件

操作：

1. 点击 `Clear workspace`。
2. 点击上传区域，选择：

```text
vendor-contract-risky.md
```

3. 文件出现后停 1 秒。

这一段要证明：

- 项目支持普通文件上传。
- 用的是仓库里的公开 demo 文档，不是私人文档。

英文字幕/旁白：

```text
I will upload a synthetic high-risk vendor contract included in the repository.
```

```text
This is not a private real contract.
```

```text
The file is staged locally for confidential review.
```

### Step 4：运行本地审查

操作：

1. 点击 `Run local review`。
2. 等结果出来，不要乱点。
3. 如果 QVAC 加载稍慢，等待即可。

这一段要证明：

- 项目真实运行。
- 不是静态截图。
- QVAC 在本地生成结果。

英文字幕/旁白：

```text
Now I run the local review.
```

```text
The prompt asks the app to summarize core obligations, identify legal and security risks, extract missing clauses, and create an action list.
```

```text
The review is generated locally through QVAC. No remote AI API is used.
```

### Step 5：展示顶部结果

操作：

结果出来后，停留 5-8 秒，确保画面显示：

- `Inference provider: qvac`
- `Remote AI calls: 0`
- `Files: 1`
- `Local text`
- 缺失条款数量 `5`

这一段要证明：

- 使用 QVAC。
- 没有远程 AI 调用。
- 检测出了 5 个缺失条款。

英文字幕/旁白：

```text
The result shows the inference provider is QVAC.
```

```text
Remote AI calls are zero.
```

```text
The app detects five missing clauses and extracts the important operational metrics from the contract.
```

### Step 6：展示 Contract Overview

操作：

1. 停在 `Contract Overview` 区域。
2. 让评委看到关键指标文本。
3. 不要滚太快。

这一段要证明：

- 系统能提取合同核心义务。
- 不只是输出一段空泛摘要。

英文字幕/旁白：

```text
The overview extracts concrete contract metrics, including incident response SLAs, audit log retention, liquidated damages, confidentiality survival period, data retention, and local-only data processing.
```

### Step 7：展示 Policy Matrix

操作：

1. 慢慢滚动到 `Policy Matrix`。
2. 停留 45-60 秒。
3. 展示红色 Missing 和绿色 Pass。
4. 如果有水平滚动条，确保 Requirement、Status、Evidence、Recommendation 都能看到。

重点展示：

- Missing data breach notification deadline.
- Missing Party A audit right.
- Missing force majeure liability allocation.
- Missing intellectual property ownership.
- Missing regular security reporting requirement.
- Incident response SLA rows are passed.
- Audit log retention is passed.

这一段要证明：

- 核心不是小模型随便总结，而是结构化 policy 检查。
- 系统有可解释的检查矩阵。

英文字幕/旁白：

```text
This is the Policy Matrix, the core review workflow.
```

```text
Instead of relying only on a small local model to guess the answer, LocalVault AI checks the contract against a structured vendor-contract policy pack.
```

```text
Each row has a requirement, a status, cited evidence, and a recommendation.
```

```text
Green rows are satisfied. Red rows are missing or incomplete.
```

### Step 8：展示 Key Metrics

操作：

1. 从 `Policy Matrix` 继续往下滚到 `Key Metrics`。
2. 停留 10-15 秒。
3. 让画面看到几个指标卡片，例如：
   - Incident response SLA P1-P4
   - Audit log retention
   - Liquidated damages
   - Confidentiality survival period
   - Data retention limit
   - Local-only data processing
4. 如果操作顺，可以点击一个 `Evidence chunk`。点击后右侧 `Citation Evidence` 会高亮对应的本地分片。

这一段要证明：

- 系统能提取合同里的关键量化条款，不只是总结。
- `Evidence chunk` 是溯源按钮，用来证明某个指标或结论来自哪个本地文档片段。

英文字幕/旁白：

```text
The Key Metrics section extracts concrete operational terms from the contract.
```

```text
These include incident response SLAs, audit log retention, liquidated damages, confidentiality survival period, data retention, and local-only data processing.
```

```text
The Evidence chunk button links each metric back to the local source chunk, so the reviewer can verify the origin of the finding.
```

### Step 9：展示 Missing Clauses

操作：

1. 滚动到 `Missing Clauses`。
2. 展示 2-3 个高风险卡片。
3. 展示风险说明、引用、建议修改。
4. 可以点击一次 `Evidence chunk`，如果不熟练就不要点，避免录制卡顿。

重点展示：

- Missing data breach notification deadline.
- Missing Party A audit right.
- Missing intellectual property ownership.
- Suggested amendment.

这一段要证明：

- 系统不只是指出风险，还能给合同修订建议。
- 每个发现都有 `Evidence chunk`，它的作用是点击后在右侧引用栏高亮对应片段，证明结论不是凭空生成。

英文字幕/旁白：

```text
For each missing clause, the app explains the risk and provides a suggested amendment.
```

```text
For example, this contract is missing a concrete data breach notification deadline, a Party A audit right, and clear intellectual property ownership.
```

```text
Each finding is tied back to local document chunks, so the reviewer can inspect where the conclusion came from.
```

### Step 10：展示 Risk Register 和 Action Plan

操作：

1. 滚动到 `Risk Register` 和 `Action Plan`。
2. 停 8-10 秒。

这一段要证明：

- 输出可以变成实际审查工作流。
- 不只是“问答”，而是风险登记和行动计划。

英文字幕/旁白：

```text
The output is organized as a practical review workflow.
```

```text
It creates a risk register and an action plan that a reviewer can use for contract negotiation or internal compliance review.
```

### Step 11：展示 Local Analysis Note

操作：

1. 滚到底部 `Local Analysis Note`。
2. 停 5 秒。

这一段要证明：

- 本地分析说明总结了 QVAC、本地片段、缺失条款和零远程 AI。现在这里应该是英文。如果出现中文，说明页面还没刷新或服务端没有重启。

英文字幕/旁白：

```text
The local analysis note summarizes how the review was produced from local document chunks, deterministic rules, and QVAC inference.
```

### Step 12：展示 Audit Evidence Pack

操作：

1. 看右侧 Evidence 面板。
2. 如果需要，滚到右侧 `Audit Evidence Pack`。
3. 停 8-12 秒。

必须展示：

- `Provider: qvac`
- `Remote AI calls: 0`
- `Model: QWEN3_600M_INST_Q4`
- `Device: 12 threads / 15.71 GB RAM`
- `latest-demo-run.json`
- `validation-report.json`
- `robustness-report.json`
- `review-report.json`

这一段要证明：

- 有可审计证据。
- 评委可以检查日志和报告。

英文字幕/旁白：

```text
The Evidence Pack is designed for hackathon verification.
```

```text
It records the QVAC provider, zero remote AI calls, the model name, device metadata, document hash, prompt hash, retrieved chunks, runtime metrics, and exported report paths.
```

```text
This makes the demo reproducible and easier for judges to verify.
```

### Step 13：说明 Validation 和 Robustness

操作：

1. 不一定要现场跑命令。
2. 可以只展示 Evidence Pack 中的报告路径。
3. 如果打开文件资源管理器，路径是：

```text
C:\Users\张晨宇\Documents\Codex\2026-06-02\new-chat\qvac-localvault-ai\evidence\logs
```

展示文件：

- `latest-demo-run.json`
- `validation-report.json`
- `robustness-report.json`
- `review-report.json`

这一段要证明：

- 不只测了一个样本。
- 还测了 prompt injection、空文档、无关文档和坏 PDF。

Validation 的意思：

- 验证系统在三类合同样本上的结果是否符合预期。
- `vendor-contract-risky.md` 应该检测到 5 个缺失条款。
- `vendor-contract-partial.md` 应该检测到 3 个缺失条款。
- `vendor-contract-complete.md` 应该检测到 0 个缺失条款。

Robustness 的意思：

- 鲁棒性测试，检查系统面对异常输入是否稳定。
- 包括 prompt injection、空文档、无关会议笔记、不支持或乱码 PDF。
- 目的不是展示更多功能，而是证明系统不会被无关内容、恶意指令或坏文件轻易带偏。

这些报告在哪里：

```text
C:\Users\张晨宇\Documents\Codex\2026-06-02\new-chat\qvac-localvault-ai\evidence\logs\validation-report.json
C:\Users\张晨宇\Documents\Codex\2026-06-02\new-chat\qvac-localvault-ai\evidence\logs\robustness-report.json
```

录制时不一定打开 JSON 文件，只要在 Evidence Pack 里展示报告路径，并用旁白解释即可。

英文字幕/旁白：

```text
The repository includes automated validation.
```

```text
The risky, partial, and complete contracts are expected to produce five, three, and zero missing clauses.
```

```text
The robustness test checks prompt injection, empty documents, unrelated documents, and unsupported PDFs.
```

```text
Text-layer PDFs, TXT, and Markdown are supported. Scanned or garbled PDFs are rejected with a clear error instead of being silently misread.
```

### Step 14：结尾

操作：

1. 回到顶部概览或停在 Evidence Pack。
2. 停 2 秒。
3. 结束录制。

英文字幕/旁白：

```text
LocalVault AI demonstrates a production-shaped local AI workflow on a general-purpose consumer device.
```

```text
It combines QVAC local inference, deterministic contract checks, citation-bound evidence, amendment drafts, reproducible validation, and zero remote AI calls.
```

```text
Thank you.
```

## 4. 英文字幕整合版

如果你后期加字幕，可以按下面整合版放，不必逐字完全一致，但核心信息要保留。

```text
This is LocalVault AI, a local-first confidential contract review workspace built for the QVAC general-purpose device track.

Vendor contracts can contain customer PII, security obligations, incident response terms, pricing terms, and internal business risk. These documents should not be uploaded to a cloud AI API just to get a review.

LocalVault AI combines three layers. QVAC performs local inference. A deterministic Policy Pack checks contract requirements. An Evidence Pack records citations, document hashes, prompt hashes, performance metrics, device metadata, and zero remote AI calls.

I will upload a synthetic high-risk vendor contract included in the repository. This is not a private real contract.

The review prompt asks the app to summarize core obligations, identify legal and security risks, extract missing clauses or missing information, and create an action list.

The review is generated locally through QVAC. No remote AI API is used.

The result shows the inference provider is QVAC. Remote AI calls are zero. The app detects five missing clauses and extracts the important operational metrics from the contract.

The overview extracts concrete contract metrics, including incident response SLAs, audit log retention, liquidated damages, confidentiality survival period, data retention, and local-only data processing.

The Key Metrics section extracts concrete operational terms from the contract. The Evidence chunk button links each metric back to the local source chunk, so the reviewer can verify the origin of the finding.

This is the Policy Matrix, the core review workflow. Instead of relying only on a small local model to guess the answer, LocalVault AI checks the contract against a structured vendor-contract policy pack.

Each row has a requirement, a status, cited evidence, and a recommendation. Green rows are satisfied. Red rows are missing or incomplete.

For each missing clause, the app explains the risk and provides a suggested amendment. For example, this contract is missing a concrete data breach notification deadline, a Party A audit right, and clear intellectual property ownership.

Each finding is tied back to local document chunks, so the reviewer can inspect where the conclusion came from.

The output is organized as a practical review workflow. It creates a risk register and an action plan that a reviewer can use for contract negotiation or internal compliance review.

The Evidence Pack is designed for hackathon verification. It records the QVAC provider, zero remote AI calls, the model name, device metadata, document hash, prompt hash, retrieved chunks, runtime metrics, and exported report paths.

The repository includes automated validation. The risky, partial, and complete contracts are expected to produce five, three, and zero missing clauses.

The robustness test checks prompt injection, empty documents, unrelated documents, and unsupported PDFs. Text-layer PDFs, TXT, and Markdown are supported. Scanned or garbled PDFs are rejected with a clear error instead of being silently misread.

LocalVault AI demonstrates a production-shaped local AI workflow on a general-purpose consumer device. It combines QVAC local inference, deterministic contract checks, citation-bound evidence, amendment drafts, reproducible validation, and zero remote AI calls.

Thank you.
```

## 5. 中文理解版

这段不是字幕，只是帮助你理解英文在讲什么。

```text
这是 LocalVault AI，一个为 QVAC 通用设备赛道构建的本地优先机密合同审查工作台。

供应商合同可能包含客户个人信息、安全义务、事件响应条款、价格条款和内部业务风险。这些文件不应该为了 AI 审查而上传到云端 API。

LocalVault AI 有三层：QVAC 做本地推理，确定性的 Policy Pack 做合同要求检查，Evidence Pack 记录引用、文档哈希、提示词哈希、性能指标、设备元数据和零远程 AI 调用。

我会上传仓库中的一个合成高风险供应商合同，不是真实私人合同。

审查提示要求应用总结核心义务，识别法律和安全风险，提取缺失条款或缺失信息，并创建行动清单。

审查通过 QVAC 在本地生成，没有使用远程 AI API。

结果显示推理提供方是 QVAC，远程 AI 调用为 0。应用检测到 5 个缺失条款，并提取了合同中的关键运营指标。

Policy Matrix 是核心审查流程。它不是只依赖小模型猜测答案，而是使用结构化供应商合同规则包检查合同。

每一行都有要求项、状态、引用证据和建议。绿色表示满足，红色表示缺失或不完整。

对于每个缺失条款，应用会解释风险并给出建议修改。例如，合同缺少明确的数据泄露通知时限、甲方审计权和知识产权归属。

每个发现都绑定到本地文档分片，因此审查者可以检查结论来源。

Evidence Pack 是为了黑客松验证设计的。它记录 QVAC 提供方、零远程 AI 调用、模型名、设备信息、文档哈希、提示词哈希、检索分片、运行指标和导出报告路径。

仓库包含自动验证。高风险、部分完整和完整合同分别应产生 5、3、0 个缺失条款。鲁棒性测试检查提示注入、空文档、无关文档和不支持的 PDF。

LocalVault AI 展示了一个运行在通用消费级设备上的本地 AI 工作流：QVAC 本地推理、确定性合同检查、证据绑定、建议修改、可复现验证和零远程 AI 调用。
```

## 6. 录完后检查清单

录完视频后先自己播放一遍，确认：

- 视频长度不超过 5 分钟。
- 没有录到私人 PDF、微信、邮箱、个人信息。
- UI 是英文，不是 Chrome 自动翻译后的混合文案。
- 页面出现 `Inference provider: qvac`。
- 页面出现 `Remote AI calls: 0`。
- 页面出现 `Missing clauses: 5`。
- 页面出现 `Policy Matrix`。
- 页面出现 `Missing Clauses` 和 suggested amendment。
- 页面出现 `Audit Evidence Pack`。
- 画面清楚，滚动不太快。
- 字幕没有挡住关键 UI。

## 7. CapCut / 剪映后期流程

推荐后期顺序：

1. 导入 OBS 录屏视频。
2. 剪掉开头和结尾多余等待。
3. 控制视频在 5 分钟以内。
4. 添加英文旁白，可以一句一句录。
5. 添加英文字幕，使用上面的英文字幕整合版。
6. 如果底部任务栏被录进去，可以轻微裁剪或放大到 103%-105%。
7. 导出 MP4，1080p，30fps。
8. 上传 YouTube，设置为 Unlisted。
9. 将 YouTube 链接填到 DoraHacks。

## 8. 不要做的事

- 不要展示私人 PDF。
- 不要展示真实个人合同。
- 不要展示 mock provider。
- 不要展示乱码 PDF 作为主要演示。
- 不要说“guaranteed winner”或“guaranteed prize”。
- 不要现场临时改代码。
- 不要现场跑不稳定的长命令，除非你已经确认它能很快成功。

## 9. 最终提交时可以引用的材料

GitHub:

```text
https://github.com/zcy0109/qvac-localvault-ai
```

Evidence files:

```text
evidence/logs/latest-demo-run.json
evidence/logs/validation-report.json
evidence/logs/robustness-report.json
evidence/logs/review-report.json
evidence/api-disclosure.json
evidence/offline-proof-checklist.md
evidence/final-submission-checklist.md
evidence/final-recording-workflow-cn.md
```

Project one-line description:

```text
LocalVault AI is a local-first confidential contract review workspace powered by QVAC local inference, deterministic policy checks, and auditable evidence logs.
```
