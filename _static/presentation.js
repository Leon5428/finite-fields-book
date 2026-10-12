/* Move the original frame so formulas, IDs and interactive state stay intact. */
document.addEventListener('DOMContentLoaded', () => {
  const frames = [...document.querySelectorAll('.bd-article .statement-box, .bd-article .admonition')]
    .filter(frame => !frame.matches('.reading-note,.chapter-remark,.chapter-goals') && !frame.parentElement.closest('.statement-box,.admonition'));
  if (!frames.length || typeof HTMLDialogElement === 'undefined') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'ff-presentation';
  dialog.setAttribute('aria-label', '课堂展示');
  dialog.innerHTML = `<div class="ff-presentation-toolbar">
    <strong class="ff-presentation-heading">课堂展示</strong>
    <button type="button" class="ff-presentation-prev">上一框 ←</button>
    <span class="ff-presentation-position" aria-live="polite"></span>
    <button type="button" class="ff-presentation-next">下一框 →</button>
    <label>字号 <input class="ff-presentation-size" type="range" min="20" max="48" value="28" aria-label="展示字号"></label>
    <output class="ff-presentation-size-label">28 px</output>
    <label><input class="ff-presentation-notes" type="checkbox"> 显示注释</label>
    <button type="button" class="ff-presentation-fullscreen">全屏</button>
    <button type="button" class="ff-presentation-close">退出展示 ×</button>
    <span class="ff-presentation-status" role="status"></span>
    </div><div class="ff-presentation-scroll"><div class="ff-presentation-content bd-article"></div></div>`;
  document.body.append(dialog);
  const content = dialog.querySelector('.ff-presentation-content');
  const size = dialog.querySelector('.ff-presentation-size');
  const notes = dialog.querySelector('.ff-presentation-notes');
  const full = dialog.querySelector('.ff-presentation-fullscreen');
  const status = dialog.querySelector('.ff-presentation-status');
  const previous = dialog.querySelector('.ff-presentation-prev');
  const next = dialog.querySelector('.ff-presentation-next');
  const entries = [];
  let active = null;
  function updateSize() {
    content.style.setProperty('--ff-presentation-size', `${size.value}px`);
    dialog.querySelector('output').textContent = `${size.value} px`;
  }
  size.addEventListener('input', updateSize);
  notes.addEventListener('change', () => dialog.classList.toggle('ff-show-notes', notes.checked));
  function restoreFrame() {
    if (!active?.frame) return;
    active.marker.replaceWith(active.frame);
    active.frame.classList.toggle('toggle-hidden', active.collapsed);
    active.frame = null;
  }
  function showFrame(index) {
    if (!active || index < 0 || index >= entries.length) return;
    restoreFrame();
    const {frame, title} = entries[index];
    active.index = index;
    active.frame = frame;
    active.collapsed = frame.classList.contains('toggle-hidden');
    active.marker = document.createComment('classroom frame location');
    frame.before(active.marker);
    frame.classList.remove('toggle-hidden');
    content.append(frame);
    dialog.querySelector('.ff-presentation-heading').textContent = title;
    dialog.querySelector('.ff-presentation-position').textContent = `${index + 1} / ${entries.length}`;
    previous.disabled = index === 0;
    next.disabled = index === entries.length - 1;
    dialog.querySelector('.ff-presentation-scroll').scrollTop = 0;
  }
  previous.addEventListener('click', () => showFrame(active.index - 1));
  next.addEventListener('click', () => showFrame(active.index + 1));
  function restore() {
    if (!active) return;
    const {button, overflow, scrollX, scrollY, ownsFullscreen} = active;
    restoreFrame();
    document.body.style.overflow = overflow;
    active = null;
    button.focus({preventScroll: true});
    window.scrollTo({left: scrollX, top: scrollY, behavior: 'instant'});
    if (ownsFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }
  dialog.addEventListener('close', restore);
  dialog.querySelector('.ff-presentation-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.target.closest('input,textarea,select,[contenteditable]')) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showFrame(active.index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
    if (['+', '=', '-'].includes(event.key)) {
      event.preventDefault();
      size.value = Math.max(20, Math.min(48, Number(size.value) + (event.key === '-' ? -2 : 2)));
      updateSize();
    }
  });
  full.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else {
        await document.documentElement.requestFullscreen();
        if (active) active.ownsFullscreen = true;
        else if (document.fullscreenElement) await document.exitFullscreen();
      }
    } catch (_) { status.textContent = '浏览器未开启全屏；仍可在当前窗口展示。'; }
  });
  if (!document.fullscreenEnabled) full.hidden = true;
  function syncFullscreen() {
    full.textContent = document.fullscreenElement ? '退出全屏' : '全屏';
    dialog.classList.toggle('ff-browser-fullscreen', Boolean(document.fullscreenElement));
  }
  document.addEventListener('fullscreenchange', syncFullscreen);
  window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); });
  content.addEventListener('click', event => {
    if (event.target.closest('a[href]')?.getAttribute('href')?.startsWith('#')) dialog.close();
  });
  for (const frame of frames) {
    const heading = [...frame.children].find(el => el.matches('.source-label,.statement-title,.admonition-title'));
    const title = heading?.textContent.trim() || '内容框';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ff-present-button';
    button.textContent = '课堂展示 ↗';
    button.setAttribute('aria-label', `课堂展示：${title}`);
    button.setAttribute('aria-haspopup', 'dialog');
    if (heading) { heading.classList.add('ff-frame-heading'); heading.append(button); }
    else frame.prepend(button);
    const index = entries.length;
    entries.push({frame, title, button});
    button.addEventListener('click', event => {
      event.stopPropagation();
      if (active) return;
      active = {button, overflow: document.body.style.overflow, scrollX: window.scrollX, scrollY: window.scrollY, ownsFullscreen: false};
      showFrame(index);
      notes.checked = false;
      dialog.classList.remove('ff-show-notes');
      size.value = '28'; updateSize(); syncFullscreen(); status.textContent = '';
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      dialog.querySelector('.ff-presentation-scroll').scrollTop = 0;
      dialog.querySelector('.ff-presentation-close').focus();
    });
  }
});
