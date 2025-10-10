# Testing Guide for AI Writing Assistant

This guide will help you test the Chrome extension with the Writer API.

## Pre-Testing Checklist

### 1. Verify System Requirements

```bash
# Check Chrome version (should be 137+)
# Open: chrome://version/
```

Required:
- [ ] Chrome 137 or higher
- [ ] 22 GB+ free disk space
- [ ] 4 GB+ VRAM
- [ ] 16 GB+ RAM

### 2. Enable Writer API

1. Open `chrome://flags` in Chrome
2. Search for these flags:
   - "Optimization Guide On Device Model"
   - "Writer API"
   - "Built-in AI"
3. Enable any relevant flags
4. Click "Relaunch" to restart Chrome

### 3. Load the Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `chromini` folder
5. Verify the extension appears in the list

## Test Cases

### Test 1: API Availability Check

**Objective**: Verify that the Writer API is detected correctly

**Steps**:
1. Click the extension icon in Chrome toolbar
2. Wait for the API status check to complete

**Expected Results**:
- ✅ Status indicator turns green
- ✅ Shows "Writer API is ready!" OR "Writer API available (download required)"
- ❌ If unavailable, shows clear error message with instructions

**Console Check**:
```javascript
// Open DevTools Console (F12) and run:
if ('Writer' in self) {
  console.log('Writer API supported');
  self.Writer.availability().then(status => {
    console.log('Availability:', status);
  });
} else {
  console.log('Writer API not supported');
}
```

---

### Test 2: Basic Text Generation - Cover Letter

**Objective**: Test cover letter generation

**Steps**:
1. Open a new tab (about:blank or any webpage)
2. Type or paste this text somewhere:
   ```
   Senior Software Engineer at Google, 8 years experience in Python and Go,
   led team of 10 engineers, expertise in distributed systems
   ```
3. Highlight the entire text
4. Right-click → "AI Writing Assistant" → "Draft Cover Letter"
5. Wait for the overlay to appear

**Expected Results**:
- ✅ Loading overlay appears with spinner
- ✅ If first use, shows download progress
- ✅ Generated text appears in the result box
- ✅ Text is formatted as a professional cover letter
- ✅ Text is editable
- ✅ "Copy" and "Regenerate" buttons are visible

**Console Check**:
```javascript
// Check for errors in Console (F12)
// Should see: "AI Writing Assistant loaded. Writer API available: true"
```

---

### Test 3: Email Generation

**Objective**: Test email drafting functionality

**Test Input**:
```
Request to schedule a meeting next Tuesday to discuss Q4 budget allocation
for the engineering department
```

**Steps**:
1. Highlight the text above
2. Right-click → "AI Writing Assistant" → "Draft Email"

**Expected Results**:
- ✅ Generates a professional email
- ✅ Includes proper greeting and closing
- ✅ Maintains formal tone
- ✅ Content is relevant to the request

---

### Test 4: Social Media Post

**Objective**: Test casual tone generation

**Test Input**:
```
Just launched new feature that reduced page load time by 50%, improved user
engagement metrics by 30%
```

**Steps**:
1. Highlight the text
2. Right-click → "AI Writing Assistant" → "Draft Social Post"

**Expected Results**:
- ✅ Generates engaging social media content
- ✅ Uses casual, enthusiastic tone
- ✅ Shorter length compared to email/cover letter
- ✅ Includes relevant hashtags or emojis (optional)

---

### Test 5: Proposal Generation

**Objective**: Test business proposal writing

**Test Input**:
```
Implement new CI/CD pipeline to reduce deployment time from 2 hours to 15 minutes,
cost $50k, saves 10 engineering hours per week
```

**Steps**:
1. Highlight the text
2. Right-click → "AI Writing Assistant" → "Draft Proposal"

**Expected Results**:
- ✅ Generates structured business proposal
- ✅ Formal, professional tone
- ✅ Includes benefits and justification
- ✅ Well-organized content

---

### Test 6: Custom Writing Task

**Objective**: Test general writing capability

**Test Input** (any topic):
```
Benefits of morning exercise routine for productivity
```

**Steps**:
1. Highlight the text
2. Right-click → "AI Writing Assistant" → "Custom Writing Task"

**Expected Results**:
- ✅ Generates relevant content
- ✅ Neutral tone
- ✅ Medium length

---

### Test 7: Copy to Clipboard

**Objective**: Test copy functionality

**Steps**:
1. Generate any content using the extension
2. Click the "Copy" button

**Expected Results**:
- ✅ Button text changes to "Copied!"
- ✅ Text is copied to clipboard (verify with Ctrl+V/Cmd+V)
- ✅ Button text reverts after 2 seconds

---

### Test 8: Regenerate Content

**Objective**: Test regeneration with same prompt

**Steps**:
1. Generate any content
2. Note the generated text
3. Click "Regenerate" button
4. Wait for new content

**Expected Results**:
- ✅ Loading overlay appears again
- ✅ New content is generated
- ✅ Content may be different from first generation
- ✅ Same tone and style maintained

---

### Test 9: Edit Generated Text

**Objective**: Test inline editing

**Steps**:
1. Generate any content
2. Click in the result text area
3. Type or delete text

**Expected Results**:
- ✅ Text is editable (contenteditable works)
- ✅ Changes persist until overlay is closed
- ✅ Can still copy edited text

---

### Test 10: Close and Reopen

**Objective**: Test UI state management

**Steps**:
1. Generate content
2. Click the "X" close button
3. Generate new content with different text

**Expected Results**:
- ✅ Overlay closes when X is clicked
- ✅ New generation creates fresh overlay
- ✅ Previous content is not retained

---

## Performance Testing

### Test 11: First-Time Model Download

**Objective**: Test model download experience (if model not yet downloaded)

