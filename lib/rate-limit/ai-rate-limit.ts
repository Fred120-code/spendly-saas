import { RateLimitError } from "@/lib/errors/app-error";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Rate limiter en mémoire (adapté à une instance unique).
 * Pour un déploiement multi-instances, remplacer par Redis/Upstash.
 */
export class InMemoryRateLimiter {
  private readonly store = new Map<string, RateLimitEntry>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  /** Vérifie la limite et incrémente le compteur si autorisé. */
  check(key: string): void {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return;
    }

    if (entry.count >= this.maxRequests) {
      throw new RateLimitError(
        `Trop de requêtes. Réessayez dans ${Math.ceil((entry.resetAt - now) / 1000)} secondes.`,
      );
    }

    entry.count += 1;
  }
}

/** 5 rapports IA par heure par utilisateur. */
export const reportRateLimiter = new InMemoryRateLimiter(5, 60 * 60 * 1000);

/** 20 questions chat par heure par utilisateur. */
export const chatRateLimiter = new InMemoryRateLimiter(20, 60 * 60 * 1000);

export function assertAiRateLimit(
  limiter: InMemoryRateLimiter,
  userId: string,
  scope: string,
): void {
  limiter.check(`${scope}:${userId}`);
}
