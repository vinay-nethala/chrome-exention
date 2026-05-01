// Create context menu when extension installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToNotes",
    title: "Add page to notes",
    contexts: ["page"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToNotes") {
    const data = await chrome.storage.local.get("notes");
    const notes = data.notes || "";

    const updated = notes + `\n${tab.title} - ${tab.url}`;
    await chrome.storage.local.set({ notes: updated });
  }
});

// Website blocker logic
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "loading" || !tab.url) return;

  const data = await chrome.storage.sync.get("blockedSites");
  const blockedSites = data.blockedSites || [];

  try {
    const url = new URL(tab.url);

    if (blockedSites.some(site => url.hostname.includes(site))) {
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          document.body.innerHTML =
            '<h1 data-testid="blocked-message">Page Blocked</h1>';
        }
      });
    }
  } catch (e) {}
});