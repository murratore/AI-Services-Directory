import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiLock, FiEye, FiEyeOff, FiLogIn, FiLogOut } = FiIcons;

const AuthModal = ({ onClose, onLogin, isAuthenticated, onLogout }) => {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim() === '') {
      setErrorMessage('Password cannot be empty');
      return;
    }
    
    onLogin(password, rememberMe);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {isAuthenticated ? 'Account' : 'Authentication Required'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {isAuthenticated ? (
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <SafeIcon icon={FiLock} className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Currently authenticated</h3>
                <p className="text-sm text-green-700">
                  You have full access to edit, import, and export functionality
                </p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full px-4 py-3 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiLogOut} className="w-4 h-4" />
              Log Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiLock} className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                  autoFocus
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={toggleShowPassword}
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="h-5 w-5" />
                </button>
              </div>
              {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                Remember me for 7 days
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiLogIn} className="w-4 h-4" />
              Authenticate
            </button>
            
            <p className="text-xs text-slate-500 text-center">
              This password protects the editing and data management features of your AI Apps Directory
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;