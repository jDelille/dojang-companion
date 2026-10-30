#!/usr/bin/env bash
# Hub gateway allowlist tests: compile src/server/hub-gateway.ts to CommonJS in a
# temp dir, then run node --test against a fake Odoo. No network, no Odoo.
# Same approach as tools/test-kiosk-domain.sh.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT
cd "$ROOT"
./node_modules/.bin/tsc -p tests/hub-gateway/tsconfig.json --outDir "$BUILD"
export DOJANG_GATEWAY_BUILD="$BUILD"
node --test tests/hub-gateway/gateway-allowlist.test.cjs
