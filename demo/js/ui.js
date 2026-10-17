/* 选题罗盘 · 共享 UI 小组件与工具（无业务逻辑） */
'use strict';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtT = ms => {
  const m = String(Math.floor(ms / 60000)).padStart(2, '0');
  const s = String(Math.floor(ms % 60000 / 1000)).padStart(2, '0');
  const r = String(ms % 1000).padStart(3, '0');
  return m + ':' + s + '.' + r;
};

/* 文本需转义的调用方自行 esc；cls 为标签样式类 */
const tag = (cls, txt) => '<span class="kc-tag ' + cls + '">' + txt + '</span>';

/* Demo Mock 标识：所有模拟数据展示处必须携带 */
const mockTag = () => tag('t-mock', 'Demo Mock');

/* 统一状态体系：done 已完成 / act 进行中 / wait 待核对 / fail 失败 / load 处理中 */
const ST = {
  done: ['t-green', '已完成'], act: ['t-blue', '进行中'],
  wait: ['t-orange', '待核对'], fail: ['t-red', '失败'], load: ['t-gray', '处理中']
};
const st = (kind, txt) => { const v = ST[kind] || ST.act; return tag(v[0], txt || v[1]); };

const now = () => new Date().toLocaleString('zh-CN', { hour12: false });

/* 学习倒计时进度百分比（仅展示用，不参与计时状态逻辑） */
const timerPct = t => Math.max(0, Math.min(100, Math.round(t.remainingMs / (t.minutes * 60000) * 100)));
