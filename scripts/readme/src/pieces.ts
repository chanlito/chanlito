// The README's pictures: the hero page, headings, index cards for projects
// and articles, sticker buttons, flag chips.
import { copy, type Lang } from './content';
import {
  ACCENT, PALETTE, GAP, AT, rule, svgDoc, paper, sticker, tape, pin, scribbleRing, squiggle, arrow, hand, chMark, flag,
  text, measure, wrap, lines, id, type Theme,
} from './kit';

/** The hero page that sits left of the polaroid: greeting, name, intro. */
export function hero(t: Theme, lang: Lang, W = 500, H = 420) {
  const P = PALETTE[t];
  const c = copy[lang];
  const km = lang === 'km';
  const X = 62;
  const out: string[] = [];
  const g = sticker(t, c.greeting, 0, 0, { size: 15 });
  out.push(sticker(t, c.greeting, X + g.w / 2, rule(1) - 6, { bg: ACCENT.sky, size: 15, rotate: -2, cls: 'pop', style: 'animation-delay:.2s' }).svg);
  const ts = km ? 31 : 50;
  const tk = km ? 3 : 3;
  const tr = km ? 0 : -0.02;
  out.push(`<g class="rise" style="animation-delay:.35s">${text(c.title, X, rule(tk), { size: ts, weight: 700, fill: P.ink, tracking: tr }).svg}</g>`);
  const before = c.title.slice(0, c.title.indexOf(c.name));
  const nx = X + measure(before, { size: ts, weight: 700, tracking: tr });
  const nw = measure(c.name, { size: ts, weight: 700, tracking: tr });
  out.push(scribbleRing(nx - 2, rule(tk) - ts * 0.8, nw + 4, ts * 0.92, P.tangerine, 0.8));
  const is = km ? 15 : 17;
  const intro = wrap(c.intro, W - X - 46, { size: is });
  out.push(lines(intro, X, rule(tk + 2), { size: is, fill: P.muted, cls: 'fade', d0: 0.6 }));
  // topic stickers, like the site's tags
  const tags = [
    ['TypeScript', ACCENT.mango, -3],
    [km ? 'អហ្វឡាញ' : 'offline-first', ACCENT.mint, 2],
    [km ? 'កម្ពុជា' : lang === 'es' ? 'Camboya' : 'Cambodia', ACCENT.sky, -2],
  ] as const;
  let tx = X;
  const tagK = tk + 2 + intro.length + 1;
  tags.forEach(([label, bg, rot], i) => {
    const s = sticker(t, label, 0, 0, { size: 14, h: 30, padX: 12 });
    out.push(sticker(t, label, tx + s.w / 2, rule(tagK) - 5, { bg, size: 14, h: 30, padX: 12, rotate: rot, cls: 'pop', style: `animation-delay:${1.1 + i * 0.12}s` }).svg);
    tx += s.w + 12;
  });
  // "that's me!" pointing off the page at the polaroid
  const me = hand(t, c.me, W - 40, rule(tagK + 2) - 2, { size: km ? 22 : 30, rotate: -5, d0: 1.6, anchor: 'end' });
  out.push(me.svg);
  out.push(arrow(W - 34, rule(tagK + 2) - 14, W - 8, rule(tagK) - 30, P.tangerine, 2.1, -0.35));
  const body = paper(t, 2, 2, W - 10, H - 10, { margin: 40 }) + out.join('');
  return svgDoc(W, H, body, { title: `${c.title} ${c.intro}` });
}

/** A section heading: the title on a taped paper label, with a handwritten
 * note beside it. The label carries its own background, so it reads on
 * GitHub's light and dark pages alike. */
export function heading(t: Theme, lang: Lang, title: string, note: string, W = 846, d0 = 0.2) {
  const P = PALETTE[t];
  const km = lang === 'km';
  const size = km ? 22 : 25;
  const tw = measure(title, { size, weight: 700 });
  const lx = 6, ly = 12, lw = Math.ceil(tw + 40), lh = 48;
  const label = `<g class="pop" style="animation-delay:${d0}s"><g transform="rotate(-1.2 ${lx + lw / 2} ${ly + lh / 2})">
<rect x="${lx + 4}" y="${ly + 4}" width="${lw}" height="${lh}" rx="8" fill="${P.shadow}"/>
<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="8" fill="${P.label}" stroke="${P.line}" stroke-width="2.5"/>
<rect x="${lx + 1.5}" y="${ly + 38}" width="${lw - 3}" height="1" fill="${P.rule}"/>
${text(title, lx + 20, ly + 33, { size, weight: 700, fill: P.ink }).svg}
</g></g>${tape(lx + 10, ly + 4, -38, 46, 18, 'pop', `animation-delay:${d0 + 0.25}s`)}`;
  const n = note ? hand(t, note, lx + lw + 22, ly + 34, { size: km ? 19 : 26, rotate: -3, d0: d0 + 0.4 }) : { svg: '', x1: lx + lw };
  const w = Math.ceil(Math.max(n.x1, lx + lw + 6) + 16);
  return svgDoc(w, 72, label + n.svg, { title });
}

/** An index card on a push pin, with its own 26px rules, swinging in. Title,
 * body and date all sit on the card's rules, below a plain band for the pin. */
