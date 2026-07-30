/* ---------- costanti ---------- */
const ROLE_CODES = ['Por','DC','TD','TS','MD','CC','ES','ED','ATT'];
const ROLE_ORDER = { 'Por':0, 'DC':1, 'TD':2, 'TS':2, 'MD':3, 'CC':4, 'ES':5, 'ED':5, 'ATT':6 };
const FOOT_OPTIONS = ['', 'Destro','Sinistro','Ambidestro'];
const GOAL_TYPES_FATTI = ['Azione','Rigore','Punizione diretta','Punizione indiretta',"Calcio d'angolo",'Autogol avversario'];
const GOAL_TYPES_SUBITI = ['Azione','Rigore','Punizione diretta','Punizione indiretta',"Calcio d'angolo",'Autogol nostro'];
const PRESENZA_STATI = ['Disponibile','Non disponibile'];
/* numerazione classica per posizione (rif. 4-3-3: 1 Por, 2 TD, 3 TS, 4 mediano, 5-6 centrali, 7-11 esterni, 8-10 mezzali, 9 punta) */
const FORMATIONS = {
  '4-4-2': [
    {ruolo:'Por', numero:1, x:0.50, y:0.95},{ruolo:'TD', numero:2, x:0.85, y:0.78},{ruolo:'DC', numero:5, x:0.62, y:0.82},
    {ruolo:'DC', numero:6, x:0.38, y:0.82},{ruolo:'TS', numero:3, x:0.15, y:0.78},{ruolo:'ED', numero:7, x:0.85, y:0.45},
    {ruolo:'CC', numero:4, x:0.62, y:0.48},{ruolo:'CC', numero:8, x:0.38, y:0.48},{ruolo:'ES', numero:11,x:0.15, y:0.45},
    {ruolo:'ATT', numero:9, x:0.38, y:0.12},{ruolo:'ATT', numero:10,x:0.62, y:0.12}
  ],
  '4-3-3': [
    {ruolo:'Por', numero:1, x:0.50, y:0.95},{ruolo:'TD', numero:2, x:0.85, y:0.78},{ruolo:'DC', numero:5, x:0.62, y:0.82},
    {ruolo:'DC', numero:6, x:0.38, y:0.82},{ruolo:'TS', numero:3, x:0.15, y:0.78},{ruolo:'MD', numero:4, x:0.50, y:0.58},
    {ruolo:'CC', numero:8, x:0.68, y:0.45},{ruolo:'CC', numero:10,x:0.32, y:0.45},{ruolo:'ED', numero:7, x:0.85, y:0.15},
    {ruolo:'ATT', numero:9, x:0.50, y:0.10},{ruolo:'ES', numero:11,x:0.15, y:0.15}
  ],
  '3-5-2': [
    {ruolo:'Por', numero:1, x:0.50, y:0.95},{ruolo:'DC', numero:5, x:0.65, y:0.80},{ruolo:'DC', numero:6, x:0.50, y:0.83},
    {ruolo:'DC', numero:3, x:0.35, y:0.80},{ruolo:'TD', numero:2, x:0.88, y:0.55},{ruolo:'CC', numero:8, x:0.65, y:0.48},
    {ruolo:'MD', numero:4, x:0.50, y:0.55},{ruolo:'CC', numero:10,x:0.35, y:0.48},{ruolo:'TS', numero:11,x:0.12, y:0.55},
    {ruolo:'ATT', numero:9, x:0.40, y:0.12},{ruolo:'ATT', numero:7, x:0.60, y:0.12}
  ],
  '4-2-3-1': [
    {ruolo:'Por', numero:1, x:0.50, y:0.95},{ruolo:'TD', numero:2, x:0.85, y:0.78},{ruolo:'DC', numero:5, x:0.62, y:0.82},
    {ruolo:'DC', numero:6, x:0.38, y:0.82},{ruolo:'TS', numero:3, x:0.15, y:0.78},{ruolo:'MD', numero:4, x:0.62, y:0.60},
    {ruolo:'MD', numero:8, x:0.38, y:0.60},{ruolo:'ES', numero:11,x:0.15, y:0.35},{ruolo:'CC', numero:10,x:0.50, y:0.30},
    {ruolo:'ED', numero:7, x:0.85, y:0.35},{ruolo:'ATT', numero:9, x:0.50, y:0.10}
  ],
  '3-4-3': [
    {ruolo:'Por', numero:1, x:0.50, y:0.95},{ruolo:'DC', numero:5, x:0.65, y:0.80},{ruolo:'DC', numero:6, x:0.50, y:0.83},
    {ruolo:'DC', numero:3, x:0.35, y:0.80},{ruolo:'TD', numero:2, x:0.88, y:0.50},{ruolo:'CC', numero:8, x:0.62, y:0.48},
    {ruolo:'CC', numero:10,x:0.38, y:0.48},{ruolo:'TS', numero:11,x:0.12, y:0.50},{ruolo:'ES', numero:7, x:0.15, y:0.15},
    {ruolo:'ATT', numero:9, x:0.50, y:0.10},{ruolo:'ED', numero:4, x:0.85, y:0.15}
  ]
};
const FORMATION_KEYS = Object.keys(FORMATIONS);
const SCHEMA_COLORS = ['#4FA8E0','#E0574F','#F2C94C','#6FCF7A'];
const STAGIONE_LIVELLI = {
  'Prima Squadra': ['Terza Categoria','Seconda Categoria','Prima Categoria','Promozione','Eccellenza','Serie D','Serie C','Serie B','Serie A','Altro'],
  'Juniores': ['Provinciale','Regionale','Élite','Nazionale','Altro'],
  'Allievi': ['Provinciali','Regionali','Nazionali','Altro'],
  'Giovanissimi': ['Provinciali','Regionali','Nazionali','Altro'],
  'Primavera': ['Primavera 4','Primavera 3','Primavera 2','Primavera 1','Altro'],
  'Altro': ['Altro'],
};
const STAGIONE_TIPI = Object.keys(STAGIONE_LIVELLI);

/* ---------- stato ---------- */
let state = {
  players: [],
  matches: [],
  allenamenti: [],
  pianoSquadra: {},
  formazioneDefault: { modulo:'', slots:[], chips:[] },
  sideNavOrder: null,
  loaded: false,
  currentView: 'calendario',
  currentMatchId: null,
  currentMatchTab: 'convocazione',
  currentAllenamentoId: null,
  drawMode: { nostra:false, avversaria:false, formazioneDefault:false },
  expandedStatRow: null,
  pianoExpandedSlot: null,
  rosaSort: { column:'nome', dir:'asc' },
  editingPlayerId: null,
  allenamentoSort: 'cognome',
  rosaViewMode: 'generali',
  defaultFormationSort: 'ruolo',
  notificheOpen: false,
  stagioni: {
    list: [],
    loaded: false,
    detailId: null,
    detail: null,
    selectedImportIds: [],
    showNewForm: false,
    newTipo: 'Prima Squadra',
    newLivello: STAGIONE_LIVELLI['Prima Squadra'][0],
  },
  schema: {
    view: 'library',
    exerciseId: null,
    sessionId: null,
    objectivesLoaded: false,
    objectives: [],
    exercises: [],
    sessions: [],
    allenamentoSessions: {},
    availableTags: [],
    tagsLoaded: false,
    filterSearch: '',
    filterTags: [],
    currentExercise: null,
    activeLivelloId: null,
    currentSession: null,
    drawMode: false,
    placeMode: null,
    eraserMode: false,
    activeColor: SCHEMA_COLORS[0],
    activeLineType: 'passaggio',
    livelloPicker: null,
  }
};
let modalConfirmCallback = null;

