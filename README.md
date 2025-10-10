# AI Writing Assistant - Chrome Extension

A Chrome extension that enhances professional communication using Chrome's Built-in Writer API. Highlight text, right-click, and let AI help you craft compelling content for various purposes.

## Features

- **Draft Cover Letters**: Generate professional cover letters from job descriptions or notes
- **Draft Proposals**: Create business proposals from key points
- **Draft Emails**: Write professional emails from brief descriptions
- **Draft Social Posts**: Create engaging social media content
- **Custom Writing**: General-purpose writing assistance

## System Requirements

### Hardware
- **Storage**: At least 22 GB free space (for AI model)
- **GPU**: 4 GB+ VRAM
- **RAM**: 16 GB
- **Network**: Unmetered connection for initial model download

### Software
- **Browser**: Chrome 137+ (or Chromium-based browser with Writer API support)
- **OS**: Windows 10/11, macOS 13+, Linux, or ChromeOS
- **API Status**: Writer API must be enabled

### Checking API Availability

1. Open `chrome://flags` in your browser
2. Search for "Writer API" or "Built-in AI"
3. Enable the flag if available
4. Restart Chrome

Alternatively, check in DevTools Console:
```javascript
if ('Writer' in self) {
  const availability = await self.Writer.availability();
  console.log('Writer API availability:', availability);
}
```

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

## How to Use

### Basic Usage

1. **Navigate to any webpage** (e.g., LinkedIn, Gmail, Google Docs)

2. **Highlight text** that describes what you want to write
   - Example: "Software engineer position at Google, 5 years experience in Python"

3. **Right-click** on the highlighted text

4. **Select "AI Writing Assistant"** from the context menu

5. **Choose a writing task**:
   - Draft Cover Letter
   - Draft Proposal
   - Draft Email
   - Draft Social Post
   - Custom Writing Task

6. **View the AI-generated content** in the popup overlay

7. **Edit, copy, or regenerate** as needed

### Example Workflows

#### Writing a Cover Letter
1. Highlight: "Senior Developer at TechCorp, React and Node.js expert, led team of 5"
2. Right-click → AI Writing Assistant → Draft Cover Letter
3. AI generates a professional cover letter
4. Edit the content directly in the text box
5. Click "Copy" to paste into your application

#### Drafting a Professional Email
1. Highlight: "Request meeting next week to discuss Q4 budget proposal"
2. Right-click → AI Writing Assistant → Draft Email
3. AI generates a well-structured professional email
4. Copy and paste into Gmail or your email client

#### Creating Social Media Content
1. Highlight: "Launched new feature that improved user engagement by 40%"
2. Right-click → AI Writing Assistant → Draft Social Post
3. AI creates an engaging post suitable for LinkedIn or Twitter
4. Edit tone and copy to your platform

## User Interface

### Main Popup (Extension Icon)
- **API Status**: Shows whether Writer API is available
- **Instructions**: Quick guide on how to use the extension
- **Features List**: Available writing tasks
- **Recheck Button**: Verify API availability

### Content Overlay
When you trigger the AI assistant, an overlay appears with:
- **Loading State**: Shows download progress if AI model is being downloaded
- **Result Display**: Editable text area with generated content
- **Copy Button**: Copy content to clipboard
- **Regenerate Button**: Generate new content with the same prompt
- **Close Button**: Dismiss the overlay

## Technical Details

### Architecture

```
┌─────────────────┐
│  Background.js  │  ← Service Worker (Context Menu)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Content.js    │  ← Writer API Integration
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Styles.css    │  ← UI Styling
└─────────────────┘
```

### Files Overview

- **manifest.json**: Extension configuration and permissions
- **background.js**: Service worker that manages context menu
- **content.js**: Main logic for Writer API integration
- **styles.css**: Styling for the overlay UI
- **popup.html**: Extension popup interface
- **popup.js**: Popup logic and API status checking

### API Usage

The extension uses Chrome's Built-in Writer API:

```javascript
// Create writer instance
const writer = await Writer.create({
  sharedContext: 'Professional email communication',
  tone: 'formal',
  format: 'plain-text',
  length: 'medium'
});

// Generate content (streaming)
const stream = writer.writeStreaming('Draft an email about...');
for await (const chunk of stream) {
  // Display chunk
}

// Cleanup
writer.destroy();
```

### Customization

