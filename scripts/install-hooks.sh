#!/bin/sh
# Richtet den pre-push-Hook ein: `git push` läuft nur, wenn `npm run check`
# grün ist. Einmal ausführen: sh scripts/install-hooks.sh
# Notfalls (bewusst!) umgehen: git push --no-verify
set -e
HOOK="$(git rev-parse --git-path hooks)/pre-push"
cat > "$HOOK" <<'HOOK_EOF'
#!/bin/sh
# REHAPP pre-push: siehe scripts/install-hooks.sh
echo "pre-push: npm run check …"
if ! npm run --silent check; then
  echo ""
  echo "Push abgebrochen: npm run check ist rot. Befunde oben."
  echo "Falls Playwright fehlt: npx playwright install chromium"
  exit 1
fi
HOOK_EOF
chmod +x "$HOOK"
echo "pre-push-Hook eingerichtet: $HOOK"
