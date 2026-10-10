// One render function per SVG on the profile. Each takes a theme, its content and
// a layout width, and returns a complete SVG document string. Widths below 600 get
// a stacked phone layout, so the text stays readable instead of shrinking with a
// wide image. Backgrounds stay transparent so the page's own background shows
// through; only the terminal and buttons are filled.

import { W, MONO, document, line, rect, text, textWidth, truncate, wrap } from './svg.mjs';

const isCompact = (width) => width < 600;

function terminal(t, lines, x, y, width) {
  const step = 23;
  const breaks = lines.filter((l, i) => i > 0 && (l.kind === 'prompt' || l.kind === 'cursor')).length;
  const height = lines.length * step + breaks * 8 + 40;

  const parts = [rect(x, y, width, height, { rx: 10, fill: t.code, stroke: t.codeBorder })];
  let ly = y + 36;
  lines.forEach((l, i) => {
    if (i > 0 && (l.kind === 'prompt' || l.kind === 'cursor')) ly += 8;
    const opts = { size: 13, family: MONO };
    if (l.kind === 'prompt') parts.push(text(x + 20, ly, `$ ${l.text}`, { ...opts, fill: t.codeMuted }));
    if (l.kind === 'out') parts.push(text(x + 20, ly, l.text, { ...opts, fill: t.codeText }));
    if (l.kind === 'accent') parts.push(text(x + 20, ly, l.text, { ...opts, fill: t.codeAccent }));
    if (l.kind === 'cursor') {
      const cx = x + 20 + textWidth('$ ', 13, 'mono');
      parts.push(text(x + 20, ly, '$', { ...opts, fill: t.codeMuted }));
      parts.push(
        `<rect x="${cx}" y="${ly - 12}" width="8" height="15" fill="${t.codeAccent}">` +
          '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/>' +
          '</rect>',
      );
    }
    ly += step;
  });
  return { parts, height };
}

