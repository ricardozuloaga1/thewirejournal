/**
 * Simple Markdown to HTML converter
 * Handles basic markdown formatting without external dependencies
 */

export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML entities first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers (must be at start of line)
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-4 font-serif">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 font-serif">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4 font-serif">$1</h1>');

  // Bold and italic (order matters - do bold+italic first)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Underscores for bold/italic
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Horizontal rules
  html = html.replace(/^[-_*]{3,}$/gm, '<hr class="my-8 border-gray-300" />');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>');

  // Bullet lists
  html = html.replace(/^[•\-\*] (.+)$/gm, '<li class="ml-4">$1</li>');
  
  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');

  // Convert line breaks to paragraphs
  // Split by double newlines for paragraphs
  const paragraphs = html.split(/\n\n+/);
  
  html = paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      
      // Don't wrap if it's already an HTML block element
      if (trimmed.startsWith('<h') || 
          trimmed.startsWith('<hr') || 
          trimmed.startsWith('<blockquote') ||
          trimmed.startsWith('<li')) {
        // Wrap list items in ul
        if (trimmed.startsWith('<li')) {
          return `<ul class="my-4 list-disc">${trimmed}</ul>`;
        }
        return trimmed;
      }
      
      // Replace single newlines with <br> within paragraphs
      const withBreaks = trimmed.replace(/\n/g, '<br />');
      return `<p class="font-serif text-gray-800 leading-relaxed mb-4">${withBreaks}</p>`;
    })
    .filter(p => p)
    .join('\n');

  return html;
}

/**
 * Strip all markdown formatting (for plain text display)
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#{1,6} /gm, '')           // Headers
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1') // Bold+Italic
    .replace(/\*\*(.+?)\*\*/g, '$1')     // Bold
    .replace(/\*(.+?)\*/g, '$1')         // Italic
    .replace(/___(.+?)___/g, '$1')       // Bold+Italic
    .replace(/__(.+?)__/g, '$1')         // Bold
    .replace(/_(.+?)_/g, '$1')           // Italic
    .replace(/^[-_*]{3,}$/gm, '')        // HR
    .replace(/^> /gm, '')                // Blockquotes
    .replace(/^[•\-\*] /gm, '')          // Bullets
    .replace(/^\d+\. /gm, '')            // Numbers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
}


