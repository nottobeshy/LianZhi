# Windows Release 开源项目调研（2026-10-19）

本轮只增加桌面壳与发布工具，不复制模板业务。核对官方文档、GitHub说明及本机安装wheel元数据；GitHub匿名API返回HTTP错误，未据此编造最新提交时间。版本以实际安装和候选测试为准，不承诺长期兼容。

| 项目 / 实际版本 | 解决问题与采用方式 | 依赖、体积与Windows风险 | 许可证 / 维护判断 |
| --- | --- | --- | --- |
| [pywebview](https://github.com/r0x0r/pywebview) 6.2.1 | 直接引入，主线程WinForms窗口加载既有FastAPI的127.0.0.1:8765；关闭后停止自有服务 | 新增pythonnet3.2.1/clr_loader0.3.1/cffi等；使用系统WebView2，不打包CEF/Qt浏览器；需.NET Framework与WebView2，显式edgechromium防止回退IE | BSD-3-Clause；有官方冻结/生命周期文档和持续发行；仍需针对Windows运行库实际验收 |
| [PyInstaller](https://github.com/pyinstaller/pyinstaller) 6.22.3 | 构建依赖，onedir + spec；静态demo/data显式白名单，__file__定位只读资源 | 打包CPython、DLL与现有ASR库是体积主体；主EXE无控制台，独立worker共用依赖并由父进程隐藏启动；不是单文件临时解压 | GPL-2.0-or-later + bootloader exception，运行时hooks另有Apache条款；成熟工具，需冻结版本与回归 |
| [hooks-contrib](https://github.com/pyinstaller/pyinstaller-hooks-contrib) 2026.8 | 构建依赖，使用现有av/onnxruntime等hooks；局部keyring hook只收WinVault，ctranslate2明确收动态DLL | 未用collect_all；PyAV的Cython子模块/DLL、VAD模型等动态资源必须实际探测；避免把开发环境Qt/Torch等带入 | 以分文件SPDX为准：hooks多GPL-2.0-or-later，运行时hook按上游区分；与PyInstaller一起锁定 |
| [platformdirs](https://github.com/tox-dev/platformdirs) 4.13.5 | 直接引入；数据/配置/缓存/日志路径分开表达，保留KnowledgeCompass身份 | 纯Python体积小；Windows data/config可能同目录；无Schema/JS改动，尊重显式LIANZHI_DATA_DIR | MIT；标准目录库，仍需路径权限/中文空格目录测试 |
| [setup-python](https://github.com/actions/setup-python) v7 | 已研究；官方manifest没有Windows3.12.14二进制，本轮不直接启用该安装步骤 | 仅CI，不进EXE；暂用有已配置同版本解释器的Windows自托管候选runner，GitHub托管方案另待版本重验 | MIT；官方Action。不能把Linux条目误当Windows可用 |
| [upload-artifact](https://github.com/actions/upload-artifact) v7 | 只上传候选ZIP/SHA/manifest与安全测试报告，设保留期/缺文件失败 | 仅CI；上传已打好的ZIP，避免隐藏文件/层级变化；不上传整工作区或测试视频 | MIT；官方Action，artifact不是公开Release，不等于软件人工验收 |
| [action-gh-release](https://github.com/softprops/action-gh-release) | 仅研究，暂不启用发布工作流；未来确认标签、提交、SHA与人工门槛后再采用 | 仅CI；发布job才需contents:write，候选构建contents:read即可；不授予discussions权限 | MIT；依赖外部Action，正式采用前再固定已审查commit；本轮禁止公开Release |
| [fastapi-desktop](https://github.com/zy7y/fastapi-desktop) | 仅作FastAPI+pywebview+PyInstaller组合参考，不引入代码 | 项目简介涉及Vue/Vite，与现有原生前端不同；不能因此新增前端工具链。源码/许可证抓取未成功，无法完整审计维护质量 | 当前可访问页面不足以确认许可证、实现细节与维护周期；不作为生产模板，不复制 |
| [keyring](https://github.com/jaraco/keyring) 25.7.0 | 保持现有显式WinVaultKeyring；打包Windows动态导入/元数据 | 不替换安全机制；不做plugin扫描；凭据身份继续依赖data_dir绝对路径。临时假Key的系统凭据验收后清理，不读取用户Key | MIT；已有稳定模块，冻结环境仍需真实Windows凭据读写/重启测试 |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) 1.2.1 | 保持现有CPU INT8 small与本地ASR子进程 | 复用av16.1.0/CTranslate2 4.8.3/onnxruntime1.31.0；VAD ONNX、native DLL与元数据需打包。模型不取开发者缓存，独立显式下载固定commit并校验权重SHA | MIT；相关native轮子许可证须另核对，不把PyAV的BSD当作所有FFmpeg DLL许可证 |

## 工程选择

1. 原生JS继续同源HTTP访问FastAPI；不增加业务JS桥、不重写页面、不修改数据库Schema。Uvicorn专用线程，GUI主线程；固定8765保留浏览器localStorage origin，端口占用明确失败，不随机换端口隐藏配置变化。
2. 主程序LianZhi.exe无控制台。LianZhi-worker.exe是console子程序，父进程CREATE_NO_WINDOW+管道捕获输出，解决windowed Python的stdout缺失与冻结后sys.executable语义变化；沿用Windows Job Object退出清理。
3. Release不含用户视频/SQLite/Key/开发模型。首次ASR由用户运行“下载ASR模型.cmd”，通过现有固定版本下载器安装到用户缓存；联网失败明确报错。主程序不会自动下载。
4. build-info.json绑定v0.1.0、Git完整SHA、CPython版本；构建要求已提交源码。ZIP和SHA由同次构建产生；候选测试报告另关联该SHA。未通过独立干净Windows验收前不能称正式可用。

依据：[窗口生命周期](https://pywebview.flowrl.com/guide/usage.html)、[Web引擎要求](https://pywebview.flowrl.com/guide/web_engine.html)、[冻结与排除无用GUI库](https://pywebview.flowrl.com/guide/freezing.html)、[spec资源](https://pyinstaller.org/en/stable/spec-files.html)、[运行时定位](https://pyinstaller.org/en/stable/runtime-information.html)、[目录API](https://platformdirs.readthedocs.io/en/latest/api.html)、[WebView2分发说明](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution)。本文件为工程选择记录，不替代第三方许可条款或发布前许可证核查。
