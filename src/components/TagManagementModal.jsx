import React from 'react';
import SafeIcon from '../common/SafeIcon';
import TagManager from './TagManager';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiTag } = FiIcons;

const TagManagementModal = ({ 
  isOpen, 
  onClose, 
  allTags, 
  tagCounts, 
  onRenameTag, 
  onDeleteTag, 
  onMergeTags 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTag} className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Tag Management</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6">
          <TagManager
            allTags={allTags}
            tagCounts={tagCounts}
            onRenameTag={onRenameTag}
            onDeleteTag={onDeleteTag}
            onMergeTags={onMergeTags}
          />
        </div>
      </div>
    </div>
  );
};

export default TagManagementModal;