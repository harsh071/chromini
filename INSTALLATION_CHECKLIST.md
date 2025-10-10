# Installation & Testing Checklist

Use this checklist to verify the Writer API extension is working before adding more features.

## Pre-Installation Checklist

- [ ] **Chrome Version Check**
  - Open `chrome://version/`
  - Verify version is 137 or higher
  - If not, update at `chrome://settings/help`

- [ ] **System Requirements**
  - [ ] 22 GB+ free disk space
  - [ ] 4 GB+ VRAM (GPU)
  - [ ] 16 GB+ RAM
  - [ ] Unmetered internet connection (for model download)

- [ ] **Enable Writer API**
  - Open `chrome://flags`
  - Search for: "Optimization Guide On Device Model"
  - Search for: "Writer API"
  - Search for: "prompt api for gemini nano"
  - Enable all relevant flags
  - Click "Relaunch" to restart Chrome

## Installation Steps

- [ ] **Step 1: Navigate to Extensions**
  - Open `chrome://extensions/`

- [ ] **Step 2: Enable Developer Mode**
  - Toggle "Developer mode" in top-right corner

- [ ] **Step 3: Load Extension**
  - Click "Load unpacked"
  - Navigate to and select the `chromini` folder
  - Extension should appear in list with no errors

- [ ] **Step 4: Verify Files**
  - Extension card shows:
    - ✅ Name: "AI Writing Assistant"
    - ✅ Version: "1.0.0"
    - ✅ No errors displayed
    - ✅ Extension is enabled (toggle is ON)

## Quick Verification Tests

### Test 1: API Status Check

- [ ] Click the extension icon (puzzle piece in toolbar)
- [ ] Popup opens showing API status
- [ ] Wait for status check to complete
- [ ] **Expected**: Green indicator + "Writer API is ready!" or "available (download required)"
- [ ] **If red/unavailable**: Recheck Chrome flags and system requirements

### Test 2: Context Menu Appears

- [ ] Open any webpage (e.g., `about:blank`)
- [ ] Type some text: "test message"
- [ ] Highlight the text
- [ ] Right-click
- [ ] **Expected**: "AI Writing Assistant" appears in context menu
- [ ] Hover over it to see submenu items:
  - [ ] Draft Cover Letter
  - [ ] Draft Proposal
  - [ ] Draft Email
  - [ ] Draft Social Post
  - [ ] Custom Writing Task

### Test 3: Basic Generation Test

- [ ] Type this text on any page:
  ```
  Senior Software Engineer, 5 years experience with Python and JavaScript
  ```
- [ ] Highlight the text
- [ ] Right-click → "AI Writing Assistant" → "Draft Email"
- [ ] **Expected**: Loading overlay appears
- [ ] **If first time**: Download progress shows (may take 5-15 minutes)
- [ ] **Expected**: Generated content appears in the result box
- [ ] **Expected**: Content is relevant to the input
- [ ] Try clicking "Copy" button - text should copy to clipboard
- [ ] Try clicking "Regenerate" - new content should generate

### Test 4: Cover Letter Generation

- [ ] Type this text:
  ```
  Software Developer at Google, React expert, 8 years experience, led team of 5
  ```
- [ ] Highlight → Right-click → AI Writing Assistant → Draft Cover Letter
- [ ] **Expected**: Generates a formal, professional cover letter
- [ ] **Expected**: Letter is longer than email (long format)
- [ ] Verify it's editable by clicking in the text and typing

### Test 5: Social Post Generation

- [ ] Type this text:
  ```
  Launched new feature that improved user engagement by 40%
  ```
- [ ] Highlight → Right-click → AI Writing Assistant → Draft Social Post
- [ ] **Expected**: Generates shorter, more casual content
- [ ] **Expected**: Appropriate for social media platforms

## Common Issues & Solutions

### ❌ "Writer API not available"

**Possible causes:**
- [ ] Chrome version < 137
- [ ] API flags not enabled in `chrome://flags`
- [ ] Insufficient system resources (disk space, RAM, VRAM)
- [ ] API not available in your region/device

