// Background service worker for AI Writing Assistant

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ai-writer-menu',
    title: 'AI Writing Assistant',
    contexts: ['selection']
  });

  // Create submenu items for different writing tasks
  chrome.contextMenus.create({
    id: 'write-cover-letter',
    parentId: 'ai-writer-menu',
    title: 'Draft Cover Letter',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'write-proposal',
    parentId: 'ai-writer-menu',
    title: 'Draft Proposal',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'write-email',
    parentId: 'ai-writer-menu',
    title: 'Draft Email',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'write-post',
    parentId: 'ai-writer-menu',
    title: 'Draft Social Post',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'write-custom',
    parentId: 'ai-writer-menu',
    title: 'Custom Writing Task',
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
