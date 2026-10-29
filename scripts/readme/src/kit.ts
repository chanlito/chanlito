// The Sticker Book / Scrapbook look from chanlito.dev, as SVG building blocks.
// Colors match src/styles/global.css on the site.
import { text, textPath, measure, wrap, resetGlyphs, glyphDefsSvg, type TextOpts } from './text';
export { text, textPath, measure, wrap, resetGlyphs };

export type Theme = 'light' | 'dark';

export const ACCENT = {
  mango: '#ffc83d',
  sky: '#7dbcf0',
  mint: '#5adbb4',
  onAccent: '#1e1b2e',
};

export const PALETTE = {
  light: {
    paper: '#fffbef',
    ink: '#1e1b2e',
    muted: '#575270',
    card: '#ffffff',
    line: '#1e1b2e',
    tangerine: '#ff6b35',
    rule: '#e3ecf1',
    margin: '#ffb59a',
    photo: '#ffffff',
    pencil: '#1e1b2e',
    shadow: '#1e1b2e',
    /** The hero sheet's fill; 'none' draws only the rules, straight on GitHub's page. */
    sheet: '#fffbef',
    label: '#fffbef',
  },
  // GitHub's dark page (#0d1117) isn't the site's purple, so the hero has no
  // sheet in dark mode: its rules go straight on the page. Cards, labels and
  // buttons stay the site's purple stickers with cream outlines.
  dark: {
    paper: '#16132a',
    ink: '#fff6da',
    muted: '#cfc8e3',
    card: '#221e3b',
    line: '#fff6da',
    tangerine: '#ff7a4a',
    rule: '#38325f',
    margin: '#6b3a5c',
    photo: '#fff6da',
    pencil: '#1e1b2e',
    shadow: '#fff6da',
    sheet: 'none',
    label: '#221e3b',
  },
};

/** Notebook rules: 32px apart, each 22px down its gap, so text with its
 * baseline on 22 + 32k sits on a rule (the site's --rule-gap and --rule-at). */
export const GAP = 32;
export const AT = 22;
export const rule = (k: number, top = 0) => top + AT + GAP * k;

export const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/** Shared CSS: the animations every piece can use. Each animation runs from
 * its start state to the element's normal look ("backwards" fill), so with
 * reduced motion, or anywhere animations don't run, the finished picture shows. */
export function baseCss(extra = '') {
  return `
.pop{transform-box:fill-box;transform-origin:center;animation:pop .7s ${SPRING} backwards}
.drop{transform-box:fill-box;transform-origin:50% 0;animation:drop .8s ${SPRING} backwards}
.draw{stroke-dasharray:1;animation:draw .9s ease-out backwards}
.write{animation:write 1s steps(24,end) backwards}
.swing{transform-box:fill-box;transform-origin:50% 0;animation:swing 1.4s ease-out backwards}
.fade{animation:fade .6s ease-out backwards}
.rise{animation:rise .6s ${SPRING} backwards}
@keyframes pop{0%{transform:scale(0) rotate(-12deg);opacity:0}60%{opacity:1}}
@keyframes drop{0%{transform:translateY(-40px) rotate(-8deg);opacity:0}50%{opacity:1}}
@keyframes draw{0%{stroke-dashoffset:1}}
@keyframes write{0%{clip-path:inset(0 100% 0 0)}100%{clip-path:inset(0 0 0 0)}}
@keyframes swing{0%{transform:rotate(9deg)}20%{transform:rotate(-6deg)}40%{transform:rotate(4deg)}60%{transform:rotate(-2deg)}80%{transform:rotate(1deg)}100%{transform:rotate(0)}}
@keyframes fade{0%{opacity:0}}
@keyframes rise{0%{transform:translateY(14px);opacity:0}}
${extra}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;
}

export const delay = (s: number) => `style="animation-delay:${s}s"`;

export function svgDoc(w: number, h: number, body: string, opts: { css?: string; title?: string } = {}) {
  const defs = glyphDefsSvg();
  resetGlyphs();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"${
    opts.title ? ` aria-label="${esc(opts.title)}"` : ''
  }>${opts.title ? `<title>${esc(opts.title)}</title>` : ''}<style>${baseCss(opts.css)}</style><defs>${defs}</defs>${body}</svg>`;
}

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;
export const id = (p: string) => `${p}${++uid}`;

