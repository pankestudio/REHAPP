// src/data/supplements/kmoe_crps.js
// Persona: Knochenmarködem (KMÖ) / CRPS — orthopädische Probleme linker Fuß
// Finale Liste — medizinisch geprüft, Timing optimiert, Interaktionen geprüft.
// Letzte Revision: Glucosamin/Chondroitin entfernt (keine Evidenz für KMÖ/CRPS),
// Hyaluronsäure/Curcumin entfernt, Epsom-Salz entfernt, Arnika entfernt.

export const PERSONA_ID    = 'kmoe_crps';
export const PERSONA_LABEL = 'KMÖ / CRPS · Linker Fuß';

export const SUPPLEMENTS = [

  // ── Nüchtern (beim Aufwachen, 30–45 min vor der ersten Mahlzeit) ─────────
  {
    id:        'bromelain',
    label:     'Bromelain',
    detail:    '500mg · nüchtern',
    timing:    'fasting',
    xp:        8,
    note:      'Zwingend nüchtern — 30–45 min vor dem Essen. Mit Mahlzeit wirkt es nur als Verdauungsenzym.',
    evidence:  'Baut Entzündungsproteine im Kapselgewebe ab, reduziert Ödem, fördert Resorption',
    fastingOk: true,
    warning:   'Leicht blutverdünnend — vor OPs 1 Woche absetzen',
  },

  // ── Zur ersten Mahlzeit (Mittags bei 16:8) ────────────────────────────────
  {
    id:        'vitamin_d3_k2',
    label:     'D3 / K2 Tropfen',
    detail:    '4.000 IE D3 · 200µg K2 MK-7',
    timing:    'meal',
    xp:        5,
    note:      'Öl-Basis — zwingend mit Fett einnehmen. Bei 16:8 zur Mittagsmahlzeit.',
    evidence:  'Knochenaufbau, Calcium-Steuerung, Immunregulation. D3-Mangel verlangsamt Knochenheilung.',
    fastingOk: false,
    warning:   'Kontraindiziert bei Marcumar/Warfarin — K2 hebt deren Wirkung auf',
  },
  {
    id:        'omega3',
    label:     'Omega-3',
    detail:    'mind. 2g EPA/DHA',
    timing:    'meal',
    xp:        5,
    note:      'Mit fettreicher Mahlzeit. Algenöl = gleichwertig zu Fischöl, besser verträglich.',
    evidence:  'Systemische Entzündungshemmung über Eicosanoide — direkt relevant für KMÖ-Ödem',
    fastingOk: false,
    warning:   'Leicht blutverdünnend — nicht mit Bromelain-Risiko summieren bei Antikoagulation',
  },
  {
    id:        'vitamin_c_midday',
    label:     'Vitamin C',
    detail:    '500mg · gepuffert',
    timing:    'meal',
    xp:        5,
    note:      'Gepuffert = magenfreundlicher. Erste von zwei Tagesdosen.',
    evidence:  'CRPS-Prävention post-Trauma (Zollinger RCT), Kollagensynthese-Cofaktor',
    fastingOk: true,
  },
  {
    id:        'silizium',
    label:     'Silizium (Kieselsäure)',
    detail:    '20–30mg organisch',
    timing:    'meal',
    xp:        5,
    note:      'Mit Mahlzeit. Bambusextrakt oder organische Kieselsäure — nicht Quarzsand.',
    evidence:  'Strukturbaustein von Kollagen, Knorpel und Kapselgewebe. Synergiert mit Vitamin C.',
    fastingOk: true,
  },

  // ── Abends ────────────────────────────────────────────────────────────────
  {
    id:        'magnesium',
    label:     'Magnesiumbisglycinat',
    detail:    '400–600mg',
    timing:    'evening',
    xp:        5,
    note:      'Abends — beste Form. Bisglycinat = kein Durchfall, magenfreundlich.',
    evidence:  'Blockiert NMDA-Rezeptoren (zentrale Sensibilisierung bei CRPS), Muskelentspannung, Schlaf',
    fastingOk: true,
  },
  {
    id:        'vitamin_c_evening',
    label:     'Vitamin C',
    detail:    '500mg · zweite Dosis',
    timing:    'evening',
    xp:        5,
    note:      '2x täglich verteilen — Absorption sinkt bei >500mg Einzeldosis stark.',
    evidence:  'CRPS-Protokoll: 1.000mg/Tag über mind. 50 Tage',
    fastingOk: true,
  },

  // ── Lokal — linker Fuß ────────────────────────────────────────────────────
  {
    id:        'dmso_morning',
    label:     'DMSO 50%',
    detail:    'Morgenanwendung · linker Fuß',
    timing:    'topical_morning',
    xp:        8,
    note:      'Nur auf sauberer, trockener, intakter Haut. Dünn auftragen, 15 min einziehen. Dann Beinwell.',
    evidence:  'Carrier-Wirkung + eigenständig analgetisch. 50% hautschonender als 70%, gleich wirksam.',
    fastingOk: true,
    warning:   'Keine anderen Cremes, Synthetikkleidung oder Schmuck während Einzugszeit',
  },
  {
    id:        'kytta_morning',
    label:     'Beinwell-Salbe (Kytta)',
    detail:    'Nach DMSO · Gelenk + Knochenhaut',
    timing:    'topical_morning',
    xp:        5,
    note:      'Erst nach DMSO-Einzug auftragen. DMSO transportiert Wirkstoffe tief ins Gewebe.',
    evidence:  'Allantoin: Zellproliferation, Gewebereparatur. Rosmarinsäure: COX/LOX-Hemmung.',
    fastingOk: true,
    warning:   'Max. 6 Wochen am Stück — dann 4 Wochen Pause (Pyrrolizidinalkaloide)',
  },
  {
    id:        'dmso_evening',
    label:     'DMSO 50%',
    detail:    'Abendanwendung · intensiv',
    timing:    'topical_evening',
    xp:        8,
    note:      'Intensiver als morgens — nachts hat Gewebe mehr Zeit zu regenerieren.',
    evidence:  'Nächtliche Geweberegeneration, Ödem-Reduktion',
    fastingOk: true,
    warning:   'Nicht auf geröteter oder entzündeter Haut anwenden',
  },
  {
    id:        'kytta_evening',
    label:     'Beinwell-Salbe (Kytta)',
    detail:    'Nach DMSO · intensive Abendanwendung',
    timing:    'topical_evening',
    xp:        5,
    note:      'Abends großzügiger auftragen als morgens.',
    evidence:  'Kombination mit DMSO maximiert Gewebepenetration',
    fastingOk: true,
  },
];

export const TIMING_LABELS = {
  fasting:        'Nüchtern · beim Aufwachen',
  meal:           'Zur Mahlzeit · Mittags bei 16:8',
  topical_morning:'Lokal · linker Fuß · Morgen',
  topical_evening:'Lokal · linker Fuß · Abend',
  evening:        'Abends',
};

// Wechselwirkungshinweis für die App
export const INTERACTIONS_NOTE =
  'Bromelain + Omega-3 beide leicht blutverdünnend — bei Antikoagulation Arzt fragen. ' +
  'D3/K2 nicht bei Marcumar/Warfarin. DMSO vor Kytta auftragen — immer in dieser Reihenfolge.';
