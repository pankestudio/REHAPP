# REHAPP — Claude Code Context

## Projektübersicht
Gamifizierte Rehabilitations-PWA für CRPS (Complex Regional Pain Syndrome / Morbus Sudeck).
Ärztlich begleitetes Protokoll: therapeutisches Fasten (Autophagie-Induktion), Supplemente,
Bewegungstherapie (GMI/Graded Motor Imagery), Vagus-Stimulation, Lymphdrainage.
Kein Essstörungs-Kontext — medizinisches Rehabilitationsprotokoll.

## Tech Stack
- Vanilla JS + CSS, kein Framework
- Vite + vite-plugin-singlefile → baut alles in eine einzige index.html
- IndexedDB nativ (kein `idb`-Package — kein Bundler im Deploy-Pfad, siehe
  Content-System) für Supplement-/Habit-/Übungs-/Aufgaben-Inhalte
- PWA: sw.js (Cache-First), manifest.webmanifest, Icons in icons/
- Netlify Functions (netlify/functions/) für Web-Push — einziger Server-Code im Projekt,
  ausschließlich für Push-Zustellung bei geschlossenem Browser. Siehe „Push-Benachrichtigungen".
- Deployment: `npm run deploy` (Netlify CLI) — Netlify Drop reicht NICHT mehr aus,
  siehe Deployment-Checklist.

## Architektur
Die gesamte App lebt in `index.html` (~5300 Zeilen). CSS, HTML und JS in einer Datei.
`src/main.js` existiert nicht — wir entwickeln direkt in index.html.
Das Vite-Build würde die Datei durch singlefile weiterverarbeiten; aktuell ist
index.html selbst das deploybare Artefakt.

localStorage für Persistenz. Kernapp ohne Backend, vollständig offline-fähig.
Einzige Ausnahme: Web-Push-Zustellung (optional, siehe unten) braucht Netzwerk
und einen minimalen Server-Zustand (Subscription + Fastenstart pro Gerät).

## Bekannte kritische Bugs — höchste Priorität

### 1. loadProgress() crash beim Start (KRITISCH)
`loadProgress()` läuft im DOMContentLoaded-Init und schreibt direkt auf:
  document.getElementById('pain-slider').value = last.pain
  document.getElementById('swell-slider').value = last.swell
Diese Elemente existieren nicht mehr — das Schmerz/Ödem-Panel wurde entfernt.
→ Fix: null-Guards für pain-slider, swell-slider, pain-val, swell-val, progress-trend in
  loadProgress(), saveProgress() und updateSlider().

### 2. Tote Funktionen (entfernte Features)
completeMirrorSession() und startGMITimer_laterality_override() referenzieren
DOM-Elemente die nicht mehr existieren (Spiegeltherapie + Laterality entfernt).
→ Fix: Diese Funktionen und ihre XP-Keys (xp_award_ever_mirror_master,
  xp_award_ever_laterality_done) vollständig entfernen.

### 3. TIMELESS_QUOTES falsch platziert
Das Array ist innerhalb von renderDailyQuote() definiert → wird bei jedem Aufruf
neu erstellt. Muss auf Modul-Ebene als const leben.

### 4. 10 Monkey-Patches am Ende der Datei
_origUpdateTimer, _origTimerAction, _origStart16_8Mode etc. — über Sessions
aufgebaut, macht Debugging schwer. Mittelfristig konsolidieren.

### 5. timerMode nicht persistent genug
timerMode ist eine in-memory let-Variable. Wird über 16_8_active in localStorage
gesichert, aber die Sync-Reihenfolge beim Init ist fragil (abhängig davon ob
loadProgress() vorher crasht).

## App-Struktur (Tabs)
- pg-home: Timer-Hero, Wasser, Supplemente, Mood, Quick-Actions
- pg-fast: Fasten-Info, Erlaubt/Verboten, Rezepte, 14-Tage Kalender, Masterplan
- pg-move: Vagus, MLD-Link, BFR, Mechanobiologie, GMI (Sensory/Imagery/Scrubbing),
           Meditationsvisualisierung
- pg-supp: Vollständiger Supplement-Stack (Morgens/Mittags/Abends)
- pg-xp: XP/Level, Missions, Budapest-Filter, Ödem-Tracker, Trophäen, PWA-Anleitung
- pg-mld: Overlay — Lymphdrainage 7 Schritte mit Timer
- pg-bfr: Overlay — BFR-Protokoll 5 Schritte
- pg-emergency: Overlay — Notfall

