'use strict';
const assert = require('node:assert/strict');
// Simulate browser globals
const localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  clear() { this._data = {}; }
};
globalThis.localStorage = localStorage;

// Load vocab.js
const vcode = require('fs').readFileSync('js/vocab.js', 'utf8');
(0, eval)(vcode.replace('window.VocabParser', 'globalThis.VocabParser'));

// Load banks.js（内置词库，store.js 注册时依赖）
(0, eval)(require('fs').readFileSync('js/banks.js', 'utf8').replace('const BUILTIN_BANKS', 'globalThis.BUILTIN_BANKS').replace('function buildBuiltinVocabs', 'globalThis.buildBuiltinVocabs = function').replace('function getBankExample', 'globalThis.getBankExample = function'));

// Load mock-data.js
const mcode = require('fs').readFileSync('js/mock-data.js', 'utf8');
(0, eval)(mcode.replace('const MOCK', 'globalThis.MOCK = {}; globalThis.MOCK'));

// Load store.js
const scode = require('fs').readFileSync('js/store.js', 'utf8');
const withGlobals = '(function(){var localStorage=globalThis.localStorage;' + scode + '\nreturn { Store, S, seq }; })()';
const { Store, S, seq } = (0, eval)(withGlobals);

console.log('=== Default vocab ===');
console.log('vocabs:', Store.listVocabs().map(v => v.name + ' (' + v.terms.length + ' 项)'));
console.log('active:', Store.getActiveVocab().name);

console.log('\n=== Filter pool: all difficulties ===');
let pool = Store.filterPool();
console.log('size:', pool.length);
console.log('first:', pool[0] ? pool[0].title + ' / ' + pool[0].level : 'none');

console.log('\n=== Filter pool: only 入门 ===');
Store.setDifficulty('入门');
pool = Store.filterPool();
console.log('size:', pool.length);
console.log('levels:', pool.map(t => t.level).join(','));

console.log('\n=== Pick draw ===');
const winner = Store.pickDraw();
console.log('winner:', winner ? winner.title + ' (' + winner.id + ')' : 'none');

console.log('\n=== Import vocab ===');
const sample = `# 测试词库

## 入门
- 概念 A
- 概念 B

## 基础
- 概念 C

## 进阶
- 概念 D
- 概念 E
`;
const parsed = VocabParser.parseVocabMarkdown(sample);
console.log('parsed ok:', parsed.ok, '| name:', parsed.name, '| terms:', parsed.terms.length);
const ok = Store.importVocab(parsed);
console.log('imported:', ok);
console.log('vocabs now:', Store.listVocabs().map(v => v.name));

console.log('\n=== Switch active vocab ===');
const newVocabId = Store.listVocabs().find(v => !v.builtin && v.name === parsed.name).id;
Store.setActiveVocab(newVocabId);
console.log('active:', Store.getActiveVocab().name);
pool = Store.filterPool();
console.log('pool size:', pool.length);
console.log('first item:', pool[0] ? pool[0].title + ' / vocabId=' + pool[0].vocabId : 'none');

console.log('\n=== Toggle term ===');
const newVocab = Store.getActiveVocab();
const firstTerm = newVocab.terms[0];
console.log('first term before:', firstTerm.title, 'enabled:', firstTerm.enabled);
Store.toggleTerm(newVocab.id, firstTerm.id);
assert.equal(firstTerm.enabled, false, '用户词条应成功禁用');
console.log('first term after:', firstTerm.title, 'enabled:', firstTerm.enabled);
pool = Store.filterPool();
console.log('pool size after toggle:', pool.length);
assert.equal(pool.length, 1, '入门池应排除禁用词条');

console.log('\n=== Lock format ===');
S.ch.locked = pool[0].id;
const item = Store.getChItem();
console.log('item:', item ? item.title + ' (vocabId=' + item.vocabId + ' termId=' + item.termId + ')' : 'none');
console.log('isRich:', Store.isRich());

console.log('\n=== Persistence ===');
const stored = localStorage.getItem('kc.vocabs.v1');
console.log('localStorage key exists:', !!stored);
const data = JSON.parse(stored);
console.log('stored vocabs count:', data.vocabs.length);
console.log('stored active:', data.activeVocabId);

console.log('\n=== Animation test: pick multiple winners ===');
let winners = new Set();
for (let i = 0; i < 30; i++) {
  const w = Store.pickDraw();
  if (w) winners.add(w.id);
}
console.log('distinct winners from 30 draws:', winners.size, '(should be small if few terms)');

console.log('\n=== Repeat-then-exclude test ===');
Store.setActiveVocab('__bank_prob__');
Store.setDifficulty('all');
const poolFull = Store.filterPool();
let lastW = null;
const excludeOk = [];
for (let i = 0; i < 8; i++) {
  const w = Store.pickDraw(lastW);
  if (w && w.id !== lastW) excludeOk.push(true);
  else excludeOk.push(false);
  lastW = w ? w.id : lastW;
}
console.log('exclude-last-draw worked:', excludeOk.filter(x => x).length, '/', excludeOk.length);

console.log('\n=== Learning timer ===');
Store.resetLearningTimer();
assert.deepEqual([3, 5, 10].map(m => { Store.setLearningTimer(m); return S.ch.learningTimer.remainingMs; }), [180000, 300000, 600000]);
Store.setLearningTimer(3);
assert.equal(Store.startLearningTimer(1000), true);
assert.equal(Store.updateLearningTimer(61000), 120000);
assert.equal(Store.pauseLearningTimer(61000), true);
assert.equal(S.ch.learningTimer.state, 'paused');
assert.equal(S.ch.learningTimer.remainingMs, 120000);
assert.equal(Store.startLearningTimer(70000), true);
assert.equal(Store.updateLearningTimer(190000), 0);
assert.equal(S.ch.learningTimer.state, 'finished');
assert.equal(Store.startLearningTimer(200000), false);
const generation = S.ch.learningTimer.generation;
Store.resetLearningTimer();
assert.equal(S.ch.learningTimer.state, 'ready');
assert.equal(S.ch.learningTimer.remainingMs, 180000);
assert.equal(S.ch.learningTimer.generation, generation + 1);
console.log('presets, pause/resume, exact deadline, completion, reset and stale-callback generation: PASS');
