/**
 * Service to handle image fetching for bookmarks
 */

/**
 * Attempts to fetch a preview image for a given URL
 * @param {string} url - The URL to fetch an image for
 * @returns {Promise<string>} - A URL to an image representing the site
 */
export const getPreviewImage = async (url) => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Try multiple potential sources for preview images
    
    // 1. First try OpenGraph API (in a real app this would be your backend service)
    const ogImage = `https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}/image`;
    
    // 2. Try screenshot service
    const screenshotImage = `https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodeURIComponent(url)}&width=800`;
    
    // 3. Fallback to domain-based placeholder
    const fallbackImage = `https://via.placeholder.com/1200x630/3B82F6/FFFFFF?text=${encodeURIComponent(domain)}`;
    
    // In a real app, you would check if these URLs return valid images
    // For this example, we'll just return the first option and let the component handle fallback
    return ogImage;
  } catch (error) {
    console.error('Error getting preview image:', error);
    return `https://via.placeholder.com/1200x630/3B82F6/FFFFFF?text=${encodeURIComponent(new URL(url).hostname || 'Bookmark')}`;
  }
};

/**
 * Gets a favicon for a URL using Google's favicon service
 * @param {string} url - The URL to get a favicon for
 * @returns {string} - URL to the favicon
 */
export const getFavicon = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (error) {
    console.error('Error getting favicon:', error);
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzlhYTBhNiIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDIgMC04LTMuNTgtOC04czMuNTgtOCA4LTggOCAzLjU4IDggOC0zLjU4IDgtOCA4eiIvPjxwYXRoIGZpbGw9IiM5YWEwYTYiIGQ9Ik0xMiA2Yy0zLjMxIDAtNiAyLjY5LTYgNnMyLjY5IDYgNiA2IDYtMi42OSA2LTYtMi42OS02LTYtNnoiLz48L3N2Zz4=';
  }
};

/**
 * Extracts metadata from a URL
 * @param {string} url - The URL to extract metadata from
 * @returns {Promise<Object>} - Object containing title, description, etc.
 */
export const extractMetadata = async (url) => {
  // In a real app, this would call a backend service that fetches and parses the HTML
  // For this example, we'll simulate a response
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const domain = new URL(url).hostname.replace('www.', '');
      
      resolve({
        title: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
        description: `Website at ${domain}`,
        siteName: domain,
        suggestedTags: [domain.split('.')[0]]
      });
    }, 500);
  });
};