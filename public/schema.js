/* ---------- utility (stesse convenzioni di public/app.js) ---------- */
function esc(s){
  if(s===undefined || s===null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function formatDateIt(iso){
  if(!iso) return '';
  const d = new Date(iso);
  return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
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
function starInputHTML(){
  let out = '<span class="star-input">';
  for(let i=1;i<=5;i++){
    out += '<button type="button" class="star-input-btn" onclick="submitSchemaRating('+i+')" aria-label="'+i+' stelle">' + starIconSVG('var(--yellow)', 20) + '</button>';
  }
  out += '</span>';
  return out;
}

/* ---------- api ---------- */
async function apiGet(url){ const r = await fetch(url); return r.json(); }
async function apiPost(url, body){ const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }); return r.json(); }
async function apiPatch(url, body){ const r = await fetch(url, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }); return r.json(); }
async function apiDelete(url){ const r = await fetch(url, { method:'DELETE' }); return r.json(); }

/* ---------- stato ---------- */
let state = {
  view: null,
  exerciseId: null,
  objectives: [],
  exercises: [],
  filterObiettivoId: '',
  filterSearch: '',
  currentExercise: null,
  drawMode: false,
};

/* ---------- modale conferma (stesso pattern di app.js) ---------- */
let schemaModalConfirmCallback = null;
function showSchemaConfirmModal(message, onConfirm){
  document.getElementById('modal-message').textContent = message;
  schemaModalConfirmCallback = onConfirm;
  document.getElementById('modal-overlay').style.display = 'flex';
}
function closeSchemaModal(){
  document.getElementById('modal-overlay').style.display = 'none';
  schemaModalConfirmCallback = null;
}
function triggerSchemaModalConfirm(){
  if(schemaModalConfirmCallback) schemaModalConfirmCallback();
  closeSchemaModal();
}

/* ---------- libreria esercizi ---------- */
async function loadLibrary(){
  const params = new URLSearchParams();
  if(state.filterObiettivoId) params.set('obiettivoId', state.filterObiettivoId);
  if(state.filterSearch) params.set('search', state.filterSearch);
  const res = await apiGet('/api/schema/exercises?'+params.toString());
  state.exercises = res.exercises || [];
}
function renderLibrary(){
  const container = document.getElementById('schema-view-content');
  const filterOptions = '<option value="">Tutti gli obiettivi</option>' +
    state.objectives.map(o=>'<option value="'+o.id+'" '+(state.filterObiettivoId===o.id?'selected':'')+'>'+esc(o.label)+'</option>').join('');
  container.innerHTML =
    '<div class="card">' +
      '<div class="card-header-row"><h2>Libreria esercizi</h2>' +
        '<div class="pitch-actions"><button class="btn btn-primary btn-small" onclick="location.href=\'/schema/new\'">+ Nuovo esercizio</button></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="field"><label>Obiettivo</label><select id="schema-filter-obiettivo" onchange="onSchemaFilterChange()">'+filterOptions+'</select></div>' +
        '<div class="field field-grow"><label>Cerca</label><input id="schema-filter-search" type="text" placeholder="titolo o tag" value="'+esc(state.filterSearch)+'" oninput="onSchemaFilterChange()"></div>' +
      '</div>' +
      '<div class="schema-exercise-grid">' + renderExerciseCards() + '</div>' +
    '</div>';
}
function renderExerciseCards(){
  if(state.exercises.length===0) return '<p class="hint">Nessun esercizio ancora. Crea il primo.</p>';
  return state.exercises.map(e=>{
    const badges = [];
    if(e._count && e._count.versioni) badges.push('<span class="pill">Versioni</span>');
    if(e._count && e._count.varianti) badges.push('<span class="pill">Varianti</span>');
    return '<div class="schema-exercise-card" onclick="location.href=\'/schema/'+e.id+'\'">' +
      '<div class="schema-exercise-card-head"><strong>'+esc(e.titolo)+'</strong>'+badges.join('')+'</div>' +
      '<div class="hint">'+esc(e.obiettivo.label)+'</div>' +
      '<div class="schema-exercise-card-foot">' + (e.votoMedio!=null ? starRatingHTML(e.votoMedio, 12) : '<span class="hint">Non valutato</span>') + '</div>' +
    '</div>';
  }).join('');
}
let schemaFilterDebounce = null;
function onSchemaFilterChange(){
  state.filterObiettivoId = document.getElementById('schema-filter-obiettivo').value;
  state.filterSearch = document.getElementById('schema-filter-search').value;
  clearTimeout(schemaFilterDebounce);
  schemaFilterDebounce = setTimeout(async () => { await loadLibrary(); renderLibrary(); }, 200);
}

