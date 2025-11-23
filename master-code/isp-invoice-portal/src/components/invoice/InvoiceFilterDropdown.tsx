// InvoiceFilterDropdown: Dropdown component for filtering invoices by Monthly or Yearly
// Used in the dashboard to let users select the invoice filter type
// Calls onSelect prop with the selected filter value

// components/InvoiceFilterDropdown.tsx
'use client';
import React, { useState } from 'react';

interface FilterProps {
  onSelect: (filter: string) => void;
}

const InvoiceFilterDropdown: React.FC<FilterProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Monthly');

  const filters = ['Monthly', 'Yearly'];

  const handleSelect = (filter: string) => {
    console.log('Selected filter:', filter); 
    setSelectedFilter(filter);
    setIsOpen(false);
    onSelect(filter); 
  };

  return (
    <div className="relative inline-block text-left" style={{ position: 'relative', zIndex: 1000, overflow: 'visible' }}>
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
        onClick={() => {
          console.log('Toggle dropdown:', !isOpen); 
          setIsOpen(!isOpen);
        }}
      >
        {selectedFilter}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-blue-700 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none"
        style={{
          display: isOpen ? 'block' : 'none',
          zIndex: 1000,
          overflow: 'visible',
          border: '2px solid #2563eb',
          top: '100%'
        }}
      >
        <div className="py-1">
          {filters.map((filter) => (
            <button
              key={filter}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-500 hover:text-yellow-300"
              style={{ backgroundColor: 'transparent' }}
              onClick={() => handleSelect(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilterDropdown;