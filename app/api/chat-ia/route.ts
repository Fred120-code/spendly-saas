import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { reportService } from "@/modules/ai-reports/report.service";
import { toSafeErrorMessage, toHttpStatus, ValidationError } from "@/lib/errors/app-error";

/**
 * Avant : POST /api/chat-ia avec { question, email } dans le body.
 * Même faille que /api/report : l'email du body faisait foi.
 *
 * Maintenant : seule la question vient du client, l'identité vient
 * de la session Clerk.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      throw new ValidationError("Question manquante");
    }

    const reponse = await reportService.answerQuestion(user.id, question);

    return NextResponse.json({ reponse }, { status: 200 });
  } catch (error) {
    console.error("Erreur ChatIA:", error);
    return NextResponse.json(
      { error: toSafeErrorMessage(error) },
      { status: toHttpStatus(error) },
    );
  }
}
