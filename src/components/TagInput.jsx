import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiPlus } = FiIcons;

const TagInput = ({ tags, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <SafeIcon icon={FiX} className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      
      <div className="flex gap-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag..."
          className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs"
        />
        <button
          onClick={addTag}
          disabled={!inputValue.trim()}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SafeIcon icon={FiPlus} className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default TagInput;