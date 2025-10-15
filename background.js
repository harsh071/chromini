// Background service worker for AI Writing Assistant

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ai-writer-menu',
    title: 'AI Writing Assistant',
    contexts: ['selection']
  });

  // Core text transformation options
  chrome.contextMenus.create({
    id: 'write-rephrase',
    parentId: 'ai-writer-menu',
    title: '✏️ Rephrase',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'write-summarize',
    parentId: 'ai-writer-menu',
    title: '📋 Summarize',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'ai-writer-separator-1',
    parentId: 'ai-writer-menu',
    type: 'separator',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'write-custom',
    parentId: 'ai-writer-menu',
    title: '✨ Custom Task',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith('write-')) {
    const selectedText = info.selectionText;
    const taskType = info.menuItemId.replace('write-', '');

    // Send message to content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'processText',
      text: selectedText,
      taskType: taskType
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkWriterAPI') {
    // This will be handled by content script since it has access to DOM APIs
    sendResponse({ status: 'forward_to_content' });
  }
  return true;
});
