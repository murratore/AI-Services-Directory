import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiExternalLink, FiEdit2, FiTrash2, FiGripVertical, FiGlobe, FiTag, FiStar } = FiIcons;

const BookmarkCompactCard = ({ bookmark, index, onUpdate, onDelete, tagColors, onEdit }) => {
  const [faviconError, setFaviconError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleFaviconError = () => {
    setFaviconError(true);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    onUpdate(bookmark.id, { favorite: !bookmark.favorite });
  };

  // Helper function to get hostname from URL
  const getHostname = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    
    // Only show tooltip if there's description or commentary
    if (bookmark.description || bookmark.commentary) {
      // Calculate position based on mouse position
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
  };

  return (
    <Draggable draggableId={bookmark.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`bg-white rounded-lg border border-slate-200 overflow-hidden transition-all duration-200 ${
            snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md hover:border-slate-300'
          } ${bookmark.favorite ? 'ring-1 ring-yellow-400' : ''}`}
        >
          <div className="p-3 flex items-center">
            {/* Drag Handle */}
            <div
              {...provided.dragHandleProps}
              className="p-1 rounded hover:bg-slate-200 cursor-grab active:cursor-grabbing mr-2"
            >
              <SafeIcon icon={FiGripVertical} className="w-3 h-3 text-slate-400" />
            </div>

            {/* Favicon - Now clickable */}
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex-shrink-0 mr-3 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
              title={`Open ${bookmark.name}`}
            >
              {!faviconError ? (
                <img src={bookmark.favicon} alt={bookmark.name} className="w-6 h-6" onError={handleFaviconError} />
              ) : (
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiGlobe} className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </a>

            {/* Title */}
            <div className="flex-1 truncate">
              <div className="flex items-center">
                {/* Make title clickable */}
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 truncate mr-2 hover:text-blue-600 transition-colors"
                  title={`Open ${bookmark.name}`}
                >
                  {bookmark.name}
                </a>
                <span className="text-xs text-slate-500 truncate hidden sm:inline">
                  {getHostname(bookmark.url)}
                </span>
              </div>

              {/* Tags - Limited to 3 in compact view */}
              <div className="flex items-center gap-1 mt-1 overflow-hidden">
                {bookmark.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-xs text-white"
                    style={{ backgroundColor: tagColors(tag) }}
                  >
                    {tag}
                  </span>
                ))}
                {bookmark.tags.length > 3 && (
                  <span className="text-xs text-slate-500">+{bookmark.tags.length - 3}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-2">
              {/* Favorite Button */}
              <button
                onClick={toggleFavorite}
                className={`p-1.5 rounded-full transition-all ${
                  bookmark.favorite
                    ? 'text-yellow-500 bg-yellow-50'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-yellow-500'
                }`}
                title={bookmark.favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <SafeIcon icon={FiStar} className="w-4 h-4" />
              </button>

              {/* Action Buttons (only visible on hover or mobile) */}
              <div
                className={`flex items-center gap-1 transition-all ${
                  isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
                }`}
              >
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Open link"
                >
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onEdit(bookmark)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                  title="Edit bookmark"
                >
                  <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(bookmark.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete bookmark"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tooltip */}
          {showTooltip && (bookmark.description || bookmark.commentary) && (
            <div
              className="absolute z-50 bg-white rounded-lg shadow-lg border border-slate-200 p-4 max-w-xs w-72"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y + 10}px`
              }}
            >
              {bookmark.description && (
                <div className="mb-2">
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Description</h4>
                  <p className="text-xs text-slate-600">{bookmark.description}</p>
                </div>
              )}
              {bookmark.commentary && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Personal Notes</h4>
                  <p className="text-xs italic text-slate-600">"{bookmark.commentary}"</p>
                </div>
              )}
              <div className="absolute w-3 h-3 bg-white border-t border-l border-slate-200 transform -translate-y-1.5 rotate-45 left-4 -top-1"></div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default BookmarkCompactCard;