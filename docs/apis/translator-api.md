# Translator API

Translate text between languages on-device using Chrome's built-in AI.

## Overview

The Translator API provides high-quality translation entirely on-device, protecting user privacy while enabling multilingual communication. Uses expert models trained specifically for translation.

## Feature Detection

```javascript
if ('Translator' in self) {
  // Translator API is supported
}
```

## Check Language Pair Availability

```javascript
const translatorCapabilities = await Translator.availability({
  sourceLanguage: 'es',
  targetLanguage: 'fr'
});
// Returns: 'unavailable', 'available', or 'after-download'
```

## Create Translator

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

### Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `sourceLanguage` | string | Yes | Source language (BCP 47 code) |
| `targetLanguage` | string | Yes | Target language (BCP 47 code) |
| `monitor` | function | No | Callback to monitor model download |

## Translation Methods

### Standard Translation

Best for short to medium-length text.

```javascript
const translated = await translator.translate(
  'Where is the next bus stop, please?'
);
console.log(translated);
// "¿Dónde está la próxima parada de autobús, por favor?"
```

### Streaming Translation

Best for longer text to show progressive results.

```javascript
const stream = translator.translateStreaming(longText);

for await (const chunk of stream) {
  outputElement.append(chunk);
}
```

## Common Language Codes (BCP 47)

| Language | Code | Language | Code |
|----------|------|----------|------|
| English | `en` | Spanish | `es` |
| French | `fr` | German | `de` |
| Italian | `it` | Portuguese | `pt` |
| Japanese | `ja` | Korean | `ko` |
| Chinese (Simplified) | `zh` | Chinese (Traditional) | `zh-Hant` |
| Arabic | `ar` | Hindi | `hi` |
| Russian | `ru` | Dutch | `nl` |

