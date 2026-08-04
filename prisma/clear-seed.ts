import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//  Même email que dans seed.ts
const TARGET_EMAIL = "fredayemtsa@gmail.com";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
  });

  if (!user) {
    console.log("Aucun utilisateur trouvé, rien à supprimer.");
    return;
  }

  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
  });

  const ids = budgets.map((b) => b.id);

  const txDeleted = await prisma.transaction.deleteMany({
    where: { budgetId: { in: ids } },
  });

  const budgetDeleted = await prisma.budget.deleteMany({
    where: { userId: user.id },
  });

  console.log(
    `✓ ${budgetDeleted.count} budget(s) et ${txDeleted.count} transaction(s) supprimés.`,
  );
}

main()
  .catch((e) => {
    console.error("✗ Erreur :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
