/* 选题罗盘 · 视图层（数据来自 store/mock-data，状态标签来自 ui.js） */
'use strict';

/* ---------------- 首页（五屏落地页） ---------------- */
function vHome() {
  const recent = S.works.slice(-3).reverse();
  return `
  <section class="kc-wrap kc-hero">
    <div>
      <h1 class="kc-h1">从知识输入，到作品输出。</h1>
      <p class="kc-sub">面向个人知识创作者的 AI 工作流，让选题、理解、表达和作品复盘形成可追溯的完整过程。</p>
      <div class="kc-row">
        <button class="kc-btn primary lg" data-action="nav" data-view="challenge">开始知识挑战</button>
        <button class="kc-btn primary lg" data-action="nav" data-view="review">开始视频复盘</button>
        <button class="kc-btn lg" data-action="nav" data-view="works">查看我的知识作品</button>
      </div>
      <div class="kc-row" style="margin-top:16px">${tag('t-gray', '本地优先 · 单机运行')}${mockTag()}${tag('t-gray', '黑客松演示原型')}</div>
    </div>
    <div class="kc-compass" aria-hidden="true">
      ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<i style="transform:rotate(${a}deg)"></i>`).join('')}
      <div class="kc-needle"></div>
    </div>
  </section>

  <div class="kc-wrap">
    <section class="kc-section">
      <div class="kc-sec-h">两个核心模式，解决两个不同的问题</div>
      <p class="kc-sec-sub">挑战面向「输出之前的理解」，复盘面向「输出之后的成片」。二者可独立使用，也可围绕同一知识点建立关联。</p>
      <div class="kc-grid">
        <div class="kc-card kc-modecard">
          <div class="kc-h">知识挑战</div>
          <p class="kc-mut" style="margin:0">不知道讲什么、讲得对不对。从题库锁定一个词条，先独立解释，再接受 AI 追问与有依据的反馈，最后得到可编辑的科普脚本。</p>
          <div class="kc-flow" style="justify-content:flex-start">${['锁定词条', '独立解释', 'AI 追问', '修正', '脚本'].map(x => `<span class="kc-flowchip">${x}</span>`).join('<span class="kc-flowarrow">→</span>')}</div>
          <div class="kc-mode-foot"><button class="kc-btn primary" data-action="nav" data-view="challenge">开始知识挑战</button>${tag('t-blue', '面向输出前')}</div>
        </div>
        <div class="kc-card kc-modecard">
          <div class="kc-h">视频复盘</div>
          <p class="kc-mut" style="margin:0">成片不知道具体该改哪里。上传口播视频，本地提音转写，逐段人工核对后，AI 给出带时间定位的知识、逻辑与表达建议。</p>
          <div class="kc-flow" style="justify-content:flex-start">${['上传', '本地转写', '逐段核对', '定位复盘'].map(x => `<span class="kc-flowchip">${x}</span>`).join('<span class="kc-flowarrow">→</span>')}</div>
          <div class="kc-mode-foot"><button class="kc-btn primary" data-action="nav" data-view="review">开始视频复盘</button>${tag('t-purple', '面向输出后')}</div>
        </div>
      </div>
    </section>

    <section class="kc-section">
      <div class="kc-sec-h">一条知识生产闭环</div>
      <p class="kc-sec-sub">挑战产出的理解与脚本，经过你自己的拍摄制作，进入复盘检验，最终沉淀为可追溯的档案。</p>
      <div class="kc-flow">
        ${[['选题锁定', ''], ['独立解释', ''], ['追问与修正', ''], ['脚本', ''], ['视频制作', 'own'], ['转写核对', ''], ['定位复盘', ''], ['沉淀档案', '']]
          .map(([x, o]) => `<span class="kc-flowchip ${o}">${x}${o ? '（由你完成）' : ''}</span>`)
          .join('<span class="kc-flowarrow">→</span>')}<span class="kc-flowarrow">↺ 回到选题</span>
      </div>
    </section>

    <section class="kc-section">
      <div class="kc-sec-h">我的知识作品：长期价值</div>
      <p class="kc-sec-sub">档案不是打卡记录，而是随时间积累的个人内容资产。</p>
      <div class="kc-grid" style="grid-template-columns:1.2fr 1fr">
        <div class="kc-card">
          <ul class="kc-vlist">
            <li><b>可追溯的证据链</b>：原始解释、追问回答、修正、脚本与复盘报告都保留版本，随时回看「我当时怎么理解、哪里被指出、怎么改的」。</li>
            <li><b>同知识点对照</b>：把挑战记录与视频复盘关联，比较「学习时的理解」与「成片中暴露的问题」。</li>
            <li><b>个人内容资产</b>：一键导出 Markdown；数据在本机，由你自己掌握。</li>
          </ul>
        </div>
        <div class="kc-card">
          <div class="kc-h">最近记录</div>
          ${recent.length ? recent.map(w => `<div class="kc-wkitem" data-action="wk:open" data-i="${S.works.indexOf(w)}"><div>${w.type === 'challenge' ? tag('t-blue', '挑战') : tag('t-purple', '复盘')} <b>${esc(w.title)}</b><div class="kc-mut">${esc(w.domain)} · ${esc(w.status)}</div></div></div>`).join('') :
            `<div class="kc-quote">示例：两次抛硬币，至少一次正面的概率（挑战）${mockTag()}<div class="kc-mut" style="margin-top:4px">独立解释 → 追问 → 修正 → 脚本，全流程留痕</div></div><p class="kc-mut">完成第一次挑战或复盘后，这里会显示你的真实记录。</p>`}
        </div>
      </div>
    </section>

    <section class="kc-section">
      <div class="kc-sec-h">设计原则</div>
      <p class="kc-sec-sub">先可信，再好用。</p>
      <div class="kc-card">
        <div class="kc-principle"><b>本地优先</b><p class="kc-mut" style="margin:0">原视频与音频只在本机处理；仅经你同意的文字才会发送给模型服务。</p></div>
        <div class="kc-principle"><b>可追溯证据</b><p class="kc-mut" style="margin:0">每条反馈引用你的原话与来源位置；判断类型与证据状态分开呈现，不虚构掌握分数。</p></div>
        <div class="kc-principle"><b>人工核对优先</b><p class="kc-mut" style="margin:0">转写先由你逐段核对，AI 只分析确认稿；AI 意见不是事实核查结果。</p></div>
      </div>
      <div class="kc-warnbox">边界说明：产品不承诺提高学习成绩、视频播放量或账号增长；运营工具与可复用产品能力属于后续发展方向，当前未实现。${mockTag()}</div>
      <div class="kc-row"><button class="kc-btn primary" data-action="nav" data-view="challenge">开始知识挑战</button><button class="kc-btn primary" data-action="nav" data-view="review">开始视频复盘</button></div>
    </section>
  </div>`;
}

/* ---------------- 知识挑战 ---------------- */
const CH_STEPS = ['配置', '抽题锁定', '题卡学习', '独立解释', '反向追问', '结构化反馈', '修正与复核', '脚本', '完成'];

function chStepsHtml() {
  return '<div class="kc-steps kc-wrap" style="margin-bottom:0">' + CH_STEPS
    .map((n, i) => `<span class="kc-step ${i < S.ch.step ? 'done' : ''} ${i === S.ch.step ? 'cur' : ''}">${i < S.ch.step ? '✓ ' : ''}${n}</span>`)
    .join('<span class="kc-mut">→</span>') + '</div>';
}

function segBtns(action, key, opts) {
  return '<div class="kc-row">' + opts.map(([v, l]) =>
    `<button class="kc-btn sm ${S.ch[key] === v ? 'primary' : ''}" data-action="${action}" data-v="${v}">${l}</button>`).join('') + '</div>';
}

/* 词库管理：词库选择 + 导入预览 */
function chVocabCard() {
  const vocabs = Store.listVocabs();
  const activeId = S.activeVocabId;
  const imp = S.vocabImport || {};
  let body = `
    ${S.vocabStorage.error ? `<div class="kc-errbox" style="display:block" role="alert">${esc(S.vocabStorage.error)}</div>` : ''}
    <p class="kc-mut" style="margin:4px 0 14px">每次挑战从单个词库的启用词条中抽取；词库数据由本机 localStorage 持久化，未来由 Codex 替换为 SQLite。</p>
    <div style="margin-bottom:12px"><div class="kc-h" style="font-size:13px">当前词库（点击切换；导入词库可删除）</div>
      <div class="kc-vocabrow">${vocabs.map(v => {
        const active = v.id === activeId;
        return `<div class="kc-vocabchip ${active ? 'active' : ''}">
          <button class="kc-btn sm ${active ? 'primary' : ''}" data-action="ch:vocab" data-id="${v.id}">${esc(v.name)} ${v.builtin ? tag('t-gray', '内置') : ''}</button>
          ${v.builtin ? '' : `<button class="kc-btn sm danger" data-confirm="1" data-action="ch:vocab-del" data-id="${v.id}" title="删除此词库">×</button>`}
        </div>`;
      }).join('')}</div></div>
    <div style="margin-bottom:8px"><div class="kc-h" style="font-size:13px">导入新词库</div>
      <div class="kc-row">
        <label class="kc-btn sm"><input type="file" id="vocab-file" accept=".md,text/markdown" hidden>选择 .md 文件</label>
       ${imp.fileName ? `<span class="kc-mut">已选择：${esc(imp.fileName)}</span>
          <button class="kc-btn sm" data-action="ch:vocab-clear">清除</button>` : '<span class="kc-mut">格式约束见下方预览</span>'}
      </div>
      <details class="kc-vocab-example">
        <summary>查看词库范例（与内置词库内容一致）</summary>
        <p class="kc-mut">一级标题代表词库名称；二级标题代表难度分类；使用 <code>- </code> 表示知识词条。</p>
        <p class="kc-mut">允许的难度：入门、基础、进阶。请勿使用解析器尚未支持的自定义格式。</p>
        <div class="kc-row" style="margin-bottom:6px">${BUILTIN_BANKS.map(b =>
          `<button class="kc-btn sm ${S.vocabExampleKey === b.exampleKey ? 'primary' : ''}" data-action="ch:vocab-example-tab" data-v="${b.exampleKey}">${esc(b.name)}</button>`).join('')}</div>
        <pre class="kc-pre" id="vocab-example">${esc(getBankExample(S.vocabExampleKey).md)}</pre>
        <div class="kc-row">
          <button class="kc-btn sm" data-action="ch:vocab-example-copy">复制范例</button>
          <button class="kc-btn sm" data-action="ch:vocab-example-download">下载 .md 范例</button>
          <span class="kc-mut" id="vocab-example-note" aria-live="polite"></span>
        </div>
      </details>
      </div>`;

  if (imp.fileName && imp.parsed) {
    const p = imp.parsed;
    if (p.ok) {
      const counts = VocabParser.countByLevel({ terms: p.terms });
      body += `
        <div class="kc-okbox">
          <div><b>${esc(p.name)}</b> · 共 ${p.terms.length} 个词条（入门 ${counts['入门']} · 基础 ${counts.基础} · 进阶 ${counts.进阶}）</div>
          <div class="kc-poolwall">${p.terms.map(t => `<span class="kc-poolchip">${esc(t.title)}${tag('t-gray', t.level)}</span>`).join('')}</div>
          <div class="kc-row" style="margin-top:8px">
            <button class="kc-btn sm primary" data-action="ch:vocab-import">确认导入此词库</button>
            <button class="kc-btn sm" data-action="ch:vocab-clear">取消</button>
          </div>
        </div>`;
    } else {
      body += `<div class="kc-errbox" style="display:block">
        <div><b>解析失败（${p.errors.length}）</b></div>
        <ul style="margin:6px 0 0;padding-left:18px">${p.errors.map(e => `<li>第 ${e.line || '?'} 行：${esc(e.msg)}</li>`).join('')}</ul>
        <div class="kc-row" style="margin-top:8px"><button class="kc-btn sm" data-action="ch:vocab-clear">清除 / 重新选择</button></div>
      </div>`;
    }
  }
  return `<div class="kc-card"><div class="kc-h">挑战配置</div>${body}</div>`;
}

/* 抽取配置：难度 + 预算 + 词条启用 + 池预览 + 抽取按钮 */
function chDrawConfigCard() {
  const v = Store.getActiveVocab();
  if (!v) return '<div class="kc-warnbox">当前没有可用词库。</div>';
  const diff = Store.getDifficulty();
  const pool = Store.filterPool();
  const visibleTerms = v.terms.filter(t => diff === 'all' || t.level === diff);

  const diffChips = [['all', '全部'], ['入门', '入门'], ['基础', '基础'], ['进阶', '进阶']]
    .map(([d, l]) => `<button class="kc-btn sm ${diff === d ? 'primary' : ''}" data-action="ch:diff" data-v="${d}">${l}</button>`).join('');

  const termChips = visibleTerms.length
    ? visibleTerms.map(t => {
        const interactive = !v.builtin;
        const cls = 'kc-termchip ' + (t.enabled ? 'on' : 'off') + (interactive ? '' : ' static');
        return `<span class="${cls}" ${interactive ? 'data-action="ch:term" data-id="' + t.id + '"' : ''}>${t.enabled ? '✓' : '○'} ${esc(t.title)}${tag('t-gray', t.level)}</span>`;
      }).join('')
    : '<span class="kc-mut">当前难度下没有词条。</span>';

  return `<div class="kc-card"><div class="kc-h">抽取配置</div>
    <div style="margin-bottom:12px"><div class="kc-h" style="font-size:13px">难度（筛选词条）</div><div class="kc-row">${diffChips}</div></div>
    <div style="margin-bottom:12px"><div class="kc-h" style="font-size:13px">学习时间预算</div>${segBtns('ch:budget', 'budget', [[15, '15 分钟'], [30, '30 分钟'], [60, '60 分钟']])}</div>
    <div style="margin-bottom:12px"><div class="kc-h" style="font-size:13px">词条启用状态（点击切换 · 默认全部启用）</div>
      <div class="kc-poolwall">${termChips}</div></div>
    <div class="kc-row"><span class="kc-mut">当前条件匹配</span><b>${pool.length}</b><span class="kc-mut">个词条</span></div>
    ${pool.length ? `<div class="kc-poolwall">${pool.map(it => `<span class="kc-poolchip">${esc(it.title)}${tag('t-gray', it.level)}</span>`).join('')}</div>` : '<div class="kc-warnbox">当前条件无匹配词条；抽取按钮已禁用。请切换词库、调整难度或启用更多词条。</div>'}
    <div class="kc-row" style="margin-top:12px"><button class="kc-btn primary lg" data-action="ch:draw" ${pool.length ? '' : 'disabled'}>抽取知识点</button></div>
  </div>`;
}

function vChallenge() {
  const c = S.ch;
  const pool = Store.filterPool();
  let body = '';

  if (c.step === 0) {
    body = chVocabCard() + chDrawConfigCard();
  } else if (c.step === 1) {
    const item = Store.getChItem();
    const winner = item;
    const meta = winner ? (winner.domain + ' · ' + winner.level) : '';
    /* 单候选 / reduced-motion 也走动画模块的直落分支（含 onTick/onLock 音效路径），仅跳过减速切换 */
    if (!c.drawDone) {
      body = `
      <div class="kc-card"><div class="kc-h">抽取知识词条</div>
        <p class="kc-mut" style="margin:4px 0 10px">已按当前条件筛出 ${pool.length} 个候选。抽取结果已预先决定，动画只是走向它；多候选时避免与上次重复。</p>
        <div class="kc-draw-stage" id="draw-stage">
          <div class="kc-spincompass" aria-hidden="true">
            ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<i style="transform:rotate(${a}deg)"></i>`).join('')}
            <div class="kc-spin-rotor" id="spin-rotor"><div class="kc-spin-needle"></div></div>
          </div>
          <div class="kc-draw-card">
            <div class="kc-draw-term">—</div>
            <div class="kc-draw-meta"></div>
            <div class="kc-draw-stamp">已锁定</div>
          </div>
          <div class="kc-drawhint">词条随机闪现中 · 点击舞台任意位置跳过</div>
        </div>
      </div>`;
    } else {
      body = `
      <div class="kc-card"><div class="kc-h">已锁定词条</div>
        ${pool.length === 1 ? '<div class="kc-warnbox">题库中仅有 1 个词条符合当前条件（按规则如实提示，不伪造随机过程）。</div>' : ''}
        <div class="kc-lockedcard"><span class="kc-stamp">已锁定</span>
          <div class="kc-h" style="font-size:17px;margin-bottom:6px">${esc(item.title)}</div>
          ${tag('t-blue', esc(item.domain))}${tag('t-gray', '难度：' + item.level)}${item.minBudget > 0 ? tag('t-gray', '最短 ' + item.minBudget + ' 分钟') : ''}
          <p class="kc-mut" style="margin:10px 0 0">从 ${pool.length} 个词条中伪随机抽取 · 多候选时避免与上次重复</p>
        </div>
        <div class="kc-row" style="margin-top:12px">
          <button class="kc-btn primary" data-action="ch:open-card">打开题卡</button>
          <button class="kc-btn" data-action="ch:redraw">换一个</button>
          <button class="kc-btn sm" data-action="ch:back-config">返回配置</button>
        </div>
      </div>`;
    }
  } else if (c.step === 2) {
    const it = Store.getChItem();
    const timer = c.learningTimer;
    const timerLabel = timer.state === 'running' ? '正在学习' : timer.state === 'paused' ? '已暂停' : timer.state === 'finished' ? '时间到' : '准备开始';
    const timerControls = timer.state === 'ready'
      ? `<button class="kc-btn primary" data-action="ch:timer-start">开始</button>`
      : timer.state === 'running'
        ? `<button class="kc-btn" data-action="ch:timer-pause">暂停</button>`
        : timer.state === 'paused'
          ? `<button class="kc-btn primary" data-action="ch:timer-start">继续</button>`
          : '';
    const timerPresets = [3, 5, 10].map(m => `<button class="kc-btn sm ${timer.minutes === m ? 'primary' : ''}" data-action="ch:timer-preset" data-v="${m}" ${timer.state === 'ready' ? '' : 'disabled'} aria-pressed="${timer.minutes === m}">${m} 分钟</button>`).join('');
    const goalList = (it.goals && it.goals.length) ? it.goals.map(g => '· ' + esc(g)).join('<br>') : '<span class="kc-mut">（导入词库未提供学习目标）</span>';
    const prereqList = (it.prereq && it.prereq.length) ? it.prereq.map(g => '· ' + esc(g)).join('<br>') : '<span class="kc-mut">（导入词库未提供前置知识）</span>';
    const taskText = it.task || '<span class="kc-mut">（导入词库未提供学习任务；可自行补充）</span>';
    body = `
    <div class="kc-card"><div class="kc-h">题卡 · ${esc(it.title)} ${tag('t-blue', esc(it.domain))}${tag('t-gray', it.level + ' · ' + c.budget + ' 分钟（建议值）')}</div>
      <dl class="kc-kv" style="margin-bottom:10px">
        <dt>学习目标</dt><dd>${goalList}</dd>
        <dt>前置知识</dt><dd>${prereqList}</dd>
        <dt>学习任务</dt><dd>${taskText}</dd>
      </dl>
      <section class="kc-learning-timer ${timer.state === 'finished' ? 'finished' : ''}" aria-label="学习倒计时">
        <div class="kc-timer-top"><span class="kc-timer-label">${timerLabel}</span><span class="kc-timer-value" id="learning-timer-value" role="timer" aria-label="剩余学习时间">${formatLearningTime(timer.remainingMs)}</span></div>
        <div class="kc-timer-track" id="learning-timer-track" role="progressbar" aria-label="学习时间进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${timerPct(timer)}"><div class="kc-timer-bar" id="learning-timer-bar" style="width:${timerPct(timer)}%"></div></div>
        ${timer.state === 'ready' ? `<div class="kc-row kc-timer-presets" aria-label="选择学习时长">${timerPresets}</div>` : ''}
        <div class="kc-row kc-timer-controls">${timerControls}<button class="kc-btn sm" data-action="ch:timer-reset">重置</button></div>
        ${timer.state === 'finished' ? '<p class="kc-timer-finished" role="status">学习时间结束，现在试着用自己的语言解释这个知识点。</p>' : ''}
      </section>
      <div class="kc-quote ${it.src && it.src.reviewed ? 'src' : ''}">来源片段 ${it.src && it.src.reviewed ? tag('t-green', '人工审核') : tag('t-orange', '演示占位 · 未审核') + mockTag()} ${esc((it.src && it.src.id) || 'src-imported')} v${(it.src && it.src.version) || 1} · ${esc((it.src && it.src.locator) || '（导入词库未提供来源）')}<br>${esc((it.src && it.src.text) || '（导入词库未提供来源文本）')}</div>
      ${it.misconception ? `<div class="kc-warnbox">${esc(it.misconception)}</div>` : ''}
      <p class="kc-mut">点击下方按钮仅记录「自报已完成学习」，不代表掌握；产品不监控停留时间或录屏。</p>
      <div class="kc-row"><button class="kc-btn primary" data-action="ch:learned">我已学习，开始解释</button><button class="kc-btn sm" data-action="ch:back-config">返回重新抽题</button></div>
    </div>`;
  } else if (c.step === 3) {
    body = `
    <div class="kc-card"><div class="kc-h">独立解释 · ${esc(Store.getChItem().title)}</div>
      <p class="kc-mut" style="margin:4px 0 10px">请用自己的话向同学解释这个知识点，可以举例并说明适用边界。提交后保存为不可覆盖的 v1；再次修改将生成新版本。</p>
      <textarea id="ch-exp" class="kc-textarea" placeholder="写下你的解释…（1–6000 字符，去空白后校验）">${esc(c.draft.explanation ?? c.explained ?? '')}</textarea>
      <div class="kc-row" style="margin-top:8px"><span class="kc-mut">已输入 <span id="ch-count">${(c.draft.explanation ?? c.explained ?? '').trim().length}</span> 字符</span></div>
      <div class="kc-errbox" id="ch-exp-err" role="alert"></div>
      <div class="kc-row" style="margin-top:10px"><button class="kc-btn primary" data-action="ch:submit-exp">提交独立解释</button>${Store.isRich() ? '<button class="kc-btn sm" data-action="ch:fill-exp">填入示例解释（含典型误解）</button>' : ''}</div>
      <p class="kc-mut" style="margin-top:8px">AI 不会在此步骤前展示完整标准答案；你的解释是后续追问与反馈的唯一依据。</p>
    </div>`;
  } else if (c.step === 4) {
    const mk = Store.getChMocks();
    if (!c.qShown) {
      body = `
      <div class="kc-card"><div class="kc-h">反向追问</div>
        ${!S.consent.challenge ? '<div class="kc-warnbox">尚未同意「挑战类 AI 步骤」文字外发：将发送你的解释与来源片段（仅文字）。未同意时 AI 不可调用，学习与保存不受影响。<br><br><button class="kc-btn sm" data-action="nav" data-view="settings">前往设置开启演示同意</button></div>' : ''}
        <p class="kc-mut">解释已保存（v1）。追问基于你的原文，不提供完整答案。${Store.isRich() ? '' : '当前词条为演示模板，追问为生成样式。' + mockTag()}</p>
        <button class="kc-btn primary" data-action="ch:gen-q" ${!S.consent.challenge ? 'disabled' : ''}>生成反向追问（演示 1 题）</button></div>`;
    } else {
      const q = mk.q;
      body = `
      <div class="kc-card"><div class="kc-h">追问 ${q.id} ${tag('t-purple', '追问方向：' + esc(q.focus))}${Store.isRich() ? '' : mockTag()}</div>
        <p style="margin:6px 0"><b>${esc(q.text)}</b></p>
        <p class="kc-mut">为什么问：${esc(q.why)}</p>
        <div class="kc-quote">引用自你的解释 v1：『${esc(q.basedOn)}』</div>
        ${c.skipped ? '<div class="kc-warnbox">已标记「暂时不会」。跳过将记录为证据缺口，不影响保存。</div>' : `
        <textarea id="ch-ans" class="kc-textarea" style="min-height:80px" placeholder="逐题回答（1–2000 字符），或选择跳过">${esc(c.draft.answer ?? c.ans ?? '')}</textarea>`}
        <div class="kc-errbox" id="ch-ans-err" role="alert"></div>
        <div class="kc-row" style="margin-top:10px">
          <button class="kc-btn primary" data-action="ch:submit-ans">${c.skipped ? '以跳过状态请求反馈' : '提交回答并请求反馈'}</button>
          ${c.skipped ? '<button class="kc-btn sm" data-action="ch:unskip">改为回答</button>' : '<button class="kc-btn sm" data-action="ch:skip-q">暂时不会 / 跳过</button>'}
          ${mk.ansSample ? '<button class="kc-btn sm" data-action="ch:fill-ans">填入示例回答</button>' : ''}
        </div>
      </div>`;
    }
  } else if (c.step === 5) {
    const mk = Store.getChMocks();
    const f = mk.feedback.f;
    const rich = Store.isRich();
    body = `
    <div class="kc-card"><div class="kc-h">结构化反馈 <span class="kc-mut">（AI 比对意见，非事实核查结果）</span>${rich ? '' : mockTag()}</div>
      <p style="margin:4px 0 10px">${esc(mk.feedback.overall)}</p>
      <div class="kc-subpanel">
        <div>${tag('t-blue', '知识')}${rich ? tag('t-blue', '可验证事实主张') : tag('t-orange', '待核实判断')}${rich ? tag('sev-hi', '高 · 修改优先级') : tag('sev-md', '中 · 修改优先级')}${tag('t-ai', rich ? 'AI 比对意见：可能冲突' : 'AI 比对意见：证据不足')}</div>
        <p style="margin:8px 0 4px"><b>主张：${esc(f.claim)}</b></p>
        <p style="margin:4px 0">${esc(f.text)}</p>
        <p class="kc-mut">依据：${esc(f.rationale)}</p>
        <p>建议：${esc(f.suggest)}</p>
        <div class="kc-quote">你的解释 v1：『${esc(f.expQuote)}』</div>
        ${f.srcQuote
          ? `<div class="kc-quote bad">来源 src-coin v1 · s1（人工审核）：『${esc(f.srcQuote)}』 <b>与来源冲突</b></div>`
          : `<div class="kc-quote">来源状态：${tag('t-orange', '来源不足 · 只能保持待核实')}（演示词条未配置审核来源）</div>`}
      </div>
      ${c.skipped ? '<div class="kc-warnbox">证据缺口：' + esc(mk.feedback.gapSkipped) + '</div>' : ''}
      <p class="kc-mut">判断类型（事实 / 推断 / 待核实）与证据状态（支持 / 冲突 / 不足）是两个正交维度。</p>
      <button class="kc-btn primary" data-action="ch:to-revise">去修正解释</button>
    </div>`;
  } else if (c.step === 6) {
    const mk = Store.getChMocks();
    const r = mk.revReview;
    const rich = Store.isRich();
    body = `
    <div class="kc-card"><div class="kc-h">修正解释</div>
      <p class="kc-mut" style="margin:4px 0 10px">用自己的话写出修正版（修正区初始为空，不预填模型答案）。提交后由 AI 复核原问题是否在表达上得到处理。</p>
      <textarea id="ch-rev" class="kc-textarea">${esc(c.draft.revision ?? c.rev ?? '')}</textarea>
      <div class="kc-errbox" id="ch-rev-err" role="alert"></div>
      <div class="kc-row" style="margin-top:10px"><button class="kc-btn primary" data-action="ch:submit-rev">提交修正并复核</button>${mk.revSample ? '<button class="kc-btn sm" data-action="ch:fill-rev">填入示例修正</button>' : ''}</div>
    </div>
    ${c.reviewed ? `
    <div class="kc-card"><div class="kc-h">修正复核结果 <span class="kc-mut">（AI 复核意见 · 表述改善不代表知识被权威证实）</span>${rich ? '' : mockTag()}</div>
      <p style="margin:4px 0">${esc(r.overall)}</p>
      <div class="kc-subpanel">
        <div>${rich ? tag('t-green', 'f1 · ' + esc(r.state)) : tag('t-gray', 'f1 · ' + esc(r.state))}</div>
        <p style="margin:8px 0 4px">${esc(r.rationale)}</p>
        <div class="kc-quote">你的修正 v1：『${esc(r.quote)}』</div>
      </div>
      <div class="kc-warnbox">未决事项（保留，不设及格线）：${esc(r.gap)}</div>
      <button class="kc-btn primary" data-action="ch:gen-script">生成科普脚本（演示）</button>
    </div>` : ''}`;
  } else if (c.step === 7) {
    const mk = Store.getChMocks();
    const sc = mk.script;
    const rich = Store.isRich();
    const md = c.scriptMd ?? buildScriptMd();
    body = `
    <div class="kc-card"><div class="kc-h">科普脚本 · ${esc(sc.title)} ${tag('t-gray', rich ? 'AI 辅助草稿' : '演示模板')}${tag('t-gray', '估计 ' + sc.est + ' 秒（需试读）')}<span class="kc-tag t-orange" id="script-badge" style="display:${c.scriptEdited ? 'inline-block' : 'none'}">用户已编辑 · 尚未重新复核</span>${rich ? '' : mockTag()}</div>
      ${sc.blocks.map(b => `<div class="kc-subpanel"><div>${tag('t-gray', esc(b.kind))}${b.refs.map(rf => tag('t-green', esc(rf))).join('')}</div><p style="margin:8px 0 0">${esc(b.text)}</p></div>`).join('')}
      <div class="kc-warnbox">局限性：${sc.limits.map(esc).join('；')}</div>
      ${c.showMd ? `<textarea id="script-md" class="kc-textarea" style="min-height:200px">${esc(md)}</textarea>` : ''}
      <div class="kc-row" style="margin-top:10px">
        <button class="kc-btn primary" data-action="ch:save">保存挑战记录到我的知识作品</button>
        <button class="kc-btn" data-action="ch:toggle-md">${c.showMd ? '收起编辑' : '编辑为 Markdown'}</button>
      </div>
    </div>`;
  } else {
    const mk = Store.getChMocks();
    body = `
    <div class="kc-card"><div class="kc-h">挑战记录已保存</div>
      <div class="kc-okbox">流程完成：解释 ✓ 追问处理（${c.skipped ? '跳过' : '已回答'}）✓ 反馈 ✓ 修正复核 ✓ 脚本 ✓</div>
      <p class="kc-mut">产品不显示「知识已掌握」——保留的是解释证据与未决事项（1 项：${esc(mk.revReview.gap)}）。</p>
      <div class="kc-row"><button class="kc-btn primary" data-action="nav" data-view="works">查看我的知识作品</button><button class="kc-btn" data-action="ch:restart">再来一次挑战</button></div>
    </div>`;
  }
  return chStepsHtml() + '<div class="kc-wrap">' + body + '</div>';
}

