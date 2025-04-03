
// Listen for installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('GTI Content Capture extension installed or updated');
  
  // Set up side panel configuration
  chrome.sidePanel.setOptions({
    enabled: true,
    path: 'index.html'
  });
});

// Inject the content script when a tab is updated and completed loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content.js']
    }).catch(err => console.error('Error injecting content script:', err));
  }
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});
