export interface Budgets {
  id: string;
  name: string;
  amount: number;
  emoji: string | null;
  createdAt: Date;
  // Utiliser le pluriel 'transactions' pour correspondre au schéma Prisma
  transactions?: Transactions[];
}

export interface Transactions {
  id: string;
  amount: number;
  emoji: string | null;
  description: string;
  createdAt: Date;
  budgetName?: string;
  budget?: string | null;
}
