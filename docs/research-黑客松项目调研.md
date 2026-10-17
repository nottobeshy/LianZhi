---
title: 全球 AI Agent / AI 应用类黑客松获奖项目调研（2023–2026）
date: 2026-10-13
tags:
  - 黑客松
  - AI-Agent
  - 趋势洞察
  - Devpost
  - 参赛对标
  - 2026武汉1024AI黑客松
---

# 全球 AI Agent / AI 应用类黑客松获奖项目调研（2023–2026）

> 检索完成日期：2026-10-13 · 地域范围：以全球/海外赛事为主（北美、欧洲、全球线上），少量国内赛事作对照 · 收录项目：36 个（另附同类项目线索若干）

---

## 执行摘要

1. **四年间，黑客松的主角从"AI 工具"变成了"AI Agent"，再变成了"Agent 系统"。** 2023 年获奖项目多是"用 GPT-4 帮人做一件事"（教学视频、社媒文案、DevOps 助手）；2024 年转向多智能体框架与垂直副驾（911 接线、立法解读）；2025–2026 年则是平台方 SDK + 协议互操作 + 生产级工程的主场。Microsoft 在其 2025 年 AI Agents Hackathon 中直接宣称"2025 是 AI agent 元年"[^ms-agents]。

2. **评审口径明显从"想法惊艳"迁移到"工程可信"。** 2026 年 GitLab AI Hackathon 的评委对夺冠项目 LORE 的评价是"这感觉像产品，不像黑客松项目"，而该项目的亮点之一是"黑客松项目居然带了 43 个测试"[^gitlab]。同期谷歌 Gemini Live Agent Challenge 单列出"最佳技术执行与 Agent 架构"奖项；Claude Opus 4.8 Build Day 冠军 Tekton 用"独立 verifier 子智能体 + 自纠循环，直到 20 项测试全通过"作为核心卖点[^claude]。

3. **规模与奖金在 2025–2026 年跃升一个数量级。** Bolt "世界最大黑客松"超 13 万人报名、奖金池超 100 万美元[^bolt][^vibecoding]；XPRIZE Build with Gemini 奖金池 200 万美元、头奖 50 万美元[^winbig]；TreeHacks 2026 奖金总额超 60 万美元[^competehub]；微软 AI Agents Hackathon 1.8 万名开发者注册、570 份提交[^ms-agents]。

4. **协议成为新的"评分点"。** MCP、A2A、AG-UI、Coral Protocol、Band 等出现在 2026 年多个赛事的要求或技术栈中——GKE Turns 10 的获奖项目几乎清一色使用 ADK + A2A + MCP；Band of Agents 整个赛事主题就是"跨框架多 agent 协作"[^gke][^lablab-band]。2025 年 OpenAI x AI Tinkerers 华沙站的独立扫描显示，当时仅 3% 的参赛作品在工作流中嵌入 MCP[^splx]——一年内 MCP 从边缘变成标配，这个落差本身就是本调研最有价值的一个信号。

5. **黑客松正在变成融资与产品的跳板，而不只是周末竞赛。** UC Berkeley AI Hackathon 2024 冠军 Dispatch AI 借助赛事奖金与 SkyDeck 门票，把 36 小时原型做成了估值 100 万美元的公司[^mlh-bill]；2026 年 XPRIZE 的夺冠项目 Polyfork 是"已经产生真实收入"的产品（首月 54 名付费用户）[^neodrop-oct]；Tekton、Custom Universe、LORE 等团队均在赛后宣布开源或继续商业化[^claude][^sparkone][^gitlab]。

6. **最稳的选题集中在"社会影响"赛道。** 无障碍（视障导航、口吃者语音、手语）、医疗（手术副驾、阿尔茨海默找物、临床指挥台）、一线救援（消防、空管、911）、文化遗产（历史建筑重建、家族口述史）在两届 TreeHacks、两届 UC Berkeley AI Hackathon、Gemini Live Agent Challenge 的获奖名单中反复出现。纯效率类工具若无极强 demo，很难在评委注意力争夺中胜出。

---

## 调研方法

### 检索计划

1. **先按"赛事类型"分层铺开**：平台方自办赛（OpenAI / Anthropic / Google / Microsoft / GitLab / ElevenLabs 等）→ 高校旗舰赛（UC Berkeley AI Hackathon / TreeHacks / PennApps / Cal Hacks）→ 社区与垂直赛（lablab.ai / AI Tinkerers / MLH 体系）→ 高奖金开放赛（Bolt / XPRIZE）。
2. **再按年份回填**，确保 2023 / 2024 / 2025 / 2026 四个年份都有可比样本，便于做趋势纵向对比。
3. **对每个项目做交叉验证**：优先官方公告（主办方博客、GitHub、Devpost 项目页、组织方社交账号）作为一手来源；媒体报道作为二手来源；仅单一来源的加标注。
4. **刻意"反向检索"**：主动搜索同一事件的负面/异见信息（如奖项口径冲突、日期矛盾、数据夸大），把冲突写进"局限与未核实项"，而不是选一个看起来更漂亮的版本。

### 关键词矩阵

| 维度 | 英文关键词 | 中文关键词 |
|---|---|---|
| 赛事 | hackathon winner, grand prize, announcing the winners, project gallery, first place | 黑客松 冠军、获奖项目、大奖 |
| 主体 | AI agent, multi-agent, agentic AI, computer use, voice agent, MCP, A2A | 智能体、多智能体、MCP 挑战赛 |
| 平台 | Devpost, lablab.ai, MLH, AI Tinkerers, Cerebral Valley, Devfolio | 魔搭、Datawhale |
| 年份 | 2023 / 2024 / 2025 / 2026 | 2023–2026 |

### 候选信息源（实际使用的优先级）

**一手来源**
- 主办方官方博客：claude.com、cloud.google.com、bolt.new、elevenlabs.io、about.gitlab.com、cerebras.ai
- 官方赛事页与项目库：Devpost（`*/devpost.com/project-gallery`）、lablab.ai 赛事页与团队页、aitinkerers.org、microsoft.github.io
- 组织方官方社交账号：Google for Developers、Anthropic、Microsoft Tech Community、Cerebras、Devpost、lablab.ai、LangChain（LinkedIn）
- 团队自述：GitHub 仓库 README、开发者个人博客与 LinkedIn 帖

**二手来源（仅用于交叉验证或补充细节）**
- 高校官方新闻与科研机构网站（SJSU、Berkeley SCET、USTC、Carleton）
- 科技媒体（TechCrunch、Neowin、The Knight News、EdTech Innovation Hub）
- 赛事情报聚合站（neodrop.ai AI Competition Radar、vibecoding.app、winbigdaily、competehub）

**明确排除**
- TechCrunch Disrupt **Startup Battlefield**（这是创业路演赛，不是黑客松，2025 冠军 Glīd 未收录）
- 纯营销软文与榜单类内容农场；无法确认获奖事实的项目；自媒体转述且与其他来源冲突的数字

### 事实与推测的区分约定

- 下文所有**奖项名称、名次、团队名、奖金数额**均标注来源；来源冲突时以主办方官方口径为准，冲突本身记录在"局限与未核实项"。
- 标注 `[推测]` 的内容为分析判断，非事实陈述。
- 标注 `[单一来源]` 的项目仅有一个独立来源，宜二次核实。

---

## 核心发现

### 发现一：主题演进有一条清晰的三段式主线

| 阶段 | 时间 | 获奖项目的共性 | 典型代表 |
|---|---|---|---|
| **工具期** | 2023 | 用 LLM 替人完成一件具体的事；单 agent + 工具调用；技术栈是 GPT-4 + LangChain + 向量库 | EduJason、MarkU、RAGression、Metropolis |
| **副驾期** | 2024 | 从"工具"到"智能体"；多智能体编排（AutoGen / LangChain）成为热词；垂直行业副驾涌现；奖金开始带投资属性 | Dispatch AI、Agent OS、Legislative Guru、Hades |
| **系统期** | 2025–2026 | 平台 SDK 主导（OpenAI Agents SDK、Azure AI Agent Service、Claude Agent SDK、Gemini ADK）；协议互操作（MCP/A2A/AG-UI）成为评分点；从聊天走向语音、视觉、硬件与长程任务；强调可验证性与证据链 | ORION、Tekton、LORE、Freight Room、Longshot |

### 发现二：2025 年是"平台自办赛"的转折点

三大模型厂商在 2025 年密集自办黑客松，且都要求（或强烈鼓励）使用自家 Agent 框架：
- OpenAI：OpenAI Agents SDK（华沙站 40 队、1,000+ 申请）、Agents Everywhere 全球赛（近 700 份提交）[^splx][^aitk]
- Microsoft：Azure AI Agent Service / Semantic Kernel / Copilot Studio（1.8 万开发者）[^ms-agents]
- Anthropic：Claude Agent SDK / Claude Code（巴黎站、Opus 4.8 Build Day 310 人 / 1,500 申请）[^aitk-paris][^claude]
- Google：ADK + A2A + Gemini Live API（Gemini Live Agent Challenge 11,878 人 / 1,536 项目 / 151 国）[^gcloud-live]

**含义 [推测]**：厂商办赛的目的是生态卡位，因此"是否用对框架、是否展示框架的独有能力"对获奖概率的影响，已经接近甚至超过创意本身。

### 发现三：规模曲线与奖金曲线在 2025–2026 抬升最陡

