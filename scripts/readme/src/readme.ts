// The profile README: a ruled hero page next to the waving polaroid, real
// Markdown for the words, index cards for the work, and Khmer and Spanish in
// fold-outs. Every picture comes in a light and a dark version.
import { copy, articles, SITE, EMAIL, LINKEDIN } from './content';
import { ACCENT } from './kit';
import { hero, heading, indexCard, button, flagChip } from './pieces';
import { Assets, link } from './md';

export function readme(dir: string) {
  const A = new Assets(dir);
  const md: string[] = [];
  const c = copy.en;

  A.svg('hero', (t) => hero(t, 'en'));
  md.push(
    `<p>${link(SITE, A.pic('hero', `${c.title} ${c.intro}`, 'width="500"'))}${link(`${SITE}/about/`, A.pic('polaroid', 'Mini Chanlito, a toy-style 3D version of Chanlito in a plaid flannel shirt, waves and then does the sampeah, the Khmer greeting with palms together.', 'width="330"', 'webp'))}</p>`,
  );

  const h = (name: string, title: string, note: string) => {
    A.svg(name, (t) => heading(t, 'en', title, note));
    return `<h3>${A.pic(name, title)}</h3>`;
  };

  md.push(h('h-now', c.nowTitle, c.nowNote));
  md.push(c.now.map((l) => `- ${l}`).join('\n'));

  md.push(h('h-built', c.builtTitle, c.builtNote));
  const pins = [ACCENT.sky, '#ff6b35', ACCENT.mint, ACCENT.mango];
  md.push(
    `<p>${c.projects
      .map((p, i) => {
        A.svg(`card-${p.id}`, (t) =>
          indexCard(t, { W: 208, H: 236, title: p.name, body: p.blurb, meta: p.years, pin: pins[i]!, tilt: i % 2 ? 2 : -2, d0: 0.2 + i * 0.15, foot: 'see it' }),
        );
        return link(`${SITE}/projects/#${p.id}`, A.pic(`card-${p.id}`, `${p.name}, ${p.years}. ${p.blurb}`, 'width="208"'));
      })
      .join('')}</p>`,
  );

  md.push(h('h-ink', c.inkTitle, c.inkNote));
  md.push(
    `<p>${articles
      .map((a, i) => {
        A.svg(`article-${i}`, (t) =>
          indexCard(t, { W: 278, H: 190, title: a.title, titleSize: 17, meta: a.date, pin: [ACCENT.mango, ACCENT.sky, ACCENT.mint][i]!, tilt: [-1.5, 1.5, -1][i]!, d0: 0.2 + i * 0.15, foot: 'read it' }),
        );
        return link(`${SITE}/articles/${a.slug}/`, A.pic(`article-${i}`, a.title, 'width="278"'));
      })
      .join('')}</p>`,
  );

  md.push(h('h-hi', c.sayHi, ''));
  md.push(c.sayHiBody);
  A.svg('btn-email', (t) => button(t, 'Email me', ACCENT.mango, 0.1, 'mail'));
  A.svg('btn-linkedin', (t) => button(t, 'LinkedIn', null, 0.2, 'in'));
  A.svg('btn-site', (t) => button(t, 'chanlito.dev', ACCENT.sky, 0.3, 'site'));
  md.push(
    `<p>${link(`mailto:${EMAIL}`, A.pic('btn-email', `Email me at ${EMAIL}`, 'height="62"'))} ${link(LINKEDIN, A.pic('btn-linkedin', 'LinkedIn', 'height="62"'))} ${link(SITE, A.pic('btn-site', 'chanlito.dev', 'height="62"'))}</p>`,
  );

  // Khmer and Spanish fold out, in real text.
  for (const lang of ['km', 'es'] as const) {
    const k = copy[lang];
    A.svg(`flag-${lang}`, (t) => flagChip(t, lang, 26));
    const summary = lang === 'km' ? 'អានជាភាសាខ្មែរ' : 'Léelo en español';
    md.push(`<details>
<summary>${A.pic(`flag-${lang}`, '', 'width="26" align="top"')} <b>${summary}</b></summary>

### ${k.title}

${k.intro}

**${k.nowTitle}**

${k.now.map((l) => `- ${l}`).join('\n')}

**${k.builtTitle}**

${k.projects.map((p) => `- **[${p.name}](${SITE}/${lang}/projects/#${p.id})** (${p.years}): ${p.blurb}`).join('\n')}

**${k.sayHi}**

${k.sayHiBody} [${EMAIL}](mailto:${EMAIL})

</details>`);
  }
  return md.join('\n\n') + '\n';
}
