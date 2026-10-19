# 2026-10-19 GitHub仓库与MIT许可准备

用户明确指定仓库名LianZhi、自身源码MIT，目标nottobeshy/LianZhi。已通过本机Git Credential Manager验证账号并创建 **私有** 仓库：https://github.com/nottobeshy/LianZhi 。不公开仓库、不创建Release、不新建发布标签、不发真实AI请求。连接器没有建仓工具，浏览器自动化两次初始化因沙箱运行时失败；最终通过标准Git凭据和GitHub官方API成功，令牌仅进程内使用，未显示或落盘。

新增根LICENSE（MIT，2026 nottobeshy），构建脚本增加复制LICENSE；同步README、AGENTS、BUILD、THIRD_PARTY、Release Notes本轮决定，替代“自身许可证/仓库名待定”。第三方依赖、模型和素材许可不因此改变，native分发审核仍待完成。MIT文本参考OSI官方页面；尚不把该许可宣称为全部二进制的统一许可。

私有推送前检查HEAD可达327个Git对象，未发现私人媒体/数据库/模型/Key文件名或常见token/私钥模式；只是模式检查，不声称完整秘密审计。sources/与原output/未动，无合并冲突；原8000与用户数据不动。本轮仅许可、文档和构建复制指令，不重跑业务测试；既有a6bd646候选保持原字节/原测试结论，旧ZIP没有新LICENSE，不将当前提交冒充旧候选源码。下一次候选须从含许可证的新SHA重建并复验。

仓库创建成功，源码 **5247635** 已普通推送到远端main，保留完整历史和a6bd646候选提交；本地仍在codex/windows-release。首次Git HTTPS推送及HTTP/1.1重试遭连接重置，复用Windows系统已有本地代理127.0.0.1:65532后成功；只对命令设置http.proxy，未改全局配置。后续本节补记提交继续普通推送并校验远端SHA。仍待独立干净Windows、额外真实AI授权、自托管CI和native分发审查；公开Release必须另获明确授权。

---

# 2026-10-19 ASR模型自动安装（已实现并实际验收）

## 最终候选复验与交付

新版Windows ZIP与源码ZIP固定提交 **a6bd646362029958c404d9a66b6ffb1b0cb1423b**；本节是构建后验收补记，不改变候选源码身份。Windows ZIP为120201143字节、463文件，SHA256=`8e2aee72bdf93f78636a2229ed8fb36e6ce4e2912b1fea6f2cbcdde09a013aaf`；源码ZIP为472806字节，SHA256=`1c65273582df06b905143e33d7f18b4df32a9983023757b45595bd02e889a805`。两份ZIP完整性、SHA与包内版本身份均检查通过。

最终ZIP独立解压到C盘后，实际WebView2/本地ASR/挑战与明确Stub复盘/WinVault/SQLite保存重启/断网模型复用/缺模型失败重试测试 **2 passed in36.03s**。复用此前空缓存自动下载且已验SHA的模型；a6bd646与首次自动安装实测de9204d的生产下载及前端接线代码一致，仅后续文档和随包测试报告更新。页面无脚本错误、日志无ERROR、安装目录文件集合无新增；云请求0。证据位于本机隔离目录auto-asr-final-qa-a6bd646，安全汇总为release-artifacts/acceptance-summary.json。

原8000服务保持运行，原视频与复盘逐项只读比较仍与集成前快照相等，真实调用限额0未动。工程无合并冲突，原output/未跟踪内容未动。候选可交用户试用；首次模型下载需要访问Hugging Face，失败可在应用重试。独立干净Windows、额外真实AI、自托管CI执行、项目自身许可证/native分发审核与公开GitHub仍未完成，不能将本机通过等同于这些项目通过。

用户已验收前一候选并允许继续，明确建议增加ASR自动安装。本轮将缺失模型在桌面启动时后台下载、校验后启用；源码backend不自动联网，旧CLI保留。前一已验收候选9c53776及SHA/源码/安全报告已复制至release-artifacts/previous-9c53776，避免覆盖回退依据。

已实现desktop/model_install.py受控下载子进程、30分钟上限/退出清理/并发保护；共用下载器增加进度事件、跨进程模型锁、暂存校验/原子启用、坏缓存重下与旧无效目录备份。仅桌面注入安装器，health增加状态、同源POST重试端点；不允许下载任意URL/路径。前端只局部更新提示/按钮/ASR标签，保留Key和所有草稿；不改Schema/Prompt/抽题/Key机制。

实际完整回归最终 **87 passed,6 skipped in32.94s**，13个前端脚本exit0。新增安装器/桌面专项13项最初一项夹具把无端点POST预期为404，实际原静态路由返回405；改为直接断言源码未注册安装端点，13项通过；另加坏缓存重试用例后完整回归通过。

生产代码de9204d对应ZIP已在C盘中文空格目录实际验证 **2 passed in60.21s**：全新HF_HOME/空模型目录启动EXE，自动后台下载安装固定模型并校验后执行真实ASR（44.6秒/5段），无需.cmd；原Stub挑战/复盘/编辑/WinVault/SQLite全流程仍通过。断网重启复用有效模型；另一个空目录离线启动失败/主动重试/已输入密码保留通过。窗口/安装子进程清理、日志无ERROR、页面无脚本错误、安装目录文件集合未变，云请求0。后续仅文档和打包测试报告的更新不改生产下载/接线代码；最终ZIP/源码/SHA仍绑定具体build-info并复验。

新包随附TEST_REPORT.md，避免Release-Notes中的相对测试链接缺失。旧9c包保留previous-9c53776目录；不向GitHub公开发布，仓库名/自身许可证及真实AI新预算仍待明确，继续保持现有8000与旧记录。

---

# 2026-10-19 Windows v0.1.0 候选封装（本地已验证，未公开发布）

## 最终候选交付补记

最终软件包与源码ZIP均来自 **9c5377673918db93ea6436f71d266d0e6473ee88**。本节为构建后的验收记录，不将后续文档补记提交冒充该候选源码版本；拟发布标签须以被最终批准的候选commit为准。

- `release-artifacts/LianZhi-v0.1.0-windows-x64-candidate.zip`：120181772字节，462文件；SHA256=`370fe55be7309093fefea92fe899386d3df535f175eabf6bde941454ec3c58f9`。
- 同提交 `LianZhi-v0.1.0-source.zip`：459984字节；SHA256=`8c22c9815362d147881adcde145cd208b0c5224d59e511e20b20866b796d5127`。两个ZIP均testzip完整，包内build-info/SOURCE_VERSION与commit匹配；各附.zip.sha256。
- 最终包已重新解压到C盘“炼知 最终候选-9c53776”，使用其worker不带--output，通过默认缓存路径逻辑实际下载固定模型到C盘全新用户缓存（全新HF_HOME），24秒完成并通过权重SHA。未依赖E盘开发models或原工程目录。
- 最终实际EXE/WebView2测试 **1 passed in34.18s**：沿用完整挑战/ASR/Stub复盘/WinVault/保存重启流程，新增复制成功提示和安装目录文件集合无新增写入检查；两次正常进程退出、端口关闭，page_errors=[]、日志无ERROR、云请求0。临时假Key清理，正式8000旧记录逐项读回仍与集成前快照相等，额度0未动。
- 常规 **79 passed, 5 skipped in31.49s**，12个前端脚本exit0。最终manifest已标记本机独立路径GUI通过，但人工双击/全新VM/真实AI/CI执行/公开许可审核仍pending；安全汇总在release-artifacts/acceptance-summary.json。不把这些待验项标成已完成。
- 对可选fastapi-desktop的最后一次只读浅克隆也因连接重置失败；未使用其未审查代码，不编造许可证。GitHub仍只完成账号识别，无建仓/推送/公开Release。提交本候选给用户审查后停止发布动作。

用户明确授权桌面封装、工程测试、本地Windows ZIP候选和后续Actions候选流程，取代历史“不批准桌面打包”的范围限制；未授权公开Release。保留现有FastAPI/原生前端/SQLite v3/ASR/WinVault，不改变业务。GitHub连接已确认账号nottobeshy，当前无本地remote且可见仓库不含炼知；未挪用quickkey-win11，仓库名称与自身许可证仍待确定。

## 阶段1/2完成与阶段3/4准备（最新状态）

- 本地onedir/ZIP已生成，主LianZhi.exe无控制台，worker管道探测及Windows AMD64/GUI版本资源通过；build-info绑定0.1.0/完整Git SHA/解释器，拒绝工程未提交文件。ZIP、SHA与同提交源码ZIP在release-artifacts/，不会将output/、models/、.test-runtime、Key、用户媒体或数据库打包。
- 冻结安装器在全新HF_HOME/新模型目录实际下载固定Systran small commit，约26秒完成并验证权重SHA，随后实际包用这份新模型完成44.6秒MP4/5段中文ASR；没有拿开发models缓存代替交付来源。
- 完整pytest **79 passed, 5 skipped in31.49s**；全部12前端脚本exit0。默认跳过的显式ASR/浏览器/包体验收不当常规通过；单独显式包体验收已运行。
- 生产逻辑提交d588e37对应ZIP解压至C盘独立中文空格目录，EXE环境去除Python变量并将PATH限定Windows系统目录。**实际WebView2 GUI验收1 passed in40.21s**：词库导入/选择、计时、解释→明确Stub追问→回答→修正→SQLite、视频→冻结真实ASR→确认→明确Stub双版本→编辑保存、关闭窗口/服务端口退出→新进程启动→SQLite/WinVault/词库/37%音量/视频编辑稿恢复。page_errors=[]，日志无ERROR，云请求0，隔离假凭据最终清理。后续目录权限边界/元数据/文档/CI变动的最终包仍以同脚本再验，安全汇总关联最终manifest。
- 保留实际失败：新增路径测试曾泄漏默认预算0导致20项MockTransport用例失败，隔离环境映射后修复；GUI脚本曾误假设导入即选中，改为显式点击原选择按钮；实测Windows Proactor连接重置导致服务收尾超时，改桌面局部Selector循环/5秒graceful/失败退出码并加入日志门槛后重验通过。未提升收费额度或改业务以绕过测试。
- 本地稳定后新增.github/workflows/windows-candidate.yml，只workflow_dispatch、contents:read、14天Artifacts，无公开Release job。官方setup-python manifest没有Windows3.12.14，当前为需可信同版本解释器/LIANZHI_BUILD_PYTHON的隔离Windows自托管runner；云端未配置执行，不能写CI通过。未直接更换已验证解释器。action-gh-release仅研究，待公开授权才启用写权限。
- 文档同步：本HANDOFF、AGENTS、README、docs/ARCHITECTURE、docs/REPRODUCE，以及docs/releases/RESEARCH、BUILD、TEST_REPORT、WINDOWS_QUICKSTART、THIRD_PARTY、v0.1.0草稿。实际新增代码为desktop_entry.py、desktop包、backend/version.py、packaging spec/3个定向hook、requirements-desktop、3个构建脚本、desktop单测/实际包体Python+Node验收；backend仅配置/版本/worker启动边界变化，未改Schema/Prompt/既有前端。
- 剩余门槛：独立全新Windows与用户人工下载双击、新授权真实AI、缺运行库现场、扬声器/原生下载对话框、低配/长期中断、代码签名、项目自身许可证及native第三方公开分发审查。GitHub账号已确认nottobeshy；本地无remote、未创建源码仓库/公开Release，两个最终GitHub链接暂不存在。当前交付本地候选供用户审查后再决定公开。

构建/复验：`.\scripts\build_windows.ps1`；实际包测试见docs/releases/BUILD.md。默认桌面端口8765、平台用户目录、候选LLM_MAX_REQUESTS=0；原8000开发服务/三条旧挑战/已有成功复盘仍保留。不要把不同数据目录合并或覆盖。工程分支codex/windows-release，无合并冲突、无推送。后续发布标签必须指向被验收包内SHA。

## 阶段0调研与阶段1早期记录（保留过程）

- 实际研究pywebview/PyInstaller/hooks-contrib/platformdirs/setup-python/upload-artifact/action-gh-release及既有keyring/faster-whisper。可选fastapi-desktop源码和许可证抓取不足，不采用模板代码；匿名GitHub元数据接口失败，不编造维护日期。版本/许可证/用途/风险与来源见docs/releases/RESEARCH.md。
- 新分支codex/windows-release，从已完成火焰提交5cbabad开始；只有原output/未跟踪内容，未覆盖、未修改sources或现有用户数据。
- 独立.venv-release安装pywebview6.2.1、PyInstaller6.22.3、hooks2026.8、platformdirs4.13.5及requirements-asr原锁定依赖，pip check通过；4项desktop单测通过（4.23秒）。
- 已写desktop入口/路径、packaging/LianZhi.spec与定向hooks、requirements-desktop.txt、构建/metadata/ZIP脚本。冻结后ASR通过共用依赖的LianZhi-worker.exe启动，保持原Job Object；windowed主程序不承担stdout协议。backend仅改版本0.1.0、冻结模型默认缓存与worker命令，无Schema/Prompt/前端重写。
- 固定127.0.0.1:8765保持localStorage origin；窗口结束停止自己的服务，现有8000不动。数据/缓存/日志在用户目录，保留KnowledgeCompass身份；ASR显式下载固定small至用户缓存，ZIP不收开发模型或私人资料。本轮默认LLM_MAX_REQUESTS=0，历史3次额度用尽，不收费。
- 当时首次打包和GUI尚未执行，后续真实结果见上方最新状态。构建命令scripts/build_windows.ps1；细节与进度见docs/releases/TEST_REPORT.md。

