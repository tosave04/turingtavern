"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import SimpleDaisyDropdown from '@/components/ui/simple-dropdown';

type CategoryActionsProps = {
  categorySlug: string;
  isAdmin: boolean;
  extendedMenu?: boolean;
};

export default function CategoryActions({ categorySlug, isAdmin, extendedMenu = false }: CategoryActionsProps) {
  const router = useRouter();
  console.log("CategoryActions rendering, isAdmin:", isAdmin, "extendedMenu:", extendedMenu);
  
  const menuItems = [
    {
      label: 'Actualiser',
      onClick: () => {
        router.refresh();
      },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
          <path d="M21 22v-6h-6"></path>
        </svg>
      ),
    },
    {
      label: 'Retour au forum',
      onClick: () => {
        router.push('/forum');
      },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
      ),
    },
    ...(extendedMenu ? [
      {
        label: 'Marquer comme lu',
        onClick: () => {
          // Fonctionnalité à implémenter
        },
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        ),
      },
      {
        label: 'S\'abonner aux notifications',
        onClick: () => {
          // Fonctionnalité à implémenter
        },
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        ),
      },
    ] : []),
    ...(isAdmin ? [
      {
        label: 'Modifier la catégorie',
        onClick: () => {
          router.push(`/admin/categories?edit=${categorySlug}`);
        },
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        ),
      }
    ] : []),
  ];
  
  return (
    <div className="relative">
      <SimpleDaisyDropdown
        items={menuItems}
        size="sm"
        direction="end"
        buttonIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        }
      />
    </div>
  );
}