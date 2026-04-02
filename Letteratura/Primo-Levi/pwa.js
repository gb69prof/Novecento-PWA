
(() => {
  if (!('serviceWorker' in navigator)) return;
  let refreshing = false;
  const banner = () => document.getElementById('updateBanner');
  const showBanner = (worker) => {
    const el = banner();
    if (!el) return;
    el.classList.add('show');
    document.getElementById('reloadAppBtn')?.addEventListener('click', () => worker?.postMessage({ type: 'SKIP_WAITING' }), { once:true });
    document.getElementById('dismissUpdateBtn')?.addEventListener('click', () => el.classList.remove('show'), { once:true });
  };
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./service-worker.js');
      if (reg.waiting) showBanner(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) showBanner(newWorker);
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } catch (err) {
      console.error('SW registration failed', err);
    }
  });
})();
