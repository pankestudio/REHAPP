// Liefert Termine als .ics von einer echten URL aus. Grund: Eine installierte
// Web-App auf dem iPhone öffnet heruntergeladene Blob-Dateien oft gar nicht;
// eine Antwort mit Content-Type text/calendar öffnet dagegen zuverlässig den
// Dialog "Zum Kalender hinzufügen" (auch am Mac).
//
// GET /.netlify/functions/ics?d=<base64url(JSON)>
// JSON: { name?: string, events: [{ title, local (JJJJMMTTTHHMMSS) oder start (ISO), dur? (Min, 30),
//         alarm? (Min vorher, Standard 10; 0 = keine), daily? (Anzahl Tage) }] }
// Keine Daten werden gespeichert, die Funktion rechnet nur um.

const esc = s => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
// Zeilen nach RFC 5545 auf 75 Oktette falten
const fold = line => {
  const out = [];
  let cur = '';
  for (const ch of line) {
    if (Buffer.byteLength(cur + ch, 'utf8') > 74) { out.push(cur); cur = ' ' + ch; } else cur += ch;
  }
  out.push(cur);
  return out.join('\r\n');
};

function buildICS(data) {
  const events = Array.isArray(data.events) ? data.events.slice(0, 40) : [];
  const stamp = fmt(new Date());
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'CALSCALE:GREGORIAN', 'PRODID:-//REHAPP//DE', 'METHOD:PUBLISH'];
  if (data.name) lines.push('X-WR-CALNAME:' + esc(data.name));
  events.forEach((ev, i) => {
    const dur = Math.min(Math.max(parseInt(ev.dur, 10) || 30, 5), 600);
    // local = "JJJJMMTTTHHMMSS" ohne Zeitzone: lokale Uhrzeit des Geräts,
    // bleibt bei täglichen Terminen auch nach der Zeitumstellung gleich.
    const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(ev.local || '');
    let start, dtStart, dtEnd;
    if (m) {
      start = new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
      dtStart = ev.local;
      dtEnd = fmt(new Date(start.getTime() + dur * 60000)).slice(0, -1);
    } else {
      start = new Date(ev.start);
      if (isNaN(start)) return;
      dtStart = fmt(start);
      dtEnd = fmt(new Date(start.getTime() + dur * 60000));
    }
    lines.push('BEGIN:VEVENT',
      `UID:rehapp-${start.getTime()}-${i}-${Math.random().toString(36).slice(2, 8)}@rehapp`,
      'DTSTAMP:' + stamp, 'DTSTART:' + dtStart, 'DTEND:' + dtEnd,
      'SUMMARY:' + esc(String(ev.title).slice(0, 200)));
    const daily = parseInt(ev.daily, 10);
    if (daily > 1) lines.push('RRULE:FREQ=DAILY;COUNT=' + Math.min(daily, 366));
    const alarm = ev.alarm === undefined ? 10 : parseInt(ev.alarm, 10);
    if (alarm > 0) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(String(ev.title).slice(0, 200)), `TRIGGER:-PT${alarm}M`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

exports.buildICS = buildICS;
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
  let data;
  try {
    const raw = (event.queryStringParameters || {}).d || '';
    data = JSON.parse(Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch (err) {
    return { statusCode: 400, body: 'Ungültige Termindaten' };
  }
  const body = buildICS(data);
  if (!/BEGIN:VEVENT/.test(body)) return { statusCode: 400, body: 'Keine Termine' };
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="rehapp.ics"',
      'Cache-Control': 'no-store',
    },
    body,
  };
};
