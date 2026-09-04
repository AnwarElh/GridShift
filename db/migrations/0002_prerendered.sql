-- Ce qui est coûteux est calculé à la publication, pas à chaque visite.
--
-- Deux choses coûtent cher au rendu d'une page : transformer le Markdown en
-- HTML (avec la coloration syntaxique), et fabriquer une image à la bonne
-- largeur. Les deux ne dépendent que du contenu, jamais du lecteur. Les faire
-- à la publication les fait une fois ; les faire dans le worker les ferait à
-- chaque page froide, sur le budget CPU du visiteur.
--
-- D1 reste la source de vérité : `body` porte le Markdown écrit par la
-- rédaction, `body_html` n'en est qu'une projection régénérable.

-- Le corps rendu, par la même chaîne remark/shiki que le site utilise
-- aujourd'hui — donc le même HTML, à l'octet près.
ALTER TABLE articles ADD COLUMN body_html TEXT NOT NULL DEFAULT '';

-- L'échelle responsive d'un média. Une ligne par largeur et par format.
-- Sans ces lignes, srcset ne peut pas être écrit et le navigateur télécharge
-- l'original : c'est exactement la régression qu'on refuse.
CREATE TABLE media_variants (
  media_key   TEXT NOT NULL REFERENCES media(key) ON DELETE CASCADE,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  format      TEXT NOT NULL,            -- webp | jpeg
  bytes       INTEGER NOT NULL,
  object_key  TEXT NOT NULL,            -- la clé R2 : « h-x.1080.webp »
  PRIMARY KEY (media_key, width, format)
);

CREATE INDEX idx_media_variants_key ON media_variants(media_key, format, width);
