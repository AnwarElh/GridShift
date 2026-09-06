-- L'allemand entre dans le schéma.
--
-- Deux natures de changement, pour les deux stratégies du modèle :
--
--   une ENTITÉ — jeu, auteur, rubrique — gagne des colonnes `_de`. Une ligne,
--   quelques colonnes traduites : le prix, la note et le nombre d'abonnés ne
--   sont pas dupliqués, donc ils ne peuvent pas diverger.
--
--   un ARTICLE gagne des LIGNES, pas des colonnes. Sa clé est (slug, lang) et
--   `lang` portait un CHECK à deux valeurs : sans cette migration, la première
--   insertion allemande était rejetée par la base. SQLite ne sait pas modifier
--   une contrainte CHECK en place — la table est donc reconstruite.
--
-- Les étiquettes sont mises à l'abri avant la reconstruction : article_tags
-- référence articles(slug, lang) en ON DELETE CASCADE, et le DROP de la table
-- parente déclenche cette cascade. Sans cette précaution, la migration aurait
-- vidé toutes les étiquettes du site sans rien dire.

-- ── Rubriques ───────────────────────────────────────────────────────────────
-- Le segment allemand suit la presse jeu vidéo allemande : « tests » pour les
-- tests, « technik » pour le matériel et les réglages. Ce sont les mots que le
-- lecteur cherche, pas la traduction littérale de l'anglais.
ALTER TABLE sections ADD COLUMN slug_de  TEXT NOT NULL DEFAULT '';
ALTER TABLE sections ADD COLUMN label_de TEXT NOT NULL DEFAULT '';

UPDATE sections SET slug_de = 'news',    label_de = 'News'    WHERE key = 'news';
UPDATE sections SET slug_de = 'tests',   label_de = 'Tests'   WHERE key = 'review';
UPDATE sections SET slug_de = 'guides',  label_de = 'Guides'  WHERE key = 'guide';
UPDATE sections SET slug_de = 'technik', label_de = 'Technik' WHERE key = 'setup';

-- ── Auteurs ─────────────────────────────────────────────────────────────────
ALTER TABLE authors ADD COLUMN role_de  TEXT NOT NULL DEFAULT '';
ALTER TABLE authors ADD COLUMN bio_de   TEXT NOT NULL DEFAULT '';
ALTER TABLE authors ADD COLUMN creds_de TEXT NOT NULL DEFAULT '[]';
ALTER TABLE authors ADD COLUMN body_de  TEXT NOT NULL DEFAULT '';

-- ── Jeux ────────────────────────────────────────────────────────────────────
ALTER TABLE games ADD COLUMN genre_de   TEXT NOT NULL DEFAULT '';
ALTER TABLE games ADD COLUMN facts_de   TEXT NOT NULL DEFAULT '[]';
ALTER TABLE games ADD COLUMN summary_de TEXT NOT NULL DEFAULT '';
ALTER TABLE games ADD COLUMN body_de    TEXT NOT NULL DEFAULT '';

-- ── Articles : reconstruction pour élargir le CHECK sur `lang` ──────────────

-- 1. les étiquettes, hors de portée de la cascade
CREATE TABLE article_tags_keep AS SELECT * FROM article_tags;
DELETE FROM article_tags;

-- 2. la table, à l'identique de 0001 + 0002, CHECK élargi
CREATE TABLE articles_new (
  slug            TEXT NOT NULL,
  lang            TEXT NOT NULL CHECK (lang IN ('en','fr','de')),
  section         TEXT NOT NULL REFERENCES sections(key),
  title           TEXT NOT NULL,
  seo_title       TEXT,
  lede            TEXT NOT NULL,
  published_at    TEXT NOT NULL,
  updated_at      TEXT,
  author_id       TEXT NOT NULL REFERENCES authors(id),
  game_id         TEXT REFERENCES games(id),
  kicker          TEXT,
  cover_media     TEXT REFERENCES media(key),
  cover_caption   TEXT,
  reading_minutes INTEGER,
  tested_on       TEXT,
  stale           INTEGER NOT NULL DEFAULT 0,
  live            INTEGER NOT NULL DEFAULT 0,
  featured        INTEGER NOT NULL DEFAULT 0,
  draft           INTEGER NOT NULL DEFAULT 0,
  score           REAL CHECK (score IS NULL OR (score >= 0 AND score <= 10)),
  verdict         TEXT,
  pros            TEXT NOT NULL DEFAULT '[]',
  cons            TEXT NOT NULL DEFAULT '[]',
  playtime        TEXT,
  review_notes    TEXT NOT NULL DEFAULT '[]',
  score_revision  TEXT,
  level           TEXT,
  steps           TEXT NOT NULL DEFAULT '[]',
  method          TEXT,
  sources         TEXT,
  corrections     TEXT NOT NULL DEFAULT '[]',
  body            TEXT NOT NULL,
  body_html       TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (slug, lang)
);

INSERT INTO articles_new (
  slug, lang, section, title, seo_title, lede, published_at, updated_at,
  author_id, game_id, kicker, cover_media, cover_caption, reading_minutes,
  tested_on, stale, live, featured, draft, score, verdict, pros, cons,
  playtime, review_notes, score_revision, level, steps, method, sources,
  corrections, body, body_html
)
SELECT
  slug, lang, section, title, seo_title, lede, published_at, updated_at,
  author_id, game_id, kicker, cover_media, cover_caption, reading_minutes,
  tested_on, stale, live, featured, draft, score, verdict, pros, cons,
  playtime, review_notes, score_revision, level, steps, method, sources,
  corrections, body, body_html
FROM articles;

DROP TABLE articles;
ALTER TABLE articles_new RENAME TO articles;

-- 3. les étiquettes reviennent
INSERT INTO article_tags (slug, lang, tag, tag_slug)
  SELECT slug, lang, tag, tag_slug FROM article_tags_keep;
DROP TABLE article_tags_keep;

-- 4. les index sont partis avec la table
CREATE INDEX idx_articles_lang_date    ON articles(lang, published_at DESC);
CREATE INDEX idx_articles_lang_section ON articles(lang, section, published_at DESC);
CREATE INDEX idx_articles_lang_game    ON articles(lang, game_id, published_at DESC);
CREATE INDEX idx_articles_featured     ON articles(lang, featured, published_at DESC);
