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

// O painel só atende o próprio computador. Não há CORS: outras páginas não podem usá-lo.
const HOST = '127.0.0.1';
const LOCAL_HOSTS = [`localhost:${PORT}`, `127.0.0.1:${PORT}`];
const MAX_BODY = 16 * 1024;

function isAllowedRequest(req) {
    // Host diferente indica um domínio externo apontado para este computador
    if (!LOCAL_HOSTS.includes(req.headers.host)) return false;
    // o navegador envia Origin em pedidos vindos de páginas: só vale a do próprio painel
    const origin = req.headers.origin;
    if (origin !== undefined && !LOCAL_HOSTS.some(h => origin === `http://${h}`)) return false;
    return req.headers['sec-fetch-site'] !== 'cross-site';
}

const server = http.createServer((req, res) => {
    if (!isAllowedRequest(req)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('403 Forbidden');
    }

    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

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
        if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
            res.writeHead(415, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Envie JSON.' }));
        }
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > MAX_BODY) req.destroy();
        });
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

    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';

    let filePath = path.join(webDir, safePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(dataDir, safePath);
    }

    // nunca servir arquivo fora de web/ e data/
    const inside = [webDir, dataDir].some(base => path.resolve(filePath).startsWith(base + path.sep));

    if (inside && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        return fs.createReadStream(filePath).pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
});

server.listen(PORT, HOST, () => {
    console.log(`========================================================`);
    console.log(`  FrameZero Cloth Detector - Painel Web Online!`);
    console.log(`  Acesse no navegador: http://localhost:${PORT}`);
    console.log(`========================================================`);
    
    exec(`start http://localhost:${PORT}`);
});
