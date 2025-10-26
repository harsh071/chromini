# AI Writing Assistant - Chrome Extension

A powerful Chrome extension that leverages Chrome's Built-in AI APIs (Writer, Rewriter, Summarizer, Translator, and Language Detector) to enhance your writing experience. Features an interactive chat interface with page context awareness and support for both webpages and PDF documents.

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd chromini
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - Or click Menu → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `chromini` folder (the one containing `manifest.json`)

5. **Verify installation**
   - You should see "AI Writing Assistant" in your extensions list
   - Click the extension icon to check API availability

### Method 2: Create Icons (Optional)

If you want custom icons instead of placeholders:

```bash
# Using the provided Python script
python3 create_icons.py

# Or see icons/ICONS_README.md for other methods
```

## Features

### 🎯 Core AI Capabilities
- **✏️ Rephrase**: Rewrite text while maintaining meaning using the Rewriter API
- **📋 Summarize**: Generate key-point summaries in markdown format using the Summarizer API
- **✍️ Write**: Create new content from prompts using the Writer API
- **🌐 Translate**: Translate text between multiple languages with automatic language detection
- **✨ Custom Tasks**: Flexible AI assistance for any writing need

### 💬 Interactive Chat Interface
- **Conversational AI**: Chat with the AI assistant about any topic
- **Page Context Awareness**: AI can analyze and answer questions about the current webpage or PDF
- **Streaming Responses**: Real-time text generation with word-by-word streaming
- **Message Actions**: Copy or insert AI responses directly into text fields
- **Persistent Chat**: Minimize/maximize, drag, and resize the chat window
- **Keyboard Shortcut**: Quick access with `Ctrl+Shift+Space` (or `Cmd+Shift+Space` on Mac)

### 📄 PDF Support
- **PDF Text Extraction**: Automatically extract and analyze text from PDF documents
- **Context-Aware Q&A**: Ask questions about PDF content
- **Seamless Integration**: Works just like regular webpages

### 🎨 User Experience
- **Floating Chat Button**: Always accessible 💬 button on every page
- **Context Menu Integration**: Right-click selected text for quick actions
- **Markdown Rendering**: Rich text formatting with support for lists, headers, code blocks, and more
- **Draggable & Resizable UI**: Customize window position and size
- **Copy & Insert**: Easily transfer AI-generated content to text fields

## System Requirements

### Hardware
- **Storage**: At least 22 GB free space (for AI model)
- **GPU**: 4 GB+ VRAM
- **RAM**: 16 GB
- **Network**: Unmetered connection for initial model download

### Software
- **Browser**: Chrome 137+ (or Chromium-based browser with Built-in AI APIs support)
- **OS**: Windows 10/11, macOS 13+, Linux, or ChromeOS
- **API Status**: Prompt API (Writer, Rewriter, Summarizer, Translator) must be enabled

### Checking API Availability

1. Open `chrome://flags` in your browser
2. Search for "Prompt API for Gemini Nano" or "Built-in AI"
3. Enable the flag if available
4. Restart Chrome

Alternatively, check in DevTools Console:
```javascript
// Check Writer API
if ('Writer' in self) {
  const availability = await self.Writer.availability();
  console.log('Writer API:', availability);
}

// Check Summarizer API
if ('Summarizer' in self) {
  const availability = await self.Summarizer.availability();
  console.log('Summarizer API:', availability);
}

// Check Rewriter API
if ('Rewriter' in self) {
  const availability = await self.Rewriter.availability();
  console.log('Rewriter API:', availability);
}

// Check Translator API
if ('Translator' in self) {
  const availability = await self.Translator.availability({
    sourceLanguage: 'en',
    targetLanguage: 'es'
  });
  console.log('Translator API:', availability);
}
```

## How to Use

### Method 1: Chat Interface (Recommended)

1. **Open the chat**:
   - Click the floating 💬 button on any page, OR
   - Press `Ctrl+Shift+Space` (Mac: `Cmd+Shift+Space`)

