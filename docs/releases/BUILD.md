# 源码复现、候选构建与发布门槛

## 版本和环境

当前实测Windows11 x64（10.0.26200），CPython3.12.14 x64。构建依赖锁定在requirements-desktop.txt（引用现有requirements-asr.txt / requirements.txt），不改日常.venv。Node用于现有前端测试；Playwright只用于显式桌面验收，不进软件包。

```powershell
cd E:\Projects\KnowledgeCompass
# 使用已安装的、经版本核实的CPython3.12.14 x64解释器创建独立环境
python -m venv .venv-release
.\.venv-release\Scripts\python.exe -m pip install -r requirements-desktop.txt
.\.venv-release\Scripts\python.exe -m pip check
git status --short
# 源码提交后再构建；元数据脚本拒绝已跟踪文件的未提交改动
.\scripts\build_windows.ps1
```

构建默认运行全部常规pytest与demo/tests/test-*.js，然后生成build-info / 第三方许可清单、PyInstaller onedir、ZIP及SHA。调试修复后可显式-SkipTests增量重打，但不能据此宣称重跑了测试。不要把API Key写入命令；测试进程不应携带用户LLM_*或显式ASR验收环境变量。Release必须来源于干净的已提交代码；未跟踪文件由spec静态资源白名单排除。

输出：dist/LianZhi/ 与 release-artifacts/LianZhi-v0.1.0-windows-x64-candidate.zip、.zip.sha256、candidate-manifest.json。主程序PE为AMD64/Windows GUI，worker为AMD64/Console，均带0.1.0文件版本。包中build-info.json有完整源码SHA，原数据库/Key/视频/模型不打入ZIP。

同次另生成LianZhi-v0.1.0-source.zip及其SHA，来自候选同一提交的git archive，内附SOURCE_VERSION.json，便于离线审查。源码ZIP没有.git历史；构建脚本要求Git工作仓库。GitHub仓库建立后应clone并checkout该完整SHA复现；若从ZIP自行git init/提交，新的构建会如实记录新SHA，不能冒称原候选提交。

## 模型复现

桌面首次启动自动后台安装缺失模型，界面显示进度并允许失败重试；已有有效模型校验后复用。仍附“下载ASR模型.cmd”用于排障，内部与自动安装共用冻结worker的--download-asr-model。固定repo=Systran/faster-whisper-small，revision=536b0662742c02347bc0e980a01041f333bce120，model.bin SHA256=3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671。token=False，子进程移除LLM/HF令牌环境变量，不发送用户媒体。

自动安装由desktop/model_install.py管理受控子进程和30分钟上限；退出关闭Job Object。下载进入同卷`.download`暂存目录，校验后才改名启用；失败不发布半成品，原来不完整的模型目录保留为`.previous-*`备份。每个模型目录有跨进程锁，损坏暂存权重重试强制重新下载，普通未完成下载复用HF恢复机制。单独运行源码backend不自动下载；LIANZHI_AUTO_INSTALL_ASR=0可关闭桌面启动自动安装，但保留主动重试。

桌面注入安装器后仅新增本机POST /api/asr/model/install（无任意URL/路径参数），复用既有同源/Host/请求体保护；health.asr附installation状态。前端局部更新状态容器/启动按钮/设置ASR标签，不重渲染密码、抽题或视频草稿；只在安装活动时轮询，页面隐藏暂停。原挑战/视频API协议与Schema不改。

本轮已用冻结安装器下载到全新目录（未指向开发者models/，HF_HOME也全新），约26秒通过权重SHA；实际冻结ASR以该模型完成44.6秒MP4的5段识别。离线分发若后续需要单独模型ZIP，要从此固定下载流程产生并单独列许可/校验，不能直接复制开发者缓存作为正式来源。网络不可达仍可能导致安装失败，当前无镜像/离线包承诺。

## 实际桌面验收

tests/test_desktop_package.py默认跳过，需显式提供LIANZHI_DESKTOP_EXE、LIANZHI_PACKAGE_MODEL、LIANZHI_ASR_TEST_VIDEO、可用Node/Playwright环境。它在实际EXE的WebView2中通过仅测试环境启用的CDP执行UI验收，使用隔离数据/缓存/日志、假Key且LLM_MODE=mock/预算0，结束清理假系统凭据。LIANZHI_DESKTOP_TEST在普通启动中默认关闭；不要在日常使用中打开远程调试端口。

```powershell
$env:LIANZHI_DESKTOP_EXE='C:\解压目录\LianZhi\LianZhi.exe'
$env:LIANZHI_PACKAGE_MODEL='C:\隔离目录\faster-whisper-small'
$env:LIANZHI_ASR_TEST_VIDEO='C:\本地验收素材\中文讲解.mp4'
# NODE_PATH仅在Playwright由共享runtime提供时按实际位置设置
.\.venv-release\Scripts\python.exe -m pytest tests/test_desktop_package.py -q -s --basetemp=.test-runtime/package-recheck
```

本轮已在C盘独立中文/空格目录解压ZIP，EXE的PATH仅保留Windows系统目录，清除PYTHONHOME/PYTHONPATH/VIRTUAL_ENV；验证页面、导入、学习计时、Stub追问、ASR、Stub文案、SQLite、WinVault、音量/词库和窗口重启。此为同一台开发机的独立路径测试，**不是没有系统运行库的全新VM**，不能据此承诺所有Windows免依赖。真实AI需要新明确预算授权后另验。

## Actions候选流程

.github/workflows/windows-candidate.yml只接受手动workflow_dispatch，contents:read，不含tag/Release发布任务，不在pull_request运行。使用checkout@v7/upload-artifact@v7，上传候选ZIP/SHA/manifest，保留14天；未上传测试数据库/素材/日志/Key。

重要实际发现：[setup-python官方版本清单](https://raw.githubusercontent.com/actions/python-versions/main/versions-manifest.json)的3.12.14条目只有Linux构建，没有Windows。直接在windows-2025配置setup-python3.12.14会失败；本轮未静默降级到3.12.10，也未把未测的新Python写成已验证。当前配置为**待配置并执行的隔离Windows自托管runner**，标签self-hosted/Windows/X64/lianzhi-candidate，机器需提供可信来源的CPython3.12.14 x64及LIANZHI_BUILD_PYTHON完整路径、Git、Node和PowerShell7，runner须支持v7 Actions。不要将个人日常带Key机器直接用于外部不可信代码任务。

本轮没有配置runner、推送或执行云端Actions，不能称CI已通过。若要GitHub托管runner，需要另行选择并在本地/候选中重验一个有官方Windows分发的Python版本，或准备可校验且经审查的3.12.14 Windows构建来源；不从开发者私有缓存构造托管环境。

## GitHub与正式公开发布

连接账号nottobeshy已确认，本地尚无remote；未使用其他项目quickkey-win11。仓库名/自身许可证待用户确定；目前不制造不存在的源码或Releases链接。允许审查的源码以候选build-info完整SHA为准，公开前检查Git历史、私人素材与许可。

正式发布需用户确认候选和公开授权；将v0.1.0指向被验收提交，校验ZIP/SHA/notes/测试报告对应关系。之后才考虑softprops/action-gh-release（仅发布job给contents:write，先draft或受保护environment人工门槛）。当前没有公开发布自动化，无写GitHub令牌权限。
