// utility to detect storage availability
function isChromeStorageAvailable() {
  return typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.storage.local &&
    typeof chrome.storage.local.get === "function";
}

// wrapper around chrome.storage.local or window.localStorage
function storageGet(keys) {
  if (isChromeStorageAvailable()) {
    return new Promise(resolve => chrome.storage.local.get(keys, resolve));
  }
  // fallback to localStorage
  const result = {};
  if (Array.isArray(keys)) {
    keys.forEach(k => {
      try {
        result[k] = JSON.parse(window.localStorage.getItem(k));
      } catch (e) {
        result[k] = null;
      }
    });
  } else if (typeof keys === "string") {
    try {
      result[keys] = JSON.parse(window.localStorage.getItem(keys));
    } catch (e) {
      result[keys] = null;
    }
  } else if (typeof keys === "object" && keys !== null) {
    Object.keys(keys).forEach(k => {
      try {
        const val = window.localStorage.getItem(k);
        result[k] = val !== null ? JSON.parse(val) : keys[k];
      } catch (e) {
        result[k] = keys[k];
      }
    });
  }
  return Promise.resolve(result);
}

function storageSet(items) {
  if (isChromeStorageAvailable()) {
    return new Promise(resolve => chrome.storage.local.set(items, resolve));
  }
  Object.entries(items).forEach(([k, v]) => {
    try {
      window.localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      console.error("localStorage set failed for", k, e);
    }
  });
  return Promise.resolve();
}

function storageRemove(keys) {
  if (isChromeStorageAvailable()) {
    return new Promise(resolve => chrome.storage.local.remove(keys, resolve));
  }
  if (Array.isArray(keys)) {
    keys.forEach(k => window.localStorage.removeItem(k));
  } else {
    window.localStorage.removeItem(keys);
  }
  return Promise.resolve();
}

// safe wrapper for chrome.tabs.query; returns empty array if unavailable
function safeTabsQuery(query) {
  return new Promise(resolve => {
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
      try {
        chrome.tabs.query(query, resolve);
      } catch (err) {
        console.error("chrome.tabs.query error", err);
        resolve([]);
      }
    } else {
      resolve([]);
    }
  });
}

// notes logic
async function getNotes() {
  const data = await storageGet("notes");
  const stored = data.notes;

  // already an array of note objects
  if (Array.isArray(stored)) {
    return stored;
  }

  // old schema: simple string saved from popup; migrate to array
  if (typeof stored === "string") {
    const lines = stored
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);
    const migrated = lines.map((text, idx) => ({
      id: (Date.now() + idx).toString(),
      text,
    }));
    // persist migration so future loads are consistent
    await saveNotes(migrated);
    return migrated;
  }

  return [];
}

async function saveNotes(notes) {
  await storageSet({ notes });
}

async function addNote(text) {
  if (!text || !text.trim()) return;
  const notes = await getNotes();
  notes.push({ id: Date.now().toString(), text: text.trim() });
  await saveNotes(notes);
}

async function deleteNote(id) {
  const notes = await getNotes();
  const updated = notes.filter(n => n.id !== id);
  await saveNotes(updated);
}

function createNoteElement(note) {
  const div = document.createElement("div");
  div.className = "note-item";

  // text portion separated into a span so layout can flex nicely
  const textSpan = document.createElement("span");
  textSpan.textContent = note.text;
  div.appendChild(textSpan);

  const btn = document.createElement("button");
  btn.textContent = "Delete";
  btn.className = "btn delete-note";
  btn.addEventListener("click", async () => {
    await deleteNote(note.id);
    renderNotes();
  });
  div.appendChild(btn);
  return div;
}

async function renderNotes() {
  const container = document.getElementById("notes-list");
  if (!container) return;
  const notes = await getNotes();
  container.innerHTML = "";
  if (notes.length === 0) {
    container.innerHTML = "<p>No notes yet</p>";
  } else {
    notes.forEach(n => container.appendChild(createNoteElement(n)));
  }
}

function setupNotesWidget() {
  const input = document.getElementById("note-input");
  const btn = document.getElementById("add-note-btn");
  if (btn && input) {
    btn.addEventListener("click", async () => {
      await addNote(input.value);
      input.value = "";
      renderNotes();
    });
  }
  renderNotes();
}

// sessions logic
async function getSessions() {
  const data = await storageGet("sessions");
  return data.sessions && typeof data.sessions === "object" ? data.sessions : {};
}

async function saveSessions(sessions) {
  await storageSet({ sessions });
}

async function deleteSession(name) {
  const sessions = await getSessions();
  if (sessions.hasOwnProperty(name)) {
    delete sessions[name];
    await saveSessions(sessions);
  }
}

async function restoreSession(sessionName) {
  const sessions = await getSessions();
  const urls = sessions[sessionName];
  if (urls && Array.isArray(urls)) {
    try {
      // Create a new window
      chrome.windows.create({ focused: true }, (window) => {
        // Open each URL in the new window with a small delay
        urls.forEach((url, index) => {
          setTimeout(() => {
            chrome.tabs.create({ windowId: window.id, url: url });
          }, index * 100);
        });
      });
    } catch (err) {
      console.error("Error restoring session:", err);
    }
  }
}

async function saveCurrentSession() {
  const name = prompt("Enter session name:");
  if (!name) return;
  const tabs = await safeTabsQuery({ currentWindow: true });
  const urls = tabs.map(t => t.url);
  const sessions = await getSessions();
  sessions[name] = urls;
  await saveSessions(sessions);
  renderSessions();
}

async function renderSessions() {
  const container = document.getElementById("sessions-list");
  if (!container) return;
  const sessions = await getSessions();
  container.innerHTML = "";
  const names = Object.keys(sessions);
  if (names.length === 0) {
    container.innerHTML = "<p>No sessions yet</p>";
    return;
  }
  names.forEach(name => {
    const div = document.createElement("div");
    div.className = "session-item";
    const span = document.createElement("span");
    span.textContent = name;
    div.appendChild(span);

    const restore = document.createElement("button");
    restore.textContent = "Restore";
    restore.className = "btn restore-session";
    restore.addEventListener("click", async () => {
      await restoreSession(name);
    });
    div.appendChild(restore);

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "btn delete-session";
    del.addEventListener("click", async () => {
      await deleteSession(name);
      renderSessions();
    });
    div.appendChild(del);

    container.appendChild(div);
  });
}

function setupSessionsWidget() {
  const saveBtn = document.getElementById("save-session-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveCurrentSession);
  }
  renderSessions();
}

// clock
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const el = document.getElementById("clock");
  if (el) el.textContent = time;
}

function init() {
  setupNotesWidget();
  setupSessionsWidget();
  updateClock();
  setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", init);
