/* 选题罗盘 · 集中状态与业务动作（演示版为内存态；Codex 接入后改为 API 调用 + 持久化）
 * 词库层（v2）：内置词库（概率论/C 语言/心理学/哲学，见 banks.js）+ 用户导入 .md 词库；
 * 词库数据由 localStorage 持久化（仅用户词库）。
 * 迁移规则（2026-10-16）：旧默认词库 '__default__'（演示题库）已由 '__bank_prob__'（概率论）取代；
 * 加载时将遗留 activeVocabId '__default__' 重映射为 '__bank_prob__'，其余持久化数据不含内置词条引用。 */
'use strict';

let seq = 0;

const VOCAB_LS_KEY = 'kc.vocabs.v1';
const DIFFICULTY_ALL = 'all';
const DEFAULT_VOCAB_ID = '__bank_prob__';

const freshCh = () => ({
  step: 0,
  activeVocabId: DEFAULT_VOCAB_ID,
  difficulty: DIFFICULTY_ALL,
  budget: 15,
  locked: null,
  lastDraw: null,
  drawStarted: false,
  drawDone: false,
  redrawOnce: false,
  explained: null,
  shortHint: false,
  qShown: false,
  ans: null,
  skipped: false,
  rev: null,
  reviewed: false,
  showMd: false,
  scriptMd: null,
  scriptEdited: false,
  saved: false,
  draft: { explanation: null, answer: null, revision: null },
  learningTimer: { minutes: 5, remainingMs: 5 * 60 * 1000, endsAt: null, state: 'ready', generation: 0 }
});

const freshVocabImport = () => ({
  source: null,
  fileName: '',
  preview: null,
  errors: [],
  parsed: null
});

/* 全局唯一状态树：字段结构集中在这一处管理 */
const S = {
  view: 'home',
  consent: { challenge: false, review: false },
  works: [],
  wkFilter: { q: '', type: 'all', domain: 'all' },
  wkSel: null, wkExport: false, wkLinkPanel: false,
  ch: freshCh(),
  rv: { step: 0, picked: false, proc: -1, segs: [], version: 0, confirmed: 0, reportOn: 0, transcriptVersions: [], reportVersions: [], adopt: {}, saved: false },
  vocabs: [],
  vocabStorage: { blocked: false, error: '' },
  activeVocabId: DEFAULT_VOCAB_ID,
  vocabImport: freshVocabImport(),
  vocabExampleKey: 'c'
};

/* ---------- localStorage 持久化：仅用户导入词库 + 活动词库 ID ----------
 * 内置词库（概率论/C/心理学/哲学）每次加载从代码重建，不写入 localStorage，
 * 避免旧缓存冻结内置内容；用户导入数据不受内置更新影响。 */
function persistVocabs() {
  if (S.vocabStorage.blocked) return false;
  try {
    const exportable = S.vocabs.filter(v => !v.builtin).map(v => ({
      id: v.id,
      name: v.name,
      builtin: false,
      importedAt: v.importedAt,
      terms: v.terms.map(t => ({ id: t.id, title: t.title, level: t.level, enabled: !!t.enabled, richId: t.richId || null }))
    }));
    localStorage.setItem(VOCAB_LS_KEY, JSON.stringify({ vocabs: exportable, activeVocabId: S.activeVocabId }));
    S.vocabStorage.error = '';
    return true;
  } catch (e) {
    S.vocabStorage.error = '词库未保存成功：本机存储不可用或空间不足。本次更改未生效，请保留原始 .md 文件后重试。';
    return false;
  }
}

