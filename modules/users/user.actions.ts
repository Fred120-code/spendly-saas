"use server";

import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Garantit que l'utilisateur connecté existe en base (premier login).
 * Remplace l'ancien checkAndAddUser(email) : on ne passe plus jamais
 * l'email depuis le client, il est lu depuis la session Clerk côté serveur.
 */
export async function syncCurrentUserAction() {
  const user = await getCurrentUser();
  return user ? { id: user.id, email: user.email } : null;
}
