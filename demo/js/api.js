/* Same-origin HTTP boundary. No key is stored in JS state or browser storage. */
'use strict';
const AppAPI = (() => {
  const enabled = typeof location !== 'undefined' && /^https?:$/.test(location.protocol);
  const id = () => crypto.randomUUID();
  async function request(path, body, method = body === undefined ? 'GET' : 'POST') {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch('/api' + path, {method, credentials:'same-origin', signal:controller.signal,
        headers:body === undefined ? {} : {'Content-Type':'application/json'}, body:body === undefined ? undefined : JSON.stringify(body)});
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
    try { const health=await request('/health'); S.backend.ready=true; S.backend.llm=health.llm; }
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
      const data=await request('/challenges');
      const selected=S.wkSel===null?null:S.works[S.wkSel]?.id;
      S.works=[...S.works.filter(w=>!w.remote),...data.items.map(asWork)];
      if(selected) {const index=S.works.findIndex(w=>w.id===selected);S.wkSel=index<0?null:index;}
      S.backend.error='';
    }
    catch(e) {S.backend.error=e.message;}
    if(redraw && S.view==='works') render();
  }
  async function settings(body) {
    S.backend.busy=true; S.backend.error='';render();
    try { S.backend.llm=await request('/settings/llm',body); S.backend.ready=true; }
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
  return {enabled,request,init,saveExplanation,generateQuestions,saveAnswers,saveRevision,loadWorks,settings,examples,remove};
})();
