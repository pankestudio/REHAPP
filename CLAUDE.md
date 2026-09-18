# REHAPP — Claude Code Context

## Projektübersicht
Gamifizierte Rehabilitations-PWA für CRPS (Complex Regional Pain Syndrome / Morbus Sudeck).
Ärztlich begleitetes Protokoll: therapeutisches Fasten (Autophagie-Induktion), Supplemente,
Bewegungstherapie (GMI/Graded Motor Imagery), Vagus-Stimulation, Lymphdrainage.
Kein Essstörungs-Kontext — medizinisches Rehabilitationsprotokoll.

## Tech Stack
- Vanilla JS + CSS, kein Framework
- Vite + vite-plugin-singlefile → baut alles in eine einzige index.html
- `idb` für IndexedDB (importiert, noch nicht aktiv genutzt)
- PWA: sw.js (Cache-First), manifest.webmanifest, Icons in icons/
- Deployment: Netlify Drop → Safari auf iPhone → "Zum Home-Bildschirm"

## Architektur
Die gesamte App lebt in `index.html` (~5100 Zeilen). CSS, HTML und JS in einer Datei.
`src/main.js` existiert nicht — wir entwickeln direkt in index.html.
Das Vite-Build würde die Datei durch singlefile weiterverarbeiten; aktuell ist
index.html selbst das deploybare Artefakt.

localStorage für Persistenz. Kein Backend, vollständig offline-fähig.

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

## Deployment-Checklist
Upload-Ordner für Netlify Drop:
  index.html, sw.js, manifest.webmanifest, icons/icon-192.png,
  icons/icon-512.png, icons/apple-touch-icon.png

iPhone: Safari → URL öffnen → Teilen (□↑) → "Zum Home-Bildschirm"
NICHT iCloud — öffnet als Quick Look, JavaScript blockiert.
