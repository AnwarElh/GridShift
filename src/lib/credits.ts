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
  /* La fiche couvre la trilogie : Revelation n'ayant pas encore de page
     boutique, l'illustration est celle de Rebirth, le dernier épisode paru. */
  'g-final-fantasy-vii-remake-trilogy': { artist: 'Square Enix', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2909400/', file: 'Steam store page, Final Fantasy VII Rebirth' },
  'h-final-fantasy-vii-remake-trilogy': { artist: 'Square Enix', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2909400/', file: 'Steam library hero, Final Fantasy VII Rebirth' },
  'g-the-witcher-3-remastered': { artist: 'CD PROJEKT RED', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/292030/', file: 'Steam store page' },
  'h-the-witcher-3-remastered': { artist: 'CD PROJEKT RED', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/292030/', file: 'Steam library hero' },
  /* Les visuels d'article : une image distincte par article, pour qu'un jeu
     ne se présente pas partout avec la même vignette. Les captures Witcher
     sont recadrées pour retirer le cartouche promotionnel de l'éditeur ; celles
     de KOTOR montrent l'original de 2003, seul jeu de la fiche qui existe. */
  'h-onimusha-way-of-the-sword-1': { artist: 'Capcom', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2638890/', file: 'Steam store screenshot' },
  'h-onimusha-way-of-the-sword-2': { artist: 'Capcom', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2638890/', file: 'Steam store screenshot' },
  'h-onimusha-way-of-the-sword-3': { artist: 'Capcom', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2638890/', file: 'Steam store screenshot' },
  'h-onimusha-way-of-the-sword-4': { artist: 'Capcom', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2638890/', file: 'Steam store screenshot' },
  'h-onimusha-way-of-the-sword-5': { artist: 'Capcom', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2638890/', file: 'Steam store screenshot' },
  'h-the-blood-of-dawnwalker-1': { artist: 'Rebel Wolves / Bandai Namco Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/3751260/', file: 'Steam store screenshot' },
  'h-the-blood-of-dawnwalker-2': { artist: 'Rebel Wolves / Bandai Namco Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/3751260/', file: 'Steam store screenshot' },
  'h-the-blood-of-dawnwalker-3': { artist: 'Rebel Wolves / Bandai Namco Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/3751260/', file: 'Steam store screenshot' },
  'h-the-blood-of-dawnwalker-4': { artist: 'Rebel Wolves / Bandai Namco Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/3751260/', file: 'Steam store screenshot' },
  'h-the-blood-of-dawnwalker-5': { artist: 'Rebel Wolves / Bandai Namco Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/3751260/', file: 'Steam store screenshot' },
  'h-clair-obscur-expedition-33-1': { artist: 'Sandfall Interactive / Kepler Interactive', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/1903340/', file: 'Steam store screenshot' },
  'h-clair-obscur-expedition-33-2': { artist: 'Sandfall Interactive / Kepler Interactive', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/1903340/', file: 'Steam store screenshot' },
  'h-clair-obscur-expedition-33-3': { artist: 'Sandfall Interactive / Kepler Interactive', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/1903340/', file: 'Steam store screenshot' },
  'h-clair-obscur-expedition-33-4': { artist: 'Sandfall Interactive / Kepler Interactive', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/1903340/', file: 'Steam store screenshot' },
  'h-clair-obscur-expedition-33-5': { artist: 'Sandfall Interactive / Kepler Interactive', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/1903340/', file: 'Steam store screenshot' },
  'h-grand-theft-auto-vi-1': { artist: 'Rockstar Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.rockstargames.com/VI/media', file: 'Rockstar press asset, resized' },
  'h-grand-theft-auto-vi-2': { artist: 'Rockstar Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.rockstargames.com/VI/media', file: 'Rockstar press asset, resized' },
  'h-grand-theft-auto-vi-3': { artist: 'Rockstar Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.rockstargames.com/VI/media', file: 'Rockstar press asset, resized' },
  'h-grand-theft-auto-vi-4': { artist: 'Rockstar Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.rockstargames.com/VI/media', file: 'Rockstar press asset, resized' },
  'h-grand-theft-auto-vi-5': { artist: 'Rockstar Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.rockstargames.com/VI/media', file: 'Rockstar press asset, resized' },
  'h-star-wars-kotor-remake-1': { artist: 'Saber Interactive / Lucasfilm Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.youtube.com/watch?v=aw9RaACjZmM', file: 'PlayStation Showcase 2021 cinematic reveal, frame capture' },
  'h-star-wars-kotor-remake-2': { artist: 'BioWare / LucasArts', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/32370/', file: 'Steam key art for the 2003 original' },
  'h-star-wars-kotor-remake-3': { artist: 'Saber Interactive / Lucasfilm Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://www.youtube.com/watch?v=aw9RaACjZmM', file: 'PlayStation Showcase 2021 cinematic reveal, frame capture' },
  'h-star-wars-kotor-remake-4': { artist: 'BioWare / LucasArts', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/32370/', file: 'Steam store screenshot of the 2003 original, cropped to 16:9' },
  'h-final-fantasy-vii-remake-trilogy-1': { artist: 'Square Enix', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2909400/', file: 'Steam store screenshot, Final Fantasy VII Rebirth' },
  'h-final-fantasy-vii-remake-trilogy-2': { artist: 'Square Enix', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2909400/', file: 'Steam store screenshot, Final Fantasy VII Rebirth' },
  'h-final-fantasy-vii-remake-trilogy-3': { artist: 'Square Enix', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2909400/', file: 'Steam store screenshot, Final Fantasy VII Rebirth' },
  'h-final-fantasy-vii-remake-trilogy-4': { artist: 'Square Enix', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2909400/', file: 'Steam store screenshot, Final Fantasy VII Rebirth' },
  'h-the-witcher-3-remastered-1': { artist: 'CD PROJEKT RED', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/292030/', file: 'Steam store screenshot, cropped to drop the promotional cartouche' },
  'h-the-witcher-3-remastered-2': { artist: 'CD PROJEKT RED', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/292030/', file: 'Steam store screenshot, cropped to drop the promotional cartouche' },
  'h-the-witcher-3-remastered-3': { artist: 'CD PROJEKT RED', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/292030/', file: 'Steam store screenshot, cropped to drop the promotional cartouche' },
  'h-the-witcher-3-remastered-4': { artist: 'CD PROJEKT RED', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/292030/', file: 'Steam store screenshot, cropped to drop the promotional cartouche' },
};

/* Astro conserve le nom du fichier source dans l'URL générée
   (« g-onimusha-way-of-the-sword.abc123_xyz.webp ») : on remonte à la clé de la table. */
const nameOf = (src: string) => (src.split('/').pop() ?? '').split('.')[0];

export const creditFor = (img?: { src: string }): Credit | undefined =>
  img ? credits[nameOf(img.src)] : undefined;
