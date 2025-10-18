"use client";

import React, { useEffect, useRef, useState } from 'react';

interface FlightSimProps {
  onClose: () => void;
}

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
};

type Obstacle = {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  type: 'building' | 'tower' | 'platform' | 'ufo';
  ufoColor?: { h: number; s: number; l: number }; // Couleur HSL pour les UFOs
};

type BossRobot = {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  personaType: 'technical' | 'creative' | 'analytical' | 'enthusiast';
  spawnDistance: number;
  patternPhase: number;
  velocityX: number;
  velocityY: number;
};

export default function FlightSim({ onClose }: FlightSimProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [altitude, setAltitude] = useState<number>(500);
  const [bonusMessage, setBonusMessage] = useState<{text: string, timestamp: number} | null>(null);
  const [health, setHealth] = useState<number>(20000);
  
  // Refs pour les valeurs en temps réel
  const currentScore = useRef<number>(0);
  const currentHealth = useRef<number>(20000);
  
  // Position de l'avion
  const planeX = useRef<number>(0);
  const planeY = useRef<number>(0);
  const planeZ = useRef<number>(0);
  
  // Vitesse et direction
  const velocityZ = useRef<number>(5);
  const velocityX = useRef<number>(0);
  const velocityY = useRef<number>(0);
  
  // Rotation
  const pitch = useRef<number>(0); // Inclinaison haut/bas
  const roll = useRef<number>(0);  // Inclinaison gauche/droite
  
  // Étoiles pour l'effet de profondeur
  const starsRef = useRef<Star[]>([]);
  
  // Obstacles
  const obstaclesRef = useRef<Obstacle[]>([]);
  const lastObstacleZ = useRef<number>(0);
  const obstaclesPassed = useRef<Set<string>>(new Set());
  
  // Boss robots
  const bossRobotsRef = useRef<BossRobot[]>([]);
  const lastBossDistance = useRef<number>(0);
  
  // Score continu
  const distanceTraveled = useRef<number>(0);
  
  // Contrôles
  const keysPressed = useRef<Set<string>>(new Set());
  
  // Effet hyperspace avec fondu progressif
  const hyperspaceIntensity = useRef<number>(0); // 0 à 1
  
  // Effet de collision (flash + tremblement)
  const collisionFlash = useRef<number>(0); // Intensité du flash (0 à 1)
  const screenShake = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const collisionTime = useRef<number>(0);
  
  useEffect(() => {
    // Initialiser les étoiles
    starsRef.current = Array.from({ length: 200 }, () => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 5000,
      size: Math.random() * 2 + 1
    }));
    
    // Générer les premiers obstacles (plus qu'avant pour remplir la scène)
    for (let i = 0; i < 15; i++) {
      spawnObstacle(i % 3 === 0); // Force 33% périphériques
    }
  }, []);
  
  const spawnObstacle = (forcePeripheral = false) => {
    // Types d'obstacles avec UFO inclus
    const types: Obstacle['type'][] = ['building', 'tower', 'platform', 'ufo'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Calculer la difficulté : +1 tous les 3000m
    const difficulty = 1 + Math.floor(distanceTraveled.current / 3000);
    
    // Trouver la position Z la plus éloignée parmi les obstacles existants
    const maxZ = obstaclesRef.current.reduce((max, o) => Math.max(max, o.z), 200);
    
    // Réduire l'espacement entre obstacles avec la difficulté (plus agressif)
    const spacing = Math.max(80, 300 - (difficulty - 1) * 30);
    const newZ = maxZ + spacing + Math.random() * 50;
    
    let x: number;
    let y: number;
    
    // Forcer 70% des obstacles à être périphériques (augmenté de 60%)
    const shouldBePeripheral = forcePeripheral || Math.random() < 0.7;
    
    if (shouldBePeripheral) {
      // Obstacle VRAIMENT périphérique sur les BORDS
      const position = Math.random();
      
      if (position < 0.5) {
        // Bord GAUCHE (très loin à gauche)
        x = -450 - Math.random() * 150; // -450 à -600
      } else {
        // Bord DROIT (très loin à droite)
        x = 450 + Math.random() * 150; // +450 à +600
      }
    } else {
      // Obstacle central (30% seulement)
      x = (Math.random() - 0.5) * 600; // -300 à +300
    }
    
    // Position Y spécifique selon le type
    if (type === 'platform') {
      y = -200; // Plateformes en hauteur
    } else if (type === 'ufo') {
      y = -100 - Math.random() * 200; // UFOs entre -100 et -300 (plus haut)
    } else {
      y = 0; // Bâtiments et tours au sol
    }
    
    const newObstacle: Obstacle = {
      id: `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      z: newZ,
      width: type === 'tower' ? 30 : type === 'ufo' ? 50 + Math.random() * 30 : 60 + Math.random() * 40,
      height: type === 'platform' ? 20 : type === 'ufo' ? 40 + Math.random() * 20 : 100 + Math.random() * 150,
      type,
      // Couleur aléatoire pour les UFOs (teinte, saturation, luminosité)
      ufoColor: type === 'ufo' ? {
        h: Math.floor(Math.random() * 360), // Teinte: 0-360°
        s: 70 + Math.floor(Math.random() * 30), // Saturation: 70-100%
        l: 50 + Math.floor(Math.random() * 20)  // Luminosité: 50-70%
      } : undefined
    };
    
    obstaclesRef.current.push(newObstacle);
  };
  
  const spawnBossRobot = (zOffset: number = 0) => {
    const personaTypes: BossRobot['personaType'][] = ['technical', 'creative', 'analytical', 'enthusiast'];
    const personaType = personaTypes[Math.floor(Math.random() * personaTypes.length)];
    
    // Position initiale complètement aléatoire dans toute la zone
    const randomX = (Math.random() - 0.5) * 1000; // -500 à +500
    const randomY = -350 + Math.random() * 400; // -350 à +50 (toute la hauteur)
    const randomZ = 1500 + Math.random() * 1000 + zOffset; // 1500 à 2500 + offset pour espacement
    
    const boss: BossRobot = {
      id: `boss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: randomX,
      y: randomY,
      z: randomZ,
      width: 150,
      height: 200,
      personaType,
      spawnDistance: distanceTraveled.current,
      patternPhase: Math.random() * Math.PI * 2, // Phase initiale aléatoire aussi
      velocityX: 0,
      velocityY: 0
    };
    
    bossRobotsRef.current.push(boss);
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    let animationId: number;
    let lastTime = Date.now();
    
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // en secondes
      lastTime = now;
      
      if (gameOver) {
        renderGameOver(ctx, canvas.width, canvas.height);
        animationId = requestAnimationFrame(gameLoop);
        return;
      }
      
      updatePhysics(deltaTime);
      render(ctx, canvas.width, canvas.height);
      
      animationId = requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, onClose]);
  
  const updatePhysics = (deltaTime: number) => {
    // Contrôles avec mouvements plus fluides (accélération réduite)
    if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) {
      pitch.current = Math.max(-0.3, pitch.current - 0.015);
      velocityY.current += 1.2;
    }
    if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) {
      pitch.current = Math.min(0.3, pitch.current + 0.015);
      velocityY.current -= 1.2;
    }
    if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
      roll.current = Math.max(-0.5, roll.current - 0.02);
      velocityX.current -= 1.2;
    }
    if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
      roll.current = Math.min(0.5, roll.current + 0.02);
      velocityX.current += 1.2;
    }
    
    // Accélération/décélération - 100 km/h de base, 300 km/h accéléré
    const isBoosting = keysPressed.current.has(' ');
    if (isBoosting) {
      velocityZ.current = Math.min(30, velocityZ.current + 0.5); // 300 km/h max
      // Fondu progressif de l'effet hyperspace (0.05 par frame = ~1 seconde pour atteindre 100%)
      hyperspaceIntensity.current = Math.min(1, hyperspaceIntensity.current + 0.05);
    } else {
      velocityZ.current = Math.max(10, velocityZ.current - 0.3); // 100 km/h min
      // Disparition instantanée
      hyperspaceIntensity.current = 0;
    }
    
    // Retour progressif à la position neutre (plus de friction)
    if (!keysPressed.current.has('arrowup') && !keysPressed.current.has('arrowdown') && 
        !keysPressed.current.has('w') && !keysPressed.current.has('s')) {
      pitch.current *= 0.92;
      velocityY.current *= 0.90;
    }
    
    if (!keysPressed.current.has('arrowleft') && !keysPressed.current.has('arrowright') &&
        !keysPressed.current.has('a') && !keysPressed.current.has('d')) {
      roll.current *= 0.92;
      velocityX.current *= 0.90;
    }
    
    // Mise à jour de la position
    planeX.current += velocityX.current;
    planeY.current += velocityY.current;
    planeZ.current += velocityZ.current;
    
    // Limiter la position (avec avertissement visuel si on va trop loin)
    const maxX = 700;
    const maxY = 400;
    const minY = 200; // Sol à Y=200
    
    // Collision avec le sol - perte totale de vie
    if (planeY.current > minY) {
      currentHealth.current = 0;
      setHealth(0);
      setGameOver(true);
      return;
    }
    
    // Collision avec les bords (game over si on sort trop loin)
    if (Math.abs(planeX.current) > maxX + 100 || planeY.current < -maxY - 100) {
      currentHealth.current = 0;
      setHealth(0);
      setGameOver(true);
      return;
    }
    
    // Clamper la position
    planeX.current = Math.max(-maxX, Math.min(maxX, planeX.current));
    planeY.current = Math.max(-maxY, Math.min(minY, planeY.current));
    
    // Gestion de la régénération/perte de vie selon la position
    // Zone centrale = 60% de la largeur ET 60% de la hauteur
    const centerZoneX = maxX * 0.6; // 420 sur ±700
    const centerZoneY = (maxY + Math.abs(minY)) * 0.6; // 60% de la hauteur totale (600)
    const centerMinY = -centerZoneY / 2; // Zone centrée verticalement
    const centerMaxY = centerZoneY / 2;
    
    const isInCenterZoneX = Math.abs(planeX.current) <= centerZoneX;
    const isInCenterZoneY = planeY.current >= centerMinY && planeY.current <= centerMaxY;
    const isInCenterZone = isInCenterZoneX && isInCenterZoneY;
    
    if (isInCenterZone) {
      // Régénération : +1 par mètre parcouru
      const healthGain = velocityZ.current * deltaTime * 60 / 10; // 1 par 10m de distance
      currentHealth.current = Math.min(20000, currentHealth.current + healthGain);
    } else {
      // Perte : -5 par mètre parcouru hors de la zone centrale (augmenté de 1 à 5)
      const healthLoss = velocityZ.current * deltaTime * 60 / 10 * 5;
      currentHealth.current = Math.max(0, currentHealth.current - healthLoss);
      
      // Game over si la vie atteint 0
      if (currentHealth.current <= 0) {
        setGameOver(true);
        setHealth(0);
        return;
      }
    }
    
    // Mettre à jour l'affichage de la vie
    if (Math.abs(currentHealth.current - health) > 10) { // Éviter trop d'updates
      setHealth(Math.round(currentHealth.current));
    }
    
    // Détecter si on EST à une limite (avec tolérance de 1 pixel)
    const isAtLimitX = Math.abs(Math.abs(planeX.current) - maxX) < 1;
    const isAtLimitY = Math.abs(planeY.current - (-maxY)) < 1 || Math.abs(planeY.current - minY) < 1;
    const isAtLimit = isAtLimitX || isAtLimitY;
    
    // Mettre à jour l'altitude
    setAltitude(500 - planeY.current);
    
    // Ajouter score continu basé sur la distance SEULEMENT si on n'est PAS à une limite
    // Score x2 en boost (Space) - le multiplicateur affecte les NOUVEAUX points seulement
    if (!isAtLimit) {
      const previousDistance = distanceTraveled.current;
      distanceTraveled.current += velocityZ.current * deltaTime * 60;
      
      // Calculer les nouveaux points gagnés cette frame
      const previousPoints = Math.floor(previousDistance / 10);
      const currentPoints = Math.floor(distanceTraveled.current / 10);
      const pointsGained = currentPoints - previousPoints;
      
      // Appliquer le multiplicateur uniquement aux nouveaux points
      const scoreMultiplier = isBoosting ? 2 : 1;
      currentScore.current += pointsGained * scoreMultiplier;
      
      if (currentScore.current !== score) {
        setScore(currentScore.current);
      }
    }
    
    // Mettre à jour les étoiles
    starsRef.current.forEach(star => {
      star.z -= velocityZ.current;
      if (star.z < 0) {
        star.z = 5000;
        star.x = (Math.random() - 0.5) * 2000;
        star.y = (Math.random() - 0.5) * 2000;
      }
    });
    
    // Mettre à jour les obstacles (en parcourant à l'envers pour pouvoir supprimer)
    for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
      const obstacle = obstaclesRef.current[i];
      obstacle.z -= velocityZ.current;
      
      // Vérifier collision
      if (obstacle.z < 50 && obstacle.z > -50) {
        const dx = Math.abs(planeX.current - obstacle.x);
        const dy = Math.abs(planeY.current - obstacle.y);
        
        if (dx < obstacle.width / 2 + 20 && dy < obstacle.height / 2 + 20) {
          // Perte de 10000 points de vie
          currentHealth.current = Math.max(0, currentHealth.current - 10000);
          setHealth(Math.round(currentHealth.current));
          
          // Déclencher effet de collision
          collisionFlash.current = 1.0; // Flash blanc à 100%
          collisionTime.current = Date.now();
          
          // Game over si la vie atteint 0
          if (currentHealth.current <= 0) {
            setGameOver(true);
          }
          
          // Retirer l'obstacle pour éviter les collisions multiples
          obstaclesRef.current.splice(i, 1);
          continue;
        }
      }
      
      // Donner des points bonus quand on passe un obstacle (utiliser l'ID unique)
      if (obstacle.z < 0 && !obstaclesPassed.current.has(obstacle.id)) {
        obstaclesPassed.current.add(obstacle.id);
        const bonusPoints = 50;
        currentScore.current += bonusPoints;
        setScore(prev => prev + bonusPoints); // Bonus pour avoir évité l'obstacle
        setBonusMessage({ text: `+${bonusPoints} OBSTACLE ÉVITÉ!`, timestamp: Date.now() });
      }
      
      // Supprimer les obstacles très loin derrière
      if (obstacle.z < -500) {
        obstaclesRef.current.splice(i, 1);
      }
    }
    
    // Spawner des boss tous les 4000m - nombre augmente tous les 5 niveaux
    if (distanceTraveled.current - lastBossDistance.current >= 4000) {
      const currentLevel = 1 + Math.floor(distanceTraveled.current / 3000);
      const bossCount = 1 + Math.floor(currentLevel / 5); // 1 boss de base, +1 tous les 5 niveaux
      
      // Spawner plusieurs boss espacés en profondeur
      for (let i = 0; i < bossCount; i++) {
        spawnBossRobot(i * 100); // Espacés de 100m en profondeur
      }
      
      lastBossDistance.current = distanceTraveled.current;
    }
    
    // Mettre à jour les boss robots
    for (let i = bossRobotsRef.current.length - 1; i >= 0; i--) {
      const boss = bossRobotsRef.current[i];
      boss.z -= velocityZ.current;
      boss.patternPhase += 0.08; // Augmenté de 0.05 à 0.08 pour plus de vitesse
      
      // Pattern de mouvement selon le type de persona (amplitudes très augmentées)
      switch (boss.personaType) {
        case 'technical':
          // Mouvement précis et méthodique - zigzag régulier AMPLE
          boss.velocityX = Math.sin(boss.patternPhase) * 15; // 8 → 15
          boss.velocityY = Math.cos(boss.patternPhase * 0.5) * 10; // 5 → 10
          break;
        case 'creative':
          // Mouvement artistique - spirale chaotique AMPLE
          boss.velocityX = Math.sin(boss.patternPhase * 2) * 20 + Math.cos(boss.patternPhase) * 12; // 12+7 → 20+12
          boss.velocityY = Math.sin(boss.patternPhase * 1.5) * 15; // 9 → 15
          break;
        case 'analytical':
          // Mouvement calculé - carrés et angles droits AMPLES
          const phase = Math.floor(boss.patternPhase * 2) % 4;
          boss.velocityX = (phase === 0 || phase === 2) ? (phase === 0 ? 18 : -18) : 0; // 10 → 18
          boss.velocityY = (phase === 1 || phase === 3) ? (phase === 1 ? 12 : -12) : 0; // 7 → 12
          break;
        case 'enthusiast':
          // Mouvement énergique - rebonds rapides TRÈS AMPLES
          boss.velocityX = Math.sin(boss.patternPhase * 3) * 22; // 14 → 22
          boss.velocityY = Math.abs(Math.sin(boss.patternPhase * 4)) * 16 - 6; // 10-4 → 16-6
          break;
      }
      
      boss.x += boss.velocityX;
      boss.y += boss.velocityY;
      
      // Limiter le boss dans la zone visible
      boss.x = Math.max(-600, Math.min(600, boss.x));
      boss.y = Math.max(-350, Math.min(150, boss.y));
      
      // Vérifier collision avec le boss
      if (boss.z < 100 && boss.z > -100) {
        const dx = Math.abs(planeX.current - boss.x);
        const dy = Math.abs(planeY.current - boss.y);
        
        if (dx < boss.width / 2 + 20 && dy < boss.height / 2 + 20) {
          // Perte de 10000 points de vie
          currentHealth.current = Math.max(0, currentHealth.current - 10000);
          setHealth(Math.round(currentHealth.current));
          
          // Déclencher effet de collision
          collisionFlash.current = 1.0; // Flash blanc à 100%
          collisionTime.current = Date.now();
          
          // Game over si la vie atteint 0
          if (currentHealth.current <= 0) {
            setGameOver(true);
          }
          
          // Retirer le boss pour éviter les collisions multiples
          bossRobotsRef.current.splice(i, 1);
          continue;
        }
      }
      
      // Supprimer le boss après 1000m de présence
      const distanceFromSpawn = distanceTraveled.current - boss.spawnDistance;
      if (boss.z < -500 || distanceFromSpawn > 5000) {
        bossRobotsRef.current.splice(i, 1);
      }
    }
    
    // Calculer le nombre d'obstacles nécessaires selon la difficulté
    // +1 difficulté tous les 3000m parcourus
    const difficulty = 1 + Math.floor(distanceTraveled.current / 3000);
    const targetObstacles = 15 + (difficulty - 1) * 10; // 15 obstacles au niveau 1, +10 par niveau
    const peripheralRatio = Math.min(0.5, 0.2 + (difficulty - 1) * 0.15); // 20% à 50% périphériques
    
    // Maintenir le nombre d'obstacles devant selon la difficulté
    const obstaclesAhead = obstaclesRef.current.filter(o => o.z > 0).length;
    const peripheralCount = obstaclesRef.current.filter(o => o.z > 0 && Math.abs(o.x) > 350).length;
    
    // Spawner plusieurs obstacles d'un coup si on est trop en dessous de la cible
    const deficit = targetObstacles - obstaclesAhead;
    if (deficit > 0) {
      // Spawner entre 1 et 5 obstacles par frame selon le déficit (augmenté de 3 à 5)
      const toSpawn = Math.min(5, Math.max(1, Math.ceil(deficit / 2)));
      for (let i = 0; i < toSpawn; i++) {
        const needsPeripheral = peripheralCount < targetObstacles * peripheralRatio;
        spawnObstacle(needsPeripheral);
      }
    }
  };
  
  const render = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Ciel avec dégradé
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#001a33');
    gradient.addColorStop(0.5, '#003366');
    gradient.addColorStop(1, '#004d99');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Calculer le tremblement d'écran (screen shake) après collision
    const timeSinceCollision = Date.now() - collisionTime.current;
    if (timeSinceCollision < 500) { // Tremblement pendant 500ms
      const shakeIntensity = Math.max(0, 1 - timeSinceCollision / 500); // Diminue avec le temps
      const shakeAmount = 20 * shakeIntensity; // Amplitude maximale de 20 pixels
      screenShake.current = {
        x: (Math.random() - 0.5) * shakeAmount * 2,
        y: (Math.random() - 0.5) * shakeAmount * 2
      };
      
      // Réduire le flash blanc progressivement
      collisionFlash.current = Math.max(0, shakeIntensity);
    } else {
      screenShake.current = { x: 0, y: 0 };
      collisionFlash.current = 0;
    }
    
    // Appliquer l'inclinaison visuelle + tremblement
    ctx.save();
    ctx.translate(width / 2 + screenShake.current.x, height / 2 + screenShake.current.y);
    ctx.rotate(roll.current);
    ctx.translate(-width / 2, -height / 2);
    
    // Intensité de l'effet hyperspace (fondu progressif)
    const intensity = hyperspaceIntensity.current;
    
    // Dessiner les étoiles avec effet "hyperspace" si boost actif
    starsRef.current.forEach(star => {
      const scale = 1000 / (star.z + 1);
      const x = star.x * scale + width / 2;
      const y = star.y * scale + height / 2;
      const size = star.size * scale;
      
      if (x > 0 && x < width && y > 0 && y < height && size > 0.1) {
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        if (intensity > 0 && distanceFromCenter > 150) {
          // Effet Star Wars : lignes étirées depuis le centre avec fondu
          const angle = Math.atan2(dy, dx);
          const stretchLength = Math.min(50, scale * 100) * intensity; // Longueur proportionnelle à l'intensité
          
          // Dessiner uniquement la ligne avec opacité progressive
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, scale * 0.7 * intensity)})`;
          ctx.lineWidth = Math.max(1, size * 1.5);
          ctx.beginPath();
          ctx.moveTo(x - Math.cos(angle) * stretchLength, y - Math.sin(angle) * stretchLength);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        
        // Étoiles normales (toujours visibles, s'effacent progressivement au profit des lignes)
        if (intensity < 1) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, scale * (1 - intensity))})`;
          ctx.fillRect(x, y, size, size);
        }
      }
    });
    
    // Dessiner la grille du sol
    drawGrid(ctx, width, height);
    
    // Dessiner les obstacles (afficher ceux qui sont devant nous)
    obstaclesRef.current.forEach(obstacle => {
      if (obstacle.z > -100 && obstacle.z < 2000) {
        drawObstacle(ctx, width, height, obstacle, obstacle.z);
      }
    });
    
    // Dessiner les boss robots
    bossRobotsRef.current.forEach(boss => {
      drawBossRobot(ctx, boss, width, height);
    });
    
    ctx.restore();
    
    // Flash blanc en cas de collision (par-dessus tout)
    if (collisionFlash.current > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${collisionFlash.current * 0.7})`;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Dessiner le cockpit (HUD)
    drawHUD(ctx, width, height);
  };
  
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const horizon = height / 2 + planeY.current * 0.5 + pitch.current * 200;
    
    // Générer un terrain 3D en polygones - stable et doux pour les yeux
    const gridSize = 20; // Nombre de segments
    const tileSize = 150; // Taille d'une tuile
    
    // Calculer l'offset de défilement stable
    const scrollZ = Math.floor(planeZ.current / tileSize) * tileSize;
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = -8; col <= 8; col++) {
        const z = scrollZ + row * tileSize;
        const x = col * tileSize;
        
        const depth = z - planeZ.current;
        
        if (depth < 0) continue; // Derrière le joueur
        if (depth > 2500) continue; // Trop loin
        
        const scale = 1000 / (depth + 500);
        
        // Relief STABLE basé sur des coordonnées de grille entières
        const gridX = Math.floor(x / tileSize);
        const gridZ = Math.floor(z / tileSize);
        const seed = Math.sin(gridX * 12.9898 + gridZ * 78.233) * 43758.5453;
        const height1 = (seed - Math.floor(seed)) * 20; // Entre 0 et 20
        
        // 4 coins du polygone avec hauteur stable
        const x1 = (x - planeX.current) * scale + width / 2;
        const x2 = (x + tileSize - planeX.current) * scale + width / 2;
        
        const nextDepth = depth + tileSize;
        const nextScale = 1000 / (nextDepth + 500);
        const x3 = (x + tileSize - planeX.current) * nextScale + width / 2;
        const x4 = (x - planeX.current) * nextScale + width / 2;
        
        const baseY = horizon + (200 - planeY.current) * scale;
        const y1 = baseY + height1 * scale;
        const y2 = baseY + height1 * scale;
        
        const nextGridZ = Math.floor((z + tileSize) / tileSize);
        const nextSeed = Math.sin(gridX * 12.9898 + nextGridZ * 78.233) * 43758.5453;
        const height2 = (nextSeed - Math.floor(nextSeed)) * 20;
        const nextBaseY = horizon + (200 - planeY.current) * nextScale;
        const y3 = nextBaseY + height2 * nextScale;
        const y4 = nextBaseY + height2 * nextScale;
        
        // Couleur douce pour les yeux - vert foncé stable
        const darkness = Math.max(0.3, 1 - depth / 2500);
        const greenBase = 80 + height1 * 2; // Variation subtile
        const green = Math.floor(greenBase * darkness);
        const color = `rgb(0, ${green}, 20)`;
        
        // Dessiner le polygone
        ctx.fillStyle = color;
        ctx.strokeStyle = `rgba(0, ${Math.floor(green * 0.5)}, 10, 0.4)`;
        ctx.lineWidth = 0.5;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  };
  
  const drawObstacle = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    obstacle: Obstacle,
    relativeZ: number
  ) => {
    const scale = 1000 / (relativeZ + 1);
    const x = (obstacle.x - planeX.current) * scale + width / 2;
    const y = (obstacle.y - planeY.current) * scale + height / 2 + pitch.current * 100;
    const w = obstacle.width * scale;
    const h = obstacle.height * scale;
    
    if (x + w > 0 && x < width && scale > 0.01) {
      ctx.globalAlpha = Math.min(1, scale * 2);
      
      // UFO a son propre rendu spécial
      if (obstacle.type === 'ufo') {
        const ufoColor = obstacle.ufoColor || { h: 200, s: 80, l: 60 }; // Couleur par défaut si non définie
        drawUFO(ctx, x, y, w, h, scale, relativeZ, ufoColor);
        ctx.globalAlpha = 1;
        return;
      }
      
      // Effet de profondeur avec gradient
      const darkness = Math.max(0.5, 1 - relativeZ / 3000); // Augmenté de 0.3 à 0.5 pour plus de contraste
      
      switch (obstacle.type) {
        case 'building':
          // Bâtiment avec effet 3D et texture - couleurs plus vives
          const buildingGradient = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
          buildingGradient.addColorStop(0, `rgba(60, 80, 110, ${darkness})`); // Plus clair
          buildingGradient.addColorStop(0.5, `rgba(80, 110, 140, ${darkness})`); // Plus clair
          buildingGradient.addColorStop(1, `rgba(55, 75, 100, ${darkness})`); // Plus clair
          ctx.fillStyle = buildingGradient;
          ctx.fillRect(x - w / 2, y - h / 2, w, h);
          
          // Bordure néon cyan plus intense
          ctx.strokeStyle = `rgba(0, 255, 255, ${darkness})`;
          ctx.lineWidth = Math.max(2, scale * 3); // Plus épais
          ctx.strokeRect(x - w / 2, y - h / 2, w, h);
          
          // Fenêtres illuminées avec variation
          if (scale > 0.05) {
            const windowsPerRow = Math.max(2, Math.floor(w / 20));
            const windowsPerCol = Math.max(3, Math.floor(h / 20));
            
            for (let i = 0; i < windowsPerRow; i++) {
              for (let j = 0; j < windowsPerCol; j++) {
                // Certaines fenêtres éteintes aléatoirement
                const seed = Math.sin(i * 123.456 + j * 789.012 + obstacle.x * 0.1);
                const isLit = (seed * 1000) % 1 > 0.3;
                
                if (isLit) {
                  const windowX = x - w / 2 + (i + 0.5) * (w / windowsPerRow);
                  const windowY = y - h / 2 + (j + 0.5) * (h / windowsPerCol);
                  const windowW = (w / windowsPerRow) * 0.6;
                  const windowH = (h / windowsPerCol) * 0.7;
                  
                  // Glow effect derrière - plus intense
                  ctx.fillStyle = `rgba(255, 255, 0, ${darkness * 0.5})`;
                  ctx.fillRect(windowX - windowW / 2 - 2, windowY - windowH / 2 - 2, windowW + 4, windowH + 4);
                  
                  // Fenêtre - plus lumineuse
                  ctx.fillStyle = `rgba(255, 255, 200, ${darkness})`;
                  ctx.fillRect(windowX - windowW / 2, windowY - windowH / 2, windowW, windowH);
                  
                  // Croisillons
                  ctx.strokeStyle = `rgba(100, 100, 100, ${darkness})`;
                  ctx.lineWidth = Math.max(0.5, scale);
                  ctx.beginPath();
                  ctx.moveTo(windowX, windowY - windowH / 2);
                  ctx.lineTo(windowX, windowY + windowH / 2);
                  ctx.moveTo(windowX - windowW / 2, windowY);
                  ctx.lineTo(windowX + windowW / 2, windowY);
                  ctx.stroke();
                }
              }
            }
          }
          
          // Toit avec effet 3D
          ctx.fillStyle = `rgba(50, 60, 80, ${darkness})`; // Plus clair
          ctx.beginPath();
          ctx.moveTo(x - w / 2, y - h / 2);
          ctx.lineTo(x, y - h / 2 - scale * 10);
          ctx.lineTo(x + w / 2, y - h / 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = `rgba(0, 255, 255, ${darkness * 0.8})`; // Plus visible
          ctx.lineWidth = Math.max(1, scale * 2);
          ctx.stroke();
          break;
          
        case 'tower':
          // Tour radio/antenne avec effet métallique - couleurs plus vives
          const towerGradient = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
          towerGradient.addColorStop(0, `rgba(120, 70, 110, ${darkness})`); // Plus clair
          towerGradient.addColorStop(0.5, `rgba(140, 85, 120, ${darkness})`); // Plus clair
          towerGradient.addColorStop(1, `rgba(110, 60, 100, ${darkness})`); // Plus clair
          ctx.fillStyle = towerGradient;
          
          // Corps principal de la tour
          ctx.fillRect(x - w / 2, y - h / 2, w, h);
          
          // Bordure néon magenta plus intense
          ctx.strokeStyle = `rgba(255, 0, 255, ${darkness})`;
          ctx.lineWidth = Math.max(2, scale * 3); // Plus épais
          ctx.strokeRect(x - w / 2, y - h / 2, w, h);
          
          // Structure en treillis
          if (scale > 0.05) {
            ctx.strokeStyle = `rgba(200, 150, 200, ${darkness})`; // Plus visible
            ctx.lineWidth = Math.max(1, scale * 1.5); // Plus épais
            const segments = Math.max(3, Math.floor(h / 30));
            
            for (let i = 1; i < segments; i++) {
              const segY = y - h / 2 + (i * h / segments);
              ctx.beginPath();
              ctx.moveTo(x - w / 2, segY);
              ctx.lineTo(x + w / 2, segY);
              ctx.stroke();
              
              // Diagonales
              ctx.beginPath();
              ctx.moveTo(x - w / 2, segY - h / segments);
              ctx.lineTo(x + w / 2, segY);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(x + w / 2, segY - h / segments);
              ctx.lineTo(x - w / 2, segY);
              ctx.stroke();
            }
          }
          
          // Antenne au sommet avec lumière clignotante
          const antennaHeight = scale * 20;
          ctx.strokeStyle = `rgba(255, 200, 255, ${darkness})`; // Plus visible
          ctx.lineWidth = Math.max(2, scale * 2); // Plus épais
          ctx.beginPath();
          ctx.moveTo(x, y - h / 2);
          ctx.lineTo(x, y - h / 2 - antennaHeight);
          ctx.stroke();
          
          // Lumière rouge clignotante au sommet - plus intense
          const blink = Math.sin(Date.now() / 500) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255, 0, 0, ${Math.max(0.7, blink) * darkness})`; // Plus lumineux
          ctx.beginPath();
          ctx.arc(x, y - h / 2 - antennaHeight, Math.max(3, scale * 6), 0, Math.PI * 2); // Plus gros
          ctx.fill();
          
          // Glow de la lumière - plus intense
          ctx.fillStyle = `rgba(255, 0, 0, ${blink * darkness * 0.5})`;
          ctx.beginPath();
          ctx.arc(x, y - h / 2 - antennaHeight, Math.max(6, scale * 12), 0, Math.PI * 2); // Plus gros
          ctx.fill();
          break;
          
        case 'platform':
          // Plateforme volante avec effet métallique - couleurs plus vives
          const platformGradient = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
          platformGradient.addColorStop(0, `rgba(140, 160, 120, ${darkness})`); // Plus clair
          platformGradient.addColorStop(0.5, `rgba(110, 140, 80, ${darkness})`); // Plus clair
          platformGradient.addColorStop(1, `rgba(120, 140, 90, ${darkness})`); // Plus clair
          ctx.fillStyle = platformGradient;
          
          // Corps de la plateforme
          ctx.fillRect(x - w / 2, y - h / 2, w, h);
          
          // Bordure néon jaune plus intense
          ctx.strokeStyle = `rgba(255, 255, 0, ${darkness})`;
          ctx.lineWidth = Math.max(2, scale * 3); // Plus épais
          ctx.strokeRect(x - w / 2, y - h / 2, w, h);
          
          // Détails de surface
          if (scale > 0.05) {
            // Grille de surface - plus visible
            ctx.strokeStyle = `rgba(200, 220, 150, ${darkness})`;
            ctx.lineWidth = Math.max(1, scale);
            
            const gridLines = 4;
            for (let i = 1; i < gridLines; i++) {
              // Lignes verticales
              ctx.beginPath();
              ctx.moveTo(x - w / 2 + (i * w / gridLines), y - h / 2);
              ctx.lineTo(x - w / 2 + (i * w / gridLines), y + h / 2);
              ctx.stroke();
            }
            
            // Panneaux lumineux aux coins
            const cornerSize = Math.max(3, scale * 8);
            const corners = [
              [x - w / 2 + cornerSize, y - h / 2 + cornerSize],
              [x + w / 2 - cornerSize, y - h / 2 + cornerSize],
              [x - w / 2 + cornerSize, y + h / 2 - cornerSize],
              [x + w / 2 - cornerSize, y + h / 2 - cornerSize]
            ];
            
            corners.forEach(([cx, cy]) => {
              ctx.fillStyle = `rgba(255, 255, 0, ${darkness})`;
              ctx.fillRect(cx - cornerSize / 2, cy - cornerSize / 2, cornerSize, cornerSize);
              
              // Glow plus intense
              ctx.fillStyle = `rgba(255, 255, 0, ${darkness * 0.5})`;
              ctx.fillRect(cx - cornerSize, cy - cornerSize, cornerSize * 2, cornerSize * 2);
            });
          }
          
          // Réacteurs sous la plateforme - flammes plus visibles
          if (scale > 0.03) {
            const thrusterCount = 3;
            for (let i = 0; i < thrusterCount; i++) {
              const thrusterX = x - w / 2 + ((i + 1) * w / (thrusterCount + 1));
              const thrusterY = y + h / 2;
              
              // Flamme du réacteur - plus intense
              const flameIntensity = Math.sin(Date.now() / 100 + i) * 0.3 + 0.7;
              const flameGradient = ctx.createRadialGradient(thrusterX, thrusterY, 0, thrusterX, thrusterY + scale * 15, scale * 15);
              flameGradient.addColorStop(0, `rgba(255, 255, 100, ${flameIntensity * darkness})`); // Plus lumineux
              flameGradient.addColorStop(0.5, `rgba(255, 150, 0, ${flameIntensity * darkness})`); // Plus lumineux
              flameGradient.addColorStop(1, `rgba(255, 100, 0, ${flameIntensity * darkness * 0.5})`); // Plus visible
              
              ctx.fillStyle = flameGradient;
              ctx.beginPath();
              ctx.arc(thrusterX, thrusterY + scale * 10, scale * 12, 0, Math.PI * 2);
              ctx.fill();
              
              // Réacteur - plus visible
              ctx.fillStyle = `rgba(120, 120, 120, ${darkness})`;
              ctx.fillRect(thrusterX - scale * 3, thrusterY - scale * 2, scale * 6, scale * 4);
              
              // Contour du réacteur
              ctx.strokeStyle = `rgba(255, 255, 0, ${darkness * 0.6})`;
              ctx.lineWidth = Math.max(1, scale);
              ctx.strokeRect(thrusterX - scale * 3, thrusterY - scale * 2, scale * 6, scale * 4);
            }
          }
          break;
      }
      
      ctx.globalAlpha = 1;
    }
  };
  
  const drawUFO = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    scale: number,
    relativeZ: number,
    color: { h: number; s: number; l: number }
  ) => {
    // Animation de pulsation
    const pulse = Math.sin(Date.now() / 300 + relativeZ / 100) * 0.2 + 1;
    
    const opacity = Math.min(1, scale * 2);
    
    // Dôme supérieur (cupola) avec couleur personnalisée
    ctx.fillStyle = `hsla(${color.h}, ${color.s}%, ${Math.min(color.l + 20, 90)}%, ${opacity})`;
    ctx.beginPath();
    ctx.ellipse(x, y - h / 4, w / 2.5 * pulse, h / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Corps principal (saucer) avec gradient de couleur personnalisée
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, w / 2);
    gradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, ${opacity})`);
    gradient.addColorStop(0.7, `hsla(${color.h}, ${color.s}%, ${Math.max(color.l - 20, 30)}%, ${opacity})`);
    gradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${Math.max(color.l - 30, 20)}%, ${opacity})`);
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2 * pulse, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bordure lumineuse avec couleur complémentaire
    const complementaryHue = (color.h + 180) % 360;
    ctx.strokeStyle = `hsla(${complementaryHue}, 100%, 70%, ${Math.min(1, scale * 3) * pulse})`;
    ctx.lineWidth = Math.max(2, scale * 3);
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2 * pulse, h / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Lumières clignotantes avec variation de couleur
    const lightCount = 6;
    for (let i = 0; i < lightCount; i++) {
      const angle = (i / lightCount) * Math.PI * 2 + Date.now() / 1000;
      const lightX = x + Math.cos(angle) * w / 2.5;
      const lightY = y + Math.sin(angle) * h / 3;
      
      const lightPulse = Math.sin(Date.now() / 150 + i) * 0.5 + 0.5;
      const lightHue = (color.h + i * 60) % 360; // Variation de teinte pour chaque lumière
      ctx.fillStyle = `hsla(${lightHue}, 100%, 70%, ${lightPulse * scale})`;
      ctx.beginPath();
      ctx.arc(lightX, lightY, Math.max(2, scale * 4), 0, Math.PI * 2);
      ctx.fill();
      
      // Glow effect
      ctx.fillStyle = `hsla(${lightHue}, 100%, 80%, ${lightPulse * scale * 0.3})`;
      ctx.beginPath();
      ctx.arc(lightX, lightY, Math.max(4, scale * 8), 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  const drawBossRobot = (
    ctx: CanvasRenderingContext2D,
    boss: BossRobot,
    width: number,
    height: number
  ) => {
    if (boss.z < 0 || boss.z > 3000) return;
    
    const scale = 1000 / (boss.z + 100);
    const x = (boss.x - planeX.current) * scale + width / 2;
    const y = (boss.y - planeY.current) * scale + height / 2 + pitch.current * 100;
    const w = boss.width * scale;
    const h = boss.height * scale;
    
    // Couleur selon le type de persona
    let primaryColor = '';
    let secondaryColor = '';
    let name = '';
    
    switch (boss.personaType) {
      case 'technical':
        primaryColor = '#4080ff';
        secondaryColor = '#2050aa';
        name = 'TECH-BOT';
        break;
      case 'creative':
        primaryColor = '#ff40ff';
        secondaryColor = '#aa20aa';
        name = 'ART-BOT';
        break;
      case 'analytical':
        primaryColor = '#40ff80';
        secondaryColor = '#20aa50';
        name = 'LOGIC-BOT';
        break;
      case 'enthusiast':
        primaryColor = '#ffaa40';
        secondaryColor = '#aa7020';
        name = 'HYPE-BOT';
        break;
    }
    
    const animPhase = boss.patternPhase;
    
    // Corps principal
    ctx.fillStyle = primaryColor;
    ctx.fillRect(x - w / 2, y - h / 2, w, h * 0.6);
    
    // Tête
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(x - w / 3, y - h / 2 - h * 0.25, w * 0.66, h * 0.3);
    
    // Yeux brillants
    const eyeGlow = Math.sin(animPhase * 5) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 255, 0, ${eyeGlow})`;
    ctx.fillRect(x - w / 4, y - h / 2 - h * 0.15, w * 0.15, h * 0.1);
    ctx.fillRect(x + w / 10, y - h / 2 - h * 0.15, w * 0.15, h * 0.1);
    
    // Bras (animés)
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = Math.max(3, w * 0.1);
    const armSwing = Math.sin(animPhase * 3) * 0.3;
    
    // Bras gauche
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x - w / 2 - w * 0.3, y + h * 0.3 * armSwing);
    ctx.stroke();
    
    // Bras droit
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2 + w * 0.3, y - h * 0.3 * armSwing);
    ctx.stroke();
    
    // Jambes
    ctx.beginPath();
    ctx.moveTo(x - w / 4, y + h * 0.1);
    ctx.lineTo(x - w / 4, y + h / 2);
    ctx.moveTo(x + w / 4, y + h * 0.1);
    ctx.lineTo(x + w / 4, y + h / 2);
    ctx.stroke();
    
    // Nom du boss (si assez proche)
    if (boss.z < 1500) {
      ctx.fillStyle = primaryColor;
      ctx.font = `bold ${Math.max(12, scale * 20)}px monospace`;
      ctx.textAlign = 'center';
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 10;
      ctx.fillText(name, x, y - h / 2 - h * 0.35);
      ctx.shadowBlur = 0;
    }
    
    // Effet de particules autour du robot
    for (let i = 0; i < 5; i++) {
      const particleAngle = animPhase * 2 + i * Math.PI * 0.4;
      const particleX = x + Math.cos(particleAngle) * w * 0.7;
      const particleY = y + Math.sin(particleAngle) * h * 0.7;
      const particleOpacity = Math.sin(animPhase * 5 + i) * 0.5 + 0.5;
      
      ctx.fillStyle = `rgba(${boss.personaType === 'creative' ? '255, 64, 255' : '255, 255, 64'}, ${particleOpacity * 0.6})`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, Math.max(2, scale * 5), 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  const drawHUD = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Viseur central
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX - 30, centerY);
    ctx.lineTo(centerX - 10, centerY);
    ctx.moveTo(centerX + 10, centerY);
    ctx.lineTo(centerX + 30, centerY);
    ctx.moveTo(centerX, centerY - 30);
    ctx.lineTo(centerX, centerY - 10);
    ctx.moveTo(centerX, centerY + 10);
    ctx.lineTo(centerX, centerY + 30);
    ctx.stroke();
    
    // Informations de vol
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    
    // Vérifier si on est en limite de zone
    const maxX = 700;
    const maxY = 400;
    const minY = 200;
    const isAtLimitX = Math.abs(Math.abs(planeX.current) - maxX) < 1;
    const isAtLimitY = Math.abs(planeY.current - (-maxY)) < 1 || Math.abs(planeY.current - minY) < 1;
    const isAtLimit = isAtLimitX || isAtLimitY;
    
    // Score ou warning "HORS ZONE" (remplace le score)
    if (isAtLimit) {
      ctx.fillStyle = '#ff0000';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 15;
      ctx.fillText(`⚠ HORS ZONE - SCORE FIGÉ`, 20, 30);
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 10;
      ctx.fillText(`SCORE: ${currentScore.current}`, 20, 30);
      ctx.shadowBlur = 0;
    }
    
    ctx.font = '16px monospace';
    
    // Altitude avec code couleur selon proximité du sol
    const altColor = altitude < 350 ? '#ff0000' : altitude < 400 ? '#ffaa00' : '#00ff00';
    ctx.fillStyle = altColor;
    ctx.fillText(`ALT: ${Math.round(altitude)}m`, 20, 55);
    if (altitude < 350) {
      ctx.fillText('⚠ SOL PROCHE', 150, 55);
    }
    
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`SPEED: ${Math.round(velocityZ.current * 10)} km/h`, 20, 80);
    ctx.fillText(`DISTANCE: ${Math.round(distanceTraveled.current)}m`, 20, 105);
    
    // Difficulté : +1 tous les 3000m
    const difficulty = 1 + Math.floor(distanceTraveled.current / 3000);
    const targetObstacles = 15 + (difficulty - 1) * 10;
    const difficultyColor = difficulty <= 2 ? '#00ff00' : difficulty <= 5 ? '#ffaa00' : '#ff0000';
    ctx.fillStyle = difficultyColor;
    ctx.fillText(`NIVEAU: ${difficulty}`, 20, 130);
    
    // Nombre d'obstacles (afficher cible et actuel)
    const obstaclesAhead = obstaclesRef.current.filter(o => o.z > 0).length;
    const obstacleColor = obstaclesAhead >= targetObstacles ? '#00ff00' : obstaclesAhead >= targetObstacles * 0.7 ? '#ffaa00' : '#ff0000';
    ctx.fillStyle = obstacleColor;
    ctx.fillText(`OBSTACLES: ${obstaclesAhead}/${targetObstacles}`, 20, 155);
    
    // Barre de vie
    const healthPercent = currentHealth.current / 20000;
    const barWidth = 200;
    const barHeight = 20;
    const barX = 20;
    const barY = 180;
    
    // Fond de la barre
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Barre de vie avec gradient selon le niveau
    const healthColor = healthPercent > 0.6 ? '#00ff00' : healthPercent > 0.3 ? '#ffaa00' : '#ff0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Contour de la barre
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Texte de la vie
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`VIE: ${Math.round(currentHealth.current)}/20000`, barX, barY - 5);
    
    // Indicateur de régénération/perte - zone 3D (X et Y)
    // maxX = 700, maxY = 400, minY = 200
    const centerZoneX = 700 * 0.6; // 420
    const centerZoneY = (400 + 200) * 0.6; // 360
    const centerMinY = -centerZoneY / 2; // -180
    const centerMaxY = centerZoneY / 2; // 180
    
    const isInCenterZoneX = Math.abs(planeX.current) <= centerZoneX;
    const isInCenterZoneY = planeY.current >= centerMinY && planeY.current <= centerMaxY;
    const isInCenterZone = isInCenterZoneX && isInCenterZoneY;
    
    if (isInCenterZone) {
      ctx.fillStyle = '#00ff88';
      ctx.fillText('⚕ RÉGÉNÉRATION +1/m', barX + barWidth + 15, barY + 15);
    } else {
      ctx.fillStyle = '#ff4444';
      ctx.fillText('⚠ ZONE DANGEREUSE -5/m', barX + barWidth + 15, barY + 15);
    }
    
    // Effet visuel de bord rouge clignotant si hors zone
    if (isAtLimit) {
      const flashIntensity = Math.sin(Date.now() / 150) * 0.2 + 0.3;
      ctx.strokeStyle = `rgba(255, 0, 0, ${flashIntensity})`;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, width - 10, height - 10);
    }
    
    // Message de bonus
    if (bonusMessage && (Date.now() - bonusMessage.timestamp < 2000)) {
      const progress = (Date.now() - bonusMessage.timestamp) / 2000;
      const opacity = 1 - progress;
      const yOffset = progress * 30;
      
      ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 15;
      ctx.fillText(bonusMessage.text, width / 2, 100 - yOffset);
      ctx.shadowBlur = 0;
      
      // Réinitialiser après l'animation
      if (progress >= 1) {
        setBonusMessage(null);
      }
    }
    
    ctx.textAlign = 'left';
    
    // Avertissements de limites (si on approche des bords ou du sol)
    const warningThreshold = 600;
    const groundWarning = planeY.current > 150; // Avertissement à 150 pixels du sol (sol = 200)
    
    if (Math.abs(planeX.current) > warningThreshold || planeY.current < -350 || groundWarning) {
      const warningOpacity = 0.3 + Math.sin(Date.now() / 200) * 0.3;
      ctx.fillStyle = `rgba(255, 0, 0, ${warningOpacity})`;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      
      if (groundWarning) {
        ctx.fillText('! ATTENTION SOL !', width / 2, 50);
        // Indicateur visuel du sol en bas
        ctx.fillStyle = `rgba(255, 100, 0, ${warningOpacity})`;
        ctx.fillRect(0, height - 50, width, 50);
      } else {
        ctx.fillText('! LIMITE DE ZONE !', width / 2, 50);
      }
      
      // Bordures rouges clignotantes
      ctx.strokeStyle = `rgba(255, 0, 0, ${warningOpacity})`;
      ctx.lineWidth = 5;
      ctx.strokeRect(5, 5, width - 10, height - 10);
    }
    
    ctx.textAlign = 'left';
    
    // Horizon artificiel (simple)
    const horizonY = height / 2 - pitch.current * 300;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    for (let i = -3; i <= 3; i++) {
      const y = horizonY + i * 30;
      if (y > 100 && y < height - 100) {
        const lineLength = i === 0 ? 60 : 30;
        ctx.beginPath();
        ctx.moveTo(width - 150 - lineLength, y);
        ctx.lineTo(width - 150 + lineLength, y);
        ctx.stroke();
        
        if (i !== 0) {
          ctx.fillStyle = '#00ff00';
          ctx.font = '10px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${-i * 10}°`, width - 140, y + 4);
        }
      }
    }
    
    // Indicateur d'inclinaison
    ctx.save();
    ctx.translate(width - 150, horizonY);
    ctx.rotate(roll.current);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(50, 0);
    ctx.stroke();
    ctx.restore();
    
    // Visualisation de la zone de sécurité (mini-map en bas à droite)
    const miniMapSize = 120;
    const miniMapX = width - miniMapSize - 20;
    const miniMapY = height - miniMapSize - 60;
    
    // Fond semi-transparent
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // Zone de sécurité (60% central en vert)
    const safeZoneWidth = miniMapSize * 0.6;
    const safeZoneHeight = miniMapSize * 0.6;
    const safeZoneX = miniMapX + (miniMapSize - safeZoneWidth) / 2;
    const safeZoneY = miniMapY + (miniMapSize - safeZoneHeight) / 2;
    
    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.fillRect(safeZoneX, safeZoneY, safeZoneWidth, safeZoneHeight);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(safeZoneX, safeZoneY, safeZoneWidth, safeZoneHeight);
    
    // Zone dangereuse (reste en rouge)
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // Position du joueur
    const playerMapX = miniMapX + miniMapSize / 2 + (planeX.current / 700) * (miniMapSize / 2);
    const playerMapY = miniMapY + miniMapSize / 2 - (planeY.current / 600) * (miniMapSize / 2);
    
    // Calculer si on est dans la zone de sécurité
    const inSafeZone = isInCenterZone;
    
    ctx.fillStyle = inSafeZone ? '#00ff88' : '#ff4444';
    ctx.beginPath();
    ctx.arc(playerMapX, playerMapY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Titre de la mini-map
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ZONE DE SÉCURITÉ', miniMapX + miniMapSize / 2, miniMapY - 5);
    
    ctx.textAlign = 'left';
    
    // Instructions
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓←→/WASD: Piloter | ESPACE: Accélérer | ESC: Quitter | ⚠ Évitez les UFOs et le sol!', width / 2, height - 20);
  };
  
  const renderGameOver = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, width, height);
    
    // Effet de flash rouge
    const flashIntensity = Math.sin(Date.now() / 200) * 0.3 + 0.3;
    ctx.fillStyle = `rgba(255, 0, 0, ${flashIntensity})`;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 20;
    ctx.fillText('CRASH!', width / 2, height / 2 - 100);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`Score Final: ${currentScore.current}`, width / 2, height / 2 - 20);
    
    ctx.font = '20px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`Distance parcourue: ${Math.round(distanceTraveled.current)}m`, width / 2, height / 2 + 20);
    ctx.fillText(`Obstacles évités: ${obstaclesPassed.current.size}`, width / 2, height / 2 + 50);
    
    // Utiliser la même formule que le HUD : +1 tous les 3000m
    const finalDifficulty = 1 + Math.floor(distanceTraveled.current / 3000);
    const difficultyColor = finalDifficulty <= 2 ? '#00ff00' : finalDifficulty <= 5 ? '#ffaa00' : '#ff0000';
    ctx.fillStyle = difficultyColor;
    ctx.fillText(`Niveau atteint: ${finalDifficulty}`, width / 2, height / 2 + 80);
    
    ctx.font = '18px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.fillText('Cliquer pour fermer', width / 2, height / 2 + 130);
  };
  
  const handleClick = () => {
    if (gameOver) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black cursor-crosshair"
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
