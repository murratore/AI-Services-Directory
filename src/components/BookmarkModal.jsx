import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import { fetchMetadata } from '../services/metadataService';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiGlobe, FiPlus, FiTag, FiStar, FiLoader, FiAlertCircle, FiInfo } = FiIcons;

const BookmarkModal = ({ onClose, onSave, existingTags = [], bookmark = null }) => {
  const isEditing = !!bookmark;
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    commentary: '',
    tags: [],
    favorite: false
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [metadataError, setMetadataError] = useState(null);
  const [metadataFetched, setMetadataFetched] = useState(false);
  const [descriptionSource, setDescriptionSource] = useState('');

  // Initialize form data if editing an existing bookmark
  useEffect(() => {
    if (bookmark) {
      setFormData({
        name: bookmark.name || '',
        url: bookmark.url || '',
        description: bookmark.description || '',
        commentary: bookmark.commentary || '',
        tags: bookmark.tags || [],
        favorite: bookmark.favorite || false
      });
    }
  }, [bookmark]);

  // Function to fetch metadata from URL
  const extractMetadata = async (url) => {
    if (!url || !url.trim().startsWith('http')) return;
    
    setIsLoading(true);
    setMetadataError(null);
    
    try {
      const result = await fetchMetadata(url);
      
      if (result.success) {
        // Only update fields that aren't already populated by user
        const updatedData = { ...formData };
        
        if (!formData.name || formData.name === '') {
          updatedData.name = result.metadata.title || '';
        }
        
        if (!formData.description || formData.description === '') {
          updatedData.description = result.metadata.description || '';
          // Set description source for UI feedback
          if (result.metadata.description) {
            setDescriptionSource('metadata');
          } else {
            setDescriptionSource('fallback');
          }
        }
        
        // Only suggest tags, don't automatically add them
        const newSuggestedTags = (result.metadata.suggestedTags || [])
          .filter(tag => !formData.tags.includes(tag))
          .filter((tag, index, self) => self.indexOf(tag) === index);
          
        setSuggestedTags(newSuggestedTags);
        setFormData(updatedData);
        setMetadataFetched(true);
      } else {
        setMetadataError(result.error || 'Failed to extract website information');
        setDescriptionSource('error');
      }
    } catch (error) {
      console.error("Error extracting metadata:", error);
      setMetadataError("Failed to extract website information");
      setDescriptionSource('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Try to extract metadata when URL changes and we're not editing
  useEffect(() => {
    // Don't auto-fetch if editing an existing bookmark
    if (isEditing) return;
    
    // Use a timeout to avoid excessive API calls while typing
    const timeoutId = setTimeout(() => {
      if (formData.url && !metadataFetched) {
        extractMetadata(formData.url);
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [formData.url, isEditing, metadataFetched]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.url.trim()) {
      onSave(formData, bookmark?.id);
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset metadata fetched flag when URL changes
    if (field === 'url') {
      setMetadataFetched(false);
      setMetadataError(null);
      setDescriptionSource('');
    }
  };

  const toggleFavorite = () => {
    handleChange('favorite', !formData.favorite);
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      handleChange('tags', [...formData.tags, trimmedTag]);
      setTagInput('');
    }
  };

  const addSuggestedTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      handleChange('tags', [...formData.tags, tag]);
      setSuggestedTags(prev => prev.filter(t => t !== tag));
    }
  };

  const removeTag = (tagToRemove) => {
    handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  const handleManualFetch = () => {
    extractMetadata(formData.url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? 'Edit AI App' : 'Add New AI App'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* URL Input - First for better UX */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiGlobe} className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              {/* Metadata Fetch Status */}
              <div className="mt-2 flex items-center justify-between">
                {isLoading ? (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <SafeIcon icon={FiLoader} className="w-3 h-3 animate-spin" />
                    Fetching website information...
                  </p>
                ) : metadataError ? (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <SafeIcon icon={FiAlertCircle} className="w-3 h-3" />
                    {metadataError}
                  </p>
                ) : metadataFetched ? (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <SafeIcon icon={FiInfo} className="w-3 h-3" />
                    Website data retrieved successfully
                  </p>
                ) : formData.url ? (
                  <p className="text-xs text-slate-500">Enter a valid URL to fetch website information</p>
                ) : null}
                
                {formData.url && !isLoading && (
                  <button
                    type="button"
                    onClick={handleManualFetch}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Refresh metadata
                  </button>
                )}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                App Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ChatGPT"
                required
              />
            </div>

            {/* Favorite Toggle */}
            <div>
              <button
                type="button"
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
                  formData.favorite
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <SafeIcon
                  icon={FiStar}
                  className={`w-5 h-5 ${formData.favorite ? 'text-yellow-500' : 'text-slate-400'}`}
                />
                {formData.favorite ? 'Marked as Favorite' : 'Mark as Favorite'}
              </button>
            </div>

            {/* Description Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                {formData.description && (
                  <span className="text-xs text-slate-500">
                    {formData.description.length}/300 characters
                  </span>
                )}
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  descriptionSource === 'metadata' ? 'border-green-300 bg-green-50' : 
                  descriptionSource === 'fallback' ? 'border-amber-300 bg-amber-50' : 
                  'border-slate-200'
                }`}
                placeholder="Brief description of the AI application..."
                rows={2}
                maxLength={300}
              />
              
              {/* Description source info */}
              {descriptionSource === 'metadata' && formData.description && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <SafeIcon icon={FiInfo} className="w-3 h-3" />
                  Description extracted from website's metadata
                </p>
              )}
              
              {descriptionSource === 'fallback' && formData.description && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <SafeIcon icon={FiInfo} className="w-3 h-3" />
                  Description extracted from website content
                </p>
              )}
              
              {!formData.description && !isLoading && formData.url && (
                <p className="text-xs text-blue-600 mt-1">
                  Description will be automatically populated from the website metadata when available
                </p>
              )}
            </div>

            {/* Commentary Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Personal Notes
              </label>
              <textarea
                value={formData.commentary}
                onChange={(e) => handleChange('commentary', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your personal experience or notes about this AI app..."
                rows={2}
              />
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags
              </label>
              
              {/* Tag display */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <SafeIcon icon={FiX} className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag suggestions */}
              {suggestedTags.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-2">Suggested tags from website:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addSuggestedTag(tag)}
                        className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs hover:bg-slate-200 flex items-center gap-1"
                      >
                        <SafeIcon icon={FiTag} className="w-3 h-3" />
                        {tag}
                        <SafeIcon icon={FiPlus} className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing tags */}
              {existingTags.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-2">Existing tags:</p>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {existingTags
                      .filter(tag => !formData.tags.includes(tag))
                      .slice(0, 20)
                      .map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addSuggestedTag(tag)}
                          className="px-2 py-1 bg-slate-50 text-slate-700 rounded text-xs hover:bg-slate-100 flex items-center gap-1 border border-slate-200"
                        >
                          <SafeIcon icon={FiTag} className="w-3 h-3" />
                          {tag}
                          <SafeIcon icon={FiPlus} className="w-3 h-3" />
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Tag input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a custom tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {isEditing ? 'Save Changes' : 'Add AI App'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookmarkModal;