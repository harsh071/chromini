# Quick Start Guide

Get up and running with the AI Writing Assistant extension in 5 minutes.

## Step 1: Check Your Browser

Make sure you have Chrome 137 or higher:
1. Open `chrome://version/`
2. Check the version number at the top
3. If needed, update at `chrome://settings/help`

## Step 2: Enable Writer API

1. Open `chrome://flags`
2. Search for "Writer API" or "Optimization Guide On Device"
3. Enable any AI-related flags
4. Click "Relaunch" to restart Chrome

## Step 3: Install the Extension

1. Open `chrome://extensions/`
2. Toggle on "Developer mode" (top-right corner)
3. Click "Load unpacked"
4. Navigate to and select the `chromini` folder
5. The extension should now appear in your extensions list

## Step 4: Verify Installation

1. Click the extension icon (puzzle piece) in Chrome toolbar
2. The popup should open showing API status
3. Wait for it to check availability
4. If green checkmark appears, you're ready to go!

## Step 5: Test It Out

### Quick Test:

1. **Open a new tab** or any webpage

2. **Type this text** somewhere on the page:
   ```
   Senior Developer at TechCorp, 5 years experience with React and Node.js
   ```

3. **Highlight the text** with your mouse

4. **Right-click** → "AI Writing Assistant" → "Draft Cover Letter"

5. **Wait for the magic** ✨
   - First time may take a few minutes (downloading AI model)
   - Subsequent uses are instant

6. **View your content** in the popup overlay
   - Edit the text if needed
   - Click "Copy" to use it
   - Click "Regenerate" to try again

## Available Features

Once installed, you can right-click on any selected text and choose:

- 📝 **Draft Cover Letter** - Professional job application letters
- 💼 **Draft Proposal** - Business proposals
- 📧 **Draft Email** - Professional emails
- 📱 **Draft Social Post** - Engaging social media content
- ✏️ **Custom Writing Task** - General writing assistance

## Usage Examples

### Example 1: Write an Email
1. Select text: "Need to reschedule Friday's meeting to Monday"
2. Right-click → AI Writing Assistant → Draft Email
3. Get a polished professional email
4. Copy and paste into Gmail

### Example 2: Create a LinkedIn Post
1. Select text: "Our team reduced server costs by 40% this quarter"
2. Right-click → AI Writing Assistant → Draft Social Post
3. Get an engaging post with professional tone
4. Post directly to LinkedIn

### Example 3: Draft a Cover Letter
1. Select text: "Software Engineer at Google, Python expert, 8 years experience"
2. Right-click → AI Writing Assistant → Draft Cover Letter
3. Get a compelling cover letter
4. Edit and use for your job application

## Troubleshooting

### "Writer API not available"
- ✅ Check Chrome version (must be 137+)
- ✅ Enable flags at `chrome://flags`
- ✅ Verify system requirements (22GB disk, 4GB VRAM, 16GB RAM)
- ✅ Restart Chrome after enabling flags

### Context menu not showing
- ✅ Make sure text is selected before right-clicking
- ✅ Reload the extension at `chrome://extensions/`
- ✅ Refresh the webpage

### Slow first-time use
- ✅ This is normal! AI model is downloading
- ✅ First download can take 5-15 minutes
- ✅ After download, it's instant
- ✅ Works offline after download

## What's Next?

After you've tested the Writer API:

1. ✅ Try it on different websites (Gmail, LinkedIn, Google Docs)
2. ✅ Test all the different writing tasks
3. ✅ Explore regenerating content for variations
4. ✅ Edit generated text to fit your needs

### Coming Soon (Future Features):
- 🔄 **Rewriter API** - Adjust tone (formal/casual)
- ✏️ **Proofreader API** - Real-time grammar checking
- 🌐 **Translator API** - Multilingual support
- 🎯 **Context Detection** - Auto-detect platform (Gmail, LinkedIn, etc.)

## Need Help?

- 📖 **Full Documentation**: See [README.md](README.md)
- 🧪 **Testing Guide**: See [TESTING_GUIDE.md](TESTING_GUIDE.md)
- 🤖 **API Reference**: See [CHROME_BUILT_IN_AI_APIS.md](CHROME_BUILT_IN_AI_APIS.md)
- 🐛 **Found a bug?**: Check DevTools console (F12) for errors

## Tips for Best Results

1. **Be specific in your selection**: More context = better output
   - ❌ "developer job"
   - ✅ "Senior Frontend Developer at Meta, React expert, 7 years experience"

2. **Choose the right task type**: Each has different tone and length
   - Emails = Medium, formal
   - Cover letters = Long, formal
   - Social posts = Short, casual

3. **Edit the output**: AI is a starting point, personalize it!

4. **Regenerate if needed**: Try multiple times for variations

5. **Use on real tasks**: Gmail, LinkedIn, Google Docs, etc.

---

**You're all set!** 🚀 Start highlighting text and let AI enhance your writing.

For more advanced usage and customization, check out the full [README.md](README.md).
