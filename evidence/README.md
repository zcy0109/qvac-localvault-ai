# Evidence Bundle

这个目录用于存放 QVAC Hackathon 评审所需的证据材料。LocalVault AI 的目标不是只展示一个 UI，而是让评委能够验证：文档在本地处理、推理来自 QVAC、没有远程 AI 调用、结果可以追溯到本地证据分片。

## 必交材料

- `logs/latest-demo-run.json`：最终演示运行生成的推理日志。
- `logs/validation-report.json`：`npm run validate:demo` 生成的自动验证报告。
- `api-disclosure.json`：项目使用的远程 API 披露文件。
- `hardware-screenshots/`：CPU、RAM、GPU、系统信息截图。
- `sample-documents/`：演示视频和自动验证使用的本地样本文档。

## 最终验证命令

```powershell
$env:LOCALVAULT_PROVIDER='qvac'
$env:LOCALVAULT_REQUIRE_QVAC='true'
npm run validate:demo
```

验证报告应满足：

- `ok: true`
- `provider: qvac`
- `remote_api_calls: []`
- `missing_clause_count: 5`
- `key_metric_count: 9`
- 所有缺失条款和关键指标都有 `evidenceChunkId`
- 所有缺失条款都有可交付的 `amendmentDraft`

## 录制演示前检查

1. 关闭不必要程序，释放内存。
2. 运行 `npm run lint` 和 `npm run build`。
3. 使用 QVAC 模式启动应用。
4. 上传 `sample-documents/confidential-vendor-contract.md`。
5. 运行本地审查并确认右侧证据面板显示远程 AI 调用为 0。
6. 展示每个缺失条款下方的 Suggested amendment，说明审查结果可以直接转化为合同修订草案。
7. 点击至少两个“证据分片”按钮，展示结论和引用之间的绑定。
8. 展示 Audit Evidence Pack，说明 QVAC、本地硬件、零远程调用和复现命令。
9. 运行 `npm run validate:demo` 并保存生成的验证报告。

最终提交给 DoraHacks 的日志必须来自真实 QVAC provider，不能使用开发阶段的 mock provider。
