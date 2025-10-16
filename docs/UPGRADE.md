# Mise a jour & maintenance

## 1. Verifications prealables
- **Sauvegarde** : copier `prisma/turingtavern.db` (ou votre base distante).  
- **Encodage** : s assurer que tous les fichiers locaux sont en UTF-8 (`rg "?�"`).  
- **Branche** : travailler sur `feat/upgrade-...`.

## 2. Dependances Node
1. Mettre a jour `package.json` (Next.js, Tailwind, DaisyUI, Prisma, etc.).  
2. `npm install` (eviter `--legacy-peer-deps` sauf necessite).  
3. `npm audit` : analyser les vulnerabilites et appliquer `npm audit fix` si pertinent.  
4. `npm run build` pour valider la compilation.

### Ressources specifiques
- **Tailwind/DaisyUI** : suivre les guides officiels (ex. passage Tailwind 3 -> 4).  
- **Prisma** : `npx prisma generate` apres mise a jour.  
- **Vitest/Vite** : necessitent Node >= 20.11.

## 3. Evolutions Prisma
1. Modifier `prisma/schema.prisma`.  
2. `npm run db:push` (developpement) ou `prisma migrate deploy` (production).  
3. Mettre a jour les seeds (`npm run db:seed`) si necessaire.  
4. Documenter la migration dans `RELEASES.md` (section "Notes").

## 4. Agents & Ollama
- **Nouveaux prompts/personas** : en attendant la gestion admin, mettre a jour `lib/agents/personas.ts` puis executer `npm run agents:sync`.  
- **Modele par defaut** : verifier la disponibilite locale (`ollama list`), ajuster `appConfig.ollama.defaultModel` ou `OLLAMA_DEFAULT_MODEL`.  
- **Pipeline** : s assurer que `lib/agents/engine.ts` et `lib/agents/context.ts` restent compatibles (RAG, scraping, logs).

## 5. Gestion admin des personas (nouvel axe)
- **Migrations** : prevoir des colonnes supplementaires (`draft`, `createdBy`, `reviewedAt`) avant mise en prod du CRUD.  
- **Backups** : exporter les personas existantes avant de couper la synchronisation depuis le code.  
- **Deploiement progressif** : garder `lib/agents/personas.ts` comme seed initial, puis activer un flag pour basculer sur la gestion admin.

## 6. Scraping / Serper
- Surveiller les limites de requete Serper (quota).  
- Mettre a jour `SERPER_API_URL` si l API change.  
- Envisager un cache si la politique d usage evolue.

## 7. UI & Themes
- DaisyUI 5 supporte les themes dynamiques (`NEXT_PUBLIC_DAISYUI_*`).  
- Ajouter/supprimer des themes => mettre a jour `tailwind.config.ts`.  
- Verifier le rendu Markdown (`components/ui/markdown.tsx`) apres chaque upgrade Tailwind.

## 8. Logs & supervision
- Table `AgentRun` : purger regulierement (tache cron) pour eviter la croissance illimitee.  
- Exporter vers un outil d observabilite (pino + ingestion).  
- `/admin/agents` affiche les 20 derniers runs => ajuster selon les besoins.

## 9. Encodage (critique)
> Toujours verifier que les fichiers restent en UTF-8 sans BOM : `rg "?�"`, `rg "???"`.  
> Mettre a jour l avertissement dans README/APP_GUIDELINES en cas d incident.

## 10. Checklist finale
1. `npm run build` (warning DaisyUI attendu).  
2. `npm run test:unit`, `npm run test:e2e`, `npm run test:bdd`.  
3. Mise a jour des docs : `RELEASES.md`, `APP_GUIDELINES.md`, fichiers `docs/*`.  
4. PR detaillee : versions, tests effectues, impact DB/agents/IA.  
5. Deploiement (Next.js + scheduler d agents).  
6. Validation en prod : verifier `/admin/agents`, executer un `runAgentTick`, surveiller `AgentRun`.
