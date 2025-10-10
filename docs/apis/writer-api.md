# Writer API

Generate new content for various writing tasks using Chrome's built-in AI.

## Overview

The Writer API helps create new content with control over tone, format, and length. It's powered by Gemini Nano and runs entirely on-device for privacy.

## Feature Detection

```javascript
if ('Writer' in self) {
  // Writer API is supported
}
```

## Check Availability

```javascript
const availability = await Writer.availability();
// Returns: 'unavailable', 'available', or 'after-download'
```

## Create Writer

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

### Configuration Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `tone` | `'formal'`, `'neutral'`, `'casual'` | `'neutral'` | Writing style tone |
| `format` | `'markdown'`, `'plain-text'` | `'markdown'` | Output format |
| `length` | `'short'`, `'medium'`, `'long'` | `'medium'` | Desired output length |
| `sharedContext` | string | - | Context shared across all write operations |

## Writing Methods

### Non-Streaming

Best for shorter content where you want the complete result at once.

```javascript
const result = await writer.write(
  'An inquiry to my bank about wire transfers',
  {
    context: "I'm a longstanding customer"
  }
);
console.log(result);
```

### Streaming

Best for longer content to improve perceived performance.

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

## Reuse Writer

Create once, use multiple times for better performance.

```javascript
const writer = await Writer.create({ tone: 'formal' });

const reviews = await Promise.all(
  Array.from(
    document.querySelectorAll('#reviews > .review'),
    (reviewEl) => writer.write(reviewEl.textContent)
  )
);
```

## Abort and Destroy

### Abort Ongoing Operations

```javascript
const controller = new AbortController();
stopButton.onclick = () => controller.abort();

const writer = await Writer.create({ signal: controller.signal });
await writer.write(text, { signal: controller.signal });
```

### Destroy When Done

Always clean up resources when finished.

```javascript
writer.destroy();
```

## Complete Example

```javascript
async function generateEmail() {
  // Check availability
  const availability = await Writer.availability();

  if (availability === 'unavailable') {
    console.error('Writer API not available');
    return;
  }

  // Create writer with progress monitoring
  const writer = await Writer.create({
    tone: 'formal',
    format: 'plain-text',
    length: 'medium',
    sharedContext: 'Professional business communication',
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        updateProgressBar(e.loaded * 100);
      });
    }
  });

  try {
    // Generate content
    const stream = writer.writeStreaming(
      'An inquiry about opening a business account',
      {
        context: 'Startup founder looking for banking services'
      }
    );

    // Display streaming results
    for await (const chunk of stream) {
      emailTextarea.value += chunk;
    }
  } finally {
    // Always clean up
    writer.destroy();
  }
}
```

## Use Cases

- **Email drafting**: Generate professional emails
- **Blog posts**: Create content drafts
- **Product descriptions**: Write marketing copy
- **Social media**: Craft posts and updates
- **Cover letters**: Generate job application letters
- **Documentation**: Create technical documentation
- **Proposals**: Draft business proposals

## Best Practices

1. **Reuse instances**: Create once, use multiple times
2. **Use streaming for long content**: Better UX with progressive rendering
3. **Provide context**: Use `sharedContext` and `context` for better results
4. **Always destroy**: Clean up resources when done
5. **Handle errors**: Wrap in try/catch blocks
6. **Show progress**: Monitor downloads for better UX

## Browser Support

- **Chrome**: 137-142+
- **Origin Trial**: Required
- **Mobile**: Not supported
- **Web Workers**: Not supported

## Related APIs

- [Rewriter API](./rewriter-api.md) - Adjust existing text
- [Prompt API](./prompt-api.md) - General-purpose language model
- [Summarizer API](./summarizer-api.md) - Generate summaries

## Resources

- [Official Documentation](https://developer.chrome.com/docs/ai/writer-api)
- [Writer/Rewriter Playground Demo](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-api-playground)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
