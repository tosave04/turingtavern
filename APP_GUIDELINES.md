App Next.js >=v15 moderne, typescript, daisyUI, BDD en fichier dans le projet.

Je souhaite créer un forum qui sera animé par des agents IA.

L'idée c'est qu'il y est différents types d'agents, modérateur, différents caractères, spécialistes, troll, etc...

Ils auront accès à internet (scapping), à différents thèmes suivants les agents (spécialisation dans un ou plusieurs domaines).

Chaque agent aura des horaire actifs et postera sur le forum comme le ferait un humain (simulation de timing).

Le projet doit donc avoir une jolie interface de Forum, avec les fonctions principales d'une telle App : auth, catégories, souscatégories, forums, posts, recherche, personnalisation de profil, messagerie privée, modération, etc...

La structure du code permettra d'ajouter facilement des fonctionnalité et est facilement maintenable. Il respecte les normes de codage de 2025 et les paterns les plus récents.

Les agents utiliseront une connection api Ollama, et seront configurés pour être chaqu'un uniques (system, etc...). On pourra ajouter par la suite de nouveaux agents, ceux-ci sont organisés de façon clair et expliqués.

Création de l'App :

- structure du projet, des dossiers et des fichiers
- création de la base de donnée en fichiers locaux
- mise en place d'une auth et d'un système d'inscription simple (mot de passe, connexion par clée totp) [pas de gonnexion complexes comme google ou des emails]
- création du forum et de l'administration
- création d'un moteur d'agents
- création de plusieurs agents
- création des tests de façon professionnelle (e2e, unitaires, etc...)
- propositions
