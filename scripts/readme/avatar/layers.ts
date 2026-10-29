// Writes the polaroid's two still layers, the frame under mini Chanlito and
// the tape and sticker over him, for film.py to put him between.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { polaroidBase, polaroidOver } from '../src/polaroid';

const OUT = join(import.meta.dir, 'out');
mkdirSync(OUT, { recursive: true });
for (const t of ['light', 'dark'] as const) {
  writeFileSync(join(OUT, `base-${t}.svg`), polaroidBase(t, 'en'));
  writeFileSync(join(OUT, `over-${t}.svg`), polaroidOver(t, 'en'));
}