2. **Ask anything**: The AI can see the current page content and answer questions
   - "Summarize this article"
   - "What are the main points discussed here?"
   - "Translate this section to Spanish"
   - "Help me draft a response to this"

3. **Page Context Toggle**: Click the context button to enable/disable page awareness

4. **Use AI responses**:
   - Click **Copy** to copy text to clipboard
   - Click **Insert** to place text directly into the active text field

### Method 2: Context Menu (Quick Actions)

1. **Select text** on any webpage or PDF

2. **Right-click** on the highlighted text

3. **Select "AI Writing Assistant"** and choose:
   - ✏️ **Rephrase** - Rewrite the text
   - 📋 **Summarize** - Create a summary
   - ✍️ **Write** - Generate new content
   - 🌐 **Translate** - Translate to another language
   - ✨ **Custom Task** - Ask AI to do anything with the text

4. **View results** in the chat interface with action buttons

### Example Workflows

#### Analyzing a PDF Document
1. Open any PDF file in Chrome
2. Click the 💬 chat button or press `Ctrl+Shift+Space`
3. Wait for the PDF text extraction to complete
4. Ask: "What are the main takeaways from this document?"
5. Use Copy or Insert buttons to save the AI's response

#### Translating Text with Auto-Detection
1. Select foreign language text on a webpage
2. Right-click → AI Writing Assistant → 🌐 Translate
3. Choose your target language from the dialog
4. AI automatically detects the source language and translates
5. Insert the translation directly into your text field

#### Rephrasing for Better Clarity
1. Select text you want to improve
2. Right-click → AI Writing Assistant → ✏️ Rephrase
3. View the rephrased version in the chat
4. Click "Copy" or "Insert" to use it

#### Page-Aware Q&A
1. Navigate to any article or documentation page
2. Open the chat (`Ctrl+Shift+Space`)
3. Ensure page context is enabled (badge should be visible)
4. Ask questions like:
   - "Explain this in simpler terms"
   - "What are the pros and cons mentioned?"
   - "Give me action items from this page"

## User Interface

### Main Popup (Extension Icon)
- **API Status**: Shows availability of all AI APIs (Writer, Summarizer, Rewriter, Translator)
- **Instructions**: Quick guide on how to use the extension
- **Features List**: Available AI capabilities
- **Recheck Button**: Verify API availability

### Chat Interface
The main interaction point with the AI:
- **Header Controls**:
  - 🕐 **Context Toggle**: Enable/disable page context awareness
  - 🔄 **Reset Button**: Clear chat history and reset AI instances
  - **−** Minimize button
  - **×** Close button
- **Message Display**:
  - User messages (right-aligned)
  - AI responses (left-aligned) with markdown formatting
  - System messages for status updates
- **Action Buttons**: Each AI message has:
  - 📋 **Copy**: Copy message to clipboard
  - ⬇️ **Insert**: Insert message at cursor position in active text field
- **Input Area**:
  - Multi-line textarea with auto-resize
  - Send button (✈️)
  - Enter to send, Shift+Enter for new line
- **Floating Chat Button**: 💬 Always visible in bottom-right corner

### Chat Features
- **Draggable**: Click and drag the header to reposition
- **Resizable**: Drag from bottom-right corner (when applicable)
- **Minimizable**: Click **−** to minimize, click again to restore
- **Persistent**: Stays open while browsing, even when minimized
- **Keyboard Shortcut**: `Ctrl+Shift+Space` (Mac: `Cmd+Shift+Space`)

## Technical Details

### Architecture

```
┌──────────────────┐
│  Background.js   │  ← Service Worker
│                  │     • Context menu management
│                  │     • PDF fetch proxy (CORS)
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   Content.js     │  ← Main Logic
│                  │     • All AI API integrations
│                  │     • Chat interface
│                  │     • Page context extraction
└────────┬─────────┘
         │
         ├─────────────────────────┐
         ↓                         ↓
┌──────────────────┐    ┌──────────────────┐
│ PDF-Extractor.js │    │  Markdown.js     │
│ • PDF.js wrapper │    │ • Markdown to    │
│ • Text extraction│    │   HTML converter │
└──────────────────┘    └──────────────────┘
         │                         │
         └──────────┬──────────────┘
                    ↓
           ┌─────────────────┐
           │   Styles.css    │  ← UI Styling
           └─────────────────┘
```

