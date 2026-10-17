/* 选题罗盘 · Demo Mock 数据层
 * 与 UI 完全分离：Codex 接入真实后端时，用 API 适配器替换本文件暴露的数据与函数即可。
 * 全部内容为演示数据（Demo Mock），不代表真实模型输出或真实来源审核。
 * 「coin」词条配有完整富演示数据（与 docs/03 协议示例一致）；其余词条为模板数据。 */
'use strict';

const MOCK = {
  /* 知识题库（演示 8 条）。levels: 支持的自报基础；minBudget: 最短可用学习预算（分钟） */
  pool: [
    {
      id: 'coin', title: '两次抛硬币，至少一次正面的概率', domain: '概率统计', levels: ['入门', '学过基础'], minBudget: 15,
      goals: ['能说明「至少一次正面」如何由基本结果计算', '能解释为什么「两种情况」不等于「各占一半」'],
      prereq: ['概率的基本定义', '独立事件的概念'],
      task: '先自己阅读资料，然后向同学解释：连续抛两次公平硬币，至少出现一次正面的概率是多少，为什么。',
      misconception: '常见误解：把「有正面 / 没有正面」两类事件当作等可能，得出 1/2。',
      src: { id: 'src-coin', version: 1, seg: 's1', locator: '演示来源包 · 第 1 段', reviewed: true,
        text: '连续独立抛掷两次公平硬币，四个等可能结果为正正、正反、反正、反反；至少一次正面的概率为 3/4。' }
    },
    { id: 'corr', title: '相关不等于因果', domain: '概率统计', levels: ['入门', '学过基础'], minBudget: 15,
      goals: ['能举出一个相关但无因果的例子', '能说明判断因果需要什么额外证据'],
      prereq: ['相关性概念'], task: '阅读资料后，用自己的话解释为什么「两者一起变化」不能直接推出「一个导致另一个」。',
      misconception: '常见误解：看到数据同步变化就直接下因果结论。',
      src: { id: 'src-mock', version: 1, seg: 's1', locator: '演示占位 · 未审核', reviewed: false, text: '（演示占位文本——真实版为人工审核来源摘录）' } },
    { id: 'expect', title: '期望值为什么不是「平均能拿到的钱」', domain: '概率统计', levels: ['学过基础'], minBudget: 15,
      goals: ['能计算简单离散分布的期望', '能解释期望与单次结果的差别'],
      prereq: ['概率分布'], task: '用自己的话解释期望值的含义，并用一个抽奖例子说明为什么期望不保证单次结果。',
      misconception: '常见误解：把期望值当成「大多数时候能拿到」的金额。',
      src: { id: 'src-mock', version: 1, seg: 's1', locator: '演示占位 · 未审核', reviewed: false, text: '（演示占位文本）' } },
    { id: 'lln', title: '大数定律与赌徒谬误', domain: '概率统计', levels: ['学过基础'], minBudget: 30,
      goals: ['能说明频率趋近概率的条件', '能指出赌徒谬误错在哪里'],
      prereq: ['独立重复试验'], task: '解释大数定律说的是长期频率稳定，为什么不能推出「连输之后该赢了」。',
      misconception: '常见误解：认为随机序列会「自我纠正」。',
      src: { id: 'src-mock', version: 1, seg: 's1', locator: '演示占位 · 未审核', reviewed: false, text: '（演示占位文本）' } },
    { id: 'bayes', title: '条件概率与贝叶斯直觉', domain: '概率统计', levels: ['较熟悉'], minBudget: 30,
      goals: ['能用基础率解释一个检测假阳性例子', '能写出贝叶斯公式的直观推导'],
      prereq: ['条件概率定义', '全概率公式'], task: '用医学检测例子解释：为什么低基础率下阳性结果也未必患病。',
      misconception: '常见误解：忽略基础率，把检测准确率当成患病概率。',
      src: { id: 'src-mock', version: 1, seg: 's1', locator: '演示占位 · 未审核', reviewed: false, text: '（演示占位文本）' } },
    { id: 'hallu', title: '大语言模型为什么会「一本正经地胡说」', domain: 'AI 基础', levels: ['入门', '学过基础'], minBudget: 15,
      goals: ['能说明语言模型的训练目标与事实核查的区别', '能解释幻觉产生的一个原因'],
      prereq: ['无'], task: '用自己的话解释「幻觉」现象，并说明为什么流畅不等于正确。',
      misconception: '常见误解：模型回答流畅就等于经过核实。',
      src: { id: 'src-mock', version: 1, seg: 's1', locator: '演示占位 · 未审核', reviewed: false, text: '（演示占位文本）' } },
    { id: 'embedding', title: '词向量：机器怎么理解词义', domain: 'AI 基础', levels: ['学过基础'], minBudget: 30,
      goals: ['能解释向量空间中相似度的含义', '能说明类比关系的几何解释'],
      prereq: ['向量与点积'], task: '解释词向量如何把「语义相似」变成「距离接近」，并举一个类比例子。',
      misconception: '常见误解：认为模型真的「理解」词义而非统计共现。',
      src: { id: 'src-mock', version: 1, seg: 's1', locator: '演示占位 · 未审核', reviewed: false, text: '（演示占位文本）' } },
    { id: 'overfit', title: '过拟合：刷题满分不等于学会', domain: 'AI 基础', levels: ['学过基础', '较熟悉'], minBudget: 30,
      goals: ['能区分训练集与测试集表现', '能举一个生活中过拟合的例子'],
      prereq: ['基础机器学习概念'], task: '解释过拟合的含义，并说明为什么刷原题满分不代表掌握知识。',
      misconception: '常见误解：把训练表现当成泛化能力。',
      src: { id: 'src-mock', version: 1, seg: 's1', locator: '演示占位 · 未审核', reviewed: false, text: '（演示占位文本）' } }
  ],

  /* 「coin」词条的完整富演示数据（取自 docs/03 第 7 节协议示例） */
  chCoin: {
    expSample: '至少一个正面的概率是二分之一，因为有正面或没有正面只有两种情况。',
    q: { id: 'q1', text: '请列出两次抛掷的基本结果，并说明为什么它们是否等可能。', focus: '因果推理',
      why: '需要区分事件分类数量与等可能基本结果数量。', basedOn: '有正面或没有正面只有两种情况' },
    ansSample: '基本结果是正正、正反、反正、反反四个。因为硬币公平且两次独立，每个结果概率相同，所以等可能。',
    feedback: {
      overall: '你的解释使用了事件分类，需要进一步说明这些事件为何等可能。以下为 AI 对照给定资料的意见。',
      f: { id: 'f1', claim: '至少一个正面的概率是二分之一',
        text: '把两种事件类别直接视为等可能，可能导致概率错误。',
        rationale: '提供的资料在独立且公平的前提下列出了四个等可能结果，其中三个包含正面。',
        suggest: '先明确独立、公平的前提，再列举基本结果并计算。',
        expQuote: '至少一个正面的概率是二分之一',
        srcQuote: '至少一次正面的概率为 3/4。' },
      gapSkipped: '你跳过了 q1，目前没有独立列举基本结果的回答证据。'
    },
    revSample: '假设两次抛掷独立、硬币公平。四个等可能结果是正正、正反、反正、反反，其中三个至少有一个正面，所以概率为 3/4。',
    revReview: {
      overall: '修正版补充了前提和样本空间，与给定资料的表述相符；这仍不足以证明你能在新情境中独立运用。',
      state: 'AI 复核认为已有修正',
      rationale: '原先把两种事件分类当作等可能的做法已改为列举四个基本结果。',
      quote: '四个等可能结果是正正、正反、反正、反反，其中三个至少有一个正面，所以概率为 3/4。',
      gap: '尚无迁移到不公平硬币或非独立抛掷的独立解释证据。'
    },
    script: {
      title: '两种情况，就各占一半吗？', est: 60,
      blocks: [
        { id: 'b1', kind: '开场', refs: [], text: '连续抛两次硬币，至少出现一次正面，有人会说：有正面和没有正面就两种情况，所以各占一半。这个想法漏掉了什么？' },
        { id: 'b2', kind: '核心解释', refs: ['来自修正 v1 · p1', 'src-coin v1 · s1（支持）'], text: '先说清前提：硬币公平，两次抛掷相互独立。我们把先后顺序也记录下来，就得到正正、正反、反正、反反四个等可能结果。' },
        { id: 'b3', kind: '总结', refs: ['来自修正 v1 · p1', 'src-coin v1 · s1（支持）'], text: '其中前三个结果都至少有一个正面，只有反反没有。因此，在这些前提下，概率是四分之三。按事件分成两类，不代表这两类等可能；计算前要说明你统计的基本结果。' }
      ],
      limits: ['脚本只覆盖公平且相互独立的两次抛掷。时长为估计，需试读核对。']
    }
  },

  /* 模式 B 演示数据（取自 docs/03 第 8 节协议示例） */
  video: { name: 'coin-demo-20s.mp4', dur: 20000, size: '8.4 MiB', container: 'mp4（ffprobe 实测）', track: '音轨 1（默认）' },
  segs: [
    { id: 'ts1', start: 0, end: 8200, text: '至少一个正面的概率是二分之一。' },
    { id: 'ts2', start: 8400, end: 18000, text: '因为有正面或没有正面只有两种情况。' }
  ],
  report: {
    summary: '视频以两次抛硬币说明概率，需要补充独立、公平前提，并检查把两类事件视作等可能的推理。以下是基于核对稿的 AI 分析。',
    f: { id: 'vf1', claim: '至少一个正面的概率是二分之一',
      text: '概率结论与给定公平独立抛掷示例不一致。',
      rationale: '核对稿没有列出基本结果；给定资料列出四个等可能结果并得出 3/4。是否满足资料前提仍需你确认。',
      suggest: '先说明两次抛掷是否独立、硬币是否公平，再用四个结果解释概率。',
      seg: 'ts1', t0: 0, t1: 8200, quote: '至少一个正面的概率是二分之一。',
      srcQuote: '至少一次正面的概率为 3/4。',
      unc: '上下文不足', uncNote: '画面中可能出现前提，但本次没有分析画面。' },
    q: { id: 'vq1', text: '为什么把结果分成有正面和没有正面两类，不能直接断言它们各占一半？', focus: '因果推理',
      why: '检验事件分类与等可能样本空间的区别。', basedOn: '有正面或没有正面只有两种情况。', seg: 'ts2' },
    unassessed: ['画面', '屏幕文字', '剪辑', '非语言表达'],
    limits: ['只分析用户确认的转写文字；没有审查画面、字幕、剪辑、语气和动作。']
  },

  /* 非 coin 词条的模板化演示数据生成器（同样属于 Demo Mock） */
  tmpl(item, exp) {
    const q1 = String(exp || '（尚未输入解释）').replace(/\s+/g, '').slice(0, 24);
    return {
      expSample: null,
      q: { id: 'q1', text: '请用自己的话说明「' + item.title + '」的关键前提或适用条件，并举一个例子。', focus: '边界与前提',
        why: '演示追问模板：检验对「' + item.title + '」的解释是否覆盖适用边界。', basedOn: q1 },
      ansSample: null,
      feedback: {
        overall: '（Demo Mock）以下为界面演示样式，未接入真实模型，也未对照任何来源。',
        f: { id: 'f1', claim: '关于「' + item.title + '」的解释是否覆盖关键前提',
          text: '演示样式：真实反馈将在此给出具体问题与依据。',
          rationale: '演示模式未接入模型与来源比对，因此本条只能保持「待核实」。',
          suggest: '可先自查：是否说明了前提、边界与例子。',
          expQuote: q1, srcQuote: null },
        gapSkipped: '你跳过了 q1，目前没有独立回答证据。'
      },
      revSample: '（演示修正占位）针对「' + item.title + '」补充了前提与适用边界的说明。',
      revReview: {
        overall: '（Demo Mock）演示模式未接入真实复核。',
        state: '无法评估（演示）',
        rationale: '演示模式无法评估修正情况；真实版将逐项对照反馈给出复核意见。',
        quote: '（演示占位引用）',
        gap: '该词条为演示题库占位数据。'
      },
      script: {
        title: item.title, est: 60,
        blocks: [
          { id: 'b1', kind: '开场', refs: [], text: '「' + item.title + '」——你真的能把它讲清楚吗？' },
          { id: 'b2', kind: '核心解释', refs: [], text: '（Demo Mock 模板段落——真实脚本由复核后的修正稿与审核来源生成，此处仅演示版式与引用标签的位置。）' },
          { id: 'b3', kind: '总结', refs: [], text: '一句话收束主题，并提醒观众注意前提与适用边界。' }
        ],
        limits: ['本脚本为演示模板生成，未经复核，不可直接使用。']
      }
    };
  }
};

/* 留待 Codex 替换的接口清单（对应 docs/03 协议 task）：
 * - drawPool(config) -> 候选词条          （本文件 MOCK.pool + Store.filterPool）
 * - getItemCard(id) -> 题卡与来源          （MOCK.pool 项）
 * - challenge_questions / challenge_feedback / challenge_revision_review / challenge_script
 * - probeMedia / transcribe / video_review
 * 以上真实实现均须按协议 v1.0 校验后返回；本文件仅为界面演示数据。 */
