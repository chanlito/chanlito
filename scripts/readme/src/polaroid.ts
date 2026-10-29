// The home page polaroid (Polaroid.astro + Avatar.astro) as two still layers:
// the frame and photo under mini Chanlito, and the tape and sticker over him.
// avatar.py films him into the photo between the two.
import { copy, type Lang } from './content';
import { ACCENT, PALETTE, svgDoc, sticker, tape, text, resetGlyphs, type Theme } from './kit';

export const POLAROID = {
  w: 330,
  h: 420,
  frame: { x: 30, y: 34, w: 260, h: 350 },
  photo: { x: 30 + 12, y: 34 + 12, w: 236, h: 295 },
  rotate: 4,
};

export function polaroidBase(t: Theme, lang: Lang) {
  resetGlyphs();
  const P = PALETTE[t];
  const { frame: f, photo: ph } = POLAROID;
  const c = copy[lang];
  const body = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ACCENT.sky}"/><stop offset="1" stop-color="#e9f5ff"/></linearGradient></defs>
<rect x="${f.x + 6}" y="${f.y + 6}" width="${f.w}" height="${f.h}" fill="${P.shadow}"/>
<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="${P.photo}" stroke="${P.line}" stroke-width="2.5"/>
<rect x="${ph.x}" y="${ph.y}" width="${ph.w}" height="${ph.h}" fill="url(#sky)"/>
${text(c.place, f.x + f.w / 2, f.y + f.h - 17, { size: lang === 'km' ? 21 : 24, weight: 700, anchor: 'middle', fill: '#1e1b2e' }).svg}`;
  return svgDoc(POLAROID.w, POLAROID.h, body);
}

export function polaroidOver(t: Theme, lang: Lang) {
  resetGlyphs();
  const P = PALETTE[t];
  const { frame: f, photo: ph } = POLAROID;
  const c = copy[lang];
  const body = `<rect x="${ph.x}" y="${ph.y}" width="${ph.w}" height="${ph.h}" fill="none" stroke="#1e1b2e" stroke-width="2"/>
${tape(f.x + f.w / 2, f.y + 2, -6, 104, 28)}
${sticker(t, c.shipping, f.x + f.w - 34, f.y + 62, { bg: ACCENT.mint, size: lang === 'km' ? 13 : 15, rotate: 7, h: 34, padX: 13 }).svg}`;
  return svgDoc(POLAROID.w, POLAROID.h, body);
}