### Files Overview

- **manifest.json**: Extension configuration, permissions, and content scripts
- **background.js**: Service worker for context menu and PDF fetching
- **content.js**: Main logic with all AI API integrations (Writer, Rewriter, Summarizer, Translator, Language Detector)
- **pdf-extractor.js**: PDF.js wrapper for extracting text from PDF documents
- **markdown.js**: Lightweight markdown-to-HTML converter for rich text display
- **styles.css**: Complete UI styling for chat, modals, and buttons
- **popup.html** & **popup.js**: Extension popup with API availability checker
- **lib/**: PDF.js library files for PDF text extraction

### API Usage

The extension uses multiple Chrome Built-in AI APIs:

#### Writer API
```javascript
// Create writer instance
const writer = await self.Writer.create({
  sharedContext: 'Content writing',
  tone: 'neutral',
  format: 'plain-text',
  length: 'medium',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Download progress: ${Math.round(e.loaded * 100)}%`);
    });
  }
});

// Generate content with streaming
const stream = writer.writeStreaming('Your prompt here');
for await (const chunk of stream) {
  // Display chunk in real-time
}

writer.destroy(); // Cleanup when done
```

#### Summarizer API
```javascript
const summarizer = await self.Summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'short'
});

const stream = summarizer.summarizeStreaming(longText);
for await (const chunk of stream) {
  // Display summary as it generates
}
```

#### Rewriter API
```javascript
const rewriter = await self.Rewriter.create({
  tone: 'as-is',
  length: 'as-is',
  sharedContext: 'Text rephrasing'
});

const stream = rewriter.rewriteStreaming(originalText);
for await (const chunk of stream) {
  // Display rephrased text
}
```

#### Translator API with Language Detection
```javascript
// Auto-detect source language
const detector = await self.LanguageDetector.create();
const results = await detector.detect(text);
const sourceLang = results[0].detectedLanguage;

// Translate
const translator = await self.Translator.create({
  sourceLanguage: sourceLang,
  targetLanguage: 'es'
});

const translatedText = await translator.translate(text);
```

### Customization

#### Adding New AI Tasks

Edit `TASK_CONFIGS` in [content.js](content.js:14-46):

```javascript
const TASK_CONFIGS = {
  'your-task': {
    apiType: 'writer',     // 'writer', 'rewriter', 'summarizer', 'translator'
    tone: 'neutral',       // 'formal', 'neutral', 'casual', 'as-is'
    length: 'medium',      // 'short', 'medium', 'long', 'as-is'
    sharedContext: 'Your context description'
  }
};
```

Then add a context menu item in [background.js](background.js:4-53):

```javascript
chrome.contextMenus.create({
  id: 'write-your-task',
  parentId: 'ai-writer-menu',
  title: '🎯 Your Task Name',
  contexts: ['selection']
});
```

#### Customizing Page Context

Adjust context extraction limits in [content.js](content.js:49):

```javascript
const MAX_CONTEXT_WORDS = 3000; // Increase/decrease as needed
```

#### Styling

Modify [styles.css](styles.css) to change colors, fonts, or layout:

```css
/* Change the gradient colors */
.ai-writer-header {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}
```

## Privacy & Security

### Data Privacy
- ✅ **All processing happens on-device** - no data sent to external servers
- ✅ **No data collection** - the extension doesn't collect or store any user data
- ✅ **Works offline** - after initial model download, works without internet
- ✅ **Secure** - uses Chrome's built-in AI APIs with sandbox isolation

### Permissions Explanation
- `contextMenus`: Required to add right-click menu options
- `activeTab`: Required to interact with the current webpage
- `scripting`: Required to inject content script and styles
- `<all_urls>`: Required for PDF extraction and page context features

## Troubleshooting

### AI APIs Not Available

**Problem**: Extension shows "AI APIs not available"

**Solutions**:
1. **Check Chrome version**: Must be Chrome 137+
   - Check: `chrome://version/`
   - Update: `chrome://settings/help`

