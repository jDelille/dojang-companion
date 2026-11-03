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
# Modules with @/ imports compile through tests/kiosk/tsconfig.json, which maps the alias
./node_modules/.bin/tsc -p tests/kiosk/tsconfig.json --outDir "$BUILD"
export DOJANG_FLOW_MODULE="$BUILD/domain/kiosk/checkInFlow.js"
export DOJANG_ROSTER_SEARCH_MODULE="$BUILD/domain/kiosk/rosterSearch.js"
export DOJANG_KIOSK_CLIENT_MODULE="$BUILD/integrations/kiosk.js"
export DOJANG_KIOSK_CONFIG_MODULE="$BUILD/domain/kiosk/kioskConfig.js"
export DOJANG_IDLE_TIMER_MODULE="$BUILD/views/kiosk/idleTimer.js"
export DOJANG_CHECK_IN_COMMAND_MODULE="$BUILD/domain/kiosk/checkInCommand.js"
export DOJANG_CHECK_IN_OUTCOME_MODULE="$BUILD/domain/kiosk/checkInOutcome.js"
export DOJANG_ROSTER_GRID_MODULE="$BUILD/views/kiosk/rosterGrid.js"
export DOJANG_SCENARIO_ROUTE_MODULE="$BUILD/app/api/dev/kiosk-scenario/route.js"
export DOJANG_SESSIONS_ROUTE_MODULE="$BUILD/app/api/v2/sessions/route.js"
export DOJANG_CHECK_INS_ROUTE_MODULE="$BUILD/app/api/v2/attendance/check-ins/route.js"
export DOJANG_KIOSK_BUILD="$BUILD" # tests/kiosk/register-alias.cjs maps @/ imports here
node --test tests/kiosk/attendance-outbox.test.cjs tests/kiosk/mock-api.test.cjs tests/kiosk/identify-flow.test.cjs tests/kiosk/idle-reset.test.cjs tests/kiosk/check-in-submit.test.cjs tests/kiosk/roster-grid.test.cjs tests/kiosk/dev-scenario.test.cjs tests/kiosk/kiosk-gateway.test.cjs
