/** Devise affichée dans toute l'application. */
export const CURRENCY_CODE = "FCFA" as const;

/** Formate un montant en FCFA (ex. "1 500 FCFA"). */
export function formatMoney(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} ${CURRENCY_CODE}`;
}