function buildScriptMd() {
  const sc = Store.getChMocks().script;
  let md = '# ' + sc.title + '\n\n（' + (Store.isRich() ? 'AI 辅助草稿' : 'Demo Mock 模板') + ' · 目标 60–120 秒 · 估计 ' + sc.est + ' 秒，实际口播因人而异）\n';
  sc.blocks.forEach(b => { md += '\n## ' + b.kind + '\n\n' + b.text + '\n'; });
  md += '\n## 参考与局限\n\n- ' + sc.limits.join('\n- ') + '\n';
  return md;
}

/* ---------------- 视频复盘 ---------------- */
const RV_STEPS = ['上传校验', '提音与转写', '逐段核对', '复盘报告'];
const PROC = ['媒体校验（ffprobe 实测容器 / 时长 / 音轨）', 'FFmpeg 提音（单声道 16 kHz PCM WAV）', '本地 ASR 转写（faster-whisper small · CPU int8）', '等待人工核对'];

function rvStepsHtml() {
  return '<div class="kc-steps kc-wrap" style="margin-bottom:0">' + RV_STEPS
    .map((n, i) => `<span class="kc-step ${i < S.rv.step ? 'done' : ''} ${i === S.rv.step ? 'cur' : ''}">${i < S.rv.step ? '✓ ' : ''}${n}</span>`)
    .join('<span class="kc-mut">→</span>') + '</div>';
}

function reviewHistoryHtml(review = S.rv, selectable = true) {
  if (!review.transcriptVersions || !review.transcriptVersions.length) return '';
  return `<details class="kc-card"><summary>历史确认稿与演示报告</summary>${review.transcriptVersions.map(v => `
    <div class="kc-subpanel"><b>确认稿 v${v.version}</b>
      ${v.segs.map(s => `<p>${esc(s.id)} · ${fmtT(s.start)}–${fmtT(s.end)}：${esc(s.text)}</p>`).join('')}
      ${review.reportVersions.some(p => p.transcriptVersion === v.version) ? (selectable ? `<button class="kc-btn sm" data-action="rv:history" data-v="${v.version}">查看绑定 v${v.version} 的演示报告</button>` : `<p class="kc-mut">保留绑定 v${v.version} 的固定演示报告：${esc(review.reportVersions.find(p => p.transcriptVersion === v.version).data.summary)}</p>`) : '<p class="kc-mut">此版本未生成报告。</p>'}
    </div>`).join('')}</details>`;
}

function vReview() {
  const v = MOCK.video, r = S.rv;
  let body = '';
  if (r.step === 0) {
    body = `
    <div class="kc-card"><div class="kc-h">上传视频</div>
      <div class="kc-drop">${r.picked ? '已选择演示视频' : '将视频拖到这里，或选择演示视频'}<br><br><button class="kc-btn primary" data-action="rv:pick">${r.picked ? '重新选择' : '使用演示视频（20 秒口播）'}</button></div>
      <p class="kc-mut" style="margin-top:10px">限制：单文件 ≤ 100 MiB（104857600 字节）· 时长 ≤ 300 秒 · MP4 / MOV / WebM · 面向普通话口播。扩展名不作数，以 ffprobe 实测为准。无需知识挑战记录即可直接开始。</p>
    </div>
    ${r.picked ? `
    <div class="kc-card"><div class="kc-h">媒体实测信息 ${mockTag()}</div>
      <dl class="kc-kv">
        <dt>文件名</dt><dd>${esc(v.name)}（内部以应用生成 ID 存储）</dd>
        <dt>容器</dt><dd>${esc(v.container)}（模拟实测值）</dd>
        <dt>时长</dt><dd>${fmtT(v.dur)}（≤ 300 秒，通过）</dd>
        <dt>大小</dt><dd>${esc(v.size)}</dd>
        <dt>音轨</dt><dd>${esc(v.track)}</dd>
      </dl>
      <div class="kc-row" style="margin-top:12px"><button class="kc-btn primary" data-action="rv:start">开始提音与转写（演示）</button></div>
    </div>` : ''}`;
  } else if (r.step === 1) {
    body = `
    <div class="kc-card"><div class="kc-h">处理中 ${st('load', '本地处理')}</div>
      <ul class="kc-proc">${PROC.map((n, i) => `<li class="${i < r.proc ? 'done' : ''} ${i === r.proc ? 'act' : ''}">${i === r.proc ? '<span class="kc-spin"></span>' : i < r.proc ? '✓ ' : ''}${n}</li>`).join('')}</ul>
      <p class="kc-mut">演示为模拟进度，不执行真实 FFmpeg / ASR。真实产品不显示伪造的精确剩余时间或百分比。</p>
    </div>`;
  } else if (r.step === 2) {
    const ver = r.version, conf = r.confirmed;
    body = `
    <div class="kc-card"><div class="kc-h">逐段核对转写稿 <span id="rv-transcript-status">${ver > 0 ? (Store.isTranscriptConfirmed() ? st('done', '当前 v' + ver + ' · 已确认') : st('wait', '当前 v' + ver + ' · 待确认')) : st('wait', '待核对')}</span> ${mockTag()}</div>
      <p class="kc-mut" style="margin:4px 0 10px">P0 只修改文字，不调整时间轴、不拆段合段；时间戳为段级估计。清空误识别段后至少保留一段有效文字。ASR 原文保留不改写；转写是口播识别结果，不代表完整视频理解。</p>
      <div class="kc-tablewrap"><table class="kc-table"><thead><tr><th style="width:56px">段 ID</th><th style="width:150px">起止（原视频）</th><th>识别原文</th><th>修改后文字</th><th style="width:56px"></th></tr></thead>
      <tbody>${r.segs.map((s, i) => `<tr><td>${s.id}</td><td>${fmtT(s.start)}–${fmtT(s.end)}</td><td class="kc-mut">${esc(MOCK.segs[i].text)}</td><td><input id="segin-${i}" class="kc-input" value="${esc(s.text)}"></td><td><button class="kc-btn sm" data-action="rv:clear-seg" data-i="${i}">清空</button></td></tr>`).join('')}</tbody></table></div>
      <div class="kc-errbox" id="rv-err" role="alert"></div>
      <div class="kc-row" style="margin-top:12px">
        <button class="kc-btn primary" data-action="rv:confirm">我已核对，确认此稿</button>
        ${r.reportOn > 0 ? '<button class="kc-btn" data-action="rv:view-report">查看历史复盘报告</button>' : ''}
        <button class="kc-btn" id="rv-report-btn" data-action="rv:report" ${!Store.isTranscriptConfirmed() || !S.consent.review ? 'disabled' : ''}>${r.reportOn > 0 ? '基于新确认稿重新复盘（演示）' : '生成 AI 复盘（演示）'}</button>
      </div>
      <p class="kc-mut" id="rv-draft-note" role="status">${Store.isTranscriptConfirmed() ? '' : '当前稿尚未确认；旧报告仅供历史查看，请确认后再复盘。'}</p>
      ${!S.consent.review && conf > 0 ? '<div class="kc-warnbox" style="margin-top:8px">尚未同意「视频复盘」文字外发：将发送确认稿文字与来源片段；不发送原视频与音频。<button class="kc-btn sm" data-action="nav" data-view="settings" style="margin-left:8px">前往设置</button></div>' : ''}
      <p class="kc-mut" style="margin-top:8px">确认的含义：转写与你的口播基本一致，<b>不是</b>其中知识事实已核实。修改已确认稿将产生新版本，旧报告标记过期。</p>
    </div>`;
  } else {
    const rp = Store.getReviewReport().data, f = rp.f;
    const stale = !Store.isTranscriptConfirmed() || r.reportOn !== r.confirmed;
    body = `
    <div class="kc-card"><div class="kc-h">AI 复盘报告 ${stale ? st('wait', '已过期：基于 v' + r.reportOn + '，当前 v' + r.version + (r.confirmed ? ' · 已确认' : ' · 待确认')) : st('done', '有效：绑定确认稿 v' + r.reportOn)} ${tag('t-gray', '仅基于确认稿文字')}${mockTag()}</div>
      ${stale ? `<div class="kc-warnbox">此报告基于旧版转写，不代表当前版本。确认当前稿后才可重新复盘（演示：重放固定 Mock，非真实 AI 分析）。<br><br><button class="kc-btn sm" data-action="rv:regen" ${!Store.isTranscriptConfirmed() || !S.consent.review ? 'disabled' : ''}>重新生成复盘（演示）</button></div>` : ''}
      <p style="margin:4px 0 10px">${esc(rp.summary)}</p>
      <div class="kc-subpanel">
        <div>${tag('t-blue', '知识')}${tag('t-blue', '可验证事实主张')}${tag('sev-hi', '高 · 修改优先级')}${tag('t-ai', 'AI 比对意见：可能冲突')}</div>
        <p style="margin:8px 0 4px"><b>主张：${esc(f.claim)}</b></p>
        <p style="margin:4px 0">${esc(f.text)}</p>
        <p class="kc-mut">依据：${esc(f.rationale)}</p>
        <p>建议：${esc(f.suggest)}</p>
        <div class="kc-quote">${f.seg} · ${fmtT(f.t0)}–${fmtT(f.t1)}：『${esc(f.quote)}』 <button class="kc-btn sm" data-action="rv:play">▶ 定位播放</button> <span class="kc-mut" id="rv-play-note"></span></div>
        <div class="kc-quote bad">来源 src-coin v1 · s1（人工审核）：『${esc(f.srcQuote)}』 <b>与来源冲突</b></div>
        <div class="kc-warnbox">不确定性（${esc(f.unc)}）：${esc(f.uncNote)}</div>
        <div class="kc-row">建议处理：
          <button class="kc-btn sm ${r.adopt[f.id] === 'adopt' ? 'primary' : ''}" data-action="rv:adopt" data-v="adopt">准备修改</button>
          <button class="kc-btn sm ${r.adopt[f.id] === 'skip' ? 'primary' : ''}" data-action="rv:adopt" data-v="skip">暂不采纳</button>
        </div>
      </div>
      <div class="kc-subpanel">
        <div>${tag('t-purple', '复盘追问 vq1')}${tag('t-purple', '因果推理')}</div>
        <p style="margin:8px 0 4px"><b>${esc(rp.q.text)}</b></p>
        <p class="kc-mut">为什么问：${esc(rp.q.why)}</p>
        <div class="kc-quote">引用 ${rp.q.seg}：『${esc(rp.q.basedOn)}』</div>
      </div>
      <p class="kc-mut">本次未分析维度：${rp.unassessed.map(u => tag('t-gray', esc(u))).join('')} — 仅分析确认稿文字，不评价画面、字幕、剪辑与语气。</p>
      <p class="kc-mut">局限：${rp.limits.map(esc).join('；')}</p>
      ${stale ? '<p class="kc-mut">历史报告仅供查看；确认当前稿并重新复盘后，才可保存新结果。</p>' : r.saved ? '<div class="kc-okbox">复盘已保存到「我的知识作品」。可在档案中关联同知识点挑战。</div>' : '<button class="kc-btn primary" data-action="rv:save">保存复盘到我的知识作品</button>'}
      <div class="kc-row" style="margin-top:8px"><button class="kc-btn sm" data-action="rv:edit">编辑当前转写</button>${r.saved ? '<button class="kc-btn" data-action="nav" data-view="works">查看我的知识作品并关联挑战</button>' : ''}</div>
    </div>`;
  }
  return rvStepsHtml() + '<div class="kc-wrap">' + body + (r.step >= 2 ? reviewHistoryHtml() : '') + '</div>';
}

