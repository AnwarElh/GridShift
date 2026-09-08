import { locales, type Locale } from '../i18n/config.ts';

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

const BCP47: Record<Locale, string> = { en: 'en-GB', fr: 'fr-FR', de: 'de-DE' };

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

/* Dérivé de `locales` plutôt qu'énuméré : une table écrite à la main aurait
   laissé l'allemand sans formateur — donc un `undefined.format()` à la
   première date rendue sous /de/. */
const F = Object.fromEntries(locales.map((l) => [l, make(l)])) as Record<Locale, ReturnType<typeof make>>;

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
   nombre de mots égal, les deux repères usuels de la presse éditoriale.
   L'allemand est plus lent encore — ses mots composés font moins de mots pour
   autant de signes, donc un compteur au mot surestime la vitesse s'il garde
   le repère anglais. */
const WPM: Record<Locale, number> = { en: 250, fr: 230, de: 220 };
export const readingTime = (body = '', lang: Locale = 'en') =>
  Math.max(1, Math.round(body.trim().split(/\s+/).length / WPM[lang]));

/* « il y a 2 heures » : la fraîcheur est ce qu'un portail vend en premier.
   Au-delà de 24 h on repasse à la date — une page peut être servie depuis le
   cache, et « il y a 5 heures » y vieillit mal quand « 12 SEPT. » reste vrai.
   Le script du site corrige la valeur au chargement à partir de `datetime`. */
const REL: Record<Locale, Intl.RelativeTimeFormat> = Object.fromEntries(
  locales.map((l) => [l, new Intl.RelativeTimeFormat(BCP47[l], { numeric: 'always' })]),
) as Record<Locale, Intl.RelativeTimeFormat>;

export const ago = (d: Date, lang: Locale, now = new Date()) => {
  const mins = Math.round((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return REL[lang].format(0, 'minute');
  if (mins < 60) return REL[lang].format(-mins, 'minute');
  const hours = Math.round(mins / 60);
  if (hours < 24) return REL[lang].format(-hours, 'hour');
  return shortDate(d, lang);
};
