/* Same-origin HTTP boundary. No key is stored in JS state or browser storage. */
'use strict';
const AppAPI = (() => {
  const enabled = typeof location !== 'undefined' && /^https?:$/.test(location.protocol);
  const id = () => crypto.randomUUID();
  async function request(path, body, method = body === undefined ? 'GET' : 'POST', uploadHeaders = null) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch('/api' + path, {method, credentials:'same-origin', signal:controller.signal,
        headers:uploadHeaders || (body === undefined ? {} : {'Content-Type':'application/json'}), body:body === undefined ? undefined : uploadHeaders ? body : JSON.stringify(body)});
      if (response.status === 204) return null;
      const data = await response.json();
      if (!response.ok) throw Object.assign(new Error(data.error?.message || '本地服务请求失败。'), {code:data.error?.code || 'HTTP_ERROR'});
      return data;
    } catch (e) {
      if (typeof e.code==='string') throw e;
      throw Object.assign(new Error('本地服务不可用或响应超时。输入已保留；先检查服务，再重试同一请求。'), {code:'CONNECTION_ERROR'});
    } finally { clearTimeout(timer); }
  }
  const refresh = () => { if (!(S.view==='challenge' && S.ch.step===1 && !S.ch.drawDone)) render(); };
  async function init() {
    if (!enabled) return;
    try { const health=await request('/health'); S.backend.ready=true; S.backend.llm=health.llm; applyModelStatus(health.asr); }
    catch(e) { S.backend.error=e.message; }
    // Avoid destroying a just-started draw or an in-progress password input.
    if (S.view==='home') refresh();
  }
  async function run(c, operation) {
    if (c.busy) return;
    c.busy=true; c.error=''; render();
    try { await operation(); }
    catch(e) { c.error=e.message; if(!['CONNECTION_ERROR','BUSY'].includes(e.code)) c.commandIds.questions=null; }
    finally { c.busy=false; if(S.ch===c && S.view==='challenge') render(); }
  }
  function topic() {
    const t=Store.getChItem();
    return {id:t.knowledgeId, vocab_id:t.vocabId, title:t.title, domain:t.domain, level:t.level};
  }
  function saveExplanation(text) {
    const c=S.ch;
    return run(c, async()=>{
      c.commandIds.create ||= id();
      const data=await request('/challenges',{request_id:c.commandIds.create,topic:topic(),explanation:text});
      c.remote=data; c.explained=data.explanation; c.step=4;
    });
  }
  function generateQuestions() {
    const c=S.ch;
    return run(c,async()=>{
      c.commandIds.questions ||= id();
      c.remote=await request('/challenges/'+c.remote.id+'/questions',{request_id:c.commandIds.questions,expected_revision:c.remote.revision,consent:S.consent.challenge});
      c.qShown=true;
    });
  }
  function saveAnswers() {
    const c=S.ch;
    const answers=c.remote.questions.questions.map(q=>{
      const a=c.remoteAnswers[q.question_id] || {text:'',skipped:false};
      return {question_id:q.question_id,state:a.skipped?'skipped':'answered',text:a.skipped?null:a.text.trim()};
    });
    if(answers.some(a=>a.state==='answered' && (!a.text || a.text.length>2000))) {c.error='请逐题填写 1–2000 字符回答，或明确跳过。';render();return;}
    return run(c,async()=>{
      c.commandIds.answers ||= id();
      c.remote=await request('/challenges/'+c.remote.id+'/answers',{request_id:c.commandIds.answers,expected_revision:c.remote.revision,answers});
      c.step=6;
    });
  }
  function saveRevision(text) {
    const c=S.ch;
    return run(c,async()=>{
      c.commandIds.revision ||= id();
      c.remote=await request('/challenges/'+c.remote.id+'/revisions',{request_id:c.commandIds.revision,expected_revision:c.remote.revision,text});
      c.rev=text; c.step=8;
      await loadWorks(false);
    });
  }
  function asWork(record) {
    return {id:record.id,type:'challenge',remote:true,record,title:record.topic.title,kp:record.topic.title,knowledgeId:record.topic.id,
      domain:record.topic.domain,updated:record.updated_at,status:{explained:'解释已保存',questioned:'追问已保存',answered:'回答已保存',revised:'修正已保存'}[record.stage],
      open:0,exp:record.explanation,rev:record.revisions.at(-1)?.text || ''};
  }
  async function loadWorks(redraw=true) {
    try {
      const [data,videos]=await Promise.all([request('/challenges'),request('/videos')]);
      const selected=S.wkSel===null?null:S.works[S.wkSel]?.id;
      S.works=[...S.works.filter(w=>!w.remote && !w.remoteVideo),...data.items.map(asWork),...videos.items.map(asVideoWork)];
      if(selected) {const index=S.works.findIndex(w=>w.id===selected);S.wkSel=index<0?null:index;}
      S.backend.error='';
    }
    catch(e) {S.backend.error=e.message;}
    if(redraw && S.view==='works') render();
  }
  async function settings(body) {
    if(S.backend.busy) return;
    S.backend.busy=true; S.backend.error='';render();
    try { S.backend.llm=await request('/settings/llm',body); S.backend.ready=true; }
    catch(e){S.backend.error=e.message;}
    finally{body.api_key='';S.backend.busy=false;if(S.view==='settings')render();}
  }
  async function clearKey() {
    if(S.backend.busy) return;
    const key=document.getElementById('llm-key');if(key)key.value='';
    S.backend.busy=true;S.backend.error='';render();
    try{S.backend.llm=await request('/settings/llm',undefined,'DELETE');}
    catch(e){S.backend.error=e.message;}
    finally{S.backend.busy=false;if(S.view==='settings')render();}
  }
  async function examples() {
    try { S.backend.examples=(await request('/examples')).items; S.backend.showExamples=true;S.backend.error=''; }
    catch(e){S.backend.error=e.message;}
    refresh();
  }
  async function remove(work) {
    try {await request('/challenges/'+work.id,undefined,'DELETE');await loadWorks();}
    catch(e){S.backend.error=e.message;refresh();}
  }

  function asVideoWork(record) {
    return {id:record.id,type:'review',remoteVideo:true,record,title:record.name,kp:'独立视频转写',knowledgeId:null,
      domain:'未分类',updated:record.updated_at,status:record.confirmed_version_id?'转写已确认':({running:'本地转写中',failed:'转写失败',interrupted:'转写中断',uploaded:'已上传',transcribed:'待核对'})[record.state],open:0};
  }
  function applyVideo(record) {
    const r=S.rv, local=r.local;
    if(local.record?.id!==record.id)Object.assign(local,{reviews:[],reviewSelected:null,reviewDrafts:{},reviewConsent:false,reviewError:'',reviewNote:'',reviewCommand:null,reviewSaveCommand:null});
    local.record=record;local.file=null;local.dirty=false;local.command=null;local.pollFailed=false;
    r.segs=(record.raw_transcript?.segments || []).map((s,i)=>({id:s.segment_id,start:s.start,end:s.end,text:record.draft[i].text}));
    r.step=record.state==='running'?1:record.raw_transcript?2:0;
  }
  async function loadVideos() {
    const local=S.rv.local;
    try{local.records=(await request('/videos')).items;}
    catch(e){local.error=e.message;}
    if(S.view==='review')render();
  }
  async function openVideo(videoId) {
    const local=S.rv.local;
    if(local.busy || local.reviewBusy)return;
    local.busy=true;local.error='';render();
    try{applyVideo(await request('/videos/'+videoId));await loadVideoReviews();}
    catch(e){local.error=e.message;}
    finally{local.busy=false;if(S.view==='review')render();}
  }
  async function startVideo() {
    const local=S.rv.local;
    if(local.busy)return;
    if(S.backend.asr?.installation && !S.backend.asr.available){local.error='本地语音模型尚未就绪，请等待安装完成或重试安装。';render();return;}
    local.busy=true;local.error='';render();
    try{
      if(local.file){
        local.uploadId ||= id();
        const record=await request('/videos',local.file,'POST',{'Content-Type':'video/mp4','X-File-Name':encodeURIComponent(local.file.name),'X-Request-Id':local.uploadId});
        applyVideo(record);
      }
      if(!local.record)throw new Error('请先选择MP4视频。');
      local.command ||= {request_id:id(),expected_revision:local.record.revision};
      const data=await request('/videos/'+local.record.id+'/transcribe',local.command);
      applyVideo(data);
    }catch(e){local.error=e.message;if(e.code!=='CONNECTION_ERROR')local.command=null;}
    finally{local.busy=false;if(S.view==='review')render();}
  }
  async function saveTranscript(confirm) {
    const local=S.rv.local;
    if(local.busy || !local.record?.raw_transcript)return;
    const segments=S.rv.segs.map(s=>({segment_id:s.id,text:s.text}));
    if(segments.some(s=>s.text.length>2000) || segments.reduce((n,s)=>n+s.text.length,0)>12000 || (confirm && !segments.some(s=>s.text.trim()))){local.error='单段最多2000字符，全稿最多12000字符，确认时至少保留一段文字。';render();return;}
    const signature=JSON.stringify({segments,confirm});
    if(local.command?.signature!==signature)local.command={signature,body:{request_id:id(),expected_revision:local.record.revision,segments,confirm}};
    local.busy=true;local.error='';render();
    try{applyVideo(await request('/videos/'+local.record.id+'/transcript',local.command.body));await loadVideoReviews();}
    catch(e){local.error=e.message;if(e.code!=='CONNECTION_ERROR')local.command=null;}
    finally{local.busy=false;if(S.view==='review')render();}
  }
  async function loadVideoReviews() {
    const local=S.rv.local,videoId=local.record?.id;
    if(!videoId)return;
    const data=await request('/videos/'+videoId+'/reviews');
    if(local===S.rv.local && local.record?.id===videoId){
      local.reviews=data.items || [];
      if(!local.reviews.some(r=>r.id===local.reviewSelected))local.reviewSelected=local.reviews[0]?.id || null;
    }
  }
  async function reviewVideo() {
    const local=S.rv.local,v=local.record;
    if(local.busy || local.reviewBusy)return;
    if(!v?.confirmed_version_id || local.dirty || !local.reviewConsent){local.reviewError='请先确认当前文案，并同意将确认稿发送到当前模型服务。';render();return;}
    if(local.reviewCommand?.transcript_version_id!==v.confirmed_version_id)local.reviewCommand={request_id:id(),expected_revision:v.revision,transcript_version_id:v.confirmed_version_id,consent:true};
    local.reviewBusy=true;local.reviewError='';local.reviewNote='';render();
    try{
      const result=await request('/videos/'+v.id+'/review',local.reviewCommand);
      if(local===S.rv.local && local.record?.id===v.id){await loadVideoReviews();local.reviewSelected=result.id;local.reviewCommand=null;}
    }catch(e){local.reviewError=e.message;if(!['CONNECTION_ERROR','BUSY'].includes(e.code))local.reviewCommand=null;
      try{await loadVideoReviews();}catch(_){}
    }finally{local.reviewBusy=false;if(S.view==='review')render();}
  }
  async function saveReviewScript() {
    const local=S.rv.local,review=local.reviews.find(r=>r.id===local.reviewSelected);
    if(local.busy || local.reviewBusy || !review || review.state!=='succeeded')return;
    const text=local.reviewDrafts[review.id] ?? review.user_script ?? review.ai_script;
    if(!text?.trim() || text.length>16000){local.reviewError='建议稿须为1至16000字符。';render();return;}
    const signature=JSON.stringify({id:review.id,text});
    if(local.reviewSaveCommand?.signature!==signature)local.reviewSaveCommand={signature,body:{request_id:id(),expected_revision:review.revision,text}};
    local.reviewBusy=true;local.reviewError='';render();
    try{
      await request('/videos/'+local.record.id+'/reviews/'+review.id+'/script',local.reviewSaveCommand.body);
      await loadVideoReviews();delete local.reviewDrafts[review.id];local.reviewSaveCommand=null;local.reviewNote='用户编辑版已保存；AI原始建议保留。';
    }catch(e){local.reviewError=e.message;if(e.code!=='CONNECTION_ERROR')local.reviewSaveCommand=null;}
    finally{local.reviewBusy=false;if(S.view==='review')render();}
  }
  async function copyReview(kind) {
    const local=S.rv.local,review=local.reviews.find(r=>r.id===local.reviewSelected);
    if(!review || review.state!=='succeeded')return;
    const text=kind==='original'?review.original_script:local.reviewDrafts[review.id] ?? review.user_script ?? review.ai_script;
    try{if(!navigator.clipboard)throw new Error();await navigator.clipboard.writeText(text);local.reviewNote='已复制到剪贴板。';}
    catch(_){local.reviewNote='复制失败，请手动选择文本复制。';}
    const note=document.getElementById('rv-review-note');if(note)note.textContent=local.reviewNote;
  }
  let videoPoll=null,videoPolling=false;
  let modelPoll=null,modelPolling=false;
  function applyModelStatus(asr) {
    S.backend.asr=asr;
    const banner=document.getElementById('asr-install-status');
    if(banner)banner.innerHTML=asrInstallHtml();
    const status=document.getElementById('asr-local-state');
    if(status)status.innerHTML=st(asr.available?'done':'wait',asr.available?'faster-whisper small · CPU INT8（文件存在，运行时校验）':'未就绪，请查看模型安装状态');
    const button=document.querySelector?.('[data-action="rv:local-start"]');
    if(button)button.disabled=S.rv.local.busy || (!!asr.installation && !asr.available);
    syncModelPolling();
  }
  function syncModelPolling() {
    const active=enabled && !document.hidden && ['checking','downloading','verifying'].includes(S.backend.asr?.installation?.state);
    if(!active){if(modelPoll)clearTimeout(modelPoll);modelPoll=null;return;}
    if(modelPoll || modelPolling)return;
    modelPoll=setTimeout(async()=>{
      modelPoll=null;modelPolling=true;
      try{applyModelStatus((await request('/health')).asr);}
      catch(e){applyModelStatus({...S.backend.asr,installation:{state:'failed',message:e.message}});}
      finally{modelPolling=false;syncModelPolling();}
    },1000);
  }
  async function installModel() {
    if(!enabled || modelPolling)return;
    applyModelStatus({...S.backend.asr,available:false,installation:{state:'checking',message:'正在启动模型安装…'}});
    try{applyModelStatus(await request('/asr/model/install',{}));}
    catch(e){applyModelStatus({...S.backend.asr,installation:{state:'failed',message:e.message}});}
  }
  document.addEventListener?.('visibilitychange',syncModelPolling);
  window.addEventListener?.('pagehide',()=>{if(modelPoll)clearTimeout(modelPoll);modelPoll=null;});
  function syncVideoPolling() {
    syncModelPolling();
    const local=S.rv.local;
    const active=enabled && S.view==='review' && local.record?.state==='running' && !local.pollFailed;
    if(!active){if(videoPoll)clearTimeout(videoPoll);videoPoll=null;return;}
    if(videoPoll || videoPolling)return;
    const videoId=local.record.id;
    videoPoll=setTimeout(async()=>{
      videoPoll=null;videoPolling=true;
      let changed=false;
      try{
        const data=await request('/videos/'+videoId);
        if(local===S.rv.local && local.record?.id===videoId){
          if(data.state==='running')local.record=data;else {applyVideo(data);changed=true;}
        }
      }catch(e){if(local.record?.id===videoId){local.error=e.message;local.pollFailed=true;changed=true;}}
      finally{videoPolling=false;if(S.view==='review' && changed)render();else syncVideoPolling();}
    },1200);
  }
  return {enabled,request,init,saveExplanation,generateQuestions,saveAnswers,saveRevision,loadWorks,settings,clearKey,examples,remove,
    loadVideos,openVideo,startVideo,saveTranscript,syncVideoPolling,reviewVideo,saveReviewScript,copyReview,loadVideoReviews,installModel};
})();
