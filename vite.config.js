import { defineConfig } from 'vite';

function pagesBase(base) {
  if (!base || base === '/') return '/';
  return `/${base.replace(/^\/+|\/+$/g, '')}/`;
}

export default defineConfig(({ command }) => ({
  ...(command === 'build' ? { publicDir: false } : {}),
  ...(process.env.GITHUB_PAGES_BASE ? { base: pagesBase(process.env.GITHUB_PAGES_BASE) } : {}),
  worker: { format: 'iife' },
}));
