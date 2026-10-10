// Shared SVG building blocks: theme tokens, text helpers and the document wrapper.

export const W = 840;

// Phone layout width. Close to a phone's README column, so text renders near 1:1.
export const MOBILE_W = 340;

export const SANS = "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
export const MONO = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const THEMES = {
  light: {
    bg: '#ffffff',
    panel: '#f6f8fa',
    border: '#d0d7de',
    text: '#1f2328',
    muted: '#59636e',
    accent: '#6d4aff',
    onAccent: '#ffffff',
    accentSoft: '#efeaff',
    code: '#161b22',
    codeBorder: '#30363d',
    codeText: '#e6edf3',
    codeMuted: '#9da7b3',
    codeAccent: '#a78bfa',
    heat: ['#ebedf0', '#d9cfff', '#b4a0ff', '#8c6dff', '#5a35f0'],
  },
  dark: {
    bg: '#0d1117',
    panel: '#161b22',
    border: '#30363d',
    text: '#e6edf3',
    muted: '#9da7b3',
    accent: '#a78bfa',
    onAccent: '#0d1117',
    accentSoft: '#231d3d',
    code: '#0b0f14',
    codeBorder: '#30363d',
    codeText: '#e6edf3',
    codeMuted: '#9da7b3',
    codeAccent: '#a78bfa',
    heat: ['#21262d', '#3a2f66', '#5a46a8', '#8064e0', '#b9a2ff'],
  },
};

export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// SVGs rendered through <img> can't measure text, so widths are estimated from
// average glyph widths. The factors lean wide so text never overflows its box.
const GLYPH = { sans: 0.51, bold: 0.55, mono: 0.61 };

export function textWidth(value, size, kind = 'sans') {
  return value.length * size * GLYPH[kind];
}

export function wrap(value, maxWidth, size, kind = 'sans') {
  const lines = [];
  let line = '';
  for (const word of value.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size, kind) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function truncate(value, maxWidth, size, kind = 'sans') {
  if (textWidth(value, size, kind) <= maxWidth) return value;
  const chars = Math.max(1, Math.floor(maxWidth / (size * GLYPH[kind])) - 1);
  return `${value.slice(0, chars).trimEnd()}…`;
}

export function text(x, y, content, opts = {}) {
  const {
    size = 14,
    weight = 400,
    fill,
    family = SANS,
    anchor,
    spacing,
  } = opts;
  const attrs = [
    `x="${x}"`,
    `y="${y}"`,
    `font-family="${family}"`,
    `font-size="${size}"`,
    weight !== 400 ? `font-weight="${weight}"` : '',
    fill ? `fill="${fill}"` : '',
    anchor ? `text-anchor="${anchor}"` : '',
    spacing !== undefined ? `letter-spacing="${spacing}"` : '',
  ].filter(Boolean);
  return `<text ${attrs.join(' ')}>${esc(content)}</text>`;
}

export function rect(x, y, w, h, opts = {}) {
  const { rx = 0, fill = 'none', stroke } = opts;
  const strokeAttrs = stroke ? ` stroke="${stroke}" stroke-width="1"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${strokeAttrs}/>`;
}

export function line(x1, y1, x2, y2, stroke) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1"/>`;
}

export function document({ width = W, height, title, body }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">`,
    `<title id="title">${esc(title)}</title>`,
    body,
    '</svg>',
    '',
  ].join('\n');
}
