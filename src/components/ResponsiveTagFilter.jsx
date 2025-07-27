import React, { useState, useRef, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiChevronDown, FiX, FiTag, FiStar, FiSearch, FiFilter, FiSettings } = FiIcons;

const ResponsiveTagFilter = ({ 
  allTags, 
  tagCounts, 
  selectedTag, 
  onTagSelect, 
  showFavoritesOnly,
  onToggleFavorites,
  getTagColor,
  onManageTags
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter tags based on search term
  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort tags by count (descending) and then alphabetically for ties
  const sortedTags = filteredTags.sort((a, b) => {
    const countDiff = (tagCounts[b] || 0) - (tagCounts[a] || 0);
    if (countDiff === 0) {
      return a.localeCompare(b); // alphabetical for same count
    }
    return countDiff;
  });

  const handleTagSelect = (tag) => {
    onTagSelect(tag);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    onTagSelect('all');
    setIsDropdownOpen(false);
  };

  // Show tooltip briefly when no tags are available
  useEffect(() => {
    if (allTags.length === 0) {
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [allTags.length]);

  return (
    <div className="space-y-4">
      {/* Filter Controls - Row 1: Favorites & Tag Management */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left side: Favorites Toggle */}
        <button
          onClick={onToggleFavorites}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            showFavoritesOnly
              ? 'bg-yellow-400 text-white shadow-md hover:bg-yellow-500'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <SafeIcon icon={FiStar} className="w-4 h-4" />
          {showFavoritesOnly ? 'Showing Favorites' : 'Show Favorites'}
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              showFavoritesOnly 
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {tagCounts.favorites || 0}
          </span>
        </button>

        {/* Right side: Tag Management */}
        {onManageTags && (
          <button
            onClick={onManageTags}
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            title="Manage Tags"
          >
            <SafeIcon icon={FiSettings} className="w-4 h-4" />
            <span className="hidden sm:inline">Manage Tags</span>
          </button>
        )}
      </div>

      {/* Tag Filter */}
      <div className="relative" ref={dropdownRef}>
        {/* Mobile/Responsive Dropdown */}
        <div className="block sm:hidden">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-left flex items-center justify-between ${
              selectedTag !== 'all' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiFilter} className="w-4 h-4 text-slate-500" />
              <span className="font-medium">
                {selectedTag === 'all' ? 'All Tags' : selectedTag}
              </span>
              {selectedTag !== 'all' && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                  {tagCounts[selectedTag] || 0}
                </span>
              )}
            </div>
            <SafeIcon 
              icon={FiChevronDown} 
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Mobile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-slate-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiSearch} className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tags..."
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tag Options */}
              <div className="max-h-60 overflow-y-auto">
                {/* All Tags Option */}
                <button
                  onClick={() => handleTagSelect('all')}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between ${
                    selectedTag === 'all' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiTag} className="w-4 h-4" />
                    <span>All Tags</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {tagCounts.all || 0}
                  </span>
                </button>

                {/* Individual Tags */}
                {sortedTags.length > 0 ? (
                  sortedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagSelect(tag)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between ${
                        selectedTag === tag ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getTagColor(tag) }}
                        />
                        <span className="truncate">{tag}</span>
                      </div>
                      <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                        {tagCounts[tag] || 0}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-slate-500">
                    {searchTerm ? 'No matching tags found' : 'No tags available'}
                  </div>
                )}
              </div>

              {/* Clear Selection */}
              {selectedTag !== 'all' && (
                <div className="p-2 border-t border-slate-200">
                  <button
                    onClick={clearSelection}
                    className="w-full px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded flex items-center gap-2"
                  >
                    <SafeIcon icon={FiX} className="w-3 h-3" />
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Horizontal Scrollable Tags */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* All Tags Button */}
            <button
              onClick={() => onTagSelect('all')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                selectedTag === 'all' 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <SafeIcon icon={FiTag} className="w-4 h-4" />
              All Tags
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                selectedTag === 'all' 
                  ? 'bg-slate-700 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {tagCounts.all || 0}
              </span>
            </button>

            {/* Individual Tag Buttons */}
            {allTags.length > 0 ? (
              sortedTags.slice(0, 20).map(tag => (
                <button
                  key={tag}
                  onClick={() => onTagSelect(tag)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    selectedTag === tag 
                      ? 'text-white shadow-md' 
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                  style={{ 
                    backgroundColor: selectedTag === tag ? getTagColor(tag) : '',
                    color: selectedTag === tag ? 'white' : '' 
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: selectedTag === tag ? 'rgba(255,255,255,0.3)' : getTagColor(tag) 
                    }}
                  />
                  {tag}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    selectedTag === tag 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tagCounts[tag] || 0}
                  </span>
                </button>
              ))
            ) : (
              <div className="relative">
                {showTooltip && (
                  <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 shadow-lg rounded-lg p-3 z-10 w-60">
                    <p className="text-sm text-slate-600">
                      Add tags to your bookmarks to filter by them here.
                    </p>
                  </div>
                )}
                <div className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-400 whitespace-nowrap flex-shrink-0">
                  No tags available
                </div>
              </div>
            )}

            {/* Show More Button if there are many tags */}
            {allTags.length > 20 && (
              <button
                onClick={() => setIsDropdownOpen(true)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              >
                <SafeIcon icon={FiChevronDown} className="w-4 h-4" />
                +{allTags.length - 20} more
              </button>
            )}
          </div>

          {/* Scrollable styles */}
          <style jsx>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>

        {/* Desktop dropdown for "more tags" */}
        {isDropdownOpen && allTags.length > 20 && (
          <div className="hidden sm:block absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-80 max-h-96 overflow-hidden">
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiSearch} className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-2">
              <div className="grid grid-cols-1 gap-1">
                {sortedTags.slice(20).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`px-3 py-2 text-left hover:bg-slate-50 rounded flex items-center justify-between ${
                      selectedTag === tag ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getTagColor(tag) }}
                      />
                      <span className="truncate">{tag}</span>
                    </div>
                    <span className="text-xs text-slate-500 ml-2">
                      {tagCounts[tag] || 0}
                    </span>
                  </button>
                ))}

                {searchTerm && sortedTags.length === 0 && (
                  <div className="px-3 py-4 text-center text-slate-500">
                    No matching tags found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Selection Indicator */}
      {selectedTag !== 'all' && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Filtered by:</span>
          <span 
            className="px-2 py-1 rounded text-white text-xs font-medium"
            style={{ backgroundColor: getTagColor(selectedTag) }}
          >
            {selectedTag}
          </span>
          <button
            onClick={clearSelection}
            className="text-slate-400 hover:text-slate-600"
            title="Clear filter"
          >
            <SafeIcon icon={FiX} className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ResponsiveTagFilter;