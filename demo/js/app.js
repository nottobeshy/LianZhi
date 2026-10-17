/* 选题罗盘 · 应用入口：导航、渲染循环、事件委托与抽题编排 */
'use strict';

const app = document.getElementById('kc-app');
const NAV = [['home', '首页'], ['challenge', '知识挑战'], ['review', '视频复盘'], ['works', '我的知识作品'], ['settings', '设置与帮助']];
let learningTimerHandle = null;
let learningTimerOwner = null;
let spinCompass = null;

function formatLearningTime(ms) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
}

function syncLearningTimer() {
  const active = S.view === 'challenge' && S.ch.step === 2 && S.ch.learningTimer.state === 'running';
  if (!active) {
    if (learningTimerHandle) clearInterval(learningTimerHandle);
    learningTimerHandle = null;
    learningTimerOwner = null;
    return;
  }
  if (learningTimerHandle && learningTimerOwner === S.ch) return;
  if (learningTimerHandle) clearInterval(learningTimerHandle);
  const owner = S.ch;
  const timer = owner.learningTimer;
  const generation = timer.generation;
  learningTimerOwner = owner;
  const handle = setInterval(() => {
    if (S.ch !== owner || S.view !== 'challenge' || S.ch.step !== 2 || owner.learningTimer !== timer || timer.generation !== generation) {
      clearInterval(handle);
      if (learningTimerHandle === handle) {
        learningTimerHandle = null;
        learningTimerOwner = null;
      }
      return;
    }
    Store.updateLearningTimer();
    const value = document.getElementById('learning-timer-value');
    if (value) value.textContent = formatLearningTime(timer.remainingMs);
    /* 进度条为纯展示，不改变计时状态逻辑 */
    const pct = timerPct(timer);
    const bar = document.getElementById('learning-timer-bar');
    if (bar) bar.style.width = pct + '%';
    const track = document.getElementById('learning-timer-track');
    if (track) track.setAttribute('aria-valuenow', String(pct));
    if (timer.state === 'finished') {
      clearInterval(handle);
      if (learningTimerHandle === handle) {
        learningTimerHandle = null;
        learningTimerOwner = null;
      }
      render();
    }
  }, 250);
  learningTimerHandle = handle;
}

function copyVocabExample() {
  const md = getBankExample(S.vocabExampleKey).md;
  const note = document.getElementById('vocab-example-note');
  const done = ok => { if (note) note.textContent = ok ? '范例已复制。' : '复制失败，请手动选择范例文本。'; };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(md).then(() => done(true), () => done(false));
  } else {
    const text = document.createElement('textarea');
    text.value = md;
    text.style.position = 'fixed'; text.style.opacity = '0';
    document.body.appendChild(text); text.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (e) { copied = false; }
    text.remove(); done(copied);
  }
}

