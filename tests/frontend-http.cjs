'use strict';
// Actual frontend scripts and HTTP API; in-memory DOM is not a browser test.
const assert=require('node:assert/strict');
const {boot,challenge}=require('../demo/tests/test-p0');
const base=process.env.TEST_BASE_URL;
const b=boot(null,{location:{protocol:'http:'},crypto:globalThis.crypto,AbortController,
  fetch:(url,options)=>fetch(base+url,options)});
(async()=>{
  await b.run('AppAPI.init()');
  assert.equal(b.run('S.backend.ready'),true);
  challenge(b,3);
  const explanation='每次抽取的样本都独立，所以两个事件同时发生的概率等于各自概率乘积。';
  b.input('ch-exp',explanation);
  await b.run(`AppAPI.saveExplanation(${JSON.stringify(explanation)})`);
  assert.equal(b.run('S.ch.step'),4);
  b.run('S.consent.challenge=true');
  await b.run('Promise.all([AppAPI.generateQuestions(),AppAPI.generateQuestions()])');
  assert.equal(b.run('S.ch.remote.questions.origin.mode'),'mock');
  assert.ok(b.app.innerHTML.includes('开发 Stub'));
  const qid=b.run('S.ch.remote.questions.questions[0].question_id');
  b.input('remote-answer-'+qid,'独立性是必要前提，相关事件不能直接相乘。');
  await b.run('AppAPI.saveAnswers()');
  assert.equal(b.run('S.ch.step'),6);
  b.input('ch-rev','仅当两个事件独立时，交事件概率才等于边缘概率乘积。');
  await b.run('AppAPI.saveRevision(S.ch.draft.revision)');
  assert.equal(b.run('S.ch.step'),8);
  await b.run('AppAPI.loadWorks(false)');
  assert.equal(b.run('S.works.filter(w=>w.remote).length'),1);
  assert.ok(b.run('buildExportMd(S.works.find(w=>w.remote))').includes(explanation));
  b.run("S.view='works';S.wkSel=S.works.findIndex(w=>w.remote);render()");
  assert.ok(b.app.innerHTML.includes('讲解文案'));
  assert.ok(!b.app.innerHTML.includes('追问来源'));
  assert.ok(b.app.innerHTML.includes('mock · 开发 Stub'));
  console.log(JSON.stringify({id:b.run('S.ch.remote.id'),explanation}));
})().catch(e=>{console.error(e);process.exitCode=1;});