/** A sheet of ruled notebook paper with the red margin line, as a sticker:
 * thick outline and a hard offset shadow. Rules count from the top of the svg. */
export function paper(
  t: Theme,
  x: number,
  y: number,
  w: number,
  h: number,
  o: { margin?: number | false; radius?: number; shadow?: number; rulesFrom?: number } = {},
) {
  const P = PALETTE[t];
  const r = o.radius ?? 18;
  const sh = o.shadow ?? 6;
  const pid = id('rules');
  const cid = id('clip');
  const marginX = o.margin === false ? null : x + (o.margin ?? 56);
  if (P.sheet === 'none') {
    // No sheet: faint rules and the margin line drawn on whatever page is
    // behind the image, fading out at the edges so there is no box.
    const fx = id('fadex');
    const fy = id('fadey');
    const mid = id('fade');
    return `<defs><pattern id="${pid}" width="8" height="${GAP}" patternUnits="userSpaceOnUse" y="${o.rulesFrom ?? 0}"><rect y="${AT}" width="8" height="1" fill="${P.line}" fill-opacity=".13"/></pattern>
<linearGradient id="${fx}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff"/><stop offset=".82" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="${fy}" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".1" stop-color="#fff"/><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="${mid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${fx})"/></mask><mask id="${mid}y"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${fy})"/></mask></defs>
<g mask="url(#${mid}y)"><g mask="url(#${mid})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${pid})"/></g>${
      marginX !== null ? `<rect x="${marginX}" y="${y}" width="2" height="${h}" fill="${P.tangerine}" fill-opacity=".45"/>` : ''
    }</g>`;
  }
  return `<defs><pattern id="${pid}" width="8" height="${GAP}" patternUnits="userSpaceOnUse" y="${o.rulesFrom ?? 0}"><rect y="${AT}" width="8" height="1" fill="${P.rule}"/></pattern><clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath></defs>
<rect x="${x + sh}" y="${y + sh}" width="${w}" height="${h}" rx="${r}" fill="${P.shadow}"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${P.sheet}"/>
<g clip-path="url(#${cid})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${pid})"/>${
    marginX !== null ? `<rect x="${marginX}" y="${y}" width="2" height="${h}" fill="${P.margin}"/>` : ''
  }</g>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${P.line}" stroke-width="2.5"/>`;
}

/** A pill or rounded sticker with a label, centered on (cx, cy). */
export function sticker(
  t: Theme,
  label: string,
  cx: number,
  cy: number,
  o: {
    bg?: string;
    fg?: string;
    size?: number;
    weight?: number;
    family?: 'sans' | 'hand';
    padX?: number;
    h?: number;
    radius?: number;
    rotate?: number;
    shadow?: number;
    cls?: string;
    style?: string;
    stroke?: number;
  } = {},
) {
  const P = PALETTE[t];
  const size = o.size ?? 16;
  const weight = o.weight ?? 700;
  const tw = measure(label, { size, weight, family: o.family });
  const padX = o.padX ?? 16;
  const w = tw + padX * 2;
  const h = o.h ?? size * 2.4;
  const r = o.radius ?? h / 2;
  const sh = o.shadow ?? 3;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const bg = o.bg ?? P.card;
  const fg = o.fg ?? (o.bg && o.bg !== P.card ? ACCENT.onAccent : P.ink);
  // Optical baseline: center the x-height-ish band.
  const base = cy + size * 0.36;
  const lbl = text(label, cx, base, { size, weight, family: o.family, anchor: 'middle', fill: fg });
  const g = `<rect x="${x + sh}" y="${y + sh}" width="${w}" height="${h}" rx="${r}" fill="${P.shadow}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${bg}" stroke="${P.line}" stroke-width="${o.stroke ?? 2.5}"/>${lbl.svg}`;
  const rot = o.rotate ? ` transform="rotate(${o.rotate} ${cx} ${cy})"` : '';
  return {
    svg: `<g${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''}><g${rot}>${g}</g></g>`,
    w,
    h,
  };
}

