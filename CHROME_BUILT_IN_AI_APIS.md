# Chrome Built-in AI APIs - Complete Reference Guide

A comprehensive guide to all Chrome Built-in AI APIs powered by Gemini Nano for client-side AI applications.

## Table of Contents

- [System Requirements](#system-requirements)
- [General Setup](#general-setup)
- [Writer API](#writer-api)
- [Rewriter API](#rewriter-api)
- [Proofreader API](#proofreader-api)
- [Translator API](#translator-api)
- [Language Detector API](#language-detector-api)
- [Summarizer API](#summarizer-api)
- [Prompt API](#prompt-api)
- [Common Patterns](#common-patterns)
- [Best Practices](#best-practices)

---

## System Requirements

All Chrome Built-in AI APIs share the following requirements:

### Hardware Requirements
- **Storage**: At least 22 GB free space
- **GPU**: More than 4 GB VRAM
- **CPU**: 16 GB RAM, 4+ cores
- **Network**: Unmetered connection (for initial model download)

### Supported Operating Systems
- Windows 10/11
- macOS 13+ (Ventura)
- Linux
- ChromeOS (Platform 16389.0.0+) on Chromebook Plus

### Browser Support
- Chrome 137+ (varies by API)
- Not available on mobile devices
- Not supported in Web Workers (with few exceptions)

---

## General Setup

### Origin Trial Registration

Most APIs require origin trial registration:
1. Visit [Chrome Origin Trials](https://developer.chrome.com/origintrials/)
2. Register your origin
3. Add the trial token to your HTML:

```html
<meta http-equiv="origin-trial" content="YOUR_TOKEN_HERE">
```

### Permissions Policy

For cross-origin iframes, grant permission using:

```html
<iframe
  src="https://example.com"
  allow="compute-pressure *; ai-prompt-api *; ai-writer-api *;"
></iframe>
```

---

## Writer API

Generate new content for various writing tasks.

### Feature Detection

```javascript
if ('Writer' in self) {
  // Writer API is supported
}
```

### Check Availability

```javascript
const availability = await Writer.availability();
// Returns: 'unavailable', 'available', or 'after-download'
```

### Create Writer

```javascript
const writer = await Writer.create({
  sharedContext: 'Context for all writing tasks',
  tone: 'casual',        // Options: 'formal', 'neutral', 'casual'
  format: 'plain-text',  // Options: 'markdown', 'plain-text'
  length: 'medium',      // Options: 'short', 'medium', 'long'
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

### Writing Methods

#### Non-Streaming

```javascript
const result = await writer.write(
  'An inquiry to my bank about wire transfers',
  {
    context: "I'm a longstanding customer"
  }
);
console.log(result);
```

#### Streaming

```javascript
const stream = writer.writeStreaming(
  'Write a blog post about AI development',
  {
    context: 'Target audience: developers'
  }
);

for await (const chunk of stream) {
  composeTextbox.append(chunk);
}
```

### Reuse Writer

```javascript
const writer = await Writer.create({ tone: 'formal' });

const reviews = await Promise.all(
  Array.from(
    document.querySelectorAll('#reviews > .review'),
    (reviewEl) => writer.write(reviewEl.textContent)
  )
);
```

### Abort and Destroy

```javascript
// Abort ongoing operation
const controller = new AbortController();
stopButton.onclick = () => controller.abort();

const writer = await Writer.create({ signal: controller.signal });
await writer.write(text, { signal: controller.signal });

// Destroy when done
writer.destroy();
```

### Browser Support
- Chrome 137-142+
- Origin trial required

---

## Rewriter API

Adjust tone and style of existing text.

### Feature Detection

```javascript
if ('Rewriter' in self) {
  // Rewriter API is supported
}
```

### Check Availability

```javascript
const availability = await Rewriter.availability();
```

### Create Rewriter

```javascript
const rewriter = await Rewriter.create({
  sharedContext: 'Optional shared context',
  tone: 'more-formal',   // Options: 'more-formal', 'as-is', 'more-casual'
  format: 'markdown',    // Options: 'as-is', 'markdown', 'plain-text'
  length: 'shorter',     // Options: 'shorter', 'as-is', 'longer'
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

### Rewriting Methods

#### Non-Streaming

```javascript
const result = await rewriter.rewrite(originalText, {
  context: 'Email to a colleague'
});
```

#### Streaming

```javascript
const stream = rewriter.rewriteStreaming(originalText, {
  context: 'LinkedIn post'
});

for await (const chunk of stream) {
  outputElement.append(chunk);
}
```

### Complete Example

```javascript
// Check availability first
const available = await Rewriter.availability();
let rewriter;

if (available === 'unavailable') {
  console.error('Rewriter API is not available');
  return;
}

if (available === 'available') {
  rewriter = await Rewriter.create({ tone: 'more-formal' });
} else {
  // Model needs to be downloaded
  rewriter = await Rewriter.create({
    tone: 'more-formal',
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(`Downloaded ${e.loaded * 100}%`);
      });
    }
  });
}

const rewritten = await rewriter.rewrite('hey whats up');
// Output: "Hello, how are you?"

rewriter.destroy();
```

### Browser Support
- Chrome 137-142+
- Origin trial required

---

## Proofreader API

Real-time grammar, spelling, and punctuation checking.

### Feature Detection

```javascript
if ('Proofreader' in self) {
  // Proofreader API is supported
}
```

### Check Availability

```javascript
const available = Proofreader.availability('downloadable') === true;
```

### Create Proofreader

```javascript
const proofreader = await Proofreader.create({
  expectedInputLanguages: ['en'],
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

### Proofread Text

```javascript
const proofreadResult = await proofreader.proofread(
  'I seen him yesterday at the store, and he bought two loafs of bread.'
);

// Get the corrected text
console.log(proofreadResult.correction);

// Get detailed corrections
for (const correction of proofreadResult.corrections) {
  console.log('Error type:', correction.type);
  console.log('Original:', correction.original);
  console.log('Suggestion:', correction.suggestion);
  console.log('Explanation:', correction.explanation);
  console.log('Position:', correction.offset, correction.length);
}
```

### Correction Object Structure

```javascript
{
  correction: "I saw him yesterday at the store, and he bought two loaves of bread.",
  corrections: [
    {
      type: "grammar",           // Error category
      original: "seen",          // Original text
      suggestion: "saw",         // Suggested correction
      explanation: "Verb tense", // Why this is an error
      offset: 2,                 // Position in text
      length: 4                  // Length of error
    },
    // ... more corrections
  ]
}
```

### Browser Support
- Chrome 141-145+
- Origin trial required
- Not available on mobile

---

## Translator API

Translate text between languages on-device.

### Feature Detection

```javascript
if ('Translator' in self) {
  // Translator API is supported
}
```

### Check Language Pair Availability

```javascript
const translatorCapabilities = await Translator.availability({
  sourceLanguage: 'es',
  targetLanguage: 'fr'
});
// Returns: 'unavailable', 'available', or 'after-download'
```

### Create Translator

```javascript
const translator = await Translator.create({
  sourceLanguage: 'en',  // BCP 47 language code
  targetLanguage: 'es',  // BCP 47 language code
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

### Translation Methods

#### Standard Translation

```javascript
const translated = await translator.translate(
  'Where is the next bus stop, please?'
);
console.log(translated); // "¿Dónde está la próxima parada de autobús, por favor?"
```

#### Streaming Translation (for longer texts)

```javascript
const stream = translator.translateStreaming(longText);

for await (const chunk of stream) {
  outputElement.append(chunk);
}
```

### Language Codes

Use [BCP 47](https://www.rfc-editor.org/info/bcp47) language codes:
- `'en'` - English
- `'es'` - Spanish
- `'fr'` - French
- `'de'` - German
- `'ja'` - Japanese
- `'zh'` - Chinese

### Complete Example

```javascript
// Check if language pair is available
const canTranslate = await Translator.availability({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});

if (canTranslate === 'unavailable') {
  console.error('Translation not available for this language pair');
  return;
}

// Create translator
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});

// Translate
const result = await translator.translate('Hello, world!');
console.log(result); // "¡Hola, mundo!"

// Clean up
translator.destroy();
```

### Browser Support
- Chrome 138+
- Desktop only (not on mobile)
- Not supported in Web Workers

---

## Language Detector API

Detect the language of text on-device.

### Feature Detection

```javascript
if ('LanguageDetector' in self) {
  // Language Detector API is supported
}
```

### Check Availability

```javascript
const availability = await LanguageDetector.availability();
```

### Create Language Detector

```javascript
const detector = await LanguageDetector.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

### Detect Language

```javascript
const text = 'Hallo und herzlich willkommen!';
const results = await detector.detect(text);

for (const result of results) {
  console.log(`Language: ${result.detectedLanguage}`);
  console.log(`Confidence: ${result.confidence}`);
}

// Example output:
// Language: de
// Confidence: 0.95
// Language: nl
// Confidence: 0.03
```

### Result Object Structure

```javascript
[
  {
    detectedLanguage: 'de',  // BCP 47 language code
    confidence: 0.95         // 0.0 to 1.0
  },
  {
    detectedLanguage: 'nl',
    confidence: 0.03
  }
]
```

### Best Practices

```javascript
// Set a confidence threshold
const CONFIDENCE_THRESHOLD = 0.7;

const results = await detector.detect(userText);
const topResult = results[0];

if (topResult.confidence >= CONFIDENCE_THRESHOLD) {
  console.log(`Detected language: ${topResult.detectedLanguage}`);
} else {
  console.log('Language detection uncertain');
}
```

### Limitations
- Not trained on every language
- Low accuracy with short phrases or single words
- Recommend using confidence thresholds

### Browser Support
- Chrome 138+
- Desktop only

---

## Summarizer API

Generate summaries of text content.

### Feature Detection

```javascript
if ('Summarizer' in self) {
  // Summarizer API is supported
}
```

### Check Availability

```javascript
const availability = await Summarizer.availability();
```

### Create Summarizer

```javascript
const summarizer = await Summarizer.create({
  type: 'key-points',    // Summary type (see below)
  format: 'markdown',    // Options: 'plain-text', 'markdown'
  length: 'medium',      // Options: 'short', 'medium', 'long'
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

### Summary Types

- **`key-points`**: Extract important points as bullet points
- **`tldr`**: Concise overview
- **`teaser`**: Intriguing highlights to encourage reading
- **`headline`**: Main point in a single sentence

### Summarization Methods

#### Non-Streaming

```javascript
const summary = await summarizer.summarize(longArticleText, {
  context: 'Technical documentation for developers'
});
console.log(summary);
```

#### Streaming

```javascript
const stream = summarizer.summarizeStreaming(longArticleText, {
  context: 'Blog post about AI technology'
});

for await (const chunk of stream) {
  summaryElement.append(chunk);
}
```

### Complete Example

```javascript
// Create summarizer for key points
const summarizer = await Summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'short'
});

const article = `
  [Long article text here...]
`;

const summary = await summarizer.summarize(article, {
  context: 'Summary for newsletter'
});

console.log(summary);
// Output:
// - First key point
// - Second key point
// - Third key point

summarizer.destroy();
```

### Browser Support
- Chrome 138+
- Desktop only (not on mobile)
- Origin trial required

---

## Prompt API

General-purpose language model for natural language interactions.

### Feature Detection

```javascript
if ('LanguageModel' in self || 'ai' in self) {
  // Prompt API is supported
}
```

### Check Availability

```javascript
const availability = await LanguageModel.availability();
// or
const availability = await ai.languageModel.availability();
```

### Check Capabilities

```javascript
const capabilities = await LanguageModel.capabilities();
console.log('Default temperature:', capabilities.defaultTemperature);
console.log('Default top-K:', capabilities.defaultTopK);
console.log('Max top-K:', capabilities.maxTopK);
console.log('Languages:', capabilities.languageAvailable); // ['en', 'ja', 'es']
```

### Create Session

```javascript
const session = await LanguageModel.create({
  temperature: 0.8,      // Creativity (0.0 - 1.0)
  topK: 3,              // Sampling diversity
  systemPrompt: 'You are a helpful coding assistant',
  initialPrompts: [
    { role: 'system', content: 'Additional context' },
    { role: 'user', content: 'Previous message' },
    { role: 'assistant', content: 'Previous response' }
  ],
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

### Prompt Methods

#### Non-Streaming

```javascript
const result = await session.prompt('Write me a haiku about programming');
console.log(result);
```

#### Streaming

```javascript
const stream = session.promptStreaming('Explain async/await in JavaScript');

for await (const chunk of stream) {
  outputElement.append(chunk);
}
```

### Session Management

```javascript
// Clone a session (preserves context)
const newSession = await session.clone();

// Destroy a session
session.destroy();

// Count tokens
const tokens = await session.countPromptTokens('How many tokens is this?');
console.log(`Token count: ${tokens}`);

// Get current token usage
console.log(`Tokens used: ${session.tokensSoFar}`);
console.log(`Max tokens: ${session.maxTokens}`);
console.log(`Tokens left: ${session.tokensLeft}`);
```

### Constrained Output (JSON Schema)

```javascript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    occupation: { type: 'string' }
  },
  required: ['name', 'age']
};

const result = await session.prompt('Generate a person profile', {
  responseConstraint: schema
});

console.log(JSON.parse(result));
// { name: "John Doe", age: 30, occupation: "Developer" }
```

### Abort Prompts

```javascript
const controller = new AbortController();

setTimeout(() => controller.abort(), 5000); // Abort after 5 seconds

try {
  const result = await session.prompt('Long running task', {
    signal: controller.signal
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Prompt was aborted');
  }
}
```

### Multi-modal Input (Images)

```javascript
const session = await LanguageModel.create({
  expectedInputs: [
    { type: 'text', languages: ['en'] },
    { type: 'image', mimeTypes: ['image/png', 'image/jpeg'] }
  ]
});

const result = await session.prompt([
  { type: 'text', text: 'What is in this image?' },
  { type: 'image', image: imageBlob }
]);
```

### Browser Support
- Chrome 137+
- Supports English, Japanese, and Spanish
- Origin trial required

---

## Common Patterns

### 1. Progressive Enhancement

```javascript
async function setupAI() {
  if (!('Writer' in self)) {
    return { supported: false };
  }

  const availability = await Writer.availability();

  if (availability === 'unavailable') {
    return { supported: false };
  }

  return {
    supported: true,
    needsDownload: availability === 'after-download'
  };
}

// Usage
const aiStatus = await setupAI();
if (!aiStatus.supported) {
  // Fall back to traditional input
  showTraditionalForm();
} else if (aiStatus.needsDownload) {
  // Show download progress
  showDownloadUI();
}
```

### 2. Download Progress UI

```javascript
async function createWriterWithProgress(progressCallback) {
  const writer = await Writer.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        const percent = Math.round(e.loaded * 100);
        progressCallback(percent);
      });
    }
  });
  return writer;
}

// Usage
const writer = await createWriterWithProgress((percent) => {
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `Downloading AI model: ${percent}%`;
});
```

### 3. Graceful Error Handling

```javascript
async function safelyCreateAPI(APIConstructor, options = {}) {
  try {
    const availability = await APIConstructor.availability(options);

    if (availability === 'unavailable') {
      throw new Error('API not available on this device');
    }

    return await APIConstructor.create(options);
  } catch (error) {
    console.error('Failed to create API:', error);
    // Fall back to server-side API or alternative
    return null;
  }
}
```

### 4. Reusable API Instance

```javascript
class AIWriterService {
  constructor() {
    this.writer = null;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (!('Writer' in self)) {
        throw new Error('Writer API not supported');
      }

      this.writer = await Writer.create({
        tone: 'neutral',
        format: 'plain-text'
      });
    })();

    return this.initPromise;
  }

  async write(prompt, context) {
    await this.init();
    return this.writer.write(prompt, { context });
  }

  destroy() {
    if (this.writer) {
      this.writer.destroy();
      this.writer = null;
      this.initPromise = null;
    }
  }
}

// Usage
const writerService = new AIWriterService();
const result = await writerService.write('Draft an email', 'Professional tone');
```

### 5. Combining APIs

```javascript
async function smartTranslate(text) {
  // Detect language first
  const detector = await LanguageDetector.create();
  const detectionResults = await detector.detect(text);
  const sourceLanguage = detectionResults[0].detectedLanguage;

  // Then translate
  const translator = await Translator.create({
    sourceLanguage,
    targetLanguage: 'en'
  });

  const translated = await translator.translate(text);

  // Clean up
  detector.destroy();
  translator.destroy();

  return {
    originalLanguage: sourceLanguage,
    translated
  };
}
```

---

## Best Practices

### Performance

1. **Reuse API Instances**: Create once, use multiple times
   ```javascript
   // Good
   const writer = await Writer.create();
   await writer.write(text1);
   await writer.write(text2);
   writer.destroy();

   // Bad
   const writer1 = await Writer.create();
   await writer1.write(text1);
   writer1.destroy();

   const writer2 = await Writer.create();
   await writer2.write(text2);
   writer2.destroy();
   ```

2. **Use Streaming for Long Content**: Improves perceived performance
   ```javascript
   // For long content
   const stream = writer.writeStreaming(longPrompt);
   for await (const chunk of stream) {
     display(chunk); // User sees progress
   }
   ```

3. **Preload Models**: Download during idle time
   ```javascript
   // During app initialization or idle time
   if ('requestIdleCallback' in window) {
     requestIdleCallback(async () => {
       await Writer.create(); // Trigger download
     });
   }
   ```

### User Experience

1. **Show Download Progress**: Always inform users about model downloads
   ```javascript
   const writer = await Writer.create({
     monitor(m) {
       m.addEventListener('downloadprogress', (e) => {
         updateProgressBar(e.loaded * 100);
       });
     }
   });
   ```

2. **Provide Fallbacks**: Don't rely solely on AI APIs
   ```javascript
   if (!('Writer' in self)) {
     // Show traditional text input
     showManualCompose();
   }
   ```

3. **Handle Errors Gracefully**: Network issues, quota limits, etc.
   ```javascript
   try {
     const result = await writer.write(prompt);
     showResult(result);
   } catch (error) {
     showError('AI generation failed. Please try again.');
     logError(error);
   }
   ```

### Privacy and Security

1. **Keep Data On-Device**: All processing happens locally
   - No data sent to servers
   - Respects user privacy
   - Works offline after model download

2. **Clear Sensitive Data**: Destroy sessions when done
   ```javascript
   // After processing sensitive content
   session.destroy();
   ```

3. **Respect User Consent**: Ask before downloading large models
   ```javascript
   if (await getUserConsent()) {
     await Writer.create(); // Downloads model
   }
   ```

### Resource Management

1. **Always Destroy When Done**
   ```javascript
   try {
     const writer = await Writer.create();
     const result = await writer.write(prompt);
     return result;
   } finally {
     writer?.destroy();
   }
   ```

2. **Use Abort Signals for Long Operations**
   ```javascript
   const controller = new AbortController();
   cancelButton.onclick = () => controller.abort();

   await writer.write(prompt, { signal: controller.signal });
   ```

3. **Monitor Token Usage** (for Prompt API)
   ```javascript
   if (session.tokensLeft < 100) {
     // Create new session or summarize context
     const newSession = await LanguageModel.create();
   }
   ```

---

## Resources

### Official Documentation
- [Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Get Started Guide](https://developer.chrome.com/docs/ai/get-started)
- [Chrome AI Blog](https://developer.chrome.com/blog/ai)

### Demo Projects

#### GoogleChromeLabs/web-ai-demos
Main repository: [https://github.com/GoogleChromeLabs/web-ai-demos](https://github.com/GoogleChromeLabs/web-ai-demos)

Individual demos:
- **Writer/Rewriter Playground**: Interactive playground for Writer and Rewriter APIs
  [https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-api-playground](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-api-playground)

- **Prompt API Playground**: Showcases Chrome's built-in Prompt API
  [https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/prompt-api-playground](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/prompt-api-playground)

- **Summarization API Playground**: Demo of the Summarization API
  [https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/summarization-api-playground](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/summarization-api-playground)

- **Weather AI**: Uses Prompt API to generate human-readable weather descriptions
  [https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/weather-ai](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/weather-ai)

- **Right Click for Superpowers**: Context menu integration with LLM for common tasks
  [https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/right-click-for-superpowers](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/right-click-for-superpowers)

- **Product Review Suggestions**: Client-side sentiment analysis, toxicity, and rating assessment
  [https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/product-review-suggestions](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/product-review-suggestions)

- **Gemini Node SSE**: Server-Sent Events streaming with Gemini
  [https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/gemini-node-sse](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/gemini-node-sse)

- **Performance Tips with Web Worker**: Client-side Gen AI performance/UX best practices
  [https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/perf-worker-gemma](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/perf-worker-gemma)

#### Chrome Extension Samples
- **API Samples**: Official Chrome extension examples including AI APIs
  [https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)

### Community
- [Chrome AI Challenge 2025](https://googlechromeai2025.devpost.com/)
- [W3C WebML Working Group](https://www.w3.org/groups/wg/webmachinelearning/)

---

## Changelog

- **2025-01**: Initial documentation covering all Chrome Built-in AI APIs
- APIs covered: Writer, Rewriter, Proofreader, Translator, Language Detector, Summarizer, Prompt API

---

## License

This documentation is provided as a reference guide for Chrome Built-in AI APIs. All APIs are subject to Chrome's terms of service and Google's Generative AI Prohibited Uses Policy.
