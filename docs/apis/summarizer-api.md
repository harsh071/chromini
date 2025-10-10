# Summarizer API

Generate summaries of text content using Chrome's built-in AI.

## Overview

The Summarizer API creates concise summaries of text content with control over summary type, format, and length. Powered by Gemini Nano and runs entirely on-device.

## Feature Detection

```javascript
if ('Summarizer' in self) {
  // Summarizer API is supported
}
```

## Check Availability

```javascript
const availability = await Summarizer.availability();
// Returns: 'unavailable', 'available', or 'after-download'
```

## Create Summarizer

```javascript
const summarizer = await Summarizer.create({
  type: 'key-points',    // Summary type
  format: 'markdown',    // Output format
  length: 'medium',      // Summary length
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
| `type` | `'key-points'`, `'tldr'`, `'teaser'`, `'headline'` | `'key-points'` | Summary style |
| `format` | `'plain-text'`, `'markdown'` | `'plain-text'` | Output format |
| `length` | `'short'`, `'medium'`, `'long'` | `'medium'` | Summary length |

## Summary Types

### `key-points`
Extract important points as bullet points.

```javascript
const summarizer = await Summarizer.create({ type: 'key-points' });
const summary = await summarizer.summarize(longArticle);
// Output:
// - First key point
// - Second key point
// - Third key point
```

### `tldr`
Concise overview of the content.

```javascript
const summarizer = await Summarizer.create({ type: 'tldr' });
const summary = await summarizer.summarize(longArticle);
// Output: Brief 1-2 sentence overview
```

### `teaser`
Intriguing highlights to encourage reading the full content.

```javascript
const summarizer = await Summarizer.create({ type: 'teaser' });
const summary = await summarizer.summarize(blogPost);
// Output: Engaging teaser that creates interest
```

### `headline`
Main point in a single sentence.

```javascript
const summarizer = await Summarizer.create({ type: 'headline' });
const summary = await summarizer.summarize(newsArticle);
// Output: Single sentence capturing the essence
```

## Summarization Methods

### Non-Streaming

Best for shorter content or when you need the complete summary at once.

```javascript
const summary = await summarizer.summarize(longArticleText, {
  context: 'Technical documentation for developers'
});
console.log(summary);
```

### Streaming

Best for longer content to show progressive results.

```javascript
const stream = summarizer.summarizeStreaming(longArticleText, {
  context: 'Blog post about AI technology'
});

for await (const chunk of stream) {
  summaryElement.append(chunk);
}
```

## Complete Example

```javascript
async function summarizeArticle(article) {
  // Check availability
  const availability = await Summarizer.availability();

  if (availability === 'unavailable') {
    throw new Error('Summarizer API not available');
  }

  // Create summarizer with progress monitoring
  const summarizer = await Summarizer.create({
    type: 'key-points',
    format: 'markdown',
    length: 'short',
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(`Downloading model: ${Math.round(e.loaded * 100)}%`);
      });
    }
  });

  try {
    // Generate summary
    const summary = await summarizer.summarize(article, {
      context: 'Summary for newsletter'
    });

    return summary;
  } finally {
    // Clean up
    summarizer.destroy();
  }
}

// Usage
const article = `
  [Long article text here...]
`;