/* ---------------- 我的知识作品 ---------------- */
function worksListHtml() {
  const f = S.wkFilter;
  const list = S.works.filter(w => (f.type === 'all' || w.type === f.type) && (f.domain === 'all' || w.domain === f.domain) && (!f.q || (w.title + w.kp).includes(f.q)));
  if (!S.works.length) return '<div class="kc-empty">还没有记录。两个模式都可以独立开始。<br><br><button class="kc-btn sm" data-action="nav" data-view="challenge">开始知识挑战</button> <button class="kc-btn sm" data-action="nav" data-view="review">上传视频复盘</button></div>';
  if (!list.length) return '<div class="kc-empty">当前筛选无结果。<br><br><button class="kc-btn sm" data-action="wk:clear-filter">清空筛选</button></div>';
  return list.map(w => {
    const i = S.works.indexOf(w);
    return `<div class="kc-wkitem" data-action="wk:open" data-i="${i}">
      <div style="flex:1">${w.type === 'challenge' ? tag('t-blue', '挑战') : tag('t-purple', '复盘')} <b>${esc(w.title)}</b>
      <div class="kc-mut">${esc(w.domain)} · 更新于 ${esc(w.updated)} · ${esc(w.status)} · 未决事项 ${w.open}</div></div>
      <div class="kc-mut">›</div></div>`;
  }).join('');
}

