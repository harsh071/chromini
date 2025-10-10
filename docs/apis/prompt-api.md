# Prompt API

General-purpose language model for natural language interactions using Chrome's built-in AI.

## Overview

The Prompt API (also known as `ai.languageModel`) provides access to Gemini Nano for general-purpose language model interactions. Supports text, image, and audio inputs with multimodal capabilities.

## Feature Detection

```javascript
if ('ai' in self && 'languageModel' in self.ai) {
  // Prompt API is supported
}

// Alternative
if ('LanguageModel' in self) {
  // Prompt API is supported
}
```

## Check Availability

```javascript
const availability = await ai.languageModel.availability();
// or
const availability = await LanguageModel.availability();
// Returns: 'unavailable', 'available', or 'after-download'
```

## Check Capabilities

```javascript
const capabilities = await ai.languageModel.capabilities();

console.log('Default temperature:', capabilities.defaultTemperature);
console.log('Default top-K:', capabilities.defaultTopK);
console.log('Max top-K:', capabilities.maxTopK);
console.log('Languages:', capabilities.languageAvailable);
// ['en', 'ja', 'es']
```

## Create Session

```javascript
const session = await ai.languageModel.create({
  temperature: 0.8,           // Creativity level (0.0 - 1.0)
  topK: 3,                   // Sampling diversity
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

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `temperature` | number (0.0-1.0) | Controls randomness (higher = more creative) |
| `topK` | number | Number of tokens to consider for sampling |
| `systemPrompt` | string | System instructions for the model |
| `initialPrompts` | array | Previous conversation context |
| `expectedInputs` | array | Expected input types (text, image, audio) |

## Prompt Methods

### Non-Streaming

Best for shorter responses or when you need the complete result at once.

```javascript
const result = await session.prompt('Write me a haiku about programming');
console.log(result);
```

### Streaming

Best for longer responses to show progressive results.

```javascript
const stream = session.promptStreaming('Explain async/await in JavaScript');

for await (const chunk of stream) {
  outputElement.append(chunk);
}
```

## Complete Example

```javascript
async function createChatbot() {
  // Check availability
  const availability = await ai.languageModel.availability();

  if (availability === 'unavailable') {
    throw new Error('Prompt API not available');
  }

  // Create session
  const session = await ai.languageModel.create({
    temperature: 0.7,
    topK: 3,
    systemPrompt: 'You are a helpful assistant that provides concise answers.',
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        updateProgressBar(e.loaded * 100);
      });
    }
  });

  return session;
}

async function chat(session, message) {
  try {
    const stream = session.promptStreaming(message);
    let response = '';

    for await (const chunk of stream) {
      response += chunk;
      displayMessage(response);
    }

    return response;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}

// Usage
const session = await createChatbot();
const response = await chat(session, 'What is JavaScript?');
```

## Session Management

### Clone Session

Preserve conversation context in a new session.

```javascript
const newSession = await session.clone();
```

### Destroy Session

Clean up resources when done.

```javascript
session.destroy();
```

### Token Counting

```javascript
// Count tokens in a prompt
const tokenCount = await session.countPromptTokens('How many tokens is this?');
console.log(`Token count: ${tokenCount}`);

// Check token usage
console.log(`Tokens used: ${session.tokensSoFar}`);
console.log(`Max tokens: ${session.maxTokens}`);
console.log(`Tokens left: ${session.tokensLeft}`);
```

## Constrained Output (JSON Schema)

Force the model to return structured JSON output.

```javascript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    occupation: { type: 'string' },
    skills: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['name', 'age']
};

const result = await session.prompt(
  'Generate a person profile for a software developer',
  {
    responseConstraint: schema
  }
);

const person = JSON.parse(result);
console.log(person);
// {
//   name: "John Doe",
//   age: 30,
//   occupation: "Software Developer",
//   skills: ["JavaScript", "Python", "React"]
// }
```

## Multi-modal Input

### Text and Image

```javascript
const session = await ai.languageModel.create({
  expectedInputs: [
    { type: 'text', languages: ['en'] },
    { type: 'image', mimeTypes: ['image/png', 'image/jpeg'] }
  ]
});

