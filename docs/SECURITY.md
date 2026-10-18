> 2026-10-18 视频专项后的状态：密钥生命周期不变；SQLite现为v2，HTTP视频入口已是真实本地ASR，云端AI视频报告仍未接入。音视频/文本只留本机；新接口与限制见[ASR](ASR.md)。下文“本轮”测试数与无ASR说明是此前密钥任务历史记录。

# API Key 安全配置（2026-10-18 当前实现）

## 首次配置与新电脑

安装README所列依赖，以本人Windows用户启动本机服务，进入“设置与帮助”，填写已允许端点、模型和自己的Key。选择“记住 API Key”后点击“应用配置”；页面显示“密钥已保存”且无错误才代表确认保存成功。未勾选只在后端进程内存使用。输入框在提交后清空，状态接口不返回明文；“已配置”仅表示格式/模型已配置，不证明服务商已接受或账户有余额。

**仓库可以复现应用，不代表会携带开发者本机保存的密钥。评委需要使用自己的凭据。** 不将Key写入聊天、源码、普通配置文件或Git；程序不自动加载.env。单纯复制仓库或数据库不会迁移系统凭据。

## 凭据后端与标识

实际依赖：keyring 25.7.0、pywin32-ctypes 0.2.3；传递依赖jaraco.classes 3.4.0、jaraco.context 6.1.2、jaraco.functools 4.6.0、more-itertools 11.2.1，已锁requirements。参考[keyring官方说明](https://github.com/jaraco/keyring)与[Windows后端实现](https://github.com/jaraco/keyring/blob/v25.7.0/keyring/backends/Windows.py)。

应用直接构造并检查 `keyring.backends.Windows.WinVaultKeyring`，不调用get_keyring，不读取自动发现的第三方凭据后端；固定 `persist='local machine'`（实际值2），使用当前Windows用户的Credential Manager，跨应用进程重启保存，不选择漫游或明文后端。不可用/缺依赖/非Windows时明确报错，仅会话使用，不创建明文替代文件。

服务名为 `LianZhi/<规范化绝对数据目录SHA256前24位>/<规范化端点SHA256>`，账户名固定 `api-key`。供应商由端点主机及可选/v1路径确定，不同端点、不同数据目录独立；同供应商不同模型共享同一端点凭据。切换端点不发送上一端点的内存Key；切换不会自动删除其他端点的凭据，删除操作只针对当前应用端点。若需删除此前端点的凭据，可配置回该端点后执行删除。

数据目录的 `llm-settings.json` 只含mode/endpoint/model/remember_key，通过同目录临时文件replace保存，不含Key或Key派生值。SQLite Schema仍v1且无新增列/表。浏览器Store/localStorage/sessionStorage不持有Key。Windows同一用户权限下的其他程序可能访问该用户凭据；此方案不提供同一用户下的恶意进程隔离。

## 生命周期与优先级

1. 启动在数据目录锁内读取非敏感配置，显式的LLM_MODE/LLM_BASE_URL/LLM_MODEL分别覆盖保存值；Key按 **LLM_API_KEY > 当前端点已保存凭据 > 未配置**。只有remember_key=true才自动读取系统凭据。不进行网络探测、模型请求或自动重试。
2. 页面输入新Key并应用：替换本次会话Key。勾选记住时写系统凭据并读回校验；同端点留空保留现有值。切换端点则清除原内存值，只有新输入或勾选记住后读取该端点凭据才可用。
3. 取消勾选并应用：删除当前端点已保存凭据，关闭自动恢复，保留当前内存Key；来源若原为saved则改记session。不是仅“未来不再保存”。
4. 删除按钮：立即清空内存，关闭记住，删除并校验当前端点的系统凭据。系统失败时不会显示已删除，而显示状态未确认/旧凭据可能仍存在；非敏感文件写入成功后下次不会自动恢复该残留凭据。文件也失败时会提示，下次配置可能仍为旧值，应先重试删除。
5. UI明确输入优先用于当前会话；环境变量本身不会被改写。环境Key尚未从启动环境移除时，删除后当前进程不能使用它，但下次启动会重新读取环境Key。撤销环境Key须从启动终端移除LLM_API_KEY再重启。
6. API Key本地格式只校验8–2048个无空白的可打印ASCII字符，不强行使用某家前缀。401/403继续沿用认证/配置失败提示，保留解释和凭据供用户替换/删除；不将服务商原始响应、请求头或Key写日志，不以格式校验冒充真实认证通过。

保存/读回失败时，新的内存Key仍可在本次会话使用，remember=false并显示credential_error，不保证已替换旧系统凭据；必须按提示重试或删除。非敏感配置写入失败也单独提示。没有已保存凭据或读取失败不阻止应用启动；没有Key仍可本地学习、保存解释、查看example。未发现旧版明文持久化代码，无自动迁移、无用户数据扫描/删除。

## 本地API限制

服务仍单worker监听127.0.0.1。已有Host、Origin、请求体上限保护保留，敏感设置POST必须application/json，拒绝不匹配/null Origin和API的cross-site/same-site Fetch Metadata请求，不开放CORS。浏览器跨站预检不能取得敏感写入许可；无浏览器来源头的本机CLI仍可访问，这不是账号认证系统。

默认只允许api.deepseek.com，HTTPS/443，空路径或/v1，不接受用户名、密码、query、fragment、反斜杠和空白字符。自定义供应商须由操作者在启动前设置可信LLM_BASE_URL，其主机加入该进程的允许列表，不能由网页任意扩展。切换端点不复用其他端点Key；请求不跟随重定向，不读取系统代理。默认端点与/v1被视作不同凭据标识。

不修改模型Prompt/收费额度/文字外发同意或live/example/mock边界。原来的视频复盘仍是Mock，本轮回归通过不等于已接入真实ASR或真实视频模型。

## 实际验证与限制

在当前Windows 11用户下执行（未使用真实Key或收费模型）：

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m pip check
Push-Location demo
Get-ChildItem tests/test-*.js | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw $_.Name } }
Pop-Location
```

结果：45项pytest通过（1条已有Starlette/httpx弃用警告），pip check通过；9个Node脚本exit0，历史部分脚本仅诊断打印。新增23项凭据相关pytest覆盖隔离存储/恢复/替换/删除、认证失败、格式/端点限制、CSRF防护、写文件/系统存储失败、环境优先和无明文降级。真实Windows凭据测试启动四个连续HTTP服务进程，在随机临时目录派生的凭据名保存假token，重启读取、替换、重启、删除、重启确认未配置，最后finally删除测试凭据；未触碰用户凭据。检查服务日志、SQLite、非敏感配置无测试token原文。

新增Node测试运行正式api/app/views代码，以DOM/HTTP替身验证空密码框、记住字段、清空输入、保存/失败状态转义、删除防重复和Store/localStorage无token。现有知识挑战Stub/MockTransport、SQLite进程重启、视频Mock版本等回归通过。

首轮凭据集成测试扫描Windows锁文件被拒，调整为日志/数据库/配置文件扫描后通过；前端脚本曾在根目录执行导致旧test-sound相对路径失败，按README在demo目录运行全部通过，未改旧音效测试。

尚未验收：真实浏览器操作/视觉/刷新（工具此前初始化失败）、Windows整机重启、另一台机器/其他系统；本轮未实际发送模型请求，认证错误仅用MockTransport。不要用这些测试宣称真实Key有效或真实视频流程已完成。
