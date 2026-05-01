// ADD BLOCKED SITE
document.querySelector('[data-testid="add-block-btn"]')
.addEventListener("click", async () => {
  const input = document.querySelector('[data-testid="block-hostname-input"]');
  const host = input.value.trim();
  if (!host) return;

  const data = await chrome.storage.sync.get("blockedSites");
  const blockedSites = data.blockedSites || [];

  if (!blockedSites.includes(host)) {
    blockedSites.push(host);
    await chrome.storage.sync.set({ blockedSites });
  }

  input.value = "";
  loadBlocked();
});

// LOAD BLOCKED SITES
async function loadBlocked() {
  const data = await chrome.storage.sync.get("blockedSites");
  const list = data.blockedSites || [];

  const ul = document.querySelector('[data-testid="blocked-sites-list"]');
  ul.innerHTML = "";

  list.forEach(site => {
    const li = document.createElement("li");
    li.textContent = site;
    ul.appendChild(li);
  });
}

// EXPORT DATA
document.querySelector('[data-testid="export-data-btn"]')
.addEventListener("click", async () => {
  const local = await chrome.storage.local.get(["sessions", "notes"]);
  const sync = await chrome.storage.sync.get(["blockedSites"]);

  const exportData = {
    sessions: local.sessions || {},
    notes: local.notes || "",
    blockedSites: sync.blockedSites || []
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url,
    filename: "productivity_suite_export.json"
  });
});

loadBlocked();