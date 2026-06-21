/**
 * Erreurs métier centralisées.
 *
 * Toute erreur "attendue" (validation, ressource non trouvée, accès refusé...)
 * doit être levée via une de ces classes plutôt qu'un `new Error("...")` brut.
 * Ça permet :
 *  - de mapper proprement vers un code HTTP dans les routes API
 *  - de savoir quel message est "sûr" à renvoyer au client (toSafeErrorMessage)
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = "APP_ERROR",
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Ressource introuvable") {
    super(message, "NOT_FOUND", 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentification requise") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Accès refusé") {
    super(message, "FORBIDDEN", 403);
  }
}

/**
 * Convertit n'importe quelle erreur en message "sûr" à renvoyer au client.
 * Les erreurs inattendues (bug, erreur Prisma, etc.) ne doivent JAMAIS
 * être renvoyées telles quelles : on les logge et on renvoie un message générique.
 */
export function toSafeErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  console.error("Erreur inattendue:", error);
  return "Une erreur inattendue est survenue. Veuillez réessayer.";
}

/** Mappe une AppError vers le code HTTP correspondant (utilisé dans les routes API). */
export function toHttpStatus(error: unknown): number {
  if (error instanceof AppError) return error.statusCode;
  return 500;
}