export function indexCard(
  t: Theme,
  o: { W: number; H: number; title: string; titleSize?: number; meta?: string; body?: string; bodySize?: number; foot?: string; pin: string; tilt: number; d0: number; km?: boolean },
) {
  const P = PALETTE[t];
  const pad = 12;
  const cw = o.W - pad * 2 - 6;
  const ch = o.H - 18 - 14;
  const x = pad;
  const y = 18;
  const cid = id('card');
  const pid = id('crule');
  const cg = 26; // the card's rule gap
  const ca = 18; // and where in it the rule sits
  const band = 30;
  const ruleY = (k: number) => y + band + ca + cg * k;
  const nRules = Math.floor((ch - band - ca - 6) / cg) + 1;
  const ix = x + 14;
  const tw = cw - 28;
  const parts: string[] = [];
  const tsz = o.titleSize ?? 16;
  const tl = wrap(o.title, tw, { size: tsz, weight: 700 }).slice(0, 3);
  tl.forEach((l, i) => parts.push(text(l, ix, ruleY(i), { size: tsz, weight: 700, fill: P.ink }).svg));
  let k = tl.length;
  const last = nRules - 1;
  if (o.body) {
    const bl = wrap(o.body, tw, { size: o.bodySize ?? 13.5 }).slice(0, Math.max(0, last - k));
    bl.forEach((l, i) => parts.push(text(l, ix, ruleY(k + i), { size: o.bodySize ?? 13.5, fill: P.muted }).svg));
    k += bl.length;
  }
  if (o.meta) parts.push(text(o.meta, ix, ruleY(last), { size: 12.5, weight: 700, fill: P.muted }).svg);
  if (o.foot) parts.push(hand(t, o.foot, x + cw - 14, ruleY(last), { size: o.km ? 15 : 21, anchor: 'end', d0: o.d0 + 0.8 }).svg);
  const card = `<defs><pattern id="${pid}" width="8" height="${cg}" patternUnits="userSpaceOnUse" y="${y + band}"><rect y="${ca}" width="8" height="1" fill="${P.rule}"/></pattern><clipPath id="${cid}"><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="12"/></clipPath></defs>
<rect x="${x + 4}" y="${y + 4}" width="${cw}" height="${ch}" rx="12" fill="${P.shadow}"/>
<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="12" fill="${P.card}"/>
<g clip-path="url(#${cid})"><rect x="${x}" y="${y + band}" width="${cw}" height="${ch - band}" fill="url(#${pid})"/><rect x="${x}" y="${y + band - 1}" width="${cw}" height="1.5" fill="${P.margin}"/></g>
<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="12" fill="none" stroke="${P.line}" stroke-width="2.5"/>
${parts.join('')}`;
  const cx = x + cw / 2;
  const body = `<g class="swing" style="animation-delay:${o.d0}s;transform-origin:${cx}px ${y}px;transform-box:view-box"><g transform="rotate(${o.tilt} ${cx} ${y})">${card}</g></g>${pin(cx, y + 4, o.pin, t)}`;
  return svgDoc(o.W, o.H, body, { title: [o.title, o.body, o.meta].filter(Boolean).join('. ') });
}

/** A chunky sticker button. */
export function button(t: Theme, label: string, bg: string | null, d0 = 0, icon?: 'mail' | 'in' | 'site' | 'gh') {
  const P = PALETTE[t];
  const size = 17;
  const iconW = icon ? 26 : 0;
  const tw = measure(label, { size, weight: 700 });
  const w = Math.ceil(tw + 40 + iconW);
  const h = 52;
  const W = w + 10;
  const H = h + 10;
  const x = 3;
  const y = 3;
  const fill = bg ?? P.card;
  const fg = bg ? ACCENT.onAccent : P.ink;
  let ic = '';
  const ix = x + 20;
  const iy = y + h / 2;
  if (icon === 'mail') ic = `<rect x="${ix}" y="${iy - 8}" width="20" height="15" rx="3" fill="none" stroke="${fg}" stroke-width="2.3"/><path d="M${ix + 1} ${iy - 6}l9 7l9 -7" fill="none" stroke="${fg}" stroke-width="2.3" stroke-linejoin="round"/>`;
  if (icon === 'in') ic = `<rect x="${ix}" y="${iy - 10}" width="20" height="20" rx="4" fill="${fg}"/><path d="M${ix + 5} ${iy - 2}v8M${ix + 9.5} ${iy + 6}v-8M${ix + 9.5} ${iy + 1}q0 -3 3.5 -3t3 3v5" fill="none" stroke="${fill}" stroke-width="2.4" stroke-linecap="round"/><circle cx="${ix + 5}" cy="${iy - 5.5}" r="1.6" fill="${fill}"/>`;
  if (icon === 'site') ic = `<circle cx="${ix + 10}" cy="${iy}" r="9.5" fill="none" stroke="${fg}" stroke-width="2.3"/><path d="M${ix + 0.5} ${iy}h19M${ix + 10} ${iy - 9.5}q-6 9.5 0 19q6 -9.5 0 -19" fill="none" stroke="${fg}" stroke-width="2"/>`;
  const label_ = text(label, x + 20 + iconW + (w - 40 - iconW) / 2, y + h / 2 + 6, { size, weight: 700, anchor: 'middle', fill: fg });
  const body = `<g class="pop" style="animation-delay:${d0}s"><rect x="${x + 4}" y="${y + 4}" width="${w}" height="${h}" rx="16" fill="${P.shadow}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}" stroke="${P.line}" stroke-width="2.5"/>${ic}${label_.svg}</g>`;
  return svgDoc(W, H, body, { title: label });
}

/** A round flag sticker for the language fold-outs. */
export function flagChip(t: Theme, kind: 'en' | 'km' | 'es', size = 28) {
  const r = size / 2 - 3;
  return svgDoc(size, size, flag(kind, r + 1.5, r + 1.5, r, t));
}
