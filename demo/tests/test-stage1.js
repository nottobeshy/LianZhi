'use strict';
const assert = require('node:assert/strict');
const {boot, challenge} = require('./test-p0');
const b = boot();
assert.equal(b.run('Object.getPrototypeOf(S.ch.remoteAnswers)'),null,'model question IDs must not access Object.prototype');
for (const [step,id,action,size] of [[3,'ch-exp','ch:submit-exp',6001],[4,'ch-ans','ch:submit-ans',2001],[6,'ch-rev','ch:submit-rev',6001]]) {
  challenge(b,step); b.run('S.ch.qShown=true;render()'); b.input(id,'字'.repeat(size)); b.click(action);
  assert.equal(b.run('S.ch.step'),step,'超长输入必须阻断且保留');
  assert.equal(b.nodes.get(id).value.length,size);
}
assert.equal(b.run(`buildBuiltinVocabs().every(v=>v.terms.every(t=>!!t.knowledgeId))`),true);
const id=b.run(`buildBuiltinVocabs()[0].terms[0].knowledgeId`);
const beforeOrder='- 样本空间\n- 独立事件', afterOrder='- 独立事件\n- 样本空间';
b.run('BUILTIN_BANKS[0].md=BUILTIN_BANKS[0].md.replace('+JSON.stringify(beforeOrder)+','+JSON.stringify(afterOrder)+')');
assert.equal(b.run(`buildBuiltinVocabs()[0].terms[0].title`),'独立事件');
assert.equal(b.run(`buildBuiltinVocabs()[0].terms.find(t=>t.title==='样本空间').knowledgeId`),id);
console.log('stage1 input limits and stable built-in identity: PASS');

for(const phase of ['running','lock-delay','skip']) {
  const a=boot();
  a.run(`var done=[],locks=0,skip;var drawEl={textContent:'',style:{},classList:{add(){}}};
    var stage={querySelector(){return drawEl},addEventListener(_,f){skip=f},removeEventListener(){}};
    var ctrl=runDrawCeremony({stage,candidates:[{title:'A'},{title:'B'}],winnerIdx:0,onDone:r=>done.push(r),onLock:()=>locks++});`);
  if(phase==='lock-delay') a.advance(a.run('Array.from({length:DRAW_STEPS},(_,i)=>DRAW_MIN+(DRAW_MAX-DRAW_MIN)*easeOutCubic(i/(DRAW_STEPS-1))).reduce((a,b)=>a+b,0)'));
  if(phase==='skip') a.run('skip();skip()');
  a.run('cancelAllDraws();ctrl.cancel()');
  a.advance(20000);
  assert.equal(a.run('done.length'),1);
  assert.equal(a.run('done[0]'),'cancel');
  assert.equal(a.run('locks'),phase==='running'?0:1);
  assert.equal(a.run('DRAW_ACTIVE.size'),0);
}
console.log('draw cancellation during running / lock delay / skip: PASS');

for(const outcome of ['load','error']) {
  let reader;
  const a=boot(null,{FileReader:class {constructor(){reader=this} readAsText(){}}});
  challenge(a,0);
  const fi=a.nodes.get('vocab-file');fi.files=[{name:'pending.md',size:100}];fi.events.change();
  a.click('nav',{view:'settings'});
  const unchanged=a.nodes.get('sound-volume');
  reader.result='# 新库\n## 入门\n- 词一';
  if(outcome==='load') reader.onload(); else reader.onerror();
  assert.equal(a.nodes.get('sound-volume'),unchanged,'background file read must not replace settings/password inputs');
  assert.equal(a.run('S.vocabImport.fileName'),'pending.md');
}
console.log('background vocabulary load/error preserves another page DOM: PASS');
