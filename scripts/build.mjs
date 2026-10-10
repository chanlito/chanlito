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
import { THEMES } from './lib/svg.mjs';

const root = new URL('../', import.meta.url);
const assets = new URL('assets/', root);
const offline = process.argv.includes('--offline');

async function exists(url) {
  return access(url).then(() => true, () => false);
}

async function writeThemed(name, render) {
  for (const [theme, tokens] of Object.entries(THEMES)) {
    await writeFile(new URL(`${name}-${theme}.svg`, assets), render(tokens));
  }
}

await mkdir(assets, { recursive: true });

await writeThemed('header', (t) => renderHeader(t, content.header));
for (const link of content.links) await writeThemed(`btn-${link.id}`, (t) => renderButton(t, link));
await writeThemed('toolbox', (t) => renderToolbox(t, content.toolbox));
for (const item of content.work) await writeThemed(`work-${item.id}`, (t) => renderWork(t, item));
await writeThemed('changelog', (t) => renderChangelog(t, content.changelog));

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
  await writeThemed('activity', (t) => renderActivity(t, activity));
  console.log(`activity: ${activity.total} contributions, ${activity.items.length} recent items`);
}

await writeFile(new URL('README.md', root), renderReadme(content));
console.log('wrote README.md and assets/');