// Get image as blob
const imageBlob = await fetch('/path/to/image.jpg').then(r => r.blob());

const result = await session.prompt([
  { type: 'text', text: 'What is in this image?' },
  { type: 'image', image: imageBlob }
]);

console.log(result);
```

### Text, Image, and Audio

```javascript
const session = await ai.languageModel.create({
  expectedInputs: [
    { type: 'text', languages: ['en'] },
    { type: 'image', mimeTypes: ['image/png', 'image/jpeg'] },
    { type: 'audio', mimeTypes: ['audio/wav', 'audio/mp3'] }
  ]
});

const result = await session.prompt([
  { type: 'text', text: 'Describe what you see and hear' },
  { type: 'image', image: imageBlob },
  { type: 'audio', audio: audioBlob }
]);
```

## Abort Prompts

```javascript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const result = await session.prompt('Long running task', {
    signal: controller.signal
  });
  console.log(result);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Prompt was aborted');
  }
}
```

## Use Cases

### 1. Code Assistant

```javascript
const session = await ai.languageModel.create({
  systemPrompt: 'You are an expert JavaScript developer. Provide concise, production-ready code examples.',
  temperature: 0.3 // Lower for more consistent code
});

const code = await session.prompt(
  'Write a function to debounce user input'
);
console.log(code);
```

### 2. Content Generator

```javascript
const session = await ai.languageModel.create({
  systemPrompt: 'You are a creative content writer.',
  temperature: 0.9 // Higher for more creativity
});

const stream = session.promptStreaming(
  'Write a short story about a robot learning to paint'
);

for await (const chunk of stream) {
  document.getElementById('story').textContent += chunk;
}
```

### 3. Data Extraction

```javascript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    company: { type: 'string' }
  }
};

const session = await ai.languageModel.create({
  systemPrompt: 'Extract contact information from text.',
  temperature: 0.1 // Very low for consistent extraction
});

const text = `
  Hi, I'm John Doe from Acme Corp.
  You can reach me at john@acme.com or 555-1234.
`;

const result = await session.prompt(
  `Extract contact info: ${text}`,
  { responseConstraint: schema }
);

const contact = JSON.parse(result);
```

### 4. Chatbot with Memory

```javascript
class Chatbot {
  constructor() {
    this.session = null;
  }

  async init() {
    this.session = await ai.languageModel.create({
      systemPrompt: 'You are a helpful assistant. Remember conversation context.',
      temperature: 0.7
    });
  }

  async chat(message) {
    if (!this.session) {
      await this.init();
    }

    const stream = this.session.promptStreaming(message);
    let response = '';

    for await (const chunk of stream) {
      response += chunk;
    }

    // Context is automatically maintained
    return response;
  }

  async resetConversation() {
    this.session?.destroy();
    await this.init();
  }

  destroy() {
    this.session?.destroy();
  }
}

// Usage
const bot = new Chatbot();
await bot.init();

const resp1 = await bot.chat('My name is Alice');
const resp2 = await bot.chat('What is my name?');
// Response will remember "Alice"
```

### 5. Image Analysis

```javascript
async function analyzeImage(imageFile) {
  const session = await ai.languageModel.create({
    expectedInputs: [
      { type: 'text', languages: ['en'] },
      { type: 'image', mimeTypes: ['image/jpeg', 'image/png'] }
    ]
  });

  try {
    const result = await session.prompt([
      { type: 'text', text: 'Describe this image in detail. What objects, people, or scenes do you see?' },
      { type: 'image', image: imageFile }
    ]);

    return result;
  } finally {
    session.destroy();
  }
}
```

### 6. Translation with Context

```javascript
const session = await ai.languageModel.create({
  systemPrompt: 'You are a professional translator. Maintain tone and context.',
  temperature: 0.3
});

const translation = await session.prompt(
  'Translate to Spanish: "The early bird catches the worm" (include cultural context)'
);
```

## Conversation Context

```javascript
const session = await ai.languageModel.create({
  systemPrompt: 'You are a helpful tutor.',
  initialPrompts: [
    { role: 'user', content: 'I want to learn about React' },
    { role: 'assistant', content: 'Great! React is a JavaScript library for building user interfaces.' },
    { role: 'user', content: 'What are components?' },
    { role: 'assistant', content: 'Components are reusable pieces of UI in React.' }
  ]
});

