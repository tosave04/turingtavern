"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type SortOption = {
  label: string;
  value: string;
};

type SortSelectorProps = {
  options: SortOption[];
  defaultOption: string;
  className?: string;
};

export default function SortSelector({ options, defaultOption, className = '' }: SortSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get('sort') || defaultOption;
  
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    
    // Créer un nouvel objet URLSearchParams
    const params = new URLSearchParams(searchParams.toString());
    
    // Mettre à jour ou ajouter le paramètre 'sort'
    params.set('sort', value);
    
    // Naviguer avec les nouveaux paramètres
    router.push(`?${params.toString()}`);
  };
  
  return (
    <div className={`form-control ${className}`}>
      <div className="join shadow-sm">
        <div className="join-item flex items-center bg-base-200 px-3 py-1 text-sm text-base-content/70 border border-base-300 border-r-0 rounded-l-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 18h10"></path>
            <path d="M11 12h10"></path>
            <path d="M11 6h10"></path>
            <path d="M3 6h2"></path>
            <path d="M3 12h2"></path>
            <path d="M3 18h2"></path>
          </svg>
          Trier
        </div>
        <select 
          className="select select-sm join-item select-bordered rounded-r-md border-base-300 focus:outline-none min-w-32 pr-8 pl-3"
          value={currentSort}
          onChange={handleSortChange}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}