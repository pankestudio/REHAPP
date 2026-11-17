# REHAPP – Longevity-Spezifikation

Stand: 16.11.2026 · Quelle: Longevity-Dossier Männer Mitte 40 (5 Research-Sessions + Synthese)

Diese Datei übersetzt die Ergebnisse des Longevity-Dossiers in Parameter für REHAPP. Sie ist eine **Vorlage für künftige Runden**, keine Umsetzungsanweisung. Jede Übernahme in `index.html` läuft über eine eigene Runde mit Prompt, Commits und Abnahme nach `CLAUDE.md`.

**Evidenzstufen:** 1 = Leitlinie oder RCT mit harten Endpunkten · 2 = RCT mit Surrogat oder starke Kohorte · 3 = Mechanismen, kleine Studien, Konvention · 4 = widerlegt bzw. abzuraten.

## Quellberichte

| Bericht | Link | Kapitel mit App-Parametern |
| --- | --- | --- |
| Synthese | https://claude.ai/artifact/PFNwwDuZaoeqKTMAkSm6GJ | Kap. 6 |
| Ernährung, Fasten & Stoffwechsel | https://claude.ai/artifact/6JC4izbjT4nougpy94iPVd | Kap. 7 |
| Training & Funktion | https://claude.ai/artifact/GkMsNx3D6hZThJf6kBGDLY | Kap. 8 |
| Schlaf, Stress & Wearables | https://claude.ai/artifact/16iuVimtFepnnDiw8nsgyM | Kap. 10 |
| Vorsorge & Psychosoziales | https://claude.ai/artifact/AUQoxm3qoet6DB5eq3a9AP | Kap. 7 |
| Projektsteuerung | https://claude.ai/artifact/3i3RM27kadhTpNMLU6QkW4 | – |

## Leitplanken (vor jeder Übernahme lesen)

1. **CRPS-Kontext geht vor.** Das Dossier ist für gesunde Männer Mitte 40 geschrieben. Alle Trainingsvorgaben (4×4-Intervalle, Krafttraining, Sprung- und Power-Übungen, Feldtests wie Cooper-Test oder Sitting-Rising-Test) gelten für die betroffene Extremität nur nach Abstimmung mit Ärztin, Arzt oder Physiotherapie. Die App zeigt sie als Option mit diesem Hinweis, nicht als Vorgabe.
2. **Supplement-, Fasten- und Dosierungswerte nie eigenmächtig ändern** (Regel aus `CLAUDE.md`). Werte aus dieser Datei, die bestehende Einträge betreffen, werden dem Nutzer zur Entscheidung vorgelegt.
3. **Bestehende Item-IDs und XP-Schlüssel bleiben unverändert.** Neue Inhalte kommen über ein eigenes `*_seeded_vN`-Flag.
4. **Medizinisch zurückhaltend formulieren.** Texte nennen Evidenz, keine Heilversprechen; Warnflaggen lösen Hinweise aus, keine Diagnosen.
5. **Vorsorge und Psyche ohne XP.** Kein Gamification-Ziel, reine Fürsorge.
6. **Keine Tagesnoten für Schlaf** (Orthosomnie). Scores frühestens nach 7 Nächten, nur als Trend.

## Abgleich mit `claude-code-prompt-longevity-features.md`

Die ältere Prompt-Datei im Repo-Root stammt aus der v4-Struktur (`src/`, Vite) und passt nicht mehr zum aktuellen Stack (alles in `index.html`). Inhaltlich weicht sie an diesen Stellen vom Dossier ab:

