// The README's words in English, Khmer and Spanish. Most of it is the site's
// own copy (src/i18n/ui.ts, src/data/now.ts, src/data/projects.ts), so the
// README and chanlito.dev say the same thing. Clients stay unnamed.
export type Lang = 'en' | 'km' | 'es';

export const SITE = 'https://chanlito.dev';
export const EMAIL = 'hi@chanlito.dev';
export const LINKEDIN = 'https://www.linkedin.com/in/chanlito';

export const articles = [
  { title: "How I'd do pull request review today", slug: 'how-id-do-pull-request-review-today', date: 'Oct 2026' },
  {
    title: 'Green Tests, Broken App: Why Our Agents Have to Show Their Work',
    short: 'Green tests, broken app',
    slug: 'green-tests-broken-app-why-our-agents-have-to-show-their-work',
    date: 'Oct 2026',
  },
  {
    title: 'Why good software ideas in Cambodia stay ideas',
    slug: 'why-good-software-ideas-in-cambodia-stay-ideas',
    date: 'Oct 2026',
  },
];

/** Khmer has no spaces between words; `|` marks where a line may break. */
const km = (s: string) => s.replace(/\|/g, '\u200b');

export interface Copy {
  greeting: string;
  title: string;
  /** The name inside the title, which gets the hand-drawn circle. */
  name: string;
  intro: string;
  me: string;
  place: string;
  shipping: string;
  nowTitle: string;
  nowNote: string;
  /** Markdown: bold and links work. */
  now: string[];
  builtTitle: string;
  builtNote: string;
  projects: { id: string; name: string; years: string; blurb: string }[];
  inkTitle: string;
  inkNote: string;
  sayHi: string;
  sayHiBody: string;
}

