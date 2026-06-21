import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { reportService } from "@/modules/ai-reports/report.service";
import { toSafeErrorMessage, toHttpStatus } from "@/lib/errors/app-error";

/**
 * Avant : GET /api/report?email=quelqu'un@example.com
 * N'importe qui pouvait lire le rapport financier d'un autre utilisateur
 * en changeant l'email dans l'URL (IDOR).
 *
 * Maintenant : l'utilisateur est résolu depuis la session Clerk côté
 * serveur, jamais depuis un paramètre fourni par le client.
 */
export async function GET() {
  try {
    const user = await requireCurrentUser();
    const report = await reportService.generateMonthlyReport(user.id);
    return NextResponse.json({ report }, { status: 200 });
  } catch (error) {
    console.error("Erreur /api/report:", error);
    return NextResponse.json(
      { error: toSafeErrorMessage(error) },
      { status: toHttpStatus(error) },
    );
  }
}
