# Prompt für Claude Code: Longevity-Features + Streak-Fix für Rehapp v4

Kopiere den Block unten 1:1 in Claude Code (im Projektroot `rehapp-v4/` ausführen).

---

## Prompt

Ich arbeite an **Rehapp v4**, einer PWA für persönliches KMÖ/CRPS-Reha- und Habit-Tracking. Stack: Vite, Vanilla JS (kein Framework), IndexedDB über `idb` (`src/core/db.js`), eigenes Modul-System (`src/core/ModuleRegistry.js`), State über einen Proxy-Store (`src/core/Store.js`) mit BroadcastChannel-Sync zwischen Tabs. UI ist deutschsprachig, dunkles Design über CSS-Variablen in `src/styles/theme.css`.

Bevor du irgendetwas änderst: lies `src/core/Store.js`, `src/core/ModuleRegistry.js`, `src/core/GamificationEngine.js`, `src/core/achievements.js`, `src/core/ReminderService.js`, `src/modules/home/index.js`, `src/modules/settings/index.js`, `src/modules/stats/index.js` und `src/data/protocols.json`, um die bestehenden Konventionen zu verstehen (Modul-Registrierung, HABITS-Array-Struktur, Achievement-Struktur, Card-Rendering-Pattern in Stats). Halte dich strikt an diese Konventionen — keine neuen Libraries, kein Framework, keine Build-Tool-Änderungen.

Setze die folgenden Aufgaben **in dieser Reihenfolge** um, jede als eigenen, buildbaren Zwischenstand (nach jeder Aufgabe `npm run build` laufen lassen und auf Fehler prüfen):

### 1. Streak-Bug fixen (höchste Priorität)

In `Store.logActivity()` wird der Streak aktuell einfach bei jedem neuen Tag um 1 erhöht, unabhängig davon, ob der letzte Eintrag gestern oder vor einer Woche war — der Streak bricht nie. Fix: Berechne die Differenz in Tagen zwischen `streaks.lastActivity` und heute. Bei Differenz = 1 Tag: `current + 1`. Bei Differenz > 1 Tag (oder `lastActivity` ist `null`): `current = 1`. Bei Differenz = 0: kein-op (bestehendes Verhalten beibehalten). `longestStreak` weiterhin korrekt pflegen. Schreib dafür auch einen kleinen manuellen Test/Sanity-Check (z. B. Kommentar mit Beispiel-Szenarien), IndexedDB-Migration ist nicht nötig, da sich nur die Logik ändert, nicht das State-Schema.

### 2. Zwei einfache neue Habits

Ergänze in `src/modules/home/index.js` im `HABITS`-Array zwei neue Einträge nach bestehendem Muster (id, block, label, sub, xp, type: 'check', category, why-Text im bestehenden Stil — sachlich, mit physiologischer Begründung, 1-2 Sätze):

- `protein`: block `'tag'`, Label „Protein pro Mahlzeit", Sub „Jede Mahlzeit eine Proteinquelle", xp 10. Why-Text: Bezug auf Muskelproteinsynthese, ~1,5g/kg Körpergewicht/Tag verteilt auf mehrere Mahlzeiten ist wirksamer als eine große Portion, besonders in Kombination mit Krafttraining.
- `social`: block `'tag'` oder `'abend'`, Label „Sozialer Kontakt", Sub „Echtes Gespräch oder Zeit mit jemandem", xp 10. Why-Text: Einsamkeit/soziale Isolation erhöhen vorzeitige Sterblichkeit um bis zu 30% — vergleichbar mit klassischen Risikofaktoren wie Rauchen.

Passe `DEFAULT_STATE` in `Store.js` NICHT an — `doneHabits` ist bereits generisch und speichert beliebige Habit-IDs.

### 3. Krafttraining-Habit + Griffkraft-Trend

