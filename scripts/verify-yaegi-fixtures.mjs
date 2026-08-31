import { execFile } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { promisify } from 'node:util';
import snapshot from '../src/data/blind75-problems.json' with { type: 'json' };
import { getThreeTestCases } from '../src/data/testCases.js';
import { buildProgram, readProgramOutput } from '../src/lib/goProgram.js';

const exec = promisify(execFile);
const runner = new URL('../.cache/yaegi-fixture-runner', import.meta.url).pathname;
const runnerDir = new URL('../go-runner/', import.meta.url).pathname;
await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
await exec('go', ['build', '-buildvcs=false', '-o', runner, '.'], { cwd: runnerDir });

const failures = [];
let checked = 0;
for (const problem of snapshot.problems) {
  for (const raw of getThreeTestCases(problem)) {
    const source = buildProgram(problem, problem.referenceCode, raw);
    try {
      const { stdout } = await exec(runner, [Buffer.from(source).toString('base64')], { maxBuffer: 1024 * 1024 * 4, timeout: 20_000 });
      const result = JSON.parse(stdout);
      const parsed = readProgramOutput(result.stdout);
      if (result.error || result.stderr || parsed.error || parsed.result === undefined) failures.push(`${problem.id}: ${raw} => ${result.error || result.stderr || parsed.error || 'no test result'}`);
      checked += 1;
    } catch (error) {
      failures.push(`${problem.id}: ${raw} => ${error.message}`);
    }
  }
}
if (failures.length) throw new Error(`Yaegi reference verification failed:\n${failures.join('\n')}`);
console.log(`Executed ${checked} Go reference fixtures through Yaegi.`);
