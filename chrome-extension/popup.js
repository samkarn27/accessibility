// popup.js — when button clicked it injects content-script to run axe
const runBtn = document.getElementById('run');
const out = document.getElementById('out');
runBtn.addEventListener('click', async () => {
  out.textContent = 'Running…';
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if(!tab) return out.textContent = 'No active tab';
  try{
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-script.js']
    });
    out.textContent = 'Scan injected. Check console or overlay on page.';
  } catch(e){ out.textContent = 'Error: ' + e.message; }
});
