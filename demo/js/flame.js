/* Soft SVG v2 from prototypes/flame-compass: 80% embers, 2.0x visual time.
 * Decorative only. No topic selection, business timing, audio or API access. */
'use strict';
const FlameCompass = (() => {
  const instances = new Map(), pending = new Map();
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let frame = 0, callbackId = 0, serial = 0;
  const moving = () => !document.hidden && !motion?.matches;
  function wake() { if (!frame && pending.size && moving()) frame = requestAnimationFrame(dispatch); }
  function dispatch(t) {
    frame = 0;
    const callbacks = [...pending.values()]; pending.clear();
    callbacks.forEach(fn => { try { fn(t); } catch (_) { /* A decorative frame cannot stop learning. */ } });
    wake();
  }
  const frames = {
    request(fn) { const id = ++callbackId; pending.set(id, fn); wake(); return id; },
    cancel(id) { pending.delete(id); if (!pending.size && frame) { cancelAnimationFrame(frame); frame = 0; } },
    state() { return {active:!!frame, queued:pending.size}; }
  };
  const anchors = [-52,-38,-24,-12,0,12,24,38,52].map(deg => ({deg,
    x:200+166*Math.sin(deg*Math.PI/180), y:200-166*Math.cos(deg*Math.PI/180)}));
  const paths = [
    'M0 3 C -10 -4, -12 -22, -6 -36 C -4 -46, -2 -52, 0 -62 C 2 -52, 4 -46, 6 -36 C 12 -22, 10 -4, 0 3 Z',
    'M0 2 C -6 -3, -8 -16, -4 -28 C -2 -36, -1 -40, 0 -47 C 1 -40, 2 -36, 4 -28 C 8 -16, 6 -3, 0 2 Z',
    'M0 1 C -3 -2, -4 -10, -2 -18 C -1 -23, 0 -26, 0 -31 C 0 -26, 1 -23, 2 -18 C 4 -10, 3 -2, 0 1 Z'
  ];
  function create(host) {
    const prefix = 'kc-fire-'+(++serial);
    const layer = document.createElement('div'); layer.className = 'kc-flame-layer';
    layer.setAttribute('aria-hidden','true');
    layer.innerHTML = `<div class="kc-flame-glow"></div><canvas></canvas>
      <svg class="kc-flame-svg" viewBox="0 0 400 400" aria-hidden="true"><defs>
      <linearGradient id="${prefix}-outer" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a1a10" stop-opacity=".55"/><stop offset=".45" stop-color="#e8402a" stop-opacity=".8"/><stop offset="1" stop-color="#ff7a3c" stop-opacity=".28"/></linearGradient>
      <linearGradient id="${prefix}-mid" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e8402a" stop-opacity=".85"/><stop offset=".6" stop-color="#ff8a42" stop-opacity=".85"/><stop offset="1" stop-color="#ffb347" stop-opacity=".38"/></linearGradient>
      <linearGradient id="${prefix}-core" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9a4d"/><stop offset=".55" stop-color="#ffcf8a"/><stop offset="1" stop-color="#fff3dc" stop-opacity=".75"/></linearGradient>
      <filter id="${prefix}-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6"/></filter></defs>
      <g filter="url(#${prefix}-soft)">${anchors.map(a => `<g transform="translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${a.deg}) scale(${(.62+.55*Math.cos(a.deg*Math.PI/62)).toFixed(2)})"><g class="kc-flame-tongue">${paths.map((d,i)=>`<path ${i===2?'class="kc-flame-core"':''} d="${d}" fill="url(#${prefix}-${['outer','mid','core'][i]})"/>`).join('')}</g></g>`).join('')}</g></svg>`;
    host.classList.add('kc-flame-host'); host.appendChild(layer);
    const tongues = [...layer.querySelectorAll('.kc-flame-tongue')];
    const cores = [...layer.querySelectorAll('.kc-flame-core')];
    const canvas = layer.querySelector('canvas');
    canvas.width = canvas.height = Math.min(800, Math.ceil((host.clientWidth || 230)*400/336*Math.min(window.devicePixelRatio || 1,2)));
    let ctx = null;
    try { ctx = canvas.getContext('2d'); ctx?.setTransform(canvas.width/400,0,0,canvas.height/400,0,0); } catch (_) {}
    const embers = [];
    let mode='idle', lvl=.25, target=.25, time=0, age=0, raf=0, last=0, disposed=false, locks=0, count=0;
    // Independent ember noise must never consume the topic picker’s Math.random sequence.
    let seed = 12345+serial;
    const random = () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
    function paint() {
      const t=time, breathe=1+.09*Math.sin(2*Math.PI*t/9);
      layer.style.setProperty('--lvl',lvl.toFixed(3));
      layer.style.setProperty('--breath',(.12*Math.sin(2*Math.PI*t/11)).toFixed(3));
      tongues.forEach((el,i) => {
        const a1=1.3+.5*((i*7)%3)/3, w1=2*Math.PI*(.5+.09*((i*5)%4)), p1=i*1.7;
        const w2=2*Math.PI*(1.35+.2*((i*3)%3)), p2=i*2.9;
        const ws=2*Math.PI/(5+2.5*(i%3)), ps=i*.9;
        const ws2=2*Math.PI/(2.3+.7*((i+2)%4)), ps2=i*1.3;
        const sway=a1*Math.sin(w1*t+p1)+.6*Math.sin(w2*t+p2);
        const drift=1.6*Math.sin(w1*t+p1), len=1+.10*Math.sin(ws*t+ps)+.05*Math.sin(ws2*t+ps2);
        el.style.transform=`translate(${drift.toFixed(2)}px,${(-2-5*lvl*len).toFixed(2)}px) rotate(${sway.toFixed(2)}deg) scale(${(.9+.18*lvl).toFixed(3)},${((.5+.62*lvl)*len).toFixed(3)})`;
        el.style.opacity=(.45+.5*Math.min(lvl,1))*breathe;
        const csway=.55*Math.sin(2*Math.PI*(.9+.15*((i*3)%3))*t+i*2.1);
        cores[i].style.transform=`rotate(${(-sway*.25+csway).toFixed(2)}deg) scale(${(1+.04*Math.sin(ws*t+ps+1)).toFixed(3)},${(.96+.08*lvl*len).toFixed(3)})`;
        cores[i].style.opacity=(.7+.3*Math.min(lvl,1)).toFixed(3);
      });
    }
    function particles(dt) {
      if (!ctx) return;
      const step=dt*2, rate=(.5+2.4*lvl)*.8;
      anchors.forEach(a => {
        if (embers.length>=26 || random()>=rate*step/9) return;
        const jitter=(random()-.5)*16, nx=Math.sin(a.deg*Math.PI/180), ny=-Math.cos(a.deg*Math.PI/180);
        embers.push({t:0,max:1.7+random()*1.1,x:a.x+jitter*ny,y:a.y-10-jitter*nx-random()*14,
          vx:(random()-.5)*6,vy:-(9+random()*8),size:1+random()*1.1,wob:random()*6.28});
      });
      ctx.clearRect(0,0,400,400);ctx.globalCompositeOperation='lighter';
      for(let i=embers.length-1;i>=0;i--){
        const p=embers[i];p.t+=step;if(p.t>=p.max){embers.splice(i,1);continue;}
        p.x+=(p.vx+Math.sin(p.t*2.2+p.wob)*7)*step;p.y+=p.vy*step;
        const u=p.t/p.max, color=u<.35?'255,220,170':u<.7?'255,170,90':'230,90,50';
        ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.4,p.size*(1-u*.5)),0,6.2832);
        ctx.fillStyle=`rgba(${color},${((1-u)*.75).toFixed(3)})`;ctx.fill();
      }
      ctx.globalCompositeOperation='source-over';
    }
    function loop(t) {
      raf=0;if(disposed || !moving())return;
      const dt=last?Math.min(.05,(t-last)/1000):0;last=t;
      if(mode==='locked'){
        age+=dt;if(age>=.34)target=.25;
        if(age>=.7){mode='idle';host.classList.remove('kc-flame-pulse');}
      }
      lvl+=(target-lvl)*Math.min(1,dt*4.5);if(Math.abs(target-lvl)<.004)lvl=target;
      time+=dt*2;count++;
      try {paint();particles(dt);raf=frames.request(loop);} catch (_) {controller.destroy();}
    }
    const controller = {
      host,
      start(){if(disposed)return;mode='drawing';age=0;target=.25;host.classList.remove('kc-flame-pulse');},
      setPhase(p){if(disposed || mode!=='drawing')return;p=Math.max(0,Math.min(1,p));target=.25+.85*Math.min(1,p*3)*(1-.5*(1-Math.pow(1-p,3)));},
      lock(){if(disposed || mode!=='drawing')return;age=0;locks++;if(!moving()){mode='idle';target=.25;return;}mode='locked';target=1.18;host.classList.add('kc-flame-pulse');},
      idle(){mode='idle';age=0;target=.25;host.classList.remove('kc-flame-pulse');},
      syncMotion(){
        if(disposed)return;host.dataset.flamePaused=String(!moving());last=0;
        if(!moving()){
          if(raf)frames.cancel(raf);raf=0;
          if(motion?.matches){lvl=.25;target=.25;embers.length=0;host.classList.remove('kc-flame-pulse');paint();particles(0);}
        }else if(!raf)raf=frames.request(loop);
      },
      destroy(){if(disposed)return;disposed=true;if(raf)frames.cancel(raf);raf=0;embers.length=0;layer.remove();host.classList.remove('kc-flame-host','kc-flame-pulse');},
      state(){return {mode,lvl,target,time,locks,embers:embers.length,frames:count,disposed,paused:!moving(),intensity:.8,speed:2};}
    };
    paint();controller.syncMotion();return controller;
  }
  function mountAll(root) {
    if(!root?.querySelectorAll)return;
    const keys=new Set();
    root.querySelectorAll('[data-flame-compass]').forEach(host => {
      const key=host.dataset.flameCompass;keys.add(key);
      const old=instances.get(key);
      // Keep the same decorative node through lock-card renders; do not restart the pulse.
      if(old && !old.state().disposed){if(host!==old.host)host.replaceWith(old.host);return;}
      try{instances.set(key,create(host));}catch(_){host.querySelector('.kc-flame-layer')?.remove();}
    });
    instances.forEach((value,key)=>{if(!keys.has(key)){value.destroy();instances.delete(key);}});
  }
  function sync() {
    if(!moving() && frame){cancelAnimationFrame(frame);frame=0;}
    instances.forEach(value=>value.syncMotion());wake();
  }
  function destroyAll(){instances.forEach(value=>value.destroy());instances.clear();}
  document.addEventListener?.('visibilitychange',sync);
  motion?.addEventListener?.('change',sync);
  window.addEventListener?.('pagehide',()=>{destroyAll();pending.clear();if(frame)cancelAnimationFrame(frame);frame=0;});
  return {mountAll,destroyAll,frames,get:key=>instances.get(key),state:()=>({instances:instances.size,...frames.state()})};
})();
