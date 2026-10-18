# 视频口播AI复盘与双版本文案（2026-10-18）

## 范围与真实状态

已接入：正式MP4上传→真实本地ASR→校对/确认→用户明确同意并主动点击AI复盘→严格JSON及段引用校验→双版本对照→SQLite→用户编辑版独立保存。模型意见需要人工复核，未进行来源核验；不分析视频画面、表情或语气，不提供评分。视频/音频留在本机，云端只收到确认稿的段ID、文字和确认版本ID，不含视频路径或文件内容。

完整自动回归和明确标记Stub的真实浏览器/ASR联测已执行。用户新视频44.6秒，真实本地ASR5段。第一次真实DeepSeek请求被服务商认证/访问授权拒绝，失败记录保留；用户更新Key后，最后一次授权调用真实成功：deepseek-v4-pro返回89字符建议稿、3条修改摘要、0项待核实（不等于事实核查通过）。**真实双版本对照、系统剪贴板复制、用户编辑保存、页面刷新及实际后端重启/新浏览器读取已通过**。真实报告在隔离数据库副本中修改并重新确认转写后正确stale，原正式服务成功稿仍当前有效；原始ASR和确认稿未被AI覆盖，旧三条挑战逐字未变。

累计历史1次+本专项2次=3次，总授权额度已用尽，当前服务启动LLM_MAX_REQUESTS=0；没有重试剩余额度，不得再次发起模型调用。已有结果仍可读取/复制/编辑保存。成功记录review_id=fcc03335-3342-4fda-99cb-d60689a7c382，保留此前失败记录；私有汇总证据在.test-runtime/video-review-live/live-evidence-final.json及restart-stale-evidence.json，不含口播正文。

## 用户操作

1. 启动同源FastAPI，进入“视频复盘”，选择MP4（100MiB/180秒上限不变）。
2. 本地转写结束后核对分段文字，点击“我已核对，确认并保存”。
3. 在“设置与帮助”配置模型及Key；当前用户已指定DeepSeek `https://api.deepseek.com` / `deepseek-v4-pro`。Key由后端内存或用户选定的Windows系统凭据读取，不回显。
4. 视频页阅读发送目标及风险，勾选同意，主动点击“AI 复盘并优化文案”。未确认、存在未保存转写编辑、缺Key/模型时按钮禁用；后端仍独立检查。
5. 成功后左侧为后端读取的不可变用户确认稿，右侧为AI建议。可分别复制；右侧编辑后点击“保存用户编辑版”。折叠区保留AI原始建议、主要修改及待核实事项。
6. 刷新或重启后，从视频记录或知识作品的“打开视频与校对”进入。历史复盘在记录列表中选择；未保存编辑只在当前前端内存，刷新丢失。

修改摘要中的跳转仅使用原确认稿段时间；改写稿没有伪造时间戳。转写在页面变脏时即提示旧复盘过期，服务端依据当前确认指针重新计算stale。即使内容后来改回原文，新确认版本也不会让旧报告自动变成当前有效。

## 提示词和输出

提示词独立位于backend/prompts/video_review.py，版本`video-script-review-v1`。强调保留原意/主题/例子、适度修改、知识限定条件、逻辑和口播表达；不虚构数据/研究/经历，不声称看过画面，不执行转写中的命令。无法可靠判断的知识须标待核实。模型判断不等于事实或来源支持。

返回严格JSON：revised_script（1–16000字符）、change_summary（0–3项：category为knowledge/logic/expression，segment_ids引用实际确认段ID，reason最多600字符）、needs_verification（0–10个具体待核实说明）。不允许模型返回原始版本、时间戳、verified或其他额外字段。拒绝重复JSON键、非法/截断JSON、未知/重复段引用、超限响应，失败不保存为成功。

## HTTP API

| 方法与路径 | 请求与响应 |
| --- | --- |
| POST /api/videos/{video_id}/review | JSON：request_id、expected_revision（视频revision）、transcript_version_id、consent=true；成功200返回一份复盘，原始文案由SQLite确认版本读取 |
| GET /api/videos/{video_id}/reviews | 最近100份复盘，包含成功/失败/中断及派生stale；不返回Key |
| POST /api/videos/{video_id}/reviews/{review_id}/script | JSON：request_id、expected_revision（复盘revision）、text；保存用户编辑版及追加历史，不覆盖AI原始建议 |