/* ---------- nuovo esercizio ---------- */
function renderNewExerciseForm(){
  const container = document.getElementById('schema-view-content');
  const objOptions = state.objectives.map(o=>'<option value="'+o.id+'">'+esc(o.label)+'</option>').join('');
  container.innerHTML =
    '<div class="card">' +
      '<div class="card-header-row"><h2>Nuovo esercizio</h2><button class="btn btn-small" onclick="location.href=\'/schema\'">← Libreria</button></div>' +
      '<div class="form-row">' +
        '<div class="field field-grow"><label>Titolo</label><input id="new-ex-titolo" type="text"></div>' +
        '<div class="field"><label>Obiettivo</label><select id="new-ex-obiettivo">'+objOptions+'</select></div>' +
        '<div class="field"><label>N. giocatori</label><input id="new-ex-numgiocatori" type="number" min="1" value="8"></div>' +
      '</div>' +
      '<div class="field"><label>Descrizione</label><textarea id="new-ex-descrizione" rows="3"></textarea></div>' +
      '<button class="btn btn-primary" onclick="createExercise()">Crea esercizio</button>' +
    '</div>';
}
async function createExercise(){
  const titolo = document.getElementById('new-ex-titolo').value.trim();
  if(!titolo){ alert('Il titolo è obbligatorio.'); return; }
  const res = await apiPost('/api/schema/exercises', {
    titolo,
    descrizione: document.getElementById('new-ex-descrizione').value,
    obiettivoId: document.getElementById('new-ex-obiettivo').value,
    numeroGiocatoriBase: document.getElementById('new-ex-numgiocatori').value,
  });
  if(res.exercise) location.href = '/schema/'+res.exercise.id;
  else alert('Errore: '+(res.error||'sconosciuto'));
}

