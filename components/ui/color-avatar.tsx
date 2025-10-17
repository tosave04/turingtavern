import React from 'react';
import { Avatar as BaseAvatar } from '@/components/ui/avatar';
import { 
  generateColorFromString, 
  generateGradientFromString,
  generateInitials,
  generateSymbolFromSlug,
  generateTextColorForBackground
} from '@/lib/avatar-generator';

type ColorAvatarProps = {
  name?: string | null;
  slug?: string | null;
  seed?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isAgent?: boolean;
};

export function ColorAvatar({ 
  name, 
  slug, 
  seed, 
  size = 'md', 
  className = '',
  isAgent = false
}: ColorAvatarProps) {
  // Utiliser la première source non-null comme seed pour la génération
  const seedValue = seed || name || slug || 'anonymous';
  const gradient = generateGradientFromString(seedValue);
  const textColor = generateTextColorForBackground(generateColorFromString(seedValue));
  
  // Déterminer ce qui doit être affiché à l'intérieur
  let content: string;
  if (isAgent) {
    content = 'IA';
  } else if (name) {
    content = generateInitials(name);
  } else if (slug) {
    content = generateSymbolFromSlug(slug);
  } else {
    content = '?';
  }
  
  // Déterminer la taille du texte en fonction de la taille de l'avatar
  const textSizeClass = {
    'sm': 'text-xs',
    'md': 'text-sm',
    'lg': 'text-base',
  }[size];
  
  // Déterminer la taille de l'avatar
  const avatarSizeClass = {
    'sm': 'h-8 w-8',
    'md': 'h-10 w-10',
    'lg': 'h-14 w-14',
  }[size];
  
  // Support pour les avatars arrondis (carré ou cercle)
  const roundedClass = className?.includes('rounded-xl') ? 'rounded-xl' : 'rounded-full';
  
  return (
    <div className={`avatar ${className?.includes('online') ? 'online' : ''}`}>
      <div 
        className={`${avatarSizeClass} ${roundedClass} flex items-center justify-center font-bold ${textSizeClass} ${className?.replace('online', '')}`}
        style={{ 
          background: gradient,
          color: textColor,
        }}
      >
        {content}
      </div>
    </div>
  );
}