'use strict';
/* SoundFx 在无 WebAudio 环境的降级与持久化验证（Node 运行，不覆盖浏览器播放路径） */
const assert = require('node:assert/strict');

const localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
globalThis.localStorage = localStorage;

(0, eval)(require('fs').readFileSync('js/sound.js', 'utf8')
  .replace('const SoundFx =', 'globalThis.SoundFx ='));

// 无 AudioContext：所有调用静默降级，不得抛错
assert.doesNotThrow(() => { SoundFx.tick(); SoundFx.lock(); SoundFx.unlock(); });
assert.equal(SoundFx.ctxState(), 'not-created');

// 默认值 + 开关/音量持久化往返
assert.equal(SoundFx.isEnabled(), true);
SoundFx.setVolume(0.8);
assert.equal(JSON.parse(localStorage.getItem('kc.sound.v1')).volume, 0.8);
(0, eval)(require('fs').readFileSync('js/sound.js', 'utf8').replace('const SoundFx =', 'globalThis.SoundFx2 ='));
assert.equal(globalThis.SoundFx2.getVolume(), 0.8, '音量应从 localStorage 恢复');

SoundFx.setEnabled(false);
assert.equal(SoundFx.isEnabled(), false);
assert.equal(SoundFx.effectiveGain(), 0, '静音时有效增益必须为 0');
SoundFx.setEnabled(true);
SoundFx.setVolume(5); // 越界钳制
assert.equal(SoundFx.getVolume(), 1);
SoundFx.setVolume(0);
assert.equal(SoundFx.effectiveGain(), 0, '0% 必须完全静音');
// 音量映射单调性（0/25/50/75/100）与默认值
const gains = [];
for (const v of [0, .25, .5, .75, 1]) { SoundFx.setVolume(v); gains.push(SoundFx.effectiveGain()); }
assert.deepStrictEqual(gains, [0, .25, .5, .75, 1], '线性映射且单调递增');
assert.ok(gains[1] < gains[2] && gains[2] < gains[3] && gains[3] < gains[4], '25/50/75/100 逐级增加');
localStorage.removeItem('kc.sound.v1');
(0, eval)(require('fs').readFileSync('js/sound.js', 'utf8').replace('const SoundFx =', 'globalThis.SoundFx3 ='));
assert.equal(globalThis.SoundFx3.getVolume(), 0.25, '无存储时默认音量应为 25%');

console.log('sound.js degrade + persistence + volume mapping: PASS');
