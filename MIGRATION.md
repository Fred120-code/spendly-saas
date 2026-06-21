# Migration vers l'architecture "Monolithe Modulaire"

## Ce qui a changé

### Nouvelle structure

```
lib/
├── auth/current-user.ts      → SOURCE UNIQUE de vérité sur "qui est connecté"
├── errors/app-error.ts       → classes d'erreurs métier centralisées
└── prisma.ts                 → client Prisma (inchangé)

modules/
├── users/
│   ├── user.repository.ts    → accès Prisma (interface + impl)
│   ├── user.service.ts       → logique métier
│   ├── user.actions.ts       → Server Actions (contrôleurs fins)
│   └── user.types.ts
├── budgets/
│   ├── budget.repository.ts
│   ├── budget.service.ts     → vérifie l'ownership (corrige l'IDOR)
│   ├── budget.validator.ts
│   └── budget.actions.ts
├── transactions/
│   ├── transaction.repository.ts
│   ├── transaction.service.ts
│   ├── transaction.validator.ts
│   └── transaction.actions.ts
└── ai-reports/
    ├── ai-client.ts           → seul fichier qui connaît le SDK Gemini
    └── report.service.ts      → logique métier (contexte + prompts)
```

### Supprimé
- `app/actions.ts` (remplacé par les `*.actions.ts` de chaque module)
- `lib/services/`, `lib/validators/`, `lib/handlers/` (migrés dans `modules/`)
- `lib/repositories/` (dossier vide, jamais utilisé)
- `app/generated/prisma/` (client Prisma généré **pour SQLite**, leftover
  d'une ancienne config avant la migration vers MongoDB — mort depuis
  longtemps, jamais importé par le code)
- `prisma/dev.db` (fichier SQLite leftover, le projet utilise MongoDB)

## Faille de sécurité corrigée au passage (IDOR)

**Avant**, l'identité de l'utilisateur était fournie par le client :
```ts
addBudget(email, name, amount, emoji)
GET /api/report?email=quelqu-un@example.com
POST /api/chat-ia { question, email }
```
N'importe qui pouvait changer l'email envoyé et lire/modifier les données
d'un autre compte.

**Maintenant**, toutes les Server Actions et routes API appellent
`requireCurrentUser()` qui lit la session Clerk **côté serveur**. Aucune
fonction métier n'accepte plus un email ou un userId venant du client.

En plus, `BudgetService.getOwnedBudgetById(userId, budgetId)` vérifie
explicitement que le budget appartient à l'utilisateur avant de le
renvoyer — utilisé pour consulter un budget, y ajouter une transaction,
le supprimer, ou supprimer une transaction. Avant, ces opérations ne
vérifiaient aucune appartenance.

## ⚠️ Action de ta part requise

Le fichier `.env` présent dans le zip contenait de vraies credentials
(MongoDB Atlas, Clerk, Gemini). Par précaution, considère-les comme
compromises et régénère-les :
1. MongoDB Atlas → change le mot de passe de l'utilisateur de connexion
2. Clerk Dashboard → régénère `CLERK_SECRET_KEY`
3. Google AI Studio → régénère `GEMINI_API_KEY`

Utilise `.env.example` comme modèle pour ton nouveau `.env` (non commité,
déjà dans `.gitignore`).

## Comment tester

```bash
npm install
npx prisma generate
npm run dev
```

Toutes les pages (`dashboard`, `budgets`, `manage/[budgetId]`,
`transactions`) et les routes API (`/api/report`, `/api/chat-ia`) ont été
mises à jour pour utiliser les nouvelles actions — plus aucun email n'est
échangé entre client et serveur.

Bonus : le chat IA (`<ChatIA />`), qui était présent mais désactivé en
commentaire dans le dashboard, a été réactivé (il fonctionne maintenant
sans prop, l'identité venant de la session).

## Prochaines étapes possibles
- Audit de sécurité complet (rate limiting sur l'IA, validation Zod, CSP, headers)
- Nouvelles fonctionnalités (multi-devises, catégories, exports, etc.)
- Dockerfile multi-stage + docker-compose
- Pipeline de déploiement (CI/CD)
