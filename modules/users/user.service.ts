import { userRepository, type IUserRepository } from "./user.repository";
import { NotFoundError } from "@/lib/errors/app-error";

export class UserService {
  constructor(private readonly repo: IUserRepository = userRepository) {}

  /**
   * Garantit qu'un utilisateur existe pour cet email (le crée au premier login).
   * Cette méthode est la SEULE façon de "résoudre" un email Clerk vers un user
   * interne : elle n'est appelée que depuis lib/auth/current-user.ts, jamais
   * directement avec un email fourni par le client.
   */
  async ensureUser(email: string) {
    const existing = await this.repo.findByEmail(email);
    if (existing) return existing;
    return this.repo.create(email);
  }

  async getUserWithBudgets(userId: string) {
    const user = await this.repo.findWithBudgets(userId);
    if (!user) {
      throw new NotFoundError("Utilisateur introuvable");
    }
    return user;
  }
}

export const userService = new UserService();
