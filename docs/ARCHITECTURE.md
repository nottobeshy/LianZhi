# 炼知MVP架构（2026-10-17实际实现）

## 2026-10-19 Windows v0.1.0 候选架构

桌面入口desktop_entry.py调用desktop/main.py，WinForms/WebView2主线程加载自有127.0.0.1:8765，Uvicorn在专用线程；使用局部Selector循环解决实际Windows连接重置收尾问题，关闭窗口退出服务。无需业务JS桥，原FastAPI路由及前端仍同源；仅应用版本改0.1.0，Schema v3与Prompt不变。原开发入口8000仍保留。

PyInstaller onedir包含只读demo与backend/data；ROOT基于模块__file__同时适配源码和_internal，不从当前工作目录读取资源。主EXE无控制台，ASR改由同目录LianZhi-worker.exe（Console/隐藏启动）走原Job Object/管道协议；两EXE共用依赖。定向hooks处理WinVault/pywin32-ctypes别名/CTranslate2 DLL，复用上游PyAV/onnxruntime等hooks，未用collect_all。

platformdirs把数据/配置/缓存/日志定位到用户目录，保留KnowledgeCompass/data_dir的凭据身份。冻结模型默认用户缓存，显式安装器固定下载小模型并校验；源码原默认models路径不变。Release无个人数据库、媒体或Key。完整方案、版本/许可、依赖体积、当前CI的Python分发限制及实测边界见[Windows构建](releases/BUILD.md)、[开源评估](releases/RESEARCH.md)和[测试报告](releases/TEST_REPORT.md)。尚无公开Release。

## 2026-10-19 火焰正式集成

`demo/js/flame.js` 封装独立Demo已确认的柔和SVG V2（80%/2×），首页/抽题复用；flame.css只作用装饰层。app.js只在原draw生命周期通知start/setPhase/lock/idle，picker、draw.js业务时序与音效不改。compass.js注入共享帧调度器，指针和火焰独立订阅同一个原生RAF；hidden/减少动态暂停、切页/pagehide销毁，锁定卡重渲染复用原节点避免重复光效。初始化或绘制失败可降级，装饰层不截获点击。无后端/Schema/协议变化。来源、文件、实际测试与限制见[火焰集成说明](FLAME_COMPASS.md)。

## 2026-10-18 视频文案复盘增量

在本地ASR/不可变确认稿基础上新增文字AI复盘，不发送视频。review_routes.py读取数据库确认快照并验证consent/版本，复用LLMService的Key/端点/锁/预算/错误处理；prompts/video_review.py维护独立提示词video-script-review-v1，schemas.py严格检查结构与实际段引用。确认稿只读，AI建议与用户编辑分开保存；改写稿无模型生成时间戳。双版本复用原页面kc-grid，窄屏自动堆叠，不改抽题/罗盘/音效。

SQLite当前Schema **v3**：v2升级前保留app.pre-review-v2.db，仅新增video_reviews(id,request_id UNIQUE,video_id外键,data JSON)，不重写旧挑战/视频数据。review_db.py保存确认版本快照、AI原始建议、追加的用户编辑历史、模型/Prompt来源、running/succeeded/failed/interrupted；重启不自动补发。stale按当前确认指针动态计算，生成期间另页修改原稿也会过期。复盘命令和用户编辑仍受64KiB请求保护。

新增POST /api/videos/{id}/review、GET /api/videos/{id}/reviews、POST /api/videos/{id}/reviews/{review_id}/script。完整请求、幂等、版本/失败行为及真实联调限制见[视频AI复盘](VIDEO_REVIEW.md)。普通GET视频记录和原ASR协议保持兼容，不在旧videos JSON混入AI内容。复盘采用现有同步模型HTTP路径，无新框架或任务队列；原ASR独立子进程路径不变。

依据MVP_TASK_V1.0.md，本轮授权FastAPI + SQLite + 原生前端。旧Streamlit是历史提案，不代表旧PRD全部批准。

## 三层与启动

