#!/usr/bin/env bash
# Companion workflow engine tests: compile src/domain/workflow to CommonJS in a
# temp dir, then run node --test. No network, no Hub, no storage.
# Same approach as tools/test-kiosk-domain.sh.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT
cd "$ROOT"
./node_modules/.bin/tsc --strict --target ES2022 --module commonjs --moduleResolution node --lib ES2022 --types node --typeRoots ./node_modules/@types --rootDir src --outDir "$BUILD" src/domain/workflow/engine.ts src/domain/workflow/subjects.ts
export DOJANG_WORKFLOW_BUILD="$BUILD"
node --test tests/workflow/engine.test.cjs
