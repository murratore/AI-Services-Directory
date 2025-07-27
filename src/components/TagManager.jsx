import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiEdit2, FiCheck, FiTrash2, FiTag, FiPlus, FiAlertTriangle } = FiIcons;

const TagManager = ({ allTags, tagCounts, onRenameTag, onDeleteTag, onMergeTags }) => {
  const [editingTag, setEditingTag] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [mergeTarget, setMergeTarget] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleStartEdit = (tag) => {
    setEditingTag(tag);
    setNewTagName(tag);
  };

  const handleSaveEdit = () => {
    if (newTagName.trim() && newTagName !== editingTag) {
      onRenameTag(editingTag, newTagName.trim());
    }
    setEditingTag(null);
    setNewTagName('');
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setNewTagName('');
  };

  const handleConfirmDelete = (tag) => {
    setConfirmDelete(tag);
  };

  const handleDeleteTag = () => {
    if (confirmDelete) {
      onDeleteTag(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleToggleSelectTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleMergeTags = () => {
    if (selectedTags.length < 2 || !mergeTarget.trim()) {
      alert('Please select at least 2 tags to merge and specify a target name.');
      return;
    }
    
    onMergeTags(selectedTags, mergeTarget.trim());
    setSelectedTags([]);
    setMergeTarget('');
  };

  return (
    <div className="space-y-6">
      {/* Tag List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Manage Tags</h3>
        
        {allTags.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiTag} className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-600">No tags available</p>
            <p className="text-sm text-slate-500 mt-2">
              Tags will appear here when you add them to bookmarks
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allTags.map(tag => (
              <div key={tag} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleToggleSelectTag(tag)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  
                  {editingTag === tag ? (
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <SafeIcon icon={FiTag} className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-900">{tag}</span>
                      <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        {tagCounts[tag] || 0}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {editingTag === tag ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Save changes"
                      >
                        <SafeIcon icon={FiCheck} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                        title="Cancel"
                      >
                        <SafeIcon icon={FiX} className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(tag)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded"
                        title="Edit tag"
                      >
                        <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleConfirmDelete(tag)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"
                        title="Delete tag"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Delete Tag</h4>
              <p className="text-sm text-red-700 my-2">
                Are you sure you want to delete the tag "{confirmDelete}"? 
                This will remove it from all bookmarks.
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleDeleteTag}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete Tag
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merge Tags */}
      {selectedTags.length > 1 && (
        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-semibold text-slate-900 mb-3">Merge Selected Tags</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                Selected tags ({selectedTags.length}): {selectedTags.join(', ')}
              </p>
              <input
                type="text"
                value={mergeTarget}
                onChange={(e) => setMergeTarget(e.target.value)}
                placeholder="Enter target tag name..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMergeTags}
                disabled={!mergeTarget.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                Merge Tags
              </button>
              <button
                onClick={() => {
                  setSelectedTags([]);
                  setMergeTarget('');
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Management Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-medium mb-2">Tag Management Tips:</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Edit tags to rename them across all bookmarks</li>
          <li>Delete tags to remove them from all bookmarks</li>
          <li>Select multiple tags and merge them into a single tag</li>
        </ul>
      </div>
    </div>
  );
};

export default TagManager;