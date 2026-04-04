
(function(){
  const STORAGE_PREFIX = 'ungaretti-highlights::';
  function getArticle(){ return document.querySelector('.lesson-body'); }
  function getPageKey(){ return document.body.dataset.page || ''; }
  function loadHighlights(){ try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + getPageKey()) || '[]'); } catch { return []; } }
  function saveHighlights(items){ localStorage.setItem(STORAGE_PREFIX + getPageKey(), JSON.stringify(items)); }
  function getTextNodes(root){
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentNode;
        if (parent && parent.closest && (parent.closest('.selection-menu') || parent.closest('.notes-box') || parent.closest('script') || parent.closest('style'))) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n; while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }
  function computeOffsets(root, range){
    const textNodes = getTextNodes(root); let pos = 0; let start = null; let end = null;
    for (const node of textNodes){
      const len = node.nodeValue.length;
      if (node === range.startContainer) start = pos + range.startOffset;
      if (node === range.endContainer) end = pos + range.endOffset;
      pos += len;
    }
    if (start == null || end == null || end <= start) return null;
    return { start, end, text: root.textContent.slice(start, end).replace(/\s+/g, ' ').trim() };
  }
  function buildNodesMap(root){
    const nodes = getTextNodes(root); const map = []; let pos = 0;
    for (const node of nodes){ const start = pos; const end = pos + node.nodeValue.length; map.push({ node, start, end }); pos = end; }
    return map;
  }
  function clearMarks(root){ root.querySelectorAll('mark.user-highlight').forEach((mark) => { const txt = document.createTextNode(mark.textContent); mark.replaceWith(txt); }); }
  function wrapRange(entry, nodesMap){
    const starts = entry.start, ends = entry.end; let firstMark = null;
    for (const info of nodesMap){
      const s = Math.max(starts, info.start); const e = Math.min(ends, info.end); if (s >= e) continue;
      let target = info.node;
      const localStart = s - info.start; const localEnd = e - info.start;
      if (!target.parentNode) continue;
      if (localStart > 0) target = target.splitText(localStart);
      if ((localEnd - localStart) < target.nodeValue.length) target.splitText(localEnd - localStart);
      const mark = document.createElement('mark'); mark.className = 'user-highlight'; mark.dataset.highlightId = entry.id; mark.textContent = target.nodeValue; target.parentNode.replaceChild(mark, target);
      if (!firstMark) firstMark = mark;
    }
    return firstMark;
  }
  function applyHighlights(root){
    const items = loadHighlights().sort((a,b)=>a.start-b.start);
    clearMarks(root);
    const nodesMap = buildNodesMap(root);
    items.forEach((entry) => wrapRange(entry, nodesMap));
  }
  function removeHighlight(id){ const items = loadHighlights().filter((item) => item.id !== id); saveHighlights(items); const root = getArticle(); if (root) applyHighlights(root); }
  function getMenu(){ return document.getElementById('selectionMenu'); }
  function hideMenu(){ const m = getMenu(); if (m) m.hidden = true; }
  function showMenu(x, y){ const m = getMenu(); if (!m) return; m.hidden = false; const w = m.offsetWidth || 180; const h = m.offsetHeight || 42; m.style.left = Math.max(10, Math.min(window.innerWidth - w - 10, x - w/2)) + 'px'; m.style.top = Math.max(10, y - h - 14) + 'px'; }
  document.addEventListener('DOMContentLoaded', () => {
    const root = getArticle(); if (!root) return;
    applyHighlights(root);
    let currentSelection = null;
    function captureSelection(){
      const selection = window.getSelection(); if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
      const range = selection.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) return null;
      return computeOffsets(root, range);
    }
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) { currentSelection = null; hideMenu(); return; }
      const data = captureSelection(); if (!data || !data.text) { currentSelection = null; hideMenu(); return; }
      currentSelection = data;
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      showMenu(rect.left + rect.width/2, rect.top + window.scrollY);
    });
    document.addEventListener('click', (e) => {
      const mark = e.target.closest('mark.user-highlight');
      if (mark) { removeHighlight(mark.dataset.highlightId); return; }
      if (!e.target.closest('#selectionMenu')) hideMenu();
    });
    getMenu()?.addEventListener('click', (e) => {
      const action = e.target.dataset.highlightAction; if (!action || !currentSelection) return;
      if (action === 'highlight') {
        const items = loadHighlights();
        const duplicate = items.find((item) => item.start === currentSelection.start && item.end === currentSelection.end);
        if (!duplicate) items.push({ id: 'h' + Date.now(), ...currentSelection, timestamp: new Date().toISOString() });
        saveHighlights(items); applyHighlights(root);
      }
      if (action === 'note') window.UNGARETTI_NOTES_API?.append(currentSelection.text, { lessonTitle: document.body.dataset.title });
      window.getSelection()?.removeAllRanges(); currentSelection = null; hideMenu();
    });
    window.addEventListener('scroll', hideMenu, { passive: true }); window.addEventListener('resize', hideMenu);
  });
})();