---

# 2026-10-19 火焰罗盘正式集成（当前专项已完成）

用户明确批准将独立Demo既有柔和SVG方案A、V2质感升级、强度80%、速度2.0×移植至正式首页与知识挑战；只做装饰与生命周期接线，不扩大业务范围。原型HTML/CSS/JS、后端、Schema v3、Prompt、词库、draw.js、sound.js、api.js、store.js与app.css保持不变。来源为 `prototypes/flame-compass/`，README已同步“独立Demo仍保留，正式前端已集成”，没有把调试面板带入产品。

## 代码、协作与回退

- 开始时 `codex/lianzhi-mvp` 有此前ASR/视频复盘等大量未提交成果，无未合并路径；先向用户报告并保留全部成果，创建 `codex/flame-compass-integration`，源代码基线提交 **ab2fd76**（未含私人视频/数据库/模型/Key/output/sources）。没有其他Agent改同文件，无合并冲突，未推送。`output/`原有未跟踪内容保持原样。
- 新增 `demo/js/flame.js`、`demo/css/flame.css`；修改 `demo/index.html` 加载、`demo/js/views.js`挂载点与共用罗盘HTML、`demo/js/compass.js`帧调度注入、`demo/js/app.js`原回调接线/pagehide清理。没有整页替换或Mock回退。
- 新增 `demo/tests/test-flame.js`、`tests/browser-flame-compass.cjs`；文档为本HANDOFF、根README、demo/README、原型README、AGENTS、docs/ARCHITECTURE、docs/00-文档约定与决策、新增docs/FLAME_COMPASS.md。详细职责和API见该说明。
- 首页与抽题共用同一火焰模块；锁定卡复用原罗盘DOM使340ms目标回落与700ms光效收尾不被420ms业务render打断。待机等级0.25，抽题onTick先升后降，onLock单次升至1.18再恢复。指针公式、Tick/Lock路径和业务结果不变，局部余烬噪声不消耗抽题随机数。
- 一个原生RAF服务指针与火焰，各自控制；无额外火焰定时器。挂载按home/draw幂等，离页清理；hidden/减少动态暂停、pagehide销毁、bfcache恢复挂载。异常隔离和资源缺失降级保证挑战可用，aria-hidden且不截获点击。

## 实际测试

- 常规pytest **73 passed, 4 skipped in29.62s**。全部既有11前端脚本exit0，新增调度单测exit0，共12；既有部分打印脚本不视为所有断言覆盖。
- Chromium148真实页面通过375/768/1366/1920px首页/锁定卡无横溢；10次自然抽题结果等于预选值，Lock各1次、火焰升降与收尾正确、节点保持同一。双击跳过只锁一次；切页取消不触发Lock、DRAW_ACTIVE/帧资源归零；重渲染无重复初始化，减少动态/合成visibility/pagehide/模块缺失降级通过。应用最高同时1原生RAF，page_errors=[]、api_writes=[]。截图与evidence在 `.test-runtime/flame-integration/browser/`，已查看移动首页和锁定页等截图，无明显遮挡。
- 首次脚本已过10次抽题，帧总数断言失败因探针计入Playwright自己的RAF轮询；限定为应用调用源后完整重跑通过。未改业务代码放宽验收。早期语法命令工作目录路径重复导致MODULE_NOT_FOUND，修正路径后语法全部通过。
- 隔离数据目录真实本地ASR→确认→**明确Stub**复盘→复制/用户编辑→过期→实际后端重启新浏览器读取：**1 passed in17.00s**，5段/44.6秒，page_errors=[]；不收费、不写正式库。正式已有live视频/用户编辑稿只读浏览通过，stale=false、无页面错误。
- 保护源文件最初30项hash均相等；之后仅原型README按本任务更新状态，最终其余29项保持相等。涵盖后端所有Python源、原型动画源、draw/sound/api/store/banks/vocab；语法检查和diff空白检查通过。原数据目录/预算不改。

## 运行、剩余限制与停止点

当前正式服务仍为 http://127.0.0.1:8000/ ，刷新即可见火焰。需重启时使用 `LIANZHI_DATA_DIR=E:\Projects\KnowledgeCompass\.test-runtime\browser`、`LLM_MAX_REQUESTS=0` 后运行 `.\.venv\Scripts\python.exe -m backend`，避免启动第二个8000服务或切换目录造成旧记录不可见。完整命令及复验见docs/FLAME_COMPASS.md。

真实DeepSeek累计**3次额度已用尽**，本轮未再发收费请求。AI追问/配置/SQLite协议由自动测试覆盖，已有真实复盘只读打开；没有声称重新完成真实AI全流程。实际扬声器听感、OS后台节流（本轮为合成visibility）、低配长期性能、其他浏览器与Windows桌面包未验证。最终审美由用户确认。至此完成本专项并停止，不继续视觉美化。

---

# 2026-10-18 视频口播AI复盘与双版本文案（历史专项）

用户本轮明确授权确认稿云端文字复盘、原始/AI建议对照、用户继续编辑、SQLite持久化及版本历史；提供项目根目录“知识讲解测试.mp4”作为新视频，允许使用已配置Key作真实联调。仅文本，不发送原视频/音频，不扩展画面/情绪/评分或桌面打包。用户要求完成后暂停验收。

## 当前结果与不可混淆的真实状态

- 功能已接入，73项常规pytest通过（4项显式ASR/浏览器默认跳过）；真实浏览器/本地ASR+明确Stub的完整链路通过。用户明确回复“已更新”后，最后一次授权真实DeepSeek复盘**成功**，live双版本对照、实际剪贴板、用户编辑保存、页面刷新、真正后端重启及新浏览器读回均通过；真实结果隔离副本中修改确认稿后正确过期，正式成功稿保持当前有效。第一次认证失败仍原样保留，未把Stub当live，无自动重试。
- 本专项真实HTTP尝试2次（首次认证拒绝、更新Key后一次成功）；加历史1次，跨进程累计**3次、总授权上限已用尽**。本机`.test-runtime/video-review-live-budget.json`当前attempts=3，记录两次本专项调用前占用，无Key。不得以进程归零/修改额度文件继续调用。验收后已重启8000服务并设置**LLM_MAX_REQUESTS=0**，仅查阅/复制/编辑已有结果，不再收费请求；后续本机重启也须保留0，除非用户另行明确授权新预算。
- 用户更新后Key已安全保存，但模型名被旧设置页再次保存为空；按此前明确确认补deepseek-v4-pro并保留Key，没有以额外模型请求探测。最后一次真实响应证实该配置可用，配置configured本身仍不等于服务商有效性验证。
- 真实失败保存在当前用户数据目录`.test-runtime/browser/app.db`：video_id=`4d629787-5e9d-4c34-8dff-8c144e7b3d86`，review_id=`88e9cc9c-cdac-4f43-8439-e5f7b34e8e0d`，确认版本`d814f05e-2e7f-43e5-8c37-b3456c4df522`。state=failed、error=API_CONFIGURATION，ai_script为空；用户确认稿完整保留。服务商状态由适配器归类401/403，对外返回502；没有记录服务商原始错误或Key。

## 实际实现

1. backend/prompts/video_review.py独立Prompt版本`video-script-review-v1`；保原意、知识限定条件/逻辑/口播表达、未知待核实、不虚构事实/来源、不执行用户文本指令、只分析文本。模型只输出revised_script/change_summary/needs_verification；原始版本只由后端SQLite确认快照生成，时间只用原确认段。
2. backend/schemas.py新增ReviewVideo/ReviewChange/VideoReviewOutput/SaveReviewScript；建议稿1–16000字符、摘要最多3条且段ID必须真实、待核实最多10条；不接受模型时间戳、verified或多余字段，严格JSON重复键/截断/引用检查。
3. backend/services/llm.py将原HTTP行为提取为共用_complete，知识挑战原提示词/协议不变；新增review_video。共享Key/端点允许主机/锁/预算/60秒每阶段超时/128KiB响应界限/无重试，DeepSeek thinking disabled，复盘max_tokens4096。只有显式mock产生“开发Stub，非真实模型”；live失败不回退。认证/访问拒绝错误提示已在源码细化，不泄露Key或服务商正文。
4. backend/review_db.py、review_routes.py新增独立复盘存储和路由，main.py注册。POST /api/videos/{id}/review读取当前确认稿、检查expected_revision/transcript_version_id/consent；同命令成功重放不再收费，不同内容409、失败需主动新请求。GET /api/videos/{id}/reviews返回最近100份；POST /api/videos/{id}/reviews/{review_id}/script以复盘revision保存用户编辑，AI原始建议不覆盖、编辑历史追加。生成期间原稿改变则结果仍绑定旧快照，读取立即stale。
5. db.py增量Schema v3，仅新增video_reviews(id,request_id UNIQUE,video_id外键,data JSON)；v2升级前一次备份app.pre-review-v2.db，保留v1原备份。确认稿/原ASR不移表不覆盖，旧challenge/video数据不因迁移重写。重启running复盘标interrupted，不自动补发。
6. demo/js/store/api/app/views.js：现有视频页增加文字外发风险与目标、同意、主动按钮、未确认/缺配置/运行/失败/成功/过期、两栏对照、复制、用户编辑保存、折叠修改摘要/待核实/AI原始建议。摘要段跳转只用确认稿原时间；转写本地编辑立即标过期/禁止新复盘。输入/网络失败保留原稿和编辑，相同不确定请求保留ID。复用kc-grid，无CSS/首页结构/抽题/罗盘/音量代码改造。作品详情已有“打开视频与校对”入口可查看持久化复盘，原视频API不混入AI结果。
7. 新增tests/test_video_review.py、test_video_review_real.py、browser-video-review.cjs、demo/tests/test-video-review.js；既有test-video.js适配GET reviews夹具，test_video.py预期schema从2改3。新增docs/VIDEO_REVIEW.md，同步README/AGENTS、架构/复现/演示/ASR/demo README和本既有HANDOFF；所有旧章节保留。

## 实际测试与失败记录

- 共享LLM和视频初步回归：24 passed；复盘单测初次12通过1失败，是夹具断言错误地把第二份确认稿也限制为第一份原文，修正后**13 passed in1.84s**。包括同意/确认/Key/预算、Prompt输入不含媒体/时间、严格JSON/未知段/伪时间戳/多余字段、超时/网络/认证、幂等、不覆盖原稿/AI、用户编辑冲突、转写过期、生成期间原稿改变、v2迁移备份及中断。
- 完整`.venv/Scripts/python.exe -m pytest -q --basetemp=.test-runtime/video-review-regression-20261018`：**73 passed, 4 skipped in28.93s**。普通测试无用户Key或真实云端调用；MockTransport的mode=live不是实际收费成功证据。
- 最终demo目录全部**11个脚本exit0**，包括新增`node tests/test-video-review.js`：同意/原文、输出转义、复制、编辑切页保留、保存区分AI原稿、网络请求ID保留和转写过期。部分旧脚本仅打印，不当全部规则验收。认证提示细化后又执行tests/test_workflow.py与tests/test_video_review.py：**26 passed in3.57s**；backend/tests compileall及新增浏览器脚本/前端语法检查通过，git diff --check无空白错误（保留既有LF/CRLF提示）。私人视频、数据库和本机预算文件经git check-ignore确认被忽略。
- 新视频10118319字节，正式ASR44.6秒/5段；源文件SHA256=`77b9f6c5987030584946c27542411659c05503fb3550b2997f1cd4553298c9e4`。未修改源文件，不输出/提交口播正文。真实浏览器自动化校对只作文本编辑/确认机制验证，不声称完成知识人工核实。
- 不收费实际浏览器专项：设置LIANZHI_ASR_TEST_VIDEO为上述视频，LIANZHI_BROWSER_TEST=1，复用已有Playwright/Chromium148；`python -m pytest tests/test_video_review_real.py -q -s --basetemp=.test-runtime/video-review-browser-stub-fixed`：**1 passed in15.67s**。正式上传→真实ASR→确认→明确Stub复盘→系统剪贴板复制→用户编辑保存→转写新确认后stale→页面刷新→实际后端重启/新浏览器读取，全通过，page_errors=[]。证据在该目录test_actual_browser_asr_review0/review-evidence.json和review.png，均私有忽略。首次浏览器测试在剪贴板异步写入未完成时断言失败，修正为等待成功提示及Windows换行归一后通过，没有放宽文字内容相等要求。
- 真实服务前备份到`.test-runtime/video-review-live/20261018-222336/before-review.db`及旧挑战内容hash；同目录保留启动证据。Key已保存但模型名最初为空，按用户此前明确确认补deepseek-v4-pro，未读/回显Key、该设置操作不发模型请求。随后停本轮服务并以原`.test-runtime/browser`重启，已自动v2→v3，备份存在，旧三条挑战(id,data)hash不变。
- 真实浏览器命令`node tests/browser-video-review.cjs`，TEST_BASE_URL指向正式8000，TEST_EXPECT_MODE=live、LIANZHI_ALLOW_LIVE_REVIEW=1、指定持久化预算文件和新视频。正式流程上传/ASR/首段补句号并确认/勾选同意，实际模型请求返回502 API_CONFIGURATION。停止且无自动重试，未获得live建议/复制/保存的成功证据。

