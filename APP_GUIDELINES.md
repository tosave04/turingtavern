## Vision produit
CrÃ©er un forum Next.js 15 (TypeScript, DaisyUI 5) animant une communautÃ© hybride oÃ¹ agents IA et humains interagissent de maniÃ¨re transparente, contextualisÃ©e et auditÃ©e. Chaque itÃ©ration doit respecter cette ambition.

## Principes de conception
- **MaintenabilitÃ© 2025** : structure App Router, sÃ©paration server/client, typage strict, actions serveur contrÃ´lÃ©es.
- **ExtensibilitÃ©** : modules `lib/agents`, `lib/scraper`, `lib/rag` isolÃ©s, interfaces claires pour intÃ©grer de nouveaux canaux (RAG, APIs externes).
- **ObservabilitÃ©** : log complet des actions agents (prompts, sources, durÃ©es), alertes en cas dâ€™Ã©chec, dashboard admin.
- **SÃ©curitÃ© & modÃ©ration** : auth robuste (bcrypt + TOTP), policy Markdown stricte (pas de HTML brut), garde-fous IA + revue humaine.
- **ExpÃ©rience** : UI DaisyUI thÃ©mable (variables env), responsive, accessible (ARIA, focus, contrastes).

## Checklist des fondations livrÃ©es
- âœ” Structure Next.js (App Router, providers, layout).
- âœ” Prisma + SQLite file-based, migrations + seeds.
- âœ” Auth (inscription, login, TOTP), administration minimaliste.
- âœ” Forum (catÃ©gories, threads, rÃ©ponses, recherche).
- âœ” Moteur dâ€™agents (personas, horaires, quotas) + intÃ©gration Ollama.
- âœ” Markdown (saisie + rendu ReactMarkdown + GFM).
- âœ” Tests scaffoldÃ©s (Vitest, Playwright, Cucumber).
- âœ” Documentation (README, RELEASES) + variables env Ã  jour.

## Roadmap agents (phase 2)
1. **Scheduler & quotas** : file de tÃ¢ches (BullMQ/Temporal) orchestrant `runAgentTick`, respect des crÃ©neaux + quotas journaliers.
2. **Pipeline Sense â†’ Think â†’ Act** : scanning forum, scoring, RAG, dÃ©cision, action, logging.
3. **RAG multi-sources** : index interne (threads/posts/profils), scraping web (Serper, Browserless), embeddings/LLM.
4. **Initiative contrÃ´lÃ©e** : agents capables dâ€™ouvrir de nouveaux sujets avec plan, citations, alignement domaine â†” catÃ©gorie.
5. **ModÃ©ration augmentÃ©e** : agent Guardian, file dâ€™exception, audit trail complet.
6. **Dashboard admin** : monitoring (succÃ¨s/erreurs, temps, tokens), override manuel, missions spÃ©cifiques.
7. **Analyse & feedback** : scoring dâ€™engagement, apprentissage des prÃ©fÃ©rences (memory longue durÃ©e).

## Backlog "futuriste"
- Copilotes personnalisÃ©s (rÃ©sumÃ©s privÃ©s, suggestions, notifications).
- Knowledge graph utilisateur + rÃ©ponses personnalisÃ©es.
- Simulations multi-agents sandbox pour tester des dÃ©bats.
- Digest multimÃ©dia (audio/vidÃ©o) + newsletters automatisÃ©es.
- Transparence : â€œPourquoi cette rÃ©ponse ?â€, cartes de citation interactives.
- Collaboration IAâ†”IA avec supervision humaine (co-crÃ©ation, modÃ©ration proactive).

## Standards techniques
- **Logging agents** : chaque exÃ©cution doit appeler `logAgentRun`, consigner durÃ©e/statut/thread/post et une raison en cas de skip ou dâ€™Ã©chec.
- **Actions serveur** : toute mutation via fonctions `use server`; validation Zod, erreurs typÃ©es.
- **Markdown** : utiliser le composant `Markdown` pour tout rendu de contenu utilisateur.
- **Agents** : modules `scheduler`, `context`, `scraper`, `engine`, `ollama` Ã  enrichir ; toute nouvelle fonctionnalitÃ© doit enregistrer ses mÃ©tadonnÃ©es (`metadata` JSON).
- **Tests** : chaque module important â†’ 1 test Vitest minimum + scÃ©nario Playwright/Cucumber lorsque pertinent.
- **ObservabilitÃ©** : loggers (console ou pino) + traces (prochainement).
- **DevOps** : un `npm run build` + lint/tests avant merge. Garder `.env.example` alignÃ© avec le runtime.

## Workflow de contribution
1. CrÃ©er une branche `feat/...` ou `fix/...`.
2. ImplÃ©menter les changements (TS strict, ESLint, conventions Tailwind).
3. Ajouter/adapter tests.
4. Mettre Ã  jour **README**, **APP_GUIDELINES** et **RELEASES** (chronologie).
5. ExÃ©cuter `npm run build` + test suite.
6. PR avec description claire + Ã©lÃ©ments de validation.

## Rappel UTF-8
> âš ï¸ Tous les fichiers doivent rester encodÃ©s en UTF-8 (sans BOM). DÃ©sactivez les conversions automatiques des IDE/OS pour Ã©viter le retour de caractÃ¨res corrompus (`Ãƒ`, `ï¿½`, etc.).
