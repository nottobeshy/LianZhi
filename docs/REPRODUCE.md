# Windows独立复现说明（2026-10-17）

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
要验证live，设置页选择live，填已确认端点/模型及自己Key；留空保留当前Key，不回显；清除后再调用应报未配置。先完成独立解释并明确同意文字外发。
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
用户通过设置页配置后，真实DeepSeek请求1次成功；回答/修正保存、进程重启逐字段读回以及正式前端脚本读取/详情/导出通过（内存DOM）。重启Key清除，累计真实费用请求1次，进程计数重置不代表新授权。ASR引擎、模型下载、中文样片、FFmpeg、CPU/GPU性能未执行。其他评审机器/系统/版本未验收。
