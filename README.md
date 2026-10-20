# 炼知 · LianZhi

**先自己讲，再让 AI 追问。**  
*思考在前，AI 在后。*

[![Release](https://img.shields.io/badge/Release-v0.1.0-orange)](https://github.com/nottobeshy/LianZhi/releases/tag/v0.1.0)
![Platform](https://img.shields.io/badge/Platform-Windows%2011%20x64-555)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

炼知是一款面向知识学习者和个人内容创作者的 **Windows 桌面工具**：从知识词库抽取一个主题，先独立学习和解释，再让 AI 针对表达追问；也可以上传自己的口播视频，在本地完成语音转写后，自主选择是否让云端 AI 提出文案修改建议。解释、回答、修订和复盘记录保存在本机。

<p align="center">
  <a href="assets/screenshots/01-home.png"><img src="assets/screenshots/01-home.png" alt="炼知真实软件首页：火焰罗盘、知识挑战、视频复盘与知识作品入口" width="100%"></a>
</p>
<p align="center"><sub>实际软件首页截图，点击可查看原图。截图中的「Demo Mock」为截取时的演示模式标识，不代表项目仅支持模拟模型。</sub></p>

**[下载 Windows v0.1.0](https://github.com/nottobeshy/LianZhi/releases/tag/v0.1.0)** · [浏览源代码](https://github.com/nottobeshy/LianZhi) · [查看使用说明](docs/releases/WINDOWS_QUICKSTART.md)

> **发布状态：** v0.1.0 已公开提供 Windows x64 ZIP，资产名称仍带 `candidate`，按**预览版**使用。已在 Windows 11 开发环境验证部分桌面与本地 ASR 流程；不代表已覆盖全新系统、所有硬件和全部云端业务组合。

## 一次学习如何发生？

炼知借鉴费曼学习法中“尝试用自己的语言解释”的思路，将操作组织为一条可保存的路径：

**选题 → 限时学习 → 独立解释 → AI 追问 → 回答与修正 → 保存作品**

例如，界面中可以选择**哲学知识词库**，抽取“个人同一性”等主题，先写下自己对概念的解释，再主动请求 AI 追问，最后保存并回看修改记录。下面两张图分别展示**真实挑战配置界面**与**知识作品列表**；它们不包含一次完整的云端 AI 对话，因此这里不虚构“AI 实际问了什么”。

<table>
  <tr>
    <td width="50%" align="center">
      <a href="assets/screenshots/02-knowledge-challenge.png"><img src="assets/screenshots/02-knowledge-challenge.png" alt="知识挑战配置：四个内置词库、难度、时间预算与词条启用状态" width="100%"></a><br>
      <sub>知识挑战 · 词库与抽题配置（点击放大）</sub>
    </td>
    <td width="50%" align="center">
      <a href="assets/screenshots/04-knowledge-works.png"><img src="assets/screenshots/04-knowledge-works.png" alt="我的知识作品：列出个人同一性、说谎者悖论等已保存的知识挑战记录" width="100%"></a><br>
      <sub>我的知识作品 · 保存与回看（点击放大）</sub>
    </td>
  </tr>
</table>

## 两个工作入口

### 01 · 知识挑战：检验“我是否讲得清楚”

内置**概率论、C 语言、心理学、哲学**四个词库，也支持导入自定义 Markdown 词库。用户可选择难度和学习时间，抽题后先独立解释，再主动授权云端 AI 生成针对性追问，回答后修正自己的表达并保存记录。

这不是自动给出标准答案的题库；AI 的作用是提供可供思考的问题，**其判断仍需用户自行核实**。

### 02 · 视频复盘：从真实口播出发修改讲稿

支持上传 **MP4（不超过 180 秒、100 MiB）**，使用本地 `faster-whisper-small` 进行语音转写，并保留时间戳分段。用户先校对和确认文本，再决定是否将**确认后的文字**发送给云端模型，获取知识、逻辑与表达方面的修改建议。原稿、AI 建议稿和用户编辑稿分别保存，便于对照回看。

<p align="center">
  <a href="assets/screenshots/03-video-review.png"><img src="assets/screenshots/03-video-review.png" alt="炼知视频复盘真实界面：选择 MP4、开始本地口播转写与查看本地视频记录" width="95%"></a>
</p>
<p align="center"><sub>视频复盘真实界面：上传与本地转写入口；这张截图不包含生成后的 AI 文案对照。</sub></p>

> 本地模型转写的对象是视频中的**语音内容**，而不是视频画面。当前版本不提供镜头、动作、表情或情绪识别。

## 为什么不直接使用 ChatGPT？

完全可以使用通用大模型配合“先追问我、不要直接给答案”的提示词；炼知**不声称发明了苏格拉底式提问，也不宣称效果已获教学实验验证**。本项目的重点是把分散的操作组合为可重复执行、可追溯的单机工作流：

| 已有方法 | 它本来就能做到的事 | 炼知额外整合的环节 |
| --- | --- | --- |
| 通用 AI + 苏格拉底式 Prompt | 灵活对话和针对性追问 | 内置词库、难度/时间配置、固定挑战路径、本地修订档案 |
| 费曼学习法 + 普通笔记 | 独立讲解、记录理解 | 与追问、回答及修正版本相连的保存流程 |
| 视频转写或文案润色工具 | 获取语音文本、修改文案 | 本地 ASR、人工确认门禁、原稿/AI 稿/编辑稿分离与历史追溯 |

**设计目标**不是证明 AI 让人“真正掌握”了知识，而是让独立解释、主动修正和作品留存更容易发生。

## Windows 快速开始

1. 从 [v0.1.0 Releases](https://github.com/nottobeshy/LianZhi/releases/tag/v0.1.0) 下载 `LianZhi-v0.1.0-windows-x64-candidate.zip`。
2. **完整解压 ZIP**，保留 `LianZhi.exe`、`LianZhi-worker.exe` 和 `_internal` 等依赖文件；不要只复制 EXE。
3. 双击 `LianZhi.exe`。Windows 11 x64 是已验证的平台；系统还需要 **Microsoft Edge WebView2 Runtime** 等运行组件。[WebView2 官方下载](https://developer.microsoft.com/microsoft-edge/webview2/)。
4. 如需视频转写，首次启动会尝试从 **Hugging Face** 下载、校验约 **486 MB** 的固定语音模型；下载失败可在应用内重试。模型安装完成后，本地转写可离线运行。
5. 如需 **AI 追问或文案复盘**，在「设置与帮助」填写自己的模型端点、模型名称和 **API Key**；根据界面要求明确同意相应文字外发，再主动发起调用。云端模型服务可能按其计费规则收费。

**联网说明：** 首次语音模型安装需要能够访问 Hugging Face 的模型文件服务；部分校园网或受限网络可能无法直连。当前项目未提供经验证的国内镜像或随包离线模型，请勿将浏览器能打开网页等同于下载服务一定可达。[详细排障](docs/releases/WINDOWS_QUICKSTART.md)。

**硬件说明：** 已验证 Windows CPU INT8 本地转写，不强制要求独立显卡或 CUDA。不同 CPU、内存及视频长度会影响速度；目前没有足够的跨设备数据可以给出可靠的最低内存或统一转写耗时保证。下载、解压和模型缓存需要额外存储空间。

### 文件校验与安全提醒

GitHub 当前公开资产 `LianZhi-v0.1.0-windows-x64-candidate.zip` 的 SHA-256：

```text
5444138a72ced6a0a956b5cf18546ed0988c687084d64e2f993a343ffc5892d9
```

在 Windows PowerShell 中核对：

```powershell
Get-FileHash .\LianZhi-v0.1.0-windows-x64-candidate.zip -Algorithm SHA256
```

只有当下载资产没有发生变化时，上述校验值才有效；如 Release 更换文件，请以**该次发布的官方校验信息**为准。当前程序尚未进行代码签名，因此 Windows SmartScreen 可能提示未知发布者；请先确认下载来源和文件校验结果，**不要为运行软件而关闭系统安全防护**。哈希一致不等于软件已经获得代码签名或第三方安全认证。

### 常见问题

**Q：不配置 API Key 可以使用吗？**  
可以使用词库、抽题、本地学习与作品查阅；本地 ASR 模型安装完成后，转写本身不需要云端 Key。真实 AI 追问、文案复盘则需要用户自行配置有效服务凭据。

**Q：出现“本地 AI 请求次数已达到上限”是什么意思？**  
这是应用**本地调用限制**，不等于 DeepSeek 账户余额耗尽。请核对当前版本的本地调用配置及设置页面；特别是此前测试候选曾使用 `LLM_MAX_REQUESTS=0` 阻止所有真实收费请求。不要为了排错而反复触发付费调用。

**Q：软件把视频上传到云端吗？**  
原始视频、音频在本地处理；当用户明确同意并主动使用 AI 功能时，相关的知识解释或**人工确认后的转写文字**会发送给所配置的云端模型。详见[视频复盘说明](docs/VIDEO_REVIEW.md)。

**Q：我的记录保存在哪里？如何备份？**  
目前沿用历史应用目录 `%LOCALAPPDATA%\KnowledgeCompass` 保存 SQLite、视频与非敏感设置；模型、浏览器缓存和日志在相应用户目录。退出软件后再备份数据目录，避免复制写入中的数据库。API Key 可选择保存在 Windows 系统凭据管理器中，**不会随数据库备份一起迁移**。如要删除个人记录，请先完成备份并确认删除范围，勿直接删除未知目录。[数据与密钥说明](docs/releases/WINDOWS_QUICKSTART.md) · [安全说明](docs/SECURITY.md)。

## 开发者：从源码运行

在 Windows 11 x64、Python 3.12 环境下：

```powershell
# 获取源码
git clone https://github.com/nottobeshy/LianZhi.git
cd LianZhi

# 创建环境并安装基础依赖
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# 启动后端与原生前端
.\.venv\Scripts\python.exe -m backend
```

浏览器访问 `http://127.0.0.1:8000`；API 文档位于 `http://127.0.0.1:8000/docs`。仅使用知识挑战入口不需要语音模型；源码模式启用转写还需执行：

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-asr.txt
.\.venv\Scripts\python.exe scripts/download_asr_model.py
```

**注意：** 独立运行源码后端时不会像 Windows 桌面程序一样自动安装模型。完整依赖与构建细节见[源码复现](docs/REPRODUCE.md)和[Windows 构建](docs/releases/BUILD.md)。

### 运行自动化测试

```powershell
.\.venv\Scripts\python.exe -m pytest -q
Push-Location demo
Get-ChildItem tests/test-*.js | ForEach-Object {
    node $_.FullName
    if ($LASTEXITCODE -ne 0) { throw $_.Name }
}
Pop-Location
```

部分真实浏览器、ASR、Windows 包体验收需要额外依赖及显式测试开关，默认跳过的项目**不应算成已通过**。涉及云端模型的常规单测使用替身响应，不自动消耗真实收费额度。[实际测试记录](docs/releases/TEST_REPORT.md)。

## 隐私边界、架构与开源

| 留在本机 | 用户授权后可能发送到模型服务 |
| --- | --- |
| 原始视频、音频与本地 ASR 模型 | 为 AI 追问提供的知识点与用户解释文字 |
| SQLite 中保存的挑战、转写与修改版本 | 为文案复盘提供的人工确认转写文字 |
| 用户导入的词库、普通配置及本地日志 | 具体字段与用户选择的模型服务有关，详见文档 |

项目基于**原生 HTML/CSS/JavaScript、FastAPI、SQLite、faster-whisper、pywebview、PyInstaller**。可选择将 API Key 保存到 Windows 系统凭据；仓库与 ZIP 不提供作者私人密钥。AI 建议不等于经过独立事实核查的结论。

- [技术架构与接口](docs/ARCHITECTURE.md) · [AI 视频复盘协议](docs/VIDEO_REVIEW.md)
- [Windows 使用指南](docs/releases/WINDOWS_QUICKSTART.md) · [测试报告](docs/releases/TEST_REPORT.md)
- [第三方分发与许可证说明](docs/releases/THIRD_PARTY.md) · [开发交接历史](HANDOFF.md)

项目自身源码采用 **[MIT License](LICENSE)**，Copyright © 2026 **nottobeshy**。第三方依赖、模型、原生库及素材仍分别遵循各自许可证，不能把项目 MIT 许可视为全部分发组件的统一许可。
