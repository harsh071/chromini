# Language Detector API

Detect the language of text on-device using Chrome's built-in AI.

## Overview

The Language Detector API identifies the language of text entirely on-device, protecting user privacy. Returns ranked language candidates with confidence scores.

## Feature Detection

```javascript
if ('LanguageDetector' in self) {
  // Language Detector API is supported
}
```

## Check Availability

```javascript
const availability = await LanguageDetector.availability();
// Returns: 'unavailable', 'available', or 'after-download'
```

## Create Language Detector

```javascript
const detector = await LanguageDetector.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

## Detect Language

```javascript
const text = 'Hallo und herzlich willkommen!';
const results = await detector.detect(text);

for (const result of results) {
  console.log(`Language: ${result.detectedLanguage}`);
  console.log(`Confidence: ${result.confidence}`);
}

// Output:
// Language: de
// Confidence: 0.95
// Language: nl
// Confidence: 0.03
```

## Result Object Structure

```javascript
[
  {
    detectedLanguage: 'de',  // BCP 47 language code
    confidence: 0.95         // 0.0 to 1.0 (0% to 100%)
  },
  {
    detectedLanguage: 'nl',
    confidence: 0.03
  },
  // ... more language candidates (sorted by confidence)
]
```

### Language Codes

Results use [BCP 47](https://www.rfc-editor.org/info/bcp47) language codes:
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `ja` - Japanese
- `zh` - Chinese
- etc.

## Complete Example

```javascript
async function detectTextLanguage(text) {
  // Check availability
  const availability = await LanguageDetector.availability();

  if (availability === 'unavailable') {
    throw new Error('Language Detector API not available');
  }

  // Create detector
  const detector = await LanguageDetector.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(`Downloading model: ${Math.round(e.loaded * 100)}%`);
      });
    }
  });

  try {
    // Detect language
    const results = await detector.detect(text);
    const topResult = results[0];

    return {
      language: topResult.detectedLanguage,
      confidence: topResult.confidence,
      allCandidates: results
    };
  } finally {
    // Clean up
    detector.destroy();
  }
}

// Usage
const result = await detectTextLanguage('Bonjour le monde');
console.log(result);
// {
//   language: 'fr',
//   confidence: 0.98,
//   allCandidates: [...]
// }
```

## Use Cases

### 1. Auto-Select Translation Language

```javascript
async function autoTranslate(text, targetLang = 'en') {
  // Detect source language
  const detector = await LanguageDetector.create();
  const results = await detector.detect(text);
  const sourceLang = results[0].detectedLanguage;
  detector.destroy();

  // Skip if already in target language
  if (sourceLang === targetLang) {
    return { translated: text, noTranslationNeeded: true };
  }

  // Translate
  const translator = await Translator.create({
    sourceLanguage: sourceLang,
    targetLanguage: targetLang
  });

  try {
    const translated = await translator.translate(text);
    return {
      translated,
      sourceLang,
      targetLang,
      noTranslationNeeded: false
    };
  } finally {
    translator.destroy();
  }
}
```

### 2. Content Routing

```javascript
async function routeToProperSupport(message) {
  const detector = await LanguageDetector.create();

  try {
    const results = await detector.detect(message);
    const language = results[0].detectedLanguage;

    // Route to language-specific support team
    switch (language) {
      case 'es':
        return { team: 'spanish-support', language };
      case 'fr':
        return { team: 'french-support', language };
      case 'de':
        return { team: 'german-support', language };
      default:
        return { team: 'english-support', language };
    }
  } finally {
    detector.destroy();
  }
}
```

### 3. Multi-language Content Detection

```javascript
async function categorizeContent(texts) {
  const detector = await LanguageDetector.create();

  try {
    const categorized = {
      en: [],
      es: [],
      fr: [],
      other: []
    };

    for (const text of texts) {
      const results = await detector.detect(text);
      const lang = results[0].detectedLanguage;

      if (categorized[lang]) {
        categorized[lang].push(text);
      } else {
        categorized.other.push({ text, lang });
      }
    }

    return categorized;
  } finally {
    detector.destroy();
  }
}
```

### 4. Confidence Threshold Validation

```javascript
const CONFIDENCE_THRESHOLD = 0.7;

