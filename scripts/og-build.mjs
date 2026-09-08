#!/usr/bin/env node
/**
 * La carte de partage par défaut — public/og-default.png, 1200×630.
 *
 * Base.astro l'annonce en og:image sur toute page qui n'a pas d'image à elle :
 * les rubriques, les index, les pages légales, l'accueil des trois langues.
 * Le fichier n'existait pas, donc chaque partage de ces pages montrait un
 * cadre vide — Facebook, X et Slack demandent l'image et reçoivent un 404.
 *
 * Elle ne porte aucun texte de langue : le même fichier sert /en, /fr et /de.
 * D'où le parti pris — la marque, et rien qu'elle.
 *
 * Le motif est le nom : une grille dont les colonnes se décalent de plus en
 * plus vers la droite, et une diagonale de cellules qui prend le dégradé
 * signature. La cellule est le glyphe de la marque, carré à l'angle entaillé.
 *
 * Les tracés de « AUTNIC » et de « EN · FR · DE » sont écrits en dur : ils
 * viennent de public/fonts/chakra-700-latin.woff2 et
 * public/fonts/jetbrains-normal-latin.woff2, convertis une fois en contours
 * (fontTools, SVGPathPen). Figés ici, le script ne dépend que de sharp — la
 * seule dépendance que le projet a déjà. Pour changer le texte, il faut
 * refaire l'extraction ; c'est le prix, et il se paie une fois.
 *
 *   node scripts/og-build.mjs
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/og-default.png');

const W = 1200, H = 630;

/* Les jetons de src/styles/autnic.css, thème Nuit. La carte de partage ne
   suit pas la préférence du lecteur : elle est fixe, donc elle est en Nuit. */
const BG = '#0E1016', S2 = '#1D222E', S3 = '#28303E';
const TX = '#F3F5F9', TX3 = '#8F97A5';
const BRASS = '#FF6B00', LIVE = '#FF5252';

/* « AUTNIC », Chakra Petch 700, corps 128, interlettrage 3.
   Ligne de base en y=0, capitales jusqu'à y=-89.6, chasse totale 473.42. */
const WORDMARK = 'M33.41 -89.6H49.28L82.05 0H64.38L57.09 -19.84H25.6L18.3 0H0.64ZM53.25 -34.18 41.34 -68.22H41.09L29.57 -34.18ZM94.01 -15.36V-89.6H111.42V-21.38L117.94 -14.85H143.03L149.56 -21.38V-89.6H166.97V-15.36L151.61 0H109.37ZM206.96 -74.88H180.21V-89.6H251.12V-74.88H224.37V0H206.96ZM264.36 -89.6H279.98L319.91 -28.8H320.17V-89.6H336.94V0H321.32L281.38 -60.67H281.13V0H264.36ZM357.22 -89.6H374.62V0H357.22ZM393.62 -14.72V-74.88L408.34 -89.6H452.12L466.58 -75.14V-61.44H449.18V-68.74L443.16 -74.75H417.56L411.03 -68.22V-21.38L417.56 -14.85H443.16L449.18 -20.86V-28.16H466.58V-14.46L452.12 0H408.34Z';

/* « EN · FR · DE », JetBrains Mono 400, corps 20, interlettrage 3.4.
   Le seul texte que la carte puisse porter sans choisir une langue. */
