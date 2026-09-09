-- Les variantes d'un média voyagent avec lui.
--
-- Rendre une page lisait `media_variants` en entier : 705 lignes pour écrire
-- trois srcset. D1 facture les lignes LUES, pas les lignes rendues — 870 par
-- page, dont 705 pour cette seule table, soit un plafond de ~5 700 rendus par
-- jour sur le plan gratuit. La normalisation servait une lecture qui n'existe
-- pas : personne ne cherche une variante sans son média, et `load()` les
-- rassemble aussitôt dans une Map. Elles rejoignent donc la ligne du média, en
-- JSON, et le rendu retombe à ~165 lignes.
--
-- `variants` est une projection régénérable, au même titre que `body_html` :
-- scripts/media-build.mjs la réécrit en entier à chaque publication des
-- médias. La source de vérité reste les fichiers de src/assets.

ALTER TABLE media ADD COLUMN variants TEXT NOT NULL DEFAULT '[]';

-- Reprise de l'existant. Sans elle, une base déjà peuplée perdrait son échelle
-- responsive entre cette migration et la prochaine publication des médias —
-- et servirait l'original de 1920px dans une vignette de 82px, ce que tout le
-- dispositif existe pour empêcher.
--
-- L'ordre des largeurs n'est pas garanti par json_group_array et n'a pas à
-- l'être : Fig.astro trie l'échelle avant d'écrire le srcset.
UPDATE media SET variants = COALESCE((
  SELECT json_group_array(json_object(
    'width',  v.width,
    'height', v.height,
    'format', v.format,
    'key',    v.object_key))
  FROM media_variants v WHERE v.media_key = media.key
), '[]');

-- La table n'a plus de lecteur. La garder, c'est garder une copie qui diverge
-- en silence dès la prochaine publication.
DROP TABLE media_variants;
