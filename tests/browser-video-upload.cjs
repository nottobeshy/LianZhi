'use strict';
// Opt-in real Chromium + formal UI + local ASR. Only aggregate evidence is printed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('playwright');

(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.LIANZHI_BROWSER_EXECUTABLE
    ? {executablePath:process.env.LIANZHI_BROWSER_EXECUTABLE} : {})});
  try {
    const page = await browser.newPage();
    const errors = [], network = [];
    page.on('pageerror', error => errors.push(error.name));
    page.on('response', response => {
      const request = response.request();
      if (request.method() === 'POST' && request.url().endsWith('/api/videos')) {
        network.push({method:request.method(), path:'/api/videos', status:response.status(),
          content_type:request.headers()['content-type'], content_length:request.headers()['content-length'] || null});
      }
    });
    await page.goto(process.env.TEST_BASE_URL);
    await page.locator('[data-action="nav"][data-view="review"]').first().click();
    await page.locator('#review-video-file').waitFor();
    if (process.env.TEST_READ_ONLY === '1') {
      await page.locator('[data-action="rv:local-open"][data-id="'+process.env.TEST_VIDEO_ID+'"]').click();
      await page.locator('#segin-0').waitFor();
      assert.ok((await page.locator('#segin-0').inputValue()).endsWith('（浏览器校对）'));
      assert.ok(await page.locator('#rv-transcript-status').innerText().then(text => text.includes('已确认')));
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({browser:browser.version(), restarted_read:true}));
      return;
    }
    await page.locator('#review-video-file').setInputFiles({name:'invalid.mp4',mimeType:'video/mp4',buffer:Buffer.alloc(131072)});
    await page.locator('[data-action="rv:local-start"]').click();
    await page.locator('[role="alert"]').waitFor();
    assert.ok((await page.locator('[role="alert"]').innerText()).includes('MP4'));
    await page.locator('#review-video-file').setInputFiles(process.env.TEST_SILENCE_VIDEO);
    await page.locator('[data-action="rv:local-start"]').click();
    await page.waitForFunction(() => S.rv.local.record?.state === 'failed', null, {timeout:180000});
    assert.ok((await page.locator('[role="alert"]').innerText()).includes('NO_SPEECH'));
    await page.locator('#review-video-file').setInputFiles(process.env.LIANZHI_ASR_TEST_VIDEO);
    await page.locator('[data-action="rv:local-start"]').click();
    await page.locator('#segin-0').waitFor({timeout:180000});
    const raw = await page.evaluate(() => S.rv.local.record.raw_transcript);
    assert.ok(raw.segments.some(segment => /[\u4e00-\u9fff]/.test(segment.text)));
    assert.ok(raw.segments.every(segment => segment.start >= 0 && segment.end > segment.start && segment.end <= raw.duration));
    const videoId = await page.evaluate(() => S.rv.local.record.id);
    await page.locator('#segin-0').fill((await page.locator('#segin-0').inputValue())+'（浏览器校对）');
    await page.locator('[data-action="rv:local-save"]').click();
    await page.waitForFunction(() => !S.rv.local.busy && !S.rv.local.dirty);
    await page.locator('[data-action="rv:local-confirm"]').click();
    await page.waitForFunction(() => !S.rv.local.busy && !!S.rv.local.record.confirmed_version_id);
    assert.deepEqual(await page.evaluate(() => S.rv.local.record.raw_transcript), raw);
    const saved = await page.evaluate(() => S.rv.local.record);
    assert.equal(saved.versions.length, 1);
    await page.reload();
    await page.locator('[data-action="nav"][data-view="review"]').first().click();
    await page.locator('[data-action="rv:local-open"][data-id="'+videoId+'"]').click();
    await page.locator('#segin-0').waitFor();
    assert.deepEqual(await page.evaluate(() => S.rv.local.record), saved);
    await page.screenshot({path:process.env.TEST_BROWSER_SCREENSHOT,fullPage:true});
    assert.deepEqual(errors, []);
    const requests = network;
    assert.equal(requests.length, 3);
    assert.equal(requests[0].status, 422);
    assert.equal(requests[1].status, 201);
    assert.equal(requests[2].status, 201);
    assert.equal(requests[2].content_type, 'video/mp4');
    assert.equal(saved.size, fs.statSync(process.env.LIANZHI_ASR_TEST_VIDEO).size);
    console.log(JSON.stringify({id:videoId,browser:browser.version(),network:requests,segments:raw.segments.length,
      file_bytes:fs.statSync(process.env.LIANZHI_ASR_TEST_VIDEO).size,received_bytes:saved.size,
      body_measurement:'server stream counter; raw body has no multipart overhead',
      duration:raw.duration,asr_seconds:raw.elapsed_seconds,peak_rss_mib:raw.peak_process_rss_mib,
      raw_preserved:true,confirmed:true,reloaded:true,silence_error_visible:true,page_errors:errors}));
  } finally { await browser.close(); }
})().catch(error => {
  console.error('Real browser video verification failed: '+error.name+' '+
    (error.stack?.split('\n').find(line => line.includes('browser-video-upload.cjs:')) || ''));
  process.exitCode=1;
});