## Wichtige Funktionen
- timerAction() — startet Fasten, kein Pause, nur Reset
- switchTimerMode(mode) — 100h vs 16:8, öffnet Modal bei 16:8
- toggleCollapse(id) — Panels auf/zuklappen, CSS: [id^="collapse-body-"].closed
- awardXP(key, points, label, {scope}) — scope: 'day'|'ever'|undefined
- buildSupplements() — rendert Supplement-Rows mit Expand/Collapse Detail
- renderDailyQuote() — TIMELESS_QUOTES (tägl. rotierend) auf Home, CRPS_CALENDAR auf XP-Tab
- refreshXPUI() — synct Chip (fixed), Home-Strip, XP-Tab
- restoreCollapseState() — liest panel_open_{id} aus localStorage

## Designprinzipien
Dieter Rams: Weniger, aber besser. Kein Schmuck ohne Funktion.
- Typografie: klare Hierarchie, hoher Kontrast
- Farbe: zurückhaltend — var(--text), var(--text2), var(--text3), Amber/Red/Green nur für Status
- Keine dekorativen Gradienten auf Surfaces
- Aktive Tab-States: background: #e8e8ec, color: #0f1012, font-weight: 700 (weißer Fill, dunkler Text)
- 8pt Spacing-Grid via CSS-Variablen (--space-1 bis --space-5)

## CSS-Muster
Aktive Tab-Kontrast (am Ende des <style>-Blocks, letzte Autorität):
  .mode-btn.active, .fpill.active, .mood-btn.selected,
  .phase-badge.active, .timer-mode-btn.active {
    background: #e8e8ec !important; color: #0f1012 !important; ...
  }

Collapsibles:
  [id^="collapse-body-"] { overflow: hidden; }
  [id^="collapse-body-"].closed { display: none; }

## Content-System (Phase 1, lokal — Sync folgt in Phase 2)
Supplemente, Habits (später: Übungen/Aufgaben) sind seit dieser Phase kein
hartkodiertes Array mehr, sondern Items in einem einheitlichen Modell:
  { id, type: 'supplement'|'habit'|'exercise'|'task', title, dose, time,
    block, schedule: { days: [] }, xp, notify, active, details, order }
- id ist stabil (z.B. `supp-vitamin-d3`, `habit-sleep`) und NIE ändern —
  daran hängen Tagesfortschritt und XP-Dedup.
- time: 'morning'|'midday'|'evening'|null (Supplement-Slots). block: nur bei
  Habits zusätzlich ('morgen'|'tag'|'abend'|'verzicht') — eigene Erweiterung,
  weil Habits vier Gruppen haben, die nicht ins 3-Slot-time-Schema passen.
- notify ist nur ein gespeichertes Flag — noch NICHT an echte Erinnerungen
  angebunden (kein Scheduler für beliebige Item-Zeiten/Wochentage). Das wäre
  ein eigenes Stück Arbeit, vergleichbar mit dem Push-System unten.
- active=false blendet ein Item aus allen Renderern aus (ersetzt das alte
  `hidden_habits`-Konzept).

Datenschicht in index.html (kein externes Package, natives IndexedDB):
  rehapp_content/items (keyPath id) + synchroner In-Memory-Cache
  (_contentCache), weil die Renderer weiterhin synchron sind.
  getItems(filter), saveItem(item), deleteItem(id), reorderItems(orderedIds).
  initContentStore() MUSS vor dem ersten Renderer-Aufruf awaited werden
  (siehe DOMContentLoaded) — seedet beim allerersten Start aus SUPP_DATA/
  HABITS und migriert den heutigen Fortschritt + hidden_habits einmalig
  (Flag: `content_migrated_v1` in localStorage). SUPP_DATA/HABITS bleiben nur
  als Seed-Quelle bestehen, werden sonst nirgends mehr gelesen.

Editor im Setup-Tab (`buildContentEditorPanel()` + `openItemEditor()`):
  Liste pro Typ, Tap → Bearbeiten-Sheet (Titel/Dosis/Tageszeit/Wochentage/XP/
  Benachrichtigung/Aktiv), "+ Neu" pro Typ, Löschen mit Bestätigung,
  JSON-Export/Import nur für Items. Globales Backup (exportAppData/
  importAppDataFromFile) nimmt die Items zusätzlich unter `content` mit.

