const textarea = document.querySelector('[data-testid="notes-textarea"]');

// SAVE SESSION
document.querySelector('[data-testid="save-session-btn"]')
.addEventListener('click', async () => {
  const name = prompt("Enter session name:");
  if (!name) return;

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const urls = tabs.map(t => t.url);

  const data = await chrome.storage.local.get("sessions");
  const sessions = data.sessions || {};

  sessions[name] = urls;
  await chrome.storage.local.set({ sessions });

  loadSessions();
});

// LOAD SESSIONS
async function loadSessions() {
  const data = await chrome.storage.local.get("sessions");
  const sessions = data.sessions || {};

  const container = document.querySelector('[data-testid="sessions-list"]');
  container.innerHTML = "";

  Object.keys(sessions).forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = `Restore ${name}`;
    btn.setAttribute("data-testid", `restore-session-${name}`);
    btn.onclick = () => restoreSession(name);
    container.appendChild(btn);
  });
}

// RESTORE SESSION
async function restoreSession(name) {
  const data = await chrome.storage.local.get("sessions");
  const urls = data.sessions[name];
  if (!urls) return;

  chrome.windows.create({ url: urls });
}

// NOTES
async function loadNotes() {
  const data = await chrome.storage.local.get("notes");
  let notes = data.notes;
  if (Array.isArray(notes)) {
    // join array items into textarea by newline
    textarea.value = notes.map(n => n.text).join("\n");
  } else if (typeof notes === "string") {
    // old format: raw string
    textarea.value = notes;
  } else {
    textarea.value = "";
  }
}

document.querySelector('[data-testid="save-notes-btn"]')
.addEventListener("click", async () => {
  const raw = textarea.value;
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const notesArr = lines.map((text,idx) => ({ id: (Date.now()+idx).toString(), text }));
  await chrome.storage.local.set({ notes: notesArr });
});

// OPEN OPTIONS
document.querySelector('[data-testid="open-options-btn"]')
.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

loadSessions();
loadNotes();