// One render function per SVG on the profile. Each takes a theme and its content
// and returns a complete SVG document string. Backgrounds stay transparent so
// the page's own background shows through; only the terminal and buttons are filled.

import { W, MONO, document, line, rect, text, textWidth, truncate, wrap } from './svg.mjs';

export function renderHeader(t, h) {
  const termW = 290;
  const leftW = W - termW - 48;
  const bio = wrap(h.bio, leftW, 15);

  const step = 23;
  const breaks = h.terminal.filter((l, i) => i > 0 && (l.kind === 'prompt' || l.kind === 'cursor')).length;
  const blockH = h.terminal.length * step + breaks * 8;
  const th = blockH + 40;
  const ty = 8;

  const bioTop = 150;
  const height = Math.max(ty + th + 8, bioTop + (bio.length - 1) * 24 + 16);

  const parts = [
    text(0, 58, h.name, { size: 46, weight: 700, fill: t.text, spacing: -1.2 }),
    text(0, 92, h.title, { size: 18, weight: 500, fill: t.text }),
    text(0, 120, h.location, { size: 13, family: MONO, fill: t.muted }),
    ...bio.map((l, i) => text(0, bioTop + i * 24, l, { size: 15, fill: t.muted })),
  ];

  const tx = W - termW;
  parts.push(rect(tx, ty, termW, th, { rx: 10, fill: t.code, stroke: t.codeBorder }));
  let y = ty + 20 + 16;
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
    : rect(0.5, 0.5, width - 1, height - 1, { rx: 8, stroke: t.border });
  const label = text(width / 2, 27, link.label, {
    size: 14,
    weight: 600,
    anchor: 'middle',
    fill: link.primary ? t.onAccent : t.text,
  });
  return document({ width, height, title: link.label, body: `${box}\n${label}` });
}

export function renderToolbox(t, rows) {
  const colGap = 32;
  const colW = (W - colGap) / 2;
  const rowH = 30;
  const perCol = Math.ceil(rows.length / 2);
  const top = 26;
  const height = top + perCol * rowH;

  const parts = [text(0, 12, 'TOOLBOX', { size: 11, family: MONO, fill: t.muted, spacing: 1 })];
  rows.forEach(([label, value], i) => {
    const x = Math.floor(i / perCol) * (colW + colGap);
    const y = top + (i % perCol) * rowH + 18;
    parts.push(text(x, y, label, { size: 11, family: MONO, fill: t.accent }));
    parts.push(text(x + 76, y, truncate(value, colW - 76, 13), { size: 13, fill: t.text }));
  });

  return document({ height, title: 'Toolbox', body: parts.join('\n') });
}

// Projects after the first are separated by a hairline above the title.
export function renderWork(t, item, { first = false } = {}) {
  const top = first ? 22 : 42;
  const parts = first ? [] : [line(0, 0.5, W, 0.5, t.border)];

  const dateW = textWidth(item.date, 12, 'mono');
  const title = item.href ? `${item.title} ↗` : item.title;
  parts.push(text(0, top, truncate(title, W - dateW - 16, 18, 'bold'), { size: 18, weight: 600, fill: t.text }));
  parts.push(text(W, top, item.date, { size: 12, family: MONO, fill: t.muted, anchor: 'end' }));

  let y = top + 26;
  for (const l of wrap(item.subtitle, W, 14)) {
    parts.push(text(0, y, l, { size: 14, fill: t.muted }));
    y += 21;
  }

  y += 10;
  for (const bullet of item.bullets) {
    parts.push(`<circle cx="5" cy="${y - 5}" r="2.5" fill="${t.muted}"/>`);
    for (const l of wrap(bullet, W - 18, 14)) {
      parts.push(text(18, y, l, { size: 14, fill: t.text }));
      y += 21;
    }
    y += 6;
  }

  y += 6;
  const stack = item.chips.flatMap((c) => c.split(' · ')).join('  ·  ');
  for (const l of wrap(stack, W, 12, 'mono')) {
    parts.push(text(0, y, l, { size: 12, family: MONO, fill: t.accent }));
    y += 20;
  }

  return document({ height: y + 4, title: item.title, body: parts.join('\n') });
}

