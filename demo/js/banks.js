/* 选题罗盘 · 内置知识词库（概率论 / C 语言 / 心理学 / 哲学）
 * 内容以受控 Markdown 维护，注册时统一走 js/vocab.js 的 VocabParser 解析，
 * 保证「范例 Markdown」与「实际内置词条」由同一份数据生成、必然一致。
 * 选题标准（2026-10-16 重构）：具体可独立讲解、有讲述切入点（现象/实验/反直觉结论/悖论/典型错误）、
 * 纯名词术语、学科归属准确、每级 8–12 条、宁缺毋滥。
 * 稳定 ID：词库 id 固定为 __bank_*__；词条 id 由 VocabParser 按「序号+标题哈希」生成，
 * 顺序与标题不变即稳定；调整内容不得复用旧 ID 指向不同词条。
 * 迁移规则：旧默认词库 '__default__'（演示题库）→ '__bank_prob__'（概率论），见 store.js 加载时重映射。 */
'use strict';

const BUILTIN_BANKS = [
  {
    id: '__bank_prob__', name: '概率论', exampleKey: 'prob',
    md: `# 概率论

## 入门
- 样本空间
- 独立事件
- 期望值
- 大数定律
- 赌徒谬误
- 小数定律
- 生日悖论
- 相关不等于因果
- 幸存者偏差
- 两次抛硬币，至少一次正面的概率

## 基础
- 条件概率
- 贝叶斯定理
- 蒙提霍尔问题
- 基础比率谬误
- 伯努利试验
- 二项分布
- 正态分布
- 随机游走
- p 值
- 置信区间

## 进阶
- 中心极限定理
- 辛普森悖论
- 圣彼得堡悖论
- 条件期望
- 马尔可夫链
- 贝叶斯推断
- 赌徒破产问题
- 遍历性
- 期望效用
- 蒙特卡洛方法`
  },
  {
    id: '__bank_c__', name: 'C 语言知识词库', exampleKey: 'c',
    md: `# C 语言知识词库

## 入门
- 变量
- 常量
- 数据类型
- 运算符
- 表达式
- 类型转换
- 条件语句
- 循环语句
- 标准输入输出
- 作用域

## 基础
- 数组
- 二维数组
- 字符串
- 空字符
- 数组越界
- 函数
- 函数参数传递
- 递归
- 指针
- 指针运算
- 结构体
- 联合体

## 进阶
- 数组退化
- 函数指针
- 悬空指针
- 野指针
- 动态内存分配
- 内存泄漏
- 栈溢出
- 结构体内存对齐
- 未定义行为
- 链表
- 文件操作
- 预处理宏`
  },
  {
    id: '__bank_psy__', name: '心理学知识词库', exampleKey: 'psy',
    md: `# 心理学知识词库

## 入门
- 巴纳姆效应
- 聚光灯效应
- 确认偏差
- 锚定效应
- 可得性启发式
- 损失厌恶
- 框架效应
- 沉没成本效应
- 达克效应
- 心流

## 基础
- 认知失调
- 旁观者效应
- 基本归因错误
- 斯特鲁普效应
- 皮格马利翁效应
- 峰终定律
- 系列位置效应
- 遗忘曲线
- 自我效能感
- 间隔效应

## 进阶
- 双过程理论
- 图式
- 依恋类型
- 从众
- 服从
- 工作记忆模型
- 内隐联想测验
- 元认知
- 具身认知
- 韦伯-费希纳定律`
  },
  {
    id: '__bank_phil__', name: '哲学知识词库', exampleKey: 'phil',
    md: `# 哲学知识词库

## 入门
- 忒修斯之船
- 电车难题
- 缸中之脑
- 柏拉图洞穴寓言
- 芝诺悖论
- 说谎者悖论
- 演绎推理
- 归纳推理
- 非形式谬误
- 奥卡姆剃刀

## 基础
- 中文房间
- 个人同一性
- 自由意志
- 决定论
- 休谟问题
- 经验机器
- 无知之幕
- 功利主义
- 义务论
- 盖梯尔问题

## 进阶
- 全能悖论
- 纽科姆问题
- 道德运气
- 私人语言论证
- 意向性
- 存在先于本质
- 物自体
- 先验综合判断
- 可证伪性
- 图灵测试`
  }
];

/* 个别词条在 MOCK.pool 中有富演示数据（题卡原文/来源），按标题映射回填；
 * coin 词条额外携带 richId，驱动 docs/03 协议示例的全链路演示。 */
const RICH_POOL_TERMS = {
  '两次抛硬币，至少一次正面的概率': 'coin',
  '相关不等于因果': 'corr'
};

/* 注册为内置词库：全部经现有解析器 VocabParser 解析；解析失败视为代码错误并告警，不静默上线 */
function buildBuiltinVocabs() {
  const out = [];
  for (const bank of BUILTIN_BANKS) {
    const parsed = VocabParser.parseVocabMarkdown(bank.md);
    if (!parsed.ok) {
      console.warn('[banks] 内置词库解析失败：' + bank.name, parsed.errors);
      continue;
    }
    out.push({
      id: bank.id,
      name: bank.name,
      builtin: true,
      importedAt: new Date(0).toISOString(),
      exampleKey: bank.exampleKey,
      terms: parsed.terms.map(t => {
        const term = { id: t.id, title: t.title, level: t.level, enabled: true, richId: null, original: null };
        const poolId = RICH_POOL_TERMS[t.title];
        const src = poolId && typeof MOCK !== 'undefined' ? MOCK.pool.find(p => p.id === poolId) : null;
        if (src) {
          term.richId = src.id === 'coin' ? 'coin' : null;
          term.original = { goals: src.goals, prereq: src.prereq, task: src.task, misconception: src.misconception, src: src.src };
        } else {
          term.original = {
            goals: ['能用自己的话讲清「' + t.title + '」', '能说明其适用场景或边界'],
            prereq: t.level === '入门' ? ['无'] : ['对应基础概念'],
            task: '阅读资料后，用自己的话向同学解释「' + t.title + '」。',
            misconception: '',
            src: { id: 'src-mock', version: 1, seg: 's1', locator: '演示占位 · 未审核', reviewed: false, text: '（演示占位文本——真实版为人工审核来源摘录）' }
          };
        }
        return term;
      })
    });
  }
  return out;
}

function getBankExample(key) {
  return BUILTIN_BANKS.find(b => b.exampleKey === key) || BUILTIN_BANKS[0];
}

if (typeof module !== 'undefined' && module.exports) module.exports = { BUILTIN_BANKS, buildBuiltinVocabs, getBankExample };
