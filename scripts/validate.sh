#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

fail() {
    printf 'validate: %s\n' "$1" >&2
    exit 1
}

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v python3 >/dev/null 2>&1 || fail 'python3 is required'
command -v glib-compile-schemas >/dev/null 2>&1 || fail 'glib-compile-schemas is required'

node --check extension/extension.js
node --check extension/clipboard-utils.js
node --check extension/backup-utils.js

for file in package.json extension/metadata.json plasma-widget/metadata.json; do
    python3 -m json.tool "$file" >/dev/null || fail "invalid JSON: $file"
done

glib-compile-schemas --strict extension/schemas

GNOME_VERSION_NAME="$(python3 -c 'import json, sys; print(json.load(open(sys.argv[1])).get("version-name", ""))' extension/metadata.json)"
KDE_VERSION="$(python3 -c 'import json, sys; print(json.load(open(sys.argv[1]))["KPlugin"]["Version"])' plasma-widget/metadata.json)"
VERSION="${GNOME_VERSION_NAME#v}"

[[ "$GNOME_VERSION_NAME" == "v$VERSION" ]] || fail "GNOME version-name must look like v<number>, got '$GNOME_VERSION_NAME'"
[[ "$KDE_VERSION" == "$VERSION" ]] || fail "version mismatch: GNOME $GNOME_VERSION_NAME, KDE $KDE_VERSION"

./scripts/package-release.sh "v$VERSION"

python3 - "dist/Perdana-Island-GNOME-v${VERSION}.shell-extension.zip" \
    "dist/Perdana-Island-KDE-Plasma-v${VERSION}.zip" <<'PY'
import sys
import zipfile

gnome_required = {
    'metadata.json',
    'extension.js',
    'clipboard-utils.js',
    'backup-utils.js',
    'stylesheet.css',
    'LICENSE',
    'schemas/org.gnome.shell.extensions.perdana-island.gschema.xml',
    'schemas/gschemas.compiled',
}
kde_required = {
    'metadata.json',
    'contents/ui/main.qml',
}

for archive, required in ((sys.argv[1], gnome_required), (sys.argv[2], kde_required)):
    names = set(zipfile.ZipFile(archive).namelist())
    missing = sorted(required - names)
    if missing:
        raise SystemExit(f'{archive}: missing {", ".join(missing)}')
PY

printf 'validate: OK (v%s)\n' "$VERSION"