**Steps**:
1. If you haven't used Writer API before, trigger any writing task
2. Watch the download progress

**Expected Results**:
- ✅ Download progress percentage updates
- ✅ Progress bar or spinner visible
- ✅ Download completes successfully
- ✅ Content generates after download

**Note**: This is a one-time download. Subsequent uses should be instant.

---

### Test 12: Streaming Output

**Objective**: Verify streaming works (text appears gradually)

**Steps**:
1. Generate a long piece of content (e.g., cover letter)
2. Watch the result box as content appears

**Expected Results**:
- ✅ Text appears chunk by chunk (streaming)
- ✅ Smooth, progressive display
- ✅ No UI freezing

---

### Test 13: Multiple Generations

**Objective**: Test repeated use without restart

**Steps**:
1. Generate content 5 times with different inputs
2. Try different task types

**Expected Results**:
- ✅ All generations work correctly
- ✅ No performance degradation
- ✅ No memory leaks (check Task Manager)

---

## Integration Testing

### Test 14: Test on Gmail

**Objective**: Real-world usage in Gmail compose

**Steps**:
1. Open Gmail (mail.google.com)
2. Click "Compose"
3. In the body, type: "Follow up on project timeline discussion"
4. Highlight text
5. Right-click → AI Writing Assistant → Draft Email
6. Copy generated content
7. Paste into Gmail compose box

**Expected Results**:
- ✅ Extension works on Gmail
- ✅ Generated content is appropriate for email
- ✅ Copy-paste works correctly

---

### Test 15: Test on LinkedIn

**Objective**: Test on LinkedIn post creation

**Steps**:
1. Open LinkedIn
2. Click "Start a post"
3. Type: "Excited to share our team's achievement in reducing costs by 40%"
4. Highlight text
5. Right-click → AI Writing Assistant → Draft Social Post
6. Copy result

**Expected Results**:
- ✅ Works on LinkedIn
- ✅ Tone is appropriate for LinkedIn
- ✅ Content is professional yet engaging

---

### Test 16: Test on Google Docs

**Objective**: Test in document editor

**Steps**:
1. Open a new Google Doc
2. Type some notes about a topic
3. Highlight
4. Use the extension

**Expected Results**:
- ✅ Extension overlay appears over Google Docs
- ✅ Can copy content to Google Doc

---

## Error Handling Testing

### Test 17: No Text Selected

**Objective**: Test behavior with no selection

**Steps**:
1. Right-click on a webpage without selecting any text
2. Look for the extension menu

**Expected Results**:
- ✅ Extension menu only appears when text is selected
- ❌ Menu should NOT appear with no selection

---

### Test 18: Very Long Text

**Objective**: Test with long input

**Test Input**: Paste a very long text (2000+ words)

**Steps**:
1. Highlight very long text
2. Try to generate content

**Expected Results**:
- ✅ Extension handles long input gracefully
- ✅ Generation completes (may take longer)
- ✅ OR shows appropriate error/truncation message

---

### Test 19: Special Characters

**Objective**: Test with special characters and emojis

**Test Input**:
```
Tech conference 2024 🚀 #AI #Innovation @ San Francisco
Cost: $500-$1000, Date: 12/15/2024
```

**Steps**:
1. Highlight and generate content

**Expected Results**:
- ✅ Handles special characters correctly
- ✅ No errors or broken output
- ✅ Generated content is properly formatted

---

### Test 20: Network Interruption

**Objective**: Test offline behavior (after model download)

**Steps**:
1. Ensure model is already downloaded
2. Disconnect from internet
3. Try to generate content

**Expected Results**:
- ✅ Works offline (if model is downloaded)
- ✅ No network errors
- ✅ Content generates successfully

---

## Browser Console Testing

### Check for JavaScript Errors

Open DevTools (F12) and check Console tab:

**Should See**:
```
AI Writing Assistant loaded. Writer API available: true
```

**Should NOT See**:
- ❌ Uncaught errors
- ❌ Failed to fetch errors
- ❌ Permission denied errors

### Monitor Network Activity

Open DevTools → Network tab:

**On First Use**:
- May see model download requests
- Large file downloads (model data)

**On Subsequent Uses**:
- Minimal or no network activity
- All processing is local

---

## Accessibility Testing

### Test 21: Keyboard Navigation

**Steps**:
1. Generate content
2. Try using Tab key to navigate buttons
3. Try using Enter/Space to click buttons

**Expected Results**:
- ✅ Can tab through buttons
- ✅ Buttons are keyboard accessible
- ⚠️ (Optional) Close button works with Escape key

---

## Reporting Issues

If you encounter problems:

1. **Check DevTools Console** (F12) for error messages
2. **Verify API Status** using the extension popup
3. **Check Chrome Version** at `chrome://version/`
4. **Note the Specific Issue**:
   - What were you trying to do?
   - What actually happened?
   - Any error messages?
   - Screenshots if helpful

## Success Criteria

The extension passes testing if:

- [ ] All 21 test cases pass
- [ ] No console errors
- [ ] API availability correctly detected
- [ ] Content generation works for all task types
- [ ] UI is responsive and user-friendly
- [ ] Copy, regenerate, and close functions work
- [ ] Works on popular sites (Gmail, LinkedIn, Google Docs)
- [ ] Handles edge cases gracefully

---

## Next Steps After Testing

Once testing is complete and the Writer API works:

1. **Plan additional APIs**: Rewriter, Proofreader, Translator
2. **Enhance UI**: Add more styling and animations
3. **Add features**: Settings panel, templates, history
4. **Optimize performance**: Caching, lazy loading
5. **Publish**: Prepare for Chrome Web Store (if desired)

---

**Ready to test!** Start with Test 1 and work through each test case.
