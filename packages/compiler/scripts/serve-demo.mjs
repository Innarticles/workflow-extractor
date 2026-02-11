import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.cwd(), 'demo');
const port = Number(process.env.PORT ?? 3000);

const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

const serveFile = async (path, response) => {
  try {
    const data = await readFile(path);
    const extension = extname(path);
    response.writeHead(200, {
      'Content-Type': contentTypes[extension] ?? 'application/octet-stream',
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
};

const normalizePath = (url) => {
  if (url === '/' || url === '/demo' || url === '/demo/') {
    return '/index.html';
  }

  if (url.startsWith('/demo/')) {
    return url.replace('/demo', '');
  }

  return url;
};

const server = createServer(async (request, response) => {
  const requestUrl = request.url ?? '/';
  const host = request.headers.host ?? `localhost:${port}`;
  const { pathname } = new URL(requestUrl, `http://${host}`);
  const normalized = normalizePath(pathname);
  const filePath = join(root, normalized);
  await serveFile(filePath, response);
});

server.listen(port, () => {
  console.log(`Demo server running at http://localhost:${port}/demo/index.html`);
});
