> 2026-10-19 自动安装专项：桌面缺失模型时后台安装固定small，失败可重试，现有CLI保留。新增tests/test_model_install.py与demo/tests/test-model-install.js；显式包体验收可设LIANZHI_PACKAGE_AUTO_MODEL=1，在空模型/全新HF缓存中实际自动安装，随后断网重启复用，并另外验收离线失败/重试/输入保留。常规与实际包结果见最新HANDOFF。

# Windows独立复现说明（2026-10-17）

## 2026-10-19 桌面候选复现

本轮已新增桌面入口、PyInstaller spec、依赖锁定与Windows构建脚本；运行 `scripts/build_windows.ps1` 先测试再产onedir/ZIP/SHA/同提交源码ZIP，版本与Git SHA在build-info.json。完整环境、模型显式下载、实际WebView2验收和命令见[候选构建指南](releases/BUILD.md)，当前结果见[测试报告](releases/TEST_REPORT.md)。正式8000和旧数据仍保留，候选默认用户目录不含私人记录，不自动合并；Key仍由系统凭据保存。

实际本机Windows11独立路径运行通过，不替代全新系统/人工双击验收。本轮没有更多真实AI额度。Actions候选配置仅手动/自托管Windows/contents:read，因setup-python没有Windows3.12.14构建，未伪称托管CI可用；尚未云端执行或公开发布。

## 2026-10-18 视频AI复盘与双版本

按[VIDEO_REVIEW](VIDEO_REVIEW.md)确认真实状态、API、Prompt与Schema v3。当前本机服务继续使用`.test-runtime/browser`旧数据目录，三条旧挑战保留；不要用默认目录重启造成历史记录不显示，也不要将该目录当测试夹具删除。v2升级前app.pre-review-v2.db已生成，旧挑战(id,data)SHA256实测一致。新视频“知识讲解测试.mp4”10118319字节/44.6秒，真实本地ASR5段、校对确认并保留原稿。

实际命令：`python -m pytest -q --basetemp=.test-runtime/video-review-regression-20261018`：73 passed, 4 skipped in28.93s；四项显式模型/浏览器检查默认跳过，不算通过。新增不收费浏览器专项在设置LIANZHI_ASR_TEST_VIDEO/LIANZHI_BROWSER_TEST、使用本机已有Playwright/Chromium后运行`python -m pytest tests/test_video_review_real.py -q -s --basetemp=.test-runtime/video-review-browser-stub-fixed`：1 passed in15.67s，含真实ASR、明确Stub复盘、实际剪贴板、编辑/保存/过期及后端/浏览器重启。私有证据在上述目录的review-evidence.json/review.png，不提交。

真实正式服务联调：首次请求返回502 API_CONFIGURATION并保存失败，未用Stub掩盖。用户更新Key后，使用TEST_EXISTING_VIDEO_ID=4d629787-5e9d-4c34-8dff-8c144e7b3d86在同一正式视频/确认稿上主动发起最后一次请求，真实DeepSeek deepseek-v4-pro成功生成89字符建议稿/3项摘要。tests/browser-video-review.cjs实际验证原确认稿与AI稿对照、系统剪贴板、用户编辑保存和刷新；随后真正停止/重启原数据目录服务，新浏览器只读验证原稿、建议、编辑和历史完整一致。真实结果的隔离数据库副本修改确认稿后正确过期，正式服务成功稿保持当前有效，无额外模型调用。证据在.test-runtime/video-review-live/live-evidence-final.json、restart-stale-evidence.json，私人截图/数据库不提交。

累计历史1次+本专项2次=3次，授权额度已用尽。当前8000服务LLM_MAX_REQUESTS=0，查看/复制/编辑不收费；不得再运行真实请求脚本，重启也不恢复授权。若需在本次本机环境重启，保持原LIANZHI_DATA_DIR并设置`$env:LLM_MAX_REQUESTS='0'`。新评审电脑使用自己的预算，不携带本机Key或数据。configured=true仅表示配置存在，首次失败证明其不是服务商有效性验证。

所有真实请求之前使用本机`.test-runtime/video-review-live-budget.json`核对/占用预算，历史1次计入；该文件仅含计数/测试ID，无Key，不随仓库分发。普通评委使用自己的配置/预算，不能复用开发者Key或修改历史授权计数来继续本轮收费请求。

## 2026-10-18 上传64 KiB专项复现

本轮Windows本机实际验证FastAPI0.143.3 / Starlette1.8.0 / Uvicorn0.54.0 / PyAV16.1.0。正式前端是同源fetch发送File原始video/mp4，不是multipart；文件大小即请求体大小。两个上传路径/api/videos与/api/videos/均限制100MiB/180秒，其他命令64KiB。完整修复前后矩阵、失败记录见根HANDOFF最新章节。

