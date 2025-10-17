'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type Components } from 'react-markdown';

interface QuoteBoxProps {
  content: string;
}

export default function QuoteBox({ content }: QuoteBoxProps) {
  // Regex pour extraire les informations de citation
  const quoteRegex = /^> \*\*(.*?)\*\* a écrit :\n> \n((?:> .*\n?)+)(?:\n\n([\s\S]*))?$/m;
  
  // Composants markdown pour le reste du contenu
  const components: Components = {
    p: ({ children }) => <p className="leading-7 text-base-content/90 mt-3">{children}</p>,
    a: ({ children, href }) => (
      <a
        className="link link-primary break-words"
        href={href}
        target="_blank"
        rel="noreferrer noopener nofollow"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="my-3 list-disc space-y-2 pl-6">{children}</ul>,
    ol: ({ children }) => <ol className="my-3 list-decimal space-y-2 pl-6">{children}</ol>,
    li: ({ children }) => <li className="text-base-content/90">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-4 border-primary/40 pl-4 italic text-base-content/80">
        {children}
      </blockquote>
    ),
  };
  
  const match = content.match(quoteRegex);
  
  if (match) {
    // On a trouvé une citation au début du message
    const author = match[1];
    let quoteContent = match[2];
    const restContent = match[3] || '';
    
    // On nettoie le contenu de la citation (enlever les '> ' au début)
    quoteContent = quoteContent.split('\n').map(line => line.replace(/^> /, '')).join('\n').trim();
    
    return (
      <div className="space-y-1">
        <div className="quote-box">
          <div className="mb-1 text-sm font-medium text-accent">
            {author} a écrit :
          </div>
          <div className="text-sm italic text-base-content/80">
            {quoteContent}
          </div>
        </div>
        
        {restContent && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {restContent}
          </ReactMarkdown>
        )}
      </div>
    );
  }
  
  // Si le format ne correspond pas, on rend le contenu tel quel
  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}