[Full BCP 47 language code list](https://www.rfc-editor.org/info/bcp47)

## Complete Example

```javascript
async function translateText(text, from, to) {
  // Check if language pair is available
  const canTranslate = await Translator.availability({
    sourceLanguage: from,
    targetLanguage: to
  });

  if (canTranslate === 'unavailable') {
    throw new Error(`Translation from ${from} to ${to} not available`);
  }

  // Create translator with progress monitoring
  const translator = await Translator.create({
    sourceLanguage: from,
    targetLanguage: to,
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(`Downloading model: ${Math.round(e.loaded * 100)}%`);
      });
    }
  });

  try {
    // Translate
    const result = await translator.translate(text);
    return result;
  } finally {
    // Clean up
    translator.destroy();
  }
}

// Usage
const translation = await translateText(
  'Hello, world!',
  'en',
  'es'
);
console.log(translation); // "¡Hola, mundo!"
```

## Use Cases

### 1. Customer Support Chat

```javascript
async function setupBilingualChat() {
  // Customer writes in Spanish, support reads in English
  const toEnglish = await Translator.create({
    sourceLanguage: 'es',
    targetLanguage: 'en'
  });

  // Support writes in English, customer reads in Spanish
  const toSpanish = await Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'es'
  });

  return { toEnglish, toSpanish };
}

const translators = await setupBilingualChat();

// Customer message
const customerMsg = 'Necesito ayuda con mi pedido';
const forSupport = await translators.toEnglish.translate(customerMsg);
// "I need help with my order"

// Support response
const supportMsg = 'I can help you with that';
const forCustomer = await translators.toSpanish.translate(supportMsg);
// "Puedo ayudarte con eso"
```

### 2. Content Localization

```javascript
async function translatePage(content, targetLang) {
  const translator = await Translator.create({
    sourceLanguage: 'en',
    targetLanguage: targetLang
  });

  try {
    const translations = {};

    // Translate page elements
    translations.title = await translator.translate(content.title);
    translations.description = await translator.translate(content.description);

    // Translate array of items
    translations.menuItems = await Promise.all(
      content.menuItems.map(item => translator.translate(item))
    );

    return translations;
  } finally {
    translator.destroy();
  }
}
```

### 3. Email Translation

```javascript
async function translateEmail(email, targetLanguage) {
  const translator = await Translator.create({
    sourceLanguage: 'auto', // Detect automatically
    targetLanguage: targetLanguage
  });

  try {
    const stream = translator.translateStreaming(email.body);
    let translatedBody = '';

    for await (const chunk of stream) {
      translatedBody += chunk;
      updatePreview(translatedBody); // Show progress
    }

    return {
      subject: await translator.translate(email.subject),
      body: translatedBody
    };
  } finally {
    translator.destroy();
  }
}
```

### 4. Document Translation

```javascript
async function translateDocument(paragraphs, fromLang, toLang) {
  const translator = await Translator.create({
    sourceLanguage: fromLang,
    targetLanguage: toLang
  });

  try {
    const translated = [];

    for (const paragraph of paragraphs) {
      const result = await translator.translate(paragraph);
      translated.push(result);

      // Show progress
      updateProgress((translated.length / paragraphs.length) * 100);
    }

    return translated;
  } finally {
    translator.destroy();
  }
}
```

## Combine with Language Detector

```javascript
async function smartTranslate(text, targetLanguage = 'en') {
  // Detect source language first
  const detector = await LanguageDetector.create();
  const detectionResults = await detector.detect(text);
  const sourceLanguage = detectionResults[0].detectedLanguage;
  detector.destroy();

  // Check if already in target language
  if (sourceLanguage === targetLanguage) {
    return { text, alreadyInTargetLanguage: true };
  }

  // Translate
  const translator = await Translator.create({
    sourceLanguage,
    targetLanguage
  });

  try {
    const translated = await translator.translate(text);
    return {
      text: translated,
      detectedLanguage: sourceLanguage,
      alreadyInTargetLanguage: false
    };
  } finally {
    translator.destroy();
  }
}

// Usage
const result = await smartTranslate('Bonjour le monde');
console.log(result);
// { text: "Hello world", detectedLanguage: "fr", alreadyInTargetLanguage: false }
```

## Batch Translation

```javascript
async function translateBatch(texts, fromLang, toLang) {
  const translator = await Translator.create({
    sourceLanguage: fromLang,
    targetLanguage: toLang
  });

  try {
    // Translate all texts
    const results = await Promise.all(
      texts.map(text => translator.translate(text))
    );
    return results;
  } finally {
    translator.destroy();
  }
}

// Usage
const phrases = [
  'Good morning',
  'How are you?',
  'Thank you',
  'Goodbye'
];

const spanish = await translateBatch(phrases, 'en', 'es');
// ["Buenos días", "¿Cómo estás?", "Gracias", "Adiós"]
```

## Progressive Translation UI

```javascript
class TranslationUI {
  constructor(sourceElement, targetElement) {
    this.source = sourceElement;
    this.target = targetElement;
    this.translator = null;
  }

  async init(fromLang, toLang) {
    this.translator = await Translator.create({
      sourceLanguage: fromLang,
      targetLanguage: toLang,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          this.showProgress(e.loaded * 100);
        });
      }
    });
  }

  async translateLive() {
    const text = this.source.value;

    if (!text) {
      this.target.value = '';
      return;
    }

    this.target.value = '';
    const stream = this.translator.translateStreaming(text);

    for await (const chunk of stream) {
      this.target.value += chunk;
    }
  }

  showProgress(percent) {
    console.log(`Model download: ${percent}%`);
  }

  destroy() {
    this.translator?.destroy();
  }
}

// Usage
const ui = new TranslationUI(
  document.getElementById('source'),
  document.getElementById('target')
);

await ui.init('en', 'fr');

document.getElementById('source').addEventListener('input',
  debounce(() => ui.translateLive(), 500)
);
```

## Abort Translation

```javascript
const controller = new AbortController();
cancelButton.onclick = () => controller.abort();

const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'es',
  signal: controller.signal
});

try {
  const result = await translator.translate(text, {
    signal: controller.signal
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Translation cancelled');
  }
}
```

## Best Practices

1. **Check availability first**: Verify language pair is supported
2. **Reuse translator**: Create once, translate many times
3. **Use streaming for long text**: Better UX with progressive results
4. **Chunk large documents**: Break into manageable pieces
5. **Show download progress**: Inform users about model downloads
6. **Cache translations**: Avoid re-translating identical text
7. **Always destroy**: Clean up resources when done
8. **Handle errors gracefully**: Provide fallbacks

## Performance Tips

```javascript
// Good: Reuse translator
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});

for (const text of texts) {
  await translator.translate(text);
}

translator.destroy();

// Bad: Create new instance each time
for (const text of texts) {
  const t = await Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'es'
  });
  await t.translate(text);
  t.destroy();
}
```

## Error Handling

```javascript
async function safeTranslate(text, from, to) {
  let translator;

  try {
    // Check availability
    const availability = await Translator.availability({
      sourceLanguage: from,
      targetLanguage: to
    });

    if (availability === 'unavailable') {
      throw new Error(`${from} to ${to} translation unavailable`);
    }

    // Create translator
    translator = await Translator.create({
      sourceLanguage: from,
      targetLanguage: to
    });

    // Translate
    return await translator.translate(text);
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Return original as fallback
  } finally {
    translator?.destroy();
  }
}
```

## Browser Support

- **Chrome**: 138+
- **Desktop only**: Not available on mobile
- **Web Workers**: Not supported
- **Origin Trial**: May be required

## Limitations

- Translations processed sequentially (one at a time per instance)
- Model must be downloaded for each language pair
- Not available in Web Workers
- Desktop only (no mobile support)
- Requires user activation for download

## Destroy Translator

```javascript
// Always clean up resources
translator.destroy();
```

## Related APIs

- [Language Detector API](./language-detector-api.md) - Detect text language
- [Rewriter API](./rewriter-api.md) - Adjust tone and style
- [Writer API](./writer-api.md) - Generate content

## Resources

- [Official Documentation](https://developer.chrome.com/docs/ai/translator-api)
- [Translation API Blog Post](https://developer.chrome.com/blog/translation-api-available-for-early-preview)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [BCP 47 Language Codes](https://www.rfc-editor.org/info/bcp47)
