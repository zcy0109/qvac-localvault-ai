# LocalVault AI 证据包

这个目录用于保存 QVAC 黑客马拉松评审需要的可复现证据。LocalVault AI 的提交重点不是只展示一个界面，而是证明以下事实：

- 文档解析、检索、审查和修订建议都在本地完成。
- AI 推理提供方是 QVAC。
- 审查期间没有远程 AI API 调用。
- 关键结论可以追溯到本地文档分片、哈希和运行日志。
- 同一套规则能区分高风险、部分合规和完整合规合同。

## 必交材料

- `logs/latest-demo-run.json`：应用运行后导出的最新本地推理日志。
- `logs/validation-report.json`：`npm run validate:demo` 生成的自动验证报告。
- `api-disclosure.json`：远程 API 披露文件，当前应为空调用列表。
- `hardware-screenshots/`：CPU、内存、GPU、系统信息和网络状态截图。
- `sample-documents/`：演示视频和自动验证使用的本地样本文档。

## 最终验证命令

```powershell
$env:LOCALVAULT_PROVIDER='qvac'
$env:LOCALVAULT_REQUIRE_QVAC='true'
npm run validate:demo
```

验证报告应满足：

- `ok: true`
- 三个样本全部通过：
  - `vendor-contract-risky.md`：缺失条款 `5`，关键指标 `9`
  - `vendor-contract-partial.md`：缺失条款 `3`，关键指标 `9`
  - `vendor-contract-complete.md`：缺失条款 `0`，关键指标 `9`
- 每个样本均为 `provider: qvac`
- 每个样本均为 `remote_api_calls: []`
- 所有缺失条款都有证据分片和修订草案。
- 所有关键指标都有证据分片。
- 日志包含文档 SHA-256、Prompt SHA-256、QVAC SDK 版本、硬件信息和性能指标。

## 零云 / 断网证明

演示前建议准备两类证据：

1. 应用内证据：界面右侧显示 `Remote AI calls: 0`，日志中 `remote_api_calls: []`。
2. 系统级证据：Windows 资源监视器或任务管理器网络面板截图，展示审查运行期间没有外部 AI API 流量。

可选断网演示流程：

1. 先联网启动项目并确保 QVAC 模型已经可用。
2. 断开 Wi-Fi 或禁用网络适配器。
3. 上传 `vendor-contract-risky.md`。
4. 运行本地审查。
5. 展示结果仍然生成，并且 `Remote AI calls` 仍为 `0`。
6. 截图保存到 `evidence/hardware-screenshots/`。

## 录制演示前检查

1. 关闭无关程序，释放内存。
2. 运行 `npm run lint` 和 `npm run build`。
3. 使用 QVAC 模式启动应用。
4. 上传 `vendor-contract-risky.md`，展示缺失条款 `5` 和关键指标 `9`。
5. 上传 `vendor-contract-partial.md`，展示缺失条款 `3`。
6. 上传 `vendor-contract-complete.md`，展示缺失条款 `0`，证明系统不会过度报错。
7. 展示每个缺失条款下方的 Suggested amendment。
8. 点击至少两个“证据分片”按钮，展示结论和引用之间的绑定。
9. 展示 Audit Evidence Pack：QVAC、本地硬件、零远程调用、哈希和复现命令。
10. 运行 `npm run validate:demo` 并保存生成的验证报告。

最终提交给 DoraHacks 的日志必须来自真实 QVAC provider，不能使用开发阶段的 mock provider。
