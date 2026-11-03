"""Copy selected licensed Roster sources as inert references, with content hashes.

Run with the local Roster root. Never imports environment files, dependencies,
backend implementations, service workers, or repository/build metadata.
Active adaptations are maintained separately under src/templates/roster.
"""
import hashlib
import json
from pathlib import Path
import sys

source = Path(sys.argv[1]).resolve()
root = Path(__file__).resolve().parents[1]
destination = root / "vendor/licensed/roster/source"
files = []
for directory in ("components", "styles", "messages", "app/(dashboard)"):
    files.extend(p for p in (source / directory).rglob("*") if p.is_file() and p.suffix in (".ts", ".tsx", ".css", ".json"))
files.extend((source / "public").glob("*.png"))
files.extend(source / name for name in (
    "package.json", "next.config.mjs", "tailwind.config.ts", "tsconfig.json",
    "postcss.config.mjs", "README.md", "lib/utils.ts", "lib/retention-shared.ts", "app/globals.css",
))
manifest = []
for original in sorted(files):
    relative = original.relative_to(source)
    if any(part.startswith(".") for part in relative.parts):
        raise ValueError(f"Hidden source refused: {relative}")
    data = original.read_bytes()
    target = destination / relative
    if target.exists() and target.read_bytes() != data:
        raise ValueError(f"Refusing to overwrite a different reference: {target}")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    manifest.append({"path": relative.as_posix(), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)})
(destination / "SOURCE-MANIFEST.json").write_text(json.dumps({
    "source": str(source), "version": "1.0.0", "files": manifest,
}, indent=2) + "\n", encoding="utf-8")
print(f"Preserved {len(manifest)} source files ({sum(entry['bytes'] for entry in manifest)} bytes).")