| 赛事 | 年份 | 规模 | 奖金池 |
|---|---|---|---|
| UC Berkeley AI Hackathon | 2023 | 1,200 名黑客 | 4 队各 $50K 投资[^skydeck] |
| UC Berkeley AI Hackathon | 2024 | 371 个项目 | 约 $100K，头奖 $25K[^datatunnel] |
| Bolt 世界最大黑客松 | 2025 | 13 万+ 报名 | $1M+，头奖 $100K[^bolt] |
| Microsoft AI Agents Hackathon | 2025 | 1.8 万注册 / 570 提交 | $45K 现金[^ms-agents] |
| Nano Banana Hackathon（Google DeepMind） | 2025 | 832 项目 → 50 名获奖者 | $40 万非现金[^neowin] |
| Gemini Live Agent Challenge | 2026 | 11,878 人 / 1,536 项目 / 151 国 | 未公开总额[^gcloud-live] |
| TreeHacks | 2026 | 1,000+ 黑客 / 15,000 申请 | $600K+[^competehub] |
| XPRIZE Build with Gemini | 2026 | 26,000+ 报名 | $2M，头奖 $500K[^neodrop-oct][^winbig] |

### 发现四：评委会越来越在意"能不能信"

2026 年多个夺冠项目把"可验证性"当作核心叙事：
- **Tekton**：每个构件都能点回源文档，形成"证据链"；独立 verifier 子智能体在隔离上下文中打分[^claude]
- **AgentZero**（TreeHacks 2025）：卖点就是"可验证的"链上交易 agent[^agentzero]
- **Quorum**（UC Berkeley AI Hackathon 2026）：多智能体系统的校验层，防止上游幻觉向下游级联[^berkeley26]
- **RedAgent**（GitLab AI Hackathon 2026）：复核 AI 生成的安全报告，闭合"AI 发现 → 开发者行动"之间的信任缺口[^gitlab]
- **Apollo**（微软 2025）：自反思 RAG，主动检查知识缺口[^ms-agents]

同期，OpenAI 华沙站的独立安全扫描揭示出反面：98% 的团队除模型自带护栏外没有任何额外防护，0% 考虑了数据源/供应链投毒，86% 团队承认担心越狱但只有 10% 真正做了加固[^splx]。**这说明"可信"是普遍的短板，也因此是差异化的机会。**

### 发现五：黑客松的产出正在被资本市场接走

- Dispatch AI：赛事奖金 + SkyDeck 门票 → 融资、估值 $1M[^mlh-bill]
- Vita Care of Graviti：A2A 家庭医疗协调网络，拿下 Google for Startups AI Agents Challenge 2026 全球大奖（面向创业公司）[^devpost-gfs]
- Polyfork：XPRIZE 夺冠时已有 54 名付费用户、首月 $4,428 收入[^neodrop-oct]
- LORE / GraphDev 等：GitLab 官方明确以"生产级"作为评奖取向[^gitlab]

---

## 项目总览表

> 奖项列保留主办方原始表述；`[单一来源]` 表示仅检索到 1 个独立来源。

| 项目 | 黑客松 | 年份 | 奖项 | 领域 | 一句话介绍 | 来源 |
|---|---|---|---|---|---|---|
| Tekton | Claude Opus 4.8 Build Day（旧金山） | 2026 | 第一名 | 文化遗产 / 3D 重建 | 输入历史建筑照片，Claude 跨 339 个施工步骤重建带证据链的 3D 模型 | claude.com 官方[^claude] |
| Sim Francisco | Claude Opus 4.8 Build Day | 2026 | 第二名 | 城市模拟 / 预测 | 用人口普查数据造 1 万合成市民，预测选举结果误差 0.4% | claude.com 官方[^claude] |
| Custom Universe | Claude Opus 4.8 Build Day | 2026 | 第三名 | 机器人 / 合成数据 | 一张手机照片生成可实时编辑的 3D 场景，为机器人造训练数据 | claude.com 官方[^claude] |
| ORION | Gemini Live Agent Challenge（全球） | 2026 | 大奖（Grand Prize） | 医疗 / 手术 | 语音驱动的机器人手术副驾，术者不脱无菌状态即可调取数据 | Google Cloud 官方[^gcloud-live] |
| drone-copilot | Gemini Live Agent Challenge | 2026 | Live Agent 赛道冠军 | 硬件 / 无人机 | 用自然语言直接与无人机对话，指令导航并自主巡检 | Google Cloud 官方[^gcloud-live] |
| Sankofa | Gemini Live Agent Challenge | 2026 | Creative Storyteller 冠军 | 文化 / 叙事 | 把碎片化家族史变成有声有画的沉浸式叙事"AI 格里奥" | Google Cloud 官方[^gcloud-live] |
| Moonwalk | Gemini Live Agent Challenge | 2026 | UI Navigator 冠军 | 桌面代理 | 纯语音的免手桌面助手，替你操作鼠标键盘完成预订等流程 | Google Cloud 官方[^gcloud-live] |
| Sidekick | Agents Everywhere Hackathon with OpenAI | 2026 | 全球第一 + 最佳 Ambiguous AI | 办公 / 会议 | 会议中的 AI 队友，边开会边查资料并产出文档、幻灯片、表格 | AI Tinkerers 官方[^aitk] [单一来源] |
| Arto | Agents Everywhere Hackathon with OpenAI | 2026 | 全球第二 | 硬件 / 机器人 | 把 AI agent 接到 Arduino，让其调度模拟巴黎地铁并处理故障 | AI Tinkerers 官方[^aitk] [单一来源] |
| ScreenMate | Agents Everywhere Hackathon with OpenAI | 2026 | 全球第三 | 浏览器代理 | 理解当前页面的浏览器 agent，可代填表单并在敏感操作前请示 | AI Tinkerers 官方[^aitk] [单一来源] |
| LORE | GitLab AI Hackathon | 2026 | 大奖（Grand Prize） | 企业知识管理 | 8 个 agent + 路由器的"活的组织记忆引擎"，自带 43 个测试 | GitLab 官方[^gitlab] |
| Gitdefender | GitLab AI Hackathon | 2026 | Google Cloud 大奖 | 安全 / DevOps | 在代码评审流中发现并修复安全问题，直接开出合并请求 | GitLab 官方[^gitlab] |
| GraphDev | GitLab AI Hackathon | 2026 | Anthropic 大奖 | 代码理解 | 画出代码知识图谱，展示系统如何随时间演进与影响面 | GitLab 官方[^gitlab] |
| Vita Care of Graviti | Google for Startups AI Agents Challenge | 2026 | 全球大奖 | 医疗协调 | 家庭 AI 助手之间用 A2A 直接对话，打通碎片化的医疗协调 | Devpost 官方[^devpost-gfs] [单一来源] |
| Polyfork | XPRIZE Build with Gemini | 2026 | 大奖 $500K | 3D 资产 / 电商 | 把 3D 模型当"程序"卖，买前可改尺寸配色；AI 工厂周产 175+ 模型 | neodrop 雷达 / winbigdaily[^neodrop-oct][^winbig] |
| Mira | TreeHacks 2026（斯坦福） | 2026 | OpenAI 奖第一名 + 最具影响力奖 | 无障碍 / 医疗 | 智能眼镜上的多模态 agent，帮阿尔茨海默患者语音找失物 | 团队自述[^mira] [单一来源] |
| Longshot | TreeHacks 2026 | 2026 | Modal 赞助商大奖 | AI 编程 | 一句话生成任意软件，数百 coding agent 并行、每小时上千次提交 | 团队自述[^longshot] [单一来源] |
| Maestro | TreeHacks 2026 | 2026 | 音乐赛道（Suno 支持） | 无障碍 / 音乐 | 用摄像头把手势映射到乐器，拿扫把也能演奏并获 AI 教练反馈 | EdTech Innovation Hub[^maestro] |
| Amie Wei 的 cart-to-kitchen | GKE Turns 10 Hackathon | 2025–26 | 大奖（Grand Prize） | 零售 / 购物 | 分析购物车并用 Gemini + ADK + A2A 推荐今晚做什么菜 | Google Cloud 官方[^gke] |
| Freight Room | Band of Agents Hackathon（lablab.ai） | 2026 | 一等奖 $3,500 | 物流 / 多智能体 | 货轮锚泊时由 agent 监控 AIS，给出可审批的滞期费应对方案 | lablab.ai 官方[^lablab-band][^lablab-freight] |
| Tailored Labs | Bolt 世界最大黑客松 | 2025 | 大奖 $100K | 创作者工具 | 用自然语言指令完成专业级视频剪辑，一键生成成片 | bolt.new 官方[^bolt] |
| Weight Coach | Bolt 世界最大黑客松 | 2025 | 第二名 | 健康 / 消费 | 手机扫食材 + 语音对话，生成个性化餐食建议与做法 | bolt.new 官方[^bolt] |
| GibberLink | ElevenLabs × a16z 全球黑客松 | 2025 | 全球总冠军 | 语音 / 协议 | 两个 AI 语音代理通话中发现彼此是 AI，切换为机器信号 | ElevenLabs 官方[^11labs] |
| RiskWise | Microsoft AI Agents Hackathon | 2025 | 最佳总冠军 $20K | 供应链 | 用多 agent 从航运与新闻数据中提前识别供应链风险 | Microsoft 官方[^ms-agents] |
| Apollo | Microsoft AI Agents Hackathon | 2025 | 最佳 C# Agent $5K | 深度研究 | 协调 Athena 研究引擎与 Hermes 分析器的深度研究元 agent | Microsoft 官方[^ms-agents] |
| Buffalos AI | Internet of Agents Hackathon（Coral Protocol） | 2025 | 一等奖（App Builder） | 测试 / QA | 用浏览器 agent 自动"体感测试"你的 app | lablab.ai 官方[^lablab-ioa] |
| LIORA | Internet of Agents Hackathon | 2025 | 一等奖（Agent Builder） | 多模态生成 | 自动为图片/视频生成任务挑选最合适的模型与 API | lablab.ai 官方[^lablab-ioa] |
| InsightPilot | Internet of Agents Hackathon | 2025 | Crossmint + Mistral 奖 | 用户研究 | 克隆并"访谈"十万名用户，60 秒跑完两千场个性化访谈 | lablab.ai 官方[^lablab-ioa] |
| NexusGuardAI | IBM watsonx Orchestrate Agentic AI Hackathon | 2025 | 一等奖 | 企业合规 | 从 8,000 名开发者的 200 个项目中夺冠的 agentic 自动化方案 | lablab.ai 官方[^lablab-ibm] [单一来源] |
| GDELT Open Intelligence Agent | ArangoDB + NVIDIA hackathon（GTC 2025） | 2025 | 第一名 | 情报 / GraphRAG | 用自然语言查询全球事件实时情报，并动态选择合适工具 | Devpost 官方[^devpost-nv] |
| AskStreets | ArangoDB + NVIDIA hackathon | 2025 | 第二名 | 城市规划 | 把自然语言查询翻译为街道网络分析 | Devpost 官方[^devpost-nv] |
| Terminator | PennApps XXVI | 2025 | Cerebras 赛道冠军 | 游戏 / 多智能体 | 策略/移动/射击/追踪多个专用 agent 由"Overlord"协调的多人游戏 | Cerebras 官方[^cerebras] |
| ReVoice | Hack Knight Fall 2025（纽约市立大学皇后学院） | 2025 | 最佳总冠军 | 无障碍 | 为口吃者分析语音并实时生成流畅版本，同时保留本人音色 | The Knight News[^knightnews] [单一来源] |
| VoiceVitals | Emory Hacks Fall 2025 | 2025 | 医疗赛道冠军 | 医疗 | 分析短语音签到，帮临床早期发现认知衰退与痴呆迹象 | 主办方官方[^emory] [单一来源] |
| CarMommy | Emory Hacks Fall 2025 | 2025 | Rogue 赛道冠军 | 消费 / 语音 | AI 买车轮流打电话给经销商砍价、比价并生成宣传视频 | 主办方官方[^emory] [单一来源] |
| LifeTrace Timeline | Nano Banana Hackathon（Google DeepMind） | 2025 | 50 名获奖者之一 | 图像 / 生活记录 | 把原始位置数据变成个性化手绘日记时间线 | Neowin / cnBeta[^neowin] |
| Dispatch AI | UC Berkeley AI Hackathon | 2024 | 大奖（$25K + SkyDeck 支持） | 公共安全 | 911 接线 AI 副驾，缓解呼叫中心人手不足 | Berkeley SkyDeck / MLH[^mlh-bill][^datatunnel] |
| Agent OS | UC Berkeley AI Hackathon | 2024 | 决赛 Top 8 | 开发者工具 | 用自然语言创建多智能体工作流 | 颁奖录像摘要[^briefy] |
| Legislative Guru | LangChain Agents & Compound AI Systems Hackathon | 2024 | 第一名 | 法律 / 公民 | 把复杂立法法案翻译成对日常生活的影响 | LangChain 官方[^langchain] |
| Hades | LangChain Agents & Compound AI Systems Hackathon | 2024 | 第二名 | 客服 | 用智能体赋能客户支持 | LangChain 官方[^langchain] |
| Metropolis / CureGenie / Prosper AI / ALIGNED | UC Berkeley AI Hackathon | 2023 | 大奖（各 $50K SkyDeck 投资） | 游戏 / 金融等 | 含沉浸式游戏 NPC、面向 Gen Z 的理财顾问等 | Berkeley SkyDeck 官方[^skydeck] |
| MarkU | lablab.ai LangChain × GPT Agents Hackathon | 2023 | 第一名 | 营销 | 为定向受众自动生成社媒文案，并进入孵化项目 | lablab.ai 官方[^lablab-lc] |
| GPT-Swarm | lablab.ai LangChain × GPT Agents Hackathon | 2023 | 决赛入围 | 研究 / 尽调 | 用 LLM 群体智能协作对初创公司做背景尽调 | lablab.ai 官方[^lablab-lc] |
| EduJason | Cerebral Valley ChatGPT 插件黑客松 | 2023 | 一等奖 | 教育 | 通过 ChatGPT 插件在数秒内生成个性化教学视频 | 腾讯新闻 / 夕小瑶科技说[^edujason] [单一来源，二手] |
| RAGression | TUM Hackathon @Microsoft | 2023 | 第一名 | 教育 / RAG | 面向学生支持的学生问答机器人，含自动邮件分流 | 团队 GitHub[^ragression] |

