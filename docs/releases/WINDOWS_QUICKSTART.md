# 炼知 v0.1.0 Windows x64 使用指南

**发布状态：** [GitHub v0.1.0](https://github.com/nottobeshy/LianZhi/releases/tag/v0.1.0) 已公开提供 Windows ZIP；文件名带 `candidate`，按预览版使用。以下说明只覆盖当前有证据的 Windows 11 x64 实测范围。

## 安装和第一次启动

1. 下载 `LianZhi-v0.1.0-windows-x64-candidate.zip`，**完整解压**，保持 `LianZhi.exe`、`LianZhi-worker.exe` 与 `_internal` 等文件的相对位置。不要只复制 EXE。
2. 确认系统具备 Microsoft Edge [WebView2 Evergreen Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) 及所需 .NET Framework（pywebview 的 Windows 运行环境要求至少 .NET Framework 4.6.2）。不建议从不明网站下载 DLL。
3. 双击 `LianZhi.exe`。桌面应用的本地服务默认监听 `127.0.0.1:8765`；如果端口或数据目录已被占用，先关闭已有炼知实例，不要终止未知进程。
4. 缺少本地语音模型时，桌面应用会后台尝试从 Hugging Face 安装固定版本 `faster-whisper-small`（约 486 MB），显示下载与校验状态；失败可在界面选择“安装 / 重试”。有效模型不重复下载。无需另装 Python、系统 FFmpeg 或 CUDA。
5. 若要使用云端 AI，请在「设置与帮助」填写自己的可信模型端点、模型名称及 API Key，在知识挑战/视频复盘中明确同意外发文字并主动发起调用。保存配置本身不会自动收费。

模型安装可能因网络、校园网限制、代理无法访问模型文件服务、磁盘空间或权限问题失败。浏览器能打开 Hugging Face 页面，并不意味着模型权重下载一定可达。目前没有经验证的国内镜像或随包离线模型。完整模型校验后，本地视频转写可离线使用；云端 AI 仍需联网。

需要阻止桌面启动时自动下载模型，可在启动环境中设置 `LIANZHI_AUTO_INSTALL_ASR=0`；界面手动安装入口与随包下载辅助脚本仍可用于排障。源码模式单独启动后端不自动下载安装模型。

## 本地 AI 请求限制

本地请求次数上限是应用自己的防误调用配置，**不是 DeepSeek 或其他服务商的账户剩余额度**。

- 公开 `v0.1.0` 标签对应的 `desktop/paths.py` 源码默认 `LLM_MAX_REQUESTS=0`，表示禁止真实云端请求。
- 当前 `main` 分支的该默认值已修改为 `10`，但不能因此推断此前发布的 ZIP 已采用相同配置；截至本说明更新，尚未独立解析该 ZIP 的内置构建配置。
- 已发布包实际运行时若出现本地请求上限提示，请先核对该包版本和配置来源；重新填写 API Key 不会解除本地上限。

如果用户明确愿意使用自己的付费 API Key 并承担调用费用，可在 **PowerShell 中从当前解压目录启动**，主动设置本次进程的调用上限，例如：

```powershell
$env:LLM_MAX_REQUESTS='10'
& .\LianZhi.exe
```

上述操作只改变该 PowerShell 启动的进程环境，不会改变服务商的余额，也不是自动充值。真实请求可能收费；不需要真实 AI 时可以保持限制为零。当前公开源码尚未提供经过核实的用户设置页面持久修改限额接口；后续如实现，应单独更新本指南。

## 下载文件校验

已查询到的 GitHub Release 资产：`LianZhi-v0.1.0-windows-x64-candidate.zip`，资产 SHA-256（GitHub Release 元数据）：

```text
5444138a72ced6a0a956b5cf18546ed0988c687084d64e2f993a343ffc5892d9
```

PowerShell 校验命令：

```powershell
(Get-FileHash .\LianZhi-v0.1.0-windows-x64-candidate.zip -Algorithm SHA256).Hash.ToLower()
```

核对结果需与同一发布资产的校验信息一致。当前 Release **没有单独上传 `SHA256SUMS.txt` 资产**；如果后续增加，应保证与 ZIP 的最新版本同步，不可仅依赖旧 README 中的哈希。SHA-256 只能验证文件一致性，不等于代码签名或发布者身份验证。

程序目前未签名，Windows SmartScreen 或防病毒软件可能报告未知发行者。请先确认下载来源和哈希，不要为运行软件而关闭系统安全防护。当前无 Windows 安装器或自动更新功能。

## 数据、缓存、日志与备份

- 默认 SQLite、视频、普通设置：`%LOCALAPPDATA%\KnowledgeCompass`；该目录名称沿用早期项目身份。
- 模型与浏览器缓存：通常位于 `%LOCALAPPDATA%\KnowledgeCompass\Cache`；确切路径由 `platformdirs` 与运行环境决定。
- 日志：应用用户日志目录，Windows 下通常在相应 `KnowledgeCompass\Logs` 位置，轮转大小约 1 MiB、至多三份。
- API Key：可选择保存到 Windows 系统凭据管理器，不在 SQLite、普通设置文件或软件 ZIP 中。迁移新电脑时需要重新配置。
- 备份：先退出软件，复制整个应用数据目录；若要删除记录，请先备份并确认操作对象，不要随意删除其他应用目录。

可通过启动前设置 `LIANZHI_DATA_DIR` 或 `LIANZHI_ASR_MODEL_DIR` 指向有写权限的位置。更改数据目录可能改变系统凭据的命名空间，不会自动读取旧目录绑定的 Key。相同数据目录不要让两个服务实例同时写入。

## 实测范围及限制

- 开发者 Windows 11 x64 环境中，桌面 WebView2、本地 ASR、Stub 追问/复盘、SQLite、凭据及退出重启做过验收；没有代表所有机器的全新系统测试。
- DeepSeek 源码联调曾成功，但公开 ZIP 的全部真实云端业务尚缺独立包体验收记录；Stub 表示离线替身响应，不是服务商真实回答。
- 本地视频转写仅分析语音，支持通过校验且不超过 180 秒、100 MiB 的 MP4。识别结果需人工校对，AI 文案建议需自行核实。
- 文件与许可的历史候选构建记录见 [测试报告](TEST_REPORT.md)、[构建说明](BUILD.md)和[第三方许可核查](THIRD_PARTY.md)。

遇到无法启动、模型下载失败或其他问题，可在 [Issues](https://github.com/nottobeshy/LianZhi/issues) 反馈。分享日志或截图前请先去除私人视频内容、API Key、内部路径及个人信息。
