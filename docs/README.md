# Chrome Built-in AI APIs Documentation

Complete documentation for Chrome's Built-in AI APIs powered by Gemini Nano.

## 📚 Quick Start

Chrome Built-in AI APIs enable powerful on-device AI capabilities for web applications:
- ✅ **100% On-device** - Privacy-first, no data sent to servers
- ✅ **Offline-capable** - Works without internet after initial download
- ✅ **High-quality** - Powered by Gemini Nano
- ✅ **Free to use** - No API keys or usage limits

## 🎯 API Reference

### Content Generation & Transformation

| API | Description | Documentation |
|-----|-------------|---------------|
| **Writer API** | Generate new content with control over tone, format, and length | [📖 Docs](./apis/writer-api.md) |
| **Rewriter API** | Adjust tone and style of existing text | [📖 Docs](./apis/rewriter-api.md) |
| **Summarizer API** | Create summaries (key-points, tl;dr, teaser, headline) | [📖 Docs](./apis/summarizer-api.md) |

### Language Processing

| API | Description | Documentation |
|-----|-------------|---------------|
| **Translator API** | Translate between languages on-device | [📖 Docs](./apis/translator-api.md) |
| **Language Detector API** | Detect text language with confidence scores | [📖 Docs](./apis/language-detector-api.md) |
| **Proofreader API** | Real-time grammar, spelling, and punctuation checking | [📖 Docs](./apis/proofreader-api.md) |

### General Purpose

| API | Description | Documentation |
|-----|-------------|---------------|
| **Prompt API** | General-purpose language model with multimodal support | [📖 Docs](./apis/prompt-api.md) |

## 📖 Guides

| Guide | Description |
|-------|-------------|
| [System Requirements](./guides/system-requirements.md) | Hardware, software, and browser requirements |
| [Common Patterns](./guides/common-patterns.md) | Reusable code patterns and design patterns |
| [Best Practices](./guides/best-practices.md) | Production-ready recommendations and tips |

## 🚀 Quick Examples

### Generate Content

```javascript
const writer = await Writer.create({
  tone: 'professional',
  format: 'plain-text',
  length: 'medium'
});

const email = await writer.write(
  'An inquiry about opening a business account',
  { context: 'Email to bank manager' }
);

console.log(email);
writer.destroy();
```

### Translate Text

```javascript
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});

const translated = await translator.translate('Hello, world!');
console.log(translated); // "¡Hola, mundo!"

translator.destroy();
```

### Check Grammar

```javascript
const proofreader = await Proofreader.create({
  expectedInputLanguages: ['en']
});

const result = await proofreader.proofread(
  'I seen him yesterday at the store.'
);

console.log(result.correction);
// "I saw him yesterday at the store."

proofreader.destroy();
```

### Detect Language

```javascript
const detector = await LanguageDetector.create();
const results = await detector.detect('Bonjour le monde');

console.log(results[0]);
// { detectedLanguage: 'fr', confidence: 0.98 }

detector.destroy();
```

### Summarize Content

```javascript
const summarizer = await Summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'short'
});

const summary = await summarizer.summarize(longArticle);
console.log(summary);

summarizer.destroy();
```

## 💡 Use Cases

### Professional Communication
- **Email Drafting**: Generate professional emails with Writer API
- **Tone Adjustment**: Make messages more formal/casual with Rewriter API
- **Grammar Checking**: Real-time proofreading in Gmail, LinkedIn
- **Translation**: Multilingual business communication

### Content Creation
- **Blog Posts**: Generate and summarize content
- **Social Media**: Create platform-specific posts
- **Documentation**: Draft technical documentation
- **Marketing**: Create product descriptions and copy

### Developer Tools
- **Code Assistants**: Generate code examples
- **Documentation**: Summarize technical docs
- **Internationalization**: Translate UI strings
- **Content Moderation**: Analyze and categorize text

## 🔧 System Requirements

### Minimum Requirements
- **Chrome**: Version 137+ (varies by API)
- **Storage**: 22 GB free disk space
- **RAM**: 16 GB
- **GPU**: 4 GB VRAM
- **CPU**: 4+ cores
- **Platform**: Desktop only (Windows 10+, macOS 13+, Linux, ChromeOS)

📝 See [System Requirements](./guides/system-requirements.md) for details.

## 📦 Getting Started

### 1. Check Browser Support

```javascript
if ('Writer' in self) {
  console.log('Writer API supported');
}

const availability = await Writer.availability();
// Returns: 'unavailable', 'available', or 'after-download'
```

### 2. Register for Origin Trial

