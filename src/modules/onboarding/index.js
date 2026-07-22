// src/modules/onboarding/index.js
export function renderOnboarding(state) {
  const s = state.settings;
  return `
    <div class="app-container" style="min-height:100vh;display:flex;flex-direction:column;
      justify-content:center;padding-top:60px;padding-bottom:60px;">
      <div style="margin-bottom:36px;">
        <div class="u-mono" style="font-size:0.7rem;font-weight:800;
          letter-spacing:0.12em;margin-bottom:28px;opacity:0.5;">REHAPP</div>
        <div style="font-size:1.5rem;font-weight:800;letter-spacing:-0.03em;
          line-height:1.2;margin-bottom:10px;">
          Deine Reha.<br>Deine Regeln.
        </div>
        <div style="font-size:0.75rem;color:var(--text-dim);font-style:italic;">
          & I said: no, no, no.
        </div>
      </div>

      <div class="card">
        <label class="u-label" style="font-size:0.6rem;">Wie heißt du?</label>
        <input
          id="onb-name"
          type="text"
          placeholder="Dein Name"
          autocomplete="given-name"
          value="${s.userName || ''}"
          style="width:100%;border:1.5px solid var(--border);background:var(--bg);
                 color:var(--text-main);padding:12px;outline:none;
                 font-family:inherit;font-size:1rem;margin-bottom:20px;">

        <label class="u-label" style="font-size:0.6rem;">Wann wachst du auf?</label>
        <input
          id="onb-wakeup"
          type="time"
          value="${s.wakeTime ?? '07:00'}"
          style="width:100%;border:1.5px solid var(--border);background:var(--bg);
                 color:var(--text-main);padding:12px;outline:none;
                 font-family:inherit;font-size:1rem;margin-bottom:20px;">

        <label class="u-label" style="font-size:0.6rem;">Geburtsjahr (für Vorsorge)</label>
        <input
          id="onb-birthyear"
          type="number"
          inputmode="numeric"
          placeholder="z.B. 1985"
          value="${s.birthYear ?? ''}"
          style="width:100%;border:1.5px solid var(--border);background:var(--bg);
                 color:var(--text-main);padding:12px;outline:none;
                 font-family:inherit;font-size:1rem;margin-bottom:20px;
                 -webkit-appearance:none;">

        <label class="u-label" style="font-size:0.6rem;">Geschlecht</label>
        <div style="display:flex;gap:8px;margin-bottom:24px;">
          ${['female','male','other'].map(g => `
            <button data-action="onb-select-gender" data-value="${g}"
              style="flex:1;padding:12px;border:1.5px solid var(--border);cursor:pointer;
                font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;
                background:${(s.gender ?? '') === g ? 'var(--text-main)' : 'transparent'};
                color:${(s.gender ?? '') === g ? 'var(--bg)' : 'var(--text-dim)'};">
              ${{ female: 'Weiblich', male: 'Männlich', other: 'Divers' }[g]}
            </button>`).join('')}
        </div>

        <button data-action="complete-onboarding" class="btn-primary">
          STARTEN →
        </button>
      </div>

      <div style="margin-top:20px;font-size:0.62rem;color:var(--text-dim);
        line-height:1.5;padding:0 4px;">
        REHAPP begleitet dich bei KMÖ/CRPS-Reha mit täglichen Protokollen,
        Habits und Fortschritts-Tracking. Alles läuft lokal auf deinem Gerät.
      </div>
    </div>`;
}
