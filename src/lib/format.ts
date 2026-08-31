/* Palier de couleur d'une note — les seuils du système : 90 / 80 / 70 / 50 / 0. */
export const scoreBucket = (score: number): '90' | '80' | '70' | '50' | '0' => {
  if (score >= 9) return '90';
  if (score >= 8) return '80';
  if (score >= 7) return '70';
  if (score >= 5) return '50';
  return '0';
};

/* 9.1 → « 9,1 » : le système est francophone, la virgule est décimale. */
export const num = (n: number) => n.toFixed(1).replace('.', ',');

const DF = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const DF_SHORT = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });
const TF = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

export const longDate = (d: Date) => DF.format(d);
export const shortDate = (d: Date) => DF_SHORT.format(d).toUpperCase().replace('.', '');
export const time = (d: Date) => TF.format(d);
export const iso = (d: Date) => d.toISOString();

/* Une actu du jour s'affiche à l'heure, le reste à la date : un média se lit à l'heure. */
export const feedStamp = (d: Date, now = new Date()) =>
  d.toDateString() === now.toDateString() ? time(d) : shortDate(d);

/* ~230 mots/min, valeur repère d'un texte éditorial français. */
export const readingTime = (body = '') => Math.max(1, Math.round(body.trim().split(/\s+/).length / 230));