| Punkt | Alte Prompt-Datei | Dossier | Empfehlung |
| --- | --- | --- | --- |
| Protein | ~1,5 g/kg/Tag | 1,6 g/kg/Tag mit Krafttraining, 0,4 g/kg pro Mahlzeit | Dossier-Wert übernehmen |
| PSA | ab 50, einmalig als Richtwert | ab 45 nach Beratung, Intervall nach Wert (5 / 2 Jahre / 3 Monate) | Dossier übernehmen (S3-Leitlinie 2025) |
| Meal-Order, Post-Meal-Walk | Prozentangaben als Fakt | Detailregeln stammen aus Anbieter-Publikationen, kein Leitlinienniveau (Stufe 3) | Habits behalten, Prozentzahlen im Text weglassen oder als „kleine Studien“ kennzeichnen |
| Sozialer Kontakt | „bis zu 30 %“ | soziale Isolation HR 1,32 (Wang 2023) | passt, Quelle ergänzen |
| Vorsorge-Liste | Mammografie, PSA ab 50 | geschlechts- und altersspezifischer Kalender unten | Kalender unten verwenden |

## Modul 1: Fasten

| Parameter | Wert | Stufe |
| --- | --- | --- |
| Default-Fenster | 12–14 h Fasten / 10–12 h Essen, täglich | 2 |
| 16:8 | höchstens 5×/Woche; freigeben nur, wenn Proteinziel an ≥ 80 % der Tage erreicht und ≥ 2 Krafteinheiten/Woche | 2–3 |
| 5:2 | 2 nicht aufeinanderfolgende Tage mit ~600 kcal (Richtwert), nur nach Warnflag-Check | 2 |
| ADF | jeden 2. Tag ~25 % kcal (Richtwert), nur nach Warnflag-Check | 2 |
| Mehrtägig (≥ 72 h) / FMD | höchstens 2–4×/Jahr, nur mit Bestätigung „ärztlich abgeklärt“ | 3 |
| Dauerfenster unter 8 h | nicht als Preset; falls gewählt, Hinweis auf Kohortensignal | 3/4 |
| Tipp | frühes Fenster (Essen bis etwa 19–21 Uhr) | 3 |

**Kernbotschaft für Texte:** Fasten wirkt praktisch über die Kalorienbilanz. Das Fenster ist ein Werkzeug, um weniger zu essen, kein eigenständiger Stoffwechseleffekt (Liu 2022, BMJ-Netzwerk-Metaanalyse 2025).

**Sperren für Fasten über 16 h, 5:2, ADF, mehrtägig:**
- Insulin, Sulfonylharnstoffe, SGLT2-Hemmer, Diuretika, Antihypertensiva, Lithium, Warfarin
- Gicht, Nierensteine, eGFR unter 60
- aktuelle oder frühere Essstörung, BMI unter 20
- akute Infektion, harte Trainingsphase, Wettkampf
- grenzwertiges Testosteron oder Libido-Abfall (16:8 pausieren)

**Abbruchsignale im mehrtägigen Fasten:** Schwindel oder Synkope, Herzrasen, Verwirrtheit.

## Modul 2: Ernährung, Protein, Supplemente

### Protein

```text
protein.factor          = 1.6   // mit Krafttraining
protein.factor_deficit  = 1.8–2.0  // Kaloriendefizit, Fastenphasen, GLP-1
protein.factor_none     = 1.0–1.2  // ohne Training (Minimum 0.8, DGE)
protein.per_meal        = 0.4 g/kg (Minimum 0.3 g/kg)
protein.day_green       = ≥ 3 Mahlzeiten über Minimum
protein.plant_bonus     = +10 % Tagesziel bei pflanzlicher Ernährung
protein.post_training   = Proteinmahlzeit innerhalb ~2–3 h, ohne Druck
```

Hinweis: Bei eGFR unter 60 oder Albuminurie Ziel ärztlich festlegen.

### Supplemente (nur Hinweise, keine Dosierungsänderung bestehender Items)

| Item | Anzeige | Stufe |
| --- | --- | --- |
| Kreatin | 3–5 g/Tag, dauerhaft; Hinweis: erhöht Serumkreatinin scheinbar | 2 |
| Vitamin D | optional Okt.–März 800–1.000 IE; Warnung über 4.000 IE/Tag (EFSA-UL) | 1 |
| Omega-3 | „nicht routinemäßig“; Warnung über 1 g/Tag (Vorhofflimmern) | 1/4 |
| Magnesium | Warnung über 250 mg/Tag aus Supplementen (EFSA-UL) | 2–3 |
| K2, NMN, NR | „nicht empfohlen“ | 3/4 |

