// Popup script for AI Writing Assistant

const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const statusInfo = document.getElementById('statusInfo');
const recheckBtn = document.getElementById('recheckBtn');

// Check Writer API availability
async function checkAPIAvailability() {
  try {
    statusIndicator.className = 'status-indicator checking';
    statusText.textContent = 'Checking API availability...';
    statusInfo.textContent = 'Please wait while we check if the Writer API is available on your system.';
    recheckBtn.style.display = 'none';

    // Query the active tab to check API availability
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      showAvailable('Extension Ready',
        'The AI Writing Assistant is ready to use. Open any webpage, highlight text, right-click, and select "AI Writing Assistant" to get started. You can also click the chat bubble (💬) or press Ctrl+Shift+Space to open the AI chat!');
      return;
    }

    // Inject a script to check Writer API availability in the page context
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        try {
          if (!('Writer' in self)) {
            return { available: false, reason: 'not-supported' };
          }
          const availability = await self.Writer.availability();
          return { available: true, status: availability };
        } catch (error) {
          return { available: false, reason: 'error', message: error.message };
        }
      }
    });

    const result = results[0]?.result;

    if (!result) {
      showAvailable('Extension Ready',
        'The AI Writing Assistant is ready to use. Navigate to a webpage to check API availability.');
      return;
    }

    if (!result.available) {
      if (result.reason === 'not-supported') {
        showUnavailable('Writer API not supported',
          'Your browser does not support the Writer API. Please use Chrome 137+ with the API enabled in chrome://flags.');
      } else {
        showUnavailable('Error checking API',
          'An error occurred: ' + (result.message || 'Unknown error'));
      }
      return;
    }

    if (result.status === 'available') {
      showAvailable('Writer API is ready! ✨',
        'The Writer API is available and ready to use. Highlight text on any webpage, right-click, and select "AI Writing Assistant". Or click the chat bubble (💬) or press Ctrl+Shift+Space to open the AI chat!');
    } else if (result.status === 'after-download') {
      showAvailable('Writer API available (download required)',
        'The Writer API is supported, but the AI model needs to be downloaded when first used. The download will happen automatically when you use the extension.');
    } else {
      showUnavailable('Writer API unavailable',
        'The Writer API is not available on this device. Please check the system requirements: 22GB free space, 4GB+ VRAM, 16GB RAM.');
    }
  } catch (error) {
    console.error('Error checking API:', error);
    showAvailable('Extension Ready',
      'The AI Writing Assistant is ready to use. Highlight text, right-click, and select "AI Writing Assistant". Or click the chat bubble (💬) or press Ctrl+Shift+Space!');
  }
}

function showAvailable(title, message) {
  statusIndicator.className = 'status-indicator available';
  statusText.textContent = title;
  statusInfo.textContent = message;
  recheckBtn.style.display = 'block';
}

function showUnavailable(title, message) {
  statusIndicator.className = 'status-indicator unavailable';
  statusText.textContent = title;
  statusInfo.textContent = message;
  recheckBtn.style.display = 'block';
}

// Event listeners
recheckBtn.addEventListener('click', checkAPIAvailability);

// Check on load
checkAPIAvailability();