## 下一步与验收边界

用户明确回复“已更新”后的最后一次真实命令：设置TEST_EXISTING_VIDEO_ID=`4d629787-5e9d-4c34-8dff-8c144e7b3d86`、TEST_EXPECT_MODE=live、TEST_STALE_SOURCE=0及预算文件，运行`node tests/browser-video-review.cjs`。同一正式视频/确认稿，未重复上传或ASR，主动勾选同意并点击，DeepSeek deepseek-v4-pro返回真实建议稿**89字符、3条修改摘要、0项待核实**。0待核实不代表事实正确或已验证。success review_id=`fcc03335-3342-4fda-99cb-d60689a7c382`，origin.mode=live、Prompt=video-script-review-v1，page_errors=[]。实际复制AI稿、用户编辑版保存、原ASR不变、页面刷新通过，stale=false。安全汇总在`.test-runtime/video-review-live/live-evidence-final.json`，截图live-review-final.png；口播正文/Key不输出普通日志，不提交。

实际持久化验收：先以只读SQLite备份after-live.db及私有before-restart-records.json，再真正终止本轮服务的监听进程72696，原数据目录启动新进程（launcher76108），LLM_MAX_REQUESTS=0。health正常，已保存Key/模型自动恢复；HTTP视频记录与全部复盘记录逐字段相等。再次用全新Chromium的只读分支打开同视频，live原始/AI/用户编辑版读回通过，stale=false、page_errors=[]；未发模型请求。

真实报告过期验收：以after-live.db创建`.test-runtime/video-review-live/stale-copy`隔离副本，只复制该受控UUID视频，临时服务不配置真实Key。在副本对转写首段作修改并产生新确认版本，实际GET返回同一live报告stale=true，原文/AI建议均未改；全新浏览器打开副本确认过期状态，副本llm.live_requests=0。正式8000复盘记录与重启前快照仍完全相等，保持当前有效。证据`.test-runtime/video-review-live/restart-stale-evidence.json`。旧三条挑战hash及根目录源视频hash均未变，原认证失败记录仍在。

本轮授权的功能和上述实际验收完成，暂停等用户人工确认。无Windows打包入口或Release候选版，本轮无新运行依赖/未改打包路径，无法验证桌面包兼容。人工知识/来源核验、时间戳偏差、扬声器、其他硬件/浏览器未验。当前8000保持可访问、旧三条挑战与当前成功视频保留，默认另目录视频不合并；没有Git提交/推送、模型下载、sources/修改或外发媒体。授权额度3次已用尽，不再发任何真实模型请求。

---

# 2026-10-18 恢复旧记录显示（历史运行目录交接）

用户反馈连接拒绝后，曾启动默认数据目录，导致旧挑战记录未显示。随后用户要求显示旧记录：已备份两份数据库到`.test-runtime/data-directory-switch/20261018-215119/`，停止本轮启动的无运行转写任务服务，将8000服务改用`E:\Projects\KnowledgeCompass\.test-runtime\browser`。GET /api/health正常，GET /api/challenges实际返回3条；切换前后按(id,data)计算SHA256一致，三条旧记录未改变。默认目录仍保留1条视频，未合并/移动/删除。当前两份库已分别保留备份。

后续在项目根目录启动并继续显示这三条旧记录，须在同一PowerShell终端执行：

```powershell
$env:LIANZHI_DATA_DIR = Join-Path $PWD '.test-runtime/browser'
.\.venv\Scripts\python.exe -m backend
```

当前8000已有服务，勿重复启动；浏览器刷新后打开“我的知识作品”。`.test-runtime/browser`虽沿用历史目录名，当前保存用户旧记录，不得按临时夹具清理。源码默认路径未修改；不设上述环境变量会进入默认目录。没有调用收费AI或更改凭据/业务数据。

---

# 2026-10-18 视频上传64 KiB专项诊断与最小修复（历史交接）

本轮依据用户粘贴的专项任务，先读AGENTS/HANDOFF/README/demo README、架构/复现/ASR、相关前后端与测试，再建立真实HTTP复现后修改。保留此前未提交修改和所有历史章节；sources/只读，未触碰正式用户数据库/媒体、模型调用/Key或视觉文件。默认沙箱持续setup refresh had errors；经沙箱外执行只读/测试后可工作。浏览器连接工具同样启动失败，随后用已有Playwright和Chromium headless完成真实页面测试，无新增安装/模型下载/收费请求（历史收费仍1次，最多3次授权不续期）。

## 第一阶段诊断结论与证据

- 实际链路：demo/js/api.js的startVideo→fetch('/api/videos', File, Content-Type:video/mp4, X-File-Name/X-Request-Id)→本机Uvicorn→main.py local_only中间件→video_routes.py request.stream→UUID临时文件→受控PyAV探测→媒体改名/SQLite→独立POST transcribe返回202→后台受控ASR子进程→GET轮询→人工校对/确认→SQLite。视频不经过JSON/Base64/multipart，没有表单boundary、字段解析上限或SpooledTemporaryFile阈值。启动入口未见Nginx/Vite/pywebview额外代理，也没有桌面打包配置。
- 已证实缺陷：main.py原只豁免精确/api/videos，带尾斜杠/api/videos/先进入通用请求体缓冲，累计size > 65536时返回413，error.code=INPUT_LIMIT、message=“请求超过 64 KiB。”。因此恰好65536可过中间件，65537立即被拒，尚未进入上传校验或ASR。小于等于65536的尾斜杠请求最后被静态挂载返回405，未自动307跳转。不是Uvicorn的文件限额。
- 未证实部分：当前正式前端发送无尾斜杠路径；检查时8000端口无监听，无法还原用户原现场URL/旧服务代码。不能断言尾斜杠就是原现场唯一原因，也不能断言旧进程未重启。当前源码正常路径修复前就能接收1MiB。
- 最小方案及风险：增加同一上传函数的/api/videos/别名，并使中间件精确豁免两个已注册路径；继续由上传处理按声明长度和实收流计数限制100MiB。新别名从原405/413变为合法上传；若误把整个/api/videos前缀豁免会放大JSON限制，因此新增测试专门验证子路径与普通命令仍413。

实际Uvicorn+httpx修复前后（每行均对两路径测试，无隐私夹具，raw请求体无额外封装）：

| 文件/请求体字节数 | 原/api/videos | 原/api/videos/ | 修复后两路径 |
| --- | --- | --- | --- |
| 32768（32KiB） | 201 | 405 HTTP_ERROR | 201 |
| 64512（63KiB） | 201 | 405 HTTP_ERROR | 201 |
| 65536（64KiB） | 201 | 405 HTTP_ERROR | 201 |
| 65537（64KiB+1） | 201 | 413 INPUT_LIMIT | 201 |
| 66560（65KiB） | 201 | 413 INPUT_LIMIT | 201 |
| 131072（128KiB） | 201 | 413 INPUT_LIMIT | 201 |
| 1048576（1MiB） | 201 | 413 INPUT_LIMIT | 201 |

初次诊断命令通过Python调用tests.test_process.server，在新TemporaryDirectory内启动Uvicorn，以tests.test_video.make_mp4生成MP4，再加合法free box得到精确字节数；依次httpx.post两路径并输出status/error/history。无重定向，warning级别后端日志为空；不是已采集生产访问日志。修复后持久化回归命令与矩阵保存在tests/test_upload_http.py及.test-runtime/upload-regression-20261018/test_upload_http_boundaries_an0/boundary-evidence.json。

## 修改与保留的安全边界

- 生产逻辑只改backend/main.py一个条件、backend/video_routes.py一个路由装饰器；别名不重复显示OpenAPI条目。正式前端调用保持原样。
- 上传仍100MiB=104857600字节、有效MP4/音轨、0<时长≤180秒；不会把普通命令64KiB改成无限。实际二进制魔数/PyAV探测、UUID安全路径/独占写入、单上传锁、60秒上传超时、错误清理与磁盘失败提示均保留。转写提交与推理原本已分离，无新队列或业务重构。
- 新增tests/test_upload_http.py：真实HTTP精确边界、重试幂等、其他路径64KiB保护、Origin、实际100MiB及100MiB+1分块体、无效/空文件/无音轨/multipart拒绝、真实socket连接中断清理和锁释放。tests/test_video.py新增模拟ENOSPC磁盘满503及无残留断言。
- 新增tests/browser-video-upload.cjs，tests/test_asr_real.py增加显式启用的真实浏览器测试；新增scripts/make_upload_test_video.py离线生成无隐私中文H.264/AAC MP4，不覆盖已有文件。复用本机已有Huihui语音，不下载音色；Node/浏览器路径仅由测试环境指定，源码不含开发者个人绝对路径。
- 更新根README、AGENTS、docs/ARCHITECTURE、ASR、REPRODUCE、DEMO和本既有HANDOFF。AGENTS顶部补当前真实ASR状态及本次授权，保留下方历史门槛。SQLite schema/历史记录/LLM调用/密钥/前端动画视觉均未修改。

## 实际测试、失败记录与环境

Windows11/Python3.12.14，FastAPI0.143.3、Starlette1.8.0、Uvicorn0.54.0、PyAV16.1.0，Chromium148.0.7778.96（已有headless shell），small固定版本/CPU INT8。

1. `.venv/Scripts/python.exe -m pytest tests/test_upload_http.py -q --basetemp=.test-runtime/upload-http-20261018`：初版3项通过；后续同测试增加精确100MiB成功断言，在完整回归中通过。两个路径实际无Content-Length分块上传104857600字节201、104857601字节413 FILE_TOO_LARGE。普通命令/视频子路径65537字节413；跨站403；空内容400 EMPTY_FILE；无效内容422 UNSUPPORTED_MEDIA；无音轨422 NO_AUDIO；multipart415。中断连接无法取得客户端响应状态，实际确认临时文件消失、无数据库记录、后续上传201。
2. 无隐私测试视频：原创概率讲解文本由本机Windows Huihui离线合成、纯色画面，H.264/AAC/MP4含音轨。正式探测19.4秒、165610字节；素材生成脚本已实际运行，输出.test-runtime/upload-browser/reproducible-speech.mp4；不使用或修改根目录用户测试.mp4。
3. 已有真实CPU及静音测试命令：设置LIANZHI_ASR_TEST_VIDEO指向合成视频，运行`python -m pytest tests/test_asr_real.py -q -s --basetemp=.test-runtime/upload-asr-browser-20261018`：两项已有测试通过，新浏览器初版断言失败。真实CPU 5段、含69个中文字符，模型加载+推理5.139秒、峰值工作集696.0MiB，HTTP/正式前端脚本校对及实际服务重启一致；静音真实模型返回NO_SPEECH。
4. 浏览器工具失败及修复测试取证：CUA初始化setup refresh had errors；Playwright默认期望Chromium1234文件不存在，复用本机已安装1223目录的Chromium148成功，无下载。初版postDataBuffer/request.sizes不能可靠报告File体，两个取证断言失败；异步读取response.json又遇DevTools缓存驱逐，均未改业务代码或放宽预期。最终改为记录Network方法/路径/状态/Content-Type，并以服务端流式计数核对文件字节。浏览器未暴露Content-Length，证据记null，不伪造请求头。
5. 最终真实浏览器命令：设置LIANZHI_ASR_TEST_VIDEO为上述无隐私MP4、LIANZHI_BROWSER_TEST=1、NODE_PATH为本机已有Playwright包目录、LIANZHI_BROWSER_EXECUTABLE为已有Chromium；`python -m pytest tests/test_asr_real.py -k real_browser -q -s --basetemp=.test-runtime/upload-browser-verified`：**1 passed, 2 deselected in16.72s**。正式页面先上传伪MP4返回422并展示错误；静音MP4上传201后ASR失败，页面可见NO_SPEECH；正常MP4上传201，文件/实收均165610字节，ASR5段、5.14秒、峰值696.4MiB。编辑保存/确认、原稿不变、页面刷新、停后端/新进程/新浏览器读回均通过，page_errors=[]。截图已实际查看，见.test-runtime/upload-browser-verified/test_real_browser_upload_confi0/browser.png，同目录browser-evidence.json只含汇总、不含转写正文。
6. `.venv/Scripts/python.exe -m pytest -q --basetemp=.test-runtime/upload-regression-20261018`：59 passed, 3 skipped in24.17s。随后新增ENOSPC磁盘满独立用例，最终完整命令`.venv/Scripts/python.exe -m pytest -q --basetemp=.test-runtime/upload-final-regression-20261018`：**60 passed, 3 skipped in25.52s**（三项真实模型/浏览器需显式启用，已分别执行上文测试）。全套含知识挑战/Stub追问、MockTransport失败、密钥生命周期、SQLite/进程重启及视频兼容，未调用收费AI。新浏览器脚本node --check、backend/tests/新素材脚本compileall通过；git diff --check无空白错误，保留LF/CRLF提示。
7. demo目录运行`Get-ChildItem tests/test-*.js | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw $_.Name } }`：10个脚本exit0，含P0/视频/密钥/音效/抽题取消；部分旧测试仅打印，不能当全部规则验收。火焰/罗盘真实视觉本轮未单独验证，未改其代码。