### Alkohol und Leber

- Alkohol-Tracker, Ziel 0, Gelb ab mehr als 2 Getränken/Woche (DGE 2024).
- Abend-Hinweis „REM gestört“ ab 0,35 g/kg (80 kg ≈ 28 g ≈ 2 Gläser).
- Optionales Laborfeld FIB-4: unter 1,3 grün · 1,3–2,67 gelb („Elastographie abklären“) · über 2,67 rot.
- Gewichtsziel-Meilensteine bei −5 %, −7–10 %, −10 %.

## Modul 3: Training

> CRPS-Hinweis aus den Leitplanken gilt für das ganze Modul.

### Zonen

| Zone | Marker | %HFmax (Richtwert) | RPE 6–20 |
| --- | --- | --- | --- |
| Z1 Regeneration | mühelos | unter 65 % | 9–10 |
| Z2 Grundlage | ganze Sätze sprechen | ~65–80 % | 11–13 |
| Z3 Tempo | Sprechen stockend | ~80–88 % | 14–15 |
| Z4 VO2max-Intervall | einzelne Wörter | 85–95 % | 16–18 |

```text
hrmax.default = 208 − 0.7 × Alter   // Tanaka; alle Formeln ±11 bpm
hrmax.learned = höchster 5-s-Wert der letzten 90 Tage vom Brustgurt, wenn höher
```

### Einheiten-Vorlagen (als `details.kind = 'schritte'` bzw. `timer` denkbar)

| Vorlage | Inhalt |
| --- | --- |
| `kraft_A` / `kraft_B` | 5–6 Übungen à 2–3 Sätze, 6–12 Wdh., RIR 1–3, Pause 2–3 min; ~10 Sätze/Muskelgruppe/Woche |
| `power` | 3 × 3–5 explosiv bei 30–70 % 1RM, am Anfang der Krafteinheit |
| `hiit_4x4` | 10 min Z2, 4 × (4 min Z4 + 3 min ~70 %), 5 min Auslaufen |
| `z2_kurz` / `z2_lang` | 45 min / 60–90 min |
| `balance_mob` | 10–20 min: Einbeinstand-Progression, Aufstehen vom Boden, Hüft- und BWS-Mobilität |
| `vilpa` | 3 × täglich 1 min zügig Treppe oder bergauf |
| `schritte` | Tagesziel 8.000–10.000; Sitzalarm nach 45–60 min |

Musterwoche: Mo Kraft A · Di Z2 · Mi 4×4 · Do Kraft B + Balance · Fr frei · Sa Z2 lang · So Mobilität. Minimalvariante: 2× Kraft, 1× 4×4, 1× Z2.

### Progression

- Kraft: alle Sätze am oberen Wiederholungsende mit RIR ≥ 1 → Last +2,5–5 %.
- Volumen: Start 6–8 Sätze/Muskelgruppe/Woche, alle 4 Wochen +2, maximal 14–16.
- 4×4: Woche 1–4 mit 3 Intervallen, ab Woche 5 mit 4; höchstens 2×/Woche.
- Ausdauervolumen höchstens +10 %/Woche (Konvention).
- Deload jede 7. Woche oder bei Warnflagge: Sätze −50 %, RIR ≥ 3, 4×4 durch Z2 ersetzen.

### Regeln

- HIIT am Krafttag mit weniger als 3 h Abstand → Hinweis.
- Eisbad innerhalb ~4 h nach Kraft → Hinweis (bremst Muskelaufbau).
- Zone 2 bis ~60 min und Mobilität nüchtern möglich; 4×4 und Einheiten über 90 min ins Essensfenster.

