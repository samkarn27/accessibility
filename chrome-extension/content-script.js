// content-script.js — injects axe from CDN and runs it, then shows a simple overlay
(function(){
  if(window.__AEM_A11Y_RUNNING) return console.log('Already running');
  window.__AEM_A11Y_RUNNING = true;

  function injectAxe(cb){
    if(window.axe) return cb();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.3/axe.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = cb;
    s.onerror = function(e){ console.error('Failed to load axe:', e); cb(); };
    document.head.appendChild(s);
  }

  function createOverlay(text){
    const existing = document.getElementById('aem-a11y-overlay');
    if(existing) existing.remove();
    const d = document.createElement('div');
    d.id = 'aem-a11y-overlay';
    d.style.position = 'fixed';
    d.style.right = '12px';
    d.style.top = '12px';
    d.style.zIndex = '2147483647';
    d.style.maxWidth = '420px';
    d.style.padding = '12px';
    d.style.background = 'white';
    d.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    d.style.fontSize = '13px';
    d.innerText = text;
    document.body.appendChild(d);
  }

  injectAxe(async () => {
    try{
      const results = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa'] } });
      console.log('Axe results', results);
      createOverlay(`${results.violations.length} violations, ${results.incomplete.length} incomplete`);
      // optionally: post results to server
      // fetch('https://your.server/reports', { method: 'POST', body: JSON.stringify(results) })
    } catch(e){
      console.error(e);
      createOverlay('Scan failed: ' + e.message);
    }
  });
})();
