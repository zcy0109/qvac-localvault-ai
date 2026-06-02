# LocalVault AI

LocalVault AI 是一个面向 QVAC Hackathon「通用设备」轨道的本地优先隐私文档智能工作台。

项目目标是把一台消费级笔记本或台式机变成私密文档审查工作站。用户可以上传 PDF、笔记、合同和研究资料，应用通过 QVAC SDK 在本机完成推理和 RAG 风格的文档工作流，并导出可审计的性能日志，方便评委验证。

## 参赛轨道

轨道：通用设备（General Purpose Devices）

LocalVault AI 对应官方公告里的这些方向：

- 隐私优先的企业工具
- 本地文档智能
- 个人知识库
- 高级 RAG 管道
- 消费级硬件上的 agentic workflow

## 功能

- 支持上传 PDF、TXT、Markdown 文档。
- 对本地私密文档进行切块和检索。
- Confidential Review 工作流：摘要、问答、风险点、行动清单、引用来源。
- QVAC SDK 适配器，基于官方 `loadModel`、`completion` 和流式 token API。
- 开发 fallback provider，用于在 QVAC 安装验证前先完成 UI 和证据链开发。
- 自动导出可审计推理日志到 `evidence/logs/latest-demo-run.json`。
- 提供 `api-disclosure.json`，披露远程 API 调用情况。
- 自动记录硬件信息，方便复现和评审。

## 当前 QVAC 状态

QVAC 集成代码位于：

```text
server/inference.ts
```

官方 npm quickstart 使用的接口大致如下：

```js
import {
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  completion,
  unloadModel,
} from '@qvac/sdk'
```

2026 年 6 月 2 日本地安装测试中：

- `@qvac/sdk@0.11.0` 安装失败，原因是 npm 无法解析 `@qvac/transcription-whispercpp@^0.7.0`。
- `@qvac/sdk@1.1.0` 安装失败，原因是 npm 无法解析 `@qvac/decoder-audio@^0.1.0`。
- `@qvac/sdk@0.10.2` 安装成功，因此当前项目先锁定这个版本。

当前依赖：

```json
"@qvac/sdk": "^0.10.2"
```

当前真实 QVAC 路径已经跑通：

- 模型：`QWEN3_600M_INST_Q4`
- 本地缓存目录：`C:\Users\张晨宇\.qvac\models`
- 最新日志：`evidence/logs/latest-demo-run.json`
- 最新日志状态：`provider: qvac`，`remote_api_calls: []`

开发阶段仍可使用 mock provider 快速调 UI，但最终提交给 DoraHacks 的日志必须来自真实 QVAC provider。

开发模式：

```powershell
$env:LOCALVAULT_PROVIDER='mock'
npm run dev
```

最终评审模式：

```powershell
$env:LOCALVAULT_PROVIDER='qvac'
$env:LOCALVAULT_REQUIRE_QVAC='true'
npm run dev
```

最终提交日志必须显示：

```text
provider: qvac
remote_api_calls: []
```

## 开发硬件

初始开发机器：

- CPU：11th Gen Intel Core i5-11400H，6 核 / 12 线程
- RAM：16 GB
- GPU：NVIDIA GeForce RTX 3050 Ti Laptop GPU，4 GB 显存
- 系统：Windows

硬件截图请保存到：

```text
evidence/hardware-screenshots/
```

## 本地运行

先进入项目目录：

```powershell
cd "C:\Users\张晨宇\Documents\Codex\2026-06-02\new-chat\qvac-localvault-ai"
```

安装依赖：

```powershell
npm install
```

启动开发模式：

```powershell
$env:LOCALVAULT_PROVIDER='mock'
npm run dev
```

打开：

```text
http://127.0.0.1:5173
```

QVAC SDK 验证：

```powershell
$env:LOCALVAULT_PROVIDER='qvac'
$env:LOCALVAULT_REQUIRE_QVAC='true'
npm run qvac:smoke
```

## Evidence Bundle

证据材料目录结构：

```text
evidence/
  README.md
  api-disclosure.json
  logs/
    latest-demo-run.json
  sample-documents/
    sample-confidential-review.md
  hardware-screenshots/
```

## 评审复现路径

评委可以按下面方式验证项目：

1. 本地安装并运行应用。
2. 上传样本文档。
3. 执行 Confidential Review。
4. 检查回答是否带有本地引用片段。
5. 检查 evidence 日志中的 provider、model、TTFT、TPS、tokens、硬件信息和远程 API 披露。

## 许可证

Apache-2.0