### Testplan

| Intervall | Tests |
| --- | --- |
| Woche 0 | Baseline aller Feldtests, Arzt-Check mit Ruhe-EKG vor dem ersten 4×4 |
| alle 12 Wochen | Cooper-Test oder Wearable-Trend, Griffkraft, Liegestütze |
| alle 6 Monate | 5× Aufstehen vom Stuhl, Sitting-Rising-Test, Einbeinstand |
| alle 1–2 Jahre | Spiroergometrie; DXA optional |

Referenzwerte (Männer 40–49): VO2max gut ab 42, sehr gut ab 46, Elite ab 52 ml/kg/min · Cooper 42 ≈ 2.380 m · Griffkraft-Warnung unter ~44–46 kg je nach Körpergröße (SOEP) · Liegestütze Ziel ≥ 40 · Stuhltest Ziel unter 7 s · Sitting-Rising Ziel ≥ 8 · Einbeinstand 10 s bestehen.

## Modul 4: Schlaf und Tagesroutine

```text
sleep.target_asleep_min       = 420      // ≥ 7 h; Hinweis bei < 360 an ≥ 3 Nächten/Woche
sleep.target_in_bed_min       = 450–510
sleep.wake_time_anchor        = Nutzerwert, Toleranz ±30 min, 7 Tage/Woche
sleep.weekend_wake_max_shift  = +60 min
sleep.social_jetlag_warn      = Differenz der Schlafmitte frei vs. Arbeit ≥ 60 min
sleep.regularity_score        = SRI aus Bett- und Aufstehzeiten, 7-Tage-Fenster
```

### Timer rückwärts ab Zielschlafenszeit T

| Timer | Auslöser | Stufe |
| --- | --- | --- |
| Koffein-Stopp | T − 8 h 50 min (Pre-Workout T − 13 h 15 min) | 2 |
| Letzte Mahlzeit | T − 3 h | 3 |
| Hartes Training Ende | T − 2 h | 3 |
| Licht dimmen | T − 3 h (≤ 10 lx) | 2/3 |
| Alkohol-Hinweis | ab T − 4 h | 2 |
| Atemübung 5 min (zyklisches Seufzen) | T − 30 min | 3 |
| Morgenlicht 15–30 min draußen | Aufstehen + 30 min | 2/3 |
| Natur-Zähler | 120 min/Woche | 3 |

Passt zu bestehenden Atem-Items (`details.kind = 'atmung'`); die Atemübung kann als neues Pattern ergänzt werden.

## Modul 5: Wearable-Daten

Kaufempfehlung aus Session 4: **Oura Ring 4 + Polar H10**.

```text
trusted   = rhr_night, hrv_night_rmssd (nur gleiches Gerät), bedtime, waketime, training_hr_chest
caution   = total_sleep (überschätzt 5–40 min), deep_min, rem_min (nur 28-Tage-Trend),
            resp_rate, skin_temp_delta
untrusted = waso, sleep_latency, readiness_score, spo2_absolute
baseline  = rollierender 30-Tage-Median, mindestens 14 gültige Nächte
```

### Datenwege

1. **Oura:** OAuth2-App im Developer-Portal (bis 10 Nutzer ohne Freigabe). Eine neue Netlify Function hält Client-Secret und Tokens; Refresh-Tokens gelten nur einmal, jedes neue sofort speichern. Scheduled Function ruft täglich ~10:00 `/v2/usercollection/sleep`, `/daily_readiness`, `/heartrate` ab; Abgleich in IndexedDB. Das Abo (69,99 €/Jahr) ist für die API nötig.
2. **Fallback:** manueller JSON/CSV-Export aus dem Oura Membership Hub, Import in REHAPP.
3. **Polar H10 live:** Web Bluetooth, Heart-Rate-Service `0x180D`. Funktioniert in Chrome auf Desktop und Android, **nicht in Safari auf iOS**. Am iPhone in Polar Flow aufzeichnen und nur die Zusammenfassung importieren.
4. **HealthKit:** keine Web-API; nur über eine native App wie Health Auto Export an eine Netlify Function.

