// Loader script - controls injection of other scripts
chrome.storage.local.get('isActive', ({ isActive = true }) => {
  if (isActive) {
    injectScripts();
  }
});

// Listen for activation changes
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "toggleExtension") {
    if (message.isActive) {
      injectScripts();
    } else {
      removeInjectedScripts();
    }
  }
});

// Add this new listener for keyboard shortcuts
chrome.runtime.onMessage.addListener((message) => {
  if (message.command) {
    window.dispatchEvent(
      new CustomEvent("extensionCommand", { detail: message.command })
    );
  }
});

function injectScripts() {
  // Inject CSS
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = chrome.runtime.getURL('style.css');
  document.head.appendChild(css);
  
  // Inject main content script
  const contentScript = document.createElement('script');
  contentScript.src = chrome.runtime.getURL('content.js');
  contentScript.onload = function() { this.remove(); };
  document.head.appendChild(contentScript);
  
  // Inject resizer script
  const resizerScript = document.createElement('script');
  resizerScript.src = chrome.runtime.getURL('resizer.js');
  resizerScript.onload = function() { this.remove(); };
  document.head.appendChild(resizerScript);
  
  // Store references for removal
  document.__extensionElements = [css, contentScript, resizerScript];
}

function removeInjectedScripts() {
  if (document.__extensionElements) {
    document.__extensionElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    delete document.__extensionElements;
  }
}