# Changelog des Easter Eggs

## Flight Simulator - Nouvelles Fonctionnalités (18 octobre 2025 - v3)

### 🛸 Nouveau type d'obstacle : UFOs !

**Apparence :**
- Soucoupes volantes avec dôme supérieur
- Corps principal avec dégradé radial bleu-violet
- Bordure lumineuse cyan pulsante
- 6 lumières jaunes clignotantes autour de la soucoupe
- Animation de pulsation et rotation des lumières
- Effet de glow autour des lumières

**Comportement :**
- Positionnés dans le ciel (Y entre -150 et -250)
- Taille : 50-80 pixels de largeur, 40-60 de hauteur
- Apparition aléatoire parmi les autres obstacles
- Animation fluide en temps réel

### 💥 Collision avec le sol

**Mécanique :**
- Le sol est situé à Y=200 (altitude 300m)
- **Game over immédiat** si on touche le sol
- Avertissement visuel à partir de 350m d'altitude :
  - Message rouge clignotant "! ATTENTION SOL !"
  - Bande orange pulsante en bas de l'écran
  - Bordures rouges d'alerte
- Indicateur d'altitude avec code couleur :
  - 🟢 Vert : > 400m (sûr)
  - 🟠 Orange : 350-400m (attention)
  - 🔴 Rouge : < 350m (danger) + avertissement "⚠ SOL PROCHE"

### 🎯 Plus d'obstacles périphériques

**Avant :** 40% d'obstacles sur les bords
**Maintenant :** 60% d'obstacles sur les bords !

**Répartition améliorée :**
- Obstacles centraux : 40% (zone -400 à +400)
- Obstacles périphériques : 60% (zone ±350 à ±650)
- Impossible de rester dans un coin
- Force des manœuvres constantes

**Placement :**
- Bords gauche/droit : ±350 à ±650 pixels
- Distribution équilibrée entre gauche et droite
- Les UFOs peuvent apparaître partout (centre + périphérie)

### 📊 Améliorations du HUD

1. **Altitude améliorée**
   - Code couleur dynamique (vert/orange/rouge)
   - Avertissement "⚠ SOL PROCHE" si < 350m
   - Affichage en temps réel de la distance au sol

2. **Instructions mises à jour**
   - Mention des UFOs
   - Avertissement du sol
   - Police optimisée pour tout afficher

### 🎨 Nouveaux visuels

- **UFOs animés** : Pulsation, rotation des lumières, effets de glow
- **Avertissement sol** : Bande orange en bas de l'écran
- **Dégradés** : UFOs avec gradients radiaux sophistiqués
- **Animations** : Lumières clignotantes à différentes fréquences

### ⚙️ Équilibrage

| Type d'obstacle | Position Y | Taille | Fréquence | Difficulté |
|-----------------|-----------|--------|-----------|-----------|
| Bâtiments       | 0 (sol)   | Large  | 25%       | ⭐⭐     |
| Tours           | 0 (sol)   | Étroit | 25%       | ⭐⭐⭐   |
| Plateformes     | -200      | Moyen  | 25%       | ⭐⭐     |
| **UFOs**        | **-150 à -250** | **Moyen** | **25%** | **⭐⭐⭐⭐** |

### 🎮 Impact sur le gameplay

✅ Plus de variété visuelle avec les UFOs animés
✅ Nouveau danger : le sol (limite inférieure)
✅ Zones de vol réduites (haut ET bas)
✅ 60% d'obstacles périphériques = plus de challenge
✅ Nécessite une gestion active de l'altitude
✅ Avertissements visuels clairs et progressifs

## Flight Simulator - Améliorations Gameplay (18 octobre 2025 - v2)

### Nouvelles fonctionnalités

1. **Difficulté progressive**
   - La difficulté augmente avec la distance parcourue (1x → 3x max)
   - Calcul : `difficulty = min(3, 1 + distance / 2000)`
   - Affichage en temps réel dans le HUD avec code couleur :
     - Vert : < 1.5x (facile)
     - Orange : 1.5x - 2.5x (moyen)
     - Rouge : > 2.5x (difficile)

2. **Augmentation du nombre d'obstacles**
   - Début : 10 obstacles
   - Maximum : 30 obstacles (difficulté 3x)
   - Formule : `10 + (difficulté - 1) × 10`
   - L'espacement entre obstacles diminue également

3. **Obstacles périphériques**
   - 20% à 50% des obstacles sont sur les côtés (selon difficulté)
   - Empêche de rester dans un coin pour progresser à l'infini
   - Placement stratégique entre 300-600 pixels sur les bords

4. **Limites de la zone de jeu**
   - Zone maximale : ±700 en X, ±400 en Y
   - **Avertissement visuel** quand on approche (>600 en X ou >350 en Y) :
     - Message clignotant "! LIMITE DE ZONE !"
     - Bordure rouge pulsante
   - **Game over** si on sort complètement (+100 pixels au-delà)

### Améliorations du HUD

- **Affichage de la difficulté** : Nouveau indicateur avec code couleur
- **Obstacles** : Code couleur amélioré (vert/orange/rouge selon le nombre)
- **Statistiques Game Over** : Ajout de la difficulté atteinte

### Équilibrage

| Distance | Difficulté | Obstacles | % Périphériques | Espacement |
|----------|-----------|-----------|-----------------|------------|
| 0m       | 1.0x      | 10        | 20%             | 300-400m   |
| 1000m    | 1.5x      | 15        | 27.5%           | 262-362m   |
| 2000m    | 2.0x      | 20        | 35%             | 225-325m   |
| 4000m    | 3.0x      | 30        | 50%             | 150-250m   |

### Impact sur le gameplay

✅ Plus de challenge progressif
✅ Impossible de camper dans un coin
✅ Besoin de manœuvrer constamment
✅ Récompense l'habileté sur la durée

## Flight Simulator - Corrections (18 octobre 2025 - v1)

### Problèmes résolus

1. **Les obstacles disparaissaient après un certain temps**
   - **Cause** : La fonction de rendu comparait `obstacle.z - planeZ.current`, mais `planeZ.current` n'était jamais mis à jour (restait à 0)
   - **Solution** : Supprimé la logique inutile de `planeZ.current` et comparé directement `obstacle.z` avec des valeurs fixes (-100 à 2000)

2. **Le score restait à 0 pendant le jeu**
   - **Cause 1** : Les IDs d'obstacles étaient recalculés à chaque frame, donc jamais reconnus comme identiques
   - **Solution** : Ajout d'un ID unique permanent dans le type `Obstacle` généré lors de la création
   - **Cause 2** : React state update trop lent pour l'affichage en temps réel
   - **Solution** : Ajout de `currentScore.current` ref pour affichage instantané dans le canvas

### Changements techniques

- Ajout du champ `id: string` au type `Obstacle`
- Génération d'ID unique : `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
- Utilisation de `currentScore.current` pour l'affichage temps réel du score
- Normalisation du score de distance avec `deltaTime * 60`
- Simplification de la logique de rendu des obstacles

### Système de scoring amélioré

- **Distance** : +1 point tous les 10 mètres
- **Bonus obstacle** : +50 points par obstacle évité
- **Affichage** : Mise à jour en temps réel visible dans le HUD
- **Animation** : Message doré "+50 OBSTACLE ÉVITÉ!" qui s'élève progressivement

## Snake Game - Améliorations précédentes

- Multiplicateur de score basé sur le nombre d'agents IA
- Animation de bonus visuelle
- Affichage du multiplicateur dans le HUD