/* ---------- scheda esercizio ---------- */
async function loadExercise(){
  const res = await apiGet('/api/schema/exercises/'+state.exerciseId);
  state.currentExercise = res.exercise || null;
}
function parseSchemaCampo(e){
  try { const d = JSON.parse(e.schemaCampo || '{}'); if(!d.chips) d.chips=[]; if(!d.arrows) d.arrows=[]; return d; }
  catch { return { chips:[], arrows:[] }; }
}
function renderFieldSVG(e){
  const data = parseSchemaCampo(e);
  const w = e.larghezzaCampo || 20, h = e.lunghezzaCampo || 28;
  const chipsSvg = data.chips.map(c=>
    '<g class="schema-chip" data-id="'+c.id+'" transform="translate('+c.x+','+c.y+')">' +
      '<circle r="'+(w*0.04)+'" fill="#0E2233" stroke="#4FA8E0" stroke-width="'+(w*0.005)+'"/>' +
      (c.label ? '<text text-anchor="middle" dy="'+(w*0.08)+'" font-size="'+(w*0.045)+'" fill="#F4F1EA" font-family="Inter, sans-serif" paint-order="stroke" stroke="#0B141C" stroke-width="'+(w*0.015)+'">'+esc(c.label)+'</text>' : '') +
    '</g>'
  ).join('');
  const arrowsSvg = data.arrows.map(a=>
    '<line x1="'+a.x1+'" y1="'+a.y1+'" x2="'+a.x2+'" y2="'+a.y2+'" stroke="#4FA8E0" stroke-width="'+(w*0.008)+'" marker-end="url(#schema-arrowhead)"/>'
  ).join('');
  return '<svg id="schema-field-svg" viewBox="0 0 '+w+' '+h+'" class="pitch-svg schema-field-svg">' +
    '<defs><marker id="schema-arrowhead" markerWidth="3" markerHeight="3" refX="2.4" refY="1.5" orient="auto"><path d="M0,0 L3,1.5 L0,3 Z" fill="#4FA8E0"/></marker></defs>' +
    '<rect x="0" y="0" width="'+w+'" height="'+h+'" fill="#1E5631" stroke="#F4F1EA" stroke-width="'+(w*0.005)+'"/>' +
    '<g class="arrows-layer">'+arrowsSvg+'</g>' +
    '<g class="chips-layer">'+chipsSvg+'</g>' +
  '</svg>';
}
function renderExerciseSheet(){
  const container = document.getElementById('schema-view-content');
  const e = state.currentExercise;
  if(!e){ container.innerHTML = '<div class="card"><p class="hint">Esercizio non trovato.</p></div>'; return; }
  const objOptions = state.objectives.map(o=>'<option value="'+o.id+'" '+(o.id===e.obiettivoId?'selected':'')+'>'+esc(o.label)+'</option>').join('');
  const noteRecente = e.note[0];
  const altreNote = e.note.slice(1);
  container.innerHTML =
    '<div class="card">' +
      '<div class="card-header-row"><h2>'+esc(e.titolo)+'</h2>' +
        '<div class="pitch-actions"><button class="btn btn-small" onclick="location.href=\'/schema\'">← Libreria</button><button class="btn btn-small btn-danger" onclick="confirmDeleteExercise()">Elimina</button></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="field field-grow"><label>Titolo</label><input id="ex-titolo" type="text" value="'+esc(e.titolo)+'" onchange="saveExerciseField(\'titolo\', this.value)"></div>' +
        '<div class="field"><label>Obiettivo</label><select onchange="onObiettivoChange(this.value)">'+objOptions+'</select></div>' +
        '<div class="field"><label>N. giocatori</label><input type="number" min="1" value="'+e.numeroGiocatoriBase+'" onchange="onNumGiocatoriChange(this.value)"></div>' +
        '<div class="field"><label>Durata tipica (min)</label><input type="number" min="1" value="'+e.durataTipica+'" onchange="saveExerciseField(\'durataTipica\', this.value)"></div>' +
      '</div>' +
      '<div class="field"><label>Descrizione</label><textarea rows="3" onchange="saveExerciseField(\'descrizione\', this.value)">'+esc(e.descrizione)+'</textarea></div>' +
      '<div class="form-row">' +
        '<div class="field"><label>Larghezza campo (m)</label><input id="ex-larghezza" type="number" step="0.1" value="'+e.larghezzaCampo+'" onchange="onFieldSizeOverride()"></div>' +
        '<div class="field"><label>Lunghezza campo (m)</label><input id="ex-lunghezza" type="number" step="0.1" value="'+e.lunghezzaCampo+'" onchange="onFieldSizeOverride()"></div>' +
        '<div class="field"><label>Fatica percepita (1-5)</label><input type="number" min="1" max="5" value="'+e.indiceFatica+'" onchange="saveExerciseField(\'indiceFatica\', this.value)"></div>' +
        '<div class="field"><label>Indice di carico</label><div class="pill pill-muted schema-load-pill">'+e.indiceCarico+'</div></div>' +
      '</div>' +
      '<div class="pitch-wrap schema-field-wrap">' + renderFieldSVG(e) + '</div>' +
      '<div class="pitch-actions" style="margin-top:8px;">' +
        '<button class="btn btn-small '+(state.drawMode?'btn-active':'')+'" onclick="toggleSchemaDrawMode()">'+(state.drawMode?'Termina disegno':'Disegna movimenti')+'</button>' +
        '<button class="btn btn-small" onclick="clearSchemaArrows()">Cancella frecce</button>' +
      '</div>' +
      '<p class="hint">Clic sul campo per aggiungere un elemento, trascinalo per spostarlo, clic su un elemento per rimuoverlo, doppio clic per etichettarlo.</p>' +
    '</div>' +
    '<div class="card">' +
      '<h3 style="margin-top:0;">Note</h3>' +
      (noteRecente ? '<div class="schema-note-recent"><strong>'+formatDateIt(noteRecente.data)+'</strong><p>'+esc(noteRecente.testo)+'</p></div>' : '<p class="hint">Nessuna nota ancora.</p>') +
      '<div class="form-row"><div class="field field-grow"><label>Nuova nota</label><textarea id="ex-nuova-nota" rows="2"></textarea></div><button class="btn btn-small" onclick="addSchemaNote()">Aggiungi nota</button></div>' +
      (altreNote.length ? '<details class="schema-note-history"><summary>Storico note ('+altreNote.length+')</summary>' + altreNote.map(n=>'<div class="schema-note-item"><strong>'+formatDateIt(n.data)+'</strong><p>'+esc(n.testo)+'</p></div>').join('') + '</details>' : '') +
    '</div>' +
    '<div class="card">' +
      '<h3 style="margin-top:0;">Valutazioni</h3>' +
      '<div class="form-row" style="align-items:center;">' +
        '<div>' + (e.votoMedio!=null ? 'Media: '+starRatingHTML(e.votoMedio,16)+' ('+e.votoMedio+')' : 'Nessuna valutazione') + '</div>' +
        '<div class="hint">Usato '+e.utilizzi.length+' volte, '+e.minutiTotaliStagione+' minuti totali in stagione</div>' +
      '</div>' +
      '<div class="form-row" style="align-items:center;"><label class="hint">Nuovo voto:</label>' + starInputHTML() + '</div>' +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="card"><h3 style="margin-top:0;">Progressioni</h3>' +
        (e.versioni.length ? e.versioni.map(v=>'<div><a href="/schema/'+v.id+'">'+esc(v.titolo)+'</a></div>').join('') : '<p class="hint">Nessuna versione ancora.</p>') +
        '<button class="btn btn-small" disabled title="Disponibile al prossimo passo">Crea versione</button>' +
      '</div>' +
      '<div class="card"><h3 style="margin-top:0;">Varianti per numero di giocatori</h3>' +
        (e.varianti.length ? e.varianti.map(v=>'<div><a href="/schema/'+v.id+'">'+esc(v.titolo)+'</a></div>').join('') : '<p class="hint">Nessuna variante ancora.</p>') +
        '<button class="btn btn-small" disabled title="Disponibile al prossimo passo">Crea variante</button>' +
      '</div>' +
    '</div>';
  attachFieldInteractions();
}
async function saveExerciseField(field, value){
  const res = await apiPatch('/api/schema/exercises/'+state.exerciseId, { [field]: value });
  if(res.exercise) state.currentExercise = res.exercise;
}
async function onObiettivoChange(newObiettivoId){
  const res = await apiPatch('/api/schema/exercises/'+state.exerciseId, { obiettivoId: newObiettivoId });
  if(res.exercise){ state.currentExercise = res.exercise; renderExerciseSheet(); }
}
async function onNumGiocatoriChange(value){
  const res = await apiPatch('/api/schema/exercises/'+state.exerciseId, { numeroGiocatoriBase: value });
  if(res.exercise){ state.currentExercise = res.exercise; renderExerciseSheet(); }
}
async function onFieldSizeOverride(){
  const larghezzaCampo = document.getElementById('ex-larghezza').value;
  const lunghezzaCampo = document.getElementById('ex-lunghezza').value;
  const res = await apiPatch('/api/schema/exercises/'+state.exerciseId, { larghezzaCampo, lunghezzaCampo });
  if(res.exercise){ state.currentExercise = res.exercise; renderExerciseSheet(); }
}
async function addSchemaNote(){
  const textEl = document.getElementById('ex-nuova-nota');
  const testo = textEl.value.trim();
  if(!testo) return;
  await apiPost('/api/schema/exercises/'+state.exerciseId+'/notes', { testo });
  await loadExercise();
  renderExerciseSheet();
}
async function submitSchemaRating(voto){
  await apiPost('/api/schema/exercises/'+state.exerciseId+'/ratings', { voto });
  await loadExercise();
  renderExerciseSheet();
}
function confirmDeleteExercise(){
  showSchemaConfirmModal('Eliminare "'+state.currentExercise.titolo+'"? Elimina anche note, valutazioni e storico collegati.', async () => {
    await apiDelete('/api/schema/exercises/'+state.exerciseId);
    location.href = '/schema';
  });
}

