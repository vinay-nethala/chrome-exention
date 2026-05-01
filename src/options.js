// Options script for Productivity Suite

// Blocklist Management
async function getBlockedSites() {
  return new Promise(resolve => {
    chrome.storage.sync.get("blockedSites", (data) => {
      const sites = data.blockedSites && Array.isArray(data.blockedSites) ? data.blockedSites : [];
      resolve(sites);
    });
  });
}

async function saveBlockedSites(sites) {
  return new Promise(resolve => {
    chrome.storage.sync.set({ blockedSites: sites }, resolve);
  });
}

async function addBlockedSite(hostname) {
  if (!hostname || !hostname.trim()) return false;
  
  const sites = await getBlockedSites();
  const normalized = hostname.trim().toLowerCase();
  
  if (!sites.includes(normalized)) {
    sites.push(normalized);
    await saveBlockedSites(sites);
    return true;
  }
  return false;
}

async function removeBlockedSite(hostname) {
  const sites = await getBlockedSites();
  const filtered = sites.filter(s => s !== hostname);
  await saveBlockedSites(filtered);
}

async function clearAllBlockedSites() {
  await saveBlockedSites([]);
}

// Rendering
async function renderBlockedSites() {
  const container = document.getElementById("blocked-sites-list");
  if (!container) return;
  
  const sites = await getBlockedSites();
  container.innerHTML = "";
  
  if (sites.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = '<div class="empty-state-icon">✓</div><div>No blocked sites yet</div>';
    container.parentElement.appendChild(empty);
  } else {
    sites.forEach(site => {
      const li = document.createElement("li");
      li.className = "site-item";
      
      const span = document.createElement("span");
      span.className = "site-item-text";
      span.textContent = site;
      li.appendChild(span);
      
      const btn = document.createElement("button");
      btn.textContent = "Remove";
      btn.className = "danger";
      btn.addEventListener("click", async () => {
        await removeBlockedSite(site);
        renderBlockedSites();
      });
      li.appendChild(btn);
      
      container.appendChild(li);
    });
  }
}

// Data Export/Import
async function exportAllData() {
  const notes = await new Promise(resolve => {
    chrome.storage.local.get("notes", (data) => {
      resolve(data.notes || []);
    });
  });
  
  const sessions = await new Promise(resolve => {
    chrome.storage.local.get("sessions", (data) => {
      resolve(data.sessions || {});
    });
  });
  
  const blockedSites = await getBlockedSites();
  
  const exportData = {
    notes,
    sessions,
    blockedSites,
    exportedAt: new Date().toISOString(),
    version: "1.0.0"
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `productivity-suite-backup-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showSuccessMessage();
}

async function importData(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.notes) {
        await new Promise(resolve => {
          chrome.storage.local.set({ notes: data.notes }, resolve);
        });
      }
      
      if (data.sessions) {
        await new Promise(resolve => {
          chrome.storage.local.set({ sessions: data.sessions }, resolve);
        });
      }
      
      if (data.blockedSites) {
        await saveBlockedSites(data.blockedSites);
      }
      
      renderBlockedSites();
      showSuccessMessage("Data imported successfully");
    } catch (err) {
      alert("Error importing file: " + err.message);
    }
  };
  reader.readAsText(file);
}

async function clearAllData() {
  if (confirm("Are you sure? This will delete all your notes, sessions, and blocklist. This cannot be undone.")) {
    await new Promise(resolve => {
      chrome.storage.local.clear(resolve);
    });
    await new Promise(resolve => {
      chrome.storage.sync.clear(resolve);
    });
    renderBlockedSites();
    showSuccessMessage("All data cleared");
  }
}

function showSuccessMessage(message = "Settings saved successfully") {
  const msg = document.getElementById("success-message");
  if (msg) {
    msg.textContent = "✓ " + message;
    msg.classList.add("show");
    setTimeout(() => {
      msg.classList.remove("show");
    }, 3000);
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  renderBlockedSites();
  
  // Add blocked site
  const addBlockBtn = document.getElementById("add-block-btn");
  const hostnameInput = document.getElementById("block-hostname-input");
  
  if (addBlockBtn && hostnameInput) {
    addBlockBtn.addEventListener("click", async () => {
      if (await addBlockedSite(hostnameInput.value)) {
        hostnameInput.value = "";
        renderBlockedSites();
        showSuccessMessage("Site added to blocklist");
      } else {
        alert("Please enter a valid hostname or it's already blocked");
      }
    });
    
    hostnameInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        if (await addBlockedSite(hostnameInput.value)) {
          hostnameInput.value = "";
          renderBlockedSites();
          showSuccessMessage("Site added to blocklist");
        }
      }
    });
  }
  
  // Clear all blocklist
  const clearAllBtn = document.getElementById("clear-all-btn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", async () => {
      if (confirm("Remove all blocked sites?")) {
        await clearAllBlockedSites();
        renderBlockedSites();
        showSuccessMessage("Blocklist cleared");
      }
    });
  }
  
  // Export data
  const exportBtn = document.getElementById("export-all-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportAllData);
  }
  
  // Import data
  const importBtn = document.getElementById("import-all-btn");
  const importFile = document.getElementById("import-file");
  
  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => {
      importFile.click();
    });
    
    importFile.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        importData(e.target.files[0]);
      }
    });
  }
  
  // Clear all data
  const clearDataBtn = document.getElementById("clear-all-data-btn");
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", clearAllData);
  }
});
