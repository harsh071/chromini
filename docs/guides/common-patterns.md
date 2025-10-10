# Common Patterns

Reusable code patterns and best practices for Chrome Built-in AI APIs.

## Table of Contents

- [Progressive Enhancement](#progressive-enhancement)
- [Download Progress UI](#download-progress-ui)
- [Graceful Error Handling](#graceful-error-handling)
- [Reusable API Instance](#reusable-api-instance)
- [Combining APIs](#combining-apis)
- [Singleton Pattern](#singleton-pattern)
- [Factory Pattern](#factory-pattern)
- [Debouncing for Real-time](#debouncing-for-real-time)
- [Batch Processing](#batch-processing)
- [Retry Logic](#retry-logic)

---

## Progressive Enhancement

Gracefully handle API availability and provide fallbacks.

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

### Multi-API Progressive Enhancement

```javascript
async function checkAICapabilities() {
  const capabilities = {
    writer: false,
    rewriter: false,
    translator: false,
    summarizer: false
  };

  if ('Writer' in self) {
    const availability = await Writer.availability();
    capabilities.writer = availability !== 'unavailable';
  }

  if ('Rewriter' in self) {
    const availability = await Rewriter.availability();
    capabilities.rewriter = availability !== 'unavailable';
  }

  if ('Translator' in self) {
    capabilities.translator = true;
  }

  if ('Summarizer' in self) {
    const availability = await Summarizer.availability();
    capabilities.summarizer = availability !== 'unavailable';
  }

  return capabilities;
}

// Enable features based on availability
const caps = await checkAICapabilities();
if (caps.writer) enableWriterFeature();
if (caps.rewriter) enableRewriterFeature();
if (caps.translator) enableTranslatorFeature();
```

---

## Download Progress UI

Show users model download progress for better UX.

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

### Advanced Progress UI

```javascript
class AIDownloadManager {
  constructor() {
    this.progressBar = document.getElementById('progress-bar');
    this.progressText = document.getElementById('progress-text');
    this.statusText = document.getElementById('status-text');
  }

  showProgress(percent) {
    this.progressBar.style.width = `${percent}%`;
    this.progressText.textContent = `${percent}%`;

    if (percent === 100) {
      this.statusText.textContent = 'Download complete! Initializing...';
    } else {
      this.statusText.textContent = 'Downloading AI model...';
    }
  }

  hide() {
    this.progressBar.parentElement.style.display = 'none';
  }

  async createAPI(APIConstructor, options = {}) {
    return await APIConstructor.create({
      ...options,
      monitor: (m) => {
        m.addEventListener('downloadprogress', (e) => {
          this.showProgress(Math.round(e.loaded * 100));
        });
      }
    });
  }
}

// Usage
const downloadManager = new AIDownloadManager();
const writer = await downloadManager.createAPI(Writer, { tone: 'formal' });
downloadManager.hide();
```

---

## Graceful Error Handling

Handle failures gracefully with fallbacks.

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

// Usage
const writer = await safelyCreateAPI(Writer, { tone: 'formal' });

if (writer) {
  const result = await writer.write('Draft an email');
  console.log(result);
} else {
  // Use fallback (e.g., server-side API)
  const result = await fetchFromServer('/api/write', { prompt: 'Draft an email' });
}
```

### Comprehensive Error Handler

```javascript
class AIErrorHandler {
  static async execute(apiCall, fallback = null) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Operation cancelled by user');
        return { cancelled: true };
      }

      if (error.message.includes('quota')) {
        console.error('API quota exceeded');
        return fallback ? await fallback() : null;
      }

      if (error.message.includes('unavailable')) {
        console.error('API not available');
        return fallback ? await fallback() : null;
      }

      console.error('Unexpected error:', error);
      throw error;
    }
  }
}

// Usage
const result = await AIErrorHandler.execute(
  async () => {
    const writer = await Writer.create();
    return await writer.write('Hello');
  },
  async () => {
    // Fallback to server
    return await fetch('/api/write').then(r => r.text());
  }
);
```

---

## Reusable API Instance

Create a service class for managing API instances.

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

---

## Combining APIs

Chain multiple AI APIs together for powerful workflows.

### Language Detection + Translation

```javascript
async function smartTranslate(text, targetLanguage = 'en') {
  // Detect language first
  const detector = await LanguageDetector.create();
  const detectionResults = await detector.detect(text);
  const sourceLanguage = detectionResults[0].detectedLanguage;
  detector.destroy();

  // Skip if already in target language
  if (sourceLanguage === targetLanguage) {
    return { text, alreadyInTargetLanguage: true };
  }

  // Translate
  const translator = await Translator.create({
    sourceLanguage,
    targetLanguage
  });

  const translated = await translator.translate(text);
  translator.destroy();

  return {
    text: translated,
    originalLanguage: sourceLanguage,
    alreadyInTargetLanguage: false
  };
}
```

### Proofreading + Rewriting

```javascript
async function improveText(text, targetTone = 'more-formal') {
  // First, proofread
  const proofreader = await Proofreader.create({
    expectedInputLanguages: ['en']
  });

  const proofread = await proofreader.proofread(text);
  proofreader.destroy();

  // Then rewrite with desired tone
  const rewriter = await Rewriter.create({
    tone: targetTone
  });

  const rewritten = await rewriter.rewrite(proofread.correction);
  rewriter.destroy();

  return {
    original: text,
    proofread: proofread.correction,
    final: rewritten,
    corrections: proofread.corrections
  };
}
```

### Generate + Summarize

```javascript
async function generateAndSummarize(prompt) {
  // Generate long content
  const writer = await Writer.create({
    length: 'long',
    format: 'markdown'
  });

  const longContent = await writer.write(prompt);
  writer.destroy();

  // Summarize it
  const summarizer = await Summarizer.create({
    type: 'tldr',
    length: 'short'
  });

  const summary = await summarizer.summarize(longContent);
  summarizer.destroy();

  return {
    fullContent: longContent,
    summary
  };
}
```

---

## Singleton Pattern

Ensure only one instance of an API exists.

```javascript
class WriterSingleton {
  static instance = null;
  static initPromise = null;

  static async getInstance() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      if (!this.instance) {
        this.instance = await Writer.create({
          tone: 'neutral',
          format: 'plain-text'
        });
      }
      return this.instance;
    })();

    return this.initPromise;
  }

  static destroy() {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
      this.initPromise = null;
    }
  }
}

// Usage anywhere in your app
const writer = await WriterSingleton.getInstance();
const result = await writer.write('Hello');
```

---

## Factory Pattern

Create API instances based on configuration.

```javascript
class AIFactory {
  static async createWriter(config = {}) {
    const defaultConfig = {
      tone: 'neutral',
      format: 'plain-text',
      length: 'medium'
    };

    return await Writer.create({ ...defaultConfig, ...config });
  }

  static async createRewriter(config = {}) {
    const defaultConfig = {
      tone: 'as-is',
      format: 'as-is',
      length: 'as-is'
    };

    return await Rewriter.create({ ...defaultConfig, ...config });
  }

  static async createSummarizer(config = {}) {
    const defaultConfig = {
      type: 'tldr',
      format: 'plain-text',
      length: 'medium'
    };

    return await Summarizer.create({ ...defaultConfig, ...config });
  }

  static async create(apiType, config = {}) {
    const creators = {
      writer: this.createWriter,
      rewriter: this.createRewriter,
      summarizer: this.createSummarizer
    };

    const creator = creators[apiType];
    if (!creator) {
      throw new Error(`Unknown API type: ${apiType}`);
    }

    return await creator.call(this, config);
  }
}

// Usage
const writer = await AIFactory.create('writer', { tone: 'formal' });
const rewriter = await AIFactory.create('rewriter', { tone: 'more-casual' });
```

---

## Debouncing for Real-time

Debounce API calls for real-time features like as-you-type.

```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

class RealTimeProofreader {
  constructor(textElement, resultsElement) {
    this.textElement = textElement;
    this.resultsElement = resultsElement;
    this.proofreader = null;

    this.check = debounce(this.check.bind(this), 500);
  }

  async init() {
    this.proofreader = await Proofreader.create({
      expectedInputLanguages: ['en']
    });

    this.textElement.addEventListener('input', () => {
      this.check();
    });
  }

  async check() {
    const text = this.textElement.value;

    if (!text || !this.proofreader) return;

    const result = await this.proofreader.proofread(text);
    this.displayResults(result.corrections);
  }

  displayResults(corrections) {
    this.resultsElement.innerHTML = '';
    corrections.forEach(c => {
      const item = document.createElement('div');
      item.textContent = `${c.original} → ${c.suggestion} (${c.explanation})`;
      this.resultsElement.appendChild(item);
    });
  }

  destroy() {
    this.proofreader?.destroy();
  }
}
```

---

## Batch Processing

Process multiple items efficiently.

```javascript
async function batchProcess(items, processor, batchSize = 5) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);

    // Progress update
    console.log(`Processed ${Math.min(i + batchSize, items.length)}/${items.length}`);
  }

  return results;
}