---

## 项目详情

### 2026 年：协议、生产级与长程任务的年份

#### 1. Tekton — Claude Opus 4.8 Build Day 第一名

- **团队**：Holly Tang（设计师）、Austin Burgess。两人一个月前在 Code with Claude 活动的咖啡队里认识[^claude]
- **赛事**：Anthropic 在旧金山举办的 12 小时 Claude Opus 4.8 Build Day，1,500 人申请、310 人参加，每人 $500 credits[^claude]
- **做法**：给定一栋历史建筑，Claude 自动检索图纸、施工文档、照片与图例，跨 **339 个增量施工状态**组装出完整 3D 模型；点击任一构件都能看到该细节的来源与放置理由（团队称之为"证据链"）
- **为什么获奖**：验证完全跑在 Opus 4.8 上——独立 verifier 子智能体在隔离上下文窗口中给每次重建打分，自纠循环反复检查构件位置，直到**20 项测试全部通过**
- **团队自述的关键经验**："先把整个项目画出来再动手"——他们用一份完整 PRD 加约 50 张工单的 Notion 板，把任务拆成独立工作流并行跑[^claude]
- **后续**：团队计划开源 Tekton，供博物馆、历史学者、非营利组织与政府使用[^claude]
- **验证状态**：✅ 双来源（Anthropic 官方博客 + blockchain.news）
- **⚠️ 日期冲突**：blockchain.news 称活动在 5 月 13 日举办、模型 5 月 28 日发布；Anthropic 官方博客明确写 **6 月 13 日**。以官方为准

#### 2. Sim Francisco — 第二名

- **团队**：Tanmayi Priya Dasari、Tejas Prabhune（UC Berkeley 电气工程与计算机科学专业，校内机器学习社团认识）[^claude]
- **做法**：基于美国人口普查数据生成 10,000 名合成市民，每人有自己的 demographics、个人史与世界观，落在旧金山地图上并实时对新闻做出反应；提问即"民调"整座合成选民
- **成绩**：在模型知识截止于 2023 年 10 月的前提下，预测 2024 年总统大选得票率 81.3%（实际 83.8%），预测旧金山 2024 年 3 月 Prop A 得票率 70%（实际 70.38%）[^claude]
- **工程亮点**：Opus 4.8 不只写前后端，还做了一次成本优化——把 10,000 名居民聚类成 **300 个代表性人物**，在不牺牲准确率的前提下降低成本[^claude][^blockchain]
- **验证状态**：✅ 双来源

#### 3. Custom Universe — 第三名

- **团队**：Jake Stevens、Mauricio Pereira（当天早上才认识，两人都有 MIT 机器人研究背景）[^sparkone]
- **做法**：单张照片 → 可实时编辑的写实 3D 场景。删物体、用手机扫描一罐饮料作为 3D 模型拖进场景、一句指令把房间变成露台
- **真实用途**：为机器人生成合成训练数据——"扫描一台满是按钮的机器，放进一个场景，在你从没存在过的环境里训练模型"[^sparkone]
- **团队自述的技术细节**：一年前尝试过同样的事但撑不住；这次 Opus 在 Ultracode 模式下找到了他们从未发现的图像模型变体——该变体会缓存场景部分内容，因此只需重绘发生变化的部分；推理跑在 Lambda 的 H100 上，由 Claude 通过 SSH 远程操作[^sparkone]
- **验证状态**：✅ 双来源（Anthropic 官方博客 + SparkOne 复盘）
- **⚠️ 名称差异**：SparkOne 记录活动原定名为 "Claude Fable 5 Build Day"（围绕 Fable 5 模型，奖金池 $150,000 Claude credits），但 Fable 在活动前夜被下架，团队转而用 Opus 4.8 完成[^sparkone]

#### 4. ORION — Gemini Live Agent Challenge 大奖

