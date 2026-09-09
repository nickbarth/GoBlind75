import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
await exec('bun', ['run', 'build:go'], { cwd: process.cwd(), stdio: 'inherit' });
await exec('bunx', ['vite', 'build'], { cwd: process.cwd(), stdio: 'inherit' });
