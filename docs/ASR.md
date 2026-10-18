# 本地视频转写：安装、API与验收（2026-10-18）

> 视频文案复盘增量：真实ASR流程与100MiB/180秒限制保持，当前Schema已升级v3以独立保存确认稿绑定的AI建议和用户编辑版。只有用户确认、明确同意并主动点击时才外发确认文字，视频/音频不发送；以下“云端复盘未接入”属于之前ASR专项状态，最新以[VIDEO_REVIEW](VIDEO_REVIEW.md)为准。用户更新Key后真实DeepSeek对照/复制/编辑保存和服务重启读回已通过，真实报告副本过期通过；累计3次授权已用尽，不再调用。

> 当日上传专项最新证据：真实Chromium148正式页面上传无隐私H.264/AAC MP4（19.4秒、165610字节），实际本地ASR5段、5.14秒、峰值工作集696.4MiB；编辑确认、页面刷新和服务重启后新浏览器读回成功，静音NO_SPEECH在页面明确展示，page_errors=[]。下文此前“真实浏览器未验收”保留为旧任务记录；本轮未人工验收准确率、时间边界偏差、扬声器或其他浏览器，Windows桌面封装未实现。详见[专项复现命令](REPRODUCE.md)及根HANDOFF。

## 当前可用范围

真实闭环：本地MP4→受控上传/实际解码校验→CPU INT8 ASR子进程→分段文字→人工修改→保存草稿/确认版本→SQLite→重启读回。支持单人普通话，0–180秒（不含0）、最大100 MiB。只修改文字，不做拆合段或手工调整时间轴。时间戳统一使用**原视频时间轴的秒**；界面仅在格式化时转换为旧fmtT要求的毫秒，不更改静态Mock的毫秒协议。

没有接入云端AI视频分析、说话人区分、声纹、情绪、画面分析、剪辑、实时或批量转写。确认只是用户校对声明，不代表知识掌握。file://静态Demo继续明确Mock；正式服务的视频页使用实际结果，不以固定转写替代失败。

## 选型与实际环境

