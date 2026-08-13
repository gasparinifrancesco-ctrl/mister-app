/* ---------- responsive ---------- */
// Stessa soglia della barra di navigazione in basso in globals.css: sopra i 760px (o in
// orizzontale con più di 500px di altezza) si è su desktop/tablet, sotto si è nel layout
// mobile con tab dedicate al posto delle colonne affiancate.
function isMobileLayout(){
  if(typeof window==='undefined' || !window.matchMedia) return false;
  return window.matchMedia('(max-width:760px), (max-height:500px) and (orientation:landscape)').matches;
}
(function watchMobileLayout(){
  if(typeof window==='undefined') return;
  let wasMobile = null;
  let timer = null;
  function check(){
    const nowMobile = isMobileLayout();
    if(nowMobile!==wasMobile){
      wasMobile = nowMobile;
      // Solo se l'app ha già fatto il primo render: renderView() esiste solo dopo che lo
      // script intero è stato interpretato (viene definito più sotto in questo stesso file).
      if(typeof renderView==='function') renderView();
    }
  }
  window.addEventListener('resize', function(){
    clearTimeout(timer);
    timer = setTimeout(check, 150);
  });
  window.addEventListener('orientationchange', function(){
    clearTimeout(timer);
    timer = setTimeout(check, 150);
  });
})();

/* ---------- costanti ---------- */
const ROLE_CODES = ['Por','DC','TD','TS','CDC','CC','COC','ES','ED','ATT','AD','AS'];
const ROLE_ORDER = { 'Por':0, 'DC':1, 'TD':2, 'TS':2, 'CDC':3, 'CC':4, 'COC':4, 'ES':5, 'ED':5, 'ATT':6, 'AD':6, 'AS':6 };
const FOOT_OPTIONS = ['', 'Destro','Sinistro','Ambidestro'];
const GOAL_TYPES_FATTI = ['Azione','Rigore','Punizione diretta','Punizione indiretta',"Calcio d'angolo",'Autogol avversario'];
const GOAL_TYPES_SUBITI = ['Azione','Rigore','Punizione diretta','Punizione indiretta',"Calcio d'angolo",'Autogol nostro'];
const PRESENZA_STATI = ['Disponibile','Non disponibile','Lavoro differenziato'];
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
    {ruolo:'DC', numero:6, x:0.38, y:0.82},{ruolo:'TS', numero:3, x:0.15, y:0.78},{ruolo:'CDC', numero:4, x:0.50, y:0.58},
    {ruolo:'CC', numero:8, x:0.68, y:0.45},{ruolo:'CC', numero:10,x:0.32, y:0.45},{ruolo:'ED', numero:7, x:0.85, y:0.15},
    {ruolo:'ATT', numero:9, x:0.50, y:0.10},{ruolo:'ES', numero:11,x:0.15, y:0.15}
  ],
  '3-5-2': [
    {ruolo:'Por', numero:1, x:0.50, y:0.95},{ruolo:'DC', numero:5, x:0.65, y:0.80},{ruolo:'DC', numero:6, x:0.50, y:0.83},
    {ruolo:'DC', numero:3, x:0.35, y:0.80},{ruolo:'TD', numero:2, x:0.88, y:0.55},{ruolo:'CC', numero:8, x:0.65, y:0.48},
    {ruolo:'CDC', numero:4, x:0.50, y:0.55},{ruolo:'CC', numero:10,x:0.35, y:0.48},{ruolo:'TS', numero:11,x:0.12, y:0.55},
    {ruolo:'ATT', numero:9, x:0.40, y:0.12},{ruolo:'ATT', numero:7, x:0.60, y:0.12}
  ],
  '4-2-3-1': [
    {ruolo:'Por', numero:1, x:0.50, y:0.95},{ruolo:'TD', numero:2, x:0.85, y:0.78},{ruolo:'DC', numero:5, x:0.62, y:0.82},
    {ruolo:'DC', numero:6, x:0.38, y:0.82},{ruolo:'TS', numero:3, x:0.15, y:0.78},{ruolo:'CDC', numero:4, x:0.62, y:0.60},
    {ruolo:'CDC', numero:8, x:0.38, y:0.60},{ruolo:'ES', numero:11,x:0.15, y:0.35},{ruolo:'CC', numero:10,x:0.50, y:0.30},
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
// L'arancione è riservato all'accent dell'app (pulsanti primari, stato "selezionato"): usarlo
// anche come colore giocatore lo renderebbe ambiguo con quel significato. Al suo posto il
// giallo, già un colore noto dell'app (--yellow, usato per il pareggio), resta comunque
// "caldo" per il ruolo Attacco senza sovrapporsi al linguaggio dei controlli.
const SCHEMA_COLORS = ['#E4C13B','#4DA3FF','#E5E7EB','#EF4444','#10B981'];
const SCHEMA_COLOR_LABELS = { '#E4C13B':'Attacco', '#4DA3FF':'Difesa', '#E5E7EB':'Neutro', '#EF4444':'Portiere', '#10B981':'Collaboratore' };
// Paletta estesa (pulsante "+" nella toolbar): include le 5 di base più varianti sullo
// stesso family di tonalità, cosi resta coerente con lo stile scuro/desaturato dell'app
// invece di un color picker qualsiasi. Mai il vero #FF8A00 dell'accent, per lo stesso
// motivo di sopra.
const SCHEMA_EXTENDED_COLORS = [
  '#E4C13B','#4DA3FF','#E5E7EB','#EF4444','#10B981',
  '#2563EB','#38BDF8','#14B8A6','#34D399','#FB7185',
  '#DC2626','#FBBF24','#A78BFA','#8B5CF6','#94A3B8','#FFFFFF',
];
// Fasi di gioco a scelta vincolata (non etichetta libera): personalizzabile per
// account (modello Categoria, vedi /api/schema/categorie), non più una lista fissa qui.
// Stessa palette pre-verificata per il contrasto offerta da /api/schema/categorie per le
// fasi create da zero — riproposta qui per il menu "cambia colore" di una fase esistente,
// così non si rischia di scegliere un colore poco leggibile col testo scuro dei chip.
const SCHEMA_CATEGORIA_COLORI = ['#F2C94C', '#4FA8E0', '#6FCF7A', '#B591DE', '#E67F78', '#E08A4F', '#4FD1C5', '#7FA8C9', '#C9A0DC', '#8FBF6F'];
function schemaCategoriaInfo(key){
  return state.schema.categorie.find(c=>c.key===key) || null;
}
// Un esercizio può appartenere a più fasi di gioco insieme (vedi Exercise.categorie, JSON
// array): stessa UI a chip cliccabili già in uso per il filtro libreria, riproposta qui per
// la selezione vera e propria — un clic aggiunge/rimuove la fase dall'insieme selezionato.
function schemaCategoriaMultiSelectHTML(selectedKeys, toggleFnName, readonly){
  if(!state.schema.categorie.length) return '<p class="hint">Nessuna fase di gioco disponibile.</p>';
  if(readonly){
    const selected = state.schema.categorie.filter(c=>selectedKeys.includes(c.key));
    return selected.length ? '<div class="schema-tag-chip-row">' + selected.map(c=>'<span class="schema-cat-chip" style="background:'+c.color+';">'+esc(c.label)+'</span>').join('') + '</div>' : '<p class="hint">Non categorizzato</p>';
  }
  return '<div class="schema-tag-chip-row">' + state.schema.categorie.map(c=>
    '<button type="button" class="schema-cat-chip schema-cat-filter-chip '+(selectedKeys.includes(c.key)?'schema-cat-filter-chip-active':'')+'" style="background:'+c.color+';" onclick="'+toggleFnName+'(\''+c.key+'\')">'+esc(c.label)+'</button>'
  ).join('') + '</div>';
}
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
    showIdentityForm: false,
    newTipo: 'Prima Squadra',
    newLivello: STAGIONE_LIVELLI['Prima Squadra'][0],
  },
  onboarding: {
    dismissed: [],
    loaded: false,
    step: 0,
  },
  profile: {
    tempAccentColor: null,
  },
  team: {
    invites: [],
    loaded: false,
    lastInviteLink: null,
    roster: [],
    rosterLoaded: false,
    considerazioniGeneriche: [],
    newConsiderazioneTesto: '',
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
    categorie: [],
    categorieLoaded: false,
    filterSearch: '',
    filterTags: [],
    filterCategorie: [],
    newExerciseTitolo: '',
    newExerciseNumGiocatori: 8,
    newExerciseNumPortieri: 0,
    newExerciseDescrizione: '',
    newExerciseCategorie: [],
    currentExercise: null,
    activeLivelloId: null,
    currentSession: null,
    drawMode: false,
    placeMode: null,
    eraserMode: false,
    activeColor: SCHEMA_COLORS[0],
    // Ultima dimensione scelta (A-/A+ dal menu contestuale) per ciascun tipo di elemento
    // ridimensionabile: il prossimo elemento piazzato di quel tipo nasce con quella misura
    // invece di ripartire sempre da 1, cosi non tocca reimpostarla ogni volta componendo
    // una formazione o un set di paletti/cinesini/coni tutti della stessa taglia.
    activeChipSizeByType: { giocatore: 1, cono: 1, paletto: 1, cinesino: 1 },
    // Cronologia indietro/avanti del disegno (chip/frecce/zone) del livello attualmente
    // aperto: si azzera cambiando livello, vedi schemaInitHistoryForLivello.
    drawHistory: { livelloId: null, stack: [], index: -1 },
    // Selezione multipla (lazo su area libera del campo): {type:'chip'|'arrow'|'zone', id}.
    // Vuota = nessuna selezione attiva. Si azzera ad ogni cambio di livello/vista.
    selection: [],
    colorPickerOpen: false,
    activeLineType: 'passaggio',
    livelloPicker: null,
    duplicatePicker: null,
    pendingBlockTarget: null,
  }
};
let modalConfirmCallback = null;

function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
// Textarea autodimensionate: nessun resize manuale (vedi CSS), l'altezza segue sempre il
// contenuto. Un unico listener 'input' delegato + un MutationObserver sul body coprono
// ogni textarea dell'app (descrizioni, note...) senza dover toccare ogni singolo punto
// di rendering: qualunque innerHTML che inietta una textarea viene intercettato qui.
function autosizeTextarea(el){
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
function autosizeAllTextareas(root){
  (root || document).querySelectorAll('textarea').forEach(autosizeTextarea);
}
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
// Cognome da solo, salvo quando un altro giocatore selezionato in formazione predefinita
// (titolare o riserva) ha lo stesso cognome: in quel caso si antepone l'iniziale del nome
// (es. "M. Rossi") per non confonderli su campo/panchina dove c'è spazio solo per il cognome.
function shortDisplayName(player){
  if(!player) return '';
  const cognome = surnameOf(player.nome);
  const selectedIds = new Set([].concat(
    (state.formazioneDefault.chips||[]).map(c=>c.playerId),
    (state.formazioneDefault.riserve||[]).filter(Boolean)
  ));
  const collision = state.players.some(p=>p.id!==player.id && selectedIds.has(p.id) && surnameOf(p.nome)===cognome);
  if(!collision) return cognome;
  const iniziale = givenNameOf(player.nome).charAt(0).toUpperCase();
  return (iniziale ? iniziale+'. ' : '') + cognome;
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
function matchTipoLabel(tipo){
  if(tipo==='Amichevole') return 'amichevole';
  if(tipo==='Coppa') return 'coppa';
  return 'campionato';
}
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
// Vero se il giocatore risulta infortunato nel giorno indicato (data inizio inclusa, data
// rientro inclusa se impostata — nessuna data rientro = infortunio ancora in corso).
function isPlayerInfortunatoOn(player, dateStr){
  if(!player || !player.infortunato || !player.infortunioDataInizio || !dateStr) return false;
  if(dateStr < player.infortunioDataInizio) return false;
  if(player.infortunioDataRientro && dateStr > player.infortunioDataRientro) return false;
  return true;
}
// dateStr (facoltativo, "YYYY-MM-DD" del giorno di allenamento): se il giocatore risulta
// infortunato quel giorno, la presenza si precompila su "Lavoro differenziato" invece del
// solito Disponibile/Non disponibile — resta comunque un default, non un vincolo: l'allenatore
// può sempre cambiarlo a mano dal menu a tendina.
function defaultPresenzaFor(player, dateStr){
  if(isPlayerInfortunatoOn(player, dateStr)) return 'Lavoro differenziato';
  return (player && player.aggregatoPrimaSquadra) ? 'Non disponibile' : 'Disponibile';
}
// Icona a croce (materiale sanitario), non un'emoji: coerente con le altre icone SVG disegnate
// a mano nel codebase invece di caratteri unicode che rendono in modo incoerente tra piattaforme.
const INJURY_ICON_SVG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="3.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
// Selezionabile-ma-segnalato: mai un motivo per bloccare la scelta in formazione, solo un
// avviso visivo — l'allenatore può sempre convocare/schierare un giocatore infortunato
// (es. per una convocazione precauzionale) sapendo però qual è la sua situazione.
function injuryBadgeHTML(player){
  if(!player || !player.infortunato) return '';
  let title = 'Infortunato dal ' + formatDate(player.infortunioDataInizio||'');
  if(player.infortunioDataRientro) title += ' — rientro previsto ' + formatDate(player.infortunioDataRientro);
  return '<span class="injury-dot" title="'+esc(title)+'">'+INJURY_ICON_SVG+'</span>';
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
  if(!m.valutazioni) m.valutazioni = { nostraSquadra:{voto:null,note:'',atletico:null,tecnico:null,tattico:null,personalita:null}, nostriGiocatori:{}, avversariSquadra:{voto:null,note:''}, avversariGiocatori:[] };
  // Le 4 valutazioni per asse sono nuove: le partite già registrate hanno già un
  // valutazioni.nostraSquadra (con solo voto/note), quindi il ramo sopra non basta a
  // backfillarle — vanno aggiunte qui a chi manca.
  if(m.valutazioni.nostraSquadra && m.valutazioni.nostraSquadra.atletico===undefined){
    m.valutazioni.nostraSquadra.atletico = null;
    m.valutazioni.nostraSquadra.tecnico = null;
    m.valutazioni.nostraSquadra.tattico = null;
    m.valutazioni.nostraSquadra.personalita = null;
  }
  if(!m.convocati) m.convocati = [];
  // Finché la formazione non è fissata (pulsante "Salva formazione" nel tabellino), il campo
  // di questa partita è uno specchio live della formazione predefinita, non dati propri.
  if(m.formazioneFissata==null) m.formazioneFissata = false;
  if(m.capitanoId===undefined) m.capitanoId = null;
  if(m.viceCapitanoId===undefined) m.viceCapitanoId = null;
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
  if(typeof p.infortunato !== 'boolean') p.infortunato = false;
  if(p.infortunioDataInizio===undefined) p.infortunioDataInizio = null;
  if(p.infortunioDataRientro===undefined) p.infortunioDataRientro = null;
  // MD (mediano) è stato rinominato CDC: chi ha già un giocatore o un modulo salvato con
  // il vecchio codice lo ritrova qui, senza dover riassegnare a mano il ruolo.
  if(p.ruolo==='MD') p.ruolo = 'CDC';
  if(p.secondoRuolo==='MD') p.secondoRuolo = 'CDC';
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
  try{
    const r = await storageGet('onboarding-dismissed');
    state.onboarding.dismissed = (r && r.value) ? JSON.parse(r.value) : [];
  }catch(e){ state.onboarding.dismissed = []; }
  state.onboarding.loaded = true;
  if(!Array.isArray(state.formazioneDefault.riserve)) state.formazioneDefault.riserve = [];
  if(!Array.isArray(state.formazioneDefault.arrows)) state.formazioneDefault.arrows = [];
  (state.formazioneDefault.slots||[]).forEach(s=>{ if(s.ruolo==='MD') s.ruolo = 'CDC'; });
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
    (state.formazioneDefault.riserve||[]).filter(Boolean)
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
async function saveOnboardingDismissed(){
  try{
    const r = await storageSet('onboarding-dismissed', JSON.stringify(state.onboarding.dismissed));
    if(!r || !r.ok) throw new Error('empty result');
    reportSaveOk();
  }
  catch(e){ console.error('storage error (onboarding)', e); reportSaveError(); }
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
    // Senza edit_formazione non si aggancia proprio il drag/click di assegnazione: niente
    // interazione silenziosamente inutile, coerente con lo stesso pattern del disegnatore.
    if(can('edit_formazione')){ attachDefaultPitchInteractions(); attachDefaultRosterInteractions(); }
    window.scrollTo(0, prevScrollY);
  } else if(state.currentView==='pianoSquadra'){
    container.innerHTML = renderPianoSquadraView();
    if(can('edit_piano_squadra')) attachPianoSquadraInteractions();
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
    const prevScrollY = window.scrollY;
    container.innerHTML = renderSchemaView();
    attachSchemaInteractions();
    // requestAnimationFrame, non una chiamata sincrona: il MutationObserver che
    // autodimensiona le textarea (vedi fondo file) scatta come microtask DOPO questo
    // punto e cambia l'altezza della pagina, vanificando un ripristino immediato dello
    // scroll — bisogna aspettare che anche quel ridimensionamento sia avvenuto.
    requestAnimationFrame(function(){ window.scrollTo(0, prevScrollY); });
  } else if(state.currentView==='stagioni'){
    container.innerHTML = renderStagioniView();
  }
  renderSideNav();
  renderNextMatchBar();
  maybeInjectOnboardingTip();
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
const BELL_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const HELP_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
const SIDE_NAV_LABELS = { calendario:'Calendario', pianoSquadra:'Piano Squadra', formazione:'Formazione', rosa:'Rosa', statistiche:'Statistiche', schema:'Allenamenti' };
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
  if(!el) return { email:'', isOwner:true, permissions:[], schemaUnlocked:false, stagioneEtichetta:'' };
  let permissions = [];
  try{ permissions = JSON.parse(el.getAttribute('data-permissions')||'[]'); }catch{ permissions = []; }
  return {
    email: el.getAttribute('data-email')||'',
    nome: el.getAttribute('data-nome')||'',
    cognome: el.getAttribute('data-cognome')||'',
    ruolo: el.getAttribute('data-ruolo')||'',
    accentColor: el.getAttribute('data-accent-color')||'',
    isOwner: el.getAttribute('data-is-owner')==='1',
    permissions,
    actorId: el.getAttribute('data-actor-id')||'',
    schemaUnlocked: el.getAttribute('data-schema-unlocked')==='1',
    stagioneEtichetta: el.getAttribute('data-stagione-etichetta')||'',
    stagioneSocieta: el.getAttribute('data-stagione-societa')||'',
    stagioneTipo: el.getAttribute('data-stagione-tipo')||'',
    stagioneLivello: el.getAttribute('data-stagione-livello')||'',
  };
}
// Specchio lato client di lib/permissions.js hasPermission: il vero proprietario passa
// sempre, un collaboratore solo se la chiave (o almeno una, se è un array) è nei permessi
// che l'admin gli ha assegnato. Duplicato qui perché app.js è uno script statico non
// bundlizzato da Next, non può fare import da lib/*.
function can(key){
  const user = getAppUser();
  if(user.isOwner) return true;
  const keys = Array.isArray(key) ? key : [key];
  return keys.some(k=>user.permissions.includes(k));
}
const NAV_VIEW_PERMISSION = { calendario:'view_calendario', pianoSquadra:'view_piano_squadra', formazione:'view_formazione', rosa:'view_rosa', schema:'view_allenamenti' };
function renderSideNav(){
  const nav = document.getElementById('side-nav');
  const order = currentSideNavOrder();
  const user = getAppUser();
  // Il modulo Allenamenti/libreria esercizi resta "bloccato" come per un account senza
  // l'entitlement finché il collaboratore non ha il permesso view_allenamenti, anche se la
  // squadra ce l'ha (schemaUnlocked è l'entitlement di squadra, non il permesso personale).
  const schemaUnlocked = user.schemaUnlocked && can('view_allenamenti');
  nav.innerHTML = order.filter(key => {
    // Statistiche non ha un permesso proprio: è calcolata da dati Rosa+Calendario già
    // letti altrove, quindi è visibile solo se si vedono entrambe le sezioni sorgente
    // (altrimenti la vista si romperebbe silenziosamente sulle fetch sottostanti).
    if(key==='statistiche') return can('view_rosa') && can('view_calendario');
    if(key==='schema') return true; // gestito sotto (voce "bloccata" vs attiva, mai nascosta del tutto)
    const perm = NAV_VIEW_PERMISSION[key];
    return !perm || can(perm);
  }).map(key => {
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
  alert('Modulo Allenamenti in arrivo — non ancora disponibile su questo account.');
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
  let presenti = 0;
  pastAllenamenti.forEach(a=>{
    const v = (a.presenze && a.presenze[playerId]) || defaultPresenzaFor(player, a.data);
    // "Lavoro differenziato" conta come presente ai fini della percentuale: il giocatore
    // si è comunque presentato all'allenamento, solo con un carico di lavoro diverso.
    if(v==='Disponibile' || v==='Lavoro differenziato') presenti++;
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
const ROSA_VIEW_MODES = [['generali','Info generali'],['statistiche','Statistiche']];
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
  return [
    ['nome','Nome'], ['ruolo','Ruolo'], ['secondoRuolo','2° ruolo'], ['eta','Età'], ['piede','Piede'],
    ['altezza','Altezza'], ['valutazione','Valutazione'], ['aggregatoPrimaSquadra','Aggregato'], ['infortunato','Infortunio'], ['note','Note'],
  ];
}
function renderRosaRow(r, mode, idx){
  const canEdit = can('edit_rosa');
  // La modifica (click sulla riga) è possibile solo da "Info generali": è l'unica vista con
  // tutti i campi anagrafici, quindi è l'unico posto dove la riga di modifica si allinea
  // correttamente alle colonne mostrate. Se stavi modificando un giocatore e cambi vista, la
  // riga torna automaticamente in sola lettura invece di restare aperta disallineata.
  const editing = canEdit && state.editingPlayerId === r.id && mode==='generali';
  // Numero di riga fisso a sinistra (posizione nell'ordinamento corrente, non un id): resta
  // sempre visibile quanti giocatori ci sono in totale, qualunque sia la colonna scelta per
  // ordinare. La "X" per rimuovere il giocatore va invece sempre in fondo a destra.
  const numCell = '<td class="roster-num-cell" data-label="#">'+(idx+1)+'</td>';
  if(editing){
    const roleOpts = ROLE_CODES.map(rc=>'<option value="'+rc+'" '+(r.ruolo===rc?'selected':'')+'>'+rc+'</option>').join('');
    const roleOptsNone = '<option value="" '+(r.secondoRuolo?'':'selected')+'>—</option>' + ROLE_CODES.map(rc=>'<option value="'+rc+'" '+(r.secondoRuolo===rc?'selected':'')+'>'+rc+'</option>').join('');
    const footOpts = FOOT_OPTIONS.map(f=>'<option value="'+f+'" '+(r.piede===f?'selected':'')+'>'+(f||'—')+'</option>').join('');
    const starOptions = [0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5].map(v=>'<option value="'+v+'" '+(Number(r.valutazione||0)===v?'selected':'')+'>'+v.toFixed(1)+'</option>').join('');
    // Stesso ordine delle colonne di "Info generali" (nome, ruolo, 2° ruolo, età←anno
    // nascita, piede, altezza, valutazione, aggregato, infortunio, note), cosi ogni campo
    // modificabile resta sotto l'intestazione giusta invece di richiedere celle vuote di
    // riempimento.
    return '<tr style="background:rgba(var(--accent-rgb),0.07);">' +
      numCell +
      '<td data-label="Nome"><input type="text" style="width:150px;" value="'+esc(r.nome)+'" onchange="updatePlayerField(\''+r.id+'\',\'nome\',this.value)"></td>' +
      '<td data-label="Ruolo"><select onchange="updatePlayerField(\''+r.id+'\',\'ruolo\',this.value)">'+roleOpts+'</select></td>' +
      '<td data-label="2° ruolo"><select onchange="updatePlayerField(\''+r.id+'\',\'secondoRuolo\',this.value)">'+roleOptsNone+'</select></td>' +
      '<td data-label="Età"><input type="number" min="1995" max="2020" style="width:75px;" value="'+esc(r.annoNascita||'')+'" onchange="updatePlayerField(\''+r.id+'\',\'annoNascita\',this.value)" title="Anno di nascita"></td>' +
      '<td data-label="Piede"><select onchange="updatePlayerField(\''+r.id+'\',\'piede\',this.value)">'+footOpts+'</select></td>' +
      '<td data-label="Altezza"><input type="number" min="100" max="220" style="width:70px;" value="'+esc(r.altezza||'')+'" placeholder="cm" onchange="updatePlayerField(\''+r.id+'\',\'altezza\',this.value)"></td>' +
      '<td data-label="Valutazione"><select onchange="updatePlayerField(\''+r.id+'\',\'valutazione\',this.value)">'+starOptions+'</select></td>' +
      '<td data-label="Aggregato"><label style="display:flex;align-items:center;gap:4px;font-size:0.68rem;white-space:nowrap;"><input type="checkbox" '+(r.aggregatoPrimaSquadra?'checked':'')+' style="width:auto;" onchange="updatePlayerCheckboxField(\''+r.id+'\',\'aggregatoPrimaSquadra\',this.checked)" title="Aggregato: non disponibile di default per gli allenamenti"> Aggregato</label></td>' +
      '<td data-label="Infortunio">' +
        '<label style="display:flex;align-items:center;gap:4px;font-size:0.68rem;white-space:nowrap;"><input type="checkbox" '+(r.infortunato?'checked':'')+' style="width:auto;" onchange="toggleInfortunato(\''+r.id+'\',this.checked)" title="Infortunato: resta selezionabile ma segnalato in formazione, precompila lavoro differenziato in presenze"> Infortunato</label>' +
        (r.infortunato ? '<div style="display:flex; gap:4px; margin-top:4px;">' +
          '<input type="date" style="width:120px;" value="'+esc(r.infortunioDataInizio||'')+'" onchange="updateInfortunioData(\''+r.id+'\',\'infortunioDataInizio\',this.value)" title="Data inizio infortunio">' +
          '<input type="date" style="width:120px;" value="'+esc(r.infortunioDataRientro||'')+'" onchange="updateInfortunioData(\''+r.id+'\',\'infortunioDataRientro\',this.value)" title="Data rientro prevista (facoltativa)">' +
        '</div>' : '') +
      '</td>' +
      '<td data-label="Note"><input type="text" class="input-note" placeholder="note libere" value="'+esc(r.note||'')+'" onchange="updatePlayerField(\''+r.id+'\',\'note\',this.value)"></td>' +
      '<td data-label="" style="white-space:nowrap; text-align:right;"><button class="btn btn-small btn-primary" onclick="stopEditPlayer()">OK</button> <button class="btn-icon" onclick="confirmRemovePlayer(\''+r.id+'\')" aria-label="Rimuovi">×</button></td>' +
    '</tr>';
  }
  const cells = { nome: '<td oncontextmenu="showRosaPlayerContextMenu(event,\''+r.id+'\')" title="Clic destro per esportare le statistiche">'+esc(displayName(r.nome))+'</td>' };
  cells.ruolo = '<td>'+esc(r.ruolo)+'</td>';
  cells.secondoRuolo = '<td>'+esc(r.secondoRuolo)+'</td>';
  cells.eta = '<td>'+(computeAge(r.annoNascita)!=null?computeAge(r.annoNascita):'-')+'</td>';
  cells.piede = '<td>'+esc(r.piede)+'</td>';
  cells.altezza = '<td>'+(r.altezza?r.altezza+' cm':'-')+'</td>';
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
  cells.aggregatoPrimaSquadra = '<td>'+(r.aggregatoPrimaSquadra ? '<span class="pill pill-muted">Aggregato</span>' : '—')+'</td>';
  cells.infortunato = '<td>'+(r.infortunato ? '<span class="pill pill-red" title="'+esc('Dal '+formatDate(r.infortunioDataInizio||'')+(r.infortunioDataRientro?' al '+formatDate(r.infortunioDataRientro):' — nessuna data di rientro'))+'">Infortunato</span>' : '—')+'</td>';
  cells.valutazione = '<td>'+starRatingHTML(r.valutazione)+'</td>';
  cells.note = '<td class="roster-note-cell">'+(r.note?esc(r.note):'—')+'</td>';
  const cols = rosaColsForMode(mode);
  // Su schermo stretto la tabella diventa una sequenza di schede (vedi CSS): ogni <td>
  // riceve l'etichetta della propria colonna come data-label, cosi un ::before puo
  // mostrarla al posto dell'intestazione di colonna che in quella vista sparisce.
  return '<tr '+(canEdit && mode==='generali'?'onclick="startEditPlayer(\''+r.id+'\')" style="cursor:pointer;"':'')+'>' +
    numCell +
    cols.map(([key,label])=>cells[key].replace('<td', '<td data-label="'+esc(label)+'"')).join('') +
    '<td data-label="" style="text-align:right;">'+(canEdit?'<button class="btn-icon" onclick="event.stopPropagation(); confirmRemovePlayer(\''+r.id+'\')" aria-label="Rimuovi">×</button>':'')+'</td>' +
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
  } else if(field==='altezza'){
    p.altezza = value ? parseInt(value,10) : null;
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
// A differenza di updatePlayerCheckboxField (un semplice flag), attivare l'infortunio ha un
// effetto collaterale utile (precompila la data inizio a oggi, cosi non tocca sempre aprirla
// a mano) e disattivarlo pulisce entrambe le date invece di lasciarle appese e fuorvianti la
// prossima volta che si riattiva il flag.
function toggleInfortunato(playerId, checked){
  const p = state.players.find(pl=>pl.id===playerId);
  if(!p) return;
  p.infortunato = checked;
  if(checked && !p.infortunioDataInizio) p.infortunioDataInizio = new Date().toISOString().slice(0,10);
  if(!checked){ p.infortunioDataInizio = null; p.infortunioDataRientro = null; }
  savePlayers();
  renderView();
}
function updateInfortunioData(playerId, field, value){
  const p = state.players.find(pl=>pl.id===playerId);
  if(!p) return;
  p[field] = value || null;
  savePlayers();
  renderView();
}
function computePlayerStatsRow(playerId, stats){
  const p = state.players.find(pl=>pl.id===playerId);
  if(!p) return null;
  stats = stats || computeSeasonStats();
  const st = stats.perPlayer[p.id] || {};
  return {
    id: p.id, nome: p.nome, ruolo: p.ruolo, secondoRuolo: p.secondoRuolo||'', piede: p.piede||'', annoNascita: p.annoNascita||null,
    altezza: p.altezza||null,
    aggregatoPrimaSquadra: !!p.aggregatoPrimaSquadra,
    infortunato: !!p.infortunato, infortunioDataInizio: p.infortunioDataInizio||null, infortunioDataRientro: p.infortunioDataRientro||null,
    eta: computeAge(p.annoNascita), valutazione: p.valutazione||0, note: p.note||'',
    convocazioni: st.convocazioni||0, titolare: st.titolare||0, subentrato: st.subentrato||0,
    minuti: st.minutiTot||0, gol: st.gol||0, golSubiti: st.golSubiti||0, assist: st.assist||0,
    gialli: st.gialli||0, rossi: st.rossi||0,
    votoMedio: st.votiCount ? (st.votiSum/st.votiCount) : null,
    percentPresenza: computePresenzaPercent(p.id)
  };
}
function rosaMobileRoleGroup(ruolo){
  const ord = ROLE_ORDER[ruolo];
  if(ord===0) return 'Portieri';
  if(ord===1 || ord===2) return 'Difensori';
  if(ord===6) return 'Attaccanti';
  if(ord!=null) return 'Centrocampisti';
  return 'Altro';
}
// Da telefono, quando l'ordinamento attivo è "per ruolo", inframezza intestazioni di gruppo
// (Portieri/Difensori/Centrocampisti/Attaccanti) tra le righe: le righe arrivano già ordinate
// per ROLE_ORDER, quindi basta accorgersi di quando il gruppo cambia rispetto alla riga prima.
// Da A-Z o da desktop (dove le colonne ordinabili in intestazione bastano da sole) niente
// intestazioni, elenco piatto come sempre.
function renderRosaTbodyRows(rows, mode, sort){
  const groupByRole = isMobileLayout() && sort.column==='ruolo';
  let lastGroup = null;
  let html = '';
  rows.forEach((r,i)=>{
    if(groupByRole){
      const g = rosaMobileRoleGroup(r.ruolo);
      if(g!==lastGroup){
        lastGroup = g;
        html += '<tr class="rosa-group-header-row"><td class="rosa-group-header" colspan="99">'+esc(g)+'</td></tr>';
      }
    }
    html += renderRosaRow(r, mode, i);
  });
  return html;
}
function renderRosaView(){
  const stats = computeSeasonStats();
  let rows = state.players.map(p=>computePlayerStatsRow(p.id, stats));
  const sort = state.rosaSort || { column:'nome', dir:'asc' };
  rows.sort((a,b)=>rosaCompare(a,b,sort.column,sort.dir));

  const roleOptions = ROLE_CODES.map(r=>'<option value="'+r+'">'+r+'</option>').join('');
  const roleOptionsWithNone = '<option value="">—</option>' + roleOptions;
  const mode = state.rosaViewMode || 'generali';
  const cols = rosaColsForMode(mode);
  // Anagrafica: solo admin può aggiungere/modificare/eliminare giocatori (passa dal PUT
  // generico su /api/storage/players, riservato all'admin — vedi Fase 3). Un collaboratore
  // vede comunque tutta la rosa e le statistiche, in sola lettura.
  const canEditRosa = can('edit_rosa');

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
    (mode==='statistiche' ? (renderStatsFilterHTML() + '<p class="hint" style="margin:6px 0 10px;">' + esc(statsFilterLabel()) + '</p>') : '') +
    '<div class="segmented">' +
      '<button class="' + (sort.column==='ruolo'?'segmented-active':'') + '" onclick="sortRosaBy(\'ruolo\')">Per ruolo</button>' +
      '<button class="' + (sort.column==='nome'?'segmented-active':'') + '" onclick="sortRosaBy(\'nome\')">A-Z</button>' +
    '</div>' +
    (rows.length===0 ? '<p class="hint">Nessun giocatore in rosa. Aggiungilo o importalo qui sotto.</p>' :
      '<div class="rosa-table-wrap"><table class="rosa-table"><thead><tr>' +
        '<th class="roster-num-cell">#</th>' +
        cols.map(([key,label])=>rosaTh(label,key)).join('') +
        '<th></th>' +
      '</tr></thead><tbody>' +
        renderRosaTbodyRows(rows, mode, sort) +
      '</tbody></table></div>' +
      '<p class="hint" style="margin-top:8px;">Clicca un\'intestazione per ordinare, clicca una riga per modificare i dati del giocatore. Le statistiche derivano dai tabellini partita e dalle presenze allenamento; "Gol subiti" conta solo per i portieri.</p>'
    ) +
  '</div>' +
  (canEditRosa ? (
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
      '<div class="field"><label>Altezza (cm)</label><input id="new-altezza" type="number" min="100" max="220" placeholder="170"></div>' +
      '<label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-dim);padding-top:18px;"><input type="checkbox" id="new-aggregato" style="width:auto;padding:0;" title="Aggregato: non disponibile di default per gli allenamenti"> Aggregato</label>' +
      '<button class="btn btn-primary" onclick="addPlayer()">Aggiungi</button>' +
    '</div>' +
  '</div>' +
  '<div class="card">' +
    '<div class="card-header-row"><h2>Importa da Excel</h2></div>' +
    '<p class="hint">Aggiunge i giocatori estratti da "Stagione_26_27_United.xlsx". I nomi già presenti in rosa non vengono duplicati.</p>' +
    '<button class="btn btn-primary" onclick="importRosaEstratta()">Importa rosa estratta</button>' +
  '</div>'
  ) : '');
}
function addPlayer(){
  const nomeEl = document.getElementById('new-nome');
  const ruoloEl = document.getElementById('new-ruolo');
  const secondoEl = document.getElementById('new-secondo-ruolo');
  const piedeEl = document.getElementById('new-piede');
  const annoEl = document.getElementById('new-anno');
  const altezzaEl = document.getElementById('new-altezza');
  const aggregatoEl = document.getElementById('new-aggregato');
  const nome = nomeEl.value.trim();
  if(!nome){ nomeEl.focus(); return; }
  state.players.push({
    id: uid(), nome,
    ruolo: ruoloEl.value,
    secondoRuolo: secondoEl.value || '',
    piede: piedeEl.value || '',
    annoNascita: annoEl.value ? parseInt(annoEl.value,10) : null,
    altezza: altezzaEl.value ? parseInt(altezzaEl.value,10) : null,
    aggregatoPrimaSquadra: aggregatoEl.checked,
    valutazione: 0,
    note: '',
    infortunato: false,
    infortunioDataInizio: null,
    infortunioDataRientro: null,
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
    // Sostituisce con null invece di compattare: i posti riserva sono numerati fissi
    // (S1..S13, vedi MAX_RISERVE_SLOTS), togliere un elemento non deve spostare gli altri.
    state.formazioneDefault.riserve = (state.formazioneDefault.riserve||[]).map(pid=>pid===id?null:pid);
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
    {nome:'Samuele Sposito', ruolo:'CDC', secondoRuolo:'', piede:'', annoNascita:2009},
    {nome:'Angelo Musciacchio', ruolo:'CDC', secondoRuolo:'', piede:'', annoNascita:2008},
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
    {nome:'Antonio Bruno', ruolo:'ATT', secondoRuolo:'CDC', piede:'', annoNascita:2008},
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
// Testa + tre righe di scelta (1a/2a/3a) di uno slot: identiche sia sul campo (desktop) sia
// nell'elenco (mobile), cambia solo il contenitore attorno — un cerchietto col solo numero
// non basterebbe qui, servono tre nomi leggibili per posizione.
function renderPianoCardInner(s, expanded, surnameCounts){
  const picks = [0,1,2].map(idx=>{
    const pid = getPianoScelta(s.numero, idx);
    return { idx: idx, pid: pid, p: pid ? state.players.find(pl=>pl.id===pid) : null };
  });
  const rowsHtml = expanded ? picks.map(function(pick){
    return '<div class="piano-pitch-row piano-pitch-row-'+pick.idx+'">' +
      '<span class="piano-pitch-tier">'+(pick.idx+1)+'</span>' +
      '<select onclick="event.stopPropagation()" onchange="setPianoScelta('+s.numero+','+pick.idx+',this.value)" title="'+esc(PIANO_SCELTA_LABELS[pick.idx])+'">' + playerOptionsForSlot(s.numero, pick.idx, pick.pid) + '</select>' +
      (pick.p ? starRatingHTML(pick.p.valutazione, 8) : '') +
    '</div>';
  }).join('') : picks.map(function(pick){
    const label = pick.p ? esc(pianoDisplayName(pick.p, surnameCounts)) : '<span class="piano-pitch-empty">—</span>';
    return '<div class="piano-pitch-compact-row piano-pitch-compact-row-'+pick.idx+'">' +
      '<span class="piano-pitch-tier">'+(pick.idx+1)+'</span>' +
      '<span class="piano-pitch-compact-name">'+label+'</span>' +
      (pick.p ? starRatingHTML(pick.p.valutazione, 8) : '') +
    '</div>';
  }).join('');
  return '<div class="piano-pitch-card-head"><span class="piano-pitch-role">'+esc(s.ruolo)+'</span></div>' + rowsHtml;
}
function renderPianoSquadraPitch(def){
  const slots = def.slots || [];
  const surnameCounts = pianoSurnameCounts();
  const cardsHtml = slots.map(s=>{
    let leftPctNum = (105 - s.y) / 105 * 100;
    if(s.ruolo==='Por') leftPctNum *= 0.55;
    const leftPct = leftPctNum.toFixed(2);
    const topPct = (s.x / 68 * 100).toFixed(2);
    const expanded = state.pianoExpandedSlot === s.numero;
    return '<div class="piano-pitch-card' + (expanded?' piano-pitch-card-expanded':'') + '" data-numero="'+s.numero+'" style="left:'+leftPct+'%; top:'+topPct+'%;" onclick="togglePianoCardExpand('+s.numero+', event)">' +
      renderPianoCardInner(s, expanded, surnameCounts) +
    '</div>';
  }).join('');
  return '<div class="piano-pitch-wrap">' +
    '<svg viewBox="0 0 105 68" class="piano-pitch-svg"><g transform="translate(105,0) rotate(90)">' + pitchMarkingsSVG() + '</g></svg>' +
    '<div class="piano-pitch-cards">' + cardsHtml + '</div>' +
  '</div>';
}
// Da telefono il campo con le schede posizionate in percentuale non regge: card larghe
// almeno 110-140px (servono tre nomi leggibili, non un numero) finiscono per accavallarsi
// non appena il campo scende sotto i 4-500px di larghezza reale. Stesso contenuto (stesso
// renderPianoCardInner, stessa interazione di espansione), ma in un elenco impilato invece
// che sul disegno del campo — un ruolo alla volta, ordinato come ovunque nell'app
// (portiere, difesa, centrocampo, attacco).
function renderPianoSquadraMobileList(def){
  const surnameCounts = pianoSurnameCounts();
  const slots = (def.slots || []).slice().sort(function(a,b){
    const ra = ROLE_ORDER[a.ruolo]!=null ? ROLE_ORDER[a.ruolo] : 99;
    const rb = ROLE_ORDER[b.ruolo]!=null ? ROLE_ORDER[b.ruolo] : 99;
    return ra!==rb ? ra-rb : a.numero-b.numero;
  });
  return '<div class="piano-mobile-list">' + slots.map(s=>{
    const expanded = state.pianoExpandedSlot === s.numero;
    return '<div class="piano-mobile-card' + (expanded?' piano-pitch-card-expanded':'') + '" data-numero="'+s.numero+'" onclick="togglePianoCardExpand('+s.numero+', event)">' +
      renderPianoCardInner(s, expanded, surnameCounts) +
    '</div>';
  }).join('') + '</div>';
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
  const canEdit = can('edit_piano_squadra');
  return '' +
  '<div class="card" id="piano-squadra-pitch-card">' +
    '<div class="card-header-row"><h2>Piano Squadra</h2>' +
      '<div class="pitch-actions"><button class="btn btn-small" onclick="exportPageImage(\'piano-squadra\')">Esporta immagine</button></div>' +
    '</div>' +
    (canEdit ? '<p class="hint">Modulo <strong>' + esc(def.modulo) + '</strong>, ereditato dalla formazione predefinita in Rosa. Su ogni posizione scegli direttamente dal campo la 1ª, 2ª e 3ª scelta: se più posizioni condividono lo stesso ruolo, condividono anche le stesse scelte.</p>' : '<p class="hint">Sola lettura: non hai il permesso di modificare il Piano Squadra.</p>') +
    '<div'+(canEdit?'':' class="readonly-block"')+'>' + (isMobileLayout() ? renderPianoSquadraMobileList(def) : renderPianoSquadraPitch(def)) + '</div>' +
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
  if(match && !match.formazioneFissata && syncMatchFormationWithDefault(match)){
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
  const canEdit = can('edit_calendario');
  const tabs = [['convocazione','Formazione'],['avversari','Avversari'],['tabellino','Tabellino'],['valutazioni','Valutazioni']];
  const gf = (match.golFatti||[]).length, gs = (match.golSubiti||[]).length;
  const stato = computeMatchStato(match);
  return '' +
  '<div class="match-header">' +
    '<button class="btn-link" onclick="backToCalendario()">← Calendario</button>' +
    '<div class="match-header-main">' +
      '<h2 class="content-title">vs ' + esc(match.avversario) + '</h2>' +
      '<div class="match-header-fields">' +
        '<input type="date" value="' + esc(match.data) + '" '+(canEdit?'':'disabled')+' onchange="updateMatchField(\'' + match.id + '\',\'data\',this.value)">' +
        '<input type="time" value="' + esc(match.ora||'') + '" '+(canEdit?'':'disabled')+' onchange="updateMatchField(\'' + match.id + '\',\'ora\',this.value)">' +
        '<select '+(canEdit?'':'disabled')+' onchange="updateMatchField(\'' + match.id + '\',\'sede\',this.value)">' +
          '<option value="Casa" ' + (match.sede==='Casa'?'selected':'') + '>Casa</option>' +
          '<option value="Trasferta" ' + (match.sede==='Trasferta'?'selected':'') + '>Trasferta</option>' +
        '</select>' +
        '<select '+(canEdit?'':'disabled')+' onchange="updateMatchField(\'' + match.id + '\',\'tipo\',this.value)">' +
          '<option value="Campionato" ' + (match.tipo!=='Amichevole' && match.tipo!=='Coppa'?'selected':'') + '>Campionato</option>' +
          '<option value="Amichevole" ' + (match.tipo==='Amichevole'?'selected':'') + '>Amichevole</option>' +
          '<option value="Coppa" ' + (match.tipo==='Coppa'?'selected':'') + '>Coppa</option>' +
        '</select>' +
        '<span class="pill pill-muted">' + stato + '</span>' +
        '<span class="score-badge">' + gf + ' - ' + gs + '</span>' +
        '<button class="btn btn-small" onclick="exportMatchPDF(\'' + match.id + '\')">PDF</button>' +
        '<button class="btn btn-small" onclick="exportPageImage(\'partita-' + match.id + '\')">Esporta immagine</button>' +
        (canEdit ? '<button class="btn btn-small btn-danger" onclick="deleteMatch(\'' + match.id + '\')">Elimina</button>' : '') +
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
  // Senza edit_calendario, tutto il contenuto delle tab (convocazione/avversari/tabellino/
  // valutazioni) diventa sola lettura in un colpo solo: niente drag/click che poi fallirebbe
  // silenziosamente al salvataggio.
  const canEdit = can('edit_calendario');
  holder.classList.toggle('readonly-block', !canEdit);
  const prevScrollEl = holder.querySelector('.roster-side-list');
  const prevScrollTop = prevScrollEl ? prevScrollEl.scrollTop : null;
  if(state.currentMatchTab==='convocazione'){
    // Finché la formazione non è fissata, questa scheda è uno specchio live della
    // formazione predefinita: si aggiorna a ogni render, non solo alla prima apertura.
    if(!match.formazioneFissata && syncMatchFormationWithDefault(match)) saveMatches();
    holder.innerHTML = renderConvocazioneTab(match);
    if(canEdit && match.formazioneFissata){ attachNostraPitchInteractions(match.id); attachNostraBenchDrag(match.id); }
  } else if(state.currentMatchTab==='avversari'){
    holder.innerHTML = renderAvversariTab(match);
    if(canEdit){ attachAvversariaPitchInteractions(match.id); attachAvversariaBenchDrag(match.id); }
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

/* ---------- capitano/vice (per partita) ---------- */
function updateMatchCaptainField(matchId, field, value){
  const match = getMatch(matchId);
  const other = field==='capitanoId' ? 'viceCapitanoId' : 'capitanoId';
  if(value && match[other]===value){ alert('Non può essere sia capitano sia vice.'); return; }
  match[field] = value || null;
  saveMatches();
  renderMatchTab();
}
function renderCapitanoViceHTML(match){
  const options = match.convocati.map(id=>state.players.find(p=>p.id===id)).filter(Boolean)
    .sort((a,b)=>displayName(a.nome).localeCompare(displayName(b.nome)));
  function optsFor(selected){
    return '<option value="">—</option>' + options.map(p=>'<option value="'+p.id+'" '+(selected===p.id?'selected':'')+'>'+esc(displayName(p.nome))+'</option>').join('');
  }
  const capName = match.capitanoId ? displayName((state.players.find(p=>p.id===match.capitanoId)||{}).nome||'') : null;
  const viceName = match.viceCapitanoId ? displayName((state.players.find(p=>p.id===match.viceCapitanoId)||{}).nome||'') : null;
  return '<div class="form-row">' +
      '<div class="field"><label>Capitano</label><select onchange="updateMatchCaptainField(\''+match.id+'\',\'capitanoId\',this.value)">'+optsFor(match.capitanoId)+'</select></div>' +
      '<div class="field"><label>Vice capitano</label><select onchange="updateMatchCaptainField(\''+match.id+'\',\'viceCapitanoId\',this.value)">'+optsFor(match.viceCapitanoId)+'</select></div>' +
    '</div>' +
    ((capName||viceName) ? '<p class="hint">' + (capName?'Capitano: <strong>'+esc(capName)+'</strong>':'') + (capName&&viceName?' · ':'') + (viceName?'Vice: <strong>'+esc(viceName)+'</strong>':'') + '</p>' : '');
}
/* ---------- tab CONVOCAZIONE + FORMAZIONE NOSTRA ---------- */
function renderFormazioneActionsHTML(match){
  return '<div class="pitch-actions">' +
    '<button class="btn btn-small" onclick="exportConvocatiPDF(\''+match.id+'\')">Stampa convocati (alfabetico)</button>' +
    '<button class="btn btn-small" onclick="exportDistintaPDF(\''+match.id+'\')">Stampa distinta (per numero)</button>' +
    (match.formazioneFissata
      ? '<span class="pill pill-muted">Salvata come storico</span>'
      : '<button class="btn btn-primary btn-small" onclick="freezeMatchFormation(\''+match.id+'\')">Salva formazione</button>') +
  '</div>';
}
function renderConvocazioneTab(match){
  const max = maxConvocati(match);
  if(!match.formazioneFissata){
    return '' +
    '<div class="card">' +
      '<div class="card-header-row"><h2>Formazione</h2><span class="pill pill-muted">' + match.convocati.length + ' / ' + max + ' — dalla formazione predefinita</span></div>' +
      renderFormazioneActionsHTML(match) +
      '<p class="hint">Rispecchia in tempo reale la Formazione predefinita: si aggiorna da sola finché non la salvi qui sopra, che la fissa come storico di questa partita.</p>' +
      renderCapitanoViceHTML(match) +
      '<div class="formation-mirror">' +
        '<div class="pitch-bench-row">' +
          '<div class="pitch-wrap">' + renderDefaultPitchSVG() + '</div>' +
          '<div class="default-bench-panel">' + benchDefaultHTML() + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="formazione-piano-panel">' +
        '<div class="field"><label>Piano partita</label><textarea rows="6" placeholder="Idee, cambi previsti, punti chiave..." onchange="updateAvvNote(\''+match.id+'\',\'notePiano\',this.value)">'+esc(match.formazioneAvversaria.notePiano)+'</textarea></div>' +
        '<div class="field"><label>Note avversari</label><textarea rows="4" placeholder="Caratteristiche della squadra avversaria..." onchange="updateAvvNote(\''+match.id+'\',\'noteCaratteristiche\',this.value)">'+esc(match.formazioneAvversaria.noteCaratteristiche)+'</textarea></div>' +
      '</div>' +
    '</div>';
  }
  const formationOptions = '<option value="">Scegli modulo…</option>' + FORMATION_KEYS.map(k=>'<option value="'+k+'" '+(match.formazioneNostra.modulo===k?'selected':'')+'>'+k+'</option>').join('');
  return '' +
  '<div class="card">' +
    '<div class="card-header-row"><h2>Formazione</h2><span class="hint">' + match.convocati.length + ' / ' + max + ' (' + matchTipoLabel(match.tipo) + ') — fissata, storico di questa partita</span></div>' +
    renderFormazioneActionsHTML(match) +
    renderCapitanoViceHTML(match) +
    '<div class="form-row">' +
      '<div class="field"><label>Modulo</label><select onchange="if(this.value) applyFormationNostra(\''+match.id+'\',this.value)">'+formationOptions+'</select></div>' +
      '<button class="btn ' + (state.drawMode.nostra?'btn-active':'') + '" onclick="toggleDrawMode(\'nostra\')">' + (state.drawMode.nostra?'Termina disegno':'Disegna movimenti') + '</button>' +
      '<button class="btn" onclick="clearArrows(\''+match.id+'\',\'nostra\')">Cancella frecce</button>' +
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
      '<span class="roster-side-name">' + injuryBadgeHTML(p) + esc(displayName(p.nome)) + '</span>' +
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
  if(m){ m.style.display = 'none'; m.classList.remove('context-menu-anchored'); }
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
  const convocati = match.convocati.map(id=>state.players.find(p=>p.id===id)).filter(Boolean)
    .sort((a,b)=>surnameOf(a.nome).localeCompare(surnameOf(b.nome)));
  const html = '<table class="print-table"><thead><tr><th>#</th><th>Nome</th></tr></thead><tbody>' +
    convocati.map((p,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(displayName(p.nome))+'</td></tr>').join('') +
  '</tbody></table>';
  exportPDF('Elenco convocati vs ' + match.avversario, html);
}
// Distinta ufficiale: ordinata per numero di maglia assegnato in questa partita, capitano e
// vice indicati accanto al nome.
function exportDistintaPDF(matchId){
  const match = getMatch(matchId);
  const players = sortByNumGara(match, match.convocati.map(id=>state.players.find(p=>p.id===id)).filter(Boolean));
  const html = '<table class="print-table"><thead><tr><th>#</th><th>Nome</th><th></th></tr></thead><tbody>' +
    players.map(p=>{
      const badge = p.id===match.capitanoId ? '(C)' : (p.id===match.viceCapitanoId ? '(V)' : '');
      return '<tr><td>'+esc(numGara(match,p.id))+'</td><td>'+esc(displayName(p.nome))+'</td><td>'+badge+'</td></tr>';
    }).join('') +
  '</tbody></table>';
  exportPDF('Distinta vs ' + match.avversario, html);
}

/* ---------- lavagne: campo, sagome, frecce ---------- */
function pitchMarkingsSVG(light){
  if(light){
    // Campo a sfondo bianco/grigio, senza le bande verdi: risparmia inchiostro in stampa
    // (anteprima/esportazione seduta) rispetto al campo verde usato nell'editor live.
    return '<rect x="1" y="1" width="66" height="103" fill="#FFFFFF" stroke="#888" stroke-width="0.4"/>' +
      '<line x1="1" y1="52.5" x2="67" y2="52.5" stroke="#888" stroke-width="0.4"/>' +
      '<circle cx="34" cy="52.5" r="9.15" fill="none" stroke="#888" stroke-width="0.4"/>' +
      '<circle cx="34" cy="52.5" r="0.35" fill="#888"/>' +
      '<rect x="13.84" y="1" width="40.32" height="16.5" fill="none" stroke="#888" stroke-width="0.4"/>' +
      '<rect x="24.84" y="1" width="18.32" height="5.5" fill="none" stroke="#888" stroke-width="0.4"/>' +
      '<circle cx="34" cy="12.5" r="0.35" fill="#888"/>' +
      '<path d="M 25.5 17.5 A 9.15 9.15 0 0 0 42.5 17.5" fill="none" stroke="#888" stroke-width="0.4"/>' +
      '<rect x="13.84" y="87.5" width="40.32" height="16.5" fill="none" stroke="#888" stroke-width="0.4"/>' +
      '<rect x="24.84" y="98.5" width="18.32" height="5.5" fill="none" stroke="#888" stroke-width="0.4"/>' +
      '<circle cx="34" cy="92.5" r="0.35" fill="#888"/>' +
      '<path d="M 25.5 87.5 A 9.15 9.15 0 0 1 42.5 87.5" fill="none" stroke="#888" stroke-width="0.4"/>';
  }
  let bands = '';
  const n = 8, bandH = 103/n;
  for(let i=0;i<n;i++){
    const y = 1 + i*bandH;
    const fill = i%2===0 ? '#234A38' : '#26503C';
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
  const color = side==='avversaria' ? '#E0A458' : 'var(--accent)';
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
    '<g><circle cx="'+s.x+'" cy="'+s.y+'" r="2.6" fill="none" stroke="var(--accent)" stroke-width="0.3" stroke-dasharray="1,0.8" opacity="0.55"/>' +
    '<text x="'+s.x+'" y="'+(s.y+0.9)+'" text-anchor="middle" font-size="2.4" fill="var(--accent)" opacity="0.75" font-family="Oswald, sans-serif">'+s.numero+'</text></g>'
  ).join('');
  const chipsSvg = chips.map(c=>{
    const p = state.players.find(pl=>pl.id===c.playerId);
    const cognome = p ? surnameOf(p.nome) : '';
    return '<g class="chip" data-side="nostra" data-id="'+c.playerId+'" transform="translate('+c.x+','+c.y+')">' +
      '<circle r="2.6" fill="#0E2233" stroke="var(--accent)" stroke-width="0.35"/>' +
      '<text text-anchor="middle" dy="0.9" font-size="2.6" fill="#F4F1EA" font-family="Oswald, sans-serif">'+esc(c.numero)+'</text>' +
      '<text text-anchor="middle" dy="4.3" font-size="1.7" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="0.35">'+esc(cognome)+'</text>' +
    '</g>';
  }).join('');
  const arrowsSvg = (match.formazioneNostra.arrows||[]).map(a=>arrowSVG(a,'nostra')).join('');
  return '<svg id="pitch-nostra-'+match.id+'" viewBox="0 0 68 105" class="pitch-svg">' +
    '<defs><marker id="arrowhead-nostra" markerWidth="3" markerHeight="3" refX="2.4" refY="1.5" orient="auto"><path d="M0,0 L3,1.5 L0,3 Z" fill="var(--accent)"/></marker></defs>' +
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
      tempLine.setAttribute('stroke', 'var(--accent)'); tempLine.setAttribute('stroke-width', '0.5');
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
// Il campo (segni del terreno + frecce + slot vuoti tratteggiati) resta un SVG, ma i
// giocatori piazzati sono blocchetti HTML sovrapposti in percentuale — stessa tecnica già
// usata in Piano Squadra — cosi ognuno può avere dentro un vero pulsante (il triangolino
// che apre la tendina) invece di un elemento SVG difficile da dimensionare bene ovunque.
function pitchCardNameRowHTML(p, playerId){
  return '<span class="pitch-card-namerow">' +
    injuryBadgeHTML(p) +
    '<span class="pitch-card-name">'+esc(shortDisplayName(p))+'</span>' +
    '<button type="button" class="pitch-card-triangle" onclick="event.stopPropagation(); openDefaultAssignMenu(event, \''+playerId+'\')" aria-label="Cambia posizione">▾</button>' +
  '</span>';
}
function defaultPitchCardHTML(c){
  const p = state.players.find(pl=>pl.id===c.playerId);
  const leftPct = (c.x/68*100).toFixed(2), topPct = (c.y/105*100).toFixed(2);
  return '<div class="pitch-card" data-id="'+c.playerId+'" data-player-id="'+c.playerId+'" style="left:'+leftPct+'%; top:'+topPct+'%;">' +
    '<span class="pitch-card-num">'+esc(c.numero)+'</span>' +
    pitchCardNameRowHTML(p, c.playerId) +
  '</div>';
}
function renderDefaultPitchSVG(){
  const slots = state.formazioneDefault.slots || [];
  const chips = state.formazioneDefault.chips || [];
  const filled = new Set(chips.map(c=>c.numero));
  const emptySvg = slots.filter(s=>!filled.has(s.numero)).map(s=>
    '<g><circle cx="'+s.x+'" cy="'+s.y+'" r="2.6" fill="none" stroke="var(--accent)" stroke-width="0.3" stroke-dasharray="1,0.8" opacity="0.55"/>' +
    '<text x="'+s.x+'" y="'+(s.y+0.9)+'" text-anchor="middle" font-size="2.4" fill="var(--accent)" opacity="0.75" font-family="Oswald, sans-serif">'+s.numero+'</text></g>'
  ).join('');
  const arrowsSvg = (state.formazioneDefault.arrows||[]).map(a=>arrowSVG(a,'default')).join('');
  const cardsHtml = chips.map(defaultPitchCardHTML).join('');
  return '<div class="pitch-html-wrap">' +
    '<svg id="pitch-default" viewBox="0 0 68 105" class="pitch-svg">' +
      '<defs><marker id="arrowhead-default" markerWidth="3" markerHeight="3" refX="2.4" refY="1.5" orient="auto"><path d="M0,0 L3,1.5 L0,3 Z" fill="var(--accent)"/></marker></defs>' +
      pitchMarkingsSVG() +
      '<g class="arrows-layer">'+arrowsSvg+'</g>' +
      '<g class="slots-layer">'+emptySvg+'</g>' +
    '</svg>' +
    '<div class="pitch-cards-layer">'+cardsHtml+'</div>' +
  '</div>';
}
// 11 titolari fissi + fino a 20 riserve numerate e fisse (S1..S20, non un elenco che si
// accorcia/allunga — così la tendina di assegnazione può elencarle tutte, libere e occupate,
// esattamente come fa per i titolari). state.formazioneDefault.riserve è quindi un array a
// posizione fissa: riserve[i] è il playerId a S(i+1), o null/undefined se libero.
const MAX_RISERVE_SLOTS = 20;
const MAX_SQUAD_SELECTION = 11 + MAX_RISERVE_SLOTS;
function placeInFirstFreeReserveSlot(playerId){
  if(!state.formazioneDefault.riserve) state.formazioneDefault.riserve = [];
  const riserve = state.formazioneDefault.riserve;
  const freeIdx = riserve.findIndex(v=>!v);
  if(freeIdx!==-1) riserve[freeIdx] = playerId;
  else riserve.push(playerId);
}
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
  return (state.formazioneDefault.chips||[]).length + (state.formazioneDefault.riserve||[]).filter(Boolean).length;
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
  const chips = state.formazioneDefault.chips || [];
  // Chi arriva scaccia chi c'era: quel giocatore non sparisce, prende il posto lasciato
  // libero da chi arriva — la stessa posizione titolare se veniva da lì, altrimenti riserva
  // (da riserva, o da fuori selezione: non ha un'altra posizione titolare "sua" da riavere).
  const occupantChip = chips.find(c=>c.numero===slotNumero && c.playerId!==playerId);
  const previousChip = chips.find(c=>c.playerId===playerId);
  state.formazioneDefault.chips = chips.filter(c=>c.playerId!==playerId && c.numero!==slotNumero);
  if(!state.formazioneDefault.riserve) state.formazioneDefault.riserve = [];
  const prevReserveIdx = state.formazioneDefault.riserve.indexOf(playerId);
  if(prevReserveIdx!==-1) state.formazioneDefault.riserve[prevReserveIdx] = null;
  if(occupantChip){
    if(previousChip){
      const prevSlot = (state.formazioneDefault.slots||[]).find(s=>s.numero===previousChip.numero);
      state.formazioneDefault.chips.push({ playerId: occupantChip.playerId, numero: previousChip.numero, x: prevSlot?prevSlot.x:previousChip.x, y: prevSlot?prevSlot.y:previousChip.y });
    } else if(prevReserveIdx!==-1){
      // Scambio esatto: l'occupante prende esattamente il posto riserva lasciato libero da chi
      // arriva (non il primo posto libero in assoluto, anche se ce n'era uno prima).
      state.formazioneDefault.riserve[prevReserveIdx] = occupantChip.playerId;
    } else {
      placeInFirstFreeReserveSlot(occupantChip.playerId);
    }
  }
  state.formazioneDefault.chips.push({ playerId, numero: slotNumero, x: slot.x, y: slot.y });
  saveFormazioneDefault();
  renderView();
}
// Rilascio nella lista rosa/panchina su un'altra riga invece che sul campo: stesso scambio
// di assignDefaultPlayerToSlot se il bersaglio è un titolare (ha uno slot), altrimenti
// (bersaglio in riserva) uno scambio sul posto riserva numerato del bersaglio.
function dropOnDefaultFormationTarget(playerId, targetPlayerId){
  if(playerId===targetPlayerId) return;
  const targetChip = (state.formazioneDefault.chips||[]).find(c=>c.playerId===targetPlayerId);
  if(targetChip){
    assignDefaultPlayerToSlot(playerId, targetChip.numero);
    return;
  }
  const targetReserveIdx = (state.formazioneDefault.riserve||[]).indexOf(targetPlayerId);
  if(targetReserveIdx!==-1){
    assignDefaultPlayerToReserveSlot(playerId, targetReserveIdx);
  }
  // Il bersaglio non è selezionato: non ha nessuna posizione da cedere, nessuna azione.
}
// Posti riserva numerati fissi (S1..S13, indice 0-based): assegna playerId al posto
// `index`, spostando chi c'era prima nel posto lasciato libero da chi arriva (titolare o
// riserva), o nel primo posto riserva libero se chi arriva veniva da fuori selezione.
function assignDefaultPlayerToReserveSlot(playerId, index){
  if(!isDefaultSelected(playerId) && totalDefaultSelectionCount() >= MAX_SQUAD_SELECTION){
    alert('Hai già selezionato il massimo di ' + MAX_SQUAD_SELECTION + ' giocatori.');
    return;
  }
  if(!state.formazioneDefault.riserve) state.formazioneDefault.riserve = [];
  const riserve = state.formazioneDefault.riserve;
  const occupantId = riserve[index];
  const previousChip = (state.formazioneDefault.chips||[]).find(c=>c.playerId===playerId);
  const previousReserveIdx = riserve.indexOf(playerId);
  state.formazioneDefault.chips = (state.formazioneDefault.chips||[]).filter(c=>c.playerId!==playerId);
  if(previousReserveIdx!==-1) riserve[previousReserveIdx] = null;
  if(occupantId && occupantId!==playerId){
    if(previousChip){
      const prevSlot = (state.formazioneDefault.slots||[]).find(s=>s.numero===previousChip.numero);
      state.formazioneDefault.chips.push({ playerId: occupantId, numero: previousChip.numero, x: prevSlot?prevSlot.x:previousChip.x, y: prevSlot?prevSlot.y:previousChip.y });
      riserve[index] = null;
    } else if(previousReserveIdx!==-1){
      riserve[previousReserveIdx] = occupantId;
    } else {
      const freeIdx = riserve.findIndex((v,i)=>!v && i!==index);
      if(freeIdx!==-1) riserve[freeIdx] = occupantId; else riserve.push(occupantId);
    }
  }
  riserve[index] = playerId;
  saveFormazioneDefault();
  renderView();
}
function removeFromDefaultFormation(playerId){
  state.formazioneDefault.chips = (state.formazioneDefault.chips||[]).filter(c=>c.playerId!==playerId);
  const idx = (state.formazioneDefault.riserve||[]).indexOf(playerId);
  if(idx!==-1) state.formazioneDefault.riserve[idx] = null;
  saveFormazioneDefault();
  renderView();
}
// Azione rapida da tasto destro: chi non è ancora selezionato va al primo posto libero
// (titolare prima, riserva se i titolari sono già pieni); chi è già selezionato si
// deseleziona. Nessuna tendina — per scegliere un posto preciso c'è il triangolino.
function quickToggleDefaultPlayer(playerId){
  if(isDefaultSelected(playerId)){
    removeFromDefaultFormation(playerId);
    return;
  }
  if(totalDefaultSelectionCount() >= MAX_SQUAD_SELECTION){
    alert('Hai già selezionato il massimo di ' + MAX_SQUAD_SELECTION + ' giocatori.');
    return;
  }
  const slots = (state.formazioneDefault.slots||[]).slice().sort((a,b)=>a.numero-b.numero);
  const chips = state.formazioneDefault.chips||[];
  const freeSlot = slots.find(s=>!chips.some(c=>c.numero===s.numero));
  if(freeSlot){
    assignDefaultPlayerToSlot(playerId, freeSlot.numero);
    return;
  }
  placeInFirstFreeReserveSlot(playerId);
  saveFormazioneDefault();
  renderView();
}
// Tendina unificata per assegnare un giocatore a un posto: si apre solo dal triangolino
// (mai da tocco/tasto destro/doppio click) — prima voce "Deseleziona" se già piazzato.
// Elenca sempre tutti gli 11 slot titolari (liberi poi occupati, scambiabili) e tutti i
// posti riserva numerati S1..S13 (liberi poi occupati, scambiabili) — un solo menu, sempre
// uguale, mai un piazzamento "a caso". Resta ancorata all'elemento che l'ha aperta e
// posizionata nel flusso della pagina (non "fixed"): se è più alta dello spazio rimasto si
// scorre la pagina per vederla tutta, non è la tendina stessa ad avere una sua scrollbar.
function openDefaultAssignMenu(evt, playerId){
  const menu = document.getElementById('player-context-menu');
  let html = '';
  if(isDefaultSelected(playerId)){
    html += '<div class="context-menu-item" onclick="removeFromDefaultFormation(\''+playerId+'\'); hideContextMenu();">Deseleziona</div>';
  }
  if(!state.formazioneDefault.modulo){
    html += '<div class="context-menu-item" style="color:var(--text-dim);">Scegli prima un modulo</div>';
  } else {
    const chips = state.formazioneDefault.chips||[];
    const slots = (state.formazioneDefault.slots||[]).slice().sort((a,b)=>a.numero-b.numero);
    const free = slots.filter(s=>!chips.some(c=>c.numero===s.numero));
    const occupied = slots.filter(s=>chips.some(c=>c.numero===s.numero) && !chips.some(c=>c.numero===s.numero && c.playerId===playerId));
    free.forEach(s=>{
      html += '<div class="context-menu-item" onclick="assignDefaultPlayerToSlot(\''+playerId+'\','+s.numero+'); hideContextMenu();">N. '+s.numero+' — '+esc(s.ruolo)+'</div>';
    });
    occupied.forEach(s=>{
      const chip = chips.find(c=>c.numero===s.numero);
      const occ = chip ? state.players.find(pl=>pl.id===chip.playerId) : null;
      html += '<div class="context-menu-item" onclick="assignDefaultPlayerToSlot(\''+playerId+'\','+s.numero+'); hideContextMenu();">N. '+s.numero+' — '+esc(s.ruolo)+(occ?' ('+esc(shortDisplayName(occ))+')':'')+'</div>';
    });
  }
  const riserve = state.formazioneDefault.riserve || [];
  for(let i=0;i<MAX_RISERVE_SLOTS;i++){
    const occId = riserve[i];
    if(occId===playerId) continue;
    const occ = occId ? state.players.find(pl=>pl.id===occId) : null;
    html += '<div class="context-menu-item" onclick="assignDefaultPlayerToReserveSlot(\''+playerId+'\','+i+'); hideContextMenu();">S'+(i+1)+(occ?' — '+esc(shortDisplayName(occ)):'')+'</div>';
  }
  menu.innerHTML = html;
  menu.classList.add('context-menu-anchored');
  const anchor = evt.currentTarget && evt.currentTarget.nodeType===1 ? evt.currentTarget : evt.target.closest('button, [data-player-id]');
  const rect = (anchor||evt.target).getBoundingClientRect();
  const left = Math.min(rect.left + window.scrollX, document.documentElement.scrollWidth - 200);
  const top = rect.bottom + window.scrollY + 4;
  menu.style.left = Math.max(4, left) + 'px';
  menu.style.top = top + 'px';
  menu.style.display = 'block';
}
function benchDefaultHTML(){
  const riserveRaw = state.formazioneDefault.riserve || [];
  const entries = riserveRaw.map((id,i)=>({id, slotLabel:'S'+(i+1)})).filter(e=>e.id);
  if(entries.length===0) return '<p class="hint">Nessuna riserva selezionata. Tocca il triangolino su un giocatore in rosa per aggiungerlo.</p>';
  return '<div class="bench">' + entries.map(entry=>{
    const p = state.players.find(pl=>pl.id===entry.id);
    if(!p) return '';
    return '<div class="bench-chip pitch-card" data-player-id="'+p.id+'">' +
      '<span class="pitch-card-num">'+esc(entry.slotLabel)+'</span>' +
      pitchCardNameRowHTML(p, p.id) +
    '</div>';
  }).join('') + '</div>';
}
// Un tocco secco non fa mai niente (rischio di scombinare la formazione per sbaglio): per
// cambiare posto a mano serve il triangolino (apre la tendina con tutti i posti). Il tasto
// destro è invece un'azione rapida diretta (vedi quickToggleDefaultPlayer): seleziona al
// primo posto libero chi non è ancora selezionato, deseleziona chi lo è già — niente tendina.
// Da mouse/pen il trascinamento parte non appena ci si sposta oltre DRAG_JITTER_PX
// (immediato). Da touch (smartphone/tablet) invece bisogna tenere fermo il dito per
// TOUCH_DRAG_HOLD_MS prima che parta: un tocco che scivola per un attimo (per sbaglio, o
// perché si sta solo scorrendo l'elenco) non deve mai spostare un giocatore — e finché non
// scatta il trascinamento non blocchiamo lo scroll nativo della pagina/elenco col dito.
const DRAG_JITTER_PX = 6;
const TOUCH_DRAG_HOLD_MS = 550;
function wireDefaultSelectOrDrag(el, svg, playerId){
  el.addEventListener('contextmenu', function(e){
    e.preventDefault();
    quickToggleDefaultPlayer(playerId);
  });
  el.addEventListener('pointerdown', function(e){
    if(e.target.closest('.roster-side-triangle, .pitch-card-triangle')) return;
    if(e.button !== 0) return;
    const isTouch = e.pointerType === 'touch';
    const startX = e.clientX, startY = e.clientY;
    let dragActive = false;
    let cancelled = false;
    let ghost = null;
    let holdTimer = null;
    if(!isTouch){
      e.preventDefault();
      try{ el.setPointerCapture(e.pointerId); }catch(err){}
    }
    function activateDrag(){
      dragActive = true;
      el.classList.add('is-dragging-source');
      ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      const p0 = state.players.find(pl=>pl.id===playerId);
      ghost.textContent = p0 ? displayName(p0.nome) : '';
      document.body.appendChild(ghost);
      ghost.style.left = startX + 'px';
      ghost.style.top = startY + 'px';
    }
    if(isTouch){
      holdTimer = setTimeout(function(){
        if(cancelled) return;
        try{ el.setPointerCapture(e.pointerId); }catch(err){}
        activateDrag();
      }, TOUCH_DRAG_HOLD_MS);
    }
    function cleanup(){
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);
      if(holdTimer) clearTimeout(holdTimer);
      try{ el.releasePointerCapture(e.pointerId); }catch(err){}
      el.classList.remove('is-dragging-source');
      if(ghost){ ghost.remove(); ghost = null; }
    }
    function onCancel(){
      cancelled = true;
      cleanup();
    }
    function onMove(e2){
      if(!dragActive){
        if(Math.abs(e2.clientX-startX) > DRAG_JITTER_PX || Math.abs(e2.clientY-startY) > DRAG_JITTER_PX){
          if(isTouch){
            // Spostamento prima che scatti il tenuto-premuto: non è un trascinamento, è
            // probabilmente uno scroll — lo lasciamo fare al browser, non lo intercettiamo.
            cancelled = true;
            if(holdTimer) clearTimeout(holdTimer);
            return;
          }
          activateDrag();
        } else {
          return;
        }
      }
      if(e2.cancelable) e2.preventDefault();
      if(ghost){ ghost.style.left = e2.clientX + 'px'; ghost.style.top = e2.clientY + 'px'; }
    }
    function onUp(e2){
      cleanup();
      if(!dragActive) return;
      if(svg){
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
      // Rilascio dentro la lista rosa/panchina invece che sul campo: se cade su un'altra
      // riga, scambia le posizioni esattamente come un rilascio sullo slot corrispondente
      // sul campo — comodo perché non serve più puntare con precisione l'icona piccola.
      const dropEl = document.elementFromPoint(e2.clientX, e2.clientY);
      const targetRow = dropEl ? dropEl.closest('[data-player-id]') : null;
      const targetPlayerId = targetRow ? targetRow.getAttribute('data-player-id') : null;
      if(targetPlayerId && targetPlayerId!==playerId){
        dropOnDefaultFormationTarget(playerId, targetPlayerId);
      }
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);
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
  const cardsLayer = svg.parentElement ? svg.parentElement.querySelector('.pitch-cards-layer') : null;
  if(cardsLayer){
    cardsLayer.querySelectorAll('.pitch-card').forEach(cardEl=>{
      cardEl.addEventListener('contextmenu', function(e){
        e.preventDefault();
        quickToggleDefaultPlayer(cardEl.getAttribute('data-id'));
      });
      cardEl.addEventListener('pointerdown', function(e){
        // Il triangolino ha il suo onclick indipendente: non deve avviare anche il
        // trascinamento della scheda su cui sta.
        if(e.target.closest('.pitch-card-triangle')) return;
        if(e.button !== 0) return;
        e.stopPropagation();
        const id = cardEl.getAttribute('data-id');
        const chipData = state.formazioneDefault.chips.find(c=>c.playerId===id);
        if(!chipData) return;
        const isTouch = e.pointerType === 'touch';
        try{ cardEl.setPointerCapture(e.pointerId); }catch(err){}
        const startPt = toPoint(e);
        let dragActive = false;
        let holdTimer = null;
        function activateDrag(){
          dragActive = true;
          cardEl.classList.add('is-dragging-source');
        }
        // Da touch il trascinamento sul campo parte solo dopo aver tenuto fermo il dito
        // per TOUCH_DRAG_HOLD_MS: un tocco impreciso non deve spostare il giocatore per
        // sbaglio. Da mouse/pen resta immediato, come prima.
        if(isTouch){
          holdTimer = setTimeout(activateDrag, TOUCH_DRAG_HOLD_MS);
        }
        function onMove(e2){
          const p = toPoint(e2);
          if(!dragActive){
            if(isTouch) return; // in attesa dell'hold timer, ignora il movimento
            if(Math.abs(p.x-startPt.x) > 0.6 || Math.abs(p.y-startPt.y) > 0.6){
              activateDrag();
            } else {
              return;
            }
          }
          chipData.x = Math.min(66, Math.max(2, p.x));
          chipData.y = Math.min(104, Math.max(2, p.y));
          cardEl.style.left = (chipData.x/68*100) + '%';
          cardEl.style.top = (chipData.y/105*100) + '%';
        }
        function onUp(e2){
          cardEl.removeEventListener('pointermove', onMove);
          cardEl.removeEventListener('pointerup', onUp);
          cardEl.removeEventListener('pointercancel', onUp);
          if(holdTimer) clearTimeout(holdTimer);
          try{ cardEl.releasePointerCapture(e.pointerId); }catch(err){}
          cardEl.classList.remove('is-dragging-source');
          // Tocco secco (nessuno spostamento): non fa niente, per cambiare posto o togliere
          // il giocatore serve il triangolino (tendina) o il tasto destro (rapido).
          if(dragActive) saveFormazioneDefault();
        }
        // Il pointer è catturato su cardEl (elemento HTML fratello dell'svg, non discendente):
        // gli eventi vanno ascoltati sulla card stessa, altrimenti pointermove/up non arrivano mai.
        cardEl.addEventListener('pointermove', onMove);
        cardEl.addEventListener('pointerup', onUp);
        cardEl.addEventListener('pointercancel', onUp);
      });
    });
  }
  if(state.drawMode.formazioneDefault){
    svg.addEventListener('pointerdown', function(e){
      if(e.target.closest('.chip')) return;
      const start = toPoint(e);
      const tempLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      tempLine.setAttribute('x1', start.x); tempLine.setAttribute('y1', start.y);
      tempLine.setAttribute('x2', start.x); tempLine.setAttribute('y2', start.y);
      tempLine.setAttribute('stroke', 'var(--accent)'); tempLine.setAttribute('stroke-width', '0.5');
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
      items.push({ type:'session', id:sess.id, label:'Note mancanti sulla seduta "'+schemaSessionDisplayName(sess)+'"' });
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
    '<button class="header-icon-btn" onclick="toggleNotificheBell()" title="Promemoria" aria-label="Promemoria">' + BELL_ICON_SVG + (count>0?'<span class="notif-badge">'+count+'</span>':'') + '</button>' +
    panel +
  '</div>';
}
function renderHelpButtonHTML(){
  return '<button class="header-icon-btn" onclick="reopenSectionTip()" title="Aiuto per questa sezione" aria-label="Aiuto">' + HELP_ICON_SVG + '</button>';
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
  const icons = '<div class="header-icons">' + renderNotificheBell() + renderHelpButtonHTML() + '</div>';
  if(!nm){
    bar.innerHTML = '<span class="next-match-empty">Nessuna partita in programma</span>' + icons;
    return;
  }
  bar.innerHTML =
    '<span class="next-match-tag">Prossima partita</span>' +
    '<span class="pill ' + (nm.sede==='Trasferta'?'pill-muted':'') + '">' + esc(nm.sede||'Casa') + '</span>' +
    '<button type="button" class="next-match-opponent" onclick="openMatch(\''+nm.id+'\')" title="Apri la formazione">vs ' + esc(nm.avversario||'—') + '</button>' +
    '<span class="next-match-when">' + formatDate(nm.data) + (nm.ora?(' • '+esc(nm.ora)):'') + '</span>' +
    icons;
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
// Preferenza di sola visualizzazione (non salvata sul server, come l'ordinamento sopra):
// nasconde dall'elenco rosa qui i giocatori aggregati dalla prima squadra, per non
// affollare la selezione quando non sono rilevanti. Non tocca chi è già in campo/panchina.
function toggleHideAggregatiFormazione(){
  state.hideAggregatiFormazione = !state.hideAggregatiFormazione;
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
function setFormazioneMobileTab(tab){
  state.formazioneMobileTab = tab;
  renderView();
}
function renderDefaultFormationCard(){
  const canEdit = can('edit_formazione');
  // Da telefono campo e rosa restano impilati uno sotto l'altro (la griglia va già a
  // colonna singola sotto gli 860px): con una rosa vera, non i 10-15 giocatori di prova,
  // significa scorrere a lungo ogni volta solo per raggiungere un nome. La pillola lascia
  // mostrare l'uno o l'altro blocco per intero; da desktop/tablet restano sempre affiancati.
  const mobileTab = state.formazioneMobileTab || 'campo';
  const mobile = isMobileLayout();
  const showCampo = !mobile || mobileTab==='campo';
  const showRosa = !mobile || mobileTab==='rosa';
  const formationOptions = '<option value="">Scegli modulo…</option>' + FORMATION_KEYS.map(k=>'<option value="'+k+'" '+(state.formazioneDefault.modulo===k?'selected':'')+'>'+k+'</option>').join('');
  const sortMode = state.defaultFormationSort || 'ruolo';
  const hideAggregati = !!state.hideAggregatiFormazione;
  const basePlayers = hideAggregati ? state.players.filter(p=>!p.aggregatoPrimaSquadra) : state.players;
  const playersSorted = sortPlayersForDefaultFormation(basePlayers);
  const seasonStats = computeSeasonStats();
  const chipIds = new Set(state.formazioneDefault.chips.map(c=>c.playerId));
  const totalCount = totalDefaultSelectionCount();
  return '' +
  '<div class="card">' +
    '<div class="card-header-row"><h2>Formazione predefinita</h2>' +
      '<div class="pitch-actions">' +
        '<span class="pill pill-muted">' + totalCount + ' / ' + MAX_SQUAD_SELECTION + ' selezionati</span>' +
        (canEdit ? '<button class="btn btn-small ' + (state.drawMode.formazioneDefault?'btn-active':'') + '" onclick="toggleDefaultDrawMode()">' + (state.drawMode.formazioneDefault?'Termina disegno':'Disegna movimenti') + '</button>' : '') +
        (canEdit ? '<button class="btn btn-small" onclick="clearDefaultArrows()">Cancella frecce</button>' : '') +
        (canEdit ? '<button class="btn btn-small" onclick="clearDefaultFormation()">Svuota</button>' : '') +
      '</div>' +
    '</div>' +
    (canEdit ? '<p class="hint">Scegli il modulo, poi trascina i giocatori dalla rosa in campo (subito, senza attese). Sul campo o in rosa: triangolino per scegliere un posto preciso, tasto destro per selezionare/deselezionare rapido al primo posto libero. Verrà usata per popolare automaticamente le nuove partite quando convochi questi giocatori. Il modulo scelto qui — o cambiato dentro una partita — resta il modulo predefinito anche per le partite successive.</p>' : '<p class="hint">Sola lettura: non hai il permesso di modificare la formazione predefinita.</p>') +
    '<div class="form-row"><div class="field"><label>Modulo</label><select '+(canEdit?'':'disabled')+' onchange="if(this.value) applyDefaultFormationModulo(this.value)">'+formationOptions+'</select></div></div>' +
    '<div class="segmented">' +
      '<button class="' + (mobileTab==='campo'?'segmented-active':'') + '" onclick="setFormazioneMobileTab(\'campo\')">Campo</button>' +
      '<button class="' + (mobileTab==='rosa'?'segmented-active':'') + '" onclick="setFormazioneMobileTab(\'rosa\')">Rosa</button>' +
    '</div>' +
    '<div class="tactic-layout">' +
      (!showCampo ? '' :
      '<div'+(canEdit?'':' class="readonly-block"')+'>' +
        '<h3>Riserve</h3>' +
        '<div class="pitch-bench-row">' +
          '<div class="pitch-wrap">' + renderDefaultPitchSVG() + '</div>' +
          '<div class="default-bench-panel" id="default-formation-bench">' + benchDefaultHTML() + '</div>' +
        '</div>' +
      '</div>') +
      (!showRosa ? '' :
      '<div>' +
        '<div class="card-header-row"><h3>Rosa</h3>' +
          '<div class="pitch-actions">' +
            '<button class="btn btn-small ' + (sortMode==='ruolo'?'btn-active':'') + '" onclick="setDefaultFormationSort(\'ruolo\')">Ruolo</button>' +
            '<button class="btn btn-small ' + (sortMode==='numero'?'btn-active':'') + '" onclick="setDefaultFormationSort(\'numero\')">Selezione</button>' +
            '<button class="btn btn-small ' + (hideAggregati?'btn-active':'') + '" onclick="toggleHideAggregatiFormazione()">' + (hideAggregati?'Mostra aggregati':'Nascondi aggregati') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="roster-side-list default-formation-roster'+(canEdit?'':' readonly-block')+'">' +
          playersSorted.map(p=>{
            const isStarter = chipIds.has(p.id);
            const slotRole = slotRoleForDefaultPlayer(p.id);
            const votoMedio = (seasonStats.perPlayer[p.id] && seasonStats.perPlayer[p.id].votiCount)
              ? (seasonStats.perPlayer[p.id].votiSum / seasonStats.perPlayer[p.id].votiCount) : null;
            return '<div class="roster-side-row ' + (isStarter?'roster-side-on':'') + '" data-player-id="'+p.id+'">' +
              '<span class="roster-side-slotrole">' + (slotRole?esc(slotRole):'') + '</span>' +
              starRatingHTML(p.valutazione, 11) +
              '<button type="button" class="roster-side-triangle" onclick="event.stopPropagation(); openDefaultAssignMenu(event, \''+p.id+'\')" aria-label="Cambia posizione">▾</button>' +
              '<span class="roster-side-name">' + esc(displayName(p.nome)) + '</span>' +
              '<span class="roster-side-role">' + esc(p.ruolo) + (p.secondoRuolo?'/'+esc(p.secondoRuolo):'') + '</span>' +
              playerFormaHTML(p.id) +
              '<span class="roster-side-voto">' + (votoMedio!=null?votoMedio.toFixed(1):'-') + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>') +
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
function freezeMatchFormation(matchId){
  const match = getMatch(matchId);
  if(match.formazioneFissata) return;
  if(!confirm('Salvare la formazione attuale come storico definitivo di questa partita? Da qui in poi non seguirà più le modifiche alla formazione predefinita.')) return;
  syncMatchFormationWithDefault(match);
  match.formazioneFissata = true;
  saveMatches();
  renderMatchTab();
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
// Mappa gol/assist a zone: griglia 3x3 volutamente semplice (non coordinate precise x/y)
// per restare un tap veloce durante/dopo la partita invece di richiedere un tocco preciso
// su un campo intero. Righe = distanza dalla porta (vicino → lontano), colonne = lato.
const GOL_ZONE_GRID = [ ['r1c1','r1c2','r1c3'], ['r2c1','r2c2','r2c3'], ['r3c1','r3c2','r3c3'] ];
const GOL_ZONE_LABELS = {
  r1c1:'Area piccola sinistra', r1c2:'Area piccola centro', r1c3:'Area piccola destra',
  r2c1:'Area di rigore sinistra', r2c2:'Area di rigore centro', r2c3:'Area di rigore destra',
  r3c1:'Fuori area sinistra', r3c2:'Fuori area centro', r3c3:'Fuori area destra',
};
// Riusa il div globale #player-context-menu (persistente in AppShell) invece di un nuovo
// popover: stessa infrastruttura già usata per i menu contestuali del disegnatore/rosa.
function showGolZonaPicker(evt, matchId, idx){
  evt.preventDefault();
  evt.stopPropagation();
  const match = getMatch(matchId);
  const g = match.golFatti[idx];
  const menu = document.getElementById('player-context-menu');
  const cellsHtml = GOL_ZONE_GRID.map(row => row.map(key=>
    '<button type="button" class="gol-zona-cell'+(g.zona===key?' gol-zona-cell-active':'')+'" onclick="setGolZona(\''+matchId+'\','+idx+',\''+key+'\'); hideContextMenu();" title="'+GOL_ZONE_LABELS[key]+'"></button>'
  ).join('')).join('');
  menu.innerHTML =
    '<div class="context-menu-item" style="font-weight:600; cursor:default;">Zona del campo</div>' +
    '<div class="gol-zona-grid">'+cellsHtml+'</div>' +
    (g.zona ? '<div class="context-menu-item" onclick="setGolZona(\''+matchId+'\','+idx+',null); hideContextMenu();">Rimuovi zona</div>' : '');
  const x = Math.min(evt.clientX, window.innerWidth-150);
  const y = Math.min(evt.clientY, window.innerHeight-190);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
function setGolZona(matchId, idx, zona){
  const match = getMatch(matchId);
  match.golFatti[idx].zona = zona;
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
    '<button type="button" class="btn-icon gol-zona-btn'+(g.zona?' gol-zona-btn-set':'')+'" onclick="showGolZonaPicker(event,\'' + match.id + '\',' + i + ')" title="'+(g.zona?esc(GOL_ZONE_LABELS[g.zona]):'Zona del campo (facoltativo)')+'">▧</button>' +
    '<button class="btn-icon" onclick="removeGolFatto(\'' + match.id + '\',' + i + ')" aria-label="Rimuovi">×</button>' +
  '</div>';
}
function addGolFatto(matchId){
  const match = getMatch(matchId);
  if(!match.golFatti) match.golFatti = [];
  match.golFatti.push({ id: uid(), minuto:'', tipo:'Azione', marcatoreId:'', assistId:'', zona:null });
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
  '</div>' +
  '<p class="hint" style="margin-top:10px;">Valutazione a 4 assi (1-10), una sola volta per l\'intera squadra — non per singolo giocatore.</p>' +
  '<div class="valutazione-assi-row">' +
    ['atletico:Atletico','tecnico:Tecnico','tattico:Tattico','personalita:Personalità'].map(pair=>{
      const [key,label] = pair.split(':');
      return '<div class="field field-voto"><label>'+label+'</label><input type="number" min="1" max="10" value="' + esc(match.valutazioni.nostraSquadra[key]) + '" onchange="updateValSquadra(\'' + match.id + '\',\'nostraSquadra\',\'' + key + '\',this.value)"></div>';
    }).join('') +
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
const VAL_SQUADRA_NUMERIC_FIELDS = new Set(['voto','atletico','tecnico','tattico','personalita']);
function updateValSquadra(matchId, who, field, value){
  const match = getMatch(matchId);
  match.valutazioni[who][field] = VAL_SQUADRA_NUMERIC_FIELDS.has(field) ? (value?parseInt(value,10):null) : value;
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
  const canEditCalendario = can('edit_calendario');
  // Chi non ha edit_calendario su questa vista può solo segnare le presenze: data/ora/
  // eliminazione dell'allenamento restano nascoste, non solo bloccate lato server. La
  // scheda della seduta Allenamenti resta visibile solo con view_allenamenti.
  return '' +
  '<div class="match-header">' +
    '<button class="btn-link" onclick="backToCalendario()">← Calendario</button>' +
    '<div class="match-header-main"><h2 class="content-title">Allenamento del ' + formatDate(a.data) + '</h2>' +
      '<div class="match-header-fields">' +
        (canEditCalendario ? '<input type="date" value="'+esc(a.data)+'" onchange="updateAllenamentoData(\''+a.id+'\',this.value)">' : '') +
        (canEditCalendario ? '<input type="time" value="'+esc(a.ora||'')+'" onchange="updateAllenamentoOra(\''+a.id+'\',this.value)">' : '') +
        '<button class="btn btn-small" onclick="exportPageImage(\'allenamento-'+a.id+'\')">Esporta immagine</button>' +
        (canEditCalendario ? '<button class="btn btn-small btn-danger" onclick="deleteAllenamento(\''+a.id+'\')">Elimina</button>' : '') +
      '</div>' +
    '</div>' +
  '</div>' +
  (can('view_allenamenti') ? schemaSessionsCardForAllenamento(a) : '') +
  '<div class="card"><h2>Presenze</h2>' +
    '<p class="hint">Di default disponibili, tranne i giocatori aggregati alla prima squadra (non disponibili di default) e quelli segnati infortunati in Rosa quel giorno (precompilati su lavoro differenziato). Seleziona per cambiare lo stato di un giocatore.</p>' +
    '<div class="pitch-actions" style="margin-bottom:8px;">' +
      '<button class="btn btn-small ' + (sortMode==='cognome'?'btn-active':'') + '" onclick="setAllenamentoSort(\'cognome\')">Ordina per cognome</button>' +
      '<button class="btn btn-small ' + (sortMode==='ruolo'?'btn-active':'') + '" onclick="setAllenamentoSort(\'ruolo\')">Ordina per ruolo</button>' +
    '</div>' +
    (players.length===0 ? '<p class="hint">Nessun giocatore in rosa.</p>' :
      players.map(p=>{
        const v = (a.presenze && a.presenze[p.id]) || defaultPresenzaFor(p, a.data);
        return '<div class="presenza-row">' +
          '<span class="roster-name">' + injuryBadgeHTML(p) + esc(displayName(p.nome)) + '</span>' +
          '<span class="roster-role">' + esc(p.ruolo) + '</span>' +
          '<select '+(can('edit_presenze')?'':'disabled')+' onchange="updatePresenza(\''+a.id+'\',\''+p.id+'\',this.value)">' +
            PRESENZA_STATI.map(st=>'<option value="'+st+'" '+(v===st?'selected':'')+'>'+st+'</option>').join('') +
          '</select>' +
        '</div>';
      }).join('')
    ) +
  '</div>';
}
// Endpoint mirato (non il PUT generico dell'intero blob calendario): permette a chi ha il
// permesso edit_presenze di segnare le presenze senza poter toccare nient'altro.
async function updatePresenza(allenamentoId, playerId, value){
  const a = state.allenamenti.find(x=>x.id===allenamentoId);
  if(!a.presenze) a.presenze = {};
  a.presenze[playerId] = value;
  try{
    const r = await fetch('/api/presenze', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ allenamentoId, playerId, stato: value }),
    });
    const res = await r.json();
    if(!res || !res.ok) throw new Error(res && res.error || 'errore sconosciuto');
    reportSaveOk();
  }catch(e){ console.error('errore presenze', e); reportSaveError(); }
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
    '<h3>Nuovo evento — ' + formatDate(dateStr) + '</h3>' +
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
        '<div class="field"><label>Tipo</label><select id="event-tipo"><option value="Campionato">Campionato</option><option value="Amichevole">Amichevole</option><option value="Coppa">Coppa</option></select></div>' +
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
    valutazioni: { nostraSquadra:{voto:null,note:'',atletico:null,tecnico:null,tattico:null,personalita:null}, nostriGiocatori:{}, avversariSquadra:{voto:null,note:''}, avversariGiocatori:[] }
  };
  state.matches.push(match);
  saveMatches();
  closeEventModal();
  openMatch(match.id);
}
function pad2(n){ return n<10 ? '0'+n : ''+n; }
function calendarioMobileMode(){
  return state.calendarioMobileView || 'agenda';
}
function setCalendarioMobileView(mode){
  state.calendarioMobileView = mode;
  renderView();
}
// Stesso eventsByDate già raccolto per la griglia mensile, solo presentato come elenco
// cronologico invece che come celle affiancate: da telefono la griglia dice "qualcosa
// succede il 15" solo se tocchi quella cella, l'agenda lo dice già leggendo dall'alto.
// Resta legata allo stesso mese/cursore della griglia (stessi ← → e "Oggi"), non è un
// "prossimi eventi" assoluto: un solo modo di sfogliare il calendario, due presentazioni.
function renderCalendarAgendaHTML(eventsByDate, year, month, daysInMonth, todayStr){
  const items = [];
  for(let d=1; d<=daysInMonth; d++){
    const dateStr = year + '-' + pad2(month+1) + '-' + pad2(d);
    const evs = eventsByDate[dateStr];
    if(evs && evs.length) items.push({ dateStr, d, evs });
  }
  if(items.length===0) return '<p class="hint">Nessun evento in questo mese.</p>';
  return '<div class="cal-agenda">' + items.map(it=>{
    const dow = DAY_NAMES[(new Date(it.dateStr+'T00:00:00').getDay()+6)%7];
    const isToday = it.dateStr===todayStr;
    return '<div class="cal-agenda-day' + (isToday?' cal-agenda-day-today':'') + '">' +
      '<div class="cal-agenda-date"><div class="cal-agenda-daynum">'+it.d+'</div><div class="cal-agenda-dow">'+esc(dow.slice(0,3))+'</div></div>' +
      '<div class="cal-agenda-events">' + it.evs.map(e=>{
        const cls = e.type==='match' ? ('cal-agenda-badge cal-event-match-' + matchTipoLabel(e.tipo)) : 'cal-agenda-badge cal-event-training';
        const action = e.type==='match' ? "openMatch('"+e.id+"')" : "openAllenamento('"+e.id+"')";
        return '<div class="cal-agenda-item" onclick="'+action+'">' +
          '<div class="cal-agenda-item-main"><span class="'+cls+'"></span><span class="cal-agenda-item-title">'+esc(e.label)+'</span></div>' +
          (e.sub?'<div class="cal-agenda-item-sub">'+esc(e.sub)+'</div>':'') +
        '</div>';
      }).join('') + '</div>' +
    '</div>';
  }).join('') + '</div>';
}
function renderCalendarioView(){
  initCalendarCursor();
  const canEditCal = can('edit_calendario');
  const year = state.calendarCursor.year, month = state.calendarCursor.month;
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const todayStr = (function(){ const n=new Date(); return n.getFullYear()+'-'+pad2(n.getMonth()+1)+'-'+pad2(n.getDate()); })();

  const eventsByDate = {};
  state.matches.forEach(m=>{
    if(!m.data) return;
    if(!eventsByDate[m.data]) eventsByDate[m.data] = [];
    eventsByDate[m.data].push({ type:'match', tipo: m.tipo, id:m.id, label:(m.ora?m.ora+' ':'')+'vs ' + m.avversario, sub: (m.tipo||'Campionato') + ' — ' + (m.sede||'Casa') });
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
    // Il click destro (oncontextmenu) resta per chi usa il mouse, ma su schermo touch non
    // c'è un equivalente affidabile: un tap normale sulla cella deve bastare da solo per
    // aggiungere un evento, sia che il giorno sia vuoto sia che ne abbia già uno (gli eventi
    // hanno il proprio onclick con stopPropagation, quindi toccarli non apre anche questo).
    cells += '<div class="cal-cell' + (isToday?' cal-cell-today':'') + (canEditCal?' cal-cell-editable':'') + '" '+(canEditCal?'onclick="showAddEventModal(\''+dateStr+'\')" oncontextmenu="event.preventDefault(); showAddEventModal(\''+dateStr+'\')"':'')+'><div class="cal-daynum">' + d + '</div>' +
      evs.map(e=>{
        const cls = e.type==='match' ? ('cal-event cal-event-match-' + matchTipoLabel(e.tipo)) : 'cal-event cal-event-training';
        const action = e.type==='match' ? "openMatch('"+e.id+"')" : "openAllenamento('"+e.id+"')";
        return '<div class="'+cls+'" onclick="event.stopPropagation(); '+action+'">'+esc(e.label)+(e.sub?'<span class="cal-event-sub">'+esc(e.sub)+'</span>':'')+'</div>';
      }).join('') +
    '</div>';
  }
  const totalCells = startWeekday + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for(let i=0;i<trailing;i++){ cells += '<div class="cal-cell cal-cell-empty"></div>'; }

  const mobileMode = calendarioMobileMode();
  const showAgenda = isMobileLayout() && mobileMode==='agenda';
  return '' +
  '<div class="card">' +
    '<div class="cal-toolbar">' +
      '<button class="btn btn-small" onclick="calendarShiftMonth(-1)">←</button>' +
      '<h2 style="margin:0;">' + MONTH_NAMES[month] + ' ' + year + '</h2>' +
      '<button class="btn btn-small" onclick="calendarShiftMonth(1)">→</button>' +
      '<button class="btn btn-small" onclick="calendarToday()">Oggi</button>' +
      '<button class="btn btn-small" onclick="exportPageImage(\'calendario\')">Esporta immagine</button>' +
    '</div>' +
    '<div class="segmented">' +
      '<button class="' + (mobileMode==='agenda'?'segmented-active':'') + '" onclick="setCalendarioMobileView(\'agenda\')">Agenda</button>' +
      '<button class="' + (mobileMode==='mese'?'segmented-active':'') + '" onclick="setCalendarioMobileView(\'mese\')">Mese</button>' +
    '</div>' +
    (showAgenda ? renderCalendarAgendaHTML(eventsByDate, year, month, daysInMonth, todayStr) : (
      '<div class="cal-grid cal-grid-header">' + DAY_NAMES.map(dn=>'<div class="cal-headcell">'+dn+'</div>').join('') + '</div>' +
      '<div class="cal-grid">' + cells + '</div>'
    )) +
  '</div>' +
  '<div class="card">' +
    '<h3>Esporta / importa calendario</h3>' +
    '<div class="form-row">' +
      '<div class="field"><label>Da</label><input type="date" id="cal-export-da"></div>' +
      '<div class="field"><label>A</label><input type="date" id="cal-export-a"></div>' +
      '<button class="btn btn-small" onclick="exportCalendarioPDF()">Esporta PDF</button>' +
      '<button class="btn btn-small" onclick="exportCalendarioImage()">Esporta immagine</button>' +
      '<button class="btn btn-small" onclick="exportCalendarioXLSX()">Esporta XLSX</button>' +
      '<button class="btn btn-small" onclick="triggerImportCalendarioXLSX()">Importa XLSX</button>' +
    '</div>' +
    '<p class="hint">PDF e immagine richiedono sia "Da" sia "A": elencano ogni giorno del periodo (anche i riposi), colorato per tipo evento. L\'XLSX resta il formato dati grezzo (solo i giorni con eventi) usato anche per la reimportazione: "Da"/"A" restano facoltativi e le colonne richieste sono Data (AAAA-MM-GG), Ora, Tipo Evento (Partita o Allenamento), Avversario, Sede (Casa/Trasferta), Tipo Partita (Campionato/Amichevole/Coppa).</p>' +
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
// Un'esportazione "Calendario Preparazione" elenca OGNI giorno del periodo (compresi i
// riposi), non solo i giorni con eventi: enumerData colma i buchi tra gli eventi raccolti
// da collectCalendarEvents.
function enumerateDateRange(fromStr, toStr){
  const dates = [];
  const cur = new Date(fromStr+'T00:00:00');
  const end = new Date(toStr+'T00:00:00');
  while(cur<=end){
    dates.push(cur.getFullYear()+'-'+pad2(cur.getMonth()+1)+'-'+pad2(cur.getDate()));
    cur.setDate(cur.getDate()+1);
  }
  return dates;
}
function buildCalendarioDayRows(fromStr, toStr){
  const events = collectCalendarEvents(fromStr, toStr);
  const byDate = {};
  events.forEach(e=>{ (byDate[e.data] = byDate[e.data]||[]).push(e); });
  return enumerateDateRange(fromStr, toStr).map(d=>{
    const dayEvents = byDate[d] || [];
    const match = dayEvents.find(e=>e.tipoEvento==='Partita');
    const training = dayEvents.find(e=>e.tipoEvento==='Allenamento');
    const giorno = DAY_NAMES[(new Date(d+'T00:00:00').getDay()+6)%7];
    if(match){
      const tipo = match.tipoPartita || 'Campionato';
      return {
        data:d, giorno, tipo,
        cls: 'cal-print-row-' + matchTipoLabel(tipo),
        dettaglio: (match.sede==='Trasferta'?'@ ':'vs ') + (match.avversario||'') + (training?' (+ allenamento)':''),
        ora: match.ora, risultato: match.risultato
      };
    }
    if(training) return { data:d, giorno, tipo:'Allenamento', cls:'cal-print-row-allenamento', dettaglio:'', ora:training.ora, risultato:'' };
    return { data:d, giorno, tipo:'Riposo', cls:'cal-print-row-riposo', dettaglio:'', ora:'', risultato:'' };
  });
}
function calendarioPrintTableHTML(fromStr, toStr){
  const rows = buildCalendarioDayRows(fromStr, toStr);
  const body = rows.map(r=>
    '<tr class="'+r.cls+'"><td>'+esc(formatDate(r.data))+'</td><td>'+esc(r.giorno)+'</td><td>'+esc(r.tipo)+'</td><td>'+esc(r.dettaglio)+'</td><td>'+esc(r.ora)+'</td><td>'+esc(r.risultato)+'</td></tr>'
  ).join('');
  return '<table class="cal-print-table"><thead><tr><th>Data</th><th>Giorno</th><th>Tipo</th><th>Dettaglio</th><th>Ora</th><th>Esito</th></tr></thead><tbody>'+body+'</tbody></table>' +
    '<div class="cal-print-legend">' +
      '<span><i style="background:#d9d9d9"></i>Allenamento</span>' +
      '<span><i style="background:#bfe8c8"></i>Amichevole</span>' +
      '<span><i style="background:#f3bfd0"></i>Campionato</span>' +
      '<span><i style="background:#f5e6a8"></i>Coppa</span>' +
      '<span><i style="background:#ffffff"></i>Riposo</span>' +
    '</div>';
}
function calendarioPrintWrapHTML(fromStr, toStr){
  return '<div class="cal-print-wrap"><h1>Calendario Preparazione</h1>' +
    '<p class="cal-print-period">Periodo: dal '+esc(formatDate(fromStr))+' al '+esc(formatDate(toStr))+'</p>' +
    calendarioPrintTableHTML(fromStr, toStr) +
  '</div>';
}
function readCalendarioExportRange(){
  const from = document.getElementById('cal-export-da').value;
  const to = document.getElementById('cal-export-a').value;
  if(!from || !to){
    alert('Seleziona sia "Da" sia "A": servono per elencare ogni giorno del periodo (compresi i riposi).');
    return null;
  }
  if(from>to){
    alert('"Da" deve precedere "A".');
    return null;
  }
  return { from, to };
}
function exportCalendarioPDF(){
  const range = readCalendarioExportRange();
  if(!range) return;
  const area = document.getElementById('print-area');
  area.innerHTML = calendarioPrintWrapHTML(range.from, range.to);
  window.print();
}
function exportCalendarioImage(){
  const range = readCalendarioExportRange();
  if(!range) return;
  ensureHtml2Canvas(function(){
    const holder = document.createElement('div');
    holder.style.position = 'fixed'; holder.style.left = '-9999px'; holder.style.top = '0';
    holder.style.width = '900px';
    holder.innerHTML = calendarioPrintWrapHTML(range.from, range.to);
    document.body.appendChild(holder);
    html2canvas(holder, { backgroundColor:'#FFFFFF', scale:2 }).then(function(canvas){
      const link = document.createElement('a');
      link.download = 'calendario-preparazione-' + range.from + '_' + range.to + '.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link); link.click(); link.remove();
      holder.remove();
    }).catch(function(err){
      console.error('export calendario image error', err);
      alert('Esportazione immagine non riuscita.');
      holder.remove();
    });
  });
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
          const tipoRaw = String(row['Tipo Partita']||'').trim();
          const tipo = (tipoRaw==='Amichevole' || tipoRaw==='Coppa') ? tipoRaw : 'Campionato';
          state.matches.push({
            id: uid(), avversario, data, ora, sede, tipo,
            convocati: [], numeriGara: {},
            formazioneNostra: defaultFormazioneNostraForNewMatch(),
            formazioneAvversaria: { modulo:'', chips:[], arrows:[], noteCaratteristiche:'', notePiano:'' },
            statistiche: {}, golFatti: [], golSubiti: [],
            valutazioni: { nostraSquadra:{voto:null,note:'',atletico:null,tecnico:null,tattico:null,personalita:null}, nostriGiocatori:{}, avversariSquadra:{voto:null,note:''}, avversariGiocatori:[] }
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
const STATS_FILTER_TIPI = ['Campionato','Amichevole','Coppa'];
// Filtro periodo/tipo per le statistiche: preferenza di visualizzazione, non un dato di
// squadra, quindi resta solo lato client (come state.hideAggregatiFormazione) e non passa
// dal salvataggio su server. Da/A vuoti = nessun limite su quel lato del periodo.
function getStatsFilter(){
  return state.statsFilter || { da:'', a:'', tipi: STATS_FILTER_TIPI.slice() };
}
function setStatsFilterField(field, value){
  const f = Object.assign({}, getStatsFilter());
  f[field] = value;
  state.statsFilter = f;
  renderView();
}
function toggleStatsFilterTipo(tipo){
  const f = Object.assign({}, getStatsFilter());
  f.tipi = f.tipi.slice();
  const i = f.tipi.indexOf(tipo);
  if(i>=0) f.tipi.splice(i,1); else f.tipi.push(tipo);
  // Non permettere di deselezionare l'ultimo tipo rimasto: senza nessun tipo attivo le
  // statistiche sparirebbero silenziosamente, senza che sia chiaro perché.
  if(f.tipi.length===0) return;
  state.statsFilter = f;
  renderView();
}
function statsFilterIsDefault(f){
  f = f || getStatsFilter();
  return !f.da && !f.a && f.tipi.length===STATS_FILTER_TIPI.length;
}
function statsFilterLabel(f){
  f = f || getStatsFilter();
  if(statsFilterIsDefault(f)) return 'Tutta la stagione';
  const tipiPart = f.tipi.length===STATS_FILTER_TIPI.length ? 'tutti i tipi' : f.tipi.join(', ');
  let periodoPart = 'tutta la stagione';
  if(f.da && f.a) periodoPart = 'dal ' + formatDate(f.da) + ' al ' + formatDate(f.a);
  else if(f.da) periodoPart = 'dal ' + formatDate(f.da);
  else if(f.a) periodoPart = 'fino al ' + formatDate(f.a);
  return tipiPart + ' · ' + periodoPart;
}
function matchPassesStatsFilter(m, f){
  const tipo = m.tipo || 'Campionato';
  if(f.tipi.indexOf(tipo)===-1) return false;
  if(f.da && (!m.data || m.data < f.da)) return false;
  if(f.a && (!m.data || m.data > f.a)) return false;
  return true;
}
function renderStatsFilterHTML(){
  const f = getStatsFilter();
  return '' +
  '<div class="stats-filter-row">' +
    '<div class="field"><label>Da</label><input type="date" value="'+esc(f.da)+'" onchange="setStatsFilterField(\'da\',this.value)"></div>' +
    '<div class="field"><label>A</label><input type="date" value="'+esc(f.a)+'" onchange="setStatsFilterField(\'a\',this.value)"></div>' +
    '<div class="stats-filter-tipi">' +
      STATS_FILTER_TIPI.map(t=>'<button type="button" class="stats-filter-chip' + (f.tipi.indexOf(t)>=0?' stats-filter-chip-active':'') + '" onclick="toggleStatsFilterTipo(\''+t+'\')">'+t+'</button>').join('') +
    '</div>' +
  '</div>';
}
function computeSeasonStats(filter){
  filter = filter || getStatsFilter();
  let golFattiTot=0, golSubitiTot=0;
  const tipologiaFatti = {};
  const tipologiaSubiti = {};
  const perPlayer = {};
  const perSede = { Casa: {partite:0, golFatti:0, golSubiti:0}, Trasferta: {partite:0, golFatti:0, golSubiti:0} };
  state.players.forEach(p=>{ perPlayer[p.id] = { nome:p.nome, convocazioni:0, titolare:0, subentrato:0, minutiTot:0, gol:0, golSubiti:0, assist:0, gialli:0, rossi:0, votiSum:0, votiCount:0 }; });

  const playedMatches = state.matches.filter(m=>computeMatchStato(m)==='Giocata' && matchPassesStatsFilter(m, filter));
  // Bilancio V/N/P e andamento per tipo partita: stessa lista di partite già filtrata da
  // filter (data + tipi selezionati in cima alla pagina), cosi il comportamento resta
  // coerente con "Casa vs trasferta" invece di introdurre una seconda nozione di filtro.
  const vpn = { vittorie:0, pareggi:0, sconfitte:0 };
  const perTipo = {};
  STATS_FILTER_TIPI.forEach(t=>{ perTipo[t] = { partite:0, vittorie:0, pareggi:0, sconfitte:0, golFatti:0, golSubiti:0 }; });
  const risultati = [];
  let gialliTot = 0, rossiTot = 0;
  // Valutazione di squadra a 4 assi: media stagionale di ciascun asse, calcolata solo sulle
  // partite dove quell'asse è stato compilato (non tutte hanno una valutazione post-partita).
  const assiSum = { atletico:0, tecnico:0, tattico:0, personalita:0 };
  const assiCount = { atletico:0, tecnico:0, tattico:0, personalita:0 };
  // Mappa gol a zone: conteggio per cella della griglia 3x3 (vedi GOL_ZONE_GRID), solo sui
  // gol dove la zona è stata segnata (tap facoltativo, non tutti i gol la avranno).
  const zoneCounts = {};
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
      if(s.cartellino && s.cartellino.tipo==='Giallo'){ perPlayer[pid].gialli++; gialliTot++; }
      if(s.cartellino && s.cartellino.tipo==='Rosso'){ perPlayer[pid].rossi++; rossiTot++; }
    });
    (m.golFatti||[]).forEach(g=>{
      golFattiTot++;
      tipologiaFatti[g.tipo] = (tipologiaFatti[g.tipo]||0)+1;
      if(g.marcatoreId && perPlayer[g.marcatoreId]) perPlayer[g.marcatoreId].gol++;
      if(g.assistId && perPlayer[g.assistId]) perPlayer[g.assistId].assist++;
      if(g.zona) zoneCounts[g.zona] = (zoneCounts[g.zona]||0)+1;
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
    const esito = matchOutcome(m);
    const tipo = m.tipo || 'Campionato';
    const gf = (m.golFatti||[]).length, gs = (m.golSubiti||[]).length;
    if(esito==='win') vpn.vittorie++; else if(esito==='draw') vpn.pareggi++; else if(esito==='loss') vpn.sconfitte++;
    if(perTipo[tipo]){
      perTipo[tipo].partite++;
      perTipo[tipo].golFatti += gf;
      perTipo[tipo].golSubiti += gs;
      if(esito==='win') perTipo[tipo].vittorie++; else if(esito==='draw') perTipo[tipo].pareggi++; else if(esito==='loss') perTipo[tipo].sconfitte++;
    }
    risultati.push({ id:m.id, data:m.data, tipo, sede:m.sede, avversario:m.avversario, esito, golFatti:gf, golSubiti:gs });
    const ns = (m.valutazioni && m.valutazioni.nostraSquadra) || {};
    ['atletico','tecnico','tattico','personalita'].forEach(k=>{
      if(ns[k]!=null){ assiSum[k] += Number(ns[k]); assiCount[k]++; }
    });
  });
  risultati.sort((a,b)=>(a.data||'').localeCompare(b.data||''));
  const valutazioneSquadra = {};
  ['atletico','tecnico','tattico','personalita'].forEach(k=>{
    valutazioneSquadra[k] = assiCount[k] ? assiSum[k]/assiCount[k] : null;
  });

  return {
    golFattiTot, golSubitiTot, tipologiaFatti, tipologiaSubiti, perPlayer, perSede, partiteGiocate: playedMatches.length,
    vpn, perTipo, risultati, cartelliniTot: { gialli: gialliTot, rossi: rossiTot }, valutazioneSquadra, zoneCounts,
  };
}
// Ultimi voti di un giocatore in ordine cronologico (dal più vecchio al più recente), solo
// dalle partite giocate dove ha ricevuto una valutazione: serve per la barra "forma" nella
// lista giocatori di Formazione, un dato diverso dalla media stagionale di computeSeasonStats.
function playerRecentForm(playerId, count){
  count = count || 5;
  const playedMatches = state.matches.filter(m=>computeMatchStato(m)==='Giocata').slice().sort((a,b)=>(a.data||'').localeCompare(b.data||''));
  const voti = [];
  playedMatches.forEach(m=>{
    const v = (m.valutazioni && m.valutazioni.nostriGiocatori && m.valutazioni.nostriGiocatori[playerId]) || null;
    if(v && v.voto) voti.push(parseFloat(v.voto));
  });
  return voti.slice(-count);
}
// Gradiente continuo (non a soglie a scatti) per la barra "forma": verde per i voti alti,
// sfumando verso l'arancione per quelli bassi, mai un rosso acceso — cosi un 6.9 e un 7.1
// hanno colori quasi uguali invece di un salto netto, e anche una partita storta non sembra
// un giudizio durissimo. Interpolazione lineare in HSL tra pochi punti di riferimento.
const FORM_COLOR_STOPS = [
  { voto: 8.5, h: 140, s: 55, l: 38 },
  { voto: 7.0, h: 122, s: 50, l: 45 },
  { voto: 6.0, h: 75,  s: 55, l: 48 },
  { voto: 5.0, h: 38,  s: 65, l: 50 },
  { voto: 4.0, h: 24,  s: 65, l: 48 },
];
function formaVotoColor(voto){
  const v = Math.max(4, Math.min(8.5, Number(voto)||0));
  for(let i=0;i<FORM_COLOR_STOPS.length-1;i++){
    const a = FORM_COLOR_STOPS[i], b = FORM_COLOR_STOPS[i+1];
    if(v<=a.voto && v>=b.voto){
      const t = (a.voto-v)/(a.voto-b.voto);
      const h = a.h + (b.h-a.h)*t, s = a.s + (b.s-a.s)*t, l = a.l + (b.l-a.l)*t;
      return 'hsl('+h.toFixed(0)+', '+s.toFixed(0)+'%, '+l.toFixed(0)+'%)';
    }
  }
  return 'hsl(24, 65%, 48%)';
}
function playerFormaHTML(playerId){
  const voti = playerRecentForm(playerId, 5);
  if(voti.length===0) return '<span class="forma-empty">—</span>';
  return '<span class="forma-bars" title="Ultime '+voti.length+' partite: '+voti.map(v=>v.toFixed(1)).join(', ')+'">' +
    voti.map(v=>'<span class="forma-bar" style="background:'+formaVotoColor(v)+'"></span>').join('') +
  '</span>';
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
function statCardColorHTML(label, value, color){
  return '<div class="stat-card"><div class="stat-card-value" style="color:'+color+';">' + value + '</div><div class="stat-card-label">' + esc(label) + '</div></div>';
}
// Sequenza cronologica dei risultati stagionali, stesso linguaggio visivo della "forma" del
// singolo giocatore (playerFormaHTML) ma a livello squadra: un blocchetto colorato per
// partita (invece di stelle o righe di tabella) cosi l'andamento si legge a colpo d'occhio.
// V/P/S (Vittoria/Pareggio/Sconfitta) invece della sigla "N" per pareggio delle classifiche
// ufficiali: meno ambiguo per chi non ha già in testa quella convenzione.
function risultatiTimelineHTML(risultati){
  if(risultati.length===0) return '<p class="hint">Nessuna partita giocata nel periodo selezionato.</p>';
  const colori = { win:'var(--success)', draw:'var(--yellow)', loss:'var(--danger)' };
  const lettere = { win:'V', draw:'P', loss:'S' };
  return '<div class="risultati-timeline">' + risultati.map(r=>{
    const title = formatDate(r.data)+' — vs '+(r.avversario||'—')+' ('+r.tipo+', '+(r.sede||'Casa')+') '+r.golFatti+'-'+r.golSubiti;
    return '<span class="risultato-block" style="background:'+colori[r.esito]+';" title="'+esc(title)+'">'+lettere[r.esito]+'</span>';
  }).join('') + '</div>';
}
// Barre invece di un radar: nessun primitivo radar nel codebase e un 4° asse non
// giustifica introdurne uno nuovo — stesso barChartSVG già usato per fatti/subiti.
function valutazioneSquadraHTML(v){
  const assi = [['atletico','Atletico'],['tecnico','Tecnico'],['tattico','Tattico'],['personalita','Personalità']];
  const compilati = assi.filter(([k])=>v[k]!=null);
  if(compilati.length===0) return '<p class="hint">Nessuna valutazione di squadra compilata nel periodo selezionato (tab Valutazioni di una partita giocata).</p>';
  const data = assi.map(([k,label])=>({ label, value: v[k]!=null ? Math.round(v[k]*10)/10 : 0, color: v[k]!=null ? '#4FA8E0' : '#223243' }));
  return barChartSVG(data, { width:320, height:180 });
}
// Heatmap 3x3 delle zone di gol segnate col picker ▧ sulla riga gol (tap facoltativo, non
// tutti i gol avranno una zona): intensità proporzionale al conteggio della cella più
// frequente, cosi la cella "calda" salta all'occhio anche senza leggere i numeri.
function golZoneHeatmapHTML(zoneCounts, golFattiTot){
  const total = Object.keys(zoneCounts).reduce((s,k)=>s+zoneCounts[k],0);
  if(total===0) return '<p class="hint">Nessun gol con zona segnata nel periodo selezionato: tocca l\'icona ▧ su un gol fatto (tab Tabellino di una partita) per segnare da dove è arrivato.</p>';
  const max = Math.max(...GOL_ZONE_GRID.flat().map(k=>zoneCounts[k]||0));
  const cells = GOL_ZONE_GRID.map(row => row.map(key=>{
    const n = zoneCounts[key]||0;
    const alpha = n ? (0.12 + 0.68*(n/max)) : 0;
    return '<div class="gol-zone-heat-cell" style="background:rgba(var(--accent-rgb),'+alpha+');" title="'+esc(GOL_ZONE_LABELS[key])+': '+n+' gol">'+(n||'')+'</div>';
  }).join('')).join('');
  return '<div class="gol-zone-heatmap">'+cells+'</div>' +
    '<p class="hint" style="margin-top:6px;">'+total+' gol con zona segnata su '+golFattiTot+' totali nel periodo.</p>';
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
    renderStatsFilterHTML() +
    '<p class="hint" style="margin-top:6px;">' + esc(statsFilterLabel()) + '</p>' +
    '<div class="stat-cards">' +
      statCardHTML('Partite giocate', s.partiteGiocate) +
      statCardHTML('Gol fatti', s.golFattiTot) +
      statCardHTML('Gol subiti', s.golSubitiTot) +
      statCardHTML('Differenza reti', (s.golFattiTot - s.golSubitiTot)) +
    '</div>' +
    '<div class="stat-cards" style="margin-top:8px;">' +
      statCardColorHTML('Vittorie', s.vpn.vittorie, 'var(--success)') +
      statCardColorHTML('Pareggi', s.vpn.pareggi, 'var(--yellow)') +
      statCardColorHTML('Sconfitte', s.vpn.sconfitte, 'var(--danger)') +
      statCardHTML('Ammonizioni', s.cartelliniTot.gialli) +
      statCardHTML('Espulsioni', s.cartelliniTot.rossi) +
    '</div>' +
    '<p class="hint" style="margin-top:10px;">Le statistiche per singolo giocatore sono nella tab "Rosa".</p>' +
  '</div>' +
  '<div class="card"><h3>Andamento risultati</h3>' + risultatiTimelineHTML(s.risultati) + '</div>' +
  '<div class="card"><h3>Valutazione di squadra</h3><p class="hint">Media stagionale dei 4 assi (1-10), una valutazione a partita per l\'intera squadra.</p>' + valutazioneSquadraHTML(s.valutazioneSquadra) + '</div>' +
  '<div class="card"><h3>Fatti vs subiti</h3>' + barFattiSubiti + '</div>' +
  '<div class="card"><h3>Casa vs trasferta</h3>' +
    '<table class="stats-table"><thead><tr><th>Sede</th><th>Partite</th><th>Gol fatti</th><th>Gol subiti</th><th>Differenza</th></tr></thead><tbody>' +
      '<tr><td>Casa</td><td>'+s.perSede.Casa.partite+'</td><td>'+s.perSede.Casa.golFatti+'</td><td>'+s.perSede.Casa.golSubiti+'</td><td>'+(s.perSede.Casa.golFatti-s.perSede.Casa.golSubiti)+'</td></tr>' +
      '<tr><td>Trasferta</td><td>'+s.perSede.Trasferta.partite+'</td><td>'+s.perSede.Trasferta.golFatti+'</td><td>'+s.perSede.Trasferta.golSubiti+'</td><td>'+(s.perSede.Trasferta.golFatti-s.perSede.Trasferta.golSubiti)+'</td></tr>' +
    '</tbody></table>' +
  '</div>' +
  '<div class="card"><h3>Andamento per tipo partita</h3>' +
    '<table class="stats-table"><thead><tr><th>Tipo</th><th>Partite</th><th>V</th><th>P</th><th>S</th><th>Gol fatti</th><th>Gol subiti</th><th>Differenza</th></tr></thead><tbody>' +
      STATS_FILTER_TIPI.map(t=>{
        const pt = s.perTipo[t];
        return '<tr><td>'+esc(t)+'</td><td>'+pt.partite+'</td><td>'+pt.vittorie+'</td><td>'+pt.pareggi+'</td><td>'+pt.sconfitte+'</td><td>'+pt.golFatti+'</td><td>'+pt.golSubiti+'</td><td>'+(pt.golFatti-pt.golSubiti)+'</td></tr>';
      }).join('') +
    '</tbody></table>' +
  '</div>' +
  '<div class="grid-2">' +
    '<div class="card"><h3>Tipologia gol fatti</h3><div class="donut-row">' + donutFatti + legendHTML(typeColorList(s.tipologiaFatti)) + '</div></div>' +
    '<div class="card"><h3>Tipologia gol subiti</h3><div class="donut-row">' + donutSubiti + legendHTML(typeColorList(s.tipologiaSubiti)) + '</div></div>' +
  '</div>' +
  '<div class="card"><h3>Mappa gol</h3><p class="hint">Zona del campo da cui è arrivato il gol, segnata a mano sul tabellino della partita.</p>' + golZoneHeatmapHTML(s.zoneCounts, s.golFattiTot) + '</div>';
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
function showRosaPlayerContextMenu(evt, playerId){
  evt.preventDefault();
  evt.stopPropagation();
  const menu = document.getElementById('player-context-menu');
  menu.innerHTML = '<div class="context-menu-item" onclick="exportPlayerStatsImage(\''+playerId+'\'); hideContextMenu();">Esporta statistiche (immagine)</div>';
  const x = Math.min(evt.clientX, window.innerWidth-220);
  const y = Math.min(evt.clientY, window.innerHeight-60);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
// Scheda statistiche di un singolo giocatore: stesse variabili CSS "carta bianca" già
// usate per l'export delle sedute Allenamenti (.schema-print-page), così l'aspetto è
// coerente col resto dell'app invece di uno stile a sé.
function buildPlayerStatsPrintHTML(playerId){
  const r = computePlayerStatsRow(playerId);
  if(!r) return '';
  const righe = [
    ['Convocazioni', r.convocazioni], ['Titolare', r.titolare], ['Subentrato', r.subentrato],
    ['Minuti totali', r.minuti],
  ];
  if(r.ruolo==='Por') righe.push(['Gol subiti', r.golSubiti]);
  righe.push(
    ['Gol', r.gol], ['Assist', r.assist], ['Ammonizioni', r.gialli], ['Espulsioni', r.rossi],
    ['Voto medio', r.votoMedio!=null ? r.votoMedio.toFixed(1) : '-'],
    ['% Presenza', r.percentPresenza!=null ? r.percentPresenza+'%' : '-']
  );
  return '<div class="schema-print-page"><div class="player-stats-card">' +
    '<h1>'+esc(displayName(r.nome))+'</h1>' +
    '<p class="player-stats-sub">'+esc(r.ruolo)+(r.secondoRuolo?' / '+esc(r.secondoRuolo):'')+(r.piede?' · '+esc(r.piede):'')+(r.eta!=null?' · '+r.eta+' anni':'')+' · '+esc(getAppUser().stagioneEtichetta)+'</p>' +
    '<div class="player-stats-rating">'+starRatingHTML(r.valutazione, 18)+'</div>' +
    '<table class="player-stats-table"><tbody>' +
      righe.map(([label,val])=>'<tr><td>'+esc(label)+'</td><td>'+esc(String(val))+'</td></tr>').join('') +
    '</tbody></table>' +
    (r.note ? '<p class="player-stats-note">'+esc(r.note)+'</p>' : '') +
  '</div></div>';
}
function exportPlayerStatsImage(playerId){
  const p = state.players.find(pl=>pl.id===playerId);
  if(!p) return;
  ensureHtml2Canvas(function(){
    const holder = document.createElement('div');
    holder.style.position = 'fixed'; holder.style.left = '-9999px'; holder.style.top = '0';
    holder.innerHTML = buildPlayerStatsPrintHTML(playerId);
    document.body.appendChild(holder);
    html2canvas(holder, { backgroundColor:'#FFFFFF', scale:2 }).then(function(canvas){
      const link = document.createElement('a');
      link.download = 'statistiche-'+displayName(p.nome).replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link); link.click(); link.remove();
      holder.remove();
    }).catch(function(err){
      console.error('export player stats image error', err);
      alert('Esportazione immagine non riuscita.');
      holder.remove();
    });
  });
}
function buildLavagnaPrintSVG(match){
  const slots = match.formazioneNostra.slots || [];
  const chips = match.formazioneNostra.chips || [];
  const filled = new Set(chips.map(c=>c.numero));
  const emptySvg = slots.filter(s=>!filled.has(s.numero)).map(s=>
    '<circle cx="'+s.x+'" cy="'+s.y+'" r="2.6" fill="none" stroke="var(--accent)" stroke-width="0.3" stroke-dasharray="1,0.8" opacity="0.5"/>'
  ).join('');
  const chipsSvg = chips.map(c=>{
    const p = state.players.find(pl=>pl.id===c.playerId);
    const cognome = p ? surnameOf(p.nome) : '';
    return '<g transform="translate('+c.x+','+c.y+')">' +
      '<circle r="2.6" fill="#0E2233" stroke="var(--accent)" stroke-width="0.35"/>' +
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
function starInputHTML(current, readonly, onclickFn){
  const v = current || 0;
  const fn = onclickFn || 'setSchemaVotoPreferenza';
  let out = '<span class="star-input'+(readonly?' star-input-readonly':'')+'">';
  for(let i=1;i<=5;i++){
    out += '<button type="button" class="star-input-btn" '+(readonly?'disabled':'onclick="'+fn+'('+i+')"')+' aria-label="'+i+' stelle">' + starIconSVG(i<=v ? 'var(--yellow)' : 'var(--border)', 20) + '</button>';
  }
  out += '</span>';
  return out;
}
/* icone disegnatore (stroke-based, coerenti con SIDE_NAV_ICONS) — grandi quanto i pallini colore */
const SCHEMA_ICON_GIOCATORE = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>';
// Pallone realistico costruito geometricamente (schemaBallSVG, hoisted): stessa identica
// resa sia sul pulsante toolbar sia sui palloni piazzati in campo.
const SCHEMA_ICON_PALLONE = '<svg viewBox="0 0 24 24" width="26" height="26"><g transform="translate(12,12)">'+schemaBallSVG(9,24)+'</g></svg>';
const SCHEMA_ICON_MOVIMENTO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 18L18 6" stroke-dasharray="3,2.4"/><path d="M12.5 6H18v5.5"/></svg>';
const SCHEMA_ICON_PASSAGGIO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 18L18 6"/><path d="M12.5 6H18v5.5"/></svg>';
const SCHEMA_ICON_CONDUZIONE = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 18Q7.5 13 9.5 16T14.5 12T18 7"/><path d="M13 7.3L18 6.5L18.7 11.8"/></svg>';
const SCHEMA_ICON_PALLONE_ALTO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 19Q11 4 20 10"/><path d="M15.5 7.5l4.5 2.5-2.3 4.3"/></svg>';
const SCHEMA_ICON_DIVISORE = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2.5,2.5"><path d="M4 20L20 4"/></svg>';
const SCHEMA_ICON_RIGACAMPO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20L20 4"/></svg>';
const SCHEMA_ICON_GOMMA = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 3.5l3 3L10 17H6v-4z"/><path d="M13 7l4 4"/><path d="M4 21h9"/></svg>';
const SCHEMA_ICON_PORTA = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="10"/><path d="M8 6v10M12 6v10M16 6v10"/></svg>';
const SCHEMA_ICON_PORTINA = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="9" width="10" height="6"/><path d="M10 9v6M14 9v6"/></svg>';
const SCHEMA_ICON_CONO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l5 14H7z"/><path d="M5 18h14"/></svg>';
const SCHEMA_ICON_PALETTO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="18"/><ellipse cx="12" cy="19.5" rx="5" ry="1.8"/></svg>';
const SCHEMA_ICON_CINESINO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="4.5"/></svg>';
const SCHEMA_ICON_ZONA = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3,2"><rect x="4" y="5" width="16" height="14" rx="1.5"/></svg>';
const SCHEMA_ICON_TESTO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6h14"/><path d="M12 6v13"/></svg>';

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
async function ensureSchemaCategorie(){
  const res = await apiGet('/api/schema/categorie');
  // "key" qui rispecchia "chiave" lato server: nome interno già usato ovunque nel client
  // (schemaCategoriaInfo, i filtri, le card libreria) prima che le fasi diventassero
  // personalizzabili — evita di dover rinominare quei riferimenti.
  state.schema.categorie = (res.categorie || []).map(c=>({ id:c.id, key:c.chiave, label:c.label, color:c.color }));
  state.schema.categorieLoaded = true;
}
async function openSchemaLibrary(){
  state.currentView = 'schema';
  state.schema.view = 'library';
  state.currentMatchId = null;
  state.currentAllenamentoId = null;
  await Promise.all([ensureSchemaObjectives(), ensureSchemaTags(), ensureSchemaCategorie(), loadSchemaLibrary()]);
  renderView();
}
async function openSchemaNewExercise(){
  state.currentView = 'schema';
  state.schema.view = 'new';
  state.schema.newExerciseTitolo = '';
  state.schema.newExerciseNumGiocatori = 8;
  state.schema.newExerciseNumPortieri = 0;
  state.schema.newExerciseDescrizione = '';
  state.schema.newExerciseCategorie = [];
  renderView();
}
async function openSchemaExercise(id){
  state.currentView = 'schema';
  state.schema.view = 'sheet';
  state.schema.activeLivelloId = null;
  await Promise.all([ensureSchemaTags(), ensureSchemaCategorie(), ensureTeamRoster(), loadSchemaExercise(id)]);
  renderView();
}
async function openSchemaSessions(){
  state.currentView = 'schema';
  state.schema.view = 'sessions';
  await Promise.all([ensureSchemaObjectives(), loadSchemaSessions()]);
  renderView();
}
async function openSchemaSessionBuilder(id){
  state.currentView = 'schema';
  state.schema.view = 'sessionBuilder';
  await Promise.all([
    ensureSchemaObjectives(),
    ensureSchemaCategorie(),
    ensureTeamRoster(),
    loadSchemaLibrary(),
    loadSchemaSessionDetail(id),
  ]);
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
  else if(v==='considerazioni') html = renderSchemaConsiderazioniView();
  else html = renderSchemaLibrary();
  return html + schemaLivelloPickerHTML() + schemaDuplicatePickerHTML();
}
function attachSchemaInteractions(){
  if(state.schema.view==='sheet') attachSchemaFieldInteractions();
  else if(state.schema.view==='library') attachSchemaLibraryDrag();
}
function schemaSubNavHTML(active){
  return '<div class="pitch-actions" style="margin-bottom:12px;">' +
    '<button class="btn btn-small '+(active==='library'?'btn-active':'')+'" onclick="openSchemaLibrary()">Libreria esercizi</button>' +
    '<button class="btn btn-small '+(active==='sessions'?'btn-active':'')+'" onclick="openSchemaSessions()">Sedute</button>' +
    '<button class="btn btn-small '+(active==='considerazioni'?'btn-active':'')+'" onclick="openSchemaConsiderazioni()">Considerazioni</button>' +
  '</div>';
}
// Considerazioni "aperte", non legate a nessuna seduta specifica — a differenza di quelle
// dentro il costruttore seduta, che invece sono sempre agganciate a una particolare sedutaId.
async function openSchemaConsiderazioni(){
  state.currentView = 'schema';
  state.schema.view = 'considerazioni';
  const [, res] = await Promise.all([ensureTeamRoster(), apiGet('/api/schema/considerazioni')]);
  state.team.considerazioniGeneriche = res.considerazioni || [];
  renderView();
}
async function addSchemaConsiderazioneGenerica(){
  const el = document.getElementById('schema-consid-generica-input');
  const testo = el.value.trim();
  if(!testo) return;
  const res = await apiPost('/api/schema/considerazioni', { testo });
  if(res.considerazione){
    state.team.considerazioniGeneriche = state.team.considerazioniGeneriche.concat(res.considerazione);
    el.value = '';
    renderView();
  } else alert('Errore: '+(res.error||'sconosciuto'));
}
function renderSchemaConsiderazioniView(){
  return schemaSubNavHTML('considerazioni') +
    '<div class="card">' +
      '<h2>Considerazioni</h2>' +
      '<p class="hint">Pensieri aperti, non legati a una seduta specifica — per quelle di una seduta, vai nella seduta stessa.</p>' +
      schemaConsiderazioniListHTML(state.team.considerazioniGeneriche) +
      (can('write_considerazioni') ? (
        '<div class="form-row" style="margin-top:10px;">' +
          '<textarea id="schema-consid-generica-input" rows="2" placeholder="Scrivi una considerazione..." style="flex:1;"></textarea>' +
          '<button class="btn btn-small btn-primary" onclick="addSchemaConsiderazioneGenerica()">Aggiungi</button>' +
        '</div>'
      ) : '') +
    '</div>';
}

/* ---------- libreria esercizi ---------- */
async function loadSchemaLibrary(){
  const s = state.schema;
  const params = new URLSearchParams();
  if(s.filterSearch) params.set('search', s.filterSearch);
  if(s.filterTags.length) params.set('tags', s.filterTags.join(','));
  if(s.filterCategorie.length) params.set('categoria', s.filterCategorie.join(','));
  const res = await apiGet('/api/schema/exercises?'+params.toString());
  s.exercises = res.exercises || [];
}
function toggleSchemaFilterTag(tag){
  const s = state.schema;
  s.filterTags = s.filterTags.includes(tag) ? s.filterTags.filter(t=>t!==tag) : s.filterTags.concat(tag);
  loadSchemaLibrary().then(renderView);
}
function setSchemaFilterCategoria(key){
  const s = state.schema;
  s.filterCategorie = s.filterCategorie.includes(key) ? s.filterCategorie.filter(k=>k!==key) : s.filterCategorie.concat(key);
  loadSchemaLibrary().then(renderView);
}
function showSchemaCategoriaContextMenu(evt, key){
  evt.preventDefault();
  evt.stopPropagation();
  const menu = document.getElementById('player-context-menu');
  let html = '<div class="context-menu-item" onclick="renameSchemaCategoria(\''+key+'\'); hideContextMenu();">Rinomina</div>';
  html += '<div class="context-menu-item" style="display:flex; gap:6px; align-items:center;">' +
    SCHEMA_CATEGORIA_COLORI.map(c=>'<span onclick="recolorSchemaCategoria(\''+key+'\',\''+c+'\'); hideContextMenu();" style="width:16px;height:16px;border-radius:4px;background:'+c+';display:inline-block;cursor:pointer;border:1px solid var(--border);"></span>').join('') +
  '</div>';
  html += '<div class="context-menu-item" onclick="deleteSchemaCategoria(\''+key+'\'); hideContextMenu();" style="color:var(--danger);">Elimina</div>';
  menu.innerHTML = html;
  const x = Math.min(evt.clientX, window.innerWidth-190);
  const y = Math.min(evt.clientY, window.innerHeight-110);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
async function renameSchemaCategoria(key){
  const c = state.schema.categorie.find(x=>x.key===key);
  if(!c) return;
  const label = prompt('Nome della fase di gioco:', c.label);
  if(label===null) return;
  const trimmed = label.trim();
  if(!trimmed) return;
  const res = await apiPatch('/api/schema/categorie/'+c.id, { label: trimmed });
  if(res.categoria){ c.label = res.categoria.label; renderView(); }
}
async function recolorSchemaCategoria(key, color){
  const c = state.schema.categorie.find(x=>x.key===key);
  if(!c) return;
  const res = await apiPatch('/api/schema/categorie/'+c.id, { color });
  if(res.categoria){ c.color = res.categoria.color; renderView(); }
}
function deleteSchemaCategoria(key){
  const c = state.schema.categorie.find(x=>x.key===key);
  if(!c) return;
  showConfirmModal('Eliminare la fase "'+c.label+'"? Gli esercizi che la usano diventeranno "non categorizzati".', async function(){
    const res = await apiDelete('/api/schema/categorie/'+c.id);
    if(res.ok){
      state.schema.categorie = state.schema.categorie.filter(x=>x.key!==key);
      state.schema.filterCategorie = state.schema.filterCategorie.filter(k=>k!==key);
      await loadSchemaLibrary();
      renderView();
    }
  });
}
async function createSchemaCategoria(){
  const label = prompt('Nome della nuova fase di gioco:', '');
  if(label===null) return;
  const trimmed = label.trim();
  if(!trimmed) return;
  const res = await apiPost('/api/schema/categorie', { label: trimmed });
  if(res.categoria){
    state.schema.categorie = state.schema.categorie.concat({ id:res.categoria.id, key:res.categoria.chiave, label:res.categoria.label, color:res.categoria.color });
    renderView();
  }
}
// Tieni-premuto-e-trascina per riordinare i chip "Fasi di gioco"/"Focus" nel filtro
// libreria: stesso drag-and-drop nativo (dragstart/dragover/drop) già usato per la sidebar
// (vedi attachSideNavDrag) — il browser non emette un 'click' spurio dopo un trascinamento
// nativo davvero avvenuto, quindi convive senza conflitti con l'onclick di selezione/filtro
// già presente sullo stesso chip.
let schemaChipDragKey = null;
function attachSchemaChipDragReorder(chipSelector, dataAttr, getOrder, onReorder){
  document.querySelectorAll(chipSelector).forEach(function(chipEl){
    chipEl.addEventListener('dragstart', function(e){
      schemaChipDragKey = chipEl.getAttribute(dataAttr);
      e.dataTransfer.effectAllowed = 'move';
      chipEl.classList.add('schema-chip-dragging');
    });
    chipEl.addEventListener('dragend', function(){
      chipEl.classList.remove('schema-chip-dragging');
      schemaChipDragKey = null;
    });
    chipEl.addEventListener('dragover', function(e){
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    chipEl.addEventListener('drop', function(e){
      e.preventDefault();
      const targetKey = chipEl.getAttribute(dataAttr);
      if(!schemaChipDragKey || schemaChipDragKey===targetKey) return;
      const order = getOrder().slice();
      const fromIdx = order.indexOf(schemaChipDragKey);
      const toIdx = order.indexOf(targetKey);
      if(fromIdx===-1 || toIdx===-1) return;
      order.splice(fromIdx,1);
      order.splice(toIdx,0,schemaChipDragKey);
      onReorder(order);
    });
  });
}
async function reorderSchemaCategorie(ids){
  const res = await apiPatch('/api/schema/categorie/reorder', { ids });
  if(res.categorie){
    state.schema.categorie = res.categorie.map(c=>({ id:c.id, key:c.chiave, label:c.label, color:c.color }));
    renderView();
  }
}
async function reorderSchemaTags(order){
  const res = await apiPatch('/api/schema/tags', { order });
  if(res.ok){
    state.schema.availableTags = order;
    renderView();
  }
}
function attachSchemaLibraryDrag(){
  if(!can('edit_esercizi')) return;
  attachSchemaChipDragReorder('.schema-cat-filter-chip[data-cat-id]', 'data-cat-id', ()=>state.schema.categorie.map(c=>c.id), reorderSchemaCategorie);
  attachSchemaChipDragReorder('.schema-tag-chip[data-tag]', 'data-tag', ()=>state.schema.availableTags.slice(), reorderSchemaTags);
}
function renderSchemaLibrary(){
  const s = state.schema;
  // Senza edit_esercizi la libreria è in sola lettura: niente pulsanti di creazione.
  const canEditLibrary = can('edit_esercizi');
  // Tieni-premuto-e-trascina per riordinare (vedi attachSchemaChipDragReorder, stesso
  // meccanismo drag-and-drop nativo già usato per la sidebar): solo con edit_esercizi,
  // stesso permesso già richiesto per rinominare/eliminare una fase o un'etichetta.
  const tagChips = s.availableTags.map(t=>
    '<button type="button" class="schema-tag-chip '+(s.filterTags.includes(t)?'schema-tag-chip-active':'')+'" data-tag="'+esc(t)+'" '+(canEditLibrary?'draggable="true"':'')+' onclick="toggleSchemaFilterTag(\''+esc(t)+'\')" '+(canEditLibrary?'oncontextmenu="showSchemaTagContextMenu(event,\''+esc(t).replace(/'/g,"\\'")+'\')" title="Trascina per riordinare, clic destro per rinominare o eliminare"':'')+'>'+esc(t)+'</button>'
  ).join('');
  const categoriaChips = s.categorie.map(c=>
    '<button type="button" class="schema-cat-chip schema-cat-filter-chip '+(s.filterCategorie.includes(c.key)?'schema-cat-filter-chip-active':'')+'" style="background:'+c.color+';" data-cat-id="'+c.id+'" '+(canEditLibrary?'draggable="true"':'')+' onclick="setSchemaFilterCategoria(\''+c.key+'\')" '+(canEditLibrary?'oncontextmenu="showSchemaCategoriaContextMenu(event,\''+c.key+'\')" title="Trascina per riordinare, clic destro per rinominare, cambiare colore o eliminare"':'')+'>'+esc(c.label)+'</button>'
  ).join('') + (canEditLibrary ? '<button type="button" class="schema-cat-chip schema-cat-add-chip" onclick="createSchemaCategoria()">+ Nuova fase</button>' : '');
  // Il disegnatore tattico (per creare un esercizio nuovo) serve spazio e precisione che uno
  // schermo da telefono non offre: da mobile resta raggiungibile solo da computer, mentre
  // sfogliare la libreria e comporre una seduta scegliendo esercizi già pronti funziona
  // comunque, senza bisogno del disegnatore.
  const canCreateExercise = canEditLibrary && !isMobileLayout();
  return schemaSubNavHTML('library') +
    '<div class="card">' +
      '<div class="card-header-row"><h2>Libreria esercizi</h2>' +
        (canCreateExercise ? '<div class="pitch-actions"><button class="btn btn-primary btn-small" onclick="openSchemaNewExercise()">+ Nuovo esercizio</button></div>' : '') +
      '</div>' +
      (canEditLibrary && !canCreateExercise ? '<p class="hint">Per creare un nuovo esercizio (serve il disegnatore tattico) usa un computer. Da qui puoi comunque sfogliare la libreria e comporre una seduta.</p>' : '') +
      '<div class="form-row">' +
        '<div class="field field-grow"><label>Cerca</label><input id="schema-filter-search" type="text" placeholder="titolo o focus" value="'+esc(s.filterSearch)+'" oninput="onSchemaFilterChange()"></div>' +
      '</div>' +
      '<div class="field"><label>Fasi di gioco</label><div class="schema-tag-chip-row">'+categoriaChips+'</div></div>' +
      (s.availableTags.length ? '<div class="field"><label>Focus</label><div class="schema-tag-chip-row">'+tagChips+'</div></div>' : '') +
      '<div class="schema-exercise-grid">' + renderSchemaExerciseCards() + '</div>' +
    '</div>';
}
function schemaExerciseDurataStimata(e){
  const l = e.livelli && e.livelli[0];
  if(!l) return null;
  // Tempo totale, non solo lavoro: include i recuperi tra le serie (una serie in meno
  // dei recuperi, perché dopo l'ultima non si aspetta).
  const lavoro = l.ripetizioni * l.durataRipetizione;
  const recuperi = Math.max(l.ripetizioni - 1, 0) * (l.recuperoSecondi || 0) / 60;
  return Math.round(lavoro + recuperi);
}
// Card condivisa tra libreria e costruttore seduta (dove serve piu compatta, senza voto e
// con miniatura piu piccola): stessa anteprima ovunque si scelga un esercizio.
function schemaExerciseCardHTML(e, onclickAttr, compact){
  const tags = schemaExerciseTags(e);
  const badge = e.livelli.length>1 ? '<span class="pill">'+e.livelli.length+' livelli</span>' : '';
  const cats = schemaExerciseCategorie(e).map(schemaCategoriaInfo).filter(Boolean);
  const durata = schemaExerciseDurataStimata(e);
  const primoLivello = e.livelli[0];
  const cls = 'schema-exercise-card' + (compact ? ' schema-exercise-card-compact' : '');
  // Il menu contestuale (modifica/duplica/elimina) ha senso solo dalla libreria vera e
  // propria: nel costruttore seduta (compact=true) la card serve solo a scegliere
  // l'esercizio da aggiungere, non a gestirlo.
  const contextMenuAttr = (!compact && can('edit_esercizi')) ? ' oncontextmenu="showSchemaExerciseCardContextMenu(event,\''+e.id+'\')"' : '';
  return '<div class="'+cls+'" style="'+(cats[0]?'border-left-color:'+cats[0].color+';':'')+'" onclick="'+onclickAttr+'"'+contextMenuAttr+'>' +
    '<div class="schema-exercise-card-thumb">' + (primoLivello ? renderSchemaFieldSVG(primoLivello, false) : '') + '</div>' +
    '<div class="schema-exercise-card-body">' +
      '<div class="schema-exercise-card-head"><strong>'+esc(primoLivello ? primoLivello.titolo : '')+'</strong>'+badge+'</div>' +
      '<div class="schema-exercise-card-meta">' +
        (cats.length ? cats.map(cat=>'<span class="schema-cat-chip" style="background:'+cat.color+';">'+esc(cat.label)+'</span>').join('') : '<span class="hint">Non categorizzato</span>') +
        '<span class="hint" title="Movimento + portieri">'+(primoLivello ? primoLivello.numeroGiocatoriBase+(primoLivello.numeroPortieri ? '+'+primoLivello.numeroPortieri : '') : '—')+' giocatori</span>' +
        (durata!=null ? '<span class="hint" title="Tempo totale, recuperi tra le serie inclusi">'+durata+' min tot.</span>' : '') +
      '</div>' +
      '<div class="hint">'+(tags.length ? esc(tags.join(', ')) : 'Nessun focus')+'</div>' +
      (compact ? '' : '<div class="schema-exercise-card-foot">' + (e.votoPreferenza!=null ? starRatingHTML(e.votoPreferenza, 12) : '<span class="hint">Non valutato</span>') + '</div>') +
    '</div>' +
  '</div>';
}
function renderSchemaExerciseCards(){
  const s = state.schema;
  if(s.exercises.length===0) return '<p class="hint">Nessun esercizio ancora. Crea il primo.</p>';
  return s.exercises.map(e=>schemaExerciseCardHTML(e, "openSchemaExercise('"+e.id+"')", false)).join('');
}
let schemaFilterDebounce = null;
function onSchemaFilterChange(){
  const s = state.schema;
  s.filterSearch = document.getElementById('schema-filter-search').value;
  clearTimeout(schemaFilterDebounce);
  schemaFilterDebounce = setTimeout(async () => { await loadSchemaLibrary(); renderView(); }, 200);
}

/* ---------- nuovo esercizio ---------- */
// I campi testo sono rispecchiati in state.schema (newExerciseTitolo/...) invece di restare
// solo nel DOM: la selezione fasi di gioco richiede un renderView() a ogni clic (per
// aggiornare lo stato attivo dei chip), che rigenera l'intero form — senza salvare il testo
// già digitato in stato, quel renderView lo cancellerebbe.
function renderSchemaNewExerciseForm(){
  const s = state.schema;
  return schemaSubNavHTML('library') +
    '<div class="card">' +
      '<div class="card-header-row"><h2>Nuovo esercizio</h2><button class="btn btn-small" onclick="openSchemaLibrary()">← Libreria</button></div>' +
      '<div class="form-row">' +
        '<div class="field field-grow"><label>Titolo</label><input id="schema-new-ex-titolo" type="text" value="'+esc(s.newExerciseTitolo)+'" oninput="state.schema.newExerciseTitolo=this.value"></div>' +
        '<div class="field"><label title="Giocatori di movimento">Mov.</label><input id="schema-new-ex-numgiocatori" type="number" min="1" value="'+esc(s.newExerciseNumGiocatori)+'" style="width:64px;" oninput="state.schema.newExerciseNumGiocatori=this.value"></div>' +
        '<div class="field"><label title="Portieri">Por.</label><input id="schema-new-ex-numportieri" type="number" min="0" value="'+esc(s.newExerciseNumPortieri)+'" style="width:64px;" oninput="state.schema.newExerciseNumPortieri=this.value"></div>' +
      '</div>' +
      '<div class="field field-grow"><label>Fasi di gioco</label>'+schemaCategoriaMultiSelectHTML(s.newExerciseCategorie, 'toggleNewExerciseCategoria')+'</div>' +
      '<div class="field"><label>Descrizione generale</label><textarea id="schema-new-ex-descrizione" rows="3" oninput="state.schema.newExerciseDescrizione=this.value">'+esc(s.newExerciseDescrizione)+'</textarea><span class="hint">Perché/a cosa serve questo esercizio — compare anche in anteprima/stampa insieme allo svolgimento, che si scrive dopo, nel livello.</span></div>' +
      '<button class="btn btn-primary" onclick="createSchemaExercise()">Crea esercizio</button>' +
    '</div>';
}
function toggleNewExerciseCategoria(key){
  const s = state.schema;
  s.newExerciseCategorie = s.newExerciseCategorie.includes(key) ? s.newExerciseCategorie.filter(k=>k!==key) : s.newExerciseCategorie.concat(key);
  renderView();
}
async function createSchemaExercise(){
  const s = state.schema;
  const titolo = s.newExerciseTitolo.trim();
  if(!titolo){ alert('Il titolo è obbligatorio.'); return; }
  const res = await apiPost('/api/schema/exercises', {
    titolo,
    descrizione: s.newExerciseDescrizione,
    numeroGiocatoriBase: s.newExerciseNumGiocatori,
    numeroPortieri: s.newExerciseNumPortieri,
    categorie: s.newExerciseCategorie,
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
    schemaInitHistoryForLivello(state.schema.activeLivelloId);
  }
}
function schemaActiveLivello(){
  const e = state.schema.currentExercise;
  if(!e || !e.livelli.length) return null;
  return e.livelli.find(l=>l.id===state.schema.activeLivelloId) || e.livelli[0];
}
// Layout campo preimpostati, punto di partenza per il disegno invece di un campo vuoto.
// Coordinate in metri, stesso sistema di riferimento del viewBox SVG (x=larghezza, y=lunghezza,
// origine in alto a sinistra). Il cerchio di centrocampo è sempre un cerchio INTERO centrato
// sulla linea che lo taglia (y=0 per il centrocampo di "metà campo", y=centro per quello di
// "campo intero"): la metà che cade fuori dal viewBox viene tagliata automaticamente dal
// browser (comportamento di default di <svg>, overflow implicito sul viewBox), risultando in un
// mezzo cerchio senza bisogno di disegnare un arco a mano.
const SCHEMA_FIELD_PRESET_SIZES = {
  // Stessa misura per le due varianti di "Metà campo": si distinguono solo per dove sta
  // la porta-guida (in alto o in basso), non per le dimensioni del campo.
  metaAlto:  { larghezzaCampo: 60, lunghezzaCampo: 52.5 },
  metaBasso: { larghezzaCampo: 60, lunghezzaCampo: 52.5 },
  intero:    { larghezzaCampo: 60, lunghezzaCampo: 105 },
  libero:    { larghezzaCampo: 20, lunghezzaCampo: 28 },
};
const SCHEMA_FIELD_PRESET_LABELS = { metaAlto: 'Metà campo ↑', metaBasso: 'Metà campo ↓', intero: 'Campo intero', libero: 'Libero' };
// Quale preset è attivo ORA per un livello, dedotto dalle sue misure attuali (non c'è un
// campo dedicato salvato: le misure stesse sono la fonte di verità). "Metà campo"/"Campo
// intero" hanno misure fisse e non modificabili a mano — solo "Libero" permette larghezza/
// lunghezza personalizzate — cosi il layout scelto resta coerente con le righe/aree del
// preset invece di poterle disallineare inserendo misure arbitrarie.
function schemaCurrentFieldPreset(livello){
  if(!livello) return 'libero';
  const w = livello.larghezzaCampo, h = livello.lunghezzaCampo;
  if(w===SCHEMA_FIELD_PRESET_SIZES.intero.larghezzaCampo && h===SCHEMA_FIELD_PRESET_SIZES.intero.lunghezzaCampo) return 'intero';
  if(w===SCHEMA_FIELD_PRESET_SIZES.metaAlto.larghezzaCampo && h===SCHEMA_FIELD_PRESET_SIZES.metaAlto.lunghezzaCampo){
    // "metaAlto" e "metaBasso" hanno le stesse misure: si distinguono guardando dove sta
    // la porta-guida generata dal preset, non da un campo salvato a parte.
    const portaGuida = parseSchemaCampo(livello).chips.find(c=>c.guida && c.tipo==='porta');
    return (portaGuida && portaGuida.y > h/2) ? 'metaBasso' : 'metaAlto';
  }
  return 'libero';
}
// Ogni elemento generato da un preset porta guida:true, cosi riapplicare un layout (o
// passarne a un altro) sostituisce SOLO i segni del campo generati dal preset precedente,
// senza toccare giocatori/frecce/zone aggiunti a mano dall'allenatore.
function schemaFieldPresetData(key){
  const empty = { chips: [], arrows: [], zones: [] };
  if(key==='metaAlto'){
    const w = 60, h = 52.5;
    return {
      // Porta in alto (y=0): il resto del disegno (giocatori, sviluppo dell'azione) si
      // costruisce quindi "scendendo" verso il cerchio di centrocampo in fondo, invece che
      // salendo verso la porta.
      chips: [{ id: uid(), x: w/2, y: 0, tipo:'porta', color: SCHEMA_COLORS[0], numero:null, label:'', rot:0, guida:true }],
      arrows: [],
      zones: [
        { id: uid(), x:(w-40)/2, y:0, w:40, h:16, color: SCHEMA_COLORS[0], stile:'contorno', shape:'rect', guida:true },
        { id: uid(), x:(w-18)/2, y:0, w:18, h:5.5, color: SCHEMA_COLORS[0], stile:'contorno', shape:'rect', guida:true },
        { id: uid(), x:w/2-9.15, y:h-9.15, w:18.3, h:18.3, color: SCHEMA_COLORS[0], stile:'contorno', shape:'cerchio', guida:true },
      ],
    };
  }
  if(key==='metaBasso'){
    // Speculare a "metaAlto": porta in basso (y=h), il disegno si costruisce "salendo"
    // dalla porta verso il cerchio di centrocampo in alto — comoda per chi preferisce
    // impostare l'azione dal basso verso l'alto invece che dall'alto verso il basso.
    const w = 60, h = 52.5;
    return {
      chips: [{ id: uid(), x: w/2, y: h, tipo:'porta', color: SCHEMA_COLORS[0], numero:null, label:'', rot:0, guida:true }],
      arrows: [],
      zones: [
        { id: uid(), x:(w-40)/2, y:h-16, w:40, h:16, color: SCHEMA_COLORS[0], stile:'contorno', shape:'rect', guida:true },
        { id: uid(), x:(w-18)/2, y:h-5.5, w:18, h:5.5, color: SCHEMA_COLORS[0], stile:'contorno', shape:'rect', guida:true },
        { id: uid(), x:w/2-9.15, y:-9.15, w:18.3, h:18.3, color: SCHEMA_COLORS[0], stile:'contorno', shape:'cerchio', guida:true },
      ],
    };
  }
  if(key==='intero'){
    const w = 60, h = 105;
    return {
      chips: [
        { id: uid(), x:w/2, y:0, tipo:'porta', color: SCHEMA_COLORS[0], numero:null, label:'', rot:0, guida:true },
        { id: uid(), x:w/2, y:h, tipo:'porta', color: SCHEMA_COLORS[0], numero:null, label:'', rot:0, guida:true },
      ],
      arrows: [
        { id: uid(), x1:0, y1:h/2, x2:w, y2:h/2, tipo:'campo-linea', color: SCHEMA_COLORS[0], numero:null, guida:true },
      ],
      zones: [
        { id: uid(), x:(w-40)/2, y:0, w:40, h:16, color: SCHEMA_COLORS[0], stile:'contorno', shape:'rect', guida:true },
        { id: uid(), x:(w-18)/2, y:0, w:18, h:5.5, color: SCHEMA_COLORS[0], stile:'contorno', shape:'rect', guida:true },
        { id: uid(), x:(w-40)/2, y:h-16, w:40, h:16, color: SCHEMA_COLORS[0], stile:'contorno', shape:'rect', guida:true },
        { id: uid(), x:(w-18)/2, y:h-5.5, w:18, h:5.5, color: SCHEMA_COLORS[0], stile:'contorno', shape:'rect', guida:true },
        { id: uid(), x:w/2-9.15, y:h/2-9.15, w:18.3, h:18.3, color: SCHEMA_COLORS[0], stile:'contorno', shape:'cerchio', guida:true },
      ],
    };
  }
  return empty;
}
// Cambia base del campo e segni (porta/area/cerchio) senza perdere quanto già disegnato:
// toglie solo i segni-guida della base precedente (marcati guida:true), riscala
// proporzionalmente il resto (giocatori, frecce, zone proprie) alla nuova misura, poi
// aggiunge i segni-guida del nuovo layout scelto.
async function applySchemaFieldPreset(key){
  const size = SCHEMA_FIELD_PRESET_SIZES[key] || SCHEMA_FIELD_PRESET_SIZES.libero;
  const livello = schemaActiveLivello();
  const oldW = (livello && livello.larghezzaCampo) || 1, oldH = (livello && livello.lunghezzaCampo) || 1;
  const sx = size.larghezzaCampo / oldW, sy = size.lunghezzaCampo / oldH;
  const current = livello ? parseSchemaCampo(livello) : { chips: [], arrows: [], zones: [] };
  const ownChips = current.chips.filter(c=>!c.guida).map(c=>({ ...c, x: c.x*sx, y: c.y*sy }));
  const ownArrows = current.arrows.filter(a=>!a.guida).map(a=>({
    ...a, x1: a.x1*sx, y1: a.y1*sy, x2: a.x2*sx, y2: a.y2*sy,
    points: a.points ? a.points.map(p=>({ x: p.x*sx, y: p.y*sy })) : null,
  }));
  const ownZones = current.zones.filter(z=>!z.guida).map(z=>({ ...z, x: z.x*sx, y: z.y*sy, w: z.w*sx, h: z.h*sy }));
  const preset = schemaFieldPresetData(key);
  const data = {
    chips: [...ownChips, ...preset.chips],
    arrows: [...ownArrows, ...preset.arrows],
    zones: [...ownZones, ...preset.zones],
  };
  const livelloId = state.schema.activeLivelloId;
  const dataStr = JSON.stringify(data);
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId+'/livelli/'+livelloId, {
    larghezzaCampo: size.larghezzaCampo, lunghezzaCampo: size.lunghezzaCampo, schemaCampo: dataStr,
  });
  if(res.livello){
    const idx = state.schema.currentExercise.livelli.findIndex(l=>l.id===livelloId);
    if(idx>=0) state.schema.currentExercise.livelli[idx] = res.livello;
    schemaPushHistory(livelloId, dataStr);
    renderView();
  }
}
function parseSchemaCampo(livello){
  let d;
  try { d = JSON.parse((livello && livello.schemaCampo) || '{}'); } catch { d = {}; }
  if(!Array.isArray(d.chips)) d.chips = [];
  if(!Array.isArray(d.arrows)) d.arrows = [];
  if(!Array.isArray(d.zones)) d.zones = [];
  // Default difensivi per i dati creati prima di questo round (chip/frecce senza tipo/colore/id).
  d.chips = d.chips.map(c=>({
    id: c.id,
    x: c.x,
    y: c.y,
    tipo: ['pallone','porta','portina','cono','paletto','cinesino','testo'].includes(c.tipo) ? c.tipo : 'giocatore',
    color: c.color || SCHEMA_COLORS[0],
    numero: c.numero!=null ? c.numero : null,
    label: c.label || '',
    ruolo: c.ruolo==='portiere' ? 'portiere' : null,
    rot: typeof c.rot==='number' ? c.rot : 0,
    // Moltiplicatore di dimensione (1 = default), regolabile dal menu contestuale A-/A+ —
    // per i chip 'giocatore' scala il cerchio, per 'testo' il font. Ignorato dagli altri tipi.
    size: typeof c.size==='number' && c.size>0 ? c.size : 1,
    // Solo per tipo 'testo': font più sottile (300) invece del semi-bold di default (600),
    // toggle dal menu contestuale.
    sottile: c.sottile===true,
    // true solo per gli elementi generati da un layout preimpostato (porta/area/cerchio):
    // permette di sostituirli quando si cambia base del campo senza toccare quelli
    // aggiunti a mano dall'allenatore (vedi applySchemaFieldPreset).
    guida: c.guida===true,
  }));
  d.arrows = d.arrows.map(a=>({
    id: a.id || uid(),
    x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2,
    // Difensivo anche contro punti corrotti (es. salvati prima del fix del bug che li
    // serializzava come "{}" vuoti): se anche solo un punto non ha coordinate numeriche,
    // si scarta l'intero percorso e si ricade sulla curva automatica da inizio/fine.
    points: (Array.isArray(a.points) && a.points.length>=2 && a.points.every(p=>p && typeof p.x==='number' && typeof p.y==='number')) ? a.points : null,
    // Curvatura regolare del pallone-alto (vedi schemaCurveControlPoint): assente sulle
    // frecce non curve e su quelle disegnate a mano libera prima di questa modifica.
    bend: typeof a.bend==='number' ? a.bend : null,
    tipo: ['movimento','passaggio','conduzione','pallone-alto','divisore','campo-linea'].includes(a.tipo) ? a.tipo : 'passaggio',
    color: a.color || SCHEMA_COLORS[0],
    // Numerazione manuale (click destro → Numera), mai automatica: solo le frecce che
    // l'allenatore sceglie esplicitamente di numerare mostrano il badge.
    numero: a.numero!=null ? a.numero : null,
    guida: a.guida===true,
  }));
  d.zones = d.zones.map(z=>({
    id: z.id || uid(),
    x: typeof z.x==='number' ? z.x : 0,
    y: typeof z.y==='number' ? z.y : 0,
    w: typeof z.w==='number' && z.w>0 ? z.w : 5,
    h: typeof z.h==='number' && z.h>0 ? z.h : 5,
    color: z.color || SCHEMA_COLORS[0],
    // "pieno" = tinta colorata (tattico), "contorno" = solo bordo bianco/neutro, per
    // disegnare marcature reali del campo come l'area di rigore.
    stile: z.stile==='contorno' ? 'contorno' : 'pieno',
    guida: z.guida===true,
    // Forma del bounding box x/y/w/h: 'rect' (default, disegno manuale) o 'cerchio' (solo dai
    // layout preimpostati, per il cerchio di centrocampo — vedi SCHEMA_FIELD_PRESETS).
    shape: z.shape==='cerchio' ? 'cerchio' : 'rect',
  }));
  return d;
}
function schemaColorMarkerId(color){
  const idx = SCHEMA_COLORS.indexOf(color);
  return 'schema-arrowhead-'+(idx>=0?idx:0);
}
function schemaFieldDefsSVG(){
  // Punta a "freccia" con incavo posteriore invece del triangolo pieno: più elegante e
  // riconoscibile come freccia vera, non solo un cuneo.
  const markers = SCHEMA_COLORS.map((c,i)=>
    '<marker id="schema-arrowhead-'+i+'" markerWidth="3.4" markerHeight="3.4" refX="2.76" refY="1.7" orient="auto"><path d="M0,0 L3.4,1.7 L0,3.4 L0.96,1.7 Z" fill="'+c+'"/></marker>'
  ).join('');
  return '<defs>'+markers+'</defs>';
}
// Pallone disegnato geometricamente (nessuna icona di terze parti): cerchio bianco,
// pentagono nero centrale, cinque tasselli scuri lungo i bordi del pentagono collegati
// da cuciture — il pattern pentagono/tassello si riconosce come vero pallone anche in
// miniatura, a differenza di un singolo pentagono isolato.
function schemaBallSVG(r, w){
  // Solo bianco, nessun pattern a pentagoni: un cerchio bianco con un sottile bordo
  // scuro per restare visibile su qualunque sfondo (verde in editor, bianco in stampa).
  return '<circle r="'+r+'" fill="#F4F1EA" stroke="#0B141C" stroke-width="'+(w*0.006)+'"/>';
}
// Le porte sono sempre bianche/neutre (non seguono la palette colori): un colore
// realistico e coerente indipendentemente da chi le piazza. "big" distingue porta
// regolare da portina (mini-porta); rot (gradi) permette di orientarle sul campo.
function schemaGoalSVG(c, w, printMode){
  const big = c.tipo==='porta';
  const gw = big ? w*0.16 : w*0.09;
  const gh = big ? w*0.075 : w*0.045;
  const rot = c.rot || 0;
  const cols = big ? 6 : 4, rowsN = big ? 3 : 2;
  // La rete e il bordo bianco si vedono solo sul verde: in stampa (sfondo bianco) usiamo
  // un grigio scuro, altrimenti sarebbero invisibili su sfondo bianco.
  const netColor = printMode ? '#555' : '#F4F1EA';
  let net = '';
  for(let i=1;i<cols;i++){
    const nx = -gw/2 + (gw/cols)*i;
    net += '<line x1="'+nx.toFixed(2)+'" y1="'+(-gh/2).toFixed(2)+'" x2="'+nx.toFixed(2)+'" y2="'+(gh/2).toFixed(2)+'" stroke="'+netColor+'" stroke-width="'+(w*0.0015)+'" opacity="0.6"/>';
  }
  for(let j=1;j<rowsN;j++){
    const ny = -gh/2 + (gh/rowsN)*j;
    net += '<line x1="'+(-gw/2).toFixed(2)+'" y1="'+ny.toFixed(2)+'" x2="'+(gw/2).toFixed(2)+'" y2="'+ny.toFixed(2)+'" stroke="'+netColor+'" stroke-width="'+(w*0.0015)+'" opacity="0.6"/>';
  }
  const rectAttrs = 'x="'+(-gw/2)+'" y="'+(-gh/2)+'" width="'+gw+'" height="'+gh+'"';
  return '<g class="schema-chip" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+') rotate('+rot+')">' +
    '<rect '+rectAttrs+' fill="rgba(11,20,28,0.16)" stroke="#0B141C" stroke-width="'+(w*0.009)+'"/>' +
    net +
    '<rect '+rectAttrs+' fill="none" stroke="'+netColor+'" stroke-width="'+(w*0.005)+'"/>' +
    (c.label ? '<text text-anchor="middle" dy="'+(gh/2+w*0.032)+'" font-size="'+(w*0.026)+'" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="'+(w*0.01)+'">'+esc(c.label)+'</text>' : '') +
  '</g>';
}
function schemaConeSVG(c, w){
  const sz = c.size||1;
  const s = w*0.035*sz;
  return '<g class="schema-chip" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+')">' +
    '<path d="M0,'+(-s)+' L'+(s*0.75)+','+(s*0.8)+' L'+(-s*0.75)+','+(s*0.8)+' Z" fill="'+c.color+'" stroke="#0B141C" stroke-width="'+(w*0.003*sz)+'"/>' +
    '<rect x="'+(-s*0.95)+'" y="'+(s*0.7)+'" width="'+(s*1.9)+'" height="'+(s*0.28)+'" rx="'+(s*0.08)+'" fill="'+c.color+'" stroke="#0B141C" stroke-width="'+(w*0.003*sz)+'"/>' +
    (c.label ? '<text text-anchor="middle" dy="'+(s*1.4)+'" font-size="'+(w*0.026*sz)+'" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="'+(w*0.01)+'">'+esc(c.label)+'</text>' : '') +
  '</g>';
}
// Paletto da allenamento (asta verticale con base): vista di prospetto, non dall'alto come
// gli altri elementi campo, perché è così che si riconosce a colpo d'occhio.
function schemaPaletSVG(c, w){
  const sz = c.size||1;
  const h = w*0.07*sz, baseR = w*0.012*sz;
  return '<g class="schema-chip" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+')">' +
    '<line x1="0" y1="'+(baseR*0.6)+'" x2="0" y2="'+(-h)+'" stroke="'+c.color+'" stroke-width="'+(w*0.006*sz)+'" stroke-linecap="round"/>' +
    '<ellipse cx="0" cy="'+(baseR*0.6)+'" rx="'+(baseR*1.6)+'" ry="'+baseR+'" fill="'+c.color+'" stroke="#0B141C" stroke-width="'+(w*0.003)+'"/>' +
    (c.label ? '<text text-anchor="middle" dy="'+(baseR*2.4)+'" font-size="'+(w*0.026*sz)+'" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="'+(w*0.01)+'">'+esc(c.label)+'</text>' : '') +
  '</g>';
}
// Cinesino (disco piatto da terra, "saucer cone"): un'ellisse piatta vista dall'alto,
// distinta a colpo d'occhio dal cono (che invece si vede di prospetto).
function schemaCinesinoSVG(c, w){
  const sz = c.size||1;
  const rx = w*0.026*sz, ry = rx*0.5;
  return '<g class="schema-chip" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+')">' +
    '<ellipse rx="'+rx+'" ry="'+ry+'" fill="'+c.color+'" stroke="#0B141C" stroke-width="'+(w*0.004*sz)+'"/>' +
    (c.label ? '<text text-anchor="middle" dy="'+(ry+w*0.03)+'" font-size="'+(w*0.026*sz)+'" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="'+(w*0.01)+'">'+esc(c.label)+'</text>' : '') +
  '</g>';
}
// Testo libero disegnabile sul campo (didascalie, istruzioni): niente forma di sfondo,
// solo il testo colorato con un contorno scuro per restare leggibile su qualunque sfondo,
// stesso trattamento delle altre etichette del disegnatore. "size" scala il font-size
// insieme alla larghezza campo (w), cosi il testo resta proporzionato se il campo cambia.
function schemaTextChipSVG(c, w){
  const fontSize = w*0.045*(c.size||1);
  // "Sottile" (toggle dal menu contestuale) riduce sia il peso del font sia il contorno di
  // contrasto: usare solo font-weight più basso non bastava, il contorno spesso lo faceva
  // sembrare comunque grassetto.
  const fontWeight = c.sottile ? 300 : 600;
  const strokeW = w*(c.sottile ? 0.008 : 0.012);
  return '<g class="schema-chip" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+')">' +
    '<text text-anchor="middle" dominant-baseline="central" font-size="'+fontSize+'" fill="'+c.color+'" font-family="Inter, sans-serif" font-weight="'+fontWeight+'" paint-order="stroke" stroke="#0B141C" stroke-width="'+strokeW+'" stroke-linejoin="round">'+esc(c.label||'Testo')+'</text>' +
  '</g>';
}
// I segni generati dai preset di layout (porta/area/cerchio, guida:true) devono comportarsi
// come uno sfondo: visibili ma non interattivi — niente drag, niente click destro, esclusi
// dal lazo (vedi il filtro guida nel gestore del lazo). "schema-el-guida" li marca con
// pointer-events:none via CSS, cosi non serve toccare ogni singolo gestore di interazione.
function schemaChipSVG(c, w, printMode){
  const svg = schemaChipSVGByType(c, w, printMode);
  return c.guida ? svg.replace('class="schema-chip"', 'class="schema-chip schema-el-guida"') : svg;
}
function schemaChipSVGByType(c, w, printMode){
  if(c.tipo==='pallone'){
    // Meno della metà del raggio giocatore, cosi si distingue subito dai chip persona.
    return '<g class="schema-chip" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+')">' + schemaBallSVG(w*0.013, w) + '</g>';
  }
  if(c.tipo==='porta' || c.tipo==='portina') return schemaGoalSVG(c, w, printMode);
  if(c.tipo==='cono') return schemaConeSVG(c, w);
  if(c.tipo==='paletto') return schemaPaletSVG(c, w);
  if(c.tipo==='cinesino') return schemaCinesinoSVG(c, w);
  if(c.tipo==='testo') return schemaTextChipSVG(c, w);
  // Raggio/bordo leggermente più generosi e font Inter SemiBold per il numero, invece
  // dell'Oswald condensato usato altrove: più leggibili e coerenti con la nuova identità.
  // "size" (menu contestuale A-/A+) scala l'intero chip in proporzione, numero/etichetta
  // inclusi, cosi restano leggibili a qualunque dimensione invece di restare fissi mentre
  // il cerchio cambia.
  const sz = c.size||1;
  const r = w*0.036*sz;
  const numeroLabel = c.numero!=null ? String(c.numero) : (c.label ? c.label.charAt(0).toUpperCase() : '');
  // Il portiere ha una forma distinta (quadrato arrotondato) invece del cerchio, cosi si
  // riconosce a colpo d'occhio senza dover leggere il numero.
  const shape = c.ruolo==='portiere'
    ? '<rect x="'+(-r)+'" y="'+(-r)+'" width="'+(r*2)+'" height="'+(r*2)+'" rx="'+(r*0.3)+'" fill="'+c.color+'" stroke="#0B141C" stroke-width="'+(w*0.006*sz)+'"/>'
    : '<circle r="'+r+'" fill="'+c.color+'" stroke="#0B141C" stroke-width="'+(w*0.006*sz)+'"/>';
  return '<g class="schema-chip" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+')">' +
    shape +
    (numeroLabel ? '<text text-anchor="middle" dy="'+(w*0.014*sz)+'" font-size="'+(w*0.038*sz)+'" fill="#0B141C" font-family="Inter, sans-serif" font-weight="600">'+esc(numeroLabel)+'</text>' : '') +
    (c.label ? '<text text-anchor="middle" dy="'+(w*0.078*sz)+'" font-size="'+(w*0.028*sz)+'" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="'+(w*0.012*sz)+'">'+esc(c.label)+'</text>' : '') +
  '</g>';
}
function schemaZoneSVG(z, printMode){
  const isCircle = z.shape==='cerchio';
  const geomAttrs = isCircle
    ? 'cx="'+(z.x+z.w/2)+'" cy="'+(z.y+z.h/2)+'" rx="'+(z.w/2)+'" ry="'+(z.h/2)+'"'
    : 'x="'+z.x+'" y="'+z.y+'" width="'+z.w+'" height="'+z.h+'"';
  const tag = isCircle ? 'ellipse' : 'rect';
  const cls = 'schema-zone'+(z.guida ? ' schema-el-guida' : '');
  if(z.stile==='contorno'){
    // Solo bordo, nessuna tinta: per marcature reali del campo (area di rigore, area
    // piccola, cerchio di centrocampo...) invece che zone tattiche colorate. Bianco
    // traslucido sul campo tecnico scuro, grigio in stampa.
    const color = printMode ? '#555' : 'rgba(255,255,255,0.18)';
    return '<'+tag+' class="'+cls+'" data-id="'+z.id+'" '+geomAttrs+' fill="none" stroke="'+color+'" stroke-width="0.2"/>';
  }
  return '<'+tag+' class="'+cls+'" data-id="'+z.id+'" '+geomAttrs+' fill="'+z.color+'" fill-opacity="0.22" stroke="'+z.color+'" stroke-width="0.15" stroke-dasharray="0.4,0.3"/>';
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
// Punto di controllo di una quadratica dati i due estremi e uno scostamento perpendicolare
// con segno ("bend"): a t=0.5 la curva si scosta dalla corda di metà dell'offset del punto
// di controllo, quindi qui l'offset è 2×bend per far coincidere lo scostamento massimo
// della curva con "bend".
function schemaCurveControlPoint(x1,y1,x2,y2,bend){
  const dx=x2-x1, dy=y2-y1;
  const len=Math.hypot(dx,dy)||1;
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  const px=-dy/len, py=dx/len;
  return { x: mx+px*bend*2, y: my+py*bend*2 };
}
// Punto sulla curva quadratica a t=0.5 (formula di Bézier), NON il punto di controllo:
// per una quadratica il punto di controllo è due volte più lontano dalla corda del punto
// reale a metà curva, quindi usarlo come "mid" (bug corretto qui) piazzava il numero
// visibilmente staccato dalla linea invece che sopra di essa.
function schemaQuadraticMidpoint(x1,y1,cx,cy,x2,y2){
  return { x: 0.25*x1 + 0.5*cx + 0.25*x2, y: 0.25*y1 + 0.5*cy + 0.25*y2 };
}
// Linea ondulata per la conduzione (palla al piede): convenzione classica della lavagna
// tattica, a differenza della linea dritta di movimento/passaggio. Onda procedurale fra i
// due estremi (non a mano libera come il pallone alto): tante "S" quante ne stanno nella
// lunghezza della freccia (una ogni ~2m), cosi resta un'onda regolare qualunque sia la
// distanza, e si ridisegna da sola quando si trascina un estremo.
function schemaConduzionePath(x1,y1,x2,y2){
  const dx=x2-x1, dy=y2-y1;
  const len=Math.hypot(dx,dy)||1;
  const ux=dx/len, uy=dy/len, px=-uy, py=ux;
  const halfWave = 2, amp = 0.6;
  const segments = Math.max(2, Math.round(len/halfWave));
  const segLen = len/segments;
  let d = 'M'+x1+','+y1;
  for(let i=0;i<segments;i++){
    const sign = (i%2===0) ? 1 : -1;
    const midDist = segLen*(i+0.5);
    const midX = x1+ux*midDist+px*amp*sign, midY = y1+uy*midDist+py*amp*sign;
    const endDist = segLen*(i+1);
    const endX = x1+ux*endDist, endY = y1+uy*endDist;
    d += ' Q'+midX+','+midY+' '+endX+','+endY;
  }
  return d;
}
function schemaArrowGeometry(a){
  // La freccia "pallone alto" è una quadratica regolare: "bend" (uno scostamento
  // perpendicolare con segno, misurato una volta al rilascio del disegno a mano libera)
  // ne fissa la curvatura, così la forma resta pulita e si adatta da sola quando si
  // trascina un estremo. "points" (tracciato fedele a mano libera) resta letto solo per
  // compatibilità con frecce disegnate prima di questa modifica. "mid" è il punto usato
  // per posizionare il badge numerato della sequenza — deve stare SULLA curva, non sul
  // punto di controllo che la definisce.
  if(a.tipo==='pallone-alto'){
    if(a.bend!=null){
      const c = schemaCurveControlPoint(a.x1,a.y1,a.x2,a.y2,a.bend);
      return { tag:'path', d: 'M'+a.x1+','+a.y1+' Q'+c.x+','+c.y+' '+a.x2+','+a.y2, mid: schemaQuadraticMidpoint(a.x1,a.y1,c.x,c.y,a.x2,a.y2) };
    }
    if(a.points){
      const mid = a.points[Math.floor(a.points.length/2)];
      return { tag:'path', d: smoothPathFromPoints(a.points), mid };
    }
    const mx=(a.x1+a.x2)/2, my=(a.y1+a.y2)/2;
    const dx=a.x2-a.x1, dy=a.y2-a.y1;
    const len=Math.hypot(dx,dy)||1;
    const offset = len*0.25;
    const cx = mx - (dy/len)*offset, cy = my + (dx/len)*offset;
    return { tag:'path', d: 'M'+a.x1+','+a.y1+' Q'+cx+','+cy+' '+a.x2+','+a.y2, mid: schemaQuadraticMidpoint(a.x1,a.y1,cx,cy,a.x2,a.y2) };
  }
  if(a.tipo==='conduzione'){
    return { tag:'path', d: schemaConduzionePath(a.x1,a.y1,a.x2,a.y2), mid: {x:(a.x1+a.x2)/2, y:(a.y1+a.y2)/2} };
  }
  return { tag:'line', x1:a.x1, y1:a.y1, x2:a.x2, y2:a.y2, mid:{x:(a.x1+a.x2)/2, y:(a.y1+a.y2)/2} };
}
// Coppia fill/contorno per il numero di sequenza sulle frecce, scelta in base alla
// luminosità del colore della freccia: testo bianco con contorno scuro sui colori più
// scuri/saturi, testo scuro con contorno chiaro su quelli quasi bianchi (es. Neutro) —
// cosi resta leggibile qualunque sia il colore scelto, senza bisogno di un pallino di
// sfondo che lo garantisca a prescindere.
function schemaContrastPair(hex){
  const h = (hex||'#000000').replace('#','');
  const r = parseInt(h.substring(0,2),16)||0, g = parseInt(h.substring(2,4),16)||0, b = parseInt(h.substring(4,6),16)||0;
  const luminance = 0.299*r + 0.587*g + 0.114*b;
  return luminance > 170 ? { fill:'#0B141C', stroke:'#FFFFFF' } : { fill:'#FFFFFF', stroke:'#0B141C' };
}
function schemaArrowGroupSVG(a, w, numero, printMode){
  const strokeW = w*0.0035;
  const geo = schemaArrowGeometry(a);
  const shapeAttrs = geo.tag==='path' ? 'd="'+geo.d+'"' : 'x1="'+geo.x1+'" y1="'+geo.y1+'" x2="'+geo.x2+'" y2="'+geo.y2+'"';
  let visible;
  const neutralColor = printMode ? '#555' : 'rgba(255,255,255,0.18)';
  if(a.tipo==='divisore'){
    // Bianco traslucido sul campo tecnico scuro dell'editor, grigio scuro in stampa
    // (sfondo bianco): altrimenti invisibile.
    visible = '<'+geo.tag+' '+shapeAttrs+' fill="none" stroke="'+neutralColor+'" stroke-width="'+strokeW+'" stroke-dasharray="'+(w*0.006)+','+(w*0.012)+'" opacity="0.65"/>';
  } else if(a.tipo==='campo-linea'){
    // Riga del campo (es. limite area), continua e senza freccia — non è
    // un'indicazione tattica ma una marcatura reale del terreno: resta sottile e neutra,
    // a differenza delle frecce tattiche che devono essere il punto focale del disegno.
    visible = '<'+geo.tag+' '+shapeAttrs+' fill="none" stroke="'+neutralColor+'" stroke-width="'+strokeW+'"/>';
  } else {
    // Le frecce tattiche sono il punto focale del disegno: colori brillanti (palette
    // utente), spessore leggermente maggiore delle righe campo, estremi arrotondati per
    // una linea più morbida.
    const markerId = schemaColorMarkerId(a.color);
    const dash = a.tipo==='movimento' ? ' stroke-dasharray="'+(w*0.02)+','+(w*0.014)+'"' : '';
    visible = '<'+geo.tag+' '+shapeAttrs+' fill="none" stroke="'+a.color+'" stroke-width="'+(strokeW*1.2)+'" stroke-linecap="round"'+dash+' marker-end="url(#'+markerId+')"/>';
  }
  const hit = '<'+geo.tag+' '+shapeAttrs+' fill="none" stroke="transparent" stroke-width="'+(w*0.035)+'"/>';
  // Badge numerato SOLO se l'allenatore l'ha impostato da menu contestuale (click destro →
  // Numera): nessuna numerazione automatica. pointer-events:none per non intercettare i
  // click della gomma, che deve colpire il tratto sottostante. Solo il numero, senza
  // pallino di sfondo: il doppio contorno (chiaro/scuro a seconda del colore della freccia,
  // vedi schemaContrastPair) basta da solo a garantire il contrasto su qualunque sfondo.
  const badgeColors = numero!=null ? schemaContrastPair(a.color) : null;
  const badge = numero!=null ? '<g transform="translate('+geo.mid.x+','+geo.mid.y+')" pointer-events="none">' +
    '<text text-anchor="middle" dominant-baseline="central" font-size="'+(w*0.032)+'" font-family="Inter, sans-serif" font-weight="700" ' +
      'fill="'+badgeColors.fill+'" paint-order="stroke" stroke="'+badgeColors.stroke+'" stroke-width="'+(w*0.009)+'" stroke-linejoin="round">'+numero+'</text>' +
  '</g>' : '';
  // Maniglie ai due estremi: permettono di trascinare partenza o punta singolarmente
  // (mantenendo fermo l'altro estremo) invece di dover cancellare e ridisegnare. Solo
  // nell'editor interattivo, mai in stampa/anteprima, mai sulle linee-guida generate da un
  // preset di layout (non c'è nulla da trascinare su un elemento che si comporta da sfondo).
  const handleColor = (a.tipo==='divisore' || a.tipo==='campo-linea') ? neutralColor : a.color;
  const handles = (printMode || a.guida) ? '' :
    '<circle class="schema-arrow-handle" data-end="1" cx="'+a.x1+'" cy="'+a.y1+'" r="'+(w*0.014)+'" fill="'+handleColor+'" stroke="#0B141C" stroke-width="'+(w*0.003)+'"/>' +
    '<circle class="schema-arrow-handle" data-end="2" cx="'+a.x2+'" cy="'+a.y2+'" r="'+(w*0.014)+'" fill="'+handleColor+'" stroke="#0B141C" stroke-width="'+(w*0.003)+'"/>';
  const arrowCls = 'schema-arrow'+(a.guida ? ' schema-el-guida' : '');
  return '<g class="'+arrowCls+'" data-id="'+a.id+'"'+(numero!=null?' data-numero="'+numero+'"':'')+'>'+visible+hit+badge+handles+'</g>';
}
function renderSchemaFieldSVG(livello, withId, printMode){
  const data = parseSchemaCampo(livello);
  const w = livello.larghezzaCampo || 20, h = livello.lunghezzaCampo || 28;
  const zonesSvg = data.zones.map(z=>schemaZoneSVG(z, printMode)).join('');
  const chipsSvg = data.chips.map(c=>schemaChipSVG(c,w,printMode)).join('');
  const arrowsSvg = data.arrows.map(a=>schemaArrowGroupSVG(a, w, a.numero, printMode)).join('');
  const idAttr = withId===false ? '' : ' id="schema-field-svg"';
  const thumbClass = withId===false ? ' schema-field-svg-thumb' : '';
  // Sfondo bianco/grigio in stampa (anteprima/esportazione seduta) per risparmiare
  // inchiostro; campo tecnico scuro (non verde) nell'editor/libreria live — a differenza
  // di Piano Squadra/Formazione/Convocazioni, qui il campo è solo un supporto grafico per
  // il disegno tattico, non lo spazio di lavoro reale, quindi non deve competere visivamente
  // con il resto dell'interfaccia dark.
  const bgFill = printMode ? '#FFFFFF' : '#1F1F1F';
  const bgStroke = printMode ? '#888' : 'rgba(255,255,255,0.18)';
  return '<svg'+idAttr+' viewBox="0 0 '+w+' '+h+'" class="pitch-svg schema-field-svg'+thumbClass+'">' +
    schemaFieldDefsSVG() +
    '<rect x="0" y="0" width="'+w+'" height="'+h+'" fill="'+bgFill+'" stroke="'+bgStroke+'" stroke-width="'+(w*0.005)+'"/>' +
    '<g class="zones-layer">'+zonesSvg+'</g>' +
    '<g class="arrows-layer">'+arrowsSvg+'</g>' +
    '<g class="chips-layer">'+chipsSvg+'</g>' +
  '</svg>';
}
function showSchemaGuidaModal(){
  const box = document.getElementById('event-modal-box');
  box.innerHTML =
    '<h3>Guida rapida disegnatore</h3>' +
    '<p>Trascina per spostare qualsiasi elemento, comprese le linee. Click destro per rinominare/numerare/segnare come portiere/cambiare colore (sulle porte: ruotarle; sulle zone: stile pieno/contorno; sulle linee: numerare o cambiare colore; su giocatore e testo: cambiare dimensione A-/A+, l\'ultima scelta resta di default per i prossimi giocatori piazzati; sul testo anche sottile/grassetto). Con giocatore/pallone/porta/portina/cono/testo attivo, clicca sul campo per posizionarlo (il testo chiede subito cosa scrivere); con la zona attiva, trascina da un angolo all\'altro; con un tipo di linea attivo, disegna sul campo — "Riga bianca del campo" per marcature reali come l\'area di rigore; con la gomma attiva, clicca un elemento per eliminarlo. "Layout" imposta la base del campo e i suoi segni (porta/area/cerchio, metà campo/campo intero/libero) senza eliminare giocatori e disegni già aggiunti; "Indietro/Avanti" annulla o ripete le ultime modifiche al disegno di questo livello.</p>' +
    '<div class="modal-actions"><button type="button" class="btn btn-primary" onclick="closeEventModal()">Ho capito</button></div>';
  document.getElementById('event-modal-overlay').style.display = 'flex';
}
// Paletta estesa in un pannello interno all'app (stesso linguaggio grafico di card/menu
// contestuali), non il color picker nativo del sistema operativo.
function schemaColorPickerPanelHTML(){
  const s = state.schema;
  const swatches = SCHEMA_EXTENDED_COLORS.map(c=>
    '<button type="button" class="schema-color-swatch'+(s.activeColor===c?' schema-color-swatch-active':'')+'" style="background:'+c+';" onclick="setSchemaActiveColor(\''+c+'\')" title="'+c+'"></button>'
  ).join('');
  return '<div class="schema-color-picker-panel"><div class="schema-color-picker-grid">'+swatches+'</div></div>';
}
function schemaToolGroupHTML(buttonsHtml){
  return '<div class="schema-tool-group">'+buttonsHtml+'</div>';
}
function schemaToolBtn(active, onclick, title, icon){
  return '<button type="button" class="schema-tool-btn'+(active?' schema-tool-btn-active':'')+'" onclick="'+onclick+'" title="'+title+'">'+icon+'</button>';
}
function schemaToolbarHTML(livello){
  const s = state.schema;
  const colorSwatches = SCHEMA_COLORS.map(c=>
    '<button type="button" class="schema-color-swatch '+(s.activeColor===c?'schema-color-swatch-active':'')+'" style="background:'+c+';" onclick="setSchemaActiveColor(\''+c+'\')" title="'+(SCHEMA_COLOR_LABELS[c]||'Colore')+'"></button>'
  ).join('');
  const lineTypes = [
    ['movimento', SCHEMA_ICON_MOVIMENTO, 'Movimento'],
    ['passaggio', SCHEMA_ICON_PASSAGGIO, 'Passaggio / tiro'],
    ['conduzione', SCHEMA_ICON_CONDUZIONE, 'Conduzione (palla al piede)'],
    ['pallone-alto', SCHEMA_ICON_PALLONE_ALTO, 'Pallone alto (disegna la curva)'],
    ['divisore', SCHEMA_ICON_DIVISORE, 'Divisore spazi'],
    ['campo-linea', SCHEMA_ICON_RIGACAMPO, 'Riga bianca del campo'],
  ];
  const lineButtons = lineTypes.map(([key,icon,title])=>
    schemaToolBtn(s.drawMode && s.activeLineType===key, "setSchemaLineTypeAndDraw('"+key+"')", title, icon)
  ).join('');
  const currentFieldPreset = schemaCurrentFieldPreset(livello);
  const layoutGroup = schemaToolGroupHTML(
    '<span class="hint schema-toolbar-label">Layout</span>' +
    ['metaAlto','metaBasso','intero','libero'].map(key=>
      '<button type="button" class="btn btn-small'+(currentFieldPreset===key?' btn-active':'')+'" onclick="applySchemaFieldPreset(\''+key+'\')" title="Imposta la base del campo e i segni (porta/area/cerchio) di questo layout, senza toccare giocatori e disegni già aggiunti">'+SCHEMA_FIELD_PRESET_LABELS[key]+'</button>'
    ).join('')
  );
  // Con "Metà campo"/"Campo intero" le misure sono fisse (coerenti con righe/aree del
  // preset): gli input restano disabilitati finché non si passa a "Libero".
  const campoDimsEditable = currentFieldPreset==='libero';
  const campoDimsTitle = campoDimsEditable ? '' : ' title="Fissata dal layout \''+SCHEMA_FIELD_PRESET_LABELS[currentFieldPreset]+'\' — scegli \'Libero\' per personalizzarla"';
  const campoGroup = schemaToolGroupHTML(
    '<span class="hint schema-toolbar-label">Campo (m)</span>' +
    '<input id="schema-ex-larghezza" type="number" step="1" min="1" value="'+Math.round(livello.larghezzaCampo)+'" '+(campoDimsEditable?'onchange="onSchemaFieldSizeOverride()"':'disabled')+' class="schema-dim-input schema-property-input"'+campoDimsTitle+'>' +
    '<span class="hint">×</span>' +
    '<input id="schema-ex-lunghezza" type="number" step="1" min="1" value="'+Math.round(livello.lunghezzaCampo)+'" '+(campoDimsEditable?'onchange="onSchemaFieldSizeOverride()"':'disabled')+' class="schema-dim-input schema-property-input"'+campoDimsTitle+'>'
  );
  const giocatoriGroup = schemaToolGroupHTML(
    schemaToolBtn(s.placeMode==='giocatore', "setSchemaPlaceMode('giocatore')", 'Aggiungi giocatore', SCHEMA_ICON_GIOCATORE) +
    schemaToolBtn(s.placeMode==='pallone', "setSchemaPlaceMode('pallone')", 'Aggiungi pallone', SCHEMA_ICON_PALLONE)
  );
  const oggettiGroup = schemaToolGroupHTML(
    schemaToolBtn(s.placeMode==='porta', "setSchemaPlaceMode('porta')", 'Aggiungi porta grande', SCHEMA_ICON_PORTA) +
    schemaToolBtn(s.placeMode==='portina', "setSchemaPlaceMode('portina')", 'Aggiungi portina', SCHEMA_ICON_PORTINA) +
    schemaToolBtn(s.placeMode==='cono', "setSchemaPlaceMode('cono')", 'Aggiungi cono', SCHEMA_ICON_CONO) +
    schemaToolBtn(s.placeMode==='paletto', "setSchemaPlaceMode('paletto')", 'Aggiungi paletto', SCHEMA_ICON_PALETTO) +
    schemaToolBtn(s.placeMode==='cinesino', "setSchemaPlaceMode('cinesino')", 'Aggiungi cinesino', SCHEMA_ICON_CINESINO) +
    schemaToolBtn(s.placeMode==='zona', "setSchemaPlaceMode('zona')", "Disegna una zona: trascina da un angolo all'altro", SCHEMA_ICON_ZONA) +
    schemaToolBtn(s.placeMode==='testo', "setSchemaPlaceMode('testo')", 'Aggiungi testo', SCHEMA_ICON_TESTO)
  );
  const lineeGroup = schemaToolGroupHTML(lineButtons);
  const cancellaGroup = schemaToolGroupHTML(
    schemaToolBtn(s.eraserMode, 'setSchemaEraserMode()', 'Gomma: clicca un elemento per eliminarlo', SCHEMA_ICON_GOMMA) +
    ((s.drawMode || s.placeMode || s.eraserMode) ? '<button class="btn btn-small" onclick="stopSchemaDrawing()">Termina</button>' : '')
  );
  const h = state.schema.drawHistory;
  const historyGroup = schemaToolGroupHTML(
    '<button type="button" class="btn btn-small" onclick="undoSchemaCampo()" '+(h.index<=0?'disabled':'')+' title="Annulla l\'ultima modifica al disegno">↶ Indietro</button>' +
    '<button type="button" class="btn btn-small" onclick="redoSchemaCampo()" '+(h.index>=h.stack.length-1?'disabled':'')+' title="Ripeti la modifica annullata">↷ Avanti</button>'
  );
  const colorGroup =
    '<span class="hint schema-toolbar-label">Colore</span>' + colorSwatches +
    '<span class="schema-color-picker-wrap">' +
      '<button type="button" class="schema-color-swatch schema-color-swatch-custom" onclick="toggleSchemaColorPicker()" title="Altri colori">+</button>' +
      (s.colorPickerOpen ? schemaColorPickerPanelHTML() : '') +
    '</span>';
  // Ordine per frequenza d'uso, non per l'ordine storico dei gruppi: indietro/avanti in
  // cima (si usano in qualunque momento, non legati a uno strumento), poi gli strumenti di
  // disegno attivo con il colore subito accanto (quelli che si toccano in continuazione),
  // poi la gomma (stessa "famiglia" di azioni sul campo), infine Layout e dimensioni campo
  // in fondo perché si impostano una volta sola a inizio esercizio e si ritoccano di rado.
  return '<div class="schema-toolbar schema-toolbar-vertical">' +
    '<div class="schema-toolbar-row">'+historyGroup+'</div>' +
    '<div class="schema-toolbar-row">'+giocatoriGroup+oggettiGroup+'</div>' +
    '<div class="schema-toolbar-row">'+lineeGroup+'</div>' +
    '<div class="schema-toolbar-row schema-toolbar-row-colors">'+colorGroup+'</div>' +
    '<div class="schema-toolbar-row">'+cancellaGroup+'</div>' +
    '<div class="schema-toolbar-row schema-toolbar-row-setup">'+layoutGroup+'</div>' +
    '<div class="schema-toolbar-row schema-toolbar-row-setup">'+campoGroup+'</div>' +
  '</div>';
}
function schemaExerciseTags(e){
  try { const t = JSON.parse((e && e.tags) || '[]'); return Array.isArray(t) ? t : []; }
  catch { return []; }
}
function schemaExerciseCategorie(e){
  try { const c = JSON.parse((e && e.categorie) || '[]'); return Array.isArray(c) ? c : []; }
  catch { return []; }
}
// Formattazione minima delle descrizioni: memorizzata come TESTO SEMPLICE con marcatori
// (**grassetto**, ++più grande++), mai come HTML — cosi non c'è alcun rischio che un
// input dell'utente venga interpretato come markup arbitrario quando lo mostriamo con
// innerHTML nell'anteprima/stampa. Si esegue esc() PRIMA di sostituire i marcatori con i
// tag, quindi solo i tag che genero io possono comparire nell'output.
function schemaRichTextToHTML(text){
  if(!text) return '';
  let out = esc(text);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\+\+(.+?)\+\+/g, '<span class="rt-big">$1</span>');
  out = out.replace(/\n/g, '<br>');
  return out;
}
// Click destro con del testo selezionato in una textarea "schema-rich-text" (le
// descrizioni esercizio/livello): invece del menu nativo del browser, propone di avvolgere
// la selezione con i marcatori sopra.
function showSchemaRichTextMenu(evt, el){
  const start = el.selectionStart, end = el.selectionEnd;
  const menu = document.getElementById('player-context-menu');
  menu.innerHTML =
    '<div class="context-menu-item" onclick="applySchemaRichTextMark(\''+el.id+'\','+start+','+end+',\'**\'); hideContextMenu();">Grassetto</div>' +
    '<div class="context-menu-item" onclick="applySchemaRichTextMark(\''+el.id+'\','+start+','+end+',\'++\'); hideContextMenu();">Più grande</div>';
  const x = Math.min(evt.clientX, window.innerWidth-190);
  const y = Math.min(evt.clientY, window.innerHeight-220);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
function applySchemaRichTextMark(textareaId, start, end, token){
  const el = document.getElementById(textareaId);
  if(!el) return;
  const value = el.value;
  el.value = value.slice(0,start) + token + value.slice(start,end) + token + value.slice(end);
  el.dispatchEvent(new Event('change', { bubbles:true }));
  autosizeTextarea(el);
  el.focus();
  el.setSelectionRange(start, end + token.length*2);
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
// Le etichette non sono un'entità a sé, solo stringhe dentro Exercise.tags: rinominare o
// eliminare un'etichetta dal filtro libreria (click destro su un chip) agisce su TUTTI gli
// esercizi dell'account che la usano, non solo su quello aperto — vedi PATCH /api/schema/tags.
function showSchemaTagContextMenu(evt, tag){
  evt.preventDefault();
  evt.stopPropagation();
  const menu = document.getElementById('player-context-menu');
  menu.innerHTML =
    '<div class="context-menu-item" onclick="renameSchemaTagGlobal(\''+esc(tag).replace(/'/g,"\\'")+'\'); hideContextMenu();">Rinomina</div>' +
    '<div class="context-menu-item" onclick="deleteSchemaTagGlobal(\''+esc(tag).replace(/'/g,"\\'")+'\'); hideContextMenu();" style="color:var(--danger);">Elimina</div>';
  const x = Math.min(evt.clientX, window.innerWidth-190);
  const y = Math.min(evt.clientY, window.innerHeight-90);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
async function renameSchemaTagGlobal(tag){
  const nome = prompt('Nuovo nome per il focus "'+tag+'" (verrà rinominato su tutti gli esercizi che lo usano):', tag);
  if(nome===null) return;
  const trimmed = nome.trim();
  if(!trimmed || trimmed===tag) return;
  const res = await apiPatch('/api/schema/tags', { from: tag, to: trimmed });
  if(res.ok){
    state.schema.filterTags = state.schema.filterTags.map(t=>t===tag?trimmed:t);
    await ensureSchemaTags();
    await loadSchemaLibrary();
    renderView();
  }
}
function deleteSchemaTagGlobal(tag){
  showConfirmModal('Eliminare il focus "'+tag+'" da tutti gli esercizi che lo usano? Non è annullabile.', async function(){
    const res = await apiPatch('/api/schema/tags', { from: tag, to: '' });
    if(res.ok){
      state.schema.filterTags = state.schema.filterTags.filter(t=>t!==tag);
      await ensureSchemaTags();
      await loadSchemaLibrary();
      renderView();
    }
  });
}
function renderSchemaExerciseSheet(){
  const e = state.schema.currentExercise;
  if(!e){ return schemaSubNavHTML('library') + '<div class="card"><p class="hint">Esercizio non trovato.</p></div>'; }
  // Senza edit_esercizi la scheda è sola lettura per davvero: input disabilitati, pulsanti di
  // modifica non renderizzati, disegnatore non interattivo — non solo "il salvataggio fallirà
  // silenziosamente col 403", l'utente deve vedere subito che non può toccare nulla.
  const canEdit = can('edit_esercizi');
  const livello = schemaActiveLivello();
  const noteRecente = e.note[0];
  const altreNote = e.note.slice(1);
  const currentTags = schemaExerciseTags(e);
  const tagChipsHtml = currentTags.map(t=>
    '<span class="schema-tag-chip'+(canEdit?' schema-tag-chip-removable':'')+'">'+esc(t)+(canEdit ? ' <button type="button" onclick="removeSchemaTag(\''+esc(t).replace(/'/g,"\\'")+'\')" aria-label="Rimuovi">×</button>' : '')+'</span>'
  ).join('');
  const tagDatalist = '<datalist id="schema-tag-suggestions">' + state.schema.availableTags.map(t=>'<option value="'+esc(t)+'">').join('') + '</datalist>';
  const livelloTabsHtml = e.livelli.map(l=>
    '<button class="btn btn-small '+(l.id===livello.id?'btn-active':'')+'" onclick="switchSchemaLivello(\''+l.id+'\')" '+(canEdit ? 'oncontextmenu="showSchemaLivelloContextMenu(event,\''+l.id+'\')" title="Clic destro per rinominare"' : '')+'>'+esc(schemaLivelloLabel(l))+'</button>'
  ).join('') + (canEdit ? '<button class="btn btn-small" onclick="addSchemaLivello()">+ Livello vuoto</button>' +
    '<button class="btn btn-small" onclick="duplicateSchemaLivello()" title="Crea un nuovo livello partendo dal disegno e dai dati del livello '+esc(schemaLivelloLabel(livello))+'">Duplica livello '+esc(schemaLivelloLabel(livello))+' →</button>' : '');
  return schemaSubNavHTML('library') +
    '<div class="card">' +
      '<div class="card-header-row"><h2 class="content-title">'+esc(livello.titolo)+'</h2>' +
        '<div class="pitch-actions"><button class="btn btn-small" onclick="openSchemaLibrary()">← Libreria</button>'+(canEdit ? '<button class="btn btn-small btn-danger" onclick="confirmDeleteSchemaExercise()">Elimina</button>' : '')+'</div>' +
      '</div>' +
      '<div class="field field-grow"><label>Fasi di gioco</label>'+schemaCategoriaMultiSelectHTML(schemaExerciseCategorie(e), 'toggleSchemaExerciseCategoria', !canEdit)+'</div>' +
      '<div class="field"><label>Descrizione generale</label><textarea rows="2" '+(canEdit?'':'disabled')+' onchange="saveSchemaExerciseField(\'descrizione\', this.value)">'+esc(e.descrizione)+'</textarea><span class="hint">Perché/a cosa serve questo esercizio — compare anche in anteprima/stampa, insieme allo svolgimento del livello scelto.</span></div>' +
      '<div class="field field-grow">' +
        '<label>Focus</label>' +
        '<div class="schema-tag-chip-row">' + tagChipsHtml + '</div>' +
        (canEdit ? '<div style="display:flex; gap:6px; margin-top:6px;">' +
          '<input id="schema-tag-input" list="schema-tag-suggestions" type="text" placeholder="aggiungi focus e premi Invio" onkeydown="onSchemaTagInputKeydown(event)" style="flex:1;">' +
          '<button type="button" class="btn btn-small" onclick="addSchemaTagFromInput()">Aggiungi</button>' +
        '</div>' : '') +
        tagDatalist +
      '</div>' +
    '</div>' +
    '<div class="card">' +
      '<h3>Progressione</h3>' +
      '<div class="pitch-actions" style="margin-bottom:12px;">'+livelloTabsHtml+'</div>' +
      (canEdit && e.livelli.length>1 ? '<button class="btn btn-small btn-danger" style="margin-bottom:12px;" onclick="deleteSchemaLivello(\''+livello.id+'\')">Elimina livello '+esc(schemaLivelloLabel(livello))+'</button>' : '') +
      '<p class="hint">Titolo, N. giocatori e misure campo sono indipendenti per ogni livello: cambiarli qui non tocca gli altri livelli di progressione.</p>' +
      '<div class="form-row">' +
        '<div class="field field-grow"><label>Titolo</label><input value="'+esc(livello.titolo)+'" '+(canEdit?'':'disabled')+' onchange="saveSchemaLivelloField(\'titolo\', this.value)"></div>' +
        '<div class="field"><label title="Giocatori di movimento">Mov.</label><input type="number" min="1" value="'+livello.numeroGiocatoriBase+'" style="width:64px;" '+(canEdit?'':'disabled')+' onchange="saveSchemaLivelloField(\'numeroGiocatoriBase\', this.value)"></div>' +
        '<div class="field"><label title="Portieri">Por.</label><input type="number" min="0" value="'+(livello.numeroPortieri||0)+'" style="width:64px;" '+(canEdit?'':'disabled')+' onchange="saveSchemaLivelloField(\'numeroPortieri\', this.value)"></div>' +
      '</div>' +
      '<div class="field"><label>Svolgimento di questo livello</label><textarea id="schema-livello-descrizione" class="schema-rich-text" rows="2" '+(canEdit?'title="Seleziona del testo e clicca col destro per grassetto/dimensione" onchange="saveSchemaLivelloField(\'descrizione\', this.value)"':'disabled')+'>'+esc(livello.descrizione)+'</textarea><span class="hint">L\'unica descrizione che compare in anteprima/stampa: come si svolge questo livello.</span></div>' +
      '<div class="form-row">' +
        '<div class="field"><label>Ripetizioni</label><input class="schema-property-input" type="number" min="1" value="'+livello.ripetizioni+'" '+(canEdit?'':'disabled')+' onchange="saveSchemaLivelloField(\'ripetizioni\', this.value)"></div>' +
        '<div class="field"><label>Durata di ciascuna (min)</label><input class="schema-property-input" type="number" min="1" value="'+livello.durataRipetizione+'" '+(canEdit?'':'disabled')+' onchange="saveSchemaLivelloField(\'durataRipetizione\', this.value)"></div>' +
        '<div class="field"><label>Recupero (sec)</label><input class="schema-property-input" type="number" min="0" value="'+livello.recuperoSecondi+'" '+(canEdit?'':'disabled')+' onchange="saveSchemaLivelloField(\'recuperoSecondi\', this.value)"></div>' +
      '</div>' +
      '<div class="field"><label><input type="checkbox" '+(livello.mostraDisegno?'checked':'')+' '+(canEdit?'':'disabled')+' onchange="saveSchemaLivelloField(\'mostraDisegno\', this.checked)"> Includi il disegno campo nell\'esportazione/stampa</label><span class="hint">Disattivalo per gli esercizi solo descrittivi: il disegno resta salvato, solo non compare sul foglio (risparmia spazio).</span></div>' +
      (canEdit ? schemaSelectionBarHTML() : '') +
      '<div class="schema-editor-row">' +
        '<div class="pitch-wrap schema-field-wrap '+(state.schema.eraserMode?'schema-eraser-active':'')+(canEdit?'':' readonly-block')+'">' + renderSchemaFieldSVG(livello) + '</div>' +
        (canEdit ? schemaToolbarHTML(livello) : '') +
      '</div>' +
      (canEdit ? '<p class="hint">Trascina per spostare qualsiasi elemento, comprese le linee.<br>Click destro su un elemento per le opzioni (rinomina, colore, numerazione...). ' +
        '<button type="button" class="btn-link" onclick="showSchemaGuidaModal()">ⓘ Guida rapida</button></p>'
        : '<p class="hint">Sola lettura: non hai il permesso di modificare gli esercizi.</p>') +
    '</div>' +
    '<div class="card">' +
      '<h3>Note</h3>' +
      (noteRecente ? schemaNoteRowHTML(noteRecente, true) : '<p class="hint">Nessuna nota ancora.</p>') +
      (canEdit ? '<div class="form-row"><div class="field field-grow"><label>Nuova nota</label><textarea id="schema-ex-nuova-nota" rows="2"></textarea></div><button class="btn btn-small" onclick="addSchemaNote()">Aggiungi nota</button></div>' : '') +
      (altreNote.length ? '<details class="schema-note-history"><summary>Storico note ('+altreNote.length+')</summary>' + altreNote.map(n=>schemaNoteRowHTML(n, false)).join('') + '</details>' : '') +
    '</div>' +
    '<div class="card">' +
      '<h3>Quanto lo reputi efficace</h3>' +
      '<p class="hint">Una sola valutazione, tua: quanto ti piace/lo reputi efficace questo esercizio. Non è una media delle sedute — dipenderebbe da troppi fattori estranei all\'esercizio in sé. Clicca di nuovo la stessa stella per azzerare.</p>' +
      '<div class="form-row" style="align-items:center;">' +
        starInputHTML(e.votoPreferenza, !canEdit) +
        '<div class="hint">Usato '+e.utilizzi+' volte, '+e.minutiTotaliStagione+' minuti totali in stagione</div>' +
      '</div>' +
    '</div>';
}
async function setSchemaVotoPreferenza(voto){
  const current = state.schema.currentExercise.votoPreferenza;
  await saveSchemaExerciseField('votoPreferenza', current===voto ? null : voto);
}
async function saveSchemaExerciseField(field, value){
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId, { [field]: value });
  if(res.exercise) state.schema.currentExercise = res.exercise;
  renderView();
}
async function toggleSchemaExerciseCategoria(key){
  const current = schemaExerciseCategorie(state.schema.currentExercise);
  const updated = current.includes(key) ? current.filter(k=>k!==key) : current.concat(key);
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId, { categorie: updated });
  if(res.exercise) state.schema.currentExercise = res.exercise;
  else alert('Errore: '+(res.error||'sconosciuto'));
  renderView();
}
async function onSchemaFieldSizeOverride(){
  const livello = schemaActiveLivello();
  const oldW = (livello && livello.larghezzaCampo) || 1, oldH = (livello && livello.lunghezzaCampo) || 1;
  const larghezzaCampo = Math.round(Number(document.getElementById('schema-ex-larghezza').value)) || 1;
  const lunghezzaCampo = Math.round(Number(document.getElementById('schema-ex-lunghezza').value)) || 1;
  const livelloId = state.schema.activeLivelloId;
  const patch = { larghezzaCampo, lunghezzaCampo };
  // Riscala proporzionalmente giocatori/frecce/zone già disegnati alla nuova base, invece di
  // lasciarli alle vecchie coordinate assolute (che finirebbero fuori posto o fuori campo).
  if((larghezzaCampo !== oldW || lunghezzaCampo !== oldH) && livello){
    const data = parseSchemaCampo(livello);
    if(data.chips.length || data.arrows.length || data.zones.length){
      const sx = larghezzaCampo / oldW, sy = lunghezzaCampo / oldH;
      data.chips.forEach(c=>{ c.x *= sx; c.y *= sy; });
      data.zones.forEach(z=>{ z.x *= sx; z.y *= sy; z.w *= sx; z.h *= sy; });
      data.arrows.forEach(a=>{
        a.x1 *= sx; a.y1 *= sy; a.x2 *= sx; a.y2 *= sy;
        if(a.points) a.points = a.points.map(p=>({ x: p.x*sx, y: p.y*sy }));
      });
      patch.schemaCampo = JSON.stringify(data);
    }
  }
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId+'/livelli/'+livelloId, patch);
  if(res.livello){
    const idx = state.schema.currentExercise.livelli.findIndex(l=>l.id===livelloId);
    if(idx>=0) state.schema.currentExercise.livelli[idx] = res.livello;
    if(patch.schemaCampo) schemaPushHistory(livelloId, patch.schemaCampo);
    renderView();
  }
}
// Stesso criterio di eliminazione delle Considerazioni: solo chi ha scritto la nota, o il
// vero proprietario dell'account come responsabile ultimo — mai un altro collaboratore.
// Le note create prima di questa funzionalità hanno autoreId null: risultano non "mine" per
// nessuno, solo il proprietario può ripulirle.
function schemaNoteRowHTML(n, recente){
  const mine = n.autoreId && n.autoreId===getAppUser().actorId;
  const canDelete = mine || getAppUser().isOwner;
  const color = n.autoreId ? schemaAutoreColor(n.autoreId) : '#8CA0AF';
  return '<div class="'+(recente?'schema-note-recent':'schema-note-item')+'" style="border-left:3px solid '+color+'; padding-left:8px;">' +
    '<div class="schema-consid-head"><strong>'+formatDate(n.data.slice(0,10))+'</strong>' +
    (n.autoreNome ? '<span class="schema-consid-author" style="color:'+color+';">'+esc(schemaAutoreShortName(n.autoreNome))+'</span>' : '') +
    (canDelete ? '<button class="btn-icon" onclick="deleteSchemaNote(\''+n.id+'\')" aria-label="Elimina">×</button>' : '') +
    '</div>' +
    '<p>'+esc(n.testo)+'</p>' +
  '</div>';
}
async function addSchemaNote(){
  const textEl = document.getElementById('schema-ex-nuova-nota');
  const testo = textEl.value.trim();
  if(!testo) return;
  await apiPost('/api/schema/exercises/'+state.schema.exerciseId+'/notes', { testo });
  await loadSchemaExercise(state.schema.exerciseId);
  renderView();
}
async function deleteSchemaNote(noteId){
  const res = await apiDelete('/api/schema/exercises/'+state.schema.exerciseId+'/notes/'+noteId);
  if(res.ok){
    await loadSchemaExercise(state.schema.exerciseId);
    renderView();
  } else alert('Errore: '+(res.error||'sconosciuto'));
}
function confirmDeleteSchemaExercise(){
  const primoLivello = state.schema.currentExercise.livelli[0];
  showConfirmModal('Eliminare "'+(primoLivello ? primoLivello.titolo : 'questo esercizio')+'"? Elimina anche i livelli, le note e lo storico collegati.', async () => {
    await apiDelete('/api/schema/exercises/'+state.schema.exerciseId);
    openSchemaLibrary();
  });
}
/* ---------- menu contestuale sulla card in libreria (modifica/duplica/elimina) ---------- */
function showSchemaExerciseCardContextMenu(evt, exerciseId){
  evt.preventDefault();
  evt.stopPropagation();
  const menu = document.getElementById('player-context-menu');
  menu.innerHTML =
    '<div class="context-menu-item" onclick="openSchemaExercise(\''+exerciseId+'\'); hideContextMenu();">Modifica</div>' +
    '<div class="context-menu-item" onclick="duplicateSchemaExerciseFromLibrary(\''+exerciseId+'\'); hideContextMenu();">Duplica</div>' +
    '<div class="context-menu-item" onclick="confirmDeleteSchemaExerciseFromLibrary(\''+exerciseId+'\'); hideContextMenu();" style="color:var(--danger);">Elimina</div>';
  const x = Math.min(evt.clientX, window.innerWidth-190);
  const y = Math.min(evt.clientY, window.innerHeight-120);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
async function duplicateSchemaExerciseFromLibrary(exerciseId){
  const res = await apiPost('/api/schema/exercises/'+exerciseId+'/duplicate', {});
  if(res.exercise) openSchemaExercise(res.exercise.id);
  else alert('Errore: '+(res.error||'sconosciuto'));
}
function confirmDeleteSchemaExerciseFromLibrary(exerciseId){
  const ex = state.schema.exercises.find(function(e){ return e.id===exerciseId; });
  const titolo = ex && ex.livelli[0] ? ex.livelli[0].titolo : 'questo esercizio';
  showConfirmModal('Eliminare "'+titolo+'"? Elimina anche i livelli, le note e lo storico collegati.', async function(){
    await apiDelete('/api/schema/exercises/'+exerciseId);
    await loadSchemaLibrary();
    renderView();
  });
}

/* ---------- livelli di progressione (stesso esercizio, non un esercizio nuovo) ---------- */
function switchSchemaLivello(livelloId){
  state.schema.activeLivelloId = livelloId;
  schemaInitHistoryForLivello(livelloId);
  renderView();
}
// Azzera/inizializza la cronologia indietro/avanti del disegno per il livello che sta per
// diventare attivo, registrando lo stato attuale come primo punto della pila: cosi il primo
// "Indietro" dopo la prima modifica torna davvero allo stato con cui si è aperto il livello,
// non a uno stato vuoto.
function schemaInitHistoryForLivello(livelloId){
  const e = state.schema.currentExercise;
  const livello = e ? e.livelli.find(l=>l.id===livelloId) : null;
  state.schema.drawHistory = { livelloId: livelloId, stack: [livello ? livello.schemaCampo : '{}'], index: 0 };
  // La selezione multipla è per-livello: cambiando livello (o riaprendo l'esercizio) gli id
  // selezionati apparterrebbero a un disegno diverso, quindi si azzera.
  state.schema.selection = [];
}
async function addSchemaLivello(){
  // Titolo/N.giocatori/misure precompilati dal livello attualmente aperto (invece di
  // partire da un campo 0x0 senza giocatori): restano comunque indipendenti, modificabili
  // in seguito senza incidere sul livello di origine.
  const attuale = schemaActiveLivello();
  const res = await apiPost('/api/schema/exercises/'+state.schema.exerciseId+'/livelli', attuale ? {
    titolo: attuale.titolo, numeroGiocatoriBase: attuale.numeroGiocatoriBase, numeroPortieri: attuale.numeroPortieri,
    larghezzaCampo: attuale.larghezzaCampo, lunghezzaCampo: attuale.lunghezzaCampo,
  } : {});
  if(res.livello){
    state.schema.currentExercise.livelli.push(res.livello);
    state.schema.activeLivelloId = res.livello.id;
    schemaInitHistoryForLivello(res.livello.id);
    renderView();
  } else alert('Errore: '+(res.error||'sconosciuto'));
}
async function duplicateSchemaLivello(){
  const res = await apiPost('/api/schema/exercises/'+state.schema.exerciseId+'/livelli', { duplicateFrom: state.schema.activeLivelloId });
  if(res.livello){
    state.schema.currentExercise.livelli.push(res.livello);
    state.schema.activeLivelloId = res.livello.id;
    schemaInitHistoryForLivello(res.livello.id);
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
// I livelli nascono con nome "A"/"B"/"C" (una progressione automatica), ma il nome è
// liberamente rinominabile (click sulla matita accanto al tab): un nome personalizzato
// (qualunque cosa diversa da una singola lettera) sostituisce del tutto l'etichetta
// "Livello X" invece di affiancarcisi, così in libreria/costruttore seduta si legge
// direttamente "Uscita centrale" invece di "Livello Uscita centrale".
function schemaLivelloLabel(l){
  const nome = (l && l.nome) || '';
  return /^[A-Z]$/.test(nome) ? 'Livello '+nome : nome;
}
function showSchemaLivelloContextMenu(evt, livelloId){
  evt.preventDefault();
  evt.stopPropagation();
  const menu = document.getElementById('player-context-menu');
  menu.innerHTML = '<div class="context-menu-item" onclick="renameSchemaLivello(\''+livelloId+'\'); hideContextMenu();">Rinomina</div>';
  const x = Math.min(evt.clientX, window.innerWidth-190);
  const y = Math.min(evt.clientY, window.innerHeight-60);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
async function renameSchemaLivello(livelloId){
  const l = state.schema.currentExercise.livelli.find(x=>x.id===livelloId);
  if(!l) return;
  const custom = !/^[A-Z]$/.test(l.nome);
  const nome = prompt('Nome del livello (es. "Uscita centrale"):', custom ? l.nome : '');
  if(nome===null) return;
  const trimmed = nome.trim();
  if(!trimmed) return;
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId+'/livelli/'+livelloId, { nome: trimmed });
  if(res.livello){
    const idx = state.schema.currentExercise.livelli.findIndex(x=>x.id===livelloId);
    if(idx>=0) state.schema.currentExercise.livelli[idx] = res.livello;
  }
  renderView();
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
  state.schema.colorPickerOpen = false;
  renderView();
}
function toggleSchemaColorPicker(){
  state.schema.colorPickerOpen = !state.schema.colorPickerOpen;
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
// Ogni mutazione del disegno (chip/frecce/zone, dei colleghi resizeSchemaChip/deleteSchemaZone/
// ecc.) passa da qui: è il punto unico dove registrare lo stato nella cronologia indietro/
// avanti, prima di salvarlo. Un eventuale "futuro" (redo) più avanti nella pila viene troncato,
// come qualunque cronologia indietro/avanti standard.
function schemaPushHistory(livelloId, dataStr){
  const h = state.schema.drawHistory;
  if(h.livelloId !== livelloId){ state.schema.drawHistory = { livelloId: livelloId, stack: [dataStr], index: 0 }; return; }
  h.stack = h.stack.slice(0, h.index+1);
  h.stack.push(dataStr);
  if(h.stack.length > 50) h.stack.shift(); // limite ragionevole, evita una crescita illimitata
  h.index = h.stack.length-1;
}
async function saveSchemaCampo(data){
  const livelloId = state.schema.activeLivelloId;
  const dataStr = JSON.stringify(data);
  schemaPushHistory(livelloId, dataStr);
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId+'/livelli/'+livelloId, { schemaCampo: dataStr });
  if(res.livello){
    const idx = state.schema.currentExercise.livelli.findIndex(l=>l.id===livelloId);
    if(idx>=0) state.schema.currentExercise.livelli[idx] = res.livello;
    renderView();
  }
}
// Indietro/avanti: si muove solo il puntatore nella pila già registrata da schemaPushHistory
// e si applica quello stato, senza spingere una nuova voce (altrimenti "Indietro" finirebbe
// per creare a sua volta una nuova mossa "in avanti" nella cronologia).
async function schemaHistoryGo(delta){
  const h = state.schema.drawHistory;
  const newIndex = h.index + delta;
  if(newIndex < 0 || newIndex >= h.stack.length) return;
  h.index = newIndex;
  const livelloId = h.livelloId;
  const res = await apiPatch('/api/schema/exercises/'+state.schema.exerciseId+'/livelli/'+livelloId, { schemaCampo: h.stack[h.index] });
  if(res.livello){
    const idx = state.schema.currentExercise.livelli.findIndex(l=>l.id===livelloId);
    if(idx>=0) state.schema.currentExercise.livelli[idx] = res.livello;
    renderView();
  }
}
function undoSchemaCampo(){ return schemaHistoryGo(-1); }
function redoSchemaCampo(){ return schemaHistoryGo(1); }
function showSchemaChipContextMenu(evt, chipId){
  evt.preventDefault();
  evt.stopPropagation();
  const data = parseSchemaCampo(schemaActiveLivello());
  const chip = data.chips.find(c=>c.id===chipId);
  if(!chip) return;
  const menu = document.getElementById('player-context-menu');
  const isGoal = chip.tipo==='porta' || chip.tipo==='portina';
  const isTesto = chip.tipo==='testo';
  // Niente hideContextMenu() sulle azioni di modifica qui sotto: restano nel menu finché non
  // si clicca fuori (vedi il listener globale su document), cosi A-/A+, colore o rotazione si
  // possono ripetere senza dover riaprire il menu col tasto destro ogni volta. Solo "Elimina"
  // lo chiude, perché l'elemento a cui si riferisce non esiste più.
  let html = '<div class="context-menu-item" onclick="renameSchemaChip(\''+chipId+'\');">'+(isTesto?'Modifica testo':'Rinomina')+'</div>';
  if(chip.tipo==='giocatore'){
    html += '<div class="context-menu-item" onclick="numberSchemaChip(\''+chipId+'\');">Numera</div>';
    html += '<div class="context-menu-item" onclick="toggleSchemaChipPortiere(\''+chipId+'\');">'+(chip.ruolo==='portiere'?'Rimuovi ruolo portiere':'Segna come portiere')+'</div>';
  }
  const isResizable = isTesto || ['giocatore','cono','paletto','cinesino'].includes(chip.tipo);
  if(isResizable){
    html += '<div class="context-menu-item" style="display:flex; gap:6px; align-items:center;">' +
      '<span class="hint">Dimensione</span>' +
      '<button type="button" class="btn btn-small" onclick="resizeSchemaChip(\''+chipId+'\',-0.15);">A-</button>' +
      '<button type="button" class="btn btn-small" onclick="resizeSchemaChip(\''+chipId+'\',0.15);">A+</button>' +
    '</div>';
  }
  if(isTesto){
    html += '<div class="context-menu-item" onclick="toggleSchemaTextChipSottile(\''+chipId+'\');">'+(chip.sottile?'Grassetto':'Sottile')+'</div>';
  }
  if(isGoal){
    html += '<div class="context-menu-item" onclick="rotateSchemaChip(\''+chipId+'\',-45);">Ruota ↺ 45°</div>';
    html += '<div class="context-menu-item" onclick="rotateSchemaChip(\''+chipId+'\',45);">Ruota ↻ 45°</div>';
  } else {
    html += '<div class="context-menu-item" style="display:flex; gap:6px; align-items:center;">' +
      SCHEMA_COLORS.map(c=>'<span onclick="recolorSchemaChip(\''+chipId+'\',\''+c+'\');" style="width:16px;height:16px;border-radius:50%;background:'+c+';display:inline-block;cursor:pointer;border:1px solid var(--border);"></span>').join('') +
    '</div>';
  }
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
function toggleSchemaChipPortiere(chipId){
  const data = parseSchemaCampo(schemaActiveLivello());
  const chip = data.chips.find(c=>c.id===chipId);
  if(!chip) return;
  chip.ruolo = chip.ruolo==='portiere' ? null : 'portiere';
  saveSchemaCampo(data);
}
function rotateSchemaChip(chipId, delta){
  const data = parseSchemaCampo(schemaActiveLivello());
  const chip = data.chips.find(c=>c.id===chipId);
  if(!chip) return;
  chip.rot = ((chip.rot||0) + delta + 360) % 360;
  saveSchemaCampo(data);
}
function resizeSchemaChip(chipId, delta){
  const data = parseSchemaCampo(schemaActiveLivello());
  const chip = data.chips.find(c=>c.id===chipId);
  if(!chip) return;
  const newSize = Math.max(0.4, Math.min(3, Math.round(((chip.size||1) + delta)*100)/100));
  chip.size = newSize;
  // La dimensione scelta resta quella di default per i prossimi elementi dello stesso tipo
  // piazzati in questo disegno (stessa logica del colore attivo): non tocca reimpostarla
  // ogni volta componendo una formazione o un set di paletti/cinesini/coni della stessa taglia.
  if(state.schema.activeChipSizeByType.hasOwnProperty(chip.tipo)) state.schema.activeChipSizeByType[chip.tipo] = newSize;
  saveSchemaCampo(data);
}
function toggleSchemaTextChipSottile(chipId){
  const data = parseSchemaCampo(schemaActiveLivello());
  const chip = data.chips.find(c=>c.id===chipId);
  if(!chip) return;
  chip.sottile = !chip.sottile;
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
function showSchemaZoneContextMenu(evt, zoneId){
  evt.preventDefault();
  evt.stopPropagation();
  const data = parseSchemaCampo(schemaActiveLivello());
  const zone = data.zones.find(z=>z.id===zoneId);
  if(!zone) return;
  const menu = document.getElementById('player-context-menu');
  let html = '<div class="context-menu-item" onclick="toggleSchemaZoneStile(\''+zoneId+'\');">'+(zone.stile==='contorno'?'Stile: tinta piena':'Stile: solo contorno (es. area di rigore)')+'</div>';
  if(zone.stile!=='contorno'){
    html += '<div class="context-menu-item" style="display:flex; gap:6px; align-items:center;">' +
      SCHEMA_COLORS.map(c=>'<span onclick="recolorSchemaZone(\''+zoneId+'\',\''+c+'\');" style="width:16px;height:16px;border-radius:4px;background:'+c+';display:inline-block;cursor:pointer;border:1px solid var(--border);"></span>').join('') +
    '</div>';
  }
  html += '<div class="context-menu-item" onclick="deleteSchemaZone(\''+zoneId+'\'); hideContextMenu();" style="color:var(--danger);">Elimina</div>';
  menu.innerHTML = html;
  const x = Math.min(evt.clientX, window.innerWidth-190);
  const y = Math.min(evt.clientY, window.innerHeight-220);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
function toggleSchemaZoneStile(zoneId){
  const data = parseSchemaCampo(schemaActiveLivello());
  const zone = data.zones.find(z=>z.id===zoneId);
  if(!zone) return;
  zone.stile = zone.stile==='contorno' ? 'pieno' : 'contorno';
  saveSchemaCampo(data);
}
function recolorSchemaZone(zoneId, color){
  const data = parseSchemaCampo(schemaActiveLivello());
  const zone = data.zones.find(z=>z.id===zoneId);
  if(!zone) return;
  zone.color = color;
  saveSchemaCampo(data);
}
function deleteSchemaZone(zoneId){
  const data = parseSchemaCampo(schemaActiveLivello());
  data.zones = data.zones.filter(z=>z.id!==zoneId);
  saveSchemaCampo(data);
}
function showSchemaArrowContextMenu(evt, arrowId){
  evt.preventDefault();
  evt.stopPropagation();
  const data = parseSchemaCampo(schemaActiveLivello());
  const arrow = data.arrows.find(a=>a.id===arrowId);
  if(!arrow) return;
  const menu = document.getElementById('player-context-menu');
  let html = '<div class="context-menu-item" onclick="numberSchemaArrow(\''+arrowId+'\');">'+(arrow.numero!=null?'Cambia numero':'Numera')+'</div>';
  if(arrow.numero!=null){
    html += '<div class="context-menu-item" onclick="numberSchemaArrow(\''+arrowId+'\', true);">Rimuovi numero</div>';
  }
  if(arrow.tipo!=='divisore' && arrow.tipo!=='campo-linea'){
    html += '<div class="context-menu-item" style="display:flex; gap:6px; align-items:center;">' +
      SCHEMA_COLORS.map(c=>'<span onclick="recolorSchemaArrow(\''+arrowId+'\',\''+c+'\');" style="width:16px;height:16px;border-radius:50%;background:'+c+';display:inline-block;cursor:pointer;border:1px solid var(--border);"></span>').join('') +
    '</div>';
  }
  html += '<div class="context-menu-item" onclick="deleteSchemaArrow(\''+arrowId+'\'); hideContextMenu();" style="color:var(--danger);">Elimina</div>';
  menu.innerHTML = html;
  const x = Math.min(evt.clientX, window.innerWidth-190);
  const y = Math.min(evt.clientY, window.innerHeight-220);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
}
function numberSchemaArrow(arrowId, remove){
  const data = parseSchemaCampo(schemaActiveLivello());
  const arrow = data.arrows.find(a=>a.id===arrowId);
  if(!arrow) return;
  if(remove){ arrow.numero = null; saveSchemaCampo(data); return; }
  const numero = prompt('Numero (vuoto per rimuovere):', arrow.numero!=null?String(arrow.numero):'');
  if(numero!==null){ arrow.numero = numero.trim()===''?null:Number(numero); saveSchemaCampo(data); }
}
function recolorSchemaArrow(arrowId, color){
  const data = parseSchemaCampo(schemaActiveLivello());
  const arrow = data.arrows.find(a=>a.id===arrowId);
  if(!arrow) return;
  arrow.color = color;
  saveSchemaCampo(data);
}
// Su mouse (puntatore preciso) la gomma cancella subito, com'è sempre stato: è veloce e
// lo scroll con la rotellina non passa mai sopra un elemento del disegno per sbaglio. Su
// touch (puntatore "grezzo": telefono/tablet) uno scroll con il dito può facilmente
// finire su un elemento mentre si scorre la pagina — lì la gomma chiede conferma.
function isCoarsePointer(){
  return typeof window!=='undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
}
function confirmEraserDelete(){
  return !isCoarsePointer() || confirm('Eliminare questo elemento dal disegno?');
}
// Raggio approssimativo (in user-space SVG, relativo a w) da usare come anello di
// evidenziazione attorno a un chip in selezione multipla: una stima per-tipo che copre
// la forma reale, non serve essere pixel-perfect, solo visibilmente centrata sull'elemento.
function schemaSelectionChipRadius(c, w){
  const sz = c.size||1;
  if(c.tipo==='pallone') return w*0.013*1.9;
  if(c.tipo==='porta') return w*0.097;
  if(c.tipo==='portina') return w*0.055;
  if(c.tipo==='cono') return w*0.035*sz*1.55;
  if(c.tipo==='paletto') return w*0.07*sz*1.1;
  if(c.tipo==='cinesino') return w*0.026*sz*1.9;
  return w*0.036*sz*1.45; // giocatore/portiere
}
// Evidenziazione della selezione multipla (lazo su area libera): overlay di forme SVG
// vere disegnate in coordinate campo (scala relativa a w, come il resto del disegnatore),
// NON un CSS filter — i drop-shadow CSS su elementi SVG dentro un viewBox scalato (il campo
// può essere largo solo 20 unità) si sono rivelati inaffidabili tra browser. Un doppio
// anello bianco+azzurro per leggibilità su qualunque sfondo/colore dell'elemento sotto.
function schemaSelectionHighlightSVG(){
  if(!state.schema.selection.length) return '';
  const livello = schemaActiveLivello();
  if(!livello) return '';
  const w = livello.larghezzaCampo || 20;
  const data = parseSchemaCampo(livello);
  const outerW = w*0.013, innerW = w*0.006;
  let out = '';
  function ring(shapeAttrs, tag){
    out += '<'+tag+' '+shapeAttrs+' fill="none" stroke="#FFFFFF" stroke-width="'+outerW+'" opacity="0.55" stroke-linecap="round"/>';
    out += '<'+tag+' '+shapeAttrs+' fill="none" stroke="#4DA3FF" stroke-width="'+innerW+'" opacity="0.95" stroke-linecap="round"/>';
  }
  state.schema.selection.forEach(function(s){
    if(s.type==='chip'){
      const c = data.chips.find(function(x){ return x.id===s.id; });
      if(!c) return;
      if(c.tipo==='testo'){
        const fontSize = w*(c.size||1)*0.045;
        const label = c.label || 'Testo';
        const hw = fontSize*0.32*label.length + w*0.015, hh = fontSize*0.75;
        ring('x="'+(c.x-hw)+'" y="'+(c.y-hh)+'" width="'+(hw*2)+'" height="'+(hh*2)+'" rx="'+(w*0.01)+'"', 'rect');
        return;
      }
      const r = schemaSelectionChipRadius(c, w);
      const cy = c.tipo==='paletto' ? c.y - r*0.3 : c.y;
      ring('cx="'+c.x+'" cy="'+cy+'" r="'+r+'"', 'circle');
    } else if(s.type==='arrow'){
      const a = data.arrows.find(function(x){ return x.id===s.id; });
      if(!a) return;
      const geo = schemaArrowGeometry(a);
      const shapeAttrs = geo.tag==='path' ? 'd="'+geo.d+'"' : 'x1="'+geo.x1+'" y1="'+geo.y1+'" x2="'+geo.x2+'" y2="'+geo.y2+'"';
      ring(shapeAttrs, geo.tag);
    } else if(s.type==='zone'){
      const z = data.zones.find(function(x){ return x.id===s.id; });
      if(!z) return;
      const pad = w*0.012;
      if(z.shape==='cerchio'){
        ring('cx="'+(z.x+z.w/2)+'" cy="'+(z.y+z.h/2)+'" rx="'+(z.w/2+pad)+'" ry="'+(z.h/2+pad)+'"', 'ellipse');
      } else {
        ring('x="'+(z.x-pad)+'" y="'+(z.y-pad)+'" width="'+(z.w+pad*2)+'" height="'+(z.h+pad*2)+'"', 'rect');
      }
    }
  });
  return out ? '<g class="schema-selection-overlay" pointer-events="none">'+out+'</g>' : '';
}
function attachSchemaFieldInteractions(){
  const svg = document.getElementById('schema-field-svg');
  if(!svg) return;
  // Senza edit_esercizi il campo si vede ma non si tocca: niente drag di chip/frecce/zone,
  // niente piazzamento nuovi elementi, niente menu contestuale — semplicemente non si aggancia
  // nessun listener, invece di lasciare l'interazione attiva e fallire solo al salvataggio.
  if(!can('edit_esercizi')) return;
  function toPoint(evt){
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  // Evidenzia visivamente gli elementi in selezione multipla (lazo su area libera, vedi il
  // gestore di sfondo più sotto): overlay SVG vero disegnato sopra il campo, vedi
  // schemaSelectionHighlightSVG (sostituisce un precedente approccio a CSS filter che non
  // si vedeva in modo affidabile sugli elementi SVG).
  const prevOverlay = svg.querySelector('.schema-selection-overlay');
  if(prevOverlay) prevOverlay.remove();
  if(state.schema.selection.length){
    svg.insertAdjacentHTML('beforeend', schemaSelectionHighlightSVG());
  }
  // Se l'elemento su cui si inizia un trascinamento fa parte di una selezione multipla
  // (>1 elemento), ritorna i riferimenti dati+DOM di TUTTI gli elementi selezionati con le
  // loro coordinate di partenza: cosi si spostano insieme mantenendo le distanze reciproche
  // invece che uno alla volta. Altrimenti (nessuna selezione o un solo elemento) ritorna
  // null e il drag resta quello di sempre, sul solo elemento toccato.
  function schemaBuildMoveGroup(data){
    const sel = state.schema.selection;
    if(sel.length<=1) return null;
    const group = [];
    sel.forEach(function(s){
      if(s.type==='chip'){
        const c = data.chips.find(function(x){ return x.id===s.id; });
        const el = svg.querySelector('.schema-chip[data-id="'+s.id+'"]');
        if(c && el) group.push({ type:'chip', ref:c, el:el, orig:{ x:c.x, y:c.y } });
      } else if(s.type==='arrow'){
        const a = data.arrows.find(function(x){ return x.id===s.id; });
        const el = svg.querySelector('.schema-arrow[data-id="'+s.id+'"]');
        if(a && el) group.push({ type:'arrow', ref:a, el:el, orig:{ x1:a.x1, y1:a.y1, x2:a.x2, y2:a.y2, points: a.points ? a.points.map(function(p){ return { x:p.x, y:p.y }; }) : null } });
      } else if(s.type==='zone'){
        const z = data.zones.find(function(x){ return x.id===s.id; });
        const el = svg.querySelector('.schema-zone[data-id="'+s.id+'"]');
        if(z && el) group.push({ type:'zone', ref:z, el:el, orig:{ x:z.x, y:z.y } });
      }
    });
    return group.length>1 ? group : null;
  }
  function schemaApplyMoveGroupDelta(group, dx, dy){
    group.forEach(function(item){
      if(item.type==='chip'){
        item.ref.x = item.orig.x+dx; item.ref.y = item.orig.y+dy;
        item.el.setAttribute('transform', 'translate('+item.ref.x+','+item.ref.y+')');
      } else if(item.type==='arrow'){
        item.ref.x1 = item.orig.x1+dx; item.ref.y1 = item.orig.y1+dy;
        item.ref.x2 = item.orig.x2+dx; item.ref.y2 = item.orig.y2+dy;
        if(item.orig.points) item.ref.points = item.orig.points.map(function(p){ return { x: p.x+dx, y: p.y+dy }; });
        updateSchemaArrowDOM(item.el, item.ref);
      } else if(item.type==='zone'){
        item.ref.x = item.orig.x+dx; item.ref.y = item.orig.y+dy;
        if(item.ref.shape==='cerchio'){
          item.el.setAttribute('cx', item.ref.x+item.ref.w/2); item.el.setAttribute('cy', item.ref.y+item.ref.h/2);
        } else {
          item.el.setAttribute('x', item.ref.x); item.el.setAttribute('y', item.ref.y);
        }
      }
    });
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
      if(state.schema.eraserMode){ if(confirmEraserDelete()) deleteSchemaChip(id); return; }
      chipEl.setPointerCapture(e.pointerId);
      const startPt = toPoint(e);
      let moved = false;
      const data = parseSchemaCampo(schemaActiveLivello());
      const chipData = data.chips.find(function(c){ return c.id===id; });
      if(!chipData) return;
      const isSelected = state.schema.selection.some(function(s){ return s.type==='chip' && s.id===id; });
      const moveGroup = isSelected ? schemaBuildMoveGroup(data) : null;
      function onMove(e2){
        const p = toPoint(e2);
        if(Math.abs(p.x-startPt.x) > 0.3 || Math.abs(p.y-startPt.y) > 0.3) moved = true;
        if(moveGroup){
          schemaApplyMoveGroupDelta(moveGroup, p.x-startPt.x, p.y-startPt.y);
        } else {
          chipData.x = p.x; chipData.y = p.y;
          chipEl.setAttribute('transform', 'translate('+chipData.x+','+chipData.y+')');
        }
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
  function updateSchemaArrowDOM(groupEl, a){
    const geo = schemaArrowGeometry(a);
    [groupEl.children[0], groupEl.children[1]].forEach(function(el){
      if(!el) return;
      if(geo.tag==='path') el.setAttribute('d', geo.d);
      else { el.setAttribute('x1',geo.x1); el.setAttribute('y1',geo.y1); el.setAttribute('x2',geo.x2); el.setAttribute('y2',geo.y2); }
    });
    const badge = groupEl.getAttribute('data-numero') ? groupEl.children[2] : null;
    if(badge) badge.setAttribute('transform', 'translate('+geo.mid.x+','+geo.mid.y+')');
    const h1 = groupEl.querySelector('.schema-arrow-handle[data-end="1"]');
    const h2 = groupEl.querySelector('.schema-arrow-handle[data-end="2"]');
    if(h1){ h1.setAttribute('cx', a.x1); h1.setAttribute('cy', a.y1); }
    if(h2){ h2.setAttribute('cx', a.x2); h2.setAttribute('cy', a.y2); }
  }
  svg.querySelectorAll('.schema-arrow').forEach(function(arrowEl){
    arrowEl.style.cursor = 'grab';
    arrowEl.addEventListener('contextmenu', function(e){
      showSchemaArrowContextMenu(e, arrowEl.getAttribute('data-id'));
    });
    arrowEl.querySelectorAll('.schema-arrow-handle').forEach(function(handleEl){
      handleEl.style.cursor = 'crosshair';
      handleEl.addEventListener('pointerdown', function(e){
        if(e.button===2) return;
        e.stopPropagation();
        const id = arrowEl.getAttribute('data-id');
        if(state.schema.eraserMode){ if(confirmEraserDelete()) deleteSchemaArrow(id); return; }
        const end = handleEl.getAttribute('data-end');
        handleEl.setPointerCapture(e.pointerId);
        const data = parseSchemaCampo(schemaActiveLivello());
        const arrowData = data.arrows.find(function(a){ return a.id===id; });
        if(!arrowData) return;
        let moved = false;
        function onMove(e2){
          const p = toPoint(e2);
          moved = true;
          if(end==='1'){ arrowData.x1 = p.x; arrowData.y1 = p.y; }
          else { arrowData.x2 = p.x; arrowData.y2 = p.y; }
          updateSchemaArrowDOM(arrowEl, arrowData);
        }
        function onUp(){
          svg.removeEventListener('pointermove', onMove);
          svg.removeEventListener('pointerup', onUp);
          try{ handleEl.releasePointerCapture(e.pointerId); }catch(err){}
          if(moved) saveSchemaCampo(data);
        }
        svg.addEventListener('pointermove', onMove);
        svg.addEventListener('pointerup', onUp);
      });
    });
    arrowEl.addEventListener('pointerdown', function(e){
      if(e.button===2) return;
      const id = arrowEl.getAttribute('data-id');
      if(state.schema.eraserMode){ e.stopPropagation(); if(confirmEraserDelete()) deleteSchemaArrow(id); return; }
      e.stopPropagation();
      arrowEl.setPointerCapture(e.pointerId);
      const startPt = toPoint(e);
      let moved = false;
      const data = parseSchemaCampo(schemaActiveLivello());
      const arrowData = data.arrows.find(function(a){ return a.id===id; });
      if(!arrowData) return;
      const orig = {
        x1: arrowData.x1, y1: arrowData.y1, x2: arrowData.x2, y2: arrowData.y2,
        points: arrowData.points ? arrowData.points.map(function(p){ return { x:p.x, y:p.y }; }) : null,
      };
      const isSelected = state.schema.selection.some(function(s){ return s.type==='arrow' && s.id===id; });
      const moveGroup = isSelected ? schemaBuildMoveGroup(data) : null;
      function onMove(e2){
        const p = toPoint(e2);
        const dx = p.x-startPt.x, dy = p.y-startPt.y;
        if(Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) moved = true;
        if(moveGroup){
          schemaApplyMoveGroupDelta(moveGroup, dx, dy);
          return;
        }
        arrowData.x1 = orig.x1+dx; arrowData.y1 = orig.y1+dy;
        arrowData.x2 = orig.x2+dx; arrowData.y2 = orig.y2+dy;
        if(orig.points) arrowData.points = orig.points.map(function(pt){ return { x: pt.x+dx, y: pt.y+dy }; });
        updateSchemaArrowDOM(arrowEl, arrowData);
      }
      function onUp(){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        try{ arrowEl.releasePointerCapture(e.pointerId); }catch(err){}
        if(moved) saveSchemaCampo(data);
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  });
  svg.querySelectorAll('.schema-zone').forEach(function(zoneEl){
    zoneEl.style.cursor = 'grab';
    zoneEl.addEventListener('contextmenu', function(e){
      showSchemaZoneContextMenu(e, zoneEl.getAttribute('data-id'));
    });
    zoneEl.addEventListener('pointerdown', function(e){
      if(e.button===2) return;
      e.stopPropagation();
      const id = zoneEl.getAttribute('data-id');
      if(state.schema.eraserMode){ if(confirmEraserDelete()) deleteSchemaZone(id); return; }
      zoneEl.setPointerCapture(e.pointerId);
      const startPt = toPoint(e);
      let moved = false;
      const data = parseSchemaCampo(schemaActiveLivello());
      const zoneData = data.zones.find(function(z){ return z.id===id; });
      if(!zoneData) return;
      const origX = zoneData.x, origY = zoneData.y;
      const isSelected = state.schema.selection.some(function(s){ return s.type==='zone' && s.id===id; });
      const moveGroup = isSelected ? schemaBuildMoveGroup(data) : null;
      function onMove(e2){
        const p = toPoint(e2);
        const dx = p.x-startPt.x, dy = p.y-startPt.y;
        if(Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) moved = true;
        if(moveGroup){
          schemaApplyMoveGroupDelta(moveGroup, dx, dy);
          return;
        }
        zoneData.x = origX+dx; zoneData.y = origY+dy;
        if(zoneData.shape==='cerchio'){
          zoneEl.setAttribute('cx', zoneData.x+zoneData.w/2); zoneEl.setAttribute('cy', zoneData.y+zoneData.h/2);
        } else {
          zoneEl.setAttribute('x', zoneData.x); zoneEl.setAttribute('y', zoneData.y);
        }
      }
      function onUp(){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        try{ zoneEl.releasePointerCapture(e.pointerId); }catch(err){}
        if(moved) saveSchemaCampo(data);
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  });
  svg.addEventListener('pointerdown', function(e){
    if(e.target.closest('.schema-chip') || e.target.closest('.schema-arrow') || e.target.closest('.schema-zone')) return;
    if(e.button===2) return;
    const s = state.schema;
    if(s.drawMode && s.activeLineType==='pallone-alto'){
      const start = toPoint(e);
      // toPoint() ritorna un DOMPoint: le sue x/y sono proprietà d'accesso, non proprietà
      // proprie enumerabili, quindi JSON.stringify le serializza come "{}". Va convertito
      // subito in un oggetto semplice, altrimenti il tratto disegnato si perde al salvataggio.
      const points = [{ x: start.x, y: start.y }];
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg','path');
      tempPath.setAttribute('fill','none'); tempPath.setAttribute('stroke', s.activeColor); tempPath.setAttribute('stroke-width','0.15');
      tempPath.setAttribute('d', 'M'+start.x+','+start.y);
      svg.querySelector('.arrows-layer').appendChild(tempPath);
      function onMove(e2){
        const p = toPoint(e2);
        const last = points[points.length-1];
        if(Math.hypot(p.x-last.x, p.y-last.y) > 0.25){
          points.push({ x: p.x, y: p.y });
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
          // Al rilascio il tracciato libero si "pulisce" in una quadratica regolare: si
          // misura solo il punto di massimo scostamento perpendicolare dalla corda
          // inizio-fine (segno incluso) e si tiene quello come curvatura ("bend"), non il
          // tracciato fedele — vedi schemaCurveControlPoint/schemaArrowGeometry.
          const dx=last.x-start.x, dy=last.y-start.y;
          const chordLen = Math.hypot(dx,dy)||1;
          const px=-dy/chordLen, py=dx/chordLen;
          let bend = 0;
          points.forEach(function(p){
            const d = (p.x-start.x)*px + (p.y-start.y)*py;
            if(Math.abs(d) > Math.abs(bend)) bend = d;
          });
          const data = parseSchemaCampo(schemaActiveLivello());
          data.arrows.push({ id: uid(), tipo:'pallone-alto', color:s.activeColor, x1:start.x, y1:start.y, x2:last.x, y2:last.y, bend });
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
    } else if(s.placeMode==='zona'){
      const start = toPoint(e);
      const tempRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      tempRect.setAttribute('fill', s.activeColor); tempRect.setAttribute('fill-opacity','0.22');
      tempRect.setAttribute('stroke', s.activeColor); tempRect.setAttribute('stroke-width','0.15'); tempRect.setAttribute('stroke-dasharray','0.4,0.3');
      tempRect.setAttribute('x', start.x); tempRect.setAttribute('y', start.y); tempRect.setAttribute('width','0'); tempRect.setAttribute('height','0');
      svg.querySelector('.zones-layer').appendChild(tempRect);
      function onMove(e2){
        const p = toPoint(e2);
        const x = Math.min(start.x, p.x), y = Math.min(start.y, p.y);
        const rw = Math.abs(p.x-start.x), rh = Math.abs(p.y-start.y);
        tempRect.setAttribute('x', x); tempRect.setAttribute('y', y);
        tempRect.setAttribute('width', rw); tempRect.setAttribute('height', rh);
      }
      function onUp(e2){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        const p = toPoint(e2);
        const x = Math.min(start.x, p.x), y = Math.min(start.y, p.y);
        const rw = Math.abs(p.x-start.x), rh = Math.abs(p.y-start.y);
        if(rw > 0.6 && rh > 0.6){
          const data = parseSchemaCampo(schemaActiveLivello());
          data.zones.push({ id: uid(), x, y, w:rw, h:rh, color: s.activeColor });
          saveSchemaCampo(data);
        } else { tempRect.remove(); }
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
        // Il testo, a differenza degli altri chip, non ha senso piazzato vuoto: si chiede
        // subito il contenuto e si annulla il piazzamento se l'allenatore non scrive nulla,
        // invece di lasciare un'etichetta invisibile da dover scoprire col tasto destro.
        if(s.placeMode==='testo'){
          const testo = prompt('Testo:', '');
          if(testo===null || testo.trim()==='') return;
          const data = parseSchemaCampo(schemaActiveLivello());
          data.chips.push({ id: uid(), x:p.x, y:p.y, tipo:'testo', color:s.activeColor, numero:null, label:testo.trim(), size:1 });
          saveSchemaCampo(data);
          return;
        }
        const data = parseSchemaCampo(schemaActiveLivello());
        // I nuovi elementi ridimensionabili (giocatori, coni, paletti, cinesini) nascono con
        // l'ultima dimensione scelta per quel tipo (A-/A+ dal menu contestuale), non sempre 1:
        // cosi non tocca reimpostarla per ognuno componendo una formazione o un set di
        // materiale tutto della stessa taglia.
        const size = s.activeChipSizeByType.hasOwnProperty(s.placeMode) ? (s.activeChipSizeByType[s.placeMode]||1) : 1;
        data.chips.push({ id: uid(), x:p.x, y:p.y, tipo:s.placeMode, color:s.activeColor, numero:null, label:'', size:size });
        saveSchemaCampo(data);
      }
      svg.addEventListener('pointerup', onUp);
    } else {
      // Nessuno strumento attivo: tenere premuto e trascinare su un'area libera del campo
      // disegna un rettangolo di selezione — al rilascio si selezionano tutti gli elementi
      // toccati (chip, frecce, zone), modificabili o eliminabili tutti insieme. Un click
      // senza trascinamento (nessun movimento reale) deseleziona invece di non fare nulla.
      const start = toPoint(e);
      const tempRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      tempRect.setAttribute('fill','rgba(77,163,255,0.15)');
      tempRect.setAttribute('stroke','#4DA3FF');
      tempRect.setAttribute('stroke-width','0.15');
      tempRect.setAttribute('stroke-dasharray','0.3,0.3');
      tempRect.setAttribute('x', start.x); tempRect.setAttribute('y', start.y);
      tempRect.setAttribute('width','0'); tempRect.setAttribute('height','0');
      svg.appendChild(tempRect);
      let moved = false;
      function onMove(e2){
        const p = toPoint(e2);
        if(Math.abs(p.x-start.x) > 0.3 || Math.abs(p.y-start.y) > 0.3) moved = true;
        const x = Math.min(start.x, p.x), y = Math.min(start.y, p.y);
        const rw = Math.abs(p.x-start.x), rh = Math.abs(p.y-start.y);
        tempRect.setAttribute('x', x); tempRect.setAttribute('y', y);
        tempRect.setAttribute('width', rw); tempRect.setAttribute('height', rh);
      }
      function onUp(e2){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        tempRect.remove();
        if(!moved){
          if(state.schema.selection.length){ state.schema.selection = []; renderView(); }
          return;
        }
        const p = toPoint(e2);
        const x0 = Math.min(start.x, p.x), y0 = Math.min(start.y, p.y);
        const x1 = Math.max(start.x, p.x), y1 = Math.max(start.y, p.y);
        const data = parseSchemaCampo(schemaActiveLivello());
        const sel = [];
        // I segni-guida generati da un preset di layout (porta/area/cerchio) si comportano
        // da sfondo: il lazo li ignora, cosi non capitano dentro una selezione multipla
        // insieme a giocatori/frecce/zone disegnati a mano.
        data.chips.forEach(function(c){
          if(c.guida) return;
          if(c.x>=x0 && c.x<=x1 && c.y>=y0 && c.y<=y1) sel.push({ type:'chip', id:c.id });
        });
        data.arrows.forEach(function(a){
          if(a.guida) return;
          const in1 = a.x1>=x0 && a.x1<=x1 && a.y1>=y0 && a.y1<=y1;
          const in2 = a.x2>=x0 && a.x2<=x1 && a.y2>=y0 && a.y2<=y1;
          if(in1 || in2) sel.push({ type:'arrow', id:a.id });
        });
        data.zones.forEach(function(z){
          if(z.guida) return;
          const overlap = z.x<=x1 && (z.x+z.w)>=x0 && z.y<=y1 && (z.y+z.h)>=y0;
          if(overlap) sel.push({ type:'zone', id:z.id });
        });
        state.schema.selection = sel;
        renderView();
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    }
  });
}
/* ---------- selezione multipla: azioni bulk (colore/elimina/annulla) ---------- */
function schemaSelectionBarHTML(){
  const n = state.schema.selection.length;
  if(!n) return '';
  return '<div class="schema-selection-bar">' +
    '<span>'+n+' element'+(n===1?'o':'i')+' selezionat'+(n===1?'o':'i')+'</span>' +
    '<button type="button" class="btn btn-small" onclick="recolorSchemaSelection()">Colore</button>' +
    '<button type="button" class="btn btn-small btn-danger" onclick="deleteSchemaSelection()">Elimina</button>' +
    '<button type="button" class="btn btn-small" onclick="clearSchemaSelectionAndRender()">Annulla selezione</button>' +
  '</div>';
}
function clearSchemaSelectionAndRender(){
  state.schema.selection = [];
  renderView();
}
async function deleteSchemaSelection(){
  const sel = state.schema.selection;
  if(!sel.length) return;
  const data = parseSchemaCampo(schemaActiveLivello());
  const chipIds = new Set(sel.filter(function(s){ return s.type==='chip'; }).map(function(s){ return s.id; }));
  const arrowIds = new Set(sel.filter(function(s){ return s.type==='arrow'; }).map(function(s){ return s.id; }));
  const zoneIds = new Set(sel.filter(function(s){ return s.type==='zone'; }).map(function(s){ return s.id; }));
  data.chips = data.chips.filter(function(c){ return !chipIds.has(c.id); });
  data.arrows = data.arrows.filter(function(a){ return !arrowIds.has(a.id); });
  data.zones = data.zones.filter(function(z){ return !zoneIds.has(z.id); });
  state.schema.selection = [];
  await saveSchemaCampo(data);
}
async function recolorSchemaSelection(){
  const sel = state.schema.selection;
  if(!sel.length) return;
  const data = parseSchemaCampo(schemaActiveLivello());
  const color = state.schema.activeColor;
  const chipIds = new Set(sel.filter(function(s){ return s.type==='chip'; }).map(function(s){ return s.id; }));
  const arrowIds = new Set(sel.filter(function(s){ return s.type==='arrow'; }).map(function(s){ return s.id; }));
  const zoneIds = new Set(sel.filter(function(s){ return s.type==='zone'; }).map(function(s){ return s.id; }));
  data.chips.forEach(function(c){ if(chipIds.has(c.id)) c.color = color; });
  data.arrows.forEach(function(a){ if(arrowIds.has(a.id)) a.color = color; });
  data.zones.forEach(function(z){ if(zoneIds.has(z.id)) z.color = color; });
  await saveSchemaCampo(data);
}

/* ---------- picker: scelta livello quando un esercizio ha più progressioni ---------- */
function schemaLivelloPickerHTML(){
  const picker = state.schema.livelloPicker;
  if(!picker) return '';
  return '<div class="schema-picker-overlay" onclick="if(event.target===this) closeSchemaLivelloPicker();">' +
    '<div class="schema-picker-box">' +
      '<h3>'+esc(picker.titolo)+'</h3>' +
      '<p class="hint">Questo esercizio ha più livelli di progressione: quale vuoi usare?</p>' +
      '<div class="schema-picker-options">' + picker.livelli.map(l=>'<button class="btn" onclick="chooseSchemaLivello(\''+l.id+'\')">'+esc(schemaLivelloLabel(l))+'</button>').join('') + '</div>' +
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

/* ---------- picker: duplicazione seduta su un nuovo giorno ---------- */
function schemaDuplicatePickerHTML(){
  if(!state.schema.duplicatePicker) return '';
  const allenamentiOrdinati = state.allenamenti.slice().sort((a,b)=>(a.data||'').localeCompare(b.data||''));
  const oggi = new Date().toISOString().slice(0,10);
  const futuri = allenamentiOrdinati.filter(a=>a.data>=oggi);
  const list = futuri.length ? futuri : allenamentiOrdinati;
  const options = list.length
    ? list.map(a=>'<button class="btn" onclick="chooseSchemaDuplicateTarget(\''+a.id+'\')">'+formatDate(a.data)+'</button>').join('')
    : '<p class="hint">Nessun allenamento in calendario: creane uno prima in Calendario.</p>';
  return '<div class="schema-picker-overlay" onclick="if(event.target===this) closeSchemaDuplicatePicker();">' +
    '<div class="schema-picker-box">' +
      '<h3>Duplica su quale giorno?</h3>' +
      '<p class="hint">Stessi esercizi, livelli e durate; RPE e note ripartono vuoti.</p>' +
      '<div class="schema-picker-options">' + options + '</div>' +
      '<button class="btn btn-small" onclick="closeSchemaDuplicatePicker()">Annulla</button>' +
    '</div>' +
  '</div>';
}
function openSchemaDuplicatePicker(){
  state.schema.duplicatePicker = { sessionId: state.schema.sessionId };
  renderView();
}
function closeSchemaDuplicatePicker(){
  state.schema.duplicatePicker = null;
  renderView();
}
async function chooseSchemaDuplicateTarget(allenamentoId){
  const picker = state.schema.duplicatePicker;
  state.schema.duplicatePicker = null;
  if(!picker) return;
  const res = await apiPost('/api/schema/sessions/'+picker.sessionId+'/duplicate', { allenamentoId });
  if(res.session) await openSchemaSessionBuilder(res.session.id);
  else alert('Errore: '+(res.error||'sconosciuto'));
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
        '<div class="pitch-actions"><button class="btn btn-primary btn-small" onclick="createSchemaSessionBozza()">+ Nuova seduta</button></div>' +
      '</div>' +
      '<p class="hint">Lo stato si calcola da solo: bozza finché non è collegata a un giorno di allenamento, programmata se il giorno è futuro, eseguita quando il giorno è passato. Il nome della seduta è sempre "Allenamento del (data)", preso dal giorno collegato.</p>' +
      (s.sessions.length===0 ? '<p class="hint">Nessuna seduta ancora.</p>' :
        s.sessions.map(sess=>{
          return '<div class="schema-session-row" onclick="openSchemaSessionBuilder(\''+sess.id+'\')">' +
            '<strong>'+esc(schemaSessionDisplayName(sess))+'</strong>' +
            schemaSessionStatoPillHTML(sess.stato) +
            (sess.stato==='eseguita' && !sess.hasNote ? '<span class="pill pill-red">Note mancanti</span>' : '') +
            '<span class="hint">'+sess.items.length+' esercizi</span>' +
          '</div>';
        }).join('')
      ) +
    '</div>';
}
// Le sedute non hanno un titolo libero: il nome mostrato ovunque è sempre derivato dal
// giorno di allenamento collegato (o "bozza" se non ancora collegato). Il campo titolo
// resta nel DB solo come valore interno non mostrato.
function schemaSessionDisplayName(sess){
  const allenamento = sess.allenamentoId ? state.allenamenti.find(a=>a.id===sess.allenamentoId) : null;
  return allenamento ? 'Allenamento del '+formatDate(allenamento.data) : 'Nuova seduta (bozza, nessun giorno collegato)';
}
async function createSchemaSessionBozza(){
  const res = await apiPost('/api/schema/sessions', { titolo: 'Seduta', allenamentoId: null });
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
      : sessions.map(sess=>'<div class="schema-session-row" onclick="openSchemaSessionBuilder(\''+sess.id+'\')"><strong>'+esc(schemaSessionDisplayName(sess))+'</strong>'+schemaSessionStatoPillHTML(sess.stato)+'</div>').join('')
    ) +
  '</div>';
}
async function loadSchemaSessionDetail(id){
  const res = await apiGet('/api/schema/sessions/'+id);
  state.schema.currentSession = res.session || null;
  state.schema.sessionId = id;
}
// Riga di un esercizio sequenziale normale (slot con un solo item) — identica a prima
// dell'introduzione dei blocchi paralleli, solo con le frecce che spostano lo SLOT (vedi
// moveSchemaSessionSlot) invece del singolo item.
function schemaSessionItemRowHTML(item, slotIdx, slotsLength, canEditSedute){
  const titolo = item.livello ? item.livello.titolo : item.titoloSnapshot;
  const nomeLivello = schemaLivelloLabel({ nome: item.livello ? item.livello.nome : item.livelloSnapshot });
  return '<div class="schema-session-item-row">' +
    '<div><strong>'+esc(titolo)+'</strong><div class="hint">'+esc(nomeLivello)+(item.livello?'':' · esercizio non più in libreria')+'</div></div>' +
    '<input type="number" min="1" placeholder="min" value="'+(item.durataMinuti!=null?item.durataMinuti:'')+'" style="width:70px;" '+(canEditSedute?'':'disabled')+' onchange="setSchemaSessionItemDurata(\''+item.id+'\', this.value)">' +
    '<div class="pitch-actions">' +
      (canEditSedute && slotIdx>0 ? '<button class="btn btn-small" onclick="moveSchemaSessionSlot('+item.ordine+', -1)">↑</button>' : '') +
      (canEditSedute && slotIdx<slotsLength-1 ? '<button class="btn btn-small" onclick="moveSchemaSessionSlot('+item.ordine+', 1)">↓</button>' : '') +
      (item.livello && can('edit_esercizi') ? '<button class="btn btn-small" onclick="addSchemaSessionItemNote(\''+item.livello.esercizioId+'\')">Nota</button>' : '') +
      (canEditSedute ? '<button class="btn btn-small btn-danger" onclick="removeSchemaSessionItem(\''+item.id+'\')">Rimuovi</button>' : '') +
    '</div>' +
  '</div>';
}
// Card di un blocco di lavoro parallelo: N gruppi affiancati (ognuno un esercizio scelto
// dalla libreria), col toggle "si invertono" e i pulsanti per aggiungere un altro gruppo o
// eliminare l'intero blocco. Ogni gruppo si rimuove singolarmente con lo stesso pulsante
// "Rimuovi" degli esercizi normali (l'API scioglie automaticamente il blocco se resta un
// solo gruppo, vedi DELETE .../items/[itemId]).
function schemaSessionBlockRowHTML(slot, slotIdx, slotsLength, canEditSedute){
  const blocco = slot.items[0].blocco || { invertono:false };
  const groupsHtml = slot.items.map(function(item){
    const titolo = item.livello ? item.livello.titolo : item.titoloSnapshot;
    const nomeLivello = schemaLivelloLabel({ nome: item.livello ? item.livello.nome : item.livelloSnapshot });
    return '<div class="schema-block-group">' +
      '<div class="hint">Gruppo '+(item.gruppo||'?')+'</div>' +
      '<strong>'+esc(titolo)+'</strong>' +
      '<div class="hint">'+esc(nomeLivello)+(item.livello?'':' · esercizio non più in libreria')+'</div>' +
      '<input type="number" min="1" placeholder="min" value="'+(item.durataMinuti!=null?item.durataMinuti:'')+'" style="width:70px;" '+(canEditSedute?'':'disabled')+' onchange="setSchemaSessionItemDurata(\''+item.id+'\', this.value)">' +
      (canEditSedute ? '<button class="btn btn-small btn-danger" onclick="removeSchemaSessionItem(\''+item.id+'\')">Rimuovi gruppo</button>' : '') +
    '</div>';
  }).join('');
  return '<div class="schema-block-card">' +
    '<div class="schema-block-head">' +
      '<strong>⇄ Blocco parallelo</strong>' +
      (canEditSedute ? '<label class="schema-block-invertono"><input type="checkbox" '+(blocco.invertono?'checked':'')+' onchange="toggleSchemaBlockInvertono(\''+blocco.id+'\', this.checked)"> I gruppi si invertono a metà (tempo raddoppiato)</label>' : (blocco.invertono ? '<span class="hint">I gruppi si invertono a metà (tempo raddoppiato)</span>' : '')) +
      '<div class="pitch-actions">' +
        (canEditSedute && slotIdx>0 ? '<button class="btn btn-small" onclick="moveSchemaSessionSlot('+slot.ordine+', -1)">↑</button>' : '') +
        (canEditSedute && slotIdx<slotsLength-1 ? '<button class="btn btn-small" onclick="moveSchemaSessionSlot('+slot.ordine+', 1)">↓</button>' : '') +
        (canEditSedute ? '<button class="btn btn-small btn-danger" onclick="confirmRemoveSchemaSessionBlock(\''+blocco.id+'\')">Elimina blocco</button>' : '') +
      '</div>' +
    '</div>' +
    '<div class="schema-block-groups">' + groupsHtml +
      (canEditSedute ? '<button class="btn btn-small schema-block-add-group" onclick="pickSchemaBlockTarget(\''+blocco.id+'\')">+ Aggiungi gruppo</button>' : '') +
    '</div>' +
  '</div>';
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
  // Una seduta eseguita resta comunque modificabile ed eliminabile: lo stato è solo
  // un'informazione (bozza/programmata/eseguita calcolata dal calendario), non un vincolo.
  const canEditSedute = can('edit_sedute');
  return schemaSubNavHTML('sessions') +
    '<div class="card">' +
      '<div class="card-header-row"><h2 class="content-title">'+esc(schemaSessionDisplayName(sess))+'</h2>' +
        '<div class="pitch-actions">' +
          '<button class="btn btn-small" onclick="openSchemaSessions()">← Sedute</button>' +
          schemaSessionStatoPillHTML(sess.stato) +
          '<button class="btn btn-small" onclick="exportSchemaSessionImage()">Esporta immagine</button>' +
          '<button class="btn btn-small" onclick="exportSchemaSessionPDF()">Esporta PDF</button>' +
          '<button class="btn btn-small" onclick="shareSchemaSessionWhatsApp()">Condividi su WhatsApp</button>' +
          (canEditSedute ? '<button class="btn btn-small" onclick="openSchemaDuplicatePicker()">Duplica in una nuova data</button>' : '') +
          (canEditSedute ? '<button class="btn btn-small btn-danger" onclick="confirmDeleteSchemaSession()">Elimina</button>' : '') +
        '</div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="field"><label>Obiettivo fisico</label><select '+(canEditSedute?'':'disabled')+' onchange="onSchemaSessionObiettivoChange(this.value)">'+objOptions+'</select></div>' +
        '<div class="field"><label>Giorno di allenamento</label><select '+(canEditSedute?'':'disabled')+' onchange="saveSchemaSessionField(\'allenamentoId\', this.value)">'+allenamentoOptions+'</select></div>' +
        '<div class="field"><label>RPE seduta (1-10)</label><select '+(canEditSedute?'':'disabled')+' onchange="saveSchemaSessionField(\'rpe\', this.value)">'+rpeOptions+'</select></div>' +
      '</div>' +
      '<div class="form-row" style="align-items:center;">'+caricoBadge+'<span class="hint">Durata totale: '+sess.durataTotale+' min</span></div>' +
      '<div class="field field-grow"><label>Considerazioni pre-allenamento</label>' +
        '<span class="hint">Contesto, obiettivi, la partita precedente: scritte adesso componendo la seduta, finiscono in cima al foglio.</span>' +
        schemaConsiderazioniListHTML((sess.considerazioni||[]).filter(c=>c.momento==='pre')) +
        (can('write_considerazioni') ? (
          '<div class="form-row" style="margin-top:6px;">' +
            '<textarea id="schema-consid-pre-input" rows="2" placeholder="Scrivi una considerazione pre-allenamento..." style="flex:1;"></textarea>' +
            '<button class="btn btn-small" onclick="addSchemaConsiderazioneSeduta(\'pre\')">Aggiungi</button>' +
          '</div>'
        ) : '') +
      '</div>' +
      '<div class="field field-grow"><label>Considerazioni post-allenamento</label>' +
        '<span class="hint">Cosa hai visto tu o i collaboratori durante/dopo la seduta: restano in fondo al foglio.</span>' +
        schemaConsiderazioniListHTML((sess.considerazioni||[]).filter(c=>c.momento!=='pre')) +
        (can('write_considerazioni') ? (
          '<div class="form-row" style="margin-top:6px;">' +
            '<textarea id="schema-consid-post-input" rows="2" placeholder="Scrivi una considerazione post-allenamento..." style="flex:1;"></textarea>' +
            '<button class="btn btn-small" onclick="addSchemaConsiderazioneSeduta(\'post\')">Aggiungi</button>' +
          '</div>'
        ) : '') +
      '</div>' +
    '</div>' +
    (function(){
      const slots = schemaSessionSlots(sess.items);
      const pending = state.schema.pendingBlockTarget;
      // Se è attiva una scelta "aggiungi esercizio a questo blocco", la libreria si comporta
      // normalmente ma un banner in cima chiarisce dove finirà il click, con un modo per
      // annullare e tornare ad aggiungere in coda alla seduta come di consueto.
      const pendingBanner = pending
        ? '<div class="schema-block-pending-banner">Sto scegliendo l\'esercizio per un gruppo del blocco parallelo. <button type="button" class="btn btn-small" onclick="cancelSchemaBlockTarget()">Annulla</button></div>'
        : '';
      const librarySection =
        '<div class="card'+(canEditSedute?'':' readonly-block')+'">' +
          '<h3>Libreria esercizi</h3>' +
          pendingBanner +
          '<div class="schema-exercise-grid schema-exercise-grid-compact">' + s.exercises.map(e=>schemaExerciseCardHTML(e, "addSchemaSessionItem('"+e.id+"')", true)).join('') + '</div>' +
        '</div>';
      const sedutaSection =
        '<div class="card">' +
          '<div class="card-header-row"><h3>Esercizi nella seduta</h3>' +
            (canEditSedute ? '<button class="btn btn-small" onclick="addSchemaSessionBlock()" title="Due o più esercizi svolti nello stesso momento invece che in sequenza">+ Blocco parallelo</button>' : '') +
          '</div>' +
          (slots.length===0 ? '<p class="hint">Nessun esercizio aggiunto. Clicca un esercizio nella libreria per aggiungerlo.</p>' :
            slots.map(function(slot, idx){
              return slot.blockId
                ? schemaSessionBlockRowHTML(slot, idx, slots.length, canEditSedute)
                : schemaSessionItemRowHTML(slot.items[0], idx, slots.length, canEditSedute);
            }).join('')
          ) +
        '</div>';
      return '<div class="grid-2">' + librarySection + sedutaSection + '</div>';
    })() +
    '<div class="card">' +
      '<h3>Anteprima seduta (come viene esportata)</h3>' +
      '<p class="hint">Si aggiorna da sola man mano che aggiungi esercizi. Ogni foglio bianco è una pagina reale dell\'esportazione.</p>' +
      '<div class="schema-session-preview schema-print-page">' + schemaSessionExportSheetsHTML(sess, schemaSessionDisplayName(sess)) + '</div>' +
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
  showConfirmModal('Eliminare la seduta "'+schemaSessionDisplayName(state.schema.currentSession)+'"?', async () => {
    await apiDelete('/api/schema/sessions/'+state.schema.sessionId);
    openSchemaSessions();
  });
}
async function addSchemaSessionItem(exerciseId){
  const esercizio = state.schema.exercises.find(e=>e.id===exerciseId);
  if(!esercizio) return;
  if(esercizio.livelli.length>1){
    state.schema.livelloPicker = { titolo: esercizio.livelli[0].titolo, livelli: esercizio.livelli, onChoose: addSchemaSessionItemWithLivello };
    renderView();
    return;
  }
  await addSchemaSessionItemWithLivello(esercizio.livelli[0].id);
}
async function addSchemaSessionItemWithLivello(livelloId){
  let livello = null;
  state.schema.exercises.some(e=>{ const l = e.livelli.find(x=>x.id===livelloId); if(l){ livello = l; return true; } return false; });
  const durataMinuti = livello ? livello.ripetizioni*livello.durataRipetizione : null;
  // Se è attiva una scelta "sto aggiungendo un gruppo a questo blocco parallelo" (vedi
  // addSchemaSessionBlock/pickSchemaBlockTarget), l'esercizio finisce in quel blocco invece
  // che in coda alla seduta — consumato subito dopo, un solo utilizzo per volta.
  const blockId = state.schema.pendingBlockTarget ? state.schema.pendingBlockTarget.blockId : null;
  state.schema.pendingBlockTarget = null;
  await apiPost('/api/schema/sessions/'+state.schema.sessionId+'/items', { livelloId, durataMinuti, blockId });
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
// Raggruppa gli item della seduta in "slot" per ordine: uno slot con un solo item è un
// esercizio sequenziale normale, uno slot con 2+ item (stesso blockId) è un blocco di lavoro
// parallelo — vedi SessionBlock/SessionItem.blockId in prisma/schema.prisma. Gli item sono
// già ordinati [ordine, gruppo] dal server, quindi accorpare le righe consecutive con lo
// stesso ordine basta.
function schemaSessionSlots(items){
  const slots = [];
  let cur = null;
  items.forEach(function(it){
    if(cur && cur.ordine===it.ordine) cur.items.push(it);
    else { cur = { ordine: it.ordine, blockId: it.blockId||null, items:[it] }; slots.push(cur); }
  });
  return slots;
}
// Sposta uno SLOT intero (un item singolo o tutti i gruppi di un blocco insieme) scambiando
// il suo "ordine" con quello dello slot adiacente — così un blocco si muove come un'unica
// unità nella sequenza, mai un suo singolo gruppo separatamente dagli altri.
async function moveSchemaSessionSlot(ordine, dir){
  const slots = schemaSessionSlots(state.schema.currentSession.items);
  const idx = slots.findIndex(s=>s.ordine===ordine);
  if(idx<0) return;
  const swapIdx = idx+dir;
  if(swapIdx<0 || swapIdx>=slots.length) return;
  const a = slots[idx], b = slots[swapIdx];
  await Promise.all(
    a.items.map(function(it){ return apiPatch('/api/schema/sessions/'+state.schema.sessionId+'/items/'+it.id, { ordine: b.ordine }); })
    .concat(b.items.map(function(it){ return apiPatch('/api/schema/sessions/'+state.schema.sessionId+'/items/'+it.id, { ordine: a.ordine }); }))
  );
  await loadSchemaSessionDetail(state.schema.sessionId);
  renderView();
}
async function addSchemaSessionBlock(){
  const res = await apiPost('/api/schema/sessions/'+state.schema.sessionId+'/blocks', {});
  if(res.block){
    // Il blocco nasce vuoto: si passa subito in modalità "scegli il primo esercizio",
    // così il coach clicca direttamente una card della libreria per riempire il Gruppo 1.
    state.schema.pendingBlockTarget = { blockId: res.block.id };
    renderView();
  } else alert('Errore: '+(res.error||'sconosciuto'));
}
function pickSchemaBlockTarget(blockId){
  state.schema.pendingBlockTarget = { blockId: blockId };
  renderView();
}
function cancelSchemaBlockTarget(){
  state.schema.pendingBlockTarget = null;
  renderView();
}
async function toggleSchemaBlockInvertono(blockId, checked){
  await apiPatch('/api/schema/sessions/'+state.schema.sessionId+'/blocks/'+blockId, { invertono: checked });
  await loadSchemaSessionDetail(state.schema.sessionId);
  renderView();
}
function confirmRemoveSchemaSessionBlock(blockId){
  showConfirmModal('Eliminare questo blocco parallelo? Vengono rimossi tutti i suoi gruppi.', async function(){
    await apiDelete('/api/schema/sessions/'+state.schema.sessionId+'/blocks/'+blockId);
    await loadSchemaSessionDetail(state.schema.sessionId);
    renderView();
  });
}

/* ---------- esportazione seduta: immagine / PDF / WhatsApp ---------- */
function schemaAvailablePlayersForSession(sess){
  const allenamento = sess.allenamentoId ? state.allenamenti.find(a=>a.id===sess.allenamentoId) : null;
  if(!allenamento) return state.players.slice();
  return state.players.filter(p=>{
    const v = (allenamento.presenze && allenamento.presenze[p.id]) || defaultPresenzaFor(p, allenamento.data);
    return v === 'Disponibile';
  });
}
// Solo ruolo + giocatori sotto, elenco semplice senza campo/card posizionate: qui serve
// leggere in fretta chi copre cosa, non vedere la disposizione tattica (quella è nella
// vista Formazione).
function schemaFormationLineupHTML(sess, availablePlayers){
  const def = state.formazioneDefault;
  if(!def || !def.modulo || !(def.slots||[]).length){
    return '<p class="hint">Imposta prima una formazione predefinita in Rosa per vedere qui i ruoli coperti.</p>';
  }
  const availableIds = new Set(availablePlayers.map(p=>p.id));
  const surnameCounts = pianoSurnameCounts();
  const groupsHtml = def.slots.map(s=>{
    const rows = [0,1,2].map(idx=>{
      const pid = getPianoScelta(s.numero, idx);
      const p = pid ? state.players.find(pl=>pl.id===pid) : null;
      const label = p ? esc(pianoDisplayName(p, surnameCounts)) : '<span class="piano-pitch-empty">—</span>';
      const availCls = p ? (availableIds.has(p.id) ? 'schema-pick-available' : 'schema-pick-absent') : '';
      return '<div class="schema-lineup-player '+availCls+'">'+label+'</div>';
    }).join('');
    return '<div class="schema-lineup-role-group"><div class="schema-lineup-role-label">'+esc(s.ruolo)+'</div>'+rows+'</div>';
  }).join('');
  return '<div class="schema-lineup-list">' + groupsHtml + '</div>';
}
function schemaSessionExportItemHTML(item, idx){
  if(!item.livello) return '<div class="schema-export-item"><h3>'+(idx+1)+'. '+esc(item.titoloSnapshot)+'</h3><p class="hint">Esercizio non più in libreria.</p></div>';
  const ex = item.livello.esercizio;
  const cats = schemaExerciseCategorie(ex).map(schemaCategoriaInfo).filter(Boolean);
  const tags = schemaExerciseTags(ex);
  const lv = item.livello;
  const totaleCalcolato = Math.round(lv.ripetizioni*lv.durataRipetizione + Math.max(lv.ripetizioni-1,0)*(lv.recuperoSecondi||0)/60);
  const tempoTotale = item.durataMinuti!=null ? item.durataMinuti : totaleCalcolato;
  // Il "Livello" (A/B/C) è uno strumento di lavoro in libreria per scegliere quale
  // versione usare: una volta scelta per la seduta non ha senso etichettarla sulla
  // stampa, conta solo il contenuto di quella versione. In stampa vanno sia la
  // descrizione generale (perché/a cosa serve) sia lo svolgimento del livello scelto
  // (come si fa) — due informazioni diverse, entrambe utili in campo — con la
  // formattazione (grassetto/dimensione, marcatori **/++) e gli a-capo preservati.
  return '<div class="schema-export-item">' +
    '<div class="schema-export-item-text">' +
      '<h3>'+(idx+1)+'. '+esc(lv.titolo)+'</h3>' +
      '<p>Tempo totale: '+tempoTotale+' min · '+lv.ripetizioni+'×'+lv.durataRipetizione+' min · recupero '+lv.recuperoSecondi+'s tra le serie</p>' +
      '<p class="hint">Campo: '+(lv.lunghezzaCampo||'—')+'×'+(lv.larghezzaCampo||'—')+' m</p>' +
      '<p class="hint">Obiettivo: ' +
        (cats.length ? cats.map(cat=>'<span class="schema-cat-chip" style="background:'+cat.color+';">'+esc(cat.label)+'</span>').join(' ') : 'Non categorizzato') +
        (tags.length ? ' · '+esc(tags.join(', ')) : '') +
      '</p>' +
      (ex.descrizione ? '<p>'+schemaRichTextToHTML(ex.descrizione)+'</p>' : '') +
      (lv.descrizione ? '<p>'+schemaRichTextToHTML(lv.descrizione)+'</p>' : '') +
    '</div>' +
    (lv.mostraDisegno!==false ? '<div class="schema-export-field schema-export-item-diagram">' + renderSchemaFieldSVG(item.livello, false, true) + '</div>' : '') +
  '</div>';
}
// Un blocco di lavoro parallelo stampa i suoi gruppi affiancati in UNA sola voce numerata
// (non una per gruppo, coerente con "senza ripetere l'intero blocco nella stampa"): la nota
// sui gruppi che si invertono basta da sola a comunicare che il tempo è raddoppiato, senza
// bisogno di duplicare le righe.
function schemaSessionExportBlockHTML(slot, idx){
  const blocco = slot.items[0].blocco || { invertono:false };
  const columns = slot.items.map(function(item){
    if(!item.livello) return '<div class="schema-export-block-col"><h4>Gruppo '+(item.gruppo||'?')+'</h4><p class="hint">Esercizio non più in libreria.</p></div>';
    const ex = item.livello.esercizio;
    const cats = schemaExerciseCategorie(ex).map(schemaCategoriaInfo).filter(Boolean);
    const lv = item.livello;
    const totaleCalcolato = Math.round(lv.ripetizioni*lv.durataRipetizione + Math.max(lv.ripetizioni-1,0)*(lv.recuperoSecondi||0)/60);
    const tempoTotale = item.durataMinuti!=null ? item.durataMinuti : totaleCalcolato;
    return '<div class="schema-export-block-col">' +
      '<h4>Gruppo '+(item.gruppo||'?')+' — '+esc(lv.titolo)+'</h4>' +
      (lv.mostraDisegno!==false ? '<div class="schema-export-field schema-export-item-diagram">' + renderSchemaFieldSVG(lv, false, true) + '</div>' : '') +
      '<p class="hint">'+tempoTotale+' min · '+lv.ripetizioni+'×'+lv.durataRipetizione+' min · recupero '+lv.recuperoSecondi+'s</p>' +
      (cats.length ? '<p class="hint">'+esc(cats.map(c=>c.label).join(', '))+'</p>' : '') +
      (lv.descrizione ? '<p>'+schemaRichTextToHTML(lv.descrizione)+'</p>' : '') +
    '</div>';
  }).join('');
  return '<div class="schema-export-item schema-export-block">' +
    '<h3>'+(idx+1)+'. Blocco parallelo'+(blocco.invertono ? ' <span class="hint">⇄ i gruppi si invertono a metà, tempo raddoppiato</span>' : '')+'</h3>' +
    '<div class="schema-export-block-cols">' + columns + '</div>' +
  '</div>';
}
// Invece di rimpicciolire tutto per stare su una sola facciata, si impagina su più fogli
// A4 leggibili: il primo ha meta+ruoli coperti (che occupano già spazio) + 2 esercizi, i
// successivi 3 esercizi ciascuno visto che hanno tutta la pagina libera. Ogni voce
// dell'array è l'HTML del contenuto di UN foglio (senza il wrapper .schema-print-sheet).
function schemaSessionExportPages(sess){
  const allenamento = sess.allenamentoId ? state.allenamenti.find(a=>a.id===sess.allenamentoId) : null;
  const players = schemaAvailablePlayersForSession(sess);
  const metaParts = [];
  if(allenamento && allenamento.ora) metaParts.push('Ore '+esc(allenamento.ora));
  if(sess.obiettivo) metaParts.push('Obiettivo: '+esc(sess.obiettivo.label));
  if(sess.rpe!=null) metaParts.push('RPE '+sess.rpe);
  if(sess.caricoTotale!=null) metaParts.push('Carico '+sess.caricoTotale);
  metaParts.push('Durata '+sess.durataTotale+' min');

  // Un blocco parallelo conta come UNA voce nella sequenza/impaginazione (2 poi 3 per
  // pagina), non una per gruppo: occupa lo spazio di un esercizio normale, solo più largo.
  const itemsHtml = schemaSessionSlots(sess.items).map((slot, idx)=>
    slot.blockId ? schemaSessionExportBlockHTML(slot, idx) : schemaSessionExportItemHTML(slot.items[0], idx)
  );
  const pages = [];

  // Le considerazioni pre-allenamento (contesto/obiettivi scritti componendo la seduta)
  // aprono il foglio, prima ancora dei ruoli coperti: sono il motivo per cui la seduta è
  // fatta così, vanno lette per prime. Quelle post (cosa si è visto) restano dove sempre,
  // in fondo all'ultima pagina.
  const considerazioniPre = (sess.considerazioni||[]).filter(c=>c.momento==='pre');
  const considerazioniPost = (sess.considerazioni||[]).filter(c=>c.momento!=='pre');
  const considerazioniHTML = (list, titolo)=> list.length
    ? '<h2>'+titolo+'</h2>' + list.map(c=>
        '<p><strong style="color:'+schemaAutoreColor(c.autoreId)+';">'+esc(schemaAutoreShortName(c.autoreNome))+':</strong> '+esc(c.testo).replace(/\n/g,'<br>')+'</p>'
      ).join('')
    : '';

  const firstChunk = itemsHtml.slice(0, 2);
  pages.push(
    '<p>'+metaParts.join(' · ')+'</p>' +
    considerazioniHTML(considerazioniPre, 'Considerazioni pre-allenamento') +
    '<h2>Ruoli coperti ('+players.length+' disponibili)</h2>' +
    '<div class="schema-export-pitch">' + schemaFormationLineupHTML(sess, players) + '</div>' +
    (firstChunk.length ? '<h2>Esercizi</h2>' + firstChunk.join('') : '')
  );

  let rest = itemsHtml.slice(2);
  while(rest.length){
    pages.push(rest.slice(0, 3).join(''));
    rest = rest.slice(3);
  }

  if(considerazioniPost.length){
    pages[pages.length-1] += considerazioniHTML(considerazioniPost, 'Considerazioni post-allenamento');
  }

  return pages;
}
// Ogni foglio è un .schema-print-sheet in proporzione A4: quello che vedi nell'anteprima
// a schermo (dentro il costruttore seduta) è esattamente quello che viene esportato.
function schemaSessionExportSheetsHTML(sess, nomeSeduta){
  const pages = schemaSessionExportPages(sess);
  return pages.map((pageHtml, i)=>{
    const header = i===0
      ? '<h1>'+esc(nomeSeduta)+'</h1>'
      : '<div class="schema-print-page-header">'+esc(nomeSeduta)+' <span class="hint">— pag. '+(i+1)+'/'+pages.length+'</span></div>';
    return '<div class="schema-print-sheet">' + header + pageHtml + '</div>';
  }).join('');
}
// Sfondo bianco fisso (non quello scuro dell'app): stessa resa per immagine, PDF e
// condivisione.
function buildSchemaPrintHolder(sess, nomeSeduta){
  const holder = document.createElement('div');
  holder.className = 'schema-print-page';
  holder.style.position = 'fixed'; holder.style.left = '-9999px'; holder.style.top = '0';
  holder.innerHTML = schemaSessionExportSheetsHTML(sess, nomeSeduta);
  document.body.appendChild(holder);
  return holder;
}
function exportSchemaSessionImage(){
  const sess = state.schema.currentSession;
  if(!sess) return;
  ensureHtml2Canvas(function(){
    const nomeSeduta = schemaSessionDisplayName(sess);
    const holder = buildSchemaPrintHolder(sess, nomeSeduta);
    const sheets = Array.from(holder.querySelectorAll('.schema-print-sheet'));
    const baseName = nomeSeduta.replace(/[^a-z0-9]+/gi,'-').toLowerCase();
    // Una immagine per foglio, scaricate in sequenza (non tutte insieme: alcuni browser
    // bloccano download multipli simultanei come popup).
    let chain = Promise.resolve();
    sheets.forEach(function(sheetEl, i){
      chain = chain.then(function(){
        return html2canvas(sheetEl, { backgroundColor:'#FFFFFF', scale:2 }).then(function(canvas){
          const link = document.createElement('a');
          link.download = sheets.length>1 ? baseName+'-pagina-'+(i+1)+'.png' : baseName+'.png';
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link); link.click(); link.remove();
        });
      });
    });
    chain.then(function(){ holder.remove(); }).catch(function(err){
      console.error('export seduta image error', err);
      alert('Esportazione immagine non riuscita.');
      holder.remove();
    });
  });
}
function exportSchemaSessionPDF(){
  const sess = state.schema.currentSession;
  if(!sess) return;
  const nomeSeduta = schemaSessionDisplayName(sess);
  // Non uso exportPDF(title, body): metterebbe un <h1> duplicato fuori dal primo foglio,
  // che già include il proprio titolo nell'intestazione.
  const area = document.getElementById('print-area');
  area.innerHTML = '<div class="schema-print-page">' + schemaSessionExportSheetsHTML(sess, nomeSeduta) + '</div>';
  window.print();
}
async function shareSchemaSessionWhatsApp(){
  const sess = state.schema.currentSession;
  if(!sess) return;
  const nomeSeduta = schemaSessionDisplayName(sess);
  const testo = nomeSeduta+(sess.rpe!=null?' (RPE '+sess.rpe+')':'')+' — '+sess.items.length+' esercizi, '+sess.durataTotale+' min.';
  // Condivisione con immagini allegate: supportata solo dai browser con Web Share API
  // "livello 2" (perlopiù mobile), un file per foglio. Altrove si apre WhatsApp con solo
  // il testo: le immagini vanno allegate a mano dopo averle scaricate con "Esporta immagine".
  if(navigator.share && navigator.canShare){
    try{
      await ensureHtml2CanvasPromise();
      const holder = buildSchemaPrintHolder(sess, nomeSeduta);
      const sheets = Array.from(holder.querySelectorAll('.schema-print-sheet'));
      const files = [];
      for(let i=0;i<sheets.length;i++){
        const canvas = await html2canvas(sheets[i], { backgroundColor:'#FFFFFF', scale:2 });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        files.push(new File([blob], 'seduta-pagina-'+(i+1)+'.png', { type:'image/png' }));
      }
      holder.remove();
      if(navigator.canShare({ files })){
        await navigator.share({ files, title: nomeSeduta, text: testo });
        return;
      }
      await navigator.share({ title: nomeSeduta, text: testo });
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
  if(getAppUser().isOwner) await loadTeamInvites();
  renderView();
}
async function loadTeamInvites(){
  const res = await apiGet('/api/team/invites');
  state.team.invites = res.invites || [];
  state.team.loaded = true;
}
// Aperto a chiunque abbia sessione (a differenza di loadTeamInvites, solo il proprietario):
// serve a risolvere nome+colore di chi ha scritto una Considerazione, non a gestire la squadra.
async function ensureTeamRoster(){
  if(state.team.rosterLoaded) return;
  const res = await apiGet('/api/team/roster');
  state.team.roster = res.roster || [];
  state.team.rosterLoaded = true;
}
function schemaAutoreColor(autoreId){
  const m = state.team.roster.find(r=>r.userId===autoreId);
  return m ? m.colore : '#8CA0AF';
}
// autoreNome è oggi l'email (non c'è ancora un nome visualizzato): si mostra solo la
// parte prima della "@" per restare leggibile in un chip piccolo.
function schemaAutoreShortName(autoreNome){
  const at = (autoreNome||'').indexOf('@');
  return at>0 ? autoreNome.slice(0,at) : (autoreNome||'?');
}
function schemaConsiderazioneRowHTML(c){
  const color = schemaAutoreColor(c.autoreId);
  const mine = c.autoreId===getAppUser().actorId;
  const canDelete = mine || getAppUser().isOwner;
  return '<div class="schema-consid-row" style="border-left-color:'+color+';">' +
    '<div class="schema-consid-head"><span class="schema-consid-author" style="color:'+color+';">'+esc(schemaAutoreShortName(c.autoreNome))+'</span>' +
    (canDelete ? '<button class="btn-icon" onclick="deleteSchemaConsiderazione(\''+c.id+'\')" aria-label="Elimina">×</button>' : '') +
    '</div>' +
    '<p class="schema-consid-testo">'+esc(c.testo).replace(/\n/g,'<br>')+'</p>' +
  '</div>';
}
function schemaConsiderazioniListHTML(considerazioni){
  return considerazioni.length
    ? '<div class="schema-consid-list">' + considerazioni.map(schemaConsiderazioneRowHTML).join('') + '</div>'
    : '<p class="hint">Nessuna considerazione ancora.</p>';
}
async function addSchemaConsiderazioneSeduta(momento){
  const el = document.getElementById('schema-consid-'+momento+'-input');
  const testo = el.value.trim();
  if(!testo) return;
  const res = await apiPost('/api/schema/considerazioni', { sedutaId: state.schema.sessionId, testo, momento });
  if(res.considerazione){
    state.schema.currentSession.considerazioni = (state.schema.currentSession.considerazioni||[]).concat(res.considerazione);
    el.value = '';
    renderView();
  } else alert('Errore: '+(res.error||'sconosciuto'));
}
async function deleteSchemaConsiderazione(id){
  const res = await apiDelete('/api/schema/considerazioni/'+id);
  if(res.ok){
    if(state.schema.currentSession) state.schema.currentSession.considerazioni = (state.schema.currentSession.considerazioni||[]).filter(c=>c.id!==id);
    state.team.considerazioniGeneriche = state.team.considerazioniGeneriche.filter(c=>c.id!==id);
    renderView();
  } else alert('Errore: '+(res.error||'sconosciuto'));
}
function inviteLinkFor(token){
  return window.location.origin + '/register?invite=' + token;
}
async function createTeamInvite(){
  const emailEl = document.getElementById('team-invite-email');
  const email = emailEl.value.trim();
  if(!email){ alert('Inserisci l\'email della persona da invitare.'); return; }
  const permissions = readPermissionCheckboxes('team-invite-permissions');
  const res = await apiPost('/api/team/invites', { email, permissions });
  if(res.invite){
    emailEl.value = '';
    state.team.lastInviteLink = inviteLinkFor(res.invite.inviteToken);
    await loadTeamInvites();
    renderView();
  } else alert('Errore: '+(res.error||'sconosciuto'));
}
function copyInviteLink(token){
  const link = inviteLinkFor(token);
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(()=>alert('Link copiato:\n'+link)).catch(()=>alert(link));
  } else alert(link);
}
function openEditPermissionsModal(id){
  const inv = state.team.invites.find(i=>i.id===id);
  if(!inv) return;
  const box = document.getElementById('event-modal-box');
  box.innerHTML =
    '<h3>Permessi — '+esc(inv.email)+'</h3>' +
    permissionCheckboxesHTML('edit-permissions-container', inv.permissions) +
    '<div class="modal-actions"><button class="btn" onclick="closeEventModal()">Annulla</button><button class="btn btn-primary" onclick="saveTeamMemberPermissions(\''+id+'\')">Salva</button></div>';
  document.getElementById('event-modal-overlay').style.display = 'flex';
}
async function saveTeamMemberPermissions(id){
  const permissions = readPermissionCheckboxes('edit-permissions-container');
  const res = await apiPatch('/api/team/invites/'+id, { permissions });
  if(res.teamMember){ closeEventModal(); await loadTeamInvites(); renderView(); }
  else alert('Errore: '+(res.error||'sconosciuto'));
}
function revokeTeamMember(id, email){
  showConfirmModal('Revocare l\'accesso di '+email+'? Potrai riattivarlo in qualunque momento.', async function(){
    const res = await apiPatch('/api/team/invites/'+id, { revoke:true });
    if(res.teamMember){ await loadTeamInvites(); renderView(); }
    else alert('Errore: '+(res.error||'sconosciuto'));
  }, 'Revoca');
}
async function reactivateTeamMember(id){
  const res = await apiPatch('/api/team/invites/'+id, { reactivate:true });
  if(res.teamMember){ await loadTeamInvites(); renderView(); }
  else alert('Errore: '+(res.error||'sconosciuto'));
}
// Stessa lista di lib/permissions.js: duplicata qui perché public/app.js è uno script
// statico caricato via <script src="/app.js">, non un modulo Next bundlizzato — non può
// fare import da lib/*. Stesso motivo per cui TEAM_ROLE_LABELS era già duplicata prima.
const PERMISSION_LABELS = {
  view_rosa: 'Visualizzare la Rosa',
  view_calendario: 'Visualizzare il Calendario',
  view_formazione: 'Visualizzare la Formazione predefinita',
  view_piano_squadra: 'Visualizzare il Piano Squadra',
  view_allenamenti: 'Visualizzare il modulo Allenamenti (libreria esercizi, sedute, considerazioni)',
  edit_rosa: 'Modificare anagrafica giocatori',
  edit_calendario: 'Modificare partite e allenamenti in calendario',
  edit_formazione: 'Modificare la formazione predefinita',
  edit_piano_squadra: 'Modificare il Piano Squadra',
  edit_presenze: 'Segnare le presenze agli allenamenti',
  edit_esercizi: 'Creare/modificare esercizi, livelli, fasi e focus',
  edit_sedute: 'Creare/modificare le sedute di allenamento',
  write_considerazioni: 'Scrivere considerazioni',
  manage_stagioni: 'Gestire le stagioni (chiudere/aprire, importare giocatori)',
};
const PERMISSION_GROUPS = [
  { section: 'Rosa', keys: ['view_rosa', 'edit_rosa'] },
  { section: 'Calendario', keys: ['view_calendario', 'edit_calendario', 'edit_presenze'] },
  { section: 'Formazione', keys: ['view_formazione', 'edit_formazione'] },
  { section: 'Piano Squadra', keys: ['view_piano_squadra', 'edit_piano_squadra'] },
  { section: 'Allenamenti', keys: ['view_allenamenti', 'edit_esercizi', 'edit_sedute', 'write_considerazioni'] },
  { section: 'Stagioni', keys: ['manage_stagioni'] },
];
const PERMISSION_IMPLIES_VIEW = {
  edit_rosa: ['view_rosa'],
  edit_calendario: ['view_calendario'],
  edit_formazione: ['view_formazione'],
  edit_piano_squadra: ['view_piano_squadra'],
  edit_presenze: ['view_calendario', 'view_rosa'],
  edit_esercizi: ['view_allenamenti'],
  edit_sedute: ['view_allenamenti'],
  write_considerazioni: ['view_allenamenti'],
  manage_stagioni: ['view_rosa', 'view_calendario'],
};
function permissionCheckboxesHTML(containerId, selected){
  const sel = new Set(selected||[]);
  return '<div id="'+containerId+'" class="permission-groups">' + PERMISSION_GROUPS.map(g=>
    '<fieldset class="permission-group"><legend>'+esc(g.section)+'</legend>' +
      g.keys.map(k=>
        '<label class="permission-check"><input type="checkbox" value="'+k+'" '+(sel.has(k)?'checked':'')+' onchange="onPermissionCheckboxChange(\''+containerId+'\',\''+k+'\',this.checked)"> '+esc(PERMISSION_LABELS[k])+'</label>'
      ).join('') +
    '</fieldset>'
  ).join('') + '</div>';
}
// Quando si spunta una chiave edit/azione, pre-seleziona anche le view implicate (solo un
// default utile: restano comunque deselezionabili a mano, il server non lo impone — vedi
// lib/permissions.js).
function onPermissionCheckboxChange(containerId, key, checked){
  if(!checked || !PERMISSION_IMPLIES_VIEW[key]) return;
  const container = document.getElementById(containerId);
  if(!container) return;
  PERMISSION_IMPLIES_VIEW[key].forEach(viewKey=>{
    const el = container.querySelector('input[value="'+viewKey+'"]');
    if(el && !el.checked) el.checked = true;
  });
}
function readPermissionCheckboxes(containerId){
  const container = document.getElementById(containerId);
  if(!container) return [];
  return Array.from(container.querySelectorAll('input[type=checkbox]:checked')).map(el=>el.value);
}
function renderTeamSectionHTML(){
  if(!getAppUser().isOwner) return '';
  const t = state.team;
  const rows = t.invites.map(inv=>{
    const pending = !inv.joinedAt;
    const stato = pending ? 'Invito in attesa' : (inv.revokedAt ? 'Revocato' : 'Attivo');
    const statoClass = pending ? 'pill-muted' : (inv.revokedAt ? 'pill-red' : 'pill-win');
    const permCount = (inv.permissions||[]).length;
    return '<div class="schema-session-row" style="cursor:default;">' +
      '<strong>'+esc(inv.email)+'</strong>' +
      '<span class="pill '+statoClass+'">'+stato+'</span>' +
      (inv.revokedAt ? '<span class="hint">Permessi ('+permCount+')</span>' : '<button class="btn btn-small" onclick="openEditPermissionsModal(\''+inv.id+'\')">Permessi ('+permCount+')</button>') +
      (pending && !inv.revokedAt ? '<button class="btn btn-small" onclick="copyInviteLink(\''+inv.inviteToken+'\')">Copia link invito</button>' : '') +
      (inv.revokedAt
        ? '<button class="btn btn-small" onclick="reactivateTeamMember(\''+inv.id+'\')">Riattiva</button>'
        : '<button class="btn btn-small btn-danger" onclick="revokeTeamMember(\''+inv.id+'\', \''+esc(inv.email).replace(/'/g,"\\'")+'\')">Revoca</button>'
      ) +
    '</div>';
  }).join('');
  return '<div class="card"><h3>Collaboratori</h3>' +
    '<p class="hint">Invita una persona e scegli quali sezioni può vedere e cosa può modificare — nessun ruolo preimpostato, i permessi sono tuoi da scegliere per ciascuno. Nessuna email viene inviata: copia il link e condividilo tu.</p>' +
    '<div class="form-row">' +
      '<div class="field field-grow"><label>Email da invitare</label><input id="team-invite-email" type="email" placeholder="email@esempio.it"></div>' +
    '</div>' +
    permissionCheckboxesHTML('team-invite-permissions', []) +
    '<div class="form-row"><button class="btn btn-primary btn-small" onclick="createTeamInvite()">Invita</button></div>' +
    (t.lastInviteLink ? '<p class="hint">Ultimo link generato: <code>'+esc(t.lastInviteLink)+'</code> <button class="btn btn-small" onclick="copyInviteLink(\''+t.lastInviteLink.split('invite=')[1]+'\')">Copia</button></p>' : '') +
    (rows ? rows : '<p class="hint">Nessun collaboratore invitato finora.</p>') +
  '</div>';
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
function toggleStagioneIdentityForm(){
  state.stagioni.showIdentityForm = !state.stagioni.showIdentityForm;
  renderView();
}
async function submitStagioneIdentity(attivaId){
  const societa = document.getElementById('stagione-id-societa').value.trim();
  const etichetta = document.getElementById('stagione-id-etichetta').value.trim();
  let tipoSquadra = document.getElementById('stagione-id-tipo').value;
  if(tipoSquadra==='Altro'){
    const alt = document.getElementById('stagione-id-tipo-altro');
    if(alt && alt.value.trim()) tipoSquadra = alt.value.trim();
  }
  let livello = document.getElementById('stagione-id-livello').value;
  if(livello==='Altro'){
    const alt = document.getElementById('stagione-id-livello-altro');
    if(alt && alt.value.trim()) livello = alt.value.trim();
  }
  if(!societa || !etichetta){ alert('Società ed etichetta stagione sono obbligatorie.'); return; }
  const res = await apiPatch('/api/stagioni/'+attivaId, { etichetta, societa, tipoSquadra, livello });
  if(res.stagione){
    location.reload();
  } else alert('Errore: '+(res.error||'sconosciuto'));
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
    'Chiudere la stagione attiva e iniziarne una nuova ("'+societa+' — '+tipoSquadra+' '+livello+'")? Calendario, rosa, formazione predefinita e piano squadra ripartiranno vuoti (restano consultabili nell\'archivio); la libreria Allenamenti resta condivisa. Potrai importare giocatori dalle stagioni precedenti dall\'archivio.',
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
    '<p class="hint">Chiudere la stagione attiva azzera calendario e rosa della nuova (restano consultabili nell\'archivio); la libreria Allenamenti resta condivisa.</p>' +
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
function renderStagioneIdentityForm(attiva){
  const s = state.stagioni;
  const tipoOptions = STAGIONE_TIPI.map(t=>'<option value="'+t+'" '+(s.newTipo===t?'selected':'')+'>'+esc(t)+'</option>').join('');
  const livelli = STAGIONE_LIVELLI[s.newTipo] || ['Altro'];
  const livelloOptions = livelli.map(l=>'<option value="'+l+'" '+(s.newLivello===l?'selected':'')+'>'+esc(l)+'</option>').join('');
  return '<div style="margin-top:12px; border-top:1px solid var(--border); padding-top:12px;">' +
    '<p class="hint">Questa stagione è ancora vuota: darle un nome non la archivia, la configura semplicemente.</p>' +
    '<div class="form-row">' +
      '<div class="field"><label>Società</label><input id="stagione-id-societa" type="text" placeholder="es. Mirandolese" value="'+esc(attiva.societa||'')+'"></div>' +
      '<div class="field"><label>Tipo squadra</label><select id="stagione-id-tipo" onchange="onStagioneTipoChange(this.value)">'+tipoOptions+'</select></div>' +
      '<div class="field"><label>Livello</label><select id="stagione-id-livello" onchange="state.stagioni.newLivello=this.value; renderView();">'+livelloOptions+'</select></div>' +
      '<div class="field"><label>Etichetta stagione</label><input id="stagione-id-etichetta" type="text" placeholder="es. 2026/27" value="'+esc(attiva.etichetta||'')+'"></div>' +
    '</div>' +
    (s.newTipo==='Altro' ? '<div class="field"><label>Specifica tipo squadra</label><input id="stagione-id-tipo-altro" type="text"></div>' : '') +
    (s.newLivello==='Altro' ? '<div class="field"><label>Specifica livello</label><input id="stagione-id-livello-altro" type="text"></div>' : '') +
    '<button class="btn btn-primary btn-small" onclick="submitStagioneIdentity(\''+attiva.id+'\')">Salva</button>' +
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
      (can('manage_stagioni') ?
        '<div class="pitch-actions" style="margin-bottom:8px;">' +
          '<button class="btn btn-small" onclick="importSelectedStagionePlayers()">Importa selezionati nella stagione attiva</button>' +
        '</div>' : '') +
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
  const isAdmin = can('manage_stagioni');
  const attiva = s.list.find(x=>x.attiva);
  const chiuse = s.list.filter(x=>!x.attiva);
  // Una stagione "vergine" (mai usata: zero giocatori e zero partite, tipicamente quella
  // creata automaticamente al primo accesso di un account nuovo) non ha nulla da "chiudere"
  // — offrire lì il flusso chiudi-e-nuova creerebbe una voce fantasma vuota nell'archivio
  // a ogni nuovo account. Le si dà invece un modo per impostare la propria identità sul
  // posto, senza archiviarla.
  const attivaVergine = attiva && state.players.length===0 && state.matches.length===0;
  return '<div class="card">' +
    '<div class="card-header-row"><h2>Stagioni</h2><button class="btn btn-small" onclick="backToCalendarioFromStagioni()">← Torna al gestionale</button></div>' +
    (attiva ? '<p class="hint">Stagione attiva: <strong>'+esc(attiva.societa||'da configurare')+' — '+esc(attiva.tipoSquadra)+' '+esc(attiva.livello)+'</strong> ('+esc(attiva.etichetta)+')</p>' : '<p class="hint">Nessuna stagione attiva trovata.</p>') +
    (isAdmin && attivaVergine ? '<button class="btn btn-primary btn-small" onclick="toggleStagioneIdentityForm()">'+(s.showIdentityForm?'Annulla':'Configura la tua squadra')+'</button>' : '') +
    (isAdmin && attivaVergine && s.showIdentityForm ? renderStagioneIdentityForm(attiva) : '') +
    (isAdmin && !attivaVergine ? '<button class="btn btn-primary btn-small" onclick="toggleNewStagioneForm()">'+(s.showNewForm?'Annulla':'+ Chiudi stagione e iniziane una nuova')+'</button>' : '') +
    (isAdmin && !attivaVergine && s.showNewForm ? renderNewStagioneForm() : '') +
  '</div>' +
  '<div class="card"><h3>Archivio stagioni chiuse</h3>' +
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
  renderTeamSectionHTML() +
  (state.stagioni.detailId ? renderStagioneArchivioDetail() : '');
}

/* ---------- aiuto contestuale (versione leggera) ---------- */
// Più suggerimenti brevi per sezione (non solo uno): la prima volta che si entra in una
// sezione si parte dal primo, con una freccetta per scorrere agli approfondimenti
// successivi. "Ho capito" chiude tutta la sequenza per quella sezione (persistito come
// lista di chiavi "viste" in KvEntry, non per-browser); niente tour bloccante all'inizio,
// l'allenatore scopre le sezioni nell'ordine che sceglie lui.
const SECTION_TIPS = {
  rosa: [
    { title: 'Comincia da qui', text: 'Aggiungi i giocatori uno per uno con il modulo qui sotto, oppure importa una rosa già pronta da una stagione precedente nell\'archivio stagioni.' },
    { title: 'Modifica e ordina', text: 'Clicca un\'intestazione di colonna per ordinare la tabella, clicca una riga per modificare i dati di quel giocatore. Con "Info generali" e "Statistiche" cambi cosa vedi in tabella.' },
    { title: 'Personalizza il menu', text: 'Puoi trascinare le voci del menu qui a sinistra per metterle nell\'ordine che preferisci: l\'app si adatta al tuo modo di lavorare.' },
  ],
  pianoSquadra: [
    { title: 'Colpo d\'occhio sulla squadra', text: 'I giocatori della rosa sono organizzati qui per ruolo. Clicca su una card per scegliere titolare, prima e seconda riserva per quella posizione.' },
    { title: 'Si aggiorna da solo', text: 'Cambi qualcosa in Rosa? Il Piano Squadra si aggiorna in automatico: non serve rifare nulla qui.' },
  ],
  formazione: [
    { title: 'Imposta il modulo', text: 'Scegli il modulo (4-3-3, 4-4-2...) e trascina i giocatori dalla rosa sul campo: il trascinamento parte subito, non serve tenere premuto.' },
    { title: 'Tasto destro per assegnare rapido', text: 'Tasto destro su un giocatore non ancora selezionato lo mette subito al primo posto libero; tasto destro su chi è già selezionato lo toglie dalla formazione.' },
    { title: 'Triangolino per scegliere il posto', text: 'Il triangolino — sul campo, in panchina o in rosa — apre l\'elenco completo dei posti (titolari e fino a 20 riserve numerate S1, S2...) per scegliere esattamente dove mettere un giocatore.' },
    { title: 'Nascondi gli aggregati', text: 'Con molti giocatori aggregati dalla prima squadra, il pulsante "Nascondi aggregati" sopra l\'elenco rosa li toglie di mezzo mentre scegli la formazione.' },
    { title: 'Si ripropone da sola', text: 'La formazione tipo impostata qui viene rispecchiata in tempo reale in ogni nuova partita in Calendario, finché non la salvi da lì: da quel momento resta lo storico di quella singola gara.' },
  ],
  calendario: [
    { title: 'Aggiungi eventi', text: 'Clicca su un giorno (anche da telefono) per aggiungere una partita o un allenamento.' },
    { title: 'Segna le presenze', text: 'Clicca su un allenamento già segnato in calendario per registrare chi era presente e chi assente.' },
    { title: 'Importa o esporta', text: 'Hai già un calendario partite in un file Excel? Puoi importarlo da qui sotto, oppure esportare tutto in PDF o XLSX per condividerlo con la società.' },
    { title: 'Si collega alla Formazione', text: 'Ogni partita non ancora giocata rispecchia in tempo reale la formazione predefinita: aprendola la vedi aggiornata da sola finché non la salvi come storico di quella gara.' },
  ],
  match: [
    { title: 'Specchio della formazione tipo', text: 'La scheda Formazione di una partita non ancora giocata rispecchia in tempo reale la Formazione predefinita: cambiala di là, si aggiorna qui da sola.' },
    { title: 'Capitano e vice', text: 'Scegli capitano e vicecapitano di questa partita dalla scheda Formazione: compaiono anche nella distinta stampabile.' },
    { title: 'Salva formazione', text: 'Quando la formazione è definitiva, premi "Salva formazione": da quel momento resta fissa come storico di questa partita, anche se poi cambi la Formazione predefinita.' },
    { title: 'Stampe pronte', text: 'Dalla scheda Formazione stampi l\'elenco convocati in ordine alfabetico e la distinta ufficiale ordinata per numero, con capitano e vice indicati.' },
  ],
  schema: [
    { title: 'La libreria esercizi', text: 'Qui crei gli esercizi con il disegnatore tattico: campo, giocatori, frecce e palloni.' },
    { title: 'Costruisci le sedute', text: 'Metti insieme più esercizi in una seduta di allenamento e collegala a una data del Calendario.' },
    { title: 'Promemoria automatici', text: 'La campanella in alto ti avvisa se una seduta collegata a un allenamento già passato non è stata ancora compilata.' },
  ],
};
const ONBOARDING_NEXT_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
function onboardingTipHTML(key, step){
  const steps = SECTION_TIPS[key];
  if(!steps || !steps.length) return '';
  const i = Math.max(0, Math.min(step||0, steps.length-1));
  const tip = steps[i];
  const hasNext = i < steps.length-1;
  return '<div class="onboarding-tip">' +
    '<div class="onboarding-tip-text">' +
      '<strong>'+esc(tip.title)+'</strong>' +
      (steps.length>1 ? '<span class="onboarding-tip-count">'+(i+1)+'/'+steps.length+'</span>' : '') +
      '<p>'+esc(tip.text)+'</p>' +
    '</div>' +
    (hasNext ? '<button type="button" class="onboarding-tip-next" onclick="nextOnboardingTip(\''+key+'\')" title="Suggerimento successivo" aria-label="Suggerimento successivo">'+ONBOARDING_NEXT_ICON_SVG+'</button>' : '') +
    '<div class="onboarding-tip-actions">' +
      '<button type="button" class="btn btn-small btn-primary" onclick="dismissOnboardingTip(\''+key+'\')">Ho capito</button>' +
      '<button type="button" class="onboarding-tip-dismiss-all" onclick="dismissAllOnboardingTips()">Non mostrare più suggerimenti</button>' +
    '</div>' +
  '</div>';
}
function maybeInjectOnboardingTip(){
  const key = state.currentView;
  if(!SECTION_TIPS[key] || !state.onboarding.loaded) return;
  if(state.onboarding.dismissed.includes('*') || state.onboarding.dismissed.includes(key)) return;
  const container = document.getElementById('view-content');
  if(!container) return;
  state.onboarding.step = 0;
  container.insertAdjacentHTML('afterbegin', onboardingTipHTML(key, 0));
}
function nextOnboardingTip(key){
  const steps = SECTION_TIPS[key];
  if(!steps) return;
  state.onboarding.step = Math.min((state.onboarding.step||0) + 1, steps.length - 1);
  const el = document.querySelector('#view-content .onboarding-tip');
  if(el) el.outerHTML = onboardingTipHTML(key, state.onboarding.step);
}
function dismissOnboardingTip(key){
  if(!state.onboarding.dismissed.includes(key)) state.onboarding.dismissed.push(key);
  saveOnboardingDismissed();
  const el = document.querySelector('#view-content .onboarding-tip');
  if(el) el.remove();
}
function dismissAllOnboardingTips(){
  state.onboarding.dismissed = ['*'];
  saveOnboardingDismissed();
  const el = document.querySelector('#view-content .onboarding-tip');
  if(el) el.remove();
}
// Riapre il suggerimento della sezione corrente su richiesta (bottone "?"), indipendentemente
// da "Non mostrare più": è un aiuto on-demand, non deve essere bloccato dal dismiss globale.
function reopenSectionTip(){
  const key = state.currentView;
  if(!SECTION_TIPS[key]){ alert('Nessun suggerimento per questa sezione.'); return; }
  const container = document.getElementById('view-content');
  if(!container) return;
  const existing = container.querySelector('.onboarding-tip');
  if(existing) existing.remove();
  state.onboarding.step = 0;
  container.insertAdjacentHTML('afterbegin', onboardingTipHTML(key, 0));
}

/* ---------- profilo personale + colore squadra ---------- */
// Palette curata di colori adatti a rappresentare i colori sociali di una squadra —
// pannello interno all'app, mai il color picker nativo del sistema operativo (stessa
// regola già seguita per la paletta estesa del disegnatore).
const TEAM_ACCENT_COLORS = [
  '#FF8A00', '#E4572E', '#C1272D', '#8B1E3F',
  '#2563EB', '#1D4ED8', '#0EA5E9', '#0D9488',
  '#16A34A', '#166534', '#CA8A04', '#EAB308',
  '#7C3AED', '#DB2777', '#6D28D9', '#78350F',
];
function hexToRgbTripletClient(hex){
  const h = (hex||'').replace('#','');
  const full = h.length===3 ? h.split('').map(c=>c+c).join('') : h;
  const n = parseInt(full,16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
function rgbToHexClient([r,g,b]){
  return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
}
function mixRgbClient([r,g,b],[tr,tg,tb],amount){
  return [r+(tr-r)*amount, g+(tg-g)*amount, b+(tb-b)*amount];
}
function applyAccentPreview(hex){
  const rgb = hexToRgbTripletClient(hex);
  const hover = rgbToHexClient(mixRgbClient(rgb,[255,255,255],0.2));
  const dim = rgbToHexClient(mixRgbClient(rgb,[0,0,0],0.55));
  const wash = 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.14)';
  const root = document.documentElement.style;
  root.setProperty('--accent', hex);
  root.setProperty('--accent-hover', hover);
  root.setProperty('--accent-dim', dim);
  root.setProperty('--accent-wash', wash);
}
async function openProfileModal(){
  const box = document.getElementById('event-modal-box');
  box.innerHTML = '<p class="hint">Caricamento…</p>';
  document.getElementById('event-modal-overlay').style.display = 'flex';
  const res = await apiGet('/api/profile');
  state.profile.tempAccentColor = res.accentColor || getAppUser().accentColor || null;
  box.innerHTML = renderProfileFormHTML(res);
}
function renderProfileFormHTML(p){
  const isOwner = p.isOwner;
  const current = state.profile.tempAccentColor;
  const swatches = TEAM_ACCENT_COLORS.map(c=>
    '<button type="button" class="schema-color-swatch'+(current===c?' schema-color-swatch-active':'')+'" style="background:'+c+';" onclick="selectProfileColor(\''+c+'\')" title="'+c+'"></button>'
  ).join('');
  return '<h3>Il mio profilo</h3>' +
    '<div class="form-row">' +
      '<div class="field"><label>Nome</label><input id="profile-nome" type="text" value="'+esc(p.nome||'')+'"></div>' +
      '<div class="field"><label>Cognome</label><input id="profile-cognome" type="text" value="'+esc(p.cognome||'')+'"></div>' +
    '</div>' +
    '<div class="field"><label>Ruolo</label><input id="profile-ruolo" type="text" placeholder="es. Allenatore, Team Manager, Preparatore atletico" value="'+esc(p.ruolo||'')+'"></div>' +
    (isOwner ?
      '<div class="field" style="margin-top:14px;">' +
        '<label>Colore squadra</label>' +
        '<p class="hint" style="margin-top:0;">Sostituisce solo il colore in evidenza dell\'app: sfondo, pannelli e testo restano invariati.</p>' +
        '<div class="schema-color-picker-grid" style="grid-template-columns:repeat(8, 24px); margin-top:6px;">'+swatches+'</div>' +
        '<div class="form-row" style="align-items:center; margin-top:8px;">' +
          '<input id="profile-color-hex" type="text" placeholder="#FF8A00" value="'+esc(current||'')+'" style="width:110px;" oninput="onProfileColorHexInput(this.value)">' +
          '<span class="hint">oppure inserisci un codice esadecimale</span>' +
        '</div>' +
      '</div>'
      : '') +
    '<div class="modal-actions">' +
      '<button type="button" class="btn" onclick="closeEventModal()">Annulla</button>' +
      '<button type="button" class="btn btn-primary" onclick="submitProfile()">Salva</button>' +
    '</div>';
}
function selectProfileColor(hex){
  state.profile.tempAccentColor = hex;
  applyAccentPreview(hex);
  document.querySelectorAll('#event-modal-box .schema-color-swatch').forEach(function(btn){
    btn.classList.toggle('schema-color-swatch-active', btn.title===hex);
  });
  const hexInput = document.getElementById('profile-color-hex');
  if(hexInput) hexInput.value = hex;
}
function onProfileColorHexInput(value){
  if(!/^#[0-9a-fA-F]{6}$/.test(value)) return;
  state.profile.tempAccentColor = value;
  applyAccentPreview(value);
}
async function submitProfile(){
  const nome = document.getElementById('profile-nome').value.trim();
  const cognome = document.getElementById('profile-cognome').value.trim();
  const ruolo = document.getElementById('profile-ruolo').value.trim();
  const body = { nome, cognome, ruolo };
  const colorInput = document.getElementById('profile-color-hex');
  if(colorInput){
    const value = colorInput.value.trim();
    if(value && !/^#[0-9a-fA-F]{6}$/.test(value)){ alert('Colore non valido: usa un codice esadecimale tipo #FF8A00.'); return; }
    body.accentColor = value || null;
  }
  const res = await apiPatch('/api/profile', body);
  if(res.ok){
    location.reload();
  } else alert('Errore: '+(res.error||'sconosciuto'));
}

/* ---------- init ---------- */
// Chiude il menu contestuale solo per un click FUORI dal menu: un click su un'azione al suo
// interno (es. A-/A+ ripetuti, colore, rotazione) non deve farlo sparire, altrimenti ogni
// piccola modifica costringe a riaprirlo col tasto destro da capo.
document.addEventListener('click', function(e){
  if(e.target.closest('#player-context-menu')) return;
  hideContextMenu();
});
document.addEventListener('input', function(e){
  if(e.target.tagName==='TEXTAREA') autosizeTextarea(e.target);
});
document.addEventListener('contextmenu', function(e){
  if(e.target.tagName!=='TEXTAREA' || !e.target.classList.contains('schema-rich-text')) return;
  if(e.target.selectionStart===e.target.selectionEnd) return; // nessuna selezione: menu nativo
  e.preventDefault();
  showSchemaRichTextMenu(e, e.target);
});
new MutationObserver(function(mutations){
  mutations.forEach(function(m){
    m.addedNodes.forEach(function(node){
      if(node.nodeType!==1) return;
      if(node.tagName==='TEXTAREA') autosizeTextarea(node);
      else if(node.querySelectorAll) autosizeAllTextareas(node);
    });
  });
}).observe(document.body, { childList:true, subtree:true });
renderView();
autosizeAllTextareas();
loadData().then(refreshSchemaNotifiche);
window.addEventListener('beforeunload', function(e){
  if(state.players.length || state.matches.length || state.allenamenti.length){
    e.preventDefault();
    e.returnValue = '';
  }
});
