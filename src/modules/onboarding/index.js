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
                 font-family:inherit;font-size:1rem;margin-bottom:24px;">

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