2. **Enable Prompt API flags**:
   - Go to `chrome://flags`
   - Search for "Prompt API for Gemini Nano"
   - Enable the flag
   - Restart Chrome

3. **Check system requirements**:
   - Ensure you have 22GB+ free disk space
   - Verify you have 4GB+ VRAM
   - Check that you have 16GB+ RAM

4. **Verify specific APIs**:
   - Open DevTools Console (F12)
   - Run the API availability checks (see System Requirements section)
   - Note which APIs return 'no', 'readily', or 'after-download'

### Model Download Issues

**Problem**: Model download stuck or failing

**Solutions**:
- Ensure stable internet connection (unmetered preferred)
- Check available disk space
- Try restarting Chrome
- Clear Chrome cache: `chrome://settings/clearBrowserData`

### Extension Not Appearing in Context Menu

**Solutions**:
1. Verify extension is enabled in `chrome://extensions/`
2. Reload the extension (click reload icon)
3. Refresh the webpage
4. Check that you've selected text before right-clicking

### Chat Not Opening

**Solutions**:
1. Check browser console for errors (F12)
2. Verify content scripts loaded (check in DevTools)
3. Try reloading the extension
4. Check if page has CSP restrictions
5. Try using keyboard shortcut `Ctrl+Shift+Space`

### PDF Text Extraction Failing

**Problem**: PDF context extraction shows error

**Solutions**:
1. Ensure PDF is accessible (not password-protected)
2. Check browser console for specific errors
3. Try reloading the PDF
4. Verify PDF.js library files exist in `lib/` folder
5. Check if PDF URL is accessible (no CORS issues)

### Insert Button Not Working

**Problem**: "Insert" button doesn't place text in text field

**Solutions**:
1. Click inside the target text field first before using Insert
2. Ensure the text field is still present on the page
3. Try using Copy button instead and paste manually
4. Check if the field is editable (not readonly or disabled)

## Development

### Project Structure
```
chromini/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker (context menu + PDF proxy)
├── content.js            # Main logic (1600+ lines)
│                         # • All AI API integrations
│                         # • Chat interface UI
│                         # • Page context extraction
│                         # • Event handlers
├── pdf-extractor.js      # PDF.js wrapper for text extraction
├── markdown.js           # Markdown-to-HTML converter
├── styles.css            # Complete UI styling
├── popup.html            # Extension popup
├── popup.js              # API status checker
├── lib/                  # Third-party libraries
│   ├── pdf.min.js       # PDF.js core
│   └── pdf.worker.min.js # PDF.js worker
├── icons/
│   ├── icon16.png       # Extension icons (16x16)
│   ├── icon48.png       # Extension icons (48x48)
│   ├── icon128.png      # Extension icons (128x128)
│   └── icon.svg         # Source SVG
├── create_icons.py       # Icon generation script
└── README.md            # This file
```

### Testing

1. **Load extension in Chrome**
   ```
   chrome://extensions/ → Developer mode → Load unpacked
   ```

2. **Test chat interface**
   - Click floating 💬 button
   - Try keyboard shortcut `Ctrl+Shift+Space`
   - Send messages and verify streaming responses
   - Test Copy and Insert buttons

3. **Test context menu**
   - Select text on any webpage
   - Right-click → AI Writing Assistant
   - Test all menu items: Rephrase, Summarize, Write, Translate, Custom Task

4. **Test page context**
   - Open a content-rich webpage
   - Open chat and ensure context badge is visible
   - Ask questions about the page
   - Toggle context on/off

5. **Test PDF extraction**
   - Open a PDF file in Chrome
   - Wait for extraction message
   - Ask questions about PDF content

