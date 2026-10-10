// One render function per SVG on the profile. Each takes a theme and its content
// and returns a complete SVG document string.

import { W, MONO, document, line, rect, text, textWidth, truncate, wrap } from './svg.mjs';

export function renderHeader(t, h) {
  const pad = 36;
  const termW = 290;
  const leftW = W - pad * 2 - 32 - termW;
  const bio = wrap(h.bio, leftW, 15);
  const bioTop = 184;
  const height = Math.max(300, bioTop + (bio.length - 1) * 24 + 44);

  const parts = [
    rect(0.5, 0.5, W - 1, height - 1, { rx: 14, fill: t.panel, stroke: t.border }),
    text(pad, 84, h.name, { size: 46, weight: 700, fill: t.text, spacing: -1.2 }),
    text(pad, 118, h.title, { size: 18, weight: 500, fill: t.text }),
    text(pad, 146, h.location, { size: 13, family: MONO, fill: t.muted }),
    ...bio.map((l, i) => text(pad, bioTop + i * 24, l, { size: 15, fill: t.muted })),
  ];

  const tx = W - pad - termW;
  const ty = pad;
  const th = height - pad * 2;
  const step = 23;
  const prompts = h.terminal.filter((l, i) => i > 0 && l.kind !== 'out' && l.kind !== 'accent').length;
  const blockH = h.terminal.length * step + prompts * 8;
  let y = ty + (th - blockH) / 2 + 16;
  parts.push(rect(tx, ty, termW, th, { rx: 10, fill: t.code, stroke: t.codeBorder }));
  h.terminal.forEach((l, i) => {
    if (i > 0 && (l.kind === 'prompt' || l.kind === 'cursor')) y += 8;
    const opts = { size: 13, family: MONO };
    if (l.kind === 'prompt') parts.push(text(tx + 20, y, `$ ${l.text}`, { ...opts, fill: t.codeMuted }));
    if (l.kind === 'out') parts.push(text(tx + 20, y, l.text, { ...opts, fill: t.codeText }));
    if (l.kind === 'accent') parts.push(text(tx + 20, y, l.text, { ...opts, fill: t.codeAccent }));
    if (l.kind === 'cursor') {
      const cx = tx + 20 + textWidth('$ ', 13, 'mono');
      parts.push(text(tx + 20, y, '$', { ...opts, fill: t.codeMuted }));
      parts.push(
        `<rect x="${cx}" y="${y - 12}" width="8" height="15" fill="${t.codeAccent}">` +
          '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/>' +
          '</rect>',
      );
    }
    y += step;
  });

  return document({ height, title: `${h.name}, ${h.title}`, body: parts.join('\n') });
}

export function renderButton(t, link) {
  const width = Math.ceil(textWidth(link.label, 14, 'bold') + 36);
  const height = 44;
  const box = link.primary
    ? rect(0, 0, width, height, { rx: 8, fill: t.accent })
    : rect(0.5, 0.5, width - 1, height - 1, { rx: 8, fill: t.bg, stroke: t.border });
  const label = text(width / 2, 27, link.label, {
    size: 14,
    weight: 600,
    anchor: 'middle',
    fill: link.primary ? t.onAccent : t.text,
  });
  return document({ width, height, title: link.label, body: `${box}\n${label}` });
}

export function renderToolbox(t, rows) {
  const pad = 22;
  const colGap = 28;
  const colW = (W - pad * 2 - colGap) / 2;
  const rowH = 34;
  const perCol = Math.ceil(rows.length / 2);
  const top = 48;
  const height = top + perCol * rowH + 12;

  const parts = [
    rect(0.5, 0.5, W - 1, height - 1, { rx: 12, fill: t.panel, stroke: t.border }),
    text(pad, 32, 'TOOLBOX', { size: 11, family: MONO, fill: t.muted, spacing: 1 }),
  ];
  rows.forEach(([label, value], i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const x = pad + col * (colW + colGap);
    const y = top + row * rowH;
    parts.push(text(x, y + 21, label, { size: 11, family: MONO, fill: t.accent }));
    parts.push(text(x + 76, y + 21, truncate(value, colW - 76, 13), { size: 13, fill: t.text }));
    if (row < perCol - 1) parts.push(line(x, y + rowH, x + colW, y + rowH, t.border));
  });

  return document({ height, title: 'Toolbox', body: parts.join('\n') });
}

