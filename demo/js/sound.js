/* 选题罗盘 · 抽题音效（sound.js）
 * 合成引擎：ZzFXMicro v1.4.0 by Frank Force —— https://github.com/KilledByAPixel/ZzFX
 * 许可证：MIT（见下；MIT 允许修改与再分发，保留版权与许可声明即可）。
 * 本文件相对原版的修改：
 *   1. zzfxX 改为惰性创建（原版在加载时立即 new AudioContext，会在无手势时挂起、
 *      在无 WebAudio 的环境直接抛错；本文件由 SoundFx.ensureCtx() 在首次播放时创建）。
 *   2. zzfxV（全局音量）由 SoundFx 按用户偏好设置。
 *   3. 下方 SoundFx 封装为本项目新增（开关 / 音量 / localStorage 持久化 / 节流 / 静默失败）。
 * 音效参数听感未自动化验证，可用 ZzFX 在线设计器（zzfxuzz.com）再调。 */
'use strict';

/* === ZzFXMicro - Zuper Zmall Zound Zynth - v1.4.0 by Frank Force (MIT License) ===
 * Copyright (c) 2019 Frank Force
 * MIT: 未经许可即可使用、复制、修改、合并、发布、分发、再许可及销售；须在软件所有副本中
 * 包含上述版权声明与本许可声明。软件按「原样」提供，无任何担保。完整文本见仓库 LICENSE。
 */
let zzfxV = .3,               // volume
    zzfxX = null,             // audio context（修改：惰性创建）
    zzfx =                    // play sound
(p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0
,N=0)=>{let M=Math,d=2*M.PI,R=44100,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,
g=0,H=0,a=0,n=1,I=0,J=0,f=0,h=N<0?-1:1,x=d*h*N*2/R,L=M.cos(x),Z=M.sin,K=Z(x)/4,O=1+K,
X=-2*L/O,Y=(1-K)/O,P=(1+h*L)/2,Q=-(h+L)/O,S=P,T=0,U=0,V=0,W=0;e=R*e+9;m*=R;r*=R;t*=
R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;p*=zzfxV;for(h=e+m+r+t+c|0;a<h;k[a++]
=f*p)++J%(100*F|0)||(f=q?1<q?2<q?3<q?4<q?(g/d%1<D/2)*2-1:Z(g**3):M.max(M.min(M.tan(g)
,1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):Z(g),f=(l?1-B+B*Z(d*a/l):1)*(4<q?
f:(f<0?-1:1)*M.abs(f)**D)*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:
0),f=c?f/2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2/p):f,N?f=W=S*T+Q*(T=U)+P*(U=f)-Y*V-X*(
V=W):0),x=(b+=u+=y)*M.cos(A*H++),g+=x+x*E*(a*a*d%2-1),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l
||(b=C,u=G,n=n||1);X=zzfxX,p=X.createBuffer(1,h,R);p.getChannelData(0).set(k);b=X.
createBufferSource();b.buffer=p;b.connect(X.destination);b.start()}
/* === ZzFXMicro 结束 === */

const SoundFx = (() => {
  const LS_KEY = 'kc.sound.v1';
  const TICK_MIN_GAP = 45;          // 快速阶段节流（ms），避免 60ms 间隔下声音重叠
  let enabled = true;
  let volume = 0.25;                // 0–1；默认 25%，避免首次播放过响
  let lastTickAt = 0;

  function load() {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(LS_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (typeof d.enabled === 'boolean') enabled = d.enabled;
      if (typeof d.volume === 'number') volume = Math.max(0, Math.min(1, d.volume));
    } catch (e) { /* 读取失败用默认值 */ }
  }
  function persist() {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(LS_KEY, JSON.stringify({ enabled, volume }));
    } catch (e) { /* 写入失败静默 */ }
  }
  load();

  function ensureCtx() {
    if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') return null;
    if (!zzfxX) {
      const Ctor = typeof AudioContext !== 'undefined' ? AudioContext : webkitAudioContext;
      zzfxX = new Ctor();
    }
    return zzfxX;
  }

  /* 首次用户手势时调用：恢复被自动播放策略挂起的上下文 */
  function unlock() {
    try {
      const ctx = ensureCtx();
      if (ctx && ctx.state === 'suspended' && ctx.resume) ctx.resume();
    } catch (e) { /* 静默 */ }
  }

  /* 播放失败绝不抛出——音效不可用时抽题流程照常 */
  function play(args) {
    if (!enabled || volume <= 0) return;
    try {
      const ctx = ensureCtx();
      if (!ctx) return;
      zzfxV = volume;
      zzfx.apply(null, args);
    } catch (e) { /* 静默 */ }
  }

  return {
    /* 词条切换滴答：锯齿波高频下滑——机械仪器/继电器质感（2026-10-16 调音）
     * 音量链路（单一线性映射，不叠加公式）：有效振幅 = 基础 p × zzfxV(=volume)。
     * tick 基础 .55 / lock 基础 .7：档感接近，修复旧版 .25/.6 在低音量下 Tick 消失的问题；100% 峰值 ≤0.7，无削波。 */
    tick() {
      const now = Date.now();
      if (now - lastTickAt < TICK_MIN_GAP) return;
      lastTickAt = now;
      play([.55, .02, 2300, 0, .002, .022, 1, 2.2, -1100]);
    },
    /* 结果锁定确认音：方波低频上滑——金属咔哒，单次 */
    lock() { play([.7, .02, 560, 0, .004, .07, 4, 1.6, 660]); },
    unlock,
    isEnabled() { return enabled; },
    setEnabled(v) { enabled = !!v; persist(); },
    getVolume() { return volume; },
    setVolume(v) { volume = Math.max(0, Math.min(1, +v || 0)); persist(); },
    /* 下次播放将应用到的线性增益（= zzfxV），供测试与诊断 */
    effectiveGain() { return (!enabled || volume <= 0) ? 0 : volume; },
    ctxState() { try { return zzfxX ? zzfxX.state : 'not-created'; } catch (e) { return 'unavailable'; } }
  };
})();
