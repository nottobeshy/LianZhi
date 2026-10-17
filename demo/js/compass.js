/* 选题罗盘 · 抽题罗盘指针（compass.js）
 * 纯展示层：只读取 draw.js 通报的减速进度，指针转速与词条切换间隔成反比；
 * 不生成随机数、不参与 Store.pickDraw 结果，无独立完成计时器。
 * 生命周期由 app.js 接线：start → setPhase(0..1)（随 onTick）→ lock()/destroy()（随 onLock/onDone）。 */
'use strict';

/* 与 draw.js 相同的减速曲线参数（只读常量，保持两侧节奏一致） */
const SPIN_MIN_MS = 60, SPIN_MAX_MS = 400;
const spinEaseOutCubic = t => 1 - Math.pow(1 - t, 3);
/* 初速约 300°/s、末期约 45°/s：K / interval(p)，K = 300 × 60 */
const SPIN_K = 18000;

function createSpinCompass(stageEl) {
  const rotor = stageEl ? stageEl.querySelector('#spin-rotor') : null;
  let angle = 0, speed = 0, raf = 0, lastT = 0, decaying = false, destroyed = false;

  function apply() { if (rotor) rotor.style.transform = 'rotate(' + (angle % 360) + 'deg)'; }

  function loop(t) {
    if (destroyed) return;
    if (!lastT) lastT = t;
    const dt = Math.min(0.1, (t - lastT) / 1000);
    lastT = t;
    if (decaying) {
      speed *= Math.pow(0.02, dt);          // 锁定后指数缓停（约 0.3s 内静止）
      if (speed < 1.5) speed = 0;
    }
    angle += speed * dt;
    apply();
    if (speed > 0 || !decaying) raf = requestAnimationFrame(loop);
    else raf = 0;
  }

  return {
    /* reduced 时不启动 rAF：指针保持静止 */
    start(reduced) {
      if (destroyed || reduced) return;
      speed = SPIN_K / SPIN_MIN_MS;          // 初始快速旋转
      if (!raf) { lastT = 0; raf = requestAnimationFrame(loop); }
    },
    /* p ∈ [0,1]：词条切换进度；速度跟随切换间隔反比变化 */
    setPhase(p) {
      if (destroyed || decaying) return;
      const interval = SPIN_MIN_MS + (SPIN_MAX_MS - SPIN_MIN_MS) * spinEaseOutCubic(Math.max(0, Math.min(1, p)));
      speed = SPIN_K / interval;
    },
    /* 与锁定事件同步：指数缓停至静止 */
    lock() { decaying = true; },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    /* 供测试：当前角度与转速 */
    state() { return { angle: Math.round(angle % 360), speed: Math.round(speed), running: !!raf, decaying }; }
  };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { createSpinCompass };