export function renderChangelog(t, rows) {
  const rowH = 58;
  const height = rows.length * rowH;
  const dotX = 6;
  const firstDot = 20;
  const lastDot = (rows.length - 1) * rowH + 20;
  const parts = [line(dotX, firstDot, dotX, lastDot, t.border)];
  rows.forEach((r, i) => {
    const y = i * rowH;
    parts.push(
      r.muted
        ? `<circle cx="${dotX}" cy="${y + 20}" r="4.5" fill="${t.bg}" stroke="${t.muted}" stroke-width="1.5"/>`
        : `<circle cx="${dotX}" cy="${y + 20}" r="4.5" fill="${t.accent}"/>`,
    );
    parts.push(text(26, y + 24, r.version, { size: 13, weight: 500, family: MONO, fill: r.muted ? t.muted : t.accent }));
    parts.push(text(108, y + 24, r.title, { size: 15, weight: 600, fill: t.text }));
    parts.push(text(108, y + 44, truncate(r.desc, W - 108, 13), { size: 13, fill: t.muted }));
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
  // Size the cells so the 53 weeks span the full width.
  const step = (W + 3) / a.weeks.length;
  const cell = step - 3;
  const r = (n) => Math.round(n * 10) / 10;
  const gridTop = 46;
  const level = levels(a.weeks);
  const parts = [];

  parts.push(text(0, 12, 'ACTIVITY · GITLAB + GITHUB · LAST 12 MONTHS', { size: 11, family: MONO, fill: t.muted, spacing: 1 }));
  parts.push(
    text(W, 12, `${a.total.toLocaleString('en-US')} contributions · updated ${a.updated}`, {
      size: 11,
      family: MONO,
      fill: t.muted,
      anchor: 'end',
    }),
  );

  let lastMonth = -1;
  let lastLabelX = -Infinity;
  a.weeks.forEach((week, w) => {
    const x = r(w * step);
    const month = Number(week[0].date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      if (x - lastLabelX >= 32 && w < a.weeks.length - 2) {
        parts.push(text(x, gridTop - 10, MONTHS[month], { size: 10, family: MONO, fill: t.muted }));
        lastLabelX = x;
      }
      lastMonth = month;
    }
    week.forEach((day, d) => {
      parts.push(rect(x, r(gridTop + d * step), r(cell), r(cell), { rx: 2, fill: t.heat[level(day.count)] }));
    });
  });

  const legendY = r(gridTop + 7 * step + 18);
  parts.push(text(0, legendY, 'Public and private contributions from both accounts, merged by day.', { size: 12, fill: t.muted }));
  const legendX = W - 30 - 5 * 14;
  parts.push(text(legendX - 8, legendY, 'Less', { size: 12, fill: t.muted, anchor: 'end' }));
  t.heat.forEach((fill, i) => parts.push(rect(legendX + i * 14, legendY - 10, 11, 11, { rx: 2, fill })));
  parts.push(text(W, legendY, 'More', { size: 12, fill: t.muted, anchor: 'end' }));

  let y = legendY + 42;
  parts.push(text(0, y, 'RECENTLY SHIPPED', { size: 11, family: MONO, fill: t.muted, spacing: 1 }));
  y += 8;
  const rowH = 28;
  if (a.items.length === 0) {
    parts.push(text(0, y + 18, 'Most of my recent work lives in private client repositories.', { size: 13, fill: t.muted }));
    y += rowH;
  }
  for (const item of a.items) {
    const dateW = textWidth(item.date, 12, 'mono');
    const label = truncate(`${item.repo} · ${item.text}`, W - dateW - 24, 12, 'mono');
    parts.push(text(0, y + 18, label, { size: 12, family: MONO, fill: t.text }));
    parts.push(text(W, y + 18, item.date, { size: 12, family: MONO, fill: t.muted, anchor: 'end' }));
    y += rowH;
  }

  return document({
    height: r(y + 4),
    title: `${a.total} contributions across GitLab and GitHub in the last 12 months`,
    body: parts.join('\n'),
  });
}
