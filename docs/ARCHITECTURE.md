# 炼知MVP架构（2026-10-17实际实现）

依据MVP_TASK_V1.0.md，本轮授权FastAPI + SQLite + 原生前端。旧Streamlit是历史提案，不代表旧PRD全部批准。

## 三层与启动

浏览器demo → 同源FastAPI /api → sqlite3 / LLMService。python -m backend通过Uvicorn单worker绑定127.0.0.1:8000，同时托管静态文件。无第二服务、CORS开放、账号或队列。Host/写入Origin限制，64KiB请求上限；仅本机单用户，不是多人安全边界。

- config.py：环境与可写目录，Key不参与repr。
- schemas.py：拒绝额外字段；解释/修正1–6000字符，回答1–2000。
- main.py：路由、同意/顺序门禁、统一错误、静态托管。
- db.py：短事务、版本/幂等，不在事务中等待云端。
- services/llm.py：httpx兼容Chat Completions，显式Stub，JSON和引用校验。
- services/asr.py：只有Transcriber Protocol与Segment/Transcript类型，无引擎和路由。
- demo/js/api.js：加载/失败状态、命令ID；Key不进Store。

## API

| 方法与路径 | 行为 |
| --- | --- |
| GET /api/health | 数据库、模型状态/额度、ASR未实现 |
| GET/POST/DELETE /api/settings/llm | 状态/配置/清除Key；不回显；请求中禁止改配置 |
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

## SQLite schema v1

| 表 | 用途 |
| --- | --- |
| topics(id,data JSON) | 稳定身份与快照，内置124条UUID清单 |
| challenges(id,data JSON) | UUID、不可覆盖解释、追问来源、回答、修正版本、revision/时间 |
| commands(request_id,kind,challenge_id,fingerprint,result) | 成功结果与SHA256内容指纹，防重复提交 |
| jobs(request_id,challenge_id,fingerprint,state,error_code) | running/succeeded/failed/interrupted，重启不伪报成功 |

逐操作连接、foreign_keys、5秒busy timeout、写入BEGIN IMMEDIATE。expected_revision防旧页面覆盖。进程模型锁防并发收费，OS目录锁禁止同目录双服务。云端在事务外调用，完成再比较版本保存；崩溃可能已计费，不自动补发。
用户词库维持localStorage；knowledgeId=user:词库ID:词条ID，同名不同库不合并。内置UUID不随排序变化，生成器保留已有身份。旧无knowledgeId作品不凭标题推断关联；全量词库SQLite化未实施。

## 生命周期、安全与限制

倒计时沿用时间戳、切页暂停。抽题取消撤销锁定延迟回调，generation阻止旧回调更改新挑战。HTTP模式仅解释→追问/回答→自主修正→保存，不把原Mock反馈/脚本当真实结果。
Key仅环境/密码框→后端内存，不写SQLite/Store/localStorage；不记录原始服务商错误。云端只收知识点/解释，明确同意后调用。HTTPS端点，无凭据/查询参数，不跟重定向，默认不用系统代理。
httpx每阶段超时60秒，前端等待65秒，并非严格端到端总时限。前端超时后服务端可能仍运行；相同请求ID用于成功重放，不直接重复收费。失败任务需新ID重试，运行中返回BUSY。额度按进程计数，重启不续授权。响应128KiB上限，无自动重试。
ASR无媒体落盘/转码。未来Transcript含segments(id,start,end,text)、引擎模型来源；先同中文样片比较候选，再实现确认稿与报告绑定。Mock版本测试不等于真实ASR验收。
