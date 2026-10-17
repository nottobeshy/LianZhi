'use strict';
const assert=require('node:assert/strict');
const {boot,challenge}=require('./test-p0');
let failure='abort';
const b=boot(null,{AbortController,fetch:async()=>{
  if(failure==='abort') throw Object.assign(new Error('aborted'),{code:20});
  return {ok:false,status:409,json:async()=>({error:{code:'BUSY',message:'running'}})};
}});
(async()=>{
  await assert.rejects(b.run("AppAPI.request('/health')"),{code:'CONNECTION_ERROR'});
  challenge(b,4);
  b.run("S.ch.remote={id:'saved',revision:1,explanation:'原解释',questions:null};S.ch.commandIds.questions='same-command';S.consent.challenge=true");
  await b.run('AppAPI.generateQuestions()');
  assert.equal(b.run('S.ch.commandIds.questions'),'same-command');
  assert.equal(b.run('S.ch.busy'),false);
  failure='busy';
  await b.run('AppAPI.generateQuestions()');
  assert.equal(b.run('S.ch.commandIds.questions'),'same-command');
  assert.equal(b.run('S.ch.remote.explanation'),'原解释');
  console.log('API abort/busy preserves command identity and original input: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
