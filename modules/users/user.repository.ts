import { prisma } from "@/lib/prisma";
import type { AppUser } from "./user.types";

export interface UserWithBudgets extends AppUser {
  budgets: {
    id: string;
    name: string;
    amount: number;
    emoji: string | null;
    transactions: { id: string; amount: number; description: string; emoji: string | null; createdAt: Date }[];
  }[];
}

/**
 * Interface du repository : c'est le "port" que le service utilise.
 * En la définissant à part de l'implémentation Prisma, on peut un jour
 * la mocker dans des tests ou changer de base de données sans toucher
 * à la logique métier de UserService.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<AppUser | null>;
  create(email: string): Promise<AppUser>;
  findWithBudgets(userId: string): Promise<UserWithBudgets | null>;
}

export class PrismaUserRepository implements IUserRepository {
  findByEmail(email: string): Promise<AppUser | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  create(email: string): Promise<AppUser> {
    return prisma.user.create({ data: { email } });
  }

  findWithBudgets(userId: string): Promise<UserWithBudgets | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        budgets: {
          include: { transactions: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }
}

export const userRepository: IUserRepository = new PrismaUserRepository();
