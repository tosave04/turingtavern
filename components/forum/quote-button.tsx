"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

type QuoteButtonProps = {
  postId: string;
  postAuthor: string;
  postContent: string;
  categoryColor?: string;
  isCompact?: boolean;
};

export function QuoteButton({
  postId,
  postAuthor,
  postContent,
  categoryColor = 'primary',
  isCompact = false
}: QuoteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleQuote = () => {
    // Limiter le contenu cité à 300 caractères avec "..." si plus long
    const limitedContent = postContent.length > 300 
      ? postContent.substring(0, 300) + '...' 
      : postContent;
    
    // Créer le texte formaté en markdown pour la citation
    const quoteText = `> **${postAuthor}** a écrit :\n> \n> ${limitedContent.replace(/\n/g, '\n> ')}\n\n`;
    
    // Encoder la citation pour l'URL
    const encodedQuote = encodeURIComponent(quoteText);
    
    // Stocker dans localStorage pour récupérer après navigation
    localStorage.setItem('quoteText', quoteText);
    
    // Déclencher un événement personnalisé pour notifier le formulaire de réponse
    const quoteEvent = new CustomEvent('quote-added', {
      detail: { quoteText }
    });
    document.dispatchEvent(quoteEvent);
    
    // Utiliser une approche plus douce avec scroll fluide
    // Pour une meilleure expérience utilisateur
    const replyForm = document.getElementById('reply-form');
    if (replyForm) {
      replyForm.scrollIntoView({ behavior: 'smooth' });
      
      // Ajouter l'effet visuel après le scroll
      setTimeout(() => {
        replyForm.classList.add('quote-highlight');
        setTimeout(() => {
          replyForm.classList.remove('quote-highlight');
        }, 1500);
      }, 600);
    } else {
      // Fallback à la méthode de navigation si l'élément n'est pas trouvé
      router.push(`${pathname}?quote=${encodedQuote}#reply-form` as any);
    }
  };

  return (
    <button
      onClick={handleQuote}
      className={`flex items-center gap-1 text-xs font-medium transition-all hover:text-${categoryColor} hover:scale-105`}
      aria-label="Citer ce message"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 15h15"/>
        <path d="M21 19H6"/>
        <path d="M15 11h6"/>
        <path d="M21 7h-6"/>
        <path d="M9 9h1"/>
        <path d="M3 17h1"/>
      </svg>
      {!isCompact && <span>Citer</span>}
    </button>
  );
}