function buildExportMd(w) {
  let md = '# ' + w.title + '\n\n- 类型：' + (w.type === 'challenge' ? '知识挑战' : '视频复盘') + '\n- 知识点：' + w.kp + '\n- 保存时间：' + w.updated + '\n';
  if (w.type === 'challenge') {
    const mk = w.rich ? MOCK.chCoin : null;
    md += '\n## 独立解释（v1）\n\n' + w.exp + '\n\n## 追问处理\n\n- q1：' + (w.skipped ? '已跳过（证据缺口）' : '已回答') + '\n\n## AI 反馈要点\n\n- ' + (mk ? '[知识 · 可验证事实主张 · 可能冲突] ' + mk.feedback.f.claim + '（对照 src-coin v1·s1）' : '（Demo Mock 模板反馈，无真实来源比对）') + '\n\n## 修正（v1）\n\n' + w.rev + '\n\n## 修正复核\n\n- ' + (mk ? 'f1：AI 复核认为已有修正（基于修正 v1）；未决：' + mk.revReview.gap : '（Demo Mock：演示模式未接入真实复核）') + '\n\n## 脚本\n\n' + (w.md ?? buildScriptMdTitle(w));
  } else {
    md += '\n## 转写（确认稿 v' + w.version + '）\n\n' + w.segs.map(s => '- ' + s.id + ' ' + fmtT(s.start) + '–' + fmtT(s.end) + '：' + s.text).join('\n') + '\n\n## AI 复盘要点\n\n- [知识 · 可验证事实主张 · 可能冲突] ' + MOCK.report.f.claim + '\n  - 定位：' + MOCK.report.f.seg + ' ' + fmtT(MOCK.report.f.t0) + '–' + fmtT(MOCK.report.f.t1) + '『' + MOCK.report.f.quote + '』\n  - 不确定性：' + MOCK.report.f.unc + ' — ' + MOCK.report.f.uncNote + '\n- 局限：' + MOCK.report.limits.join('；');
  }
  md += '\n\n---\n导出时间：' + now() + ' · 协议 v1.0（演示）· 判断类型与证据状态含义见 PRD §9\n';
  return md;
}

