#!/usr/bin/env bash
# Crée les ressources Cloudflare de l'architecture cible, puis affiche les
# identifiants à recopier dans wrangler.jsonc.
#
# Le script ne réécrit pas wrangler.jsonc lui-même. Un identifiant est une
# donnée de compte : le voir passer et le coller à la main vaut mieux qu'un
# fichier de configuration modifié dans le dos de celui qui déploie.
#
# Ordre D1 → KV → R2, celui de la Partie 09 : R2 en dernier parce que c'est la
# seule ressource qui demande une activation préalable du compte. Ratée, elle
# ne doit pas emporter avec elle les deux identifiants déjà obtenus.
#
# Idempotent : une ressource qui existe déjà n'est pas recréée, et son
# identifiant est simplement réaffiché. L'existence se lit dans la liste du
# compte, jamais via « wrangler d1 info » : cette commande-là résout le nom à
# travers le binding de wrangler.jsonc, donc elle interroge le placeholder tant
# qu'on ne l'a pas remplacé — et ne répond jamais avant d'avoir la réponse.
set -euo pipefail

DB_NAME="autnic-content"
KV_CACHE="autnic-cache"      # liaison CACHE
KV_SESSION="autnic-session"  # liaison SESSION, imposée par l'adapter Astro
BUCKET="autnic-media"

say() { printf '\n\033[1m%s\033[0m\n' "$1"; }

command -v npx >/dev/null || { echo "npx introuvable"; exit 1; }
command -v node >/dev/null || { echo "node introuvable"; exit 1; }

# Cherche un objet par un champ, en renvoie un autre. Le JSON de wrangler est
# lu par node : l'ordre des champs y est libre, et un sed qui suppose « id »
# avant « title » crée un doublon le jour où wrangler les inverse.
pick() { # pick <champ-filtre> <valeur> <champ-résultat>
  node -e 'const [f,v,r]=process.argv.slice(1);
    let a=[]; try { a=JSON.parse(require("fs").readFileSync(0,"utf8")||"[]"); } catch {}
    const h=(Array.isArray(a)?a:[]).find(x=>x&&x[f]===v);
    if (h&&h[r]) console.log(h[r]);' "$1" "$2" "$3"
}

d1_id() { npx wrangler d1 list --json 2>/dev/null | pick name "$DB_NAME" uuid; }
kv_id() { npx wrangler kv namespace list 2>/dev/null | pick title "$1" id; }

# Crée l'espace KV s'il manque, renvoie son identifiant sur la sortie standard.
kv_ensure() {
  local title="$1" id
  id="$(kv_id "$title" || true)"
  if [ -z "$id" ]; then
    # La création peut répondre « already exists » sur un espace que la liste
    # n'avait pas encore : on relit la liste plutôt que de croire le code de sortie.
    npx wrangler kv namespace create "$title" >&2 || true
    id="$(kv_id "$title" || true)"
  else
    echo "     $title — existe déjà" >&2
  fi
  echo "$id"
}

say "1/3  Base D1 — $DB_NAME"
DB_ID="$(d1_id || true)"
if [ -n "$DB_ID" ]; then
  echo "     existe déjà"
else
  npx wrangler d1 create "$DB_NAME"
  DB_ID="$(d1_id || true)"
fi

say "2/3  Espaces KV — $KV_CACHE, $KV_SESSION"
CACHE_ID="$(kv_ensure "$KV_CACHE")"
SESSION_ID="$(kv_ensure "$KV_SESSION")"

# R2 en dernier, et non bloquant : le bucket ne porte pas d'identifiant à
# recopier — wrangler.jsonc le désigne par son nom — donc son échec ne doit pas
# priver l'utilisateur des deux identifiants ci-dessus.
say "3/3  Bucket R2 — $BUCKET"
R2_ERR=""
if npx wrangler r2 bucket list 2>/dev/null | grep -q "\"$BUCKET\"\|$BUCKET"; then
  echo "     existe déjà"
else
  R2_ERR="$(npx wrangler r2 bucket create "$BUCKET" 2>&1 || true)"
  # Le prompt « add on your behalf? » n'est pas confirmé hors terminal : la
  # création peut réussir en affichant quand même une erreur. Seule la liste tranche.
  if npx wrangler r2 bucket list 2>/dev/null | grep -q "\"$BUCKET\"\|$BUCKET"; then
    echo "     créé"
    R2_ERR=""
  elif printf '%s' "$R2_ERR" | grep -q "10042"; then
    R2_ERR="R2 n'est pas activé sur ce compte. Dashboard Cloudflare → R2 → activer,
     puis « npx wrangler r2 bucket create $BUCKET »."
  else
    R2_ERR="échec de la création — ${R2_ERR:-raison inconnue}"
  fi
fi

say "À recopier dans wrangler.jsonc"
cat <<EOF

  d1_databases[0].database_id     : ${DB_ID:-<introuvable, voir « npx wrangler d1 list »>}
  kv_namespaces[CACHE].id         : ${CACHE_ID:-<introuvable, voir « npx wrangler kv namespace list »>}
  kv_namespaces[SESSION].id       : ${SESSION_ID:-<introuvable, voir « npx wrangler kv namespace list »>}

EOF

if [ -n "$R2_ERR" ]; then
  printf '  \033[33mBucket R2 %s :\033[0m %s\n\n' "$BUCKET" "$R2_ERR"
fi

cat <<EOF
Ensuite :

  npm run db:migrate:remote     applique le schéma
  npm run db:seed:remote        charge le contenu
  npm run media:push:remote     pousse les médias dans R2

EOF