- **作者**：Aditya Shukla[^gcloud-live]
- **赛事规模**：11,878 名参与者、1,536 个项目、151 个国家；三个赛道（Live Agent / Creative Storyteller / UI Navigator），要求用 Gemini Live API + Agent Development Kit (ADK) + Google Cloud[^gcloud-live]
- **做法**：ORION（Operating Room Intelligent Orchestration Node）是机器人手术的语音驱动副驾。外科医生自然说话即可获得答案、实时数据显示与视觉辅助，**全程不需要脱离无菌状态**
- **同场其他冠军**：drone-copilot（Bryen Param，用自然语言指挥无人机导航与自主巡检）、Sankofa（Jeremiah Somoine，把碎片家族史编织成水彩图像 + 语音旁白 + 环境声的沉浸叙事）、Moonwalk（Enaiho Uwas Paul & Aman Kumar Sah，纯语音免手桌面助手）。另设"最佳多模态集成与用户体验"（Wand）、"最佳技术执行与 Agent 架构"（JohnKeats.AI）、"最佳创新与思想领导力"（Rayan Memory）三个单项奖[^gcloud-live]
- **验证状态**：✅ 多来源（Google Cloud 官方博客 + Google for Developers 官方 LinkedIn + daily.dev 摘要 + 中文行业日报）
- **⚠️ 未核实**：获奖名单公布的精确日期。唯一可确定的是两位获奖者受邀在 Google Cloud Next 2026（拉斯维加斯）演讲，且 2026-05-15 的行业日报已报道该结果 → `[推测]` 公布时间在 2026 年 4–5 月

#### 5. Sidekick / Arto / ScreenMate — Agents Everywhere Hackathon with OpenAI

- **赛事**：AI Tinkerers 全球城市联合单日黑客松，2026-09-12，OpenAI 为 headline sponsor，CopilotKit / OpenRouter / Exa / Auth0 / Ambiguous AI / Trigger.dev / Mozilla / Google Cloud Run 为赞助方；主题是"把 agent 放到人们已经在工作、聊天、生活的地方，而不是另一个聊天框里"[^aitk-event]
- **获奖**：
  - **第一名 Sidekick**（Alexander Payne，中国香港分会）——会议中的 AI 队友，在团队交谈的同时研究问题并产出文档、幻灯片、表格；同时拿下"最佳 Ambiguous AI 使用"奖
  - **第二名 Arto**（Mathias C.、Louis D.，巴黎分会）——把 AI agent 接到 Arduino 的框架；demo 让 agent 接管模拟巴黎地铁线路，协调列车并响应故障；基于 OpenAI Codex SDK
  - **第三名 ScreenMate**（Viren Chauhan，亚特兰大分会）——理解你在看的页面、按需做研究、协助填表，敏感决策前暂停请你批准
- **规模**：近 700 份提交、15 个全球决赛项目、5 个获奖项目[^aitk]
- **验证状态**：⚠️ 单一来源（AI Tinkerers 官方 LinkedIn 公告），但来源为主办方官方账号，可信度较高

#### 6. LORE — GitLab AI Hackathon 大奖

- **赛事**：2026-02-09 至 03-25，Devpost 平台，Google Cloud 与 Anthropic 联合赞助；近 7,000 名开发者提交 600+ agents/flows，奖金总额 $65,000；19 名评委评审 18 天[^gitlab]
- **做法**：LORE（Living Organizational Record Engine）用 **8 个 agent + 一个路由器**把每个问题分派给正确的 agent，含防止知识图谱循环的环路检测逻辑、可视化面板与碳排放追踪；命令行工具自带 **43 个测试**[^gitlab]
- **解决的问题**：资深工程师离职时带走的那部分团队知识
- **评委点评**：Anthropic 的 April Guo 写道："这感觉像产品，不像黑客松项目。"[^gitlab]
- **其他大奖**：Gitdefender（Google Cloud 大奖，代码评审流内发现并修复安全问题）、GraphDev（Anthropic 大奖，代码知识图谱）、DocSync（Anthropic 亚军，Detector/Writer/Reviewer 三 agent，有把握才开 MR，没把握就开 issue 交人）、Aegis、Time-Traveler（数据库迁移预演）、RedAgent、Launch Control、GreenPipe（绿色 Agent 奖，扫描 CI/CD 碳排放）[^gitlab]
- **验证状态**：✅ 官方博客 + Devpost 官方 LinkedIn

#### 7. Polyfork — XPRIZE Build with Gemini 大奖

- **赛事**：Google 与 XPRIZE 合办，90 天内在 Gemini 上做出有收入的新生意，全球开放；26,000+ 名 builders 注册、五个类别；2026-09-25 在洛杉矶 Moonshots LIVE 现场决赛，评委包括 ARK Invest 的 Cathie Wood、Anduril 的 Palmer Luckey、Zynga 的 Mark Pincus、Google DeepMind 的 Logan Kilpatrick[^neodrop-oct]
- **获奖**：Polyfork（Lucas Martinic，德国）拿下 **$500,000 大奖**；Tician Cierre（墨西哥）$200,000；MyFixam（尼日利亚/美国）$100,000；LaunchBridge、DodoPrep 各 $100,000[^neodrop-oct]
- **做法**：把 3D 模型当"程序"卖——买家可在下载前调整尺寸、配色并二次创作。背后是一个 AI agent 工厂，每周发布 175+ 个模型；首月 583 个模型的目录带来 54 名付费用户、$4,428 收入[^neodrop-oct]
- **验证状态**：✅ 双来源（neodrop AI Competition Radar + winbigdaily；奖金池 $2M/$500K 头奖亦为 XPRIZE 官方公布）
- **⚠️ 需要注意**：收入与目录数字全部来自公司自述，且类别奖按**总营收**而非留存发放

#### 8. Mira / Longshot / Maestro — TreeHacks 2026

- **Mira**（Madhuhaas Gottimukkala、Nathan Z.、Victor Chen、Antonio Alonso-Stepanov）——拿下 **OpenAI 奖第一名 + 最具影响力奖**。硬件是智能眼镜，多模态 agent 帮阿尔茨海默患者：用语音询问失物位置（把房间重建为 3D 场景图，结合多视角检测、深度估计与相机位姿定位物体，输出语音方向指引与交互式点云可视化）、回答医学问题并附临床证据、紧急情况下通知照护者[^mira]
- **Longshot**（Matthew Chow 等）——**Modal 赞助商大奖**。一句话生成任意软件：planner agent 递归派生 sub-planner 与 worker agent，数百个 agent 并行、每小时上千次提交；demo 是"一次性生成一个 Minecraft"[^longshot]
- **Maestro**（Vansh Gadhia 等，斯坦福）——音乐赛道（Suno/NVIDIA 等支持）。"有把扫帚就等于有件乐器"：MediaPipe + OpenCV 追踪手势与物理标记，实时映射到音符与乐器，FluidSynth 播放，Demucs + Basic Pitch 做转写与分轨，跑在 NVIDIA DGX Spark 上压低延迟；还带 AI 教练，事后分析姿态、节奏与表现[^maestro]
- **赛事规模**：TreeHacks 2026 被称为美国最大高校黑客松，1,000+ 黑客、15,000 份申请、奖金总额 $600K+，演讲者包括 YC 的 Garry Tan 与 OpenAI 的 Sam Altman[^longshot][^competehub][^evanyu]
- **验证状态**：⚠️ Mira 与 Longshot 均为**单一来源**（团队自述的 LinkedIn 帖），奖项名称具体、可信但未经主办方第三方确认；Maestro 为媒体来源

### 2025 年：Agent SDK 元年与规模跃升

#### 9. Tailored Labs — Bolt 世界最大黑客松大奖

- **作者**：Adrian Humphrey（单人或小团队）[^bolt]
- **赛事**：2025 年 6 月，四周线上赛，**13 万+ builders 报名**，被称为史上规模最大黑客松；奖金池 $1M+，60+ 个奖项；Anthropic、Cloudflare、Supabase、Sentry、Algorand 参与赞助[^bolt][^vibecoding]
- **做法**：AI 视频时间轴编辑器。上传未剪辑素材（未剪采访、播客、晃动的 B-roll、47 个"嗯"和 12 段尴尬沉默），AI 通读全片、剪掉死气、去口癖、对齐音频、挑出最佳片段——"把 8 小时的剪辑工作压到 4 分钟"，剩下一版 10 分钟的成片；核心功能是端到端 one-shot generation[^bolt]
- **其他奖项**：第二名 Weight Coach（Sergiy Dybskiy，AI 饮食规划 + 手机扫食材）、第三名 KeyHaven（Tommy Thomas，API Key 全生命周期管理）[^bolt]
- **为什么值得注意**：报名规模证明了"vibe coding 黑客松"作为工具采纳顶漏斗的有效性[^vibecoding]
- **验证状态**：✅ 三来源（bolt.new 官方博客 + vibecoding 复盘 + Devpost 更新页）

#### 10. GibberLink — ElevenLabs × a16z 全球黑客松总冠军

- **作者**：Boris Starkov、Anton Pidkuiko[^11labs]
- **赛事**：2025-02-22/23，全球 6 个线下 + 3 个社区 + Discord 线上同时开赛，主题 AI Agents，300+ 个项目；评委含 ElevenLabs CEO、Vercel CEO、PostHog CEO、Lovable CEO 与两位 a16z 合伙人[^11labs]
- **做法**：两个 AI 语音代理在电话通话中发现对方也是 AI，随后切换到 ggwave 协议、用机器可解的信号继续对话——demo 录像在社交平台走红并被 Forbes 报道，评委一致同意授予全球总冠军[^11labs]
- **其他获奖**：Hugo Tour Guide（线上第一，个性化旅行 agent）、Pep（线上第二，多模态语音+视觉物理治疗教练）、Agent SFX（线上第三，用视觉模型分析 Godot 游戏节点结构并生成配音与音效）、Playcade（fal.ai 奖）、PostHog Meeting Copilot（PostHog 奖）[^11labs]
- **验证状态**：✅ 三来源（ElevenLabs 官方博客 + Devpost 赛事页 + 第三方汇总站）

#### 11. RiskWise / Apollo — Microsoft AI Agents Hackathon

