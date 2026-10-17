/* 选题罗盘 · Markdown 词库解析（受控格式，非通用 Markdown）
 * 格式约束：
 *   1. 一级标题 # 作为词库名称（恰好一行，文件首部）
 *   2. 二级标题 ## 只能是「入门」「基础」「进阶」
 *   3. 二级标题下用 - 列词条；每个列表项视为一个词条
 *   4. 同一词库内不得出现重复词条
 *   5. 非法格式返回 errors：每条带行号和原因
 * 解析后产出 terms: [{ id, title, level, enabled: true }] + name + id（人工生成）。
 */
'use strict';

const VOCAB_LEVELS = ['入门', '基础', '进阶'];
const VOCAB_LEVEL_SET = new Set(VOCAB_LEVELS);
/* 词库范例内容移至 js/banks.js（BUILTIN_BANKS），与内置词库数据同源，避免两份内容漂移。 */

function parseVocabMarkdown(text) {
  const errors = [];
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  const terms = [];
  let name = null;
  let currentLevel = null;
  let seenH1 = false;
  let lineNo = 0;
  const seenTitles = new Set();

  for (const raw of lines) {
    lineNo++;
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) continue;

    if (/^#{1,2}\s/.test(line)) {
      if (/^#\s/.test(line)) {
        if (seenH1) {
          errors.push({ line: lineNo, msg: '一级标题只能出现一次（词库名称）' });
          continue;
        }
        const t = line.replace(/^#\s+/, '').trim();
        if (!t) { errors.push({ line: lineNo, msg: '词库名称不能为空' }); continue; }
        name = t;
        seenH1 = true;
        continue;
      }
      if (/^##\s/.test(line)) {
        const t = line.replace(/^##\s+/, '').trim();
        if (!VOCAB_LEVEL_SET.has(t)) {
          errors.push({ line: lineNo, msg: '二级标题只能是：' + VOCAB_LEVELS.join(' / ') });
          currentLevel = null;
          continue;
        }
        currentLevel = t;
        continue;
      }
      errors.push({ line: lineNo, msg: '只允许一级（#）和二级（##）标题' });
      continue;
    }

    if (!seenH1) { errors.push({ line: lineNo, msg: '词条出现在词库名称之前' }); continue; }
    if (!currentLevel) { errors.push({ line: lineNo, msg: '词条不在任何二级标题之下' }); continue; }

    const m = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!m) { errors.push({ line: lineNo, msg: '词条必须以「- 」开头' }); continue; }
    const title = m[1];
    if (!title) { errors.push({ line: lineNo, msg: '词条内容为空' }); continue; }
    if (seenTitles.has(title)) {
      errors.push({ line: lineNo, msg: '同一词库内重复词条：「' + title + '」' });
      continue;
    }
    seenTitles.add(title);
    terms.push({
      id: 't' + terms.length + '_' + hashStr(title),
      title: title,
      level: currentLevel,
      enabled: true
    });
  }

  if (!seenH1) errors.push({ line: 0, msg: '缺少一级标题（词库名称）' });
  if (!terms.length && !errors.length) errors.push({ line: 0, msg: '词库为空，至少需要一个词条' });

  return {
    ok: errors.length === 0,
    name: name || '',
    terms: terms,
    errors: errors
  };
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

/* 按难度统计词条数；保留固定顺序 入门/基础/进阶 */
function countByLevel(vocab) {
  const out = { 入门: 0, 基础: 0, 进阶: 0 };
  if (!vocab || !vocab.terms) return out;
  for (const t of vocab.terms) if (out[t.level] !== undefined) out[t.level]++;
  return out;
}

/* 暴露到全局（保持其它模块直接挂 window 风格一致） */
window.VocabParser = { parseVocabMarkdown, countByLevel, VOCAB_LEVELS };
