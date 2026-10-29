// Writes README.md and the SVGs in assets/ at the root of the repo.
// The polaroid WebPs come from `bun run polaroid` and are left alone.
import { readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readme } from './src/readme';

const ROOT = join(import.meta.dir, '..', '..');
const ASSETS = join(ROOT, 'assets');
for (const f of readdirSync(ASSETS)) if (f.endsWith('.svg')) rmSync(join(ASSETS, f));
writeFileSync(join(ROOT, 'README.md'), readme(ROOT));
console.log('wrote README.md and', readdirSync(ASSETS).filter((f) => f.endsWith('.svg')).length, 'SVGs');
