import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import BookmarkCard from './BookmarkCard';
import EditableText from './EditableText';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit2, FiTrash2, FiGripVertical, FiFolder } = FiIcons;

const BookmarkSection = ({ 
  section, 
  index, 
  viewMode,
  onUpdateSection, 
  onDeleteSection, 
  onAddBookmark,
  onUpdateBookmark,
  onDeleteBookmark 
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateSection = (field, value) => {
    onUpdateSection(section.id, { [field]: value });
  };

  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 ${
            snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'
          }`}
        >
          {/* Section Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    {...provided.dragHandleProps}
                    className="p-1 rounded hover:bg-slate-100 cursor-grab active:cursor-grabbing"
                  >
                    <SafeIcon icon={FiGripVertical} className="w-4 h-4 text-slate-400" />
                  </div>
                  
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: section.color }}
                  />
                  
                  <EditableText
                    value={section.name}
                    onChange={(value) => handleUpdateSection('name', value)}
                    className="text-xl font-semibold text-slate-900"
                    placeholder="Section name"
                  />
                </div>
                
                <EditableText
                  value={section.description}
                  onChange={(value) => handleUpdateSection('description', value)}
                  className="text-slate-600"
                  placeholder="Add a description..."
                />
                
                <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                  <SafeIcon icon={FiFolder} className="w-4 h-4" />
                  <span>{section.bookmarks.length} bookmarks</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAddBookmark(section.id)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Add bookmark"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Edit section"
                >
                  <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onDeleteSection(section.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete section"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Color Picker */}
            {isEditing && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Section Color
                </label>
                <div className="flex gap-2">
                  {['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'].map(color => (
                    <button
                      key={color}
                      onClick={() => handleUpdateSection('color', color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        section.color === color ? 'border-slate-400 scale-110' : 'border-slate-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Bookmarks */}
          <Droppable droppableId={section.id} type="bookmark">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-6 min-h-32 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                }`}
              >
                {section.bookmarks.length > 0 ? (
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' ? 'grid-cols-1' : 'grid-cols-1'
                  }`}>
                    {section.bookmarks.map((bookmark, bookmarkIndex) => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        index={bookmarkIndex}
                        sectionId={section.id}
                        onUpdate={onUpdateBookmark}
                        onDelete={onDeleteBookmark}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <SafeIcon icon={FiPlus} className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm mb-3">No bookmarks yet</p>
                    <button
                      onClick={() => onAddBookmark(section.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Add your first bookmark
                    </button>
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};

export default BookmarkSection;