import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiGlobe, FiPlus, FiTag } = FiIcons;

const BookmarkModal = ({ onClose, onSave, existingTags = [], bookmark = null }) => {
  const isEditing = !!bookmark;
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    commentary: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);

  // AI-focused suggested tags
  const aiSuggestedTags = [
    'ai', 'chatbot', 'machine-learning', 'nlp', 'computer-vision', 
    'generative-ai', 'llm', 'automation', 'productivity', 'creative',
    'coding', 'writing', 'image-generation', 'video', 'audio',
    'research', 'analytics', 'development', 'openai', 'anthropic'
  ];

  // Initialize form data if editing an existing bookmark
  useEffect(() => {
    if (bookmark) {
      setFormData({
        name: bookmark.name || '',
        url: bookmark.url || '',
        description: bookmark.description || '',
        commentary: bookmark.commentary || '',
        tags: bookmark.tags || []
      });
    }
  }, [bookmark]);

  // Try to extract metadata when URL changes and we're not editing
  useEffect(() => {
    const extractMetadata = async () => {
      try {
        if (!formData.url || !formData.url.startsWith('http') || isEditing) return;
        
        setIsLoading(true);
        
        // Simulate metadata extraction with AI-focused suggestions
        setTimeout(() => {
          const domain = new URL(formData.url).hostname.replace('www.', '');
          
          // Auto-suggest title based on URL
          if (!formData.name) {
            let suggestedName = domain.split('.')[0];
            suggestedName = suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1);
            
            setFormData(prev => ({
              ...prev,
              name: suggestedName
            }));
          }
          
          // Generate AI-focused suggested tags based on URL
          const urlSuggestedTags = [];
          
          // Add domain-based tag
          const domainName = domain.split('.')[0].toLowerCase();
          urlSuggestedTags.push(domainName);
          
          // Add AI-specific suggestions based on common AI domains
          if (domain.includes('openai') || domain.includes('chatgpt')) {
            urlSuggestedTags.push('ai', 'chatbot', 'openai');
          } else if (domain.includes('claude') || domain.includes('anthropic')) {
            urlSuggestedTags.push('ai', 'chatbot', 'anthropic');
          } else if (domain.includes('midjourney') || domain.includes('dalle')) {
            urlSuggestedTags.push('ai', 'image-generation', 'creative');
          } else if (domain.includes('github') && formData.url.includes('copilot')) {
            urlSuggestedTags.push('ai', 'coding', 'development');
          } else if (domain.includes('huggingface')) {
            urlSuggestedTags.push('ai', 'machine-learning', 'models');
          } else {
            // Default AI suggestions
            urlSuggestedTags.push('ai', 'productivity');
          }
          
          // Filter out existing tags and set suggestions
          const filteredSuggestions = urlSuggestedTags
            .filter(tag => !formData.tags.includes(tag))
            .filter((tag, index, self) => self.indexOf(tag) === index);
          
          setSuggestedTags(filteredSuggestions);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error extracting metadata:", error);
        setIsLoading(false);
      }
    };

    extractMetadata();
  }, [formData.url, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.url.trim()) {
      onSave(formData, bookmark?.id);
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              {isLoading && (
                <p className="text-xs text-blue-600 mt-1">Extracting app information...</p>
              )}
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

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the AI application..."
                rows={2}
              />
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
                  <p className="text-xs text-slate-500 mb-2">Suggested tags:</p>
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

              {/* Common AI tags */}
              {aiSuggestedTags.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-2">Popular AI tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestedTags
                      .filter(tag => !formData.tags.includes(tag))
                      .slice(0, 10)
                      .map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addSuggestedTag(tag)}
                          className="px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-slate-700 rounded text-xs hover:from-blue-100 hover:to-purple-100 flex items-center gap-1 border border-slate-200"
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