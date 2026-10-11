const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/husih/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const out='finite-fields-book/_build/proof-theme-check';fs.mkdirSync(out,{recursive:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[],report=[];page.on('pageerror',e=>errors.push(e.message));
 for(const system of ['light','dark']){
  await page.emulateMedia({colorScheme:system});
  for(let i=1;i<=19;i++){
   const chapter='c'+String(i).padStart(2,'0');await page.goto(`http://127.0.0.1:8765/chapters/${chapter}.html`);await page.evaluate(()=>window.MathJax.startup.promise);
   for(const theme of ['light','dark']){
    await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;},theme);
    const result=await page.evaluate(()=>{
     function rgb(value){return value.match(/[\d.]+/g)?.slice(0,3).map(Number);}
     function lum(v){return v.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);}
     function background(el){while(el){const c=getComputedStyle(el).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent'){const values=c.match(/[\d.]+/g)?.map(Number);if(values?.length===3||values?.[3]===1)return values.slice(0,3);}el=el.parentElement;}return document.documentElement.dataset.theme==='dark'?[18,18,18]:[255,255,255];}
     const failures=[],ratios=[];for(const el of document.querySelectorAll('.admonition:not(.reading-note) p:not(.admonition-title), .admonition:not(.reading-note) mjx-container, .admonition:not(.reading-note) a')){
      if(el.closest('.reading-note')||!el.textContent.trim()&&el.tagName!=='MJX-CONTAINER')continue;const fg=rgb(getComputedStyle(el).color),bg=background(el);if(!fg)continue;const l1=lum(fg),l2=lum(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);ratios.push(ratio);if(ratio<4.5)failures.push({text:el.textContent.slice(0,80),color:fg,background:bg,ratio});
     }return {checked:ratios.length,min:Math.min(...ratios),failures};
    });assert.deepEqual(result.failures,[],`${chapter}, system ${system}, theme ${theme}`);report.push({chapter,system,theme,...result});
   }
  }
 }
 await page.goto('http://127.0.0.1:8765/chapters/c09.html');await page.evaluate(()=>window.MathJax.startup.promise);const frame=page.locator('#c09-statement-004');
 const proof=frame.locator('.admonition:not(.reading-note)').first();if(await proof.evaluate(e=>e.classList.contains('toggle-hidden')))await proof.locator('.admonition-title').click();
 for(const theme of ['light','dark']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await frame.screenshot({path:out+'/tower-'+theme+'.png'});assert.ok(await proof.locator('mjx-container').count());}
 await page.setViewportSize({width:390,height:844});await frame.screenshot({path:out+'/tower-dark-mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/validation.json',JSON.stringify({date:'2026-10-11',pages:report,errors,mobile:true},null,2));console.log('Proof contrast passed: 19 chapters, both themes under both system color schemes; body text, formulas and links >= 4.5:1.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
