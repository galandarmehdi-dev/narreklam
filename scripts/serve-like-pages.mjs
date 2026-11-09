// Local static server that mimics GitHub Pages: folder/index.html, trailing-slash redirects and 404.html fallback.
// Usage: node scripts/serve-like-pages.mjs [basePath=/] [port=4173]
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const base = process.argv[2] || '/';
const port = Number(process.argv[3] || 4173);
const root = join(process.cwd(), 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (!url.pathname.startsWith(base)) { res.writeHead(404); return res.end('not under base'); }
  const rel = normalize(decodeURIComponent(url.pathname.slice(base.length))).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, rel);
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.pathname.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); return res.end(); }
    file = join(file, 'index.html');
  }
  if (existsSync(file) && statSync(file).isFile()) {
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    return res.end(readFileSync(file));
  }
  res.writeHead(404, { 'Content-Type': types['.html'] });
  res.end(readFileSync(join(root, '404.html')));
}).listen(port, () => console.log(`Serving dist at http://localhost:${port}${base}`));