**Solutions:**
1. Verify Chrome version: `chrome://version/`
2. Enable all AI flags in `chrome://flags`
3. Restart Chrome completely
4. Check disk space (need 22GB+)
5. Run this in DevTools Console to debug:
   ```javascript
   if ('Writer' in self) {
     console.log('Writer API exists');
     self.Writer.availability().then(status => {
       console.log('Availability:', status);
     });
   } else {
     console.log('Writer API not found in browser');
   }
   ```

### ❌ Context menu doesn't appear

**Solutions:**
- [ ] Verify extension is enabled in `chrome://extensions/`
- [ ] Reload the extension (click reload icon)
- [ ] Refresh the webpage (F5)
- [ ] Make sure text is selected before right-clicking
- [ ] Check browser console (F12) for errors

### ❌ Extension loads but nothing happens when clicking menu

**Solutions:**
- [ ] Open DevTools (F12) → Console tab
- [ ] Look for JavaScript errors
- [ ] Verify content script loaded (should see log message)
- [ ] Try reloading extension and refreshing page
- [ ] Check if page has Content Security Policy restrictions

### ❌ Download stuck or very slow

**Solutions:**
- [ ] Ensure stable internet connection
- [ ] Use unmetered connection (not mobile hotspot)
- [ ] Check available disk space (need 22GB+)
- [ ] Wait patiently - first download can take 10-20 minutes
- [ ] If stuck >30 minutes, try:
  - Restart Chrome
  - Clear cache: `chrome://settings/clearBrowserData`
  - Reload extension

### ❌ Generated content is irrelevant or low quality

**Solutions:**
- [ ] Provide more specific input text
- [ ] Use longer, more detailed descriptions
- [ ] Try regenerating for different variations
- [ ] Try different task types (email vs cover letter)
- [ ] Remember: AI output is a starting point - edit as needed!

## DevTools Console Checks

Open DevTools (F12) → Console and verify:

**Expected messages:**
```
AI Writing Assistant loaded. Writer API available: true
```

**Should NOT see:**
- ❌ Uncaught errors
- ❌ "Writer is not defined"
- ❌ Permission denied errors
- ❌ Failed to load resource errors

## Testing on Real Websites

Once basic tests pass, try on actual platforms:

### Gmail Test
- [ ] Open Gmail → Compose new email
- [ ] In the body, type: "Request meeting to discuss Q4 budget"
- [ ] Highlight → Generate email
- [ ] Copy and paste into compose box
- [ ] Verify formatting is preserved

### LinkedIn Test
- [ ] Open LinkedIn → Start a post
- [ ] Type: "Excited about new AI features we shipped"
- [ ] Highlight → Generate social post
- [ ] Copy to LinkedIn
- [ ] Review tone (should be professional yet engaging)

### Google Docs Test
- [ ] Open new Google Doc
- [ ] Type some notes for a proposal
- [ ] Highlight → Generate proposal
- [ ] Copy to document
- [ ] Verify text pastes correctly

## Success Criteria

Extension is ready for next phase if:

- [ ] All Pre-Installation items completed
- [ ] All Installation Steps completed
- [ ] All 5 Quick Verification Tests pass
- [ ] No console errors
- [ ] Can generate content for all task types
- [ ] Copy and regenerate functions work
- [ ] Tested on at least 2 real websites (Gmail, LinkedIn, etc.)
- [ ] Understand how to use and troubleshoot the extension

## Next Steps After Successful Testing

Once Writer API is working well:

1. **Document your experience**
   - Note any issues encountered
   - Record model download time
   - Test generation quality for your use cases

2. **Plan Phase 2: Rewriter API**
   - Tone adjustment (make text more formal or casual)
   - Same context menu integration
   - Works on already-written text

3. **Plan Phase 3: Proofreader API**
   - Real-time grammar checking
   - Highlight errors inline
   - Show suggestions

4. **Plan Phase 4: Translator API**
   - Auto-detect language
   - Translate to multiple languages
   - Useful for international communication

---

## Ready to Proceed?

- [ ] **I have completed all tests above**
- [ ] **Writer API is working correctly**
- [ ] **Ready to add Rewriter, Proofreader, and Translator APIs**

Once you check all boxes above, we can proceed with adding the remaining APIs! 🚀