## 未验证与交付边界

- 真实正式页面+本地ASR+SQLite闭环本轮已验收；原用户报错现场URL/进程仍未还原。若现有服务继续报64KiB，请保留Network原URL/响应，确认重启加载最新代码，不应继续盲目调大上限。
- 仓库尚未有Windows桌面封装/Release候选版，本轮未修改打包路径，不能声称打包版兼容；仅已验证Windows本机Web开发入口。新电脑可按REPRODUCE/ASR准备依赖模型并生成无隐私素材，其他硬件/浏览器/GPU未验。
- ASR每次加载模型、100MiB写盘及15秒媒体探测/60秒上传仍有性能边界；本轮不是3分钟整段性能基准。未人工测准确率或时间戳偏差、真实扬声器听感、复杂视频格式；无语音及失败仍须保留失败状态。
- 正式用户数据库/旧视频未写入；兼容验证使用隔离测试库和既有迁移用例，未冒称对用户全部历史记录逐条核验。无Git提交/推送、无发布。完成本轮后暂停等用户确认。

---

# 2026-10-18 真实本地视频转写闭环（历史交接，内容保留）

本轮最新用户任务明确授权MP4本地ASR、分段校对确认、SQLite和重启读取；另已明确授权仅下载Systran/faster-whisper-small固定版本。遵循先独立脚本真实验证再接FastAPI。此前“ASR未实现/仅Mock/Schema v1”是历史任务状态，当前以本节、README和docs/ASR.md为准；未修改旧DEC状态或AGENTS.md，不据此批准云端AI复盘等未做范围。

## 实际实现与修改文件

1. 后端：修改backend/config.py、db.py、main.py、schemas.py、services/asr.py；新增backend/asr_worker.py、process_guard.py、video_db.py、video_routes.py、services/video.py。视频上传按流100MiB上限，真实PyAV探测容器/视频帧/音轨/180秒限制，随机UUID安全路径；云端/密钥从不传给媒体子进程。单任务CPU INT8在独立子进程，提交/查询HTTP不等待整段推理；Windows Job Object随父进程退出回收，600秒推理/15秒探测/60秒上传超时。失败保存明确状态、无Mock替代或自动重试。
2. 前端：demo/js/store.js、api.js、app.js、views.js。复用视频页/表格/播放器/档案风格；真实HTTP模式选择MP4、上传/启动、处理状态、真实分段原文/编辑、保存草稿、确认快照、历史和列表重新打开；点击时间戳设置currentTime。未改变file://静态Mock。局部秒→毫秒格式转换，不修改旧fmtT或Mock时间轴。轮询结果仍running时不重渲染播放器；切页停止定时查询，旧回调按视频ID校验，不干扰挑战绘制。
3. 工程：新增requirements-asr.txt（包含基础requirements、固定ASR依赖）、scripts/download_asr_model.py、scripts/asr_probe.py；.env.example补LIANZHI_ASR_MODEL_DIR说明。基础requirements.txt沿用上一轮，无隐式模型下载。
4. 测试：新增tests/test_video.py（10项）、test_process_guard.py（1项）、test_asr_real.py（2项显式启用的真实测试）、frontend-video-http.cjs、demo/tests/test-video.js。现有挑战/密钥/音效等测试保留。
5. 文档：README.md、demo/README.md、docs/ARCHITECTURE.md、REPRODUCE.md、THIRD_PARTY.md、DEMO.md、SECURITY.md、docs/00–05增加当前事实覆盖说明，新增docs/ASR.md，更新本HANDOFF；保留历史与未批准DEC。

## 引擎、模型与环境

Windows11/Python3.12.14，Core Ultra7 251HX，18逻辑CPU、物理内存约15.37GiB；RTX5060 Laptop 8151MiB已检测，但本轮**仅CPU**、没有CUDA安装或GPU性能结论。
faster-whisper1.2.1、CTranslate2 4.8.3、PyAV16.1.0，其他精确版本见requirements-asr.txt；PyAV wheel含FFmpeg库，不依赖系统ffmpeg/ffprobe。实际安装新依赖时引入httpx2等，pip check通过，原LLM适配继续httpx0.28.1，原45项回归均保留。
唯一主模型Systran/faster-whisper-small，固定536b0662742c02347bc0e980a01041f333bce120，MIT，官方Hugging Face，公开文件486,215,847字节（约486MB）；实际下载后校验model.bin SHA256=3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671。默认models/faster-whisper-small被Git忽略，目录可用启动环境LIANZHI_ASR_MODEL_DIR指定，但不会接受不同权重冒充该版本。未下载其他大型模型；VAD来自引擎包自带Silero组件。未对FunASR做实际对比，选择理由是已验证CPU路径和最小部署成本，不宣称识别质量胜出。

## API、数据与隐私

新增GET/POST /api/videos、GET /api/videos/{id}、GET /api/videos/{id}/media（Range）、POST /api/videos/{id}/transcribe、POST /api/videos/{id}/transcript。上传为raw video/mp4+编码文件名/请求ID头，JSON命令沿用64KiB、版本/幂等/来源限制。状态uploaded/running/transcribed/failed/interrupted；无引擎、模型缺失、无音轨、格式/时长/解码/推理/写入/超时/空语音均显式失败。缺模型不阻止应用启动，不自动下载。停止/重启不自动重跑。实际受控子进程当前只支持Windows，其他系统不能宣称已验收。
SQLite schema v2：v1升级前保留一次app.pre-video-v1.db（不覆盖旧备份），增量事务新增videos和video_commands，原挑战四表/内容不重写。视频原件以videos/<UUID>.mp4存应用数据目录；只记录相对路径。ASR原稿独立version_id不可覆盖，draft为同序ID的编辑文字，versions追加完整不可变确认快照（UUID/序号/confirmed_at/based_on）；保存不同文字即撤销当前confirmed_version_id，历史保留。所有真实时间戳均秒。并发旧revision返回409，前端保留编辑；同命令重复不再识别/造重复确认快照。
音频仅进程内存解码，不永久写WAV；个人视频/转写/数据库/模型不入Git、不发云端。本轮视频删除/清理未实现，UI不会给持久化视频展示只改内存的假删除按钮。刷新可重新打开已入库/已保存稿，未保存编辑仍只在内存。未来AI必须引用不可变确认稿UUID、另获文字外发同意，并因当前稿修改/确认指针改变而将旧报告标过期；本轮无真实或Mock报告写入该路径。

## 实际验证与证据

