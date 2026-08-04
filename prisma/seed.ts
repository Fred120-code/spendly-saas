import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 👉 Remplace par l'email avec lequel tu te connectes sur Spendly (via Clerk)
const TARGET_EMAIL = "fredayemtsa@gmail.com";

const BUDGETS = [
  {
    name: "Alimentation",
    amount: 80000,
    emoji: "🍔",
    transactions: [
      { description: "Courses supermarché", amount: 12500 },
      { description: "Marché du quartier", amount: 8000 },
      { description: "Boulangerie", amount: 2500 },
      { description: "Épicerie de nuit", amount: 4300 },
      { description: "Fruits et légumes", amount: 6000 },
      { description: "Viande boucherie", amount: 9500 },
      { description: "Boissons", amount: 3200 },
    ],
  },
  {
    name: "Transport",
    amount: 45000,
    emoji: "🚗",
    transactions: [
      { description: "Essence station Total", amount: 15000 },
      { description: "Taxi moto", amount: 1500 },
      { description: "Bus interurbain", amount: 3500 },
      { description: "Entretien voiture", amount: 8000 },
      { description: "Parking centre-ville", amount: 2000 },
    ],
  },
  {
    name: "Loisirs",
    amount: 30000,
    emoji: "🎮",
    transactions: [
      { description: "Cinéma", amount: 4500 },
      { description: "Abonnement Netflix", amount: 5000 },
      { description: "Sortie restaurant", amount: 12000 },
      { description: "Livre", amount: 3500 },
    ],
  },
  {
    name: "Logement",
    amount: 150000,
    emoji: "🏠",
    transactions: [
      { description: "Loyer mensuel", amount: 120000 },
      { description: "Facture électricité", amount: 8500 },
      { description: "Facture eau", amount: 4000 },
      { description: "Internet fibre", amount: 15000 },
    ],
  },
  {
    name: "Santé",
    amount: 25000,
    emoji: "💊",
    transactions: [
      { description: "Pharmacie", amount: 6500 },
      { description: "Consultation médecin", amount: 10000 },
      { description: "Analyses médicales", amount: 7500 },
    ],
  },
  {
    name: "Vêtements",
    amount: 40000,
    emoji: "👗",
    transactions: [
      { description: "Chemises travail", amount: 15000 },
      { description: "Chaussures", amount: 18000 },
    ],
  },
  {
    name: "Épargne",
    amount: 50000,
    emoji: "💰",
    transactions: [{ description: "Virement épargne", amount: 30000 }],
  },
  {
    name: "Restaurants",
    amount: 35000,
    emoji: "🍽️",
    transactions: [
      { description: "Déjeuner collègues", amount: 8500 },
      { description: "Dîner en famille", amount: 14000 },
      { description: "Fast food", amount: 3500 },
      { description: "Café réunion", amount: 2500 },
    ],
  },
];

// Répartit les transactions sur les 60 derniers jours de façon réaliste
function randomDateInRange(daysAgo: number): Date {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - daysAgo);
  return new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime()),
  );
}

async function main() {
  console.log(`\n🌱 Seed en cours pour : ${TARGET_EMAIL}\n`);

  const user = await prisma.user.upsert({
    where: { email: TARGET_EMAIL },
    update: {},
    create: { email: TARGET_EMAIL },
  });

  console.log(`✓ Utilisateur prêt (id: ${user.id})\n`);

  for (const budgetData of BUDGETS) {
    // Crée le budget
    const budget = await prisma.budget.create({
      data: {
        name: budgetData.name,
        amount: budgetData.amount,
        emoji: budgetData.emoji,
        userId: user.id,
      },
    });

    // Crée chaque transaction avec une date aléatoire dans les 60 derniers jours
    for (const tx of budgetData.transactions) {
      await prisma.transaction.create({
        data: {
          description: tx.description,
          amount: tx.amount,
          emoji: budgetData.emoji,
          budgetId: budget.id,
          createdAt: randomDateInRange(60),
        },
      });
    }

    const total = budgetData.transactions.reduce((s, t) => s + t.amount, 0);
    const pct = Math.round((total / budgetData.amount) * 100);
    console.log(
      `✓ ${budgetData.emoji}  ${budgetData.name.padEnd(14)} — ` +
        `${budgetData.transactions.length} transactions — ` +
        `${total.toLocaleString("fr-FR")} / ${budgetData.amount.toLocaleString("fr-FR")} FCFA (${pct}%)`,
    );
  }

  console.log("\n✅ Seed terminé avec succès !\n");
}

main()
  .catch((e) => {
    console.error("✗ Erreur pendant le seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