6. **Check console logs**
   - Open DevTools (F12)
   - Check Console tab for API availability status
   - Verify no errors during operation

7. **Test UI interactions**
   - Drag chat window to reposition
   - Minimize/maximize chat
   - Reset chat history
   - Test in different pages (Gmail, LinkedIn, docs, etc.)

### Future Enhancements

Possible improvements and additional features:

- [x] ~~**Rewriter API**~~ ✅ Implemented
- [x] ~~**Translator API**~~ ✅ Implemented with auto-detection
- [x] ~~**Summarizer API**~~ ✅ Implemented
- [x] ~~**Page Context Awareness**~~ ✅ Implemented
- [x] ~~**PDF Support**~~ ✅ Implemented
- [x] ~~**Chat Interface**~~ ✅ Implemented
- [ ] **Settings Panel**: Customize default API parameters
- [ ] **Conversation History**: Save and restore chat sessions
- [ ] **Export Chat**: Save conversations as markdown/text
- [ ] **Custom Prompts Library**: Save frequently used prompts
- [ ] **Voice Input**: Speak to the AI assistant
- [ ] **Multi-language UI**: Support for different languages
- [ ] **Theme Customization**: Light/dark mode and custom themes
- [ ] **Keyboard Shortcuts**: Customizable hotkeys for actions

## Resources

### Official Documentation
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Prompt API Documentation](https://developer.chrome.com/docs/ai/built-in-apis)
- [Writer API](https://developer.chrome.com/docs/ai/built-in#writer-api)
- [Summarizer API](https://developer.chrome.com/docs/ai/built-in#summarizer-api)
- [Rewriter API](https://developer.chrome.com/docs/ai/built-in#rewriter-api)
- [Translator API](https://developer.chrome.com/docs/ai/built-in#translator-api)
- [Language Detector API](https://developer.chrome.com/docs/ai/built-in#language-detector-api)
- [Chrome Extensions Guide](https://developer.chrome.com/docs/extensions/)

### Related Projects
- [Chrome Web AI Demos](https://github.com/GoogleChromeLabs/web-ai-demos)
- [Right Click for Superpowers](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/right-click-for-superpowers)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)

### Community
- [Chrome AI Challenge 2025](https://googlechromeai2025.devpost.com/)
- [Chrome Extensions Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
- [Gemini Nano Discussion](https://groups.google.com/a/chromium.org/g/chromium-extensions)

## Contributing

Contributions are welcome! Areas for improvement:

- Settings and preferences panel
- Conversation history persistence
- Additional markdown features and formatting
- Performance optimizations
- Better error handling and recovery
- Accessibility improvements (ARIA labels, keyboard navigation)
- Unit and integration tests
- Multi-language UI support

## License

This project is provided as-is for educational and personal use. The Chrome Built-in AI APIs are subject to Chrome's terms of service and Google's Generative AI Prohibited Uses Policy.

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Verify [System Requirements](#system-requirements)
3. Review Chrome DevTools console for errors
4. Check the [Resources](#resources) section for API documentation
5. Open an issue on GitHub with:
   - Chrome version (`chrome://version/`)
   - Console errors (if any)
   - Steps to reproduce

## Key Features Summary

✨ **5 AI APIs Integrated**: Writer, Rewriter, Summarizer, Translator, Language Detector
💬 **Interactive Chat**: Full conversational interface with streaming responses
📄 **PDF Support**: Extract and analyze text from PDF documents
🌐 **Page Context**: AI understands webpage content for better answers
⚡ **Real-time Streaming**: See AI responses generate word-by-word
🎯 **Context Menu**: Quick access to AI features via right-click
📋 **Copy & Insert**: Seamlessly transfer AI content to text fields
⌨️ **Keyboard Shortcut**: `Ctrl+Shift+Space` for instant access
🔒 **Privacy First**: All processing happens on-device with Gemini Nano
🎨 **Rich Formatting**: Full markdown support in responses

---

**Built with Chrome's Built-in AI APIs** - Powered by Gemini Nano running entirely on your device.
