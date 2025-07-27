import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import EditableText from './EditableText';
import TagInput from './TagInput';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiExternalLink, FiEdit2, FiTrash2, FiGripVertical, FiGlobe, FiTag, FiLock, FiStar } = FiIcons;

const BookmarkCard = ({ bookmark, index, onUpdate, onDelete, tagColors, onEdit }) => {
  const [faviconError, setFaviconError] = useState(false);

  const handleFaviconError = () => {
    setFaviconError(true);
  };

  // Helper function to get hostname from URL
  const getHostname = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    onUpdate(bookmark.id, { favorite: !bookmark.favorite });
  };

  return (
    <Draggable draggableId={bookmark.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white rounded-lg border border-slate-200 overflow-hidden transition-all duration-200 flex flex-col ${
            snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md hover:border-slate-300'
          } ${bookmark.favorite ? 'ring-2 ring-yellow-400' : ''}`}
        >
          {/* Header with Favicon - Now clickable */}
          <a 
            href={bookmark.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full h-20 bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
            title={`Open ${bookmark.name}`}
          >
            {!faviconError ? (
              <img src={bookmark.favicon} alt={bookmark.name} className="w-8 h-8" onError={handleFaviconError} />
            ) : (
              <SafeIcon icon={FiGlobe} className="w-8 h-8 text-slate-400" />
            )}

            {/* Favorite star */}
            <button
              onClick={toggleFavorite}
              className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                bookmark.favorite
                  ? 'bg-yellow-400 text-white shadow-md hover:bg-yellow-500'
                  : 'bg-white/80 text-slate-400 hover:bg-slate-100 hover:text-yellow-500'
              }`}
            >
              <SafeIcon icon={FiStar} className={`w-4 h-4 ${bookmark.favorite ? 'text-white' : ''}`} />
            </button>

            {/* Domain overlay */}
            <div className="absolute bottom-2 left-2 right-2">
              <span className="text-xs font-medium text-slate-500 truncate block text-center">
                {getHostname(bookmark.url)}
              </span>
            </div>
          </a>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    {...provided.dragHandleProps}
                    className="p-1 rounded hover:bg-slate-200 cursor-grab active:cursor-grabbing"
                  >
                    <SafeIcon icon={FiGripVertical} className="w-3 h-3 text-slate-400" />
                  </div>
                  {/* Make title clickable */}
                  <a 
                    href={bookmark.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                    title={`Open ${bookmark.name}`}
                  >
                    {bookmark.name}
                  </a>
                </div>

                {bookmark.description && (
                  <p className="text-sm text-slate-600 mb-2">
                    {bookmark.description}
                  </p>
                )}

                {bookmark.commentary && (
                  <p className="text-xs text-slate-600 italic mb-3">
                    "{bookmark.commentary}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Open bookmark"
                >
                  <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                </a>
                <button
                  onClick={() => onEdit(bookmark)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                  title="Edit bookmark"
                >
                  <SafeIcon icon={FiEdit2} className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDelete(bookmark.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete bookmark"
                >
                  <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Tags */}
            {bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto pt-3">
                {bookmark.tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white"
                    style={{ backgroundColor: tagColors(tag) }}
                  >
                    <SafeIcon icon={FiTag} className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default BookmarkCard;