# Test du Flight Simulator

## Instructions de test

1. Ouvrir http://localhost:3000
2. Maintenir la touche **F** enfoncée
3. Cliquer sur le logo "Turing Tavern"
4. Effet de glitch doit apparaître
5. Le jeu se lance

## Points à vérifier

### ✅ Obstacles
- [ ] Les obstacles apparaissent continuellement
- [ ] Il y a toujours environ 10 obstacles devant l'avion
- [ ] Les obstacles restent visibles (ne disparaissent pas après un certain temps)
- [ ] On peut voir des bâtiments, tours et plateformes variés

### ✅ Score
- [ ] Le score s'affiche dès le début (commence à 0)
- [ ] Le score augmente progressivement pendant le vol (+1 tous les 10m)
- [ ] Message "+50 OBSTACLE ÉVITÉ!" apparaît quand on passe un obstacle
- [ ] Le score augmente de +50 à chaque obstacle évité
- [ ] Le score final s'affiche correctement au game over

### ✅ HUD (affichage)
- [ ] SCORE: affiche le score en temps réel (avec effet lumineux vert)
- [ ] ALT: affiche l'altitude en mètres
- [ ] SPEED: affiche la vitesse en km/h
- [ ] DISTANCE: affiche la distance parcourue en mètres
- [ ] OBSTACLES: affiche le nombre d'obstacles devant (vert si ≤5, orange si >5)

### ✅ Game Over
- [ ] Collision avec obstacle déclenche le game over
- [ ] Effet flash rouge pulsant
- [ ] Affiche "CRASH!" en gros
- [ ] Affiche le score final
- [ ] Affiche la distance parcourue
- [ ] Affiche le nombre d'obstacles évités
- [ ] Clic ferme le jeu

### ✅ Contrôles
- [ ] ↑/W: Monte
- [ ] ↓/S: Descend
- [ ] ←/A: Gauche
- [ ] →/D: Droite
- [ ] ESPACE: Accélère
- [ ] ESC: Quitte

## Bugs connus résolus

- ✅ Les obstacles ne disparaissent plus après un certain temps
- ✅ Le score s'affiche maintenant en temps réel pendant le jeu
- ✅ Les obstacles sont correctement trackés avec des IDs uniques
- ✅ Le système de scoring fonctionne correctement

## Notes de test

Date: 18 octobre 2025
Testeur: _____________
Statut: _____________
Commentaires:
_____________________
_____________________