export function renderWork(t, item) {
  const pad = 24;
  const inner = W - pad * 2;
  const parts = [];

  const dateW = textWidth(item.date, 12, 'mono');
  const title = item.href ? `${item.title} ↗` : item.title;
  parts.push(text(pad, 48, truncate(title, inner - dateW - 16, 18, 'bold'), { size: 18, weight: 600, fill: t.text }));
  parts.push(text(W - pad, 48, item.date, { size: 12, family: MONO, fill: t.muted, anchor: 'end' }));

  let y = 76;
  for (const l of wrap(item.subtitle, inner, 14)) {
    parts.push(text(pad, y, l, { size: 14, fill: t.muted }));
    y += 21;
  }

  y += 10;
  for (const bullet of item.bullets) {
    const lines = wrap(bullet, inner - 18, 14);
    parts.push(`<circle cx="${pad + 5}" cy="${y - 5}" r="2.5" fill="${t.muted}"/>`);
    for (const l of lines) {
      parts.push(text(pad + 18, y, l, { size: 14, fill: t.text }));
      y += 21;
    }
    y += 6;
  }

  let cx = pad;
  let cy = y + 4;
  for (const chip of item.chips) {
    const w = Math.ceil(textWidth(chip, 12, 'mono') + 18);
    if (cx + w > W - pad) {
      cx = pad;
      cy += 32;
    }
    parts.push(rect(cx + 0.5, cy + 0.5, w - 1, 25, { rx: 6, fill: t.panel, stroke: t.border }));
    parts.push(text(cx + 9, cy + 17, chip, { size: 12, family: MONO, fill: t.text }));
    cx += w + 6;
  }

  const height = cy + 26 + pad;
  parts.unshift(rect(0.5, 0.5, W - 1, height - 1, { rx: 12, fill: t.bg, stroke: t.border }));
  return document({ height, title: item.title, body: parts.join('\n') });
}