#### Modifying Writing Tasks

Edit `TASK_CONFIGS` in [content.js](content.js):

```javascript
const TASK_CONFIGS = {
  'your-task': {
    prompt: 'Your custom prompt: ',
    tone: 'formal',      // 'formal', 'neutral', 'casual'
    length: 'medium',    // 'short', 'medium', 'long'
    sharedContext: 'Context for this task'
  }
};
```

Then add a context menu item in [background.js](background.js):

```javascript
chrome.contextMenus.create({
  id: 'write-your-task',
  parentId: 'ai-writer-menu',
  title: 'Your Task Name',
  contexts: ['selection']
});
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
- `scripting`: Required to inject content script

## Troubleshooting

### Writer API Not Available

**Problem**: Extension shows "Writer API not available"

**Solutions**:
1. **Check Chrome version**: Must be Chrome 137+
   - Check: `chrome://version/`
   - Update: `chrome://settings/help`

2. **Enable Writer API flag**:
   - Go to `chrome://flags`
   - Search for "Writer" or "AI"
   - Enable relevant flags
   - Restart Chrome

3. **Check system requirements**:
   - Ensure you have 22GB+ free disk space
   - Verify you have 4GB+ VRAM
   - Check that you have 16GB+ RAM

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

### UI Overlay Not Showing

**Solutions**:
1. Check browser console for errors (F12)
2. Verify content script loaded (check in DevTools)
3. Try reloading the extension
4. Check if page has CSP restrictions

## Development

### Project Structure
```
chromini/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content.js            # Content script (main logic)
├── styles.css            # UI styles
├── popup.html            # Extension popup
├── popup.js              # Popup logic
├── create_icons.py       # Icon generation script
├── icons/
│   ├── icon16.png       # 16x16 icon
│   ├── icon48.png       # 48x48 icon
│   ├── icon128.png      # 128x128 icon
│   ├── icon.svg         # Source SVG
│   └── ICONS_README.md  # Icon documentation
├── docs/                # Additional documentation
└── README.md            # This file
```

### Testing

1. **Load extension in Chrome**
   ```
   chrome://extensions/ → Developer mode → Load unpacked
   ```

2. **Test on a webpage**
   - Open any editable site (Gmail, LinkedIn, etc.)
   - Highlight sample text
   - Right-click → AI Writing Assistant

3. **Check console logs**
   - Open DevTools (F12)
   - Check Console tab for errors or API status

4. **Test each writing task**
   - Verify all menu items work
   - Test streaming output
   - Test copy and regenerate buttons

### Future Enhancements

This extension is designed to be extended with more AI APIs:

- [ ] **Rewriter API**: Adjust tone (formal/casual) for different contexts
- [ ] **Proofreader API**: Real-time grammar checking
- [ ] **Translator API**: Multilingual business communications
- [ ] **Context Detection**: Auto-detect platform and suggest appropriate tone
- [ ] **Templates**: Pre-built templates for common scenarios
- [ ] **History**: Save and reuse previous generations

## Resources

### Official Documentation
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Writer API Documentation](https://developer.chrome.com/docs/ai/built-in#writer-api)
- [Chrome Extensions Guide](https://developer.chrome.com/docs/extensions/)

### Related Projects
- [Chrome Web AI Demos](https://github.com/GoogleChromeLabs/web-ai-demos)
- [Right Click for Superpowers](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/right-click-for-superpowers)

### Community
- [Chrome AI Challenge 2025](https://googlechromeai2025.devpost.com/)
- [Chrome Extensions Samples](https://github.com/GoogleChrome/chrome-extensions-samples)

## Contributing

Contributions are welcome! Areas for improvement:

- Additional writing tasks and templates
- Better UI/UX design
- Integration with other Chrome AI APIs
- Platform-specific optimizations
- Keyboard shortcuts
- Settings/preferences panel

## License

This project is provided as-is for educational and personal use. The Chrome Built-in AI APIs are subject to Chrome's terms of service and Google's Generative AI Prohibited Uses Policy.

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Verify [System Requirements](#system-requirements)
3. Review Chrome DevTools console for errors
4. Check [CHROME_BUILT_IN_AI_APIS.md](CHROME_BUILT_IN_AI_APIS.md) for API details

---

**Built with Chrome's Built-in Writer API** - Powered by Gemini Nano running entirely on your device.
