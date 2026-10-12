const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('C:/Users/husih/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  try {
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    let cases = 0;
    for (const theme of ['light', 'dark']) for (let chapter = 1; chapter <= 19; chapter++) {
      await page.goto(`http://127.0.0.1:8765/chapters/c${String(chapter).padStart(2, '0')}.html`);
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      await page.waitForFunction(() => window.MathJax?.startup?.document);
      await page.evaluate(() => MathJax.startup.promise);
      const button = page.locator('.statement-box .ff-frame-heading > .ff-present-button').first();
      const original = await button.evaluate(el => {const frame = el.closest('.statement-box'); return {id: frame.id, text: frame.textContent, parent: frame.parentElement.id};});
      assert.equal(await page.locator('.reading-note .ff-present-button,.chapter-remark .ff-present-button').count(), 0);
      const alignment = await button.evaluate(el => {const heading = el.parentElement.getBoundingClientRect(), button = el.getBoundingClientRect(); return button.top >= heading.top - 1 && button.bottom <= heading.bottom + 1;});
      assert.equal(alignment, true);
      await button.click();
      assert.equal(await page.locator('.ff-presentation').evaluate(el => el.matches(':modal')), true);
      assert.equal(await page.locator('.ff-presentation-content > .statement-box').getAttribute('id'), original.id);
      assert.equal(await page.locator('.ff-presentation-content > .statement-box').textContent(), original.text);
      assert.equal(await page.evaluate(() => {const ids = [...document.querySelectorAll('[id]')].map(el => el.id); return ids.length === new Set(ids).size;}), true);
      await page.locator('.ff-presentation-size').fill('40');
      assert.equal(await page.locator('.ff-presentation-content').evaluate(el => getComputedStyle(el).fontSize), '40px');
      await page.locator('.ff-presentation-notes').check();
      await page.locator('.ff-presentation-next').click();
      assert.notEqual(await page.locator('.ff-presentation-content > *').getAttribute('id'), original.id);
      assert.equal(await page.locator('.ff-presentation-size').inputValue(), '40');
      assert.equal(await page.locator('.ff-presentation-notes').isChecked(), true);
      await page.locator('.ff-presentation-prev').click();
      assert.equal(await page.locator('.ff-presentation-content > *').getAttribute('id'), original.id);
      await page.locator('.ff-presentation-close').focus(); await page.keyboard.press('-');
      assert.equal(await page.locator('.ff-presentation-size').inputValue(), '38');
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('.ff-presentation').open);
      assert.equal(await page.locator(`#${original.id}`).evaluate(el => el.parentElement.id), original.parent);
      assert.equal(await page.evaluate(() => document.activeElement.className), 'ff-present-button');
      cases++;
    }
    await page.goto('http://127.0.0.1:8765/chapters/c01.html');
    await page.evaluate(() => MathJax.startup.promise);
    const definition = page.locator('#c01-binary-operation');
    const svgCount = await definition.locator('mjx-container svg').count(); assert.ok(svgCount);
    await page.setViewportSize({width:1280,height:900});
    await definition.scrollIntoViewIfNeeded();
    await page.screenshot({path:'_build/presentation-inline-heading.png'});
    await definition.locator('.ff-frame-heading > .ff-present-button').click();
    assert.equal(await page.locator('.ff-presentation-prev').isDisabled(), true);
    assert.equal(await page.locator('.ff-presentation-content mjx-container svg').count(), svgCount);
    assert.equal(await page.locator('.ff-presentation-content .reading-note').first().isVisible(), false);
    await page.locator('.ff-presentation-notes').check();
    assert.equal(await page.locator('.ff-presentation-content .reading-note').first().isVisible(), true);
    if (await page.evaluate(() => document.fullscreenEnabled)) {
      await page.locator('.ff-presentation-fullscreen').click();
      await page.waitForFunction(() => document.fullscreenElement === document.documentElement || document.querySelector('.ff-presentation-status').textContent);
      if (await page.evaluate(() => Boolean(document.fullscreenElement))) {
        await page.locator('.ff-presentation-fullscreen').click();
        await page.waitForFunction(() => !document.fullscreenElement);
      } else assert.match(await page.locator('.ff-presentation-status').textContent(), /仍可在当前窗口展示/);
      assert.equal(await page.locator('.ff-presentation').evaluate(el => el.open), true);
    }
    await page.screenshot({path: '_build/presentation-desktop.png'});
    await page.locator('.ff-presentation-close').click();
    const note = page.locator('#c01-remark-01');
    assert.equal(await note.locator('.ff-present-button').count(), 0);
    await definition.locator('.ff-frame-heading > .ff-present-button').click();
    await page.locator('.ff-presentation-close').focus();
    await page.keyboard.press('ArrowRight');
    assert.notEqual(await page.locator('.ff-presentation-content > *').getAttribute('id'), 'c01-binary-operation');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('.ff-presentation-content > *').getAttribute('id'), 'c01-binary-operation');
    while (await page.locator('.ff-presentation-next').isEnabled()) await page.locator('.ff-presentation-next').click();
    assert.equal(await page.locator('.ff-presentation-next').isDisabled(), true);
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.ff-presentation-next').isDisabled(), true);
    await page.locator('.ff-presentation-close').click();
    await page.goto('http://127.0.0.1:8765/chapters/c09.html');
    await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
    const proof = page.locator('.statement-box').filter({has: page.locator('.admonition-title', {hasText:'证明'})}).first();
    const collapsed = await proof.evaluate(el => el.classList.contains('toggle-hidden'));
    assert.equal(await proof.locator('.admonition .ff-present-button').count(), 0);
    await proof.locator(':scope > .ff-frame-heading > .ff-present-button').click();
    assert.ok(await page.locator('.ff-presentation-content > .statement-box').innerText());
    assert.equal(await page.locator('.ff-presentation-content .admonition-title').filter({hasText:'证明'}).count() > 0, true);
    await page.screenshot({path:'_build/presentation-proof-dark.png'});
    await page.locator('.ff-presentation-close').click();
    assert.equal(await proof.evaluate(el => el.classList.contains('toggle-hidden')), collapsed);
    await page.goto('http://127.0.0.1:8765/chapters/c01.html');
    for (const width of [390, 1280]) {
      await page.setViewportSize({width, height: 900});
      await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
      await definition.locator('.ff-frame-heading > .ff-present-button').click();
      const bounds = await page.locator('.ff-presentation').boundingBox();
      assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= width + 1);
      assert.equal(await page.locator('.ff-presentation-toolbar').evaluate(el => el.scrollWidth > el.clientWidth + 1), false);
      await page.screenshot({path: `_build/presentation-dark-${width}.png`});
      await page.locator('.ff-presentation-close').click();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync('_build/presentation-validation.json', JSON.stringify({chapterThemeCases: cases, originalNodePreserved: true, formulas: true, notesGrouped: true, inlineHeading: true, previousNext: true, arrowKeys: true, boundaries: true, settingsRetained: true, fontSize: true, escape: true, focusRestored: true, collapsedStateRestored: true, widths: [390,1280], errors}, null, 2));
    console.log(`Presentation passed: ${cases} chapter/theme cases, formulas, notes, resize, Escape and restored state.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
