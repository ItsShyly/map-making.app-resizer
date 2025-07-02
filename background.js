// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isActive: true });
});

// Update icon on startup
chrome.storage.local.get('isActive', ({ isActive = true }) => {
  updateIcon(isActive);
});

// Toggle state on icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get('isActive', ({ isActive = true }) => {
    const newState = !isActive;
    chrome.storage.local.set({ isActive: newState });
    updateIcon(newState);
    
    // Notify content scripts about state change
    chrome.tabs.query({url: "https://map-making.app/*"}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: "toggleExtension", 
          isActive: newState
        });
      });
    });
  });
});

// Update icon appearance
function updateIcon(isActive) {
  const suffix = isActive ? '' : '-off';
  chrome.action.setIcon({
    path: {
      16: `icons/icon16${suffix}.png`,
      32: `icons/icon32${suffix}.png`,
      48: `icons/icon48${suffix}.png`,
      128: `icons/icon128${suffix}.png`
    }
  });
  chrome.action.setTitle({
    title: isActive ? "Extension is active" : "Extension is disabled"
  });
}

//Shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "focus-tag-input" || command === "close-tag-overlay") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { command });
      }
    });
  }
});