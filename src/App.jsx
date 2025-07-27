import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import BookmarkCard from './components/BookmarkCard';
import BookmarkModal from './components/BookmarkModal';
import ImportExportModal from './components/ImportExportModal';
import AuthModal from './components/AuthModal';
import SearchBar from './components/SearchBar';
import SafeIcon from './common/SafeIcon';
import { exportBookmarks, importBookmarks, mergeBookmarks } from './utils/dataManager';
import useAuth from './hooks/useAuth';
import * as FiIcons from 'react-icons/fi';
import './App.css';

const { FiPlus, FiGrid, FiList, FiTag, FiCpu, FiDownload, FiUpload, FiLock, FiUnlock, FiStar } = FiIcons;

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [modalData, setModalData] = useState({ isOpen: false, bookmark: null });
  const [importExportModal, setImportExportModal] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [tagCounts, setTagCounts] = useState({});
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const [authError, setAuthError] = useState(null);

  // Initialize with AI-focused sample data
  useEffect(() => {
    const sampleBookmarks = [
      {
        id: '1',
        name: 'ChatGPT',
        url: 'https://chat.openai.com',
        description: 'AI-powered conversational assistant by OpenAI',
        commentary: 'Revolutionary AI chatbot for coding, writing, and problem-solving',
        tags: ['ai', 'text/chatbot', 'productivity'],
        favorite: true,
        favicon: 'https://chat.openai.com/favicon.ico'
      },
      {
        id: '2',
        name: 'Claude',
        url: 'https://claude.ai',
        description: 'Anthropic\'s helpful, harmless, and honest AI assistant',
        commentary: 'Great for detailed analysis and creative writing tasks',
        tags: ['ai', 'text/chatbot', 'writing'],
        favorite: false,
        favicon: 'https://claude.ai/favicon.ico'
      },
      {
        id: '3',
        name: 'Midjourney',
        url: 'https://midjourney.com',
        description: 'AI-powered image generation platform',
        commentary: 'Creates stunning artwork and visuals from text prompts',
        tags: ['ai', 'images', 'creative'],
        favorite: true,
        favicon: 'https://midjourney.com/favicon.ico'
      },
      {
        id: '4',
        name: 'GitHub Copilot',
        url: 'https://github.com/features/copilot',
        description: 'AI pair programmer that helps you write code faster',
        commentary: 'Essential tool for developers - saves hours of coding time',
        tags: ['ai', 'coding', 'development'],
        favorite: false,
        favicon: 'https://github.com/favicon.ico'
      },
      {
        id: '5',
        name: 'Hugging Face',
        url: 'https://huggingface.co',
        description: 'The AI community building the future',
        commentary: 'Best platform for AI models, datasets, and spaces',
        tags: ['ai', 'development', 'community'],
        favorite: false,
        favicon: 'https://huggingface.co/favicon.ico'
      },
      {
        id: '6',
        name: 'Runway ML',
        url: 'https://runwayml.com',
        description: 'AI-powered creative tools for video and image editing',
        commentary: 'Incredible AI video generation and editing capabilities',
        tags: ['ai', 'videos', 'creative', 'editing'],
        favorite: false,
        favicon: 'https://runwayml.com/favicon.ico'
      },
      {
        id: '7',
        name: 'Perplexity AI',
        url: 'https://perplexity.ai',
        description: 'AI-powered search engine and research assistant',
        commentary: 'Perfect for research with cited sources and real-time data',
        tags: ['ai', 'text/chatbot', 'research', 'productivity'],
        favorite: true,
        favicon: 'https://perplexity.ai/favicon.ico'
      },
      {
        id: '8',
        name: 'Leonardo AI',
        url: 'https://leonardo.ai',
        description: 'AI-powered image generation and editing platform',
        commentary: 'Great for creating consistent character designs and artwork',
        tags: ['ai', 'images', 'creative'],
        favorite: false,
        favicon: 'https://leonardo.ai/favicon.ico'
      },
      {
        id: '9',
        name: 'ElevenLabs',
        url: 'https://elevenlabs.io',
        description: 'AI voice generation and cloning platform',
        commentary: 'Incredibly realistic voice synthesis for various applications',
        tags: ['ai', 'voice', 'audio'],
        favorite: false,
        favicon: 'https://elevenlabs.io/favicon.ico'
      },
      {
        id: '10',
        name: 'Suno AI',
        url: 'https://suno.ai',
        description: 'AI music generation platform',
        commentary: 'Creates original songs from text prompts with vocals and instruments',
        tags: ['ai', 'music', 'creative'],
        favorite: false,
        favicon: 'https://suno.ai/favicon.ico'
      }
    ];
    
    setBookmarks(sampleBookmarks);
    updateTagCounts(sampleBookmarks);
  }, []);

  // Update tag counts when bookmarks change
  const updateTagCounts = (bookmarkList) => {
    const counts = { 
      all: bookmarkList.length,
      favorites: bookmarkList.filter(b => b.favorite).length
    };
    
    bookmarkList.forEach(bookmark => {
      bookmark.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    
    setTagCounts(counts);
  };

  const handleDragEnd = (result) => {
    if (!isAuthenticated) {
      setAuthModal(true);
      return;
    }
    
    const { destination, source } = result;
    
    if (!destination) return;
    
    const newBookmarks = Array.from(bookmarks);
    const [removed] = newBookmarks.splice(source.index, 1);
    newBookmarks.splice(destination.index, 0, removed);
    
    setBookmarks(newBookmarks);
  };

  const handleOpenModal = (bookmark = null) => {
    if (!isAuthenticated && bookmark !== null) {
      setAuthModal(true);
      return;
    }
    
    setModalData({ isOpen: true, bookmark });
  };

  const handleCloseModal = () => {
    setModalData({ isOpen: false, bookmark: null });
  };

  const handleSaveBookmark = (bookmarkData, existingId = null) => {
    if (!isAuthenticated && existingId !== null) {
      setAuthModal(true);
      return;
    }
    
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
    if (!isAuthenticated) {
      setAuthModal(true);
      return;
    }
    
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
    setBookmarks(updatedBookmarks);
    updateTagCounts(updatedBookmarks);
  };

  // Export functionality
  const handleExportBookmarks = () => {
    if (!isAuthenticated) {
      setAuthModal(true);
      return;
    }
    
    const result = exportBookmarks(bookmarks);
    if (result.success) {
      console.log(`Exported ${result.count} AI apps to ${result.filename}`);
    } else {
      console.error('Export failed:', result.error);
    }
  };

  // Import functionality
  const handleImportBookmarks = async (file, duplicateStrategy) => {
    if (!isAuthenticated) {
      setAuthModal(true);
      return { success: false, error: "Authentication required" };
    }
    
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

  // Handle authentication
  const handleLogin = (password, rememberMe) => {
    const result = login(password, rememberMe);
    if (result.success) {
      setAuthModal(false);
      setAuthError(null);
    } else {
      setAuthError(result.error);
    }
    return result;
  };

  const handleLogout = () => {
    logout();
    setAuthModal(false);
  };

  // Get all unique tags from bookmarks
  const allTags = [...new Set(bookmarks.flatMap(bookmark => bookmark.tags))].sort();

  // Filter bookmarks based on search term, selected tag, and favorites
  const filteredBookmarks = bookmarks.filter(bookmark => {
    // Search filter
    const matchesSearch = 
      bookmark.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Tag filter
    const matchesTag = selectedTag === 'all' || bookmark.tags.includes(selectedTag);
    
    // Favorites filter
    const matchesFavorites = !showFavoritesOnly || bookmark.favorite;
    
    return matchesSearch && matchesTag && matchesFavorites;
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
    
    // Special colors for popular tags
    const specialColors = {
      'images': '#EC4899',     // pink
      'videos': '#EF4444',     // red
      'music': '#8B5CF6',      // purple
      'voice': '#10B981',      // green
      'text/chatbot': '#3B82F6' // blue
    };
    
    if (specialColors[tag]) {
      return specialColors[tag];
    }
    
    // Hash the tag string to get a consistent index
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Toggle favorites filter
  const toggleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    if (!showFavoritesOnly) {
      setSelectedTag('all'); // Reset tag filter when enabling favorites
    }
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
              onClick={() => setAuthModal(true)}
              className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
              title={isAuthenticated ? "Account settings" : "Log in to edit"}
            >
              <SafeIcon 
                icon={isAuthenticated ? FiUnlock : FiLock} 
                className={`w-5 h-5 ${isAuthenticated ? 'text-green-600' : 'text-slate-600'}`} 
              />
            </button>
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

        {/* Auth Status Banner - shows when not authenticated */}
        {!isAuthenticated && !isLoading && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <SafeIcon icon={FiLock} className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                You're in view-only mode. <button onClick={() => setAuthModal(true)} className="font-medium underline">Log in</button> to edit, import, or export AI apps.
              </p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Filters Section */}
        <div className="mb-8">
          {/* Favorites Filter */}
          <div className="mb-4">
            <button
              onClick={toggleFavoritesFilter}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                showFavoritesOnly
                  ? 'bg-yellow-400 text-white shadow-md hover:bg-yellow-500'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <SafeIcon icon={FiStar} className="w-4 h-4" />
              {showFavoritesOnly ? 'Showing Favorites' : 'Show Favorites'}
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                showFavoritesOnly 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {tagCounts.favorites || 0}
              </span>
            </button>
          </div>

          {/* Tag Navigation */}
          <div className="overflow-x-auto pb-2">
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
              {showFavoritesOnly ? (
                <SafeIcon icon={FiStar} className="w-8 h-8 text-slate-400" />
              ) : (
                <SafeIcon icon={FiTag} className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {showFavoritesOnly 
                ? "No favorite AI apps found" 
                : "No matching AI apps"}
            </h3>
            <p className="text-slate-600 mb-6">
              {showFavoritesOnly
                ? "Mark some apps as favorites or try a different filter"
                : "Try a different search term or tag"}
            </p>
            <button
              onClick={() => {
                setSelectedTag('all'); 
                setSearchTerm('');
                setShowFavoritesOnly(false);
              }}
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
          isAuthenticated={isAuthenticated}
          onAuthRequest={() => {
            setImportExportModal(false);
            setAuthModal(true);
          }}
        />
      )}

      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          onClose={() => setAuthModal(false)}
          onLogin={handleLogin}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;