- **赛事**：2025-04-08 至 04-30，三周免费线上赛，**18,000+ 名开发者注册、570 份提交**，20+ 场专家直播（Semantic Kernel、AutoGen、Azure AI Agents SDK、Microsoft 365 Agents SDK）；评委为微软工程师与 PM[^ms-agents]
- **RiskWise（最佳总冠军 $20,000）**：供应链风险分析系统。用 AI agent 梳理海量供应链数据（航运排期、贸易中断新闻等）标出潜在风险——港口延误到地缘政治事件；技术栈 Python（AI 逻辑）+ React/Next.js + Azure AI Agent Service + Semantic Kernel + SQL[^ms-agents]
- **Apollo（最佳 C# Agent $5,000）**：深度研究元 agent。C# (.NET / ASP.NET Core) + Semantic Kernel + Azure AI Agent Service(GPT-4) + React + PostgreSQL/pgvector。架构亮点：Apollo 调度两个专家 agent（Athena 研究引擎、Hermes 分析器）在群聊中协作；采用**自反思 RAG**，用向量记忆迭代检索并让 Hermes 检查知识缺口；**两阶段合成**——先生成分节内容再合成带引用的完整报告；状态机 + 异步事件管线，使上下文能跨会话保持[^ms-agents]
- **其他类别冠军**：Konveyor（Python）、HealthIA / Bit2Brain（Java）、WorkWizee（Copilot）、ModelProof: Sentinel AI Chat（JS/TS）、Tariffed（Azure AI Agent Service）[^ms-agents][^ms-github]
- **验证状态**：✅ 官方博客 + 官方 GitHub 仓库 + Microsoft Tech Community

#### 12. Internet of Agents Hackathon — lablab.ai × Coral Protocol

- **赛事**：2025-09-14 至 09-21 线上 + 09-20/21 纽约 Solana Skyline 线下；3,002 名参与者、392 支队伍、136 个应用[^lablab-ioa]
- **Buffalos AI（Agent Builder Track 一等奖）**：用浏览器 agent 对你的 app 做"体感测试"（vibe test）[^lablab-ioa]
- **LIORA（Agent Builder Track 一等奖）**：为图像/视频生成任务自动挑选最合适的工具，"你不必再管 API key，也不用追最新最佳实践"[^lablab-ioa]
- **Reef（二等奖）**："AI Agents 界的 Lovable"——可视化拖拽编排多智能体工作流并实时协作[^lablab-ioa]
- **InsightPilot（Crossmint + Mistral 两个一等奖）**："克隆并访谈十万名用户"：60 秒内跑 2,000 场个性化一对一访谈、分析 20 万+ 数据点，成本约为传统方式的 1%[^lablab-ioa]
- **验证状态**：✅ 官方赛事页 + lablab.ai 官方 LinkedIn

#### 13. GDELT Open Intelligence Agent — ArangoDB + NVIDIA hackathon

- **赛事**：主题"用 GraphRAG 与 NVIDIA cuGraph 构建下一代 Agentic App"，冠军在 NVIDIA GTC 2025 现场于 ArangoDB 展台公布[^devpost-nv]
- **获奖**：第一名 GDELT Open Intelligence Agent（用自然语言查询提供全球事件实时情报，并动态为每个任务选择最合适的工具）、第二名 AskStreets（把自然语言查询翻译为街道网络分析）、第三名 NeuThera AI-Driven Drug Discovery Toolkit（端到端药物发现自动化 + 交互式人机协同药物设计）[^devpost-nv]
- **验证状态**：✅ Devpost 官方客户案例页（含现场照片描述与项目说明）

#### 14. Terminator — PennApps XXVI（Cerebras 赛道冠军）

- **作者**：Prajit Viswanadha、Shashank Yaji[^cerebras]
- **做法**：多智能体架构的多人游戏。"不是单个 AI，而是多个专用 agent（策略、移动、射击、追踪）通过一个 Overlord agent 协调"；借助 Cerebras 的超快推理做到接近实时的协调，使系统自适应、可扩展[^cerebras]
- **为什么值得注意**：这是"推理速度 → 新交互形态"这条叙事在黑客松里的清晰样本——参赛者明确说，没有超快推理就做不到这种实时多 agent 协调[^cerebras]
- **验证状态**：✅ 双来源（Cerebras 官方 LinkedIn + 作者 LinkedIn）

#### 15. Dispatch AI — UC Berkeley AI Hackathon 2024 大奖

- **团队**：Bill Zhang 等[^mlh-bill]
- **赛事**：2024 年 UC Berkeley AI Hackathon，371 个项目，Karpathy 做主题演讲，总奖金约 $100K[^datatunnel][^briefy]
- **做法**：911 接线 AI 副驾，在人工接线员忙不过来时代接电话、自动提取位置信息并分派第一响应者[^briefy]
- **奖项**：大奖（Berkeley SkyDeck Fund $25K）+ Intel 一等奖 + AIC "AI for Good" 奖；AIC 与 SkyDeck 两个奖叠加解锁 **$50,000 总支持**与 SkyDeck Pad-13 的 Golden Ticket[^mlh-bill]
- **后续影响**：Bill Zhang 借此把黑客松项目做成一家估值 **100 万美元**的公司；他本人累计参加 50+ 场黑客松、36+ 次获奖、团队奖金累计超 $100K，并写出免费的《The Hackathon Playbook》[^mlh-bill]
- **同场其他决赛项目**：Revision（教材偏见检测）、Agent OS（自然语言建多智能体工作流）、Skyline（城市交通与碳排优化）、Spark（冷电话销售教练）、HearMeOut（客服情绪洞察）、ASL Bridgefy（手语学习）、Greenwise（碳足迹）[^briefy]
- **验证状态**：✅ 多来源（Berkeley SkyDeck 官方 + MLH 官方 Top 50 档案 + 颁奖典礼录像摘要 2 份）

#### 16. Freight Room — Band of Agents Hackathon 一等奖

- **团队**：Band Baaja Baaraat（Varun Bhandari、Chaitanya Manik、Dhruv Patel、Rohan Shah、Vraj Patel、Kelin Patel）[^lablab-freight]
- **赛事**：2026-06-12 至 06-19 线上，lablab.ai 主办，Band + Codeband 平台；4,325 名参与者、1,370 支队伍、391 个应用，奖金池 $10,000+；主题是"让不同框架的 agent 互相发现、共享上下文、协同工作"[^lablab-band]
- **做法**：货轮在锚地停航时滞期费时钟开始走。Freight Room 从实时 AIS 数据捕获异常，通过 Band 召集合适的 agent，最后交给运营经理**一条带成本估算的建议供审批**，背后留有完整审计轨迹[^lablab-freight]
- **同场获奖**：RecoverFlow（二等奖，跨境应收账款催收 9-agent 团队，覆盖 Slack + 语音 + USDC）、ClaimArbiter（三等奖，保险理赔从受理到人工终签，可跨公司边界自动招募外部专家）、AgentWard（临床指挥台，5 个 agent + 硬性安全门 + 人工审批 + 自我纠错审计）、HealthVet（90 秒完成医疗供应商尽调，输出 APPROVE/ESCALATE/REJECT 可审计结论）、DeployGuard（5 个 agent 共同评审 PR 并阻断风险部署）、ProcureGuard（8 个跨框架 agent 审采购单，红队审计员可否决，最终由人签署 SHA-256 封装的审计包）[^lablab-band]
- **验证状态**：✅ 三来源（lablab.ai 赛事页 + 团队页 + 团队负责人 LinkedIn）
- **⚠️ 未核实**：获奖公布的精确日期（线上页面的时间标记口径不一致，可确定在 2026 年 6 月赛事结束后至 7 月之间）

### 2023–2024 年：工具期与副驾期

#### 17. LangChain Agents & Compound AI Systems Hackathon（2024）

- **获奖**：第一名 Legislative Guru（Barath Subramaniam 等）——让复杂立法法案"变得容易理解，并说明它对日常生活的影响"；第二名 Hades（Abhirup Gosh、Ajay Kallepali）——用智能体赋能客户支持；第三名 LazyPMs Inc（Nehil Jain 等）——为 PM 自动生成 release notes[^langchain]
- **为什么值得注意**：这个赛事的名称本身（"Agents and Compound AI Systems"）就是 2024 年的关键词——从 agent 到"复合 AI 系统"；且三个获奖项目全是**替特定知识工作者省时间**的类型，还没出现 2025 年那种硬件/语音/长程任务[^langchain]
- **验证状态**：✅ 主办方 LangChain 官方 LinkedIn

#### 18. UC Berkeley AI Hackathon 2023 — 四个并列大奖

- **赛事**：2023 年 6 月，Berkeley SkyDeck 与 Cal Hacks 合办，自称"史上最大生成式 AI / LLM 黑客松"，1,200 名黑客、36 小时；对许多参赛者来说这是第一次上手 GPT-4 API，参与者从 CS 博士到刚开始写代码的人文学科本科生都有[^skydeck]
- **获奖**：Metropolis、CureGenie、Prosper AI、ALIGNED 四支团队获大奖，各获 Berkeley SkyDeck Fund **$50K 投资**；成果包括沉浸式游戏 NPC、面向 Gen Z 的理财顾问等[^skydeck]
- **为什么值得注意**：$50K 投资型大奖在 2023 年就已出现，说明"黑客松 → 融资"这条路径不是 2025 年才有的；同时 2023 年的获奖项目在类别上明显更"散"——游戏、金融、生物，还没有收敛到 agent 系统[^skydeck]
- **验证状态**：⚠️ 单一来源（Berkeley SkyDeck 官方 newsletter）

