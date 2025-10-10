# Best Practices

Recommended practices for using Chrome Built-in AI APIs in production applications.

## Table of Contents

- [Performance](#performance)
- [User Experience](#user-experience)
- [Privacy and Security](#privacy-and-security)
- [Resource Management](#resource-management)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Production Deployment](#production-deployment)

---

## Performance

### 1. Reuse API Instances

Create once, use multiple times to avoid initialization overhead.

```javascript
// ✅ Good: Reuse instance
const writer = await Writer.create();
await writer.write(text1);
await writer.write(text2);
await writer.write(text3);
writer.destroy();

// ❌ Bad: Create new instance each time
const writer1 = await Writer.create();
await writer1.write(text1);
writer1.destroy();

const writer2 = await Writer.create();
await writer2.write(text2);
writer2.destroy();
```

### 2. Use Streaming for Long Content

Improves perceived performance by showing progressive results.

```javascript
// ✅ Good: Streaming for long content
const stream = writer.writeStreaming(longPrompt);
for await (const chunk of stream) {
  displayElement.append(chunk); // User sees progress
}

// ❌ Bad: Wait for complete result
const result = await writer.write(longPrompt);
displayElement.textContent = result; // User waits
```

### 3. Preload Models During Idle Time

Download models proactively to reduce first-use latency.

```javascript
// ✅ Good: Preload during idle time
if ('requestIdleCallback' in window) {
  requestIdleCallback(async () => {
    await Writer.create(); // Trigger download
    // Don't need to keep the instance
  });
}

// Or on page load for critical features
window.addEventListener('load', async () => {
  if (await Writer.availability() === 'after-download') {
    await Writer.create(); // Preload
  }
});
```

### 4. Batch Operations

Process multiple items with a single API instance.

```javascript
// ✅ Good: Batch with single instance
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});

const translations = await Promise.all(
  texts.map(text => translator.translate(text))
);

translator.destroy();

// ❌ Bad: Create instance for each item
for (const text of texts) {
  const t = await Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'es'
  });
  await t.translate(text);
  t.destroy();
}
```

### 5. Debounce Frequent Operations

Avoid overwhelming the API with rapid calls.

```javascript
// ✅ Good: Debounced checking
let debounceTimer;
textInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    await checkGrammar(textInput.value);
  }, 500);
});

// ❌ Bad: Check on every keystroke
textInput.addEventListener('input', async () => {
  await checkGrammar(textInput.value); // Too frequent
});
```

---

## User Experience

### 1. Show Download Progress

Always inform users about model downloads.

```javascript
// ✅ Good: Show progress
const writer = await Writer.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      const percent = Math.round(e.loaded * 100);
      progressBar.style.width = `${percent}%`;
      statusText.textContent = `Downloading AI model: ${percent}%`;
    });
  }
});

// ❌ Bad: No feedback
const writer = await Writer.create();
// User has no idea what's happening
```

### 2. Provide Fallbacks

Don't rely solely on AI APIs.

```javascript
// ✅ Good: Graceful degradation
async function generateText(prompt) {
  if (!('Writer' in self)) {
    // Fallback to server-side or manual input
    return await fetchFromServer('/api/generate', { prompt });
  }

  try {
    const writer = await Writer.create();
    return await writer.write(prompt);
  } catch (error) {
    // Fallback on error
    return await fetchFromServer('/api/generate', { prompt });
  }
}

// ❌ Bad: No fallback
const writer = await Writer.create();
const result = await writer.write(prompt);
// Fails completely if API unavailable
```

### 3. Handle Errors Gracefully

Provide clear error messages to users.

```javascript
// ✅ Good: User-friendly error handling
try {
  const result = await writer.write(prompt);
  showSuccess(result);
} catch (error) {
  if (error.message.includes('quota')) {
    showError('AI quota exceeded. Please try again later.');
  } else if (error.message.includes('unavailable')) {
    showError('AI feature not available on your device.');
  } else {
    showError('Something went wrong. Please try again.');
  }
  logError(error); // Still log for debugging
}

// ❌ Bad: Generic or no error handling
const result = await writer.write(prompt); // May crash
```

### 4. Provide Cancel/Abort Options

Let users stop long-running operations.

```javascript
// ✅ Good: Cancellable operation
const controller = new AbortController();
cancelButton.onclick = () => controller.abort();

try {
  const result = await writer.write(prompt, {
    signal: controller.signal
  });
} catch (error) {
  if (error.name === 'AbortError') {
    showMessage('Operation cancelled');
  }
}

// ❌ Bad: No way to cancel
const result = await writer.write(prompt);
// User forced to wait
```

### 5. Progressive Enhancement

Enable features based on capability.

```javascript
// ✅ Good: Progressive enhancement
async function setupFeatures() {
  const capabilities = await checkAICapabilities();

  if (capabilities.writer) {
    enableAIWriting();
  } else {
    enableManualWriting();
  }

  if (capabilities.translator) {
    enableTranslation();
  }
}

// ❌ Bad: Assume availability
enableAIWriting(); // May not work
```

---

## Privacy and Security

### 1. Keep Data On-Device

All processing happens locally—no data sent to servers.

```javascript
// ✅ Good: On-device processing
const result = await writer.write(sensitiveData);
// Data never leaves the device

// ❌ Bad: Sending sensitive data to server
const result = await fetch('/api/process', {
  body: JSON.stringify({ data: sensitiveData })
});
```

### 2. Clear Sensitive Data

Destroy sessions containing sensitive information.

```javascript
// ✅ Good: Clean up after sensitive operations
const session = await ai.languageModel.create();
const result = await session.prompt(sensitivePrompt);
session.destroy(); // Clear from memory

// ❌ Bad: Keep session with sensitive data
const session = await ai.languageModel.create();
await session.prompt(sensitivePrompt);
// Session kept in memory
```

### 3. Respect User Consent

Ask before downloading large models.

```javascript
// ✅ Good: Ask for consent
async function initAI() {
  const availability = await Writer.availability();

  if (availability === 'after-download') {
    const consent = await showConsentDialog(
      'Download 5GB AI model for offline writing assistance?'
    );

    if (!consent) return null;
  }

  return await Writer.create();
}

// ❌ Bad: Download without asking
const writer = await Writer.create();
// Downloads multi-GB model without warning
```

### 4. Don't Store API Instances Globally

Avoid exposing API instances in global scope.

```javascript
// ✅ Good: Encapsulated
class AIService {
  #writer = null;

  async init() {
    this.#writer = await Writer.create();
  }

  async write(prompt) {
    return await this.#writer.write(prompt);
  }
}

// ❌ Bad: Global exposure
window.writer = await Writer.create();
// Anyone can access
```

---

## Resource Management

### 1. Always Destroy When Done

Clean up resources to prevent memory leaks.

```javascript
// ✅ Good: Clean up in finally block
let writer;
try {
  writer = await Writer.create();
  const result = await writer.write(prompt);
  return result;
} finally {
  writer?.destroy();
}

// ❌ Bad: No cleanup
const writer = await Writer.create();
const result = await writer.write(prompt);
// Writer never destroyed
```

### 2. Monitor Token Usage

Create new sessions before running out of tokens.

```javascript
// ✅ Good: Monitor tokens
async function chat(session, message) {
  const estimatedTokens = await session.countPromptTokens(message);

  if (session.tokensLeft < estimatedTokens + 100) {
    const newSession = await session.clone();
    session.destroy();
    session = newSession;
  }

  return await session.prompt(message);
}

// ❌ Bad: Ignore token limits
await session.prompt(message);
// May fail with token limit error
```

### 3. Use Abort Signals for Long Operations

Prevent resource waste on abandoned operations.

```javascript
// ✅ Good: Use abort signals
const controller = new AbortController();

setTimeout(() => controller.abort(), 30000); // 30s timeout

const writer = await Writer.create({ signal: controller.signal });
await writer.write(prompt, { signal: controller.signal });

// ❌ Bad: No timeout
const writer = await Writer.create();
await writer.write(prompt);
// May hang indefinitely
```

### 4. Limit Concurrent Operations

Don't overwhelm system resources.

```javascript
// ✅ Good: Limit concurrency
async function processItems(items, maxConcurrent = 3) {
  const results = [];
  for (let i = 0; i < items.length; i += maxConcurrent) {
    const batch = items.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);
  }
  return results;
}

// ❌ Bad: Unlimited concurrency
const results = await Promise.all(
  items.map(item => processItem(item))
);
// May create 1000s of operations
```

---

## Error Handling

### 1. Catch Specific Errors

Handle different error types appropriately.

```javascript
// ✅ Good: Specific error handling
try {
  const result = await writer.write(prompt);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('User cancelled');
  } else if (error.message.includes('quota')) {
    showQuotaError();
  } else if (error.message.includes('unavailable')) {
    showUnavailableError();
  } else {
    showGenericError();
  }
}

// ❌ Bad: Generic catch
try {
  const result = await writer.write(prompt);
} catch (error) {
  console.error(error); // User sees nothing
}
```

### 2. Implement Retry Logic

Retry transient failures with backoff.

```javascript
// ✅ Good: Retry with backoff
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}

// ❌ Bad: No retry
const result = await writer.write(prompt);
// Fails on temporary issues
```

### 3. Log Errors for Debugging

Always log errors for troubleshooting.

```javascript
// ✅ Good: Comprehensive logging
try {
  const result = await writer.write(prompt);
} catch (error) {
  console.error('Writer error:', {
    message: error.message,
    stack: error.stack,
    prompt: prompt.substring(0, 100),
    timestamp: new Date().toISOString()
  });
  throw error;
}

// ❌ Bad: Silent failures
try {
  const result = await writer.write(prompt);
} catch (error) {
  // Silent
}
```

---

## Testing

### 1. Mock AI APIs in Tests

Don't depend on actual AI models in unit tests.

```javascript
// ✅ Good: Mocked for testing
class MockWriter {
  async write(prompt) {
    return `Mock response for: ${prompt}`;
  }
  destroy() {}
}

// In tests
const writer = new MockWriter();
const result = await writer.write('test');
expect(result).toBe('Mock response for: test');

// ❌ Bad: Use real API in tests
const writer = await Writer.create();
const result = await writer.write('test');
// Slow, flaky, requires model download
```

### 2. Test Feature Detection

Verify graceful degradation.

```javascript
// ✅ Good: Test feature detection
test('falls back when API unavailable', async () => {
  global.Writer = undefined;

  const result = await generateText('hello');

  expect(result).toBeTruthy();
  expect(serverFallback).toHaveBeenCalled();
});
```

### 3. Test Error Scenarios

Ensure errors are handled properly.

```javascript
// ✅ Good: Test error handling
test('handles quota error', async () => {
  mockWriter.write.mockRejectedValue(
    new Error('quota exceeded')
  );

  await generateText('hello');

  expect(showQuotaError).toHaveBeenCalled();
});
```

---

## Accessibility

### 1. Provide Text Alternatives

Ensure AI-generated content has alternatives.

```javascript
// ✅ Good: Provide alternatives
<button onclick="generateWithAI()">
  Generate with AI
</button>
<button onclick="showManualInput()">
  Write manually
</button>

// ❌ Bad: AI-only option
<button onclick="generateWithAI()">
  Generate
</button>
```

### 2. Announce Status to Screen Readers

Use ARIA live regions for status updates.

```javascript
// ✅ Good: Accessible status
<div role="status" aria-live="polite" id="ai-status">
  Downloading AI model: 50%
</div>

statusElement.textContent = `Downloaded: ${percent}%`;

// ❌ Bad: Visual-only progress
<div id="progress">50%</div>
```

### 3. Keyboard Support

Ensure AI features are keyboard accessible.

```javascript
// ✅ Good: Keyboard support
<button onclick="generate()" onkeypress="generate()">
  Generate
</button>

// ❌ Bad: Mouse-only
<div onclick="generate()">Generate</div>
```

---

## Production Deployment

### 1. Check System Requirements

Verify user systems meet requirements.

```javascript
// ✅ Good: Check requirements
function meetsRequirements() {
  const minRam = 16 * 1024 * 1024 * 1024; // 16GB
  const isMobile = /mobile/i.test(navigator.userAgent);

  return {
    isDesktop: !isMobile,
    hasEnoughRam: navigator.deviceMemory >= 16,
    chromeVersion: getChromeVersion() >= 138
  };
}

if (!meetsRequirements().isDesktop) {
  showMobileWarning();
}
```

### 2. Monitor Usage

Track AI API usage and errors.

```javascript
// ✅ Good: Monitor usage
async function trackAIUsage(operation, apiName) {
  const startTime = performance.now();

  try {
    const result = await operation();

    analytics.track('ai_api_success', {
      api: apiName,
      duration: performance.now() - startTime
    });

    return result;
  } catch (error) {
    analytics.track('ai_api_error', {
      api: apiName,
      error: error.message,
      duration: performance.now() - startTime
    });

    throw error;
  }
}
```

### 3. Version Your Prompts

Track prompt changes for reproducibility.

```javascript
// ✅ Good: Versioned prompts
const PROMPTS = {
  v1: {
    emailDraft: 'Draft a professional email about {topic}',
    summarize: 'Summarize the following text'
  },
  v2: {
    emailDraft: 'Draft a professional email about {topic}. Keep it under 200 words.',
    summarize: 'Summarize the following text in bullet points'
  }
};

const currentVersion = 'v2';
const prompt = PROMPTS[currentVersion].emailDraft;
```

### 4. Implement Feature Flags

Control AI feature rollout.

```javascript
// ✅ Good: Feature flags
const features = {
  aiWriter: isFeatureEnabled('ai-writer'),
  aiTranslator: isFeatureEnabled('ai-translator')
};

if (features.aiWriter) {
  enableAIWriter();
}
```

---

## Summary Checklist

Before deploying AI features:

- [ ] Reuse API instances where possible
- [ ] Use streaming for long content
- [ ] Show download progress to users
- [ ] Provide fallbacks for unavailable APIs
- [ ] Handle errors gracefully with user-friendly messages
- [ ] Always destroy instances when done
- [ ] Monitor token usage for Prompt API
- [ ] Test on minimum hardware requirements
- [ ] Implement abort signals for long operations
- [ ] Respect user privacy and consent
- [ ] Add comprehensive error logging
- [ ] Test feature detection and degradation
- [ ] Ensure keyboard accessibility
- [ ] Monitor production usage and errors
- [ ] Version your prompts and configurations

---

## Related Resources

- [Common Patterns](./common-patterns.md)
- [System Requirements](./system-requirements.md)
- [API Documentation](../apis/)