async function detectWithValidation(text) {
  const detector = await LanguageDetector.create();

  try {
    const results = await detector.detect(text);
    const topResult = results[0];

    if (topResult.confidence >= CONFIDENCE_THRESHOLD) {
      return {
        language: topResult.detectedLanguage,
        confidence: topResult.confidence,
        reliable: true
      };
    } else {
      return {
        language: topResult.detectedLanguage,
        confidence: topResult.confidence,
        reliable: false,
        message: 'Language detection uncertain'
      };
    }
  } finally {
    detector.destroy();
  }
}
```

### 5. Language Switcher UI

```javascript
async function setupLanguageSwitcher(textElement, selectElement) {
  const detector = await LanguageDetector.create();

  textElement.addEventListener('input', async () => {
    const text = textElement.value;

    if (text.length < 10) {
      // Too short for reliable detection
      return;
    }

    const results = await detector.detect(text);
    const topResult = results[0];

    if (topResult.confidence > 0.8) {
      // Update UI to show detected language
      selectElement.value = topResult.detectedLanguage;
      showConfidenceBadge(topResult.confidence);
    }
  });

  // Clean up when page unloads
  window.addEventListener('beforeunload', () => {
    detector.destroy();
  });
}
```

## Batch Detection

```javascript
async function detectMultipleTexts(texts) {
  const detector = await LanguageDetector.create();

  try {
    const results = await Promise.all(
      texts.map(text => detector.detect(text))
    );

    return results.map((result, index) => ({
      text: texts[index],
      language: result[0].detectedLanguage,
      confidence: result[0].confidence
    }));
  } finally {
    detector.destroy();
  }
}

// Usage
const texts = [
  'Hello world',
  'Bonjour le monde',
  'Hola mundo'
];

const detections = await detectMultipleTexts(texts);
// [
//   { text: 'Hello world', language: 'en', confidence: 0.99 },
//   { text: 'Bonjour le monde', language: 'fr', confidence: 0.97 },
//   { text: 'Hola mundo', language: 'es', confidence: 0.98 }
// ]
```

## Get All Candidates

```javascript
async function getAllLanguageCandidates(text) {
  const detector = await LanguageDetector.create();

  try {
    const results = await detector.detect(text);

    // Show all detected languages with confidence > 1%
    const significant = results.filter(r => r.confidence > 0.01);

    return significant.map(r => ({
      language: r.detectedLanguage,
      confidence: `${Math.round(r.confidence * 100)}%`
    }));
  } finally {
    detector.destroy();
  }
}

const candidates = await getAllLanguageCandidates('Some text');
// [
//   { language: 'en', confidence: '95%' },
//   { language: 'nl', confidence: '3%' },
//   { language: 'af', confidence: '2%' }
// ]
```

## Handling Short Text

```javascript
async function detectWithLengthCheck(text, minLength = 20) {
  if (text.length < minLength) {
    return {
      error: 'Text too short for reliable detection',
      language: null,
      confidence: 0
    };
  }

  const detector = await LanguageDetector.create();

  try {
    const results = await detector.detect(text);
    return {
      language: results[0].detectedLanguage,
      confidence: results[0].confidence,
      error: null
    };
  } finally {
    detector.destroy();
  }
}
```

## Language Name Mapping

```javascript
const languageNames = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  ru: 'Russian',
  nl: 'Dutch'
  // Add more as needed
};

async function detectLanguageWithName(text) {
  const detector = await LanguageDetector.create();

  try {
    const results = await detector.detect(text);
    const code = results[0].detectedLanguage;

    return {
      code,
      name: languageNames[code] || code,
      confidence: results[0].confidence
    };
  } finally {
    detector.destroy();
  }
}

const result = await detectLanguageWithName('Ciao mondo');
// { code: 'it', name: 'Italian', confidence: 0.96 }
```

## Best Practices

1. **Set confidence thresholds**: Don't trust low confidence results
2. **Handle short text carefully**: Detection is less accurate with short phrases
3. **Reuse detector instance**: Create once, detect many times
4. **Consider context**: Some words are valid in multiple languages
5. **Show confidence to users**: Let them know detection reliability
6. **Always destroy**: Clean up resources when done
7. **Minimum text length**: Recommend at least 10-20 characters

## Limitations

- **Not trained on all languages**: Some languages may not be detected
- **Low accuracy with short text**: Single words or short phrases are unreliable
- **Ambiguous words**: Words valid in multiple languages may confuse the detector
- **Mixed language text**: Text containing multiple languages returns dominant language

## Error Handling

```javascript
async function safeDetect(text) {
  let detector;

  try {
    const availability = await LanguageDetector.availability();

    if (availability === 'unavailable') {
      throw new Error('Language Detector not available');
    }

    detector = await LanguageDetector.create();
    const results = await detector.detect(text);

    return {
      success: true,
      language: results[0].detectedLanguage,
      confidence: results[0].confidence
    };
  } catch (error) {
    console.error('Language detection failed:', error);
    return {
      success: false,
      language: null,
      confidence: 0,
      error: error.message
    };
  } finally {
    detector?.destroy();
  }
}
```

## Browser Support

- **Chrome**: 138+
- **Desktop only**: Not available on mobile
- **Web Workers**: Not supported
- **Origin Trial**: May be required

## Destroy Detector

```javascript
// Always clean up resources
detector.destroy();
```

## Related APIs

- [Translator API](./translator-api.md) - Translate between languages
- [Rewriter API](./rewriter-api.md) - Adjust tone and style
- [Proofreader API](./proofreader-api.md) - Grammar checking

## Resources

- [Official Documentation](https://developer.chrome.com/docs/ai/language-detection)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [BCP 47 Language Codes](https://www.rfc-editor.org/info/bcp47)
- [Web AI Demos](https://github.com/GoogleChromeLabs/web-ai-demos)
