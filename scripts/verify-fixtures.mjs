import snapshot from '../src/data/blind75-problems.json' with { type: 'json' };
import { getThreeTestCases } from '../src/data/testCases.js';
import { buildProgram } from '../src/lib/goProgram.js';

const failures = [];
for (const problem of snapshot.problems) {
  if (!problem.starterCode.includes('func ') && !problem.starterCode.includes('type ')) failures.push(`${problem.id}: missing Go starter code`);
  for (const raw of getThreeTestCases(problem)) {
    try {
      buildProgram(problem, problem.referenceCode, raw);
    } catch (error) {
      failures.push(`${problem.id}: ${raw} => ${error.message}`);
    }
  }
}
if (failures.length) throw new Error(`Fixture verification failed:\n${failures.join('\n')}`);
console.log(`Verified ${snapshot.problems.length} Go problems and ${snapshot.problems.length * 3} generated Go test programs.`);
process.exit(0);
