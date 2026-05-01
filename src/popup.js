// Popup script for Productivity Suite

// Notes Management
async function getNotes() {
  return new Promise(resolve => {
    chrome.storage.local.get("notes", (data) => {
      const notes = data.notes && Array.isArray(data.notes) ? data.notes : [];
      resolve(notes);
    });
  });
}

async function saveNotes(notes) {
  return new Promise(resolve => {
    chrome.storage.local.set({ notes }, resolve);
  });
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

// Sessions Management
async function getSessions() {
  return new Promise(resolve => {
    chrome.storage.local.get("sessions", (data) => {
      const sessions = data.sessions && typeof data.sessions === "object" ? data.sessions : {};
      resolve(sessions);
    });
  });
}

async function saveSessions(sessions) {
  return new Promise(resolve => {
    chrome.storage.local.set({ sessions }, resolve);
  });
}

async function deleteSession(name) {
  const sessions = await getSessions();
  if (sessions.hasOwnProperty(name)) {
    delete sessions[name];
    await saveSessions(sessions);
  }
}

async function saveCurrentSession(name) {
  const tabs = await new Promise(resolve => {
    chrome.tabs.query({ currentWindow: true }, resolve);
  });
  const urls = tabs.map(t => t.url);
  const sessions = await getSessions();
  sessions[name] = urls;
  await saveSessions(sessions);
}

async function restoreSession(sessionName) {
  const sessions = await getSessions();
  const urls = sessions[sessionName];
  if (urls && Array.isArray(urls)) {
    chrome.windows.create({ focused: true }, (window) => {
      urls.forEach((url, index) => {
        setTimeout(() => {
          chrome.tabs.create({ windowId: window.id, url: url });
        }, index * 100);
      });
    });
  }
}

// Rendering Functions
function createNoteElement(note) {
  const div = document.createElement("div");
  div.className = "item";
  
  const span = document.createElement("span");
  span.textContent = note.text;
  div.appendChild(span);
  
  const btn = document.createElement("button");
  btn.textContent = "Delete";
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
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No notes yet";
    container.appendChild(empty);
  } else {
    notes.forEach(n => container.appendChild(createNoteElement(n)));
  }
}

function createSessionElement(name, urls) {
  const div = document.createElement("div");
  div.className = "session-item";
  
  const header = document.createElement("div");
  header.className = "session-header";
  
  const nameSpan = document.createElement("span");
  nameSpan.className = "session-name";
  nameSpan.textContent = name;
  header.appendChild(nameSpan);
  
  const actions = document.createElement("div");
  actions.className = "session-actions";
  
  const restoreBtn = document.createElement("button");
  restoreBtn.textContent = "Restore";
  restoreBtn.addEventListener("click", async () => {
    await restoreSession(name);
  });
  actions.appendChild(restoreBtn);
  
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", async () => {
    await deleteSession(name);
    renderSessions();
  });
  actions.appendChild(deleteBtn);
  
  header.appendChild(actions);
  div.appendChild(header);
  
  if (urls && Array.isArray(urls)) {
    const urlsDiv = document.createElement("div");
    urlsDiv.className = "session-urls";
    urls.slice(0, 3).forEach(url => {
      const p = document.createElement("p");
      p.textContent = url;
      urlsDiv.appendChild(p);
    });
    if (urls.length > 3) {
      const p = document.createElement("p");
      p.textContent = `+${urls.length - 3} more`;
      urlsDiv.appendChild(p);
    }
    div.appendChild(urlsDiv);
  }
  
  return div;
}

async function renderSessions() {
  const container = document.getElementById("sessions-list");
  if (!container) return;
  
  const sessions = await getSessions();
  container.innerHTML = "";
  
  const names = Object.keys(sessions);
  if (names.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No sessions saved";
    container.appendChild(empty);
  } else {
    names.forEach(name => {
      container.appendChild(createSessionElement(name, sessions[name]));
    });
  }
}

// Data Export
async function exportData() {
  const notes = await getNotes();
  const sessions = await getSessions();
  const blockedSites = await new Promise(resolve => {
    chrome.storage.sync.get("blockedSites", (data) => {
      resolve(data.blockedSites || []);
    });
  });
  
  const exportData = {
    notes,
    sessions,
    blockedSites,
    exportedAt: new Date().toISOString()
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `productivity_suite_export.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  renderNotes();
  renderSessions();
  
  // Notes button
  const saveNotesBtn = document.getElementById("save-notes-btn");
  const notesTextarea = document.getElementById("notes-textarea");
  
  if (saveNotesBtn && notesTextarea) {
    saveNotesBtn.addEventListener("click", async () => {
      await addNote(notesTextarea.value);
      notesTextarea.value = "";
      renderNotes();
    });
  }
  
  // Session button
  const saveSessionBtn = document.getElementById("save-session-btn");
  if (saveSessionBtn) {
    saveSessionBtn.addEventListener("click", async () => {
      const name = prompt("Enter session name:");
      if (name) {
        await saveCurrentSession(name);
        renderSessions();
      }
    });
  }
  
  // Export button
  const exportBtn = document.querySelector('[data-testid="export-data-btn"]');
  if (exportBtn) {
    exportBtn.addEventListener("click", exportData);
  }
  
  // Options buttons
  const openOptionsBtn = document.getElementById("open-options-btn");
  const openOptionsLink = document.getElementById("open-options-link");
  
  if (openOptionsBtn) {
    openOptionsBtn.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  }
  
  if (openOptionsLink) {
    openOptionsLink.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  }
});
