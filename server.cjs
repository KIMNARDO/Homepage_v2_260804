const { createServer } = require('node:http');
const { createReadStream, statSync } = require('node:fs');
const { extname, join, resolve, sep } = require('node:path');

const root = resolve(__dirname, 'dist');
const port = Number(process.env.PORT) || 4173;

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.m4v': 'video/x-m4v',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = resolve(root, relativePath);

  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) return null;

  try {
    if (statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
    return statSync(filePath).isFile() ? filePath : null;
  } catch {
    if (!extname(relativePath)) {
      const htmlPath = resolve(root, `${relativePath}.html`);
      try {
        if (htmlPath.startsWith(`${root}${sep}`) && statSync(htmlPath).isFile()) return htmlPath;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function sendFile(req, res, filePath) {
  const stats = statSync(filePath);
  const extension = extname(filePath).toLowerCase();
  const range = req.headers.range;
  const headers = {
    'Accept-Ranges': 'bytes',
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  };

  headers['Cache-Control'] = extension === '.html'
    ? 'no-cache'
    : 'public, max-age=86400, stale-while-revalidate=604800';

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
      return res.end();
    }

    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : stats.size - 1;
    if (start > end || end >= stats.size) {
      res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
      return res.end();
    }

    res.writeHead(206, {
      ...headers,
      'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
    });
    if (req.method === 'HEAD') return res.end();
    return createReadStream(filePath, { start, end }).pipe(res);
  }

  res.writeHead(200, { ...headers, 'Content-Length': stats.size });
  if (req.method === 'HEAD') return res.end();
  return createReadStream(filePath).pipe(res);
}

createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end('Method Not Allowed');
  }

  try {
    const filePath = resolveRequestPath(req.url || '/');
    if (!filePath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found');
    }
    return sendFile(req, res, filePath);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Papsnet homepage is listening on port ${port}`);
});