Füge einen neuen Habit `strength` hinzu (block `'tag'`, type `'protocol'`, xp 20, category z. B. `'bewegung'`), der auf ein neues Protokoll in `src/data/protocols.json` verweist (2-3 einfache, CRPS-verträgliche Kräftigungsübungen als Platzhalter-Steps). **Wichtig im why-Text vermerken**: Belastungsart und -intensität sollten mit Physio/Arzt abgestimmt werden, da eine CRPS-betroffene Extremität besondere Vorsicht braucht — das Habit ist ein Reminder/Tracking-Tool, keine Trainingsvorgabe.

Zusätzlich: neuer optionaler, periodischer Messwert „Griffkraft" (kg). Lege dafür in `Store.js` einen neuen durable State-Key `gripStrengthLog: []` an (Array aus `{ date, kg }`). Baue in `src/modules/stats/index.js` eine neue Card nach dem Muster von `HydrationCard`/`_enrich()` (Balkendiagramm über die letzten Einträge, x-Achse Datum). Eingabe für neue Messwerte kann simpel im Stats-Modul selbst passieren (kleines Inline-Formular: Zahl + „Speichern"-Button), kein eigenes Modul nötig.

### 4. Schlafqualität erweitern

Der bestehende `sleep`-Habit ist aktuell ein reines Ja/Nein-Check. Erweitere ihn so, dass nach dem Abhaken optional eine Bewertung 1-5 abgefragt wird (z. B. kleine Sternchen- oder Zahlen-Auswahl, die kurz erscheint). Speichere die Werte in einem neuen State-Key `sleepQuality: {}` (Objekt `{ [dateISO]: score }`), analog zum bestehenden `doneHabits`-Muster nach Datum. In `DEFAULT_STATE` ergänzen.

### 5. Neues Modul: Vorsorge

Neues Modul `src/modules/vorsorge/index.js`, registriert in `main.js` über `ModuleRegistry.register(VorsorgeModul)`.

Datenmodell (neue Datei `src/data/screenings.js` oder direkt im Modul): Liste von Screenings mit `id`, `label`, `intervalMonths`, `minAge`, `gender` (`'all' | 'm' | 'w'`). Beispiele: allgemeiner Gesundheits-Check-up (Blutdruck/Cholesterin/Blutzucker, alle 36 Monate, ab 35), Darmkrebsvorsorge (ab 50), Hautkrebs-Screening (ab 35, alle 24 Monate), Mammografie (nur `gender: 'w'`, ab 50, alle 24 Monate), PSA-Basiswert (nur `gender: 'm'`, ab 50, einmalig als Richtwert).

Onboarding erweitern (`src/modules/onboarding/index.js`): Geburtsjahr und Geschlecht abfragen, in `settings.birthYear` / `settings.gender` speichern, um im Vorsorge-Modul nur relevante Screenings zu filtern.

State: neuer durable Key `vorsorgeLog: {}` (Objekt `{ [screeningId]: lastDoneDateISO }`), in `DEFAULT_STATE` ergänzen.

UI: eine Card pro relevantem Screening mit „Zuletzt: [Datum]" oder „Noch nie erfasst", einem Status-Badge (fällig / bald fällig / aktuell, berechnet aus `lastDone + intervalMonths` vs. heute — Berechnungslogik kann sich an der bestehenden Fasten-Fenster-Berechnung in `settings/index.js` orientieren), und einem Button „Als erledigt markieren" (setzt Datum auf heute, optional mit Datepicker für rückwirkende Erfassung).

Reminder: kein tägliches Polling nötig, ein Check beim App-Start (z. B. in `main.js` neben `checkDailyReset()`) reicht, der bei überfälligen Screenings einen Toast zeigt — kannst du das bestehende Toast-Pattern aus `ReminderService._showToast()` wiederverwenden/extrahieren.

Kein XP für Vorsorge-Einträge — das ist bewusst kein Gamification-Ziel, sondern reine Fürsorge-Funktion.

### 6. Schmerz-Tracking mit Habit-Korrelation (größtes Feature, zuletzt)

