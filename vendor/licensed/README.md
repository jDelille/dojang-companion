# Licensed source (reference copies)

Unmodified copies of the licensed template files that DreamOS code was extracted
from, kept so every adapted component can be traced back to its original.
Required by the build handoff (agent spec part 3 §71, part 5 §17): "Keep licensed
source under `vendor/licensed/`. Maintain `docs/LICENSE-MAP.md`."

Rules:

- Files here are **never imported or compiled**. `tsconfig.json` excludes
  `vendor/` and `eslint.config.mjs` ignores it.
- Copy a file here **verbatim** when we extract from it; never edit it. Record its
  original path, package version and SHA-256 in `docs/LICENSE-MAP.md`.
- Normally only the files we actually extract from, not whole packages. The
  explicitly requested `roster-integration` experiment additionally preserves
  selected frontend source under `roster/source/` for incremental migration,
  with full hashes in its `SOURCE-MANIFEST.json`; it remains inactive.

| Folder | Package | Where the original lives |
| --- | --- | --- |
| `roster/` | Roster (Companion_Biz_Violoop) 1.0.0 | `Downloads\Companion_Biz_Violoop (1)\Companion_Biz_Violoop\roster` on Justin's PC |
| `roster/source/` | Roster 1.0.0 source migration snapshot | `C:\Users\justi\Desktop\Companion_Biz_Violoop\roster`; see `docs/ROSTER-INTEGRATION.md` |

UNKNOWN: the Roster package ships no license file (README.txt only thanks the
buyer), so its redistribution terms are unconfirmed. Confirm with Paul before this
folder is pushed to a shared or public repository.
