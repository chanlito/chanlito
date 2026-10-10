// Everything the profile says lives here. Edit this file, then run
// `node scripts/build.mjs` to regenerate README.md and the SVGs in assets/.

export const accounts = {
  github: 'chanlito',
  gitlab: 'chanlitogoingbloo',
};

export const header = {
  name: 'Chanlito Hem',
  title: 'Technical Lead · Senior Full-Stack Engineer',
  location: 'Phnom Penh, Cambodia · Hybrid / Remote',
  bio: 'I take ideas, design how they should work, and turn them into real products people use. Ten years of production SaaS, from founding a platform to leading delivery for a financial institution.',
  terminal: [
    { kind: 'prompt', text: 'whoami' },
    { kind: 'out', text: '10+ years shipping SaaS' },
    { kind: 'out', text: 'founding engineer, Blue' },
    { kind: 'out', text: 'tech lead, Sean Oliver' },
    { kind: 'prompt', text: 'cat stack.txt' },
    { kind: 'accent', text: 'typescript elixir sql' },
    { kind: 'cursor' },
  ],
};

export const links = [
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/chanlito', primary: true },
  { id: 'email', label: 'Email me', href: 'mailto:chanlitohem@gmail.com' },
];

export const toolbox = [
  ['lang', 'TypeScript, Elixir, SQL'],
  ['frontend', 'React, Vue, Nuxt, Next.js, TanStack'],
  ['backend', 'Node.js, NestJS, Phoenix LiveView, GraphQL'],
  ['mobile', 'React Native, Expo'],
  ['data', 'PostgreSQL, MySQL, Oracle, Redis'],
  ['auth', 'OIDC, Entra ID, Keycloak'],
  ['infra', 'Docker, AWS, GitHub Actions'],
  ['ai', 'OpenAI, Gemini, Claude Code'],
];

export const work = [
  {
    id: 'loan',
    title: 'Loan origination platform',
    date: '2026 – now',
    subtitle: 'Technical lead, Sean Oliver Consulting. Field capture to approval to disbursement.',
    bullets: [
      'Offline-first Android tablet app: encrypted drafts, background sync, on-device ID OCR, Khmer and English.',
      'Approver portal with review queues, delegation and analytics dashboards.',
      'NestJS and Oracle backend with Entra ID sign-in, audit logging and a loan calculation engine.',
    ],
    chips: ['React Native · Expo', 'React · TanStack', 'NestJS · TypeORM', 'Oracle', 'Entra ID · OIDC'],
  },
  {
    id: 'blue',
    title: 'Blue · project management SaaS',
    href: 'https://blue.cc/',
    date: '2018 – 2025',
    subtitle: 'Founding engineer. First commit to thousands of active users.',
    bullets: [
      'Set the stack and led the team through the first production release.',
      'Built the custom fields engine and the drag-and-drop form builder, one of the most-used features.',
      'Real-time collaboration with GraphQL subscriptions and Redis, plus a BullMQ pipeline for 10,000+ jobs a day.',
    ],
    chips: ['Vue · Nuxt', 'Node.js', 'GraphQL', 'MySQL', 'Redis · BullMQ'],
  },
  {
    id: 'ai',
    title: 'AI-powered products',
    date: '2026',
    subtitle: 'Independent consulting for clients in Cambodia.',
    bullets: [
      'Fitness platform with AI workout generation on Elixir, Phoenix LiveView and Gemini.',
      'Medicine assistant that reads prescription images and PDFs, then finds one pharmacy that can fill the whole list.',
    ],
    chips: ['Elixir · LiveView', 'Gemini', 'Vercel AI SDK', 'TanStack AI · OpenAI'],
  },
];

export const now = 'Leading the loan origination platform at Sean Oliver Consulting, and hiring full-stack engineers to join the team.';

export const changelog = [
  { version: '2026.05', title: 'Technical Lead · Sean Oliver Consulting', desc: 'Leading the loan origination platform and growing the team.' },
  { version: '2026.01', title: 'Independent consultant', desc: 'Scoped, built and deployed two AI products for clients.' },
  { version: '2018.04', title: 'Founding Engineer · Blue', desc: 'Built the product and grew the team from 1 to 6 engineers over 7 years 9 months.' },
  { version: '2017.01', title: 'Tech Lead · Pathmazing', desc: 'Owned backend architecture and introduced code review.' },
  { version: '2015.10', title: 'Software Engineer · Pathmazing', desc: 'Web apps and REST APIs for enterprise clients.' },
  { version: 'init', title: 'B.Sc. Software Engineering', desc: 'Universidad de Cienfuegos, Cuba · 2010 – 2015', muted: true },
];

export const footer = 'Speaks Spanish, Khmer and English. Off the clock: World of Warcraft and Path of Exile.';
