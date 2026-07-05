import { describe, it, expect } from "vitest";
import { InMemoryRateLimiter } from "./ai-rate-limit";
import { RateLimitError } from "@/lib/errors/app-error";

describe("InMemoryRateLimiter", () => {
  it("autorise les requêtes dans la limite", () => {
    const limiter = new InMemoryRateLimiter(3, 60_000);

    expect(() => limiter.check("user-1")).not.toThrow();
    expect(() => limiter.check("user-1")).not.toThrow();
    expect(() => limiter.check("user-1")).not.toThrow();
  });

  it("bloque au-delà de la limite", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);

    limiter.check("user-1");
    limiter.check("user-1");

    expect(() => limiter.check("user-1")).toThrow(RateLimitError);
  });

  it("isole les clés par utilisateur", () => {
    const limiter = new InMemoryRateLimiter(1, 60_000);

    limiter.check("user-1");
    expect(() => limiter.check("user-2")).not.toThrow();
  });
});
