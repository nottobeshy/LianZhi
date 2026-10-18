'use strict';
// Real UI/actions with deterministic HTTP/DOM/clock substitutes; no ASR or browser claim.
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const {boot}=require('./test-p0');
const file={name:'新视频.mp4',size:1234};
let uploads=0,starts=0,polls=0;
let record={id:'test-video',name:file.name,size:1234,metadata:{duration:10,audio_codec:'aac'},state:'uploaded',revision:1,
  error:null,raw_transcript:null,draft:[],versions:[],confirmed_version_id:null,updated_at:'2026-10-18'};
const completed=()=>({...record,state:'transcribed',revision:3,
  raw_transcript:{model:'small',elapsed_seconds:1,segments:[{segment_id:'s1',start:1,end:3,text:'识别 <原文>'}]},
  draft:[{segment_id:'s1',text:'识别 <原文>'}]});
const b=boot(null,{AbortController,crypto:webcrypto,location:{protocol:'http:'},fetch:async(url,options)=>{
  let data;
  if(url==='/api/health')data={llm:{},asr:{available:true}};
  else if(url.endsWith('/reviews'))data={items:[]};
  else if(url==='/api/videos' && options.method==='GET')data={items:[]};
  else if(url==='/api/videos'){
    uploads++;assert.equal(options.body,file);assert.equal(options.headers['X-File-Name'],encodeURIComponent(file.name));data=record;
  }else if(url.endsWith('/transcribe')){starts++;record={...record,state:'running',revision:2};data=record;}
  else if(url.endsWith('/transcript')){
    const body=JSON.parse(options.body);
    record={...record,draft:body.segments,revision:record.revision+1,confirmed_version_id:body.confirm?'confirmed-1':null,
      versions:body.confirm?[{version_id:'confirmed-1',version:1,confirmed_at:'now',segments:record.raw_transcript.segments.map((s,i)=>({...s,text:body.segments[i].text}))}]:[]};data=record;
  }else{polls++;data=polls===1?record:(record=completed());}
  return {status:200,ok:true,json:async()=>JSON.parse(JSON.stringify(data))};
}});
const settle=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  await settle();b.click('nav',{view:'review'});await settle();
  const input=b.nodes.get('review-video-file');input.files=[file];input.events.change();
  assert.equal(b.run('S.rv.local.file.name'),file.name);
  b.click('rv:local-start');b.click('rv:local-start');await settle();
  assert.equal(uploads,1);assert.equal(starts,1);assert.equal(b.run('S.rv.local.record.state'),'running');
  const processingPlayer=b.nodes.get('review-player');
  b.advance(1200);await settle();assert.equal(polls,1);
  assert.equal(b.nodes.get('review-player'),processingPlayer,'unchanged polling must not rebuild the video player');
  b.click('nav',{view:'settings'});b.advance(5000);await settle();assert.equal(polls,1);
  b.click('nav',{view:'review'});await settle();b.advance(1200);await settle();
  assert.equal(b.run('S.rv.local.record.state'),'transcribed');
  assert.ok(b.app.innerHTML.includes('本地真实ASR'));assert.ok(b.app.innerHTML.includes('识别 &lt;原文&gt;'));
  assert.ok(b.app.innerHTML.includes('00:01.000–00:03.000'));
  assert.ok(!b.app.innerHTML.includes('生成 AI 复盘（演示）'));
  b.input('segin-0','人工修订 <知识>');
  b.click('nav',{view:'settings'});b.click('nav',{view:'review'});await settle();
  assert.equal(b.nodes.get('segin-0').value,'人工修订 <知识>');
  await b.run('AppAPI.saveTranscript(true)');
  assert.equal(b.run('S.rv.local.record.confirmed_version_id'),'confirmed-1');
  assert.equal(b.run('S.rv.local.record.raw_transcript.segments[0].text'),'识别 <原文>');
  assert.equal(b.run('S.rv.local.record.versions[0].segments[0].text'),'人工修订 <知识>');
  const player=b.nodes.get('review-player');b.click('rv:seek',{t:'2.5'});assert.equal(player.currentTime,2.5);
  b.input('segin-0','再次修改');assert.equal(b.nodes.get('rv-transcript-status').textContent,'当前稿待确认');
  assert.ok(!JSON.stringify(b.storage.data).includes('识别 <原文>'));
  console.log('video select/raw upload/debounce/poll navigation/draft preservation/confirm/original/seek: PASS (DOM/HTTP substitutes)');
})().catch(e=>{console.error(e);process.exitCode=1});
