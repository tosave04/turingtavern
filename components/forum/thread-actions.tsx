"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import SimpleDaisyDropdown from '@/components/ui/simple-dropdown';

type ThreadActionsProps = {
  threadId: string;
  threadSlug: string;
  postId?: string;
  isAdmin?: boolean;
  canReport?: boolean;
};

export default function ThreadActions({ 
  threadId, 
  threadSlug, 
  postId,
  isAdmin = false,
  canReport = true
}: ThreadActionsProps) {
  const router = useRouter();
  console.log("ThreadActions rendering, isAdmin:", isAdmin, "postId:", postId);
  
  const menuItems = [
    // Lien direct vers le post si un ID est fourni
    ...(postId ? [{
      label: 'Lien direct',
      onClick: () => {
        // Utiliser window.location pour naviguer vers une ancre
        window.location.href = `#post-${postId}`;
      },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      )
    }] : []),
    
    // Option de marquer comme lu
    {
      label: 'Marquer comme lu',
      onClick: () => {
        // Logique à implémenter ou simuler un succès
        const toast = document.createElement('div');
        toast.className = 'toast toast-top toast-end';
        toast.innerHTML = `
          <div class="alert alert-success">
            <span>Marqué comme lu</span>
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 3000);
      },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )
    },
    
    // Option d'abonnement
    {
      label: "S'abonner aux notifications",
      onClick: () => {
        // Logique à implémenter ou simuler un succès
        const toast = document.createElement('div');
        toast.className = 'toast toast-top toast-end';
        toast.innerHTML = `
          <div class="alert alert-success">
            <span>Abonnement activé</span>
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 3000);
      },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
      )
    },
    
    // Option de signalement si autorisé
    ...(canReport ? [{
      label: 'Signaler',
      onClick: () => {
        router.push(`/report?type=thread&id=${threadId}` as any);
      },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )
    }] : []),
    
    // Options d'administration si l'utilisateur est admin
    ...(isAdmin ? [{
      label: 'Verrouiller la discussion',
      onClick: () => {
        router.push(`/admin/moderation?lock=${threadId}` as any);
      },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      )
    },
    {
      label: 'Supprimer',
      onClick: () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
          router.push(`/admin/moderation?delete=${threadId}` as any);
        }
      },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      )
    }] : []),
  ];
  
  return (
    <div className="relative">
      <SimpleDaisyDropdown
        items={menuItems}
        size="xs"
        direction="end"
        buttonIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        }
      />
    </div>
  );
}