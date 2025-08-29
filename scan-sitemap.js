// scan-sitemap.js
const fs = require('fs-extra');
const { exec } = require('child_process');
const axios = require('axios');
const xml2js = require('xml2js');

async function fetchSitemap(sitemapUrl){
  if(sitemapUrl.startsWith('http')){
    const res = await axios.get(sitemapUrl);
    return res.data;
  }
  return fs.readFile(sitemapUrl, 'utf8');
}

async function parseUrls(sitemapXml){
  const parser = new xml2js.Parser();
  const parsed = await parser.parseStringPromise(sitemapXml);
  const urls = [];
  if(parsed.urlset && parsed.urlset.url){
    for(const u of parsed.urlset.url){
      if(u.loc && u.loc[0]) urls.push(u.loc[0]);
    }
  }
  return urls;
}

async function run(){
  const sitemap = process.argv[2];
  if(!sitemap){ console.error('Usage: node scan-sitemap.js <sitemap.xml or url>'); process.exit(2); }
  const xml = await fetchSitemap(sitemap);
  const urls = await parseUrls(xml);
  console.log('Found', urls.length, 'urls');

  for(const url of urls){
    console.log('\n---\nScanning', url);
    try{
      await new Promise((resolve, reject) => {
        const cmd = `node scan-page.js "${url}"`;
        const p = exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
          if(err) return reject(err);
          console.log(stdout);
          if(stderr) console.error(stderr);
          resolve();
        });
      });
    } catch(e){
      console.error('Error scanning', url, e.message || e);
    }
  }
}

run().catch(err => { console.error(err); process.exit(1); });
