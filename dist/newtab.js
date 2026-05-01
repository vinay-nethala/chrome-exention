// abstraction for storage (chrome.storage.local vs localStorage)
function isChromeStorageAvailable() {
  return typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.storage.local &&
    typeof chrome.storage.local.get === "function";
}

function storageGet(keys) {
  if (isChromeStorageAvailable()) {
    return new Promise(resolve => chrome.storage.local.get(keys, resolve));
  }
  const result = {};
  if (Array.isArray(keys)) {
    keys.forEach(k => {
      try { result[k] = JSON.parse(localStorage.getItem(k)); } catch { result[k] = null; }
    });
  } else if (typeof keys === "string") {
    try { result[keys] = JSON.parse(localStorage.getItem(keys)); } catch { result[keys] = null; }
  } else if (typeof keys === "object" && keys !== null) {
    Object.keys(keys).forEach(k => {
      try {
        const val = localStorage.getItem(k);
        result[k] = val !== null ? JSON.parse(val) : keys[k];
      } catch { result[k] = keys[k]; }
    });
  }
  return Promise.resolve(result);
}

function storageSet(items) {
  if (isChromeStorageAvailable()) {
    return new Promise(resolve => chrome.storage.local.set(items, resolve));
  }
  Object.entries(items).forEach(([k,v]) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.error('ls set',e); }
  });
  return Promise.resolve();
}

function storageRemove(keys) {
  if (isChromeStorageAvailable()) {
    return new Promise(resolve => chrome.storage.local.remove(keys, resolve));
  }
  if (Array.isArray(keys)) keys.forEach(k => localStorage.removeItem(k));
  else localStorage.removeItem(keys);
  return Promise.resolve();
}

function safeTabsQuery(query) {
  return new Promise(resolve => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      try { chrome.tabs.query(query, resolve); } catch (e) { console.error('tabs query',e); resolve([]); }
    } else {
      resolve([]);
    }
  });
}

// notes
async function getNotes() {
  const d = await storageGet('notes');
  const stored = d.notes;
  if (Array.isArray(stored)) {
    return stored;
  }
  if (typeof stored === 'string') {
    const lines = stored.split('\n').map(l=>l.trim()).filter(Boolean);
    const migrated = lines.map((text,idx)=>({id:(Date.now()+idx).toString(),text}));
    await saveNotes(migrated);
    return migrated;
  }
  return [];
}
async function saveNotes(notes) { await storageSet({ notes }); }
async function addNote(text) { if (!text||!text.trim()) return; const notes = await getNotes(); notes.push({ id: Date.now().toString(), text: text.trim() }); await saveNotes(notes); }
async function deleteNote(id) { const notes = await getNotes(); await saveNotes(notes.filter(n=>n.id!==id)); }
function createNoteElement(note) {
  const div = document.createElement('div'); div.className='note-item';
  const textSpan = document.createElement('span'); textSpan.textContent = note.text; div.appendChild(textSpan);
  const btn = document.createElement('button'); btn.textContent='Delete'; btn.className='btn delete-note';
  btn.addEventListener('click', async()=>{ await deleteNote(note.id); renderNotes(); });
  div.appendChild(btn);
  return div;
}
async function renderNotes() {
  const container = document.getElementById('notes-list'); if(!container) return;
  const notes = await getNotes(); container.innerHTML = '';
  if(notes.length===0) { container.innerHTML='<p>No notes yet</p>'; }
  else notes.forEach(n=>container.appendChild(createNoteElement(n)));
}
function setupNotesWidget() {
  const input=document.getElementById('note-input'); const btn=document.getElementById('add-note-btn');
  if(btn&&input){ btn.addEventListener('click', async()=>{ await addNote(input.value); input.value=''; renderNotes(); }); }
  renderNotes();
}

// sessions
async function getSessions(){ const d=await storageGet('sessions'); return d.sessions&&typeof d.sessions==='object'?d.sessions:{}; }
async function saveSessions(sessions){ await storageSet({ sessions }); }
async function deleteSession(name){ const s=await getSessions(); if(s[name]){ delete s[name]; await saveSessions(s);} }
async function saveCurrentSession(){ const name=prompt('Enter session name:'); if(!name) return; const tabs=await safeTabsQuery({currentWindow:true}); const urls=tabs.map(t=>t.url); const s=await getSessions(); s[name]=urls; await saveSessions(s); renderSessions(); }
async function renderSessions(){ const container=document.getElementById('sessions-list'); if(!container) return; const s=await getSessions(); container.innerHTML=''; const names=Object.keys(s); if(names.length===0){ container.innerHTML='<p>No sessions yet</p>'; return;} names.forEach(name=>{ const div=document.createElement('div'); div.className='session-item'; const span=document.createElement('span'); span.textContent=name; div.appendChild(span); const del=document.createElement('button'); del.textContent='Delete'; del.className='btn delete-session'; del.addEventListener('click', async()=>{ await deleteSession(name); renderSessions(); }); div.appendChild(del); container.appendChild(div); }); }
function setupSessionsWidget(){ const saveBtn=document.getElementById('save-session-btn'); if(saveBtn){ saveBtn.addEventListener('click', saveCurrentSession); } renderSessions(); }

// clock
function updateClock(){ const now=new Date(); const time=now.toLocaleTimeString(); const el=document.getElementById('clock'); if(el) el.textContent=time; }

function init(){ setupNotesWidget(); setupSessionsWidget(); updateClock(); setInterval(updateClock,1000); }

document.addEventListener('DOMContentLoaded', init);