// Usage: Translate multiple texts
async function translateBatch(texts, fromLang, toLang) {
  const translator = await Translator.create({
    sourceLanguage: fromLang,
    targetLanguage: toLang
  });

  try {
    return await batchProcess(
      texts,
      (text) => translator.translate(text),
      10 // Process 10 at a time
    );
  } finally {
    translator.destroy();
  }
}
```

---

## Retry Logic

Retry failed operations with exponential backoff.

```javascript
async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error; // Last attempt failed
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const writer = await retryWithBackoff(async () => {
  return await Writer.create({ tone: 'formal' });
}, 3, 1000);
```

---

## Resource Pool

Manage multiple API instances efficiently.

```javascript
class APIPool {
  constructor(APIConstructor, options, poolSize = 3) {
    this.APIConstructor = APIConstructor;
    this.options = options;
    this.poolSize = poolSize;
    this.pool = [];
    this.busy = new Set();
  }

  async init() {
    for (let i = 0; i < this.poolSize; i++) {
      const instance = await this.APIConstructor.create(this.options);
      this.pool.push(instance);
    }
  }

  async acquire() {
    const available = this.pool.find(inst => !this.busy.has(inst));

    if (available) {
      this.busy.add(available);
      return available;
    }

    // Wait for an instance to become available
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const available = this.pool.find(inst => !this.busy.has(inst));
        if (available) {
          clearInterval(checkInterval);
          this.busy.add(available);
          resolve(available);
        }
      }, 100);
    });
  }

  release(instance) {
    this.busy.delete(instance);
  }

  async execute(operation) {
    const instance = await this.acquire();
    try {
      return await operation(instance);
    } finally {
      this.release(instance);
    }
  }

  destroyAll() {
    this.pool.forEach(inst => inst.destroy());
    this.pool = [];
    this.busy.clear();
  }
}

// Usage
const writerPool = new APIPool(Writer, { tone: 'formal' }, 3);
await writerPool.init();

const results = await Promise.all([
  writerPool.execute(w => w.write('Email 1')),
  writerPool.execute(w => w.write('Email 2')),
  writerPool.execute(w => w.write('Email 3')),
  writerPool.execute(w => w.write('Email 4'))
]);

writerPool.destroyAll();
```

---

## Related Resources

- [Best Practices](./best-practices.md)
- [System Requirements](./system-requirements.md)
- [API Documentation](../apis/)
