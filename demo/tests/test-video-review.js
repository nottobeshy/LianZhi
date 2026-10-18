'use strict';
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const {boot}=require('./test-p0');
let reviews=[],calls=[],fail=false,copied='';
let video={id:'v1',name:'fixture.mp4',size:80000,metadata:{duration:10,audio_codec:'aac'},state:'transcribed',revision:3,
  raw_transcript:{model:'small',elapsed_seconds:1,segments:[{segment_id:'s1',start:0,end:2,text:'未校对ASR'}]},
  draft:[{segment_id:'s1',text:'人工确认的原文'}],versions:[{version_id:'confirmed-1',version:1,segments:[{segment_id:'s1',start:0,end:2,text:'人工确认的原文'}]}],confirmed_version_id:'confirmed-1'};
const b=boot(null,{AbortController,crypto:webcrypto,location:{protocol:'http:'},
  navigator:{clipboard:{writeText:async text=>{copied=text;}}},fetch:async(url,options)=>{
    let data;
    if(url==='/api/health')data={llm:{configured:true,mode:'mock',endpoint:'https://api.deepseek.com',model:'fixture'},asr:{}};
    else if(url==='/api/videos')data={items:[video]};
    else if(url.endsWith('/reviews'))data={items:reviews};
    else if(url.endsWith('/review')){
      const body=JSON.parse(options.body);calls.push(body);
      if(fail)throw new Error('connection interrupted');
      reviews=[{id:'r1',state:'succeeded',stale:false,revision:1,transcript_version_id:'confirmed-1',prompt_version:'video-script-review-v1',
        original_script:'人工确认的原文',original_segments:video.versions[0].segments,ai_script:'AI建议 <script>',user_script:null,edits:[],
        change_summary:[{category:'logic',segment_ids:['s1'],reason:'梳理顺序'}],needs_verification:['待核实事项'],origin:{mode:'mock',provider:'local-stub'},created_at:'now'}];data=reviews[0];
    }else if(url.endsWith('/script')){
      const body=JSON.parse(options.body);reviews[0]={...reviews[0],user_script:body.text,revision:2};data=reviews[0];
    }else if(url.endsWith('/transcript')){
      const body=JSON.parse(options.body);video={...video,draft:body.segments,revision:4,confirmed_version_id:'confirmed-2'};
      reviews[0].stale=true;data=video;
    }else data=video;
    return {status:200,ok:true,json:async()=>JSON.parse(JSON.stringify(data))};
  }});
const settle=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  await settle();b.run("S.view='review'");await b.run("AppAPI.openVideo('v1')");
  assert.equal(b.nodes.get('rv-ai-review-btn').disabled,true);
  await b.run('AppAPI.reviewVideo()');assert.equal(calls.length,0);
  b.run('S.rv.local.reviewConsent=true;render()');
  fail=true;await b.run('AppAPI.reviewVideo()');assert.equal(calls.length,1);
  assert.equal(b.run('S.rv.local.record.draft[0].text'),'人工确认的原文');
  fail=false;await b.run('AppAPI.reviewVideo()');assert.equal(calls.length,2);
  assert.equal(calls[0].request_id,calls[1].request_id,'network retries keep command identity');
  assert.equal(b.nodes.get('rv-review-original').value,'人工确认的原文');
  assert.ok(b.app.innerHTML.includes('readonly'));
  assert.ok(b.app.innerHTML.includes('AI建议 &lt;script&gt;'));
  await b.run("AppAPI.copyReview('original')");assert.equal(copied,'人工确认的原文');
  b.input('rv-review-script','用户编辑 <稿件>');
  b.click('nav',{view:'settings'});b.click('nav',{view:'review'});await settle();
  assert.equal(b.nodes.get('rv-review-script').value,'用户编辑 <稿件>');
  await b.run("AppAPI.copyReview('revised')");assert.equal(copied,'用户编辑 <稿件>');
  await b.run('AppAPI.saveReviewScript()');
  assert.equal(b.run('S.rv.local.reviews[0].user_script'),'用户编辑 <稿件>');
  assert.equal(b.run('S.rv.local.reviews[0].ai_script'),'AI建议 <script>');
  b.input('segin-0','新的确认文案');
  assert.equal(b.nodes.get('rv-ai-review-btn').disabled,true);
  assert.ok(b.nodes.get('rv-ai-review-status').textContent.includes('已过期'));
  await b.run('AppAPI.saveTranscript(true)');
  assert.equal(b.run('S.rv.local.reviews[0].stale'),true);
  assert.equal(b.nodes.get('rv-review-original').value,'人工确认的原文');
  assert.equal(b.run('S.rv.local.record.raw_transcript.segments[0].text'),'未校对ASR');
  console.log('review consent/confirmed source/copy/user edits/escaped output/network identity/stale history: PASS (substitutes)');
})().catch(error=>{console.error(error);process.exitCode=1});