#### 19. lablab.ai LangChain × GPT Agents Hackathon（2023）— MarkU 第一名

- **赛事**：7 天，771 名参与者、116 支队伍、17 个可用原型；优胜团队进入 lablab.ai 的 Slingshot 孵化加速计划[^lablab-lc]
- **获奖**：第一名 MarkU（面向定向受众自动生成社交媒体文案）；决赛入围 GPT-Swarm（"群体智能 + 高级语言模型"协作完成复杂任务，用例之一是对初创公司做背景尽调——评估可信度、财务稳健性与增长潜力）、以及"用 AI 整理你的文件存储"[^lablab-lc]
- **为什么值得注意**：GPT-Swarm 在 2023 年就在做 multi-agent 尽调协作，与 2026 年 GitLab 夺冠的 LORE（组织记忆）、Band of Agents 的 ProcureGuard（多 agent 采购审计）属于同一条演化谱系——"多个 agent 互相审阅"这个想法比它流行的时间早了两三年[推测]
- **验证状态**：✅ 主办方 lablab.ai 官方博客

#### 20. Artificial 反面样本：EduJason 与 Cerebral Valley ChatGPT 插件黑客松（2023）

- **赛事**：2023 年 4 月，Cerebral Valley 主办，OpenAI、Stability AI、Replit 赞助，120 名开发者、24 小时，主题是基于 OpenAI 提供的 GPT-4 插件独占访问权[^edujason]
- **获奖**：一等奖 EduJason（通过 ChatGPT 生成个性化教学视频，数秒内产出，场景包括"用 ChatGPT 讲折现现金流分析"和"学 Rust 所有权规则"）、二等奖 InfraGPT（有 Shell 访问权限的 DevOps 助手，可自动训练、监控、调试 PyTorch/TensorFlow/Jax 模型）、三等奖 AutoPM（由 ChatGPT 驱动、可集成 Linear 的产品经理）[^edujason]
- **验证状态**：⚠️ 单一来源且为二手（腾讯新闻转载自媒体"夕小瑶科技说"），官方公告未检索到。**收录原因**：它是 2023 年"插件 + 单 agent"这一形态的典型切片，可用于趋势对比；引用时请谨慎

#### 21. RAGression — TUM Hackathon @Microsoft（2023 第一名）

- **做法**：用 Microsoft 技术栈搭学生支持聊天机器人。技术栈 Next.js 14 + Vercel AI SDK + LangChain + Azure OpenAI(GPT-4) + Qdrant 向量库 + Resend；亮点是**智能邮件模块**——bot 自己判断能否生成合适回复，判断不能则无缝转交正确联系人[^ragression]
- **为什么值得注意**：2023 年获奖作品里已经出现"agent 判断自己能力边界并升级给人"（human-in-the-loop 的雏形），这个模式在 2026 年变成标配（ScreenMate 的敏感操作请示、DocSync 的"没把握就开 issue"、ClaimArbiter 的人工终签）[推测]
- **验证状态**：⚠️ 单一来源（团队自己的 GitHub 仓库 README，标注 "First place winner"）

---

## 趋势洞察

### 洞察一：题材重心从"提效"移向"高风险场景"

对比四年获奖项目的领域分布 `[推测，基于本调研 36 个样本]`：

| 年份 | 主导领域 | 高风险领域（医疗/救援/安全/无障碍）占比 |
|---|---|---|
| 2023 | 教育、营销、DevOps、金融 | 低（约 1/6） |
| 2024 | 公共安全、法律、客服、教育 | 中（约 1/3） |
| 2025 | 健康、无障碍、供应链、测试、企业合规 | 高（约一半） |
| 2026 | 医疗、文化遗产、物流、企业知识、机器人、量子科研 | 高（约一半，且技术门槛显著更深） |

原因分析 `[推测]`：一是顶级模型的"可用下限"提高后，简单提效工具难以体现技术含量；二是大厂平台方办赛时需要展示"在严肃场景下的可靠性"，因此奖项倾向自然偏向高 stakes 场景；三是社会影响类选题天生有故事性，更容易在 2–3 分钟 demo 里打动人。

### 洞察二：技术栈在 2025→2026 发生了明确的"协议化"转折

- **2025 年 4 月**：OpenAI x AI Tinkerers 华沙站对 40 个 agentic 项目做架构扫描，仅 **3%** 使用了 MCP，平均每个项目 4 个 agent + 3 个工具，最复杂的架构有 17 个 agent[^splx]
- **2025 年 9 月**：Stanford Quantum Science Hackathon 直接把"MCP 接入科研工具链"写进题目，获奖项目 CQED-Design-AI 用 agent 做闭环量子器件设计（生成设计 → 仿真 → 分析 → 迭代）[^stanford-quantum]
- **2026 年**：GKE Turns 10 的获奖者几乎全部使用 ADK + A2A + MCP 组合（cart-to-kitchen、CardOS、Cartmate 等）；Gemini Live Agent Challenge 要求 ADK；Band of Agents 整个赛题就是跨框架 agent 协作；Google 甚至给出 A2UI 与 MCP Apps 的三种集成架构模式[^gke][^gcloud-live][^lablab-band][^neodrop-jun]
- **含义**：MCP 在一年内从"少数派技巧"变为"默认基础设施"。**对同一道题，是否用协议、协议用得是否优雅，很可能直接影响评委打分。**

### 洞察三：奖金结构与"非现金价值"的设计在变复杂

- 纯现金时代（2023–2024）：$5K–$25K 现金 + 投资
- 混合时代（2025–2026）：现金 + 云 credits + API 额度 + 硬件 + 面试/孵化机会 + 投资人 office hours
  - 例：TreeHacks 2026 的奖项里包含"保证 YC 面试 / office hours"、"与 Greylock 合伙人 office hours"、"Human Capital 的 $50K 无股权支票"[^competehub]
  - 例：Nano Banana Hackathon 的 50 名获奖者各得 $5,000 Gemini API credits + $1,000 Fal credits + 约 $2,000 ElevenLabs credits（总额 $400K 全部非现金）[^neowin]
- **含义 [推测]**：对参赛者而言，"奖项的实际价值"越来越取决于你能否把 credits 和曝光转成产品；对赞助方而言，黑客松是试用额度与生态绑定的采购手段。

### 洞察四：团队规模在缩小，产出复杂度在上升

- 三支 2026 年顶级获奖团队都是 **2 人**（Tekton、Sim Francisco、Custom Universe），Custom Universe 的两人还是当天早上才认识[^claude][^sparkone]
- 同期产出复杂度没有下降：Tekton 339 个施工状态 + 20 项测试；Sim Francisco 1 万合成市民；Longshot 数百 agent 并行[^claude][^longshot]
- **解释 [推测]**：这是"Agent 能力提升 → 单人杠杆变大"的直接体现，也印证了 AI Engineer World's Fair 2025 "Tiny Teams" 主线的判断[^aiewf]。对个人参赛者是好消息，但也意味着**规划能力（把项目拆成可并行的工单）比编码能力更关键**——Tekton 的 50 张 Notion 工单就是证据[^claude]。

### 洞察五：demo 呈现方式的演化

| 年份 | 典型 demo 形态 | 代表 |
|---|---|---|
| 2023 | 网页/聊天界面截屏 | EduJason、MarkU |
| 2024 | 现场实时演示 + 键盘操作 | Dispatch AI 现场模拟接警 |
| 2025 | 真实硬件 / 语音对话 / 病毒式短视频 | GibberLink（通话录像走红）、Terminator（实时游戏）、drone-copilot |
| 2026 | 带审计轨迹的"可审批输出" + 3D/点云可视化 + 自我验证证据 | Freight Room（一条带成本的建议供审批）、Tekton（证据链）、Mira（点云定位）、MCPHackers（3D 家装） |

**对参赛的直接启发 `[推测]`**：2026 年的评分偏好是"可信的、能被人类审批的、可追溯的输出"，而不是"AI 自动做完一切"。评委要看的是**AI 提出建议 → 人做决定 → 系统留证据**这条闭环。

### 对「选题罗盘」的可借鉴点（附录）

> 结合本调研结论，就我们这个参赛项目，记录几条可执行的观察。非调研事实，属分析建议。

1. **"可验证 / 可追溯"是 2026 年的溢价点，而我们天然占优。** Tekton 的"证据链"、LORE 的"碳追踪 + 43 个测试"、Quorum 的"防幻觉级联"都在为同一件事加分。选题罗盘"每个题目必须附来源、跳过要记录证据缺口"的设计，正好落在这一波评委偏好上——**建议在 demo 里把这条规则作为主线之一显式展示**（例如现场演示一次"来源不足时不造题"）。
2. **人类审批门禁是加分项，不是妥协。** Freight Room 的获奖叙事核心是"交给一位运营经理一条可审批的建议"，ClaimArbiter 是"人工终签"。我们已有的"外发同意门禁"应该被当作亮点而非限制来讲。
3. **"长程任务 + 独立验证子智能体"是被反复验证的技术叙事。** Tekton 用独立 verifier 子智能体在隔离上下文中打分，Apollo 用 Hermes 检查知识缺口。若时间允许，在设计里明确"生成者 / 校验者分离"，会比单纯强调模型能力更打动人。
4. **双人团队 + 工单化规划是最佳实践，不是权宜之计。** 2026 年顶级获奖团队普遍 2 人且靠完整 PRD + 工单并行推进。
5. **demo 视频的"3 分钟"是独立交付物。** Bolt 官方在赛前专门发过《Demo Video Tips》，强调"Make Every Second Count"；Gemini Live Agent Challenge 与 AI Tinkerers 都把 2–3 分钟视频写作明确要求。建议把视频脚本当作与代码同级的交付物提前排期。

