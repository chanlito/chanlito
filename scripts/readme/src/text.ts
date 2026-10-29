// Text as SVG paths. GitHub serves README images with a CSP that blocks
// web fonts, so every letter is drawn as an outline: harfbuzz shapes the
// text (Khmer needs real shaping), and the glyph outlines go into one <path>.
import hbp from 'harfbuzzjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const hb: any = await hbp;
const FONT_DIR = join(import.meta.dir, '..', 'fonts');

export type Family = 'sans' | 'hand';

const FILES = {
  sans: 'google-sans-latin.ttf',
  khmer: 'google-sans-khmer.ttf',
  hand: 'caveat-latin.ttf',
} as const;
type FontKey = keyof typeof FILES;

const faces = new Map<FontKey, { face: any; upem: number }>();
const fonts = new Map<string, any>();

function face(key: FontKey) {
  let f = faces.get(key);
  if (!f) {
    const blob = hb.createBlob(readFileSync(join(FONT_DIR, FILES[key])));
    const fc = hb.createFace(blob, 0);
    f = { face: fc, upem: fc.upem };
    faces.set(key, f);
  }
  return f;
}

function font(key: FontKey, wght: number) {
  const id = `${key}:${wght}`;
  let f = fonts.get(id);
  if (!f) {
    f = hb.createFont(face(key).face);
    f.setVariations({ wght });
    fonts.set(id, f);
  }
  return f;
}

const isKhmer = (c: number) =>
  (c >= 0x1780 && c <= 0x17ff) || (c >= 0x19e0 && c <= 0x19ff) || (c >= 0x200b && c <= 0x200d);

/** Caveat is smaller than Google Sans at the same size, and has no Khmer, so
 * Khmer in handwriting falls back to Google Sans a little smaller, like the site. */
const KHMER_IN_HAND = 0.78;

export interface TextOpts {
  family?: Family;
  weight?: number;
  size?: number;
  /** Extra space between letters, in em. */
  tracking?: number;
}

interface Run {
  key: FontKey;
  text: string;
}

function runs(text: string, family: Family): Run[] {
  const base: FontKey = family;
  const out: Run[] = [];
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    // Spaces and punctuation stay with the run they're in.
    const neutral = /[\s!?.,:;'"()\-–—…«»]/.test(ch);
    let key: FontKey = isKhmer(c) ? 'khmer' : base;
    const last = out[out.length - 1];
    if (neutral && last) key = last.key;
    if (last && last.key === key) last.text += ch;
    else out.push({ key, text: ch });
  }
  return out;
}

interface Glyph {
  key: FontKey;
  wght: number;
  g: number;
  x: number; // pen position in px
  y: number;
  scale: number;
}

function shape(text: string, o: TextOpts): { glyphs: Glyph[]; width: number } {
  const family = o.family ?? 'sans';
  const size = o.size ?? 16;
  const wght = o.weight ?? 400;
  const glyphs: Glyph[] = [];
  let pen = 0;
  for (const r of runs(text, family)) {
    const sz = r.key === 'khmer' && family === 'hand' ? size * KHMER_IN_HAND : size;
    const f = font(r.key, r.key === 'khmer' && family === 'hand' ? Math.min(wght, 600) : wght);
    const scale = sz / face(r.key).upem;
    const buf = hb.createBuffer();
    buf.addText(r.text);
    buf.guessSegmentProperties();
    hb.shape(f, buf);
    for (const g of buf.json()) {
      glyphs.push({ key: r.key, wght, g: g.g, x: pen + g.dx * scale, y: g.dy * scale, scale });
      pen += g.ax * scale + (g.ax ? (o.tracking ?? 0) * size : 0);
    }
    buf.destroy();
  }
  return { glyphs, width: pen - (o.tracking ?? 0) * size };
}

export function measure(text: string, o: TextOpts = {}) {
  return shape(text, o).width;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

// Each glyph is drawn once in <defs> (in font units) and placed with <use>,
// which keeps text-heavy images small. resetGlyphs() starts a new document.
const glyphDefs = new Map<string, string>();
const glyphIds = new Map<string, string>();
export function resetGlyphs() {
  glyphDefs.clear();
  glyphIds.clear();
}
export function glyphDefsSvg() {
  return [...glyphDefs.values()].join('');
}
function glyphRef(gl: Glyph, family: Family | undefined) {
  const wght = gl.key === 'khmer' && family === 'hand' ? Math.min(gl.wght, 600) : gl.wght;
  const key = `${gl.key}:${wght}:${gl.g}`;
  let gid = glyphIds.get(key);
  if (gid === undefined) {
    const raw: string = font(gl.key, wght).glyphToPath(gl.g);
    gid = raw ? 'g' + glyphIds.size.toString(36) : '';
    glyphIds.set(key, gid);
    if (raw) glyphDefs.set(key, `<path id="${gid}" d="${raw.replace(/,/g, ' ').replace(/([A-Z]) /g, '$1')}"/>`);
  }
  return gid;
}

/** `text` placed with its baseline starting at (x, y), as <use> elements. */
export function textPath(
  text: string,
  x: number,
  y: number,
  o: TextOpts & { anchor?: 'start' | 'middle' | 'end' } = {},
) {
  const { glyphs, width } = shape(text, o);
  const x0 = o.anchor === 'middle' ? x - width / 2 : o.anchor === 'end' ? x - width : x;
  // Group by scale (Khmer in handwriting is drawn smaller).
  const groups = new Map<number, string[]>();
  for (const gl of glyphs) {
    const gid = glyphRef(gl, o.family);
    if (!gid) continue;
    const list = groups.get(gl.scale) ?? [];
    const gx = Math.round((gl.x / gl.scale) * 10) / 10;
    const gy = Math.round((-gl.y / gl.scale) * 10) / 10;
    list.push(`<use href="#${gid}" x="${gx}"${gy ? ` y="${-gy}"` : ''}/>`);
    groups.set(gl.scale, list);
  }
  let d = '';
  for (const [scale, uses] of groups)
    d += `<g transform="translate(${r2(x0)} ${r2(y)}) scale(${+scale.toFixed(5)} ${-+scale.toFixed(5)})">${uses.join('')}</g>`;
  return { d, width, x0, x1: x0 + width };
}

/** The glyphs of `str` in a <g>. */
export function text(
  str: string,
  x: number,
  y: number,
  o: TextOpts & { anchor?: 'start' | 'middle' | 'end'; fill?: string; cls?: string; attrs?: string } = {},
) {
  const p = textPath(str, x, y, o);
  const fill = o.fill ? ` fill="${o.fill}"` : '';
  const cls = o.cls ? ` class="${o.cls}"` : '';
  return { svg: `<g${cls}${fill}${o.attrs ? ' ' + o.attrs : ''}>${p.d}</g>`, width: p.width, x0: p.x0, x1: p.x1 };
}

/** Breaks `str` into lines no wider than `max`, at spaces and at zero-width
 * spaces (U+200B), which mark where Khmer words may break. */
export function wrap(str: string, max: number, o: TextOpts = {}) {
  const words = str.split(/(?<= )|(?<=\u200b)/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line + w;
    if (line && measure(next.trimEnd(), o) > max) {
      lines.push(line.trimEnd());
      line = w;
    } else line = next;
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines;
}
