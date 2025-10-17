"use client";

import React from 'react';

type MobileQuoteButtonProps = {
  authorName: string;
  content: string;
};

export default function MobileQuoteButton({ authorName, content }: MobileQuoteButtonProps) {
  const handleQuote = () => {
    // Limiter le contenu cité à 300 caractères avec "..." si plus long
    const limitedContent = content.length > 300 
      ? content.substring(0, 300) + '...' 
      : content;
    
    // Créer le texte formaté en markdown pour la citation avec gestion des sauts de ligne
    const quoteText = `> **${authorName}** a écrit :\n> \n> ${limitedContent.replace(/\n/g, '\n> ')}\n\n`;
    
    // Stocker la citation pour le formulaire
    localStorage.setItem('quoteText', quoteText);
    
    // Déclencher un événement personnalisé pour notifier le formulaire de réponse
    const quoteEvent = new CustomEvent('quote-added', {
      detail: { quoteText }
    });
    document.dispatchEvent(quoteEvent);
    
    // Animation de scroll fluide vers le formulaire
    const replyForm = document.getElementById('reply-form');
    if (replyForm) {
      replyForm.scrollIntoView({ behavior: 'smooth' });
      
      // Effet visuel après le scroll
      setTimeout(() => {
        replyForm.classList.add('quote-highlight');
        setTimeout(() => {
          replyForm.classList.remove('quote-highlight');
        }, 1500);
      }, 600);
    } else {
      // Fallback si l'élément n'est pas trouvé
      window.location.href = '#reply-form';
    }
  };

  return (
    <button onClick={handleQuote}>
      Citer
    </button>
  );
}