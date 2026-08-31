import { mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
await exec('bun', ['run', 'build:go'], { cwd: process.cwd(), stdio: 'inherit' });
await exec('bunx', ['vite', 'build'], { cwd: process.cwd(), stdio: 'inherit' });
await mkdir(new URL('../dist/go/', import.meta.url), { recursive: true });
for (const file of ['runner.wasm', 'wasm_exec.js']) {
  await exec('cp', [new URL(`../public/go/${file}`, import.meta.url).pathname, new URL(`../dist/go/${file}`, import.meta.url).pathname]);
}
