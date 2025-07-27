/**
 * Service to fetch and extract metadata from websites
 */
import DOMPurify from 'dompurify';

/**
 * Fetches metadata from a URL using a proxy service to avoid CORS issues
 * @param {string} url - The URL to fetch metadata from
 * @returns {Promise<Object>} - Object containing title, description, etc.
 */
export const fetchMetadata = async (url) => {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, error: 'Invalid URL' };
  }

  try {
    // Use a CORS proxy to avoid cross-origin issues
    // Note: In a production app, you would use your own backend service for this
    const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(corsProxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.contents) {
      throw new Error('No content returned from proxy');
    }
    
    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    // Extract metadata
    const metadata = {
      title: extractTitle(doc),
      description: extractDescription(doc),
      siteName: extractSiteName(doc, url),
      imageUrl: extractImage(doc, url),
      suggestedTags: generateTagSuggestions(doc, url)
    };
    
    return { success: true, metadata };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    
    // Fall back to simpler approach using domain name
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      const suggestedName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
      
      return { 
        success: true, 
        metadata: {
          title: suggestedName,
          description: `Website at ${domain}`,
          siteName: domain,
          suggestedTags: [domain.split('.')[0]]
        }
      };
    } catch (e) {
      return { success: false, error: 'Could not extract metadata' };
    }
  }
};

/**
 * Extracts the title from HTML document
 */
function extractTitle(doc) {
  // Try meta title first, then og:title, then document title, then h1
  const metaTitle = doc.querySelector('meta[name="title"]')?.getAttribute('content');
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
  const docTitle = doc.title;
  const h1 = doc.querySelector('h1')?.textContent;
  
  const title = metaTitle || ogTitle || twitterTitle || docTitle || h1 || '';
  return DOMPurify.sanitize(title).trim();
}

/**
 * Extracts the description from HTML document with enhanced fallbacks
 */
function extractDescription(doc) {
  // Primary sources: meta description, OpenGraph, Twitter
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
  const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
  const twitterDesc = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
  
  // If we have any of the primary sources, use it
  if (metaDesc || ogDesc || twitterDesc) {
    const description = metaDesc || ogDesc || twitterDesc;
    return DOMPurify.sanitize(description).trim();
  }
  
  // Secondary sources: article description, summary elements, or first paragraph
  const articleDesc = doc.querySelector('meta[name="article:description"]')?.getAttribute('content');
  const summaryEl = doc.querySelector('summary, [role="summary"], .summary, .description');
  const firstParagraph = doc.querySelector('p:not(:empty)');
  
  // If we have any secondary sources, use them
  if (articleDesc || summaryEl || firstParagraph) {
    const description = articleDesc || 
                        (summaryEl ? summaryEl.textContent : '') || 
                        (firstParagraph ? firstParagraph.textContent : '');
    
    // Clean and truncate
    let cleanDesc = DOMPurify.sanitize(description).trim();
    if (cleanDesc.length > 300) {
      cleanDesc = cleanDesc.substring(0, 297) + '...';
    }
    return cleanDesc;
  }
  
  // Last resort: Try to extract meaningful content
  const contentElements = Array.from(doc.querySelectorAll('main p, article p, .content p, #content p, .main p, #main p'))
    .filter(el => {
      const text = el.textContent.trim();
      // Filter out short or empty paragraphs and those that are likely navigation or buttons
      return text.length > 30 && text.split(' ').length > 5;
    });
  
  if (contentElements.length > 0) {
    // Take the first substantial paragraph
    let content = contentElements[0].textContent.trim();
    if (content.length > 300) {
      content = content.substring(0, 297) + '...';
    }
    return DOMPurify.sanitize(content);
  }
  
  // If all else fails, return empty string
  return '';
}

/**
 * Extracts the site name from HTML document
 */
function extractSiteName(doc, url) {
  const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
  const twitterSite = doc.querySelector('meta[name="twitter:site"]')?.getAttribute('content');
  const applicationName = doc.querySelector('meta[name="application-name"]')?.getAttribute('content');
  
  if (ogSiteName) {
    return DOMPurify.sanitize(ogSiteName).trim();
  }
  
  if (twitterSite) {
    // Remove @ if present
    return DOMPurify.sanitize(twitterSite.replace(/^@/, '')).trim();
  }
  
  if (applicationName) {
    return DOMPurify.sanitize(applicationName).trim();
  }
  
  // Try to get from title element (e.g., "Page Title | Site Name")
  const titleEl = doc.title;
  if (titleEl && titleEl.includes('|')) {
    const siteName = titleEl.split('|').pop().trim();
    if (siteName) return DOMPurify.sanitize(siteName);
  }
  
  // Fall back to domain name
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  } catch (e) {
    return '';
  }
}

/**
 * Extracts the main image from HTML document
 */
function extractImage(doc, url) {
  // Try og:image first, then twitter:image
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
  const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
  
  let imageUrl = ogImage || twitterImage || '';
  
  // If image URL is relative, convert to absolute
  if (imageUrl && !imageUrl.startsWith('http')) {
    try {
      const baseUrl = new URL(url);
      imageUrl = new URL(imageUrl, baseUrl.origin).href;
    } catch (e) {
      imageUrl = '';
    }
  }
  
  return imageUrl;
}

/**
 * Generates tag suggestions based on page content
 */
function generateTagSuggestions(doc, url) {
  const tags = [];
  
  // Extract from domain
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const domainTag = domain.split('.')[0].toLowerCase();
    tags.push(domainTag);
    
    // Add TLD-based tags
    const tld = domain.split('.').pop();
    if (tld === 'dev' || tld === 'io') tags.push('development');
    if (tld === 'org') tags.push('organization');
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  // Extract from meta keywords
  const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content');
  if (keywords) {
    keywords.split(',').forEach(keyword => {
      const cleaned = keyword.trim().toLowerCase();
      if (cleaned && !tags.includes(cleaned) && cleaned.length < 20) {
        tags.push(cleaned);
      }
    });
  }
  
  // Extract from article tags or categories
  const articleTags = doc.querySelector('meta[property="article:tag"]')?.getAttribute('content');
  if (articleTags) {
    articleTags.split(',').forEach(tag => {
      const cleaned = tag.trim().toLowerCase();
      if (cleaned && !tags.includes(cleaned) && cleaned.length < 20) {
        tags.push(cleaned);
      }
    });
  }
  
  // AI-specific suggestions based on common domains
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('openai') || domain.includes('chatgpt')) {
      tags.push('ai', 'chatbot');
    } else if (domain.includes('claude') || domain.includes('anthropic')) {
      tags.push('ai', 'chatbot');
    } else if (domain.includes('midjourney') || domain.includes('dalle') || domain.includes('leonardo')) {
      tags.push('ai', 'images', 'creative');
    } else if (domain.includes('runway') || domain.includes('pika')) {
      tags.push('ai', 'videos', 'creative');
    } else if (domain.includes('eleven') || domain.includes('murf') || domain.includes('voice')) {
      tags.push('ai', 'voice');
    } else if (domain.includes('suno') || domain.includes('udio') || domain.includes('music')) {
      tags.push('ai', 'music');
    } else if (domain.includes('github') && url.includes('copilot')) {
      tags.push('ai', 'coding', 'development');
    } else if (domain.includes('huggingface')) {
      tags.push('ai', 'development');
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  // Remove duplicates and limit number of tags
  return [...new Set(tags)].slice(0, 5);
}