/* ---------- disegno campo: chip + frecce (stesso pattern pointer-events di app.js) ---------- */
function toggleSchemaDrawMode(){
  state.drawMode = !state.drawMode;
  renderExerciseSheet();
}
async function clearSchemaArrows(){
  const data = parseSchemaCampo(state.currentExercise);
  data.arrows = [];
  await saveSchemaCampo(data);
}
async function saveSchemaCampo(data){
  const res = await apiPatch('/api/schema/exercises/'+state.exerciseId, { schemaCampo: JSON.stringify(data) });
  if(res.exercise){ state.currentExercise = res.exercise; renderExerciseSheet(); }
}
function attachFieldInteractions(){
  const svg = document.getElementById('schema-field-svg');
  if(!svg) return;
  function toPoint(evt){
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  svg.querySelectorAll('.schema-chip').forEach(function(chipEl){
    chipEl.style.cursor = 'grab';
    chipEl.addEventListener('dblclick', function(e){
      e.stopPropagation();
      const id = chipEl.getAttribute('data-id');
      const data = parseSchemaCampo(state.currentExercise);
      const chipData = data.chips.find(function(c){ return c.id===id; });
      if(!chipData) return;
      const label = prompt('Etichetta elemento (es. cono, pallone, nome giocatore):', chipData.label||'');
      if(label!==null){ chipData.label = label; saveSchemaCampo(data); }
    });
    chipEl.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      chipEl.setPointerCapture(e.pointerId);
      const startPt = toPoint(e);
      let moved = false;
      const id = chipEl.getAttribute('data-id');
      const data = parseSchemaCampo(state.currentExercise);
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
        if(!moved){
          data.chips = data.chips.filter(function(c){ return c.id!==id; });
        }
        saveSchemaCampo(data);
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  });
  if(state.drawMode){
    svg.addEventListener('pointerdown', function(e){
      if(e.target.closest('.schema-chip')) return;
      const start = toPoint(e);
      const tempLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      tempLine.setAttribute('x1', start.x); tempLine.setAttribute('y1', start.y);
      tempLine.setAttribute('x2', start.x); tempLine.setAttribute('y2', start.y);
      tempLine.setAttribute('stroke', '#4FA8E0'); tempLine.setAttribute('stroke-width', '0.15');
      svg.querySelector('.arrows-layer').appendChild(tempLine);
      function onMove(e2){ const p=toPoint(e2); tempLine.setAttribute('x2',p.x); tempLine.setAttribute('y2',p.y); }
      function onUp(e2){
        svg.removeEventListener('pointermove', onMove);
        svg.removeEventListener('pointerup', onUp);
        const p = toPoint(e2);
        const dist = Math.hypot(p.x-start.x, p.y-start.y);
        const data = parseSchemaCampo(state.currentExercise);
        if(dist > 0.5){
          data.arrows.push({ x1:start.x, y1:start.y, x2:p.x, y2:p.y });
          saveSchemaCampo(data);
        } else { tempLine.remove(); }
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
    });
  } else {
    svg.addEventListener('pointerdown', function(e){
      if(e.target.closest('.schema-chip')) return;
      const p = toPoint(e);
      const data = parseSchemaCampo(state.currentExercise);
      data.chips.push({ id: 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,7), x:p.x, y:p.y, label:'' });
      saveSchemaCampo(data);
    });
  }
}

/* ---------- init ---------- */
async function initSchema(){
  const dataEl = document.getElementById('schema-app-data');
  if(!dataEl) return;
  state.view = dataEl.getAttribute('data-view');
  state.exerciseId = dataEl.getAttribute('data-exercise-id');
  const objRes = await apiGet('/api/schema/objectives');
  state.objectives = objRes.objectives || [];
  if(state.view === 'library'){
    await loadLibrary();
    renderLibrary();
  } else if(state.exerciseId === 'new'){
    renderNewExerciseForm();
  } else {
    await loadExercise();
    renderExerciseSheet();
  }
}
initSchema();
