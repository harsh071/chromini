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
    id: 'write-write',
    parentId: 'ai-writer-menu',
    title: '✍️ Write',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'write-translate',
    parentId: 'ai-writer-menu',
    title: '🌐 Translate',
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
  } else if (request.action === 'fetchPDF') {
    // Fetch PDF from background script to avoid CORS issues
    fetch(request.url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => {
        sendResponse({
          success: true,
          data: Array.from(new Uint8Array(arrayBuffer))
        });
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true; // Keep channel open for async response
  }
  return true;
});