采用[faster-whisper](https://github.com/SYSTRAN/faster-whisper)：本轮先独立脚本实跑成功，再接HTTP；CPU INT8及分段时间已实际验证。PyAV wheel携带FFmpeg解码库，不要求系统ffmpeg/ffprobe命令。FunASR作为后续候选，本轮不增加另一套引擎或模型下载，未做二者速度/中文准确率对比。

- Windows 11 x64，Python3.12.14，Core Ultra7 251HX（18逻辑CPU），物理内存约15.37 GiB；实际GPU为RTX5060 Laptop 8151 MiB，但**未使用/验收GPU路径**。
- faster-whisper1.2.1、CTranslate2 4.8.3、PyAV **16.1.0**；其余精确版本在requirements-asr.txt。首次安装的PyAV19.0.1删除metadata_errors参数，真实转写失败；已固定兼容16.1.0并复验。不要随意升级PyAV。
- 模型：`Systran/faster-whisper-small`，MIT；[官方固定版本](https://huggingface.co/Systran/faster-whisper-small/tree/536b0662742c02347bc0e980a01041f333bce120)，commit `536b0662742c02347bc0e980a01041f333bce120`。公开文件合计486,215,847字节，约486.2MB；model.bin SHA256为`3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671`，已实际校验。
- CPU/int8、主引擎4线程、beam_size5、language=zh、condition_on_previous_text=false；启用引擎依赖中自带的Silero VAD，并保留引擎恢复后的原始音频时间定位，再加音轨相对视频的起始偏移。没有下载第二个大型模型。短句、弱音和静音仍须人工核对。
- 单次加载/识别子进程时限600秒，容器探测15秒，上传60秒。进度仅状态，无伪造百分比。每次任务加载模型，结束释放，不做多任务批量/长驻GPU。

## 新电脑安装与模型准备

先按根README创建Python3.12虚拟环境，再执行：

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-asr.txt
.\.venv\Scripts\python.exe scripts/download_asr_model.py
.\.venv\Scripts\python.exe -m backend
```

下载脚本只请求上述官方仓库固定版本的五个文件，匿名访问，不读取用户API Key，下载后校验权重并写MODEL_INFO.json。默认`models/faster-whisper-small`（Git忽略），不依赖私人缓存/绝对路径。仅下载脚本需要网络；转写子进程强制HF_HUB_OFFLINE/TRANSFORMERS_OFFLINE、模型local_files_only，应用不会自行下载、补文件或切换其他模型。

默认需预留约2GB磁盘、3GB可用内存作为工程余量，不是已验证最低配置。无Key可转写。只安装requirements.txt可继续挑战/档案/密钥功能，视频会明确提示缺ASR依赖。无模型仍能启动，转写返回MODEL_NOT_INSTALLED。若模型放别处，启动前设置`$env:LIANZHI_ASR_MODEL_DIR='本人准备的模型目录'`；权重仍必须通过固定版本校验。

若官方下载网络不可用，可在另一台可联网电脑运行相同下载脚本，将该完整目录复制到目标机，再配置路径；不要使用未知来源权重。开发机直连曾超时，使用正常环境代理访问官方地址后成功；不把此机器的代理写入代码。

## 使用与文件留存

打开http://127.0.0.1:8000，进入视频复盘，选择MP4并启动。上传时显示文件名/大小，服务返回实测时长/音轨；任务运行可切页。完成后原稿与修改框并列，点击段时间按钮设置播放器currentTime。必须自行点击“保存修改”或“确认并保存”；未保存编辑只在前端内存，刷新会丢失。保存草稿会撤销当前确认，旧确认快照保留。刷新/重启后在视频记录列表或“我的知识作品”重新打开。

原件复制到数据目录`videos/<应用UUID>.mp4`；数据库只存应用相对路径、显示名、大小、SHA256、时长/编码、ASR来源/耗时、不可变原稿、当前草稿、不可变确认版本和状态。不会修改用户选择的原文件。不另存永久WAV；音频解码在推理进程内存完成。媒体/数据库/识别文本均不得提交Git，原件和测试输出已被.gitignore隔离。

本轮不提供视频删除/清理接口，档案不会显示仅改内存的假删除按钮。先停服务再整体备份数据目录；不要直接移动UUID视频文件。中断上传可能留下未入库临时文件；若OS拒绝清理，会保留供维护者确认，不覆盖用户文件。原视频文件丢失时返回MEDIA_MISSING，转写记录仍可读。

## API与任务

沿用同源本机FastAPI，不开放CORS，Origin/Fetch Metadata限制同密钥设置。POST /api/videos及/api/videos/两个精确路径共用上传处理函数，豁免64KiB JSON缓冲，按流计数限制100MiB；其余JSON命令仍64KiB，包括转写启动与保存。视频体直接发送，文件字节数即请求体字节数，无multipart额外开销；multipart请求返回415，不要用curl -F调用本接口。

2026-10-18实际HTTP诊断：修复前/api/videos在32KiB–1MiB均201，/api/videos/在≤65536字节时405、65537字节起413 INPUT_LIMIT。根因是自定义中间件精确路径遗漏和缺少尾斜杠路由；64KiB来自其size > 65536条件，与上传100MiB上限、解析器或内存落盘阈值无关。修复后两路径边界均201，100MiB实际流式上传201、100MiB+1实际流式上传413 FILE_TOO_LARGE；非上传命令大于64KiB仍413。原用户现场路径/旧进程未获证据，不能把该已复现分支直接等同原现场。

| 方法与路径 | 输入/输出 |
| --- | --- |
| GET /api/health | asr对象：引擎、固定模型/版本、cpu/int8、依赖/文件存在、上限；存在不等于权重已通过运行时校验 |
| POST /api/videos（兼容/api/videos/） | 原始video/mp4请求体；X-File-Name=encodeURIComponent文件名，X-Request-Id=独立命令ID；201视频记录 |
| GET /api/videos | 最近100条完整视频记录；原视频不内嵌JSON |
| GET /api/videos/{id} | 元数据、state/error、raw_transcript/draft/versions/confirmed_version_id/revision |
| GET /api/videos/{id}/media | 应用控制的原视频，支持Range；不接受任意路径 |
| POST /api/videos/{id}/transcribe | request_id、expected_revision；202迅速返回，单独GET查询完成 |
| POST /api/videos/{id}/transcript | request_id、expected_revision、segments:[{segment_id,text}]、confirm布尔；新保存记录 |

上传目录/文件名由服务器UUID生成，独占新文件写入，实际容器、视频帧、音轨和时长由独立PyAV进程校验，不信扩展名。上传同命令同文件返回同记录；同命令不同内容409。ASR命令幂等，一个服务最多一个推理任务，重复/并行不重复启动。状态uploaded/running/transcribed/failed/interrupted；失败保留明确错误，不自动重试。

ASR在独立Python子进程运行，协调线程只等待进程/落库，HTTP可继续处理查询。Windows Job Object在父服务退出时关闭子进程，正常关闭也终止并等待回收；硬退出测试已验证。下次启动将遗留running标interrupted，绝不自动补跑。不能只写“中断”却保留旧推理占资源。当前媒体子进程控制仅实现Windows，其他系统返回PROCESS_CONTROL，不能宣传已跨平台验证。

错误包含FILE_TOO_LARGE、UNSUPPORTED_MEDIA、NO_AUDIO、DURATION_LIMIT、DECODE_ERROR、MODEL_NOT_INSTALLED、ASR_NOT_INSTALLED、MODEL_CHECKSUM、NO_SPEECH、ASR_ERROR、ASR_TIMEOUT、STORAGE_ERROR、INTERRUPTED、STALE_INPUT。存储写失败若无法落库，当前进程查询明确报告STORAGE_ERROR；重启按中断处理，不伪报已保存。

## SQLite升级与后续AI边界

Schema **v2**，升级v1前创建一次`app.pre-video-v1.db`（不覆盖已有备份），保留topics/challenges/commands/jobs，新增：

- videos(id,upload_request_id UNIQUE,upload_fingerprint,data JSON)
- video_commands(request_id,video_id外键,kind,fingerprint,result)

事务升级，原挑战不重写；旧版应用不应直接打开升级后的v2数据库，需停服务并使用升级前备份回退。

raw_transcript含独立version_id、engine/model/model_revision/device/compute_type、source_sha256、秒单位segments。draft只有同序段ID和编辑文字，时间轴不可改；versions追加不可变确认快照（UUID、序号、时间、based_on原稿、完整分段）；confirmed_version_id指向当前确认。用户保存不同文字即清空当前指针，历史保留；同稿重复确认不额外造版本。expected_revision冲突409保留前端编辑，不自动覆盖。

后续AI报告应引用确认稿的version_id，在用户明确授权后发送该快照；当指针变化或草稿在UI变脏时显示旧报告过期。本轮没有报告表、调用或把Mock报告写入真实视频记录；结构已提供不可变引用基础。

## 可公开获取的中文测试资源

用户本轮提供的新录制20.20秒MP4仅获本地测试授权，**不随仓库分发**。可用[Google FLEURS官方数据集](https://huggingface.co/datasets/google/fleurs)，中文配置`cmn_hans_cn`，CC-BY-4.0；[公开dev音频包](https://huggingface.co/datasets/google/fleurs/resolve/main/data/cmn_hans_cn/audio/dev.tar.gz)约217.35MB，[对应文字](https://huggingface.co/datasets/google/fleurs/resolve/main/data/cmn_hans_cn/dev.tsv)。使用时注明Google FLEURS、数据集链接和CC-BY-4.0；从包选WAV需另行封装成MP4才能从本轮视频入口上传。已核对公开文件元数据与许可证，未下载/转写整个数据集；Viewer单条接口本轮返回500，不能将其当成已测成功入口。

最简单的独立验收是用手机新录制下面的原创朗读稿，导出普通MP4。以下**文本**可自由使用（CC0-1.0），录制文件的权利仍归录制者：

> 今天介绍二分查找。它要求数据已经有序。每次比较中间位置，如果目标更小，就保留左半部分，否则保留右半部分。不断缩小查找范围，直到找到目标，或者确定目标不存在。

不要把公开样本或预存文字冒充新视频真实ASR输出。Windows服务启动只做依赖/文件检测，不下载素材或自动识别。

## 测试与真实证据

本轮最小脚本先实跑：

```powershell
.\.venv\Scripts\python.exe scripts/asr_probe.py --video .test-runtime/asr-validation/new-video.mp4 --model-dir models/faster-whisper-small --output .test-runtime/asr-validation/probe-1.json
```

当时20.196533秒新视频，CPU INT8，不启用VAD，7段，14.728秒、进程峰值工作集960.8MiB。后正式路径启用自带VAD，最后一次验收6段（有中文字符），模型加载+识别5.493秒、子进程峰值工作集695.5MiB；不是纯推理/冷启动统一基准，不能由单样片推断3分钟性能。

通用回归：根目录python -m pytest -q；demo目录运行全部test-*.js；pip check。真实视频测试须显式设置`LIANZHI_ASR_TEST_VIDEO`后运行tests/test_asr_real.py，否则默认skip，不自动下载或读取私人素材。真实测试原视频、数据库与正文在隔离目录，提交文档只含汇总指标。

最终真实测试包括：实际HTTP上传/后台识别、正式前端api/app/views代码加载（DOM替身）、人工编辑动作/保存草稿/确认、原ASR不变、SQLite读回、停后端→新进程→新前端运行环境读取、媒体Range；另用生成的静音MP4实际验证NO_SPEECH。无LLM外发或收费请求。

未验证真实浏览器交互/视觉/声音/媒体seek，工具仍因Windows sandbox初始化失败；DOM赋currentTime断言不等于浏览器实际播放。未提供逐字参考稿，未计算CER、未人工逐句评价明显错词或时间边界偏差；只证明输出含中文、时间戳合法且可校对保存。短句/弱音、同音词、专有名词与背景噪声须人工核对，VAD可能漏音；未将这些限制伪称该样片已证实的具体错误。GPU、其他机器/系统、3分钟边界性能未验收。
