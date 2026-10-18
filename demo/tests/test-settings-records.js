'use strict';
// Isolated DOM/WebAudio substitutes; not a browser layout or listening test.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {boot}=require('./test-p0');

const css=fs.readFileSync(path.join(__dirname,'../css/app.css'),'utf8');
assert.match(css,/#kc-root #sound-volume\s*\{[^}]*max-width:\s*240px/);
assert.match(css,/#kc-root #sound-volume\s*\{[^}]*width:\s*100%/);
assert.match(css,/#kc-root #sound-volume\s*\{[^}]*transform:\s*none/);

let starts=0;
class AudioContext {
  state='running'; destination={};
  createBuffer(_,length){return {getChannelData:()=>new Float32Array(length)}}
  createBufferSource(){return {connect(){},start(){starts++}}}
}
const b=boot(null,{AudioContext});
b.click('nav',{view:'settings'});
assert.equal(b.run('SoundFx.getVolume()'),.25);
for(const percent of [0,37,100]) {
  b.input('sound-volume',String(percent));
  assert.equal(b.run('SoundFx.getVolume()'),percent/100);
  assert.equal(b.nodes.get('sound-volume-label').textContent,percent+'%');
  assert.equal(JSON.parse(b.storage.data['kc.sound.v1']).volume,percent/100);
  const before=starts;
  b.advance(50);b.run('SoundFx.tick();SoundFx.lock()');
  assert.equal(starts-before,percent===0?0:2);
  const reloaded=boot(null,{localStorage:b.storage,AudioContext});
  reloaded.click('nav',{view:'settings'});
  assert.equal(reloaded.run('SoundFx.getVolume()'),percent/100);
  assert.equal(reloaded.nodes.get('sound-volume').value,String(percent));
}
console.log('volume 0/37/100%, label, persistence reload, Tick/Lock synthesis: PASS (audio substitute)');

for(const mode of ['live','mock',null]) {
  const record={id:'historical-record',topic:{id:'topic-id',title:'知识点',domain:'概率论'},stage:'revised',revision:4,
    explanation:'原稿 <原文> & 保留换行\n第二行',answers:[{question_id:'q1',state:'answered',text:'用户回答'}],
    questions:mode?{origin:{mode,provider:'audit-provider',model:'audit-model',usage:{prompt_tokens:12}},
      questions:[{question_id:'q1',question:'问题',why_asked:'原因',based_on:'原稿'}]}:null,
    revisions:[{version:1,text:'第一次修正'},{version:2,text:'第二次修正'}]};
  const before=JSON.stringify(record);
  const work={remote:true,id:record.id,type:'challenge',record,title:'知识点',kp:'知识点',knowledgeId:'topic-id',updated:'2026-10-17 12:00',status:'修正已保存',open:0};
  b.run('S.works=['+JSON.stringify(work)+"];S.view='works';S.wkSel=0;S.wkExport=false;render()");
  const html=b.app.innerHTML;
  assert.ok(!html.includes('追问来源'));
  assert.ok(!html.includes('prompt_tokens'));
  for(const text of ['知识点','2026-10-17 12:00','原稿 &lt;原文&gt; &amp; 保留换行','第一次修正','第二次修正']) assert.ok(html.includes(text),text);
  assert.ok(html.includes(mode==='live'?'live ·':mode==='mock'?'mock · 开发 Stub':'尚未调用模型'));
  const md=b.run('buildExportMd(S.works[0])');
  assert.ok(md.includes('追问来源'));
  if(mode) assert.ok(md.includes('"mode": "'+mode+'"'));
  assert.equal(b.run('JSON.stringify(S.works[0].record)'),before);
}
const examples=boot(null,{location:{protocol:'http:'},AbortController,fetch:async()=>({ok:true,status:200,json:async()=>({llm:{mode:'mock'}})})});
examples.run("S.backend.showExamples=true;S.backend.examples=[{title:'案例',source:'预存协议案例',explanation:'原稿',questions:['问题'],answer:'回答',revision:'修正',limitations:'非真实调用'}]");
assert.ok(examples.run('vHome()').includes('example · 预存协议案例'));
console.log('record body hides audit JSON; original/revisions/date, live/mock identity and export metadata retained: PASS');