用户将本轮新录制测试.mp4放项目目录并授权本地验收；源文件未修改，测试只复制到隔离目录；未将正文输出聊天、测试快照或提交文档。
- 最小脚本在API开发前实际执行：20.196533秒、18,716,423字节新MP4，真实视频帧/音轨；small/CPU INT8（无VAD初验）7段，加载+识别14.728秒，峰值进程工作集960.8MiB，输出仅.test-runtime/asr-validation/probe-1.json。
- 最终正式路径：同一新视频，small/CPU INT8/4主引擎线程/VAD，6段、含30个中文字符；加载+识别5.493秒，ASR子进程峰值工作集695.5MiB。自动化HTTP提交至前端校对保存约7.078秒，包含轮询/脚本动作，不能当人工操作速度或统一冷启动基准。
- 最后实际命令：设置LIANZHI_ASR_TEST_VIDEO为隔离视频路径，运行 .venv/Scripts/python.exe -m pytest tests/test_asr_real.py -q -s --basetemp=<全新隔离目录>：**2 passed in14.31s**。第一项真实HTTP上传→CPU后台识别（期间health可响应）→正式前端api/app/views代码加载/修改/保存草稿/确认（DOM替身）→SQLite→停后端/新进程→新的前端运行环境读回，原ASR不变、版本和媒体Range均通过；第二项实际静音MP4运行同模型，明确NO_SPEECH，没有用固定文字填充。
- 汇总证据不含正文：.test-runtime/asr-acceptance-358efdad/test_real_cpu_video_ui_confirm0/asr-evidence.json；该目录的数据库/媒体均为私有隔离测试数据，不提交。
- 常规 .venv/Scripts/python.exe -m pytest -q：**56 passed, 2 skipped in13.59s**；默认跳过两项显式真实模型测试，不自动下载/读用户视频。已单独运行上述两项通过，不把skip当通过。
- demo目录执行所有tests/test-*.js：**10个脚本exit0**；新视频脚本覆盖选择/raw上传/防重复、轮询切页、未变化查询不重建播放器、编辑跨页、确认/原稿、秒单位格式、seek赋值；旧部分脚本仅打印，不能称所有业务验收。新增真实HTTP前端脚本还用于上述真实CPU测试。
- pip check通过；全部demo/js/*.js node --check、Python compileall通过，git diff --check最终通过（LF/CRLF提示保留）。
- 模拟异常/真实容器单测：无音轨、伪装扩展名/损坏内容、181秒拒绝、流式超限、路径穿越、文件写失败、缺模型/引擎、重复上传/命令、全空确认/超长/旧revision、确认历史保留、推理失败、重启中断；推理替身明确使用test-substitute版本，不把它算真实模型证据。
- Windows Job Object实际启动自有sleep子进程，硬终止其父进程后等待确认子进程已退出；不操作其他用户进程。
- 历史兼容：只读SQLite连接备份 .test-runtime/browser/app.db 至 .test-runtime/asr-migration-2d4cb16b，副本v1→v2后3条历史挑战(id,data)逐字一致，v1备份存在，源库未写入。正式用户服务未被擅自终止/迁移，重启新代码时才升级其数据目录。
- git check-ignore确认源测试.mp4、models/model.bin与.test-runtime结果被忽略，Git跟踪列表无mp4/模型/数据库；无提交/推送。未发ASR云端或LLM请求，历史收费累计仍1次（上限3次授权不续期）。

## 本轮修正过的问题

初次PyAV19.0.1与faster-whisper1.2.1不兼容（metadata_errors被删除），锁16.1.0后真实验证通过；媒体异常在PyAV16不一定是OSError，worker显式归类FFmpegError；测试媒体封装要在写头前建好所有轨道，夹具修正后通过。新ASR秒单位与旧fmtT毫秒不符，以及running轮询重建播放器，均新增失败断言后作局部修复并通过。未修改旧Mock协议或动画。

## 火焰保护、未验证和验收入口

本轮基线8个文件（demo/index、CSS、compass.js、draw.js及prototypes/flame-compass四文件）SHA256逐一相同；beginDraw编排与原实现一致，音效/计时/取消回归通过。当前checkout正式入口仍加载compass.js，独立火焰文件位于prototypes；未擅自集成或覆盖，也不凭用户描述冒称另一份ZCode集成已在这里。真实浏览器火焰观感未验收。
浏览器工具再次初始化失败：node_repl kernel exited，windows sandbox orchestrator_helper_report_read_failed，setup_error.json解析失败。因此真实点击、375/768/桌面视觉、真实播放器/音频/seek尚未验证；DOM替身与Range测试不等于浏览器播放通过。
没有逐字人工参考稿，未计算中文CER，未人工测时间边界偏差；只验证含中文、顺序/边界合法、可编辑保存。弱音/VAD漏字、同音词、专有名词等仍需用户校对；不编造该样片具体错词或准确率。GPU、其他机器/系统、3分钟整段性能未验。公开FLEURS中文CC-BY-4.0资源链接及原创可自由朗读稿在ASR.md；本轮只核查公开包元数据，不下载整份语料，私人视频不能随GitHub分发。
新电脑按requirements-asr.txt安装、运行download_asr_model.py准备固定模型；应用仓库不携带开发者凭据/私人视频/模型缓存。当前开发机依赖与模型已准备。用户需重启正式后端加载本轮代码，再从“视频复盘”选择测试.mp4验收；后台服务未被我擅自杀停，默认用户DB升级发生在该次启动。下一阶段仅建议用户核对识别和时间戳、确认浏览器交互；云端AI复盘须另轮授权。本轮到此暂停。

---

# 2026-10-18 API Key 安全持久化与自动恢复（最新）

本轮按用户明确授权，仅优化密钥生命周期、设置页小范围交互与安全保护；以下旧章节中“Key仅进程内存、重启需重填”是当时状态，现以本节和docs/SECURITY.md为准。未改变旧DEC审批状态，未接ASR或其他功能。

## 实际实现与文件

- 新增backend/services/credentials.py：独立凭据读/存/删/是否配置服务，直接构造并校验官方keyring.backends.Windows.WinVaultKeyring，固定local machine持久化（值2），不调用后端自动发现，不允许第三方或明文降级；凭据按数据目录+端点哈希独立标识。Windows同一用户、同一路径重启可恢复；改数据目录不共享。不同端点不沿用旧内存Key。
- backend/main.py、services/llm.py：lifespan在目录锁内恢复非敏感配置/安全凭据；设置/删除共用原模型锁；删除先清内存、停用记住，再尝试系统删除；失败显式提示。启动不发测试请求，现有Prompt、同意门禁、live/example/mock、请求预算、模型调用业务不改。
- backend/schemas.py：设置新增可选remember_key、SecretStr长度上限2048；状态只返回配置/来源/是否保存/错误，不返回Key。旧客户端可不传新字段，首次仍只会话使用。
- demo/js/views.js、app.js、api.js：保留设置布局，增加记住选项、已保存/来源和错误；输入框标注输入即替换，同端点空值保留，提交立即清空且请求后释放临时body.api_key；删除防重复。取消勾选并应用会删除当前端点凭据、保留本次内存Key，按钮同时清会话和当前端点凭据；页面明确说明环境Key重启仍会恢复。
- requirements.txt：实际安装keyring25.7.0、pywin32-ctypes0.2.3（仅Windows）；传递依赖jaraco.classes3.4.0、jaraco.context6.1.2、jaraco.functools4.6.0、more-itertools11.2.1，锁定实际版本。
- 新增tests/test_credentials.py（23项实际用例）、demo/tests/test-credentials.js；tests/test_process.py扩展隔离环境和日志捕获，用于实际HTTP进程测试。
- 文档：README.md、demo/README.md、.env.example、docs/ARCHITECTURE.md、REPRODUCE.md、DEMO.md、THIRD_PARTY.md、02-技术方案与运行安全.md，新增docs/SECURITY.md以及本HANDOFF；保留历史记录，不修改已批准业务决策。

## 配置与安全边界

首次配置可选记住，后端系统凭据保存成功并读回校验才标已保存。非敏感配置原子写数据目录llm-settings.json，仅mode/endpoint/model/remember_key，无Key；Key不进SQLite、浏览器Store/localStorage/sessionStorage或普通日志。未发现旧版明文持久化代码，没有读取/迁移/删除用户旧Key。
启动优先级：LLM_API_KEY > 当前端点安全凭据 > 未配置；mode/endpoint/model分别由显式环境变量覆盖保存值，页面显式输入可替换当前会话。环境变量未由删除按钮修改，重启若仍设置会恢复，界面及文档均提示。
保存/读取失败不降级明文，保留本次内存Key并显示错误；保存失败禁用自动恢复，旧凭据可能残留，需重试/删除。删除失败也不宣称已删除；若非敏感配置文件亦不可写，旧记住状态可能仍在磁盘，明确提示。无Key/存储不可用仍可启动和本地学习/保存/看example。
默认仅允许api.deepseek.com的HTTPS/443及空路径或/v1，禁止userinfo/query/fragment/反斜杠/空白。其他主机须操作者启动前通过可信LLM_BASE_URL指定，网页不能扩大主机范围。默认监听127.0.0.1不变；设置POST只收JSON，Origin精确匹配/null拒绝，API拒绝Fetch Metadata cross-site/same-site，不开放CORS。本机CLI无来源头仍可用，这不是同一Windows用户下的恶意程序隔离。

## 实际测试与证据

Windows11/Python3.12.14/Node24.18.0，本轮不使用真实Key、不调用收费服务，累计历史真实请求仍1次、最多3次授权不变。
- .venv/Scripts/python.exe -m pytest -q：45 passed，1条既有Starlette/httpx弃用警告。
- .venv/Scripts/python.exe -m pip check：No broken requirements found。
- 在demo目录运行Get-ChildItem tests/test-*.js | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw $_.Name } }：9个脚本均exit0；旧部分脚本仅打印，不当作所有规则验收。
- 全部demo/js/*.js执行node --check通过；git diff --check通过（仅LF/CRLF提示）。
- 最终变更文件常见sk-/Bearer密钥模式扫描未发现匹配；仅使用明确的假测试token。该模式扫描不是对历史仓库任意格式秘密的完整证明。git diff确认backend/db.py无改动；未提交/推送。
- 真Windows系统凭据：临时目录派生随机隔离凭据名，保存假token→关闭进程→新HTTP进程恢复→替换假token→关闭/重启→读取新值→删除→关闭/重启→未配置；共四次服务启动，live_requests一直0。finally删除测试凭据并确认不存在，不触碰用户凭据。
- 覆盖环境优先、取消记住删存储但留会话、系统读取/保存/删除失败、配置文件失败、无明文降级、格式错误、坏存储值、不同端点不串Key、401认证失败不回显/不重试、Origin/Fetch Metadata/Content-Type保护。MockTransport验证替换后Authorization使用新值、删除后无法再发调用。日志/SQLite/配置检查不含两种测试token原文。
- 正式前端脚本+DOM/HTTP替身验证记住参数、立即清空输入、状态/错误转义、重复删除防护、页面/Store/localStorage无token。现有挑战HTTP/Stub/MockTransport/SQLite重启、视频Mock版本回归通过；不代表真实视频模型已实现。
- 首轮集成测试扫描Windows锁文件权限失败，调整为日志/数据库/配置扫描后通过；首次从根目录跑全部Node测试导致旧test-sound相对路径失败，改按README从demo运行9个全过，未改音效业务/旧测试。

## 未验证、兼容风险与下一步

浏览器工具此前因trusted Node/Windows sandbox helper初始化失败，真实设置点击/视觉/刷新本轮未验收；Node替身不是浏览器通过。未做Windows整机重启、其他机器/系统、新venv完整重装或真实收费认证请求；本轮真实服务认证失败仅MockTransport。Windows安全后端已经实际写读/跨进程恢复成功，其他系统只允许会话并显式报存储不可用。
SQLite Schema仍v1，无表/列变动、用户记录覆盖/删除；未修改backend/db.py、模型Prompt、音效、抽题或挑战流程。自定义endpoint现在必须在启动环境允许，旧任意HTTPS端点输入会被拒并明确提示；/v1与不带路径是独立凭据。
同Windows用户的恶意程序可能读该用户系统凭据；系统保管不等于应用进程隔离。应用运行时若在凭据管理器外部手工删除，不会同步擦除进程内存，请用应用删除或重启。仓库可以复现应用，不代表会携带开发者本机保存的密钥。评委需要使用自己的凭据。
工作区已有上一轮UI精简改动和未跟踪output/，本轮保留；未提交/推送Git、未启动新功能。下一步仅由用户重启正式服务加载本轮代码，再在工具可用时验收设置真实交互；本轮完成后暂停。

---

# 2026-10-18 设置与挑战档案精简（本轮最新）

## 授权与实际改动

本轮仅按用户要求精简音量控件与普通档案展示，沿用Ponytail最小改动；不改挑战流程、抽题、模型接口/Prompt、SQLite数据层或音效业务逻辑。
- demo/css/app.css：仅新增 #sound-volume 专用规则，宽度100%、最大240px、取消通用input的scale(1.25)、块级显示及局部边距。其他输入/滑动条样式不变。
- demo/js/views.js：音量容器允许收缩，去除原全宽内联样式，补label关联；默认25%、百分比、范围0–100、持久化与音效事件不变。档案卡标题改“讲解文案”，remoteRecordText增加includeOrigin参数；普通详情传false，仅隐藏“追问来源”JSON，保留原始解释、问题回答、修正历史、上方知识点/更新时间，以及独立live/mock真实性徽标。Markdown导出沿用默认true，继续带来源元数据；主动展开导出预览仍可见这些审计字段。
- demo/tests/test-settings-records.js（新增）：局部CSS声明、0/37/100音量/百分比、偏好重载、Tick/Lock合成调用、历史原稿特殊字符/多次修正/时间、live/mock/未调用标识、example标识和导出元数据不变。
- tests/frontend-http.cjs：更新卡片标题断言，新增普通详情不含来源区且保留mock标识断言。
- README.md、demo/README.md、docs/DEMO.md、HANDOFF.md：同步本轮展示行为和验证边界。

“追问来源”正文与真实性徽标是独立代码片段；本轮不删除徽标，不让Mock或预存案例冒充真实AI。来源仍保存在API/SQLite和Markdown导出中。未覆盖或删除任何历史原稿/修正/记录。

## 实际测试（2026-10-18）

- 新测试先执行失败（原CSS无240px上限），修改后通过。
- 项目根目录 .venv/Scripts/python.exe -m pytest -q：22 passed，1条原有Starlette/httpx弃用警告。包含实际HTTP子进程、新建/保存、重启读回。
- demo目录运行 tests/test-*.js：8个脚本均exit0；部分历史脚本仅诊断输出，不称全部业务规则验收。
- 新音量测试：实际音量input事件经原SoundFx逻辑，在0/37/100检查百分比与localStorage；重建前端运行环境后恢复数值。WebAudio使用替身，0不创建播放，37/100下Tick与Lock均完成合成并触发播放源。不是扬声器试听或真实浏览器音频测试。
- 档案Node测试：live、mock、未调用三类记录正文无“追问来源”/prompt_tokens；原解释、特殊字符转义、两个修正版本及更新时间保留；记录对象逐字序列化不变；导出保留origin；首页example预存标识保留。均为内存DOM。
- 历史SQLite真实兼容检查：以只读连接备份 .test-runtime/browser/app.db 至独立 .test-runtime/ui-records-随机ID；副本2条历史记录通过实际HTTP逐字段读取；新建一条解释后实际关闭/重启隔离服务，新旧记录均完整读回。正式前端API与视图读取副本中新旧记录通过（内存DOM）。sqlite_master全部结构定义及PRAGMA user_version在初始化/保存/重启前后相等，版本仍1。源数据库未写入/删除。检查脚本位于.test-runtime/ui-records-check.py与ui-historical-read.cjs，不提交用户数据。
- git diff确认backend/、sound.js、app.js未改，本轮无模型请求/依赖安装/服务端Schema变更。

## 未验证与风险

浏览器工具两次初始化失败：trusted Node进程退出，随后复现windows sandbox helper setup refresh had errors。因此375px、768px、桌面实际布局/溢出/滑动手感、真实浏览器刷新与扬声器试听均未验收；CSS范围/响应式声明与音量/重载逻辑通过测试，不等于浏览器视觉通过。
兼容性风险低：只改展示，旧记录不迁移；可选来源仍支持未调用状态。导出仍带技术来源信息是为保持追溯，不是普通正文回归。
下一步仅在浏览器环境恢复后人工验收三个宽度、音量0/中间/100与刷新；本轮到此停止，不启动其他功能。

---

# 2026-10-17 炼知MVP工程阶段交接（当前事实）

## 授权与完成边界

用户正式任务书已归档 docs/MVP_TASK_V1.0.md：明确授权本轮 FastAPI + SQLite + 既有前端、阻塞修复、最小AI挑战闭环与可复现工程；不批准全部旧PRD，也不批准完整ASR、桌面打包、主题重构或火焰原型集成。用户确认 DeepSeek deepseek-v4-pro / https://api.deepseek.com，最多3次真实请求；选择应用设置页输入Key，禁止在聊天索要Key。

**真实模型服务端闭环已验证，浏览器全流程仍未验收**：用户在设置页配置Key，健康接口确认已配置后，本轮只发送1次真实DeepSeek请求，成功获得针对新解释的追问；回答修正保存、实际进程终止重启后逐字段读回通过。随后正式前端API/详情/Markdown导出代码读取live记录通过（内存DOM）。真实收费请求累计1次，未重试。重启已清除Key；进程计数归零不是新的收费授权。浏览器自动化受环境初始化故障阻塞，不能以脚本测试替代实操验收。

## 分阶段实际完成

1. P0-A：输入超限前端门禁；FileReader代际保护/1MiB限制；后台读取成功/失败不重渲染其他页面，避免清空设置密码框；内置124知识点稳定UUID清单；同知识点关联使用knowledgeId；抽题视觉锁定后420ms仍可取消，旧挑战generation防回调串入新挑战。原B01/B02/B03保留并回归，不重复重写。
2. P0-B：FastAPI单worker仅127.0.0.1:8000，同源托管demo；统一输入/错误；SQLite首次初始化、目录锁、短事务、版本检查、幂等commands、模型jobs；数据目录可配置，无私人绝对路径依赖。
3. P0-C：HTTP模式复用界面，解释→针对性追问/回答→自主修正→SQLite→档案读取/导出。开发Stub明确标mock，预存协议夹具明确example，live真实响应需来源记录。旧Demo反馈/复核/脚本不参与此真实分支。真实DeepSeek服务端闭环已用1次请求验证，浏览器全流程仍待验收。
4. P0-D：requirements锁定实际环境，.env.example仅模板不自动加载；README/架构/API/复现/演示/第三方说明完成；AGENTS与docs00–05加本轮授权/历史提案说明，未把其他旧DEC整体标批准。已建立Git基线提交3ebb06a，工作分支codex/lianzhi-mvp，未创建远程或推送。

## 修改文件

- 前端：demo/index.html；demo/js/app.js、api.js（新增）、banks.js、draw.js、store.js、views.js、topic-ids.js（新增生成清单）。
- 前端测试：demo/tests/test-p0.js、test-store.js、test-store-2.js、test-vocab.js；新增test-stage1.js、test-api.js。原sound/compass/CSS未改。
- 后端新增：backend/__init__.py、__main__.py、config.py、db.py、lock.py、schemas.py、main.py、data/topics.json、services/llm.py、services/asr.py。
- 工程/测试新增：tests/__init__.py、test_backend.py、test_workflow.py、test_process.py、frontend-http.cjs；scripts/sync-topics.cjs、reproduce_check.py；requirements.txt、.env.example、.gitignore。
- 文档：README.md、AGENTS.md、demo/README.md、docs/00–05、HANDOFF.md；新增docs/MVP_TASK_V1.0.md、ARCHITECTURE.md、REPRODUCE.md、DEMO.md、THIRD_PARTY.md。
- sources/未修改；prototypes/flame-compass/未修改，独立视觉试验继续隔离。

## 数据与异步设计

活动挑战Store持有remote、remoteAnswers、commandIds、busy、error；回答字典无原型，防不可信题号访问Object.prototype。原草稿/倒计时归属不变。切页/新挑战不让旧请求修改新挑战；忙碌时阻止重复提交。AbortError与BUSY保留请求ID，便于重放而不重复收费。
SQLite topics/challenges/commands/jobs四表；保留原解释与修正版本，expected_revision防旧版本覆盖。模型调用事务外执行，单进程锁串行；重启将running标interrupted，不自动补发。Key只在后端进程内存，原文/模型不是可执行指令，无工具调用。
内置UUID在生成清单中持久保存，不随排序变化；用户库knowledgeId含词库ID与词条ID。用户词库仍在localStorage，正常旧数据/禁用标记保留；不迁移或删除用户缓存。SQLite仅本轮挑战，Mock视频仍在内存。

## 实际测试与环境

- Windows11 x64 10.0.26200；Python3.12.14（应用附带解释器建立venv；系统py无注册Python），SQLite3.53.1、Node24.18.0。精确Python依赖见requirements.txt。
- 根目录：.venv/Scripts/python.exe -m pytest -q → **22 passed，1条Starlette/httpx弃用警告**。
- demo目录运行tests/test-*.js → 7个脚本exit0（包含12组P0断言、限长/稳定ID、动画运行/锁定延迟/跳过取消、API AbortError/BUSY保留命令ID、后台文件读取保持其他页面DOM、词库/计时/音效）；部分历史测试仅打印诊断，不称全规则验收。
- tests/test_process.py实际启动loopback HTTP子进程；Node加载正式前端脚本，内存DOM收集输入→真实HTTP→Stub→回答修正→导出详情；终止进程再启动，原解释/修正状态/mock来源保持。不是浏览器自动化。
- 干净副本两次：.test-runtime/reproduce-1d29ee34（当时6个Node脚本）和reproduce-38dfe71a（最新7个脚本）；每次独立venv、requirements安装、22项pytest与全部Node exit0。仍为同一Windows硬件，不是另一评审电脑。
- MockTransport测试超时/网络/401/429/坏JSON/引用错误/额外字段/重复键，均无收费请求；测试假Key不写业务库。无Key失败不降级，example来源明确。测试只用隔离目录，不改真实用户localStorage/数据库。
- 浏览器：cua.createBrowserTab在初始化报node_repl kernel exited / windows sandbox helper setup refresh had errors，故真实点击、375px、剪贴板/下载和实际localStorage故障未验证。open_in_codex返回queued，不表示已打开或操作成功。
- 真实模型补充验证：记录f8ca510c-d6b7-44e1-84b7-ac44d845ab18，HTTP200，真实请求1次，未重试；UTF-8证据位于.test-runtime/live/request-1.json、saved.json、restart.json（不提交）。最初终端CP936显示乱码，重新以UTF-8读取证据确认中文原文和问题无损，非业务数据损坏。
- 正式前端脚本读取重启live记录、详情渲染、Markdown包含原解释/问题/修正验证通过；仍为内存DOM，未声称浏览器全流程通过。
- 未安装ASR/FFmpeg、未下载模型、未运行真实视频、未做GPU性能测试。

## 当前服务与下一步

当前本机8000服务已用相同.test-runtime/browser目录重启（非默认用户库），live模式、deepseek-v4-pro、官方endpoint；configured=false（Key按设计清除），当前进程计数0，但本轮累计实际请求1次。目录与证据不提交Git，不自动清理；后续使用需自行在设置重填Key，不再自动发起收费调用。
1. 已完成真实DeepSeek单请求、回答修正保存、实际重启读回；模型来源live/api.deepseek.com/deepseek-v4-pro，用量prompt253/completion138/total391。知识点“样本空间”，自编两骰子解释；追问针对把点数和当等可能的前提，based_on逐字校验通过。问题本身仍是模型辅助意见。
2. 环境恢复后做真实浏览器全流程与窄屏/计时/抽题切页/词库复制下载再导入复验；不能仅凭现有测试宣称前后端浏览器验收完成。
3. 用户验收本轮后才进入视频阶段：授权中文样片/模型下载，比较faster-whisper与FunASR（同素材、中文错误/专业词/时间戳/CPU/RAM/Windows复现/权重许可），再接确认稿和版本失效。
4. GitHub发布前确认项目开源许可、远程仓库和README独立机器复现；未擅自公开发布。

已知限制：列表最近500条；活动草稿不跨重启；中途记录暂无恢复编辑入口；SQLite未来迁移尚无破坏性迁移脚本；httpx60秒为每阶段超时非总时限；真实额度为进程计数，重启不续用户授权。

---

## 以下为历史交接记录（保留原文；旧“未批准/未实现”以本节当前事实为准）

# 交接文档（HANDOFF）

> 惯例：**每次会话结束前，更新本文档**（新增一行「更新记录」，并刷新「当前状态」「模块与数据」「下一步」）。新会话开始时先读本文档恢复上下文。

- 项目：选题罗盘（Knowledge Compass）· 2026 武汉 1024 AI 黑客松参赛作品
- 关键截止：作品提交 **2026-10-22 17:00**（内部目标 16:00 前提交）；报名截止约 10-20（指引有「20 日前 / 开放至 20 日」歧义，需官方确认，建议 10-19 前完成）
- 时区：本地时间（UTC+8）

## 更新记录

| 日期 | 会话 | 摘要 |
| --- | --- | --- |
| 2026-10-13 | ZCode 第 1 次 | 需求文档审阅；文档复制入工作区；创建演示原型 demo/index.html 与本交接文档 |
| 2026-10-13 | ZCode 第 2 次 | 汇总全部文档；提出「知识挑战配置抽题」仪式感设计方案（候选词条随机闪现→锁定一张，两方向：牌格抽签式/罗盘表盘式），待用户决策，未改动任何功能代码 |
| 2026-10-13 | ZCode 第 3 次 | 按用户产品化提示词重构 demo：拆分为 index.html + css/app.css + js/{mock-data,store,ui,draw,views,app}.js；首页改五屏落地页；实现抽题仪式（方案 A 牌格 + 指针锁定，修复 beginDraw 缺 step=1 的 bug）；统一状态标签体系与 Demo Mock 标识；题库扩至 8 词条（coin 富数据 + 模板）；浏览器烟雾测试通过主链路。**应用编码审批（DEC-01～07）仍未给出，demo 改进属界面原型迭代** |
| 2026-10-13 | ZCode 第 4 次 | 按用户增量任务改造 demo：新增 `js/vocab.js` Markdown 词库解析器（受控格式、错误带行号）；在 `store.js` 增加词库层（默认词库 + 用户导入 + localStorage 持久化）；`draw.js` 重写为减速抽题（屏幕中央单卡片、ease-out 三次曲线 60→400ms、约 16 次切换 / 4–5 秒、跳过 / 取消 / 重复点击保护 / prefers-reduced-motion / 单候选直落）；挑战 step 0 改造为词库 + 难度 + 预算 + 词条启用 + 池预览；步骤 2 题卡对导入词库做空字段兼容；事件委托补充 `ch:vocab / ch:vocab-del / ch:vocab-import / ch:vocab-clear / ch:diff / ch:term`。**词库仅由 localStorage 持久化，Codex 阶段替换为 SQLite；rich 数据仍仅 coin 词条具备。** |
| 2026-10-13 | ZCode 第 5 次 | UI 视觉刷新（用户指定 EVA 明日香 / 二号机配色）：`css/app.css` 调色板整体替换为单一暗色主题（炭黑纸面 #0f1013、二号机红 #e8402a、琥珀警告、绿状态色，删除明暗双主题切换）；顶部横幅加 EVA 黄黑警示条纹、页头红线；`html,body` 重置背景 + `overflow-x:clip` 消灭白边与横向滚动；新增 `.kc-tablewrap`（转写表格窄屏横滚）与 ≤600px 键值对堆叠断点、按钮 `:focus-visible` 焦点环。功能逻辑零改动。 |
| 2026-10-13 | ZCode 第 6 次 | Hallmark audit（1 critical · 7 major · 4 minor）全部修复：引用块由左侧 3px 色条改为 hairline + 色点标记；卡片内 5 处内联描边盒子统一为 `.kc-subpanel`（底色分层），锁定卡去边框改填充；「设计原则」改单卡三行定义式排版（`.kc-principle`）；暗底彩色光晕删除、罗盘辉光降至 token `--primary-glow`(.08)；新增 `--stripe-amber/--stripe-dark` token；`.kc-table/.kc-quote` 启用 `tabular-nums`；🧭 emoji 换 SVG 罗盘记号（`.kc-mark`）；h1/节标题字重 800；删英雄区 eyebrow；导航 nowrap；删除旧牌格动画死样式（`.kc-tile*/.kc-pointer*`，含回弹缓动）；页脚版本号同步 v1.3。Node 校验 16 项全部通过。 |
| 2026-10-14 | Codex | 按用户本轮明确授权，仅为前端 Demo 增加学习倒计时与 Markdown 范例查看/复制/下载；更新相关测试和本交接文档。此授权不改变 PRD 或后端决策状态。 |
| 2026-10-16 | ZCode 第 7 次 | **V2 词库需求**：新增 `js/banks.js`（C 语言 10/12/10 · 心理学 10/10/10 · 哲学 10/10/10，受控 Markdown），注册为内置词库（`__bank_c__/__bank_psy__/__bank_phil__`，统一经 VocabParser 解析，范例与内置数据同源）；范例区改三库切换 + 复制 + 下载；`store.js` 持久化改为仅存用户词库（内置每次从代码重建，防旧缓存冻结）；移除 vocab.js 旧 9 条 VOCAB_EXAMPLE。需求映射澄清：「已有 C 语言词库」实为旧 9 条示例；「语言学词库」从未开发；无 FastAPI 后端（真实规划 Streamlit+SQLite）。修复 test-store-2 既有 require.resolve bug；浏览器实测三库抽题/范例/兼容性通过。 |
| 2026-10-16 | ZCode 第 8 次 | **词库质量重构 + 倒计时视觉放大**：①「演示题库（默认）」（`__default__`，8 条按索引分档）重构为**概率论**（`__bank_prob__`，10/10/10，概率直觉/悖论/统计推断选题），加载时将遗留 `activeVocabId='__default__'` 重映射，旧内置条目按 builtin 跳过，用户词库不受影响（浏览器实测：旧格式 localStorage 重载后用户词库保留、活动词库落到概率论）；store.js 移除 buildDefaultVocab。②心理学改为经典效应导向（巴纳姆/聚光灯/锚定/认知失调/斯特鲁普等 10/10/10）、哲学改为思想实验与悖论导向（忒修斯之船/电车难题/缸中之脑/纽科姆问题等 10/10/10）、C 语言提高实操错误类概念比例（空字符/数组越界/未定义行为/内存对齐等，10/12/12）；coin 与「相关不等于因果」两词条映射回 MOCK.pool 富数据。③倒计时改为视觉焦点：桌面 72px / 窄屏 48px、tabular-nums、进度条 + aria、按钮 44px 触控高、结束文案「学习时间结束，现在试着用自己的语言解释这个知识点。」；计时状态机零改动（node 断言 + 浏览器全按钮流实测含时间快进结束态）。④范例区扩为四库；档案领域下拉改为从词库动态生成（修复写死「概率统计/AI 基础」）。测试：node 4 库解析/计数/ID 稳定/coin 映射/legacy 重映射全过；浏览器改名/四库抽题/难度筛选（概率论 30/进阶 10）/范例/倒计时/375px 无溢出全过。教训：浏览器普通 reload 会命中旧 js/css 缓存，需 fetch(cache:'reload') 预热后 reload。Hallmark 纪律核对（焦点层级/tabular-nums/无闪烁/触控目标），Ponytail 最小改动。 |
| 2026-10-16 | Codex 基线与增量质量检查 | 通读 docs/00–05、Demo 全源码及测试；8 JS 语法通过，3 现有 Node 脚本 exit 0，但发现测试选错内置库/多项无断言；新增 14 组隔离诊断，验证四库 124 条、正常缓存迁移、计时和范例 Blob，复现 P0 缓存覆盖/丢编辑/转写未失效等。只同步文档与新增审计资料，未修业务代码、未安装/下载/调用 API。FastAPI 为待批准候选，DEC 状态未变。 |
| 2026-10-16 | ZCode 第 9 次 | **抽题音效集成（ZzFX）+ 抽题生命周期修复**：新增 `js/sound.js`（ZzFXMicro v1.4.0 MIT 内嵌，惰性 AudioContext + SoundFx 封装：tick 45ms 节流/lock 恰一次/开关音量持久化/静默失败/手势解锁）；`draw.js` finish(reason) 语义化（done/skip/cancel/fallback）+ onTick/onLock 回调，动画主体零改动，cancel 不再触发锁定音与重渲染（修复 B05）；修复 views.js 单候选/reduced 被 `pool.length>1` 短路不进动画模块的隐藏 bug；app.js 接线 + 设置页音效卡。测试：node 全绿（新增 tests/test-sound.js）+ 浏览器 10 项验收全过。未验证：实际听感、pywebview、真实桌面浏览器。 |
| 2026-10-16 | ZCode 第 10 次 | **音量修复 + 罗盘动效**。①音量真实原因（先复现取证）：滑条/持久化/label 本身正常，问题是默认 50% 偏响 + **Tick 基础增益 .25 vs Lock .6（同一滑条下 Tick 峰值仅 Lock 的 42%，低音量下 Tick 消失，即用户感知的「音量控制不符预期」）**；修复=默认 25%、Tick .55/Lock .7 档感平衡、保持单一线性映射（遵守不叠加公式）、新增 `effectiveGain()`；0% 静音、25/50/75/100 单调、100% 峰值≤0.7 无削波（node 断言 + 浏览器五档实测）。按用户中途要求**音色机械化**：Tick 改锯齿高频下滑（继电器滴答）、Lock 改方波上滑（金属咔哒）。②首页罗盘：纯 CSS `kc-needle-spin` 15s/圈仅指针旋转，reduced-motion 静止，视图切换 DOM 重建即停止。③抽题罗盘：新增 `js/compass.js`（rAF 指针，转速∝1/切换间隔，初 300°/s→末 45°/s），draw.js 仅参数化 `onTick(i,total)`（主体未动），app.js 接线 onTick/onLock/onDone；不参与抽题结果、无第二套计时器；连点/重渲染先 destroy 旧句柄。验收：正常减速（speed 146→68 实测）、跳过/切页取消/连点/单候选/reduced（静止 speed=0）/静音（罗盘照转、gain=0）/375px（sw=360）全部通过；**前台视觉旋转早期采样 110°/s 已证，收尾时 IAB 面板 visibilityState=hidden 角度冻结（rAF 规范行为，反证不可见零开销）**；实际听感与 reduced-motion 的 CSS 分支未自动化验证（标注人工试听/检查）。Hallmark 用于罗盘布局取舍（上方小仪表 vs 背景大罗盘，选前者：不遮挡、移动端稳）；Ponytail 最小改动。对 Codex 影响：音效偏好键不变；compass.js 为纯展示层可整体复用或替换。 |
| 2026-10-16 | Codex P0 修复 | 按用户明确授权修复 B01/B02/B03：逐条恢复与异常缓存写保护、词库写失败回滚；现有 Store 保存解释/回答/修正/脚本草稿；转写编辑即撤销确认、冻结确认快照、按版本保留示例报告与历史查看/保存门禁。保留既有音效/罗盘与 Mock 边界。新增 test-p0 12 组正向回归，修正 test-store 误选内置库；5 个测试脚本 exit 0，10 JS 语法通过。真实浏览器未验；未启动 D0/后端，DEC 未变。 |

## 当前状态（2026-10-16 P0 修复后）

- 当前是静态交互 Demo：概率论 30、C 语言 34、心理学 30、哲学 30，合计 124 条；只有名词库，不等于审核知识卡。真实 Python 应用、FastAPI/Streamlit、SQLite、LLM/FFmpeg/ASR、无 Key 历史案例双入口尚未实现。
- 文档完整报告：[项目基线与增量质量检查](docs/audits/2026-10-16-项目基线与增量质量检查.md)。包含功能矩阵、B01–B12 文件行号/复现/整改建议、文档冲突、FastAPI 风险、D0 条件与下一轮验收。
- B01/B02/B03 已修并通过 Node 正向回归；当前行为见 [P0 修复记录](docs/audits/2026-10-16-P0修复记录.md)。坏缓存保留原值并暂停词库写入、可浏览已恢复库；写失败回滚并报错；内存草稿跨渲染；修改确认稿立即失效，旧确认快照冻结、旧报告按原版本保留，可确认/保存新结果。
- 遗留重要项：输入长度上限、稳定知识点关联、FileReader 乱序、其余测试断言；B04 的新稿重存路径已随 B03 修复，建议采纳变更后的保存仍待 P1。B05 另有第 9 次后续改动，本轮保留，不作扩大修复声明。
- 本轮验证为 Node/内存替身，不是浏览器验收。第 7/8 次浏览器通过声明保留为历史，未获取独立证据附件，也未本轮重验；实际剪贴板、落盘下载导入、375px/其他宽度、失焦与动画交错仍需复验。
- 本轮实际修改：demo/js/{store,app,views}.js、demo/tests/test-store.js；新增 demo/tests/test-p0.js；同步 README/AGENTS/HANDOFF/demo README、docs/00/03/04/05 与审计历史提示，新增 P0 修复记录。未改 CSS、词库/解析器、音效/罗盘/抽题代码、后端或 DEC；整体 PRD/架构仍待批。
- 后续影响：可复用当前内存草稿和转写版本边界，但并非协议 v1.0/SQLite 的完整实现；仍需稳定知识身份、异步失败保护和持久化。D0 安装/下载/真实 API 及后端未获本轮授权，等待下一阶段决定。

## 仓库结构（当前，v1.3）

```text
E:\Projects\KnowledgeCompass\
├─ HANDOFF.md          # 本文档（每次会话结束更新）
├─ README.md           # 实际 Demo 与真实应用未实现状态；整体 PRD/后端待批准
├─ AGENTS.md           # AI 编程协作约束（阅读顺序、批准门槛、范围限制）
├─ docs\               # 权威需求文档（00–05，自 codex 项目目录复制）
│   ├─ 00-文档约定与决策.md
│   ├─ 01-产品需求文档PRD.md
│   ├─ 02-技术方案与运行安全.md
│   ├─ 03-数据模型与AI协议.md
│   ├─ 04-验收与测试计划.md
│   └─ 05-开发任务与赛事演示.md
└─ demo\               # 演示原型 v1.3（纯静态，双击 index.html 或 python -m http.server）
   ├─ index.html       # 骨架；vocab → banks → mock-data → store → ui → sound → compass → draw → views → app
   ├─ css/app.css      # 全部样式；调色板集中在 #kc-root 变量块（EVA-02 暗色主题 + Hallmark audit 修复）
   ├─ js\
