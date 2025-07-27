import React, { useState, useRef } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiDownload, FiUpload, FiFile, FiCheck, FiAlertCircle, FiInfo, FiLock } = FiIcons;

const ImportExportModal = ({ onClose, onExport, onImport, bookmarksCount, isAuthenticated, onAuthRequest }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState('skip');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setImportFile(file);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    if (!isAuthenticated) {
      onAuthRequest();
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await onImport(importFile, duplicateStrategy);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        error: error.message
      });
    }
    setIsProcessing(false);
  };

  const handleExport = () => {
    if (!isAuthenticated) {
      onAuthRequest();
      return;
    }
    
    onExport();
    // Show success message or close modal after a short delay
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Import & Export AI Apps
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Authentication Required Banner */}
        {!isAuthenticated && (
          <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <SafeIcon icon={FiLock} className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800 text-sm">Authentication Required</h3>
              <p className="text-xs text-amber-700">
                You need to log in to import or export AI apps
              </p>
            </div>
            <button
              onClick={onAuthRequest}
              className="ml-auto px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700"
            >
              Log In
            </button>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SafeIcon icon={FiDownload} className="w-4 h-4 inline mr-2" />
            Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SafeIcon icon={FiUpload} className="w-4 h-4 inline mr-2" />
            Import
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiDownload} className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Export Your AI Apps
                </h3>
                <p className="text-slate-600 mb-6">
                  Download all your AI applications as a JSON file. You can use this file to backup your data or
                  import it later.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <SafeIcon icon={FiInfo} className="w-4 h-4 text-blue-500" />
                  <span>
                    You have <strong>{bookmarksCount}</strong> AI apps to export
                  </span>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={!isAuthenticated}
                className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 ${
                  isAuthenticated 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                } transition-all`}
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                Export AI Apps
              </button>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiUpload} className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Import AI Apps
                </h3>
                <p className="text-slate-600 mb-6">
                  Upload a JSON file to import AI applications. The file should be in the same format as exported from this app.
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select JSON File
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <SafeIcon icon={FiFile} className="w-4 h-4 text-slate-500" />
                      {importFile ? importFile.name : 'Choose file...'}
                    </button>
                  </div>
                </div>

                {/* Duplicate Handling Strategy */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Handle Duplicates
                  </label>
                  <select
                    value={duplicateStrategy}
                    onChange={(e) => setDuplicateStrategy(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isAuthenticated}
                  >
                    <option value="skip">Skip duplicates (recommended)</option>
                    <option value="replace">Replace existing apps</option>
                    <option value="rename">Rename duplicates</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {duplicateStrategy === 'skip' && 'Duplicates will be ignored'}
                    {duplicateStrategy === 'replace' && 'Existing AI apps will be updated'}
                    {duplicateStrategy === 'rename' && 'Duplicates will be renamed with a number'}
                  </p>
                </div>

                {/* Import Button */}
                <button
                  onClick={handleImport}
                  disabled={!importFile || isProcessing || !isAuthenticated}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 ${
                    !importFile || isProcessing || !isAuthenticated
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  } transition-colors`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiUpload} className="w-4 h-4" />
                      Import AI Apps
                    </>
                  )}
                </button>

                {/* Import Result */}
                {importResult && (
                  <div className={`p-4 rounded-lg ${
                    importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <SafeIcon
                        icon={importResult.success ? FiCheck : FiAlertCircle}
                        className={`w-5 h-5 mt-0.5 ${
                          importResult.success ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          importResult.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {importResult.success ? 'Import Successful!' : 'Import Failed'}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          importResult.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {importResult.success ? (
                            <>
                              Added {importResult.statistics?.added || 0} AI apps
                              {importResult.statistics?.skipped > 0 && 
                                `, skipped ${importResult.statistics.skipped} duplicates`}
                              {importResult.statistics?.replaced > 0 && 
                                `, replaced ${importResult.statistics.replaced} existing`}
                            </>
                          ) : (
                            importResult.error
                          )}
                        </p>
                        {importResult.success && (
                          <button
                            onClick={onClose}
                            className="mt-3 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;