export function renderChangelog(t, rows) {
  const rowH = 62;
  const height = rows.length * rowH;
  const parts = [rect(0.5, 0.5, W - 1, height - 1, { rx: 12, fill: t.bg, stroke: t.border })];
  rows.forEach((r, i) => {
    const y = i * rowH;
    parts.push(text(20, y + 27, r.version, { size: 13, weight: 500, family: MONO, fill: r.muted ? t.muted : t.accent }));
    parts.push(text(112, y + 27, r.title, { size: 15, weight: 600, fill: t.text }));
    parts.push(text(112, y + 47, truncate(r.desc, W - 132, 13), { size: 13, fill: t.muted }));
    if (i < rows.length - 1) parts.push(line(0, y + rowH, W, y + rowH, t.border));
  });
  return document({ height, title: 'Changelog', body: parts.join('\n') });
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Levels 1–4 split the non-zero days into quartiles, like GitHub's own graph.
function levels(weeks) {
  const counts = weeks.flat().map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
  const q = (p) => counts[Math.min(counts.length - 1, Math.floor(p * counts.length))] ?? 0;
  const cuts = [q(0.25), q(0.5), q(0.75)];
  return (count) => {
    if (count <= 0) return 0;
    if (count <= cuts[0]) return 1;
    if (count <= cuts[1]) return 2;
    if (count <= cuts[2]) return 3;
    return 4;
  };
}

export function renderActivity(t, a) {
  const pad = 20;
  const cell = 11;
  const stepX = 14;
  const gridW = a.weeks.length * stepX - 3;
  const x0 = Math.round((W - gridW) / 2);
  const gridTop = 76;
  const level = levels(a.weeks);
  const parts = [];

  parts.push(text(pad, 36, 'ACTIVITY · GITLAB + GITHUB · LAST 12 MONTHS', { size: 11, family: MONO, fill: t.muted, spacing: 1 }));
  parts.push(
    text(W - pad, 36, `${a.total.toLocaleString('en-US')} contributions · updated ${a.updated}`, {
      size: 11,
      family: MONO,
      fill: t.muted,
      anchor: 'end',
    }),
  );

  let lastMonth = -1;
  let lastLabelX = -Infinity;
  a.weeks.forEach((week, w) => {
    const x = x0 + w * stepX;
    const month = Number(week[0].date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      if (x - lastLabelX >= 32 && w < a.weeks.length - 2) {
        parts.push(text(x, gridTop - 10, MONTHS[month], { size: 10, family: MONO, fill: t.muted }));
        lastLabelX = x;
      }
      lastMonth = month;
    }
    week.forEach((day, d) => {
      parts.push(rect(x, gridTop + d * stepX, cell, cell, { rx: 2, fill: t.heat[level(day.count)] }));
    });
  });

  const legendY = gridTop + 7 * stepX + 22;
  parts.push(text(x0, legendY, 'Public and private contributions from both accounts, merged by day.', { size: 12, fill: t.muted }));
  const legendX = x0 + gridW - (5 * stepX - 3);
  parts.push(text(legendX - 8, legendY, 'Less', { size: 12, fill: t.muted, anchor: 'end' }));
  t.heat.forEach((fill, i) => parts.push(rect(legendX + i * stepX, legendY - 10, cell, cell, { rx: 2, fill })));
  parts.push(text(legendX + 5 * stepX + 5, legendY, 'More', { size: 12, fill: t.muted }));

  const bandY = legendY + 20;
  parts.push(rect(0, bandY, W, 30, { fill: t.panel }));
  parts.push(line(0, bandY, W, bandY, t.border));
  parts.push(line(0, bandY + 30, W, bandY + 30, t.border));
  parts.push(text(pad, bandY + 19, 'RECENTLY SHIPPED', { size: 11, family: MONO, fill: t.muted, spacing: 1 }));

  const rowH = 38;
  let y = bandY + 30;
  if (a.items.length === 0) {
    parts.push(text(pad, y + 24, 'Most of my recent work lives in private client repositories.', { size: 13, fill: t.muted }));
    y += rowH;
  }
  a.items.forEach((item, i) => {
    const dateW = textWidth(item.date, 12, 'mono');
    const label = truncate(`${item.repo} · ${item.text}`, W - pad * 2 - dateW - 24, 12, 'mono');
    parts.push(text(pad, y + 24, label, { size: 12, family: MONO, fill: t.text }));
    parts.push(text(W - pad, y + 24, item.date, { size: 12, family: MONO, fill: t.muted, anchor: 'end' }));
    if (i < a.items.length - 1) parts.push(line(0, y + rowH, W, y + rowH, t.border));
    y += rowH;
  });

  const height = y + 2;
  // Clip the band to the card's rounded corners and draw the border on top of it.
  const clip = `<clipPath id="card"><rect x="0" y="0" width="${W}" height="${height}" rx="12"/></clipPath>`;
  const body = [
    `<defs>${clip}</defs>`,
    rect(0, 0, W, height, { rx: 12, fill: t.bg }),
    `<g clip-path="url(#card)">`,
    ...parts,
    '</g>',
    rect(0.5, 0.5, W - 1, height - 1, { rx: 12, stroke: t.border }),
  ];
  return document({
    height,
    title: `${a.total} contributions across GitLab and GitHub in the last 12 months`,
    body: body.join('\n'),
  });
}
