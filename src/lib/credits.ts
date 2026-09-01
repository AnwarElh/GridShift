/* Crédits des visuels.

   Les visuels de jeu sont les supports promotionnels publiés par les éditeurs
   eux-mêmes — jaquettes de boutique et captures de fiche. Ils restent la
   propriété de leurs ayants droit et sont repris ici au titre de l'illustration
   éditoriale : on ne peut pas rendre compte d'un jeu sans le montrer.

   Nous ne revendiquons aucun droit sur ces images. Tout éditeur qui souhaite
   qu'un visuel soit retiré ou remplacé peut nous écrire ; ce sera fait.

   La table est indexée par nom de fichier source, que l'URL générée par Astro
   conserve en dev comme en production. */
export interface Credit {
  artist: string; licence: string; licenceUrl: string; source: string; file: string;
}

export const credits: Record<string, Credit> = {
  'g-genshin-impact': { artist: 'HoYoverse', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/genshin-impact/id1517783697?uo=4', file: 'Apple App Store listing' },
  'g-once-human': { artist: 'Starry Studio / NetEase Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2139460/', file: 'Steam store page' },
  'g-war-thunder': { artist: 'Gaijin Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/236390/', file: 'Steam store page' },
  'g-world-of-tanks-heat': { artist: 'Wargaming', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2100280/', file: 'Steam store page' },
  'g-zenless-zone-zero': { artist: 'HoYoverse', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/zenless-zone-zero-anniv/id1606356401?uo=4', file: 'Apple App Store listing' },
  'h-genshin-impact': { artist: 'HoYoverse', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/genshin-impact/id1517783697?uo=4', file: 'Apple App Store listing' },
  'h-once-human': { artist: 'Starry Studio / NetEase Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2139460/', file: 'Steam store page' },
  'h-war-thunder': { artist: 'Gaijin Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/236390/', file: 'Steam store page' },
  'h-world-of-tanks-heat': { artist: 'Wargaming', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2100280/', file: 'Steam store page' },
  'h-zenless-zone-zero': { artist: 'HoYoverse', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/zenless-zone-zero-anniv/id1606356401?uo=4', file: 'Apple App Store listing' },
};

/* Astro conserve le nom du fichier source dans l'URL générée
   (« g-genshin-impact.abc123_xyz.webp ») : on remonte à la clé de la table. */
const nameOf = (src: string) => (src.split('/').pop() ?? '').split('.')[0];

export const creditFor = (img?: { src: string }): Credit | undefined =>
  img ? credits[nameOf(img.src)] : undefined;
