// Regenerates README.md and every SVG in assets/ from profile/content.mjs.
//
//   node scripts/build.mjs            fetch activity from GitLab and GitHub, then render
//   node scripts/build.mjs --offline  render without network; keeps the last activity SVGs
//
// GITHUB_TOKEN is needed for the GitHub contribution calendar. Without it the
// graph falls back to GitLab only.

import { access, mkdir, writeFile } from 'node:fs/promises';
import * as content from '../profile/content.mjs';
import { collectActivity, emptyActivity } from './lib/activity.mjs';
import { renderActivity, renderButton, renderChangelog, renderHeader, renderToolbox, renderWork } from './lib/cards.mjs';
import { renderReadme } from './lib/readme.mjs';
import { MOBILE_W, THEMES, W } from './lib/svg.mjs';

const root = new URL('../', import.meta.url);
const assets = new URL('assets/', root);
const offline = process.argv.includes('--offline');

async function exists(url) {
  return access(url).then(() => true, () => false);
}

// Writes <name>-<theme>.svg for every theme, plus a -mobile variant drawn at
// phone width unless the image is small enough to need none.
async function writeThemed(name, render, { mobile = true } = {}) {
  for (const [theme, tokens] of Object.entries(THEMES)) {
    await writeFile(new URL(`${name}-${theme}.svg`, assets), render(tokens, W));
    if (mobile) await writeFile(new URL(`${name}-${theme}-mobile.svg`, assets), render(tokens, MOBILE_W));
  }
}

await mkdir(assets, { recursive: true });

await writeThemed('header', (t, width) => renderHeader(t, content.header, { width }));
for (const link of content.links) {
  await writeThemed(`btn-${link.id}`, (t) => renderButton(t, link), { mobile: false });
}
await writeThemed('toolbox', (t, width) => renderToolbox(t, content.toolbox, { width }));
for (const [i, item] of content.work.entries()) {
  await writeThemed(`work-${item.id}`, (t, width) => renderWork(t, item, { first: i === 0, width }));
}
await writeThemed('changelog', (t, width) => renderChangelog(t, content.changelog, { width }));

let activity = null;
if (!offline) {
  activity = await collectActivity({
    github: content.accounts.github,
    gitlab: content.accounts.gitlab,
    token: process.env.GITHUB_TOKEN,
  });
  if (!activity) console.warn('warning: no contribution data reached; keeping the previous activity graph');
}
if (!activity && !(await exists(new URL('activity-light.svg', assets)))) activity = emptyActivity();
if (activity) {
  await writeThemed('activity', (t, width) => renderActivity(t, activity, { width }));
  console.log(`activity: ${activity.total} contributions, ${activity.items.length} recent items`);
}

await writeFile(new URL('README.md', root), renderReadme(content));
console.log('wrote README.md and assets/');
