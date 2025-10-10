# Rewriter API

Adjust tone and style of existing text using Chrome's built-in AI.

## Overview

The Rewriter API helps transform existing text by changing tone, format, or length while preserving the core message. Perfect for adapting content to different audiences and contexts.

## Feature Detection

```javascript
if ('Rewriter' in self) {
  // Rewriter API is supported
}
```

## Check Availability

```javascript
const availability = await Rewriter.availability();
// Returns: 'unavailable', 'available', or 'after-download'
```

## Create Rewriter

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

### Configuration Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `tone` | `'more-formal'`, `'as-is'`, `'more-casual'` | `'as-is'` | Adjust formality level |
| `format` | `'as-is'`, `'markdown'`, `'plain-text'` | `'as-is'` | Output format |
| `length` | `'shorter'`, `'as-is'`, `'longer'` | `'as-is'` | Adjust length |
| `sharedContext` | string | - | Context shared across all rewrite operations |

## Rewriting Methods

### Non-Streaming

Best for shorter text transformations.

```javascript
const result = await rewriter.rewrite(originalText, {
  context: 'Email to a colleague'
});
```

### Streaming

Best for longer text to show progressive results.

```javascript
const stream = rewriter.rewriteStreaming(originalText, {
  context: 'LinkedIn post'
});

for await (const chunk of stream) {
  outputElement.append(chunk);
}
```

## Complete Example

```javascript
async function makeTextFormal() {
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

  try {
    const casualText = 'hey whats up';
    const rewritten = await rewriter.rewrite(casualText);
    console.log(rewritten); // "Hello, how are you?"
  } finally {
    rewriter.destroy();
  }
}
```

## Use Cases

### Make Text More Formal

```javascript
const rewriter = await Rewriter.create({ tone: 'more-formal' });

const casual = 'hey, can u send me that file?';
const formal = await rewriter.rewrite(casual);
// "Hello, could you please send me that file?"
```

### Make Text More Casual

```javascript
const rewriter = await Rewriter.create({ tone: 'more-casual' });

const formal = 'I would be grateful if you could assist me with this matter.';
const casual = await rewriter.rewrite(formal);
// "I'd appreciate it if you could help me out with this."
```

### Shorten Text

```javascript
const rewriter = await Rewriter.create({ length: 'shorter' });

const longText = 'This is a very long explanation that goes into great detail...';
const short = await rewriter.rewrite(longText);
// Condensed version
```

### Convert to Markdown

```javascript
const rewriter = await Rewriter.create({ format: 'markdown' });

const plainText = 'Key points: First point. Second point. Third point.';
const markdown = await rewriter.rewrite(plainText);
// "**Key points:**\n- First point\n- Second point\n- Third point"
```

## Practical Applications

1. **Email Adaptation**: Convert casual messages to formal business emails
2. **Social Media**: Adapt content for different platforms (LinkedIn vs Twitter)
3. **Content Localization**: Adjust tone for different audiences
4. **Meeting Notes**: Make informal notes more professional
5. **Customer Support**: Adjust response tone based on context
6. **Blog Posts**: Create multiple versions for different audiences
7. **Marketing Copy**: Test different tones and lengths

## Multi-Step Rewriting

```javascript
async function multiStepRewrite(text) {
  // Step 1: Make formal
  const formalRewriter = await Rewriter.create({ tone: 'more-formal' });
  const formal = await formalRewriter.rewrite(text);
  formalRewriter.destroy();

  // Step 2: Shorten
  const shortRewriter = await Rewriter.create({ length: 'shorter' });
  const short = await shortRewriter.rewrite(formal);
  shortRewriter.destroy();

  return short;
}
```

## Batch Rewriting

```javascript
const rewriter = await Rewriter.create({ tone: 'more-formal' });

const messages = [
  'hey, hows it going?',
  'can u help me out?',
  'thanks a bunch!'
];

const rewritten = await Promise.all(
  messages.map(msg => rewriter.rewrite(msg))
);

rewriter.destroy();
```

## Abort and Destroy

### Abort Operations

```javascript
const controller = new AbortController();
cancelButton.onclick = () => controller.abort();

const rewriter = await Rewriter.create({ signal: controller.signal });
await rewriter.rewrite(text, { signal: controller.signal });
```

### Clean Up Resources

```javascript
// Always destroy when finished
rewriter.destroy();
```

## Best Practices

1. **Reuse for multiple texts**: Create once, rewrite many times
2. **Provide context**: Use `context` parameter for better results
3. **Use streaming for long text**: Better UX with progressive rendering
4. **Always destroy**: Clean up resources when done
5. **Handle errors**: Wrap operations in try/catch
6. **Show progress**: Monitor downloads for better UX
7. **Test different options**: Experiment with tone/format/length combinations

## Error Handling

```javascript
async function safeRewrite(text) {
  let rewriter;
  try {
    const availability = await Rewriter.availability();

    if (availability === 'unavailable') {
      throw new Error('Rewriter API not available');
    }

    rewriter = await Rewriter.create({ tone: 'more-formal' });
    return await rewriter.rewrite(text);
  } catch (error) {
    console.error('Rewriting failed:', error);
    return text; // Return original text as fallback
  } finally {
    rewriter?.destroy();
  }
}
```

## Browser Support

- **Chrome**: 137-142+
- **Origin Trial**: Required
- **Mobile**: Not supported
- **Web Workers**: Not supported

## Limitations

- Sequential processing (one rewrite at a time per instance)
- Not available in Web Workers
- Requires user activation for model download
- Cross-origin iframes need explicit permission

## Related APIs

- [Writer API](./writer-api.md) - Generate new content
- [Prompt API](./prompt-api.md) - General-purpose language model
- [Proofreader API](./proofreader-api.md) - Grammar and spelling correction

## Resources

- [Official Documentation](https://developer.chrome.com/docs/ai/rewriter-api)
- [Writer/Rewriter Playground Demo](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-api-playground)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