// Continue the conversation
const response = await session.prompt('Can you show me an example?');
```

## Temperature Examples

```javascript
// Low temperature (0.1-0.3): Consistent, focused, deterministic
const codeSession = await ai.languageModel.create({
  temperature: 0.2,
  systemPrompt: 'You are a code generator'
});

// Medium temperature (0.5-0.7): Balanced creativity and consistency
const chatSession = await ai.languageModel.create({
  temperature: 0.6,
  systemPrompt: 'You are a helpful assistant'
});

// High temperature (0.8-1.0): Creative, varied, exploratory
const creativeSession = await ai.languageModel.create({
  temperature: 0.9,
  systemPrompt: 'You are a creative writer'
});
```

## Token Management

```javascript
async function manageTokens(session, prompts) {
  for (const prompt of prompts) {
    // Check if we have enough tokens
    const estimatedTokens = await session.countPromptTokens(prompt);

    if (session.tokensLeft < estimatedTokens) {
      console.log('Not enough tokens, creating new session...');
      const newSession = await session.clone();
      session.destroy();
      session = newSession;
    }

    const result = await session.prompt(prompt);
    console.log(result);
  }

  return session;
}
```

## Streaming with Progress

```javascript
async function streamWithProgress(session, prompt, onProgress) {
  const stream = session.promptStreaming(prompt);
  let fullResponse = '';
  let chunkCount = 0;

  for await (const chunk of stream) {
    fullResponse += chunk;
    chunkCount++;

    onProgress({
      chunk,
      fullResponse,
      chunkCount
    });
  }

  return fullResponse;
}

// Usage
const response = await streamWithProgress(
  session,
  'Write a long essay about AI',
  ({ fullResponse, chunkCount }) => {
    console.log(`Chunk ${chunkCount}`);
    document.getElementById('output').textContent = fullResponse;
  }
);
```

## Best Practices

1. **Choose appropriate temperature**: Lower for factual tasks, higher for creative tasks
2. **Use system prompts**: Guide model behavior consistently
3. **Monitor token usage**: Create new sessions when running low
4. **Use streaming for long responses**: Better UX
5. **Provide context**: Use initialPrompts for conversation history
6. **Always destroy sessions**: Clean up resources
7. **Handle errors**: Wrap in try/catch
8. **Use JSON schema**: For structured data extraction
9. **Clone for branching**: Preserve context while exploring alternatives

## Error Handling

```javascript
async function safePrompt(promptText, options = {}) {
  let session;

  try {
    const availability = await ai.languageModel.availability();

    if (availability === 'unavailable') {
      throw new Error('Prompt API not available');
    }

    session = await ai.languageModel.create({
      temperature: options.temperature || 0.7,
      systemPrompt: options.systemPrompt
    });

    return await session.prompt(promptText, {
      signal: options.signal,
      responseConstraint: options.schema
    });
  } catch (error) {
    console.error('Prompt failed:', error);
    throw error;
  } finally {
    session?.destroy();
  }
}
```

## Browser Support

- **Chrome**: 137+
- **Languages**: English, Japanese, Spanish
- **Origin Trial**: Required
- **Mobile**: Limited support
- **Web Workers**: Limited support

## Supported Languages

- **English** (`en`)
- **Japanese** (`ja`)
- **Spanish** (`es`)

More languages may be added in future releases.

## Limitations

- Requires user activation for model download
- Token limits per session
- Cross-origin iframes need permission
- Not all languages supported
- Model size requires significant storage

## Related APIs

- [Writer API](./writer-api.md) - Specialized content generation
- [Summarizer API](./summarizer-api.md) - Text summarization
- [Rewriter API](./rewriter-api.md) - Text transformation

## Resources

- [Official Documentation](https://developer.chrome.com/docs/ai/prompt-api)
- [Prompt API Playground](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/prompt-api-playground)
- [Weather AI Demo](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/weather-ai)
- [Right Click for Superpowers Demo](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/right-click-for-superpowers)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