const LANGS = 'M2 0V-14.6H10.4V-12.96H3.78V-8.44H9.7V-6.82H3.78V-1.64H10.4V0ZM17.2 0V-14.6H19.6L24.06 -2.1Q24.02 -2.6 23.97 -3.33Q23.92 -4.06 23.89 -4.87Q23.86 -5.68 23.86 -6.4V-14.6H25.6V0H23.2L18.76 -12.5Q18.8 -12.02 18.84 -11.29Q18.88 -10.56 18.91 -9.75Q18.94 -8.94 18.94 -8.2V0ZM52.2 -5.2Q51.44 -5.2 50.99 -5.64Q50.54 -6.08 50.54 -6.82Q50.54 -7.6 50.99 -8.06Q51.44 -8.52 52.2 -8.52Q52.96 -8.52 53.41 -8.06Q53.86 -7.6 53.86 -6.82Q53.86 -6.08 53.41 -5.64Q52.96 -5.2 52.2 -5.2ZM78.9 0V-14.62H87.5V-12.98H80.66V-8.12H86.98V-6.48H80.7V0ZM94.24 0V-14.6H98.76Q100.06 -14.6 101.04 -14.07Q102.02 -13.54 102.56 -12.6Q103.1 -11.66 103.1 -10.4Q103.1 -8.92 102.33 -7.86Q101.56 -6.8 100.24 -6.4L103.3 0H101.18L98.38 -6.2H96.04V0ZM96.04 -7.82H98.76Q99.88 -7.82 100.56 -8.53Q101.24 -9.24 101.24 -10.4Q101.24 -11.58 100.56 -12.28Q99.88 -12.98 98.76 -12.98H96.04ZM129.2 -5.2Q128.44 -5.2 127.99 -5.64Q127.54 -6.08 127.54 -6.82Q127.54 -7.6 127.99 -8.06Q128.44 -8.52 129.2 -8.52Q129.96 -8.52 130.41 -8.06Q130.86 -7.6 130.86 -6.82Q130.86 -6.08 130.41 -5.64Q129.96 -5.2 129.2 -5.2ZM155.84 0V-14.6H159.62Q161.04 -14.6 162.07 -14.06Q163.1 -13.52 163.67 -12.54Q164.24 -11.56 164.24 -10.22V-4.4Q164.24 -3.06 163.67 -2.07Q163.1 -1.08 162.07 -0.54Q161.04 0 159.62 0ZM157.64 -1.6H159.62Q160.94 -1.6 161.69 -2.34Q162.44 -3.08 162.44 -4.4V-10.22Q162.44 -11.52 161.69 -12.26Q160.94 -13 159.62 -13H157.64ZM171.4 0V-14.6H179.8V-12.96H173.18V-8.44H179.1V-6.82H173.18V-1.64H179.8V0Z';

/* Le glyphe de la marque : carré à l'angle inférieur droit entaillé, décrit
   sur 18 unités comme dans public/favicon.svg. L'entaille vaut 35 % du côté —
   c'est ce rapport qui rend la forme reconnaissable à 24px comme à 92. */
const cell = (x, y, size, fill, opacity = 1) => {
  const n = size * 0.35;
  return `<path d="M${x} ${y}h${size}v${size - n}l${-n} ${n}H${x}Z" fill="${fill}"${
    opacity < 1 ? ` opacity="${opacity}"` : ''}/>`;
};

/* Le motif : quatre colonnes et demie, chacune décalée vers le bas un peu plus
   que la précédente. C'est le nom du site, dessiné. La grille déborde en haut,
   en bas et à droite : un motif qui s'arrête net à l'intérieur du cadre se lit
   comme un objet, pas comme une trame. */
const PITCH = 118, SIZE = 92, SHIFT = 48, X0 = 760;
const motif = [];
for (let col = 0; col < 5; col++) {
  const x = X0 + col * PITCH;
  for (let row = -1; row < 7; row++) {
    const y = -40 + row * PITCH + col * SHIFT;
    if (y > H || y + SIZE < 0) continue;
    /* Une diagonale prend le dégradé signature ; le reste tient la trame.
       Deux valeurs de gris, pas une : une trame d'un seul ton est un damier,
       et un damier ne suggère aucune profondeur. */
    const onDiagonal = row - col === 2;
    if (onDiagonal) motif.push(cell(x, y, SIZE, 'url(#grad)'));
    else motif.push(cell(x, y, SIZE, (row + col) % 2 ? S3 : S2, 0.85));
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- le dégradé signature du portail : or → rouge, comme le jeton grad -->
    <linearGradient id="grad" gradientUnits="userSpaceOnUse"
      x1="${X0}" y1="0" x2="${W}" y2="${H}">
      <stop offset="0" stop-color="${BRASS}"/><stop offset="1" stop-color="${LIVE}"/>
    </linearGradient>
    <linearGradient id="ruleGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${BRASS}"/><stop offset="1" stop-color="${LIVE}"/>
    </linearGradient>
    <!-- Le motif s'éteint vers la gauche : sans ce fondu, la trame vient
         buter contre le mot et lui dispute la lecture. -->
    <linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${BG}"/><stop offset="1" stop-color="${BG}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${BG}"/>
  ${motif.join('\n  ')}
  <rect x="636" y="0" width="124" height="${H}" fill="url(#fadeL)"/>

  <!-- Le glyphe, puis le mot, puis le filet, puis les langues : un seul axe
       vertical à gauche, aligné sur la marge de 88. -->
  <g transform="translate(88 172) scale(4.222)">
    ${cell(0, 0, 18, BRASS)}
  </g>
  <path transform="translate(88 370)" d="${WORDMARK}" fill="${TX}"/>
  <rect x="88" y="408" width="220" height="6" fill="url(#ruleGrad)"/>
  <path transform="translate(88 458)" d="${LANGS}" fill="${TX3}"/>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
await writeFile(OUT, png);
console.log(`public/og-default.png — ${W}×${H}, ${(png.length / 1024).toFixed(0)} Ko`);
