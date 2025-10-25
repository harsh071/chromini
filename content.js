// Content script for AI Writing Assistant
// This script handles the Prompt API (Summarizer, Rewriter, Writer, Translator) integration and UI

let summarizerInstance = null;
let rewriterInstance = null;
let writerInstance = null;
let translatorInstance = null;
let isAIAvailable = false;
let pageContext = null;
let pageContextEnabled = true;
let isContextExtracting = false;

// Task configurations
const TASK_CONFIGS = {
  'rephrase': {
    apiType: 'rewriter',
    tone: 'as-is',
    length: 'as-is',
    sharedContext: 'Text rephrasing'
  },
  'summarize': {
    apiType: 'summarizer',
    type: 'key-points',
    format: 'markdown',
    length: 'short',
    sharedContext: 'Text summarization'
  },
  'write': {
    apiType: 'writer',
    tone: 'neutral',
    length: 'medium',
    sharedContext: 'Content writing'
  },
  'translate': {
    apiType: 'translator',
    sourceLanguage: 'en',
    targetLanguage: 'es',
    sharedContext: 'Translation'
  },
  'custom': {
    apiType: 'writer',
    tone: 'neutral',
    length: 'medium',
    sharedContext: 'General writing task'
  }
};

// Page Context Management
const MAX_CONTEXT_WORDS = 3000;

// Extract visible text from the current page (supports both webpages and PDFs)
async function extractPageContext() {
  try {
    // Check if we're in a PDF viewer
    const isPDF = window.PDFExtractor && window.PDFExtractor.isPDFPage();

    if (isPDF) {
      // Extract text from PDF
      const pdfText = await window.PDFExtractor.extractPDFText(window.location.href, MAX_CONTEXT_WORDS);
      return pdfText;
    }

    // Get all visible text from the page
    let text = document.body.innerText || document.body.textContent || '';

    // Clean up the text
    text = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();

    // Limit to first MAX_CONTEXT_WORDS words to avoid overwhelming the model
    const words = text.split(/\s+/);
    if (words.length > MAX_CONTEXT_WORDS) {
      text = words.slice(0, MAX_CONTEXT_WORDS).join(' ') + '...';
    }

    return text;
  } catch (error) {
    console.error('Error extracting page context:', error);
    return null;
  }
}

// Get or refresh page context
async function getPageContext(forceRefresh = false) {
  if (isContextExtracting) {
    return pageContext; // Return cached if already extracting
  }

  if (!pageContextEnabled) {
    return null;
  }

  if (pageContext && !forceRefresh) {
    return pageContext;
  }

  isContextExtracting = true;
  pageContext = await extractPageContext();
  isContextExtracting = false;

  return pageContext;
}

// Toggle page context feature
function togglePageContext() {
  pageContextEnabled = !pageContextEnabled;

  // Update UI to reflect state
  const toggleBtn = document.querySelector('.ai-context-toggle');
  const badge = document.querySelector('.ai-context-badge');

  if (toggleBtn) {
    if (pageContextEnabled) {
      toggleBtn.classList.add('active');
      toggleBtn.title = 'Page context enabled - Click to disable';
      if (badge) badge.style.display = 'flex';
    } else {
      toggleBtn.classList.remove('active');
      toggleBtn.title = 'Page context disabled - Click to enable';
      if (badge) badge.style.display = 'none';
    }
  }

  return pageContextEnabled;
}

// Check if AI APIs are available
async function checkAIAvailability() {
  try {
    const capabilities = {
      summarizer: false,
      rewriter: false,
      writer: false,
      translator: false
    };

    // Check Summarizer API
    if ('Summarizer' in self) {
      const summarizerAvailability = await self.Summarizer.availability();
      capabilities.summarizer = summarizerAvailability !== 'unavailable';
      console.log('Summarizer API availability:', summarizerAvailability);
    }

    // Check Rewriter API
    if ('Rewriter' in self) {
      const rewriterAvailability = await self.Rewriter.availability();
      capabilities.rewriter = rewriterAvailability !== 'unavailable';
      console.log('Rewriter API availability:', rewriterAvailability);
    }

    // Check Writer API
    if ('Writer' in self) {
      const writerAvailability = await self.Writer.availability();
      capabilities.writer = writerAvailability !== 'unavailable';
      console.log('Writer API availability:', writerAvailability);
    }

    // Check Translator API
    if ('Translator' in self) {
      const translatorAvailability = await self.Translator.availability({
        sourceLanguage: 'en',
        targetLanguage: 'es'
      });
      capabilities.translator = translatorAvailability !== 'unavailable';
      console.log('Translator API availability:', translatorAvailability);
    }

    console.log('AI capabilities:', capabilities);
    return capabilities.summarizer || capabilities.rewriter || capabilities.writer || capabilities.translator;
  } catch (error) {
    console.error('Error checking AI availability:', error);
    return false;
  }
}

