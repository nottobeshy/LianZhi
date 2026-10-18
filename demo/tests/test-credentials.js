'use strict';
// Actual frontend scripts with isolated HTTP/DOM substitutes, not browser interaction.
const assert=require('node:assert/strict');
const {boot}=require('./test-p0');
const token='fake-ui-token-never-paid-789';
const status={mode:'live',endpoint:'https://api.deepseek.com',model:'test-model',configured:false,
  saved_key:false,remember_key:false,key_source:'none',credential_error:''};
let posted, deletes=0;
const b=boot(null,{AbortController,location:{protocol:'http:'},fetch:async(url,options)=>{
  let data;
  if(url==='/api/health') data={llm:{...status}};
  else if(options.method==='DELETE') {
    deletes++;Object.assign(status,{configured:false,saved_key:false,remember_key:false,key_source:'none'});
    data={...status};
  } else {
    posted=JSON.parse(options.body);
    Object.assign(status,{configured:true,saved_key:posted.remember_key,remember_key:posted.remember_key,key_source:'session'});
    data={...status};
  }
  return {status:200,ok:true,json:async()=>data};
}});
const settled=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  await settled();b.click('nav',{view:'settings'});
  assert.equal(b.nodes.get('llm-key').value,'');
  b.nodes.get('llm-mode').value='live';
  b.nodes.get('llm-endpoint').value='https://api.deepseek.com';
  b.nodes.get('llm-model').value='test-model';
  const originalInput=b.nodes.get('llm-key');originalInput.value=token;
  b.nodes.get('llm-remember').checked=true;
  b.click('api:settings');
  assert.equal(originalInput.value,'');
  await settled();
  assert.equal(posted.api_key,token);assert.equal(posted.remember_key,true);
  assert.ok(b.app.innerHTML.includes('密钥已保存'));
  assert.ok(b.app.innerHTML.includes('取消勾选并应用会删除'));
  assert.equal(b.nodes.get('llm-key').value,'');
  assert.ok(!b.app.innerHTML.includes(token));
  assert.ok(!b.run('JSON.stringify(S)').includes(token));
  assert.ok(!JSON.stringify(b.storage.data).includes(token));
  const body={mode:'live',endpoint:'https://api.deepseek.com',model:'test-model',api_key:token,remember_key:true};
  await b.run('AppAPI.settings('+JSON.stringify(body)+')');
  b.click('api:clear-key');b.click('api:clear-key');await settled();
  assert.equal(deletes,1);assert.equal(b.run('S.backend.llm.configured'),false);
  assert.equal(b.run('S.backend.busy'),false);
  b.run("S.backend.llm.credential_error='<凭据不可用>';render()");
  assert.ok(b.app.innerHTML.includes('&lt;凭据不可用&gt;'));
  console.log('credential UI submit/clear, empty password, statuses, no Store/localStorage token, duplicate-delete guard: PASS (DOM/HTTP substitutes)');
})().catch(e=>{console.error(e);process.exitCode=1});
