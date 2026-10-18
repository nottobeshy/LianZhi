# 火焰罗盘正式集成（2026-10-19）

## 来源与范围

来源为 `prototypes/flame-compass/` 独立 Demo 的方案 A：柔和 SVG、V2 质感升级、强度80%、速度2.0×。复制原有9个上缘锚点、三层路径/渐变、固定软化滤镜、错相谐波、辉光及最多26颗余烬；保留原型外缘上弧形态，没有改为全圆火环。80%沿用原型方案 A 的强度语义，作用于余烬生成；火舌高度仍由抽题等级控制。2×用于累计视觉时间与余烬运动，不改变业务时间。

独立 Demo 的 HTML/CSS/JS 未改，仅 README 更新集成状态。正式页面没有方案切换、滑条、模拟词条或第二套抽题算法。首页原230px主体、抽题原96px/窄屏76px主体和指针样式保留；锁定后复用同一个抽题罗盘节点，让单次亮起和回落完整结束。配置页不新增原本不存在的罗盘，其他卡片/按钮布局保持原结构。

## 文件与职责

| 文件 | 变动 |
| --- | --- |
| `demo/js/flame.js` | 新增共用火焰模块、帧调度、SVG/余烬、生命周期 |
| `demo/css/flame.css` | 新增限定在 kc-root 的动画样式；装饰层不接收点击 |
| `demo/index.html` | 加载上述两文件，先于 compass/app |
| `demo/js/views.js` | 标记首页挂载点，复用抽题罗盘小段 HTML |
| `demo/js/compass.js` | 注入 request/cancel 调度器；原速度、角度、缓停公式保留 |
| `demo/js/app.js` | 在原渲染及 draw.js 回调中接线，pagehide 清理 |
| `demo/tests/test-flame.js` | 无依赖调度生命周期单测 |
| `tests/browser-flame-compass.cjs` | 正式页面四屏宽、10次抽题、跳过/取消/暂停/故障降级验收 |

同轮文档：AGENTS、HANDOFF、根 README、demo/README、原型 README、ARCHITECTURE、文档约定与决策及本说明。未修改后端、Schema、Prompt、词库、draw.js、sound.js、api.js、store.js、app.css。

## 状态接线与清理

- `FlameCompass.mountAll(app)` 按 home/draw 标识幂等挂载；同页重渲染复用节点，离开页面销毁不再出现的实例。`get(key)` 返回控制器，`destroyAll()` 清理全部实例。
- `beginDraw` 仍先由 `Store.pickDraw` 决定结果；火焰 `start()` 只重置视觉。原 `onTick(i,total)` 同时调用指针/火焰 `setPhase`，等级先升后降；不增加业务计时器。
- 原 `onLock` 保持一次 SoundFx.lock，再通知指针/火焰。火焰保护重复 lock，目标短暂1.18，340ms后目标回到0.25，700ms后清除亮起状态。跨锁定卡重渲染不重启光效。取消走 `idle()`；页面导航/pagehide 销毁并清理抽题。
- 所有火焰与抽题指针共用一个原生 RAF；各自回调/状态独立。没有火焰 setTimeout/setInterval，没有逐帧 DOM 重建。余烬采用局部伪随机噪声，不消耗抽题 Math.random 序列。
- document.hidden 或 prefers-reduced-motion 暂停共享 RAF；减少动态时保留静态低焰。可见后恢复；pagehide 清空，bfcache pageshow 重新挂载。隐藏期间仍遵循原业务定时器，不改变抽题结果或时序。
- 初始化/绘制异常隔离；模块资源缺失时原抽题/指针可继续。canvas不可用仍显示SVG。装饰层 aria-hidden / pointer-events:none；SVG渐变ID按实例唯一。滤镜半径固定，不逐帧改变 blur。

## 实际验收

Windows / Python3.12 / Node / 现有 Playwright + Chromium148，未安装新依赖。

- 常规 pytest：**73 passed, 4 skipped，29.62秒**；默认跳过需要显式资源的ASR/浏览器用例。
- 全部既有11个前端脚本 exit0，新增 test-flame.js exit0（共12个）。部分历史脚本仅打印检查结果，不等同每条规则均有断言。
- 新增真实浏览器脚本通过：375/768/1366/1920px首页及锁定卡无水平溢出；检查并保存截图。10次自然抽题结果等于预选结果、每次仅一次 Lock、火焰平滑升起/收敛、锁定后微燃、原DOM复用；双击跳过仅一次锁定，切页取消不播Lock，动画资源清零，反复渲染无重复节点。
- 应用原生RAF最高同时1个；指针/火焰为两个逻辑订阅。减少动态媒体查询动态切换、合成visibility事件、pagehide清理通过；模块加载失败时抽题仍成功。page_errors=[]，正式验收脚本拦截并确认api_writes=[]。
- 隔离库真实本地ASR→确认→**明确Stub**复盘→复制→编辑保存→过期→真实后端重启/新浏览器读回：**1 passed，17.00秒**。正式已有live视频及用户编辑稿只读浏览正常、stale=false、无页面错误；本轮没有重新请求真实AI。
- 保护清单最初30项均相等；最终仅原型README按任务更新状态，其余29项（后端、原型HTML/CSS/JS、抽题/音效/API/Store等）无变化。
- 首次浏览器脚本已通过10次抽题但共享帧总数断言失败：探针误计入Playwright自己的RAF轮询；按调用源限定为应用动画后完整重跑通过，没有修改业务代码规避。

证据为本机忽略目录 `.test-runtime/flame-integration/browser/`（evidence.json与截图）、`.test-runtime/flame-video-stub-20261019/`。不提交私人视频、数据库、Key或截图。

## 启动与复验

现有8000服务直接刷新页面。需要重启时保留旧数据目录和零收费预算（不要启动第二个8000进程）：

```powershell
cd E:\Projects\KnowledgeCompass
$env:LIANZHI_DATA_DIR='E:\Projects\KnowledgeCompass\.test-runtime\browser'
$env:LLM_MAX_REQUESTS='0'
.\.venv\Scripts\python.exe -m backend
```

打开 http://127.0.0.1:8000/ → 首页 → 知识挑战 → 抽取知识点 → 等待锁定或点击舞台跳过。回配置/切页可以检查清理。Key不要发到聊天或写入命令。累计3次真实授权额度已用尽，未经新授权不得增加预算。

```powershell
cd E:\Projects\KnowledgeCompass\demo
node tests/test-flame.js
cd ..
.\.venv\Scripts\python.exe -m pytest -q --basetemp=.test-runtime/flame-regression-recheck
# 需本机已有Playwright和Chromium；按实际环境提供NODE_PATH和可选LIANZHI_BROWSER_EXECUTABLE
node tests/browser-flame-compass.cjs
```

## 回退与限制

分支 `codex/flame-compass-integration`；集成前源代码保留提交 `ab2fd76`，原先未提交的ASR/复盘成果已先保存，未覆盖旧改动。不要reset工作区；需回退时只反向应用本次火焰文件差异。没有合并冲突，未推送。

本轮未再次收费验证AI追问；协议/保存由现有自动测试覆盖。扬声器实际听感、OS真实后台节流、长期低配性能、其他浏览器、Windows打包未验证；visibility为浏览器内合成事件，不能声称完成OS后台验收。画面基于既有方案移植和截图检查，最终审美仍由用户确认。完成本专项后不继续美化。
