# 炼知 · LianZhi

思考在前，AI 在后。原项目名：选题罗盘（Knowledge Compass）。单机知识创作工作流，保留知识挑战和视频复盘两个独立入口。

## 当前状态（2026-10-17）

范围来自 [MVP正式任务书](docs/MVP_TASK_V1.0.md)，不代表旧PRD全部获批。

| 能力 | 实际状态 |
| --- | --- |
| 四词库、导入、抽题、倒计时 | 已实现；Node回归通过；本轮浏览器未验证 |
| FastAPI同源托管前端 | 实际本机HTTP测试通过 |
| 解释→追问→回答→修正→SQLite→重启读取 | Stub模式的实际HTTP与前端脚本测试通过；内存DOM，非浏览器测试 |
| DeepSeek | 适配器已实现；协议/失败测试用MockTransport；已通过1次真实DeepSeek请求、回答修正保存及实际进程重启读回；浏览器全流程未验收 |
| 无Key案例 | 明确标记example的预存协议夹具，不是历史真实调用 |
| 视频复盘、AI反馈/复核/讲稿 | 原Demo Mock；未接真实服务/媒体/SQLite |
| ASR | 只有接口类型，未安装引擎或模型 |

无Key可以学习、保存解释、查看档案和预存案例；真实追问报未配置，不自动替换Mock。主动选择mock才使用开发Stub。

## Windows快速启动

实际环境：Windows 11 x64、Python **3.12.14**、SQLite **3.53.1**、Node **24.18.0**。其他系统/版本未验证。需安装Python 3.12；开发机本轮使用应用附带Python，系统py无注册解释器。

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m backend
```

打开 **http://127.0.0.1:8000**；接口文档 **http://127.0.0.1:8000/docs**；Ctrl+C停止。单worker，仅绑定本机。无需前端构建、FFmpeg、ASR模型或GPU。

数据默认 %LOCALAPPDATA%\KnowledgeCompass，自动初始化app.db；启动前可设置 `$env:LIANZHI_DATA_DIR='可写目录'`。同目录只允许运行一个服务。备份先停服务再复制数据目录，不要用删除数据库解决错误。

## 模型配置

应用“设置”填写endpoint、模型和密码框Key，再应用配置。Key只在后端进程内存，重启重填，不回显、不进SQLite/localStorage。留空保留当前Key，清除按钮移除内存Key。

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
- backend/：FastAPI、sqlite3、模型适配、未来ASR接口；无ORM/队列/账号。
- tests/：API、存储、错误、实际进程测试。
- scripts/sync-topics.cjs：维护124个内置UUID；改词库后执行 `node scripts/sync-topics.cjs` 并审核生成文件，勿重建已有UUID。
- [架构/API](docs/ARCHITECTURE.md) · [复现](docs/REPRODUCE.md) · [演示](docs/DEMO.md) · [第三方](docs/THIRD_PARTY.md)
- [决策](docs/00-文档约定与决策.md) · [PRD](docs/01-产品需求文档PRD.md) · [约束](AGENTS.md) · [交接](HANDOFF.md)

## 限制

活动草稿/计时/Mock视频记录在内存；导入词库在浏览器localStorage，未迁SQLite。本轮SQLite只保存挑战闭环，列表最多最近500条。解释不可覆盖，修正追加；schema v1仅初始化与新版本拒绝，未来破坏性迁移另行设计。已保存解释可查阅，尚无中途记录恢复编辑入口。
真实AI已做1次成功验证，累计费用额度最多3次；ASR/FFmpeg、真实视频、其他硬件未验收。未打包桌面程序；整体开源许可待决定，未创建GitHub远程仓库或发布。