---

## 参考来源

### 一手来源（主办方官方）

[^claude]: Anthropic，《Meet the winners of our Claude Opus 4.8 Build Day hackathon》，https://claude.com/blog/meet-the-winners-of-our-claude-opus-4-8-build-day-hackathon
[^gcloud-live]: Google Cloud Blog，《Gemini Live Agent Challenge: Announcing the winners and highlights》，https://goo.gle/42Y2Sn5 ；官方 LinkedIn 公告 https://www.linkedin.com/posts/googledevelopers_geminiliveagentchallenge-activity-7466231904518963200-5L0h
[^gke]: Google Cloud Blog，《GKE Turns 10 Hackathon: Announcing the winners and highlights》，https://cloud.google.com/blog/topics/developers-practitioners/winners-and-highlights-from-gke-hackathon
[^bolt]: Bolt，《The 2025 Bolt Hackathon winners: top 10 apps built in Bolt》，https://bolt.new/blog/2025-bolt-hackathon-winners ；赛事更新页 https://worldslargesthackathon.devpost.com/updates
[^11labs]: ElevenLabs，《Announcing the winners of the ElevenLabs Worldwide Hackathon》，https://www.elevenlabs.io/blog/announcing-the-winners-of-the-elevenlabs-worldwide-hackathon ；Devpost 赛事页 https://elevenlabs-worldwide-hackathon.devpost.com/
[^ms-agents]: Microsoft Tech Community，《AI Agents Hackathon 2025 – Category Winners Showcase》，https://techcommunity.microsoft.com/blog/-/ai-agents-hackathon-2025-category-winners-showcase/4415088 ；赛事主页 https://microsoft.github.io/AI_Agents_Hackathon/
[^ms-github]: Microsoft AI Agents Hackathon 获奖名单提交记录，https://github.com/innovaigs/AI_Agents_Hackathon/commit/e41e4f902216ca4252f1a091fb2d99a4998e2d89
[^gitlab]: GitLab，《GitLab AI Hackathon 2026: Meet the winners》（经 Google 翻译代理访问），https://about-gitlab-com.translate.goog/blog/gitlab-ai-hackathon-2026-meet-the-winners/ ；Devpost 官方 LinkedIn 总结帖 https://www.linkedin.com/posts/devpost_what-an-amazing-group-of-winners-congratulations-activity-7481016689669791744-njX4
[^lablab-ioa]: lablab.ai，《The INTERNET OF AGENTS HACKATHON @SOLANA SKYLINE》，https://lablab.ai/event/internet-of-agents ；官方 LinkedIn 获奖公告 https://www.linkedin.com/posts/lablab-ai_winners-the-internet-of-agents-hackathon-activity-7377361663760433152-zcpj
[^lablab-band]: lablab.ai，《[Recap] Band of Agents Hackathon》，https://lablab.ai/ai-hackathons/band-of-agents-hackathon
[^lablab-freight]: lablab.ai 团队页，《Band Baaja Baaraat on Band of Agents Hackathon》，https://lablab.ai/ai-hackathons/band-of-agents-hackathon/band-baaja-baaraat
[^lablab-ibm]: lablab.ai 官方 LinkedIn，《Meet the Champions of the Agentic AI Hackathon with IBM watsonx Orchestrate》，https://www.linkedin.com/posts/lablab-ai_meet-the-champions-of-the-agentic-ai-hackathon-activity-7402651333251448833-q5mE
[^lablab-lc]: lablab.ai Blog，《Revolutionizing AI: Unveiling the Winning Creations from the LangChain x GPT Agents Hackathon》，https://lablab.ai/blog/revolutionizing-ai-unveiling-the-winning-creations-from-the-langchain-x-gpt-agents-hackathon
[^devpost-nv]: Devpost，《Celebrating hackathon innovation with NVIDIA at GTC (Wrap-up)》，https://info.devpost.com/customer-stories/nvidia-gtc-wrap-up
[^devpost-gfs]: Devpost 官方 LinkedIn，《The Google for Startups AI Agents Challenge 2026 officially has its winners》，https://www.linkedin.com/posts/devpost_what-an-amazing-group-of-winners-congratulations-activity-7481016689669791744-njX4
[^langchain]: LangChain 官方 LinkedIn，《Agents and Compound AI Systems Hackathon》获奖公告，https://www.linkedin.com/posts/langchain_huge-thank-you-to-everyone-who-participated-activity-7229550599363518464-08CP
[^cerebras]: Cerebras 官方 LinkedIn，PennApps XXVI Cerebras Track 获奖公告，https://www.linkedin.com/posts/cerebras-systems_congratulations-to-our-winners-activity-7376346466019291136-fxXj
[^skydeck]: Berkeley SkyDeck Newsletter，《Newsletter – July 6, 2023》，https://dev-skydeck.pantheon.berkeley.edu?p=25283/
[^aitk]: AI Tinkerers 官方 LinkedIn，《Global Winners Announced for Agents Everywhere Hackathon with OpenAI》，https://lnkd.in/p/dmFWSaJw
[^aitk-event]: AI Tinkerers，《Agents, Everywhere: Bots, Channels, & More — Global Hackathon》（2026-09-12 赛事页），https://virtual-events.aitinkerers.org/p/agents-everywhere-bots-channels-more-global-hackathon-2 ；https://singapore.aitinkerers.org/p/agents-everywhere-bots-channels-more-global-hackathon
[^aitk-paris]: AI Tinkerers Paris，《AI Tinkerers and Anthropic AI Agents Hackathon in Paris — Winners, Projects, and Demos》，http://paris.aitinkerers.org/hackathons/h_-Nlv0L-0y2Q/showcase
[^emory]: PROJECT Emory 官方 LinkedIn，Emory Hacks Fall 2025 赛道获奖公告，https://www.linkedin.com/posts/project-emory_emoryhacks2025-emoryhacks-mlh-activity-7397391920273973248-njxU
[^ragression]: 团队 GitHub 仓库，TUM Hackathon @Microsoft 第一名作品，https://github.com/simon-hng/microsoft-hackathon-2023
[^berkeley26]: Devpost，《UC Berkeley AI Hackathon 2026》项目库，https://ai-hackathon-2026.devpost.com/project-gallery
[^berkeley25]: Devpost，《UC Berkeley AI Hackathon 2025》项目库，https://uc-berkeley-ai-hackathon-2025.devpost.com/project-gallery
[^treehacks25]: Devpost，《TreeHacks 2025》项目库，https://treehacks-2025.devpost.com/project-gallery
[^agentzero]: Hayley Zhang 个人 LinkedIn，TreeHacks 2025 AgentZero 获奖说明，https://www.linkedin.com/posts/hayleyzhang0101_treehacks-web3-blockchain-activity-7297373257073119232-QpWh

### 二手来源（交叉验证 / 补充）

