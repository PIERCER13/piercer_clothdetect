const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3456;
const resourceDir = path.resolve(__dirname, '..');
const webDir = path.join(resourceDir, 'web');
const dataDir = path.join(resourceDir, 'data');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }

    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    // API endpoints
    if (pathname === '/api/data' && req.method === 'GET') {
        const jsonPath = path.join(dataDir, 'duplicates.json');
        if (fs.existsSync(jsonPath)) {
            const data = fs.readFileSync(jsonPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            return res.end(data);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Nenhum scan encontrado. Execute a varredura primeiro.' }));
        }
    }

    if (pathname === '/api/rescan' && req.method === 'POST') {
        exec(`node "${path.join(__dirname, 'scanner.js')}"`, (err, stdout, stderr) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: stderr || err.message }));
            }
            const jsonPath = path.join(dataDir, 'duplicates.json');
            const data = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')) : null;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, stdout, data }));
        });
        return;
    }

    if (pathname === '/api/quarantine' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const quarantine = require('./quarantine.js');
                const result = quarantine.quarantineItem(payload.folderPath);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(result));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    // Static files
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';

    let filePath = path.join(webDir, safePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(dataDir, safePath);
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        return fs.createReadStream(filePath).pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
});

server.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`  FrameZero Cloth Detector - Painel Web Online!`);
    console.log(`  Acesse no navegador: http://localhost:${PORT}`);
    console.log(`========================================================`);
    
    // Open default browser on windows
    exec(`start http://localhost:${PORT}`);
});
