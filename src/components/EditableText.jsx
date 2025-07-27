import React, { useState, useRef, useEffect } from 'react';

const EditableText = ({ value, onChange, className, placeholder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue !== value) {
      onChange(tempValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-transparent border border-blue-300 rounded px-2 py-1 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer hover:bg-slate-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors ${className} ${
        !value ? 'text-slate-400' : ''
      }`}
    >
      {value || placeholder}
    </span>
  );
};

export default EditableText;