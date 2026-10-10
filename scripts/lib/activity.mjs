// Fetches contribution calendars and recent activity from GitLab and GitHub and
// merges them into the shape renderActivity() draws.

const DAY = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 120;
const RECENT_LIMIT = 3;

const iso = (date) => date.toISOString().slice(0, 10);

async function getJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { 'User-Agent': 'chanlito-profile-readme', Accept: 'application/json', ...init.headers },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${url}`);
  return res.json();
}

function firstLine(message = '') {
  return message.split('\n')[0].trim();
}

async function gitlabCalendar(user) {
  const data = await getJson(`https://gitlab.com/users/${user}/calendar.json`);
  return new Map(Object.entries(data));
}

async function githubCalendar(user, token) {
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  const query = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar { weeks { contributionDays { date contributionCount } } }
      }
    }
  }`;
  const body = await getJson('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: user } }),
  });
  if (body.errors) throw new Error(body.errors.map((e) => e.message).join('; '));
  const days = body.data.user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  return new Map(days.map((d) => [d.date, d.contributionCount]));
}

async function gitlabRecent(user) {
  const [profile] = await getJson(`https://gitlab.com/api/v4/users?username=${user}`);
  if (!profile) return [];
  const events = await getJson(`https://gitlab.com/api/v4/users/${profile.id}/events?per_page=50`);
  const projects = new Map();
  const items = [];
  for (const e of events) {
    let what;
    if (e.push_data?.commit_title) what = e.push_data.commit_title;
    else if (e.action_name === 'accepted' && e.target_type === 'MergeRequest') what = `merged: ${e.target_title}`;
    if (!what) continue;
    if (!projects.has(e.project_id)) {
      const project = await getJson(`https://gitlab.com/api/v4/projects/${e.project_id}`).catch(() => null);
      projects.set(e.project_id, project?.path_with_namespace ?? null);
    }
    const repo = projects.get(e.project_id);
    if (repo) items.push({ repo, text: firstLine(what), date: e.created_at.slice(0, 10) });
  }
  return items;
}

async function githubRecent(user, token) {
  const headers = token ? { Authorization: `bearer ${token}` } : {};
  const events = await getJson(`https://api.github.com/users/${user}/events/public?per_page=100`, { headers });
  const items = [];
  for (const e of events) {
    const repo = e.repo?.name;
    // Skip this repo, where the daily refresh commits land.
    if (!repo || repo.toLowerCase() === `${user}/${user}`.toLowerCase()) continue;
    let what;
    if (e.type === 'PushEvent') {
      const commits = e.payload?.commits ?? [];
      what = commits.length ? firstLine(commits[commits.length - 1].message) : `pushed to ${e.payload?.ref?.replace('refs/heads/', '') ?? 'a branch'}`;
    } else if (e.type === 'PullRequestEvent' && e.payload?.action === 'closed' && e.payload?.pull_request?.merged) {
      what = `merged: ${e.payload.pull_request.title}`;
    } else if (e.type === 'ReleaseEvent') {
      what = `released ${e.payload?.release?.tag_name ?? ''}`.trim();
    }
    if (what) items.push({ repo, text: what, date: e.created_at.slice(0, 10) });
  }
  return items;
}

function buildWeeks(counts, today) {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  // 52 full weeks plus the current partial one, each column starting on Sunday.
  const start = new Date(end.getTime() - (52 * 7 + end.getUTCDay()) * DAY);
  const weeks = [];
  for (let t = start.getTime(); t <= end.getTime(); t += DAY) {
    const date = iso(new Date(t));
    if (new Date(t).getUTCDay() === 0) weeks.push([]);
    weeks[weeks.length - 1].push({ date, count: counts.get(date) ?? 0 });
  }
  return weeks;
}

export async function collectActivity({ github, gitlab, token, today = new Date() }) {
  const [glCal, ghCal, glRecent, ghRecent] = await Promise.allSettled([
    gitlabCalendar(gitlab),
    githubCalendar(github, token),
    gitlabRecent(gitlab),
    githubRecent(github, token),
  ]);

  const labels = ['GitLab calendar', 'GitHub calendar', 'GitLab events', 'GitHub events'];
  [glCal, ghCal, glRecent, ghRecent].forEach((r, i) => {
    if (r.status === 'rejected') console.warn(`warning: ${labels[i]} unavailable: ${r.reason.message}`);
  });

  if (glCal.status === 'rejected' && ghCal.status === 'rejected') return null;

  const counts = new Map();
  for (const cal of [glCal, ghCal]) {
    if (cal.status !== 'fulfilled') continue;
    for (const [date, n] of cal.value) counts.set(date, (counts.get(date) ?? 0) + Number(n));
  }

  const weeks = buildWeeks(counts, today);
  const total = weeks.flat().reduce((sum, d) => sum + d.count, 0);

  const cutoff = iso(new Date(today.getTime() - RECENT_DAYS * DAY));
  const seen = new Set();
  const items = [glRecent, ghRecent]
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((item) => item.date >= cutoff)
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((item) => (seen.has(item.repo) ? false : seen.add(item.repo)))
    .slice(0, RECENT_LIMIT);

  return { weeks, total, items, updated: iso(today) };
}

export function emptyActivity(today = new Date()) {
  return { weeks: buildWeeks(new Map(), today), total: 0, items: [], updated: iso(today) };
}
