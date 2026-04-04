if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            const banner = document.createElement('div');
            banner.style.position = 'fixed';
            banner.style.bottom = '0';
            banner.style.left = '0';
            banner.style.right = '0';
            banner.style.background = '#961B2B';
            banner.style.color = 'white';
            banner.style.padding = '1rem';
            banner.style.textAlign = 'center';
            banner.innerHTML = 'Aggiornamento disponibile <button id="reloadBtn">Ricarica</button>';
            document.body.appendChild(banner);
            document.getElementById('reloadBtn').onclick = () => location.reload();
          }
        });
      });
    });
  });
}