Ergänze eine tägliche Erfassung: Schmerz-Score 0-10 plus optional die Budapest-Kriterien-Checkboxen, die bereits als `crps_tools.budapest_criteria` in `protocols.json` liegen, aber aktuell nirgends im UI verwendet werden. Am ehesten als kleine Karte auf der Home-Ansicht oder als eigener Home-Unterbereich.

State: neuer durable Key `painLog: []` (Array aus `{ date, score, criteria: [] }`), in `DEFAULT_STATE` ergänzen.

In `src/modules/stats/index.js`: neue Card „Schmerz & Habits" mit (a) einem Liniendiagramm/Balkendiagramm des Schmerz-Scores über die letzten 14-30 Tage (gleiches Rendering-Pattern wie `HydrationCard`), und (b) einer einfachen Korrelationsanzeige: für 2-3 ausgewählte Habits (z. B. `vagus`, `foot_pm`, `sleep`) den durchschnittlichen Schmerz-Score an Tagen mit vs. ohne dieses Habit erledigt vergleichen (simple Mittelwert-Berechnung über `activity_log`/`painLog`-Join nach Datum, keine externe Statistik-Bibliothek nötig — reines Array-Reduce).

Nutze für den Tages-Join `state.doneHabits` in Kombination mit dem historischen `activity_log`-Store (`getActivityLog()` in `Store.js`) — ggf. musst du `activity_log`-Einträge um ein Feld für erledigte Habits pro Tag erweitern, falls das noch nicht granular genug gespeichert wird. Prüfe das beim Lesen von `db.js` und `Store.logActivity()`.

### 7. Ernährungs-Hebel: Meal-Order, Post-Meal-Walk, Pflanzenvielfalt

Vier evidenzbasierte Hebel, bei denen Timing/Struktur mehr wirkt als Inhalt — kein Kalorienzählen, passt zum bestehenden Checkbox-Stil.

**7a. Zwei neue Check-Habits** im `HABITS`-Array (`src/modules/home/index.js`), block `'tag'`, nach bestehendem Schema (id, block, label, sub, xp, type: `'check'`, category, why-Text im etablierten Stil):

- `meal_order`: Label „Gemüse/Protein zuerst", Sub „Kohlenhydrate zuletzt essen". Why-Text: Reihenfolge allein senkt den Blutzuckeranstieg um 20-40% (Ballaststoffe/Protein verlangsamen die Magenentleerung, triggern GLP-1) — unabhängig vom Inhalt der Mahlzeit.
- `post_meal_walk`: Label „Nach dem Essen bewegen", Sub „10 Min. leichtes Gehen". Why-Text: 10 Minuten Gehen direkt nach dem Essen senken die Blutzuckerspitze um 17-24% (Meta-Review), Intensität ist dabei zweitrangig.

Für `post_meal_walk` einen neuen zeitbasierten Eintrag in `REMINDERS` (`src/core/ReminderService.js`) ergänzen, der ca. 20-30 Min nach `settings.eatStart` bzw. nach der Hauptmahlzeit feuert — gleiches `type: 'times'`-Pattern wie beim bestehenden `lymph`-Reminder.

**7b. Pflanzenvielfalt-Zähler (neue Mechanik: Wochen- statt Tages-Reset)**

Anders als alle bisherigen Habits ist das ein **Wochenzähler**, keine tägliche Checkbox — Ziel: 30 verschiedene Pflanzenlebensmittel pro Kalenderwoche (Diversität korreliert stärker mit Mikrobiom-Gesundheit als reine 5-am-Tag-Menge).

- In `Store.js`: neue Funktion `checkWeeklyReset()` analog zu `checkDailyReset()`, aber Vergleichsbasis ist die ISO-Kalenderwoche statt `toDateString()`. Neuer durable State-Key `plantDiversityLog: []` (Array von Lebensmittel-Strings der aktuellen Woche, damit Duplikate innerhalb der Woche erkannt und nicht doppelt gezählt werden) plus `lastWeeklyReset` (analog `lastReset`). In `DEFAULT_STATE` ergänzen. `checkWeeklyReset()` beim App-Start und im bestehenden `visibilitychange`/Interval-Handler in `main.js` neben `Store.checkDailyReset()` aufrufen.
- UI in `src/modules/nutrition/index.js`: neue Card „Pflanzenvielfalt // diese Woche" mit einem 30er-Grid (Kästchen, die sich beim Antippen füllen — analog zum bestehenden `ProgressBar`-Pattern in derselben Datei) plus einem simplen Texteingabefeld oder Freitext-Button „+ Pflanze hinzufügen", das den Namen in `plantDiversityLog` pusht. Zähler zeigt „x / 30".

