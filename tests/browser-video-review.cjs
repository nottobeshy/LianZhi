'use strict';
// Explicit opt-in; a live request additionally needs a persistent budget file and authorization flag.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {chromium}=require('playwright');

function reserveLiveAttempt(videoId) {
  assert.equal(process.env.LIANZHI_ALLOW_LIVE_REVIEW,'1','Live verification is not enabled');
  const path=process.env.LIANZHI_LIVE_REVIEW_BUDGET;
  assert.ok(path,'Persistent live budget required');
  const lock=fs.openSync(path+'.lock','wx');
  try {
    const budget=JSON.parse(fs.readFileSync(path,'utf8'));
    assert.ok(Number.isInteger(budget.attempts) && budget.attempts>=1 && budget.limit===3 && budget.attempts<budget.limit);
    budget.attempts++;
    (budget.reservations ||= []).push({video_id:videoId,at:new Date().toISOString(),purpose:'video review acceptance'});
    fs.writeFileSync(path,JSON.stringify(budget,null,2));
  } finally {fs.closeSync(lock);fs.unlinkSync(path+'.lock');}
}

(async()=>{
  const base=process.env.TEST_BASE_URL;
  assert.ok(base && process.env.LIANZHI_ASR_TEST_VIDEO);
  const browser=await chromium.launch({headless:true,...(process.env.LIANZHI_BROWSER_EXECUTABLE?{executablePath:process.env.LIANZHI_BROWSER_EXECUTABLE}:{})});
  const errors=[];
  try {
    const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.name));
    await page.goto(base);
    await page.locator('[data-action="nav"][data-view="review"]').first().click();
    if(process.env.TEST_READ_ONLY==='1') {
      await page.locator('[data-action="rv:local-open"][data-id="'+process.env.TEST_VIDEO_ID+'"]').click();
      await page.locator('#rv-review-original').waitFor();
      const record=await page.evaluate(()=>S.rv.local.reviews.find(r=>r.id===S.rv.local.reviewSelected));
      assert.equal(record.state,'succeeded');assert.ok(record.user_script.endsWith('（用户编辑测试）'));
      assert.equal(record.stale,process.env.TEST_STALE_SOURCE==='1');
      assert.deepEqual(errors,[]);
      console.log(JSON.stringify({id:process.env.TEST_VIDEO_ID,restarted_read:true,stale:record.stale,page_errors:errors}));
      return;
    }
    if(process.env.TEST_EXISTING_VIDEO_ID) {
      await page.locator('[data-action="rv:local-open"][data-id="'+process.env.TEST_EXISTING_VIDEO_ID+'"]').click();
    } else {
      await page.locator('#review-video-file').setInputFiles(process.env.LIANZHI_ASR_TEST_VIDEO);
      await page.locator('[data-action="rv:local-start"]').click();
    }
    await page.locator('#segin-0').waitFor({timeout:180000});
    const video=await page.evaluate(()=>S.rv.local.record);
    assert.ok(video.raw_transcript.segments.some(s=>/[\u4e00-\u9fff]/.test(s.text)));
    assert.ok(await page.locator('#rv-ai-review-btn').isDisabled());
    if(!process.env.TEST_EXISTING_VIDEO_ID) {
      const firstSegment=await page.locator('#segin-0').inputValue();
      await page.locator('#segin-0').fill(firstSegment.trim().replace(/[。！？]$/,'')+'。');
      await page.locator('[data-action="rv:local-confirm"]').click();
      await page.waitForFunction(()=>!S.rv.local.busy && !!S.rv.local.record.confirmed_version_id);
    }
    assert.ok(await page.locator('#rv-ai-review-btn').isDisabled());
    await page.locator('#rv-review-consent').check();
    const status=await page.evaluate(()=>S.backend.llm);
    assert.equal(status.mode,process.env.TEST_EXPECT_MODE || 'mock');
    if(status.mode==='live') {
      assert.ok(status.configured);
      reserveLiveAttempt(video.id);
    }
    const responsePromise=page.waitForResponse(r=>r.url()===base+'/api/videos/'+video.id+'/review' && r.request().method()==='POST',{timeout:70000});
    await page.locator('[data-action="rv:ai-review"]').click();
    const response=await responsePromise;
    if(response.status()!==200) {
      const failed=await response.json();throw new Error('REVIEW_HTTP_'+response.status()+'_'+failed.error?.code);
    }
    await page.locator('#rv-review-original').waitFor();
    const review=await page.evaluate(()=>S.rv.local.reviews.find(r=>r.id===S.rv.local.reviewSelected));
    assert.equal(review.origin.mode,status.mode);
    assert.equal(review.original_script,await page.locator('#rv-review-original').inputValue());
    assert.equal(review.ai_script,await page.locator('#rv-review-script').inputValue());
    assert.equal(review.original_script,await page.evaluate(()=>S.rv.local.record.versions.find(v=>v.version_id===S.rv.local.record.confirmed_version_id).segments.map(s=>s.text).join('\n')));
    await page.locator('[data-action="rv:review-copy"][data-kind="revised"]').click();
    await page.waitForFunction(()=>document.getElementById('rv-review-note')?.textContent==='已复制到剪贴板。');
    assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n'),review.ai_script);
    await page.locator('#rv-review-script').fill(review.ai_script+'（用户编辑测试）');
    await page.locator('[data-action="rv:review-save"]').click();
    await page.waitForFunction(()=>!S.rv.local.reviewBusy && !!S.rv.local.reviews[0]?.user_script);
    if(process.env.TEST_STALE_SOURCE==='1') {
      await page.locator('#segin-0').fill((await page.locator('#segin-0').inputValue())+'（新版本测试）');
      assert.ok((await page.locator('#rv-ai-review-status').innerText()).includes('已过期'));
      await page.locator('[data-action="rv:local-confirm"]').click();
      await page.waitForFunction(()=>!S.rv.local.busy && S.rv.local.reviews[0]?.stale);
    }
    const current=await page.evaluate(()=>S.rv.local.record);
    assert.deepEqual(current.raw_transcript,video.raw_transcript);
    const stored=await page.evaluate(()=>S.rv.local.reviews[0]);
    assert.equal(stored.ai_script,review.ai_script);
    assert.ok(stored.user_script.endsWith('（用户编辑测试）'));
    await page.reload();
    await page.locator('[data-action="nav"][data-view="review"]').first().click();
    await page.locator('[data-action="rv:local-open"][data-id="'+video.id+'"]').click();
    await page.locator('#rv-review-original').waitFor();
    assert.equal(await page.locator('#rv-review-script').inputValue(),stored.user_script);
    if(process.env.TEST_REVIEW_SCREENSHOT)await page.screenshot({path:process.env.TEST_REVIEW_SCREENSHOT,fullPage:true});
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({id:video.id,review_id:review.id,mode:review.origin.mode,model:review.origin.model,
      prompt_version:review.prompt_version,segments:video.raw_transcript.segments.length,duration:video.raw_transcript.duration,
      revised_characters:review.ai_script.length,summary_count:review.change_summary.length,needs_verification:review.needs_verification.length,
      copied:true,user_edit_saved:true,raw_preserved:true,reloaded:true,stale:stored.stale,page_errors:errors,
      source_sha256:video.raw_transcript.source_sha256,
      original_sha256:crypto.createHash('sha256').update(review.original_script).digest('hex')}));
  } finally {await browser.close();}
})().catch(error=>{
  const safeCode=/^REVIEW_HTTP_\d+_[A-Z_]+$/.test(error.message)?error.message:error.name;
  console.error('Browser review verification failed: '+safeCode+' '+(error.stack?.split('\n').find(line=>line.includes('browser-video-review.cjs:')) || ''));
  process.exitCode=1;
});
