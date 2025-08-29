// server.js — minimal Express server to serve reports
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const app = express();
const REPORT_DIR = path.join(__dirname, 'reports');

app.use('/reports', express.static(REPORT_DIR));
app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/api/reports', async (req, res) => {
  try{
    await fs.ensureDir(REPORT_DIR);
    const files = await fs.readdir(REPORT_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();
    res.json(jsonFiles);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
