
// This script runs in the context of the webpage
function extractContent() {
  // Check for tiptap div first
  const tiptapDiv = document.querySelector('.tiptap');
  
  if (tiptapDiv) {
    // If tiptap div exists, extract its content directly
    return {
      url: window.location.href,
      title: document.title,
      content: tiptapDiv.innerHTML, // Send the raw HTML for conversion in the popup
      rawText: tiptapDiv.textContent, // Plain text as fallback
      images: Array.from(tiptapDiv.querySelectorAll('img')).map(img => img.src).filter(src => src && !src.startsWith('data:')),
      timestamp: new Date().toISOString(),
      source: 'tiptap'
    };
  }
  
  // Fallback to default selectors if tiptap not found
  // Default selectors that work for common article layouts
  const defaultSelectors = {
    article: 'article, .article, .post, [class*="article"], [class*="post"], main',
    title: 'h1, .title, .headline, .article-title, .post-title',
    content: 'article p, .article p, .post p, .content p, [class*="article"] p, [class*="post"] p, main p',
    images: 'article img, .article img, .post img, [class*="article"] img, [class*="post"] img, main img'
  };

  // Get custom selectors from storage if available
  let selectors = defaultSelectors;
  
  try {
    const storedSelectors = localStorage.getItem('gtiContentSelectors');
    if (storedSelectors) {
      selectors = {...defaultSelectors, ...JSON.parse(storedSelectors)};
    }
  } catch (e) {
    console.error('Error getting custom selectors:', e);
  }

  // Extract title
  const titleElements = document.querySelectorAll(selectors.title);
  const title = titleElements.length > 0 ? titleElements[0].textContent.trim() : document.title;

  // Extract text content
  const contentElements = document.querySelectorAll(selectors.content);
  let content = '';
  contentElements.forEach(el => {
    content += el.textContent.trim() + '\n\n';
  });

  // Extract images
  const imageElements = document.querySelectorAll(selectors.images);
  const images = [];
  imageElements.forEach(img => {
    if (img.src && !img.src.startsWith('data:') && !images.includes(img.src)) {
      images.push(img.src);
    }
  });

  // Return the extracted data
  return {
    url: window.location.href,
    title,
    content,
    images,
    timestamp: new Date().toISOString(),
    source: 'standard'
  };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    const extractedContent = extractContent();
    sendResponse(extractedContent);
  } else if (request.action === 'ping') {
    sendResponse({ status: 'ok' });
  }
  // This return is required to use sendResponse asynchronously
  return true;
});
