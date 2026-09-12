import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = process.cwd();
const dist = new URL('../dist/', import.meta.url);

await exec('bun', ['run', 'build'], { cwd: root, stdio: 'inherit' });

const htmlUrl = new URL('index.html', dist);
const html = await readFile(htmlUrl, 'utf8');
const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
const styleMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);
if (!scriptMatch || !styleMatch) throw new Error('Could not find the production JavaScript and CSS assets.');

function assetUrl(reference) {
  const asset = reference.match(/assets\/[^/?#]+/);
  if (!asset) throw new Error(`Unsupported production asset path: ${reference}`);
  return new URL(asset[0], dist);
}

const [script, style] = await Promise.all([readFile(assetUrl(scriptMatch[1]), 'utf8'), readFile(assetUrl(styleMatch[1]), 'utf8')]);
const singleFile = html
  .replace(scriptMatch[0], '__BLIND75_APP_SCRIPT__')
  .replace(styleMatch[0], '__BLIND75_APP_STYLE__')
  .replace('__BLIND75_APP_SCRIPT__', () => `<script type="module">\n${script}\n</script>`)
  .replace('__BLIND75_APP_STYLE__', () => `<style>\n${style}\n</style>`);

await writeFile(new URL('GoBlind75.html', dist), singleFile);
if (process.env.SINGLE_FILE_AS_INDEX === '1') await writeFile(htmlUrl, singleFile);
console.log('Created dist/GoBlind75.html');
