
/**
 * Simple HTML to Markdown converter
 * Handles basic HTML elements like headings, paragraphs, lists, etc.
 */
export function htmlToMarkdown(html: string): string {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Process the document and convert to markdown
  return processNode(doc.body);
}

function processNode(node: Node): string {
  let markdown = '';
  
  // Process each child node
  node.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      markdown += child.textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      
      switch (tagName) {
        case 'h1':
          markdown += `# ${processNode(element)}\n\n`;
          break;
        case 'h2':
          markdown += `## ${processNode(element)}\n\n`;
          break;
        case 'h3':
          markdown += `### ${processNode(element)}\n\n`;
          break;
        case 'h4':
          markdown += `#### ${processNode(element)}\n\n`;
          break;
        case 'h5':
          markdown += `##### ${processNode(element)}\n\n`;
          break;
        case 'h6':
          markdown += `###### ${processNode(element)}\n\n`;
          break;
        case 'p':
          markdown += `${processNode(element)}\n\n`;
          break;
        case 'br':
          markdown += '\n';
          break;
        case 'strong':
        case 'b':
          markdown += `**${processNode(element)}**`;
          break;
        case 'em':
        case 'i':
          markdown += `*${processNode(element)}*`;
          break;
        case 'a':
          markdown += `[${processNode(element)}](${element.getAttribute('href')})`;
          break;
        case 'img':
          markdown += `![${element.getAttribute('alt') || ''}](${element.getAttribute('src')})`;
          break;
        case 'ul':
          markdown += processListItems(element, '*');
          break;
        case 'ol':
          markdown += processListItems(element, '1.');
          break;
        case 'blockquote':
          markdown += processBlockquote(element);
          break;
        case 'pre':
        case 'code':
          markdown += `\`\`\`\n${element.textContent}\n\`\`\`\n\n`;
          break;
        case 'hr':
          markdown += '---\n\n';
          break;
        default:
          markdown += processNode(element);
      }
    }
  });
  
  return markdown;
}

function processListItems(list: HTMLElement, marker: string): string {
  let markdown = '';
  
  for (let i = 0; i < list.children.length; i++) {
    const item = list.children[i];
    if (item.tagName.toLowerCase() === 'li') {
      markdown += `${marker} ${processNode(item)}\n`;
    }
  }
  
  return markdown + '\n';
}

function processBlockquote(blockquote: HTMLElement): string {
  const content = processNode(blockquote);
  // Add '>' to each line
  const lines = content.split('\n');
  return lines.map(line => `> ${line}`).join('\n') + '\n\n';
}