Most APIs require origin trial registration:
1. Visit [Chrome Origin Trials](https://developer.chrome.com/origintrials/)
2. Register your domain
3. Add trial token to your HTML:

```html
<meta http-equiv="origin-trial" content="YOUR_TOKEN_HERE">
```

### 3. Create and Use

```javascript
const writer = await Writer.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});

const result = await writer.write('Your prompt here');
console.log(result);

writer.destroy();
```

## 🎨 Common Patterns

### Progressive Enhancement

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

const status = await setupAI();
if (status.supported) {
  enableAIFeatures();
} else {
  useFallback();
}
```

### Combining APIs

```javascript
async function smartTranslate(text) {
  // Detect language
  const detector = await LanguageDetector.create();
  const results = await detector.detect(text);
  const sourceLang = results[0].detectedLanguage;
  detector.destroy();

  // Translate
  const translator = await Translator.create({
    sourceLanguage: sourceLang,
    targetLanguage: 'en'
  });

  const translated = await translator.translate(text);
  translator.destroy();

  return translated;
}
```

📖 See [Common Patterns](./guides/common-patterns.md) for more examples.

## ✅ Best Practices

### Performance
- ♻️ Reuse API instances for multiple operations
- 📊 Use streaming for long content
- ⏱️ Preload models during idle time
- 🎯 Batch operations when possible

### User Experience
- 📈 Show download progress
- 🔄 Provide fallback options
- ❌ Handle errors gracefully
- 🚫 Allow cancellation of long operations

### Resource Management
- 🗑️ Always destroy instances when done
- 📊 Monitor token usage
- ⏹️ Use abort signals
- ⚡ Limit concurrent operations

📖 See [Best Practices](./guides/best-practices.md) for details.

## 🌐 Official Resources

### Documentation
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Get Started Guide](https://developer.chrome.com/docs/ai/get-started)
- [Chrome AI Blog](https://developer.chrome.com/blog/ai)

### Demo Projects

**GoogleChromeLabs/web-ai-demos**
- [Main Repository](https://github.com/GoogleChromeLabs/web-ai-demos)
- [Writer/Rewriter Playground](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-api-playground)
- [Prompt API Playground](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/prompt-api-playground)
- [Summarization API Playground](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/summarization-api-playground)
- [Weather AI Demo](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/weather-ai)
- [Right Click for Superpowers](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/right-click-for-superpowers)
- [Product Review Suggestions](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/product-review-suggestions)
- [Performance Tips](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/perf-worker-gemma)

**Chrome Extension Samples**
- [API Samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)

### Community
- [Chrome AI Challenge 2025](https://googlechromeai2025.devpost.com/)
- [W3C WebML Working Group](https://www.w3.org/groups/wg/webmachinelearning/)

## 🗺️ Documentation Map

```
docs/
├── README.md (You are here)
├── apis/
│   ├── writer-api.md
│   ├── rewriter-api.md
│   ├── proofreader-api.md
│   ├── translator-api.md
│   ├── language-detector-api.md
│   ├── summarizer-api.md
│   └── prompt-api.md
└── guides/
    ├── system-requirements.md
    ├── common-patterns.md
    └── best-practices.md
```

## 🆘 Support

### Getting Help
- 📖 Check the [API documentation](./apis/)
- 💡 Review [Common Patterns](./guides/common-patterns.md)
- ✅ Follow [Best Practices](./guides/best-practices.md)
- 🐛 Report issues on [GitHub](https://github.com/GoogleChromeLabs/web-ai-demos/issues)

### Troubleshooting
- Verify [System Requirements](./guides/system-requirements.md)
- Check Chrome version compatibility
- Ensure sufficient disk space (22+ GB)
- Verify origin trial token is valid

## 📄 License

This documentation is provided as a reference guide for Chrome Built-in AI APIs. All APIs are subject to Chrome's terms of service and Google's Generative AI Prohibited Uses Policy.

---

**Last Updated**: January 2025
**API Versions**: Chrome 137-145+

## ⭐ Quick Links

| Resource | Link |
|----------|------|
| 🏠 Main Documentation | You are here |
| 🔧 System Requirements | [View](./guides/system-requirements.md) |
| 📚 API Reference | [Browse](./apis/) |
| 💡 Patterns & Examples | [View](./guides/common-patterns.md) |
| ✅ Best Practices | [View](./guides/best-practices.md) |
| 🌐 Official Chrome Docs | [Visit](https://developer.chrome.com/docs/ai/built-in) |
| 🎮 Demo Projects | [Explore](https://github.com/GoogleChromeLabs/web-ai-demos) |
