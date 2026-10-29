// Markdown helpers: every image comes in a light and a dark version, picked
// by GitHub's documented <picture> + prefers-color-scheme pattern.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Theme } from './kit';

export class Assets {
  constructor(public dir: string, public rel = 'assets') {
    mkdirSync(join(dir, rel), { recursive: true });
  }
  /** Writes name-light.svg and name-dark.svg; returns the base name. */
  svg(name: string, make: (t: Theme) => string) {
    for (const t of ['light', 'dark'] as const) writeFileSync(join(this.dir, this.rel, `${name}-${t}.svg`), make(t));
    return name;
  }
  pic(name: string, alt: string, attrs = '', ext = 'svg') {
    const r = this.rel;
    return `<picture><source media="(prefers-color-scheme: dark)" srcset="${r}/${name}-dark.${ext}"><img src="${r}/${name}-light.${ext}" alt="${alt.replace(/"/g, '&quot;')}"${attrs ? ' ' + attrs : ''}></picture>`;
  }
}

export const link = (href: string, inner: string) => `<a href="${href}">${inner}</a>`;
