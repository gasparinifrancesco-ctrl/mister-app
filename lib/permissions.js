// Niente 'server-only': queste funzioni sono pure (nessun accesso a Prisma/cookie) e servono
// anche a app/register/page.js (client component) per mostrare le etichette dei permessi
// nel banner d'invito.

// Le UNICHE chiavi valide dentro TeamMember.permissions. "Gestione collaboratori" non è e
// non deve mai diventare una chiave qui: resta un controllo separato (requireOwner) che legge
// solo "sei il vero proprietario", mai questo array — altrimenti un collaboratore potrebbe
// auto-concedersi più potere o invitarne altri.
export const PERMISSIONS = [
  'view_rosa', 'view_calendario', 'view_formazione', 'view_piano_squadra', 'view_allenamenti',
  'edit_rosa', 'edit_calendario', 'edit_formazione', 'edit_piano_squadra',
  'edit_presenze', 'edit_esercizi', 'edit_sedute', 'write_considerazioni', 'manage_stagioni',
];
const PERMISSION_SET = new Set(PERMISSIONS);

export const PERMISSION_LABELS = {
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
  edit_esercizi: 'Creare/modificare esercizi, livelli, fasi ed etichette',
  edit_sedute: 'Creare/modificare le sedute di allenamento',
  write_considerazioni: 'Scrivere considerazioni',
  manage_stagioni: 'Gestire le stagioni (chiudere/aprire, importare giocatori)',
};

// Raggruppamento per il form di invito/modifica permessi (solo UI, non usato per validazione).
export const PERMISSION_GROUPS = [
  { section: 'Rosa', keys: ['view_rosa', 'edit_rosa'] },
  { section: 'Calendario', keys: ['view_calendario', 'edit_calendario', 'edit_presenze'] },
  { section: 'Formazione', keys: ['view_formazione', 'edit_formazione'] },
  { section: 'Piano Squadra', keys: ['view_piano_squadra', 'edit_piano_squadra'] },
  { section: 'Allenamenti', keys: ['view_allenamenti', 'edit_esercizi', 'edit_sedute', 'write_considerazioni'] },
  { section: 'Stagioni', keys: ['manage_stagioni'] },
];

// Quando si spunta una chiave di modifica/azione nel form, quali "view" pre-selezionare
// automaticamente (restano comunque deselezionabili a mano — solo un default intelligente,
// non un vincolo: il server non lo impone, vedi hasPermission).
export const PERMISSION_IMPLIES_VIEW = {
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

export function isValidPermission(key) {
  return PERMISSION_SET.has(key);
}

export function parsePermissions(json) {
  try {
    const arr = JSON.parse(json || '[]');
    if (!Array.isArray(arr)) return [];
    return arr.filter(isValidPermission);
  } catch {
    return [];
  }
}

export function serializePermissions(arr) {
  const valid = (Array.isArray(arr) ? arr : []).filter(isValidPermission);
  return JSON.stringify([...new Set(valid)]);
}

// true/false, non lancia. session.isOwner bypassa sempre (il vero proprietario ha ogni
// permesso implicitamente). key può essere una stringa o un array (basta che ne abbia una).
export function hasPermission(session, key) {
  if (!session) return false;
  if (session.isOwner) return true;
  const keys = Array.isArray(key) ? key : [key];
  return keys.some((k) => session.permissions.includes(k));
}

// Invariante di sicurezza: SOLO il vero proprietario dell'account. Non legge mai
// session.permissions — la gestione dei collaboratori non è e non sarà mai delegabile.
export function requireOwner(session) {
  return !!session && session.isOwner === true;
}
