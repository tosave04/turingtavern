# Guide de Stratégie - Flight Simulator

## 🎮 Objectif

Survivre le plus longtemps possible en évitant les obstacles et accumuler le score le plus élevé.

## 📊 Système de Score

### Points de Distance
- **+1 point** tous les 10 mètres parcourus
- Score continu qui augmente automatiquement

### Points d'Obstacles
- **+50 points** par obstacle évité
- Nécessite de passer l'obstacle (franchir le plan z=0)

### Score Total
```
Score = (Distance / 10) + (Obstacles évités × 50)
```

## 🎯 Difficulté Progressive

Le jeu devient plus difficile avec la distance :

| Distance  | Difficulté | Obstacles | Espacement | Danger |
|-----------|-----------|-----------|------------|--------|
| 0-1000m   | 1.0-1.5x  | 10-15     | Large      | ⭐     |
| 1000-2000m| 1.5-2.0x  | 15-20     | Moyen      | ⭐⭐   |
| 2000-4000m| 2.0-2.5x  | 20-25     | Serré      | ⭐⭐⭐ |
| 4000m+    | 2.5-3.0x  | 25-30     | Très serré | ⭐⭐⭐⭐ |

## 🚀 Stratégies Avancées

### 1. Début de Partie (0-1000m)
- ✅ Apprendre les contrôles
- ✅ Se familiariser avec la détection des obstacles
- ✅ Rester au centre de la zone
- ⚠️ Ne pas accélérer trop tôt

### 2. Phase Intermédiaire (1000-2000m)
- ✅ Commencer à utiliser l'accélération (ESPACE)
- ✅ Anticiper les obstacles lointains
- ✅ Faire des zigzags contrôlés
- ⚠️ Attention aux obstacles périphériques

### 3. Phase Difficile (2000m+)
- ✅ Mouvements fluides et précis
- ✅ Utiliser toute la zone de jeu
- ✅ Réagir rapidement aux groupes d'obstacles
- ⚠️ Ne pas se coller aux bords (limites de zone)

## 🎪 Types d'Obstacles

### 🏢 Bâtiments (Buildings)
- **Taille** : Large (60-100 pixels)
- **Hauteur** : Moyenne à haute
- **Fenêtres** : Illuminées (détails visuels)
- **Stratégie** : Contourner largement

### 🗼 Tours (Towers)
- **Taille** : Étroite (30 pixels)
- **Hauteur** : Très haute
- **Couleur** : Magenta
- **Stratégie** : Passage latéral possible

### 🛸 Plateformes (Platforms)
- **Taille** : Variable
- **Hauteur** : Basse (20 pixels)
- **Position** : Y=-200 (en hauteur)
- **Couleur** : Jaune
- **Stratégie** : Passer en-dessous ou à côté

## ⚠️ Pièges à Éviter

### 1. Camping dans un Coin
❌ **Ne fonctionne pas !**
- 20-50% des obstacles sont périphériques
- Vous serez forcé de bouger

### 2. Sortir de la Zone
❌ **Game Over garanti !**
- Avertissement visuel à 600 pixels (X) / 350 pixels (Y)
- Bordure rouge clignotante = DANGER
- Game over si dépassement de 100 pixels

### 3. Vitesse Excessive
❌ **Moins de temps de réaction !**
- L'accélération (ESPACE) augmente la vitesse max à 150 km/h
- Plus rapide = plus de points, mais plus difficile

## 🎨 Lecture du HUD

### Indicateurs Principaux
```
SCORE: 1250          ← Score total en temps réel
ALT: 500m            ← Altitude (500 = centre)
SPEED: 80 km/h       ← Vitesse actuelle
DISTANCE: 1250m      ← Distance parcourue
DIFFICULTÉ: 1.6x     ← Multiplicateur (couleur = danger)
OBSTACLES: 15        ← Nombre d'obstacles devant
```

### Codes Couleur

#### Difficulté
- 🟢 **Vert** (< 1.5x) : Facile, apprentissage
- 🟠 **Orange** (1.5-2.5x) : Moyen, attention requise
- 🔴 **Rouge** (> 2.5x) : Difficile, concentration maximale

#### Obstacles
- 🟢 **Vert** (≤ 10) : Normal
- 🟠 **Orange** (11-15) : Attention
- 🔴 **Rouge** (> 15) : Saturation, très dangereux

## 🏆 Records et Objectifs

### Objectifs Débutant
- ✅ Survivre 1000m
- ✅ Score de 500+
- ✅ Éviter 10 obstacles

### Objectifs Intermédiaire
- ✅ Survivre 2000m
- ✅ Score de 1500+
- ✅ Éviter 25 obstacles
- ✅ Atteindre difficulté 2.0x

### Objectifs Expert
- ✅ Survivre 4000m+
- ✅ Score de 3000+
- ✅ Éviter 50+ obstacles
- ✅ Atteindre difficulté 3.0x

## 💡 Conseils Pro

1. **Anticipation** : Regardez loin devant, pas juste le prochain obstacle
2. **Mouvements doux** : Évitez les corrections brusques
3. **Zone de confort** : Restez entre -400 et +400 en X/Y
4. **Rythme** : Trouvez un pattern de mouvement régulier
5. **Bonus** : Les +50 points par obstacle font la différence !

## 🎯 Challenge Ultime

**Pouvez-vous atteindre 5000 points ?**

Cela nécessite :
- Distance de ~3000m
- 40+ obstacles évités
- Survie en difficulté 2.5x+

Bonne chance, pilote ! ✈️🎮