Bekannte Lücken (bewusst nicht in Phase 1):
  - 'exercise'/'task' haben noch keine Quelldaten zur Migration (GMI/Vagus/
    BFR/MLD sind eigene interaktive Module, keine einfachen Checkbox-Items)
    und keinen Home-Tab-Renderer — nur über den Editor anlegbar/pflegbar.
  - Neue Habits aus dem Editor landen immer im Block 'tag' (kein Block-Feld
    im Editor-Formular) — bei Bedarf danach den Code anpassen.
  - Kein Reorder-UI (reorderItems() existiert, aber keine Drag/Pfeil-Buttons).
  - `confirmResetAll()` löscht jetzt auch die IndexedDB-Datenbank — bei neuen
    Storage-Mechanismen immer prüfen, ob das NEU-STARTEN-Feature mitzieht.

## Push-Benachrichtigungen (Web Push)
Fasten-Meilensteine (12h/18h/24h/36h/48h/72h/100h) werden zusätzlich zur
bestehenden lokalen `scheduleNotifications()` (funktioniert nur solange die
Seite offen/im Hintergrund-Tab aktiv ist) per echtem Web Push zugestellt —
das kommt auch bei komplett geschlossenem Browser an.

Architektur, weil die App sonst keinen Server hat:
- `netlify/functions/subscribe.js` — legt pro Gerät (deviceId in localStorage)
  eine Subscription + aktuellen Fastenstart in Netlify Blobs ab. Wird von
  `subscribePush()` und von `syncPushTimer()` (bei jedem Start/Reset des
  Fasten-Timers) aufgerufen.
- `netlify/functions/push-check.js` — Netlify Scheduled Function, läuft alle
  5 Minuten (Cron in netlify.toml), unabhängig vom Client. Einziger Ort, der
  wirklich weiß, wann ein Meilenstein fällig ist. Meilenstein-Liste MUSS mit
  `scheduleNotifications()` in index.html übereinstimmen (dupliziert in
  `netlify/functions/lib/milestones.js`, da kein gemeinsames Modul-Bundling).
- `netlify/functions/push.js` — direkter Einzel-Push (manueller Test,
  `sendPush(title, body)` im Client).
- `netlify/functions/vapid-public-key.js` — liefert VAPID_PUBLIC an den
  Client, damit der Key nicht hartcodiert werden muss.
- `netlify/functions/unsubscribe.js` — löscht die Blob-Subscription.

Setup (einmalig, macht der Mensch — nicht committen):
  npx web-push generate-vapid-keys
Netlify Dashboard → Site settings → Environment variables:
  VAPID_PUBLIC, VAPID_PRIVATE, VAPID_EMAIL (mailto:...)

iOS Safari liefert Web Push nur an zum Homescreen hinzugefügte PWAs, nicht an
normale Browser-Tabs (siehe `updateInstallStatus()` / persistenter Speicher).

## Deployment-Checklist
`npm run deploy` (Netlify CLI) statt Netlify Drop — Drop kann keine Functions
ausliefern, damit würde Web Push stillschweigend nicht funktionieren.
Kopiert zusätzlich zu `dist/`:
  index.html, sw.js, manifest.webmanifest, favicon.svg, favicon-32.png,
  favicon-16.png, icons/icon-192.png, icons/icon-512.png,
  icons/apple-touch-icon.png, fonts/HostGrotesk-latin.woff2,
  fonts/HostGrotesk-latin-ext.woff2
(Bis Runde 6a kopierten `netlify.toml` und `package.json` die Icons/
Favicons trotz dieser Checkliste tatsächlich nicht mit — daher die 404s.
Beide Skripte sind jetzt synchron mit dieser Liste.)
`netlify/functions/` wird direkt aus dem Repo deployt (nicht über dist/),
braucht dafür lokal `npm install` in `netlify/functions/` (node_modules dort
sind gitignored, esbuild bundelt beim Deploy aus dem lokalen node_modules).

iPhone: Safari → URL öffnen → Teilen (□↑) → "Zum Home-Bildschirm"
NICHT iCloud — öffnet als Quick Look, JavaScript blockiert.