function loadVocabsFromStorage() {
  S.vocabStorage = { blocked: false, error: '' };
  const protect = () => {
    S.vocabStorage.blocked = true;
    S.vocabStorage.error = '发现异常词库缓存，已恢复可用词库并暂停词库写入，原缓存未覆盖。请先备份原缓存，再联系维护者恢复异常数据。';
  };
  try {
    const raw = localStorage.getItem(VOCAB_LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.vocabs)) { protect(); return null; }
    const restored = builtinVocabList();
    for (const v of data.vocabs) {
      if (v && (v.builtin === true || v.id === '__default__')) continue;
      if (!v || typeof v.id !== 'string' || !/^[\w-]+$/.test(v.id) || restored.some(x => x.id === v.id) || !Array.isArray(v.terms)) { protect(); continue; }
      const terms = [];
      for (const t of v.terms) {
        if (!t || typeof t.id !== 'string' || !/^[\w-]+$/.test(t.id) || typeof t.title !== 'string' || !t.title.trim() || !VocabParser.VOCAB_LEVELS.includes(t.level) || (t.enabled !== undefined && typeof t.enabled !== 'boolean') || terms.some(x => x.id === t.id || x.title === t.title)) { protect(); continue; }
        // 仅恢复受控词条字段，不从缓存恢复 HTML 题卡或富演示数据身份。
        terms.push({ id: t.id, title: t.title, level: t.level, enabled: t.enabled !== false });
      }
      if (!terms.length) { protect(); continue; }
      restored.push({ id: v.id, name: String(v.name || '未命名词库'), builtin: false, importedAt: v.importedAt || new Date().toISOString(), terms: terms });
    }
    /* 旧版活动词库 '__default__'（演示题库）重映射到概率论 */
    const active = data.activeVocabId === '__default__' ? DEFAULT_VOCAB_ID : (data.activeVocabId || DEFAULT_VOCAB_ID);
    return { vocabs: restored, activeVocabId: active };
  } catch (e) {
    protect();
    return null;
  }
}

/* 全部内置词库：概率论 / C 语言 / 心理学 / 哲学（banks.js，概率论居首作为默认） */
function builtinVocabList() {
  return buildBuiltinVocabs();
}

function ensureVocabsLoaded() {
  const restored = loadVocabsFromStorage();
  if (restored) {
    S.vocabs = restored.vocabs;
    S.activeVocabId = restored.activeVocabId;
  } else {
    S.vocabs = builtinVocabList();
    S.activeVocabId = DEFAULT_VOCAB_ID;
  }
  if (!S.vocabs.find(v => v.id === S.activeVocabId)) S.activeVocabId = DEFAULT_VOCAB_ID;
}
ensureVocabsLoaded();

