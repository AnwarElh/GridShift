/* La méta-description : ce que le moteur montre sous le titre.
 *
 * Le chapô sert de description depuis toujours, et c'est le bon texte — mais il
 * est écrit pour la page, où il n'a pas de longueur maximale. Google coupe
 * autour de 160 signes : vingt de nos chapôs y perdaient leur seconde moitié,
 * et l'extrait se terminait au milieu d'une proposition.
 *
 * On coupe donc nous-mêmes, et sur une phrase entière quand il y en a une qui
 * remplit l'espace : une phrase complète dit quelque chose, trois mots suivis
 * de points de suspension ne disent rien. Mais une phrase de quarante signes
 * laisse les cent vingt autres vides, et un extrait au tiers rempli est une
 * occasion perdue autant qu'une phrase coupée : sous `FLOOR`, on préfère donc
 * la coupe au mot, qui prend tout le budget.
 *
 * Ce fichier n'importe rien : il est appelé depuis le gabarit ET depuis le banc
 * d'essai, et `format.ts` — sa maison naturelle — tire `import.meta.env` par la
 * configuration des langues, donc ne s'ouvre pas hors de Vite.
 */

/* La fin de phrase se reconnaît à ce qui la SUIT — une espace puis une
   majuscule — et non au point seul : « nous l'avons noté 8.2 », « le 8 avril
   2027 » et « 99.99 € » portent des points qui ne terminent rien.
   On cherche les FINS, pas les phrases : une expression qui décrit la phrase
   entière peut commencer sa correspondance après le début du texte, et tout ce
   qui la précède disparaît alors sans bruit. Une position se tranche toujours
   depuis le premier signe. */
const END = /[.!?]+(?=\s+[A-ZÀ-ÖØ-Þ«"'“(]|$)/g;

/* En deçà, une phrase entière laisse trop de place inutilisée. */
const FLOOR = 110;

export const metaDescription = (text: string, max = 160): string => {
  const s = text.replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;

  let end = 0;
  for (const m of s.matchAll(END)) {
    const stop = m.index + m[0].length;
    if (stop > max) break;
    end = stop;
  }
  if (end >= FLOOR) return s.slice(0, end);

  const cut = s.lastIndexOf(' ', max - 1);
  return `${s.slice(0, cut > 0 ? cut : max - 1).replace(/[\s,;:—–-]+$/, '')}…`;
};

/* Le titre d'onglet : le nom d'abord, le qualificatif s'il reste la place.
 *
 * Une fiche de jeu doit dire « guides », « test », « actus » — ce sont les
 * requêtes qu'un média peut gagner, là où le nom seul le met derrière le studio
 * et la boutique. Mais les noms de jeux vont de dix-neuf signes à quarante-sept,
 * et le même suffixe pour tous ferait déborder les plus longs.
 *
 * On prend donc le suffixe le plus complet qui rentre, et aucun quand il ne
 * reste rien : à quarante-sept signes, le nom EST le titre, et lui coller des
 * mots que le moteur coupera n'ajoute pas un caractère utile.
 *
 * `max` est le budget du titre seul : le gabarit ajoute « — Autnic » derrière,
 * et c'est l'ensemble qui doit tenir dans les soixante signes d'usage. */
export const titleWithin = (name: string, suffixes: readonly string[], max = 51): string =>
  name + (suffixes.find((s) => name.length + s.length <= max) ?? '');
