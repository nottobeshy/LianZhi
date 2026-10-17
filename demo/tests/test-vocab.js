'use strict';
const code = require('fs').readFileSync('js/vocab.js', 'utf8');
const window = {};
const assert = require('node:assert/strict');
// eval in indirect mode to make vars global
(0, eval)(code.replace("window.VocabParser = { parseVocabMarkdown, countByLevel, VOCAB_LEVELS };", "globalThis.VocabParser = { parseVocabMarkdown, countByLevel, VOCAB_LEVELS };"));

const P = VocabParser;
// 内置三库（banks.js）必须全部可被当前解析器处理，且范例与注册数据同源
(0, eval)(require('fs').readFileSync('js/banks.js', 'utf8').replace('const BUILTIN_BANKS', 'globalThis.BUILTIN_BANKS').replace('function buildBuiltinVocabs', 'globalThis.buildBuiltinVocabs = function').replace('function getBankExample', 'globalThis.getBankExample = function'));
for (const bank of BUILTIN_BANKS) {
  const parsed = P.parseVocabMarkdown(bank.md);
  assert.equal(parsed.ok, true, bank.name + ' 应可被当前解析器导入');
  assert.equal(parsed.name.length > 0, true);
  const counts = P.countByLevel(parsed);
  for (const lv of ['入门', '基础', '进阶']) {
    assert.ok(counts[lv] >= 8 && counts[lv] <= 12, bank.name + ' ' + lv + ' 数量应在 8–12：' + counts[lv]);
  }
}
console.log('Builtin banks: PASS', BUILTIN_BANKS.map(b => b.name + ' ' + P.countByLevel({terms: P.parseVocabMarkdown(b.md).terms})['入门'] + '/' + P.countByLevel({terms: P.parseVocabMarkdown(b.md).terms})['基础'] + '/' + P.countByLevel({terms: P.parseVocabMarkdown(b.md).terms})['进阶']).join(' · '));

const tests = [
  { name: 'empty input', text: '' },
  { name: 'no H1', text: '## 入门\n- 词条\n' },
  { name: 'invalid level', text: '# Test\n## 高级\n- 词条\n' },
  { name: 'duplicate term', text: '# Test\n## 入门\n- a\n- a\n' },
  { name: 'term before H1', text: '- 词条\n# Test\n' },
  { name: 'no H2', text: '# Test\n- 词条\n' },
  { name: 'empty list item', text: '# Test\n## 入门\n- \n' },
  { name: 'two H1', text: '# A\n## 入门\n- a\n# B\n- 词条\n' },
  { name: 'valid basic', text: '# Test\n## 基础\n- 数组\n- 指针\n## 进阶\n- 动态内存分配\n- 链表\n' },
  { name: 'no H1, has terms', text: '## 入门\n- 词条1\n- 词条2\n' },
  { name: 'level outside', text: '# Test\n## 入门\n- a\n## bad\n- b\n## 进阶\n- c\n' },
  { name: 'trailing whitespace', text: '# Test   \n## 入门  \n- 词条   \n' },
  { name: 'crlf line endings', text: '# Test\r\n## 入门\r\n- 词条\r\n' }
];

tests.forEach(t => {
  const r = P.parseVocabMarkdown(t.text);
  console.log('---', t.name);
  console.log('  ok:', r.ok, '| name:', r.name, '| terms:', r.terms.length);
  if (r.errors.length) console.log('  errors:', JSON.stringify(r.errors));
});

const valid = `# C语言知识词库

## 入门
- 变量
- 运算符
- 表达式
- 语句
- 函数
- 数据类型
- 常量
- 注释

## 基础
- 数组
- 指针
- 字符串
- 结构体
- 联合
- 枚举
- 预处理
- 文件操作
- 递归
- 作用域

## 进阶
- 动态内存分配
- 链表
- 函数指针
- 回调函数
- 位运算
- 宏定义
- 条件编译
- 多文件编译
- 变长参数
- volatile 与 register
- const 与 restrict
`;
const r = P.parseVocabMarkdown(valid);
console.log('\n=== Full 30-term test ===');
console.log('ok:', r.ok, '| name:', r.name, '| total:', r.terms.length);
const counts = P.countByLevel({ terms: r.terms });
console.log('counts:', counts);
if (r.errors.length) console.log('errors:', JSON.stringify(r.errors));