export const copy: Record<Lang, Copy> = {
  en: {
    greeting: 'សួស្ដី!  Hello!  ¡Hola!',
    title: "Hi, I'm Chanlito.",
    name: 'Chanlito',
    intro:
      "I'm a technical lead in Phnom Penh. I build SaaS and enterprise products, and I write about TypeScript, offline-first apps, and shipping software in Cambodia.",
    me: "that's me!",
    place: 'Phnom Penh',
    shipping: 'still shipping',
    nowTitle: 'Right now',
    nowNote: 'fresh as of Oct 2026',
    now: [
      'Leading the build of a **loan origination system** for a financial institution in Cambodia.',
      'Building **[chanlito.dev](https://chanlito.dev)** on holidays and weekends, and learning Astro with it.',
      'Open to talking about freelance and consulting work.',
    ],
    builtTitle: 'Things I built',
    builtNote: 'the long version is on the site',
    projects: [
      { id: 'blue', name: 'Blue', years: '2018 – 2025', blurb: 'A process management platform thousands of teams run their work on.' },
      { id: 'loan-system', name: 'Loan Origination System', years: '2026 – now', blurb: 'Replaces a paper loan process at a financial institution in Cambodia.' },
      { id: 'caracol', name: 'Caracol Sports Club', years: '2026', blurb: 'The website and workout app for a gym and pool in Phnom Penh.' },
      { id: 'tesjor', name: 'Tesjor', years: '2016 – 2017', blurb: "Cambodia's first cashless food ordering app." },
    ],
    inkTitle: 'Latest articles',
    inkNote: 'fresh ink',
    sayHi: "Let's build something",
    sayHiBody: 'Got a product to build, a team that needs a technical lead, or just a question? Send me a note.',
  },
  km: {
    greeting: 'សួស្ដី!  Hello!  ¡Hola!',
    title: 'សួស្ដី ខ្ញុំឈ្មោះ Chanlito។',
    name: 'Chanlito',
    intro:
      'ខ្ញុំជាអ្នកដឹកនាំផ្នែកបច្ចេកទេសនៅភ្នំពេញ។ ខ្ញុំបង្កើតផលិតផល SaaS និងផលិតផលសម្រាប់សហគ្រាស ហើយខ្ញុំសរសេរអំពី TypeScript កម្មវិធីដែលដំណើរការដោយគ្មានអ៊ីនធឺណិត និងការបង្កើតកម្មវិធីនៅកម្ពុជា។',
    me: 'នេះជាខ្ញុំ!',
    place: 'ភ្នំពេញ',
    shipping: 'នៅតែបង្កើតកម្មវិធី',
    nowTitle: 'ឥឡូវនេះ',
    nowNote: 'ខែតុលា 2026',
    now: [
      'ខ្ញុំកំពុងដឹកនាំការបង្កើត**ប្រព័ន្ធផ្ដល់ប្រាក់កម្ចី**សម្រាប់គ្រឹះស្ថានហិរញ្ញវត្ថុមួយនៅកម្ពុជា។',
      'បង្កើតគេហទំព័រ **[chanlito.dev](https://chanlito.dev/km/)** នៅថ្ងៃឈប់សម្រាក និងចុងសប្ដាហ៍។',
      'ពិភាក្សាអំពីការងារ freelance និងការប្រឹក្សា។',
    ],
    builtTitle: 'គម្រោង',
    builtNote: 'អ្វីដែលខ្ញុំបានបង្កើត',
    projects: [
      { id: 'blue', name: 'Blue', years: '2018 – 2025', blurb: km('វេទិកា|គ្រប់គ្រង|ដំណើរការ|ការងារ ដែល|ក្រុម|ការងារ|រាប់ពាន់|ប្រើប្រាស់។') },
      { id: 'loan-system', name: km('ប្រព័ន្ធ|ដំណើរការ|ស្នើសុំ|កម្ចី'), years: '2026 – បច្ចុប្បន្ន', blurb: km('ជំនួស|ដំណើរការ|កម្ចី|លើ|ក្រដាស នៅ|ស្ថាប័ន|ហិរញ្ញវត្ថុ|មួយ|នៅ|កម្ពុជា។') },
      { id: 'caracol', name: 'Caracol Sports Club', years: '2026', blurb: km('គេហទំព័រ និង|កម្មវិធី|ហាត់ប្រាណ សម្រាប់|កន្លែង|ហាត់ប្រាណ|មួយ|នៅ|ភ្នំពេញ។') },
      { id: 'tesjor', name: 'Tesjor', years: '2016 – 2017', blurb: km('កម្មវិធី|កុម្ម៉ង់|អាហារ ដោយ|មិន|ប្រើ|សាច់ប្រាក់ ដំបូង|គេ|នៅ|កម្ពុជា។') },
    ],
    inkTitle: 'អត្ថបទថ្មីៗ',
    inkNote: 'ទើបសរសេរថ្មីៗ',
    sayHi: 'តោះបង្កើតអ្វីមួយជាមួយគ្នា',
    sayHiBody: 'មានផលិតផលចង់បង្កើត ក្រុមដែលត្រូវការអ្នកដឹកនាំផ្នែកបច្ចេកទេស ឬគ្រាន់តែមានសំណួរ? ផ្ញើសារមកខ្ញុំ។',
  },
  es: {
    greeting: 'សួស្ដី!  Hello!  ¡Hola!',
    title: 'Hola, soy Chanlito.',
    name: 'Chanlito',
    intro:
      'Soy líder técnico en Phnom Penh. Creo productos SaaS y empresariales, y escribo sobre TypeScript, apps offline-first y cómo crear software en Camboya.',
    me: '¡ese soy yo!',
    place: 'Phnom Penh',
    shipping: 'sigo creando',
    nowTitle: 'Ahora',
    nowNote: 'recién escrito, oct 2026',
    now: [
      'Dirijo la construcción de un **sistema de originación de préstamos** para una institución financiera en Camboya.',
      'Construyo **[chanlito.dev](https://chanlito.dev/es/)** en vacaciones y fines de semana, y aprendo Astro con él.',
      'Abierto a hablar de trabajo freelance y consultoría.',
    ],
    builtTitle: 'Cosas que hice',
    builtNote: 'la versión larga está en la web',
    projects: [
      { id: 'blue', name: 'Blue', years: '2018 – 2025', blurb: 'Una plataforma de gestión de procesos con la que miles de equipos organizan su trabajo.' },
      { id: 'loan-system', name: 'Sistema de originación de préstamos', years: '2026 – hoy', blurb: 'Sustituye un proceso de préstamos en papel en una institución financiera de Camboya.' },
      { id: 'caracol', name: 'Caracol Sports Club', years: '2026', blurb: 'La web y la app de entrenamiento de un gimnasio con piscina en Phnom Penh.' },
      { id: 'tesjor', name: 'Tesjor', years: '2016 – 2017', blurb: 'La primera app de pedidos de comida sin efectivo de Camboya.' },
    ],
    inkTitle: 'Artículos recientes',
    inkNote: 'recién escrito',
    sayHi: 'Construyamos algo',
    sayHiBody: '¿Tienes un producto por crear, un equipo que necesita un líder técnico o solo una pregunta? Escríbeme.',
  },
};
