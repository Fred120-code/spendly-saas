/**
 * Convertit un tableau d'objets en chaîne CSV téléchargeable.
 * Pas de dépendance externe — le navigateur sait faire ça nativement.
 *
 * Exemple d'utilisation :
 *   const csv = generateCSV(transactions, ["date", "description", "montant"]);
 *   downloadCSV(csv, "transactions-janvier.csv");
 */

export type CSVRow = Record<string, unknown>;

/**
 * Formate une valeur pour qu'elle soit valide dans une cellule CSV.
 * Les valeurs qui contiennent une virgule ou des guillemets sont entourées
 * de guillemets doubles (standard RFC 4180).
 */
function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return value.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Génère une chaîne CSV à partir d'un tableau de lignes.
 * @param rows     Les données à exporter
 * @param columns  Les clés à inclure dans l'export (dans l'ordre)
 * @param headers  Les titres de colonnes (si différents des clés)
 */
export function generateCSV<T extends object>(
  rows: T[],
  columns: (keyof T)[],
  headers?: string[],
): string {
  const headerRow = headers ?? (columns as string[]);
  const lines = [
    headerRow.join(","),
    ...rows.map((row) => columns.map((col) => formatCell(row[col])).join(",")),
  ];
  return lines.join("\n");
}

/**
 * Déclenche le téléchargement d'un fichier CSV dans le navigateur.
 * Crée un lien temporaire invisible, clique dessus, puis le supprime.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildCSVFilename(prefix: string): string {
  const today = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");
  return `spendly-${prefix}-${today}.csv`;
}
