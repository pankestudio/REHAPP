# REHAPP – Regeln für jede Arbeit an diesem Repo

REHAPP ist eine Single-File-PWA für ärztlich begleitete Reha (CRPS), Fasten, Routinen, Ziele und Ernährung.
Medizinisches Rehabilitationsprotokoll, kein Essstörungs-Kontext.

## Stack (wie er wirklich ist)
- **Die ganze App ist `index.html`** (HTML, CSS, JS in einer Datei, ~9000 Zeilen). Kein Vite-Build im Deploy-Pfad,
  `src/` ist ein alter, ungenutzter Stand. Entwickelt wird direkt in `index.html`.
- Daten: native IndexedDB `rehapp_content` (Stores für Items, Ziele, Logs, Abzeichen) mit synchronem
  In-Memory-Cache, plus localStorage-Flags über `storageGet`/`storageSet` (Präfix siehe dort).
- `sw.js` (Service Worker, `index.html` network-first), `manifest.webmanifest`, `icons/`, `fonts/` (Host Grotesk).
- Netlify Functions in `netlify/functions/` nur für Web Push (VAPID). Scheduled Function `push-check` alle 5 Min.
- Build = Kopieren nach `dist/` (`npm run build`, identisch mit `[build].command` in `netlify.toml`).

## Branches und Deploy
- Arbeit auf `feature/hybrid`. `main` = Live-Stand. Der Garbicz-Branch wird **nie** in REHAPP gemergt.
- Test: `npm run deploy:test` (= Build + Vergleichsseite + `npx netlify-cli deploy --alias hybrid`) → https://hybrid--rehapp.netlify.app
- Live: `npm run deploy:prod`. **Nie ohne ausdrückliches OK des Nutzers im Chat.** Vorher Backup der echten Daten.
- Vor jedem Deploy `CACHE_NAME` in Zeile 1 von `sw.js` erhöhen: `rehapp-JJJJ-MM-TT-rundeX`.
- `.env` nie committen. `VAPID_PRIVATE` bleibt ein Netlify-Secret.
- Nur **eine** Sitzung (Claude Code oder Claude im Chat) arbeitet gleichzeitig im Repo. Sonst überschreiben
  sich die Änderungen in `index.html` gegenseitig.

## Arbeitsweise
- Ein Prompt = eine Runde. Nach **jedem** nummerierten Punkt committen: `Runde X, Punkt N: …`.
- Vor dem letzten Commit: `npm run check` muss grün sein. Kein Punkt gilt als erledigt, solange eine Prüfung rot ist.
- Am Ende jeder Runde: Abnahmeliste Punkt für Punkt mit „erledigt / offen + Grund“ beantworten.
  Nichts als erledigt melden, das nicht im Browser bei 390 und 1440px geprüft wurde.
- **Abnahme immer gegen die laufende Version:** Service Worker abmelden und Caches löschen oder einen
  frischen Browser-Kontext nutzen. Ein alter SW zeigt sonst eine alte `index.html` (ist am 6.11. passiert).
- Wenn etwas aus dem Prompt nicht umsetzbar ist: nachfragen oder als „offen“ melden, nicht still weglassen.
- Keine Datenverluste: Migration mit Backup-Key und `verifyMigration`. Neue Seeds über ein eigenes
  `*_seeded_vN`-Flag, bestehende Items nie überschreiben. Demo- und Testdaten nie in `rehapp_content`.

## Design – verbindlich
- Referenzbilder liegen in `docs/design/`. Neuere Version gewinnt.
- **Nur Tokens** aus `:root` in `index.html` (`--paper`, `--ink`, `--yellow`, `--muted`, `--faint`, `--line`, …),
  keine festen Farben in Komponenten. Nachtmodus über `[data-theme="nacht"]`, Text auf Gelb nutzt `--on-yellow`.
- Gelb (`--yellow`) nur mit Bedeutung: Hauptaktion, Glanz, Überwindung, Atemkreis „jetzt“, „Weg zu Glanz“.
  Jedes gelbe Element trägt `data-gelb="aktion|glanz|ueberwindung|atem|weg"`. Einzige weitere Stelle:
  `marke` für die zwei P der Wortmarke im Nachtmodus (Entscheidung Runde 6a). `check-ui.mjs` prüft das.
- Dekorative SVGs tragen `aria-hidden="true"`, Icon-Buttons haben ein `aria-label`.
- Schrift: Host Grotesk, Schnitte 300/400/500/600, **kein 700**, **nichts unter 12px**.
- Touch-Ziele mindestens 44×44px (kleine Elemente über `::before` erweitern). Jeder Tap gibt sichtbare
  Rückmeldung (`:active`).
