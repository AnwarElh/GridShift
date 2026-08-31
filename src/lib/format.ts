import type { Locale } from '../i18n/config';

/* Palier de couleur d'une note — les seuils du système : 90 / 80 / 70 / 50 / 0. */
export const scoreBucket = (score: number): '90' | '80' | '70' | '50' | '0' => {
  if (score >= 9) return '90';
  if (score >= 8) return '80';
  if (score >= 7) return '70';
  if (score >= 5) return '50';
  return '0';
};

/* ── Formats localisés ──────────────────────────────────────────────────────
   Un seul jeu de formateurs par langue, construit une fois. `Intl` porte la
   règle : 9.1 s'écrit « 9,1 » en français et « 9.1 » en anglais, et le mois
   ne s'abrège pas de la même manière. Rien n'est codé en dur. */

const BCP47: Record<Locale, string> = { en: 'en-GB', fr: 'fr-FR' };

const make = (lang: Locale) => {
  const l = BCP47[lang];
  return {
    num: new Intl.NumberFormat(l, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    int: new Intl.NumberFormat(l),
    long: new Intl.DateTimeFormat(l, { day: 'numeric', month: 'long', year: 'numeric' }),
    short: new Intl.DateTimeFormat(l, { day: '2-digit', month: 'short' }),
    time: new Intl.DateTimeFormat(l, { hour: '2-digit', minute: '2-digit' }),
  };
};

const F: Record<Locale, ReturnType<typeof make>> = { en: make('en'), fr: make('fr') };

export const num = (n: number, lang: Locale) => F[lang].num.format(n);
export const int = (n: number, lang: Locale) => F[lang].int.format(n);
export const longDate = (d: Date, lang: Locale) => F[lang].long.format(d);
export const time = (d: Date, lang: Locale) => F[lang].time.format(d);
export const iso = (d: Date) => d.toISOString();

/* Le point abrégeant le mois saute : la puce de calendrier est déjà courte,
   et « AOÛT » se lit mieux que « AOÛT. » sur deux lignes. */
export const shortDate = (d: Date, lang: Locale) =>
  F[lang].short.format(d).toUpperCase().replace('.', '');

/* Une actu du jour s'affiche à l'heure, le reste à la date. */
export const feedStamp = (d: Date, lang: Locale, now = new Date()) =>
  d.toDateString() === now.toDateString() ? time(d, lang) : shortDate(d, lang);

/* Vitesse de lecture : l'anglais se lit un peu plus vite que le français à
   nombre de mots égal, les deux repères usuels de la presse éditoriale. */
const WPM: Record<Locale, number> = { en: 250, fr: 230 };
export const readingTime = (body = '', lang: Locale = 'en') =>
  Math.max(1, Math.round(body.trim().split(/\s+/).length / WPM[lang]));
