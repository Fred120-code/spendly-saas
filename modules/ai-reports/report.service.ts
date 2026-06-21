import { aiClient, type IAiClient } from "./ai-client";
import { budgetService } from "@/modules/budgets/budget.service";
import { userService } from "@/modules/users/user.service";
import { ValidationError } from "@/lib/errors/app-error";

interface ReportData {
  budgetName: string;
  totalBudgetAmount: number;
  totalTransactionAmount: number;
}

function buildBudgetContext(budgets: { name: string; transactions: { amount: number }[] }[]): string {
  return `Voici les budgets financiers de l'utilisateur:
- Nombre de budgets: ${budgets.length}
- Détails:
${budgets
  .map(
    (b) =>
      `• ${b.name}: ${b.transactions.length} transactions, total = ${b.transactions.reduce((s, t) => s + t.amount, 0)}€`,
  )
  .join("\n")}`;
}

export class ReportService {
  constructor(private readonly client: IAiClient = aiClient) {}

  /** Génère le rapport mensuel intelligent affiché dans <RapportAI />. */
  async generateMonthlyReport(userId: string): Promise<string> {
    const stats: ReportData[] = await budgetService.getDistributionData(userId);
    if (!stats || stats.length === 0) {
      throw new ValidationError("Aucune donnée trouvée pour générer un rapport");
    }

    const prompt = `
Tu es un expert en gestion des finances.
Analyse ces données et écris un rapport clair et synthétique pour un gestionnaire non technique.

Commence naturellement (ex : "Voici une analyse détaillée de votre situation financière").
Réponds de manière très brève, claire et utile, le plus court et clair possible.

Voici les données financières :
${JSON.stringify(stats, null, 2)}

Génère un rapport clair avec :
- Un résumé du mois
- Les points forts
- Les dépenses à surveiller
- Des conseils et astuces personnalisés
    `;

    return this.client.generateText(prompt);
  }

  /** Répond à une question posée dans le chat IA, dans le contexte des budgets de l'utilisateur. */
  async answerQuestion(userId: string, question: string): Promise<string> {
    const user = await userService.getUserWithBudgets(userId);
    const context = buildBudgetContext(user.budgets);

    const prompt = `Contexte : ${context}\n\nQuestion : ${question}\n\nRéponds de manière très brève, claire et utile, le plus court et clair possible`;

    return this.client.generateText(prompt);
  }
}

export const reportService = new ReportService();