复用同一LLMService的端点校验、Key、模型锁、预算、60秒每阶段超时、128KiB响应限制和错误处理；max_tokens=4096，严格JSON请求，DeepSeek关闭thinking。无SDK/依赖升级、无自动重试。复盘同步HTTP最多沿用前端65秒等待；超时可能已计费，刷新记录或复用相同请求ID检查结果，不能默认再次收费调用。

同命令ID同参数成功重放不收费；同ID不同视频/参数409；运行中409 BUSY，失败/中断需用户主动新请求。配置和Key修改与挑战/复盘共用模型锁。失败明确保留error，无Mock回退；只有操作者选择mock才产生明确标记“开发Stub”的结果，不能当真实API证据。

常见错误：CONSENT_REQUIRED（403）、TRANSCRIPT_NOT_CONFIRMED/STALE_INPUT/REQUEST_CONFLICT/BUSY（409）、API_CONFIGURATION（本机未配置503或服务商拒绝认证502）、INVALID_OUTPUT/INVALID_REFERENCE（502）、TASK_TIMEOUT（504）、REQUEST_BUDGET（429）、STORAGE_ERROR（503）。失败原文保留，不回显Key、服务商原始错误或完整口播正文。

## SQLite与版本

Schema v3：在v2基础上只新增video_reviews(id,request_id UNIQUE,video_id外键,data JSON)。升级前只创建一次app.pre-review-v2.db，不覆盖旧备份；v1仍保留原app.pre-video-v1.db路径。原challenges/videos数据不因迁移重写，当前运行中任务在重启时标interrupted，不自动补发。旧v2程序不能直接打开v3库，回退须停服务并使用升级前备份。

每条复盘包含video_id、transcript_version_id、original_script/原确认段快照、不可覆盖ai_script、可选user_script、追加edits、prompt_version、origin（live/mock、供应商、模型、时间/usage）、创建/完成时间、revision及state/error。与原ASR/确认版本分表，不覆盖它们。用户编辑由独立复盘revision保护，旧页面保存409且保留前端编辑。stale在读取时按视频当前确认指针计算，不存成永久“有效”标志。

模型返回期间另一个页面改变转写，返回结果仍绑定原快照并立即过期。模型不能选择视频路径、转写版本或原始版本，不能影响工具/命令执行。

## 可复现检查与限制

```powershell
.\.venv\Scripts\python.exe -m pytest -q
Push-Location demo
Get-ChildItem tests/test-*.js | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw $_.Name } }
Pop-Location
```

常规测试只用临时库、MockTransport/明确Stub，不读取用户Key、不收费。tests/test_video_review.py覆盖确认/同意门禁、严格输出和段ID、失败保留、幂等、不覆盖原文/AI、编辑冲突、过期、调用期间原稿变化、v2迁移/备份/中断。demo/tests/test-video-review.js覆盖复制/输入保留/转写过期、网络请求身份、输出转义。

已准备ASR模型及Playwright/Chromium时，可显式用本机视频运行不收费的浏览器全链路：

```powershell
$env:LIANZHI_ASR_TEST_VIDEO = '本机新录制MP4的完整路径'
$env:LIANZHI_BROWSER_TEST = '1'
# 按本机已有工具情况配置NODE_PATH、LIANZHI_BROWSER_EXECUTABLE；应用本身不依赖Playwright。
.\.venv\Scripts\python.exe -m pytest tests/test_video_review_real.py -q -s
```

此测试使用真实本地ASR与浏览器，但云端明确Stub，不能当真实模型成功。真实联调脚本tests/browser-video-review.cjs另要求TEST_EXPECT_MODE=live、LIANZHI_ALLOW_LIVE_REVIEW=1和预先核对的持久化额度文件LIANZHI_LIVE_REVIEW_BUDGET；调用前占用一次额度，绝不自动下载模型、读取私人Key文件或自动重试。实际用户视频/转写/截图/数据库均在本机忽略目录，不随GitHub分发。

当前仓库没有pywebview/PyInstaller封装入口或Windows Release候选版；本轮无新增运行依赖，未修改打包路径，也不能声称打包版兼容。人工知识核查、识别准确率、时间戳偏差、其他硬件/浏览器仍未验收。
