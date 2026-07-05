import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { reportService } from "@/modules/ai-reports/report.service";
import {
  assertAiRateLimit,
  reportRateLimiter,
} from "@/lib/rate-limit/ai-rate-limit";
import { toSafeErrorMessage, toHttpStatus } from "@/lib/errors/app-error";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    assertAiRateLimit(reportRateLimiter, user.id, "report");

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