/** Striped washi tape, centered on (cx, cy). */
export function tape(cx: number, cy: number, rot = -4, w = 104, h = 28, cls = '', style = '') {
  const pid = id('tape');
  return `<defs><pattern id="${pid}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="#ffc83d" fill-opacity=".88"/><rect x="8" width="8" height="16" fill="#ffffff" fill-opacity=".72"/></pattern></defs><g${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''}><g transform="rotate(${rot} ${cx} ${cy})"><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="url(#${pid})"/><path d="M${cx - w / 2} ${cy - h / 2}v${h}M${cx + w / 2} ${cy - h / 2}v${h}" stroke="#1e1b2e" stroke-opacity=".3" stroke-width="2" stroke-dasharray="3 3"/></g></g>`;
}

/** A push pin, seen from above. */
export function pin(cx: number, cy: number, color: string, t: Theme) {
  const P = PALETTE[t];
  return `<circle cx="${cx + 1.5}" cy="${cy + 1.5}" r="8" fill="${P.shadow}"/><circle cx="${cx}" cy="${cy}" r="8" fill="${color}" stroke="${P.line}" stroke-width="2.5"/><circle cx="${cx - 2.5}" cy="${cy - 2.5}" r="2.2" fill="#fff" fill-opacity=".7"/>`;
}

/** A loose hand-drawn ellipse around a box, as a self-drawing stroke. */
export function scribbleRing(x: number, y: number, w: number, h: number, color: string, d0 = 0.6) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2 + 12;
  const ry = h / 2 + 10;
  // Starts top-right, goes round once and a bit more, a little off.
  const p = `M${cx + rx * 0.55} ${cy - ry * 1.02} C ${cx + rx * 1.12} ${cy - ry * 0.85}, ${cx + rx * 1.08} ${cy + ry * 0.95}, ${cx} ${cy + ry} C ${cx - rx * 1.1} ${cy + ry * 1.02}, ${cx - rx * 1.06} ${cy - ry * 0.98}, ${cx - rx * 0.05} ${cy - ry * 1.04} C ${cx + rx * 0.4} ${cy - ry * 1.08}, ${cx + rx * 0.8} ${cy - ry * 0.98}, ${cx + rx * 0.98} ${cy - ry * 0.7}`;
  return `<path class="draw" style="animation-delay:${d0}s" pathLength="1" d="${p}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`;
}

