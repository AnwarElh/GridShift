#!/usr/bin/env bash
# Crée les ressources Cloudflare de l'architecture cible, puis affiche les
# identifiants à recopier dans wrangler.jsonc.
#
# Le script ne réécrit pas wrangler.jsonc lui-même. Un identifiant est une
# donnée de compte : le voir passer et le coller à la main vaut mieux qu'un
# fichier de configuration modifié dans le dos de celui qui déploie.
#
# Idempotent : une ressource qui existe déjà n'est pas recréée, et son
# identifiant est simplement réaffiché.
set -euo pipefail

DB_NAME="gridshift-content"
BUCKET="gridshift-media"
KV_TITLE="gridshift-cache"

say() { printf '\n\033[1m%s\033[0m\n' "$1"; }

command -v npx >/dev/null || { echo "npx introuvable"; exit 1; }

say "1/3  Base D1 — $DB_NAME"
if npx wrangler d1 info "$DB_NAME" >/dev/null 2>&1; then
  echo "     existe déjà"
else
  npx wrangler d1 create "$DB_NAME"
fi
DB_ID="$(npx wrangler d1 info "$DB_NAME" --json 2>/dev/null | sed -n 's/.*"uuid"[: ]*"\([^"]*\)".*/\1/p' | head -1)"

say "2/3  Bucket R2 — $BUCKET"
if npx wrangler r2 bucket info "$BUCKET" >/dev/null 2>&1; then
  echo "     existe déjà"
else
  npx wrangler r2 bucket create "$BUCKET"
fi

say "3/3  Espace KV — $KV_TITLE"
KV_ID="$(npx wrangler kv namespace list 2>/dev/null \
  | sed -n "s/.*\"id\"[: ]*\"\([^\"]*\)\"[^}]*\"title\"[: ]*\"[^\"]*${KV_TITLE}\".*/\1/p" | head -1)"
if [ -z "${KV_ID:-}" ]; then
  npx wrangler kv namespace create "$KV_TITLE"
  KV_ID="$(npx wrangler kv namespace list 2>/dev/null \
    | sed -n "s/.*\"id\"[: ]*\"\([^\"]*\)\"[^}]*\"title\"[: ]*\"[^\"]*${KV_TITLE}\".*/\1/p" | head -1)"
fi

say "À recopier dans wrangler.jsonc"
cat <<EOF

  d1_databases[0].database_id : ${DB_ID:-<introuvable, voir « wrangler d1 info $DB_NAME »>}
  kv_namespaces[0].id         : ${KV_ID:-<introuvable, voir « wrangler kv namespace list »>}

Ensuite :

  npm run db:migrate:remote     applique le schéma
  npm run db:seed:remote        charge le contenu
  npm run media:push:remote     pousse les médias dans R2

EOF
