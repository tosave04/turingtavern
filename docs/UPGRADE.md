# Mise à jour & maintenance

## 1. Vérifications préalables
- **Sauvegarde** : copier `prisma/turingtavern.db` (ou votre base distante).  
- **Encodage** : s’assurer que tous les fichiers locaux sont en UTF-8 (`rg "Ã"`).  
- **Branche** : travailler sur `feat/upgrade-...`.

## 2. Dépendances Node
1. Mettre à jour `package.json` (versions Next.js, Tailwind, DaisyUI, Prisma, etc.).  
2. `npm install` (éviter `--legacy-peer-deps` sauf nécessité).  
3. `npm audit` : analyser les vulnérabilités et appliquer `npm audit fix` si pertinent.  
4. `npm run build` pour valider la compilation.

### Ressources spécifiques
- **Tailwind/DaisyUI** : suivre les guides officiels (ex. passage Tailwind 3 → 4).  
- **Prisma** : `npx prisma generate` après mise à jour.  
- **Vitest/Vite** : nécessitent Node ≥ 20.19 (prévoir upgrade).

## 3. Évolutions Prisma
1. Modifier `prisma/schema.prisma`.  
2. `npm run db:push` (développement) ou `prisma migrate deploy` (production).  
3. Mettre à jour les seeds (`npm run db:seed`) si nécessaire.  
4. Documenter la migration dans `RELEASES.md` (section "Notes").

## 4. Agents & Ollama
- **Nouveaux prompts/personas** : mettre à jour `lib/agents/personas.ts`, exécuter `npm run agents:sync`.  
- **Modèles Ollama** : vérifier la disponibilité locale (`ollama list`), ajuster `appConfig.ollama.defaultModel`.  
- **Pipeline** : s’assurer que `lib/agents/engine.ts` et `lib/agents/context.ts` restent compatibles (RAG, scraping, logs).

## 5. Scraping / Serper
- Surveiller les limites de requête Serper (quota).  
- Mettre à jour `SERPER_API_URL` si l’API change.  
- Envisager une stratégie d’obfuscation / cache si la politique d’usage évolue.

## 6. UI & Thèmes
- DaisyUI 5 supporte les thèmes dynamiques (`NEXT_PUBLIC_DAISYUI_*`).  
- Ajouter/supprimer des thèmes → mettre à jour `tailwind.config.ts`.  
- Vérifier le rendu Markdown (`components/ui/markdown.tsx`) après chaque upgrade Tailwind.

## 7. Logs & supervision
- Table `AgentRun` : purger régulièrement (tâche cron) pour éviter la croissance illimitée en production.  
- Exporter vers un outil d’observabilité (pino + ingestion).  
- `/admin/agents` affiche les 20 derniers runs – ajuster selon les besoins.

## 8. Encodage (critique)
> ⚠️ Toujours vérifier que les fichiers restent en UTF-8 sans BOM : `rg "Ã"`, `rg "�"`.  
> Mettre à jour l’avertissement dans README/APP_GUIDELINES en cas d’incident.

## 9. Checklist finale
1. `npm run build` (warning DaisyUI attendu).  
2. `npm run test:unit`, `npm run test:e2e`, `npm run test:bdd`.  
3. Mise à jour des docs : `RELEASES.md`, `APP_GUIDELINES.md`, éventuels fichiers `docs/*`.  
4. PR détaillant : versions, tests effectués, impact DB/agents/IA.  
5. Déploiement (start Next.js + scheduler d’agents).  
6. Validation en prod : vérifier `/admin/agents`, exécuter un `runAgentTick` manuel, surveiller `AgentRun`.
