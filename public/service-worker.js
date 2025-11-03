chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "web-vitals" && sender.tab?.id >= 0) {
    const tabId = sender.tab.id;
    const metric = msg.data;
    const key = `${tabId}_${metric.name}`; // e.g. "42_LCP"

    // Store metric under independent key (race-safe)
    chrome.storage.local.set({ [key]: metric });
  }
});

// 🧹 Cleanup on tab close
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const all = await chrome.storage.local.get(null);
  const keysToRemove = Object.keys(all).filter(k => k.startsWith(`${tabId}_`));
  if (keysToRemove.length > 0) {
    await chrome.storage.local.remove(keysToRemove);
  }
});

// 🌀 Optional: cleanup when Chrome restarts (e.g., purge old data)
chrome.runtime.onStartup.addListener(async () => {
  // If you want to start fresh each session
  await chrome.storage.local.clear();
});

// 🧩 (Optional) Helper to get all metrics for a tab
async function getTabVitals(tabId) {
  const all = await chrome.storage.local.get(null);
  const result = {};
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith(`${tabId}_`)) {
      const metricName = key.split("_")[1];
      result[metricName] = value;
    }
  }
  return result;
}

// Expose helper for popup via messaging
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "get-tab-vitals" && msg.tabId) {
    getTabVitals(msg.tabId).then(sendResponse);
    return true; // keeps message channel open for async response
  }
});

chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Ignore if it's not a normal page navigation
  if (details.frameId !== 0) return; // Only top frame
  const tabId = details.tabId;

  // Remove old vitals data for this tab (fresh start)
  const all = await chrome.storage.local.get(null);
  const keysToRemove = Object.keys(all).filter(k => k.startsWith(`${tabId}_`));
  if (keysToRemove.length > 0) {
    await chrome.storage.local.remove(keysToRemove);
  }
});

