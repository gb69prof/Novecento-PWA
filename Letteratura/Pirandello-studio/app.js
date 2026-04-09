
window.PIRANDELLO_LESSONS = [{"n": 1, "md": "", "file": "1-pirandello-visione-del-mondo.html", "title": "Pirandello – Visione del mondo", "desc": "Vita, forma, maschera e crisi dell’identità nella modernità.", "media": "Mondo-Pirandello.png", "mediaAlt": "Schema: visione del mondo", "mediaCaption": "La matrice filosofica e sociale dell’opera pirandelliana."}, {"n": 2, "md": "", "file": "2-pirandello-umorismo.html", "title": "Pirandello – L’umorismo", "desc": "Avvertimento e sentimento del contrario: la poetica umoristica.", "media": "Umorismo-Pirandello.jpeg.png", "mediaAlt": "Mappa: umorismo", "mediaCaption": "La poetica dell’umorismo come strumento di conoscenza."}, {"n": 3, "md": "", "file": "3-pirandello-fu-mattia-pascal.html", "title": "Pirandello – Il fu Mattia Pascal", "desc": "Identità, fuga, maschere sociali e impossibilità di rinascere.", "media": "Mattia-Pirandello.jpeg.png", "mediaAlt": "Mappa: Il fu Mattia Pascal", "mediaCaption": "Un romanzo-soglia sulla crisi dell’io moderno."}, {"n": 4, "md": "", "file": "4-pirandello-uno-nessuno-centomila.html", "title": "Pirandello – Uno, nessuno e centomila", "desc": "Frantumazione dell’io e dissoluzione dell’identità personale.", "media": "Uno-nessuno-centomila.png", "mediaAlt": "Mappa: Uno, nessuno e centomila", "mediaCaption": "La crisi dell’io portata alle estreme conseguenze."}, {"n": 5, "md": "", "file": "5-pirandello-cosi-e-se-vi-pare.html", "title": "Pirandello – Così è (se vi pare)", "desc": "Relatività della verità e conflitto tra apparenza e realtà.", "media": "Cosi2.png", "mediaAlt": "Mappa: Così è (se vi pare)", "mediaCaption": "Il dramma dell’impossibilità di una verità unica."}, {"n": 6, "md": "", "file": "6-pirandello-sei-personaggi.html", "title": "Pirandello – Sei personaggi in cerca d’autore", "desc": "Teatro nel teatro, metateatro e crisi della rappresentazione.", "media": "Sei-1.png", "mediaAlt": "Mappa: Sei personaggi", "mediaCaption": "La scena diventa laboratorio della verità impossibile."}, {"n": 7, "md": "", "file": "7-pirandello-novelle.html", "title": "Pirandello – Novelle", "desc": "Il laboratorio narrativo del quotidiano e delle maschere.", "media": "IMG_3679.png", "mediaAlt": "Percorso novelle", "mediaCaption": "Le novelle come officina dei temi pirandelliani."}, {"n": 8, "md": "", "file": "8-pirandello-romanzi.html", "title": "Pirandello – Romanzi", "desc": "Le strutture narrative dei romanzi e le loro ossessioni tematiche.", "media": "IMG_3697.jpeg", "mediaAlt": "Percorso romanzi", "mediaCaption": "Nei romanzi emergono identità mobili e conflitti interiori."}, {"n": 9, "md": "", "file": "9-pirandello-teatro.html", "title": "Pirandello – Teatro", "desc": "Forma scenica, conflitto e rivoluzione del linguaggio teatrale.", "media": "IMG_3728.jpeg", "mediaAlt": "Percorso teatro", "mediaCaption": "Il teatro come luogo vivo della crisi moderna."}, {"n": 10, "md": "", "file": "10-pirandello-conclusione.html", "title": "Pirandello – Conclusione", "desc": "Sintesi del percorso: forma, maschera, incomunicabilità e modernità.", "media": "Conclusione.png", "mediaAlt": "Mappa conclusiva", "mediaCaption": "Una chiusura unitaria del percorso su Pirandello."}];
window.PIRANDELLO_SITE = {name:'Luigi Pirandello', short:'Pirandello', visitedKey:'pirandello-visited-pages'};

function decodeHtml(text){const t=document.createElement('textarea');t.innerHTML=text;return t.value;}
function getVisitedPages(){try{return JSON.parse(localStorage.getItem(window.PIRANDELLO_SITE.visitedKey)||'[]')}catch{return []}}
function setVisitedPage(page){if(!page||page==='index.html') return;const pages=new Set(getVisitedPages());pages.add(page);localStorage.setItem(window.PIRANDELLO_SITE.visitedKey, JSON.stringify([...pages]));}

