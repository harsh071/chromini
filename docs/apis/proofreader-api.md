# Proofreader API

Real-time grammar, spelling, and punctuation checking using Chrome's built-in AI.

## Overview

The Proofreader API provides interactive proofreading for web applications, offering grammar correction, spelling fixes, and punctuation improvements with detailed explanations.

## Feature Detection

```javascript
if ('Proofreader' in self) {
  // Proofreader API is supported
}
```

## Check Availability

```javascript
const available = Proofreader.availability('downloadable') === true;
```

## Create Proofreader

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

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `expectedInputLanguages` | string[] | Array of BCP 47 language codes (e.g., `['en', 'es']`) |
| `monitor` | function | Callback to monitor model download progress |

## Proofread Text

```javascript
const proofreadResult = await proofreader.proofread(
  'I seen him yesterday at the store, and he bought two loafs of bread.'
);

// Get the corrected text
console.log(proofreadResult.correction);
// "I saw him yesterday at the store, and he bought two loaves of bread."

// Get detailed corrections
for (const correction of proofreadResult.corrections) {
  console.log('Error type:', correction.type);
  console.log('Original:', correction.original);
  console.log('Suggestion:', correction.suggestion);
  console.log('Explanation:', correction.explanation);
  console.log('Position:', correction.offset, correction.length);
}
```

## Result Object Structure

### ProofreadResult

```javascript
{
  correction: "Fully corrected text",
  corrections: [
    {
      type: "grammar",           // Error category
      original: "seen",          // Original text
      suggestion: "saw",         // Suggested correction
      explanation: "Verb tense", // Why this is an error
      offset: 2,                 // Position in text (character index)
      length: 4                  // Length of error
    },
    // ... more corrections
  ]
}
```

### Correction Types

Common error types returned:
- `grammar` - Grammatical errors
- `spelling` - Misspelled words
- `punctuation` - Punctuation issues
- `capitalization` - Capitalization problems
- `word-choice` - Better word suggestions

## Complete Example

```javascript
async function setupProofreader() {
  // Check availability
  const available = Proofreader.availability('downloadable') === true;

  if (!available) {
    console.error('Proofreader API not available');
    return null;
  }

  // Create proofreader with progress
  const proofreader = await Proofreader.create({
    expectedInputLanguages: ['en'],
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        updateProgressBar(e.loaded * 100);
      });
    }
  });

  return proofreader;
}

async function checkText(text) {
  const proofreader = await setupProofreader();

  if (!proofreader) {
    return { error: 'Proofreader unavailable' };
  }

  try {
    const result = await proofreader.proofread(text);
    return result;
  } finally {
    proofreader.destroy();
  }
}

// Usage
const result = await checkText(
  'Their going to the store, and there going to buy some milk.'
);

console.log('Corrected:', result.correction);
// "They're going to the store, and they're going to buy some milk."

result.corrections.forEach(c => {
  console.log(`${c.original} → ${c.suggestion} (${c.explanation})`);
});
```

## Real-time Proofreading

### As-You-Type Checking

```javascript
let proofreader;
let debounceTimer;

async function initProofreader() {
  proofreader = await Proofreader.create({
    expectedInputLanguages: ['en']
  });
}

textarea.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const result = await proofreader.proofread(textarea.value);
    displayCorrections(result.corrections);
  }, 500); // Debounce for 500ms
});

function displayCorrections(corrections) {
  // Clear previous highlights
  clearHighlights();

  // Highlight each error
  corrections.forEach(correction => {
    highlightError(
      correction.offset,
      correction.length,
      correction.type,
      correction.suggestion,
      correction.explanation
    );
  });
}
```

### Show Inline Suggestions

```javascript
function showCorrections(text, corrections) {
  const container = document.getElementById('editor');
  container.innerHTML = '';

  let currentPos = 0;

  corrections.forEach(correction => {
    // Add text before error
    if (correction.offset > currentPos) {
      const beforeText = text.substring(currentPos, correction.offset);
      container.appendChild(document.createTextNode(beforeText));
    }

    // Add error with tooltip
    const errorSpan = document.createElement('span');
    errorSpan.className = `error error-${correction.type}`;
    errorSpan.textContent = text.substr(correction.offset, correction.length);
    errorSpan.title = `${correction.explanation}\nSuggestion: ${correction.suggestion}`;
    errorSpan.onclick = () => applySuggestion(correction);
    container.appendChild(errorSpan);

    currentPos = correction.offset + correction.length;
  });

  // Add remaining text
  if (currentPos < text.length) {
    container.appendChild(document.createTextNode(text.substring(currentPos)));
  }
}
```