export function renderHeader(t, h, { width = W } = {}) {
  const title = `${h.name}, ${h.title}`;

  if (isCompact(width)) {
    const parts = [text(0, 38, h.name, { size: 34, weight: 700, fill: t.text, spacing: -0.8 })];
    let y = 66;
    for (const l of wrap(h.title, width, 16)) {
      parts.push(text(0, y, l, { size: 16, weight: 500, fill: t.text }));
      y += 22;
    }
    parts.push(text(0, y + 2, h.location, { size: 12, family: MONO, fill: t.muted }));
    y += 30;
    for (const l of wrap(h.bio, width, 15)) {
      parts.push(text(0, y, l, { size: 15, fill: t.muted }));
      y += 23;
    }
    const term = terminal(t, h.terminal, 0, y + 2, width);
    parts.push(...term.parts);
    return document({ width, height: y + 2 + term.height + 4, title, body: parts.join('\n') });
  }

  const termW = 290;
  const bio = wrap(h.bio, width - termW - 48, 15);
  const bioTop = 150;
  const term = terminal(t, h.terminal, width - termW, 8, termW);
  const height = Math.max(8 + term.height + 8, bioTop + (bio.length - 1) * 24 + 16);

  const parts = [
    text(0, 58, h.name, { size: 46, weight: 700, fill: t.text, spacing: -1.2 }),
    text(0, 92, h.title, { size: 18, weight: 500, fill: t.text }),
    text(0, 120, h.location, { size: 13, family: MONO, fill: t.muted }),
    ...bio.map((l, i) => text(0, bioTop + i * 24, l, { size: 15, fill: t.muted })),
    ...term.parts,
  ];
  return document({ width, height, title, body: parts.join('\n') });
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

export function renderToolbox(t, rows, { width = W } = {}) {
  const parts = [text(0, 12, 'TOOLBOX', { size: 11, family: MONO, fill: t.muted, spacing: 1 })];

  if (isCompact(width)) {
    const labelW = 80;
    let y = 26;
    for (const [label, value] of rows) {
      const lines = wrap(value, width - labelW, 14);
      parts.push(text(0, y + 18, label, { size: 12, family: MONO, fill: t.accent }));
      lines.forEach((l, i) => parts.push(text(labelW, y + 18 + i * 20, l, { size: 14, fill: t.text })));
      y += lines.length * 20 + 10;
    }
    return document({ width, height: y, title: 'Toolbox', body: parts.join('\n') });
  }

  const colGap = 32;
  const colW = (width - colGap) / 2;
  const rowH = 30;
  const perCol = Math.ceil(rows.length / 2);
  const top = 26;
  rows.forEach(([label, value], i) => {
    const x = Math.floor(i / perCol) * (colW + colGap);
    const y = top + (i % perCol) * rowH + 18;
    parts.push(text(x, y, label, { size: 11, family: MONO, fill: t.accent }));
    parts.push(text(x + 76, y, truncate(value, colW - 76, 13), { size: 13, fill: t.text }));
  });
  return document({ width, height: top + perCol * rowH, title: 'Toolbox', body: parts.join('\n') });
}

// Projects after the first are separated by a hairline above the title.
export function renderWork(t, item, { first = false, width = W } = {}) {
  const parts = first ? [] : [line(0, 0.5, width, 0.5, t.border)];
  const title = item.href ? `${item.title} ↗` : item.title;

  let y;
  if (isCompact(width)) {
    // The date moves above the title, where it can't collide with it.
    y = first ? 14 : 36;
    parts.push(text(0, y, item.date, { size: 12, family: MONO, fill: t.muted }));
    y += 26;
    for (const l of wrap(title, width, 18, 'bold')) {
      parts.push(text(0, y, l, { size: 18, weight: 600, fill: t.text }));
      y += 24;
    }
    y += 2;
  } else {
    y = first ? 22 : 42;
    const dateW = textWidth(item.date, 12, 'mono');
    parts.push(text(0, y, truncate(title, width - dateW - 16, 18, 'bold'), { size: 18, weight: 600, fill: t.text }));
    parts.push(text(width, y, item.date, { size: 12, family: MONO, fill: t.muted, anchor: 'end' }));
    y += 26;
  }

  for (const l of wrap(item.subtitle, width, 14)) {
    parts.push(text(0, y, l, { size: 14, fill: t.muted }));
    y += 21;
  }

  y += 10;
  for (const bullet of item.bullets) {
    parts.push(`<circle cx="5" cy="${y - 5}" r="2.5" fill="${t.muted}"/>`);
    for (const l of wrap(bullet, width - 18, 14)) {
      parts.push(text(18, y, l, { size: 14, fill: t.text }));
      y += 21;
    }
    y += 6;
  }

  // The stack line breaks between technologies, never inside one.
  y += 6;
  const stack = [];
  for (const tech of item.chips.flatMap((c) => c.split(' · '))) {
    const next = stack.length ? `${stack.at(-1)} · ${tech}` : tech;
    if (stack.length && textWidth(next, 12, 'mono') <= width) stack[stack.length - 1] = next;
    else stack.push(tech);
  }
  for (const l of stack) {
    parts.push(text(0, y, l, { size: 12, family: MONO, fill: t.accent }));
    y += 20;
  }

  return document({ width, height: y + 4, title: item.title, body: parts.join('\n') });
}

export function renderChangelog(t, rows, { width = W } = {}) {
  const compact = isCompact(width);
  const dotX = 6;
  const parts = [];
  const dots = [];

  let y = 0;
  for (const r of rows) {
    dots.push(y + 20);
    parts.push(
      r.muted
        ? `<circle cx="${dotX}" cy="${y + 20}" r="4.5" fill="${t.bg}" stroke="${t.muted}" stroke-width="1.5"/>`
        : `<circle cx="${dotX}" cy="${y + 20}" r="4.5" fill="${t.accent}"/>`,
    );
    parts.push(text(26, y + 24, r.version, { size: 13, weight: 500, family: MONO, fill: r.muted ? t.muted : t.accent }));
    if (compact) {
      // Title and description stack under the version instead of beside it.
      let ly = y + 48;
      for (const l of wrap(r.title, width - 26, 15, 'bold')) {
        parts.push(text(26, ly, l, { size: 15, weight: 600, fill: t.text }));
        ly += 21;
      }
      for (const l of wrap(r.desc, width - 26, 13)) {
        parts.push(text(26, ly, l, { size: 13, fill: t.muted }));
        ly += 19;
      }
      y = ly + 6;
    } else {
      parts.push(text(108, y + 24, r.title, { size: 15, weight: 600, fill: t.text }));
      parts.push(text(108, y + 44, truncate(r.desc, width - 108, 13), { size: 13, fill: t.muted }));
      y += 58;
    }
  }

  const rail = line(dotX, dots[0], dotX, dots.at(-1), t.border);
  return document({ width, height: compact ? y - 6 : y, title: 'Changelog', body: [rail, ...parts].join('\n') });
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

export function renderActivity(t, a, { width = W } = {}) {
  const compact = isCompact(width);
  const label = { size: 11, family: MONO, fill: t.muted, spacing: 1 };
  const small = { size: 11, family: MONO, fill: t.muted };
  const total = a.total.toLocaleString('en-US');
  const parts = [];

  // Size the cells so the 53 weeks span the full width.
  const gap = compact ? 1.5 : 3;
  const step = (width + gap) / a.weeks.length;
  const cell = step - gap;
  const r = (n) => Math.round(n * 10) / 10;
  const level = levels(a.weeks);

  let gridTop;
  if (compact) {
    parts.push(text(0, 12, 'ACTIVITY · LAST 12 MONTHS', label));
    parts.push(text(0, 34, `${total} contributions across GitLab and GitHub`, { size: 13, fill: t.text }));
    gridTop = 64;
  } else {
    parts.push(text(0, 12, 'ACTIVITY · GITLAB + GITHUB · LAST 12 MONTHS', label));
    parts.push(text(width, 12, `${total} contributions · updated ${a.updated}`, { ...small, anchor: 'end' }));
    gridTop = 46;
  }

  let lastMonth = -1;
  let lastLabelX = -Infinity;
  a.weeks.forEach((week, w) => {
    const x = r(w * step);
    const month = Number(week[0].date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      if (x - lastLabelX >= (compact ? 24 : 32) && w < a.weeks.length - 2) {
        parts.push(text(x, gridTop - 10, MONTHS[month], { size: 10, family: MONO, fill: t.muted }));
        lastLabelX = x;
      }
      lastMonth = month;
    }
    week.forEach((day, d) => {
      parts.push(rect(x, r(gridTop + d * step), r(cell), r(cell), { rx: compact ? 1 : 2, fill: t.heat[level(day.count)] }));
    });
  });

  const legendY = r(gridTop + 7 * step + 18);
  const legendX = width - 30 - 5 * 14;
  parts.push(text(legendX - 8, legendY, 'Less', { size: 12, fill: t.muted, anchor: 'end' }));
  t.heat.forEach((fill, i) => parts.push(rect(legendX + i * 14, legendY - 10, 11, 11, { rx: 2, fill })));
  parts.push(text(width, legendY, 'More', { size: 12, fill: t.muted, anchor: 'end' }));

  const note = 'Public and private contributions from both accounts, merged by day.';
  let y;
  if (compact) {
    parts.push(text(0, legendY, `updated ${a.updated}`, small));
    y = legendY + 24;
    for (const l of wrap(note, width, 12)) {
      parts.push(text(0, y, l, { size: 12, fill: t.muted }));
      y += 18;
    }
    y += 22;
  } else {
    parts.push(text(0, legendY, note, { size: 12, fill: t.muted }));
    y = legendY + 42;
  }

  parts.push(text(0, y, 'RECENTLY SHIPPED', label));
  y += 8;
  if (a.items.length === 0) {
    for (const l of wrap('Most of my recent work lives in private client repositories.', width, 13)) {
      parts.push(text(0, y + 18, l, { size: 13, fill: t.muted }));
      y += 20;
    }
    y += 8;
  }
  for (const item of a.items) {
    const dateW = textWidth(item.date, 12, 'mono');
    const row = truncate(`${item.repo} · ${item.text}`, width - dateW - 24, 12, 'mono');
    parts.push(text(0, y + 18, row, { size: 12, family: MONO, fill: t.text }));
    parts.push(text(width, y + 18, item.date, { size: 12, family: MONO, fill: t.muted, anchor: 'end' }));
    y += 28;
  }

  return document({
    width,
    height: r(y + 4),
    title: `${a.total} contributions across GitLab and GitHub in the last 12 months`,
    body: parts.join('\n'),
  });
}
