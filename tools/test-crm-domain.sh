#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT
cd "$ROOT"
./node_modules/.bin/tsc -p tests/crm/tsconfig.json --outDir "$BUILD"
export DOJANG_CRM_BUILD="$BUILD"
node --test tests/crm/*.test.cjs
