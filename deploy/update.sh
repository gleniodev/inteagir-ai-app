#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
BASE=/opt/inteagir-ai
BRANCH=main
exec 9>"$BASE/deploy.lock"
flock -n 9 || exit 0
export GIT_SSH_COMMAND="ssh -i $BASE/github_readonly -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=$BASE/known_hosts"
git --git-dir="$BASE/repository.git" fetch --quiet origin "refs/heads/$BRANCH:refs/heads/deploy"
sha=$(git --git-dir="$BASE/repository.git" rev-parse refs/heads/deploy)
previous=$(cat "$BASE/current" 2>/dev/null || true)
if [[ "$sha" == "$previous" && "${1:-}" != --force ]]; then exit 0; fi
release="$BASE/releases/$sha"
mkdir -p "$release"
git --git-dir="$BASE/repository.git" archive "$sha" | tar -x -C "$release"
export INTEAGIR_RELEASE="$sha"
compose=(docker compose -p inteagir-ai -f "$release/deploy/compose.yaml")
"${compose[@]}" build --pull app
if [[ -n "$previous" ]]; then
  mkdir -p "$BASE/backups"
  container=$(docker ps -q --filter label=com.docker.compose.project=inteagir-ai --filter label=com.docker.compose.service=app)
  if [[ -n "$container" ]]; then
    docker exec "$container" tar -czf - -C /app/server data > "$BASE/backups/$(date -u +%Y%m%dT%H%M%SZ).tar.gz"
  fi
fi
if "${compose[@]}" up -d --no-build --wait --wait-timeout 180 app; then
  printf '%s\n' "$sha" > "$BASE/current.tmp"
  mv "$BASE/current.tmp" "$BASE/current"
  echo "InTEAgir deploy OK: $sha"
else
  echo "InTEAgir healthcheck failed; restoring previous image" >&2
  if [[ -n "$previous" ]]; then
    INTEAGIR_RELEASE="$previous" docker compose -p inteagir-ai -f "$BASE/releases/$previous/deploy/compose.yaml" up -d --no-build --wait --wait-timeout 180 app
  fi
  exit 1
fi
