"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const SnakeGame = dynamic(() => import('@/components/easter-eggs/snake-game'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90">
    <div className="text-xl text-cyan-400">Chargement du jeu...</div>
  </div>
});

export default function TuringTavernLogo() {
  const [isSnakeGameVisible, setIsSnakeGameVisible] = useState(false);
  const keysPressed = useRef<Set<string>>(new Set());

  const handleLogoClick = (e: React.MouseEvent) => {
    // Vérifier si la touche S est enfoncée au moment du clic
    if (keysPressed.current.has('s') || keysPressed.current.has('S')) {
      e.preventDefault();
      
      // Easter egg trouvé - sauvegarder dans localStorage
      try {
        localStorage.setItem('easteregg_snake_found', 'true');
      } catch (err) {
        // Ignorer les erreurs localStorage
      }
      
      // Effet de glitch sur l'écran avant de lancer le jeu
      const body = document.body;
      body.classList.add('screen-glitch');
      
      // Attendre un peu pour l'effet visuel
      setTimeout(() => {
        body.classList.remove('screen-glitch');
        setIsSnakeGameVisible(true);
      }, 500);
    }
  };
  
  // Suivre les touches enfoncées uniquement quand le logo est survolé
  const handleMouseEnter = () => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysPressed.current.clear();
    };
  };

  // Utiliser useEffect pour ajouter/supprimer les écouteurs de clavier
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysPressed.current.clear();
    };
  }, []);

  return (
    <>
      <Link 
        href="/" 
        className="flex items-center gap-2 text-xl font-bold relative group"
        onClick={handleLogoClick}
      >
        <span className="text-primary">Turing</span>
        <span>Tavern</span>
        <span className="snake-hidden-hint">S + Click = Snake vs IA</span>
      </Link>

      {isSnakeGameVisible && (
        <SnakeGame onClose={() => setIsSnakeGameVisible(false)} />
      )}
      
      <style jsx global>{`
        @keyframes screen-glitch {
          0% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
          20% {
            transform: translate(-5px, 5px);
            filter: hue-rotate(90deg);
          }
          40% {
            transform: translate(-5px, -5px);
            filter: hue-rotate(180deg);
          }
          60% {
            transform: translate(5px, 5px);
            filter: hue-rotate(270deg);
          }
          80% {
            transform: translate(5px, -5px);
            filter: hue-rotate(360deg);
          }
          100% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
        }
        
        .screen-glitch {
          animation: screen-glitch 0.2s infinite;
          position: relative;
          overflow: hidden;
        }
        
        .screen-glitch::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: linear-gradient(
            to bottom,
            transparent,
            rgba(0, 255, 255, 0.2) 10%,
            transparent 20%
          );
          animation: glitch-scan 1s linear infinite;
          pointer-events: none;
          z-index: 9998;
        }
        
        @keyframes glitch-scan {
          from {
            transform: translateY(-100vh);
          }
          to {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </>
  );
}