function buildScriptMdTitle(w) {
  const mk = w.rich ? MOCK.chCoin : null;
  if (mk) {
    let md = '# ' + mk.script.title + '\n';
    mk.script.blocks.forEach(b => { md += '\n## ' + b.kind + '\n\n' + b.text + '\n'; });
    return md;
  }
  return '# ' + w.scriptTitle + '\n\n（Demo Mock 模板脚本，不可直接使用）\n';
}

function vWorks() {
  if (S.wkSel === null) {
    return `<div class="kc-wrap"><div class="kc-card"><div class="kc-h">我的知识作品 <span class="kc-mut">（两个模式共享；不展示「掌握率」）</span></div>
      <div class="kc-row" style="margin-bottom:10px">
        <input id="wk-q" class="kc-input" style="max-width:220px" placeholder="标题搜索" value="${esc(S.wkFilter.q)}">
        <select id="wk-type" class="kc-select" style="max-width:150px">
          <option value="all"${S.wkFilter.type === 'all' ? ' selected' : ''}>全部类型</option>
          <option value="challenge"${S.wkFilter.type === 'challenge' ? ' selected' : ''}>知识挑战</option>
          <option value="review"${S.wkFilter.type === 'review' ? ' selected' : ''}>视频复盘</option>
        </select>
        <select id="wk-domain" class="kc-select" style="max-width:150px">
          <option value="all"${S.wkFilter.domain === 'all' ? ' selected' : ''}>全部词库</option>
          ${S.vocabs.map(v => `<option value="${esc(v.name)}"${S.wkFilter.domain === v.name ? ' selected' : ''}>${esc(v.name)}</option>`).join('')}
          <option value="未分类"${S.wkFilter.domain === '未分类' ? ' selected' : ''}>未分类</option>
        </select>
      </div>
      <div id="wk-list">${worksListHtml()}</div>
    </div></div>`;
  }
  const w = S.works[S.wkSel];
  if (!w) { S.wkSel = null; return vWorks(); }
  let detail = '';
  if (w.type === 'challenge') {
    const linked = S.works.filter(x => x.type === 'review' && x.linked === w.id);
    detail = `
    <div class="kc-card"><div class="kc-h">阶段状态</div>
      <div>${st('done', '学习阶段 已完成')} ${st('done', '脚本 已就绪')} ${tag('t-gray', '视频作品 未提交')}</div>
      <p class="kc-mut" style="margin-top:6px">学习完成、脚本就绪与视频作品提交是三个独立状态；本产品只记录前两者。</p>
    </div>
    <div class="kc-card"><div class="kc-h">版本链</div>
      <div class="kc-quote">独立解释 v1（不可覆盖）：『${esc(w.exp.slice(0, 80))}${w.exp.length > 80 ? '…' : ''}』</div>
      <div class="kc-quote">修正 v1：『${esc(w.rev.slice(0, 80))}${w.rev.length > 80 ? '…' : ''}』</div>
      <div class="kc-quote">脚本 v1 · ${w.rich ? 'AI 辅助草稿' : '演示模板'}：${esc(w.scriptTitle)}（完整内容见导出）</div>
      <div class="kc-warnbox">未决事项（1）：${esc((w.rich ? MOCK.chCoin.revReview.gap : '该词条为内置词库占位数据'))}</div>
    </div>
    <div class="kc-card"><div class="kc-h">关联的视频复盘（${linked.length}）</div>
      ${linked.length ? linked.map(x => `<div class="kc-wkitem" data-action="wk:open" data-i="${S.works.indexOf(x)}">${tag('t-purple', '复盘')} <b>${esc(x.title)}</b></div>`).join('') : '<p class="kc-mut">暂无。可在视频复盘记录中手工关联同知识点挑战（一次挑战可关联多个视频，一个视频最多关联一次挑战）。</p>'}
    </div>`;
  } else {
    const linkedCh = w.linked ? S.works.find(x => x.id === w.linked) : null;
    const cands = S.works.filter(x => x.type === 'challenge' && x.kp === w.kp && x.id !== w.linked);
    detail = `
    <div class="kc-card"><div class="kc-h">阶段状态</div>
      <div>${st('done', '复盘 已保存')} ${st('done', '视频 已归档')} ${st('done', '转写 已确认 v' + w.version)} ${w.mediaGone ? st('wait', '媒体 已清理') : ''}</div>
    </div>
    <div class="kc-card"><div class="kc-h">转写（确认稿 v${w.version}）${mockTag()}</div>
      ${w.segs.map(s => `<div class="kc-quote">${s.id} · ${fmtT(s.start)}–${fmtT(s.end)}：『${esc(s.text)}』</div>`).join('')}
      <p class="kc-mut">报告绑定 v${w.reportOn}${w.reportOn === w.version ? '（当前有效）' : '（已过期）'}。</p>
    </div>
    ${reviewHistoryHtml(w, false)}
    <div class="kc-card"><div class="kc-h">关联挑战</div>
      ${linkedCh ? `<p>${tag('t-blue', '已关联')} <b>${esc(linkedCh.title)}</b> <span class="kc-mut">（同知识点）</span></p><button class="kc-btn sm" data-action="wk:unlink">解除关联（复盘保留在当前档案）</button>` :
        `<p class="kc-mut">未关联。仅列出同知识点挑战；跨知识点不可关联。</p>
         ${S.wkLinkPanel ? cands.map(x => `<div class="kc-wkitem" style="cursor:default"><div style="flex:1">${tag('t-blue', '挑战')} <b>${esc(x.title)}</b><div class="kc-mut">${esc(x.domain)} · ${esc(x.updated)}</div></div><button class="kc-btn sm primary" data-action="wk:link" data-id="${x.id}">确认关联</button></div>`).join('') || '<p class="kc-mut">当前没有同知识点的挑战记录可关联。</p>' : ''}
         ${!S.wkLinkPanel && cands.length ? '<button class="kc-btn sm" data-action="wk:link-panel">选择同知识点挑战</button>' : ''}`}
    </div>`;
  }
  return `
  <div class="kc-wrap">
    <div class="kc-row" style="margin:14px 0 12px"><button class="kc-btn sm" data-action="wk:back">‹ 返回列表</button></div>
    <div class="kc-card"><div class="kc-h">${w.type === 'challenge' ? tag('t-blue', '知识挑战') : tag('t-purple', '视频复盘')} ${esc(w.title)}</div>
      <dl class="kc-kv">
        <dt>知识点</dt><dd>${esc(w.kp)}</dd>
        <dt>状态</dt><dd>${esc(w.status)} · 未决事项 ${w.open}</dd>
        <dt>更新时间</dt><dd>${esc(w.updated)}</dd>
        ${w.type === 'review' ? `<dt>媒体状态</dt><dd>${w.mediaGone ? st('wait', '媒体已清理（文字记录保留）') : st('done', '原视频保留在本地')}</dd>` : ''}
      </dl>
    </div>
    ${detail}
    <div class="kc-card"><div class="kc-h">导出与删除</div>
      <div class="kc-row">
        <button class="kc-btn" data-action="wk:export">${S.wkExport ? '收起导出内容' : '导出 Markdown'}</button>
        ${w.type === 'review' && !w.mediaGone ? '<button class="kc-btn danger" data-confirm="1" data-action="wk:del-media">清理媒体文件</button>' : ''}
        <button class="kc-btn danger" data-confirm="1" data-action="wk:del">删除本条记录</button>
      </div>
      <p class="kc-mut" style="margin-top:8px">清理媒体仅删除本地视频与派生音频，保留转写与报告；删除记录需二次确认且不可恢复（演示）。</p>
      ${S.wkExport ? `<div class="kc-pre" id="exp-md">${esc(buildExportMd(w))}</div><div class="kc-row"><button class="kc-btn sm" data-action="wk:copy">复制导出内容</button><span class="kc-mut" id="copy-note"></span></div>` : ''}
    </div>
  </div>`;
}

