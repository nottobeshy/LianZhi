'use strict';
// Formal UI/API code + real loopback HTTP. DOM substitute; no real browser claim.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {boot}=require('../demo/tests/test-p0');
const base=process.env.TEST_BASE_URL,id=process.env.TEST_VIDEO_ID;
const b=boot(null,{AbortController,crypto:crypto.webcrypto,location:{protocol:'http:'},fetch:(url,options)=>fetch(base+url,options)});
(async()=>{
  b.run("S.view='review'");
  await b.run('AppAPI.openVideo('+JSON.stringify(id)+')');
  const original=b.run('JSON.stringify(S.rv.local.record.raw_transcript)');
  assert.ok(b.app.innerHTML.includes('本地真实ASR'));
  assert.ok(!b.app.innerHTML.includes('开始提音与转写（演示）'));
  if(process.env.TEST_READ_ONLY==='1'){
    assert.ok(b.run('S.rv.local.record.confirmed_version_id'));
    assert.ok(b.app.innerHTML.includes('人工校对测试'));
    console.log('Saved video reload in fresh frontend runtime: PASS');return;
  }
  const current=b.run('S.rv.segs[0].text');
  b.input('segin-0',current+'（人工校对测试）');
  assert.equal(b.run('S.rv.local.dirty'),true);
  b.click('nav',{view:'settings'});b.run("S.view='review';render()");
  assert.equal(b.nodes.get('segin-0').value,current+'（人工校对测试）');
  await b.run('AppAPI.saveTranscript(false)');
  assert.equal(b.run('S.rv.local.record.confirmed_version_id'),null);
  await b.run('AppAPI.saveTranscript(true)');
  assert.ok(b.run('S.rv.local.record.confirmed_version_id'));
  assert.equal(b.run('JSON.stringify(S.rv.local.record.raw_transcript)'),original);
  const player=b.nodes.get('review-player');
  b.click('rv:seek',{t:'3.2'});assert.equal(player.currentTime,3.2);
  await b.run('AppAPI.loadWorks(false)');
  b.run('S.view="works";S.wkSel=S.works.findIndex(w=>w.id==='+JSON.stringify(id)+');render()');
  assert.ok(b.app.innerHTML.includes('人工校对测试'));
  assert.ok(b.app.innerHTML.includes('非云端AI报告'));
  assert.ok(!b.app.innerHTML.includes('data-action="wk:del-media"'));
  const record=await (await fetch(base+'/api/videos/'+id)).json();
  console.log(JSON.stringify({id,confirmed_version_id:record.confirmed_version_id,
    persisted_sha256:crypto.createHash('sha256').update(JSON.stringify(record)).digest('hex')}));
})().catch(()=>{console.error('Video UI/HTTP assertion failed (private transcript omitted)');process.exitCode=1});
