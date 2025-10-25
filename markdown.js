// Simple Markdown to HTML converter for AI Writing Assistant
// Handles common markdown patterns without external dependencies

/**
 * Escapes HTML to prevent XSS attacks
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Converts markdown text to formatted HTML
 */
function formatMarkdown(markdown) {
  if (!markdown) return '';

  let html = markdown;

  // Track if we're in a code block to avoid processing markdown inside it
  let inCodeBlock = false;
  const lines = html.split('\n');
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Handle code blocks (```)
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Starting a code block
        inCodeBlock = true;
        const language = line.trim().substring(3).trim();
        processedLines.push(`<pre><code class="language-${escapeHtml(language)}">`);
      } else {
        // Ending a code block
        inCodeBlock = false;
        processedLines.push('</code></pre>');
      }
      continue;
    }

    // If in code block, escape HTML and don't process markdown
    if (inCodeBlock) {
      processedLines.push(escapeHtml(line));
      continue;
    }

    // Process headers (# H1, ## H2, etc.)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      processedLines.push(`<h${level}>${processInlineMarkdown(text)}</h${level}>`);
      continue;
    }

    // Process unordered lists (- item or * item)
    if (line.match(/^\s*[-*]\s+/)) {
      const text = line.replace(/^\s*[-*]\s+/, '');
      const indent = line.match(/^\s*/)[0].length;
      const listItem = `<li style="margin-left: ${indent * 10}px">${processInlineMarkdown(text)}</li>`;

      // Check if previous line was also a list item
      const prevLine = processedLines[processedLines.length - 1];
      if (!prevLine || (!prevLine.includes('<li') && !prevLine.includes('<ul'))) {
        processedLines.push('<ul>');
      }

      processedLines.push(listItem);

      // Check if next line is also a list item
      const nextLine = lines[i + 1];
      if (!nextLine || !nextLine.match(/^\s*[-*]\s+/)) {
        processedLines.push('</ul>');
      }
      continue;
    }

    // Process ordered lists (1. item)
    if (line.match(/^\s*\d+\.\s+/)) {
      const text = line.replace(/^\s*\d+\.\s+/, '');
      const indent = line.match(/^\s*/)[0].length;
      const listItem = `<li style="margin-left: ${indent * 10}px">${processInlineMarkdown(text)}</li>`;

      // Check if previous line was also a list item
      const prevLine = processedLines[processedLines.length - 1];
      if (!prevLine || (!prevLine.includes('<li') && !prevLine.includes('<ol'))) {
        processedLines.push('<ol>');
      }

      processedLines.push(listItem);

      // Check if next line is also a list item
      const nextLine = lines[i + 1];
      if (!nextLine || !nextLine.match(/^\s*\d+\.\s+/)) {
        processedLines.push('</ol>');
      }
      continue;
    }

    // Process horizontal rules (---, ___, ***)
    if (line.match(/^(\*{3,}|-{3,}|_{3,})$/)) {
      processedLines.push('<hr>');
      continue;
    }

    // Process blockquotes (> text)
    if (line.match(/^>\s+/)) {
      const text = line.replace(/^>\s+/, '');
      processedLines.push(`<blockquote>${processInlineMarkdown(text)}</blockquote>`);
      continue;
    }

    // Process regular paragraphs
    if (line.trim()) {
      processedLines.push(`<p>${processInlineMarkdown(line)}</p>`);
    } else {
      processedLines.push('<br>');
    }
  }

  return processedLines.join('\n');
}

/**
 * Processes inline markdown (bold, italic, code, links)
 */
function processInlineMarkdown(text) {
  let processed = text;

  // Process inline code first (before other formatting)
  // Use a placeholder to protect code from further processing
  const codePlaceholders = [];
  processed = processed.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `__CODE_${codePlaceholders.length}__`;
    codePlaceholders.push(`<code>${escapeHtml(code)}</code>`);
    return placeholder;
  });

  // Process links [text](url)
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Process bold **text** or __text__
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Process italic *text* or _text_ (but not within words)
  processed = processed.replace(/(?:^|\s)\*([^*]+)\*(?:\s|$)/g, ' <em>$1</em> ');
  processed = processed.replace(/(?:^|\s)_([^_]+)_(?:\s|$)/g, ' <em>$1</em> ');

  // Process strikethrough ~~text~~
  processed = processed.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Restore code placeholders
  codePlaceholders.forEach((code, index) => {
    processed = processed.replace(`__CODE_${index}__`, code);
  });

  return processed;
}

// Export functions for use in content.js
window.formatMarkdown = formatMarkdown;
