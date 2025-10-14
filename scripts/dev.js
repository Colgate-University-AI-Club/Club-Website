#!/usr/bin/env node
const net = require('net');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const HOST = process.env.HOST || '127.0.0.1';
const START_PORT = Number(process.env.PORT || 3000);
const MAX_PORT = START_PORT + 50;

function isPortFree(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.listen({ host, port }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findOpenPort(host, startPort, maxPort) {
  for (let port = startPort; port <= maxPort; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port, host)) return port;
  }
  throw new Error(`No open port found between ${startPort}-${maxPort} on ${host}`);
}

async function main() {
  const port = await findOpenPort(HOST, START_PORT, MAX_PORT);
  const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };

  const portFile = path.join(__dirname, '..', '.next-dev-port');
  try { fs.writeFileSync(portFile, String(port)); } catch (e) {}

  console.log(`Starting Next.js on http://${HOST}:${port}`);

  const child = spawn('next', ['dev', '-p', String(port), '--hostname', HOST], {
    stdio: 'inherit',
    env,
    shell: false,
  });

  const shutdown = () => {
    if (!child.killed) {
      try { child.kill('SIGINT'); } catch (e) {}
    }
    process.exit();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