function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
function esc(s){
  if(s===undefined || s===null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function formatDate(d){
  if(!d) return 'data da definire';
  const parts = d.split('-');
  if(parts.length!==3) return d;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}
function surnameOf(fullName){
  if(!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if(parts.length<=1) return parts[0]||'';
  const particles = ['di','de','del','della','dello','van','von','mac','mc','lo','la','le'];
  let idx = parts.length-1;
  while(idx>0 && particles.includes(parts[idx-1].toLowerCase())){ idx--; }
  return parts.slice(idx).join(' ');
}
function givenNameOf(fullName){
  if(!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if(parts.length<=1) return '';
  const particles = ['di','de','del','della','dello','van','von','mac','mc','lo','la','le'];
  let idx = parts.length-1;
  while(idx>0 && particles.includes(parts[idx-1].toLowerCase())){ idx--; }
  return parts.slice(0,idx).join(' ');
}
function displayName(fullName){
  if(!fullName) return '';
  const cognome = surnameOf(fullName), nome = givenNameOf(fullName);
  return nome ? (cognome + ' ' + nome) : cognome;
}
function getMatch(id){ return state.matches.find(m=>m.id===id); }
function numGara(match, playerId){
  const n = match.numeriGara ? match.numeriGara[playerId] : null;
  return n ? n : '—';
}
function sortByNumGara(match, players){
  return players.slice().sort((a,b)=>{
    const na = (match.numeriGara && match.numeriGara[a.id]) || 999;
    const nb = (match.numeriGara && match.numeriGara[b.id]) || 999;
    if(na!==nb) return na-nb;
    return a.nome.localeCompare(b.nome);
  });
}
function maxConvocati(match){ return match.tipo==='Amichevole' ? 24 : 20; }
function showConfirmModal(message, onConfirm, confirmLabel){
  document.getElementById('modal-message').textContent = message;
  document.getElementById('modal-confirm-btn').textContent = confirmLabel || 'Elimina';
  modalConfirmCallback = onConfirm;
  document.getElementById('modal-overlay').style.display = 'flex';
}
function closeModal(){
  document.getElementById('modal-overlay').style.display = 'none';
  modalConfirmCallback = null;
}
function triggerModalConfirm(){
  if(modalConfirmCallback) modalConfirmCallback();
  closeModal();
}
function recomputeNumeriGara(match){
  if(!match.formazioneNostra.chips) match.formazioneNostra.chips = [];
  const assignedIds = new Set(match.formazioneNostra.chips.map(c=>c.playerId));
  match.numeriGara = match.numeriGara || {};
  match.formazioneNostra.chips.forEach(c=>{ match.numeriGara[c.playerId] = c.numero; });
  const benchIds = match.convocati.filter(id=>!assignedIds.has(id));
  benchIds.forEach((pid,i)=>{ match.numeriGara[pid] = 12+i; });
  Object.keys(match.numeriGara).forEach(pid=>{
    if(!match.convocati.includes(pid)) delete match.numeriGara[pid];
  });
}
function autoDistributeFromConvocati(match){
  const slots = match.formazioneNostra.slots || [];
  if(slots.length === 0) return;
  const chips = [];
  const usedNumeri = new Set();
  const useDefault = state.formazioneDefault && state.formazioneDefault.modulo === match.formazioneNostra.modulo && (state.formazioneDefault.chips||[]).length>0;
  const defaultByPlayer = {};
  if(useDefault){
    state.formazioneDefault.chips.forEach(c=>{ defaultByPlayer[c.playerId] = c.numero; });
  }
  const remaining = [];
  match.convocati.forEach(pid=>{
    const defaultNumero = defaultByPlayer[pid];
    if(defaultNumero!=null && !usedNumeri.has(defaultNumero)){
      const slot = slots.find(s=>s.numero===defaultNumero);
      if(slot){
        chips.push({ playerId: pid, numero: slot.numero, x: slot.x, y: slot.y });
        usedNumeri.add(slot.numero);
        return;
      }
    }
    remaining.push(pid);
  });
  const freeSlots = slots.filter(s=>!usedNumeri.has(s.numero));
  remaining.forEach((pid, idx) => {
    if(idx < freeSlots.length){
      const slot = freeSlots[idx];
      chips.push({ playerId: pid, numero: slot.numero, x: slot.x, y: slot.y });
    }
  });
  match.formazioneNostra.chips = chips;
}
function computeMatchStato(match){
  const hasTabellino = (match.golFatti&&match.golFatti.length>0) || (match.golSubiti&&match.golSubiti.length>0) ||
    Object.keys(match.statistiche||{}).some(pid=>{
      const s = match.statistiche[pid];
      return s && (s.entrato || s.uscito || (s.cartellino && s.cartellino.tipo));
    });
  return hasTabellino ? 'Giocata' : 'Programmata';
}
function matchOutcome(match){
  if(computeMatchStato(match)!=='Giocata') return null;
  const gf = (match.golFatti||[]).length, gs = (match.golSubiti||[]).length;
  if(gf>gs) return 'win';
  if(gf<gs) return 'loss';
  return 'draw';
}
function defaultPresenzaFor(player){
  return (player && player.aggregatoPrimaSquadra) ? 'Non disponibile' : 'Disponibile';
}

/* ---------- storage ---------- */
function migrateMatch(m){
  if(!m.numeriGara) m.numeriGara = {};
  if(!m.golFatti) m.golFatti = [];
  if(!m.golSubiti) m.golSubiti = [];
  if(!m.statistiche) m.statistiche = {};
  if(!m.sede) m.sede = 'Casa';
  if(!m.tipo) m.tipo = 'Campionato';
  if(!m.formazioneNostra) m.formazioneNostra = { modulo:'', slots:[], chips:[], arrows:[] };
  if(!m.formazioneNostra.slots) m.formazioneNostra.slots = [];
  if(!m.formazioneNostra.chips) m.formazioneNostra.chips = [];
  if(m.formazioneNostra.chips.some(c=>c.numero==null)) m.formazioneNostra.chips = [];
  if(!m.formazioneAvversaria) m.formazioneAvversaria = { modulo:'', chips:[], arrows:[], noteCaratteristiche:'', notePiano:'' };
  if(!m.valutazioni) m.valutazioni = { nostraSquadra:{voto:null,note:''}, nostriGiocatori:{}, avversariSquadra:{voto:null,note:''}, avversariGiocatori:[] };
  if(!m.convocati) m.convocati = [];
  Object.keys(m.statistiche).forEach(pid=>{ if(m.statistiche[pid] && m.statistiche[pid].gol) delete m.statistiche[pid].gol; });
  recomputeNumeriGara(m);
}
async function storageGet(key){
  const res = await fetch('/api/storage/' + encodeURIComponent(key));
  if(!res.ok) throw new Error('network error (' + res.status + ')');
  return res.json();
}
async function storageSet(key, value){
  const res = await fetch('/api/storage/' + encodeURIComponent(key), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value })
  });
  if(!res.ok) throw new Error('network error (' + res.status + ')');
  return res.json();
}
const LEGACY_PRESENCE_MAP = { 'Presente':'Disponibile', 'Prima squadra':'Disponibile', 'Infortunato':'Non disponibile', 'Malato':'Non disponibile', 'Non definito':'Non disponibile' };
function migratePlayer(p){
  if(typeof p.aggregatoPrimaSquadra !== 'boolean') p.aggregatoPrimaSquadra = false;
  if(typeof p.valutazione !== 'number') p.valutazione = 0;
  if(typeof p.note !== 'string') p.note = '';
}
function migrateAllenamento(a){
  if(!a.presenze) a.presenze = {};
  Object.keys(a.presenze).forEach(pid=>{
    const mapped = LEGACY_PRESENCE_MAP[a.presenze[pid]];
    if(mapped) a.presenze[pid] = mapped;
  });
}
async function loadData(){
  try{
    const r = await storageGet('players');
    state.players = (r && r.value) ? JSON.parse(r.value) : [];
  }catch(e){ state.players = []; }
  try{
    const r = await storageGet('matches');
    state.matches = (r && r.value) ? JSON.parse(r.value) : [];
  }catch(e){ state.matches = []; }
  try{
    const r = await storageGet('allenamenti');
    state.allenamenti = (r && r.value) ? JSON.parse(r.value) : [];
  }catch(e){ state.allenamenti = []; }
  try{
    const r = await storageGet('piano-squadra');
    state.pianoSquadra = (r && r.value) ? JSON.parse(r.value) : {};
  }catch(e){ state.pianoSquadra = {}; }
  try{
    const r = await storageGet('formazione-default');
    state.formazioneDefault = (r && r.value) ? JSON.parse(r.value) : { modulo:'', slots:[], chips:[] };
  }catch(e){ state.formazioneDefault = { modulo:'', slots:[], chips:[] }; }
  try{
    const r = await storageGet('sidebar-order');
    state.sideNavOrder = (r && r.value) ? JSON.parse(r.value) : null;
  }catch(e){ state.sideNavOrder = null; }
  if(!Array.isArray(state.formazioneDefault.riserve)) state.formazioneDefault.riserve = [];
  if(!Array.isArray(state.formazioneDefault.arrows)) state.formazioneDefault.arrows = [];
  const pianoMigrated = migratePianoSquadraKeys();
  const pianoDeduped = dedupePianoSquadra();
  if(pianoMigrated || pianoDeduped) savePianoSquadra();
  state.players.forEach(migratePlayer);
  state.matches.forEach(migrateMatch);
  state.allenamenti.forEach(migrateAllenamento);
  state.loaded = true;
  renderView();
}
async function savePlayers(){
  try{
    const r = await storageSet('players', JSON.stringify(state.players));
    if(!r || !r.ok) throw new Error('empty result');
    reportSaveOk();
  }
  catch(e){ console.error('storage error (players)', e); reportSaveError(); }
}
async function saveMatches(){
  try{
    const r = await storageSet('matches', JSON.stringify(state.matches));
    if(!r || !r.ok) throw new Error('empty result');
    reportSaveOk();
  }
  catch(e){ console.error('storage error (matches)', e); reportSaveError(); }
}
async function saveAllenamenti(){
  try{
    const r = await storageSet('allenamenti', JSON.stringify(state.allenamenti));
    if(!r || !r.ok) throw new Error('empty result');
    reportSaveOk();
  }
  catch(e){ console.error('storage error (allenamenti)', e); reportSaveError(); }
}
async function savePianoSquadra(){
  try{
    const r = await storageSet('piano-squadra', JSON.stringify(state.pianoSquadra));
    if(!r || !r.ok) throw new Error('empty result');
    reportSaveOk();
  }
  catch(e){ console.error('storage error (piano squadra)', e); reportSaveError(); }
}
async function saveFormazioneDefault(){
  syncProgrammataMatchesWithDefault();
  try{
    const r = await storageSet('formazione-default', JSON.stringify(state.formazioneDefault));
    if(!r || !r.ok) throw new Error('empty result');
    reportSaveOk();
  }
  catch(e){ console.error('storage error (formazione default)', e); reportSaveError(); }
}
function syncMatchFormationWithDefault(match){
  const moduloKey = state.formazioneDefault.modulo;
  const template = moduloKey ? FORMATIONS[moduloKey] : null;
  if(!template) return false;
  const newSlots = template.map(slot=>{
    const xy = slotToXY(slot,'nostra');
    return { numero: slot.numero, ruolo: slot.ruolo, x: xy.x, y: xy.y };
  });
  match.formazioneNostra.modulo = moduloKey;
  match.formazioneNostra.slots = newSlots;
  const max = maxConvocati(match);
  const defaultIds = [].concat(
    (state.formazioneDefault.chips||[]).map(c=>c.playerId),
    state.formazioneDefault.riserve||[]
  );
  match.convocati = defaultIds.slice(0, max);
  autoDistributeFromConvocati(match);
  recomputeNumeriGara(match);
  return true;
}
function syncProgrammataMatchesWithDefault(){
  let changed = false;
  state.matches.forEach(match=>{
    if(computeMatchStato(match)!=='Programmata') return;
    if(syncMatchFormationWithDefault(match)) changed = true;
  });
  if(changed) saveMatches();
}
async function saveSideNavOrder(){
  try{
    const r = await storageSet('sidebar-order', JSON.stringify(state.sideNavOrder));
    if(!r || !r.ok) throw new Error('empty result');
    reportSaveOk();
  }
  catch(e){ console.error('storage error (sidebar order)', e); reportSaveError(); }
}
function reportSaveError(){
  const banner = document.getElementById('save-error-banner');
  if(banner) banner.style.display = 'flex';
}
function reportSaveOk(){
  const banner = document.getElementById('save-error-banner');
  if(banner) banner.style.display = 'none';
}

/* ---------- render root ---------- */
function renderView(){
  const container = document.getElementById('view-content');
  if(!state.loaded){
    container.innerHTML = '<p class="hint">Caricamento…</p>';
    return;
  }
  if(state.currentView==='rosa'){
    container.innerHTML = renderRosaView();
  } else if(state.currentView==='formazione'){
    const prevScrollY = window.scrollY;
    container.innerHTML = renderFormazioneView();
    attachDefaultPitchInteractions();
    attachDefaultRosterInteractions();
    window.scrollTo(0, prevScrollY);
  } else if(state.currentView==='pianoSquadra'){
    container.innerHTML = renderPianoSquadraView();
    attachPianoSquadraInteractions();
  } else if(state.currentView==='allenamento'){
    container.innerHTML = renderAllenamentoView();
  } else if(state.currentView==='calendario'){
    container.innerHTML = renderCalendarioView();
  } else if(state.currentView==='statistiche'){
    container.innerHTML = renderStatisticheView();
  } else if(state.currentView==='match'){
    container.innerHTML = renderMatchView();
    renderMatchTab();
  } else if(state.currentView==='schema'){
    container.innerHTML = renderSchemaView();
    attachSchemaInteractions();
  } else if(state.currentView==='stagioni'){
    container.innerHTML = renderStagioniView();
  }
  renderSideNav();
  renderNextMatchBar();
}
const SIDE_NAV_ICONS = {
  calendario: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>',
  pianoSquadra: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="16" y2="15"/></svg>',
  formazione: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="8" r="2"/><circle cx="7" cy="15" r="2"/><circle cx="17" cy="15" r="2"/></svg>',
  rosa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="8" r="2.4"/><path d="M15.5 14.2c2.6.4 4.5 2.7 4.5 5.8"/></svg>',
  statistiche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="20" y2="21"/><rect x="6" y="13" width="3.4" height="8"/><rect x="10.3" y="8" width="3.4" height="13"/><rect x="14.6" y="4" width="3.4" height="17"/></svg>',
  schema: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>'
};
const SIDE_NAV_LOCK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
const SIDE_NAV_LABELS = { calendario:'Calendario', pianoSquadra:'Piano Squadra', formazione:'Formazione', rosa:'Rosa', statistiche:'Statistiche', schema:'Schema' };
const DEFAULT_SIDE_NAV_ORDER = ['calendario','formazione','pianoSquadra','rosa','statistiche','schema'];
function currentSideNavOrder(){
  const stored = state.sideNavOrder;
  if(Array.isArray(stored) && stored.length===DEFAULT_SIDE_NAV_ORDER.length && DEFAULT_SIDE_NAV_ORDER.every(k=>stored.includes(k))){
    return stored;
  }
  return DEFAULT_SIDE_NAV_ORDER;
}
function getAppUser(){
  const el = document.getElementById('app-user-data');
  if(!el) return { email:'', schemaUnlocked:false, stagioneEtichetta:'' };
  return {
    email: el.getAttribute('data-email')||'',
    schemaUnlocked: el.getAttribute('data-schema-unlocked')==='1',
    stagioneEtichetta: el.getAttribute('data-stagione-etichetta')||'',
    stagioneSocieta: el.getAttribute('data-stagione-societa')||'',
    stagioneTipo: el.getAttribute('data-stagione-tipo')||'',
    stagioneLivello: el.getAttribute('data-stagione-livello')||'',
  };
}
function renderSideNav(){
  const nav = document.getElementById('side-nav');
  const order = currentSideNavOrder();
  const schemaUnlocked = getAppUser().schemaUnlocked;
  nav.innerHTML = order.map(key => {
    const label = SIDE_NAV_LABELS[key];
    if(key==='schema'){
      if(!schemaUnlocked){
        return '<button class="side-nav-btn side-nav-btn-locked" data-key="schema" onclick="showSchemaLockedHint()">' + SIDE_NAV_LOCK_ICON + '<span>' + label + '</span></button>';
      }
      const schemaActive = state.currentView==='schema';
      return '<button class="side-nav-btn ' + (schemaActive?'side-nav-btn-active':'') + '" draggable="true" data-key="schema" onclick="openSchemaLibrary()">' + SIDE_NAV_ICONS.schema + '<span>' + label + '</span></button>';
    }
    const active = (state.currentView===key) || ((state.currentView==='match' || state.currentView==='allenamento') && key==='calendario');
    return '<button class="side-nav-btn ' + (active?'side-nav-btn-active':'') + '" draggable="true" data-key="' + key + '" onclick="switchTopView(\'' + key + '\')">' + SIDE_NAV_ICONS[key] + '<span>' + label + '</span></button>';
  }).join('');
  attachSideNavDrag();
}
function showSchemaLockedHint(){
  alert('Modulo Schema in arrivo — non ancora disponibile su questo account.');
}
let sideNavDragKey = null;
function attachSideNavDrag(){
  const nav = document.getElementById('side-nav');
  if(!nav) return;
  nav.querySelectorAll('.side-nav-btn:not(.side-nav-btn-locked)').forEach(btn=>{
    btn.addEventListener('dragstart', function(e){
      sideNavDragKey = btn.getAttribute('data-key');
      e.dataTransfer.effectAllowed = 'move';
      btn.classList.add('side-nav-dragging');
    });
    btn.addEventListener('dragend', function(){
      btn.classList.remove('side-nav-dragging');
      sideNavDragKey = null;
    });
    btn.addEventListener('dragover', function(e){
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    btn.addEventListener('drop', function(e){
      e.preventDefault();
      const targetKey = btn.getAttribute('data-key');
      if(!sideNavDragKey || sideNavDragKey===targetKey) return;
      const order = currentSideNavOrder().slice();
      const fromIdx = order.indexOf(sideNavDragKey);
      const toIdx = order.indexOf(targetKey);
      if(fromIdx===-1 || toIdx===-1) return;
      order.splice(fromIdx,1);
      order.splice(toIdx,0,sideNavDragKey);
      state.sideNavOrder = order;
      saveSideNavOrder();
      renderSideNav();
    });
  });
}
function switchTopView(key){
  state.currentView = key;
  state.currentMatchId = null;
  state.currentAllenamentoId = null;
  renderView();
}

/* ---------- vista ROSA ---------- */
function rosaCompare(a, b, column, dir){
  let va = a[column], vb = b[column];
  if(column==='ruolo' || column==='secondoRuolo'){
    va = (va && ROLE_ORDER[va]!=null) ? ROLE_ORDER[va] : 99;
    vb = (vb && ROLE_ORDER[vb]!=null) ? ROLE_ORDER[vb] : 99;
  } else {
    if(va===null||va===undefined) va = (typeof vb==='number') ? -1 : '';
    if(vb===null||vb===undefined) vb = (typeof va==='number') ? -1 : '';
    if(typeof va === 'string' || typeof vb === 'string'){ va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
  }
  let cmp = 0;
  if(va < vb) cmp = -1; else if(va > vb) cmp = 1;
  return dir==='asc' ? cmp : -cmp;
}
function sortRosaBy(column){
  const cur = state.rosaSort || { column:'nome', dir:'asc' };
  const ascCols = ['nome','ruolo','secondoRuolo','piede'];
  if(cur.column===column){
    state.rosaSort = { column, dir: cur.dir==='asc' ? 'desc' : 'asc' };
  } else {
    state.rosaSort = { column, dir: ascCols.includes(column) ? 'asc' : 'desc' };
  }
  renderView();
}
function rosaTh(label, column){
  const sort = state.rosaSort || { column:'nome', dir:'asc' };
  const active = sort.column===column;
  const arrow = active ? (sort.dir==='asc' ? ' ▲' : ' ▼') : '';
  return '<th class="sortable' + (active?' sort-active':'') + '" onclick="sortRosaBy(\''+column+'\')">' + esc(label) + arrow + '</th>';
}
function computePresenzaPercent(playerId){
  const today = new Date().toISOString().slice(0,10);
  const pastAllenamenti = state.allenamenti.filter(a=>a.data && a.data<=today);
  const total = pastAllenamenti.length;
  if(total===0) return null;
  const player = state.players.find(p=>p.id===playerId);
  const defaultStato = defaultPresenzaFor(player);
  let presenti = 0;
  pastAllenamenti.forEach(a=>{
    const v = (a.presenze && a.presenze[playerId]) || defaultStato;
    if(v==='Disponibile') presenti++;
  });
  return Math.round(presenti/total*100);
}
function computeAge(annoNascita){
  if(!annoNascita) return null;
  return new Date().getFullYear() - annoNascita;
}
function starIconSVG(color, size){
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="'+color+'"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
}
function starRatingHTML(value, size){
  size = size || 14;
  const v = Math.max(0, Math.min(5, Number(value)||0));
  let out = '<span class="star-rating" style="display:inline-flex;align-items:center;gap:1px;" title="'+v.toFixed(1)+'/5">';
  for(let i=0;i<5;i++){
    const fillPct = Math.max(0, Math.min(1, v - i)) * 100;
    out += '<span style="position:relative; display:inline-block; width:'+size+'px; height:'+size+'px; line-height:0;">' +
      '<span style="position:absolute; top:0; left:0;">' + starIconSVG('var(--border)', size) + '</span>' +
      '<span style="position:absolute; top:0; left:0; width:'+fillPct+'%; overflow:hidden;">' + starIconSVG('var(--yellow)', size) + '</span>' +
    '</span>';
  }
  out += '</span>';
  return out;
}
const ROSA_VIEW_MODES = [['generali','Info generali'],['statistiche','Statistiche'],['descrizione','Descrizione']];
function setRosaViewMode(mode){
  state.rosaViewMode = mode;
  renderView();
}
function rosaColsForMode(mode){
  if(mode==='statistiche'){
    return [
      ['nome','Nome'],
      ['convocazioni','Convoc.'], ['titolare','Titolare'], ['subentrato','Subentr.'], ['minuti','Minuti'],
      ['gol','Gol'], ['golSubiti','Gol sub.'], ['assist','Assist'], ['gialli','Gialli'], ['rossi','Rossi'],
      ['votoMedio','Voto medio'], ['percentPresenza','% Pres.']
    ];
  }
  if(mode==='descrizione'){
    return [ ['nome','Nome'], ['valutazione','Valutazione'], ['note','Note'] ];
  }
  return [ ['nome','Nome'], ['ruolo','Ruolo'], ['secondoRuolo','2° ruolo'], ['eta','Età'], ['piede','Piede'], ['valutazione','Valutazione'] ];
}
function renderRosaRow(r, mode){
  const editing = state.editingPlayerId === r.id;
  if(editing){
    const roleOpts = ROLE_CODES.map(rc=>'<option value="'+rc+'" '+(r.ruolo===rc?'selected':'')+'>'+rc+'</option>').join('');
    const roleOptsNone = '<option value="" '+(r.secondoRuolo?'':'selected')+'>—</option>' + ROLE_CODES.map(rc=>'<option value="'+rc+'" '+(r.secondoRuolo===rc?'selected':'')+'>'+rc+'</option>').join('');
    const footOpts = FOOT_OPTIONS.map(f=>'<option value="'+f+'" '+(r.piede===f?'selected':'')+'>'+(f||'—')+'</option>').join('');
    return '<tr style="background:rgba(62,143,214,0.07);">' +
      '<td style="white-space:nowrap;"><button class="btn btn-small btn-primary" onclick="stopEditPlayer()">OK</button> <button class="btn-icon" onclick="confirmRemovePlayer(\''+r.id+'\')" aria-label="Rimuovi">×</button></td>' +
      '<td><input type="text" style="width:150px;" value="'+esc(r.nome)+'" onchange="updatePlayerField(\''+r.id+'\',\'nome\',this.value)"></td>' +
      '<td><select onchange="updatePlayerField(\''+r.id+'\',\'ruolo\',this.value)">'+roleOpts+'</select></td>' +
      '<td><select onchange="updatePlayerField(\''+r.id+'\',\'secondoRuolo\',this.value)">'+roleOptsNone+'</select></td>' +
      '<td><select onchange="updatePlayerField(\''+r.id+'\',\'piede\',this.value)">'+footOpts+'</select></td>' +
      '<td><input type="number" min="1995" max="2020" style="width:75px;" value="'+esc(r.annoNascita||'')+'" onchange="updatePlayerField(\''+r.id+'\',\'annoNascita\',this.value)"></td>' +
      '<td><label style="display:flex;align-items:center;gap:4px;font-size:0.68rem;white-space:nowrap;"><input type="checkbox" '+(r.aggregatoPrimaSquadra?'checked':'')+' style="width:auto;" onchange="updatePlayerCheckboxField(\''+r.id+'\',\'aggregatoPrimaSquadra\',this.checked)"> 1a squadra</label></td>' +
    '</tr>';
  }
  const starOptions = [0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5].map(v=>'<option value="'+v+'" '+(Number(r.valutazione||0)===v?'selected':'')+'>'+v.toFixed(1)+'</option>').join('');
  const cells = { nome: '<td>'+esc(displayName(r.nome))+'</td>' };
  cells.ruolo = '<td>'+esc(r.ruolo)+'</td>';
  cells.secondoRuolo = '<td>'+esc(r.secondoRuolo)+'</td>';
  cells.eta = '<td>'+(computeAge(r.annoNascita)!=null?computeAge(r.annoNascita):'-')+'</td>';
  cells.piede = '<td>'+esc(r.piede)+'</td>';
  cells.convocazioni = '<td>'+r.convocazioni+'</td>';
  cells.titolare = '<td>'+r.titolare+'</td>';
  cells.subentrato = '<td>'+r.subentrato+'</td>';
  cells.minuti = '<td>'+r.minuti+'</td>';
  cells.gol = '<td>'+r.gol+'</td>';
  cells.golSubiti = '<td>'+r.golSubiti+'</td>';
  cells.assist = '<td>'+r.assist+'</td>';
  cells.gialli = '<td>'+r.gialli+'</td>';
  cells.rossi = '<td>'+r.rossi+'</td>';
  cells.votoMedio = '<td>'+(r.votoMedio!=null?r.votoMedio.toFixed(1):'-')+'</td>';
  cells.percentPresenza = '<td>'+(r.percentPresenza!=null?r.percentPresenza+'%':'-')+'</td>';
  if(mode==='descrizione'){
    cells.valutazione = '<td onclick="event.stopPropagation();"><select onchange="updatePlayerField(\''+r.id+'\',\'valutazione\',this.value)">'+starOptions+'</select></td>';
    cells.note = '<td onclick="event.stopPropagation();"><input type="text" class="input-note" placeholder="note libere" value="'+esc(r.note||'')+'" onchange="updatePlayerField(\''+r.id+'\',\'note\',this.value)"></td>';
  } else {
    cells.valutazione = '<td>'+starRatingHTML(r.valutazione)+'</td>';
  }
  const cols = rosaColsForMode(mode);
  return '<tr onclick="startEditPlayer(\''+r.id+'\')" style="cursor:pointer;">' +
    '<td><button class="btn-icon" onclick="event.stopPropagation(); confirmRemovePlayer(\''+r.id+'\')" aria-label="Rimuovi">×</button></td>' +
    cols.map(([key])=>cells[key]).join('') +
  '</tr>';
}
function startEditPlayer(playerId){
  state.editingPlayerId = playerId;
  renderView();
}
function stopEditPlayer(){
  state.editingPlayerId = null;
  renderView();
}
function updatePlayerField(playerId, field, value){
  const p = state.players.find(pl=>pl.id===playerId);
  if(!p) return;
  if(field==='nome'){
    const trimmed = value.trim();
    if(!trimmed) return;
    p.nome = trimmed;
  } else if(field==='annoNascita'){
    p.annoNascita = value ? parseInt(value,10) : null;
  } else if(field==='valutazione'){
    p.valutazione = value ? parseFloat(value) : 0;
  } else {
    p[field] = value;
  }
  savePlayers();
  renderView();
}
function updatePlayerCheckboxField(playerId, field, checked){
  const p = state.players.find(pl=>pl.id===playerId);
  if(!p) return;
  p[field] = checked;
  savePlayers();
  renderView();
}
function renderRosaView(){
  const stats = computeSeasonStats();
  let rows = state.players.map(p=>{
    const st = stats.perPlayer[p.id] || {};
    return {
      id: p.id, nome: p.nome, ruolo: p.ruolo, secondoRuolo: p.secondoRuolo||'', piede: p.piede||'', annoNascita: p.annoNascita||null,
      aggregatoPrimaSquadra: !!p.aggregatoPrimaSquadra,
      eta: computeAge(p.annoNascita), valutazione: p.valutazione||0, note: p.note||'',
      convocazioni: st.convocazioni||0, titolare: st.titolare||0, subentrato: st.subentrato||0,
      minuti: st.minutiTot||0, gol: st.gol||0, golSubiti: st.golSubiti||0, assist: st.assist||0,
      gialli: st.gialli||0, rossi: st.rossi||0,
      votoMedio: st.votiCount ? (st.votiSum/st.votiCount) : null,
      percentPresenza: computePresenzaPercent(p.id)
    };
  });
  const sort = state.rosaSort || { column:'nome', dir:'asc' };
  rows.sort((a,b)=>rosaCompare(a,b,sort.column,sort.dir));

  const roleOptions = ROLE_CODES.map(r=>'<option value="'+r+'">'+r+'</option>').join('');
  const roleOptionsWithNone = '<option value="">—</option>' + roleOptions;
  const mode = state.rosaViewMode || 'generali';
  const cols = rosaColsForMode(mode);

  return '' +
  '<div class="card">' +
    '<div class="card-header-row"><h2>Rosa — stagione '+esc(getAppUser().stagioneEtichetta)+'</h2>' +
      '<div class="pitch-actions">' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-dim);"><input type="checkbox" id="rosa-export-stats" checked style="width:auto;padding:0;"> Includi statistiche</label>' +
        '<button class="btn btn-small" onclick="exportRosaPDF()">Esporta PDF</button>' +
        '<button class="btn btn-small" onclick="exportRosaXLSX()">Esporta XLSX</button>' +
        '<button class="btn btn-small" onclick="exportPageImage(\'rosa\')">Esporta immagine</button>' +
      '</div>' +
    '</div>' +
    '<div class="pitch-actions" style="margin-bottom:6px;">' +
      ROSA_VIEW_MODES.map(([key,label])=>'<button class="btn btn-small ' + (mode===key?'btn-active':'') + '" onclick="setRosaViewMode(\''+key+'\')">'+label+'</button>').join('') +
    '</div>' +
    (rows.length===0 ? '<p class="hint">Nessun giocatore in rosa. Aggiungilo o importalo qui sotto.</p>' :
      '<div class="rosa-table-wrap"><table class="rosa-table"><thead><tr>' +
        '<th></th>' +
        cols.map(([key,label])=>rosaTh(label,key)).join('') +
      '</tr></thead><tbody>' +
        rows.map(r=>renderRosaRow(r, mode)).join('') +
      '</tbody></table></div>' +
      '<p class="hint" style="margin-top:8px;">Clicca un\'intestazione per ordinare, clicca una riga per modificare i dati del giocatore. Le statistiche derivano dai tabellini partita e dalle presenze allenamento; "Gol subiti" conta solo per i portieri.</p>'
    ) +
  '</div>' +
  '<div class="card">' +
    '<h2>Aggiungi giocatore</h2>' +
    '<div class="form-row">' +
      '<div class="field field-grow"><label>Nome</label><input id="new-nome" type="text" placeholder="Nome e cognome"></div>' +
      '<div class="field"><label>Ruolo</label><select id="new-ruolo">'+roleOptions+'</select></div>' +
      '<div class="field"><label>2° ruolo</label><select id="new-secondo-ruolo">'+roleOptionsWithNone+'</select></div>' +
      '<div class="field"><label>Piede</label><select id="new-piede">' +
        FOOT_OPTIONS.map(f=>'<option value="'+f+'">'+(f||'—')+'</option>').join('') +
      '</select></div>' +
      '<div class="field"><label>Anno nascita</label><input id="new-anno" type="number" min="1995" max="2020" placeholder="2008"></div>' +
      '<label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-dim);padding-top:18px;"><input type="checkbox" id="new-aggregato" style="width:auto;padding:0;"> Aggregato prima squadra</label>' +
      '<button class="btn btn-primary" onclick="addPlayer()">Aggiungi</button>' +
    '</div>' +
  '</div>' +
  '<div class="card">' +
    '<div class="card-header-row"><h2>Importa da Excel</h2></div>' +
    '<p class="hint">Aggiunge i giocatori estratti da "Stagione_26_27_United.xlsx". I nomi già presenti in rosa non vengono duplicati.</p>' +
    '<button class="btn btn-primary" onclick="importRosaEstratta()">Importa rosa estratta</button>' +
  '</div>';
}
function addPlayer(){
  const nomeEl = document.getElementById('new-nome');
  const ruoloEl = document.getElementById('new-ruolo');
  const secondoEl = document.getElementById('new-secondo-ruolo');
  const piedeEl = document.getElementById('new-piede');
  const annoEl = document.getElementById('new-anno');
  const aggregatoEl = document.getElementById('new-aggregato');
  const nome = nomeEl.value.trim();
  if(!nome){ nomeEl.focus(); return; }
  state.players.push({
    id: uid(), nome,
    ruolo: ruoloEl.value,
    secondoRuolo: secondoEl.value || '',
    piede: piedeEl.value || '',
    annoNascita: annoEl.value ? parseInt(annoEl.value,10) : null,
    aggregatoPrimaSquadra: aggregatoEl.checked,
    valutazione: 0,
    note: ''
  });
  savePlayers();
  renderView();
}
function confirmRemovePlayer(id){
  const p = state.players.find(pl=>pl.id===id);
  showConfirmModal('Rimuovere ' + (p?displayName(p.nome):'questo giocatore') + ' dalla rosa? Verrà tolto anche dalle partite in cui era convocato.', function(){
    removePlayer(id);
  });
}
function removePlayer(id){
  state.players = state.players.filter(p=>p.id!==id);
  state.matches.forEach(m=>{
    m.convocati = m.convocati.filter(pid=>pid!==id);
    m.formazioneNostra.chips = m.formazioneNostra.chips.filter(c=>c.playerId!==id);
    delete m.valutazioni.nostriGiocatori[id];
    delete m.statistiche[id];
    m.golFatti = (m.golFatti||[]).filter(g=>g.marcatoreId!==id);
    m.golFatti.forEach(g=>{ if(g.assistId===id) g.assistId=''; });
    recomputeNumeriGara(m);
  });
  state.allenamenti.forEach(a=>{ if(a.presenze) delete a.presenze[id]; });
  if(state.pianoSquadra){
    Object.keys(state.pianoSquadra).forEach(ruolo=>{
      state.pianoSquadra[ruolo] = state.pianoSquadra[ruolo].map(pid=>pid===id?'':pid);
    });
  }
  if(state.formazioneDefault && state.formazioneDefault.chips){
    state.formazioneDefault.chips = state.formazioneDefault.chips.filter(c=>c.playerId!==id);
    state.formazioneDefault.riserve = (state.formazioneDefault.riserve||[]).filter(pid=>pid!==id);
  }
  savePlayers();
  saveMatches();
  saveAllenamenti();
  savePianoSquadra();
  saveFormazioneDefault();
  renderView();
}
async function importRosaEstratta(){
  const seed = [
    {nome:'Brando Baraldi', ruolo:'Por', secondoRuolo:'', piede:'', annoNascita:2007},
    {nome:'Giuseppe Bigonce', ruolo:'Por', secondoRuolo:'', piede:'', annoNascita:null},
    {nome:'Riccardo Bulgarelli', ruolo:'DC', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Alessandro Porcireanu', ruolo:'DC', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Tommaso Di Renzo', ruolo:'DC', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Matteo Losi', ruolo:'DC', secondoRuolo:'', piede:'', annoNascita:2010},
    {nome:'Leonardo Guidetti', ruolo:'DC', secondoRuolo:'', piede:'', annoNascita:2010},
    {nome:'Riccardo Contrera', ruolo:'TD', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Riccardo Salvioli', ruolo:'TD', secondoRuolo:'', piede:'', annoNascita:2009},
    {nome:'Edoardo Iannacone', ruolo:'TS', secondoRuolo:'', piede:'Sinistro', annoNascita:2008},
    {nome:'Stefano Romano', ruolo:'TS', secondoRuolo:'ES', piede:'Sinistro', annoNascita:2007},
    {nome:'Samuele Sposito', ruolo:'MD', secondoRuolo:'', piede:'', annoNascita:2009},
    {nome:'Angelo Musciacchio', ruolo:'MD', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Riccardo Rinaldi', ruolo:'CC', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Mattia Costa', ruolo:'CC', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Nicolò Rossi', ruolo:'CC', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Manuele Zanotti', ruolo:'CC', secondoRuolo:'', piede:'', annoNascita:2010},
    {nome:'Thomas Gavioli', ruolo:'CC', secondoRuolo:'', piede:'', annoNascita:2010},
    {nome:'Elia Fontana', ruolo:'CC', secondoRuolo:'', piede:'Sinistro', annoNascita:2008},
    {nome:'Kevin Carpi', ruolo:'ES', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Federico Vivi', ruolo:'ED', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Nicolò Di Lorenzo', ruolo:'ED', secondoRuolo:'', piede:'', annoNascita:2009},
    {nome:'Lorenzo Quattrocchi', ruolo:'ED', secondoRuolo:'', piede:'', annoNascita:2009},
    {nome:'Erbion Bulku', ruolo:'ED', secondoRuolo:'', piede:'', annoNascita:2008},
    {nome:'Luca Poso', ruolo:'ATT', secondoRuolo:'', piede:'', annoNascita:2010},
    {nome:'Matia Bulku', ruolo:'ATT', secondoRuolo:'', piede:'Destro', annoNascita:2008},
    {nome:'Antonio Bruno', ruolo:'ATT', secondoRuolo:'MD', piede:'', annoNascita:2008},
    {nome:'Emanuele Berni', ruolo:'TD', secondoRuolo:'', piede:'', annoNascita:2007},
    {nome:'Davide Di Stasio', ruolo:'CC', secondoRuolo:'', piede:'', annoNascita:2007},
    {nome:'Riccardo Nappa', ruolo:'ES', secondoRuolo:'', piede:'Sinistro', annoNascita:2008}
  ];
  const existingNames = new Set(state.players.map(p=>p.nome.toLowerCase().trim()));
  let added = 0, skipped = 0;
  seed.forEach(s=>{
    if(existingNames.has(s.nome.toLowerCase().trim())){ skipped++; return; }
    state.players.push({ id: uid(), nome:s.nome, ruolo:s.ruolo, secondoRuolo:s.secondoRuolo, piede:s.piede, annoNascita:s.annoNascita, aggregatoPrimaSquadra:false, valutazione:0, note:'' });
    added++;
  });
  await savePlayers();
  renderView();
  alert('Importati ' + added + ' giocatori.' + (skipped ? (' ' + skipped + ' già presenti in rosa, saltati.') : ''));
}

/* ---------- vista PIANO SQUADRA (profondità rosa per posizione) ---------- */
const PIANO_SCELTA_LABELS = ['1ª scelta','2ª scelta','3ª scelta'];
function migratePianoSquadraKeys(){
  if(!state.pianoSquadra) return false;
  const keys = Object.keys(state.pianoSquadra);
  const hasRoleKeys = keys.some(function(k){ return !/^\d+$/.test(k); });
  if(!hasRoleKeys) return false;
  const slots = (state.formazioneDefault && state.formazioneDefault.slots) || [];
  const migrated = {};
  keys.forEach(function(key){
    const arr = state.pianoSquadra[key];
    if(!arr) return;
    if(/^\d+$/.test(key)){ migrated[key] = arr; return; }
    const targetSlot = slots.find(function(s){ return s.ruolo===key; });
    if(targetSlot) migrated[String(targetSlot.numero)] = arr;
  });
  state.pianoSquadra = migrated;
  return true;
}
function dedupePianoSquadra(){
  if(!state.pianoSquadra) return false;
  const seen = new Set();
  let changed = false;
  Object.keys(state.pianoSquadra).sort(function(a,b){ return Number(a)-Number(b); }).forEach(function(numero){
    const arr = state.pianoSquadra[numero];
    if(!arr) return;
    arr.forEach(function(pid,i){
      if(!pid) return;
      if(seen.has(pid)){ arr[i]=''; changed = true; }
      else seen.add(pid);
    });
  });
  return changed;
}
function getPianoScelta(numero, idx){
  const arr = (state.pianoSquadra && state.pianoSquadra[numero]) || [];
  return arr[idx] || '';
}
function setPianoScelta(numero, idx, playerId){
  if(!state.pianoSquadra) state.pianoSquadra = {};
  if(playerId){
    Object.keys(state.pianoSquadra).forEach(function(n){
      const arr = state.pianoSquadra[n];
      if(!arr) return;
      arr.forEach(function(pid,i){ if(pid===playerId && !(String(n)===String(numero) && i===idx)) arr[i]=''; });
    });
  }
  if(!state.pianoSquadra[numero]) state.pianoSquadra[numero] = ['','',''];
  while(state.pianoSquadra[numero].length < 3) state.pianoSquadra[numero].push('');
  state.pianoSquadra[numero][idx] = playerId;
  savePianoSquadra();
  renderView();
}
function usedPianoPlayerIds(excludeNumero, excludeIdx){
  const used = new Set();
  Object.keys(state.pianoSquadra||{}).forEach(function(n){
    (state.pianoSquadra[n]||[]).forEach(function(pid,i){
      if(!pid) return;
      if(String(n)===String(excludeNumero) && i===excludeIdx) return;
      used.add(pid);
    });
  });
  return used;
}
function pianoSurnameCounts(){
  const counts = {};
  state.players.forEach(function(p){
    const s = surnameOf(p.nome);
    counts[s] = (counts[s]||0) + 1;
  });
  return counts;
}
function pianoDisplayName(p, surnameCounts){
  const cognome = surnameOf(p.nome);
  if((surnameCounts[cognome]||0) <= 1) return cognome;
  const nome = givenNameOf(p.nome);
  return cognome + (nome ? ' ' + nome.charAt(0).toUpperCase() + '.' : '');
}
function playerOptionsForSlot(numero, idx, selectedId){
  const used = usedPianoPlayerIds(numero, idx);
  const available = state.players.filter(p=>!used.has(p.id));
  const sorted = available.slice().sort((a,b)=>surnameOf(a.nome).localeCompare(surnameOf(b.nome)));
  const surnameCounts = pianoSurnameCounts();
  return '<option value="" ' + (!selectedId?'selected':'') + '>—</option>' +
    sorted.map(p=>'<option value="'+p.id+'" '+(p.id===selectedId?'selected':'')+'>'+esc(pianoDisplayName(p, surnameCounts))+'</option>').join('');
}
function renderPianoSquadraPitch(def){
  const slots = def.slots || [];
  const surnameCounts = pianoSurnameCounts();
  const cardsHtml = slots.map(s=>{
    let leftPctNum = (105 - s.y) / 105 * 100;
    if(s.ruolo==='Por') leftPctNum *= 0.55;
    const leftPct = leftPctNum.toFixed(2);
    const topPct = (s.x / 68 * 100).toFixed(2);
    const picks = [0,1,2].map(idx=>{
      const pid = getPianoScelta(s.numero, idx);
      return { idx: idx, pid: pid, p: pid ? state.players.find(pl=>pl.id===pid) : null };
    });
    const best = picks[0].p;
    const expanded = state.pianoExpandedSlot === s.numero;
    let inner;
    if(expanded){
      const rowsHtml = picks.map(function(pick){
        return '<div class="piano-pitch-row piano-pitch-row-'+pick.idx+'">' +
          '<span class="piano-pitch-tier">'+(pick.idx+1)+'</span>' +
          '<select onclick="event.stopPropagation()" onchange="setPianoScelta('+s.numero+','+pick.idx+',this.value)" title="'+esc(PIANO_SCELTA_LABELS[pick.idx])+'">' + playerOptionsForSlot(s.numero, pick.idx, pick.pid) + '</select>' +
        '</div>';
      }).join('');
      inner = '<div class="piano-pitch-card-head">' +
          '<span class="piano-pitch-role">'+esc(s.ruolo)+'</span>' +
          (best ? starRatingHTML(best.valutazione, 10) : '') +
        '</div>' + rowsHtml;
    } else {
      const compactRows = picks.map(function(pick){
        const label = pick.p ? esc(pianoDisplayName(pick.p, surnameCounts)) : '<span class="piano-pitch-empty">—</span>';
        return '<div class="piano-pitch-compact-row piano-pitch-compact-row-'+pick.idx+'">' +
          '<span class="piano-pitch-tier">'+(pick.idx+1)+'</span>' + label +
        '</div>';
      }).join('');
      inner = '<div class="piano-pitch-card-head">' +
          '<span class="piano-pitch-role">'+esc(s.ruolo)+'</span>' +
          (best ? starRatingHTML(best.valutazione, 10) : '') +
        '</div>' + compactRows;
    }
    return '<div class="piano-pitch-card' + (expanded?' piano-pitch-card-expanded':'') + '" data-numero="'+s.numero+'" style="left:'+leftPct+'%; top:'+topPct+'%;" onclick="togglePianoCardExpand('+s.numero+', event)">' +
      inner +
    '</div>';
  }).join('');
  return '<div class="piano-pitch-wrap">' +
    '<svg viewBox="0 0 105 68" class="piano-pitch-svg"><g transform="translate(105,0) rotate(90)">' + pitchMarkingsSVG() + '</g></svg>' +
    '<div class="piano-pitch-cards">' + cardsHtml + '</div>' +
  '</div>';
}
function togglePianoCardExpand(numero, evt){
  if(evt) evt.stopPropagation();
  state.pianoExpandedSlot = (state.pianoExpandedSlot===numero) ? null : numero;
  renderView();
}
let pianoDocClickHandler = null;
function attachPianoSquadraInteractions(){
  if(pianoDocClickHandler) document.removeEventListener('click', pianoDocClickHandler);
  pianoDocClickHandler = function(e){
    if(state.currentView==='pianoSquadra' && state.pianoExpandedSlot!=null && !e.target.closest('.piano-pitch-card')){
      state.pianoExpandedSlot = null;
      renderView();
    }
  };
  document.addEventListener('click', pianoDocClickHandler);
}
function renderPianoSquadraView(){
  const def = state.formazioneDefault || { modulo:'', slots:[], chips:[] };
  if(!def.modulo || !(def.slots||[]).length){
    return '' +
    '<div class="card">' +
      '<h2>Piano Squadra</h2>' +
      '<p class="hint">Imposta prima una formazione predefinita nella pagina Rosa (scegli un modulo e posiziona i titolari): il Piano Squadra userà lo stesso modulo e le stesse posizioni per organizzare le scelte per ruolo.</p>' +
    '</div>';
  }
  return '' +
  '<div class="card" id="piano-squadra-pitch-card">' +
    '<div class="card-header-row"><h2>Piano Squadra</h2>' +
      '<div class="pitch-actions"><button class="btn btn-small" onclick="exportPageImage(\'piano-squadra\')">Esporta immagine</button></div>' +
    '</div>' +
    '<p class="hint">Modulo <strong>' + esc(def.modulo) + '</strong>, ereditato dalla formazione predefinita in Rosa. Su ogni posizione scegli direttamente dal campo la 1ª, 2ª e 3ª scelta: se più posizioni condividono lo stesso ruolo, condividono anche le stesse scelte.</p>' +
    renderPianoSquadraPitch(def) +
  '</div>';
}

/* ---------- gestione PARTITE (creazione/apertura/eliminazione dal calendario) ---------- */
function deleteMatch(id){
  const m = getMatch(id);
  showConfirmModal('Eliminare la partita vs ' + (m?m.avversario:'') + ' e tutti i suoi dati?', function(){
    state.matches = state.matches.filter(mm=>mm.id!==id);
    saveMatches();
    renderView();
  });
}
function openMatch(id){
  const match = getMatch(id);
  if(match && computeMatchStato(match)==='Programmata' && syncMatchFormationWithDefault(match)){
    saveMatches();
  }
  state.currentView = 'match';
  state.currentMatchId = id;
  state.currentMatchTab = 'convocazione';
  renderView();
}
function backToCalendario(){
  state.currentView = 'calendario';
  state.currentMatchId = null;
  state.currentAllenamentoId = null;
  renderView();
}
function updateMatchField(id, field, value){
  const match = getMatch(id);
  match[field] = value;
  saveMatches();
  if(state.currentView==='match'){ renderView(); }
  else { renderView(); }
}

/* ---------- vista MATCH (shell + tabs) ---------- */
function renderMatchView(){
  const match = getMatch(state.currentMatchId);
  if(!match){ state.currentView='calendario'; return renderCalendarioView(); }
  const tabs = [['convocazione','Formazione'],['avversari','Avversari'],['tabellino','Tabellino'],['valutazioni','Valutazioni']];
  const gf = (match.golFatti||[]).length, gs = (match.golSubiti||[]).length;
  const stato = computeMatchStato(match);
  return '' +
  '<div class="match-header">' +
    '<button class="btn-link" onclick="backToCalendario()">← Calendario</button>' +
    '<div class="match-header-main">' +
      '<h2>vs ' + esc(match.avversario) + '</h2>' +
      '<div class="match-header-fields">' +
        '<input type="date" value="' + esc(match.data) + '" onchange="updateMatchField(\'' + match.id + '\',\'data\',this.value)">' +
        '<input type="time" value="' + esc(match.ora||'') + '" onchange="updateMatchField(\'' + match.id + '\',\'ora\',this.value)">' +
        '<select onchange="updateMatchField(\'' + match.id + '\',\'sede\',this.value)">' +
          '<option value="Casa" ' + (match.sede==='Casa'?'selected':'') + '>Casa</option>' +
          '<option value="Trasferta" ' + (match.sede==='Trasferta'?'selected':'') + '>Trasferta</option>' +
        '</select>' +
        '<select onchange="updateMatchField(\'' + match.id + '\',\'tipo\',this.value)">' +
          '<option value="Campionato" ' + (match.tipo!=='Amichevole'?'selected':'') + '>Campionato</option>' +
          '<option value="Amichevole" ' + (match.tipo==='Amichevole'?'selected':'') + '>Amichevole</option>' +
        '</select>' +
        '<span class="pill pill-muted">' + stato + '</span>' +
        '<span class="score-badge">' + gf + ' - ' + gs + '</span>' +
        '<button class="btn btn-small" onclick="exportMatchPDF(\'' + match.id + '\')">PDF</button>' +
        '<button class="btn btn-small" onclick="exportMatchXLSX(\'' + match.id + '\')">XLSX</button>' +
        '<button class="btn btn-small" onclick="exportPageImage(\'partita-' + match.id + '\')">Esporta immagine</button>' +
        '<button class="btn btn-small btn-danger" onclick="deleteMatch(\'' + match.id + '\')">Elimina</button>' +
      '</div>' +
    '</div>' +
  '</div>' +
  '<div class="tabs">' + tabs.map(([key,label]) =>
    '<button class="tab ' + (state.currentMatchTab===key?'tab-active':'') + '" onclick="switchMatchTab(\'' + key + '\')">' + label + '</button>'
  ).join('') + '</div>' +
  '<div id="match-tab-content"></div>';
}
function switchMatchTab(key){
  state.currentMatchTab = key;
  document.getElementById('view-content').innerHTML = renderMatchView();
  renderMatchTab();
}
function renderMatchTab(){
  const holder = document.getElementById('match-tab-content');
  if(!holder) return;
  const match = getMatch(state.currentMatchId);
  if(!match) return;
  const prevScrollEl = holder.querySelector('.roster-side-list');
  const prevScrollTop = prevScrollEl ? prevScrollEl.scrollTop : null;
  if(state.currentMatchTab==='convocazione'){
    holder.innerHTML = renderConvocazioneTab(match);
    attachNostraPitchInteractions(match.id);
    attachNostraBenchDrag(match.id);
  } else if(state.currentMatchTab==='avversari'){
    holder.innerHTML = renderAvversariTab(match);
    attachAvversariaPitchInteractions(match.id);
    attachAvversariaBenchDrag(match.id);
  } else if(state.currentMatchTab==='tabellino'){
    holder.innerHTML = renderTabellinoTab(match);
  } else if(state.currentMatchTab==='valutazioni'){
    holder.innerHTML = renderValutazioniTab(match);
  }
  if(prevScrollTop!=null){
    const newScrollEl = holder.querySelector('.roster-side-list');
    if(newScrollEl) newScrollEl.scrollTop = prevScrollTop;
  }
}

/* ---------- tab CONVOCAZIONE + FORMAZIONE NOSTRA ---------- */
function renderConvocazioneTab(match){
  const max = maxConvocati(match);
  const formationOptions = '<option value="">Scegli modulo…</option>' + FORMATION_KEYS.map(k=>'<option value="'+k+'" '+(match.formazioneNostra.modulo===k?'selected':'')+'>'+k+'</option>').join('');
  return '' +
  '<div class="card">' +
    '<div class="card-header-row"><h2>Formazione</h2><span class="hint">' + match.convocati.length + ' / ' + max + ' (' + (match.tipo==='Amichevole'?'amichevole':'campionato') + ')</span></div>' +
    '<div class="form-row">' +
      '<div class="field"><label>Modulo</label><select onchange="if(this.value) applyFormationNostra(\''+match.id+'\',this.value)">'+formationOptions+'</select></div>' +
      '<button class="btn ' + (state.drawMode.nostra?'btn-active':'') + '" onclick="toggleDrawMode(\'nostra\')">' + (state.drawMode.nostra?'Termina disegno':'Disegna movimenti') + '</button>' +
      '<button class="btn" onclick="clearArrows(\''+match.id+'\',\'nostra\')">Cancella frecce</button>' +
      '<button class="btn btn-small" onclick="exportConvocatiPDF(\''+match.id+'\')">Esporta convocati</button>' +
    '</div>' +
    '<p class="hint">Clic su un nome in rosa per convocarlo: il 1° selezionato va in campo, poi il 2°, e così via fino a riempire gli 11 e la panchina. Tasto destro su un nome per scegliere direttamente la posizione/numero. Puoi anche trascinare dalla panchina, o un giocatore già in campo per riposizionarlo o toglierlo.</p>' +
    '<div class="tactic-layout">' +
      '<div>' +
        '<div class="pitch-wrap">' + renderNostraPitchSVG(match) + '</div>' +
        '<h3>Panchina</h3>' + benchNostraHTML(match) +
      '</div>' +
      '<div>' +
        '<h3>Rosa</h3>' +
        renderRosterSideList(match) +
      '</div>' +
    '</div>' +
    '<div class="field" style="margin-top:14px;"><label>Piano partita</label><textarea rows="4" onchange="updateAvvNote(\''+match.id+'\',\'notePiano\',this.value)">'+esc(match.formazioneAvversaria.notePiano)+'</textarea></div>' +
  '</div>';
}
function renderRosterSideList(match){
  const players = state.players.slice().sort((a,b)=>{
    const na = match.numeriGara[a.id];
    const nb = match.numeriGara[b.id];
    if(na && nb) return na - nb;
    if(na && !nb) return -1;
    if(!na && nb) return 1;
    const ra = ROLE_ORDER[a.ruolo]!=null ? ROLE_ORDER[a.ruolo] : 99;
    const rb = ROLE_ORDER[b.ruolo]!=null ? ROLE_ORDER[b.ruolo] : 99;
    if(ra!==rb) return ra-rb;
    return a.nome.localeCompare(b.nome);
  });
  if(players.length===0) return '<p class="hint">Nessun giocatore in rosa.</p>';
  const starterIds = new Set((match.formazioneNostra.chips||[]).map(c=>c.playerId));
  return '<div class="roster-side-list">' + players.map(p=>{
    const on = match.convocati.includes(p.id);
    const isStarter = starterIds.has(p.id);
    const num = numGara(match,p.id);
    const dotClass = isStarter ? 'dot-on' : (on ? 'dot-reserve' : 'dot-off');
    return '<div class="roster-side-row ' + (isStarter?'roster-side-on':'') + '" ' +
      'onclick="toggleConvocato(\''+match.id+'\',\''+p.id+'\')" ' +
      'oncontextmenu="showPlayerContextMenu(event,\''+match.id+'\',\''+p.id+'\')">' +
      '<span class="roster-side-num">' + (on?esc(num):'') + '</span>' +
      '<span class="roster-side-name">' + esc(displayName(p.nome)) + '</span>' +
      '<span class="roster-side-role">' + esc(p.ruolo) + '</span>' +
      '<span class="roster-side-dot ' + dotClass + '"></span>' +
    '</div>';
  }).join('') + '</div>';
}
function showPlayerContextMenu(evt, matchId, playerId){
  evt.preventDefault();
  evt.stopPropagation();
  let match = getMatch(matchId);
  if(!match.convocati.includes(playerId)){
    const max = maxConvocati(match);
    if(match.convocati.length >= max){ alert('Massimo ' + max + ' convocati per questa partita.'); return; }
    match.convocati.push(playerId);
    autoDistributeFromConvocati(match);
    recomputeNumeriGara(match);
    saveMatches();
    renderMatchTab();
    match = getMatch(matchId);
  }
  const slots = match.formazioneNostra.slots || [];
  const menu = document.getElementById('player-context-menu');
  let html = '';
  if(slots.length === 0){
    html = '<div class="context-menu-item" style="color:var(--text-dim);">Scegli prima un modulo</div>';
  } else {
    const occupiedBy = {};
    match.formazioneNostra.chips.forEach(c=>{ occupiedBy[c.numero] = c.playerId; });
    slots.slice().sort((a,b)=>a.numero-b.numero).forEach(s=>{
      const occId = occupiedBy[s.numero];
      const occPlayer = (occId && occId!==playerId) ? state.players.find(p=>p.id===occId) : null;
      const label = 'N. ' + s.numero + ' — ' + s.ruolo + (occPlayer ? ' (' + displayName(occPlayer.nome) + ')' : '');
      html += '<div class="context-menu-item" onclick="assignPlayerToSlot(\''+matchId+'\',\''+playerId+'\','+s.numero+'); hideContextMenu();">'+esc(label)+'</div>';
    });
    html += '<div class="context-menu-item" onclick="moveToBench(\''+matchId+'\',\''+playerId+'\'); hideContextMenu();">Panchina</div>';
  }
  menu.innerHTML = html;
  const x = Math.min(evt.clientX, window.innerWidth-190);
  const y = Math.min(evt.clientY, window.innerHeight-220);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
function hideContextMenu(){
  const m = document.getElementById('player-context-menu');
  if(m) m.style.display = 'none';
}
function moveToBench(matchId, playerId){
  const match = getMatch(matchId);
  match.formazioneNostra.chips = match.formazioneNostra.chips.filter(c=>c.playerId!==playerId);
  recomputeNumeriGara(match);
  saveMatches();
  renderMatchTab();
}
function toggleConvocato(matchId, playerId){
  const match = getMatch(matchId);
  if(match.convocati.includes(playerId)){
    match.convocati = match.convocati.filter(id=>id!==playerId);
    delete match.valutazioni.nostriGiocatori[playerId];
    delete match.statistiche[playerId];
  } else {
    const max = maxConvocati(match);
    if(match.convocati.length >= max){
      alert('Massimo ' + max + ' convocati per questa partita.');
      return;
    }
    match.convocati.push(playerId);
  }
  autoDistributeFromConvocati(match);
  recomputeNumeriGara(match);
  saveMatches();
  renderMatchTab();
}
function exportConvocatiPDF(matchId){
  const match = getMatch(matchId);
  const convocati = match.convocati.map(id=>state.players.find(p=>p.id===id)).filter(Boolean).sort((a,b)=>a.nome.localeCompare(b.nome));
  const html = '<table class="print-table"><thead><tr><th>#</th><th>Nome</th></tr></thead><tbody>' +
    convocati.map((p,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(displayName(p.nome))+'</td></tr>').join('') +
  '</tbody></table>';
  exportPDF('Convocati vs ' + match.avversario, html);
}

/* ---------- lavagne: campo, sagome, frecce ---------- */
function pitchMarkingsSVG(){
  let bands = '';
  const n = 8, bandH = 103/n;
  for(let i=0;i<n;i++){
    const y = 1 + i*bandH;
    const fill = i%2===0 ? '#1E5631' : '#215C34';
    bands += '<rect x="1" y="' + y.toFixed(2) + '" width="66" height="' + bandH.toFixed(2) + '" fill="' + fill + '"/>';
  }
  return bands +
    '<rect x="1" y="1" width="66" height="103" fill="none" stroke="#F4F1EA" stroke-width="0.4"/>' +
    '<line x1="1" y1="52.5" x2="67" y2="52.5" stroke="#F4F1EA" stroke-width="0.4"/>' +
    '<circle cx="34" cy="52.5" r="9.15" fill="none" stroke="#F4F1EA" stroke-width="0.4"/>' +
    '<circle cx="34" cy="52.5" r="0.35" fill="#F4F1EA"/>' +
    '<rect x="13.84" y="1" width="40.32" height="16.5" fill="none" stroke="#F4F1EA" stroke-width="0.4"/>' +
    '<rect x="24.84" y="1" width="18.32" height="5.5" fill="none" stroke="#F4F1EA" stroke-width="0.4"/>' +
    '<circle cx="34" cy="12.5" r="0.35" fill="#F4F1EA"/>' +
    '<path d="M 25.5 17.5 A 9.15 9.15 0 0 0 42.5 17.5" fill="none" stroke="#F4F1EA" stroke-width="0.4"/>' +
    '<rect x="13.84" y="87.5" width="40.32" height="16.5" fill="none" stroke="#F4F1EA" stroke-width="0.4"/>' +
    '<rect x="24.84" y="98.5" width="18.32" height="5.5" fill="none" stroke="#F4F1EA" stroke-width="0.4"/>' +
    '<circle cx="34" cy="92.5" r="0.35" fill="#F4F1EA"/>' +
    '<path d="M 25.5 87.5 A 9.15 9.15 0 0 1 42.5 87.5" fill="none" stroke="#F4F1EA" stroke-width="0.4"/>';
}
function arrowSVG(a, side){
  const marker = side==='nostra' ? 'arrowhead-nostra' : (side==='default' ? 'arrowhead-default' : 'arrowhead-avversaria');
  const color = side==='avversaria' ? '#E0A458' : '#4FA8E0';
  return '<line x1="' + a.x1 + '" y1="' + a.y1 + '" x2="' + a.x2 + '" y2="' + a.y2 + '" stroke="' + color + '" stroke-width="0.5" marker-end="url(#' + marker + ')"/>';
}
function slotToXY(slot, side){
  const xReal = 1 + slot.x*66;
  const yReal = side==='nostra' ? (10 + slot.y*87) : (8 + (1-slot.y)*87);
  return { x: xReal, y: yReal };
}
function renderNostraPitchSVG(match){
  const slots = match.formazioneNostra.slots || [];
  const chips = match.formazioneNostra.chips || [];
  const filled = new Set(chips.map(c=>c.numero));
  const emptySvg = slots.filter(s=>!filled.has(s.numero)).map(s=>
    '<g><circle cx="'+s.x+'" cy="'+s.y+'" r="2.6" fill="none" stroke="#4FA8E0" stroke-width="0.3" stroke-dasharray="1,0.8" opacity="0.55"/>' +
    '<text x="'+s.x+'" y="'+(s.y+0.9)+'" text-anchor="middle" font-size="2.4" fill="#4FA8E0" opacity="0.75" font-family="Oswald, sans-serif">'+s.numero+'</text></g>'
  ).join('');
  const chipsSvg = chips.map(c=>{
    const p = state.players.find(pl=>pl.id===c.playerId);
    const cognome = p ? surnameOf(p.nome) : '';
    return '<g class="chip" data-side="nostra" data-id="'+c.playerId+'" transform="translate('+c.x+','+c.y+')">' +
      '<circle r="2.6" fill="#0E2233" stroke="#4FA8E0" stroke-width="0.35"/>' +
      '<text text-anchor="middle" dy="0.9" font-size="2.6" fill="#F4F1EA" font-family="Oswald, sans-serif">'+esc(c.numero)+'</text>' +
      '<text text-anchor="middle" dy="4.3" font-size="1.7" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="0.35">'+esc(cognome)+'</text>' +
    '</g>';
  }).join('');
  const arrowsSvg = (match.formazioneNostra.arrows||[]).map(a=>arrowSVG(a,'nostra')).join('');
  return '<svg id="pitch-nostra-'+match.id+'" viewBox="0 0 68 105" class="pitch-svg">' +
    '<defs><marker id="arrowhead-nostra" markerWidth="3" markerHeight="3" refX="2.4" refY="1.5" orient="auto"><path d="M0,0 L3,1.5 L0,3 Z" fill="#4FA8E0"/></marker></defs>' +
    pitchMarkingsSVG() +
    '<g class="arrows-layer">'+arrowsSvg+'</g>' +
    '<g class="slots-layer">'+emptySvg+'</g>' +
    '<g class="chips-layer">'+chipsSvg+'</g>' +
  '</svg>';
}
function renderAvversariaPitchSVG(match){
  const chipsSvg = match.formazioneAvversaria.chips.map(c=>
    '<g class="chip" data-side="avversaria" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+')">' +
      '<circle r="2.6" fill="#2A1B10" stroke="#E0A458" stroke-width="0.35"/>' +
      '<text text-anchor="middle" dy="0.9" font-size="2.6" fill="#F4F1EA" font-family="Oswald, sans-serif">'+esc(c.numero)+'</text>' +
      (c.label ? '<text text-anchor="middle" dy="4.3" font-size="1.7" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="0.35">'+esc(c.label)+'</text>' : '') +
    '</g>'
  ).join('');
  const arrowsSvg = (match.formazioneAvversaria.arrows||[]).map(a=>arrowSVG(a,'avversaria')).join('');
  return '<svg id="pitch-avversaria-'+match.id+'" viewBox="0 0 68 105" class="pitch-svg">' +
    '<defs><marker id="arrowhead-avversaria" markerWidth="3" markerHeight="3" refX="2.4" refY="1.5" orient="auto"><path d="M0,0 L3,1.5 L0,3 Z" fill="#E0A458"/></marker></defs>' +
    pitchMarkingsSVG() +
    '<g class="arrows-layer">'+arrowsSvg+'</g>' +
    '<g class="chips-layer">'+chipsSvg+'</g>' +
  '</svg>';
}
function applyFormationNostra(matchId, moduloKey){
  const match = getMatch(matchId);
  const template = FORMATIONS[moduloKey];
  if(!template) return;
  match.formazioneNostra.modulo = moduloKey;
  match.formazioneNostra.slots = template.map(slot=>{
    const xy = slotToXY(slot,'nostra');
    return { numero: slot.numero, ruolo: slot.ruolo, x: xy.x, y: xy.y };
  });
  autoDistributeFromConvocati(match);
  recomputeNumeriGara(match);
  saveMatches();
  syncDefaultModulo(moduloKey);
  renderMatchTab();
}
function syncDefaultModulo(moduloKey){
  if(!state.formazioneDefault) state.formazioneDefault = { modulo:'', slots:[], chips:[] };
  if(state.formazioneDefault.modulo === moduloKey) return;
  const template = FORMATIONS[moduloKey];
  if(!template) return;
  const newSlots = template.map(slot=>{
    const xy = slotToXY(slot,'nostra');
    return { numero: slot.numero, ruolo: slot.ruolo, x: xy.x, y: xy.y };
  });
  const validNumeri = new Set(newSlots.map(s=>s.numero));
  const oldChips = state.formazioneDefault.chips || [];
  state.formazioneDefault.modulo = moduloKey;
  state.formazioneDefault.slots = newSlots;
  state.formazioneDefault.chips = oldChips.filter(c=>validNumeri.has(c.numero)).map(c=>{
    const slot = newSlots.find(s=>s.numero===c.numero);
    return { playerId: c.playerId, numero: c.numero, x: slot.x, y: slot.y };
  });
  saveFormazioneDefault();
}
function applyFormationAvversaria(matchId, moduloKey){
  const match = getMatch(matchId);
  const template = FORMATIONS[moduloKey];
  if(!template) return;
  match.formazioneAvversaria.modulo = moduloKey;
  match.formazioneAvversaria.chips = template.map(slot=>{
    const xy = slotToXY(slot,'avversaria');
    return { id: uid(), numero: slot.numero, label:'', x: xy.x, y: xy.y };
  });
  saveMatches();
  renderMatchTab();
}
function assignPlayerToSlot(matchId, playerId, slotNumero){
  const match = getMatch(matchId);
  const slot = (match.formazioneNostra.slots||[]).find(s=>s.numero===slotNumero);
  if(!slot) return;
  match.formazioneNostra.chips = match.formazioneNostra.chips.filter(c=>c.playerId!==playerId && c.numero!==slotNumero);
  match.formazioneNostra.chips.push({ playerId, numero: slotNumero, x: slot.x, y: slot.y });
  recomputeNumeriGara(match);
  saveMatches();
  renderMatchTab();
}
function nearestSlotNumero(match, x, y){
  let best = null, bestDist = Infinity;
  (match.formazioneNostra.slots||[]).forEach(s=>{
    const d = Math.hypot(s.x-x, s.y-y);
    if(d<bestDist){ bestDist=d; best=s.numero; }
  });
  return best;
}
function benchNostraHTML(match){
  const assignedIds = new Set(match.formazioneNostra.chips.map(c=>c.playerId));
  const benchIds = match.convocati.filter(id=>!assignedIds.has(id));
  if(match.convocati.length===0) return '<p class="hint">Nessun convocato: usa la lista rosa qui a fianco.</p>';
  if(benchIds.length===0) return '<p class="hint">Tutti i convocati sono schierati.</p>';
  return '<div class="bench">' + benchIds.map(id=>{
    const p = state.players.find(pl=>pl.id===id);
    if(!p) return '';
    return '<button class="bench-chip" data-player-id="'+p.id+'"><span class="bench-num">'+esc(numGara(match,p.id))+'</span><span class="bench-name">'+esc(displayName(p.nome))+'</span></button>';
  }).join('') + '</div>';
}
function nostraLegendHTML(match){
  const sorted = match.formazioneNostra.chips.slice().sort((a,b)=>a.numero-b.numero);
  return '<div class="legend">' + sorted.map(c=>{
    const p = state.players.find(pl=>pl.id===c.playerId);
    return '<div class="legend-row"><span class="legend-num">'+c.numero+'</span><span>'+esc(p?displayName(p.nome):'—')+'</span></div>';
  }).join('') + '</div>';
}
function benchAvversariaHTML(match){
  const placedNums = match.formazioneAvversaria.chips.map(c=>c.numero);
  const benchNums = [];
  for(let n=1;n<=12;n++){ if(!placedNums.includes(n)) benchNums.push(n); }
  if(benchNums.length===0) return '<p class="hint">Tutti i numeri sono schierati.</p>';
  return '<div class="bench">' + benchNums.map(n=>
    '<button class="bench-chip" data-numero="' + n + '"><span class="bench-num">' + n + '</span></button>'
  ).join('') + '</div>';
}
function avversariaLegendHTML(match){
  if(match.formazioneAvversaria.chips.length===0) return '';
  return '<div class="legend">' + match.formazioneAvversaria.chips.map(c=>
    '<div class="legend-row"><span class="legend-num">' + c.numero + '</span>' +
    '<input type="text" placeholder="Nome o caratteristica" value="' + esc(c.label) + '" onchange="updateAvvLabel(\'' + match.id + '\',\'' + c.id + '\',this.value)">' +
    '<button class="btn-icon" onclick="removeAvvChip(\'' + match.id + '\',\'' + c.id + '\')" aria-label="Rimuovi">×</button></div>'
  ).join('') + '</div>';
}
function updateAvvLabel(matchId, chipId, val){
  const match = getMatch(matchId);
  const c = match.formazioneAvversaria.chips.find(c=>c.id===chipId);
  if(c) c.label = val;
  saveMatches();
}
function removeAvvChip(matchId, chipId){
  const match = getMatch(matchId);
  match.formazioneAvversaria.chips = match.formazioneAvversaria.chips.filter(c=>c.id!==chipId);
  saveMatches();
  renderMatchTab();
}
function updateAvvNote(matchId, field, value){
  const match = getMatch(matchId);
  match.formazioneAvversaria[field] = value;
  saveMatches();
}
function toggleDrawMode(side){
  const turningOn = !state.drawMode[side];
  state.drawMode.nostra = false;
  state.drawMode.avversaria = false;
  state.drawMode[side] = turningOn;
  renderMatchTab();
}
function clearArrows(matchId, side){
  const match = getMatch(matchId);
  if(side==='nostra') match.formazioneNostra.arrows = []; else match.formazioneAvversaria.arrows = [];
  saveMatches();
  renderMatchTab();
}
function placeChipAvversariaAt(matchId, numero, x, y){
  const match = getMatch(matchId);
  if(match.formazioneAvversaria.chips.length>=11){
    alert('Massimo 11 giocatori in campo.');
    return;
  }
  match.formazioneAvversaria.chips.push({ id: uid(), numero, label:'', x: Math.min(66,Math.max(2,x)), y: Math.min(104,Math.max(2,y)) });
  saveMatches();
  renderMatchTab();
}
function wireDragGeneric(btn, svg, onDrop){
  btn.addEventListener('pointerdown', function(e){
    e.preventDefault();
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.textContent = btn.textContent.trim();
    document.body.appendChild(ghost);
    ghost.style.left = e.clientX + 'px';
    ghost.style.top = e.clientY + 'px';
    try{ btn.setPointerCapture(e.pointerId); }catch(err){}
    function onMove(e2){
      ghost.style.left = e2.clientX + 'px';
      ghost.style.top = e2.clientY + 'px';
    }
    function onUp(e2){
      try{ btn.releasePointerCapture(e.pointerId); }catch(err){}
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      ghost.remove();
      const rect = svg.getBoundingClientRect();
      if(e2.clientX>=rect.left && e2.clientX<=rect.right && e2.clientY>=rect.top && e2.clientY<=rect.bottom){
        const pt = svg.createSVGPoint();
        pt.x = e2.clientX; pt.y = e2.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        onDrop(p.x, p.y);
      }
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
}
function attachNostraBenchDrag(matchId){
  const svg = document.getElementById('pitch-nostra-' + matchId);
  if(!svg) return;
  document.querySelectorAll('.bench-chip[data-player-id]').forEach(btn=>{
    const playerId = btn.getAttribute('data-player-id');
    wireDragGeneric(btn, svg, function(x,y){
      const match = getMatch(matchId);
      const slotNum = nearestSlotNumero(match, x, y);
      if(slotNum!=null) assignPlayerToSlot(matchId, playerId, slotNum);
      else alert('Scegli prima un modulo per la formazione nostra.');
    });
  });
}
function attachAvversariaBenchDrag(matchId){
  const svg = document.getElementById('pitch-avversaria-' + matchId);
  if(!svg) return;
  document.querySelectorAll('.bench-chip[data-numero]').forEach(btn=>{
    const numero = parseInt(btn.getAttribute('data-numero'),10);
    wireDragGeneric(btn, svg, function(x,y){ placeChipAvversariaAt(matchId, numero, x, y); });
  });
}
function attachNostraPitchInteractions(matchId){
  const svg = document.getElementById('pitch-nostra-' + matchId);
  if(!svg) return;
  const match = getMatch(matchId);
  function toPoint(evt){
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  svg.querySelectorAll('.chip').forEach(chipEl=>{
    chipEl.style.cursor = 'grab';
    chipEl.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      chipEl.setPointerCapture(e.pointerId);
      const startPt = toPoint(e);
      let moved = false;
      const id = chipEl.getAttribute('data-id');
      const chipData = match.formazioneNostra.chips.find(c=>c.playerId===id);
      if(!chipData) return;
      function onMove(e2){
        const p = toPoint(e2);
        if(Math.abs(p.x-startPt.x) > 0.5 || Math.abs(p.y-startPt.y) > 0.5) moved = true;
        chipData.x = Math.min(66, Math.max(2, p.x));
        chipData.y = Math.min(104, Math.max(2, p.y));
        chipEl.setAttribute('transform', 'translate(' + chipData.x + ',' + chipData.y + ')');
      }
      function onUp(e2){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        try{ chipEl.releasePointerCapture(e.pointerId); }catch(err){}
        if(!moved){
          match.formazioneNostra.chips = match.formazioneNostra.chips.filter(c=>c.playerId!==id);
          recomputeNumeriGara(match);
        }
        saveMatches();
        renderMatchTab();
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  });
  if(state.drawMode.nostra){
    svg.addEventListener('pointerdown', function(e){
      if(e.target.closest('.chip')) return;
      const start = toPoint(e);
      const tempLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      tempLine.setAttribute('x1', start.x); tempLine.setAttribute('y1', start.y);
      tempLine.setAttribute('x2', start.x); tempLine.setAttribute('y2', start.y);
      tempLine.setAttribute('stroke', '#4FA8E0'); tempLine.setAttribute('stroke-width', '0.5');
      svg.querySelector('.arrows-layer').appendChild(tempLine);
      function onMove(e2){ const p=toPoint(e2); tempLine.setAttribute('x2',p.x); tempLine.setAttribute('y2',p.y); }
      function onUp(e2){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        const p = toPoint(e2);
        if(Math.hypot(p.x-start.x, p.y-start.y) > 1.5){
          match.formazioneNostra.arrows.push({ x1:start.x, y1:start.y, x2:p.x, y2:p.y });
          saveMatches();
          renderMatchTab();
        } else { tempLine.remove(); }
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  }
}
function attachAvversariaPitchInteractions(matchId){
  const svg = document.getElementById('pitch-avversaria-' + matchId);
  if(!svg) return;
  const match = getMatch(matchId);
  function toPoint(evt){
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  svg.querySelectorAll('.chip').forEach(chipEl=>{
    chipEl.style.cursor = 'grab';
    chipEl.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      chipEl.setPointerCapture(e.pointerId);
      const startPt = toPoint(e);
      let moved = false;
      const id = chipEl.getAttribute('data-id');
      const chipData = match.formazioneAvversaria.chips.find(c=>c.id===id);
      if(!chipData) return;
      function onMove(e2){
        const p = toPoint(e2);
        if(Math.abs(p.x-startPt.x) > 0.5 || Math.abs(p.y-startPt.y) > 0.5) moved = true;
        chipData.x = Math.min(66, Math.max(2, p.x));
        chipData.y = Math.min(104, Math.max(2, p.y));
        chipEl.setAttribute('transform', 'translate(' + chipData.x + ',' + chipData.y + ')');
      }
      function onUp(e2){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        try{ chipEl.releasePointerCapture(e.pointerId); }catch(err){}
        if(!moved){
          match.formazioneAvversaria.chips = match.formazioneAvversaria.chips.filter(c=>c.id!==id);
        }
        saveMatches();
        renderMatchTab();
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  });
  if(state.drawMode.avversaria){
    svg.addEventListener('pointerdown', function(e){
      if(e.target.closest('.chip')) return;
      const start = toPoint(e);
      const tempLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      tempLine.setAttribute('x1', start.x); tempLine.setAttribute('y1', start.y);
      tempLine.setAttribute('x2', start.x); tempLine.setAttribute('y2', start.y);
      tempLine.setAttribute('stroke', '#E0A458'); tempLine.setAttribute('stroke-width', '0.5');
      svg.querySelector('.arrows-layer').appendChild(tempLine);
      function onMove(e2){ const p=toPoint(e2); tempLine.setAttribute('x2',p.x); tempLine.setAttribute('y2',p.y); }
      function onUp(e2){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        const p = toPoint(e2);
        if(Math.hypot(p.x-start.x, p.y-start.y) > 1.5){
          match.formazioneAvversaria.arrows.push({ x1:start.x, y1:start.y, x2:p.x, y2:p.y });
          saveMatches();
          renderMatchTab();
        } else { tempLine.remove(); }
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  }
}

/* ---------- formazione predefinita (pagina Rosa) ---------- */
function renderDefaultPitchSVG(){
  const slots = state.formazioneDefault.slots || [];
  const chips = state.formazioneDefault.chips || [];
  const filled = new Set(chips.map(c=>c.numero));
  const emptySvg = slots.filter(s=>!filled.has(s.numero)).map(s=>
    '<g><circle cx="'+s.x+'" cy="'+s.y+'" r="2.6" fill="none" stroke="#4FA8E0" stroke-width="0.3" stroke-dasharray="1,0.8" opacity="0.55"/>' +
    '<text x="'+s.x+'" y="'+(s.y+0.9)+'" text-anchor="middle" font-size="2.4" fill="#4FA8E0" opacity="0.75" font-family="Oswald, sans-serif">'+s.numero+'</text></g>'
  ).join('');
  const chipsSvg = chips.map(c=>{
    const p = state.players.find(pl=>pl.id===c.playerId);
    const cognome = p ? surnameOf(p.nome) : '';
    return '<g class="chip" data-id="'+c.playerId+'" transform="translate('+c.x+','+c.y+')">' +
      '<circle r="2.6" fill="#0E2233" stroke="#4FA8E0" stroke-width="0.35"/>' +
      '<text text-anchor="middle" dy="0.9" font-size="2.6" fill="#F4F1EA" font-family="Oswald, sans-serif">'+esc(c.numero)+'</text>' +
      '<text text-anchor="middle" dy="4.3" font-size="1.7" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="0.35">'+esc(cognome)+'</text>' +
    '</g>';
  }).join('');
  const arrowsSvg = (state.formazioneDefault.arrows||[]).map(a=>arrowSVG(a,'default')).join('');
  return '<svg id="pitch-default" viewBox="0 0 68 105" class="pitch-svg">' +
    '<defs><marker id="arrowhead-default" markerWidth="3" markerHeight="3" refX="2.4" refY="1.5" orient="auto"><path d="M0,0 L3,1.5 L0,3 Z" fill="#4FA8E0"/></marker></defs>' +
    pitchMarkingsSVG() +
    '<g class="arrows-layer">'+arrowsSvg+'</g>' +
    '<g class="slots-layer">'+emptySvg+'</g>' +
    '<g class="chips-layer">'+chipsSvg+'</g>' +
  '</svg>';
}
const MAX_SQUAD_SELECTION = 24;
function applyDefaultFormationModulo(moduloKey){
  const template = FORMATIONS[moduloKey];
  if(!template) return;
  state.formazioneDefault.modulo = moduloKey;
  state.formazioneDefault.slots = template.map(slot=>{
    const xy = slotToXY(slot,'nostra');
    return { numero: slot.numero, ruolo: slot.ruolo, x: xy.x, y: xy.y };
  });
  state.formazioneDefault.chips = [];
  if(!state.formazioneDefault.riserve) state.formazioneDefault.riserve = [];
  saveFormazioneDefault();
  renderView();
}
function clearDefaultFormation(){
  showConfirmModal('Svuotare la formazione predefinita?', function(){
    state.formazioneDefault = { modulo:'', slots:[], chips:[], riserve:[], arrows:[] };
    saveFormazioneDefault();
    renderView();
  }, 'Svuota');
}
function totalDefaultSelectionCount(){
  return (state.formazioneDefault.chips||[]).length + (state.formazioneDefault.riserve||[]).length;
}
function isDefaultSelected(playerId){
  return (state.formazioneDefault.chips||[]).some(c=>c.playerId===playerId) || (state.formazioneDefault.riserve||[]).includes(playerId);
}
function assignDefaultPlayerToSlot(playerId, slotNumero){
  const slot = (state.formazioneDefault.slots||[]).find(s=>s.numero===slotNumero);
  if(!slot) return;
  if(!isDefaultSelected(playerId) && totalDefaultSelectionCount() >= MAX_SQUAD_SELECTION){
    alert('Hai già selezionato il massimo di ' + MAX_SQUAD_SELECTION + ' giocatori.');
    return;
  }
  state.formazioneDefault.chips = state.formazioneDefault.chips.filter(c=>c.playerId!==playerId && c.numero!==slotNumero);
  state.formazioneDefault.chips.push({ playerId, numero: slotNumero, x: slot.x, y: slot.y });
  state.formazioneDefault.riserve = (state.formazioneDefault.riserve||[]).filter(id=>id!==playerId);
  saveFormazioneDefault();
  renderView();
}
function removeFromDefaultFormation(playerId){
  state.formazioneDefault.chips = (state.formazioneDefault.chips||[]).filter(c=>c.playerId!==playerId);
  state.formazioneDefault.riserve = (state.formazioneDefault.riserve||[]).filter(id=>id!==playerId);
  saveFormazioneDefault();
  renderView();
}
function toggleDefaultFormationSelection(playerId){
  if(!state.formazioneDefault.modulo){ alert('Scegli prima un modulo.'); return; }
  if(isDefaultSelected(playerId)){ removeFromDefaultFormation(playerId); return; }
  if(totalDefaultSelectionCount() >= MAX_SQUAD_SELECTION){
    alert('Hai già selezionato il massimo di ' + MAX_SQUAD_SELECTION + ' giocatori.');
    return;
  }
  const filledNumeri = new Set((state.formazioneDefault.chips||[]).map(c=>c.numero));
  const slot = (state.formazioneDefault.slots||[]).find(s=>!filledNumeri.has(s.numero));
  if(slot){
    assignDefaultPlayerToSlot(playerId, slot.numero);
  } else {
    if(!state.formazioneDefault.riserve) state.formazioneDefault.riserve = [];
    state.formazioneDefault.riserve.push(playerId);
    saveFormazioneDefault();
    renderView();
  }
}
function benchDefaultHTML(){
  const riserve = state.formazioneDefault.riserve || [];
  if(riserve.length===0) return '<p class="hint">Nessuna riserva selezionata. Click (anche destro) su un giocatore in rosa per aggiungerlo.</p>';
  return '<div class="bench">' + riserve.map(id=>{
    const p = state.players.find(pl=>pl.id===id);
    if(!p) return '';
    return '<button class="bench-chip" data-player-id="'+p.id+'"><span class="bench-num">'+esc(p.ruolo)+'</span><span class="bench-name">'+esc(displayName(p.nome))+'</span></button>';
  }).join('') + '</div>';
}
function wireDefaultSelectOrDrag(el, svg, playerId){
  el.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  el.addEventListener('pointerdown', function(e){
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    let moved = false;
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    const p0 = state.players.find(pl=>pl.id===playerId);
    ghost.textContent = p0 ? displayName(p0.nome) : '';
    document.body.appendChild(ghost);
    ghost.style.left = e.clientX + 'px';
    ghost.style.top = e.clientY + 'px';
    try{ el.setPointerCapture(e.pointerId); }catch(err){}
    function onMove(e2){
      if(Math.abs(e2.clientX-startX) > 4 || Math.abs(e2.clientY-startY) > 4) moved = true;
      ghost.style.left = e2.clientX + 'px';
      ghost.style.top = e2.clientY + 'px';
    }
    function onUp(e2){
      try{ el.releasePointerCapture(e.pointerId); }catch(err){}
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      ghost.remove();
      if(moved && svg){
        const rect = svg.getBoundingClientRect();
        if(e2.clientX>=rect.left && e2.clientX<=rect.right && e2.clientY>=rect.top && e2.clientY<=rect.bottom){
          if(!state.formazioneDefault.modulo){ alert('Scegli prima un modulo.'); return; }
          const pt = svg.createSVGPoint();
          pt.x = e2.clientX; pt.y = e2.clientY;
          const p = pt.matrixTransform(svg.getScreenCTM().inverse());
          const slots = state.formazioneDefault.slots || [];
          let best = null, bestDist = Infinity;
          slots.forEach(s=>{ const d = Math.hypot(s.x-p.x, s.y-p.y); if(d<bestDist){ bestDist=d; best=s.numero; } });
          if(best!=null) assignDefaultPlayerToSlot(playerId, best);
          return;
        }
      }
      if(!moved){
        toggleDefaultFormationSelection(playerId);
      }
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
}
function attachDefaultRosterInteractions(){
  const svg = document.getElementById('pitch-default');
  document.querySelectorAll('#default-formation-bench .bench-chip[data-player-id], .default-formation-roster .roster-side-row[data-player-id]').forEach(el=>{
    const playerId = el.getAttribute('data-player-id');
    wireDefaultSelectOrDrag(el, svg, playerId);
  });
}
function attachDefaultPitchInteractions(){
  const svg = document.getElementById('pitch-default');
  if(!svg) return;
  function toPoint(evt){
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  svg.querySelectorAll('.chip').forEach(chipEl=>{
    chipEl.style.cursor = 'grab';
    chipEl.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      chipEl.setPointerCapture(e.pointerId);
      const startPt = toPoint(e);
      let moved = false;
      const id = chipEl.getAttribute('data-id');
      const chipData = state.formazioneDefault.chips.find(c=>c.playerId===id);
      if(!chipData) return;
      function onMove(e2){
        const p = toPoint(e2);
        if(Math.abs(p.x-startPt.x) > 0.5 || Math.abs(p.y-startPt.y) > 0.5) moved = true;
        chipData.x = Math.min(66, Math.max(2, p.x));
        chipData.y = Math.min(104, Math.max(2, p.y));
        chipEl.setAttribute('transform', 'translate(' + chipData.x + ',' + chipData.y + ')');
      }
      function onUp(e2){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        try{ chipEl.releasePointerCapture(e.pointerId); }catch(err){}
        if(!moved){
          state.formazioneDefault.chips = state.formazioneDefault.chips.filter(c=>c.playerId!==id);
        }
        saveFormazioneDefault();
        renderView();
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  });
  if(state.drawMode.formazioneDefault){
    svg.addEventListener('pointerdown', function(e){
      if(e.target.closest('.chip')) return;
      const start = toPoint(e);
      const tempLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      tempLine.setAttribute('x1', start.x); tempLine.setAttribute('y1', start.y);
      tempLine.setAttribute('x2', start.x); tempLine.setAttribute('y2', start.y);
      tempLine.setAttribute('stroke', '#4FA8E0'); tempLine.setAttribute('stroke-width', '0.5');
      svg.querySelector('.arrows-layer').appendChild(tempLine);
      function onMove(e2){ const p=toPoint(e2); tempLine.setAttribute('x2',p.x); tempLine.setAttribute('y2',p.y); }
      function onUp(e2){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        const p = toPoint(e2);
        if(Math.hypot(p.x-start.x, p.y-start.y) > 1.5){
          if(!Array.isArray(state.formazioneDefault.arrows)) state.formazioneDefault.arrows = [];
          state.formazioneDefault.arrows.push({ x1:start.x, y1:start.y, x2:p.x, y2:p.y });
          saveFormazioneDefault();
          renderView();
        } else { tempLine.remove(); }
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  }
}
function toggleDefaultDrawMode(){
  state.drawMode.formazioneDefault = !state.drawMode.formazioneDefault;
  renderView();
}
function clearDefaultArrows(){
  state.formazioneDefault.arrows = [];
  saveFormazioneDefault();
  renderView();
}
function findNextMatch(){
  const today = new Date().toISOString().slice(0,10);
  const upcoming = state.matches.filter(m=>m.data>=today && computeMatchStato(m)==='Programmata');
  upcoming.sort((a,b)=> (a.data+a.ora).localeCompare(b.data+b.ora));
  return upcoming[0] || null;
}
function computeSchemaNotifiche(){
  const oggi = new Date().toISOString().slice(0,10);
  const items = [];
  state.matches.forEach(m=>{
    if(m.data && m.data<=oggi && computeMatchStato(m)==='Programmata'){
      items.push({ type:'match', id:m.id, label:'Manca il tabellino: vs '+(m.avversario||'—')+' del '+formatDate(m.data) });
    }
  });
  (state.schema.sessions||[]).forEach(sess=>{
    if(sess.stato==='eseguita' && !sess.hasNote){
      items.push({ type:'session', id:sess.id, label:'Note mancanti sulla seduta "'+sess.titolo+'"' });
    }
  });
  return items;
}
function openNotifica(type, id){
  state.notificheOpen = false;
  if(type==='match') openMatch(id);
  else if(type==='session') openSchemaSessionBuilder(id);
}
function toggleNotificheBell(){
  state.notificheOpen = !state.notificheOpen;
  renderNextMatchBar();
}
function renderNotificheBell(){
  const items = computeSchemaNotifiche();
  const count = items.length;
  let panel = '';
  if(state.notificheOpen){
    panel = '<div class="notif-panel">' +
      (items.length===0 ? '<p class="hint" style="padding:10px;">Nessun promemoria.</p>' :
        items.map(n=>'<div class="notif-item" onclick="openNotifica(\''+n.type+'\',\''+n.id+'\')">'+esc(n.label)+'</div>').join('')
      ) +
    '</div>';
  }
  return '<div class="notif-bell-wrap">' +
    '<button class="btn btn-small notif-bell-btn" onclick="toggleNotificheBell()" title="Promemoria">🔔' + (count>0?'<span class="notif-badge">'+count+'</span>':'') + '</button>' +
    panel +
  '</div>';
}
async function refreshSchemaNotifiche(){
  if(!getAppUser().schemaUnlocked) return;
  await loadSchemaSessions();
  renderNextMatchBar();
}
function renderNextMatchBar(){
  const bar = document.getElementById('next-match-bar');
  if(!bar) return;
  const nm = findNextMatch();
  const bell = renderNotificheBell();
  if(!nm){
    bar.innerHTML = '<span class="next-match-empty">Nessuna partita in programma</span>' + bell;
    return;
  }
  bar.innerHTML =
    '<span class="next-match-tag">Prossima partita</span>' +
    '<span class="pill ' + (nm.sede==='Trasferta'?'pill-muted':'') + '">' + esc(nm.sede||'Casa') + '</span>' +
    '<strong class="next-match-opponent">vs ' + esc(nm.avversario||'—') + '</strong>' +
    '<span class="next-match-when">' + formatDate(nm.data) + (nm.ora?(' • '+esc(nm.ora)):'') + '</span>' +
    '<button class="btn btn-small next-match-goto" onclick="openMatch(\''+nm.id+'\')">Apri</button>' +
    bell;
}
function exportDefaultFormationXLSX(){
  ensureXLSX(function(){
    const ids = [].concat(
      (state.formazioneDefault.chips||[]).map(c=>c.playerId),
      state.formazioneDefault.riserve||[]
    );
    const convocati = ids.map(id=>state.players.find(p=>p.id===id)).filter(Boolean)
      .sort((a,b)=>surnameOf(a.nome).localeCompare(surnameOf(b.nome)));
    const nextMatch = findNextMatch();
    let title = 'Convocazioni partita';
    if(nextMatch){
      title += ' Vs ' + nextMatch.avversario + ' del ' + formatDate(nextMatch.data);
      if(nextMatch.ora) title += ' alle ore ' + nextMatch.ora;
    }
    const data = [ [], [title, null] ];
    convocati.forEach((p,i)=>{ data.push([i+1, displayName(p.nome)]); });
    const ws = XLSX.utils.aoa_to_sheet(data.length>2 ? data : data.concat([['','']]));
    ws['!merges'] = [{ s:{r:1,c:0}, e:{r:1,c:1} }];
    ws['!cols'] = [{ wch:6 }, { wch:30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Convocati');
    XLSX.writeFile(wb, 'convocati-formazione-predefinita.xlsx');
  });
}
function slotRoleForDefaultPlayer(playerId){
  const chip = (state.formazioneDefault.chips||[]).find(c=>c.playerId===playerId);
  if(chip){
    const slot = (state.formazioneDefault.slots||[]).find(s=>s.numero===chip.numero);
    return slot ? slot.ruolo : null;
  }
  const riserve = state.formazioneDefault.riserve || [];
  const idx = riserve.indexOf(playerId);
  return idx!==-1 ? ('S' + (idx+1)) : null;
}
function setDefaultFormationSort(mode){
  state.defaultFormationSort = mode;
  renderView();
}
function sortPlayersForDefaultFormation(players){
  const mode = state.defaultFormationSort || 'ruolo';
  const numeroByPlayer = {};
  (state.formazioneDefault.chips||[]).forEach(c=>{ numeroByPlayer[c.playerId] = c.numero; });
  const riserveIdx = {};
  (state.formazioneDefault.riserve||[]).forEach((id,i)=>{ riserveIdx[id] = i; });
  return players.slice().sort((a,b)=>{
    if(mode==='numero'){
      const na = numeroByPlayer[a.id];
      const ra = riserveIdx[a.id];
      const rankA = na!=null ? na : (ra!=null ? (1000+ra) : null);
      const nb = numeroByPlayer[b.id];
      const rb = riserveIdx[b.id];
      const rankB = nb!=null ? nb : (rb!=null ? (1000+rb) : null);
      if(rankA!=null && rankB!=null) return rankA-rankB;
      if(rankA!=null && rankB==null) return -1;
      if(rankA==null && rankB!=null) return 1;
    }
    const ra2 = ROLE_ORDER[a.ruolo]!=null?ROLE_ORDER[a.ruolo]:99, rb2 = ROLE_ORDER[b.ruolo]!=null?ROLE_ORDER[b.ruolo]:99;
    if(ra2!==rb2) return ra2-rb2;
    return a.nome.localeCompare(b.nome);
  });
}
function renderFormazioneView(){
  return renderDefaultFormationCard();
}
function renderDefaultFormationCard(){
  const formationOptions = '<option value="">Scegli modulo…</option>' + FORMATION_KEYS.map(k=>'<option value="'+k+'" '+(state.formazioneDefault.modulo===k?'selected':'')+'>'+k+'</option>').join('');
  const sortMode = state.defaultFormationSort || 'ruolo';
  const playersSorted = sortPlayersForDefaultFormation(state.players);
  const chipIds = new Set(state.formazioneDefault.chips.map(c=>c.playerId));
  const riserveIds = new Set(state.formazioneDefault.riserve||[]);
  const totalCount = totalDefaultSelectionCount();
  return '' +
  '<div class="card">' +
    '<div class="card-header-row"><h2>Formazione predefinita</h2>' +
      '<div class="pitch-actions">' +
        '<span class="pill pill-muted">' + totalCount + ' / ' + MAX_SQUAD_SELECTION + ' selezionati</span>' +
        '<button class="btn btn-small ' + (state.drawMode.formazioneDefault?'btn-active':'') + '" onclick="toggleDefaultDrawMode()">' + (state.drawMode.formazioneDefault?'Termina disegno':'Disegna movimenti') + '</button>' +
        '<button class="btn btn-small" onclick="clearDefaultArrows()">Cancella frecce</button>' +
        '<button class="btn btn-small" onclick="exportDefaultFormationXLSX()">Esporta convocati XLSX</button>' +
        '<button class="btn btn-small" onclick="clearDefaultFormation()">Svuota</button>' +
      '</div>' +
    '</div>' +
    '<p class="hint">Scegli il modulo, poi su ogni giocatore in rosa clicca (sinistro o destro) per aggiungerlo/rimuoverlo dal primo posto libero, oppure trascinalo direttamente sulla posizione in campo. Verrà usata per popolare automaticamente le nuove partite quando convochi questi giocatori. Il modulo scelto qui — o cambiato dentro una partita — resta il modulo predefinito anche per le partite successive.</p>' +
    '<div class="form-row"><div class="field"><label>Modulo</label><select onchange="if(this.value) applyDefaultFormationModulo(this.value)">'+formationOptions+'</select></div></div>' +
    '<div class="tactic-layout">' +
      '<div>' +
        '<div class="pitch-wrap">' + renderDefaultPitchSVG() + '</div>' +
        '<h3>Riserve</h3><div id="default-formation-bench">' + benchDefaultHTML() + '</div>' +
      '</div>' +
      '<div>' +
        '<div class="card-header-row"><h3 style="margin-top:0;">Rosa</h3>' +
          '<div class="pitch-actions">' +
            '<button class="btn btn-small ' + (sortMode==='ruolo'?'btn-active':'') + '" onclick="setDefaultFormationSort(\'ruolo\')">Ruolo</button>' +
            '<button class="btn btn-small ' + (sortMode==='numero'?'btn-active':'') + '" onclick="setDefaultFormationSort(\'numero\')">Selezione</button>' +
          '</div>' +
        '</div>' +
        '<div class="roster-side-list default-formation-roster">' +
          playersSorted.map(p=>{
            const isStarter = chipIds.has(p.id);
            const isReserve = riserveIds.has(p.id);
            const slotRole = slotRoleForDefaultPlayer(p.id);
            const dotClass = isStarter ? 'dot-on' : (isReserve ? 'dot-reserve' : 'dot-off');
            return '<div class="roster-side-row ' + (isStarter?'roster-side-on':'') + '" data-player-id="'+p.id+'">' +
              '<span class="roster-side-slotrole">' + (slotRole?esc(slotRole):'') + '</span>' +
              '<span class="roster-side-name">' + esc(displayName(p.nome)) + '</span>' +
              '<span class="roster-side-role">' + esc(p.ruolo) + '</span>' +
              '<span class="roster-side-foot">' + esc(p.piede?p.piede.slice(0,3):'-') + '</span>' +
              starRatingHTML(p.valutazione, 11) +
              '<span class="roster-side-dot ' + dotClass + '"></span>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/* ---------- tab AVVERSARI ---------- */
function renderAvversariTab(match){
  const formationOptionsAvv = '<option value="">Scegli modulo…</option>' + FORMATION_KEYS.map(k=>'<option value="'+k+'" '+(match.formazioneAvversaria.modulo===k?'selected':'')+'>'+k+'</option>').join('');
  return '' +
  '<div class="card">' +
    '<h2>Lavagna avversari</h2>' +
    '<div class="form-row"><div class="field"><label>Modulo ipotizzato</label><select onchange="if(this.value) applyFormationAvversaria(\''+match.id+'\',this.value)">'+formationOptionsAvv+'</select></div></div>' +
    '<div class="pitch-wrap">' + renderAvversariaPitchSVG(match) + '</div>' +
    '<div class="pitch-actions">' +
      '<button class="btn ' + (state.drawMode.avversaria?'btn-active':'') + '" onclick="toggleDrawMode(\'avversaria\')">' + (state.drawMode.avversaria?'Termina disegno':'Disegna movimenti') + '</button>' +
      '<button class="btn" onclick="clearArrows(\''+match.id+'\',\'avversaria\')">Cancella frecce</button>' +
    '</div>' +
    '<h3>Numeri</h3>' + benchAvversariaHTML(match) +
    (match.formazioneAvversaria.chips.length ? '<h3>Schierati</h3>'+avversariaLegendHTML(match) : '') +
    '<div class="field" style="margin-top:14px;"><label>Caratteristiche avversari</label><textarea rows="4" onchange="updateAvvNote(\''+match.id+'\',\'noteCaratteristiche\',this.value)">'+esc(match.formazioneAvversaria.noteCaratteristiche)+'</textarea></div>' +
  '</div>';
}

/* ---------- tab TABELLINO ---------- */
function statFor(match, playerId){
  if(!match.statistiche[playerId]){
    match.statistiche[playerId] = { entrato:'', uscito:'', cartellino:{tipo:'',minuto:''} };
  }
  return match.statistiche[playerId];
}
function findPlayerByName(name){
  if(!name) return null;
  const norm = name.trim().toLowerCase();
  if(!norm) return null;
  let p = state.players.find(pl=>pl.nome.trim().toLowerCase()===norm);
  if(p) return p;
  p = state.players.find(pl=>{
    const pn = pl.nome.trim().toLowerCase();
    return pn.includes(norm) || norm.includes(pn);
  });
  return p || null;
}
function parseTabellinoBlock(text){
  const lines = text.split('\n').map(l=>l.trim()).filter(l=>l.length>0);
  const result = { golFatti: [], golSubiti: [], cartellini: [], minuti: [], errors: [] };
  lines.forEach((line, idx)=>{
    const parts = line.split('|').map(p=>p.trim());
    const tag = (parts[0]||'').toUpperCase();
    const kv = {};
    parts.slice(1).forEach(p=>{
      const eq = p.indexOf('=');
      if(eq===-1) return;
      kv[p.slice(0,eq).trim().toLowerCase()] = p.slice(eq+1).trim();
    });
    if(tag==='GOL_FATTO'){
      result.golFatti.push({ minuto: kv.minuto||'', tipo: kv.tipo||'Azione', marcatore: kv.marcatore||'', assist: kv.assist||'' });
    } else if(tag==='GOL_SUBITO'){
      result.golSubiti.push({ minuto: kv.minuto||'', tipo: kv.tipo||'Azione', marcatoreAvversario: kv.marcatore||'' });
    } else if(tag==='CARTELLINO'){
      result.cartellini.push({ giocatore: kv.giocatore||'', tipo: kv.tipo||'', minuto: kv.minuto||'' });
    } else if(tag==='MINUTI'){
      result.minuti.push({ giocatore: kv.giocatore||'', entrato: kv.entrato||'', uscito: kv.uscito||'' });
    } else {
      result.errors.push('Riga ' + (idx+1) + ' non riconosciuta: "' + line + '"');
    }
  });
  return result;
}
async function importTabellinoBlock(matchId){
  const ta = document.getElementById('tabellino-import-text');
  const text = ta.value.trim();
  if(!text){ ta.focus(); return; }
  const match = getMatch(matchId);
  const parsed = parseTabellinoBlock(text);
  const unresolved = [];
  const max = maxConvocati(match);
  function ensureConvocato(p){
    if(!match.convocati.includes(p.id) && match.convocati.length < max){
      match.convocati.push(p.id);
    }
  }

  parsed.golFatti.forEach(g=>{
    let marcatoreId = '', assistId = '';
    if(g.tipo !== 'Autogol avversario'){
      if(g.marcatore){
        const p = findPlayerByName(g.marcatore);
        if(p){ marcatoreId = p.id; ensureConvocato(p); }
        else unresolved.push('Marcatore non trovato: "' + g.marcatore + '"');
      }
      if(g.assist){
        const pa = findPlayerByName(g.assist);
        if(pa){ assistId = pa.id; ensureConvocato(pa); }
        else unresolved.push('Assist non trovato: "' + g.assist + '"');
      }
    }
    match.golFatti.push({ id: uid(), minuto: g.minuto, tipo: g.tipo, marcatoreId, assistId });
  });
  parsed.golSubiti.forEach(g=>{
    match.golSubiti.push({ id: uid(), minuto: g.minuto, tipo: g.tipo, marcatoreAvversario: g.marcatoreAvversario||'' });
  });
  parsed.cartellini.forEach(c=>{
    const p = findPlayerByName(c.giocatore);
    if(!p){ unresolved.push('Cartellino: giocatore non trovato "' + c.giocatore + '"'); return; }
    ensureConvocato(p);
    const s = statFor(match, p.id);
    s.cartellino.tipo = c.tipo;
    s.cartellino.minuto = c.minuto;
  });
  parsed.minuti.forEach(m=>{
    const p = findPlayerByName(m.giocatore);
    if(!p){ unresolved.push('Minuti: giocatore non trovato "' + m.giocatore + '"'); return; }
    ensureConvocato(p);
    const s = statFor(match, p.id);
    if(m.entrato) s.entrato = m.entrato;
    if(m.uscito) s.uscito = m.uscito;
  });

  recomputeNumeriGara(match);
  await saveMatches();
  ta.value = '';
  renderMatchTab();

  const problems = parsed.errors.concat(unresolved);
  alert(problems.length
    ? 'Importazione completata con alcuni avvisi:\n\n' + problems.join('\n')
    : 'Importazione completata.');
}
function renderTabellinoTab(match){
  const importCard = '<div class="card"><h2>Importa tabellino</h2>' +
    '<p class="hint">Incolla qui il blocco di testo che Claude prepara leggendo il PDF o la foto del tabellino, poi importa. Aggiunge automaticamente in convocazione i giocatori citati. Formato righe: ' +
      '<code>GOL_FATTO | minuto=12 | tipo=Azione | marcatore=Nome Cognome | assist=Nome Cognome</code>, ' +
      '<code>GOL_SUBITO | minuto=20 | tipo=Azione</code>, ' +
      '<code>CARTELLINO | giocatore=Nome Cognome | tipo=Giallo | minuto=60</code>, ' +
      '<code>MINUTI | giocatore=Nome Cognome | entrato=46</code>.</p>' +
    '<textarea id="tabellino-import-text" rows="6" placeholder="Incolla qui il blocco preparato da Claude..."></textarea>' +
    '<div class="pitch-actions" style="margin-top:8px;"><button class="btn btn-primary" onclick="importTabellinoBlock(\''+match.id+'\')">Importa</button></div>' +
  '</div>';
  if(match.convocati.length===0){
    return importCard + '<div class="card"><p class="hint">Nessun convocato. Vai su "Formazione" per selezionare i giocatori, oppure importa un tabellino qui sopra.</p></div>';
  }
  const players = sortByNumGara(match, match.convocati.map(id=>state.players.find(p=>p.id===id)).filter(Boolean));
  return importCard +
  '<div class="card"><h2>Presenze e cartellini</h2><div class="stats-list">' + players.map(p=>renderStatRow(match,p)).join('') + '</div></div>' +
  '<div class="card"><h2>Gol fatti</h2>' +
    (match.golFatti||[]).map((g,i)=>renderGolFattoRow(match,g,i)).join('') +
    '<button class="btn btn-small" onclick="addGolFatto(\'' + match.id + '\')">+ Aggiungi gol fatto</button>' +
  '</div>' +
  '<div class="card"><h2>Gol subiti</h2>' +
    (match.golSubiti||[]).map((g,i)=>renderGolSubitoRow(match,g,i)).join('') +
    '<button class="btn btn-small" onclick="addGolSubito(\'' + match.id + '\')">+ Aggiungi gol subito</button>' +
  '</div>';
}
function renderStatRow(match, p){
  const s = statFor(match, p.id);
  const expanded = state.expandedStatRow === p.id;
  const golCount = (match.golFatti||[]).filter(g=>g.marcatoreId===p.id).length;
  const badges = [];
  if(golCount) badges.push('<span class="pill">' + golCount + ' gol</span>');
  if(s.cartellino.tipo==='Giallo') badges.push('<span class="pill pill-yellow">Giallo</span>');
  if(s.cartellino.tipo==='Rosso') badges.push('<span class="pill pill-red">Rosso</span>');
  if(s.entrato) badges.push('<span class="pill pill-muted">Entrato ' + esc(s.entrato) + '\'</span>');
  if(s.uscito) badges.push('<span class="pill pill-muted">Uscito ' + esc(s.uscito) + '\'</span>');
  let body = '';
  if(expanded){
    body = '<div class="stat-row-body">' +
      '<div class="form-row">' +
        '<div class="field"><label>Entrato al minuto</label><input type="number" min="0" max="120" placeholder="vuoto = titolare" value="' + esc(s.entrato) + '" onchange="updateStat(\'' + match.id + '\',\'' + p.id + '\',\'entrato\',this.value)"></div>' +
        '<div class="field"><label>Uscito al minuto</label><input type="number" min="0" max="120" placeholder="vuoto = fine gara" value="' + esc(s.uscito) + '" onchange="updateStat(\'' + match.id + '\',\'' + p.id + '\',\'uscito\',this.value)"></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="field"><label>Cartellino</label><select onchange="updateCartellinoTipo(\'' + match.id + '\',\'' + p.id + '\',this.value)">' +
          '<option value="" ' + (s.cartellino.tipo===''?'selected':'') + '>Nessuno</option>' +
          '<option value="Giallo" ' + (s.cartellino.tipo==='Giallo'?'selected':'') + '>Giallo</option>' +
          '<option value="Rosso" ' + (s.cartellino.tipo==='Rosso'?'selected':'') + '>Rosso</option>' +
        '</select></div>' +
        (s.cartellino.tipo ? '<div class="field"><label>Minuto</label><input type="number" min="0" max="120" value="' + esc(s.cartellino.minuto) + '" onchange="updateStat(\'' + match.id + '\',\'' + p.id + '\',\'cartellino.minuto\',this.value)"></div>' : '') +
      '</div>' +
      '<p class="hint">I gol si registrano nelle sezioni "Gol fatti" / "Gol subiti" qui sotto.</p>' +
    '</div>';
  }
  return '<div class="stat-row">' +
    '<div class="stat-row-head" onclick="toggleStatRow(\'' + p.id + '\')">' +
      '<span class="roster-num">' + esc(numGara(match,p.id)) + '</span>' +
      '<span class="roster-name">' + esc(displayName(p.nome)) + '</span>' +
      '<div class="stat-badges">' + badges.join('') + '</div>' +
      '<span class="chevron">' + (expanded?'−':'+') + '</span>' +
    '</div>' + body +
  '</div>';
}
function toggleStatRow(playerId){
  state.expandedStatRow = (state.expandedStatRow===playerId) ? null : playerId;
  renderMatchTab();
}
function updateStat(matchId, playerId, path, value){
  const match = getMatch(matchId);
  const s = statFor(match, playerId);
  if(path==='cartellino.minuto') s.cartellino.minuto = value; else s[path] = value;
  saveMatches();
  renderView();
}
function updateCartellinoTipo(matchId, playerId, value){
  const match = getMatch(matchId);
  const s = statFor(match, playerId);
  s.cartellino.tipo = value;
  if(!value) s.cartellino.minuto = '';
  saveMatches();
  renderMatchTab();
}
function renderGolFattoRow(match, g, i){
  const marcatori = match.convocati.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
  const isAutogol = g.tipo === 'Autogol avversario';
  return '<div class="gol-row">' +
    '<input type="number" min="0" max="120" class="input-min" placeholder="min" value="' + esc(g.minuto) + '" onchange="updateGolFatto(\'' + match.id + '\',' + i + ',\'minuto\',this.value)">' +
    '<select onchange="updateGolFatto(\'' + match.id + '\',' + i + ',\'tipo\',this.value)">' +
      GOAL_TYPES_FATTI.map(t=>'<option value="'+esc(t)+'" '+(g.tipo===t?'selected':'')+'>'+t+'</option>').join('') +
    '</select>' +
    (!isAutogol ?
      '<select onchange="updateGolFatto(\'' + match.id + '\',' + i + ',\'marcatoreId\',this.value)">' +
        '<option value="">Marcatore…</option>' +
        marcatori.map(p=>'<option value="'+p.id+'" '+(g.marcatoreId===p.id?'selected':'')+'>'+esc(displayName(p.nome))+'</option>').join('') +
      '</select>' : '<span class="hint">nessun marcatore</span>') +
    (!isAutogol ?
      '<select onchange="updateGolFatto(\'' + match.id + '\',' + i + ',\'assistId\',this.value)">' +
        '<option value="">Nessun assist</option>' +
        marcatori.filter(p=>p.id!==g.marcatoreId).map(p=>'<option value="'+p.id+'" '+(g.assistId===p.id?'selected':'')+'>'+esc(displayName(p.nome))+'</option>').join('') +
      '</select>' : '') +
    '<button class="btn-icon" onclick="removeGolFatto(\'' + match.id + '\',' + i + ')" aria-label="Rimuovi">×</button>' +
  '</div>';
}
function addGolFatto(matchId){
  const match = getMatch(matchId);
  if(!match.golFatti) match.golFatti = [];
  match.golFatti.push({ id: uid(), minuto:'', tipo:'Azione', marcatoreId:'', assistId:'' });
  saveMatches();
  renderMatchTab();
}
function updateGolFatto(matchId, idx, field, value){
  const match = getMatch(matchId);
  match.golFatti[idx][field] = value;
  if(field==='tipo' && value==='Autogol avversario'){ match.golFatti[idx].marcatoreId=''; match.golFatti[idx].assistId=''; }
  saveMatches();
  renderMatchTab();
}
function removeGolFatto(matchId, idx){
  const match = getMatch(matchId);
  match.golFatti.splice(idx,1);
  saveMatches();
  renderMatchTab();
}
function renderGolSubitoRow(match, g, i){
  return '<div class="gol-row">' +
    '<input type="number" min="0" max="120" class="input-min" placeholder="min" value="' + esc(g.minuto) + '" onchange="updateGolSubito(\'' + match.id + '\',' + i + ',\'minuto\',this.value)">' +
    '<select onchange="updateGolSubito(\'' + match.id + '\',' + i + ',\'tipo\',this.value)">' +
      GOAL_TYPES_SUBITI.map(t=>'<option value="'+esc(t)+'" '+(g.tipo===t?'selected':'')+'>'+t+'</option>').join('') +
    '</select>' +
    '<input type="text" class="input-note" placeholder="marcatore avversario (facoltativo)" value="' + esc(g.marcatoreAvversario) + '" onchange="updateGolSubito(\'' + match.id + '\',' + i + ',\'marcatoreAvversario\',this.value)">' +
    '<button class="btn-icon" onclick="removeGolSubito(\'' + match.id + '\',' + i + ')" aria-label="Rimuovi">×</button>' +
  '</div>';
}
function addGolSubito(matchId){
  const match = getMatch(matchId);
  if(!match.golSubiti) match.golSubiti = [];
  match.golSubiti.push({ id: uid(), minuto:'', tipo:'Azione', marcatoreAvversario:'' });
  saveMatches();
  renderMatchTab();
}
function updateGolSubito(matchId, idx, field, value){
  const match = getMatch(matchId);
  match.golSubiti[idx][field] = value;
  saveMatches();
}
function removeGolSubito(matchId, idx){
  const match = getMatch(matchId);
  match.golSubiti.splice(idx,1);
  saveMatches();
  renderMatchTab();
}

/* ---------- tab VALUTAZIONI ---------- */
function renderValutazioniTab(match){
  const players = sortByNumGara(match, match.convocati.map(id=>state.players.find(p=>p.id===id)).filter(Boolean));
  return '' +
  '<div class="card"><h2>Squadra nostra</h2><div class="valutazione-block">' +
    '<div class="field field-voto"><label>Voto (1-10)</label><input type="number" min="1" max="10" value="' + esc(match.valutazioni.nostraSquadra.voto) + '" onchange="updateValSquadra(\'' + match.id + '\',\'nostraSquadra\',\'voto\',this.value)"></div>' +
    '<div class="field field-grow"><label>Note</label><textarea rows="2" onchange="updateValSquadra(\'' + match.id + '\',\'nostraSquadra\',\'note\',this.value)">' + esc(match.valutazioni.nostraSquadra.note) + '</textarea></div>' +
  '</div></div>' +
  '<div class="card"><h2>Giocatori — nostri</h2>' +
    (players.length===0 ? '<p class="hint">Nessun convocato.</p>' : players.map(p=>{
      const v = match.valutazioni.nostriGiocatori[p.id] || { voto:'', note:'' };
      return '<div class="valutazione-row">' +
        '<span class="roster-num">' + esc(numGara(match,p.id)) + '</span>' +
        '<span class="roster-name">' + esc(displayName(p.nome)) + '</span>' +
        '<input type="number" min="1" max="10" class="input-voto" placeholder="voto" value="' + esc(v.voto) + '" onchange="updateValGiocatore(\'' + match.id + '\',\'' + p.id + '\',\'voto\',this.value)">' +
        '<input type="text" class="input-note" placeholder="note" value="' + esc(v.note) + '" onchange="updateValGiocatore(\'' + match.id + '\',\'' + p.id + '\',\'note\',this.value)">' +
      '</div>';
    }).join('')) +
  '</div>' +
  '<div class="card"><h2>Squadra avversaria</h2><div class="valutazione-block">' +
    '<div class="field field-voto"><label>Voto (1-10)</label><input type="number" min="1" max="10" value="' + esc(match.valutazioni.avversariSquadra.voto) + '" onchange="updateValSquadra(\'' + match.id + '\',\'avversariSquadra\',\'voto\',this.value)"></div>' +
    '<div class="field field-grow"><label>Note</label><textarea rows="2" onchange="updateValSquadra(\'' + match.id + '\',\'avversariSquadra\',\'note\',this.value)">' + esc(match.valutazioni.avversariSquadra.note) + '</textarea></div>' +
  '</div></div>' +
  '<div class="card"><h2>Giocatori — avversari (facoltativo)</h2>' +
    match.valutazioni.avversariGiocatori.map((g,i)=>
      '<div class="valutazione-row">' +
        '<input type="text" class="input-note" placeholder="nome/numero" value="' + esc(g.nome) + '" onchange="updateValAvvGiocatore(\'' + match.id + '\',' + i + ',\'nome\',this.value)">' +
        '<input type="number" min="1" max="10" class="input-voto" placeholder="voto" value="' + esc(g.voto) + '" onchange="updateValAvvGiocatore(\'' + match.id + '\',' + i + ',\'voto\',this.value)">' +
        '<input type="text" class="input-note" placeholder="note" value="' + esc(g.note) + '" onchange="updateValAvvGiocatore(\'' + match.id + '\',' + i + ',\'note\',this.value)">' +
        '<button class="btn-icon" onclick="removeValAvvGiocatore(\'' + match.id + '\',' + i + ')" aria-label="Rimuovi">×</button>' +
      '</div>'
    ).join('') +
    '<button class="btn btn-small" onclick="addValAvvGiocatore(\'' + match.id + '\')">+ Aggiungi giocatore avversario</button>' +
  '</div>';
}
function updateValSquadra(matchId, who, field, value){
  const match = getMatch(matchId);
  match.valutazioni[who][field] = (field==='voto') ? (value?parseInt(value,10):null) : value;
  saveMatches();
}
function updateValGiocatore(matchId, playerId, field, value){
  const match = getMatch(matchId);
  if(!match.valutazioni.nostriGiocatori[playerId]) match.valutazioni.nostriGiocatori[playerId] = { voto:'', note:'' };
  match.valutazioni.nostriGiocatori[playerId][field] = value;
  saveMatches();
}
function addValAvvGiocatore(matchId){
  const match = getMatch(matchId);
  match.valutazioni.avversariGiocatori.push({ nome:'', voto:'', note:'' });
  saveMatches();
  renderMatchTab();
}
function updateValAvvGiocatore(matchId, idx, field, value){
  const match = getMatch(matchId);
  match.valutazioni.avversariGiocatori[idx][field] = value;
  saveMatches();
}
function removeValAvvGiocatore(matchId, idx){
  const match = getMatch(matchId);
  match.valutazioni.avversariGiocatori.splice(idx,1);
  saveMatches();
  renderMatchTab();
}

/* ---------- gestione ALLENAMENTI (creazione/apertura/eliminazione dal calendario) ---------- */
function deleteAllenamento(id){
  showConfirmModal('Eliminare questo allenamento e le presenze registrate?', function(){
    state.allenamenti = state.allenamenti.filter(a=>a.id!==id);
    saveAllenamenti();
    renderView();
  });
}
function openAllenamento(id){
  state.currentView = 'allenamento';
  state.currentAllenamentoId = id;
  renderView();
  if(getAppUser().schemaUnlocked) loadSchemaSessionsForAllenamento(id);
}
function updateAllenamentoData(id, value){
  const a = state.allenamenti.find(x=>x.id===id);
  a.data = value;
  saveAllenamenti();
  renderView();
}
function updateAllenamentoOra(id, value){
  const a = state.allenamenti.find(x=>x.id===id);
  a.ora = value;
  saveAllenamenti();
}
function setAllenamentoSort(mode){
  state.allenamentoSort = mode;
  renderView();
}
function sortPlayersForAllenamento(players){
  const mode = state.allenamentoSort || 'cognome';
  return players.slice().sort((x,y)=>{
    if(mode==='ruolo'){
      const rx = ROLE_ORDER[x.ruolo]!=null ? ROLE_ORDER[x.ruolo] : 99;
      const ry = ROLE_ORDER[y.ruolo]!=null ? ROLE_ORDER[y.ruolo] : 99;
      if(rx!==ry) return rx-ry;
    }
    return surnameOf(x.nome).localeCompare(surnameOf(y.nome));
  });
}
function renderAllenamentoView(){
  const a = state.allenamenti.find(x=>x.id===state.currentAllenamentoId);
  if(!a){ state.currentView='calendario'; return renderCalendarioView(); }
  const sortMode = state.allenamentoSort || 'cognome';
  const players = sortPlayersForAllenamento(state.players);
  return '' +
  '<div class="match-header">' +
    '<button class="btn-link" onclick="backToCalendario()">← Calendario</button>' +
    '<div class="match-header-main"><h2>Allenamento del ' + formatDate(a.data) + '</h2>' +
      '<div class="match-header-fields">' +
        '<input type="date" value="'+esc(a.data)+'" onchange="updateAllenamentoData(\''+a.id+'\',this.value)">' +
        '<input type="time" value="'+esc(a.ora||'')+'" onchange="updateAllenamentoOra(\''+a.id+'\',this.value)">' +
        '<button class="btn btn-small" onclick="exportPageImage(\'allenamento-'+a.id+'\')">Esporta immagine</button>' +
        '<button class="btn btn-small btn-danger" onclick="deleteAllenamento(\''+a.id+'\')">Elimina</button>' +
      '</div>' +
    '</div>' +
  '</div>' +
  schemaSessionsCardForAllenamento(a) +
  '<div class="card"><h2>Presenze</h2>' +
    '<p class="hint">Di default disponibili, tranne i giocatori aggregati alla prima squadra (non disponibili di default). Seleziona per cambiare lo stato di un giocatore.</p>' +
    '<div class="pitch-actions" style="margin-bottom:8px;">' +
      '<button class="btn btn-small ' + (sortMode==='cognome'?'btn-active':'') + '" onclick="setAllenamentoSort(\'cognome\')">Ordina per cognome</button>' +
      '<button class="btn btn-small ' + (sortMode==='ruolo'?'btn-active':'') + '" onclick="setAllenamentoSort(\'ruolo\')">Ordina per ruolo</button>' +
    '</div>' +
    (players.length===0 ? '<p class="hint">Nessun giocatore in rosa.</p>' :
      players.map(p=>{
        const v = (a.presenze && a.presenze[p.id]) || defaultPresenzaFor(p);
        return '<div class="presenza-row">' +
          '<span class="roster-name">' + esc(displayName(p.nome)) + '</span>' +
          '<span class="roster-role">' + esc(p.ruolo) + '</span>' +
          '<select onchange="updatePresenza(\''+a.id+'\',\''+p.id+'\',this.value)">' +
            PRESENZA_STATI.map(st=>'<option value="'+st+'" '+(v===st?'selected':'')+'>'+st+'</option>').join('') +
          '</select>' +
        '</div>';
      }).join('')
    ) +
  '</div>';
}
function updatePresenza(allenamentoId, playerId, value){
  const a = state.allenamenti.find(x=>x.id===allenamentoId);
  if(!a.presenze) a.presenze = {};
  a.presenze[playerId] = value;
  saveAllenamenti();
}

/* ---------- vista CALENDARIO ---------- */
const MONTH_NAMES = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const DAY_NAMES = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
function initCalendarCursor(){
  if(!state.calendarCursor){
    const now = new Date();
    state.calendarCursor = { year: now.getFullYear(), month: now.getMonth() };
  }
}
function calendarShiftMonth(delta){
  initCalendarCursor();
  let year = state.calendarCursor.year, month = state.calendarCursor.month + delta;
  if(month<0){ month=11; year--; }
  if(month>11){ month=0; year++; }
  state.calendarCursor = { year, month };
  renderView();
}
function calendarToday(){
  const now = new Date();
  state.calendarCursor = { year: now.getFullYear(), month: now.getMonth() };
  renderView();
}
let eventModalDate = null;
function showAddEventModal(dateStr){
  eventModalDate = dateStr;
  const box = document.getElementById('event-modal-box');
  box.innerHTML =
    '<h3 style="margin-top:0;">Nuovo evento — ' + formatDate(dateStr) + '</h3>' +
    '<div class="form-row" style="margin-bottom:14px;">' +
      '<button class="btn btn-primary" onclick="showAddEventForm(\'allenamento\')">Allenamento</button>' +
      '<button class="btn btn-primary" onclick="showAddEventForm(\'partita\')">Partita</button>' +
    '</div>' +
    '<div id="add-event-form"></div>' +
    '<div class="modal-actions"><button class="btn" onclick="closeEventModal()">Annulla</button></div>';
  document.getElementById('event-modal-overlay').style.display = 'flex';
}
function closeEventModal(){
  document.getElementById('event-modal-overlay').style.display = 'none';
  eventModalDate = null;
}
function showAddEventForm(type){
  const formEl = document.getElementById('add-event-form');
  if(type==='allenamento'){
    formEl.innerHTML =
      '<div class="form-row">' +
        '<div class="field"><label>Orario</label><input type="time" id="event-ora" value="18:30"></div>' +
        '<button class="btn btn-primary" onclick="confirmAddAllenamentoFromCalendar()">Crea allenamento</button>' +
      '</div>';
  } else {
    formEl.innerHTML =
      '<div class="form-row">' +
        '<div class="field field-grow"><label>Avversario</label><input type="text" id="event-avversario" placeholder="Nome squadra avversaria"></div>' +
        '<div class="field"><label>Orario</label><input type="time" id="event-ora"></div>' +
        '<div class="field"><label>Sede</label><select id="event-sede"><option value="Casa">Casa</option><option value="Trasferta">Trasferta</option></select></div>' +
        '<div class="field"><label>Tipo</label><select id="event-tipo"><option value="Campionato">Campionato</option><option value="Amichevole">Amichevole</option></select></div>' +
        '<button class="btn btn-primary" onclick="confirmAddMatchFromCalendar()">Crea partita</button>' +
      '</div>';
  }
}
function confirmAddAllenamentoFromCalendar(){
  const oraEl = document.getElementById('event-ora');
  const a = { id: uid(), data: eventModalDate, ora: oraEl.value || '', presenze: {} };
  state.allenamenti.push(a);
  saveAllenamenti();
  closeEventModal();
  openAllenamento(a.id);
}
function defaultFormazioneNostraForNewMatch(){
  const def = state.formazioneDefault || { modulo:'', slots:[], chips:[] };
  return {
    modulo: def.modulo || '',
    slots: (def.slots||[]).map(s=>({ numero:s.numero, ruolo:s.ruolo, x:s.x, y:s.y })),
    chips: [],
    arrows: []
  };
}
function confirmAddMatchFromCalendar(){
  const avvEl = document.getElementById('event-avversario');
  const oraEl = document.getElementById('event-ora');
  const sedeEl = document.getElementById('event-sede');
  const tipoEl = document.getElementById('event-tipo');
  const avversario = avvEl.value.trim();
  if(!avversario){ avvEl.focus(); return; }
  const match = {
    id: uid(), avversario, data: eventModalDate, ora: oraEl.value || '', sede: sedeEl.value || 'Casa', tipo: tipoEl.value || 'Campionato',
    convocati: [],
    numeriGara: {},
    formazioneNostra: defaultFormazioneNostraForNewMatch(),
    formazioneAvversaria: { modulo:'', chips:[], arrows:[], noteCaratteristiche:'', notePiano:'' },
    statistiche: {},
    golFatti: [],
    golSubiti: [],
    valutazioni: { nostraSquadra:{voto:null,note:''}, nostriGiocatori:{}, avversariSquadra:{voto:null,note:''}, avversariGiocatori:[] }
  };
  state.matches.push(match);
  saveMatches();
  closeEventModal();
  openMatch(match.id);
}
function pad2(n){ return n<10 ? '0'+n : ''+n; }
function renderCalendarioView(){
  initCalendarCursor();
  const year = state.calendarCursor.year, month = state.calendarCursor.month;
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const todayStr = (function(){ const n=new Date(); return n.getFullYear()+'-'+pad2(n.getMonth()+1)+'-'+pad2(n.getDate()); })();

  const eventsByDate = {};
  state.matches.forEach(m=>{
    if(!m.data) return;
    if(!eventsByDate[m.data]) eventsByDate[m.data] = [];
    eventsByDate[m.data].push({ type:'match', tipo: m.tipo, id:m.id, label:(m.ora?m.ora+' ':'')+'vs ' + m.avversario, sub: (m.tipo==='Amichevole'?'Amichevole':'Campionato') + ' — ' + (m.sede||'Casa') });
  });
  state.allenamenti.forEach(a=>{
    if(!a.data) return;
    if(!eventsByDate[a.data]) eventsByDate[a.data] = [];
    eventsByDate[a.data].push({ type:'training', id:a.id, label:(a.ora?a.ora+' ':'')+'Allenamento', sub:'' });
  });

  let cells = '';
  for(let i=0;i<startWeekday;i++){ cells += '<div class="cal-cell cal-cell-empty"></div>'; }
  for(let d=1; d<=daysInMonth; d++){
    const dateStr = year + '-' + pad2(month+1) + '-' + pad2(d);
    const evs = eventsByDate[dateStr] || [];
    const isToday = dateStr===todayStr;
    cells += '<div class="cal-cell' + (isToday?' cal-cell-today':'') + '" oncontextmenu="event.preventDefault(); showAddEventModal(\''+dateStr+'\')"><div class="cal-daynum">' + d + '</div>' +
      evs.map(e=>{
        const cls = e.type==='match' ? ('cal-event ' + (e.tipo==='Amichevole' ? 'cal-event-match-amichevole' : 'cal-event-match-campionato')) : 'cal-event cal-event-training';
        const action = e.type==='match' ? "openMatch('"+e.id+"')" : "openAllenamento('"+e.id+"')";
        return '<div class="'+cls+'" onclick="event.stopPropagation(); '+action+'">'+esc(e.label)+(e.sub?'<span class="cal-event-sub">'+esc(e.sub)+'</span>':'')+'</div>';
      }).join('') +
    '</div>';
  }
  const totalCells = startWeekday + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for(let i=0;i<trailing;i++){ cells += '<div class="cal-cell cal-cell-empty"></div>'; }

  return '' +
  '<div class="card">' +
    '<div class="cal-toolbar">' +
      '<button class="btn btn-small" onclick="calendarShiftMonth(-1)">←</button>' +
      '<h2 style="margin:0;">' + MONTH_NAMES[month] + ' ' + year + '</h2>' +
      '<button class="btn btn-small" onclick="calendarShiftMonth(1)">→</button>' +
      '<button class="btn btn-small" onclick="calendarToday()">Oggi</button>' +
      '<button class="btn btn-small" onclick="exportPageImage(\'calendario\')">Esporta immagine</button>' +
    '</div>' +
    '<div class="cal-grid cal-grid-header">' + DAY_NAMES.map(dn=>'<div class="cal-headcell">'+dn+'</div>').join('') + '</div>' +
    '<div class="cal-grid">' + cells + '</div>' +
  '</div>' +
  '<div class="card">' +
    '<h3 style="margin-top:0;">Esporta / importa calendario</h3>' +
    '<div class="form-row">' +
      '<div class="field"><label>Da</label><input type="date" id="cal-export-da"></div>' +
      '<div class="field"><label>A</label><input type="date" id="cal-export-a"></div>' +
      '<button class="btn btn-small" onclick="exportCalendarioPDF()">Esporta PDF</button>' +
      '<button class="btn btn-small" onclick="exportCalendarioXLSX()">Esporta XLSX</button>' +
      '<button class="btn btn-small" onclick="triggerImportCalendarioXLSX()">Importa XLSX</button>' +
    '</div>' +
    '<p class="hint">"Da"/"A" valgono solo per l\'esportazione: lascia un campo vuoto per non limitare quel lato del periodo. L\'importazione XLSX richiede le colonne: Data (AAAA-MM-GG), Ora, Tipo Evento (Partita o Allenamento), Avversario, Sede (Casa/Trasferta), Tipo Partita (Campionato/Amichevole).</p>' +
  '</div>';
}
function inCalendarRange(dateStr, fromStr, toStr){
  if(!dateStr) return false;
  if(fromStr && dateStr < fromStr) return false;
  if(toStr && dateStr > toStr) return false;
  return true;
}
function collectCalendarEvents(fromStr, toStr){
  const events = [];
  state.matches.forEach(m=>{
    if(!inCalendarRange(m.data, fromStr, toStr)) return;
    const stato = computeMatchStato(m);
    events.push({
      data: m.data, ora: m.ora||'', tipoEvento:'Partita', avversario: m.avversario||'',
      sede: m.sede||'Casa', tipoPartita: m.tipo||'Campionato',
      risultato: stato==='Giocata' ? ((m.golFatti||[]).length + '-' + (m.golSubiti||[]).length) : ''
    });
  });
  state.allenamenti.forEach(a=>{
    if(!inCalendarRange(a.data, fromStr, toStr)) return;
    events.push({ data:a.data, ora:a.ora||'', tipoEvento:'Allenamento', avversario:'', sede:'', tipoPartita:'', risultato:'' });
  });
  events.sort((x,y)=> (x.data+' '+x.ora).localeCompare(y.data+' '+y.ora));
  return events;
}
function exportCalendarioPDF(){
  const from = document.getElementById('cal-export-da').value;
  const to = document.getElementById('cal-export-a').value;
  const events = collectCalendarEvents(from, to);
  const title = 'Calendario' + (from||to ? ' — dal ' + (from?formatDate(from):'inizio stagione') + ' al ' + (to?formatDate(to):'fine stagione') : '');
  const html = events.length===0 ? '<p>Nessun evento nel periodo selezionato.</p>' :
    '<table class="print-table"><thead><tr><th>Data</th><th>Ora</th><th>Tipo</th><th>Dettaglio</th><th>Sede</th><th>Esito</th></tr></thead><tbody>' +
      events.map(e=>'<tr><td>'+formatDate(e.data)+'</td><td>'+esc(e.ora)+'</td><td>'+e.tipoEvento+'</td><td>'+(e.tipoEvento==='Partita'?('vs '+esc(e.avversario)+' ('+esc(e.tipoPartita)+')'):'Allenamento')+'</td><td>'+esc(e.sede)+'</td><td>'+esc(e.risultato)+'</td></tr>').join('') +
    '</tbody></table>';
  exportPDF(title, html);
}
function exportCalendarioXLSX(){
  const from = document.getElementById('cal-export-da').value;
  const to = document.getElementById('cal-export-a').value;
  ensureXLSX(function(){
    const events = collectCalendarEvents(from, to);
    const rows = events.map(e=>({
      Data: e.data, Ora: e.ora, 'Tipo Evento': e.tipoEvento, Avversario: e.avversario,
      Sede: e.sede, 'Tipo Partita': e.tipoPartita, Risultato: e.risultato
    }));
    const ws = XLSX.utils.json_to_sheet(rows.length?rows:[{Data:'',Ora:'','Tipo Evento':'',Avversario:'',Sede:'','Tipo Partita':'',Risultato:''}]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Calendario');
    const suffix = (from||to) ? ('-' + (from||'inizio') + '_' + (to||'fine')) : '';
    XLSX.writeFile(wb, 'calendario' + suffix + '.xlsx');
  });
}
function parseImportDate(raw){
  if(raw==null || raw==='') return '';
  if(typeof raw === 'number'){
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
    return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth()+1) + '-' + pad2(d.getUTCDate());
  }
  const s = String(raw).trim();
  if(/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)){
    const [y,m,d] = s.split('-');
    return y + '-' + pad2(parseInt(m,10)) + '-' + pad2(parseInt(d,10));
  }
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(dmy) return dmy[3] + '-' + pad2(parseInt(dmy[2],10)) + '-' + pad2(parseInt(dmy[1],10));
  return '';
}
function normalizeOra(raw){
  if(raw==null || raw==='') return '';
  if(typeof raw === 'number'){
    const totalMinutes = Math.round(raw * 24 * 60);
    const h = Math.floor(totalMinutes/60) % 24, m = totalMinutes % 60;
    return pad2(h) + ':' + pad2(m);
  }
  const match = String(raw).trim().match(/^(\d{1,2}):(\d{2})/);
  return match ? (pad2(parseInt(match[1],10)) + ':' + match[2]) : '';
}
function triggerImportCalendarioXLSX(){
  document.getElementById('calendario-import-file-input').click();
}
function handleCalendarioImportFile(evt){
  const file = evt.target.files[0];
  if(!file) return;
  ensureXLSX(function(){
    const reader = new FileReader();
    reader.onload = function(e){
      let wb;
      try{ wb = XLSX.read(e.target.result, { type:'binary' }); }
      catch(err){ alert('File non valido o non leggibile.'); evt.target.value=''; return; }
      const sheetName = wb.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval:'' });
      const result = { matchesAdded:0, allenamentiAdded:0, errors:[] };
      rows.forEach((row, idx)=>{
        const tipoEvento = String(row['Tipo Evento']||'').trim().toLowerCase();
        const data = parseImportDate(row['Data']);
        if(!data){ result.errors.push('Riga ' + (idx+2) + ': data mancante o non valida.'); return; }
        const ora = normalizeOra(row['Ora']);
        if(tipoEvento==='allenamento'){
          const exists = state.allenamenti.some(a=>a.data===data);
          if(exists){ result.errors.push('Riga ' + (idx+2) + ': allenamento del ' + data + ' già presente, saltato.'); return; }
          state.allenamenti.push({ id: uid(), data, ora, presenze: {} });
          result.allenamentiAdded++;
        } else if(tipoEvento==='partita'){
          const avversario = String(row['Avversario']||'').trim();
          if(!avversario){ result.errors.push('Riga ' + (idx+2) + ': partita senza avversario, saltata.'); return; }
          const sede = String(row['Sede']||'').trim()==='Trasferta' ? 'Trasferta' : 'Casa';
          const tipo = String(row['Tipo Partita']||'').trim()==='Amichevole' ? 'Amichevole' : 'Campionato';
          state.matches.push({
            id: uid(), avversario, data, ora, sede, tipo,
            convocati: [], numeriGara: {},
            formazioneNostra: defaultFormazioneNostraForNewMatch(),
            formazioneAvversaria: { modulo:'', chips:[], arrows:[], noteCaratteristiche:'', notePiano:'' },
            statistiche: {}, golFatti: [], golSubiti: [],
            valutazioni: { nostraSquadra:{voto:null,note:''}, nostriGiocatori:{}, avversariSquadra:{voto:null,note:''}, avversariGiocatori:[] }
          });
          result.matchesAdded++;
        } else {
          result.errors.push('Riga ' + (idx+2) + ': "Tipo Evento" non riconosciuto (usa "Partita" o "Allenamento").');
        }
      });
      Promise.all([saveMatches(), saveAllenamenti()]).then(function(){
        renderView();
        alert('Import completato: ' + result.matchesAdded + ' partite e ' + result.allenamentiAdded + ' allenamenti aggiunti.' + (result.errors.length ? ('\n\nAvvisi:\n' + result.errors.join('\n')) : ''));
      });
    };
    reader.readAsBinaryString(file);
  });
  evt.target.value = '';
}

/* ---------- vista STATISTICHE (stagione, solo squadra) ---------- */
function keeperAtMinute(match, minuto){
  const keepers = (match.convocati||[])
    .map(id=>state.players.find(p=>p.id===id))
    .filter(p=>p && p.ruolo==='Por');
  if(keepers.length===0) return null;
  if(keepers.length===1) return keepers[0].id;
  const m = (minuto!=='' && minuto!=null) ? parseInt(minuto,10) : null;
  if(m!=null){
    for(const k of keepers){
      const s = match.statistiche[k.id] || {};
      const entrato = s.entrato!=='' && s.entrato!=null ? parseInt(s.entrato,10) : 0;
      const uscito = s.uscito!=='' && s.uscito!=null ? parseInt(s.uscito,10) : 999;
      if(m>=entrato && m<=uscito) return k.id;
    }
  }
  const starter = keepers.find(k=>{
    const s = match.statistiche[k.id]||{};
    return !s.entrato;
  });
  return starter ? starter.id : keepers[0].id;
}
function computeSeasonStats(){
  let golFattiTot=0, golSubitiTot=0;
  const tipologiaFatti = {};
  const tipologiaSubiti = {};
  const perPlayer = {};
  const perSede = { Casa: {partite:0, golFatti:0, golSubiti:0}, Trasferta: {partite:0, golFatti:0, golSubiti:0} };
  state.players.forEach(p=>{ perPlayer[p.id] = { nome:p.nome, convocazioni:0, titolare:0, subentrato:0, minutiTot:0, gol:0, golSubiti:0, assist:0, gialli:0, rossi:0, votiSum:0, votiCount:0 }; });

  const playedMatches = state.matches.filter(m=>computeMatchStato(m)==='Giocata');
  playedMatches.forEach(m=>{
    const sede = (m.sede==='Trasferta') ? 'Trasferta' : 'Casa';
    perSede[sede].partite++;
    perSede[sede].golFatti += (m.golFatti||[]).length;
    perSede[sede].golSubiti += (m.golSubiti||[]).length;
    (m.convocati||[]).forEach(pid=>{ if(perPlayer[pid]) perPlayer[pid].convocazioni++; });
    Object.keys(m.statistiche||{}).forEach(pid=>{
      const s = m.statistiche[pid];
      if(!perPlayer[pid] || !s) return;
      const enteredLate = s.entrato!=='' && s.entrato!=null && parseInt(s.entrato,10) > 0;
      if(enteredLate) perPlayer[pid].subentrato++; else perPlayer[pid].titolare++;
      const entrato = s.entrato!=='' && s.entrato!=null ? parseInt(s.entrato,10) : 0;
      const uscito = s.uscito!=='' && s.uscito!=null ? parseInt(s.uscito,10) : 90;
      const minuti = Math.max(0, uscito - entrato);
      perPlayer[pid].minutiTot += minuti || 0;
      if(s.cartellino && s.cartellino.tipo==='Giallo') perPlayer[pid].gialli++;
      if(s.cartellino && s.cartellino.tipo==='Rosso') perPlayer[pid].rossi++;
    });
    (m.golFatti||[]).forEach(g=>{
      golFattiTot++;
      tipologiaFatti[g.tipo] = (tipologiaFatti[g.tipo]||0)+1;
      if(g.marcatoreId && perPlayer[g.marcatoreId]) perPlayer[g.marcatoreId].gol++;
      if(g.assistId && perPlayer[g.assistId]) perPlayer[g.assistId].assist++;
    });
    (m.golSubiti||[]).forEach(g=>{
      golSubitiTot++;
      tipologiaSubiti[g.tipo] = (tipologiaSubiti[g.tipo]||0)+1;
      const keeperId = keeperAtMinute(m, g.minuto);
      if(keeperId && perPlayer[keeperId]) perPlayer[keeperId].golSubiti++;
    });
    const v = (m.valutazioni && m.valutazioni.nostriGiocatori) || {};
    Object.keys(v).forEach(pid=>{
      if(v[pid].voto && perPlayer[pid]){ perPlayer[pid].votiSum += parseFloat(v[pid].voto); perPlayer[pid].votiCount++; }
    });
  });

  return { golFattiTot, golSubitiTot, tipologiaFatti, tipologiaSubiti, perPlayer, perSede, partiteGiocate: playedMatches.length };
}
function statCardHTML(label, value){
  return '<div class="stat-card"><div class="stat-card-value">' + value + '</div><div class="stat-card-label">' + esc(label) + '</div></div>';
}
function typeColorList(obj){
  const palette = {
    'Azione':'#4FA8E0', 'Rigore':'#E4C13B', 'Punizione diretta':'#E0A458', 'Punizione indiretta':'#8CA0AF',
    "Calcio d'angolo":'#3E8E63', 'Autogol avversario':'#C97B4A', 'Autogol nostro':'#C1443C'
  };
  return Object.keys(obj).map(k=>({ label:k, value:obj[k], color: palette[k] || '#8CA0AF' }));
}
function legendHTML(items){
  const total = items.reduce((s,d)=>s+d.value,0) || 1;
  if(items.length===0) return '<p class="hint">Nessun dato.</p>';
  return '<div class="chart-legend">' + items.map(d=>
    '<div class="legend-item"><span class="legend-dot" style="background:'+d.color+'"></span>' + esc(d.label) + ' — ' + d.value + ' (' + Math.round(d.value/total*100) + '%)</div>'
  ).join('') + '</div>';
}
function barChartSVG(data, opts){
  opts = opts||{};
  const w = opts.width||400, h = opts.height||200;
  const pad = 30;
  const max = Math.max(1, ...data.map(d=>d.value));
  if(data.length===0) return '<p class="hint">Nessun dato.</p>';
  const bw = (w - pad*2) / data.length;
  let bars = '';
  data.forEach((d,i)=>{
    const bh = (d.value/max) * (h - 50);
    const x = pad + i*bw + bw*0.15;
    const y = h - 30 - bh;
    bars += '<rect x="' + x + '" y="' + y + '" width="' + (bw*0.7) + '" height="' + bh + '" fill="' + (d.color||'#4FA8E0') + '" rx="2"/>';
    bars += '<text x="' + (x+bw*0.35) + '" y="' + (h-14) + '" text-anchor="middle" font-size="9" fill="#8CA0AF" font-family="Inter">' + esc(d.label) + '</text>';
    bars += '<text x="' + (x+bw*0.35) + '" y="' + (y-4) + '" text-anchor="middle" font-size="10" fill="#F4F1EA" font-family="Oswald">' + d.value + '</text>';
  });
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto;">' + bars + '</svg>';
}
function donutChartSVG(data, size){
  const total = data.reduce((s,d)=>s+d.value,0);
  if(total===0) return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '"><circle cx="' + size/2 + '" cy="' + size/2 + '" r="' + (size/2-4) + '" fill="none" stroke="#223243" stroke-width="' + (size*0.18) + '"/></svg>';
  const r = size/2 - 4, cx = size/2, cy = size/2, innerR = r*0.55;
  let angle = -Math.PI/2;
  let paths = '';
  data.forEach(d=>{
    if(d.value===0) return;
    const frac = d.value/total;
    const a0 = angle, a1 = angle + frac*2*Math.PI;
    const x0 = cx + r*Math.cos(a0), y0 = cy + r*Math.sin(a0);
    const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
    const ix0 = cx + innerR*Math.cos(a0), iy0 = cy + innerR*Math.sin(a0);
    const ix1 = cx + innerR*Math.cos(a1), iy1 = cy + innerR*Math.sin(a1);
    const large = (a1-a0) > Math.PI ? 1 : 0;
    paths += '<path d="M ' + x0 + ' ' + y0 + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x1 + ' ' + y1 + ' L ' + ix1 + ' ' + iy1 + ' A ' + innerR + ' ' + innerR + ' 0 ' + large + ' 0 ' + ix0 + ' ' + iy0 + ' Z" fill="' + d.color + '"/>';
    angle = a1;
  });
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' + paths + '</svg>';
}
function renderStatisticheView(){
  const s = computeSeasonStats();
  const barFattiSubiti = barChartSVG([
    { label:'Fatti', value:s.golFattiTot, color:'#3E8E63' },
    { label:'Subiti', value:s.golSubitiTot, color:'#C1443C' }
  ], { width:280, height:180 });
  const donutFatti = donutChartSVG(typeColorList(s.tipologiaFatti), 150);
  const donutSubiti = donutChartSVG(typeColorList(s.tipologiaSubiti), 150);

  return '' +
  '<div class="card">' +
    '<div class="card-header-row"><h2>Statistiche stagione '+esc(getAppUser().stagioneEtichetta)+'</h2>' +
      '<div class="pitch-actions"><button class="btn btn-small" onclick="exportSeasonPDF()">Esporta PDF</button><button class="btn btn-small" onclick="exportSeasonXLSX()">Esporta XLSX</button><button class="btn btn-small" onclick="exportPageImage(\'statistiche\')">Esporta immagine</button></div>' +
    '</div>' +
    '<div class="stat-cards">' +
      statCardHTML('Partite giocate', s.partiteGiocate) +
      statCardHTML('Gol fatti', s.golFattiTot) +
      statCardHTML('Gol subiti', s.golSubitiTot) +
      statCardHTML('Differenza reti', (s.golFattiTot - s.golSubitiTot)) +
    '</div>' +
    '<p class="hint" style="margin-top:10px;">Le statistiche per singolo giocatore sono nella tab "Rosa".</p>' +
  '</div>' +
  '<div class="card"><h3>Fatti vs subiti</h3>' + barFattiSubiti + '</div>' +
  '<div class="card"><h3>Casa vs trasferta</h3>' +
    '<table class="stats-table"><thead><tr><th>Sede</th><th>Partite</th><th>Gol fatti</th><th>Gol subiti</th><th>Differenza</th></tr></thead><tbody>' +
      '<tr><td>Casa</td><td>'+s.perSede.Casa.partite+'</td><td>'+s.perSede.Casa.golFatti+'</td><td>'+s.perSede.Casa.golSubiti+'</td><td>'+(s.perSede.Casa.golFatti-s.perSede.Casa.golSubiti)+'</td></tr>' +
      '<tr><td>Trasferta</td><td>'+s.perSede.Trasferta.partite+'</td><td>'+s.perSede.Trasferta.golFatti+'</td><td>'+s.perSede.Trasferta.golSubiti+'</td><td>'+(s.perSede.Trasferta.golFatti-s.perSede.Trasferta.golSubiti)+'</td></tr>' +
    '</tbody></table>' +
  '</div>' +
  '<div class="grid-2">' +
    '<div class="card"><h3>Tipologia gol fatti</h3><div class="donut-row">' + donutFatti + legendHTML(typeColorList(s.tipologiaFatti)) + '</div></div>' +
    '<div class="card"><h3>Tipologia gol subiti</h3><div class="donut-row">' + donutSubiti + legendHTML(typeColorList(s.tipologiaSubiti)) + '</div></div>' +
  '</div>';
}

/* ---------- export: stampa / PDF ---------- */
function ensureHtml2Canvas(cb){
  if(typeof html2canvas !== 'undefined'){ cb(); return; }
  alert('La libreria per esportare le immagini non è disponibile in questo momento (serve una connessione). Riprova.');
}
function exportPageImage(filenamePrefix){
  const el = document.getElementById('view-content');
  if(!el){ alert('Elemento da esportare non trovato.'); return; }
  ensureHtml2Canvas(function(){
    const bgColor = getComputedStyle(document.body).backgroundColor || '#0B141C';
    html2canvas(el, { backgroundColor: bgColor, scale: 2 }).then(function(canvas){
      const link = document.createElement('a');
      link.download = (filenamePrefix||'pagina') + '-' + new Date().toISOString().slice(0,10) + '.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(function(err){
      console.error('export image error', err);
      alert('Esportazione immagine non riuscita.');
    });
  });
}
function exportPDF(title, bodyHtml){
  const area = document.getElementById('print-area');
  area.innerHTML = '<h1>' + esc(title) + '</h1>' + bodyHtml;
  window.print();
}
function buildRosterPrintHTML(includeStats){
  const rows = state.players.slice().sort((a,b)=>a.nome.localeCompare(b.nome));
  if(!includeStats){
    return '<table class="print-table"><thead><tr><th>Nome</th><th>Ruolo</th><th>2° ruolo</th><th>Piede</th><th>Anno</th></tr></thead><tbody>' +
      rows.map(p=>'<tr><td>'+esc(displayName(p.nome))+'</td><td>'+esc(p.ruolo)+'</td><td>'+esc(p.secondoRuolo||'')+'</td><td>'+esc(p.piede||'')+'</td><td>'+esc(p.annoNascita||'')+'</td></tr>').join('') +
    '</tbody></table>';
  }
  const stats = computeSeasonStats();
  return '<table class="print-table"><thead><tr><th>Nome</th><th>Ruolo</th><th>2° ruolo</th><th>Piede</th><th>Anno</th><th>Convoc.</th><th>Tit.</th><th>Subentr.</th><th>Minuti</th><th>Gol</th><th>Gol sub.</th><th>Assist</th><th>Gialli</th><th>Rossi</th><th>Voto medio</th><th>% Pres.</th></tr></thead><tbody>' +
    rows.map(p=>{ const st=stats.perPlayer[p.id]||{}; const pp=computePresenzaPercent(p.id); return '<tr><td>'+esc(displayName(p.nome))+'</td><td>'+esc(p.ruolo)+'</td><td>'+esc(p.secondoRuolo||'')+'</td><td>'+esc(p.piede||'')+'</td><td>'+esc(p.annoNascita||'')+'</td><td>'+(st.convocazioni||0)+'</td><td>'+(st.titolare||0)+'</td><td>'+(st.subentrato||0)+'</td><td>'+(st.minutiTot||0)+'</td><td>'+(st.gol||0)+'</td><td>'+(st.golSubiti||0)+'</td><td>'+(st.assist||0)+'</td><td>'+(st.gialli||0)+'</td><td>'+(st.rossi||0)+'</td><td>'+(st.votiCount?(st.votiSum/st.votiCount).toFixed(1):'-')+'</td><td>'+(pp!=null?pp+'%':'-')+'</td></tr>'; }).join('') +
  '</tbody></table>';
}
function exportRosaPDF(){
  const includeStats = document.getElementById('rosa-export-stats').checked;
  exportPDF('Rosa '+getAppUser().stagioneEtichetta, buildRosterPrintHTML(includeStats));
}
function buildLavagnaPrintSVG(match){
  const slots = match.formazioneNostra.slots || [];
  const chips = match.formazioneNostra.chips || [];
  const filled = new Set(chips.map(c=>c.numero));
  const emptySvg = slots.filter(s=>!filled.has(s.numero)).map(s=>
    '<circle cx="'+s.x+'" cy="'+s.y+'" r="2.6" fill="none" stroke="#4FA8E0" stroke-width="0.3" stroke-dasharray="1,0.8" opacity="0.5"/>'
  ).join('');
  const chipsSvg = chips.map(c=>{
    const p = state.players.find(pl=>pl.id===c.playerId);
    const cognome = p ? surnameOf(p.nome) : '';
    return '<g transform="translate('+c.x+','+c.y+')">' +
      '<circle r="2.6" fill="#0E2233" stroke="#4FA8E0" stroke-width="0.35"/>' +
      '<text text-anchor="middle" dy="0.9" font-size="2.6" fill="#F4F1EA" font-family="Arial, sans-serif" font-weight="bold">'+esc(c.numero)+'</text>' +
      '<text text-anchor="middle" dy="4.3" font-size="1.7" fill="#000">'+esc(cognome)+'</text>' +
    '</g>';
  }).join('');
  return '<svg viewBox="0 0 68 105" style="width:100%;max-width:260px;height:auto;display:block;">' + pitchMarkingsSVG() + emptySvg + chipsSvg + '</svg>';
}
function buildMatchPrintHTML(match){
  const assignedIds = new Set((match.formazioneNostra.chips||[]).map(c=>c.playerId));
  const benchIds = match.convocati.filter(id=>!assignedIds.has(id));
  const benchHtml = benchIds.length ? ('<ul>' + benchIds.map(id=>{
    const p = state.players.find(pl=>pl.id===id);
    return p ? '<li>'+esc(numGara(match,id))+' — '+esc(displayName(p.nome))+'</li>' : '';
  }).join('') + '</ul>') : '<p>—</p>';
  let html = '<p><strong>Avversario:</strong> ' + esc(match.avversario) + ' — <strong>Data:</strong> ' + formatDate(match.data) + (match.ora?(' '+esc(match.ora)):'') + ' — <strong>Sede:</strong> ' + esc(match.sede||'Casa') + '</p>';
  html += '<div style="display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap; margin-top:10px;">' +
    '<div style="width:260px; flex-shrink:0;">' + buildLavagnaPrintSVG(match) + '</div>' +
    '<div style="flex:1; min-width:160px;"><h2 style="margin-top:0;">Panchina</h2>' + benchHtml + '</div>' +
  '</div>';
  html += '<h2>Piano partita</h2><p>' + (match.formazioneAvversaria.notePiano ? esc(match.formazioneAvversaria.notePiano).replace(/\n/g,'<br>') : '—') + '</p>';
  html += '<h2>Note avversari</h2><p>' + (match.formazioneAvversaria.noteCaratteristiche ? esc(match.formazioneAvversaria.noteCaratteristiche).replace(/\n/g,'<br>') : '—') + '</p>';
  return html;
}
function exportMatchPDF(matchId){
  const match = getMatch(matchId);
  exportPDF('Partita vs ' + match.avversario, buildMatchPrintHTML(match));
}
function buildSeasonStatsPrintHTML(){
  const s = computeSeasonStats();
  let html = '<p><strong>Partite giocate:</strong> ' + s.partiteGiocate + ' — <strong>Gol fatti:</strong> ' + s.golFattiTot + ' — <strong>Gol subiti:</strong> ' + s.golSubitiTot + ' — <strong>Differenza reti:</strong> ' + (s.golFattiTot - s.golSubitiTot) + '</p>';
  html += '<h2>Casa vs trasferta</h2><table class="print-table"><thead><tr><th>Sede</th><th>Partite</th><th>Gol fatti</th><th>Gol subiti</th></tr></thead><tbody>' +
    '<tr><td>Casa</td><td>'+s.perSede.Casa.partite+'</td><td>'+s.perSede.Casa.golFatti+'</td><td>'+s.perSede.Casa.golSubiti+'</td></tr>' +
    '<tr><td>Trasferta</td><td>'+s.perSede.Trasferta.partite+'</td><td>'+s.perSede.Trasferta.golFatti+'</td><td>'+s.perSede.Trasferta.golSubiti+'</td></tr>' +
  '</tbody></table>';
  html += '<h2>Tipologia gol fatti</h2><ul>' + Object.entries(s.tipologiaFatti).map(([k,v])=>'<li>'+esc(k)+': '+v+'</li>').join('') + '</ul>';
  html += '<h2>Tipologia gol subiti</h2><ul>' + Object.entries(s.tipologiaSubiti).map(([k,v])=>'<li>'+esc(k)+': '+v+'</li>').join('') + '</ul>';
  return html;
}
function exportSeasonPDF(){ exportPDF('Statistiche stagione '+getAppUser().stagioneEtichetta, buildSeasonStatsPrintHTML()); }

/* ---------- backup completo ---------- */
function exportBackup(){
  const backup = {
    kind: 'lavagna-tattica-backup',
    version: 2,
    exportedAt: new Date().toISOString(),
    players: state.players,
    matches: state.matches,
    allenamenti: state.allenamenti,
    pianoSquadra: state.pianoSquadra,
    formazioneDefault: state.formazioneDefault
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const backupNamePart = (getAppUser().stagioneSocieta+'-'+getAppUser().stagioneEtichetta).replace(/[^a-z0-9]+/gi,'-').toLowerCase() || 'squadra';
  a.download = 'backup-' + backupNamePart + '-' + new Date().toISOString().slice(0,10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function triggerImportBackup(){
  document.getElementById('backup-file-input').click();
}
function handleBackupFile(evt){
  const file = evt.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    let data;
    try{ data = JSON.parse(e.target.result); }
    catch(err){ alert('File non valido: non è un JSON leggibile.'); evt.target.value=''; return; }
    if(!data || !Array.isArray(data.players) || !Array.isArray(data.matches) || !Array.isArray(data.allenamenti)){
      alert('File non valido: non ha la struttura di un backup di questa app.');
      evt.target.value='';
      return;
    }
    const when = data.exportedAt ? new Date(data.exportedAt).toLocaleString('it-IT') : 'data sconosciuta';
    showConfirmModal('Importare questo backup (salvato il ' + when + ')? Sovrascrive rosa, partite e allenamenti attuali e non è annullabile.', async function(){
      state.players = data.players;
      state.matches = data.matches;
      state.allenamenti = data.allenamenti;
      state.pianoSquadra = data.pianoSquadra || {};
      state.formazioneDefault = data.formazioneDefault || { modulo:'', slots:[], chips:[] };
      state.players.forEach(migratePlayer);
      state.matches.forEach(migrateMatch);
      state.allenamenti.forEach(migrateAllenamento);
      await savePlayers();
      await saveMatches();
      await saveAllenamenti();
      await savePianoSquadra();
      await saveFormazioneDefault();
      renderView();
      alert('Backup importato: ' + state.players.length + ' giocatori, ' + state.matches.length + ' partite, ' + state.allenamenti.length + ' allenamenti.');
    }, 'Importa e sovrascrivi');
    evt.target.value='';
  };
  reader.readAsText(file);
}

/* ---------- export: XLSX ---------- */
function ensureXLSX(cb){
  if(typeof XLSX !== 'undefined'){ cb(); return; }
  alert('La libreria per esportare in XLSX non è disponibile in questo momento (serve una connessione). Riprova, oppure usa "Esporta PDF".');
}
function exportRosaXLSX(){
  const includeStats = document.getElementById('rosa-export-stats').checked;
  ensureXLSX(function(){
    const stats = includeStats ? computeSeasonStats() : null;
    const rows = state.players.slice().sort((a,b)=>a.nome.localeCompare(b.nome)).map(p=>{
      const base = { Nome: displayName(p.nome), Ruolo: p.ruolo, 'Secondo ruolo': p.secondoRuolo||'', Piede: p.piede||'', 'Anno nascita': p.annoNascita||'' };
      if(!includeStats) return base;
      const st = stats.perPlayer[p.id]||{};
      const pp = computePresenzaPercent(p.id);
      return Object.assign(base, {
        Convocazioni: st.convocazioni||0, Titolare: st.titolare||0, Subentrato: st.subentrato||0, Minuti: st.minutiTot||0,
        Gol: st.gol||0, 'Gol subiti': st.golSubiti||0, Assist: st.assist||0, Gialli: st.gialli||0, Rossi: st.rossi||0,
        'Voto medio': st.votiCount ? (st.votiSum/st.votiCount).toFixed(1) : '', '% Presenza': pp!=null ? pp : ''
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows.length?rows:[{Nome:''}]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rosa');
    XLSX.writeFile(wb, 'rosa-'+(getAppUser().stagioneEtichetta.replace(/[^a-z0-9]+/gi,'-').toLowerCase()||'stagione')+'.xlsx');
  });
}
function exportMatchXLSX(matchId){
  const match = getMatch(matchId);
  ensureXLSX(function(){
    const wb = XLSX.utils.book_new();
    const starters = (match.formazioneNostra.chips||[]).slice().sort((a,b)=>a.numero-b.numero).map(c=>{
      const p = state.players.find(pl=>pl.id===c.playerId);
      return { Numero: c.numero, Nome: p?displayName(p.nome):'' };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(starters.length?starters:[{Numero:'',Nome:''}]), 'Formazione');
    const assignedIds = new Set((match.formazioneNostra.chips||[]).map(c=>c.playerId));
    const benchIds = match.convocati.filter(id=>!assignedIds.has(id));
    const bench = benchIds.map(id=>{ const p=state.players.find(pl=>pl.id===id); return { Numero: numGara(match,id), Nome: p?displayName(p.nome):'' }; });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bench.length?bench:[{Numero:'',Nome:''}]), 'Panchina');
    const noteRows = [{ 'Piano partita': match.formazioneAvversaria.notePiano||'', 'Note avversari': match.formazioneAvversaria.noteCaratteristiche||'' }];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(noteRows), 'Note');
    const safeName = match.avversario.replace(/[^a-z0-9]+/gi,'-');
    XLSX.writeFile(wb, 'partita-' + safeName + '.xlsx');
  });
}
function exportSeasonXLSX(){
  const s = computeSeasonStats();
  ensureXLSX(function(){
    const wb = XLSX.utils.book_new();
    const squadraRows = [{ 'Partite giocate': s.partiteGiocate, 'Gol fatti': s.golFattiTot, 'Gol subiti': s.golSubitiTot, 'Differenza reti': s.golFattiTot-s.golSubitiTot }];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(squadraRows), 'Squadra');
    const sedeRows = [
      { Sede:'Casa', Partite:s.perSede.Casa.partite, 'Gol fatti':s.perSede.Casa.golFatti, 'Gol subiti':s.perSede.Casa.golSubiti },
      { Sede:'Trasferta', Partite:s.perSede.Trasferta.partite, 'Gol fatti':s.perSede.Trasferta.golFatti, 'Gol subiti':s.perSede.Trasferta.golSubiti }
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sedeRows), 'Casa-Trasferta');
    const tipoRows = [];
    Object.entries(s.tipologiaFatti).forEach(([k,v])=>tipoRows.push({ Categoria:'Fatti', Tipo:k, Numero:v }));
    Object.entries(s.tipologiaSubiti).forEach(([k,v])=>tipoRows.push({ Categoria:'Subiti', Tipo:k, Numero:v }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tipoRows.length?tipoRows:[{Categoria:'',Tipo:'',Numero:''}]), 'Tipologia gol');
    XLSX.writeFile(wb, 'statistiche-'+(getAppUser().stagioneEtichetta.replace(/[^a-z0-9]+/gi,'-').toLowerCase()||'stagione')+'.xlsx');
  });
}

/* ---------- SCHEMA: metodologia sedute (libreria esercizi, disegnatore, sedute) ---------- */
async function apiGet(url){ const r = await fetch(url); return r.json(); }
async function apiPost(url, body){ const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }); return r.json(); }
async function apiPatch(url, body){ const r = await fetch(url, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }); return r.json(); }
async function apiDelete(url){ const r = await fetch(url, { method:'DELETE' }); return r.json(); }
function starInputHTML(){
  let out = '<span class="star-input">';
  for(let i=1;i<=5;i++){
    out += '<button type="button" class="star-input-btn" onclick="submitSchemaRating('+i+')" aria-label="'+i+' stelle">' + starIconSVG('var(--yellow)', 20) + '</button>';
  }
  out += '</span>';
  return out;
}
function showSchemaLockedHint(){
  alert('Modulo Schema in arrivo — non ancora disponibile su questo account.');
}
/* icone disegnatore (stroke-based, coerenti con SIDE_NAV_ICONS) — grandi quanto i pallini colore */
const SCHEMA_ICON_GIOCATORE = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>';
const SCHEMA_ICON_PALLONE = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5l3.8 2.8-1.4 4.4h-4.8l-1.4-4.4z"/></svg>';
const SCHEMA_ICON_MOVIMENTO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 18L18 6" stroke-dasharray="3,2.4"/><path d="M12.5 6H18v5.5"/></svg>';
const SCHEMA_ICON_PASSAGGIO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 18L18 6"/><path d="M12.5 6H18v5.5"/></svg>';
const SCHEMA_ICON_PALLONE_ALTO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 19Q11 4 20 10"/><path d="M15.5 7.5l4.5 2.5-2.3 4.3"/></svg>';
const SCHEMA_ICON_DIVISORE = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2.5,2.5"><path d="M4 20L20 4"/></svg>';
const SCHEMA_ICON_GOMMA = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 3.5l3 3L10 17H6v-4z"/><path d="M13 7l4 4"/><path d="M4 21h9"/></svg>';

/* ---------- navigazione interna (nessun page load: resta nella SPA) ---------- */
async function ensureSchemaObjectives(){
  if(state.schema.objectivesLoaded) return;
  const res = await apiGet('/api/schema/objectives');
  state.schema.objectives = res.objectives || [];
  state.schema.objectivesLoaded = true;
}
async function ensureSchemaTags(){
  const res = await apiGet('/api/schema/tags');
  state.schema.availableTags = res.tags || [];
  state.schema.tagsLoaded = true;
}
async function openSchemaLibrary(){
  state.currentView = 'schema';
  state.schema.view = 'library';
  state.currentMatchId = null;
  state.currentAllenamentoId = null;
  await ensureSchemaObjectives();
  await ensureSchemaTags();
  await loadSchemaLibrary();
  renderView();
}
async function openSchemaNewExercise(){
  state.currentView = 'schema';
  state.schema.view = 'new';
  renderView();
}
async function openSchemaExercise(id){
  state.currentView = 'schema';
  state.schema.view = 'sheet';
  state.schema.activeLivelloId = null;
  await ensureSchemaTags();
  await loadSchemaExercise(id);
  renderView();
}
async function openSchemaSessions(){
  state.currentView = 'schema';
  state.schema.view = 'sessions';
  await ensureSchemaObjectives();
  await loadSchemaSessions();
  renderView();
}
async function openSchemaSessionBuilder(id){
  state.currentView = 'schema';
  state.schema.view = 'sessionBuilder';
  await ensureSchemaObjectives();
  await loadSchemaLibrary();
  await loadSchemaSessionDetail(id);
  renderView();
}

/* ---------- dispatch ---------- */
function renderSchemaView(){
  const v = state.schema.view;
  let html;
  if(v==='new') html = renderSchemaNewExerciseForm();
  else if(v==='sheet') html = renderSchemaExerciseSheet();
  else if(v==='sessions') html = renderSchemaSessionsList();
  else if(v==='sessionBuilder') html = renderSchemaSessionBuilder();
  else html = renderSchemaLibrary();
  return html + schemaLivelloPickerHTML();
}
function attachSchemaInteractions(){
  if(state.schema.view==='sheet') attachSchemaFieldInteractions();
}
function schemaSubNavHTML(active){
  return '<div class="pitch-actions" style="margin-bottom:12px;">' +
    '<button class="btn btn-small '+(active==='library'?'btn-active':'')+'" onclick="openSchemaLibrary()">Libreria esercizi</button>' +
    '<button class="btn btn-small '+(active==='sessions'?'btn-active':'')+'" onclick="openSchemaSessions()">Sedute</button>' +
  '</div>';
}

/* ---------- libreria esercizi ---------- */
async function loadSchemaLibrary(){
  const s = state.schema;
  const params = new URLSearchParams();
  if(s.filterSearch) params.set('search', s.filterSearch);
  if(s.filterTags.length) params.set('tags', s.filterTags.join(','));
  const res = await apiGet('/api/schema/exercises?'+params.toString());
  s.exercises = res.exercises || [];
}
function toggleSchemaFilterTag(tag){
  const s = state.schema;
  s.filterTags = s.filterTags.includes(tag) ? s.filterTags.filter(t=>t!==tag) : s.filterTags.concat(tag);
  loadSchemaLibrary().then(renderView);
}
function renderSchemaLibrary(){
  const s = state.schema;
  const tagChips = s.availableTags.map(t=>
    '<button type="button" class="schema-tag-chip '+(s.filterTags.includes(t)?'schema-tag-chip-active':'')+'" onclick="toggleSchemaFilterTag(\''+esc(t)+'\')">'+esc(t)+'</button>'
  ).join('');
  return schemaSubNavHTML('library') +
    '<div class="card">' +
      '<div class="card-header-row"><h2>Libreria esercizi</h2>' +
        '<div class="pitch-actions"><button class="btn btn-primary btn-small" onclick="openSchemaNewExercise()">+ Nuovo esercizio</button></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="field field-grow"><label>Cerca</label><input id="schema-filter-search" type="text" placeholder="titolo o etichetta" value="'+esc(s.filterSearch)+'" oninput="onSchemaFilterChange()"></div>' +
      '</div>' +
      (s.availableTags.length ? '<div class="field"><label>Etichette</label><div class="schema-tag-chip-row">'+tagChips+'</div></div>' : '') +
      '<div class="schema-exercise-grid">' + renderSchemaExerciseCards() + '</div>' +
    '</div>';
}
function renderSchemaExerciseCards(){
  const s = state.schema;
  if(s.exercises.length===0) return '<p class="hint">Nessun esercizio ancora. Crea il primo.</p>';
  return s.exercises.map(e=>{
    const tags = schemaExerciseTags(e);
    const badge = e.livelli.length>1 ? '<span class="pill">'+e.livelli.length+' livelli</span>' : '';
    return '<div class="schema-exercise-card" onclick="openSchemaExercise(\''+e.id+'\')">' +
      '<div class="schema-exercise-card-head"><strong>'+esc(e.titolo)+'</strong>'+badge+'</div>' +
      '<div class="hint">'+(tags.length ? esc(tags.join(', ')) : 'Nessuna etichetta')+'</div>' +
      '<div class="schema-exercise-card-foot">' + (e.votoMedio!=null ? starRatingHTML(e.votoMedio, 12) : '<span class="hint">Non valutato</span>') + '</div>' +
    '</div>';
  }).join('');
}
let schemaFilterDebounce = null;
function onSchemaFilterChange(){
  const s = state.schema;
  s.filterSearch = document.getElementById('schema-filter-search').value;
  clearTimeout(schemaFilterDebounce);
  schemaFilterDebounce = setTimeout(async () => { await loadSchemaLibrary(); renderView(); }, 200);
}

/* ---------- nuovo esercizio ---------- */
function renderSchemaNewExerciseForm(){
  return schemaSubNavHTML('library') +
    '<div class="card">' +
      '<div class="card-header-row"><h2>Nuovo esercizio</h2><button class="btn btn-small" onclick="openSchemaLibrary()">← Libreria</button></div>' +
      '<div class="form-row">' +
        '<div class="field field-grow"><label>Titolo</label><input id="schema-new-ex-titolo" type="text"></div>' +
        '<div class="field"><label>N. giocatori</label><input id="schema-new-ex-numgiocatori" type="number" min="1" value="8"></div>' +
      '</div>' +
      '<div class="field"><label>Descrizione</label><textarea id="schema-new-ex-descrizione" rows="3"></textarea></div>' +
      '<button class="btn btn-primary" onclick="createSchemaExercise()">Crea esercizio</button>' +
    '</div>';
}
async function createSchemaExercise(){
  const titolo = document.getElementById('schema-new-ex-titolo').value.trim();
  if(!titolo){ alert('Il titolo è obbligatorio.'); return; }
  const res = await apiPost('/api/schema/exercises', {
    titolo,
    descrizione: document.getElementById('schema-new-ex-descrizione').value,
    numeroGiocatoriBase: document.getElementById('schema-new-ex-numgiocatori').value,
  });
  if(res.exercise) openSchemaExercise(res.exercise.id);
  else alert('Errore: '+(res.error||'sconosciuto'));
}

/* ---------- scheda esercizio (con livelli di progressione) ---------- */
async function loadSchemaExercise(id){
  const res = await apiGet('/api/schema/exercises/'+id);
  state.schema.currentExercise = res.exercise || null;
  state.schema.exerciseId = id;
  if(res.exercise && res.exercise.livelli.length){
    state.schema.activeLivelloId = res.exercise.livelli[0].id;
  }
}
function schemaActiveLivello(){
  const e = state.schema.currentExercise;
  if(!e || !e.livelli.length) return null;
  return e.livelli.find(l=>l.id===state.schema.activeLivelloId) || e.livelli[0];
}
function parseSchemaCampo(livello){
  let d;
  try { d = JSON.parse((livello && livello.schemaCampo) || '{}'); } catch { d = {}; }
  if(!Array.isArray(d.chips)) d.chips = [];
  if(!Array.isArray(d.arrows)) d.arrows = [];
  // Default difensivi per i dati creati prima di questo round (chip/frecce senza tipo/colore/id).
  d.chips = d.chips.map(c=>({
    id: c.id,
    x: c.x,
    y: c.y,
    tipo: c.tipo==='pallone' ? 'pallone' : 'giocatore',
    color: c.color || SCHEMA_COLORS[0],
    numero: c.numero!=null ? c.numero : null,
    label: c.label || '',
  }));
  d.arrows = d.arrows.map(a=>({
    id: a.id || uid(),
    x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2,
    points: Array.isArray(a.points) && a.points.length>=2 ? a.points : null,
    tipo: ['movimento','passaggio','pallone-alto','divisore'].includes(a.tipo) ? a.tipo : 'passaggio',
    color: a.color || SCHEMA_COLORS[0],
  }));
  return d;
}
function schemaColorMarkerId(color){
  const idx = SCHEMA_COLORS.indexOf(color);
  return 'schema-arrowhead-'+(idx>=0?idx:0);
}
function schemaFieldDefsSVG(){
  const markers = SCHEMA_COLORS.map((c,i)=>
    '<marker id="schema-arrowhead-'+i+'" markerWidth="3" markerHeight="3" refX="2.4" refY="1.5" orient="auto"><path d="M0,0 L3,1.5 L0,3 Z" fill="'+c+'"/></marker>'
  ).join('');
  return '<defs>'+markers+'</defs>';
}
function schemaChipSVG(c, w){
  if(c.tipo==='pallone'){
    const r = w*0.028;
    return '<g class="schema-chip" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+')">' +
      '<circle r="'+r+'" fill="#F4F1EA" stroke="#0B141C" stroke-width="'+(w*0.004)+'"/>' +
      '<path d="M0,'+(-r*0.5)+' L'+(r*0.45)+',0 L0,'+(r*0.5)+' L'+(-r*0.45)+',0 Z" fill="none" stroke="#0B141C" stroke-width="'+(w*0.003)+'"/>' +
    '</g>';
  }
  const r = w*0.04;
  const numeroLabel = c.numero!=null ? String(c.numero) : (c.label ? c.label.charAt(0).toUpperCase() : '');
  return '<g class="schema-chip" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+')">' +
    '<circle r="'+r+'" fill="'+c.color+'" stroke="#0B141C" stroke-width="'+(w*0.005)+'"/>' +
    (numeroLabel ? '<text text-anchor="middle" dy="'+(w*0.014)+'" font-size="'+(w*0.045)+'" fill="#0B141C" font-family="Oswald, sans-serif" font-weight="600">'+esc(numeroLabel)+'</text>' : '') +
    (c.label ? '<text text-anchor="middle" dy="'+(w*0.09)+'" font-size="'+(w*0.03)+'" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="'+(w*0.012)+'">'+esc(c.label)+'</text>' : '') +
  '</g>';
}
function smoothPathFromPoints(points){
  if(points.length<2) return '';
  if(points.length===2) return 'M'+points[0].x+','+points[0].y+' L'+points[1].x+','+points[1].y;
  let d = 'M'+points[0].x+','+points[0].y;
  for(let i=1;i<points.length-1;i++){
    const midX = (points[i].x+points[i+1].x)/2, midY = (points[i].y+points[i+1].y)/2;
    d += ' Q'+points[i].x+','+points[i].y+' '+midX+','+midY;
  }
  d += ' L'+points[points.length-1].x+','+points[points.length-1].y;
  return d;
}
function schemaArrowGeometry(a){
  // La freccia "pallone alto" segue la curva disegnata a mano; se manca (dati vecchi)
  // ricade su una bezier automatica calcolata solo da inizio/fine.
  if(a.tipo==='pallone-alto'){
    if(a.points) return { tag:'path', d: smoothPathFromPoints(a.points) };
    const mx=(a.x1+a.x2)/2, my=(a.y1+a.y2)/2;
    const dx=a.x2-a.x1, dy=a.y2-a.y1;
    const len=Math.hypot(dx,dy)||1;
    const offset = len*0.25;
    const cx = mx - (dy/len)*offset, cy = my + (dx/len)*offset;
    return { tag:'path', d: 'M'+a.x1+','+a.y1+' Q'+cx+','+cy+' '+a.x2+','+a.y2 };
  }
  return { tag:'line', x1:a.x1, y1:a.y1, x2:a.x2, y2:a.y2 };
}
function schemaArrowGroupSVG(a, w){
  const strokeW = w*0.008;
  const geo = schemaArrowGeometry(a);
  const shapeAttrs = geo.tag==='path' ? 'd="'+geo.d+'"' : 'x1="'+geo.x1+'" y1="'+geo.y1+'" x2="'+geo.x2+'" y2="'+geo.y2+'"';
  let visible;
  if(a.tipo==='divisore'){
    visible = '<'+geo.tag+' '+shapeAttrs+' fill="none" stroke="#F4F1EA" stroke-width="'+strokeW+'" stroke-dasharray="'+(w*0.006)+','+(w*0.012)+'" opacity="0.65"/>';
  } else {
    const markerId = schemaColorMarkerId(a.color);
    const dash = a.tipo==='movimento' ? ' stroke-dasharray="'+(w*0.02)+','+(w*0.014)+'"' : '';
    visible = '<'+geo.tag+' '+shapeAttrs+' fill="none" stroke="'+a.color+'" stroke-width="'+strokeW+'"'+dash+' marker-end="url(#'+markerId+')"/>';
  }
  const hit = '<'+geo.tag+' '+shapeAttrs+' fill="none" stroke="transparent" stroke-width="'+(w*0.035)+'"/>';
  return '<g class="schema-arrow" data-id="'+a.id+'">'+visible+hit+'</g>';
}
function renderSchemaFieldSVG(exercise, livello){
  const data = parseSchemaCampo(livello);
  const w = exercise.larghezzaCampo || 20, h = exercise.lunghezzaCampo || 28;
  const chipsSvg = data.chips.map(c=>schemaChipSVG(c,w)).join('');
  const arrowsSvg = data.arrows.map(a=>schemaArrowGroupSVG(a,w)).join('');
  return '<svg id="schema-field-svg" viewBox="0 0 '+w+' '+h+'" class="pitch-svg schema-field-svg">' +
    schemaFieldDefsSVG() +
    '<rect x="0" y="0" width="'+w+'" height="'+h+'" fill="#1E5631" stroke="#F4F1EA" stroke-width="'+(w*0.005)+'"/>' +
    '<g class="arrows-layer">'+arrowsSvg+'</g>' +
    '<g class="chips-layer">'+chipsSvg+'</g>' +
  '</svg>';
}
function schemaToolbarHTML(){
  const s = state.schema;
  const colorSwatches = SCHEMA_COLORS.map(c=>
    '<button type="button" class="schema-color-swatch '+(s.activeColor===c?'schema-color-swatch-active':'')+'" style="background:'+c+';" onclick="setSchemaActiveColor(\''+c+'\')" title="Colore attivo"></button>'
  ).join('');
  const lineTypes = [
    ['movimento', SCHEMA_ICON_MOVIMENTO, 'Movimento'],
    ['passaggio', SCHEMA_ICON_PASSAGGIO, 'Passaggio / tiro'],
    ['pallone-alto', SCHEMA_ICON_PALLONE_ALTO, 'Pallone alto (disegna la curva)'],
    ['divisore', SCHEMA_ICON_DIVISORE, 'Divisore spazi'],
  ];
  const lineButtons = lineTypes.map(([key,icon,title])=>
    '<button class="btn btn-small btn-icon '+(s.drawMode && s.activeLineType===key?'btn-active':'')+'" onclick="setSchemaLineTypeAndDraw(\''+key+'\')" title="'+title+'">'+icon+'</button>'
  ).join('');
  return '<div class="schema-toolbar">' +
    '<div class="schema-toolbar-row"><span class="hint">Colore:</span>'+colorSwatches+'</div>' +
    '<div class="schema-toolbar-row">' +
      '<button class="btn btn-small btn-icon '+(s.placeMode==='giocatore'?'btn-active':'')+'" onclick="setSchemaPlaceMode(\'giocatore\')" title="Aggiungi giocatore">'+SCHEMA_ICON_GIOCATORE+'</button>' +
      '<button class="btn btn-small btn-icon '+(s.placeMode==='pallone'?'btn-active':'')+'" onclick="setSchemaPlaceMode(\'pallone\')" title="Aggiungi pallone">'+SCHEMA_ICON_PALLONE+'</button>' +
      lineButtons +
      '<button class="btn btn-small btn-icon '+(s.eraserMode?'btn-active':'')+'" onclick="setSchemaEraserMode()" title="Gomma: clicca un elemento per eliminarlo">'+SCHEMA_ICON_GOMMA+'</button>' +
      ((s.drawMode || s.placeMode || s.eraserMode) ? '<button class="btn btn-small" onclick="stopSchemaDrawing()">Termina</button>' : '') +
    '</div>' +
  '</div>';
}
function schemaExerciseTags(e){
  try { const t = JSON.parse((e && e.tags) || '[]'); return Array.isArray(t) ? t : []; }
  catch { return []; }
}
async function addSchemaTagFromInput(){
  const input = document.getElementById('schema-tag-input');
  const val = input.value.trim();
  if(!val) return;
  const current = schemaExerciseTags(state.schema.currentExercise);
  if(current.includes(val)){ input.value=''; return; }
  const updated = current.concat(val);
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId, { tags: updated });
  if(res.exercise) state.schema.currentExercise = res.exercise;
  if(!state.schema.availableTags.includes(val)){
    state.schema.availableTags = state.schema.availableTags.concat(val).sort((a,b)=>a.localeCompare(b));
  }
  renderView();
}
function onSchemaTagInputKeydown(evt){
  if(evt.key==='Enter'){ evt.preventDefault(); addSchemaTagFromInput(); }
}
async function removeSchemaTag(tag){
  const current = schemaExerciseTags(state.schema.currentExercise);
  const updated = current.filter(t=>t!==tag);
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId, { tags: updated });
  if(res.exercise) state.schema.currentExercise = res.exercise;
  renderView();
}
function renderSchemaExerciseSheet(){
  const e = state.schema.currentExercise;
  if(!e){ return schemaSubNavHTML('library') + '<div class="card"><p class="hint">Esercizio non trovato.</p></div>'; }
  const livello = schemaActiveLivello();
  const noteRecente = e.note[0];
  const altreNote = e.note.slice(1);
  const currentTags = schemaExerciseTags(e);
  const tagChipsHtml = currentTags.map(t=>
    '<span class="schema-tag-chip schema-tag-chip-removable">'+esc(t)+' <button type="button" onclick="removeSchemaTag(\''+esc(t).replace(/'/g,"\\'")+'\')" aria-label="Rimuovi">×</button></span>'
  ).join('');
  const tagDatalist = '<datalist id="schema-tag-suggestions">' + state.schema.availableTags.map(t=>'<option value="'+esc(t)+'">').join('') + '</datalist>';
  const livelloTabsHtml = e.livelli.map(l=>
    '<button class="btn btn-small '+(l.id===livello.id?'btn-active':'')+'" onclick="switchSchemaLivello(\''+l.id+'\')">Livello '+esc(l.nome)+'</button>'
  ).join('') + '<button class="btn btn-small" onclick="addSchemaLivello()">+ Aggiungi livello</button>';
  return schemaSubNavHTML('library') +
    '<div class="card">' +
      '<div class="card-header-row"><h2>'+esc(e.titolo)+'</h2>' +
        '<div class="pitch-actions"><button class="btn btn-small" onclick="openSchemaLibrary()">← Libreria</button><button class="btn btn-small btn-danger" onclick="confirmDeleteSchemaExercise()">Elimina</button></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="field field-grow"><label>Titolo</label><input value="'+esc(e.titolo)+'" onchange="saveSchemaExerciseField(\'titolo\', this.value)"></div>' +
        '<div class="field"><label>N. giocatori</label><input type="number" min="1" value="'+e.numeroGiocatoriBase+'" onchange="saveSchemaExerciseField(\'numeroGiocatoriBase\', this.value)"></div>' +
        '<div class="field"><label>Larghezza campo (m)</label><input id="schema-ex-larghezza" type="number" step="0.1" value="'+e.larghezzaCampo+'" onchange="onSchemaFieldSizeOverride()"></div>' +
        '<div class="field"><label>Lunghezza campo (m)</label><input id="schema-ex-lunghezza" type="number" step="0.1" value="'+e.lunghezzaCampo+'" onchange="onSchemaFieldSizeOverride()"></div>' +
      '</div>' +
      '<div class="field"><label>Descrizione generale</label><textarea rows="2" onchange="saveSchemaExerciseField(\'descrizione\', this.value)">'+esc(e.descrizione)+'</textarea></div>' +
      '<div class="field field-grow">' +
        '<label>Etichette</label>' +
        '<div class="schema-tag-chip-row">' + tagChipsHtml + '</div>' +
        '<div style="display:flex; gap:6px; margin-top:6px;">' +
          '<input id="schema-tag-input" list="schema-tag-suggestions" type="text" placeholder="aggiungi etichetta e premi Invio" onkeydown="onSchemaTagInputKeydown(event)" style="flex:1;">' +
          '<button type="button" class="btn btn-small" onclick="addSchemaTagFromInput()">Aggiungi</button>' +
        '</div>' +
        tagDatalist +
      '</div>' +
    '</div>' +
    '<div class="card">' +
      '<h3 style="margin-top:0;">Progressione</h3>' +
      '<div class="pitch-actions" style="margin-bottom:12px;">'+livelloTabsHtml+'</div>' +
      (e.livelli.length>1 ? '<button class="btn btn-small btn-danger" style="margin-bottom:12px;" onclick="deleteSchemaLivello(\''+livello.id+'\')">Elimina livello '+esc(livello.nome)+'</button>' : '') +
      '<div class="field"><label>Descrizione di questo livello (cosa lo differenzia)</label><textarea rows="2" onchange="saveSchemaLivelloField(\'descrizione\', this.value)">'+esc(livello.descrizione)+'</textarea></div>' +
      '<div class="form-row">' +
        '<div class="field"><label>Ripetizioni</label><input type="number" min="1" value="'+livello.ripetizioni+'" onchange="saveSchemaLivelloField(\'ripetizioni\', this.value)"></div>' +
        '<div class="field"><label>Durata di ciascuna (min)</label><input type="number" min="1" value="'+livello.durataRipetizione+'" onchange="saveSchemaLivelloField(\'durataRipetizione\', this.value)"></div>' +
        '<div class="field"><label>Recupero (sec)</label><input type="number" min="0" value="'+livello.recuperoSecondi+'" onchange="saveSchemaLivelloField(\'recuperoSecondi\', this.value)"></div>' +
      '</div>' +
      schemaToolbarHTML() +
      '<div class="pitch-wrap schema-field-wrap '+(state.schema.eraserMode?'schema-eraser-active':'')+'">' + renderSchemaFieldSVG(e, livello) + '</div>' +
      '<p class="hint">Trascina per spostare. Click destro su un elemento per rinominare/numerare/cambiare colore. Con "+ Giocatore"/"+ Pallone" o un tipo di linea attivo, disegna sul campo; con la gomma attiva, clicca un elemento per eliminarlo.</p>' +
    '</div>' +
    '<div class="card">' +
      '<h3 style="margin-top:0;">Note</h3>' +
      (noteRecente ? '<div class="schema-note-recent"><strong>'+formatDate(noteRecente.data.slice(0,10))+'</strong><p>'+esc(noteRecente.testo)+'</p></div>' : '<p class="hint">Nessuna nota ancora.</p>') +
      '<div class="form-row"><div class="field field-grow"><label>Nuova nota</label><textarea id="schema-ex-nuova-nota" rows="2"></textarea></div><button class="btn btn-small" onclick="addSchemaNote()">Aggiungi nota</button></div>' +
      (altreNote.length ? '<details class="schema-note-history"><summary>Storico note ('+altreNote.length+')</summary>' + altreNote.map(n=>'<div class="schema-note-item"><strong>'+formatDate(n.data.slice(0,10))+'</strong><p>'+esc(n.testo)+'</p></div>').join('') + '</details>' : '') +
    '</div>' +
    '<div class="card">' +
      '<h3 style="margin-top:0;">Valutazioni</h3>' +
      '<div class="form-row" style="align-items:center;">' +
        '<div>' + (e.votoMedio!=null ? 'Media: '+starRatingHTML(e.votoMedio,16)+' ('+e.votoMedio+')' : 'Nessuna valutazione') + '</div>' +
        '<div class="hint">Usato '+e.utilizzi+' volte, '+e.minutiTotaliStagione+' minuti totali in stagione</div>' +
      '</div>' +
      '<div class="form-row" style="align-items:center;"><label class="hint">Nuovo voto:</label>' + starInputHTML() + '</div>' +
    '</div>';
}
async function saveSchemaExerciseField(field, value){
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId, { [field]: value });
  if(res.exercise) state.schema.currentExercise = res.exercise;
  renderView();
}
async function onSchemaFieldSizeOverride(){
  const larghezzaCampo = document.getElementById('schema-ex-larghezza').value;
  const lunghezzaCampo = document.getElementById('schema-ex-lunghezza').value;
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId, { larghezzaCampo, lunghezzaCampo });
  if(res.exercise){ state.schema.currentExercise = res.exercise; renderView(); }
}
async function addSchemaNote(){
  const textEl = document.getElementById('schema-ex-nuova-nota');
  const testo = textEl.value.trim();
  if(!testo) return;
  await apiPost('/api/schema/exercises/'+state.schema.exerciseId+'/notes', { testo });
  await loadSchemaExercise(state.schema.exerciseId);
  renderView();
}
async function submitSchemaRating(voto){
  await apiPost('/api/schema/exercises/'+state.schema.exerciseId+'/ratings', { voto });
  await loadSchemaExercise(state.schema.exerciseId);
  renderView();
}
function confirmDeleteSchemaExercise(){
  showConfirmModal('Eliminare "'+state.schema.currentExercise.titolo+'"? Elimina anche i livelli, le note, le valutazioni e lo storico collegati.', async () => {
    await apiDelete('/api/schema/exercises/'+state.schema.exerciseId);
    openSchemaLibrary();
  });
}

/* ---------- livelli di progressione (stesso esercizio, non un esercizio nuovo) ---------- */
function switchSchemaLivello(livelloId){
  state.schema.activeLivelloId = livelloId;
  renderView();
}
async function addSchemaLivello(){
  const res = await apiPost('/api/schema/exercises/'+state.schema.exerciseId+'/livelli', {});
  if(res.livello){
    state.schema.currentExercise.livelli.push(res.livello);
    state.schema.activeLivelloId = res.livello.id;
    renderView();
  } else alert('Errore: '+(res.error||'sconosciuto'));
}
function deleteSchemaLivello(livelloId){
  showConfirmModal('Eliminare questo livello di progressione?', async () => {
    const res = await apiDelete('/api/schema/exercises/'+state.schema.exerciseId+'/livelli/'+livelloId);
    if(res.error){ alert(res.error); return; }
    state.schema.currentExercise.livelli = state.schema.currentExercise.livelli.filter(l=>l.id!==livelloId);
    if(state.schema.activeLivelloId===livelloId) state.schema.activeLivelloId = state.schema.currentExercise.livelli[0].id;
    renderView();
  });
}
async function saveSchemaLivelloField(field, value){
  const livelloId = state.schema.activeLivelloId;
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId+'/livelli/'+livelloId, { [field]: value });
  if(res.livello){
    const idx = state.schema.currentExercise.livelli.findIndex(l=>l.id===livelloId);
    if(idx>=0) state.schema.currentExercise.livelli[idx] = res.livello;
  }
  renderView();
}

/* ---------- disegno campo: chip (giocatori/palloni) + frecce (4 tipi) + gomma ---------- */
function setSchemaActiveColor(color){
  state.schema.activeColor = color;
  renderView();
}
function setSchemaPlaceMode(tipo){
  const s = state.schema;
  s.drawMode = false; s.eraserMode = false;
  s.placeMode = s.placeMode===tipo ? null : tipo;
  renderView();
}
function setSchemaLineTypeAndDraw(tipo){
  const s = state.schema;
  s.placeMode = null; s.eraserMode = false;
  if(s.drawMode && s.activeLineType===tipo){ s.drawMode = false; }
  else { s.drawMode = true; s.activeLineType = tipo; }
  renderView();
}
function setSchemaEraserMode(){
  const s = state.schema;
  s.drawMode = false; s.placeMode = null;
  s.eraserMode = !s.eraserMode;
  renderView();
}
function stopSchemaDrawing(){
  const s = state.schema;
  s.drawMode = false; s.placeMode = null; s.eraserMode = false;
  renderView();
}
async function saveSchemaCampo(data){
  const livelloId = state.schema.activeLivelloId;
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId+'/livelli/'+livelloId, { schemaCampo: JSON.stringify(data) });
  if(res.livello){
    const idx = state.schema.currentExercise.livelli.findIndex(l=>l.id===livelloId);
    if(idx>=0) state.schema.currentExercise.livelli[idx] = res.livello;
    renderView();
  }
}
function showSchemaChipContextMenu(evt, chipId){
  evt.preventDefault();
  evt.stopPropagation();
  const data = parseSchemaCampo(schemaActiveLivello());
  const chip = data.chips.find(c=>c.id===chipId);
  if(!chip) return;
  const menu = document.getElementById('player-context-menu');
  let html = '<div class="context-menu-item" onclick="renameSchemaChip(\''+chipId+'\'); hideContextMenu();">Rinomina</div>';
  if(chip.tipo==='giocatore'){
    html += '<div class="context-menu-item" onclick="numberSchemaChip(\''+chipId+'\'); hideContextMenu();">Numera</div>';
  }
  html += '<div class="context-menu-item" style="display:flex; gap:6px; align-items:center;">' +
    SCHEMA_COLORS.map(c=>'<span onclick="recolorSchemaChip(\''+chipId+'\',\''+c+'\'); hideContextMenu();" style="width:16px;height:16px;border-radius:50%;background:'+c+';display:inline-block;cursor:pointer;border:1px solid var(--border);"></span>').join('') +
  '</div>';
  html += '<div class="context-menu-item" onclick="deleteSchemaChip(\''+chipId+'\'); hideContextMenu();" style="color:var(--danger);">Elimina</div>';
  menu.innerHTML = html;
  const x = Math.min(evt.clientX, window.innerWidth-190);
  const y = Math.min(evt.clientY, window.innerHeight-220);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
function renameSchemaChip(chipId){
  const data = parseSchemaCampo(schemaActiveLivello());
  const chip = data.chips.find(c=>c.id===chipId);
  if(!chip) return;
  const label = prompt('Nome/etichetta:', chip.label||'');
  if(label!==null){ chip.label = label; saveSchemaCampo(data); }
}
function numberSchemaChip(chipId){
  const data = parseSchemaCampo(schemaActiveLivello());
  const chip = data.chips.find(c=>c.id===chipId);
  if(!chip) return;
  const numero = prompt('Numero:', chip.numero!=null?String(chip.numero):'');
  if(numero!==null){ chip.numero = numero.trim()===''?null:Number(numero); saveSchemaCampo(data); }
}
function recolorSchemaChip(chipId, color){
  const data = parseSchemaCampo(schemaActiveLivello());
  const chip = data.chips.find(c=>c.id===chipId);
  if(!chip) return;
  chip.color = color;
  saveSchemaCampo(data);
}
function deleteSchemaChip(chipId){
  const data = parseSchemaCampo(schemaActiveLivello());
  data.chips = data.chips.filter(c=>c.id!==chipId);
  saveSchemaCampo(data);
}
function deleteSchemaArrow(arrowId){
  const data = parseSchemaCampo(schemaActiveLivello());
  data.arrows = data.arrows.filter(a=>a.id!==arrowId);
  saveSchemaCampo(data);
}
function attachSchemaFieldInteractions(){
  const svg = document.getElementById('schema-field-svg');
  if(!svg) return;
  function toPoint(evt){
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  svg.querySelectorAll('.schema-chip').forEach(function(chipEl){
    chipEl.style.cursor = 'grab';
    chipEl.addEventListener('contextmenu', function(e){
      showSchemaChipContextMenu(e, chipEl.getAttribute('data-id'));
    });
    chipEl.addEventListener('pointerdown', function(e){
      if(e.button===2) return;
      e.stopPropagation();
      const id = chipEl.getAttribute('data-id');
      if(state.schema.eraserMode){ deleteSchemaChip(id); return; }
      chipEl.setPointerCapture(e.pointerId);
      const startPt = toPoint(e);
      let moved = false;
      const data = parseSchemaCampo(schemaActiveLivello());
      const chipData = data.chips.find(function(c){ return c.id===id; });
      if(!chipData) return;
      function onMove(e2){
        const p = toPoint(e2);
        if(Math.abs(p.x-startPt.x) > 0.3 || Math.abs(p.y-startPt.y) > 0.3) moved = true;
        chipData.x = p.x; chipData.y = p.y;
        chipEl.setAttribute('transform', 'translate('+chipData.x+','+chipData.y+')');
      }
      function onUp(){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        try{ chipEl.releasePointerCapture(e.pointerId); }catch(err){}
        if(moved) saveSchemaCampo(data);
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  });
  svg.querySelectorAll('.schema-arrow').forEach(function(arrowEl){
    arrowEl.addEventListener('pointerdown', function(e){
      if(!state.schema.eraserMode) return;
      e.stopPropagation();
      deleteSchemaArrow(arrowEl.getAttribute('data-id'));
    });
  });
  svg.addEventListener('pointerdown', function(e){
    if(e.target.closest('.schema-chip') || e.target.closest('.schema-arrow')) return;
    if(e.button===2) return;
    const s = state.schema;
    if(s.drawMode && s.activeLineType==='pallone-alto'){
      const start = toPoint(e);
      const points = [start];
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg','path');
      tempPath.setAttribute('fill','none'); tempPath.setAttribute('stroke', s.activeColor); tempPath.setAttribute('stroke-width','0.15');
      tempPath.setAttribute('d', 'M'+start.x+','+start.y);
      svg.querySelector('.arrows-layer').appendChild(tempPath);
      function onMove(e2){
        const p = toPoint(e2);
        const last = points[points.length-1];
        if(Math.hypot(p.x-last.x, p.y-last.y) > 0.25){
          points.push(p);
          tempPath.setAttribute('d', smoothPathFromPoints(points));
        }
      }
      function onUp(){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        const last = points[points.length-1];
        // La lunghezza del percorso disegnato (non la distanza in linea retta inizio-fine,
        // che per una curva può essere piccola anche con un tratto lungo e marcato) decide
        // se il tratto va salvato: così la curva "si solidifica" con la forma disegnata.
        let pathLen = 0;
        for(let i=1;i<points.length;i++) pathLen += Math.hypot(points[i].x-points[i-1].x, points[i].y-points[i-1].y);
        if(points.length>=2 && pathLen > 0.5){
          const data = parseSchemaCampo(schemaActiveLivello());
          data.arrows.push({ id: uid(), tipo:'pallone-alto', color:s.activeColor, points, x1:start.x, y1:start.y, x2:last.x, y2:last.y });
          saveSchemaCampo(data);
        } else { tempPath.remove(); }
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    } else if(s.drawMode){
      const start = toPoint(e);
      const tempLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      tempLine.setAttribute('x1', start.x); tempLine.setAttribute('y1', start.y);
      tempLine.setAttribute('x2', start.x); tempLine.setAttribute('y2', start.y);
      tempLine.setAttribute('stroke', s.activeColor); tempLine.setAttribute('stroke-width', '0.15');
      svg.querySelector('.arrows-layer').appendChild(tempLine);
      function onMove(e2){ const p=toPoint(e2); tempLine.setAttribute('x2',p.x); tempLine.setAttribute('y2',p.y); }
      function onUp(e2){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        const p = toPoint(e2);
        const dist = Math.hypot(p.x-start.x, p.y-start.y);
        const data = parseSchemaCampo(schemaActiveLivello());
        if(dist > 0.5){
          data.arrows.push({ id: uid(), x1:start.x, y1:start.y, x2:p.x, y2:p.y, tipo:s.activeLineType, color:s.activeColor });
          saveSchemaCampo(data);
        } else { tempLine.remove(); }
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    } else if(s.placeMode){
      const start = toPoint(e);
      function onUp(e2){
        svg.removeEventListener('pointerup', onUp);
        const p = toPoint(e2);
        const dist = Math.hypot(p.x-start.x, p.y-start.y);
        if(dist > 1.5) return;
        const data = parseSchemaCampo(schemaActiveLivello());
        data.chips.push({ id: uid(), x:p.x, y:p.y, tipo:s.placeMode, color:s.activeColor, numero:null, label:'' });
        saveSchemaCampo(data);
      }
      svg.addEventListener('pointerup', onUp);
    }
  });
}

/* ---------- picker: scelta livello quando un esercizio ha più progressioni ---------- */
function schemaLivelloPickerHTML(){
  const picker = state.schema.livelloPicker;
  if(!picker) return '';
  return '<div class="schema-picker-overlay" onclick="if(event.target===this) closeSchemaLivelloPicker();">' +
    '<div class="schema-picker-box">' +
      '<h3 style="margin-top:0;">'+esc(picker.titolo)+'</h3>' +
      '<p class="hint">Questo esercizio ha più livelli di progressione: quale vuoi usare?</p>' +
      '<div class="schema-picker-options">' + picker.livelli.map(l=>'<button class="btn" onclick="chooseSchemaLivello(\''+l.id+'\')">Livello '+esc(l.nome)+'</button>').join('') + '</div>' +
      '<button class="btn btn-small" onclick="closeSchemaLivelloPicker()">Annulla</button>' +
    '</div>' +
  '</div>';
}
function closeSchemaLivelloPicker(){
  state.schema.livelloPicker = null;
  renderView();
}
async function chooseSchemaLivello(livelloId){
  const picker = state.schema.livelloPicker;
  state.schema.livelloPicker = null;
  if(picker && picker.onChoose) await picker.onChoose(livelloId);
  renderView();
}

/* ---------- sedute ---------- */
async function loadSchemaSessions(){
  const res = await apiGet('/api/schema/sessions');
  state.schema.sessions = res.sessions || [];
}
function schemaSessionStatoPillHTML(stato){
  if(stato==='eseguita') return '<span class="pill pill-win">Eseguita</span>';
  if(stato==='programmata') return '<span class="pill pill-yellow">Programmata</span>';
  return '<span class="pill pill-muted">Bozza</span>';
}
function renderSchemaSessionsList(){
  const s = state.schema;
  return schemaSubNavHTML('sessions') +
    '<div class="card">' +
      '<div class="card-header-row"><h2>Sedute</h2>' +
        '<div class="pitch-actions"><button class="btn btn-primary btn-small" onclick="promptNewSchemaSession()">+ Nuova seduta</button></div>' +
      '</div>' +
      '<p class="hint">Lo stato si calcola da solo: bozza finché non è collegata a un giorno di allenamento, programmata se il giorno è futuro, eseguita quando il giorno è passato.</p>' +
      (s.sessions.length===0 ? '<p class="hint">Nessuna seduta ancora.</p>' :
        s.sessions.map(sess=>{
          const allenamento = sess.allenamentoId ? state.allenamenti.find(a=>a.id===sess.allenamentoId) : null;
          return '<div class="schema-session-row" onclick="openSchemaSessionBuilder(\''+sess.id+'\')">' +
            '<strong>'+esc(sess.titolo)+'</strong>' +
            schemaSessionStatoPillHTML(sess.stato) +
            (sess.stato==='eseguita' && !sess.hasNote ? '<span class="pill pill-red">Note mancanti</span>' : '') +
            (allenamento ? '<span class="hint">Allenamento del '+formatDate(allenamento.data)+'</span>' : '') +
            '<span class="hint">'+sess.items.length+' esercizi</span>' +
          '</div>';
        }).join('')
      ) +
    '</div>';
}
function promptNewSchemaSession(){
  const titolo = prompt('Titolo della seduta:');
  if(!titolo) return;
  createSchemaSession(titolo, null);
}
async function createSchemaSession(titolo, allenamentoId){
  const res = await apiPost('/api/schema/sessions', { titolo, allenamentoId: allenamentoId || null });
  if(res.session) await openSchemaSessionBuilder(res.session.id);
  else alert('Errore: '+(res.error||'sconosciuto'));
}
async function createSchemaSessionForAllenamento(allenamentoId){
  const a = state.allenamenti.find(x=>x.id===allenamentoId);
  const titolo = 'Seduta del ' + formatDate(a ? a.data : '');
  const res = await apiPost('/api/schema/sessions', { titolo, allenamentoId });
  if(res.session){
    delete state.schema.allenamentoSessions[allenamentoId];
    await openSchemaSessionBuilder(res.session.id);
  } else alert('Errore: '+(res.error||'sconosciuto'));
}
async function loadSchemaSessionsForAllenamento(allenamentoId){
  const res = await apiGet('/api/schema/sessions?allenamentoId='+encodeURIComponent(allenamentoId));
  state.schema.allenamentoSessions[allenamentoId] = res.sessions || [];
  if(state.currentView==='allenamento' && state.currentAllenamentoId===allenamentoId) renderView();
}
function schemaSessionsCardForAllenamento(a){
  if(!getAppUser().schemaUnlocked) return '';
  const sessions = state.schema.allenamentoSessions[a.id];
  if(!sessions) return '<div class="card"><h2>Seduta programmata</h2><p class="hint">Caricamento…</p></div>';
  return '<div class="card"><h2>Seduta programmata</h2>' +
    (sessions.length===0
      ? '<p class="hint">Nessuna seduta collegata a questo giorno.</p><button class="btn btn-small" onclick="createSchemaSessionForAllenamento(\''+a.id+'\')">Crea seduta per questo giorno</button>'
      : sessions.map(sess=>'<div class="schema-session-row" onclick="openSchemaSessionBuilder(\''+sess.id+'\')"><strong>'+esc(sess.titolo)+'</strong>'+schemaSessionStatoPillHTML(sess.stato)+'</div>').join('')
    ) +
  '</div>';
}
async function loadSchemaSessionDetail(id){
  const res = await apiGet('/api/schema/sessions/'+id);
  state.schema.currentSession = res.session || null;
  state.schema.sessionId = id;
}
function renderSchemaSessionBuilder(){
  const s = state.schema;
  const sess = s.currentSession;
  if(!sess) return schemaSubNavHTML('sessions') + '<div class="card"><p class="hint">Seduta non trovata.</p></div>';
  // Solo obiettivi fisici guidano il carico/range della seduta: quelli tecnico-tattici
  // si scelgono esercizio per esercizio, non a livello di seduta.
  const objFisici = s.objectives.filter(o=>o.categoria==='fisico');
  const objOptions = '<option value="">Nessun obiettivo fisico</option>' + objFisici.map(o=>'<option value="'+o.id+'" '+(o.id===sess.obiettivoId?'selected':'')+'>'+esc(o.label)+'</option>').join('');
  const allenamentiOrdinati = state.allenamenti.slice().sort((a,b)=>(a.data||'').localeCompare(b.data||''));
  const allenamentoOptions = '<option value="">Nessun giorno collegato (bozza)</option>' + allenamentiOrdinati.map(a=>'<option value="'+a.id+'" '+(a.id===sess.allenamentoId?'selected':'')+'>'+formatDate(a.data)+'</option>').join('');
  const rpeOptions = '<option value="">—</option>' + Array.from({length:10},(_,i)=>i+1).map(n=>'<option value="'+n+'" '+(sess.rpe===n?'selected':'')+'>'+n+'</option>').join('');
  const obiettivoScelto = objFisici.find(o=>o.id===sess.obiettivoId);
  let caricoBadge;
  if(sess.caricoTotale==null){
    caricoBadge = '<span class="pill pill-muted">Imposta un RPE (1-10) per calcolare il carico</span>';
  } else if(obiettivoScelto){
    const { loadMin, loadMax } = obiettivoScelto;
    if(sess.caricoTotale < loadMin) caricoBadge = '<span class="pill pill-yellow">Carico '+sess.caricoTotale+' (sotto range '+loadMin+'-'+loadMax+')</span>';
    else if(sess.caricoTotale > loadMax) caricoBadge = '<span class="pill pill-red">Carico '+sess.caricoTotale+' (sopra range '+loadMin+'-'+loadMax+')</span>';
    else caricoBadge = '<span class="pill pill-win">Carico '+sess.caricoTotale+' (in range '+loadMin+'-'+loadMax+')</span>';
  } else {
    caricoBadge = '<span class="pill pill-muted">Carico totale: '+sess.caricoTotale+'</span>';
  }
  const locked = sess.stato==='eseguita';
  return schemaSubNavHTML('sessions') +
    '<div class="card">' +
      '<div class="card-header-row"><h2>'+esc(sess.titolo)+'</h2>' +
        '<div class="pitch-actions">' +
          '<button class="btn btn-small" onclick="openSchemaSessions()">← Sedute</button>' +
          schemaSessionStatoPillHTML(sess.stato) +
          '<button class="btn btn-small" onclick="exportSchemaSessionImage()">Esporta immagine</button>' +
          '<button class="btn btn-small" onclick="exportSchemaSessionPDF()">Esporta PDF</button>' +
          '<button class="btn btn-small" onclick="shareSchemaSessionWhatsApp()">Condividi su WhatsApp</button>' +
          (!locked ? '<button class="btn btn-small btn-danger" onclick="confirmDeleteSchemaSession()">Elimina</button>' : '') +
        '</div>' +
      '</div>' +
      (locked ? '<p class="hint">Seduta svolta: è congelata come registro di ciò che è stato fatto. Puoi ancora modificare solo RPE e note.</p>' : '') +
      '<div class="form-row">' +
        '<div class="field field-grow"><label>Titolo</label><input value="'+esc(sess.titolo)+'" '+(locked?'disabled':'onchange="saveSchemaSessionField(\'titolo\', this.value)"')+'></div>' +
        '<div class="field"><label>Obiettivo fisico</label><select '+(locked?'disabled':'onchange="onSchemaSessionObiettivoChange(this.value)"')+'>'+objOptions+'</select></div>' +
        '<div class="field"><label>Giorno di allenamento</label><select '+(locked?'disabled':'onchange="saveSchemaSessionField(\'allenamentoId\', this.value)"')+'>'+allenamentoOptions+'</select></div>' +
        '<div class="field"><label>RPE seduta (1-10)</label><select onchange="saveSchemaSessionField(\'rpe\', this.value)">'+rpeOptions+'</select></div>' +
      '</div>' +
      '<div class="form-row" style="align-items:center;">'+caricoBadge+'<span class="hint">Durata totale: '+sess.durataTotale+' min</span></div>' +
      (locked ? '<div class="field field-grow"><label>Note e considerazioni sulla seduta svolta</label><textarea rows="2" onchange="saveSchemaSessionField(\'note\', this.value)">'+esc(sess.note||'')+'</textarea></div>' : '') +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="card">' +
        '<h3 style="margin-top:0;">Libreria esercizi</h3>' +
        (locked ? '<p class="hint">Seduta già svolta: gli esercizi inclusi non sono più modificabili.</p>' :
          '<div class="schema-exercise-grid">' + s.exercises.map(e=>
            '<div class="schema-exercise-card" onclick="addSchemaSessionItem(\''+e.id+'\')">' +
              '<div class="schema-exercise-card-head"><strong>'+esc(e.titolo)+'</strong>'+(e.livelli.length>1?'<span class="pill">'+e.livelli.length+' livelli</span>':'')+'</div>' +
              '<div class="hint">'+(schemaExerciseTags(e).join(', ')||'Nessuna etichetta')+'</div>' +
            '</div>'
          ).join('') + '</div>'
        ) +
      '</div>' +
      '<div class="card">' +
        '<h3 style="margin-top:0;">Esercizi nella seduta</h3>' +
        (sess.items.length===0 ? '<p class="hint">Nessun esercizio aggiunto. Clicca un esercizio nella libreria per aggiungerlo.</p>' :
          sess.items.map((item,idx)=>{
            const titolo = item.livello ? item.livello.esercizio.titolo : item.titoloSnapshot;
            const nomeLivello = item.livello ? item.livello.nome : item.livelloSnapshot;
            return '<div class="schema-session-item-row">' +
              '<div><strong>'+esc(titolo)+'</strong><div class="hint">Livello '+esc(nomeLivello)+(item.livello?'':' · esercizio non più in libreria')+'</div></div>' +
              (locked
                ? '<span class="hint">'+(item.durataMinuti!=null?item.durataMinuti+' min':'—')+'</span>'
                : '<input type="number" min="1" placeholder="min" style="width:70px;" value="'+(item.durataMinuti!=null?item.durataMinuti:'')+'" onchange="setSchemaSessionItemDurata(\''+item.id+'\', this.value)">'
              ) +
              '<div class="pitch-actions">' +
                (!locked && idx>0 ? '<button class="btn btn-small" onclick="moveSchemaSessionItem(\''+item.id+'\', -1)">↑</button>' : '') +
                (!locked && idx<sess.items.length-1 ? '<button class="btn btn-small" onclick="moveSchemaSessionItem(\''+item.id+'\', 1)">↓</button>' : '') +
                (locked && item.livello ? '<button class="btn btn-small" onclick="addSchemaSessionItemNote(\''+item.livello.esercizioId+'\')">Nota</button>' : '') +
                (!locked ? '<button class="btn btn-small btn-danger" onclick="removeSchemaSessionItem(\''+item.id+'\')">Rimuovi</button>' : '') +
              '</div>' +
            '</div>';
          }).join('')
        ) +
      '</div>' +
    '</div>';
}
async function saveSchemaSessionField(field, value){
  const res = await apiPatch('/api/schema/sessions/'+state.schema.sessionId, { [field]: value });
  if(res.session) state.schema.currentSession = res.session;
  renderView();
}
async function onSchemaSessionObiettivoChange(value){
  const patch = { obiettivoId: value };
  if(!state.schema.currentSession.rpe){
    const obj = state.schema.objectives.find(o=>o.id===value);
    if(obj && obj.rpeSuggerito!=null) patch.rpe = obj.rpeSuggerito;
  }
  const res = await apiPatch('/api/schema/sessions/'+state.schema.sessionId, patch);
  if(res.session){ state.schema.currentSession = res.session; renderView(); }
}
function confirmDeleteSchemaSession(){
  showConfirmModal('Eliminare la seduta "'+state.schema.currentSession.titolo+'"?', async () => {
    await apiDelete('/api/schema/sessions/'+state.schema.sessionId);
    openSchemaSessions();
  });
}
async function addSchemaSessionItem(exerciseId){
  const esercizio = state.schema.exercises.find(e=>e.id===exerciseId);
  if(!esercizio) return;
  if(esercizio.livelli.length>1){
    state.schema.livelloPicker = { titolo: esercizio.titolo, livelli: esercizio.livelli, onChoose: addSchemaSessionItemWithLivello };
    renderView();
    return;
  }
  await addSchemaSessionItemWithLivello(esercizio.livelli[0].id);
}
async function addSchemaSessionItemWithLivello(livelloId){
  let livello = null;
  state.schema.exercises.some(e=>{ const l = e.livelli.find(x=>x.id===livelloId); if(l){ livello = l; return true; } return false; });
  const durataMinuti = livello ? livello.ripetizioni*livello.durataRipetizione : null;
  await apiPost('/api/schema/sessions/'+state.schema.sessionId+'/items', { livelloId, durataMinuti });
  await loadSchemaSessionDetail(state.schema.sessionId);
  renderView();
}
async function addSchemaSessionItemNote(esercizioId){
  const testo = prompt('Nota su questo esercizio per questa seduta:');
  if(!testo || !testo.trim()) return;
  await apiPost('/api/schema/exercises/'+esercizioId+'/notes', { testo: testo.trim(), sedutaId: state.schema.sessionId });
  alert('Nota aggiunta.');
}
async function removeSchemaSessionItem(itemId){
  await apiDelete('/api/schema/sessions/'+state.schema.sessionId+'/items/'+itemId);
  await loadSchemaSessionDetail(state.schema.sessionId);
  renderView();
}
async function setSchemaSessionItemDurata(itemId, value){
  await apiPatch('/api/schema/sessions/'+state.schema.sessionId+'/items/'+itemId, { durataMinuti: value===''?null:value });
  await loadSchemaSessionDetail(state.schema.sessionId);
  renderView();
}
async function moveSchemaSessionItem(itemId, dir){
  const items = state.schema.currentSession.items;
  const idx = items.findIndex(i=>i.id===itemId);
  const swapIdx = idx+dir;
  if(swapIdx<0 || swapIdx>=items.length) return;
  const a = items[idx], b = items[swapIdx];
  await apiPatch('/api/schema/sessions/'+state.schema.sessionId+'/items/'+a.id, { ordine: b.ordine });
  await apiPatch('/api/schema/sessions/'+state.schema.sessionId+'/items/'+b.id, { ordine: a.ordine });
  await loadSchemaSessionDetail(state.schema.sessionId);
  renderView();
}

/* ---------- esportazione seduta: immagine / PDF / WhatsApp ---------- */
function schemaAvailablePlayersForSession(sess){
  const allenamento = sess.allenamentoId ? state.allenamenti.find(a=>a.id===sess.allenamentoId) : null;
  if(!allenamento) return state.players.slice();
  return state.players.filter(p=>{
    const v = (allenamento.presenze && allenamento.presenze[p.id]) || defaultPresenzaFor(p);
    return v === 'Disponibile';
  });
}
function schemaLineupPitchSVG(players){
  const bands = [
    { roles:['ATT'], y:14 },
    { roles:['MD','CC','ES','ED'], y:48 },
    { roles:['DC','TD','TS'], y:80 },
    { roles:['Por'], y:98 },
  ];
  let chipsSvg = '';
  bands.forEach(band=>{
    const list = players.filter(p=>band.roles.includes(p.ruolo));
    const n = list.length;
    list.forEach((p,i)=>{
      const x = n<=1 ? 34 : 6 + i*(56/Math.max(n-1,1));
      chipsSvg += '<g transform="translate('+x+','+band.y+')">' +
        '<circle r="2.6" fill="#0E2233" stroke="#4FA8E0" stroke-width="0.3"/>' +
        '<text text-anchor="middle" dy="4.4" font-size="1.7" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="0.3">'+esc(surnameOf(p.nome))+'</text>' +
      '</g>';
    });
  });
  return '<svg viewBox="0 0 68 105" class="pitch-svg">' + pitchMarkingsSVG() + chipsSvg + '</svg>';
}
function schemaSessionExportBodyHTML(sess){
  const allenamento = sess.allenamentoId ? state.allenamenti.find(a=>a.id===sess.allenamentoId) : null;
  const players = schemaAvailablePlayersForSession(sess);
  return (
    '<p>'+(allenamento ? 'Allenamento del '+formatDate(allenamento.data)+(allenamento.ora?' • '+esc(allenamento.ora):'') : 'Nessun giorno collegato')+'</p>' +
    '<p>'+(sess.obiettivo ? 'Obiettivo fisico: '+esc(sess.obiettivo.label)+' · ' : '')+(sess.rpe!=null?'RPE '+sess.rpe+' · ':'')+(sess.caricoTotale!=null?'Carico '+sess.caricoTotale+' · ':'')+'Durata totale '+sess.durataTotale+' min</p>' +
    '<h2>Giocatori disponibili ('+players.length+')</h2>' +
    '<div class="schema-export-pitch">' + schemaLineupPitchSVG(players) + '</div>' +
    '<h2>Esercizi</h2>' +
    sess.items.map((item,idx)=>{
      if(!item.livello) return '<div class="schema-export-item"><h3>'+(idx+1)+'. '+esc(item.titoloSnapshot)+' — Livello '+esc(item.livelloSnapshot)+'</h3><p class="hint">Esercizio non più in libreria.</p></div>';
      const ex = item.livello.esercizio;
      return '<div class="schema-export-item">' +
        '<h3>'+(idx+1)+'. '+esc(ex.titolo)+' — Livello '+esc(item.livello.nome)+'</h3>' +
        (ex.descrizione ? '<p>'+esc(ex.descrizione)+'</p>' : '') +
        (item.livello.descrizione ? '<p><em>'+esc(item.livello.descrizione)+'</em></p>' : '') +
        '<p class="hint">Ripetizioni: '+item.livello.ripetizioni+' × '+item.livello.durataRipetizione+' min, recupero '+item.livello.recuperoSecondi+'s · Durata in questa seduta: '+(item.durataMinuti!=null?item.durataMinuti+' min':'—')+'</p>' +
        '<div class="schema-export-field">' + renderSchemaFieldSVG(ex, item.livello) + '</div>' +
      '</div>';
    }).join('') +
    (sess.note ? '<h2>Note sulla seduta svolta</h2><p>'+esc(sess.note)+'</p>' : '')
  );
}
function exportSchemaSessionImage(){
  const sess = state.schema.currentSession;
  if(!sess) return;
  ensureHtml2Canvas(function(){
    const holder = document.createElement('div');
    holder.className = 'app-content schema-export';
    holder.style.position = 'fixed'; holder.style.left = '-9999px'; holder.style.top = '0';
    holder.style.width = '800px'; holder.style.padding = '20px';
    const bgColor = getComputedStyle(document.body).backgroundColor || '#0B141C';
    holder.style.background = bgColor;
    holder.innerHTML = '<h1>'+esc(sess.titolo)+'</h1>' + schemaSessionExportBodyHTML(sess);
    document.body.appendChild(holder);
    html2canvas(holder, { backgroundColor: bgColor, scale: 2 }).then(function(canvas){
      const link = document.createElement('a');
      link.download = 'seduta-'+sess.titolo.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link); link.click(); link.remove();
      holder.remove();
    }).catch(function(err){
      console.error('export seduta image error', err);
      alert('Esportazione immagine non riuscita.');
      holder.remove();
    });
  });
}
function exportSchemaSessionPDF(){
  const sess = state.schema.currentSession;
  if(!sess) return;
  exportPDF(sess.titolo, schemaSessionExportBodyHTML(sess));
}
async function shareSchemaSessionWhatsApp(){
  const sess = state.schema.currentSession;
  if(!sess) return;
  const testo = 'Seduta: '+sess.titolo+(sess.rpe!=null?' (RPE '+sess.rpe+')':'')+' — '+sess.items.length+' esercizi, '+sess.durataTotale+' min.';
  // Condivisione con immagine allegata: supportata solo dai browser con Web Share API
  // "livello 2" (perlopiù mobile). Altrove si apre WhatsApp con solo il testo: l'immagine
  // va allegata a mano dopo averla scaricata con "Esporta immagine".
  if(navigator.share && navigator.canShare){
    try{
      await ensureHtml2CanvasPromise();
      const holder = document.createElement('div');
      holder.className = 'app-content schema-export';
      holder.style.position = 'fixed'; holder.style.left = '-9999px'; holder.style.top = '0';
      holder.style.width = '800px'; holder.style.padding = '20px';
      const bgColor = getComputedStyle(document.body).backgroundColor || '#0B141C';
      holder.style.background = bgColor;
      holder.innerHTML = '<h1>'+esc(sess.titolo)+'</h1>' + schemaSessionExportBodyHTML(sess);
      document.body.appendChild(holder);
      const canvas = await html2canvas(holder, { backgroundColor: bgColor, scale: 2 });
      holder.remove();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'seduta.png', { type:'image/png' });
      if(navigator.canShare({ files:[file] })){
        await navigator.share({ files:[file], title: sess.titolo, text: testo });
        return;
      }
      await navigator.share({ title: sess.titolo, text: testo });
      return;
    }catch(err){
      if(err && err.name==='AbortError') return; // utente ha annullato la condivisione
      console.error('share seduta error', err);
    }
  }
  window.open('https://wa.me/?text='+encodeURIComponent(testo), '_blank');
}
function ensureHtml2CanvasPromise(){
  return new Promise((resolve, reject)=>{
    if(typeof html2canvas !== 'undefined'){ resolve(); return; }
    reject(new Error('html2canvas non disponibile'));
  });
}

/* ---------- STAGIONI: società/squadra/livello, archivio, import giocatori ---------- */
async function openStagioni(){
  state.currentView = 'stagioni';
  await loadStagioni();
  renderView();
}
async function loadStagioni(){
  const res = await apiGet('/api/stagioni');
  state.stagioni.list = res.stagioni || [];
  state.stagioni.loaded = true;
}
function backToCalendarioFromStagioni(){
  state.currentView = 'calendario';
  state.stagioni.detailId = null;
  state.stagioni.detail = null;
  renderView();
}
function toggleNewStagioneForm(){
  state.stagioni.showNewForm = !state.stagioni.showNewForm;
  renderView();
}
function onStagioneTipoChange(value){
  state.stagioni.newTipo = value;
  state.stagioni.newLivello = (STAGIONE_LIVELLI[value]||['Altro'])[0];
  renderView();
}
async function submitNewStagione(){
  const societa = document.getElementById('stagione-new-societa').value.trim();
  const etichetta = document.getElementById('stagione-new-etichetta').value.trim();
  let tipoSquadra = document.getElementById('stagione-new-tipo').value;
  if(tipoSquadra==='Altro'){
    const alt = document.getElementById('stagione-new-tipo-altro');
    if(alt && alt.value.trim()) tipoSquadra = alt.value.trim();
  }
  let livello = document.getElementById('stagione-new-livello').value;
  if(livello==='Altro'){
    const alt = document.getElementById('stagione-new-livello-altro');
    if(alt && alt.value.trim()) livello = alt.value.trim();
  }
  if(!societa || !etichetta){ alert('Società ed etichetta stagione sono obbligatorie.'); return; }
  showConfirmModal(
    'Chiudere la stagione attiva e iniziarne una nuova ("'+societa+' — '+tipoSquadra+' '+livello+'")? Calendario, rosa, formazione predefinita e piano squadra ripartiranno vuoti (restano consultabili nell\'archivio); la libreria Schema resta condivisa. Potrai importare giocatori dalle stagioni precedenti dall\'archivio.',
    async () => {
      const res = await apiPost('/api/stagioni', { etichetta, societa, tipoSquadra, livello });
      if(res.stagione){
        alert('Nuova stagione avviata. La pagina si ricarica per aggiornare calendario e rosa.');
        location.reload();
      } else alert('Errore: '+(res.error||'sconosciuto'));
    },
    'Chiudi e inizia'
  );
}
function renderNewStagioneForm(){
  const s = state.stagioni;
  const tipoOptions = STAGIONE_TIPI.map(t=>'<option value="'+t+'" '+(s.newTipo===t?'selected':'')+'>'+esc(t)+'</option>').join('');
  const livelli = STAGIONE_LIVELLI[s.newTipo] || ['Altro'];
  const livelloOptions = livelli.map(l=>'<option value="'+l+'" '+(s.newLivello===l?'selected':'')+'>'+esc(l)+'</option>').join('');
  return '<div style="margin-top:12px; border-top:1px solid var(--border); padding-top:12px;">' +
    '<p class="hint">Chiudere la stagione attiva azzera calendario e rosa della nuova (restano consultabili nell\'archivio); la libreria Schema resta condivisa.</p>' +
    '<div class="form-row">' +
      '<div class="field"><label>Società</label><input id="stagione-new-societa" type="text" placeholder="es. Mirandolese"></div>' +
      '<div class="field"><label>Tipo squadra</label><select id="stagione-new-tipo" onchange="onStagioneTipoChange(this.value)">'+tipoOptions+'</select></div>' +
      '<div class="field"><label>Livello</label><select id="stagione-new-livello" onchange="state.stagioni.newLivello=this.value; renderView();">'+livelloOptions+'</select></div>' +
      '<div class="field"><label>Etichetta stagione</label><input id="stagione-new-etichetta" type="text" placeholder="es. 2027/28"></div>' +
    '</div>' +
    (s.newTipo==='Altro' ? '<div class="field"><label>Specifica tipo squadra</label><input id="stagione-new-tipo-altro" type="text"></div>' : '') +
    (s.newLivello==='Altro' ? '<div class="field"><label>Specifica livello</label><input id="stagione-new-livello-altro" type="text"></div>' : '') +
    '<button class="btn btn-primary btn-small" onclick="submitNewStagione()">Conferma nuova stagione</button>' +
  '</div>';
}
function stagioneArchivioStatsSummary(matches){
  let giocate=0, vinte=0, pareggiate=0, perse=0, golFatti=0, golSubiti=0;
  matches.forEach(m=>{
    if(computeMatchStato(m)!=='Giocata') return;
    giocate++;
    const gf=(m.golFatti||[]).length, gs=(m.golSubiti||[]).length;
    golFatti+=gf; golSubiti+=gs;
    if(gf>gs) vinte++; else if(gf<gs) perse++; else pareggiate++;
  });
  return { giocate, vinte, pareggiate, perse, golFatti, golSubiti };
}
async function openStagioneArchivio(id){
  state.stagioni.detailId = id;
  state.stagioni.detail = null;
  state.stagioni.selectedImportIds = [];
  renderView();
  const stagione = state.stagioni.list.find(x=>x.id===id);
  const [playersRes, matchesRes] = await Promise.all([
    apiGet('/api/storage/players?stagioneId='+encodeURIComponent(id)),
    apiGet('/api/storage/matches?stagioneId='+encodeURIComponent(id)),
  ]);
  let players = [], matches = [];
  try{ players = playersRes.value ? JSON.parse(playersRes.value) : []; }catch{ players = []; }
  try{ matches = matchesRes.value ? JSON.parse(matchesRes.value) : []; }catch{ matches = []; }
  matches.forEach(migrateMatch);
  state.stagioni.detail = { stagione, players, matches };
  renderView();
}
function closeStagioneArchivio(){
  state.stagioni.detailId = null;
  state.stagioni.detail = null;
  renderView();
}
function toggleStagionePlayerSelection(id){
  const sel = state.stagioni.selectedImportIds;
  state.stagioni.selectedImportIds = sel.includes(id) ? sel.filter(x=>x!==id) : sel.concat(id);
  renderView();
}
async function importSelectedStagionePlayers(){
  const sel = state.stagioni.selectedImportIds;
  if(!sel.length){ alert('Seleziona almeno un giocatore da importare.'); return; }
  const res = await apiPost('/api/stagioni/importa-giocatori', { daStagioneId: state.stagioni.detailId, giocatoreIds: sel });
  if(res.importati){
    alert(res.importati.length+' giocatore/i importato/i nella stagione attiva. Vai in Rosa per vederli.');
    state.stagioni.selectedImportIds = [];
    renderView();
  } else alert('Errore: '+(res.error||'sconosciuto'));
}
function renderStagioneArchivioDetail(){
  const d = state.stagioni.detail;
  if(!d) return '<div class="card"><p class="hint">Caricamento…</p></div>';
  const stats = stagioneArchivioStatsSummary(d.matches);
  const sel = state.stagioni.selectedImportIds;
  return '<div class="card">' +
    '<div class="card-header-row"><h3 style="margin:0;">'+esc(d.stagione.societa)+' — '+esc(d.stagione.tipoSquadra)+' '+esc(d.stagione.livello)+' ('+esc(d.stagione.etichetta)+')</h3><button class="btn btn-small" onclick="closeStagioneArchivio()">Chiudi</button></div>' +
    '<p class="hint">Sola lettura: archivio di una stagione chiusa.</p>' +
    '<div class="form-row" style="align-items:center;">' +
      '<span class="pill pill-muted">Partite giocate: '+stats.giocate+'</span>' +
      '<span class="pill pill-win">V '+stats.vinte+'</span>' +
      '<span class="pill pill-yellow">N '+stats.pareggiate+'</span>' +
      '<span class="pill pill-red">P '+stats.perse+'</span>' +
      '<span class="hint">Gol fatti/subiti: '+stats.golFatti+' / '+stats.golSubiti+'</span>' +
    '</div>' +
    '<h4>Rosa ('+d.players.length+')</h4>' +
    (d.players.length===0 ? '<p class="hint">Nessun giocatore in questa stagione.</p>' :
      '<div class="pitch-actions" style="margin-bottom:8px;">' +
        '<button class="btn btn-small" onclick="importSelectedStagionePlayers()">Importa selezionati nella stagione attiva</button>' +
      '</div>' +
      d.players.slice().sort((a,b)=>surnameOf(a.nome).localeCompare(surnameOf(b.nome))).map(p=>
        '<label class="presenza-row" style="cursor:pointer;">' +
          '<input type="checkbox" '+(sel.includes(p.id)?'checked':'')+' onchange="toggleStagionePlayerSelection(\''+p.id+'\')" style="margin-right:8px;">' +
          '<span class="roster-name">'+esc(displayName(p.nome))+'</span>' +
          '<span class="roster-role">'+esc(p.ruolo||'')+'</span>' +
        '</label>'
      ).join('')
    ) +
  '</div>';
}
function renderStagioniView(){
  const s = state.stagioni;
  const attiva = s.list.find(x=>x.attiva);
  const chiuse = s.list.filter(x=>!x.attiva);
  return '<div class="card">' +
    '<div class="card-header-row"><h2>Stagioni</h2><button class="btn btn-small" onclick="backToCalendarioFromStagioni()">← Torna al gestionale</button></div>' +
    (attiva ? '<p class="hint">Stagione attiva: <strong>'+esc(attiva.societa)+' — '+esc(attiva.tipoSquadra)+' '+esc(attiva.livello)+'</strong> ('+esc(attiva.etichetta)+')</p>' : '<p class="hint">Nessuna stagione attiva trovata.</p>') +
    '<button class="btn btn-primary btn-small" onclick="toggleNewStagioneForm()">'+(s.showNewForm?'Annulla':'+ Chiudi stagione e iniziane una nuova')+'</button>' +
    (s.showNewForm ? renderNewStagioneForm() : '') +
  '</div>' +
  '<div class="card"><h3 style="margin-top:0;">Archivio stagioni chiuse</h3>' +
    (chiuse.length===0 ? '<p class="hint">Nessuna stagione chiusa ancora.</p>' :
      chiuse.map(st=>
        '<div class="schema-session-row" onclick="openStagioneArchivio(\''+st.id+'\')">' +
          '<strong>'+esc(st.societa)+' — '+esc(st.tipoSquadra)+' '+esc(st.livello)+'</strong>' +
          '<span class="pill pill-muted">'+esc(st.etichetta)+'</span>' +
          '<span class="hint">Chiusa il '+formatDate((st.chiusaIl||'').slice(0,10))+'</span>' +
        '</div>'
      ).join('')
    ) +
  '</div>' +
  (state.stagioni.detailId ? renderStagioneArchivioDetail() : '');
}

/* ---------- init ---------- */
document.addEventListener('click', hideContextMenu);
renderView();
loadData().then(refreshSchemaNotifiche);
window.addEventListener('beforeunload', function(e){
  if(state.players.length || state.matches.length || state.allenamenti.length){
    e.preventDefault();
    e.returnValue = '';
  }
});
