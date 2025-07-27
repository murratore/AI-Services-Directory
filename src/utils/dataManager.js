/**
 * Utility functions for exporting and importing bookmark data
 */

/**
 * Exports bookmarks to a JSON file and triggers download
 * @param {Array} bookmarks - Array of bookmark objects
 * @param {string} filename - Optional filename (defaults to timestamp)
 */
export const exportBookmarks = (bookmarks, filename = null) => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `bookmarks-export-${timestamp}.json`;
    const finalFilename = filename || defaultFilename;
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      bookmarksCount: bookmarks.length,
      bookmarks: bookmarks.map(bookmark => ({
        id: bookmark.id,
        name: bookmark.name,
        url: bookmark.url,
        description: bookmark.description || '',
        commentary: bookmark.commentary || '',
        tags: bookmark.tags || [],
        favicon: bookmark.favicon || '',
        createdAt: bookmark.createdAt || new Date().toISOString()
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, filename: finalFilename, count: bookmarks.length };
  } catch (error) {
    console.error('Error exporting bookmarks:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Imports bookmarks from a JSON file
 * @param {File} file - The JSON file to import
 * @returns {Promise<Object>} - Result object with success status and data
 */
export const importBookmarks = (file) => {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ success: false, error: 'No file provided' });
      return;
    }
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      resolve({ success: false, error: 'Please select a valid JSON file' });
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Validate the JSON structure
        if (!jsonData.bookmarks || !Array.isArray(jsonData.bookmarks)) {
          resolve({ success: false, error: 'Invalid file format: missing bookmarks array' });
          return;
        }
        
        // Validate and clean bookmark data
        const validBookmarks = jsonData.bookmarks
          .filter(bookmark => bookmark.name && bookmark.url)
          .map(bookmark => ({
            id: bookmark.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: bookmark.name,
            url: bookmark.url,
            description: bookmark.description || '',
            commentary: bookmark.commentary || '',
            tags: Array.isArray(bookmark.tags) ? bookmark.tags : [],
            favicon: bookmark.favicon || `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`,
            createdAt: bookmark.createdAt || new Date().toISOString()
          }));
        
        if (validBookmarks.length === 0) {
          resolve({ success: false, error: 'No valid bookmarks found in the file' });
          return;
        }
        
        resolve({
          success: true,
          bookmarks: validBookmarks,
          metadata: {
            originalCount: jsonData.bookmarks.length,
            validCount: validBookmarks.length,
            exportDate: jsonData.exportDate,
            version: jsonData.version
          }
        });
        
      } catch (error) {
        resolve({ success: false, error: 'Invalid JSON file: ' + error.message });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, error: 'Error reading file' });
    };
    
    reader.readAsText(file);
  });
};

/**
 * Validates bookmark data structure
 * @param {Object} bookmark - Bookmark object to validate
 * @returns {boolean} - Whether the bookmark is valid
 */
export const validateBookmark = (bookmark) => {
  if (!bookmark || typeof bookmark !== 'object') return false;
  if (!bookmark.name || typeof bookmark.name !== 'string') return false;
  if (!bookmark.url || typeof bookmark.url !== 'string') return false;
  
  try {
    new URL(bookmark.url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Merges imported bookmarks with existing ones, avoiding duplicates
 * @param {Array} existingBookmarks - Current bookmarks
 * @param {Array} importedBookmarks - Bookmarks to import
 * @param {string} duplicateStrategy - 'skip', 'replace', or 'rename'
 * @returns {Object} - Result with merged bookmarks and statistics
 */
export const mergeBookmarks = (existingBookmarks, importedBookmarks, duplicateStrategy = 'skip') => {
  const existingUrls = new Set(existingBookmarks.map(b => b.url.toLowerCase()));
  const existingNames = new Set(existingBookmarks.map(b => b.name.toLowerCase()));
  
  let added = 0;
  let skipped = 0;
  let replaced = 0;
  
  const mergedBookmarks = [...existingBookmarks];
  
  importedBookmarks.forEach(importedBookmark => {
    const urlExists = existingUrls.has(importedBookmark.url.toLowerCase());
    const nameExists = existingNames.has(importedBookmark.name.toLowerCase());
    
    if (urlExists) {
      if (duplicateStrategy === 'replace') {
        const index = mergedBookmarks.findIndex(b => b.url.toLowerCase() === importedBookmark.url.toLowerCase());
        if (index !== -1) {
          mergedBookmarks[index] = importedBookmark;
          replaced++;
        }
      } else {
        skipped++;
      }
    } else if (nameExists && duplicateStrategy === 'rename') {
      let counter = 1;
      let newName = `${importedBookmark.name} (${counter})`;
      while (existingNames.has(newName.toLowerCase())) {
        counter++;
        newName = `${importedBookmark.name} (${counter})`;
      }
      mergedBookmarks.push({ ...importedBookmark, name: newName });
      existingNames.add(newName.toLowerCase());
      existingUrls.add(importedBookmark.url.toLowerCase());
      added++;
    } else {
      mergedBookmarks.push(importedBookmark);
      existingNames.add(importedBookmark.name.toLowerCase());
      existingUrls.add(importedBookmark.url.toLowerCase());
      added++;
    }
  });
  
  return {
    bookmarks: mergedBookmarks,
    statistics: { added, skipped, replaced, total: importedBookmarks.length }
  };
};