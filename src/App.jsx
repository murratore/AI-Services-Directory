import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import BookmarkCard from './components/BookmarkCard';
import BookmarkModal from './components/BookmarkModal';
import ImportExportModal from './components/ImportExportModal';
import SearchBar from './components/SearchBar';
import SafeIcon from './common/SafeIcon';
import { exportBookmarks, importBookmarks, mergeBookmarks } from './utils/dataManager';
import * as FiIcons from 'react-icons/fi';
import './App.css';

const { FiPlus, FiGrid, FiList, FiTag, FiCpu, FiDownload, FiUpload } = FiIcons;

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [modalData, setModalData] = useState({ isOpen: false, bookmark: null });
  const [importExportModal, setImportExportModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState('all');
  const [tagCounts, setTagCounts] = useState({});

  // Initialize with AI-focused sample data
  useEffect(() => {
    const sampleBookmarks = [
      {
        id: '1',
        name: 'ChatGPT',
        url: 'https://chat.openai.com',
        description: 'AI-powered conversational assistant by OpenAI',
        commentary: 'Revolutionary AI chatbot for coding, writing, and problem-solving',
        tags: ['ai', 'chatbot', 'openai', 'productivity'],
        favicon: 'https://chat.openai.com/favicon.ico'
      },
      {
        id: '2',
        name: 'Claude',
        url: 'https://claude.ai',
        description: 'Anthropic\'s helpful, harmless, and honest AI assistant',
        commentary: 'Great for detailed analysis and creative writing tasks',
        tags: ['ai', 'chatbot', 'anthropic', 'writing'],
        favicon: 'https://claude.ai/favicon.ico'
      },
      {
        id: '3',
        name: 'Midjourney',
        url: 'https://midjourney.com',
        description: 'AI-powered image generation platform',
        commentary: 'Creates stunning artwork and visuals from text prompts',
        tags: ['ai', 'image-generation', 'art', 'creative'],
        favicon: 'https://midjourney.com/favicon.ico'
      },
      {
        id: '4',
        name: 'GitHub Copilot',
        url: 'https://github.com/features/copilot',
        description: 'AI pair programmer that helps you write code faster',
        commentary: 'Essential tool for developers - saves hours of coding time',
        tags: ['ai', 'coding', 'github', 'development'],
        favicon: 'https://github.com/favicon.ico'
      },
      {
        id: '5',
        name: 'Hugging Face',
        url: 'https://huggingface.co',
        description: 'The AI community building the future',
        commentary: 'Best platform for AI models, datasets, and spaces',
        tags: ['ai', 'machine-learning', 'models', 'community'],
        favicon: 'https://huggingface.co/favicon.ico'
      },
      {
        id: '6',
        name: 'Runway ML',
        url: 'https://runwayml.com',
        description: 'AI-powered creative tools for video and image editing',
        commentary: 'Incredible AI video generation and editing capabilities',
        tags: ['ai', 'video', 'creative', 'editing'],
        favicon: 'https://runwayml.com/favicon.ico'
      },
      {
        id: '7',
        name: 'Perplexity AI',
        url: 'https://perplexity.ai',
        description: 'AI-powered search engine and research assistant',
        commentary: 'Perfect for research with cited sources and real-time data',
        tags: ['ai', 'search', 'research', 'productivity'],
        favicon: 'https://perplexity.ai/favicon.ico'
      },
      {
        id: '8',
        name: 'Notion AI',
        url: 'https://notion.so/product/ai',
        description: 'AI writing assistant integrated into Notion workspace',
        commentary: 'Seamlessly enhances productivity within Notion pages',
        tags: ['ai', 'productivity', 'writing', 'workspace'],
        favicon: 'https://notion.so/favicon.ico'
      }
    ];
    
    setBookmarks(sampleBookmarks);
    updateTagCounts(sampleBookmarks);
  }, []);

  // Update tag counts when bookmarks change
  const updateTagCounts = (bookmarkList) => {
    const counts = { all: bookmarkList.length };
    bookmarkList.forEach(bookmark => {
      bookmark.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    setTagCounts(counts);
  };

  const handleDragEnd = (result) => {
    const { destination, source } = result;
    
    if (!destination) return;
    
    const newBookmarks = Array.from(bookmarks);
    const [removed] = newBookmarks.splice(source.index, 1);
    newBookmarks.splice(destination.index, 0, removed);
    
    setBookmarks(newBookmarks);
  };

  const handleOpenModal = (bookmark = null) => {
    setModalData({ isOpen: true, bookmark });
  };

  const handleCloseModal = () => {
    setModalData({ isOpen: false, bookmark: null });
  };

  const handleSaveBookmark = (bookmarkData, existingId = null) => {
    try {
      if (existingId) {
        // Update existing bookmark
        const updatedBookmarks = bookmarks.map(bookmark => 
          bookmark.id === existingId ? { ...bookmark, ...bookmarkData } : bookmark
        );
        setBookmarks(updatedBookmarks);
        updateTagCounts(updatedBookmarks);
      } else {
        // Add new bookmark
        // Generate a unique ID
        const newId = Date.now().toString();
        
        // Get favicon using Google's favicon service
        const favicon = `https://www.google.com/s2/favicons?domain=${new URL(bookmarkData.url).hostname}&sz=32`;
        
        const newBookmark = {
          id: newId,
          ...bookmarkData,
          favicon
        };
        
        const updatedBookmarks = [...bookmarks, newBookmark];
        setBookmarks(updatedBookmarks);
        updateTagCounts(updatedBookmarks);
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  };

  const deleteBookmark = (bookmarkId) => {
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
    setBookmarks(updatedBookmarks);
    updateTagCounts(updatedBookmarks);
  };

  // Export functionality
  const handleExportBookmarks = () => {
    const result = exportBookmarks(bookmarks);
    if (result.success) {
      console.log(`Exported ${result.count} AI apps to ${result.filename}`);
    } else {
      console.error('Export failed:', result.error);
    }
  };

  // Import functionality
  const handleImportBookmarks = async (file, duplicateStrategy) => {
    const importResult = await importBookmarks(file);
    
    if (!importResult.success) {
      return importResult;
    }

    const mergeResult = mergeBookmarks(bookmarks, importResult.bookmarks, duplicateStrategy);
    setBookmarks(mergeResult.bookmarks);
    updateTagCounts(mergeResult.bookmarks);

    return {
      success: true,
      statistics: mergeResult.statistics,
      metadata: importResult.metadata
    };
  };

  // Get all unique tags from bookmarks
  const allTags = [...new Set(bookmarks.flatMap(bookmark => bookmark.tags))].sort();

  // Filter bookmarks based on search term and selected tag
  const filteredBookmarks = bookmarks.filter(bookmark => {
    // Search filter
    const matchesSearch = 
      bookmark.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Tag filter
    const matchesTag = selectedTag === 'all' || bookmark.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Get tag colors - assign consistent colors to each tag
  const getTagColor = (tag) => {
    const colors = [
      '#3B82F6', // blue
      '#EC4899', // pink
      '#10B981', // green
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // purple
      '#06B6D4', // cyan
      '#84CC16', // lime
    ];
    
    // Hash the tag string to get a consistent index
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <SafeIcon icon={FiCpu} className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">AI Apps Directory</h1>
            </div>
            <p className="text-slate-600">Discover and organize the best AI-powered applications</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setImportExportModal(true)}
              className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Import/Export AI apps"
            >
              <SafeIcon icon={FiDownload} className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <SafeIcon icon={viewMode === 'grid' ? FiList : FiGrid} className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Add AI App
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Tag Navigation */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
                selectedTag === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SafeIcon icon={FiCpu} className="w-4 h-4" />
              All AI Apps
              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-white">
                {tagCounts.all || 0}
              </span>
            </button>
            
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
                  selectedTag === tag
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
                style={{ 
                  backgroundColor: selectedTag === tag ? getTagColor(tag) : '',
                  color: selectedTag === tag ? 'white' : ''
                }}
              >
                <SafeIcon icon={FiTag} className="w-4 h-4" />
                {tag}
                <span className="px-2 py-0.5 text-xs rounded-full bg-white bg-opacity-20 text-white">
                  {tagCounts[tag] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarks */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="bookmarks" type="bookmark">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}
              >
                {filteredBookmarks.map((bookmark, index) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    index={index}
                    onUpdate={(id, updates) => handleSaveBookmark({...bookmark, ...updates}, id)}
                    onDelete={deleteBookmark}
                    tagColors={getTagColor}
                    onEdit={handleOpenModal}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Empty State */}
        {bookmarks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiCpu} className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No AI apps yet</h3>
            <p className="text-slate-600 mb-6">Add your first AI application to get started</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Add AI App
            </button>
          </div>
        )}

        {filteredBookmarks.length === 0 && bookmarks.length > 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiTag} className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No matching AI apps</h3>
            <p className="text-slate-600 mb-6">Try a different search term or tag</p>
            <button
              onClick={() => {setSelectedTag('all'); setSearchTerm('');}}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Show All AI Apps
            </button>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {modalData.isOpen && (
        <BookmarkModal
          onClose={handleCloseModal}
          onSave={handleSaveBookmark}
          existingTags={allTags}
          bookmark={modalData.bookmark}
        />
      )}

      {/* Import/Export Modal */}
      {importExportModal && (
        <ImportExportModal
          onClose={() => setImportExportModal(false)}
          onExport={handleExportBookmarks}
          onImport={handleImportBookmarks}
          bookmarksCount={bookmarks.length}
        />
      )}
    </div>
  );
}

export default App;