// Background Service Worker for Productivity Suite Extension

// Initialize context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-note-context",
    title: "Add current page to notes",
    contexts: ["page"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "add-note-context") {
    const notes = await getStorageNotes();
    const pageUrl = tab.url;
    const newNote = {
      id: Date.now().toString(),
      text: `[${tab.title}](${pageUrl})`
    };
    notes.push(newNote);
    await saveStorageNotes(notes);
  }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "save-session") {
    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
      const urls = tabs.map(t => t.url);
      const name = `Session-${new Date().toLocaleString()}`;
      const sessions = await getStorageSessions();
      sessions[name] = urls;
      await saveStorageSessions(sessions);
      
      // Notify user via popup
      chrome.action.setBadgeText({ text: "✓" });
      setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
    });
  }
});

// Listen for tab updates to enforce website blocking
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
    const blockedSites = await getStorageBlockedSites();
    if (blockedSites && blockedSites.length > 0 && tab.url) {
      try {
        const url = new URL(tab.url);
        const hostname = url.hostname;
        
        if (blockedSites.some(site => hostname.includes(site))) {
          // Redirect to a blocked page
          chrome.tabs.update(tabId, {
            url: chrome.runtime.getURL("src/blocked.html") + "?url=" + encodeURIComponent(tab.url)
          });
        }
      } catch (err) {
        console.error("Error checking blocked sites:", err);
      }
    }
  }
});

// Storage utility functions
async function getStorageNotes() {
  const data = await chrome.storage.local.get("notes");
  return data.notes && Array.isArray(data.notes) ? data.notes : [];
}

async function saveStorageNotes(notes) {
  await chrome.storage.local.set({ notes });
}

async function getStorageSessions() {
  const data = await chrome.storage.local.get("sessions");
  return data.sessions && typeof data.sessions === "object" ? data.sessions : {};
}

async function saveStorageSessions(sessions) {
  await chrome.storage.local.set({ sessions });
}

async function getStorageBlockedSites() {
  const data = await chrome.storage.sync.get("blockedSites");
  return data.blockedSites && Array.isArray(data.blockedSites) ? data.blockedSites : [];
}

async function saveStorageBlockedSites(sites) {
  await chrome.storage.sync.set({ blockedSites: sites });
}

// Respond to messages from popup/options/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getNotes") {
    getStorageNotes().then(sendResponse);
    return true;
  } else if (request.action === "addNote") {
    getStorageNotes().then(async (notes) => {
      notes.push({ id: Date.now().toString(), text: request.text });
      await saveStorageNotes(notes);
      sendResponse({ success: true });
    });
    return true;
  } else if (request.action === "getSessions") {
    getStorageSessions().then(sendResponse);
    return true;
  } else if (request.action === "saveSessions") {
    saveStorageSessions(request.sessions).then(() => {
      sendResponse({ success: true });
    });
    return true;
  } else if (request.action === "getBlockedSites") {
    getStorageBlockedSites().then(sendResponse);
    return true;
  } else if (request.action === "saveBlockedSites") {
    saveStorageBlockedSites(request.sites).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});