### Designvorgaben

- Oura-Daten laut Sekundärquelle (Terra 2026, API-Bedingungen Section 4(d)) **nicht an KI-Modelle weitergeben**. Klausel vor dem Bau im Original prüfen.
- Gesundheitsdaten verschlüsselt speichern, Löschfunktion vorsehen.
- Werte verschiedener Geräte nie mischen (Oura RMSSD vs. Apple SDNN).

## Modul 6: Vorsorge (ohne XP)

Benötigt Geburtsjahr und Geschlecht in den Einstellungen.

| ID | Auslöser | Intervall | Bedingung |
| --- | --- | --- | --- |
| `checkup35` | letzter Check-up | 36 Monate | GKV |
| `lpa_once` | nie erfasst | einmalig | Lp(a) einmal im Leben |
| `skin` | letzter Termin | 24 Monate | ab 35; GKV-Status 2027 prüfen |
| `psa_decision` | Alter 45 | einmalig | Beratung, dann PSA ja/nein |
| `psa_followup` | PSA-Wert | < 1,5 → 60 Mon. · 1,5–2,99 → 24 Mon. · ≥ 3 → 3 Mon., dann Urologie + MRT | nur wenn PSA gewählt |
| `crc_start` | Alter 50 | einmalig | Koloskopie oder iFOBT |
| `ifobt` / `colo` | letzter Test | 24 / 120 Monate | gewählter Modus |
| `crc_family` | Familienanamnese ja | Indexalter − 10, spätestens 40–45, dann 120 Mon. | mit Arzt klären |
| `lung_ldct` | Raucherprofil erfüllt | 12 Monate | 50–75, ≥ 25 Jahre, ≥ 15 Packungsjahre |
| `td` | letzte Td-Impfung | 120 Monate | nächste Dosis einmal als Tdap |
| `fsme` | letzte Impfung | laut Fachinfo (Standard 60 Mon.) | Risikogebiet |
| `flu`, `zoster`, `pcv20` | Alter 60 oder Indikation | jährlich / einmalig | – |
| `covid` | Alter 75 oder Indikation | jährlich | – |
| `dental` | letzte Kontrolle | 6 Mon.; Parodontitis-Screening 24 Mon. | – |
| `eyes` | letzte Untersuchung | 60 Mon. (ab 60: 30; bei Risiko 12–24) | IGeL |
| `bp_week` | letzte 7-Tage-Serie | 12 Mon.; bei Mittel ≥ 135/85 Arzt, dann 1 Mon. | 2× morgens, 2× abends |
| `hearing` | ab 50 oder Probleme | 36 Monate | – |

Nicht anbieten: Ganzkörper-MRT, Multi-Krebs-Bluttests, Tastuntersuchung als Prostata-Screening, Hodenselbstuntersuchung als Routine (alle Stufe 4).

## Modul 7: Fragebögen und Psyche (ohne XP)

| Bogen | Rhythmus | Cut-off → Aktion |
| --- | --- | --- |
| STOP-Bang | einmal, dann jährlich | ≥ 3, oder ≥ 2 STOP-Fragen + männlich → „Schlafapnoe abklären“ |
| Epworth | vierteljährlich | ≥ 11 → Arzt; ≥ 16 → zeitnah, Warnung Autofahren |
| ISI | monatlich bei Schlafproblemen | 8–14 → CBT-I-Inhalte; ≥ 15 → „DiGA verordnen lassen“ (HelloBetter Schlafen, somnio) |
| PHQ-2 | vierteljährlich | ≥ 2 → PHQ-9 anbieten; ≥ 3 → PHQ-9 + Hausarzt-Empfehlung |
| PHQ-9 | bei Bedarf | 5–9 Kontrolle in 4 Wochen · 10–14 Abklärung · 15–19 mittelschwer · ≥ 20 zeitnah |
| Männer-Zusatzitems | mit PHQ-2 | Gereiztheit, Wut, mehr Alkohol, Risikoverhalten: ≥ 2 Ja → PHQ-9 (Stufe 3) |
| UCLA-3 | vierteljährlich | ≥ 6 „einsam“ (Schwelle nicht quellengeprüft) |
| Lebenssinn | vierteljährlich | ein Item 1–6, nur Verlauf |