function downloadVocabExample() {
  const bank = getBankExample(S.vocabExampleKey);
  const url = URL.createObjectURL(new Blob([bank.md], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = bank.name + '-范例.md';
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const note = document.getElementById('vocab-example-note');
  if (note) note.textContent = '已下载 UTF-8 Markdown 范例。';
}

function render() {
  cancelAllDraws();
  if (spinCompass) { spinCompass.destroy(); spinCompass = null; }
  app.innerHTML = `
  <div class="kc-banner">非功能演示原型 — 仅供界面与流程对齐；AI 反馈、转写与进度均为预置 / 模拟数据（Demo Mock），真实行为以 docs/ 需求文档（00–05）为准</div>
  <header class="kc-header"><div class="kc-wrap kc-header-in">
    <div class="kc-logo"><svg class="kc-mark" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M13.8 6.2 11.2 11.2 6.2 13.8 8.8 8.8 Z" fill="var(--primary)"/></svg>选题罗盘<small>Knowledge Compass · 演示原型</small></div>
    <nav class="kc-nav" aria-label="主导航">${NAV.map(([k, l]) =>
      `<button data-action="nav" data-view="${k}" class="${S.view === k ? 'active' : ''}" aria-current="${S.view === k ? 'page' : 'false'}">${l}${k === 'works' && S.works.length ? ' · ' + S.works.length : ''}</button>`).join('')}</nav>
  </div></header>
  <main class="kc-main">${(VIEWS[S.view] || vHome)()}</main>
  <footer class="kc-footer">非功能演示原型 v1.3 · 2026-10-13 · 配套需求文档见仓库 docs/00–05 · 词库由 localStorage 持久化，刷新后保留（活动抽题状态仍为内存）</footer>`;
  bindFileInputs();
  syncLearningTimer();
}

/* ---------- 词库 .md 解析输入绑定（每次渲染后都重新挂） */
function bindFileInputs() {
  const fi = document.getElementById('vocab-file');
  if (!fi) return;
  fi.addEventListener('change', () => {
    const f = fi.files && fi.files[0];
    if (!f) { fi.value = ''; return; }
    const r = new FileReader();
    r.onload = () => {
      const parsed = VocabParser.parseVocabMarkdown(String(r.result || ''));
      S.vocabImport = { fileName: f.name, parsed: parsed };
      fi.value = '';
      render();
    };
    r.onerror = () => {
      S.vocabImport = { fileName: f.name, parsed: { ok: false, name: '', terms: [], errors: [{ line: 0, msg: '文件读取失败' }] } };
      fi.value = '';
      render();
    };
    r.readAsText(f);
  });
}

/* ---------- 抽题编排：先定结果，再播动画，结束后落到锁定卡 ---------- */
function beginDraw() {
  const c = S.ch;
  const pool = Store.filterPool();
  if (!pool.length) return;
  const winner = Store.pickDraw(c.lastDraw);
  if (!winner) return;
  Store.resetLearningTimer();
  c.locked = winner.id;
  c.lastDraw = winner.id;
  c.step = 1;
  c.drawStarted = true;
  c.drawDone = false;
  SoundFx.unlock(); // 抽取按钮点击即用户手势，恢复音频上下文
  if (spinCompass) { spinCompass.destroy(); spinCompass = null; } // 快速重复点击保护：先清旧旋转
  render();
  const stage = document.getElementById('draw-stage');
  if (!stage) { c.drawDone = true; render(); return; }
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  spinCompass = createSpinCompass(stage);
  spinCompass.start(reduced);
  const winnerIdx = pool.findIndex(it => it.id === winner.id);
  runDrawCeremony({
    stage: stage,
    candidates: pool,
    winnerIdx: winnerIdx,
    meta: { text: winner.domain + ' · ' + winner.level },
    onTick: (i, total) => {
      SoundFx.tick();
      if (spinCompass) spinCompass.setPhase(total > 1 ? i / (total - 1) : 1);
    },
    onLock: () => {
      SoundFx.lock();
      if (spinCompass) spinCompass.lock();
    },
    onDone: (reason) => {
      c.drawDone = true;
      if (spinCompass) { spinCompass.destroy(); spinCompass = null; }
      /* cancel（页面离开）：不重渲染，由触发方的下一次 render 收敛视图 */
      if (reason !== 'cancel' && S.view === 'challenge' && S.ch.step === 1) render();
    }
  });
}

/* ---------- 统一错误提示 ---------- */
const err = (id, msg) => { const e = document.getElementById(id); if (e) { e.textContent = msg; e.style.display = 'block'; } };

function syncTranscriptStatus() {
  const status = document.getElementById('rv-transcript-status');
  if (status) status.innerHTML = Store.isTranscriptConfirmed()
    ? st('done', '当前 v' + S.rv.version + ' · 已确认')
    : st('wait', '当前 v' + S.rv.version + ' · 待确认');
  const generate = document.getElementById('rv-report-btn');
  if (generate) generate.disabled = !S.consent.review || !Store.isTranscriptConfirmed();
  const note = document.getElementById('rv-draft-note');
  if (note) note.textContent = Store.isTranscriptConfirmed() ? '' : '当前稿尚未确认；旧报告仅供历史查看，请确认后再复盘。';
}

/* ---------- 危险操作两步确认 ---------- */
function armed(b) {
  if (b.dataset.armed === '1') return true;
  b.dataset.armed = '1'; b.dataset.orig = b.textContent;
  b.textContent = '再点一次确认删除'; b.classList.add('kc-armed');
  setTimeout(() => { if (b.isConnected && b.dataset.armed === '1') { b.dataset.armed = ''; b.textContent = b.dataset.orig; b.classList.remove('kc-armed'); } }, 2600);
  return false;
}

/* ---------- 模拟处理进度（视频复盘） ---------- */
function startProc() {
  S.rv.step = 1; S.rv.proc = 0; render();
  let i = 0;
  const tick = () => {
    i++;
    if (i < PROC.length) { S.rv.proc = i; if (S.view === 'review') render(); setTimeout(tick, 850); }
    else {
      S.rv.step = 2; S.rv.proc = -1;
      if (!S.rv.segs.length) S.rv.segs = MOCK.segs.map(s => ({ ...s }));
      render();
    }
  };
  setTimeout(tick, 850);
}

/* ---------- 作品保存（演示：内存数组） ---------- */
function doSaveChallenge() {
  if (S.ch.scriptEdited) {
    const ta = document.getElementById('script-md');
    if (ta) S.ch.scriptMd = ta.value;
  }
  Store.saveChallenge();
  S.ch.step = 8; render();
}

/* ---------- 事件委托 ---------- */
app.addEventListener('click', e => {
  const b = e.target.closest('[data-action]'); if (!b) return;
  const act = b.dataset.action, d = b.dataset;

  switch (act) {
    /* 导航 */
    case 'nav':
      if (S.view !== d.view) {
        /* 切换页面时取消未完成的抽题动画 */
        cancelAllDraws();
        if (S.view === 'challenge') Store.pauseLearningTimer();
        S.view = d.view; S.wkSel = null; S.wkExport = false; S.wkLinkPanel = false;
        render();
      }
      break;

    /* 知识挑战 */
    case 'ch:budget': S.ch.budget = +d.v; render(); break;
    case 'ch:vocab': Store.setActiveVocab(d.id); render(); break;
    case 'ch:vocab-del': {
      if (!armed(b)) return;
      Store.deleteVocab(d.id);
      render();
      break;
    }
    case 'ch:vocab-clear': S.vocabImport = { fileName: '', parsed: null }; render(); break;
    case 'ch:vocab-example-tab': S.vocabExampleKey = d.v; render(); break;
    case 'ch:vocab-example-copy': copyVocabExample(); break;
    case 'ch:vocab-example-download': downloadVocabExample(); break;
    case 'ch:vocab-import': {
      if (S.vocabImport && S.vocabImport.parsed && S.vocabImport.parsed.ok) {
        if (Store.importVocab(S.vocabImport.parsed)) S.vocabImport = { fileName: '', parsed: null };
        render();
      }
      break;
    }
    case 'ch:diff': Store.setDifficulty(d.v); render(); break;
    case 'ch:term': {
      const v = Store.getActiveVocab(); if (!v || v.builtin) return;
      Store.toggleTerm(v.id, d.id); render(); break;
    }
    case 'ch:draw': beginDraw(); break;
    case 'ch:open-card': S.ch.step = 2; render(); break;
    case 'ch:redraw': S.ch.redrawOnce = true; beginDraw(); break;
    case 'ch:back-config': Store.pauseLearningTimer(); S.ch.step = 0; S.ch.locked = null; S.ch.drawStarted = false; S.ch.drawDone = false; S.ch.redrawOnce = false; render(); break;
    case 'ch:learned': Store.pauseLearningTimer(); S.ch.step = 3; render(); break;
    case 'ch:timer-preset': Store.setLearningTimer(+d.v); render(); break;
    case 'ch:timer-start': Store.startLearningTimer(); render(); break;
    case 'ch:timer-pause': Store.pauseLearningTimer(); render(); break;
    case 'ch:timer-reset': Store.resetLearningTimer(); render(); break;
    case 'ch:fill-exp': { const ta = document.getElementById('ch-exp'); ta.value = MOCK.chCoin.expSample; S.ch.draft.explanation = ta.value; document.getElementById('ch-count').textContent = String(MOCK.chCoin.expSample.length); break; }
    case 'ch:submit-exp': {
      const v = document.getElementById('ch-exp').value.trim();
      if (!v) { err('ch-exp-err', '不能提交空白解释。'); return; }
      S.ch.explained = v; S.ch.shortHint = v.length < 50; S.ch.step = 4; render(); break;
    }
    case 'ch:gen-q': S.ch.qShown = true; render(); break;
    case 'ch:fill-ans': { const ta = document.getElementById('ch-ans'); if (ta && Store.getChMocks().ansSample) { ta.value = Store.getChMocks().ansSample; S.ch.draft.answer = ta.value; } break; }
    case 'ch:skip-q': S.ch.skipped = true; render(); break;
    case 'ch:unskip': S.ch.skipped = false; render(); break;
    case 'ch:submit-ans': {
      if (!S.ch.skipped) {
        const v = document.getElementById('ch-ans').value.trim();
        if (!v) { err('ch-ans-err', '请填写回答，或点「暂时不会 / 跳过」。'); return; }
        S.ch.ans = v;
      }
      S.ch.step = 5; render(); break;
    }
    case 'ch:to-revise': S.ch.step = 6; render(); break;
    case 'ch:fill-rev': { const ta = document.getElementById('ch-rev'); if (ta && Store.getChMocks().revSample) { ta.value = Store.getChMocks().revSample; S.ch.draft.revision = ta.value; } break; }
    case 'ch:submit-rev': {
      const v = document.getElementById('ch-rev').value.trim();
      if (!v) { err('ch-rev-err', '修正不能为空；如暂不修正可返回保存草稿。'); return; }
      S.ch.rev = v; S.ch.reviewed = true; render(); break;
    }
    case 'ch:gen-script': S.ch.step = 7; render(); break;
    case 'ch:toggle-md': S.ch.showMd = !S.ch.showMd; render(); break;
    case 'ch:save': doSaveChallenge(); break;
    case 'ch:restart': S.ch = freshCh(); render(); break;

    /* 视频复盘 */
    case 'rv:pick': S.rv.picked = true; render(); break;
    case 'rv:start': startProc(); break;
    case 'rv:clear-seg': { document.getElementById('segin-' + d.i).value = ''; Store.editTranscript(+d.i, ''); syncTranscriptStatus(); break; }
    case 'rv:confirm': {
      const inputs = S.rv.segs.map((s, i) => document.getElementById('segin-' + i).value);
      if (!inputs.some(x => x.trim())) { err('rv-err', '至少保留一段有效文字才能确认。'); return; }
      inputs.forEach((text, i) => Store.editTranscript(i, text));
      Store.confirmTranscript(); render(); break;
    }
    case 'rv:report': case 'rv:regen':
      if (!Store.generateReview()) { err('rv-err', '请先确认当前转写稿，并开启视频复盘文字外发同意。'); return; }
      render(); break;
    case 'rv:view-report': if (Store.getReviewReport()) { S.rv.step = 3; render(); } break;
    case 'rv:history': if (Store.showReviewReport(+d.v)) render(); break;
    case 'rv:edit': S.rv.step = 2; render(); break;
    case 'rv:play': { const n = document.getElementById('rv-play-note'); if (n) n.textContent = '演示原型未内嵌真实视频；实际产品将从片段起点播放。'; break; }
    case 'rv:adopt': { const cur = MOCK.report.f.id; S.rv.adopt[cur] = S.rv.adopt[cur] === d.v ? undefined : d.v; render(); break; }
    case 'rv:save': Store.saveReview(); render(); break;

    /* 我的知识作品 */
    case 'wk:open': S.wkSel = +d.i; S.wkExport = false; S.wkLinkPanel = false; render(); break;
    case 'wk:back': S.wkSel = null; render(); break;
    case 'wk:clear-filter': S.wkFilter = { q: '', type: 'all', domain: 'all' }; render(); break;
    case 'wk:link-panel': S.wkLinkPanel = true; render(); break;
    case 'wk:link': { const w = S.works[S.wkSel]; if (w) w.linked = d.id; S.wkLinkPanel = false; render(); break; }
    case 'wk:unlink': { const w = S.works[S.wkSel]; if (w) w.linked = null; render(); break; }
    case 'wk:export': S.wkExport = !S.wkExport; render(); break;
    case 'wk:copy': {
      const txt = (document.getElementById('exp-md') || {}).textContent || '';
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(
        () => { const n = document.getElementById('copy-note'); if (n) n.textContent = '已复制到剪贴板。'; },
        () => { const n = document.getElementById('copy-note'); if (n) n.textContent = '复制失败，请手动选择文本复制。'; });
      break;
    }
    case 'wk:del-media': { if (!armed(b)) return; const w = S.works[S.wkSel]; if (w) w.mediaGone = true; render(); break; }
    case 'wk:del': {
      if (!armed(b)) return;
      const w = S.works[S.wkSel];
      if (w) { S.works.forEach(x => { if (x.linked === w.id) x.linked = null; }); S.works.splice(S.works.indexOf(w), 1); }
      S.wkSel = null; render(); break;
    }
  }
});

/* ---------- 输入与开关 ---------- */
app.addEventListener('input', e => {
  const id = e.target.id;
  if (id === 'ch-exp') { S.ch.draft.explanation = e.target.value; const c = document.getElementById('ch-count'); if (c) c.textContent = String(e.target.value.trim().length); }
  else if (id === 'ch-ans') S.ch.draft.answer = e.target.value;
  else if (id === 'ch-rev') S.ch.draft.revision = e.target.value;
  else if (id === 'script-md') { S.ch.scriptMd = e.target.value; S.ch.scriptEdited = true; const bd = document.getElementById('script-badge'); if (bd) bd.style.display = 'inline-block'; }
  else if (id && id.startsWith('segin-')) { Store.editTranscript(+id.slice(6), e.target.value); syncTranscriptStatus(); }
  else if (id === 'wk-q') { S.wkFilter.q = e.target.value; const list = document.getElementById('wk-list'); if (list) list.innerHTML = worksListHtml(); }
  else if (id === 'sound-volume') {
    SoundFx.setVolume(e.target.value / 100);
    const l = document.getElementById('sound-volume-label');
    if (l) l.textContent = Math.round(e.target.value) + '%';
  }
});
app.addEventListener('change', e => {
  const id = e.target.id;
  if (id === 'wk-type') { S.wkFilter.type = e.target.value; const list = document.getElementById('wk-list'); if (list) list.innerHTML = worksListHtml(); }
  else if (id === 'wk-domain') { S.wkFilter.domain = e.target.value; const list = document.getElementById('wk-list'); if (list) list.innerHTML = worksListHtml(); }
  else if (id === 'consent-ch') S.consent.challenge = e.target.checked;
  else if (id === 'consent-rv') S.consent.review = e.target.checked;
  else if (id === 'sound-enabled') SoundFx.setEnabled(e.target.checked);
});

render();
