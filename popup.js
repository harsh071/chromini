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

    // Check if Writer API exists
    if (!('Writer' in self)) {
      showUnavailable('Writer API not supported',
        'Your browser does not support the Writer API. Please use Chrome 137+ with the API enabled in chrome://flags.');
      return;
    }

    // Check availability status
    const availability = await self.Writer.availability();

    if (availability === 'available') {
      showAvailable('Writer API is ready!',
        'The Writer API is available and ready to use. Highlight text on any webpage, right-click, and select "AI Writing Assistant" to get started.');
    } else if (availability === 'after-download') {
      showAvailable('Writer API available (download required)',
        'The Writer API is supported, but the AI model needs to be downloaded when first used. The download will happen automatically when you use the extension.');
    } else {
      showUnavailable('Writer API unavailable',
        'The Writer API is not available on this device. Please check the system requirements: 22GB free space, 4GB+ VRAM, 16GB RAM.');
    }
  } catch (error) {
    console.error('Error checking API:', error);
    showUnavailable('Error checking API',
      'An error occurred while checking API availability: ' + error.message);
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
