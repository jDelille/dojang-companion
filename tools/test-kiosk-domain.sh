#!/usr/bin/env bash
# Kiosk domain tests: compile the pure kiosk modules to CommonJS in a temp dir, then run node --test.
# Mirrors Companion's tools/test-odoo-gateway.sh. No network, no Odoo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT
cd "$ROOT"
./node_modules/.bin/tsc --strict --target ES2022 --module commonjs --moduleResolution node --lib ES2022,DOM --types node --typeRoots ./node_modules/@types --outDir "$BUILD" src/domain/kiosk/attendanceOutbox.ts src/contracts/kiosk-attendance.ts src/server/kiosk-mock.ts
export DOJANG_OUTBOX_MODULE="$BUILD/domain/kiosk/attendanceOutbox.js"
export DOJANG_KIOSK_MOCK_MODULE="$BUILD/server/kiosk-mock.js"
node --test tests/kiosk/attendance-outbox.test.cjs tests/kiosk/mock-api.test.cjs
