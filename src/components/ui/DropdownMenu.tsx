'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Button from './Button';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  disabled?: boolean;
}

export default function DropdownMenu({
  trigger,
  items,
  align = 'left',
  disabled = false,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => !disabled && setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              disabled={item.disabled}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors ${
                item.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : item.variant === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ExportDropdownProps {
  onExport: (format: 'pdf' | 'xlsx' | 'csv') => void;
  disabled?: boolean;
  label?: string;
}

export function ExportDropdown({ onExport, disabled = false, label = 'Export' }: ExportDropdownProps) {
  return (
    <DropdownMenu
      disabled={disabled}
      trigger={
        <Button variant="secondary" disabled={disabled}>
          {label}
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      }
      items={[
        { label: 'Export as PDF', onClick: () => onExport('pdf') },
        { label: 'Export as Excel', onClick: () => onExport('xlsx') },
        { label: 'Export as CSV', onClick: () => onExport('csv') },
      ]}
      align="right"
    />
  );
}
