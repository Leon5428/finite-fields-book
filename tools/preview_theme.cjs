const fs=require('node:fs');const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/husih/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),out='finite-fields-book/_build/theme-check';fs.mkdirSync(out,{recursive:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 for(const [path,selector] of [['chapters/c01','.cyclic-widget'],['chapters/c04','#c04-statement-007'],['chapters/c09','#c09-statement-004'],['chapters/c10','.lesson-widget'],['chapters/c13','.lesson-widget'],['chapters/c16','.ff-widget'],['chapters/c17','.lesson-widget'],['knowledge','#kg-study']]){
  await page.goto(`http://127.0.0.1:8765/${path}.html${path==='knowledge'?'#view=study':''}`);await page.evaluate(async()=>{if(window.MathJax?.startup?.promise)await window.MathJax.startup.promise;document.documentElement.dataset.theme='dark';document.querySelectorAll('.toggle-hidden').forEach(e=>e.classList.remove('toggle-hidden'));});
  const target=page.locator(selector).first();await target.screenshot({path:out+'/'+path.replaceAll('/','-')+'-dark.png'});
  await page.setViewportSize({width:390,height:844});await page.reload();await page.evaluate(async()=>{document.documentElement.dataset.theme='dark';document.querySelectorAll('.toggle-hidden').forEach(e=>e.classList.remove('toggle-hidden'));if(window.MathJax?.startup?.promise)await window.MathJax.startup.promise;});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,path+' mobile overflow');await target.screenshot({path:out+'/'+path.replaceAll('/','-')+'-dark-mobile.png'});await page.setViewportSize({width:1280,height:900});
 }
 console.log('Dark desktop and mobile views captured; no mobile document overflow.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
