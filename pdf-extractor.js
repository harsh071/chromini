// PDF Text Extractor
// Simple module to extract text from PDF files using PDF.js

let pdfjs = null;

// Initialize PDF.js library
async function initPDFJS() {
  try {
    if (pdfjs) {
      return true;
    }

    // Import PDF.js
    pdfjs = await import(chrome.runtime.getURL('lib/pdf.min.js'));

    // Set worker path
    pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('lib/pdf.worker.min.js');

    return true;
  } catch (error) {
    console.error('Failed to initialize PDF.js:', error);
    return false;
  }
}

// Extract text from a PDF document
async function extractPDFText(pdfUrl, maxWords = 3000) {
  try {
    // Initialize PDF.js if not already done
    if (!pdfjs) {
      const initialized = await initPDFJS();
      if (!initialized) {
        throw new Error('Failed to initialize PDF.js');
      }
    }

    // Fetch the PDF via background script to avoid CORS issues
    const response = await chrome.runtime.sendMessage({
      action: 'fetchPDF',
      url: pdfUrl
    });

    if (!response.success) {
      throw new Error(`Failed to fetch PDF: ${response.error}`);
    }

    // Convert array back to Uint8Array
    const arrayBuffer = new Uint8Array(response.data).buffer;

    // Load the PDF document with security settings
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      isEvalSupported: false,  // Disable eval for security
      useSystemFonts: false,   // Reduce attack surface
    });

    const pdf = await loadingTask.promise;

    let fullText = '';
    let wordCount = 0;

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (wordCount >= maxWords) {
        break;
      }

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine all text items
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';

      // Update word count
      wordCount = fullText.split(/\s+/).length;
    }

    // Clean up the text
    fullText = fullText
      .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n')       // Remove empty lines
      .trim();

    // Limit to max words
    const words = fullText.split(/\s+/);
    if (words.length > maxWords) {
      fullText = words.slice(0, maxWords).join(' ') + '...';
    }

    return fullText;

  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw error;
  }
}

// Detect if current page is a PDF
function isPDFPage() {
  return document.contentType === 'application/pdf' ||
         window.location.href.endsWith('.pdf') ||
         document.querySelector('embed[type="application/pdf"]') !== null;
}

// Export functions globally
window.PDFExtractor = {
  initPDFJS,
  extractPDFText,
  isPDFPage
};
