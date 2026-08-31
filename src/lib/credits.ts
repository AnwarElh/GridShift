/* Crédits des visuels — Wikimedia Commons.
   Chaque image est sous CC0, domaine public, CC BY ou CC BY-SA : la
   réutilisation est libre, l'attribution est la contrepartie. La table est
   indexée par nom de fichier source, que l'URL générée par Astro conserve
   en dev comme en production, ce qui évite de recopier le crédit dans
   chaque front-matter. */
export interface Credit {
  artist: string; licence: string; licenceUrl: string; source: string; file: string;
}

export const credits: Record<string, Credit> = {
  'a-bien-demarrer': { artist: 'SolarMainframe', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:Mechanical_Keyboard.jpg', file: 'Mechanical Keyboard.jpg' },
  'a-blue-repousse': { artist: 'Gamerscore Blog', licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0', source: 'https://commons.wikimedia.org/wiki/File:Capcom_booth,_Tokyo_Game_Show_20070919.jpg', file: 'Capcom booth, Tokyo Game Show 20070919.jpg' },
  'a-builds-debut': { artist: 'Blake Patterson', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0', source: 'https://commons.wikimedia.org/wiki/File:Clutterage.jpg', file: 'Clutterage.jpg' },
  'a-echo-test': { artist: 'Exilexi', licence: 'CC0', licenceUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en', source: 'https://commons.wikimedia.org/wiki/File:LCS_Summer_Split_2017_in_Paris.jpg', file: 'LCS Summer Split 2017 in Paris.jpg' },
  'a-gamescom': { artist: 'D-Kuru', licence: 'CC BY-SA 3.0 at', licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0/at/deed.en', source: 'https://commons.wikimedia.org/wiki/File:Booth_of_Electronic_Arts_at_gamescom_2009_-_waiting_crowd_PNr%C2%B00200.JPG', file: 'Booth of Electronic Arts at gamescom 2009 - waiting crowd PNr°0200.JPG' },
  'a-iron-coop': { artist: 'Hilary Murugu', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:Gamers_playing_Mortal_Kombat_at_a_Nexgen_gaming_event_in_Nairobi.jpg', file: 'Gamers playing Mortal Kombat at a Nexgen gaming event in Nairobi.jpg' },
  'a-iron-escouades': { artist: 'WDGオーバーウォッチ', licence: 'CC BY 3.0', licenceUrl: 'https://creativecommons.org/licenses/by/3.0', source: 'https://commons.wikimedia.org/wiki/File:Crusty_2024_OWCS_-_01.jpg', file: 'Crusty 2024 OWCS - 01.jpg' },
  'a-iron-test': { artist: 'U.S. Air Force photo by Airman William Tracy', licence: 'Public domain', licenceUrl: '', source: 'https://commons.wikimedia.org/wiki/File:1st_SOPS_prevails_in_esports_championship_(4725559).jpg', file: '1st SOPS prevails in esports championship (4725559).jpg' },
  'a-patch-economie': { artist: 'Tdolphin~plwiki', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:Atari_2600_clone.jpg', file: 'Atari 2600 clone.jpg' },
  'a-reglages-pc': { artist: 'Brian Wong', licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0', source: 'https://commons.wikimedia.org/wiki/File:Gaming_PC-Setup_-_Astaroth-_The_Completed_System.jpg', file: 'Gaming PC-Setup - Astaroth- The Completed System.jpg' },
  'a-secrets-district': { artist: 'Jason "Textfiles" Scott', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0', source: 'https://commons.wikimedia.org/wiki/File:German_Computer_Museum.jpg', file: 'German Computer Museum.jpg' },
  'a-switch-2': { artist: 'PantheraLeo1359531', licence: 'CC BY 4.0', licenceUrl: 'https://creativecommons.org/licenses/by/4.0', source: 'https://commons.wikimedia.org/wiki/File:Innenleben_der_Nintendo_Switch_20230405_HOF09139_RAW-Export.png', file: 'Innenleben der Nintendo Switch 20230405 HOF09139 RAW-Export.png' },
  'a-vertige-note': { artist: 'PattayaPatrol', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:DFC_0797_Close-up_of_a_row_of_retro_arcade_game_joysticks_glowing_with_neon_blue_and_pink_lights.jpg', file: 'DFC 0797 Close-up of a row of retro arcade game joysticks glowing with neon blue and pink lights.jpg' },
  'g-blue-meridian': { artist: 'tinyfroglet', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0', source: 'https://commons.wikimedia.org/wiki/File:Age_of_Conan_promoters_at_Games_Convention_(2834069656).jpg', file: 'Age of Conan promoters at Games Convention (2834069656).jpg' },
  'g-echo-divide': { artist: 'User:Piotrus', licence: 'CC BY 3.0', licenceUrl: 'https://creativecommons.org/licenses/by/3.0', source: 'https://commons.wikimedia.org/wiki/File:Japanese_computer_arcade_gaming_machine.jpg', file: 'Japanese computer arcade gaming machine.jpg' },
  'g-iron-district': { artist: 'aGameScout', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:Blue_scuti_2024.jpg', file: 'Blue scuti 2024.jpg' },
  'g-nord-sombre': { artist: 'SankalpSasnur', licence: 'CC0', licenceUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en', source: 'https://commons.wikimedia.org/wiki/File:RGB_gaming_headset_on_desk_with_ambient_lighting.jpg', file: 'RGB gaming headset on desk with ambient lighting.jpg' },
  'g-vertige': { artist: 'Stéfan Le Dû', licence: 'CC BY-SA 2.5', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.5', source: 'https://commons.wikimedia.org/wiki/File:Addams_family_pinball.jpg', file: 'Addams family pinball.jpg' },
  'h-blue-meridian': { artist: 'Matias Tukiainen from Espoo, Finland', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0', source: 'https://commons.wikimedia.org/wiki/File:20140118174713IMG_5618_M_-_Desucon_Frostbite_2014_-_matiast1_(cropped).jpg', file: '20140118174713IMG 5618 M - Desucon Frostbite 2014 - matiast1 (cropped).jpg' },
  'h-echo-divide': { artist: '갱맘TV', licence: 'CC BY 3.0', licenceUrl: 'https://creativecommons.org/licenses/by/3.0', source: 'https://commons.wikimedia.org/wiki/File:LoL_Worlds_2020_Stage_-_01.jpg', file: 'LoL Worlds 2020 Stage - 01.jpg' },
  'h-iron-district': { artist: 'Stuballew', licence: 'CC BY-SA 3.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0', source: 'https://commons.wikimedia.org/wiki/File:LAN_Party.jpg', file: 'LAN Party.jpg' },
  'h-nord-sombre': { artist: 'Mashekwa Wakung\'uma', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:An_Internet_caf%C3%A9-_Zambia.jpg', file: 'An Internet café- Zambia.jpg' },
  'h-vertige': { artist: 'Tom Page', licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0', source: 'https://commons.wikimedia.org/wiki/File:Arcade,_Japan-style_in_2005_(73604641).jpg', file: 'Arcade, Japan-style in 2005 (73604641).jpg' },
};

const nameOf = (src: string) => src.split('?')[0].split('/').pop()!.split('.')[0];

export const creditFor = (img?: { src: string }): Credit | undefined =>
  img ? credits[nameOf(img.src)] : undefined;
