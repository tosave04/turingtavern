"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReplyForm } from '@/components/forms/forum/reply-form';

type QuoteAwareReplyFormProps = {
  threadId: string;
  threadSlug: string;
  categoryColor?: string;
};

export function QuoteAwareReplyForm({ 
  threadId, 
  threadSlug, 
  categoryColor = 'primary' 
}: QuoteAwareReplyFormProps) {
  const searchParams = useSearchParams();
  const [initialContent, setInitialContent] = useState<string>('');
  const [quotePreview, setQuotePreview] = useState<string>('');
  const [quoteAuthor, setQuoteAuthor] = useState<string>('');
  
  useEffect(() => {
    // Vérifier s'il y a une citation dans l'URL ou dans localStorage
    const quoteFromUrl = searchParams.get('quote');
    const quoteFromStorage = localStorage.getItem('quoteText');
    
    if (quoteFromUrl) {
      // Décoder la citation depuis l'URL
      const decodedQuote = decodeURIComponent(quoteFromUrl);
      processQuote(decodedQuote);
      // Nettoyer localStorage pour éviter les doublons
      localStorage.removeItem('quoteText');
    } else if (quoteFromStorage) {
      // Utiliser la citation depuis localStorage si elle existe
      processQuote(quoteFromStorage);
      // Nettoyer après utilisation
      localStorage.removeItem('quoteText');
    }
  }, [searchParams]);
  
  // Ajouter un écouteur d'événement pour les citations ajoutées dynamiquement
  useEffect(() => {
    const handleQuoteAdded = (event: Event) => {
      const customEvent = event as CustomEvent<{ quoteText: string }>;
      if (customEvent.detail && customEvent.detail.quoteText) {
        processQuote(customEvent.detail.quoteText);
      }
    };
    
    // Ajouter l'écouteur d'événement
    document.addEventListener('quote-added', handleQuoteAdded as EventListener);
    
    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      document.removeEventListener('quote-added', handleQuoteAdded as EventListener);
    };
  }, []);

  const processQuote = (quote: string) => {
    setInitialContent(quote);

    // Extraire l'auteur et le contenu pour l'aperçu
    const quoteRegex = /^> \*\*(.*?)\*\* a écrit :\n> \n((?:> .*\n?)+)/m;
    const match = quote.match(quoteRegex);
    
    if (match) {
      setQuoteAuthor(match[1]);
      
      // Extraire et nettoyer le contenu pour l'aperçu
      let quoteContent = match[2];
      quoteContent = quoteContent.split('\n').map(line => line.replace(/^> /, '')).join(' ').trim();
      
      // Limiter la longueur de l'aperçu
      if (quoteContent.length > 150) {
        quoteContent = quoteContent.substring(0, 150) + '...';
      }
      
      setQuotePreview(quoteContent);
    }
  };

  return (
    <div id="reply-form" className="relative">
      {initialContent && (
        <div className={`mb-4 rounded-lg bg-base-300/60 p-3 transition-all hover:bg-base-300/80`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              <span className="font-semibold text-accent">{quoteAuthor}</span> a été cité(e)
            </span>
            <button 
              onClick={() => {
                setInitialContent('');
                setQuotePreview('');
                setQuoteAuthor('');
              }}
              className="btn btn-ghost btn-xs"
              aria-label="Supprimer la citation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
          <div className="text-xs italic text-base-content/70 whitespace-pre-wrap line-clamp-3">
            {quotePreview}
          </div>
        </div>
      )}
      
      <ReplyForm
        threadId={threadId}
        threadSlug={threadSlug}
        initialContent={initialContent}
      />
    </div>
  );
}