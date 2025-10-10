// Content script for AI Writing Assistant
// This script handles the Writer API integration and UI

let writerInstance = null;
let isWriterAvailable = false;

// Task configurations
const TASK_CONFIGS = {
  'rephrase': {
    prompt: 'Rephrase the following text while keeping the same meaning: ',
    tone: 'neutral',
    length: 'medium',
    sharedContext: 'Text rephrasing'
  },
  'shorten': {
    prompt: 'Shorten the following text while keeping the key points: ',
    tone: 'neutral',
    length: 'short',
    sharedContext: 'Text shortening'
  },
  'formal': {
    prompt: 'Rewrite the following text in a more formal tone: ',
    tone: 'formal',
    length: 'medium',
    sharedContext: 'Formal tone adjustment'
  },
  'casual': {
    prompt: 'Rewrite the following text in a more casual tone: ',
    tone: 'casual',
    length: 'medium',
    sharedContext: 'Casual tone adjustment'
  },
  'bulletize': {
    prompt: 'Convert the following text into bullet points: ',
    tone: 'neutral',
    length: 'medium',
    sharedContext: 'Bullet point formatting'
  },
  'summarize': {
    prompt: 'Summarize the following text: ',
    tone: 'neutral',
    length: 'short',
    sharedContext: 'Text summarization'
  },
  'cover-letter': {
    prompt: 'Write a compelling cover letter based on: ',
    tone: 'formal',
    length: 'long',
    sharedContext: 'Professional job application cover letter'
  },
  'proposal': {
    prompt: 'Write a professional proposal for: ',
    tone: 'formal',
    length: 'medium',
    sharedContext: 'Business proposal document'
  },
  'email': {
    prompt: 'Write a professional email about: ',
    tone: 'formal',
    length: 'medium',
    sharedContext: 'Professional email communication'
  },
  'post': {
    prompt: 'Write an engaging social media post about: ',
    tone: 'casual',
    length: 'short',
    sharedContext: 'Social media content'
  },
  'custom': {
    prompt: 'Write content for: ',
    tone: 'neutral',
    length: 'medium',
    sharedContext: 'General writing task'
  }
};

// Check if Writer API is available
async function checkWriterAvailability() {
  try {
    if (!('Writer' in self)) {
      console.log('Writer API not supported in this browser');
      return false;
    }

    const availability = await self.Writer.availability();
    console.log('Writer API availability:', availability);

    return availability !== 'unavailable';
  } catch (error) {
    console.error('Error checking Writer API availability:', error);
    return false;
  }
}

// Initialize Writer API
async function initWriter(taskType) {
  try {
    const config = TASK_CONFIGS[taskType] || TASK_CONFIGS['custom'];

    showLoadingUI('Initializing AI Writer...');

    writerInstance = await self.Writer.create({
      sharedContext: config.sharedContext,
      tone: config.tone,
      format: 'plain-text',
      length: config.length,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const percent = Math.round(e.loaded * 100);
          updateLoadingProgress(`Downloading AI model: ${percent}%`);
        });
      }
    });

    return writerInstance;
  } catch (error) {
    console.error('Error initializing Writer:', error);
    showError('Failed to initialize AI Writer: ' + error.message);
    return null;
  }
}

// Process text with Writer API
async function processWithWriter(text, taskType, customPrompt = null) {
  try {
    const config = TASK_CONFIGS[taskType] || TASK_CONFIGS['custom'];
    let fullPrompt;

    // If it's a custom task and we have a custom prompt, use it
    if (taskType === 'custom' && customPrompt) {
      fullPrompt = customPrompt + ' ' + text;
    } else {
      fullPrompt = config.prompt + text;
    }

    if (!writerInstance) {
      const writer = await initWriter(taskType);
      if (!writer) return;
    }

    showLoadingUI('Generating content...');

    // Use streaming for better UX
    const stream = writerInstance.writeStreaming(fullPrompt);

    let result = '';
    showResultUI(''); // Show empty result box

    for await (const chunk of stream) {
      result += chunk;
      updateResultUI(result);
    }

    console.log('Writing complete:', result);
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
      <button class="ai-writer-close">×</button>
    </div>
    <div class="ai-writer-content">
      <div class="ai-writer-spinner"></div>
      <p class="ai-writer-message">${message}</p>
    </div>
  `;

  document.body.appendChild(loadingDiv);

  // Add close button event listener
  loadingDiv.querySelector('.ai-writer-close').addEventListener('click', () => {
    loadingDiv.remove();
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
      <button class="ai-writer-close">×</button>
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
    resultTextEl.textContent = content;
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
      <button class="ai-writer-close">×</button>
    </div>
    <div class="ai-writer-content">
      <p>${message}</p>
      <p class="ai-writer-help">Make sure you're using Chrome 137+ and the Writer API is enabled in chrome://flags</p>
    </div>
  `;

  document.body.appendChild(errorDiv);

  // Add close button event listener
  errorDiv.querySelector('.ai-writer-close').addEventListener('click', () => {
    errorDiv.remove();
  });

  // Make modal draggable
  makeDraggable(errorDiv);
}

function removeExistingUI() {
  const existing = document.querySelector('.ai-writer-ui');
  if (existing) {
    existing.remove();
  }
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
      <button class="ai-writer-close">×</button>
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

  // Event listeners
  closeBtn.addEventListener('click', () => {
    dialogDiv.remove();
  });

  cancelBtn.addEventListener('click', () => {
    dialogDiv.remove();
  });

  submitBtn.addEventListener('click', () => {
    const customPrompt = input.value.trim();
    if (customPrompt) {
      dialogDiv.remove();
      processWithWriter(text, 'custom', customPrompt);
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
    // Don't drag when clicking the close button
    if (e.target.classList.contains('ai-writer-close')) return;

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

    // Close the modal
    setTimeout(() => {
      document.querySelector('.ai-writer-ui')?.remove();
    }, 1000);
  }
}

let lastText = '';
let lastTaskType = '';

function regenerateContent() {
  if (lastText && lastTaskType) {
    processWithWriter(lastText, lastTaskType);
  }
}

// Track the active element before showing the context menu
document.addEventListener('mousedown', (e) => {
  if (!e.target.closest('.ai-writer-ui')) {
    lastActiveElement = document.activeElement;
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processText') {
    lastText = request.text;
    lastTaskType = request.taskType;

    checkWriterAvailability().then(available => {
      if (available) {
        // Show custom prompt dialog for custom tasks
        if (request.taskType === 'custom') {
          showCustomPromptDialog(request.text);
        } else {
          processWithWriter(request.text, request.taskType);
        }
      } else {
        showError('Writer API is not available on this device. Please check system requirements.');
      }
    });
  }
  return true;
});

// Initialize
checkWriterAvailability().then(available => {
  isWriterAvailable = available;
  console.log('AI Writing Assistant loaded. Writer API available:', available);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (writerInstance) {
    writerInstance.destroy();
  }
});
