const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('C:/Users/husih/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const page = await browser.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let boundaries = 0;
    for (let chapter = 1; chapter <= 19; chapter++) {
      await page.goto(`http://127.0.0.1:8765/chapters/c${String(chapter).padStart(2,'0')}.html`);
      await page.evaluate(() => MathJax.startup.promise);
      await page.waitForFunction(() => document.querySelector('.ff-math-gap-before,.ff-math-gap-after'));
      boundaries += await page.locator('.ff-math-gap-before,.ff-math-gap-after').count();
      assert.equal(await page.locator('mjx-container[display="true"].ff-math-gap-before,mjx-container[display="true"].ff-math-gap-after').count(), 0);
      assert.equal(await page.locator('[data-mml-node="merror"]').count(), 0);
    }
    await page.goto('http://127.0.0.1:8765/chapters/c01.html');
    await page.evaluate(() => MathJax.startup.promise);
    await page.evaluate(() => {
      const sample = document.createElement('div'); sample.id = 'spacing-sample';
      sample.innerHTML = '<p>设 <span class="math" id="gap-han"><mjx-container>S</mjx-container></span> 为集合，<span class="math" id="gap-punctuation"><mjx-container>S</mjx-container></span>。</p><p><strong>设</strong><span class="math" id="gap-markup"><mjx-container>S</mjx-container></span><em>为</em>集合。</p><p>Let <span class="math" id="gap-english"><mjx-container>S</mjx-container></span> be a set.</p>';
      document.querySelector('.bd-article').append(sample);
    });
    await page.waitForFunction(() => document.getElementById('gap-han').classList.contains('ff-math-gap-after'));
    const read = id => page.locator('#'+id).evaluate(el => ({before:el.classList.contains('ff-math-gap-before'),after:el.classList.contains('ff-math-gap-after'),left:parseFloat(getComputedStyle(el).marginLeft),font:parseFloat(getComputedStyle(el).fontSize)}));
    let result = await read('gap-han'); assert.ok(result.before && result.after); assert.ok(Math.abs(result.left/result.font-.18)<.001);
    result = await read('gap-punctuation'); assert.ok(!result.before && !result.after);
    result = await read('gap-english'); assert.ok(!result.before && !result.after);
    result = await read('gap-markup'); assert.ok(result.before && result.after);
    assert.equal(await page.locator('#gap-han').evaluate(el => el.previousSibling.textContent.endsWith(' ') || el.nextSibling.textContent.startsWith(' ')), false);
    await page.locator('#spacing-sample').evaluate(el => el.remove());
    await page.locator('#c01-binary-operation .ff-present-button').click();
    await page.waitForFunction(() => document.querySelector('.ff-presentation-content .ff-math-gap-before'));
    await page.locator('.ff-presentation-size').fill('40');
    result = await page.locator('.ff-presentation-content .ff-math-gap-before').first().evaluate(el => ({left:parseFloat(getComputedStyle(el).marginLeft),font:parseFloat(getComputedStyle(el).fontSize)}));
    assert.ok(Math.abs(result.left/result.font-.18)<.001);
    await page.evaluate(() => document.documentElement.dataset.theme='dark');
    await page.screenshot({path:'_build/typography-presentation.png'});
    await page.locator('.ff-presentation-close').click();
    await page.locator('.quiz button[data-correct="yes"]').click();
    await page.waitForFunction(() => !document.querySelector('.quiz-feedback').textContent.includes('\\('));
    assert.equal(await page.locator('[data-mml-node="merror"]').count(), 0);
    assert.deepEqual(errors, []);
    fs.writeFileSync('_build/typography-validation.json',JSON.stringify({chapters:19,spacedMathElements:boundaries,gapEm:.18,punctuation:true,english:true,nestedMarkup:true,sourceWhitespaceNormalized:true,presentation:true,dynamicFeedback:true,errors},null,2));
    console.log(`Typography passed: 19 chapters, ${boundaries} spaced math elements, punctuation, English, markup, classroom scaling and live feedback.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
