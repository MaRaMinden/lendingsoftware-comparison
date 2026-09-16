import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const prerender = true;

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  // Resolved relative to the project root, which is the cwd during `vite build`.
  const path = join(process.cwd(), 'static', 'data', 'solutions', 'index.json');
  const { solutions } = JSON.parse(readFileSync(path, 'utf-8'));
  return solutions.map((id) => ({ id }));
}