无私人视频、无Key、无模型下载的HTTP边界测试：

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_upload_http.py tests/test_video.py -q
```

测试自动生成含AAC音轨的有效MP4，用合法free box精确补至32768、64512、65536、65537、66560、131072、1048576字节；每个路径均应201，同ID重试不重复入库。还实发无Content-Length分块流：104857600字节201，104857601字节413 FILE_TOO_LARGE；使用1MiB块不一次分配整个视频。连接断开后检查临时文件和上传锁释放。其余测试覆盖缺少内容、无音轨、损坏内容、假扩展名、路径穿越、格式/时长、写权限和模拟ENOSPC磁盘满。全部使用新测试数据目录，不修改正式用户库。

正式服务的直接调用示例（先在另一终端启动服务；不是curl -F）：

```powershell
.\.venv\Scripts\python.exe scripts/make_upload_test_video.py
curl.exe --max-time 65 -H 'Content-Type: video/mp4' -H 'X-File-Name: public-speech.mp4' -H 'X-Request-Id: upload-repro-1' --data-binary '@.test-runtime/upload-browser/public-speech.mp4' http://127.0.0.1:8000/api/videos
```

素材脚本使用Windows现有Microsoft Huihui Desktop和已安装PyAV/numpy，离线合成原创概率讲解及纯色画面，无外部素材/私人视频；若中文语音未安装会明确失败，不自动安装。生成H.264/AAC、约19.4秒/165610字节；不同机器语音版本可能略异。文件已存在时拒绝覆盖，可用`--output .test-runtime/另一个名字.mp4`。只安装基础依赖时需先按ASR说明准备解码依赖，脚本不会联网或下载模型。

可选真实ASR及浏览器验收，需预先准备已批准的固定small模型。浏览器测试额外需要可被Node解析的Playwright和已安装Chromium，不是应用运行依赖；本轮复用本机已有工具，没有安装/升级它们：

```powershell
$env:LIANZHI_ASR_TEST_VIDEO = Join-Path $PWD '.test-runtime/upload-browser/public-speech.mp4'
$env:LIANZHI_BROWSER_TEST = '1'
# 若使用独立工具包，设置NODE_PATH为自己的node_modules目录。
# 若Playwright默认Chromium不在本机，可设置LIANZHI_BROWSER_EXECUTABLE为自己的现有Chromium路径。
.\.venv\Scripts\python.exe -m pytest tests/test_asr_real.py -q -s
```

默认未设置上述变量时三项真实测试跳过，不能当作通过。已有CPU/静音真实测试2项通过，新增真实Chromium上传/ASR/修改确认/页面刷新/实际服务重启读回1项通过；正式页面NO_SPEECH失败提示与JS异常监听亦执行。浏览器工具未暴露File的Content-Length，实际上传体字节数用服务器流式计数与本地文件核对，两者165610。证据和页面截图在.test-runtime/upload-browser-verified/test_real_browser_upload_confi0/，不入Git。未人工测识别准确率、扬声器听感和其他浏览器。

当前源码的无尾斜杠路径在修复前已能上传1MiB；已确认的是尾斜杠分支误入通用64KiB中间件。检查时8000无监听，无法还原用户旧进程或原URL；不要把“可能未重启旧服务”写成已证实根因。若仍报64KiB，保留Network的Request URL/状态/错误码，确认正式前端和服务已加载本轮代码，再按上面直接HTTP交叉核对。开发模式已有实际结果，仓库尚无Windows打包入口/Release候选版，无法声称打包版兼容。

## 2026-10-18 视频转写更新

本机真实CPU转写→前端脚本编辑确认→SQLite→实际进程重启/新前端运行环境读回已执行。模型/解码依赖、固定下载来源、可公开获取中文测试资源、逐步操作及故障处理见[ASR复现](ASR.md)。必须安装requirements-asr.txt、运行唯一模型下载脚本再启动；应用不自动下载。仅知识挑战继续使用基础requirements。

已验证用户本轮新提供的20.196533秒MP4；最终small/CPU INT8/VAD识别6段，5.493秒（模型加载+识别），峰值子进程工作集695.5MiB。真实转写与静音NO_SPEECH两项实际测试通过；浏览器仍初始化失败，GPU未验。Schema为v2，旧数据库升级会保留v1备份。下文22/45测试数和仅内存/无ASR限制属于相应历史任务，不作为当前ASR状态。

## 已执行的范围

Windows 11 x64 (10.0.26200)，Python3.12.14、SQLite3.53.1、Node24.18.0。开发机系统py未注册Python，本轮明确使用应用附带的3.12解释器建立venv；项目源码不依赖这个私人绝对路径。
实际执行venv创建、requirements安装、python -m backend、实际loopback HTTP、pytest和demo下Node测试。后续评审需自行安装Python3.12并确认python指向正确版本；此处“python”命令别名在全新评审机器上尚未验证。

## 安装和启动

在项目根目录按README执行。pip安装需要网络，未提供离线wheel包。无需FFmpeg/ASR模型、GPU、Node前端构建；Node只用于测试。
.env.example只是参考，不会自动加载。PowerShell设置环境变量示例：

```powershell
$env:LLM_MODE='mock'
$env:LIANZHI_DATA_DIR=Join-Path $PWD 'runtime'
.\.venv\Scripts\python.exe -m backend
```

浏览器访问http://127.0.0.1:8000。health在/api/health，交互文档在/docs。
要验证live，设置页选择live，填已确认端点/模型及自己Key；同端点留空保留当前Key，不回显。可勾选“记住 API Key”，下次同Windows用户/同数据目录启动自动恢复；取消勾选并应用删除当前端点凭据、保留会话Key。删除按钮同时清空内存和当前端点凭据，后续调用报未配置。环境变量Key优先且不被按钮修改，重启时若仍存在会恢复环境Key。先完成独立解释并明确同意文字外发。默认仅DeepSeek HTTPS端点，其他供应商需启动前指定LLM_BASE_URL。详见[安全说明](SECURITY.md)。

2026-10-18已实际验证：显式Windows WinVaultKeyring、安全后端本机持久化（不漫游），隔离假凭据保存→停服务→恢复→替换→停服务→读新值→删除→停服务→未配置；实际HTTP子进程四次启动，没有模型调用。45项pytest、9个Node脚本通过，pip check通过。测试凭据按临时目录独立命名并在finally删除；不会触碰用户已保存Key。仓库和干净副本均不携带开发者凭据，评委须输入自己的Key。非Windows只支持会话使用，安全保存明确报不可用。
端口被占用时先确认是否旧应用仍运行，不杀陌生进程、不删除数据；同数据目录第二实例会拒绝启动。目录不可写时改LIANZHI_DATA_DIR。
证书/网络/401/429/格式错误均显示明确失败，不自动使用Stub。默认不读取系统代理。超时可能计费，不自动重试。

## 自动测试

按README运行pytest和Node测试。测试不使用默认用户数据库、不读用户Key；所有云端请求是Stub或MockTransport，tests/test_process.py启动真实HTTP子进程并在测试临时目录写库。
现有旧Node部分测试只打印；新增P0/Stage1/API回归有断言。22项pytest已通过，Starlette TestClient使用httpx出现1条弃用警告（非失败）。

## 干净副本

已执行：

```powershell
.\.venv\Scripts\python.exe scripts/reproduce_check.py
```

脚本仅复制Git可见的源码/文档，排除.git、.venv、用户库/媒体/Key、prototypes与测试缓存；在.test-runtime/reproduce-随机ID创建新虚拟环境，按requirements安装、运行pytest和全部前端脚本。保留隔离结果，不删除用户数据。
第一次实际副本：.test-runtime/reproduce-1d29ee34，22 passed及当时6个Node脚本通过；最终副本reproduce-38dfe71a通过22项pytest及7个Node脚本，最终排序断言与格式整理后再次复制对应文件并复跑7脚本通过。
这是同一硬件/系统的新目录新venv，不是另一台机器、离线或完全独立系统的验收。

## 重启持久化

test_actual_http_frontend_and_process_restart实际启动服务→Node加载正式前端脚本（内存DOM）→提交新解释→Stub追问→回答→修正→终止进程→新进程→HTTP读回，核对原解释、修正状态和mock来源。
人工仍需：通过真实浏览器完成同样操作，Ctrl+C停服务，再从同一终端/数据目录重启，进入“我的知识作品”核对。已保存记录可看，未提交草稿/计时不跨重启保留。

## 尚未验证

浏览器自动化因sandbox helper初始化失败（node_repl kernel exited，setup refresh had errors），不是产品测试通过。真实点击/布局/375px/剪贴板/下载与实际localStorage故障待复验。
历史（2026-10-17）：用户通过设置页配置后，真实DeepSeek请求1次成功；回答/修正保存、进程重启逐字段读回以及正式前端脚本读取/详情/导出通过（内存DOM）。当时Key只在内存、重启清除；2026-10-18新增可选系统凭据恢复，以本文上方为准。累计真实费用请求仍1次，进程计数重置不代表新授权。ASR引擎、模型下载、中文样片、FFmpeg、CPU/GPU性能未执行。其他评审机器/系统/版本未验收。
