import { chromium } from 'playwright';
import http from 'node:http'; import { readFile, writeFile, mkdir } from 'node:fs/promises'; import path from 'node:path';
// Erzeugt tests/fixtures/demo.json neu: startet die App im Demo-Modus ohne
// Fixture (= frische Standarddaten), baut über die App-eigenen Funktionen den
// Stand der Referenzbilder nach und schreibt Speicher, Inhalte, Ziele, Logs und
// Abzeichen heraus. Nutzung: node scripts/make-demo-fixture.mjs [--nur-vorsorge]
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'tests/fixtures/demo.json');
const types={'.html':'text/html','.js':'text/javascript','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
const srv=http.createServer(async(q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]); if(u.endsWith('demo.json')){r.writeHead(404);return r.end()} const f=path.join(root,u);let d;try{d=await readFile(f)}catch{r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':types[path.extname(f)]||'text/plain'});r.end(d)}).listen(8796);
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:390,height:844}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8796/index.html?demo=2026-11-03T11:18',{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
const fixture = await p.evaluate(async()=>{
  const day=864e5, T=new Date('2026-11-03T11:18').getTime();
  const key=(d)=>getLocalDateKey(new Date(T-d*day));
  const pause=['goal-from-sleep','goal-from-noscreen_am','goal-from-teeth','goal-from-learning','goal-from-protein','goal-from-social','goal-from-meal_order','goal-from-post_meal_walk'];
  for (const id of pause) { const g=getGoal(id); if (g) await saveGoal({...g, paused:true}); }
  const since={ 'goal-from-no_alcohol':31,'goal-im-rahmen':31,'goal-from-gluten_free':45,'goal-from-no_sugar':12,'goal-from-no_meat':9,'goal-from-no_carbs':4,'goal-from-no_drugs':60 };
  for (const [id,d] of Object.entries(since)) { const g=getGoal(id); if (g) await saveGoal({...g, since:getLocalDateKey(new Date(T-d*day))}); }
  const plan={
    'goal-from-morning':      {days:24, skip:[11], mut:[3,15]},
    'goal-mittagsroutine':    {days:9,  skip:[5]},
    'goal-abendroutine':      {days:18, skip:[7,13], mut:[2]},
    'goal-abend-checkin':     {days:14, skip:[]},
    'goal-from-cooking':      {days:20, skip:[2,6,9,12,16,19]},
    'goal-from-sunlight':     {days:12, skip:[4,8], mut:[1,6]},
  };
  for (const [id,pl] of Object.entries(plan)) for (let d=1; d<=pl.days; d++) if (!pl.skip.includes(d) && !isLogged(id,key(d))) await toggleLog(id,key(d),(pl.mut||[]).includes(d));
  for (const d of [2,9,16,23]) await toggleLog('goal-mama-anrufen',key(d),false);
  for (const d of [3,10,17]) await toggleLog('goal-from-others',key(d),d===10);
  await toggleLog('goal-from-morning', key(0), false);
  storageSet('eat16_8', JSON.stringify({start:'12:00', end:'20:00'}));
  storageSet('16_8_active','1');
  storageSet('timerStart', String(new Date('2026-11-02T20:00').getTime()));
  storageSet('water_extra_'+new Date().toDateString(),'1.2');
  const morning=getItems({type:'supplement'}).filter(i=>i.time==='morning').slice(0,3);
  morning.forEach(i=>toggleItemDone(i.id));
  checkNewUnlocks();
  // Runde 7: Vorsorge-Profil (Jahrgang 1981, m) und einige Einträge. Am Demo-Tag
  // 2026-11-03 sind psa_decision und bp_week fällig, dental bald, der Rest aktuell.
  await saveCheckRecord({ id:'check-profile', kind:'profile', birthYear:1981, sex:'m', smokerProfile:false, familyCRC:false, tbeArea:false, flags:{} });
  const vlog = (checkId, date, extra={}) => saveCheckRecord({ id:'demo-log-'+checkId, kind:'log', checkId, date, ...extra });
  await vlog('checkup35','2024-02-12'); await vlog('lpa_once','2023-06-20'); await vlog('skin','2025-03-12');
  await vlog('td','2017-05-10'); await vlog('dental','2026-05-20'); await vlog('eyes','2024-09-03');
  await vlog('bp_week','2025-10-10',{ value:128, value2:82, note:'28 Messungen' });
  // Laufende Messwoche: Tag 1 = 28.10., Tag 7 = heute, heute nur morgens gemessen.
  const readings={};
  for (let d=0; d<7; d++) ['m1','m2','a1','a2'].forEach((slot,j)=>{ if (d===6 && slot[0]==='a') return; const k=d*4+j; readings[d+'-'+slot]=[132+(k*7)%11, 82+(k*5)%9]; });
  await saveCheckRecord({ id:'demo-bpweek', kind:'bpweek', start:'2026-10-28', readings, done:false });
  await saveCheckRecord({ id:'demo-test-phq2', kind:'selftest', testId:'phq2', date:'2026-08-12', answers:[1,0], extra:[0,0,0,0], score:1 });
  await saveCheckRecord({ id:'demo-test-ucla', kind:'selftest', testId:'ucla', date:'2026-08-12', answers:[1,2,1], score:4 });
  await saveCheckRecord({ id:'demo-test-stopbang', kind:'selftest', testId:'stopbang', date:'2026-02-02', answers:[1,0,0,0,0,0,0,1], score:2, sex:'m' });
  // Feiermomente nicht beim Laden der Demo abspielen
  const data={}; for (let i=0;i<localStorage.length;i++){const k=localStorage.key(i); data[k]=localStorage.getItem(k);}
  return { app:'REHAPP', demo:'2026-11-03', data, content:getItems({}), goals:_goalsCache, logs:_logsCache, earned:_earnedCache, checks:_checksCache };
});
await mkdir(path.dirname(outFile),{recursive:true});
// --nur-vorsorge: bestehende Fixture behalten und nur checks ersetzen. Ein voller
// Neuaufbau verschiebt sonst Zeitstempel (Zeitzone des Rechners) und ändert
// Heute-Screenshots, die mit Vorsorge nichts zu tun haben (Runde 7).
if (process.argv.includes('--nur-vorsorge')) {
  const old = JSON.parse(await readFile(outFile, 'utf8'));
  old.checks = fixture.checks;
  await writeFile(outFile, JSON.stringify(old,null,1));
} else {
  await writeFile(outFile, JSON.stringify(fixture,null,1));
}
console.log(JSON.stringify({goals:fixture.goals.length, logs:fixture.logs.length, earned:fixture.earned.length, earnedTiers:fixture.earned.map(e=>e.tier||e.stufe||Object.keys(e).join('|')).slice(0,20), lsKeys:Object.keys(fixture.data).length, checks:fixture.checks.length, errs}));
await b.close(); srv.close();
