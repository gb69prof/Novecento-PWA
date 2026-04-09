
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


function mountYoutubeEmbeds() {
  const embeds = document.querySelectorAll('.yt-embed[data-youtube-id]');
  embeds.forEach(container => {
    if (container.dataset.mounted === 'true') return;
    const id = container.dataset.youtubeId;
    const title = container.dataset.title || 'Video YouTube';
    const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : '';
    const params = new URLSearchParams({
      playsinline: '1',
      rel: '0',
      modestbranding: '1'
    });
    if (origin) params.set('origin', origin);
    if (window.location.href) params.set('widget_referrer', window.location.href);
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
    iframe.title = title;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;';
    container.appendChild(iframe);
    container.dataset.mounted = 'true';
  });
}

window.addEventListener('DOMContentLoaded', mountYoutubeEmbeds);
