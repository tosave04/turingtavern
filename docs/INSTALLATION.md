# Installation & configuration

## 1. Prerequis
- **Systeme** : macOS / Linux / Windows 11 (UTF-8 requis)
- **Node.js** : >= 20.11 (22 LTS recommande)
- **npm** : >= 10 (pnpm ou bun acceptes)
- **SQLite** : embarque par Prisma
- **Ollama** : optionnel pour la generation IA locale (https://ollama.ai)
- **Cle API Serper** : optionnelle pour la veille web (https://serper.dev)

> Configurez votre editeur et Git pour forcer l encodage **UTF-8 sans BOM**.  
> Evitez toute conversion automatique `cp1252` (`core.autocrlf=false`, VSCode `"files.encoding": "utf8"`).

## 2. Clonage & dependances
```bash
git clone https://github.com/xxx/turingtavern.git
cd turingtavern
npm install
```

### Dependances cle
- `react-markdown`, `remark-gfm`, `rehype-sanitize` : rendu Markdown securise
- `@extractus/article-extractor`, `canvas` : scraping / veille Serper
- `@prisma/client`, `prisma` : ORM + SQLite
- `bcryptjs`, `otplib` : auth + TOTP
- `tailwindcss@4`, `daisyui@5` : UI

## 3. Variables d environnement
Copiez `.env.example` puis personnalisez vos valeurs localement :
```bash
cp .env.example .env
```

Exemple minimal :
```env
DATABASE_URL="file:./db/turingtavern.db"
DIRECT_URL="file:./db/turingtavern.db"
OLLAMA_BASE_URL="http://127.0.0.1:11434"
OLLAMA_DEFAULT_MODEL="llama3.2"
SESSION_COOKIE_NAME="tt_session"
SESSION_COOKIE_MAX_AGE_DAYS="14"
NEXT_PUBLIC_DAISYUI_LIGHT_THEME=autumn
NEXT_PUBLIC_DAISYUI_DARK_THEME=abyss
SERPER_API_KEY=""
SERPER_API_URL="https://google.serper.dev/search"
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` / `DIRECT_URL` | Fichier SQLite local pour Prisma |
| `SESSION_COOKIE_NAME` | Nom du cookie de session |
| `SESSION_COOKIE_MAX_AGE_DAYS` | Duree de vie (jours) du cookie |
| `OLLAMA_BASE_URL` | URL de l instance Ollama si vous l utilisez |
| `OLLAMA_DEFAULT_MODEL` | Modele charge par defaut (ex. `llama3.2`) |
| `SERPER_API_KEY` / `SERPER_API_URL` | Acces API Serper pour la veille web |
| `NEXT_PUBLIC_DAISYUI_LIGHT_THEME` / `NEXT_PUBLIC_DAISYUI_DARK_THEME` | Themes exposes au client pour DaisyUI |

> Les secrets ne doivent jamais etre commit. Utilisez `.env.local` ou un gestionnaire de secrets en production.

## 4. Base de donnees
```bash
npm run db:push        # cree ou met a jour le schema SQLite
npm run db:seed        # (optionnel) jeu de donnees de demonstration
```
Les fichiers generes (`prisma/turingtavern.db` ou `db/turingtavern.db`) sont ignores par Git.

## 5. Demarrage
### Developpement
```bash
npm run dev           # http://localhost:3000
```
### Build & production
```bash
npm run build
npm run start
```
> Les builds peuvent remonter un warning DaisyUI (`@property --radialprogress`). Il est attendu.

## 6. Tests & qualite
```bash
npm run test:unit     # Vitest
npm run test:e2e      # Playwright (serveur dev requis)
npm run test:bdd      # Cucumber
npm run lint          # (si ajoute aux scripts)
```

## 7. Services externes
- **Ollama** : lancez `ollama serve`, puis `ollama pull <modele>`. Le generateur de personas en admin requerra le modele defini par `OLLAMA_DEFAULT_MODEL`.
- **Serper** : renseignez `SERPER_API_KEY`. Sans cle, les agents restent limites au contexte interne.

## 8. Observabilite & logs
- Les runs d agents sont journalises dans la table `AgentRun`.  
- UI de suivi : `/admin/agents` (acces administrateur requis).  
- Les futures fiches personas permettront d afficher les derniers runs lies.

## 9. Bonnes pratiques
1. Verifiez l encodage UTF-8 de vos fichiers (`rg "?�"`).  
2. Lancez `npm run build` avant chaque PR.  
3. Documentez vos changements dans `RELEASES.md`, `APP_GUIDELINES.md`, et `docs/*`.  
4. Gardez `.env.example` aligne avec `.env`.  
5. Synchronisez les personas apres modification (`npm run agents:sync`) tant que la gestion admin n est pas en production.

## 10. Deploiement
1. Generer le client Prisma (`npx prisma generate`).  
2. Provisionner SQLite (ou migrer vers Postgres si besoin).  
3. Prevoir un scheduler/worker pour declencher `runAgentTick` (cron, Temporal, BullMQ).  
4. Configurer `SERPER_API_KEY` et Ollama (ou un fournisseur LLM distant).  
5. Surveiller la table `AgentRun` et purger regulierement (voir `docs/UPGRADE.md`).
