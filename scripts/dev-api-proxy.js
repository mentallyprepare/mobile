'use strict';

const http = require('http');
const https = require('https');

const HOST = '127.0.0.1';
const PORT = 8787;
const TARGET = new URL('https://mymentallyprepare.com');
const ALLOWED_ORIGINS = new Set([
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8082',
  'http://127.0.0.1:8082',
]);

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
    Vary: 'Origin',
  };
}

const server = http.createServer((request, response) => {
  const origin = request.headers.origin || '';
  if (!ALLOWED_ORIGINS.has(origin)) {
    response.writeHead(403, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Local preview origin not allowed' }));
    return;
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders(origin));
    response.end();
    return;
  }

  if (!request.url?.startsWith('/api/')) {
    response.writeHead(404, {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
    });
    response.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const headers = {
    accept: request.headers.accept || 'application/json',
    'content-type': request.headers['content-type'] || 'application/json',
    'user-agent': 'MentallyPrepareLocalPreview/1.0',
  };
  if (request.headers.authorization) {
    headers.authorization = request.headers.authorization;
  }

  const upstream = https.request(
    {
      protocol: TARGET.protocol,
      hostname: TARGET.hostname,
      port: 443,
      method: request.method,
      path: request.url,
      headers,
    },
    (upstreamResponse) => {
      const responseHeaders = { ...upstreamResponse.headers };
      delete responseHeaders['access-control-allow-origin'];
      delete responseHeaders['access-control-allow-credentials'];
      delete responseHeaders['transfer-encoding'];
      delete responseHeaders.connection;
      delete responseHeaders['set-cookie'];

      response.writeHead(upstreamResponse.statusCode || 502, {
        ...responseHeaders,
        ...corsHeaders(origin),
      });
      upstreamResponse.pipe(response);
    },
  );

  upstream.on('error', () => {
    if (response.headersSent) return response.end();
    response.writeHead(502, {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
    });
    response.end(JSON.stringify({ error: 'Production API is unavailable' }));
  });

  request.pipe(upstream);
});

server.listen(PORT, HOST, () => {
  console.log(`Local API bridge ready at http://${HOST}:${PORT}`);
});