浏览器demo → 同源FastAPI /api → sqlite3 / LLMService。python -m backend通过Uvicorn单worker绑定127.0.0.1:8000，同时托管静态文件。无第二服务、CORS开放、账号或队列。Host/写入Origin限制；普通命令请求体上限64KiB，POST /api/videos及/api/videos/两个精确上传路径共用100MiB流式限制和实际MP4/音轨/180秒校验。仅本机单用户，不是多人安全边界。

2026-10-18上传专项：原中间件只豁免/api/videos，尾斜杠路径先被64KiB缓冲拒绝，不能到达上传处理；小请求又会被静态挂载返回405，未发生框架自动重定向。已补同一处理函数的尾斜杠路由（不重复OpenAPI条目）并同步中间件两个精确路径。不扩大其他/api/videos/*命令豁免范围。正式前端发送raw File，未使用multipart/Base64/JSON封装视频；没有multipart字段限额或SpooledTemporaryFile阈值参与此链路。Uvicorn和已检查的启动入口没有额外代理/桌面封装；原故障现场进程版本未知。

- config.py：环境与可写目录，Key不参与repr。
- schemas.py：拒绝额外字段；解释/修正1–6000字符，回答1–2000。
- main.py：路由、同意/顺序门禁、统一错误、静态托管。
- db.py：短事务、版本/幂等，不在事务中等待云端。
- services/llm.py：httpx兼容Chat Completions，显式Stub，JSON和引用校验。
- services/credentials.py：显式WinVaultKeyring、按数据目录/端点隔离凭据；非敏感配置原子保存llm-settings.json，lifespan在目录锁内恢复；与调用/修改共用模型锁。
- services/asr.py：已验证CPU INT8适配器，PyAV校验容器/音轨/视频帧/时长，固定模型校验、秒单位分段、无自动下载。
- services/video.py、asr_worker.py、process_guard.py：一个ASR推理子进程，600秒超时，Windows Job Object随父服务结束回收；HTTP提交后查询状态，无外部队列。
- video_routes.py、video_db.py：限流式视频上传、受控UUID媒体路径、版本保存/幂等；[详细API与转写协议](ASR.md)。
- demo/js/api.js：加载/失败状态、命令ID；Key不进Store。

## API

| 方法与路径 | 行为 |
| --- | --- |
| GET /api/health | 数据库、模型状态/额度、ASR依赖/模型存在性及视频体积/时长上限 |
| GET/POST/DELETE /api/settings/llm | 状态/配置/删除当前端点已保存及内存Key；不回显；请求中禁止改配置 |
| POST /api/challenges | request_id、topic、explanation；201；重复成功请求重放，不同内容同ID冲突409 |
| GET /api/challenges | items，最近500条 |
| GET/DELETE /api/challenges/{id} | 读取/删除；缺失404；删除级联命令任务 |
| POST /api/challenges/{id}/questions | request_id、expected_revision、consent=true；失败不降级 |
| POST /api/challenges/{id}/answers | 完整问题集合，answered+text或skipped+null |
| POST /api/challenges/{id}/revisions | 追加text版本，不覆盖解释 |
| GET /api/examples | 有来源的example只读夹具 |

字段见运行中/docs、/openapi.json和tests/test_workflow.py。错误格式：
`{"error":{"code":"INPUT_LIMIT","message":"请求字段、类型或长度不合法，请检查输入。"}}`，不回显正文或Key。

创建输入：request_id唯一，topic必须为backend/data/topics.json真实完整对象（id/vocab_id/title/domain/level），explanation为独立解释。
追问输入：`{"request_id":"ask-1","expected_revision":1,"consent":true}`。
模型输出例：
```json
{"questions":[{"question_id":"q1","question":"如何界定试验结果？","why_asked":"检查适用边界。","based_on":"解释中逐字连续的原文"}]}
```
问题1–3条、ID唯一、based_on须是当前解释连续原文。拒绝重复JSON键、额外字段、截断/非JSON、虚假引用。协议通过不代表事实验证。保存origin.mode/provider/model/created_at/usage，live/example/mock区分。

## SQLite schema v2

2026-10-18新增视频表，v1升级前创建app.pre-video-v1.db（不覆盖已有备份）；事务增量升级，挑战四表不重写。最新ASR秒单位协议优先于旧docs/03毫秒提案，仅静态Mock继续原单位。

| 表 | 用途 |
| --- | --- |
| topics(id,data JSON) | 稳定身份与快照，内置124条UUID清单 |
| challenges(id,data JSON) | UUID、不可覆盖解释、追问来源、回答、修正版本、revision/时间 |
| commands(request_id,kind,challenge_id,fingerprint,result) | 成功结果与SHA256内容指纹，防重复提交 |
| jobs(request_id,challenge_id,fingerprint,state,error_code) | running/succeeded/failed/interrupted，重启不伪报成功 |
| videos(id,upload_request_id,upload_fingerprint,data JSON) | UUID媒体/元信息、实际ASR原稿、草稿、不可变确认版本、任务状态 |
| video_commands(request_id,video_id,kind,fingerprint,result) | 视频命令幂等，外键级联，expected_revision防覆盖 |

逐操作连接、foreign_keys、5秒busy timeout、写入BEGIN IMMEDIATE。expected_revision防旧页面覆盖。进程模型锁防并发收费，OS目录锁禁止同目录双服务。云端在事务外调用，完成再比较版本保存；崩溃可能已计费，不自动补发。
用户词库维持localStorage；knowledgeId=user:词库ID:词条ID，同名不同库不合并。内置UUID不随排序变化，生成器保留已有身份。旧无knowledgeId作品不凭标题推断关联；全量词库SQLite化未实施。

## 生命周期、安全与限制

倒计时沿用时间戳、切页暂停。抽题取消撤销锁定延迟回调，generation阻止旧回调更改新挑战。HTTP模式仅解释→追问/回答→自主修正→保存，不把原Mock反馈/脚本当真实结果。
Key经环境/密码框进入后端内存；用户可选显式WinVaultKeyring系统凭据保存，无后端自动发现/第三方降级，不写SQLite/Store/localStorage/普通配置；不记录原始服务商错误。启动只恢复、不发测试请求。默认DeepSeek主机，其他主机须服务启动环境LLM_BASE_URL指定；仅HTTPS/443、路径空或/v1、无凭据/查询/片段。云端文字外发同意门禁和live/example/mock机制不变。不跟重定向，默认不用系统代理。

设置POST新增可选remember_key；false删除当前端点已保存凭据且保留当前会话，旧客户端不传时保留当前记住选择（初始为会话）。状态新增remember_key/saved_key（null表示未确认）/key_source/credential_error/credential_backend，不含Key。凭据错误显示在状态中，内存可继续使用；删除即使系统失败也先清空内存并停用自动恢复，失败不能标“已删除”。配置文件写入失败明确提示。启动环境优先于保存值，见[安全说明](SECURITY.md)。

敏感设置只接受JSON；拒绝不匹配Origin、null Origin及Fetch Metadata cross-site/same-site API请求，不开放CORS。无浏览器来源头的本机CLI仍可调用；这不是同一Windows用户下的进程隔离边界。
httpx每阶段超时60秒，前端等待65秒，并非严格端到端总时限。前端超时后服务端可能仍运行；相同请求ID用于成功重放，不直接重复收费。失败任务需新ID重试，运行中返回BUSY。额度按进程计数，重启不续授权。响应128KiB上限，无自动重试。
真实ASR现已用用户新录制中文视频验证；原视频保留受控本地目录、音频只在子进程内存解码。原ASR含version_id，确认稿追加版本UUID，draft保存改动时撤销confirmed_version_id；为未来报告提供不可变引用。云端AI视频复盘未接入，不会自动发送转写；未来必须先确认、再明确授权，并检查报告绑定版本是否仍当前。[ASR安装、生命周期与测试](ASR.md)。
