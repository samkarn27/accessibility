# AEM Accessibility Audit

This repository provides a Puppeteer + axe-core scanner and a lightweight Chrome extension
that authors can use while previewing AEM pages.

## Quick setup

```bash
npm install
node scan-page.js https://preview.example.com/content/site/en/home.html
npm start
# open http://localhost:3000
```

## Chrome extension (development)
- Load `chrome-extension/` as an Unpacked Extension in Chrome (chrome://extensions).
- Open an AEM preview page (logged in as an author), click the extension popup and run the scan.

## Push to GitHub
Initialize git, create remote, and push. Or use `gh repo create` to create & push in one step.
