import { mkdir, copyFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const output = new URL('../public/go/', import.meta.url);
const moduleDir = new URL('../go-runner/', import.meta.url);
const { stdout: goRoot } = await exec('go', ['env', 'GOROOT']);
const wasmExec = new URL(`lib/wasm/wasm_exec.js`, `file://${goRoot.trim()}/`);

await mkdir(output, { recursive: true });
await copyFile(wasmExec, new URL('wasm_exec.js', output));
await exec('go', ['build', '-trimpath', '-buildvcs=false', '-ldflags', '-s -w', '-o', new URL('runner.wasm', output).pathname, '.'], {
  cwd: moduleDir.pathname,
  env: { ...process.env, GOOS: 'js', GOARCH: 'wasm' },
  maxBuffer: 1024 * 1024 * 10,
});
