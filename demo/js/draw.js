/* 选题罗盘 · 抽题仪式（减速版）
 * 规则：先由 Store.pickDraw 决定结果，动画只是走向它；
 *       屏幕中央一次只展示一个词条；切换间隔从 60ms 渐增到 400ms（ease-out 三次曲线）；
 *       支持跳过、重复点击保护、页面切换时取消、prefers-reduced-motion、单候选直落。
 * 用法：runDrawCeremony({ stage, candidates, winnerIdx, meta, onDone, onTick, onLock }) -> { cancel }
 *   onTick()       —— 每次词条实际显示变化时触发（不含最终锁定那一格，锁定由 onLock 表达）
 *   onLock(reason) —— 结果锁定展示时触发且仅一次；reason: done 自然减速 | skip 用户跳过 | fallback 兜底收尾
 *   onDone(reason) —— 生命周期终结（含 cancel）必触发一次供状态收敛；reason 同上 + cancel 页面离开
 *   cancel 不触发 onLock（页面离开不得误播锁定音），onDone('cancel') 由调用方静默收敛，不再重渲染。
 */
'use strict';

const DRAW_ACTIVE = new Set();

const DRAW_STEPS = 16;       // 总切换次数（含最后一格 = winner）；约 24 次的目标与 3-5s 体感冲突，实际观感优先
const DRAW_MIN = 60;         // ms
const DRAW_MAX = 400;        // ms
const DRAW_LOCK_DELAY = 420; // ms，结果锁定后到 onDone 的等待（让 stamp 动画可见）

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function runDrawCeremony(opts) {
  const { stage, candidates, winnerIdx, meta, onDone, onTick, onLock } = opts;
  if (!stage || !candidates || candidates.length === 0 || winnerIdx < 0 || winnerIdx >= candidates.length) {
    if (onDone) onDone();
    return { cancel: noop };
  }

  const termEl = stage.querySelector('.kc-draw-term');
  const metaEl = stage.querySelector('.kc-draw-meta');
  const stampEl = stage.querySelector('.kc-draw-stamp');
  const cardEl = stage.querySelector('.kc-draw-card');
  const hintEl = stage.querySelector('.kc-drawhint');
  if (!termEl) { if (onDone) onDone(); return { cancel: noop }; }

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const single = candidates.length === 1;

  const timers = [];
  let finished = false;
  let live = true;
  let onDoneTimer = 0;
  let settled = false;
  function complete(reason) {
    if (settled) return;
    settled = true;
    if (onDoneTimer) clearTimeout(onDoneTimer);
    DRAW_ACTIVE.delete(controller);
    if (onDone) onDone(reason);
  }

  function lockDisplay() {
    termEl.textContent = candidates[winnerIdx].title;
    if (metaEl) metaEl.textContent = (meta && meta.text) || '';
    if (cardEl) cardEl.classList.add('locked');
    if (stampEl) stampEl.style.opacity = '1';
    if (hintEl) hintEl.textContent = '点击可跳过 · 已锁定后继续点击无效';
  }

  /* reason: 'done' 自然完成 | 'skip' 用户跳过 | 'cancel' 页面离开 | 'fallback' 兜底收尾 */
  function finish(reason) {
    if (finished) return;
    finished = true;
    live = false;
    timers.forEach(clearTimeout);
    timers.length = 0;
    if (onDoneTimer) { clearTimeout(onDoneTimer); onDoneTimer = 0; }
    stage.removeEventListener('click', onSkip);
    if (reason !== 'cancel') lockDisplay();
    if (reason !== 'cancel' && onLock) onLock(reason);
    if (reason === 'cancel') {
      /* 页面离开：同步收敛状态，不渲染、不延迟 */
      complete(reason);
      return;
    }
    const instant = reason === 'skip' || reason === 'fallback';
    const delay = (reduced || instant) ? 0 : DRAW_LOCK_DELAY;
    onDoneTimer = setTimeout(() => complete(reason), delay);
  }

  function onSkip() {
    if (finished) return; // 重复点击保护：结束后 onDone 未必已触发，期间再次点击无效
    finish('skip');
  }

  const controller = { cancel: () => {
    if (onDoneTimer) { clearTimeout(onDoneTimer); onDoneTimer = 0; }
    if (!finished) finish('cancel');
    else complete('cancel');
  } };
  DRAW_ACTIVE.add(controller);

  /* 单一候选或 reduced-motion：直落（正常完成路径，播锁定音，无切换 tick） */
  if (single || reduced) {
    lockDisplay();
    finish('done');
    return controller;
  }

  stage.addEventListener('click', onSkip);
  /* 初始填一个非 winner 的随机项，避免空白闪烁 */
  let prevIdx = -1;
  do { prevIdx = Math.floor(Math.random() * candidates.length); }
  while (prevIdx === winnerIdx && candidates.length > 1);
  termEl.textContent = candidates[prevIdx].title;
  if (onTick) onTick(0, DRAW_STEPS); // 首次显示变化

  let elapsed = 0;
  for (let i = 0; i < DRAW_STEPS; i++) {
    const ratio = i / (DRAW_STEPS - 1);
    const interval = DRAW_MIN + (DRAW_MAX - DRAW_MIN) * easeOutCubic(ratio);
    elapsed += interval;
    const isLast = i === DRAW_STEPS - 1;
    let curIdx;
    if (isLast) {
      curIdx = winnerIdx;
    } else {
      do { curIdx = Math.floor(Math.random() * candidates.length); }
      while (curIdx === prevIdx && candidates.length > 1);
    }
    prevIdx = curIdx;
    const myIdx = curIdx;
    timers.push(setTimeout(() => {
      if (finished || !live) return;
      termEl.textContent = candidates[myIdx].title;
      /* 最终锁定那一格不触发 tick——锁定由 finish → onLock 表达，避免双声 */
      if (!isLast && onTick) onTick(i, DRAW_STEPS);
      if (isLast) finish('done');
    }, elapsed));
  }

  /* 总时长兜底（异常路径）：结果已展示，按完成收尾 */
  timers.push(setTimeout(() => { if (!finished) finish('fallback'); }, elapsed + 2500));

  return controller;
}

function cancelAllDraws() {
  DRAW_ACTIVE.forEach(c => c.cancel());
  DRAW_ACTIVE.clear();
}

function noop() {}
