import "server-only";
import { currentUser as getClerkUser } from "@clerk/nextjs/server";
import { userService } from "@/modules/users/user.service";
import { UnauthorizedError } from "@/lib/errors/app-error";
import type { AppUser } from "@/modules/users/user.types";

/**
 * Résout l'utilisateur interne (table User) à partir de la session Clerk
 * en cours, en le créant au besoin (premier login).
 *
 * RÈGLE D'OR : c'est la SEULE fonction autorisée à déterminer "qui est
 * connecté". Aucune Server Action ni route API ne doit jamais faire
 * confiance à un email/userId envoyé par le client (body, query string,
 * props) pour décider de quelles données renvoyer ou modifier.
 *
 * Avant ce refactor, addBudget(email, ...) et /api/report?email=...
 * faisaient exactement ça : n'importe qui pouvait lire ou modifier les
 * données d'un autre utilisateur en changeant l'email envoyé. Cette
 * fonction corrige ça à la racine.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const clerkUser = await getClerkUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return null;
  }

  return userService.ensureUser(email);
}

/**
 * Variante stricte : lève une UnauthorizedError si personne n'est connecté.
 * À utiliser dans TOUTES les Server Actions et routes API qui touchent
 * à des données utilisateur (la middleware protège déjà les routes, mais
 * une vérification explicite ici évite toute régression future si la
 * matcher de middleware.ts change).
 */
export async function requireCurrentUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError("Vous devez être connecté pour effectuer cette action.");
  }
  return user;
}
