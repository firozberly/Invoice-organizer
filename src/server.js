import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { invoices } from './sampleData.js';
import { invoicesToCsv } from './invoiceParser.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const port = Number(process.env.PORT ?? 3000);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === '/api/config') {
      return sendJson(response, {
        organizationDomain: process.env.GOOGLE_WORKSPACE_DOMAIN ?? 'ultrahuman.com',
        intakeEmail: process.env.INTAKE_EMAIL ?? 'legal-invoices@ultrahuman.com',
        authMode: process.env.GOOGLE_CLIENT_ID ? 'google-workspace-oauth' : 'demo'
      });
    }

    if (url.pathname === '/api/invoices') {
      return sendJson(response, { invoices });
    }

    if (url.pathname === '/api/export.csv') {
      response.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ultrahuman-invoices.csv"'
      });
      return response.end(invoicesToCsv(invoices));
    }

    const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const safePath = normalize(requestedPath).replace(/^\.\.(\/|\\|$)/, '');
    const filePath = join(publicDir, safePath);
    const file = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' });
    response.end(file);
  } catch (error) {
    if (error.code === 'ENOENT') {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return response.end('Not found');
    }

    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Internal server error');
  }
});

server.listen(port, () => {
  console.log(`Invoice Organizer listening at http://localhost:${port}`);
});

function sendJson(response, payload) {
  response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}
