'use strict';
const assert=require('node:assert/strict');
const {boot}=require('./test-p0');
let phase='downloading',health=0,retries=0;
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const b=boot(null,{AbortController,location:{protocol:'http:'},fetch:async(url,options)=>{
  let data;
  if(url==='/api/health'){health++;data={llm:{},asr:{available:phase==='ready',installation:{state:phase,message:'fixture <status>',downloaded:1,total:2}}};}
  else if(url==='/api/asr/model/install'){retries++;phase='downloading';data={available:false,installation:{state:phase,message:'retry'}};}
  else data={items:[]};
  return {status:200,ok:true,json:async()=>data};
}});
(async()=>{
  await settle();b.click('nav',{view:'settings'});
  const key=b.nodes.get('llm-key');key.value='fixture-private-unsaved';
  const appHtml=b.app.innerHTML;
  b.advance(1000);await settle();
  assert.equal(b.nodes.get('llm-key'),key);assert.equal(key.value,'fixture-private-unsaved');
  assert.equal(b.app.innerHTML,appHtml,'Progress polling must not rerender password or business forms');
  assert.ok(b.nodes.get('asr-install-status').innerHTML.includes('&lt;status&gt;'));
  phase='ready';b.advance(1000);await settle();
  assert.equal(b.run('S.backend.asr.available'),true);
  assert.equal(b.nodes.get('asr-install-status').innerHTML,'');
  const stopped=health;b.advance(5000);await settle();assert.equal(health,stopped);
  b.run("S.backend.asr.installation={state:'failed',message:'retry'};render()");
  b.click('asr:install');await settle();assert.equal(retries,1);
  phase='ready';b.advance(1000);await settle();
  console.log('model status/retry/escaped text/poll completion/password preservation: PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});