│   ├─ vocab.js     # ★ Markdown 词库解析器（受控格式；parseVocabMarkdown / countByLevel / VOCAB_LEVELS）
│   ├─ banks.js     # ★ 四库 Markdown 共 124 条 + buildBuiltinVocabs 注册
│   ├─ mock-data.js # 旧 8 条池数据；当前仅 coin/corr 映射题卡，coin 富数据 + 模板
   │   ├─ store.js     # ★ 状态树 S + Store 业务动作（词库 CRUD + filterPool/pickDraw + localStorage 持久化）
   │   ├─ ui.js        # 纯工具：esc / fmtT / tag / st / mockTag / now
   │   ├─ sound.js     # ★ 抽题音效：ZzFXMicro v1.4.0（MIT）内嵌 + SoundFx 封装（开关/音量/持久化/节流/降级）
   │   ├─ compass.js   # rAF 抽题罗盘展示层（保留用户现有改动）
   │   ├─ draw.js      # ★ 减速抽题动画（runDrawCeremony → { cancel }；DRAW_ACTIVE 集中管理）
   │   ├─ views.js     # 各视图渲染（只读 store/mock，无业务规则）
   │   └─ app.js       # 入口：render 循环 + 事件委托 + bindFileInputs + beginDraw 编排
   └─ tests\           # Node 验证脚本（不参与浏览器运行时）
       ├─ test-vocab.js      # 解析器 13 边界用例 + 30 词全量用例
       ├─ test-store.js      # 词库层 / 池过滤 / 抽题去重 / 持久化
       ├─ test-store-2.js    # localStorage 恢复 / 往返
       ├─ test-sound.js      # 音效降级 / 偏好 / 音量映射
       └─ test-p0.js         # B01/B02/B03 正向回归 12 组，按实际脚本顺序加载