/** A hand-drawn curved arrow from (x1,y1) to (x2,y2). */
export function arrow(x1: number, y1: number, x2: number, y2: number, color: string, d0 = 1, bend = 0.35) {
  const mx = (x1 + x2) / 2 + (y2 - y1) * bend;
  const my = (y1 + y2) / 2 - (x2 - x1) * bend;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const a1 = ang + Math.PI * 0.82;
  const a2 = ang - Math.PI * 0.82;
  const L = 12;
  const head = `M${x2 + Math.cos(a1) * L} ${y2 + Math.sin(a1) * L} L${x2} ${y2} L${x2 + Math.cos(a2) * L} ${y2 + Math.sin(a2) * L}`;
  return `<path class="draw" style="animation-delay:${d0}s" pathLength="1" d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/><path class="draw" style="animation-delay:${d0 + 0.5}s" pathLength="1" d="${head}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** Handwritten text that writes itself in from the left. */
export function hand(t: Theme, s: string, x: number, y: number, o: TextOpts & { fill?: string; rotate?: number; d0?: number; anchor?: 'start' | 'middle' | 'end' } = {}) {
  const P = PALETTE[t];
  const tx = text(s, x, y, { family: 'hand', weight: 700, size: 28, ...o, fill: o.fill ?? P.tangerine });
  const rot = o.rotate ? ` transform="rotate(${o.rotate} ${tx.x0} ${y})"` : '';
  return { svg: `<g${rot}><g class="write" style="animation-delay:${o.d0 ?? 0.8}s">${tx.svg}</g></g>`, width: tx.width, x0: tx.x0, x1: tx.x1 };
}

/** Round flag stickers: the US for English, Cambodia for Khmer, Cuba for Spanish. */
export function flag(kind: 'en' | 'km' | 'es', cx: number, cy: number, r: number, t: Theme) {
  const P = PALETTE[t];
  const cid = id('flag');
  const x = cx - r * 1.5;
  const y = cy - r;
  const W = r * 3;
  const H = r * 2;
  let art = '';
  if (kind === 'en') {
    const sh = H / 13;
    for (let i = 0; i < 13; i++) art += `<rect x="${x}" y="${y + i * sh}" width="${W}" height="${sh}" fill="${i % 2 ? '#fff' : '#d22f3c'}"/>`;
    art += `<rect x="${x}" y="${y}" width="${W * 0.45}" height="${sh * 7}" fill="#2b3a8c"/>`;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) art += `<circle cx="${x + W * 0.06 + j * W * 0.11}" cy="${y + sh * 1.2 + i * sh * 2.3}" r="${r * 0.07}" fill="#fff"/>`;
  } else if (kind === 'km') {
    art = `<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="#0b3fa8"/><rect x="${x}" y="${y + H / 4}" width="${W}" height="${H / 2}" fill="#e01e37"/>`;
    // Angkor Wat, simplified: a base, three towers.
    const bx = cx, by = cy + r * 0.28, u = r * 0.12;
    art += `<path fill="#fff" stroke="#1e1b2e" stroke-width="${u * 0.35}" d="M${bx - 6 * u} ${by}h${12 * u}v${-u}h${-12 * u}z M${bx - 5 * u} ${by - u}v${-1.6 * u}l${0.8 * u} ${-2 * u}l${0.8 * u} ${2 * u}h${1.6 * u}l${0.8 * u} ${-3 * u}l${0.8 * u} ${3 * u}h${1.6 * u}l${0.8 * u} ${-2 * u}l${0.8 * u} ${2 * u}v${1.6 * u}z"/>`;
  } else {
    const sh = H / 5;
    for (let i = 0; i < 5; i++) art += `<rect x="${x}" y="${y + i * sh}" width="${W}" height="${sh}" fill="${i % 2 ? '#fff' : '#1f4ea3'}"/>`;
    art += `<path d="M${x} ${y}L${x + W * 0.5} ${cy}L${x} ${y + H}z" fill="#d22f3c"/>`;
    const sx = x + W * 0.17, sy = cy, sr = r * 0.32;
    let st = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? sr * 0.42 : sr;
      st += `${i ? 'L' : 'M'}${sx + Math.cos(a) * rr} ${sy + Math.sin(a) * rr}`;
    }
    art += `<path d="${st}z" fill="#fff"/>`;
  }
  return `<defs><clipPath id="${cid}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs><circle cx="${cx + 2.5}" cy="${cy + 2.5}" r="${r}" fill="${P.shadow}"/><g clip-path="url(#${cid})">${art}</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${P.line}" stroke-width="2.5"/>`;
}

/** Writes `lines` with baselines on consecutive rules. */
export function lines(ls: string[], x: number, firstRuleY: number, o: TextOpts & { fill: string; cls?: string; d0?: number; step?: number }) {
  return ls
    .map((l, i) => {
      const tx = text(l, x, firstRuleY + i * GAP, o);
      return o.cls ? `<g class="${o.cls}" style="animation-delay:${(o.d0 ?? 0) + i * (o.step ?? 0.08)}s">${tx.svg}</g>` : tx.svg;
    })
    .join('');
}
