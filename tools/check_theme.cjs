const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/husih/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
function auditContrast(){
 const rgb=s=>{const v=s.match(/[\d.]+/g)?.map(Number);return v?[...v.slice(0,3),v.length>3?v[3]:1]:[0,0,0,0];};
 const blend=(a,b)=>[0,1,2].map(i=>a[i]*a[3]+b[i]*(1-a[3]));
 const luminance=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((r,v,i)=>r+v*[.2126,.7152,.0722][i],0);
 function background(el){const layers=[];for(let a=el;a;a=a.parentElement)layers.push(rgb(getComputedStyle(a).backgroundColor));let color=[255,255,255];for(const c of layers.reverse())color=blend(c,color);return color;}
 function svgBackground(el){const group=el.closest('.kg-svg-node,.subfield-node');const rect=group?.querySelector('rect')||el.previousElementSibling?.matches('circle')&&el.previousElementSibling||el.closest('svg')?.querySelector('rect');return rect?blend(rgb(getComputedStyle(rect).fill),background(el)):background(el);}
 const failures=[],groups={},seen=new Set();let checked=0,min=Infinity;
 function check(el,text,kind='text',pseudo){if(!el.getClientRects().length||el.closest('[hidden],.toggle-hidden')||getComputedStyle(el).visibility==='hidden'||el.disabled)return;const s=getComputedStyle(el,pseudo);if(s.opacity==='0')return;const svg=el instanceof SVGElement;const bg=svg?svgBackground(el):background(el);const foreground=blend(rgb(svg?s.fill:s.color),bg),a=luminance(foreground),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);checked++;min=Math.min(min,ratio);if(ratio<4.5){const id=[el.tagName,el.className?.baseVal??el.className,s.color,bg.join(',')].join(':');groups[id]=(groups[id]||0)+1;if(!seen.has(id)){seen.add(id);failures.push({kind,text:text.slice(0,85),tag:el.tagName,class:el.className?.baseVal??el.className,color:s.color,fill:svg?s.fill:undefined,background:bg,ratio});}}}
 const root=document.querySelector('article');const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walk.nextNode()){const node=walk.currentNode,el=node.parentElement;if(node.textContent.trim()&&!el.closest('script,style,option,mjx-container,svg title,svg desc'))check(el,node.textContent.trim());}
 for(const e of root.querySelectorAll('mjx-container'))check(e,'数学公式','formula');
 for(const e of root.querySelectorAll('input:not([type=checkbox]):not([type=file]),select,textarea')){check(e,e.value||e.placeholder||'输入控件','control');if(e.placeholder&&!e.value)check(e,e.placeholder,'placeholder','::placeholder');}
 for(const e of root.querySelectorAll('.source-line'))if(getComputedStyle(e,'::before').display!=='none')check(e,'段落编号','pseudo','::before');
 for(const e of root.querySelectorAll('.reading-note li'))check(e,'注释列表标记','marker','::marker');
 return {checked,min,failures,groups};
}
module.exports={auditContrast};
if(require.main===module)(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),out='finite-fields-book/_build/theme-check';fs.mkdirSync(out,{recursive:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[],report=[];page.on('pageerror',e=>errors.push(e.message));
 const paths=['intro',...Array.from({length:19},(_,i)=>'chapters/c'+String(i+1).padStart(2,'0')),'appendices/source','appendices/algorithms','appendices/experiments','appendices/references','knowledge'];
 for(const system of ['light','dark']){
  await page.emulateMedia({colorScheme:system});
  for(const path of paths){
   await page.goto(`http://127.0.0.1:8765/${path}.html`);await page.evaluate(async()=>{if(window.MathJax?.startup?.promise)await window.MathJax.startup.promise;document.querySelectorAll('.toggle-hidden').forEach(e=>e.classList.remove('toggle-hidden'));document.querySelectorAll('details').forEach(e=>e.open=true);});
   for(const theme of ['dark','light']){
    await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);const result=await page.evaluate(auditContrast);report.push({path,system,theme,...result});if(result.failures.length)console.log(path+' '+system+'/'+theme+' '+JSON.stringify(result.failures));
   }
   if(path.startsWith('chapters/')){
    await page.evaluate(()=>{document.querySelector('.quiz [data-correct="yes"]')?.click();});await page.evaluate(()=>window.MathJax?.startup?.promise);
    for(const theme of ['dark','light']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);report.push({path:path+'/quiz-answer',system,theme,...await page.evaluate(auditContrast)});}
    const input=page.locator('.lesson-controls input').first();if(await input.count()){
     const saved=await input.inputValue();await input.fill('');
     for(const theme of ['dark','light']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);report.push({path:path+'/input-error',system,theme,...await page.evaluate(auditContrast)});}
     await input.fill(saved);
    }
    if(path==='chapters/c10'){
     await page.locator('.subfield-node[data-degree="2"]').click();
     for(const theme of ['dark','light']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);report.push({path:path+'/selected-subfield',system,theme,...await page.evaluate(auditContrast)});}
    }
    if(path==='chapters/c01'){
     await page.locator('.square-symmetry [data-step="s"]').click();await page.waitForFunction(()=>document.querySelector('.square-symmetry').getAttribute('aria-busy')==='false');
     for(const theme of ['dark','light']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);report.push({path:path+'/reflection',system,theme,...await page.evaluate(auditContrast)});}
    }
   }
   if(path==='knowledge'){
    // Use only the isolated test browser's local records, never the reader's profile.
    await page.evaluate(()=>{const records={};for(const [id,status,difficulty] of [['group','mastered','none'],['cyclic','learning','none'],['trace','learning','proof'],['primitive','read','none']])records[id]={status,difficulty,note:'待复习的证明思路。',updated:'2026-10-11T00:00:00.000Z',reviewed:''};localStorage.setItem('finitefields:learning:v1',JSON.stringify({version:1,book:'finite-fields',records}));});
    await page.reload();await page.evaluate(()=>{location.hash='node=trace'});await page.waitForSelector('#kg-detail mjx-container');
    for(const theme of ['dark','light']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);report.push({path:'knowledge/node-trace',system,theme,...await page.evaluate(auditContrast)});}
    await page.locator('#kg-study-tab').click();
    for(const theme of ['dark','light']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);report.push({path:'knowledge/study',system,theme,...await page.evaluate(auditContrast)});}
   }
  }
 }
 fs.writeFileSync(out+'/validation.json',JSON.stringify({date:'2026-10-11',pages:report,errors},null,2));const failed=report.filter(r=>r.failures.length);console.log(`Checked ${report.length} page/theme/state combinations; ${failed.length} with low contrast.`);for(const r of failed)console.log(r.path+' '+r.system+'/'+r.theme+' '+JSON.stringify(r.failures));if(process.env.THEME_AUDIT_ONLY!=='1'){assert.deepEqual(failed,[]);assert.deepEqual(errors,[]);}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