**7c. `cooking`-Habit schärfen**

Kein neuer Habit nötig — der bestehende `cooking`-Habit deckt "Verarbeitungsgrad senken" im Kern ab. Nur den `why`-Text in `HABITS` aktualisieren: Bezug auf die 8-Länder-Studie (2025) — jede 10% mehr ultra-verarbeitete Lebensmittel am Gesamtkonsum erhöhen das Sterberisiko um 3%; Ø-Konsum liegt bei ~60%.

**7d. Neue Achievements** in `src/core/achievements.js`: `plant_diversity_30` (30/30 in einer Woche erreicht), `meal_order_streak_7`, `post_meal_walk_streak_14` — nach bestehendem Schema (`id`, `title`, `desc`, `icon`, `xp`, `check(state)`).

### 8. Elektrostimulation (TENS/EMS) — Fuß + Knie, 2x täglich

Neues geführtes Protokoll für ein TENS/Muskelstimulationsgerät, das an Fuß und Knie eingesetzt wird. Eine Session deckt pro Zeitslot beide Körperstellen nacheinander ab (kein separates Habit pro Körperstelle). Zwei Slots pro Tag: Mittag und Abend.

**Neues Protokoll** `estim` in `src/data/protocols.json`, Steps nach bestehendem Schema (`id`, `title`, `duration` in Sekunden, `desc`):

1. „Vorbereitung" (~60s) — Haut prüfen (Sensibilität, keine offenen Stellen/Rötungen), Elektroden am Fuß anlegen.
2. „Stimulation Fuß" (~20 Min, als Default — im Timer frei verlängerbar, da Dauer je nach Programm variieren kann).
3. „Umsetzen" (~60s) — Elektroden vom Fuß lösen, Haut kurz prüfen, Elektroden am Knie anlegen.
4. „Stimulation Knie" (~20 Min, gleiche Logik wie Schritt 2).
5. „Abschluss" (~60s) — Gerät ausschalten, Haut auf Rötung/Reizung kontrollieren.

Da die tatsächliche Dauer/Intensität vom Gerät und der physiotherapeutischen Vorgabe abhängt: die Schritte 2 und 4 im Protokoll-Timer nicht hart auf eine Zeit begrenzen, sondern mit einer manuellen "Fertig"-Möglichkeit versehen (falls das `TimerService`/Protokoll-UI das nicht schon unterstützt, kurz prüfen und ggf. ergänzen) — die Empfehlung (15-25 Min) nur als Default-Anzeige, nicht als Zwang.

**Zwei neue Habits** im `HABITS`-Array (`src/modules/home/index.js`), type `'protocol'`, protocol: `'estim'`, category `'bewegung'`:

- `estim_noon`: block `'tag'`, Label „Elektrostimulation", Sub „Fuß + Knie · TENS/EMS".
- `estim_evening`: block `'abend'`, Label „Elektrostimulation", Sub „Fuß + Knie · TENS/EMS".

Why-Text (für beide, ggf. leicht variiert): TENS moduliert die Schmerzweiterleitung über die Gate-Control-Theorie und kann bei neuropathischen Schmerzen wie bei CRPS lindernd wirken; die Muskelstimulation (EMS) hilft, Muskelaktivität in einer schmerzbedingt geschonten Extremität aufrechtzuerhalten und dem Muskelabbau entgegenzuwirken, auch wenn aktives Training limitiert ist. Kurzer Sicherheitshinweis im Text ergänzen: Elektrodenplatzierung und Parameter (Frequenz/Intensität) nach den Vorgaben der Physiotherapie/des Geräteherstellers, nicht über offene Hautstellen oder in der Nähe implantierter elektronischer Geräte.