// Initialize AI API based on task type
async function initAI(taskType) {
  try {
    const config = TASK_CONFIGS[taskType] || TASK_CONFIGS['custom'];
    const apiType = config.apiType;

    // Show loading indicator in the chat if it exists
    const messagesContainer = document.getElementById('chat-messages');
    let loadingMsg = null;

    if (messagesContainer) {
      loadingMsg = document.createElement('div');
      loadingMsg.className = 'ai-writer-chat-message assistant loading-message';
      loadingMsg.textContent = `Initializing ${apiType}...`;
      messagesContainer.appendChild(loadingMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    let instance = null;

    switch (apiType) {
      case 'summarizer':
        if (!summarizerInstance) {
          summarizerInstance = await self.Summarizer.create({
            type: config.type,
            format: config.format,
            length: config.length,
            monitor(m) {
              m.addEventListener('downloadprogress', (e) => {
                const percent = Math.round(e.loaded * 100);
                if (loadingMsg) {
                  loadingMsg.textContent = `Downloading summarizer model: ${percent}%`;
                  messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
              });
            }
          });
        }
        instance = summarizerInstance;
        break;

      case 'rewriter':
        if (!rewriterInstance) {
          rewriterInstance = await self.Rewriter.create({
            tone: config.tone,
            length: config.length,
            sharedContext: config.sharedContext,
            monitor(m) {
              m.addEventListener('downloadprogress', (e) => {
                const percent = Math.round(e.loaded * 100);
                if (loadingMsg) {
                  loadingMsg.textContent = `Downloading rewriter model: ${percent}%`;
                  messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
              });
            }
          });
        }
        instance = rewriterInstance;
        break;

      case 'writer':
        if (!writerInstance) {
          writerInstance = await self.Writer.create({
            tone: config.tone,
            format: 'plain-text',
            length: config.length,
            sharedContext: config.sharedContext,
            monitor(m) {
              m.addEventListener('downloadprogress', (e) => {
                const percent = Math.round(e.loaded * 100);
                if (loadingMsg) {
                  loadingMsg.textContent = `Downloading writer model: ${percent}%`;
                  messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
              });
            }
          });
        }
        instance = writerInstance;
        break;

      case 'translator':
        if (!translatorInstance) {
          translatorInstance = await self.Translator.create({
            sourceLanguage: config.sourceLanguage,
            targetLanguage: config.targetLanguage,
            monitor(m) {
              m.addEventListener('downloadprogress', (e) => {
                const percent = Math.round(e.loaded * 100);
                if (loadingMsg) {
                  loadingMsg.textContent = `Downloading translator model: ${percent}%`;
                  messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
              });
            }
          });
        }
        instance = translatorInstance;
        break;

      default:
        throw new Error(`Unknown API type: ${apiType}`);
    }

    // Remove loading message after initialization
    if (loadingMsg) {
      loadingMsg.remove();
    }

    return instance;
  } catch (error) {
    console.error('Error initializing AI:', error);

    // Show error in chat if available
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'ai-writer-chat-message assistant';
      errorMsg.textContent = 'Failed to initialize AI: ' + error.message;
      errorMsg.style.color = '#ef4444';
      messagesContainer.appendChild(errorMsg);
    }

    return null;
  }
}

// Process text with AI API
async function processWithAI(text, taskType, customPrompt = null, targetLanguage = null) {
  try {
    const config = TASK_CONFIGS[taskType] || TASK_CONFIGS['custom'];
    const apiType = config.apiType;

    // Get the appropriate instance
    let instance;
    switch (apiType) {
      case 'summarizer':
        instance = summarizerInstance || await initAI(taskType);
        break;
      case 'rewriter':
        instance = rewriterInstance || await initAI(taskType);
        break;
      case 'writer':
        instance = writerInstance || await initAI(taskType);
        break;
      case 'translator':
        // For translator, we might need to create a new instance with different languages
        if (targetLanguage && targetLanguage !== config.targetLanguage) {
          instance = await self.Translator.create({
            sourceLanguage: config.sourceLanguage,
            targetLanguage: targetLanguage
          });
        } else {
          instance = translatorInstance || await initAI(taskType);
        }
        break;
    }

    if (!instance) return;

    showLoadingUI('Generating content...');

    let result = '';
    showResultUI(''); // Show empty result box

    // Process based on API type
    if (apiType === 'summarizer') {
      const stream = instance.summarizeStreaming(text);
      for await (const chunk of stream) {
        result += chunk;
        updateResultUI(result);
      }
    } else if (apiType === 'rewriter') {
      const stream = instance.rewriteStreaming(text);
      for await (const chunk of stream) {
        result += chunk;
        updateResultUI(result);
      }
    } else if (apiType === 'writer') {
      let prompt;
      if (taskType === 'custom' && customPrompt) {
        prompt = customPrompt + ' ' + text;
      } else {
        prompt = text;
      }
      const stream = instance.writeStreaming(prompt);
      for await (const chunk of stream) {
        result += chunk;
        updateResultUI(result);
      }
    } else if (apiType === 'translator') {
      result = await instance.translate(text);
      updateResultUI(result);
    }

    console.log('Processing complete:', result);
  } catch (error) {
    console.error('Error processing text:', error);
    showError('Failed to generate content: ' + error.message);
  }
}

// UI Functions
function showLoadingUI(message) {
  removeExistingUI();

  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'ai-writer-loading';
  loadingDiv.className = 'ai-writer-ui';
  loadingDiv.innerHTML = `
    <div class="ai-writer-header">
      <span>AI Writing Assistant</span>
      <div class="ai-writer-header-controls">
        <button class="ai-writer-minimize">−</button>
        <button class="ai-writer-close">×</button>
      </div>
    </div>
    <div class="ai-writer-content">
      <div class="ai-writer-spinner"></div>
      <p class="ai-writer-message">${message}</p>
    </div>
  `;

  document.body.appendChild(loadingDiv);

  // Add event listeners
  loadingDiv.querySelector('.ai-writer-close').addEventListener('click', () => {
    loadingDiv.remove();
  });

  loadingDiv.querySelector('.ai-writer-minimize').addEventListener('click', () => {
    toggleMinimize(loadingDiv);
  });

  // Make modal draggable
  makeDraggable(loadingDiv);
}

function updateLoadingProgress(message) {
  const messageEl = document.querySelector('#ai-writer-loading .ai-writer-message');
  if (messageEl) {
    messageEl.textContent = message;
  }
}

function showResultUI(content) {
  removeExistingUI();

  const resultDiv = document.createElement('div');
  resultDiv.id = 'ai-writer-result';
  resultDiv.className = 'ai-writer-ui';
  resultDiv.innerHTML = `
    <div class="ai-writer-header">
      <span>AI Generated Content</span>
      <div class="ai-writer-header-controls">
        <button class="ai-writer-minimize">−</button>
        <button class="ai-writer-close">×</button>
      </div>
    </div>
    <div class="ai-writer-content">
      <div class="ai-writer-result-text" contenteditable="true">${content}</div>
      <div class="ai-writer-actions">
        <button class="ai-writer-btn ai-writer-copy">Copy</button>
        <button class="ai-writer-btn ai-writer-insert">Insert</button>
        <button class="ai-writer-btn ai-writer-regenerate">Regenerate</button>
      </div>
    </div>
  `;

  document.body.appendChild(resultDiv);

  // Add event listeners
  resultDiv.querySelector('.ai-writer-close').addEventListener('click', () => {
    resultDiv.remove();
  });

  resultDiv.querySelector('.ai-writer-minimize').addEventListener('click', () => {
    toggleMinimize(resultDiv);
  });

  resultDiv.querySelector('.ai-writer-copy').addEventListener('click', copyToClipboard);
  resultDiv.querySelector('.ai-writer-insert').addEventListener('click', insertText);
  resultDiv.querySelector('.ai-writer-regenerate').addEventListener('click', regenerateContent);

  // Make modal draggable and resizable
  makeDraggable(resultDiv);
  makeResizable(resultDiv);
}

function updateResultUI(content) {
  const resultTextEl = document.querySelector('.ai-writer-result-text');
  
  if (resultTextEl) {
    resultTextEl.innerHTML = formatMarkdown(content);
  }
}

function showError(message) {
  removeExistingUI();

  const errorDiv = document.createElement('div');
  errorDiv.id = 'ai-writer-error';
  errorDiv.className = 'ai-writer-ui ai-writer-error';
  errorDiv.innerHTML = `
    <div class="ai-writer-header">
      <span>AI Writing Assistant - Error</span>
      <div class="ai-writer-header-controls">
        <button class="ai-writer-minimize">−</button>
        <button class="ai-writer-close">×</button>
      </div>
    </div>
    <div class="ai-writer-content">
      <p>${message}</p>
      <p class="ai-writer-help">Make sure you're using Chrome 137+ and the Writer API is enabled in chrome://flags</p>
    </div>
  `;

  document.body.appendChild(errorDiv);

  // Add event listeners
  errorDiv.querySelector('.ai-writer-close').addEventListener('click', () => {
    errorDiv.remove();
  });

  errorDiv.querySelector('.ai-writer-minimize').addEventListener('click', () => {
    toggleMinimize(errorDiv);
  });

  // Make modal draggable
  makeDraggable(errorDiv);
}

function removeExistingUI() {
  // Remove all UIs except the chat
  const existing = document.querySelectorAll('.ai-writer-ui:not(#ai-writer-chat)');
  existing.forEach(el => el.remove());
}

// Show custom prompt input dialog
function showCustomPromptDialog(text) {
  removeExistingUI();

  const dialogDiv = document.createElement('div');
  dialogDiv.id = 'ai-writer-prompt';
  dialogDiv.className = 'ai-writer-ui';
  dialogDiv.innerHTML = `
    <div class="ai-writer-header">
      <span>Custom Writing Task</span>
      <div class="ai-writer-header-controls">
        <button class="ai-writer-minimize">−</button>
        <button class="ai-writer-close">×</button>
      </div>
    </div>
    <div class="ai-writer-content">
      <label for="custom-prompt-input" class="ai-writer-label">Enter your custom prompt:</label>
      <input type="text" id="custom-prompt-input" class="ai-writer-input" placeholder="e.g., Write a professional summary of..." autofocus />
      <p class="ai-writer-selected-text">Selected text: <span>"${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"</span></p>
      <div class="ai-writer-actions">
        <button class="ai-writer-btn ai-writer-cancel">Cancel</button>
        <button class="ai-writer-btn ai-writer-submit">Generate</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialogDiv);

  const input = dialogDiv.querySelector('#custom-prompt-input');
  const submitBtn = dialogDiv.querySelector('.ai-writer-submit');
  const cancelBtn = dialogDiv.querySelector('.ai-writer-cancel');
  const closeBtn = dialogDiv.querySelector('.ai-writer-close');
  const minimizeBtn = dialogDiv.querySelector('.ai-writer-minimize');

  // Event listeners
  closeBtn.addEventListener('click', () => {
    dialogDiv.remove();
  });

  minimizeBtn.addEventListener('click', () => {
    toggleMinimize(dialogDiv);
  });

  cancelBtn.addEventListener('click', () => {
    dialogDiv.remove();
  });

  submitBtn.addEventListener('click', () => {
    const customPrompt = input.value.trim();
    if (customPrompt) {
      dialogDiv.remove();
      processWithAI(text, 'custom', customPrompt);
    } else {
      input.focus();
      input.style.borderColor = '#ef4444';
    }
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitBtn.click();
    }
  });

  input.addEventListener('input', () => {
    input.style.borderColor = '';
  });

  // Make modal draggable
  makeDraggable(dialogDiv);

  // Focus the input
  setTimeout(() => input.focus(), 100);
}

// Toggle minimize/maximize
function toggleMinimize(element) {
  element.classList.toggle('minimized');
}

// Toggle chat minimize/maximize
function toggleChatMinimize(chatDiv) {
  chatDiv.classList.toggle('chat-minimized');

  // Update minimize button text
  const minimizeBtn = chatDiv.querySelector('.ai-writer-minimize');
  if (minimizeBtn) {
    if (chatDiv.classList.contains('chat-minimized')) {
      minimizeBtn.textContent = '□';
      minimizeBtn.title = 'Restore';
    } else {
      minimizeBtn.textContent = '−';
      minimizeBtn.title = 'Minimize';
    }
  }
}

// Reset chat conversation
function resetChat() {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  // Show confirmation
  if (confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
    // Clear all messages
    messagesContainer.innerHTML = '';

    // Show welcome message again
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'ai-writer-chat-welcome';
    welcomeMsg.textContent = '👋 Hi! Ask me anything or use the context menu on selected text for specific tasks.';
    messagesContainer.appendChild(welcomeMsg);

    // Clear any pending custom tasks
    window.pendingCustomTask = null;

    // Destroy and recreate AI instances to reset context
    if (writerInstance) {
      writerInstance.destroy();
      writerInstance = null;
    }
    if (summarizerInstance) {
      summarizerInstance.destroy();
      summarizerInstance = null;
    }
    if (rewriterInstance) {
      rewriterInstance.destroy();
      rewriterInstance = null;
    }
    if (translatorInstance) {
      translatorInstance = null; // Translator doesn't have destroy method
    }

    // Show a brief success indicator
    const resetBtn = document.querySelector('.ai-writer-reset');
    if (resetBtn) {
      const originalHTML = resetBtn.innerHTML;
      resetBtn.innerHTML = '✓';
      resetBtn.style.color = '#10b981';
      setTimeout(() => {
        resetBtn.innerHTML = originalHTML;
        resetBtn.style.color = '';
      }, 1500);
    }
  }
}

// Floating chat button
function showChatButton() {
  // Don't show if button already exists
  if (document.querySelector('.ai-chat-fab')) {
    return;
  }

  const fab = document.createElement('button');
  fab.className = 'ai-chat-fab';
  fab.innerHTML = '💬';
  fab.title = 'Open AI Chat (Ctrl+Shift+Space)';

  document.body.appendChild(fab);

  fab.addEventListener('click', () => {
    toggleChatUI();
  });
}

function hideChatButton() {
  const fab = document.querySelector('.ai-chat-fab');
  if (fab) {
    fab.remove();
  }
}

// Toggle chat UI visibility
function toggleChatUI() {
  const existingChat = document.getElementById('ai-writer-chat');

  if (existingChat) {
    // If chat exists, toggle its visibility
    if (existingChat.classList.contains('hidden')) {
      existingChat.classList.remove('hidden');
      const input = existingChat.querySelector('.ai-writer-chat-input');
      setTimeout(() => input?.focus(), 100);
    } else {
      existingChat.classList.add('hidden');
    }
  } else {
    // Create new chat UI
    showChatUI();
  }
}

// Show chat UI for general conversation
function showChatUI() {
  // Remove other UIs but keep the chat if it exists
  const existingModals = document.querySelectorAll('.ai-writer-ui:not(#ai-writer-chat)');
  existingModals.forEach(modal => modal.remove());

  // Detect if we're viewing a PDF to customize the welcome message
  const isPDF = window.PDFExtractor && window.PDFExtractor.isPDFPage();

  const welcomeMessage = isPDF
    ? '📄 Extracting text from PDF<span class="loading-dots">...</span>'
    : '👋 Hi! I can see the page content. Ask me anything about what\'s on this page!';

  const chatDiv = document.createElement('div');
  chatDiv.id = 'ai-writer-chat';
  chatDiv.className = 'ai-writer-ui ai-chat-dropdown';
  chatDiv.innerHTML = `
    <div class="ai-writer-header">
      <div class="ai-writer-header-left">
        <span>💬 AI Chat Assistant</span>
        <div class="ai-context-badge" title="Page context active">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
      </div>
      <div class="ai-writer-header-controls">
        <button class="ai-context-toggle active" title="Page context enabled - Click to disable">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        </button>
        <button class="ai-writer-reset" title="Reset Chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
        <button class="ai-writer-minimize" title="Minimize">−</button>
        <button class="ai-writer-close">×</button>
      </div>
    </div>
    <div class="ai-writer-content">
      <div class="ai-writer-chat-messages" id="chat-messages">
        <div class="ai-writer-chat-welcome">
          ${welcomeMessage}
        </div>
      </div>
      <div class="ai-writer-chat-input-container">
        <textarea class="ai-writer-chat-input" placeholder="Ask me anything about this page..." rows="2"></textarea>
        <button class="ai-writer-send-btn" title="Send (Enter)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(chatDiv);

  const input = chatDiv.querySelector('.ai-writer-chat-input');
  const sendBtn = chatDiv.querySelector('.ai-writer-send-btn');
  const closeBtn = chatDiv.querySelector('.ai-writer-close');
  const minimizeBtn = chatDiv.querySelector('.ai-writer-minimize');
  const resetBtn = chatDiv.querySelector('.ai-writer-reset');
  const contextToggleBtn = chatDiv.querySelector('.ai-context-toggle');

  // Event listeners
  closeBtn.addEventListener('click', () => {
    chatDiv.classList.add('hidden');
  });

  minimizeBtn.addEventListener('click', () => {
    toggleChatMinimize(chatDiv);
  });

  resetBtn.addEventListener('click', () => {
    resetChat();
  });

  contextToggleBtn.addEventListener('click', () => {
    const enabled = togglePageContext();
    // Show feedback message
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      const feedbackMsg = document.createElement('div');
      feedbackMsg.className = 'ai-writer-chat-message system';
      feedbackMsg.textContent = enabled
        ? '✓ Page context enabled - I can now see and answer questions about this page'
        : '✗ Page context disabled - I will only respond to your direct questions';
      feedbackMsg.style.fontSize = '13px';
      feedbackMsg.style.opacity = '0.8';
      messagesContainer.appendChild(feedbackMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Remove feedback after 3 seconds
      setTimeout(() => feedbackMsg.remove(), 3000);
    }
  });

  sendBtn.addEventListener('click', () => {
    const message = input.value.trim();
    if (message) {
      sendChatMessage(message);
      input.value = '';
      input.style.height = 'auto';
    }
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Focus input
  setTimeout(() => input.focus(), 100);

  // If this is a PDF, extract text and update welcome message
  if (isPDF) {
    initializePDFContext();
  }
}

// Initialize PDF context extraction
async function initializePDFContext() {
  const welcomeMsg = document.querySelector('.ai-writer-chat-welcome');
  if (!welcomeMsg) return;

  try {
    // Extract PDF text (this will cache it in pageContext)
    await getPageContext(true);

    // Update welcome message
    welcomeMsg.innerHTML = '📄 PDF text extracted successfully! Ask me anything about this document.';
  } catch (error) {
    console.error('Failed to extract PDF text:', error);
    welcomeMsg.innerHTML = '⚠️ Failed to extract PDF text. You can still select text to use the context menu features.';
  }
}

// Add action buttons to message
function addMessageActions(messageWrapper, messageElement) {
  // Don't add if actions already exist
  if (messageWrapper.querySelector('.ai-writer-message-actions')) {
    return;
  }

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'ai-writer-message-actions';
  actionsDiv.innerHTML = `
    <button class="ai-writer-message-btn copy-btn" title="Copy to clipboard">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      Copy
    </button>
    <button class="ai-writer-message-btn insert-btn" title="Insert at cursor">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Insert
    </button>
  `;

  messageWrapper.appendChild(actionsDiv);

  // Add event listeners
  const copyBtn = actionsDiv.querySelector('.copy-btn');
  const insertBtn = actionsDiv.querySelector('.insert-btn');

  copyBtn.addEventListener('click', () => {
    copyMessageToClipboard(messageElement, copyBtn);
  });

  insertBtn.addEventListener('click', () => {
    insertMessageText(messageElement, insertBtn);
  });
}

// Copy message to clipboard
function copyMessageToClipboard(messageElement, button) {
  const text = messageElement.textContent;

  navigator.clipboard.writeText(text)
    .then(() => {
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Copied!
      `;
      button.style.color = '#10b981';

      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.color = '';
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy:', err);
      button.textContent = 'Failed';
      setTimeout(() => {
        button.innerHTML = originalHTML;
      }, 2000);
    });
}

// Insert message text at cursor position
function insertMessageText(messageElement, button) {
  const text = messageElement.textContent;

  if (!lastActiveElement) {
    // If no element was tracked, show error
    const originalHTML = button.innerHTML;
    button.innerHTML = `⚠️ Click in a text field first`;
    button.style.color = '#ef4444';
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.color = '';
    }, 2500);
    return;
  }

  // Check if the element still exists in the DOM
  if (!document.body.contains(lastActiveElement)) {
    const originalHTML = button.innerHTML;
    button.innerHTML = `⚠️ Text field no longer available`;
    button.style.color = '#ef4444';
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.color = '';
    }, 2500);
    return;
  }

  try {
    // Check if the element is an input or textarea
    if (lastActiveElement.tagName === 'INPUT' || lastActiveElement.tagName === 'TEXTAREA') {
      // Get current position or use last stored position
      let start = lastActiveElement.selectionStart ?? lastCursorPosition.start;
      let end = lastActiveElement.selectionEnd ?? lastCursorPosition.end;
      const currentValue = lastActiveElement.value;

      // Insert text at cursor position
      const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
      lastActiveElement.value = newValue;

      // Focus and set cursor after inserted text
      lastActiveElement.focus();
      const newPosition = start + text.length;
      lastActiveElement.setSelectionRange(newPosition, newPosition);

      // Trigger input event for frameworks that listen to it
      lastActiveElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Check if it's a contenteditable element
    else if (lastActiveElement.isContentEditable) {
      lastActiveElement.focus();

      // Try modern approach first
      if (typeof lastActiveElement.setRangeText === 'function') {
        lastActiveElement.setRangeText(text);
      } else {
        // Fallback to execCommand (deprecated but still works)
        document.execCommand('insertText', false, text);
      }
    }

    // Show success feedback
    const originalHTML = button.innerHTML;
    button.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Inserted!
    `;
    button.style.color = '#10b981';

    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.color = '';
    }, 2000);
  } catch (error) {
    console.error('Failed to insert text:', error);
    const originalHTML = button.innerHTML;
    button.innerHTML = `⚠️ Insert failed`;
    button.style.color = '#ef4444';
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.color = '';
    }, 2500);
  }
}

// Send chat message
async function sendChatMessage(message) {
  const messagesContainer = document.getElementById('chat-messages');

  // Remove welcome message on first chat
  const welcomeMsg = messagesContainer.querySelector('.ai-writer-chat-welcome');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }

  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-writer-chat-message user';
  userMsg.textContent = message;
  messagesContainer.appendChild(userMsg);

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Check if AI is available
  const available = await checkAIAvailability();
  if (!available) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'ai-writer-chat-message assistant';
    errorMsg.textContent = 'Sorry, the AI APIs are not available on this device. Please check system requirements.';
    errorMsg.style.color = '#ef4444';
    messagesContainer.appendChild(errorMsg);
    return;
  }

  // Initialize writer if needed
  if (!writerInstance) {
    await initAI('custom');
  }

  // Add assistant message wrapper
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'ai-writer-message-wrapper assistant-wrapper';

  const assistantMsg = document.createElement('div');
  assistantMsg.className = 'ai-writer-chat-message assistant';
  assistantMsg.textContent = '';

  messageWrapper.appendChild(assistantMsg);
  messagesContainer.appendChild(messageWrapper);

  try {
    let finalPrompt = message;

    // Check if there's a pending custom task
    if (window.pendingCustomTask) {
      const { text } = window.pendingCustomTask;
      finalPrompt = message + ' ' + text;
      window.pendingCustomTask = null; // Clear it after use
    }
    // Include page context if enabled and no pending task
    else if (pageContextEnabled) {
      const context = await getPageContext();
      if (context && context.length > 50) {
        // Only include context if it's substantial
        finalPrompt = `Based on the following page content, please answer the user's question.\n\nPage content:\n${context}\n\nUser question: ${message}`;

        // Update badge to show context was used
        const badge = document.querySelector('.ai-context-badge');
        if (badge) {
          badge.classList.add('active');
          setTimeout(() => badge.classList.remove('active'), 2000);
        }
      }
    }

    // Stream the response
    const stream = writerInstance.writeStreaming(finalPrompt);
    let result = '';

    for await (const chunk of stream) {
      result += chunk;
      assistantMsg.innerHTML = formatMarkdown(result);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    console.log(result)

    // Add action buttons after streaming completes
    addMessageActions(messageWrapper, assistantMsg);
  } catch (error) {
    assistantMsg.textContent = 'Sorry, I encountered an error: ' + error.message;
    assistantMsg.style.color = '#ef4444';
  }
}

// Make modal draggable
function makeDraggable(element) {
  const header = element.querySelector('.ai-writer-header');
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  header.style.cursor = 'move';

  header.addEventListener('mousedown', (e) => {
    // Don't drag when clicking buttons
    if (e.target.classList.contains('ai-writer-close') ||
        e.target.classList.contains('ai-writer-minimize') ||
        e.target.closest('.ai-writer-header-controls')) return;

    isDragging = true;

    // Get current position
    const rect = element.getBoundingClientRect();
    initialX = e.clientX - rect.left;
    initialY = e.clientY - rect.top;

    // Switch to absolute positioning
    element.style.bottom = 'auto';
    element.style.right = 'auto';
    element.style.left = rect.left + 'px';
    element.style.top = rect.top + 'px';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    // Constrain to viewport
    const maxX = window.innerWidth - element.offsetWidth;
    const maxY = window.innerHeight - element.offsetHeight;

    currentX = Math.max(0, Math.min(currentX, maxX));
    currentY = Math.max(0, Math.min(currentY, maxY));

    element.style.left = currentX + 'px';
    element.style.top = currentY + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// Make modal resizable
function makeResizable(element) {
  const resizer = document.createElement('div');
  resizer.className = 'ai-writer-resizer';
  element.appendChild(resizer);

  let isResizing = false;
  let originalWidth;
  let originalHeight;
  let originalMouseX;
  let originalMouseY;

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizing = true;
    originalWidth = element.offsetWidth;
    originalHeight = element.offsetHeight;
    originalMouseX = e.clientX;
    originalMouseY = e.clientY;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const width = originalWidth + (e.clientX - originalMouseX);
    const height = originalHeight + (e.clientY - originalMouseY);

    if (width > 400) {
      element.style.width = width + 'px';
      element.style.minWidth = width + 'px';
      element.style.maxWidth = width + 'px';
    }

    if (height > 300) {
      element.style.height = height + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isResizing = false;
  });
}

// Action handlers
function copyToClipboard() {
  const resultText = document.querySelector('.ai-writer-result-text');
  if (resultText) {
    navigator.clipboard.writeText(resultText.textContent)
      .then(() => {
        const copyBtn = document.querySelector('.ai-writer-copy');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  }
}

let lastActiveElement = null;

function insertText() {
  const resultText = document.querySelector('.ai-writer-result-text');
  if (resultText && lastActiveElement) {
    const textToInsert = resultText.textContent;

    // Check if the element is an input or textarea
    if (lastActiveElement.tagName === 'INPUT' || lastActiveElement.tagName === 'TEXTAREA') {
      const start = lastActiveElement.selectionStart;
      const end = lastActiveElement.selectionEnd;
      const currentValue = lastActiveElement.value;

      lastActiveElement.value = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
      lastActiveElement.focus();
      lastActiveElement.selectionStart = lastActiveElement.selectionEnd = start + textToInsert.length;
    }
    // Check if it's a contenteditable element
    else if (lastActiveElement.isContentEditable) {
      lastActiveElement.focus();
      document.execCommand('insertText', false, textToInsert);
    }

    // Update button to show success
    const insertBtn = document.querySelector('.ai-writer-insert');
    const originalText = insertBtn.textContent;
    insertBtn.textContent = 'Inserted!';
    setTimeout(() => {
      insertBtn.textContent = originalText;
    }, 2000);

    // Minimize the modal instead of closing
    setTimeout(() => {
      const modal = document.querySelector('.ai-writer-ui');
      if (modal) {
        toggleMinimize(modal);
      }
    }, 1000);
  }
}

let lastText = '';
let lastTaskType = '';

function regenerateContent() {
  if (lastText && lastTaskType) {
    processWithAI(lastText, lastTaskType);
  }
}

// Track the active element and cursor position
let lastCursorPosition = { start: 0, end: 0 };

// Update tracking when user interacts with input fields
document.addEventListener('mousedown', (e) => {
  if (!e.target.closest('.ai-writer-ui')) {
    lastActiveElement = document.activeElement;
    updateCursorPosition();
  }
});

document.addEventListener('keyup', (e) => {
  if (!e.target.closest('.ai-writer-ui')) {
    lastActiveElement = document.activeElement;
    updateCursorPosition();
  }
});

document.addEventListener('focusin', (e) => {
  if (!e.target.closest('.ai-writer-ui')) {
    lastActiveElement = e.target;
    updateCursorPosition();
  }
});

// Update cursor position helper
function updateCursorPosition() {
  if (lastActiveElement && (lastActiveElement.tagName === 'INPUT' || lastActiveElement.tagName === 'TEXTAREA')) {
    lastCursorPosition = {
      start: lastActiveElement.selectionStart || 0,
      end: lastActiveElement.selectionEnd || 0
    };
  }
}

// Keyboard shortcut: Ctrl+Shift+Space (or Cmd+Shift+Space on Mac)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'Space') {
    e.preventDefault();
    toggleChatUI();
  }
});

// Show translate language selection dialog
async function showTranslateDialog(text, taskType, messageWrapper, assistantMsg, messagesContainer) {
  // Common languages for translation
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ru', name: 'Russian' }
  ];

  assistantMsg.innerHTML = `
    <p>Select target language for translation:</p>
    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
      ${languages.map(lang => `
        <button class="translate-lang-btn" data-lang="${lang.code}" style="
          padding: 6px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
        ">${lang.name}</button>
      `).join('')}
    </div>
  `;

  // Add click handlers for language buttons
  const langButtons = assistantMsg.querySelectorAll('.translate-lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetLang = btn.dataset.lang;

      // Update message to show translating
      assistantMsg.innerHTML = `<p style="opacity: 0.7;">Translating to ${btn.textContent}...</p>`;

      try {
        let sourceLang = 'en'; // Default source language

        // Use Language Detector API to auto-detect source language
        if ('LanguageDetector' in self) {
          try {
            assistantMsg.innerHTML = `<p style="opacity: 0.7;">Detecting language...</p>`;

            const detector = await self.LanguageDetector.create({
              monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                  const percent = Math.round(e.loaded * 100);
                  assistantMsg.innerHTML = `<p style="opacity: 0.7;">Downloading language detector: ${percent}%</p>`;
                });
              }
            });

            const detectionResults = await detector.detect(text);
            if (detectionResults && detectionResults.length > 0) {
              sourceLang = detectionResults[0].detectedLanguage;
              console.log(`Detected source language: ${sourceLang} (confidence: ${detectionResults[0].confidence})`);
            }
          } catch (detectionError) {
            console.warn('Language detection failed, using default:', detectionError);
            // Fall back to default 'en' if detection fails
          }
        }

        // Check if translation is possible
        const canTranslate = await self.Translator.availability({
          sourceLanguage: sourceLang,
          targetLanguage: targetLang
        });

        if (canTranslate === 'no') {
          assistantMsg.textContent = `Translation from ${sourceLang} to ${btn.textContent} is not supported on this device.`;
          assistantMsg.style.color = '#ef4444';
          return;
        }

        // Update message to show translating
        assistantMsg.innerHTML = `<p style="opacity: 0.7;">Translating from ${sourceLang} to ${btn.textContent}...</p>`;

        // Create translator instance
        const translator = await self.Translator.create({
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              const percent = Math.round(e.loaded * 100);
              assistantMsg.innerHTML = `<p style="opacity: 0.7;">Downloading translation model: ${percent}%</p>`;
            });
          }
        });

        const result = await translator.translate(text);
        assistantMsg.innerHTML = formatMarkdown(result);

        // Add action buttons after translation completes
        addMessageActions(messageWrapper, assistantMsg);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } catch (error) {
        assistantMsg.textContent = 'Translation failed: ' + error.message;
        assistantMsg.style.color = '#ef4444';
      }
    });
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Process text task in chat
async function processTaskInChat(text, taskType) {
  // Ensure chat is open
  let chatDiv = document.getElementById('ai-writer-chat');
  if (!chatDiv || chatDiv.classList.contains('hidden')) {
    toggleChatUI();
    // Wait a bit for the chat to render
    await new Promise(resolve => setTimeout(resolve, 150));
    chatDiv = document.getElementById('ai-writer-chat');
  }

  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  // Remove welcome message if present
  const welcomeMsg = messagesContainer.querySelector('.ai-writer-chat-welcome');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }

  // Get task config for friendly name
  const config = TASK_CONFIGS[taskType] || TASK_CONFIGS['custom'];
  const taskNames = {
    'rephrase': '✏️ Rephrase',
    'summarize': '📋 Summarize',
    'write': '✍️ Write',
    'translate': '🌐 Translate',
    'custom': '✨ Custom Task'
  };

  const taskName = taskNames[taskType] || 'Process text';

  // Add a system message showing the selected text and task
  const systemMsg = document.createElement('div');
  systemMsg.className = 'ai-writer-chat-message system';
  systemMsg.innerHTML = `
    <strong>${taskName}</strong><br>
    <span style="opacity: 0.8; font-size: 13px;">"${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"</span>
  `;
  messagesContainer.appendChild(systemMsg);

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Check if AI is available
  const available = await checkAIAvailability();
  if (!available) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'ai-writer-chat-message assistant';
    errorMsg.textContent = 'Sorry, the AI APIs are not available on this device. Please check system requirements.';
    errorMsg.style.color = '#ef4444';
    messagesContainer.appendChild(errorMsg);
    return;
  }

  // Initialize AI if needed
  const apiType = config.apiType;

  if (apiType === 'summarizer' && !summarizerInstance) {
    await initAI(taskType);
  } else if (apiType === 'rewriter' && !rewriterInstance) {
    await initAI(taskType);
  } else if (apiType === 'writer' && !writerInstance) {
    await initAI(taskType);
  } else if (apiType === 'translator' && !translatorInstance) {
    await initAI(taskType);
  }

  // For custom tasks, ask for the prompt in chat
  if (taskType === 'custom') {
    const promptMsg = document.createElement('div');
    promptMsg.className = 'ai-writer-chat-message assistant';
    promptMsg.textContent = 'What would you like me to do with this text?';
    messagesContainer.appendChild(promptMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store context for the next user message
    window.pendingCustomTask = { text, taskType };
    return;
  }

  // Add assistant message wrapper
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'ai-writer-message-wrapper assistant-wrapper';

  const assistantMsg = document.createElement('div');
  assistantMsg.className = 'ai-writer-chat-message assistant';
  assistantMsg.textContent = '';

  messageWrapper.appendChild(assistantMsg);
  messagesContainer.appendChild(messageWrapper);

  try {
    let result = '';
    const apiType = config.apiType;

    // Stream the response based on API type
    if (apiType === 'summarizer') {
      const stream = summarizerInstance.summarizeStreaming(text);
      for await (const chunk of stream) {
        result += chunk;
        assistantMsg.innerHTML = formatMarkdown(result);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    } else if (apiType === 'rewriter') {
      const stream = rewriterInstance.rewriteStreaming(text);
      for await (const chunk of stream) {
        result += chunk;
        assistantMsg.innerHTML = formatMarkdown(result);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    } else if (apiType === 'writer') {
      const stream = writerInstance.writeStreaming(text);
      for await (const chunk of stream) {
        result += chunk;
        assistantMsg.innerHTML = formatMarkdown(result);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    } else if (apiType === 'translator') {
      // For translator, show a language selection dialog first
      showTranslateDialog(text, taskType, messageWrapper, assistantMsg, messagesContainer);
      return; // Exit early as dialog will handle the rest
    }

    console.log(result);

    // Add action buttons after streaming completes
    addMessageActions(messageWrapper, assistantMsg);
  } catch (error) {
    assistantMsg.textContent = 'Sorry, I encountered an error: ' + error.message;
    assistantMsg.style.color = '#ef4444';
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processText') {
    lastText = request.text;
    lastTaskType = request.taskType;

    // Route all tasks to the chat interface
    processTaskInChat(request.text, request.taskType);
  }
  return true;
});

// Initialize
checkAIAvailability().then(available => {
  isAIAvailable = available;
  console.log('AI Writing Assistant loaded. AI APIs available:', available);

  // Show floating chat button on page load
  setTimeout(() => {
    showChatButton();
  }, 1000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (writerInstance) {
    writerInstance.destroy();
  }
  if (summarizerInstance) {
    summarizerInstance.destroy();
  }
  if (rewriterInstance) {
    rewriterInstance.destroy();
  }
  // Translator doesn't need cleanup
});
