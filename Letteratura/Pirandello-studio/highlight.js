
(function(){
  const STORE_PREFIX = 'pirandello-highlights::';
  const CLASS_NAME = 'text-highlight';
  const ACTIVE_CLASS = 'selection-has-tooltip';
  let tooltip, currentRange = null;

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    ensureTooltip();
    restoreHighlights();
    bindSelectionEvents();
    bindHighlightRemoval();
  }

  function getPageKey(){ return document.body.dataset.page || location.pathname.split('/').pop() || 'page'; }
  function getArticle(){ return document.querySelector('.lesson-body'); }

  function loadHighlights(){
    try { return JSON.parse(localStorage.getItem(STORE_PREFIX + getPageKey()) || '[]'); }
    catch { return []; }
  }
  function saveHighlights(items){ localStorage.setItem(STORE_PREFIX + getPageKey(), JSON.stringify(items)); }

  function ensureTooltip(){
    tooltip = document.createElement('div');
    tooltip.className = 'selection-tooltip';
    tooltip.innerHTML = '<button type="button" data-action="highlight">Evidenzia</button><button type="button" data-action="note">Aggiungi agli appunti</button>';
    tooltip.hidden = true;
    document.body.appendChild(tooltip);
    tooltip.addEventListener('click', onTooltipClick);
  }

  function bindSelectionEvents(){
    const article = getArticle();
    if(!article) return;
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if(!sel || !sel.rangeCount){ hideTooltip(); return; }
      const range = sel.getRangeAt(0);
      if(sel.isCollapsed || !article.contains(range.commonAncestorContainer)){ hideTooltip(); return; }
      const text = sel.toString().replace(/\s+/g,' ').trim();
      if(!text){ hideTooltip(); return; }
      currentRange = range.cloneRange();
      showTooltip(range);
    });
    document.addEventListener('mousedown', (event)=>{
      if(tooltip.contains(event.target)) return;
      if(event.target.closest('.text-highlight')) return;
      if(!event.target.closest('.lesson-body')) hideTooltip();
    });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hideTooltip(); });
    window.addEventListener('scroll', ()=>{ if(!tooltip.hidden && currentRange) showTooltip(currentRange); }, {passive:true});
    window.addEventListener('resize', ()=>{ if(!tooltip.hidden && currentRange) showTooltip(currentRange); });
  }

  function onTooltipClick(event){
    const btn = event.target.closest('button'); if(!btn || !currentRange) return;
    const article = getArticle(); if(!article) return;
    const offsets = getOffsetsForRange(article, currentRange);
    if(!offsets) return hideTooltip();
    const selectedText = currentRange.toString().replace(/\s+/g,' ').trim();
    if(!selectedText) return hideTooltip();
    if(btn.dataset.action === 'highlight'){
      persistHighlight(offsets.start, offsets.end, selectedText);
      applyHighlights(loadHighlights());
    }
    if(btn.dataset.action === 'note'){
      persistHighlight(offsets.start, offsets.end, selectedText);
      applyHighlights(loadHighlights());
      window.PIRANDELLO_NOTES_API?.append(selectedText, {lessonTitle: document.body.dataset.title || getPageKey(), timestamp: new Date().toLocaleString('it-IT', {dateStyle:'short', timeStyle:'short'})});
    }
    window.getSelection()?.removeAllRanges();
    hideTooltip();
  }

  function persistHighlight(start, end, text){
    let items = loadHighlights();
    const duplicate = items.some(item => item.start === start && item.end === end);
    if(duplicate) return;
    items = items.filter(item => !(rangesOverlap(item.start, item.end, start, end)));
    items.push({id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2), text, start, end, page: getPageKey(), createdAt: Date.now()});
    items.sort((a,b)=>a.start - b.start);
    saveHighlights(items);
  }

  function restoreHighlights(){
    applyHighlights(loadHighlights());
  }

  function applyHighlights(items){
    const article = getArticle(); if(!article) return;
    unwrapHighlights(article);
    if(!items.length) return;
    const nodes = getTextNodes(article);
    for(const item of items){
      const range = rangeFromOffsets(article, nodes, item.start, item.end);
      if(range) wrapRange(range, item.id);
    }
  }

  function unwrapHighlights(root){
    root.querySelectorAll('span.'+CLASS_NAME).forEach(span => {
      const parent = span.parentNode;
      while(span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
      parent.normalize();
    });
  }

  function getTextNodes(root){
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if(node.parentElement && node.parentElement.closest('.selection-tooltip, .notes-card, .topbar, .toc, .reading-progress')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[]; let n;
    while((n=walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function getOffsetsForRange(root, range){
    const nodes = getTextNodes(root);
    let total = 0, start = null, end = null;
    for(const node of nodes){
      const len = node.nodeValue.length;
      if(node === range.startContainer) start = total + range.startOffset;
      if(node === range.endContainer) end = total + range.endOffset;
      total += len;
    }
    if(start == null || end == null) return null;
    return {start, end};
  }

  function rangeFromOffsets(root, nodes, start, end){
    const range = document.createRange();
    let total = 0, startNode = null, endNode = null, startOffset = 0, endOffset = 0;
    for(const node of nodes){
      const len = node.nodeValue.length;
      if(startNode === null && start <= total + len){ startNode = node; startOffset = Math.max(0, start - total); }
      if(endNode === null && end <= total + len){ endNode = node; endOffset = Math.max(0, end - total); break; }
      total += len;
    }
    if(!startNode || !endNode) return null;
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
  }

  function wrapRange(range, id){
    if(range.collapsed) return;
    const textNodes = [];
    const root = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentNode;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if(!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
        if(node.parentElement && node.parentElement.closest('.'+CLASS_NAME)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while((node=walker.nextNode())) textNodes.push(node);
    textNodes.forEach(node => {
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(node);
      if(node === range.startContainer) nodeRange.setStart(node, range.startOffset);
      if(node === range.endContainer) nodeRange.setEnd(node, range.endOffset);
      const span = document.createElement('span');
      span.className = CLASS_NAME;
      span.dataset.highlightId = id;
      try { nodeRange.surroundContents(span); }
      catch {
        const frag = nodeRange.extractContents();
        span.appendChild(frag);
        nodeRange.insertNode(span);
      }
    });
  }

  function rangesOverlap(aStart, aEnd, bStart, bEnd){ return aStart < bEnd && bStart < aEnd; }

  function showTooltip(range){
    const rect = range.getBoundingClientRect();
    if(!rect || (!rect.width && !rect.height)) return hideTooltip();
    tooltip.hidden = false;
    document.body.classList.add(ACTIVE_CLASS);
    const top = window.scrollY + rect.top - tooltip.offsetHeight - 10;
    const left = window.scrollX + rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
    const maxLeft = window.scrollX + document.documentElement.clientWidth - tooltip.offsetWidth - 12;
    tooltip.style.top = Math.max(window.scrollY + 8, top) + 'px';
    tooltip.style.left = Math.max(window.scrollX + 12, Math.min(left, maxLeft)) + 'px';
  }

  function hideTooltip(){ tooltip.hidden = true; document.body.classList.remove(ACTIVE_CLASS); currentRange = null; }

  function bindHighlightRemoval(){
    document.addEventListener('click', (event)=>{
      const hl = event.target.closest('.'+CLASS_NAME);
      if(!hl) return;
      if(window.getSelection()?.toString()) return;
      const id = hl.dataset.highlightId;
      let items = loadHighlights().filter(item => item.id !== id);
      saveHighlights(items);
      applyHighlights(items);
    });
  }
})();