- Kein `confirm()`, `alert()`, `prompt()`. Eigene Bestätigung über `openConfirmDialog()` mit Objekt und Verb.
- Buttons beginnen mit einem Verb („Routine speichern“, „Übung starten“). Kein „OK“, „Absenden“, „Weiter“.
- Erledigtes wird durchgestrichen (Pfeil quer durch den Titel) und bleibt an seiner Stelle. Kein Kreis mit Haken.
- Stift-Linien (`.h-pen-draw`) werden per `drawPenStroke()`/`getTotalLength()` gezeichnet und sind im
  Ruhezustand **immer vollständig sichtbar**. SVGs, die über einer absolut positionierten Kachel liegen,
  brauchen `position: relative` (sonst verdeckt die Kachel sie).
- Bewegung nur über die Dauer-Tokens 100/150/200/300ms (Stift 600ms), nur `transform` und `opacity`.
  `prefers-reduced-motion` zeigt sofort den Endzustand.
- `.ux-profile.md` hält fest, wo REHAPP bewusst vom Standard abweicht.

## Inhalte
- Medizinisch zurückhaltend formulieren, keine Heilversprechen, keine Diagnosen.
- Keine persönlichen Dosierungsempfehlungen. Supplement-Texte und -Mengen, Fasten- und Dosierungsangaben
  **nie eigenmächtig ändern**, auch nicht, um eine grep-Prüfung grün zu bekommen.
- Keine Amazon- oder sonstigen Kauflinks.
- Übungstexte: simpel, ermutigend, mit etwas Wortwitz. Der Nutzer korrigiert sie.

## Datenmodell (Kurzfassung)
- Items: `{ id, type: 'supplement'|'exercise'|…, title, dose, time, block, schedule, xp, notify, active, details, order }`.
  `id` ist stabil und wird nie geändert (daran hängen Fortschritt und XP-Dedup).
- Übungen: `details.kind` = `timer` | `atmung` (mit `pattern`) | `schritte` (mit `steps: [{name, hint, sec}]`).
  `schritte` läuft über `openProtocolPlayer()`. Optional `details.award` (alter XP-Schlüssel, `{date}`) und
  `details.after` (`pain` | `cooldown` | `vagus`, plus `flag`) für das, was nach dem letzten Schritt passiert.
- Ziele, Logs und verdiente Abzeichen liegen ebenfalls in `rehapp_content` (`getGoals`, `toggleLog`, `checkNewUnlocks`).
- XP: `awardXP(key, punkte, label, { scope: 'day'|'ever' })`, Schlüssel nie umbenennen.

## Push-Benachrichtigungen
- `subscribe.js` speichert pro Gerät Subscription + Fastenstart in Netlify Blobs, `push-check.js` (scheduled)
  verschickt fällige Fasten-Meilensteine, `push.js` Einzel-Push, `vapid-public-key.js`, `unsubscribe.js`.
- Meilenstein-Liste muss mit `scheduleNotifications()` in `index.html` übereinstimmen
  (dupliziert in `netlify/functions/lib/milestones.js`).
- iOS liefert Web Push nur an zum Home-Bildschirm hinzugefügte PWAs.
- Functions brauchen lokal `npm install` in `netlify/functions/` vor dem Deploy.

## Prüfen
- `npm run check` = `validate.js` (Syntax aller Skript-Blöcke) + `scripts/check-ui.mjs`. Das Prüfskript rendert alle
  Tabs und Sheets im Demo-Modus bei 390 und 1440px, hell und Nacht (52 Zustände), und prüft die Regeln oben:
  Tokens, Gelb mit `data-gelb`, Schrift, Touch-Ziele, Stift-Linien, Überlauf, Kontrast, SVG/img, Systemdialoge.
  `--out datei.txt` schreibt die Befunde in eine Datei.
- `pre-push`-Hook einmal einrichten: `npm run hooks`. Ein roter Check bricht den Push ab.
- `npm run shots`: 56 Screenshots im Demo-Modus (14 Screens × 390/1440 × hell/Nacht, deviceScaleFactor 2) nach
  `screenshots/aktuell/`, Vergleich gegen `screenshots/basis/` (höchstens 1 % abweichende Pixel) und Vergleichsseite
  `screenshots/report.html` (Referenzbild aus `docs/design/` neben dem aktuellen Stand plus Regel-Meldungen aus
  `screenshots/check.txt`). Zuordnung in `tests/visual/referenzen.json`.
- Gewollte Änderung: `npm run shots -- --update` und **eigener Commit** mit dem Grund. Die Basis immer auf dem Rechner
  erzeugen, auf dem geprüft wird (macOS und Linux rendern Schrift unterschiedlich).
- `npm run deploy:test` legt die Vergleichsseite unter `/_abnahme/report.html` mit ab, nur auf dem Alias `hybrid`.
- Demo-Modus: `?demo=2026-11-03T21:40` (feste Uhr, Demodaten aus `tests/fixtures/demo.json` in Arbeitsspeicher
  und IndexedDB `rehapp_demo`, Band oben), optional `&theme=night`. Demodaten neu: `npm run demo-fixture`.
- Playwright braucht einmalig `npx playwright install chromium`.
- iPhone-Test: Safari → URL → Teilen → „Zum Home-Bildschirm“. Nicht über iCloud öffnen (Quick Look blockiert JS).
