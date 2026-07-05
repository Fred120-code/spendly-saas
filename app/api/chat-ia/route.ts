import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { reportService } from "@/modules/ai-reports/report.service";
import { AiValidator } from "@/modules/ai-reports/ai.validator";
import {
  assertAiRateLimit,
  chatRateLimiter,
} from "@/lib/rate-limit/ai-rate-limit";
import { toSafeErrorMessage, toHttpStatus } from "@/lib/errors/app-error";

export async function POST(req: NextRequest) {
  try {
    const user = await requireCurrentUser();
    assertAiRateLimit(chatRateLimiter, user.id, "chat-ia");

    const body = await req.json();
    const { question } = AiValidator.validateQuestion(body);

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
