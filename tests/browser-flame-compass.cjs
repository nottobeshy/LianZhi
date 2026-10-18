'use strict';
// Read-only acceptance against the formal frontend; never invokes an AI or save endpoint.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:8000';
const out=process.env.TEST_OUTPUT_DIR || '.test-runtime/flame-integration/browser';
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.LIANZHI_BROWSER_EXECUTABLE?{executablePath:process.env.LIANZHI_BROWSER_EXECUTABLE}:{})});
  const errors=[],consoleErrors=[],writes=[],evidence={viewports:[],draws:[]};
  async function open(options={}){
    const page=await browser.newPage({viewport:{width:1366,height:900},...options});
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/**',route=>{
      if(!['GET','HEAD'].includes(route.request().method())){writes.push(route.request().method()+' '+new URL(route.request().url()).pathname);return route.abort();}
      return route.continue();
    });
    await page.addInitScript(()=>{
      const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
      const pending=new Set();window.frameProbe={pending,max:0};
      window.requestAnimationFrame=fn=>{
        // Playwright's waitForFunction also uses RAF; count only application animation calls.
        const tracked=/\/js\/(flame|compass)\.js/.test(new Error().stack);
        let id=request(t=>{pending.delete(id);fn(t);});
        if(tracked){pending.add(id);window.frameProbe.max=Math.max(window.frameProbe.max,pending.size);}return id;
      };
      window.cancelAnimationFrame=id=>{pending.delete(id);cancel(id);};
    });
    return page;
  }
  const page=await open();
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
  const nav=async view=>page.locator(`[data-action="nav"][data-view="${view}"]`).first().click();
  const fire=()=>page.evaluate(()=>FlameCompass.get('draw')?.state());
  try{
    await page.goto(base);await page.waitForFunction(()=>typeof FlameCompass!=='undefined' && FlameCompass.get('home'));
    for(const width of [375,768,1366,1920]){
      await page.setViewportSize({width,height:900});await page.waitForTimeout(160);
      const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,layers:document.querySelectorAll('.kc-flame-layer').length,tongues:document.querySelectorAll('.kc-flame-tongue').length,clicks:getComputedStyle(document.querySelector('.kc-flame-layer')).pointerEvents}));
      assert.ok(layout.scroll<=width,JSON.stringify(layout));assert.equal(layout.layers,1);assert.equal(layout.tongues,9);assert.equal(layout.clicks,'none');
      evidence.viewports.push(layout);await page.screenshot({path:path.join(out,`home-${width}.png`),fullPage:true});
    }
    await page.setViewportSize({width:1366,height:900});
    await page.evaluate(()=>{window.audioProbe={tick:0,lock:0};for(const key of ['tick','lock']){const original=SoundFx[key];SoundFx[key]=(...args)=>{audioProbe[key]++;return original(...args);};}});
    await nav('challenge');
    for(let i=0;i<10;i++){
      if(i)await page.locator('[data-action="ch:redraw"]').click();
      else await page.locator('[data-action="ch:draw"]').click();
      const selected=await page.evaluate(()=>{window.drawHost=FlameCompass.get('draw').host;return S.ch.locked;});
      if(i===0){
        await page.waitForTimeout(1700);const rising=await fire();assert.ok(rising.lvl>.65);
        assert.equal(await page.evaluate(()=>frameProbe.pending.size),1);
        assert.equal(await page.evaluate(()=>FlameCompass.state().queued),2);
        await page.waitForTimeout(2700);const settling=await fire();assert.ok(settling.target<rising.target);evidence.ramp={rising,settling};
        await page.screenshot({path:path.join(out,'drawing-1366.png')});
      }
      await page.waitForFunction(()=>S.ch.drawDone,{},{timeout:9000});
      await page.waitForTimeout(650);
      const result=await page.evaluate(()=>({winner:S.ch.locked,fire:FlameCompass.get('draw').state(),sameHost:drawHost===FlameCompass.get('draw').host,active:DRAW_ACTIVE.size,audio:{...audioProbe}}));
      assert.equal(result.winner,selected);assert.equal(result.fire.mode,'idle');assert.equal(result.fire.target,.25);assert.equal(result.fire.locks,i+1);assert.ok(result.sameHost);assert.equal(result.active,0);assert.equal(result.audio.lock,i+1);
      evidence.draws.push({iteration:i+1,locks:result.fire.locks,ticks:result.audio.tick});console.log(`natural draw ${i+1}/10: PASS`);
    }
    for(const width of [375,768,1366,1920]){
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:path.join(out,`locked-${width}.png`),fullPage:true});
    }
    // Skip twice in one event turn must retain exactly one result and one Lock.
    await page.locator('[data-action="ch:redraw"]').click();
    await page.setViewportSize({width:375,height:900});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:path.join(out,'drawing-375.png'),fullPage:true});
    await page.evaluate(()=>{const stage=document.getElementById('draw-stage');stage.click();stage.click();});
    await page.waitForFunction(()=>S.ch.drawDone);await page.waitForTimeout(800);
    assert.equal((await fire()).locks,11);assert.equal(await page.evaluate(()=>audioProbe.lock),11);
    // Leaving a running draw must cancel timers and both visual callbacks.
    await page.locator('[data-action="ch:redraw"]').click();await page.waitForTimeout(100);await nav('settings');
    await page.waitForTimeout(600);
    assert.deepEqual(await page.evaluate(()=>FlameCompass.state()),{instances:0,active:false,queued:0});
    assert.equal(await page.evaluate(()=>DRAW_ACTIVE.size),0);assert.equal(await page.evaluate(()=>audioProbe.lock),11);
    // Navigation/re-render must never duplicate decorative nodes.
    await nav('home');await page.evaluate(()=>{render();render();});
    assert.equal(await page.locator('.kc-flame-layer').count(),1);
    // Synthetic document visibility: exercises the real listener, not an OS background-tab claim.
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
    const paused=await page.evaluate(()=>FlameCompass.get('home').state());await page.waitForTimeout(180);
    assert.equal(await page.evaluate(()=>FlameCompass.get('home').state().frames),paused.frames);
    assert.equal(await page.evaluate(()=>FlameCompass.state().active),false);
    assert.equal(await page.locator('.kc-needle').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>FlameCompass.state().active));
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(80);
    assert.equal(await page.evaluate(()=>FlameCompass.state().active),false);
    await nav('challenge');await page.locator('[data-action="ch:back-config"]').click();await page.locator('[data-action="ch:draw"]').click();
    await page.waitForFunction(()=>S.ch.drawDone);assert.equal((await fire()).mode,'idle');assert.equal((await fire()).lvl,.25);assert.equal((await fire()).locks,1);
    assert.equal(await page.evaluate(()=>frameProbe.pending.size),0);
    await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(100);
    assert.equal(await page.evaluate(()=>frameProbe.pending.size),1);
    evidence.maxNativeFrames=await page.evaluate(()=>frameProbe.max);assert.equal(evidence.maxNativeFrames,1);
    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
    assert.deepEqual(await page.evaluate(()=>FlameCompass.state()),{instances:0,active:false,queued:0});
    await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
    assert.equal(await page.locator('.kc-flame-layer').count(),1);
    assert.equal(await page.evaluate(()=>FlameCompass.state().active),true);
    const fallback=await open();await fallback.route('**/js/flame.js',route=>route.abort());await fallback.goto(base);
    await fallback.locator('[data-action="nav"][data-view="challenge"]').first().click();await fallback.locator('[data-action="ch:draw"]').click();
    await fallback.locator('#draw-stage').click();await fallback.waitForFunction(()=>S.ch.drawDone);assert.ok(await fallback.evaluate(()=>!!Store.getChItem()));await fallback.close();
    assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(writes,[]);
    Object.assign(evidence,{page_errors:errors,console_errors:consoleErrors,api_writes:writes,skip:true,cancel:true,reducedMotion:true,syntheticVisibility:true,pagehide:true,syntheticBfcacheRestore:true,moduleMissingFallback:true});
    fs.writeFileSync(path.join(out,'evidence.json'),JSON.stringify(evidence,null,2));console.log('flame lifecycle / four viewports / audio callbacks / fallback: PASS');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
