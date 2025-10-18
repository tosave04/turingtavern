"use client";

import React, { useEffect, useRef, useState } from 'react';

// Types pour le jeu
type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Types pour les agents IA
type AgentType = 'researcher' | 'moderator' | 'assistant' | 'analyzer';
type AIAgent = {
  position: Point;
  type: AgentType;
  direction: Direction;
  emoji: string;
  speed: number; // vitesse relative (1 = normale, 0.5 = lent, 2 = rapide)
  lastMoved: number;
};

interface SnakeGameProps {
  onClose: () => void;
}

export default function SnakeGame({ onClose }: SnakeGameProps) {
  // Configuration du jeu
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);
  const [bonusAnimation, setBonusAnimation] = useState<{points: number, x: number, y: number, timestamp: number} | null>(null);
  
  // Taille de la cellule et vitesse du jeu
  const cellSize = 15;
  const gameSpeed = useRef<number>(100);
  
  // État du serpent et de la nourriture
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  
  // Agents IA qui chassent le serpent
  const agentsRef = useRef<AIAgent[]>([]);
  const lastAgentSpawnTime = useRef<number>(0);
  
  // Effet pour le rendu du jeu
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Largeur et hauteur du canvas basées sur la taille de l'écran
    canvas.width = Math.min(400, window.innerWidth - 40);
    canvas.height = Math.min(400, window.innerHeight - 100);
    
    const gridWidth = Math.floor(canvas.width / cellSize);
    const gridHeight = Math.floor(canvas.height / cellSize);
    
    // Positionner la nourriture aléatoirement
    const placeFood = () => {
      const x = Math.floor(Math.random() * gridWidth);
      const y = Math.floor(Math.random() * gridHeight);
      foodRef.current = { x, y };
      
      // Éviter de placer la nourriture sur le serpent ou sur un agent
      if (snakeRef.current.some(part => part.x === x && part.y === y) || 
          agentsRef.current.some(agent => agent.position.x === x && agent.position.y === y)) {
        placeFood();
      }
    };
    
    // Créer un nouvel agent IA
    const spawnAgent = () => {
      const agentTypes: AgentType[] = ['researcher', 'moderator', 'assistant', 'analyzer'];
      const emojis = ['🔍', '🛡️', '🤖', '📊']; // Emojis correspondants aux types
      
      // Choisir un type et un emoji au hasard
      const typeIndex = Math.floor(Math.random() * agentTypes.length);
      const type = agentTypes[typeIndex];
      const emoji = emojis[typeIndex];
      
      // Déterminer une position initiale sur les bords
      let position: Point;
      const side = Math.floor(Math.random() * 4); // 0: haut, 1: droite, 2: bas, 3: gauche
      
      switch(side) {
        case 0: // haut
          position = { x: Math.floor(Math.random() * gridWidth), y: 0 };
          break;
        case 1: // droite
          position = { x: gridWidth - 1, y: Math.floor(Math.random() * gridHeight) };
          break;
        case 2: // bas
          position = { x: Math.floor(Math.random() * gridWidth), y: gridHeight - 1 };
          break;
        default: // gauche
          position = { x: 0, y: Math.floor(Math.random() * gridHeight) };
          break;
      }
      
      // Éviter de placer l'agent sur le serpent ou sur un autre agent
      if (snakeRef.current.some(part => part.x === position.x && part.y === position.y) ||
          agentsRef.current.some(agent => agent.position.x === position.x && agent.position.y === position.y)) {
        return spawnAgent(); // Réessayer avec une autre position
      }
      
        // Créer l'agent avec des caractéristiques selon son type (vitesses réduites de 50%)
      const newAgent: AIAgent = {
        position,
        type,
        direction: 'RIGHT', // Direction initiale, sera mise à jour dans la logique de mouvement
        emoji,
        speed: type === 'researcher' ? 0.6 : 
               type === 'moderator' ? 0.4 : 
               type === 'assistant' ? 0.5 :
               Math.max(1, 0.3 + (score / 500)), // 'analyzer' est le plus rapide et s'améliore avec le score
        lastMoved: 0
      };      agentsRef.current.push(newAgent);
    };
    
    // Premier positionnement de la nourriture
    placeFood();
    
    // Boucle de jeu
    let animationId: number;
    let lastUpdateTime = 0;
    
    const gameLoop = (timestamp: number) => {
      if (!canvas) return;
      
      if (gameOver) {
        // Continuer à dessiner en mode game over pour les animations
        renderGame(ctx, canvas.width, canvas.height, gridWidth, gridHeight);
        animationId = requestAnimationFrame(gameLoop);
        return;
      }
      
      if (paused) {
        // Afficher l'état pausé avec un texte clignotant
        renderGame(ctx, canvas.width, canvas.height, gridWidth, gridHeight);
        
        // Texte "PAUSE" clignotant
        if (Math.floor(Date.now() / 500) % 2) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = 'bold 24px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
        }
        
        animationId = requestAnimationFrame(gameLoop);
        return;
      }
      
      // Limiter la mise à jour basée sur la vitesse du jeu
      if (timestamp - lastUpdateTime > gameSpeed.current) {
        lastUpdateTime = timestamp;
        
        // Logique du jeu
        updateGame(gridWidth, gridHeight);
        
        // Rendu du jeu
        renderGame(ctx, canvas.width, canvas.height, gridWidth, gridHeight);
      }
      
      animationId = requestAnimationFrame(gameLoop);
    };
    
    // Fonction de mise à jour de l'état du jeu
    const updateGame = (gridWidth: number, gridHeight: number) => {
      // Récupérer le timestamp actuel
      const now = Date.now();
      
      // Mettre à jour la direction du serpent
      directionRef.current = nextDirectionRef.current;
      const snake = [...snakeRef.current];
      
      // Calculer la nouvelle position de la tête
      let newHead: Point = { ...snake[0] };
      
      switch (directionRef.current) {
        case 'UP':
          newHead.y -= 1;
          break;
        case 'DOWN':
          newHead.y += 1;
          break;
        case 'LEFT':
          newHead.x -= 1;
          break;
        case 'RIGHT':
          newHead.x += 1;
          break;
      }
      
      // Vérifier les collisions avec les bords
      if (
        newHead.x < 0 ||
        newHead.x >= gridWidth ||
        newHead.y < 0 ||
        newHead.y >= gridHeight
      ) {
        setGameOver(true);
        return;
      }
      
      // Vérifier les collisions avec soi-même
      for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
          setGameOver(true);
          return;
        }
      }
      
      // Vérifier les collisions avec les agents IA
      if (agentsRef.current.some(agent => 
        agent.position.x === newHead.x && agent.position.y === newHead.y
      )) {
        setGameOver(true);
        return;
      }
      
      // Ajouter la nouvelle tête
      snake.unshift(newHead);
      
      // Vérifier si on mange la nourriture
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        // Calculer le multiplicateur basé sur le nombre d'agents (minimum 1)
        const multiplier = Math.max(1, agentsRef.current.length);
        
        // Augmenter le score avec le multiplicateur
        const basePoints = 10;
        const pointsGained = basePoints * multiplier;
        const newScore = score + pointsGained;
        setScore(newScore);
        
        // Créer une animation de bonus
        if (multiplier > 1) {
          setBonusAnimation({
            points: pointsGained,
            x: newHead.x,
            y: newHead.y,
            timestamp: now
          });
        }
        
        // Placer une nouvelle nourriture
        placeFood();
        
        // Augmenter la vitesse du jeu plus progressivement
        if (newScore % 50 === 0 && newScore > 0) {
          gameSpeed.current = Math.max(60, gameSpeed.current - 5);  // Diminution plus graduelle
        }
        
            // Créer un nouvel agent après un certain nombre de points
        if (newScore % 50 === 0) {  // Réduit la fréquence d'apparition (de 30 à 50 points)
          spawnAgent();
        }
      } else {
        // Si on ne mange pas, retirer la queue
        snake.pop();
      }
      
      // Gestion des agents IA
      
      // Apparition périodique de nouveaux agents
      const maxAgents = Math.min(8, 3 + Math.floor(score / 40)); // Plus le score est élevé, plus il y a d'agents
      const spawnInterval = Math.max(8000, 15000 - score * 25); // Diminuer l'intervalle avec le score, mais moins rapidement
      
      if (now - lastAgentSpawnTime.current > spawnInterval && agentsRef.current.length < maxAgents) {
        spawnAgent();
        lastAgentSpawnTime.current = now;
      }
      
      // Déplacer chaque agent
      agentsRef.current.forEach((agent, index) => {
        // Ne pas bouger à chaque frame - utiliser la vitesse de l'agent
        // Ralentir davantage en augmentant l'intervalle entre les mouvements
        if (now - agent.lastMoved < gameSpeed.current * 2 / agent.speed) {
          return;
        }
        
        // Mémoriser le dernier déplacement
        agent.lastMoved = now;
        
        // Calculer la direction vers la tête du serpent (IA simple de poursuite)
        const dx = snake[0].x - agent.position.x;
        const dy = snake[0].y - agent.position.y;
        
        // Déterminer la direction principale en fonction de la distance
        let newDirection: Direction;
        
        // Comportement différent selon le type d'agent
        let randomFactor = Math.random();
        
        switch(agent.type) {
          case 'researcher': 
            // Le chercheur alterne entre poursuite directe et exploration
            if (randomFactor < 0.5) {
              // 50% de chance de choisir une direction aléatoire (augmenté de 30% à 50%)
              const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
              newDirection = directions[Math.floor(Math.random() * directions.length)];
            } else {
              // 50% de chance de suivre le serpent
              if (Math.abs(dx) > Math.abs(dy)) {
                newDirection = dx > 0 ? 'RIGHT' : 'LEFT';
              } else {
                newDirection = dy > 0 ? 'DOWN' : 'UP';
              }
            }
            break;
            
          case 'moderator':
            // Le modérateur est plus prévisible mais sûr
            if (randomFactor < 0.3) {
              // 30% de chance de choisir une direction aléatoire (augmenté de 10% à 30%)
              const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
              newDirection = directions[Math.floor(Math.random() * directions.length)];
            } else {
              // 70% de chance de suivre le serpent de façon plus directe
              if (Math.abs(dx) > Math.abs(dy)) {
                newDirection = dx > 0 ? 'RIGHT' : 'LEFT';
              } else {
                newDirection = dy > 0 ? 'DOWN' : 'UP';
              }
            }
            break;
            
          case 'assistant':
            // L'assistant essaie d'anticiper le mouvement du serpent
            const snakeDirection = directionRef.current;
            
            // Anticiper où le serpent pourrait aller
            if (randomFactor < 0.7) {
              // 70% de chance de se diriger vers la position actuelle (augmenté de 60% à 70%)
              if (Math.abs(dx) > Math.abs(dy)) {
                newDirection = dx > 0 ? 'RIGHT' : 'LEFT';
              } else {
                newDirection = dy > 0 ? 'DOWN' : 'UP';
              }
            } else {
              // 30% de chance d'anticiper le mouvement
              switch(snakeDirection) {
                case 'UP':
                  // Si le serpent monte, essayer d'intercepter
                  newDirection = snake[0].x < agent.position.x ? 'LEFT' : 'RIGHT';
                  break;
                case 'DOWN':
                  newDirection = snake[0].x < agent.position.x ? 'LEFT' : 'RIGHT';
                  break;
                case 'LEFT':
                  newDirection = snake[0].y < agent.position.y ? 'UP' : 'DOWN';
                  break;
                case 'RIGHT':
                  newDirection = snake[0].y < agent.position.y ? 'UP' : 'DOWN';
                  break;
              }
            }
            break;
            
          case 'analyzer':
            // L'analyste est très agressif et précis
            if (randomFactor < 0.2) {
              // 20% de chance d'être aléatoire (augmenté de 5% à 20%)
              const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
              newDirection = directions[Math.floor(Math.random() * directions.length)];
            } else {
              // 80% du temps, poursuite directe optimale
              if (Math.abs(dx) > Math.abs(dy)) {
                newDirection = dx > 0 ? 'RIGHT' : 'LEFT';
              } else {
                newDirection = dy > 0 ? 'DOWN' : 'UP';
              }
            }
            break;
            
          default:
            // Comportement par défaut
            if (randomFactor < 0.2) {
              // 20% de chance de choisir une direction aléatoire
              const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
              newDirection = directions[Math.floor(Math.random() * directions.length)];
            } else {
              // 80% de chance de suivre le serpent
              if (Math.abs(dx) > Math.abs(dy)) {
                newDirection = dx > 0 ? 'RIGHT' : 'LEFT';
              } else {
                newDirection = dy > 0 ? 'DOWN' : 'UP';
              }
            }
        }
        
        agent.direction = newDirection;
        
        // Calculer la nouvelle position
        let newPosition = { ...agent.position };
        
        switch (agent.direction) {
          case 'UP':
            newPosition.y = Math.max(0, newPosition.y - 1);
            break;
          case 'DOWN':
            newPosition.y = Math.min(gridHeight - 1, newPosition.y + 1);
            break;
          case 'LEFT':
            newPosition.x = Math.max(0, newPosition.x - 1);
            break;
          case 'RIGHT':
            newPosition.x = Math.min(gridWidth - 1, newPosition.x + 1);
            break;
        }
        
        // Vérifier si la nouvelle position est valide (pas sur un autre agent ou sur la nourriture)
        const isPositionOccupied = agentsRef.current.some((a, i) => 
          i !== index && a.position.x === newPosition.x && a.position.y === newPosition.y
        );
        
        if (!isPositionOccupied && (newPosition.x !== foodRef.current.x || newPosition.y !== foodRef.current.y)) {
          agent.position = newPosition;
        }
        
        // Vérifier si l'agent a attrapé la tête du serpent
        if (agent.position.x === snake[0].x && agent.position.y === snake[0].y) {
          setGameOver(true);
        }
      });
      
      // Mettre à jour le serpent
      snakeRef.current = snake;
    };
    
    // Fonction pour dessiner le jeu
    const renderGame = (
      ctx: CanvasRenderingContext2D,
      canvasWidth: number,
      canvasHeight: number,
      gridWidth: number,
      gridHeight: number
    ) => {
      // Effacer le canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Dessiner la grille (optionnel, pour le débogage)
      ctx.strokeStyle = '#2a2a3e';
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, canvasHeight);
        ctx.stroke();
      }
      
      for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(canvasWidth, y * cellSize);
        ctx.stroke();
      }
      
      // Dessiner la nourriture
      ctx.fillStyle = '#e94560';
      ctx.beginPath();
      ctx.arc(
        foodRef.current.x * cellSize + cellSize / 2,
        foodRef.current.y * cellSize + cellSize / 2,
        cellSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Dessiner un petit symbole sur la nourriture
      ctx.fillStyle = '#fff';
      ctx.font = `${cellSize * 0.7}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        '💡',
        foodRef.current.x * cellSize + cellSize / 2,
        foodRef.current.y * cellSize + cellSize / 2
      );
      
      // Dessiner les agents IA
      agentsRef.current.forEach(agent => {
        // Définir les couleurs selon le type d'agent
        let agentColor = '';
        let shadowColor = '';
        switch(agent.type) {
          case 'researcher':
            agentColor = '#5e60ce';
            shadowColor = 'rgba(94, 96, 206, 0.5)';
            break;
          case 'moderator':
            agentColor = '#ff5e5b';
            shadowColor = 'rgba(255, 94, 91, 0.5)';
            break;
          case 'assistant':
            agentColor = '#38b000';
            shadowColor = 'rgba(56, 176, 0, 0.5)';
            break;
          case 'analyzer':
            agentColor = '#00b4d8';
            shadowColor = 'rgba(0, 180, 216, 0.5)';
            break;
        }
        
        // Appliquer un effet de lueur autour de l'agent
        ctx.shadowColor = agentColor;
        ctx.shadowBlur = 5 + Math.sin(Date.now() / 200) * 2;
        
        // Dessiner le corps de l'agent
        ctx.fillStyle = agentColor;
        ctx.beginPath();
        ctx.arc(
          agent.position.x * cellSize + cellSize / 2,
          agent.position.y * cellSize + cellSize / 2,
          cellSize / 2 - 1,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Réinitialiser l'ombre pour l'emoji
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Dessiner l'emoji de l'agent
        ctx.fillStyle = '#fff';
        ctx.font = `${cellSize * 0.7}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          agent.emoji,
          agent.position.x * cellSize + cellSize / 2,
          agent.position.y * cellSize + cellSize / 2
        );
        
        // Animation de pulsation pour indiquer qu'ils sont dangereux
        ctx.strokeStyle = shadowColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(
          agent.position.x * cellSize + cellSize / 2,
          agent.position.y * cellSize + cellSize / 2,
          cellSize / 2 + 2 + Math.sin(Date.now() / 200) * 2,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      });
      
      // Dessiner le serpent
      snakeRef.current.forEach((part, index) => {
        // Couleur dégradée pour le serpent
        const green = 255 - (index * 2) % 100;
        ctx.fillStyle = index === 0 
          ? '#4ecca3' // Tête
          : `rgb(0, ${Math.max(100, green)}, ${Math.max(50, green / 2)})`;
        
        ctx.fillRect(
          part.x * cellSize,
          part.y * cellSize,
          cellSize,
          cellSize
        );
        
        // Dessiner les yeux sur la tête du serpent
        if (index === 0) {
          ctx.fillStyle = '#000';
          
          // Position des yeux selon la direction
          switch (directionRef.current) {
            case 'RIGHT':
              ctx.fillRect(part.x * cellSize + cellSize - 4, part.y * cellSize + 3, 2, 2);
              ctx.fillRect(part.x * cellSize + cellSize - 4, part.y * cellSize + cellSize - 5, 2, 2);
              break;
            case 'LEFT':
              ctx.fillRect(part.x * cellSize + 2, part.y * cellSize + 3, 2, 2);
              ctx.fillRect(part.x * cellSize + 2, part.y * cellSize + cellSize - 5, 2, 2);
              break;
            case 'UP':
              ctx.fillRect(part.x * cellSize + 3, part.y * cellSize + 2, 2, 2);
              ctx.fillRect(part.x * cellSize + cellSize - 5, part.y * cellSize + 2, 2, 2);
              break;
            case 'DOWN':
              ctx.fillRect(part.x * cellSize + 3, part.y * cellSize + cellSize - 4, 2, 2);
              ctx.fillRect(part.x * cellSize + cellSize - 5, part.y * cellSize + cellSize - 4, 2, 2);
              break;
          }
        }
      });
      
      // Afficher le score avec un effet lumineux
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      
      // Calculer le multiplicateur actuel
      const currentMultiplier = Math.max(1, agentsRef.current.length);
      
      // Ajouter une lueur au score selon sa valeur
      ctx.shadowColor = score > 100 ? '#ffcc00' : score > 50 ? '#4ecca3' : '#ffffff';
      ctx.shadowBlur = 5;
      ctx.fillText(`Score: ${score}`, 10, 20);
      
      // Afficher le multiplicateur si supérieur à 1
      if (currentMultiplier > 1) {
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(`x${currentMultiplier}`, 100, 20);
      }
      
      ctx.shadowBlur = 0;
      
      // Afficher l'animation de bonus si active
      if (bonusAnimation && (Date.now() - bonusAnimation.timestamp < 1000)) {
        const progress = (Date.now() - bonusAnimation.timestamp) / 1000;
        const opacity = 1 - progress;
        const yOffset = progress * 20; // L'animation monte progressivement
        
        ctx.fillStyle = `rgba(255, 220, 0, ${opacity})`;
        ctx.font = 'bold 16px monospace';
        const x = bonusAnimation.x * cellSize;
        const y = (bonusAnimation.y * cellSize) - yOffset;
        ctx.fillText(`+${bonusAnimation.points}`, x, y);
        
        // Effacer l'animation quand elle est terminée
        if (progress >= 1) {
          setBonusAnimation(null);
        }
      }
      
      // Dessiner une légende pour les agents
      if (agentsRef.current.length > 0) {
        // Fond semi-transparent avec effet de pulsation
        const alpha = 0.5 + Math.sin(Date.now() / 1000) * 0.1;
        ctx.fillStyle = `rgba(0, 10, 30, ${alpha})`;
        ctx.fillRect(canvasWidth - 125, 10, 115, 120); // Hauteur augmentée pour expliquer le multiplicateur
        
        // Bordure cyan
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(canvasWidth - 125, 10, 115, 120);
        
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Agents IA:', canvasWidth - 120, 25);
        
        // Ajouter l'explication du multiplicateur
        const multiplierColor = agentsRef.current.length > 1 ? '#ffcc00' : '#aaa';
        ctx.fillStyle = multiplierColor;
        ctx.fillText(`Multiplicateur: x${currentMultiplier}`, canvasWidth - 120, 105);
        
        // Utiliser les couleurs spécifiques pour chaque type
        ctx.fillStyle = '#5e60ce';
        ctx.fillText('🔍 Chercheur', canvasWidth - 120, 40);
        
        ctx.fillStyle = '#ff5e5b';
        ctx.fillText('🛡️ Modérateur', canvasWidth - 120, 55);
        
        ctx.fillStyle = '#38b000';
        ctx.fillText('🤖 Assistant', canvasWidth - 120, 70);
        
        ctx.fillStyle = '#00b4d8';
        ctx.fillText('📊 Analyste', canvasWidth - 120, 85);
      }
      
      // Afficher le nombre d'agents actifs
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Agents: ${agentsRef.current.length}`, 10, 40);
      
      // Afficher Game Over
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 30);
        
        ctx.font = '16px monospace';
        ctx.fillText(`Score final: ${score}`, canvasWidth / 2, canvasHeight / 2);
        ctx.fillText(`Agents esquivés: ${agentsRef.current.length}`, canvasWidth / 2, canvasHeight / 2 + 25);
        ctx.fillText('Appuyez sur ESPACE pour fermer', canvasWidth / 2, canvasHeight / 2 + 50);
        
        // Dessiner les agents qui ont participé à votre défaite
        ctx.font = '14px monospace';
        ctx.fillText('Agents IA victorieux:', canvasWidth / 2, canvasHeight / 2 + 80);
        
        // Afficher les emoji des agents avec plus d'effet
        agentsRef.current.forEach((agent, index) => {
          const x = canvasWidth / 2 - (agentsRef.current.length * 20) / 2 + index * 20 + 10;
          const y = canvasHeight / 2 + 110;
          
          // Effet de lueur basé sur le type d'agent
          let glowColor = '';
          switch(agent.type) {
            case 'researcher': glowColor = '#5e60ce'; break;
            case 'moderator': glowColor = '#ff5e5b'; break;
            case 'assistant': glowColor = '#38b000'; break;
            case 'analyzer': glowColor = '#00b4d8'; break;
          }
          
          // Ajouter un effet de lueur autour de l'emoji
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 10;
          ctx.font = '24px monospace';
          ctx.fillText(agent.emoji, x, y);
          ctx.shadowBlur = 0;
        });
      }
    };
    
    // Démarrer la boucle de jeu
    animationId = requestAnimationFrame(gameLoop);
    
    // Gestionnaire d'événements pour les touches du clavier
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current !== 'DOWN') {
            nextDirectionRef.current = 'UP';
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current !== 'UP') {
            nextDirectionRef.current = 'DOWN';
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current !== 'RIGHT') {
            nextDirectionRef.current = 'LEFT';
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current !== 'LEFT') {
            nextDirectionRef.current = 'RIGHT';
          }
          break;
        case ' ':
          if (gameOver) {
            // Fermer le jeu au lieu de le redémarrer
            onClose();
          } else {
            // Mettre en pause / reprendre
            setPaused(prev => !prev);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Nettoyage
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameOver, paused, score, onClose]);
  
  // Boutons de contrôle pour appareils mobiles
  const handleControlClick = (direction: Direction) => {
    if ((direction === 'UP' && directionRef.current !== 'DOWN') ||
        (direction === 'DOWN' && directionRef.current !== 'UP') ||
        (direction === 'LEFT' && directionRef.current !== 'RIGHT') ||
        (direction === 'RIGHT' && directionRef.current !== 'LEFT')) {
      nextDirectionRef.current = direction;
    }
  };
  
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-90 p-4">
      <div 
        className="glitch-container relative max-w-[90vw] rounded-lg border border-cyan-500 bg-gray-900 p-4 shadow-lg shadow-cyan-500/20 snake-game-enter"
        style={{
          animation: 'glitch 0.3s infinite',
        }}
      >
        <div className="absolute -top-6 right-0 flex gap-2">
          <button 
            onClick={() => setPaused(prev => !prev)} 
            className="rounded-md border border-gray-600 bg-gray-800 px-3 py-1 text-white hover:bg-gray-700"
          >
            {paused ? 'Continuer' : 'Pause'}
          </button>
          <button 
            onClick={onClose} 
            className="rounded-md border border-gray-600 bg-gray-800 px-3 py-1 text-white hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
        
        <h2 className="mb-4 text-center text-xl font-bold text-cyan-400">SNAKE</h2>
        
        <canvas 
          ref={canvasRef} 
          className="block rounded border-2 border-cyan-800"
        ></canvas>
        
        {/* Contrôles tactiles pour mobile */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div></div>
          <button 
            onClick={() => handleControlClick('UP')} 
            className="rounded bg-gray-800 p-2 text-white"
            aria-label="Up"
          >
            ↑
          </button>
          <div></div>
          
          <button 
            onClick={() => handleControlClick('LEFT')} 
            className="rounded bg-gray-800 p-2 text-white"
            aria-label="Left"
          >
            ←
          </button>
          <button 
            onClick={() => {
              if (gameOver) {
                // Fermer le jeu au lieu de le redémarrer
                onClose();
              } else {
                setPaused(prev => !prev);
              }
            }} 
            className="rounded bg-gray-800 p-2 text-white"
            aria-label="Action"
          >
            {gameOver ? '✕' : paused ? '▶' : '⏸'}
          </button>
          <button 
            onClick={() => handleControlClick('RIGHT')} 
            className="rounded bg-gray-800 p-2 text-white"
            aria-label="Right"
          >
            →
          </button>
          
          <div></div>
          <button 
            onClick={() => handleControlClick('DOWN')} 
            className="rounded bg-gray-800 p-2 text-white"
            aria-label="Down"
          >
            ↓
          </button>
          <div></div>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>Utilisez les flèches ou WASD pour contrôler le serpent</p>
          <p className="text-cyan-400">Évitez les agents IA qui tentent de vous attraper!</p>
          <p>ESPACE pour pause/fermer, ESC pour quitter</p>
          <p className="mt-2 text-orange-300">Les agents deviennent plus nombreux et rapides avec votre score!</p>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }
        
        .glitch-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 255, 255, 0.05);
          pointer-events: none;
          z-index: -1;
        }
        
        .glitch-container::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(0, 255, 255, 0.1) 50%,
            transparent 100%
          );
          pointer-events: none;
          z-index: -1;
        }
      `}</style>
    </div>
  );
}