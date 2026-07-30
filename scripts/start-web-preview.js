'use strict';

const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BRIDGE_PORT = 8787;
const API_URL = `http://127.0.0.1:${BRIDGE_PORT}`;
const children = new Set();

function portIsOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const finish = (open) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(350);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

function startNode(script, args = [], env = process.env) {
  const child = spawn(process.execPath, [script, ...args], {
    cwd: ROOT,
    env,
    stdio: 'inherit',
  });
  children.add(child);
  child.once('exit', () => children.delete(child));
  return child;
}

function stopChildren() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

async function main() {
  if (!(await portIsOpen(BRIDGE_PORT))) {
    const bridge = startNode(path.join(ROOT, 'scripts', 'dev-api-proxy.js'));
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 450);
      bridge.once('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
      bridge.once('exit', (code) => {
        if (code && code !== 0) {
          clearTimeout(timer);
          reject(new Error(`Local API bridge stopped with code ${code}`));
        }
      });
    });
  }

  const expo = startNode(
    path.join(ROOT, 'node_modules', 'expo', 'bin', 'cli'),
    ['start', '--web'],
    { ...process.env, EXPO_PUBLIC_API_URL: API_URL },
  );

  expo.once('exit', (code) => {
    stopChildren();
    process.exitCode = code ?? 0;
  });
}

process.once('SIGINT', () => {
  stopChildren();
  process.exit(130);
});
process.once('SIGTERM', () => {
  stopChildren();
  process.exit(143);
});

main().catch((error) => {
  console.error(error.message);
  stopChildren();
  process.exitCode = 1;
});
