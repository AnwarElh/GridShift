-- Newsletter — les abonnés à la lettre hebdomadaire.
--
-- La table est volontairement minimale : un email, la langue à l'inscription,
-- un horodatage, et deux drapeaux pour le double opt-in futur et le
-- désabonnement. INSERT OR IGNORE rend l'inscription idempotente : un lecteur
-- qui soumet deux fois ne voit pas d'erreur et n'est compté qu'une fois.

CREATE TABLE newsletter_subscribers (
  email       TEXT PRIMARY KEY,
  lang        TEXT NOT NULL DEFAULT 'en',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed   INTEGER NOT NULL DEFAULT 0,
  unsub       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_newsletter_created ON newsletter_subscribers(created_at DESC);