const summary = await summarizeArticle(article);
console.log(summary);
```

## Use Cases

### 1. Newsletter Summaries

```javascript
async function createNewsletterSummaries(articles) {
  const summarizer = await Summarizer.create({
    type: 'tldr',
    format: 'plain-text',
    length: 'short'
  });

  try {
    const summaries = await Promise.all(
      articles.map(article =>
        summarizer.summarize(article.content, {
          context: 'Newsletter summary for busy readers'
        })
      )
    );

    return articles.map((article, i) => ({
      ...article,
      summary: summaries[i]
    }));
  } finally {
    summarizer.destroy();
  }
}
```

### 2. Meeting Notes

```javascript
async function summarizeMeetingNotes(transcript) {
  const summarizer = await Summarizer.create({
    type: 'key-points',
    format: 'markdown',
    length: 'medium'
  });

  try {
    const summary = await summarizer.summarize(transcript, {
      context: 'Meeting transcript - extract action items and decisions'
    });

    return summary;
  } finally {
    summarizer.destroy();
  }
}
```

### 3. Blog Post Teasers

```javascript
async function generateTeaser(blogPost) {
  const summarizer = await Summarizer.create({
    type: 'teaser',
    format: 'plain-text',
    length: 'short'
  });

  try {
    return await summarizer.summarize(blogPost, {
      context: 'Engaging teaser for social media'
    });
  } finally {
    summarizer.destroy();
  }
}
```

### 4. News Headlines

```javascript
async function generateHeadline(article) {
  const summarizer = await Summarizer.create({
    type: 'headline',
    format: 'plain-text',
    length: 'short'
  });

  try {
    return await summarizer.summarize(article, {
      context: 'News headline - attention grabbing and informative'
    });
  } finally {
    summarizer.destroy();
  }
}
```

### 5. Documentation Summaries

```javascript
async function summarizeDocs(documentation) {
  const summarizer = await Summarizer.create({
    type: 'key-points',
    format: 'markdown',
    length: 'medium'
  });

  try {
    const stream = summarizer.summarizeStreaming(documentation, {
      context: 'Technical documentation - focus on key features and usage'
    });

    let summary = '';
    for await (const chunk of stream) {
      summary += chunk;
      updatePreview(summary); // Show progress
    }

    return summary;
  } finally {
    summarizer.destroy();
  }
}
```

## Multi-Type Summaries

```javascript
async function generateAllSummaryTypes(text) {
  const types = ['key-points', 'tldr', 'teaser', 'headline'];
  const summaries = {};

  for (const type of types) {
    const summarizer = await Summarizer.create({
      type,
      format: 'markdown',
      length: 'medium'
    });

    try {
      summaries[type] = await summarizer.summarize(text);
    } finally {
      summarizer.destroy();
    }
  }

  return summaries;
}

// Usage
const allSummaries = await generateAllSummaryTypes(longArticle);
console.log('Key Points:', allSummaries['key-points']);
console.log('TL;DR:', allSummaries.tldr);
console.log('Teaser:', allSummaries.teaser);
console.log('Headline:', allSummaries.headline);
```

## Length Comparison

```javascript
async function compareSummaryLengths(text) {
  const lengths = ['short', 'medium', 'long'];
  const summaries = {};

  for (const length of lengths) {
    const summarizer = await Summarizer.create({
      type: 'key-points',
      format: 'markdown',
      length
    });

    try {
      summaries[length] = await summarizer.summarize(text);
    } finally {
      summarizer.destroy();
    }
  }

  return summaries;
}
```

## Streaming with Progress

```javascript
async function summarizeWithProgress(text, onProgress) {
  const summarizer = await Summarizer.create({
    type: 'key-points',
    format: 'markdown',
    length: 'medium'
  });

  try {
    const stream = summarizer.summarizeStreaming(text);
    let summary = '';
    let chunkCount = 0;

    for await (const chunk of stream) {
      summary += chunk;
      chunkCount++;
      onProgress({ summary, chunkCount });
    }

    return summary;
  } finally {
    summarizer.destroy();
  }
}

