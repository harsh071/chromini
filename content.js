// Content script for AI Writing Assistant
// This script handles the Writer API integration and UI

let writerInstance = null;
let isWriterAvailable = false;

// Task configurations
const TASK_CONFIGS = {
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
async function processWithWriter(text, taskType) {
  try {
    const config = TASK_CONFIGS[taskType] || TASK_CONFIGS['custom'];
    const fullPrompt = config.prompt + text;

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
      <button class="ai-writer-close" onclick="this.closest('.ai-writer-ui').remove()">×</button>
    </div>
    <div class="ai-writer-content">
      <div class="ai-writer-spinner"></div>
      <p class="ai-writer-message">${message}</p>
    </div>
  `;

  document.body.appendChild(loadingDiv);
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
      <button class="ai-writer-close" onclick="this.closest('.ai-writer-ui').remove()">×</button>
    </div>
    <div class="ai-writer-content">
      <div class="ai-writer-result-text" contenteditable="true">${content}</div>
      <div class="ai-writer-actions">
        <button class="ai-writer-btn ai-writer-copy">Copy</button>
        <button class="ai-writer-btn ai-writer-regenerate">Regenerate</button>
      </div>
    </div>
  `;

  document.body.appendChild(resultDiv);

  // Add event listeners
  resultDiv.querySelector('.ai-writer-copy').addEventListener('click', copyToClipboard);
  resultDiv.querySelector('.ai-writer-regenerate').addEventListener('click', regenerateContent);
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
      <button class="ai-writer-close" onclick="this.closest('.ai-writer-ui').remove()">×</button>
    </div>
    <div class="ai-writer-content">
      <p>${message}</p>
      <p class="ai-writer-help">Make sure you're using Chrome 137+ and the Writer API is enabled in chrome://flags</p>
    </div>
  `;

  document.body.appendChild(errorDiv);
}

function removeExistingUI() {
  const existing = document.querySelector('.ai-writer-ui');
  if (existing) {
    existing.remove();
  }
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

let lastText = '';
let lastTaskType = '';

function regenerateContent() {
  if (lastText && lastTaskType) {
    processWithWriter(lastText, lastTaskType);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processText') {
    lastText = request.text;
    lastTaskType = request.taskType;

    checkWriterAvailability().then(available => {
      if (available) {
        processWithWriter(request.text, request.taskType);
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
