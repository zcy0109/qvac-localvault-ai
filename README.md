# LocalVault AI

LocalVault AI 是一个面向 QVAC Hackathon 通用设备赛道的本地优先隐私文档智能工作台。项目目标是在消费级笔记本或台式机上，用 QVAC SDK 完成私密文档审查、关键条款提取、风险登记、行动计划生成和可审计证据导出，不依赖远程 AI API。

## 赛道定位

- 赛道：General Purpose Devices
- 设备：消费级 Windows 笔记本，16 GB RAM，RTX 3050 Ti Laptop GPU
- 场景：企业合同、内部政策、研究资料、保密文档的本地审查
- 核心价值：敏感文档不离开本机，评委可以用日志、哈希、引用分片和硬件信息复现审查过程

## 核心功能

- 上传 PDF、TXT、Markdown 文档
- 自动清空旧工作区，避免知识库上下文污染
- 使用本地分片检索和 QVAC 推理完成保密审查
- 确定性识别合同关键指标和缺失条款
- 将关键指标、风险卡片和右侧引用证据分片绑定
- 记录 QVAC SDK 版本、模型、TTFT、TPS、模型加载时间、文档哈希、Prompt 哈希、硬件信息和远程调用情况
- 导出 `evidence/logs/latest-demo-run.json` 和 `evidence/logs/validation-report.json`

## 当前 QVAC 集成

- SDK：`@qvac/sdk@0.10.2`
- 模型：`QWEN3_600M_INST_Q4`
- 推理入口：`server/inference.ts`
- 审查入口：`server/analysis.ts`
- API 披露：`evidence/api-disclosure.json`

最终提交日志必须显示：

```text
provider: qvac
remote_api_calls: []
```

## 本地运行

```powershell
npm install
$env:LOCALVAULT_PROVIDER='qvac'
$env:LOCALVAULT_REQUIRE_QVAC='true'
npm run dev
```

打开：

```text
http://127.0.0.1:5173
```

## 自动验证

评委或开发者可以运行：

```powershell
$env:LOCALVAULT_PROVIDER='qvac'
$env:LOCALVAULT_REQUIRE_QVAC='true'
npm run validate:demo
```

该命令会使用 `evidence/sample-documents/confidential-vendor-contract.md` 执行一次完整审查，并断言：

- provider 为 `qvac`
- 远程 AI 调用为 0
- 识别 5 个缺失条款
- 识别 9 个关键指标
- 所有缺失条款和关键指标都有证据分片
- 展示用分析说明没有泄露模型思考或 JSON 指令
- 文档哈希和 Prompt 哈希已记录

验证报告会写入：

```text
evidence/logs/validation-report.json
```

## 证据目录

```text
evidence/
  README.md
  api-disclosure.json
  logs/
    latest-demo-run.json
    validation-report.json
  sample-documents/
    confidential-vendor-contract.md
  hardware-screenshots/
```

## 演示重点

1. 展示硬件：CPU、RAM、GPU、Windows 系统信息。
2. 启动 QVAC 模式，确认 provider 为 `qvac`。
3. 上传示例供应商保密合同。
4. 运行本地审查，展示 5 个缺失条款和 9 个关键指标。
5. 点击证据分片，证明每条结论都能追溯到本地文档片段。
6. 打开证据日志，展示 `remote_api_calls: []`、SDK 版本、文档哈希、Prompt 哈希和性能指标。
7. 运行 `npm run validate:demo`，生成可复现验证报告。

## 许可证

Apache-2.0
