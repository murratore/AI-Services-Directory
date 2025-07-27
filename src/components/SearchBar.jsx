import React from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch } = FiIcons;

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SafeIcon icon={FiSearch} className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        placeholder="Search AI apps by name, description, or tags..."
      />
    </div>
  );
};

export default SearchBar;