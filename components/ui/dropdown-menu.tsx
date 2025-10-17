"use client";

import React, { useEffect, useState, useRef } from 'react';

type DropdownMenuProps = {
  items: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }[];
  className?: string;
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg';
  position?: 'dropdown-end' | 'dropdown-top' | 'dropdown-bottom' | 'dropdown-left' | 'dropdown-right';
};

/**
 * Composant de menu déroulant amélioré qui garantit que le contenu s'affiche correctement
 * par-dessus les autres éléments et se ferme après une action.
 */
export default function DropdownMenu({ 
  items, 
  className = '',
  buttonSize = 'sm',
  position = 'dropdown-end'
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Empêcher la propagation des clics sur le menu lui-même pour éviter des fermetures indésirables
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handler pour les items du menu
  const handleItemClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className={`dropdown ${position} ${className}`} ref={dropdownRef} onClick={stopPropagation}>
      <label 
        tabIndex={0}
        className={`btn btn-ghost btn-circle btn-${buttonSize}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="size-5" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </label>
      
      <ul 
        tabIndex={0}
        className={`dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52 z-[1000] ${isOpen ? 'block' : 'hidden'}`}
        onClick={stopPropagation}
      >
        {items.map((item, index) => (
          <li key={index}>
            <button 
              onClick={() => handleItemClick(item.onClick)}
              className="flex items-center gap-2"
            >
              {item.icon}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}