**Zwei neue Reminder** in `REMINDERS` (`src/core/ReminderService.js`), `type: 'times'`, analog zum bestehenden `lymph`-Eintrag:

- `estim_noon_reminder`: Label „Elektrostimulation", Sub „13:00", `times: ['13:00']`, `protocolId: 'estim'`.
- `estim_evening_reminder`: Label „Elektrostimulation", Sub „19:30", `times: ['19:30']`, `protocolId: 'estim'`.

(Die Uhrzeiten sind Platzhalter — im Settings-Modul sind Reminder ohnehin nur an/aus schaltbar, nicht die Uhrzeit selbst; falls das künftig einstellbar werden soll, separat vermerken, aber nicht Teil dieser Aufgabe.)

**Neue Achievements** in `src/core/achievements.js`: `estim_first` (erste Session), `estim_50` (50 Sessions gesamt, `protocolCounts.estim >= 50` — Zähler kommt automatisch über `GamificationEngine.onProtocolComplete` mit), `estim_streak_14` (14 Tage in Folge mindestens eine Session, falls dafür ein separates Streak-Feld sinnvoll ist — sonst über `completedProtocols`/`protocolCounts` in Kombination mit dem Aktivitäts-Log lösen).

### 9. N-of-1-Experiment-Engine

Baut auf Aufgabe 6 (`painLog`) auf — erst danach umsetzen. Statt nur zu loggen, soll die App aktive Selbstversuche unterstützen: „2 Wochen Vagus-Übung vor dem Schlafen vs. danach — was senkt den Morgen-Schmerzscore mehr?"

Neues Modul oder Sektion in `src/modules/stats/index.js`: „Experimente". Datenmodell, neuer durable State-Key `experiments: []` in `DEFAULT_STATE`, Struktur pro Eintrag: `{ id, title, habitOrProtocolId, variantA, variantB, startDate, durationDays, dailyLog: [{ date, variant, painScoreNextMorning }] }`.

UI: einfaches Formular zum Anlegen eines Experiments (Titel, betroffenes Habit/Protokoll, zwei Varianten als Freitext, Dauer in Tagen). Während der Laufzeit: auf Home oder im Protokoll-Abschluss-Dialog eine kurze Abfrage „Variante A oder B heute?" für das gewählte Habit. Nach Ablauf: Auswertungs-Card mit Durchschnitts-Schmerzscore je Variante (reines Array-Reduce über `dailyLog`, gejoint mit `painLog` vom Folgetag — keine externe Statistik-Bibliothek).

Kein XP dafür — das ist ein Analyse-Werkzeug, kein Gamification-Ziel.

### 10. Flare-up-Risikohinweis auf Basis von Wetterdaten

Baut ebenfalls auf `painLog` (Aufgabe 6) auf. CRPS-Patienten berichten häufig Wetterfühligkeit (Luftdruckabfall), Studienlage ist uneinheitlich — die Funktion muss daher als **persönliche Mustererkennung auf Basis der eigenen Daten** kommuniziert werden, nicht als medizinische Vorhersage.

Wetterdaten: Open-Meteo-API nutzen (kostenlos, kein API-Key, CORS-freundlich) für den Luftdruckverlauf am gespeicherten Standort (grobe Koordinaten aus `settings`, einmalig per Browser-Geolocation oder manueller Ortseingabe im Onboarding/Settings erfassen — keine Pflichtangabe, Feature ohne Standort einfach ausblenden). Neuer durable State-Key `weatherLog: []` (`{ date, pressure }`), täglich beim App-Start ergänzt (ähnlich `checkDailyReset`-Aufruf-Stelle in `main.js`).