/* ---------------- 设置与帮助 ---------------- */
function vSettings() {
  return `
  <div class="kc-wrap"><div class="kc-grid" style="grid-template-columns:1fr 1fr">
    <div class="kc-card"><div class="kc-h">本地依赖 ${mockTag()}</div>
      <dl class="kc-kv">
        <dt>FFmpeg</dt><dd>${st('done', '已检测')}</dd>
        <dt>本地 ASR</dt><dd>${st('done', 'faster-whisper small · int8')}</dd>
        <dt>SQLite</dt><dd>${st('done', '可用')}</dd>
        <dt>大模型 API</dt><dd>${st('fail', '未配置')}</dd>
      </dl>
      <p class="kc-mut" style="margin-top:8px">以上为演示状态值。密钥示例（演示版不保存任何输入，真实版仅存本地环境变量 / secrets，不回显）：</p>
      <input class="kc-input" placeholder="LLM_API_KEY=sk-****（禁用）" disabled>
    </div>
    <div class="kc-card"><div class="kc-h">文字外发同意 <span class="kc-mut">（按类别，可随时撤回）</span></div>
      <div class="kc-switchrow"><input type="checkbox" id="consent-ch" ${S.consent.challenge ? 'checked' : ''}><div><b>挑战类 AI 步骤</b>（追问 / 反馈 / 修正复核 / 脚本）<div class="kc-mut">发送：你的解释、回答、修正与来源片段（仅文字）。未同意时学习与保存仍可用，AI 不可调用。</div></div></div>
      <div class="kc-switchrow"><input type="checkbox" id="consent-rv" ${S.consent.review ? 'checked' : ''}><div><b>视频复盘</b><div class="kc-mut">发送：确认稿文字与来源片段。原视频与音频始终不发给云端模型。</div></div></div>
      <p class="kc-mut" style="margin-top:8px">演示版不会真实发送任何数据；服务商与数据保留政策将在选定后披露。</p>
    </div>
    <div class="kc-card"><div class="kc-h">状态样式一览</div>
      <div>${st('done')} ${st('act')} ${st('wait')} ${st('fail')} ${st('load')} ${mockTag()}</div>
      <p class="kc-mut" style="margin-top:8px">正常、处理中、待核对 / 确认、失败、完成与模拟数据在全局使用同一套状态标签，便于区分真实进度与演示内容。</p>
    </div>
    <div class="kc-card"><div class="kc-h">抽题音效 <span class="kc-mut">（ZzFX 合成 · 本地生成，无音频文件）</span></div>
      <div class="kc-switchrow"><input type="checkbox" id="sound-enabled" ${SoundFx.isEnabled() ? 'checked' : ''}><div><b>抽题音效开关</b><div class="kc-mut">词条切换滴答声与结果锁定音；关闭后动画不受影响。偏好保存在本机 localStorage。</div></div></div>
      <div class="kc-switchrow" style="border-bottom:none"><div style="flex:1"><b>音量</b> <span class="kc-mut" id="sound-volume-label">${Math.round(SoundFx.getVolume() * 100)}%</span><input type="range" id="sound-volume" min="0" max="100" value="${Math.round(SoundFx.getVolume() * 100)}" style="width:100%;margin-top:6px"></div></div>
    </div>
    <div class="kc-card"><div class="kc-h">数据与隐私</div>
      <p class="kc-mut">原视频仅本地保存，可单独清理；提取的音频为临时数据，任务结束清理。导出不含密钥与内部路径。删除媒体保留文字记录与时间定位。</p>
    </div>
    <div class="kc-card"><div class="kc-h">产品边界</div>
      <p class="kc-mut">不做：自动生成视频 / 自动剪辑 / TTS / 数字人 / 社交发布 / 掌握评分或证书 / 开放网页事实核查 / 多用户账户 / 云端视频存储。AI 评价是辅助意见，不是事实核查结果。运营工具与账号能力属于后续方向，未实现。</p>
    </div>
  </div></div>`;
}

const VIEWS = { home: vHome, challenge: vChallenge, review: vReview, works: vWorks, settings: vSettings };
