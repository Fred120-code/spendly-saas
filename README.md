# Spendly 

> SaaS de gestion de finances personnelles propulsé par l'IA — budgets, suivi des dépenses et rapports intelligents générés par Google Gemini.

---

## Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Données de démonstration](#données-de-démonstration)
- [Tests](#tests)
- [Déploiement Docker](#déploiement-docker)
- [PWA — Installation mobile](#pwa--installation-mobile)
- [Sécurité](#sécurité)

---

## Aperçu

Spendly AI est une application web full-stack construite avec Next.js 15 (App Router). Elle permet de créer des budgets, d'y enregistrer des transactions, et d'obtenir des analyses financières personnalisées générées par l'IA Gemini de Google.

L'application est également installable comme application mobile (PWA) sur Android et iOS, sans passer par les stores.

---

## Fonctionnalités

- **Gestion des budgets** — Créer, modifier et supprimer des budgets avec emoji et montant alloué
- **Transactions** — Ajouter, modifier, supprimer et filtrer les transactions par période
- **Export CSV** — Télécharger l'historique des transactions au format CSV (compatible Excel)
- **Rapport IA** — Rapport mensuel généré automatiquement par Google Gemini
- **Chat IA** — Assistant conversationnel contextuel basé sur les données financières de l'utilisateur
- **Dashboard** — KPIs, graphiques (BarChart + PieChart), alertes de dépassement de budget, transactions récentes
- **PWA** — Installable sur l'écran d'accueil mobile, fonctionne comme une app native
- **Performance** — Cache côté client avec Redux Toolkit, requêtes MongoDB ciblées, index Prisma

---

## Stack technique

| Catégorie | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS, DaisyUI |
| Authentification | Clerk |
| Base de données | MongoDB Atlas |
| ORM | Prisma |
| IA | Google Gemini (`gemini-2.5-pro`) |
| État global | Redux Toolkit + React-Redux |
| Graphiques | Recharts |
| Tests | Vitest |
| Conteneurisation | Docker + Docker Compose |
| Reverse proxy | Caddy (HTTPS automatique) |
| Icônes | Lucide React |

---

## Architecture

Spendly AI suit une architecture **monolithe modulaire** avec des influences de Clean Architecture — le code est organisé par domaine métier plutôt que par couche technique.

```
Composant React (Client)
    ↓
Server Action (contrôleur fin — vérifie l'identité via Clerk)
    ↓
Service (logique métier — règles, validation, ownership)
    ↓
Repository (accès Prisma — seul endroit qui connaît MongoDB)
    ↓
MongoDB Atlas
```


## Structure du projet

```
spendly/
├── app/                          # Pages et composants Next.js
│   ├── (auth)/                   # Pages Clerk (sign-in, sign-up)
│   ├── api/                      # Routes API (rapport IA, chat IA)
│   ├── budgets/                  # Page liste des budgets
│   ├── dashboard/                # Page tableau de bord
│   ├── manage/[budgetId]/        # Page détail d'un budget
│   ├── transactions/             # Page historique des transactions
│   ├── components/               # Composants réutilisables
│   ├── manifest.ts               # Configuration PWA
│   └── layout.tsx
│
├── modules/                      # Logique métier par domaine
│   ├── budgets/
│   │   ├── budget.repository.ts  # Accès Prisma
│   │   ├── budget.service.ts     # Logique métier + ownership
│   │   ├── budget.validator.ts   # Validation des inputs
│   │   ├── budget.actions.ts     # Server Actions (contrôleurs)
│   │   ├── __fakes__/            # Repository factice pour les tests
│   │   └── __fixtures__/         # Données fictives pour les tests
│   ├── transactions/             # Même structure que budgets
│   ├── users/                    # Gestion des comptes utilisateur
│   ├── ai-reports/               # Client Gemini + service rapports
│   └── dashboard/                # Action groupée pour le dashboard
│
├── store/                        # Redux Toolkit
│   ├── index.ts                  # Store global
│   ├── hooks.ts                  # useAppDispatch, useAppSelector typés
│   ├── StoreProvider.tsx         # Wrapper client pour Next.js
│   ├── dashboardSlice.ts         # État + cache du dashboard
│   └── budgetsSlice.ts           # État + cache des budgets
│   └── transactionSlice.ts           # État + cache des transactions
│
├── lib/
│   ├── auth/current-user.ts      # requireCurrentUser() — source unique d'identité
│   ├── errors/app-error.ts       # Classes d'erreurs métier centralisées
│   ├── prisma.ts                 # Client Prisma singleton
│   └── utils/csv.ts              # Génération et téléchargement CSV
│
├── prisma/
│   ├── schema.prisma             # Modèles + index MongoDB
│   ├── seed.ts                   # Données de démonstration
│   └── clear-seed.ts             # Nettoyage des données de démonstration
│
├── public/
│   └── icons/                    # Icônes PWA (192px, 512px)
│
└── docker/
    ├── Dockerfile                # Build multi-étapes (deps → builder → runner)
    ├── docker-compose.yml        # Orchestration app + Caddy
    └── Caddyfile                 # Reverse proxy + HTTPS automatique
```

---

## Prérequis

- Node.js 20+
- npm
- Un compte [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuit)
- Un compte [Clerk](https://clerk.com) (gratuit)
- Une clé API [Google Gemini](https://aistudio.google.com) (gratuite)

---

## Installation

```bash
# 1. Cloner le projet
git clone https://github.com/ton-username/spendly.git
cd spendly

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Renseigner les valeurs dans .env.local (voir section suivante)

# 4. Générer le client Prisma
npx prisma generate

# 5. Appliquer le schéma à la base de données
npx prisma db push

# 6. Lancer en développement
npm run dev
```

## Variables d'environnement

Copier `.env.example` en `.env.local` et renseigner les valeurs :

```env
# Base de données MongoDB Atlas
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?appName=<app>"

# Clerk — Authentification
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/

# Google Gemini — IA
GEMINI_API_KEY="..."
```


---

## Données de démonstration

Pour remplir l'application avec des données fictives sans avoir à tout créer à la main :

```bash
# 1. Ouvrir prisma/seed.ts et remplacer TARGET_EMAIL
#    par l'email avec lequel tu te connectes sur Spendly

# 2. Lancer le seed (crée 4 budgets avec 3 à 5 transactions chacun)
npm run seed

# 3. Pour tout effacer et repartir de zéro
npm run seed:clear
```

**Basculer entre données réelles et données de démonstration** sans toucher au code :

```bash
# Créer un fichier .env.development.local avec une DATABASE_URL
# pointant vers une autre base (ex: spendly_dev au lieu de spendly).
# Next.js l'utilise automatiquement en priorité pendant npm run dev.
# Supprimer ce fichier pour revenir aux données réelles.
```

---

## Tests

Les tests unitaires utilisent Vitest avec des repositories factices en mémoire — aucune connexion à MongoDB nécessaire.

```bash
# Lancer tous les tests
npm run test

# Mode watch (relance automatiquement à chaque modification)
npm run test:watch
```

**Ce qui est couvert :**
- `BudgetService` — création, accès, suppression, comptage, protection IDOR
- `TransactionService` — ajout, modification, suppression, vérification de budget disponible

---

## Déploiement Docker

Tous les fichiers Docker sont dans le dossier `docker/`.

### Test local avant déploiement

```bash
# Builder l'image
docker build -f docker/Dockerfile \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx \
  -t spendly .

# Lancer le conteneur
docker run -p 3000:3000 --env-file docker/.env spendly
```

### Déploiement sur VPS

```bash
# 1. Se connecter au VPS et installer Docker
ssh root@ton-ip
curl -fsSL https://get.docker.com | sh

# 2. Cloner le projet
git clone https://github.com/ton-username/spendly.git
cd spendly

# 3. Créer le fichier de secrets de production
nano docker/.env
# (mêmes variables que .env.local, avec les clés de production)

# 4. Configurer le domaine dans docker/Caddyfile
nano docker/Caddyfile
# Remplacer "votre-domaine.com" par ton vrai domaine
# (ou ":80" pour un accès sans domaine via l'IP)

# 5. Ouvrir les ports nécessaires
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable

# 6. Lancer
docker compose -f docker/docker-compose.yml up -d --build

# 7. Vérifier les logs
docker compose -f docker/docker-compose.yml logs -f app
```

Caddy gère automatiquement le certificat HTTPS (Let's Encrypt) dès qu'un nom de domaine est configuré dans le `Caddyfile` — aucune configuration manuelle de certificat nécessaire.

---

## PWA — Installation mobile

Spendly est une Progressive Web App installable sur smartphone :

**Android (Chrome)** : ouvrir le site → icône "Installer l'application" dans la barre d'adresse.

**iPhone (Safari)** : ouvrir le site → bouton Partager → "Sur l'écran d'accueil".

L'application s'ouvre alors en plein écran, sans barre d'adresse, comme une app native.

> HTTPS requis pour l'installation PWA — disponible automatiquement après déploiement avec Caddy.

