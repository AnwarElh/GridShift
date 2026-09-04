/* Crédits des visuels.

   Les visuels de jeu sont les supports promotionnels publiés par les éditeurs
   eux-mêmes — jaquettes de boutique et captures de fiche. Ils restent la
   propriété de leurs ayants droit et sont repris ici au titre de l'illustration
   éditoriale : on ne peut pas rendre compte d'un jeu sans le montrer.

   Nous ne revendiquons aucun droit sur ces images. Tout éditeur qui souhaite
   qu'un visuel soit retiré ou remplacé peut nous écrire ; ce sera fait.

   Quand un visuel est recadré, la mention le dit : on retire le cartouche du
   studio et l'appel à l'action d'un visuel promotionnel pour qu'il illustre
   sans faire de la réclame, jamais pour changer ce qu'il montre.

   La table est indexée par nom de fichier source, que l'URL générée par Astro
   conserve en dev comme en production. */
export interface Credit {
  artist: string; licence: string; licenceUrl: string; source: string; file: string;
}

export const credits: Record<string, Credit> = {
  'g-grand-theft-auto-vi': { artist: 'Rockstar Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.rockstargames.com/VI', file: 'Rockstar Games key art, cropped' },
  'g-clair-obscur-expedition-33': { artist: 'Sandfall Interactive / Kepler Interactive', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/1903340/', file: 'Steam store page' },
  'g-star-wars-kotor-remake': { artist: 'Saber Interactive / Lucasfilm Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://blog.playstation.com/2021/09/09/star-wars-knights-of-the-old-republic-remake-is-the-legendary-tale-remade-on-playstation-5/', file: 'PlayStation Blog key visual, cropped' },
  'g-onimusha-way-of-the-sword': { artist: 'Capcom', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2638890/', file: 'Steam store page' },
  'g-the-blood-of-dawnwalker': { artist: 'Rebel Wolves / Bandai Namco Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.gog.com/en/game/the_blood_of_dawnwalker', file: 'GOG store page' },
  'h-grand-theft-auto-vi': { artist: 'Rockstar Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.rockstargames.com/VI', file: 'Rockstar Games key art, cropped' },
  'h-clair-obscur-expedition-33': { artist: 'Sandfall Interactive / Kepler Interactive', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/1903340/', file: 'Steam library hero' },
  'h-star-wars-kotor-remake': { artist: 'Saber Interactive / Lucasfilm Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://blog.playstation.com/2021/09/09/star-wars-knights-of-the-old-republic-remake-is-the-legendary-tale-remade-on-playstation-5/', file: 'PlayStation Blog key visual' },
  'h-onimusha-way-of-the-sword': { artist: 'Capcom', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2638890/', file: 'Steam library hero' },
  'h-the-blood-of-dawnwalker': { artist: 'Rebel Wolves / Bandai Namco Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.gog.com/en/game/the_blood_of_dawnwalker', file: 'GOG store key art' },
};

/* Astro conserve le nom du fichier source dans l'URL générée
   (« g-onimusha-way-of-the-sword.abc123_xyz.webp ») : on remonte à la clé de la table. */
const nameOf = (src: string) => (src.split('/').pop() ?? '').split('.')[0];

export const creditFor = (img?: { src: string }): Credit | undefined =>
  img ? credits[nameOf(img.src)] : undefined;