## Use Cases

1. **Email Composition**: Real-time checking in Gmail, Outlook
2. **LinkedIn Posts**: Professional writing assistance
3. **Blog Editors**: Content quality improvement
4. **Form Validation**: Ensure quality user input
5. **Chat Applications**: Help users write clearly
6. **Note-taking Apps**: Improve note quality
7. **CMS Platforms**: Content editor enhancement

## Multi-language Support

```javascript
const proofreader = await Proofreader.create({
  expectedInputLanguages: ['en', 'es', 'fr']
});

// Automatically detects and proofreads in any of the specified languages
const result = await proofreader.proofread('Hola, como estas?');
```

## Batch Proofreading

```javascript
async function proofreadMultiple(texts) {
  const proofreader = await Proofreader.create({
    expectedInputLanguages: ['en']
  });

  try {
    const results = await Promise.all(
      texts.map(text => proofreader.proofread(text))
    );
    return results;
  } finally {
    proofreader.destroy();
  }
}

// Usage
const texts = [
  'I seen the movie yesterday.',
  'He dont like pizza.',
  'She have three cats.'
];

const results = await proofreadMultiple(texts);
results.forEach((result, i) => {
  console.log(`Original: ${texts[i]}`);
  console.log(`Corrected: ${result.correction}\n`);
});
```

## Error Statistics

```javascript
function analyzeErrors(corrections) {
  const stats = {
    total: corrections.length,
    byType: {}
  };

  corrections.forEach(correction => {
    const type = correction.type;
    stats.byType[type] = (stats.byType[type] || 0) + 1;
  });

  return stats;
}

const result = await proofreader.proofread(text);
const stats = analyzeErrors(result.corrections);

console.log(`Total errors: ${stats.total}`);
console.log('Errors by type:', stats.byType);
// { grammar: 3, spelling: 2, punctuation: 1 }
```

## Apply Corrections Automatically

```javascript
function applyAllCorrections(text, corrections) {
  // Sort corrections by position (reverse order to maintain indices)
  const sorted = [...corrections].sort((a, b) => b.offset - a.offset);

  let corrected = text;

  sorted.forEach(correction => {
    const before = corrected.substring(0, correction.offset);
    const after = corrected.substring(correction.offset + correction.length);
    corrected = before + correction.suggestion + after;
  });

  return corrected;
}

const result = await proofreader.proofread(text);
const correctedText = applyAllCorrections(text, result.corrections);
// Or simply use: result.correction
```

## Best Practices

1. **Debounce input**: Don't check on every keystroke
2. **Reuse instance**: Create once, use many times
3. **Show explanations**: Help users learn from mistakes
4. **Allow dismissal**: Let users ignore suggestions
5. **Cache results**: Avoid re-checking identical text
6. **Provide UI feedback**: Show what's being checked
7. **Always destroy**: Clean up when done

## Performance Tips

```javascript
// Good: Reuse proofreader
const proofreader = await Proofreader.create({ expectedInputLanguages: ['en'] });
await proofreader.proofread(text1);
await proofreader.proofread(text2);
proofreader.destroy();

// Bad: Create new instance each time
const p1 = await Proofreader.create({ expectedInputLanguages: ['en'] });
await p1.proofread(text1);
p1.destroy();

const p2 = await Proofreader.create({ expectedInputLanguages: ['en'] });
await p2.proofread(text2);
p2.destroy();
```

## Browser Support

- **Chrome**: 141-145+
- **Origin Trial**: Required
- **Mobile**: Not supported
- **Web Workers**: Not supported

## Limitations

- Not available on mobile devices
- Requires user activation for download
- Cross-origin iframes need permission
- Language detection is automatic (cannot force specific language)

## Destroy Proofreader

```javascript
// Always clean up resources
proofreader.destroy();
```

## Related APIs

- [Rewriter API](./rewriter-api.md) - Adjust tone and style
- [Language Detector API](./language-detector-api.md) - Detect text language
- [Translator API](./translator-api.md) - Translate text

## Resources

- [Official Documentation](https://developer.chrome.com/docs/ai/proofreader-api)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Web AI Demos](https://github.com/GoogleChromeLabs/web-ai-demos)
