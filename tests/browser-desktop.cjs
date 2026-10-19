'use strict';
// Attach to the actual Windows WebView2, enabled only by the opt-in desktop test environment.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.connectOverCDP(process.env.TEST_CDP_URL);
  const page=browser.contexts()[0].pages().find(p=>p.url().startsWith(process.env.TEST_BASE_URL));
  assert.ok(page,'Expected the actual desktop window');
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const nav=async view=>page.locator(`[data-action="nav"][data-view="${view}"]`).first().click();
  try{
    await page.waitForFunction(()=>S.backend.ready);
    assert.ok(await page.evaluate(()=>!!window.chrome?.webview));
    assert.equal(await page.evaluate(()=>S.backend.llm.mode),'mock');
    if(process.env.TEST_RESTART==='1'){
      await nav('settings');assert.equal(await page.locator('#sound-volume').inputValue(),'37');
      assert.equal(await page.evaluate(()=>S.backend.llm.saved_key),true);
      assert.equal(await page.evaluate(()=>S.backend.llm.key_source),'saved');
      assert.equal(await page.locator('#llm-key').inputValue(),'');
      await nav('challenge');assert.equal(await page.evaluate(()=>Store.getActiveVocab().name),'包体验收词库');
      await nav('works');await page.waitForFunction(()=>S.works.some(w=>w.remote));
      await nav('review');await page.locator(`[data-action="rv:local-open"][data-id="${process.env.TEST_VIDEO_ID}"]`).click();
      await page.locator('#rv-review-script').waitFor();
      assert.ok((await page.locator('#rv-review-script').inputValue()).endsWith('（候选包编辑）'));
      // Revoke only the isolated fake credential created by this acceptance test.
      await nav('settings');await page.locator('[data-action="api:clear-key"]').click();
      await page.waitForFunction(()=>S.backend.llm.saved_key===false);
      assert.deepEqual(errors,[]);console.log(JSON.stringify({restart:true,sqlite:true,volume:true,vocabulary:true,vault:true,review:true,page_errors:errors}));return;
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('.kc-flame-layer').count(),1);
    await nav('settings');
    await page.locator('#llm-key').fill('candidate-fake-key-never-paid-123');await page.locator('#llm-model').fill('deepseek-v4-pro');await page.locator('#llm-remember').check();
    await page.locator('[data-action="api:settings"]').click();
    await page.waitForFunction(()=>S.backend.llm.saved_key===true);
    await page.locator('#consent-ch').check();
    await page.locator('#sound-volume').evaluate(el=>{el.value='37';el.dispatchEvent(new Event('input',{bubbles:true}));});
    await nav('challenge');
    await page.locator('#vocab-file').setInputFiles({name:'候选词库.md',mimeType:'text/markdown',buffer:Buffer.from('# 包体验收词库\n## 入门\n- 独立事件\n- 样本空间\n')});
    await page.locator('[data-action="ch:vocab-import"]').click();
    const importedId=await page.evaluate(()=>S.vocabs.find(v=>v.name==='包体验收词库').id);
    await page.locator(`[data-action="ch:vocab"][data-id="${importedId}"]`).click();
    await page.locator('[data-action="ch:draw"]').click();await page.waitForFunction(()=>S.ch.drawDone);
    await page.locator('[data-action="ch:open-card"]').click();await page.locator('[data-action="ch:timer-start"]').click();
    await page.locator('[data-action="ch:timer-pause"]').click();await page.locator('[data-action="ch:learned"]').click();
    await page.locator('#ch-exp').fill('两个事件独立时，交事件的概率等于各自概率的乘积。');
    await page.locator('[data-action="ch:submit-exp"]').click();await page.locator('[data-action="ch:gen-q"]').click();
    await page.locator('textarea[id^="remote-answer-"]').first().waitFor();
    const answers=page.locator('textarea[id^="remote-answer-"]');for(let i=0;i<await answers.count();i++)await answers.nth(i).fill('需要先说明独立性的适用前提。');
    await page.locator('[data-action="ch:submit-ans"]').click();await page.locator('#ch-rev').fill('先说明独立性前提，再使用乘法公式。');
    await page.locator('[data-action="ch:submit-rev"]').click();await page.waitForFunction(()=>S.ch.step===8);
    assert.equal(await page.evaluate(()=>S.ch.remote.questions.origin.mode),'mock');
    await nav('review');await page.locator('#review-video-file').setInputFiles(process.env.LIANZHI_ASR_TEST_VIDEO);
    await page.locator('[data-action="rv:local-start"]').click();await page.locator('#segin-0').waitFor({timeout:180000});
    await page.locator('[data-action="rv:local-confirm"]').click();await page.waitForFunction(()=>!!S.rv.local.record.confirmed_version_id);
    await page.locator('#rv-review-consent').check();await page.locator('[data-action="rv:ai-review"]').click();
    await page.locator('#rv-review-script').waitFor();
    const review=await page.evaluate(()=>S.rv.local.reviews[0]);assert.equal(review.origin.mode,'mock');
    await page.locator('[data-action="rv:review-copy"][data-kind="revised"]').click();
    await page.waitForFunction(()=>document.getElementById('rv-review-note')?.textContent==='已复制到剪贴板。');
    await page.locator('#rv-review-script').fill(review.ai_script+'（候选包编辑）');await page.locator('[data-action="rv:review-save"]').click();
    await page.waitForFunction(()=>S.rv.local.reviews[0]?.user_script?.endsWith('（候选包编辑）'));
    await page.screenshot({path:process.env.TEST_SCREENSHOT});
    const result=await page.evaluate(()=>({video_id:S.rv.local.record.id,segments:S.rv.local.record.raw_transcript.segments.length,asr:S.rv.local.record.raw_transcript.engine,review_mode:S.rv.local.reviews[0].origin.mode}));
    assert.equal(result.asr,'faster-whisper');assert.deepEqual(errors,[]);
    console.log(JSON.stringify({...result,window:'WebView2',challenge:true,import:true,timer:true,vault:true,page_errors:errors}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