const NOTES_RECORDS_PREFIX = 'pirandello-notes-records::';

function nowStamp(){
  const d = new Date();
  return d.toLocaleString('it-IT', {dateStyle:'short', timeStyle:'short'});
}

function loadNoteRecords(page){
  try{return JSON.parse(localStorage.getItem(NOTES_RECORDS_PREFIX+page)||'[]')}catch{return []}
}

function saveNoteRecords(page, records){
  localStorage.setItem(NOTES_RECORDS_PREFIX+page, JSON.stringify(records));
}

document.addEventListener('DOMContentLoaded',()=>{
  const current=document.body.dataset.page||''; setVisitedPage(current);
  buildLessonDropdown(); buildToc(); setupLightbox(); setupNotes(); addReadingProgress(); enhanceIndexPage(); decorateVisitedCards(); setupFocusMode();
});

function buildLessonDropdown(){
  document.querySelectorAll('[data-lesson-dropdown]').forEach(holder=>{
    holder.innerHTML='';
    const wrap=document.createElement('div'); wrap.className='lesson-select-wrap';
    const select=document.createElement('select'); select.className='lesson-select'; select.setAttribute('aria-label','Indice delle lezioni');
    const first=document.createElement('option'); first.value=''; first.textContent='Indice delle lezioni'; select.appendChild(first);
    const current=document.body.dataset.page||'';
    window.PIRANDELLO_LESSONS.forEach(item=>{const opt=document.createElement('option'); opt.value=item.file; opt.textContent=`Lezione ${String(item.n).padStart(2,'0')} · ${decodeHtml(item.title)}`; if(item.file===current) opt.selected=true; select.appendChild(opt);});
    select.addEventListener('change',()=>{if(select.value) location.href=select.value;});
    wrap.appendChild(select); holder.appendChild(wrap);
  });
}

function buildToc(){
  const toc=document.querySelector('.toc'); if(!toc) return;
  const headings=[...document.querySelectorAll('.lesson-body h2, .lesson-body h3')];
  toc.innerHTML='';
  headings.forEach((h,i)=>{if(!h.id) h.id='sec-'+(i+1); const li=document.createElement('li'); const a=document.createElement('a'); a.href='#'+h.id; a.textContent=h.textContent; li.appendChild(a); toc.appendChild(li);});
  if(!headings.length) return;
  const links=[...toc.querySelectorAll('a')];
  const observer = new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(l=>l.classList.toggle('active', l.getAttribute('href')==='#'+entry.target.id));}})}, {rootMargin:'-18% 0px -68% 0px', threshold:0.01});
  headings.forEach(h=>observer.observe(h));
}

function setupLightbox(){
  const imgs=[...document.querySelectorAll('img.zoomable, .lesson-body img, .map-card img, .map-tile img, .media-frame img')]; if(!imgs.length) return;
  let modal=document.getElementById('imageLightbox');
  if(!modal){ modal=document.createElement('div'); modal.id='imageLightbox'; modal.className='lightbox'; modal.innerHTML='<button class="lightbox-close" type="button" aria-label="Chiudi immagine">×</button><figure class="lightbox-figure"><img class="lightbox-image" alt=""><figcaption class="lightbox-caption"></figcaption></figure>'; document.body.appendChild(modal); modal.addEventListener('click',e=>{if(e.target===modal||e.target.classList.contains('lightbox-close')) closeModal();}); document.addEventListener('keydown',e=>{if(e.key==='Escape') closeModal();}); }
  const modalImg=modal.querySelector('.lightbox-image'); const caption=modal.querySelector('.lightbox-caption');
  function closeModal(){modal.classList.remove('open'); document.body.classList.remove('no-scroll');}
  imgs.forEach(img=>{img.classList.add('zoomable-image'); img.title='Apri a tutto schermo'; img.addEventListener('click',()=>{modalImg.src=img.currentSrc||img.src; modalImg.alt=img.alt||''; caption.textContent=img.alt||'Immagine'; modal.classList.add('open'); document.body.classList.add('no-scroll');});});
}

