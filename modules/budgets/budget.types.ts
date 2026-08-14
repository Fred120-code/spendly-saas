import { Transactions } from "../transactions/transaction.types";

export interface Budgets {
  id: string;
  name: string;
  amount: number;
  emoji: string | null;
  createdAt: Date;
  // Utiliser le pluriel 'transactions' pour correspondre au schéma Prisma
  transactions?: Transactions[];
}
