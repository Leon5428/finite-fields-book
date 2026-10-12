/* Use a small, scalable gap only at Chinese/inline-math boundaries. */
document.addEventListener('DOMContentLoaded', () => {
  const han = /\p{Script=Han}/u;
  const inlineTags = new Set(['SPAN', 'A', 'EM', 'STRONG', 'B', 'I', 'SMALL', 'SUP', 'SUB']);
  function edge(element, direction) {
    const spaces = [];
    let cursor = element;
    while (cursor) {
      let sibling = direction < 0 ? cursor.previousSibling : cursor.nextSibling;
      if (!sibling) {
        cursor = cursor.parentElement;
        if (!cursor || !inlineTags.has(cursor.tagName)) return null;
        continue;
      }
      while (sibling?.nodeType === Node.ELEMENT_NODE) {
        if (!inlineTags.has(sibling.tagName) || sibling.querySelector('mjx-container')) return null;
        if (!sibling.childNodes.length) break;
        sibling = direction < 0 ? sibling.lastChild : sibling.firstChild;
      }
      if (sibling?.nodeType === Node.TEXT_NODE) {
        const text = sibling.textContent;
        const trimmed = direction < 0 ? text.trimEnd() : text.trimStart();
        if (trimmed) {
          const char = direction < 0 ? [...trimmed].at(-1) : [...trimmed][0];
          return han.test(char) ? {node: sibling, trimmed, spaces} : null;
        }
        spaces.push(sibling);
      }
      cursor = sibling;
    }
    return null;
  }
  function update() {
    document.querySelectorAll('.bd-article mjx-container:not([display="true"])').forEach(math => {
      // Normal Sphinx formulas have an inline wrapper; live feedback may not.
      const outer = math.parentElement.matches('span.math') ? math.parentElement : math;
      for (const [direction, name] of [[-1, 'ff-math-gap-before'], [1, 'ff-math-gap-after']]) {
        const found = edge(outer, direction);
        outer.classList.toggle(name, Boolean(found));
        if (!found) continue;
        // Replace source whitespace at this boundary rather than doubling it.
        if (found.node.textContent !== found.trimmed) found.node.textContent = found.trimmed;
        found.spaces.forEach(node => { if (node.textContent) node.textContent = ''; });
      }
    });
  }
  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; update(); });
  }
  new MutationObserver(records => {
    if (records.some(record => !record.target.parentElement?.closest('mjx-container'))) schedule();
  }).observe(document.body, {childList: true, subtree: true, characterData: true});
  schedule();
  window.MathJax?.startup?.promise?.then(schedule);
});
