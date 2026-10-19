# 炼知 · LianZhi

项目自身源码采用 [MIT License](LICENSE)，版权署名为 nottobeshy（2026）；第三方依赖、模型及素材沿用各自许可，见[分发核查](docs/releases/THIRD_PARTY.md)。[GitHub源码仓库](https://github.com/nottobeshy/LianZhi)已创建为私有，需授权账号访问；正式Release未发布。最新推送与制品状态见 HANDOFF.md。

## Windows v0.1.0 候选包（2026-10-19，未公开发布）

已实现pywebview + PyInstaller onedir桌面壳，保持现有FastAPI/原生前端/SQLite/ASR/WinVault。Windows11本机实际EXE/WebView2、C盘中文空格目录解压、冻结ASR、Stub挑战/文案、持久化与窗口重启验收通过。ZIP不含私人视频/数据库/Key/开发模型。用户验收后批准新增ASR自动安装：桌面首次启动后台下载缺失的固定small模型并校验，显示进度、失败可重试，成功自动启用；已有有效模型不重复下载，源码后端仍不自动联网。

本地候选、SHA和同提交源码ZIP由 `scripts/build_windows.ps1` 生成至 `release-artifacts/`。详细见[使用说明](docs/releases/WINDOWS_QUICKSTART.md)、[源码构建与Actions限制](docs/releases/BUILD.md)、[测试记录](docs/releases/TEST_REPORT.md)、[开源项目评估](docs/releases/RESEARCH.md)、[Release Notes草稿](docs/releases/v0.1.0.md)。本轮模型额度仍0，没有再次真实AI请求；独立全新Windows/人工双击/第三方native许可审核待完成。已创建私有nottobeshy/LianZhi；没有已发布Release或公开下载资产。

## 火焰罗盘已正式集成（2026-10-19）

首页与知识挑战现共用已确认的柔和SVG火焰V2（强度80%、速度2.0×），原罗盘主体/指针、真实抽题与AI/SQLite/视频/设置能力保留。独立 `prototypes/flame-compass/` 继续作为视觉参考，正式动画在 `demo/js/flame.js` 与 `demo/css/flame.css`，不含试验控制面板。

刷新当前 [正式应用](http://127.0.0.1:8000/) 即可查看。**重启须保留 `LIANZHI_DATA_DIR=E:\Projects\KnowledgeCompass\.test-runtime\browser` 与 `LLM_MAX_REQUESTS=0`，避免切换旧记录目录或重开收费预算。** 启动命令、实际修改、生命周期与验收见 [火焰集成说明](docs/FLAME_COMPASS.md)。本轮73项pytest、12个前端脚本及四屏宽/10次抽题浏览器验收通过；隔离真实ASR+明确Stub复盘重启联测通过，正式已有live视频只读显示正常。本轮没有再发真实AI请求。

## 视频文案AI复盘（2026-10-18）

本轮新增确认稿→主动授权文字外发→知识/逻辑/表达建议→原版与AI版对照→用户编辑版→SQLite版本历史。复用当前模型配置，原视频不发云端；模型意见需人工复核。转写改变后旧复盘保留并标过期。Schema升级v3，v2升级前自动备份，旧挑战/视频保留。

73项自动回归通过，真实浏览器/本地ASR加明确Stub的完整链路通过。用户更新Key后，最后一次真实DeepSeek调用成功：44.6秒新视频、真实ASR5段、AI建议89字符/3条修改摘要，实际剪贴板复制、用户编辑保存、页面刷新及后端重启/新浏览器读回通过；真实结果在隔离副本中修改确认稿后正确过期，正式稿保持当前有效。首次认证失败记录保留。详情见[视频AI复盘/API/存储](docs/VIDEO_REVIEW.md)。历史加本专项累计3次，授权额度已用尽；当前服务LLM_MAX_REQUESTS=0，仍可查阅/复制/编辑保存已有结果。

思考在前，AI 在后。原项目名：选题罗盘（Knowledge Compass）。单机知识创作工作流，保留知识挑战和视频复盘两个独立入口。

## 本地视频转写（2026-10-18 最新）

2026-10-18 上传诊断：修复`/api/videos/`尾斜杠路径误触64 KiB通用限制的问题；两个上传路径均按流限制 **100 MiB（104857600字节）**，只接受实际可解码、含音轨且不超过180秒的MP4。前端直接发送File（video/mp4原始请求体），无需Base64或multipart。其他JSON命令仍限制64 KiB。

本轮已用无隐私中文合成视频（H.264/AAC、19.4秒、165610字节）在真实Chromium正式页面验证上传→真实CPU ASR→校对确认→SQLite→刷新和实际服务重启读回；静音失败明确提示NO_SPEECH。尾斜杠缺陷已复现，用户原现场是否使用该路径或旧进程尚无证据。完整命令与限制见[复现说明](docs/REPRODUCE.md)。Windows桌面打包版尚未存在，未作兼容性承诺。

已接入真实闭环：MP4（≤3分钟、≤100MiB）→本地CPU INT8 ASR→带时间戳分段→人工修改/确认→SQLite→重启读回。仅本地转写无需API Key、不发送云端；主动授权的AI文案复盘会发送确认稿文字，见上方最新专项。

创建虚拟环境后安装ASR依赖并单独准备唯一模型：

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-asr.txt
.\.venv\Scripts\python.exe scripts/download_asr_model.py
.\.venv\Scripts\python.exe -m backend
```

模型为官方固定版本faster-whisper-small，MIT，约486MB；不会在应用启动/转写时自动下载。默认项目models/目录（Git忽略），PyAV内含FFmpeg库，无需系统FFmpeg或CUDA。实际Windows/Python3.12 CPU验证通过；GPU未验证。[安装、API、公开测试资源与限制](docs/ASR.md)。

用户本轮新视频20.20秒：正式路径识别6段中文，加载+识别5.49秒，子进程峰值工作集695.5MiB；正式前端脚本校对确认、SQLite、实际后端重启与新前端环境读回通过（DOM替身）。真实浏览器播放/布局仍未验收，未给出准确率或时间戳人工偏差结论。Schema升级v2，v1升级前自动保留app.pre-video-v1.db，原挑战记录不重写。

## 2026-10-18 界面精简

音效音量条局部缩为最多240px、窄屏随容器收缩，并取消通用输入放大；默认值、百分比及本机保存规则不变。普通挑战档案以“讲解文案”展示，不再显示“追问来源”JSON；原稿、修正历史、知识点与更新时间保留，live/mock徽标不变，预存example仍明确标记。API/SQLite元数据与Markdown导出保持完整；主动打开导出预览时仍可见来源信息。

本轮22项pytest、8个Node脚本通过；历史数据库只读备份副本的2条旧记录、新建记录与实际进程重启读回通过，Schema仍v1。浏览器工具初始化失败，375/768/桌面实际视觉、真实刷新和扬声器试听未验证，详见HANDOFF。

## 当前状态（2026-10-17）

范围来自 [MVP正式任务书](docs/MVP_TASK_V1.0.md)，不代表旧PRD全部获批。

| 能力 | 实际状态 |
| --- | --- |
| 四词库、导入、抽题、倒计时 | 已实现；Node回归通过；本轮浏览器未验证 |
| FastAPI同源托管前端 | 实际本机HTTP测试通过 |
| 解释→追问→回答→修正→SQLite→重启读取 | Stub模式的实际HTTP与前端脚本测试通过；内存DOM，非浏览器测试 |
| DeepSeek | 适配器已实现；协议/失败测试用MockTransport；已通过1次真实DeepSeek请求、回答修正保存及实际进程重启读回；浏览器全流程未验收 |
| 无Key案例 | 明确标记example的预存协议夹具，不是历史真实调用 |
| 视频口播转写 | 真实本地ASR/人工校对/SQLite/进程重启读回已验证；浏览器未验收 |
| AI视频复盘、AI反馈/复核/讲稿 | 未接真实服务；原静态Demo仍Mock |
| ASR | faster-whisper-small，CPU INT8已实跑；单独安装requirements-asr与固定模型，GPU未验 |

无Key可以学习、保存解释、查看档案和预存案例；真实追问报未配置，不自动替换Mock。主动选择mock才使用开发Stub。

## Windows快速启动

实际环境：Windows 11 x64、Python **3.12.14**、SQLite **3.53.1**、Node **24.18.0**。其他系统/版本未验证。需安装Python 3.12；开发机本轮使用应用附带Python，系统py无注册解释器。

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m backend
```

打开 **http://127.0.0.1:8000**；接口文档 **http://127.0.0.1:8000/docs**；Ctrl+C停止。单worker，仅绑定本机。仅知识挑战无需ASR模型；视频请执行上方ASR安装步骤，无需前端构建、系统FFmpeg或GPU。

数据默认 %LOCALAPPDATA%\KnowledgeCompass，自动初始化app.db；启动前可设置 `$env:LIANZHI_DATA_DIR='可写目录'`。同目录只允许运行一个服务。备份先停服务再复制数据目录，不要用删除数据库解决错误。

## 模型配置

应用“设置”填写endpoint、模型和密码框Key，再应用配置。可勾选“记住 API Key”，使用明确选定的 Windows 凭据管理器安全保存；下次启动恢复，输入框始终不回显。未勾选时只在后端内存使用。同端点留空保留当前Key，输入新Key即替换；切换端点不会沿用旧端点密钥。

取消勾选并应用会删除**当前端点**已保存凭据，当前会话仍可使用；删除按钮同时清除内存与当前端点的系统凭据。保存失败在页面明确提示，保留会话使用，不降级明文。启动优先级：`LLM_API_KEY` > 当前端点已保存凭据 > 未配置；页面显式输入可替换当前会话值。删除不会修改终端环境变量，变量未移除时重启仍会重新读取。

非敏感模型配置保存在数据目录 `llm-settings.json`；Key不进该文件、SQLite或浏览器存储。默认仅允许 `api.deepseek.com` 的HTTPS地址（可选`/v1`）；自定义供应商须在启动环境指定 `LLM_BASE_URL`，允许主机由服务启动时确定。不同端点/数据目录的凭据独立。详细生命周期、错误处理和测试见 [密钥安全说明](docs/SECURITY.md)。

2026-10-18：keyring **25.7.0**、pywin32-ctypes **0.2.3**，本机Windows凭据保存/替换/删除、四次HTTP服务启动与恢复检查通过；45项pytest、9个Node脚本通过。浏览器真实交互未验收，未发送收费请求。**仓库可以复现应用，不代表会携带开发者本机保存的密钥。评委需要使用自己的凭据。**

用户确认：`https://api.deepseek.com`、`deepseek-v4-pro`、**最多3次真实请求**。额度按进程计数；重启归零不代表新的收费授权，不得跨进程累计超过授权额度。

环境变量见 [.env.example](.env.example)。**程序不会自动加载.env**，需在服务终端设置变量。不要把Key写入聊天、源码、普通日志或Git。

live必须先独立解释、在设置勾选文字外发同意，再明确点击生成追问。只发知识点/解释，不发送媒体。模型意见不是事实核查；无自动重试，超时仍可能计费。网络失败保留错误和输入，本地保存仍可用。

开发验证可启动前设置 `$env:LLM_MODE='mock'`；结果标注mock/开发Stub，正常使用保持live。

## 测试

```powershell
.\.venv\Scripts\python.exe -m pytest -q
Push-Location demo
Get-ChildItem tests/test-*.js | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw $_.Name } }
Pop-Location
```

测试用临时目录和Stub/MockTransport，不收费。pytest含真实HTTP进程、Node前端适配层、服务重启验证。旧Node部分用例仅打印诊断，不等于全部规则验收。
浏览器自动化本轮因Windows sandbox helper初始化错误失败；交互/布局/剪贴板/下载和真实localStorage故障未验证。

## 工程与文档

- demo/：原生前端，api.js访问同源/api；file://仍为静态Mock。不要用python -m http.server代替正式服务。
- backend/：FastAPI、sqlite3、LLM适配、真实本地ASR与受控子进程；无ORM/外部队列/账号。
- tests/：API、存储、错误、实际进程测试。
- scripts/sync-topics.cjs：维护124个内置UUID；改词库后执行 `node scripts/sync-topics.cjs` 并审核生成文件，勿重建已有UUID。
- [架构/API](docs/ARCHITECTURE.md) · [复现](docs/REPRODUCE.md) · [演示](docs/DEMO.md) · [第三方](docs/THIRD_PARTY.md)
- [决策](docs/00-文档约定与决策.md) · [PRD](docs/01-产品需求文档PRD.md) · [约束](AGENTS.md) · [交接](HANDOFF.md)

## 限制

活动草稿/计时/file:// Mock记录在内存；导入词库在浏览器localStorage，未迁SQLite。SQLite保存挑战闭环与HTTP视频转写，分别最多列出最近500/100条。解释不可覆盖，修正追加；视频原稿/确认版本不可覆盖，未保存编辑刷新丢失。schema v2增量升级v1并备份，旧程序不应直接打开v2；未来破坏性迁移另行设计。已保存挑战可查阅，尚无挑战中途恢复编辑入口。
真实AI已做1次成功验证，累计费用额度最多3次；本轮ASR本地不收费。中文识别准确率/时间戳人工偏差、3分钟性能、GPU/其他硬件及真实浏览器未验收。未打包桌面程序；整体开源许可待决定，未创建GitHub远程仓库或发布。