**PHQ-9 Item 9 über 0** (Gedanken an Tod oder Selbstverletzung) zeigt unabhängig vom Gesamtwert sofort die Krisenseite, ohne Gamification-Elemente.

### Soziale Verbundenheit

- Wöchentlich: „Mit wem hattest du diese Woche ein echtes Gespräch, nicht Arbeit?“ Ziel ≥ 2 Personen; bei null ein sanfter Kontaktvorschlag.
- Monatlich: Treffen mit einem Freund geplant?
- Vierteljährlich: Ehrenamt, Verein oder Gruppe als fester Termin.
- Lernprojekt: anspruchsvolle neue Fähigkeit mit Wochenzeit.
- Pflegemodus: Einsamkeitsabfrage monatlich, Pflegetelefon 030 20 17 91 31 verlinken.
- Arbeitszeit ≥ 55 h an 4 Wochen in Folge → Hinweis (WHO/ILO).

### Krisenkontakte

- TelefonSeelsorge 0800 111 0 111 · 0800 111 0 222 · 116 123 (rund um die Uhr, kostenlos)
- 116 117 ärztlicher Bereitschaftsdienst
- 112 bei akuter Gefahr
- Nummern einmal jährlich zur Prüfung markieren.

## Warnflaggen (gebündelt)

| Stufe | Auslöser | Reaktion |
| --- | --- | --- |
| Rot | PHQ-9 Item 9 > 0 · Brustschmerz, Synkope, Atemnot beim Training · Blutdruck ≥ 180/110 mit Symptomen | Krisenseite bzw. „112 anrufen“ |
| Orange | PSA bestätigt ≥ 3 · Blut im Stuhl, Stuhlgangänderung > 3 Wochen · neues Herzstolpern · Apnoeverdacht · Knoten im Hoden · plötzlicher Hör- oder Sehverlust | zeitnah zum Arzt, bei Hör- oder Sehverlust am selben Tag |
| Gelb | Ruheherzfrequenz ≥ Baseline + 5 bpm und HRV ≤ Baseline − 1 SD an ≥ 2 Nächten · Hauttemperatur ≥ +0,5 °C mit erhöhter Ruheherzfrequenz · Leistung −10 % · RPE +2 bei gleicher Last · Gewichtsverlust > 1 %/Woche bei sinkender Kraft · Heim-Blutdruck ≥ 135/85 · PHQ-9 ≥ 10 · < 6 h Schlaf an 3 Nächten/Woche über 4 Wochen · Schlafmittel > 4 Wochen oder Melatonin > 3 Monate | Deload, Hinweis, Hausarzt |

Alle Schwellen der gelben Stufe sind Konventionen (Stufe 3), keine klinisch validierten Grenzwerte.

## Offene Punkte vor der Umsetzung

- Oura-API-Klausel zu KI-Verarbeitung im Original prüfen.
- Garmin- und Polar-API für Einzelpersonen nicht abschließend geklärt (nur relevant bei Gerätewechsel).
- G-BA-Entscheidungen bis 2027 (PSA plus MRT, Hautkrebs-Screening, Check-up) → Vorsorge-Kalender dann aktualisieren.
- Trainingsmodul mit Physiotherapie abstimmen, bevor Vorlagen als Items geseedet werden.
- Reihenfolge-Vorschlag für Runden: Vorsorge + Fragebögen (unabhängig, kein Datenrisiko) → Schlaf-Timer → Protein-Tracking → Training → Wearable-Anbindung.
