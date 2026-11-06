#!/bin/sh
# Kopiert die Vergleichsseite nach dist/_abnahme/ — NUR für den Test-Deploy
# (npm run deploy:test, Alias hybrid). deploy:prod ruft das nicht auf.
set -e
if [ ! -f screenshots/report.html ]; then
  echo "Hinweis: keine Vergleichsseite, /_abnahme/ wird nicht mitdeployt (vorher npm run check && npm run shots)." >&2
  exit 0
fi
rm -rf dist/_abnahme
mkdir -p dist/_abnahme
cp screenshots/report.html dist/_abnahme/report.html
cp -R screenshots/aktuell screenshots/referenz dist/_abnahme/
[ -f screenshots/check.txt ] && cp screenshots/check.txt dist/_abnahme/
echo "Vergleichsseite liegt in dist/_abnahme/ (→ https://hybrid--rehapp.netlify.app/_abnahme/report.html)"
