import snapshot from '../src/data/blind75-problems.json' with { type: 'json' };
import { getThreeTestCases } from '../src/data/testCases.js';
import { buildProgram } from '../src/lib/goProgram.js';
import { matches } from '../src/lib/goProblemRunner.js';

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
const twoSum = { id: 'two-integer-sum' };
if (!matches(twoSum, [0, 1], [0, 1], 'nums=[3,4,5,6]\ntarget=7')) failures.push('two-integer-sum: valid JSON result should pass');
if (matches(twoSum, [0, 0], [0, 1], 'nums=[3,4,5,6]\ntarget=7')) failures.push('two-integer-sum: duplicate index should fail');
if (matches(twoSum, [0, 3], [0, 1], 'nums=[3,4,5,6]\ntarget=7')) failures.push('two-integer-sum: incorrect pair should fail');
if (failures.length) throw new Error(`Fixture verification failed:\n${failures.join('\n')}`);
console.log(`Verified ${snapshot.problems.length} Go problems and ${snapshot.problems.length * 3} generated Go test programs.`);
process.exit(0);