function setupNotes(){
  const box=document.querySelector('[data-notes-box]'); if(!box) return null;
  const page=document.body.dataset.page||'pagina'; const title=document.body.dataset.title||page; const key='pirandello-notes::'+page;
  const textarea=box.querySelector('textarea'); const status=box.querySelector('[data-notes-status]');
  textarea.value=localStorage.getItem(key)||'';
  function flash(msg){ if(!status) return; status.textContent=msg; status.classList.add('show'); clearTimeout(window.__pirandelloNotesTimer); window.__pirandelloNotesTimer=setTimeout(()=>status.classList.remove('show'),2200); }
  function persist(){ localStorage.setItem(key, textarea.value); }
  const api = {
    storageKey:key,
    textarea,
    setStatus:flash,
    append(text, meta={}){
      const cleaned=String(text||'').replace(/\s+/g,' ').trim();
      if(!cleaned) return;
      const stamp = meta.timestamp || nowStamp();
      const ref = meta.lessonTitle || decodeHtml(title);
      const block = `• ${cleaned}\n[${ref} · ${stamp}]`;
      textarea.value = textarea.value.trim() ? `${textarea.value.trim()}\n\n${block}` : block;
      persist();
      const records = loadNoteRecords(page);
      records.push({content:cleaned, reference:ref, timestamp:stamp, lesson:page});
      saveNoteRecords(page, records);
      flash('Passaggio aggiunto agli appunti');
    }
  };
  box.querySelector('[data-action="save-local"]')?.addEventListener('click',()=>{persist(); flash('Appunti salvati nel dispositivo');});
  box.querySelector('[data-action="download-notes"]')?.addEventListener('click',()=>{const content=`Titolo: ${decodeHtml(title)}\nFile: ${page}\n\n${textarea.value||''}`; const blob=new Blob([content],{type:'text/plain;charset=utf-8'}); const href=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=href; a.download=page.replace(/\.html$/,'')+'-appunti.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(href),1000); flash('File appunti scaricato');});
  box.querySelector('[data-action="clear-notes"]')?.addEventListener('click',()=>{textarea.value=''; localStorage.removeItem(key); localStorage.removeItem(NOTES_RECORDS_PREFIX+page); flash('Appunti cancellati');});
  textarea.addEventListener('input', persist);
  window.PIRANDELLO_NOTES_API = api;
  return api;
}

function addReadingProgress(){
  const article=document.querySelector('.lesson-body'); if(!article) return;
  const bar=document.createElement('div'); bar.className='reading-progress'; bar.innerHTML='<span></span>'; document.body.appendChild(bar); const inner=bar.querySelector('span');
  const update=()=>{const rect=article.getBoundingClientRect(); const vh=window.innerHeight||document.documentElement.clientHeight; const total=Math.max(article.offsetHeight-vh*0.35,1); const read=Math.min(Math.max(-rect.top+vh*0.18,0),total); inner.style.width=`${(read/total)*100}%`;};
  addEventListener('scroll',update,{passive:true}); addEventListener('resize',update); update();
}

function enhanceIndexPage(){
  const grid=document.querySelector('.lesson-grid'); if(!grid) return; const cards=[...grid.querySelectorAll('.lesson-card')];
  const count=document.querySelector('[data-library-count]'); const search=document.querySelector('.library-search');
  const update=()=>{const q=(search?.value||'').toLowerCase().trim(); let visible=0; cards.forEach(card=>{const txt=card.textContent.toLowerCase(); const show=!q||txt.includes(q); card.style.display=show?'':'none'; if(show) visible++;}); if(count) count.textContent=`${visible} lezioni visibili`;};
  search?.addEventListener('input',update); update();
}

function decorateVisitedCards(){
  const visited=new Set(getVisitedPages()); document.querySelectorAll('.lesson-card').forEach(card=>{const href=card.getAttribute('href'); if(visited.has(href)) card.classList.add('visited');});
}

function setupFocusMode(){
  const key = 'pirandello-focus-mode';
  const apply = (active) => {
    document.documentElement.classList.toggle('focus-mode', !!active);
    document.body.classList.toggle('focus-mode', !!active);
    localStorage.setItem(key, active ? '1' : '0');
    document.querySelectorAll('[data-focus-toggle]').forEach(btn=>{
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.innerHTML = active ? '<span>Esci concentrazione</span>' : '<span>Modalità concentrazione</span>';
    });
    const exit = document.getElementById('focusExitBtn');
    if(exit) exit.hidden = !active;
  };
  apply(localStorage.getItem(key)==='1');
  document.querySelectorAll('[data-focus-toggle]').forEach(btn=>btn.addEventListener('click',()=>apply(!document.body.classList.contains('focus-mode'))));
  document.getElementById('focusExitBtn')?.addEventListener('click',()=>apply(false));
}