```

## 运行方式

- 双击打开 `demo/index.html`，或在 demo 目录 `python -m http.server` 后访问。零构建、零依赖、零网络请求。
- 用户词库和活动 ID 由 localStorage（键 `kc.vocabs.v1`）持久化；四个内置库从代码重建。异常恢复进入写保护、保留原缓存，已恢复词库可浏览；缓存需先备份后由维护者处理，不能自动覆盖。写失败回滚并提示。活动抽题 / 倒计时 / 草稿 / 作品 / 复盘历史仍在内存，刷新后重置。

## 模块职责与关键设计

| 模块 | 职责 | 关键约定 |
| --- | --- | --- |
| `vocab.js` | 受控 Markdown 解析：`#` 一级标题=词库名（仅一次）；`##` 仅限「入门/基础/进阶」；`- ` 列表项=词条；同词库查重；错误带行号 | 解析规则如需扩展（更多难度档）改 `VOCAB_LEVELS` 并同步后端协议；保留为前端校验层 |
| `store.js` | 唯一状态树 `S` + 全部业务动作；词库层（默认 + 导入）；候选池过滤；抽题（先定结果） | `S.ch.locked` 格式为 `vocabId:termId`；词库数据经 `persistVocabs/loadVocabsFromStorage` 读写 localStorage |
| `draw.js` | 单卡片减速抽题、16 次切换累计约 4.95s、正常锁定另等 420ms | 结果先定；render 调 cancelAllDraws，但取消仍排完成回调，锁定等待期间登记也有缺口（B05） |
| `views.js` | HTML 模板、筛选与状态派生展示 | 导入库空字段提示；同题候选按标题筛选而非稳定 ID；转写有效性检查不完整 |
| `app.js` | render 循环、事件委托（`data-action`）、文件输入绑定、抽题编排 | 每次 render 后 `bindFileInputs()` 重挂 change 监听；file input 读完即 `value=''` 支持重选同文件 |

## 数据结构与存储（v1.3）

```js
// 词库（默认 + 导入同构；localStorage 持久化，键 kc.vocabs.v1）
vocab = {
  id: string,            // __bank_prob__/__bank_c__/__bank_psy__/__bank_phil__；用户库为 vocab_<ts>_<rand>
  name: string,          // 内置四库名称；导入取 .md 一级标题；默认='概率论'
  builtin: boolean,      // 默认词库 true（不可删、词条不可单独禁用）
  importedAt: ISO string,
  terms: [{
    id: string,          // 内置=序号+标题哈希，调整顺序会变；不能直接充当稳定知识点身份
    title: string,       // 词条显示名
    level: '入门'|'基础'|'进阶',
    enabled: boolean,    // 仅导入词库可切换
    richId: 'coin'|null, // 有富演示数据的标记（现阶段仅 coin）
    original: object?    // 内置 coin/corr 映射 MOCK.pool 题卡，其余内置生成占位字段；导入通常无此字段
  }]
}
// localStorage 值：{ vocabs: [仅用户库（剥离 original）...], activeVocabId: string }
// 旧 activeVocabId='__default__' 映射至 '__bank_prob__'，内置数据从代码重建

// 抽题锁定
S.ch.locked = '<vocabId>:<termId>'   // 经 Store.getChItem() 反解为 pool item
// pool item：{ id, title, domain(=词库名), level, minBudget, vocabId, termId, richId, goals?, prereq?, task?, misconception?, src? }

// 候选池规则：活动词库 ∩ enabled ∩（难度='all' 或等于所选难度）；全部 minBudget=0，预算对所有库均不参与过滤
```

## 已实现（真实交互）vs Mock（演示数据）

P0 修复后的状态归属：`S.ch.draft` 保存未提交解释/回答/修正，`scriptMd` 保存脚本编辑，只有显式提交才更新 submitted 字段；`S.vocabStorage` 记录 blocked/error。`S.rv.segs` 是当前草稿；首次修改确认稿令 version+1、confirmed=0；`transcriptVersions` 追加冻结确认快照；`reportVersions` 存对应确认版本的独立 Mock 快照，`reportOn` 选择当前查看报告。保存档案复制历史，草稿/历史均不跨刷新持久化。