// Usage
const summary = await summarizeWithProgress(longText, ({ summary, chunkCount }) => {
  console.log(`Received chunk ${chunkCount}`);
  document.getElementById('preview').textContent = summary;
});
```

## Batch Summarization

```javascript
async function summarizeBatch(documents, summaryType = 'tldr') {
  const summarizer = await Summarizer.create({
    type: summaryType,
    format: 'markdown',
    length: 'short'
  });

  try {
    const summaries = [];

    for (const doc of documents) {
      const summary = await summarizer.summarize(doc.content, {
        context: doc.context || ''
      });

      summaries.push({
        ...doc,
        summary
      });

      // Show progress
      console.log(`Summarized ${summaries.length}/${documents.length}`);
    }

    return summaries;
  } finally {
    summarizer.destroy();
  }
}
```

## Context-Aware Summarization

```javascript
async function contextualSummarize(content, audience) {
  const contexts = {
    technical: 'Focus on technical details and implementation',
    business: 'Focus on business impact and ROI',
    general: 'Focus on high-level overview for general audience',
    academic: 'Focus on research findings and methodology'
  };

  const summarizer = await Summarizer.create({
    type: 'key-points',
    format: 'markdown',
    length: 'medium'
  });

  try {
    return await summarizer.summarize(content, {
      context: contexts[audience] || contexts.general
    });
  } finally {
    summarizer.destroy();
  }
}

// Usage
const techSummary = await contextualSummarize(article, 'technical');
const bizSummary = await contextualSummarize(article, 'business');
```

## Reuse Summarizer

```javascript
const summarizer = await Summarizer.create({
  type: 'tldr',
  format: 'plain-text',
  length: 'short'
});

// Summarize multiple articles
const summaries = await Promise.all([
  summarizer.summarize(article1),
  summarizer.summarize(article2),
  summarizer.summarize(article3)
]);

summarizer.destroy();
```

## Abort Summarization

```javascript
const controller = new AbortController();
cancelButton.onclick = () => controller.abort();

const summarizer = await Summarizer.create({ signal: controller.signal });

try {
  const summary = await summarizer.summarize(text, {
    signal: controller.signal
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Summarization cancelled');
  }
}
```

## Best Practices

1. **Choose the right type**: Match summary type to use case
2. **Reuse summarizer**: Create once, summarize many times
3. **Use streaming for long content**: Better UX with progressive rendering
4. **Provide context**: Help the AI understand the purpose
5. **Show progress**: Monitor downloads for better UX
6. **Always destroy**: Clean up resources when done
7. **Handle errors**: Wrap in try/catch blocks
8. **Consider audience**: Adjust context based on target readers

## Performance Tips

```javascript
// Good: Reuse summarizer
const summarizer = await Summarizer.create({ type: 'tldr' });
await summarizer.summarize(text1);
await summarizer.summarize(text2);
summarizer.destroy();

// Bad: Create new instance each time
const s1 = await Summarizer.create({ type: 'tldr' });
await s1.summarize(text1);
s1.destroy();

const s2 = await Summarizer.create({ type: 'tldr' });
await s2.summarize(text2);
s2.destroy();
```

## Error Handling

```javascript
async function safeSummarize(text, options = {}) {
  let summarizer;

  try {
    const availability = await Summarizer.availability();

    if (availability === 'unavailable') {
      throw new Error('Summarizer API not available');
    }

    summarizer = await Summarizer.create({
      type: options.type || 'tldr',
      format: options.format || 'plain-text',
      length: options.length || 'medium'
    });

    return await summarizer.summarize(text, {
      context: options.context
    });
  } catch (error) {
    console.error('Summarization failed:', error);
    return null; // Or return original text, or error message
  } finally {
    summarizer?.destroy();
  }
}
```

## Browser Support

- **Chrome**: 138+
- **Desktop only**: Not available on mobile
- **Origin Trial**: Required
- **Web Workers**: Not supported

## Limitations

- Not available on mobile devices
- Requires user activation for model download
- Cross-origin iframes need explicit permission
- Sequential processing (one summary at a time per instance)

## Destroy Summarizer

```javascript
// Always clean up resources
summarizer.destroy();
```

## Related APIs

- [Writer API](./writer-api.md) - Generate new content
- [Rewriter API](./rewriter-api.md) - Adjust tone and style
- [Prompt API](./prompt-api.md) - General-purpose language model

## Resources

- [Official Documentation](https://developer.chrome.com/docs/ai/summarizer-api)
- [Summarization API Playground](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/summarization-api-playground)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
