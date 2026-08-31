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
  'g-arknights-endfield': { artist: 'Gryphline / Hypergryph', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/arknights-endfield/id6752642477?uo=4', file: 'Apple App Store listing' },
  'g-enlisted': { artist: 'Darkflow Software / Gaijin Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/708410/', file: 'Steam store page' },
  'g-foundation-galactic-frontier': { artist: 'FunPlus / Paramount Television Studios', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/foundation-galactic-frontier/id6737595599?uo=4', file: 'Apple App Store listing' },
  'g-genshin-impact': { artist: 'HoYoverse', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/genshin-impact/id1517783697?uo=4', file: 'Apple App Store listing' },
  'g-neverness-to-everness': { artist: 'Hotta Studio', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/nte-neverness-to-everness/id6754593077?uo=4', file: 'Apple App Store listing' },
  'g-nikke': { artist: 'Shift Up / Level Infinite', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/goddess-of-victory-nikke/id1585915174?uo=4', file: 'Apple App Store listing' },
  'g-once-human': { artist: 'Starry Studio / NetEase Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2139460/', file: 'Steam store page' },
  'g-rise-of-kingdoms': { artist: 'Lilith Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/rise-of-kingdoms/id1354260888?uo=4', file: 'Apple App Store listing' },
  'g-sea-of-conquest': { artist: 'FunPlus', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/sea-of-conquest-pirate-war/id6463715971?uo=4', file: 'Apple App Store listing' },
  'g-star-trek-fleet-command': { artist: 'Scopely', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/star-trek-fleet-command/id1427744264?uo=4', file: 'Apple App Store listing' },
  'g-three-kingdoms-strategy': { artist: 'Welove Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2651190/', file: 'Steam store page' },
  'g-tiles-survive': { artist: 'FunPlus', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/tiles-survive/id6738109752?uo=4', file: 'Apple App Store listing' },
  'g-war-thunder': { artist: 'Gaijin Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/236390/', file: 'Steam store page' },
  'g-world-of-sea-battle': { artist: 'Thera Interactive', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2948190/', file: 'Steam store page' },
  'g-world-of-tanks-heat': { artist: 'Wargaming', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2100280/', file: 'Steam store page' },
  'g-zenless-zone-zero': { artist: 'HoYoverse', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/zenless-zone-zero-anniv/id1606356401?uo=4', file: 'Apple App Store listing' },
  'h-arknights-endfield': { artist: 'Gryphline / Hypergryph', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/arknights-endfield/id6752642477?uo=4', file: 'Apple App Store listing' },
  'h-enlisted': { artist: 'Darkflow Software / Gaijin Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/708410/', file: 'Steam store page' },
  'h-foundation-galactic-frontier': { artist: 'FunPlus / Paramount Television Studios', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/foundation-galactic-frontier/id6737595599?uo=4', file: 'Apple App Store listing' },
  'h-genshin-impact': { artist: 'HoYoverse', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/genshin-impact/id1517783697?uo=4', file: 'Apple App Store listing' },
  'h-neverness-to-everness': { artist: 'Hotta Studio', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/nte-neverness-to-everness/id6754593077?uo=4', file: 'Apple App Store listing' },
  'h-nikke': { artist: 'Shift Up / Level Infinite', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/goddess-of-victory-nikke/id1585915174?uo=4', file: 'Apple App Store listing' },
  'h-once-human': { artist: 'Starry Studio / NetEase Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2139460/', file: 'Steam store page' },
  'h-rise-of-kingdoms': { artist: 'Lilith Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/rise-of-kingdoms/id1354260888?uo=4', file: 'Apple App Store listing' },
  'h-sea-of-conquest': { artist: 'FunPlus', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/sea-of-conquest-pirate-war/id6463715971?uo=4', file: 'Apple App Store listing' },
  'h-star-trek-fleet-command': { artist: 'Scopely', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/star-trek-fleet-command/id1427744264?uo=4', file: 'Apple App Store listing' },
  'h-three-kingdoms-strategy': { artist: 'Welove Games', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2651190/', file: 'Steam store page' },
  'h-tiles-survive': { artist: 'FunPlus', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/tiles-survive/id6738109752?uo=4', file: 'Apple App Store listing' },
  'h-war-thunder': { artist: 'Gaijin Entertainment', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/236390/', file: 'Steam store page' },
  'h-world-of-sea-battle': { artist: 'Thera Interactive', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2948190/', file: 'Steam store page' },
  'h-world-of-tanks-heat': { artist: 'Wargaming', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://store.steampowered.com/app/2100280/', file: 'Steam store page' },
  'h-zenless-zone-zero': { artist: 'HoYoverse', licence: 'Éditeur — usage éditorial', licenceUrl: '', source: 'https://apps.apple.com/us/app/zenless-zone-zero-anniv/id1606356401?uo=4', file: 'Apple App Store listing' },
};

/* Astro conserve le nom du fichier source dans l'URL générée
   (« g-genshin-impact.abc123_xyz.webp ») : on remonte à la clé de la table. */
const nameOf = (src: string) => (src.split('/').pop() ?? '').split('.')[0];

export const creditFor = (img?: { src: string }): Credit | undefined =>
  img ? credits[nameOf(img.src)] : undefined;
