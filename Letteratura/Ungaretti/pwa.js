
(() => {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  let refreshing = false;
  function showUpdate(reg){
    const banner = document.getElementById('updateBanner'); if (!banner) return;
    banner.hidden = false;
    document.getElementById('reloadApp')?.addEventListener('click', () => { reg.waiting?.postMessage({ type: 'SKIP_WAITING' }); });
    document.getElementById('dismissUpdate')?.addEventListener('click', () => { banner.hidden = true; });
  }
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
      if (reg.waiting) showUpdate(reg);
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing; if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(reg);
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; window.location.reload(); });
    } catch (err) { console.warn('Registrazione service worker fallita', err); }
  });
})();