Korrelationslogik: erst aktiv, wenn mindestens 30 Tage mit überlappenden `painLog`- und `weatherLog`-Einträgen vorhanden sind (vorher UI-Hinweis „Noch nicht genug Daten"). Danach: einfache Prüfung, ob an Tagen mit starkem Luftdruckabfall (z. B. > 5 hPa in 24h) der Schmerzscore historisch im Schnitt höher war; wenn ja und aktuell ein Abfall vorliegt, Hinweis-Banner auf Home „Wetterumschwung — an ähnlichen Tagen war dein Schmerzscore bisher höher, evtl. Programm anpassen." Kein Alarm-Ton, kein Zwang — nur Information.

### 11. Adaptive Tagesplanung (Belastungssteuerung)

Baut auf `painLog` (Aufgabe 6) auf. Ziel: an Tagen mit hohem Schmerzscore automatisch das Kernprogramm von optionalen Extras unterscheiden, statt jeden Tag dieselbe volle Habit-Liste zu zeigen (Pacing-Prinzip aus der Physiotherapie).

In `HABITS` (`src/modules/home/index.js`) ein neues Flag `core: true/false` pro Habit ergänzen (Kernprotokolle wie Fußprotokolle, Vagus, Elektrostimulation eher `core: true`; Dinge wie Sozialkontakt, Pflanzenvielfalt, Lernen eher `core: false`).

Logik in `HomeModul` (oder einer neuen kleinen Hilfsfunktion in `GamificationEngine.js` oder einem neuen `LoadManager.js`): letzten 1-3 `painLog`-Einträge gegen einen persönlichen Basiswert (z. B. gleitender 30-Tage-Durchschnitt) vergleichen. Bei deutlich erhöhtem Score: nicht-`core`-Habits auf der Home-Ansicht visuell abgesetzt darstellen (z. B. gedimmt, mit Badge „heute optional") — **nicht ausblenden oder deaktivieren**, nur als Empfehlung markieren. Nutzer behält immer volle Kontrolle, das ist nur eine visuelle Priorisierung, keine Sperre.

### 12. Arztbericht-Export (letzte Aufgabe, aggregiert alles Vorherige)

Erst umsetzen, wenn Aufgaben 6, 3 (Griffkraft) und 5 (Vorsorge) stehen, da hier zusammengefasst wird. Ziel: ein druckfähiger Ein-Seiter für Arzttermine, ohne neue Abhängigkeiten (keine PDF-Bibliothek nötig — Browser-„Drucken"-Dialog mit Speichern-als-PDF-Option reicht).

Neue Ansicht (z. B. eigene Route/Modus im Stats- oder Vorsorge-Modul, „Arztbericht"): kompakte, für den Ausdruck optimierte Zusammenfassung über einen wählbaren Zeitraum (Standard 30 Tage) mit: Schmerzscore-Verlauf (Mittelwert, Trend, Tage mit Budapest-Kriterien), Habit-Compliance in Prozent für die wichtigsten `core`-Habits, Griffkraft-Trend (falls Daten vorhanden aus Aufgabe 3), offene/fällige Vorsorge-Termine (aus Aufgabe 5), aktueller Streak. Reines HTML mit einem eigenen `@media print`-Stylesheet-Block in `theme.css` (Bottom-Nav/Buttons ausblenden, schwarz-weiß-taugliches Layout, Seitenumbruch-Kontrolle) und einem „Drucken / Als PDF speichern"-Button, der `window.print()` aufruft.

### 13. Supplements bereinigen: DMSO und Bromelain entfernen

In `src/data/supplements/kmoe_crps.js` aus dem `SUPPLEMENTS`-Array entfernen: `bromelain`, `dmso_morning`, `dmso_evening`.

Da `kytta_morning` und `kytta_evening` bisher auf DMSO als vorbereitenden Schritt aufbauen („Erst nach DMSO-Einzug auftragen", „Kombination mit DMSO maximiert Gewebepenetration"), die `note`- und `evidence`-Felder dieser beiden Einträge anpassen, sodass Kytta als eigenständige, erste topische Anwendung beschrieben wird (nicht mehr als Folgeschritt nach DMSO).

`omega3`-Eintrag: `warning`-Feld „nicht mit Bromelain-Risiko summieren bei Antikoagulation" anpassen, da die Bromelain-Wechselwirkung wegfällt — schlichter Hinweis auf die blutverdünnende Wirkung von Omega-3 allein reicht.

`INTERACTIONS_NOTE` am Dateiende neu schreiben: den Bromelain/Omega-3- und den DMSO-vor-Kytta-Hinweis entfernen, den D3/K2-Marcumar-Hinweis behalten.

Den Kommentar-Header der Datei (Zeile 3-5, „Letzte Revision: …") um diese Änderung ergänzen, im bestehenden Stil des Audit-Trails („Bromelain und DMSO entfernt — [kurzer Grund, falls vom Nutzer genannt]").

### 14. Audio-Feedback für die letzten 5 Sekunden aller Timer-Übungen

Betrifft `TimerService.startExerciseCountdown()` in `src/core/TimerService.js` — das ist die zentrale Stelle, über die alle Protokoll-Schritte mit Timer laufen (Fußprotokolle, Vagus, Box Breathing, Meditation, Dehnung, das neue Elektrostimulations-Protokoll aus Aufgabe 8 usw.), der Fix wirkt also automatisch auf alle vorhandenen und neuen Protokolle.

Neues kleines Modul `src/core/SoundEngine.js` mit zwei Funktionen, implementiert über die Web Audio API (`AudioContext` + `OscillatorNode`) — **keine Audio-Dateien, keine neue Library**, damit es mit der bestehenden Single-File-Build-Strategie (`vite-plugin-singlefile`) kompatibel bleibt:

- `playTick()`: kurzer, dezenter Ton (~80ms, z. B. 800Hz).
- `playDone()`: deutlich unterscheidbarer Abschlusston (z. B. zweistufiger Ton, 500Hz → 800Hz, ~250ms).

In `TimerService.startExerciseCountdown()`: bei `remaining <= 5 && remaining > 0` → `SoundEngine.playTick()`; wenn `onComplete()` gefeuert wird → `SoundEngine.playDone()`. Zusätzlich, falls `navigator.vibrate` verfügbar ist (Mobile/PWA), bei denselben Zeitpunkten kurz vibrieren (z. B. 30ms bei jedem Tick, 200ms beim Abschluss) — das ist zuverlässiger als Ton, wenn das Handy auf lautlos steht, und unterstützt denselben Zweck (wissen, wann die nächste Übung dran ist, ohne hinzuschauen).

Neuer Settings-Toggle in `src/modules/settings/index.js` (gleicher `Toggle`-Baustein wie bei Remindern/Metriken): „Sound bei Timer", State-Key `settings.soundEnabled` (Default `true`), in `DEFAULT_STATE.settings` ergänzen. `SoundEngine`-Funktionen prüfen `Store.state.settings?.soundEnabled` vor der Wiedergabe.

### 15. Diagramm-System für Protokoll-Schritte („Skizzen")

Ziel: einzelne Protokoll-Schritte bekommen eine kleine schematische Skizze, damit die Ausführung auch ohne genaues Lesen des Textes klar ist (z. B. Ausstreichrichtung bei der Lymphdrainage, Atemrhythmus bei Box Breathing, Zonen bei der Fuß-Aktivierung).

Referenz-Stil (als Vorlage, im Chat bereits als Beispiel gezeigt — flaches Strichzeichnungs-Design, keine Farbverläufe, klare Beschriftung, sentence case): ein Quadrat mit vier Kanten-Pfeilen für Box Breathing, ein einfaches trapezförmiges Bein-Schema mit Pfeil Richtung Leiste für die Lymphdrainage-Ausstreichrichtung, eine Fuß-Ellipse mit drei nummerierten Kreis-Zonen (Ferse/Gewölbe/Zehen) für die Fußprotokolle. **Wichtig**: die im Chat gezeigten Skizzen nutzen die Farbvariablen des Visualisierungs-Tools (`--surface-1` etc.) — für die App müssen die SVGs stattdessen die echten CSS-Variablen aus `src/styles/theme.css` verwenden (z. B. `var(--text-main)`, `var(--border)`, `var(--bg)`, `var(--action-orange)`), damit sie im Dark/Light-Theme der App korrekt aussehen. Farben also neu zuordnen, nicht die Variablennamen 1:1 übernehmen.

Umsetzung:

- Neuer Ordner `src/assets/exercises/` mit einer SVG-Datei pro Diagramm-Typ, z. B. `box-breathing.svg`, `mld-leg-direction.svg`, `foot-zones.svg` — im beschriebenen Stil, mit den echten Theme-Variablen.
- In `src/data/protocols.json`: optionales Feld `diagram` pro Step ergänzen (Wert = Diagramm-ID, z. B. `"diagram": "box-breathing"`), gesetzt bei den passenden Steps (Box Breathing, Vagus/Atemübungen, MLD-Steps, Fußprotokoll-Steps).
- In `src/modules/protocols/index.js`: an der Stelle, wo ein Step während der Ausführung gerendert wird, das zugehörige Diagramm (falls `step.diagram` gesetzt ist) oberhalb oder neben dem Beschreibungstext einblenden. Diagramme können als kleine Lookup-Map in `src/ui/Templates.js` oder einer neuen `src/ui/Diagrams.js` gehalten werden (Diagramm-ID → Inline-SVG-String), damit sie ohne zusätzliche Asset-Ladezeit direkt im Template gerendert werden — passt besser zum bestehenden Single-File-Build als externe SVG-Dateien per `<img src>`.
- Für Protokolle ohne Diagramm (noch) einfach keinen Bereich anzeigen — kein Pflichtfeld, keine Platzhalter-Box.
- Die drei genannten Diagramme (Box Breathing, MLD-Richtung, Fuß-Zonen) als erste Umsetzung reichen für diese Aufgabe; weitere Protokolle (Elektrostimulation, Krafttraining, Dehnung, Meditation) können nach demselben Muster in einer Folge-Iteration ergänzt werden — das sprengt sonst den Rahmen dieser Aufgabe.

---

### Allgemeine Regeln für die Umsetzung

- Jede neue durable State-Property MUSS in `DEFAULT_STATE` (`Store.js`) ergänzt werden, sonst wird sie nicht in IndexedDB persistiert und nicht zwischen Tabs synchronisiert.
- Neue Achievements in `src/core/achievements.js` ergänzen, wo es Sinn ergibt (z. B. `strength_10`, `grip_first_test`, `vorsorge_first_logged`, `pain_tracked_30_days`, `social_streak_7`) — nach bestehendem Schema (`id`, `title`, `desc`, `icon`, `xp`, `check(state)`).
- Deutsche UI-Texte, bestehender Ton (kurz, sachlich, leicht motivierend, warum-basiert).
- Bestehendes CSS-Variablen-System aus `theme.css` nutzen, keine Inline-Farbwerte.
- Mobile-first, `padding-bottom` für Bottom-Nav-Freiraum wie in bestehenden Modulen.
- Nach jeder der 15 Aufgaben: `npm run build` ausführen, Konsole auf Fehler prüfen, kurz committen bevor die nächste Aufgabe beginnt.
- Aufgaben 9-11 setzen `painLog` aus Aufgabe 6 voraus, Aufgabe 12 setzt zusätzlich Aufgabe 3 (Griffkraft) und 5 (Vorsorge) voraus — Reihenfolge 1→12 daher nicht vertauschen.
- Für Aufgabe 10 gilt: keine neue externe Abhängigkeit einbinden außer dem direkten `fetch()`-Aufruf gegen die Open-Meteo-API — kein npm-Paket dafür installieren.
- Aufgaben 13-15 sind unabhängig von den vorherigen und können auch isoliert/zuerst umgesetzt werden, falls das sinnvoller in den Ablauf passt — betreffen aber jeweils andere Dateien als 9-12, also kein Konflikt bei paralleler Bearbeitung.