[^mlh-bill]: MLH Top 50 官方档案，《Bill Zhang, 23》，https://top.mlh.com/2026/profiles/bill-zhang
[^vibecoding]: vibecoding.app，《Recap: Bolt.new World's Largest Hackathon》，https://vibecoding.app/ai-events/recap/bolt-worlds-largest-hackathon-2025
[^datatunnel]: Datatunnel，UC Berkeley AI Hackathon 2024 颁奖典礼实录摘要，https://datatunnel.io/tldr_listing/andrej-karpathys-keynote-winner-pitches-at-uc-berkeley-ai-hackathon-2024-awards-ceremony/
[^briefy]: Briefy，同上典礼要点摘要，https://briefy.ai/summary/v2/w2779x0xmiyu6zzdp779j6pq/en/andrej-karpathys-keynote-winner-pitches-at-uc-berkeley-ai-hackathon-2024-awards-ceremony
[^splx]: SplxAI，《OpenAI Used Agentic Radar to Judge Europe's Largest AI Hackathon》，https://splx.ai/blog/openai-aitinkerers-hackathon-agentic-radar-insights
[^blockchain]: Blockchain.News，《Claude Opus 4.8 Powers Hackathon Winners' Ambitious Projects》，https://blockchain.news/postamp?id=claude-opus-4-8-hackathon-winners
[^sparkone]: SparkOne，《Builder Day in San Francisco: what seven teams built in a single day》，https://sparkone.nl/en/blog/claude-builder-day-san-francisco
[^neowin]: Neowin，《Google announces Nano Banana hackathon winners, awards $400,000 in prizes》，https://www.neowin.net/amp/google-announces-nano-banana-hackathon-winners-awards-400000-in-prizes ；中文转载 https://www.163.com/dy/article/KAO6807R0511BLFD.html
[^neodrop-oct]: neodrop.ai，《AI Competition Radar: September 27–October 4, 2026》，https://neodrop.ai/post/qODthQbIzp_
[^neodrop-jun]: neodrop.ai，《AI Competition Radar: June 28–July 5, 2026》，https://neodrop.ai/ko/post/v4q0uV9D9Hh
[^winbig]: Win Big Daily，《Hackathon Prizes: The Biggest Tech Competition Payouts》，https://winbigdaily.com/hackathon-prizes/
[^competehub]: CompeteHub，《TreeHacks 2026》奖项设置，https://www.competehub.dev/zh/competitions/devpost28463
[^mira]: Madhuhaas Gottimukkala 个人 LinkedIn，TreeHacks 2026 获奖说明，https://www.linkedin.com/posts/maasg_treehacks-openai-stanford-activity-7429264206975336448-GuCe
[^longshot]: Matthew Chow 个人 LinkedIn，TreeHacks 2026 获奖说明，https://www.linkedin.com/posts/mdchow_we-won-the-sponsor-grand-prize-modal-at-activity-7429968328062046208-h9au
[^maestro]: EdTech Innovation Hub，《Stanford team wins TreeHacks with AI system that turns a broom into a playable instrument》，https://www.edtechinnovationhub.com/news/stanford-team-wins-treehacks-with-ai-system-that-turns-a-broom-into-a-playable-instrument
[^evanyu]: Evan Yu 个人博客，《Winning TreeHacks: Re-defining education in 2026》，https://evanyu.dev/blog/treehacks-2026
[^knightnews]: The Knight News，《Where AI Meets Human Minds: Queens College's Fall 2025 Hack Knight Hackathon Win》（2025-12-09），https://www.theknightnews.com/2025/12/09/where-ai-meets-human-minds-queens-colleges-fall-2025-hack-knight-hackathon-win/
[^stanford-quantum]: Stanford Quantum Science Hackathon 项目与获奖页，http://ai4.science/events/stanford-quantum-science-hackathon
[^edujason]: 腾讯新闻 / 夕小瑶科技说，《120名顶级技术专家用GPT-4搞出的脑洞发明大赏》（2023-04），https://view.inews.qq.com/k/20230426A03HFR00
[^aiewf]: AI Engineer World's Fair 2025 议程与总结（Tiny Teams 主线），https://wf2025.ai.engineer/ ；https://bestaievents.com/blog/ai-engineer-worlds-fair-2025-a-comprehensive-summary/
[^hacknation]: Hack-Nation 官方 LinkedIn，第 3 届 Global AI Hackathon SAP Challenge / VC Big Bet Challenge 获奖公告，https://www.linkedin.com/posts/hack-nation_ai-hackathon-sapchallenge-activity-7399536538742734848-bp_I
[^mcpafrica]: CIO South Africa，《MakwaIT champions Africa's AI future by backing the MCP Hackathon as a Gold Sponsor》，https://cio-sa.co.za/press-releases/press-release-makwait-champions-africas-ai-future-by-backing-the-mcp-hackathon-as-a-gold-sponsor/
[^coingecko]: CoinGecko，《Meet The CoinGecko MCP Hackathon 2025 Winners》，https://www.coingecko.com/learn/mcp-hackathon-winners-2025
[^slidev]: 中国科学技术大学生物医学工程学院，《我院黄哲龙同学在MCP & Agent挑战赛中斩获两项最佳奖项》，https://bme.ustc.edu.cn/2026/0716/c28110a747801/page.htm

---

## 局限与未核实项

### 一、明确的来源冲突（已在正文标注）

| 冲突点 | 版本 A | 版本 B | 处理 |
|---|---|---|---|
| Claude Opus 4.8 Build Day 举办日期 | Anthropic 官方博客：**6 月 13 日** | blockchain.news：5 月 13 日，且称模型 5 月 28 日才发布（与"举办日"自相矛盾） | 采信官方 6 月 13 日 |
| 活动官方名称 | Anthropic：Build Day | SparkOne：原定名 "Claude Fable 5 Build Day"，Fable 5 在活动前夜下架 | 正文以官方名称为主，附注差异 |

### 二、仅单一来源、建议二次核实的项目

| 项目 | 来源 | 风险点 |
|---|---|---|
| Sidekick / Arto / ScreenMate | AI Tinkerers 官方 LinkedIn | 官方账号，但未见独立第三方报道；获奖项目链接为短链，未逐一打开验证 |
| NexusGuardAI | lablab.ai 官方 LinkedIn | 官方账号；但"8,000 builders / 200 projects"口径与 lablab.ai 赛事页未交叉确认 |
| Mira、Longshot | 团队自述 LinkedIn | 奖项名称具体（OpenAI Prize 1st / Modal Grand Prize），但未见主办方 TreeHacks 官方获奖名单确认 |
| Vita Care of Graviti 等 5 项 | Devpost 官方 LinkedIn | 官方账号；赛事页未检索到独立确认 |
| EduJason / InfraGPT / AutoPM | 腾讯新闻转载自媒体 | 二手且为自媒体；未找到 Cerebral Valley 或 OpenAI 的官方公告页。**引用时请视为弱证据** |
| RAGression | 团队 GitHub README | 自述"第一名"，未找到 TUM 或 Microsoft 官方名单 |
| UC Berkeley AI Hackathon 2023 四个大奖团队 | Berkeley SkyDeck 官方 newsletter 单一来源 | 官方，但为 newsletter 而非赛事页；团队成员的后续状态未核实 |
| ReVoice | The Knight News（校媒） | 校媒可信度尚可，但未见 Devpost 页面或 MLH 官方确认 |
| VoiceVitals / CarMommy 等 | PROJECT Emory 官方 LinkedIn | 主办方官方；无第三方来源 |
| HackGT 13 获奖项目（未收入总览表） | neodrop AI Competition Radar 单一来源 | 该雷达自身声明"部分结果未独立核实" |

### 三、未能核实的具体事项

1. **部分奖金数额未公开**：Gemini Live Agent Challenge、GKE Turns 10、Agents Everywhere 的奖金总额与单项金额均未在检索到的来源中明确披露。
2. **部分 Devpost 项目库只有 "Winner" 标记而无奖项等级**：UC Berkeley AI Hackathon 2025 / 2026 项目库中大量项目带 Winner 徽章，但无法区分一等奖与赞助商单项奖。因此本报告未将「Cameron」「pFOG」「ChipChat」「MayDay」「Lucid Voice」「Sentinel」「Inspector」「Quorum」「LifeLink」等列入总览表，仅在趋势部分引用其题材。
3. **"Zenith / PMF Probe"（Anthropic × Forum Ventures 黑客松冠军）全部细节未采信**：仅检索到中文自媒体两篇，声称 Affaan Mustafa（及 David Rodriguez）2025-09-12 在 Anthropic × Forum Ventures 黑客松以 PMF Probe / Zenith 夺冠、奖金 $15,000，并开源 "Everything Claude Code"（38 个智能体、156 项技能、1282 个安全测试、**15 万+ GitHub stars**）。**未找到 Anthropic 或 Forum Ventures 的任何官方公告**，且"15 万 stars"这类数字在同类工具中极不寻常。**本报告未收录此项目**，如需使用请先独立核实。
4. **HiveMind 的奖项口径存在歧义**：TreeHacks 2025 官方项目库将 HiveMind 标记为 Winner，部分媒体报道称其获"大奖（grand prize）"；而同一赛事的其他来源显示 BrailleBot 获最佳硬件、OmNom 获最具创意、Ranger 获最佳想法第二名。**奖项等级未能确证**，故未收入总览表。
5. **Band of Agents Hackathon 获奖公布的具体日期**未核实（可确定在 2026-06-19 赛事结束之后）。
6. **Gemini Live Agent Challenge 获奖公布日期**未核实，`[推测]` 为 2026-04 至 05 月。
7. **UC Berkeley AI Hackathon 2026 的举办日期**未直接核实，`[推测]` 为 2026-06（依据引用该赛事项目库的赛事情报期刊日期）。
8. **MLH 体系无法穷尽**：Major League Hacking 本身不发布统一的年度获奖名单，奖项由各分校赛事自行公布（本报告仅采集到 Emory Hacks、Hack Knight 两例）。MLH 官方站点提供的是 Top 50 Hackers 个人榜与赛事日历，而非项目获奖榜。

### 四、调研方法与覆盖面的固有局限

1. **英文来源权重偏高**，中文/日文/韩文/其他语种的一手公告可能被系统性漏采（本报告仅补充了 Hack-Nation、MCP Hackathon Africa、CoinGecko MCP、阿里 ModelScope MCP & Agent 挑战赛等少数非英语赛事）。
2. **奖项信息的时间衰减**：2023–2024 年赛事的官网与项目页部分已下线，只能依赖二手转述，导致这两年样本量（8 个）明显少于 2025–2026 年（28 个），趋势对比时需注意样本不平衡。
3. **"趋势洞察"部分的领域占比为人工归类后的估算**，非严格统计；样本量 36 且抽样偏向已获奖、已被报道的项目，存在选择性偏差。
4. **未对任何来源做反向图片搜索或域名信誉核验**；聚合类站点（neodrop.ai、vibecoding.app、winbigdaily、competehub）本身依赖二手信息，本报告已在正文标注其为二手来源。

### 五、排除清单（按用户要求）

- ❌ **TechCrunch Disrupt Startup Battlefield 2025**（冠军 Glīd）：这是创业公司路演赛，不是黑客松，已排除。仅作为"奖金与 AI 占比"的背景参考在洞察部分引用。
- ❌ 各类"年度最佳 AI 工具"榜单、内容农场的获奖合集。
- ❌ 无法确认获奖事实的项目与仅被提名的项目（例外：GPT-Swarm、Agent OS 这两个"决赛入围"项目因具有趋势对比价值而保留，并已标注为"决赛入围"而非获奖）。
- ❌ 上述第三节第 3 项（Zenith / Everything Claude Code）——因官方来源缺失、数据存疑而整项排除。
