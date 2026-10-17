'use strict';
const localStorage = {
  _data: {
    'kc.vocabs.v1': JSON.stringify({
      activeVocabId: 'vocab_test123',
      vocabs: [{
        id: 'vocab_test123',
        name: '持久化测试词库',
        builtin: false,
        importedAt: '2026-10-13T12:00:00.000Z',
        terms: [
          { id: 'i_0_xx', title: '持久 A', level: '入门', enabled: true },
          { id: 'i_1_yy', title: '持久 B', level: '基础', enabled: true },
          { id: 'i_2_zz', title: '持久 C', level: '进阶', enabled: false }
        ]
      }]
    })
  },
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); }
};
globalThis.localStorage = localStorage;

const vcode = require('fs').readFileSync('js/vocab.js', 'utf8');
(0, eval)(vcode.replace('window.VocabParser', 'globalThis.VocabParser'));
(0, eval)(require('fs').readFileSync('js/banks.js', 'utf8').replace('const BUILTIN_BANKS', 'globalThis.BUILTIN_BANKS').replace('function buildBuiltinVocabs', 'globalThis.buildBuiltinVocabs = function').replace('function getBankExample', 'globalThis.getBankExample = function'));

const mcode = require('fs').readFileSync('js/mock-data.js', 'utf8');
(0, eval)(mcode.replace('const MOCK', 'globalThis.MOCK = {}; globalThis.MOCK'));

const scode = require('fs').readFileSync('js/store.js', 'utf8');
const cleaned = scode
  .replace('let seq = 0;', '// stripped seq')
  .replace('ensureVocabsLoaded();', '/* skip auto-load */')
  + '\n;globalThis.__store = { Store, S, ensureVocabsLoaded };';
(0, eval)(cleaned);
globalThis.__store.ensureVocabsLoaded();

const { Store, S } = globalThis.__store;

console.log('=== After reload from localStorage ===');
console.log('vocabs:', Store.listVocabs().map(v => v.name + ' (' + v.terms.length + ' 项, builtin=' + v.builtin + ')'));
console.log('active:', Store.getActiveVocab().name);
console.log('active vocab id:', S.activeVocabId);

const pool = Store.filterPool();
console.log('pool (with 进阶 disabled):', pool.map(t => t.title + '(' + t.level + ')').join(', '));

console.log('\n=== Default vocab always restored ===');
const def = Store.getVocab('__bank_prob__');
console.log('default exists:', !!def, '| terms:', def ? def.terms.length : 0);

console.log('\n=== Round-trip persist ===');
Store.setActiveVocab('__bank_prob__');
console.log('after set default, active:', Store.getActiveVocab().name);
const stored = localStorage.getItem('kc.vocabs.v1');
const activeId = JSON.parse(stored).activeVocabId;
console.log('persisted activeId:', activeId);

console.log('\n=== Invalid level term skipped ===');
localStorage._data['kc.vocabs.v1'] = JSON.stringify({
  activeVocabId: '__default__',
  vocabs: [{
    id: 'vocab_bad',
    name: '坏词库',
    builtin: false,
    importedAt: '',
    terms: [
      { id: 't1', title: '正常项', level: '入门', enabled: true },
      { id: 't2', title: '', level: '入门', enabled: true },
      { id: 't3', title: '错档', level: '高级', enabled: true }
    ]
  }]
});
delete require.cache[require.resolve('../js/store.js')];
const scode2 = require('fs').readFileSync('js/store.js', 'utf8');
const cleaned2 = scode2
  .replace('let seq = 0;', '// stripped seq')
  .replace('ensureVocabsLoaded();', '/* skip auto-load */')
  + '\n;globalThis.__store = { Store, S, ensureVocabsLoaded };';
(0, eval)(cleaned2);
globalThis.__store.ensureVocabsLoaded();
const S2 = globalThis.__store;
const badVocab = S2.Store.getVocab('vocab_bad');
console.log('bad vocab exists:', !!badVocab);
console.log('bad vocab terms (should filter out invalid):', badVocab ? badVocab.terms.length : 0);

console.log('');
console.log('=== Legacy __default__ remap ===');
localStorage._data['kc.vocabs.v1'] = JSON.stringify({ activeVocabId: '__default__', vocabs: [] });
const scode3 = require('fs').readFileSync('js/store.js', 'utf8');
const cleaned3 = scode3
  .replace('let seq = 0;', '// stripped seq')
  .replace('ensureVocabsLoaded();', '/* skip auto-load */')
  + '\n;globalThis.__store = { Store, S, ensureVocabsLoaded };';
(0, eval)(cleaned3);
globalThis.__store.ensureVocabsLoaded();
const S3 = globalThis.__store;
console.log('legacy active remapped to:', S3.S.activeVocabId, '(expect __bank_prob__)');
require('node:assert/strict').equal(S3.S.activeVocabId, '__bank_prob__');
console.log('legacy remap: PASS');
