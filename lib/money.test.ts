import { describe, it, expect } from "vitest";
import { formatMoney, CURRENCY_CODE } from "./money";

describe("formatMoney", () => {
  it("formate un montant en FCFA", () => {
    expect(formatMoney(1500)).toMatch(/1[\s\u202f]?500 FCFA/);
  });

  it("expose la constante de devise", () => {
    expect(CURRENCY_CODE).toBe("FCFA");
  });
});