| 能力 | 状态 |
| --- | --- |
| 导航 / 五屏首页 / 步骤条 | 真实交互 |
| Markdown 词库导入（预览 / 行号报错 / 查重 / localStorage 持久化 / 删除 / 活动词库切换） | 真实交互 |
| 难度筛选（全部/入门/基础/进阶）、词条启用切换（仅导入词库）、池预览、空池禁抽 | 真实交互 |
| 减速抽题动画 | 真实交互；取消仍回调，未达到完整取消保障（B05） |
| 挑战 9 步状态机（空值拦截、字符计数、同意门禁禁用 AI、跳过记证据缺口、脚本可编辑标记） | 状态机真实；内容见下 |
| 学习阶段倒计时（3/5/10 分钟、暂停/继续/重置、离页暂停、时间戳计时） | 本轮新增；状态在 `S.ch.learningTimer`，仅作用于学习步骤；不自动推进；刷新不持久化 |
| Markdown 词库范例（四库） | 同源 BUILTIN_BANKS；Node 验证复制传参/下载 Blob UTF-8 字节/解析与 Store 导入；真实剪贴板、落盘下载和文件选择导回本轮未验 |
| 复盘 4 步 | 转写/报告为 Mock；编辑立即撤销确认，确认快照冻结、历史报告保持绑定，未确认不能生成/保存当前报告；历史可查看；全部内存态 |
| 档案 | 内存交互，刷新丢失；关联只按标题，缺稳定知识点 ID；Markdown 仅文本展示/复制；媒体删除只是布尔标记 |
| AI 追问 / 反馈 / 修正复核 / 科普脚本 | **Mock**：coin 用 docs/03 协议示例富数据（MOCK.chCoin）；其余全部 MOCK.tmpl 模板，标 Demo Mock |
| 四库题卡来源、ffprobe/FFmpeg/ASR、媒体信息、复盘报告 | **Mock**；124 条名词可真实解析，但不是 124 个审核知识卡 |

## 测试记录（保留历史，当前以末尾核对结果为准）

以下旧记录对应当时版本，不可当作当前基线或本轮复验；尤其“全量 30 词”“用户库禁用”“不可变版本”“全部取消”需以本轮证据纠正。

- `node --check`：js/ 全部 7 个文件语法通过（每次改动后复跑）。
- 解析器（tests/test-vocab.js）：13 个边界用例（空输入、无 H1、非法难度档、重复词条、词条先于 H1、无 H2、空列表项、双 H1、尾随空白、CRLF 等）+ 30 词全量用例，全部符合预期。
- store 层（tests/test-store.js / test-store-2.js）：默认词库 3/3/2 分档；池过滤（全 8 / 入门 3）；导入 → 切换 → 锁定 `vocabId:termId` 反解；词条禁用 → 池收缩；`pickDraw(excludeId)` 去重 8/8；localStorage 写入与恢复往返、活动 ID 回退默认。
- 抽题时长：60→400ms × 16 步 ease-out 三次 = **4949ms**（在 3–5s 目标区间）。
- Hallmark audit 修复核验：16 项自动检查全 PASS（色条/死样式/eyebrow/回弹/离册色值/光晕清除；新 token/subpanel/principle/mark/tabular-nums 存在）；CSS 花括号 141/141 平衡。
- HTTP 资源探测：`python -m http.server` 下 index.html 与全部静态资源 200。
- **未执行**：真实浏览器逐宽度（320/375/414/768）实测；同知识点正例关联/解除（低风险内存操作，逻辑已两次走查）。
- 2026-10-14 本轮：Node v24.18.0 下 7 个 JS `--check` 通过；`test-vocab.js` 与标准范例解析断言通过；`test-store.js` 新增倒计时状态/时间戳边界断言通过。`test-store-2.js` 本次执行仍因第 74 行 `require.resolve('js/store.js')` 找不到模块而失败，尚未改动该既有测试脚本。
- 2026-10-16 第 7 次：`test-store-2.js` 路径 bug 已修（`../js/store.js`），三测试适配 banks.js 后全过（内置三库解析/计数 8–12/ID 稳定；store 4 内置词库注册；localStorage 往返 + 非法难度档过滤）。浏览器实测（http.server 127.0.0.1）：见更新记录第 7 次行。**此前遗留的浏览器验证项**（范例复制/下载按钮存在与点击、375px 无溢出）本轮已覆盖通过；倒计时切页暂停/失焦时间戳/快速连点、320/414/768 宽度仍未实测。
- 本轮尝试浏览器验证时，浏览器策略拒绝 `file://` 本地页面，并禁止通过替代路径绕过；因此 UI 点击、复制剪贴板、实际下载文件、375px 布局、切页/失焦计时行为尚未做浏览器验证。范例内容通过当前解析器单测，不等同于已验证下载文件的浏览器导入。

### 2026-10-16 Codex 本轮实际执行

- Node v24.18.0；8 个运行 JS `node --check` 通过；demo 目录三个既有测试均 exit 0，之前 test-store-2 路径错误已修，不再列为待修。
- 现有 test-store 的 `[1]` 已指向内置 C 库，禁用操作未生效但无断言；test-vocab 13 个边界样例多数仅打印，“30 词”夹具实际 29。不能声称所有核心规则测试通过。
- 项目根目录 `node docs/audits/check-2026-10-16.cjs`：14 组隔离诊断执行完成（5 组正常路径、9 组确认问题/限制）。四库分档/池/抽题锁定、正常缓存迁移保留用户与禁用标志、计时生命周期、范例复制传参和下载 Blob UTF-8 字节导回解析/Store 通过；OBSERVED 项确认 B01–B09/B11 等缺陷，**不是修复通过**。
- PATH 中发现 Node 和 py 启动器；`py --list-paths` 显示无已注册 Python，PATH 未发现 ffmpeg/ffprobe。未检查其他安装路径；无真实依赖/媒体/API/数据库验收。
- 未重跑浏览器测试；历史浏览器声明保留但未见独立证据附件。本轮只用隔离内存，不接触真实 localStorage，未安装依赖/模型或付费调用。

## 已知问题与限制

### 2026-10-16 P0 修复实际验证

- Windows PowerShell / Node v24.18.0；10 个运行 JS 语法通过；demo/tests 五个 test-*.js 均 exit 0。
- 新增 `node demo/tests/test-p0.js`（项目根目录）12 组通过：坏缓存/读写失败、回滚/预览重试、正常旧库重载、特殊字符草稿/脚本/示例跨渲染、新挑战清空、确认快照/编辑立即失效/全空门禁/历史报告/新旧档案、同意门禁、计时单实例与切页暂停。
- test-store 已修正用户库定位，并新增禁用和候选池断言；test-vocab 的部分旧检查仍只是打印，不能称全套规则已验收。修复前 OBSERVED 脚本保留历史，不再作为当前回归入口。
- 未做真实浏览器、布局、剪贴板或真实 localStorage 故障测试；未做 D0/真实 API/ASR/数据库。没有安装依赖/下载模型/付费请求。

1. （已解决，2026-10-16）默认词库难度分档硬编码 → 概率论词库改为 Markdown 三级结构。
2. 导入词库仅含词库名与词条标题，无学习目标/前置/任务/来源/误解；题卡对应字段留占位。后端需按知识点 ID 关联补齐。
3. （已解决，2026-10-16）档案「领域」筛选下拉写死 → 改为从词库列表动态生成。
4. 学习时间预算对所有内置/导入库均不参与过滤，池项 minBudget=0；不是“仅默认库有语义”。
5. 未在真实浏览器做 320/414/768 逐宽度实测（375 已测通过）；「写死难度档若扩展需同步 vocab.js 与后端协议」。
6. `MOCK.pool` 中 3 条 AI 词条（hallu/embedding/overfit）自概率论重构后不再进入任何词库，保留在文件中供 coin 流程与模板复用；Codex 接入时可清理。
7. 倒计时「失焦时间戳准确性、快速连续点击」等边界仅 node 断言，未做浏览器实测。
8. B01–B03 本轮已修并通过 Node 回归，浏览器复验仍待做。原审查报告保留修复前证据，不将其旧结论当当前未修状态。

## 待用户决策（阻塞编码，见 docs/00 §5）

| 决策 | 状态 | 备注 |
| --- | --- | --- |
| DEC-01 P0 范围 | ⏳ 待批准 | 建议同时预授权 32h 压缩档（题库 6–8 卡） |
| DEC-02 单机单用户 | ⏳ 待确认 | 建议按基线通过 |
| DEC-03 知识领域 | ⏳ 待确认 | 概率统计 + AI 基础，先审核少量来源 |
| DEC-04 模型服务商/预算 | ⏳ 待确认 | 建议 10-15 前定，阻塞真实 API 不阻塞 T01–T03 |
| DEC-05 设备条件 | ⏳ 待实测 | 由 T01（D0）回答 |
| DEC-06 媒体边界 | ⏳ 待确认 | 100 MiB / 300 秒 / 普通话 |
| DEC-07 留存方式 | ⏳ 待确认 | 媒体仅本地、可单独清理 |
| DEC-08 赛道与报名 | ⏳ 用户行动项 | 单人参赛资格需向官方群确认；尽早报名 |
| DEC-10 开源许可 | ⏳ 待确认 | 建议 MIT；阻塞公开发布不阻塞开发 |

## 下一步（建议顺序）

1. 已完成获批的 P0 数据/版本修复；建议下一轮先浏览器复验，再由用户决定是否授权 D0 和剩余 P1。确认是否采用保留前端 + FastAPI + SQLite 替代旧 Streamlit 方案；现有 Demo 授权不代表整体 PRD/后端已批准，不得代改 DEC 状态。
2. D0 前确认模型服务/预算/外发、目标设备/安装与模型下载、授权样片/媒体边界及留存；获批后真实 API 与 ASR 各做最小技术验证，再以实际工时重排。建议少量 6–8 张审核知识卡，不把 124 条名词池当来源审核完成。
3. 与官方渠道核对：正式赛题、单人资格、报名精确截止、提交入口与格式要求。
4. Codex 接入边界（★ 标记文件的替换清单，见 store.js 末尾注释）：
   - `mock-data.js` → API 适配器；
   - `Store.filterPool / getChItem / importVocab / deleteVocab / toggleTerm` → 异步 API 调用；
   - `persistVocabs / loadVocabsFromStorage`（localStorage）→ **SQLite**；
   - `vocab.js` 保留为前端校验层，解析规则与后端协议同步；
   - 布局可复用；views/app/draw 仍须适配异步/错误/版本/草稿生命周期，不是只换 MOCK 即完成。
5. 已实施项（勿重复排期）：减速抽题（第 4 次）、词库导入与持久化（第 4 次）、EVA 主题 + 白边修复（第 5 次）、Hallmark audit 全项修复（第 6 次）。
6. 暂停新增词库与 UI 美化；领域下拉已动态化，但历史库删除后选项保留存在 B12。窄屏真机、同知识点关联正例与取消交错、真实媒体播放仍待验。
7. test-store 导入目标和必要禁用断言、P0 正向回归已完成；后续浏览器复验缓存失败提示/编辑导航/新旧稿和报告，继续倒计时/失焦/快点、范例复制/落盘下载再导入、375px 等。test-store-2 旧路径错误已修，无需重复处理。新证据见 P0 修复记录。

## 重要约定（沿用 docs/00）

- 权威顺序：用户本次明确需求 > 已记录审核结论 > 本套文档；AI 不得把「建议」自动升级为「已确定」。
- 演示原型、文档存放、报名动作均不等于批准应用编码。
- 每次会话结束更新本交接文档，且文档必须与实际代码一致——不得把计划功能描述为已实现。
- **Markdown 词库格式受限于 demo 版本**：二级标题限定「入门 / 基础 / 进阶」；扩展难度档需改 `js/vocab.js` 的 `VOCAB_LEVELS` 并同步后端协议。
- 视觉主题变更需同步 `demo/README.md`「视觉主题」小节与本文档更新记录。

## 独立视觉试验记录

| 日期 | 试验 | 状态 |
| --- | --- | --- |
| 2026-10-17 | **炼知火焰罗盘独立 Demo**（`prototypes/flame-compass/`，4 文件自包含）：三态火焰罗盘（待机微燃/抽题升腾/锁定回落，参考用户三态示意图），方案 A=SVG 柔和火焰（推荐集成）、方案 B=轻量粒子（上限 90），控制面板含强度/速度/动效开关，状态机与抽题节奏复刻正式 demo 但不连接 Store。IAB 内核实测三态联动/控件/重复点击/重置/375px 通过；真实 rAF 观感与美学待人工审阅。**未集成正式前端**；正式 `demo/` 18 个文件 SHA-1 逐一比对（试验前后）零改动。下一步：等用户审阅 Demo 后再讨论是否集成及选型。 |
| 2026-10-18 | **火焰罗盘 V2 质感升级**（仍为独立试验，`prototypes/flame-compass/`）：新增①多谐波火舌（每舌双频摇摆+低频伸缩+同源横移，相位确定性错开，焰心反相微摆，根部锚定）；②外焰/内焰/环境辉光分层节奏（9s 全局呼吸、11s 辉光低频呼吸、锁定一次性 glow 脉冲 650ms）；③余烬层（canvas 上限 26，两火焰方案共享，待机 ~1 抽题 ~5）；④页内 V1/V2 切换（V1 代码保留即回退）；⑤document.hidden 暂停 rAF。修复 SVG 方案余烬被条件短路不生成的 bug。测试（IAB+泵帧钩子）：火舌去同步、余烬档位、抽题升腾/锁定回落、连抽 10 次无叠加、跳过/重置/动效关、375/768 无溢出全过；真实 rAF 观感/CPU/reduced-motion CSS 分支/美学认可标注人工。**未集成正式 MVP**；正式 demo/ 23 文件 SHA-1 试验前后零改动。等用户审阅。 |