const Store = {
  resetLearningTimer() {
    const timer = S.ch.learningTimer;
    timer.generation++;
    timer.remainingMs = timer.minutes * 60 * 1000;
    timer.endsAt = null;
    timer.state = 'ready';
  },
  setLearningTimer(minutes) {
    const timer = S.ch.learningTimer;
    if (timer.state !== 'ready' || ![3, 5, 10].includes(minutes)) return false;
    timer.minutes = minutes;
    this.resetLearningTimer();
    return true;
  },
  startLearningTimer(now = Date.now()) {
    const timer = S.ch.learningTimer;
    if (!['ready', 'paused'].includes(timer.state) || timer.remainingMs <= 0) return false;
    timer.endsAt = now + timer.remainingMs;
    timer.state = 'running';
    return true;
  },
  pauseLearningTimer(now = Date.now()) {
    const timer = S.ch.learningTimer;
    if (timer.state !== 'running') return false;
    this.updateLearningTimer(now);
    if (timer.state === 'running') timer.state = 'paused';
    timer.endsAt = null;
    return true;
  },
  updateLearningTimer(now = Date.now()) {
    const timer = S.ch.learningTimer;
    if (timer.state === 'running') {
      timer.remainingMs = Math.max(0, timer.endsAt - now);
      if (!timer.remainingMs) {
        timer.endsAt = null;
        timer.state = 'finished';
      }
    }
    return timer.remainingMs;
  },
  /* ---------- 词库相关 ---------- */
  listVocabs() { return S.vocabs.slice(); },
  getVocab(id) { return S.vocabs.find(v => v.id === id) || null; },
  getActiveVocab() { return this.getVocab(S.activeVocabId) || S.vocabs[0] || null; },
  setActiveVocab(id) {
    if (!S.vocabs.find(v => v.id === id)) return false;
    const previous = S.activeVocabId;
    S.activeVocabId = id;
    // 异常缓存保护时仍可在本会话浏览恢复的词库，但不覆盖缓存。
    if (!S.vocabStorage.blocked && !persistVocabs()) { S.activeVocabId = previous; return false; }
    /* 切换词库时把当前锁定和上次抽取清掉，避免跨词库残留 */
    S.ch.locked = null;
    S.ch.lastDraw = null;
    S.ch.drawStarted = false;
    S.ch.drawDone = false;
    S.ch.redrawOnce = false;
    return true;
  },
  getDifficulty() { return S.ch.difficulty; },
  setDifficulty(d) {
    S.ch.difficulty = d === DIFFICULTY_ALL || VocabParser.VOCAB_LEVELS.includes(d) ? d : DIFFICULTY_ALL;
  },
  countByLevel(vocabId) {
    const v = this.getVocab(vocabId);
    return VocabParser.countByLevel(v);
  },
  toggleTerm(vocabId, termId) {
    const v = this.getVocab(vocabId); if (!v || v.builtin) return;
    const t = v.terms.find(x => x.id === termId); if (!t) return;
    t.enabled = !t.enabled;
    if (!persistVocabs()) { t.enabled = !t.enabled; return false; }
    return true;
  },
  importVocab(parsed) {
    if (!parsed || !parsed.ok) return false;
    const id = 'vocab_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1e6).toString(36);
    S.vocabs.push({
      id: id,
      name: parsed.name,
      builtin: false,
      importedAt: new Date().toISOString(),
      terms: parsed.terms.map((t, i) => ({ id: 'i_' + i + '_' + hashStrLite(t.title + t.level), title: t.title, level: t.level, enabled: true }))
    });
    if (!persistVocabs()) { S.vocabs.pop(); return false; }
    return true;
  },
  deleteVocab(id) {
    const idx = S.vocabs.findIndex(v => v.id === id);
    if (idx < 0) return false;
    const v = S.vocabs[idx];
    if (v.builtin) return false;
    const activeId = S.activeVocabId, locked = S.ch.locked;
    S.vocabs.splice(idx, 1);
    if (S.activeVocabId === id) {
      S.activeVocabId = DEFAULT_VOCAB_ID;
      S.ch.locked = null;
    }
    if (!persistVocabs()) {
      S.vocabs.splice(idx, 0, v);
      S.activeVocabId = activeId; S.ch.locked = locked;
      return false;
    }
    return true;
  },

  /* 转写草稿与确认快照分离；修改一次确认稿只开启一个新草稿版本。 */
  editTranscript(index, text) {
    const r = S.rv;
    if (!r.segs[index] || r.segs[index].text === text) return false;
    if (r.confirmed) { r.version++; r.confirmed = 0; }
    if (!r.version) r.version = 1;
    r.segs = r.segs.map((s, i) => i === index ? { ...s, text } : s);
    r.saved = false;
    return true;
  },
  isTranscriptConfirmed() { return S.rv.confirmed > 0 && S.rv.confirmed === S.rv.version; },
  confirmTranscript() {
    const r = S.rv;
    if (!r.segs.some(s => s.text.trim())) return false;
    if (this.isTranscriptConfirmed()) return true;
    if (!r.version) r.version = 1;
    r.transcriptVersions.push(Object.freeze({
      version: r.version,
      segs: Object.freeze(r.segs.map(s => Object.freeze({ ...s })))
    }));
    r.confirmed = r.version;
    r.saved = false;
    return true;
  },
  getReviewReport() { return S.rv.reportVersions.find(v => v.transcriptVersion === S.rv.reportOn) || null; },
  generateReview() {
    const r = S.rv;
    if (!S.consent.review || !this.isTranscriptConfirmed()) return false;
    if (!r.reportVersions.some(v => v.transcriptVersion === r.confirmed)) {
      // 仅保存固定 Mock 的独立快照，不表示对新稿执行了真实 AI 分析。
      r.reportVersions.push({ transcriptVersion: r.confirmed, data: JSON.parse(JSON.stringify(MOCK.report)) });
      r.saved = false;
    }
    r.reportOn = r.confirmed; r.adopt = {}; r.step = 3;
    return true;
  },
  showReviewReport(version) {
    if (!S.rv.reportVersions.some(v => v.transcriptVersion === version)) return false;
    S.rv.reportOn = version; S.rv.step = 3;
    return true;
  },

  /* ---------- 候选池规则（替代旧的 domain+level+budget） ---------- */
  filterPool() {
    const v = this.getActiveVocab();
    if (!v) return [];
    const diff = S.ch.difficulty;
    return v.terms
      .filter(t => t.enabled && (diff === DIFFICULTY_ALL || t.level === diff))
      .map(t => this.toPoolItem(v, t));
  },

  toPoolItem(vocab, term) {
    const base = {
      id: vocab.id + ':' + term.id,
      title: term.title,
      domain: vocab.name,
      level: term.level,
      minBudget: 0,
      vocabId: vocab.id,
      termId: term.id,
      richId: term.richId || null
    };
    if (term.original) {
      Object.assign(base, {
        goals: term.original.goals,
        prereq: term.original.prereq,
        task: term.original.task,
        misconception: term.original.misconception,
        src: term.original.src
      });
    } else {
      base.goals = []; base.prereq = []; base.task = ''; base.misconception = ''; base.src = { reviewed: false, text: '（导入词库未提供来源）', locator: '' };
    }
    return base;
  },

  /* 先定结果再播动画；多候选时避免与上次重复（PRD §A1） */
  pickDraw(excludeId) {
    const pool = this.filterPool();
    if (!pool.length) return null;
    let cands = excludeId ? pool.filter(p => p.id !== excludeId) : pool.slice();
    if (!cands.length) cands = pool;
    return cands[Math.floor(Math.random() * cands.length)];
  },

  getChItem() {
    if (!S.ch.locked) return null;
    const idx = S.ch.locked.indexOf(':');
    if (idx < 0) return null;
    const vocabId = S.ch.locked.slice(0, idx);
    const termId = S.ch.locked.slice(idx + 1);
    const v = this.getVocab(vocabId);
    if (!v) return null;
    const term = v.terms.find(t => t.id === termId);
    if (!term) return null;
    return this.toPoolItem(v, term);
  },
  isRich() {
    const it = this.getChItem();
    return !!(it && it.richId === 'coin');
  },
  getChMocks(exp) {
    const it = this.getChItem();
    if (!it) return null;
    if (it.richId === 'coin') return MOCK.chCoin;
    return MOCK.tmpl({ id: it.id, title: it.title }, exp !== undefined ? exp : S.ch.explained);
  },

  saveChallenge() {
    const it = this.getChItem(); if (!it) return;
    const mk = this.getChMocks();
    S.works.push({
      type: 'challenge', id: 'w' + (++seq), title: it.title, kp: it.title, domain: it.domain,
      updated: new Date().toLocaleString('zh-CN', { hour12: false }),
      status: '脚本已就绪 · 挑战完成', open: 1, rich: it.richId === 'coin',
      exp: S.ch.explained, rev: S.ch.rev, skipped: S.ch.skipped,
      scriptTitle: mk.script.title, md: S.ch.scriptEdited ? S.ch.scriptMd : null,
      vocabId: it.vocabId
    });
  },

  saveReview() {
    if (!this.isTranscriptConfirmed() || S.rv.reportOn !== S.rv.confirmed || !this.getReviewReport() || S.rv.saved) return false;
    S.rv.saved = true;
    S.works.push({
      type: 'review', id: 'w' + (++seq), title: '硬币口播演示视频（20 秒）',
      kp: MOCK.pool[0].title, domain: '概率论',
      updated: new Date().toLocaleString('zh-CN', { hour12: false }),
      status: '复盘已保存 · 视频已归档', open: 1,
      segs: S.rv.segs.map(s => ({ ...s })), version: S.rv.confirmed, reportOn: S.rv.reportOn,
      transcriptVersions: S.rv.transcriptVersions.slice(),
      reportVersions: JSON.parse(JSON.stringify(S.rv.reportVersions)),
      adopt: { ...S.rv.adopt }, mediaGone: false, linked: null
    });
    return true;
  }
};

function hashStrLite(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

/* 留待 Codex 替换的接口清单（对应 docs/03 协议 task）：
 * - drawPool(config) -> 候选词条          （Store.filterPool + 词库持久化）
 * - getItemCard(id) -> 题卡与来源          （Store.getChItem / toPoolItem）
 * - challenge_questions / challenge_feedback / challenge_revision_review / challenge_script
 * - probeMedia / transcribe / video_review
 * - vocab_crud / vocab_parse            （Store.importVocab/deleteVocab + VocabParser.parseVocabMarkdown）
 * - 词库持久化 localStorage -> SQLite   （persistVocabs/loadVocabsFromStorage，下一阶段替换）
 * 以上真实实现均须按协议 v1.0 校验后返回；本文件仅为界面演示数据。 */
