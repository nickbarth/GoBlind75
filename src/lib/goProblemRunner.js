import GoWorker from './goRuntime.worker.js?worker&inline';
import { getThreeTestCases } from '../data/testCases.js';
import { buildProgram, readProgramOutput } from './goProgram.js';

const TIMEOUT_MS = 5_000;

function useRuntime(message) {
  return new Promise((resolve) => {
    const worker = new GoWorker();
    const timeout = window.setTimeout(() => { worker.terminate(); resolve({ error: `Timed out after ${TIMEOUT_MS / 1000} seconds.` }); }, TIMEOUT_MS);
    worker.onmessage = ({ data }) => { window.clearTimeout(timeout); worker.terminate(); resolve(data.ok ? { results: data.results, result: data.result } : { error: data.error }); };
    worker.onerror = (event) => { window.clearTimeout(timeout); worker.terminate(); resolve({ error: event.message || 'The Go test worker stopped before returning a result.' }); };
    worker.postMessage({ ...message, runtimeBase: import.meta.env.BASE_URL });
  });
}

function runSources(sources) { return useRuntime({ sources }); }

export async function formatGoCode(source) {
  const response = await useRuntime({ action: 'format', source });
  if (response.error) throw new Error(response.error);
  const result = response.results ?? response.result;
  if (result?.error) throw new Error(result.error);
  return result?.source ?? source;
}

function canonical(value) { return JSON.stringify(value); }
function sortNested(value) { return !Array.isArray(value) ? value : value.map((item) => Array.isArray(item) ? [...item].sort() : item).sort((a, b) => canonical(a).localeCompare(canonical(b))); }
// These problems explicitly allow their output (and, for combinations, the
// values within each result) to be returned in any order. Word Search II has
// the same contract when it asks for all matching words.
const UNORDERED = new Set([
  'anagram-groups',
  'top-k-elements-in-list',
  'three-integer-sum',
  'combination-target-sum',
  'search-for-word-ii',
  'pacific-atlantic-water-flow',
  'merge-intervals',
]);
function matches(problem, actual, expected, raw) {
  if (problem.id === 'two-integer-sum') { const { values } = JSON.parse(JSON.stringify({ values: {} })); const entries = raw.split(/\r?\n/).map((line) => line.split('=')); for (const [key, value] of entries) values[key] = JSON.parse(value); const pair = String(actual).match(/^\[(-?\d+) (-?\d+)\]$/); return Boolean(pair) && pair[1] !== pair[2] && values.nums[Number(pair[1])] + values.nums[Number(pair[2])] === values.target; }
  if (problem.id === 'longest-palindromic-substring') { const s = JSON.parse(raw.split('=')[1]); return typeof actual === 'string' && s.includes(actual) && actual === [...actual].reverse().join('') && actual.length === expected.length; }
  const left = UNORDERED.has(problem.id) ? sortNested(actual) : actual;
  const right = UNORDERED.has(problem.id) ? sortNested(expected) : expected;
  return canonical(left) === canonical(right);
}

export async function runProblem(problem, code) {
  const raws = getThreeTestCases(problem);
  let userSources; let referenceSources;
  try { userSources = raws.map((raw) => buildProgram(problem, code, raw)); referenceSources = raws.map((raw) => buildProgram(problem, problem.referenceCode, raw)); }
  catch (error) { return raws.map((raw) => ({ raw, passed: false, error: error instanceof Error ? error.message : String(error), logs: [] })); }
  const response = await runSources([...referenceSources, ...userSources]);
  if (response.error) return raws.map((raw) => ({ raw, passed: false, error: response.error, logs: [] }));
  return raws.map((raw, index) => {
    const expectedRun = readProgramOutput(response.results[index]?.stdout);
    const actualRun = readProgramOutput(response.results[index + raws.length]?.stdout);
    const error = expectedRun.error || actualRun.error || response.results[index]?.error || response.results[index + raws.length]?.error || response.results[index]?.stderr || response.results[index + raws.length]?.stderr;
    return error ? { raw, passed: false, error, logs: actualRun.stdout } : { raw, expected: expectedRun.result, actual: actualRun.result, passed: matches(problem, actualRun.result, expectedRun.result, raw), logs: actualRun.stdout };
  });
}
