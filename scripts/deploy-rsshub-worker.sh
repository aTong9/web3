#!/usr/bin/env bash
set -euo pipefail

RSSHUB_COMMIT=75dc86653f3c2bc5697b15ef9c290b4be85ec4eb
RSSHUB_CHECKOUT=${RSSHUB_CHECKOUT:-/tmp/web3-rsshub-$RSSHUB_COMMIT}
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
mode=${1:---dry-run}

if [[ $mode != --dry-run && $mode != --deploy ]]; then
  echo 'Usage: scripts/deploy-rsshub-worker.sh [--dry-run|--deploy]' >&2
  exit 2
fi

if [[ ! -d $RSSHUB_CHECKOUT/.git ]]; then
  git clone --depth 1 https://github.com/DIYgod/RSSHub.git "$RSSHUB_CHECKOUT"
fi
if [[ $(git -C "$RSSHUB_CHECKOUT" rev-parse HEAD) != "$RSSHUB_COMMIT" ]]; then
  git -C "$RSSHUB_CHECKOUT" fetch --depth 1 origin "$RSSHUB_COMMIT"
  git -C "$RSSHUB_CHECKOUT" checkout --detach "$RSSHUB_COMMIT"
fi

if [[ ! -d $RSSHUB_CHECKOUT/node_modules ]]; then
  (cd "$RSSHUB_CHECKOUT" && npx --yes pnpm@10.34.5 install --frozen-lockfile)
fi
if [[ ! -f $RSSHUB_CHECKOUT/dist-worker/worker.mjs ]]; then
  (cd "$RSSHUB_CHECKOUT" && npx --yes pnpm@10.34.5 run worker-build)
fi
cp "$SCRIPT_DIR/../worker/rsshub-cache-adapter.mjs" "$RSSHUB_CHECKOUT/dist-worker/rsshub-cache-adapter.mjs"
cp "$SCRIPT_DIR/../worker/rsshub-worker-entry.mjs" "$RSSHUB_CHECKOUT/dist-worker/rsshub-worker-entry.mjs"

git -C "$RSSHUB_CHECKOUT" show "$RSSHUB_COMMIT:wrangler.toml" > "$RSSHUB_CHECKOUT/wrangler.web3.toml"
python3 - "$RSSHUB_CHECKOUT/wrangler.web3.toml" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
source = path.read_text()
assert 'main = "dist-worker/worker.mjs"' in source
source = source.replace('main = "dist-worker/worker.mjs"', 'main = "dist-worker/rsshub-worker-entry.mjs"', 1)
source = source.replace('name = "rsshub"', 'name = "web3-rsshub"\nworkers_dev = false\npreview_urls = false', 1)
source = source.replace('command = "pnpm run worker-build"', 'command = "true"', 1)
# The wrapper provides CACHE using the Workers Cache API, so no KV namespace is bound.
source = source.replace('[[kv_namespaces]]\nbinding = "CACHE"', '', 1)
path.write_text(source)
PY

if [[ $mode == --deploy ]]; then
  (cd "$RSSHUB_CHECKOUT" && npx --yes pnpm@10.34.5 exec wrangler deploy --config wrangler.web3.toml)
else
  (cd "$RSSHUB_CHECKOUT" && npx --yes pnpm@10.34.5 exec wrangler deploy --config wrangler.web3.toml --dry-run --outdir /tmp/web3-rsshub-dry-run)
fi
