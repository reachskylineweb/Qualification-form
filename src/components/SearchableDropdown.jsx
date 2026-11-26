import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  // Always keep 'Others' visible at the bottom if user's search doesn't match
  const finalOptions =
    filteredOptions.includes('Others') || !options.includes('Others')
      ? filteredOptions
      : [...filteredOptions, 'Others'];

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          setIsOpen((prev) => !prev);
        }}
        className={`w-full px-4 md:px-3.5 py-3.5 md:py-2.5 rounded-xl md:rounded-lg bg-black border text-left text-[15px] md:text-sm flex items-center justify-between gap-2 transition cursor-pointer ${
          isOpen
            ? 'border-[#d39c12] ring-1 ring-[#d39c12]/40'
            : 'border-[#d39c12]/35 hover:border-[#d39c12]/70'
        }`}
      >
        <span className={`truncate ${value ? 'text-white' : 'text-neutral-500'}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#d39c12] shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-[#111111] border border-[#d39c12]/60 shadow-2xl overflow-hidden">
          {/* Search Input inside Dropdown */}
          <div className="p-2 border-b border-[#d39c12]/20 bg-[#0a0a0a] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#d39c12] ml-1.5 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-white placeholder-neutral-500 text-xs sm:text-sm py-1 pr-2 focus:outline-none"
            />
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-neutral-900">
            {finalOptions.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#d39c12] text-black font-semibold'
                      : 'text-neutral-200 hover:bg-[#d39c12]/15 hover:text-white'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0 text-black" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
