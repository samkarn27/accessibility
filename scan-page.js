// scan-page.js
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

async function runScan(url, outdir='./reports'){
  await fs.ensureDir(outdir);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

  // inject axe-core from node_modules to the page context
  const axePath = require.resolve('axe-core/axe.min.js');
  const axeSource = await fs.readFile(axePath, 'utf8');
  await page.evaluate(axeSource);

  // run axe
  const results = await page.evaluate(async () => {
    return await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g,'-');
  const outJson = path.join(outdir, `axe-${timestamp}.json`);
  await fs.writeJson(outJson, results, { spaces: 2 });

  // Minimal HTML report
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Axe report</title></head><body><h1>Axe report for ${url}</h1><pre>${JSON.stringify(results, null, 2)}</pre></body></html>`;
  const outHtml = path.join(outdir, `axe-${timestamp}.html`);
  await fs.writeFile(outHtml, html, 'utf8');

  console.log('Saved', outJson, outHtml);
  await browser.close();
  return { json: outJson, html: outHtml };
}

if(require.main === module){
  const url = process.argv[2];
  if(!url){ console.error('Usage: node scan-page.js <url>'); process.exit(2); }
  runScan(url).catch(err => { console.error(err); process.exit(1); });
}
