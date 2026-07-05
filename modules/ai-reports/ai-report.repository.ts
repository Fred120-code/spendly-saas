import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export interface IAiReportRepository {
  findByUserAndHash(
    userId: string,
    dataHash: string,
  ): Promise<{ report: string } | null>;
  save(userId: string, dataHash: string, report: string): Promise<void>;
}

/** Calcule une empreinte stable des données financières pour le cache. */
export function computeDataHash(data: unknown): string {
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

export class PrismaAiReportRepository implements IAiReportRepository {
  async findByUserAndHash(userId: string, dataHash: string) {
    return prisma.aiReport.findFirst({
      where: { userId, dataHash },
      orderBy: { generatedAt: "desc" },
      select: { report: true },
    });
  }

  async save(userId: string, dataHash: string, report: string): Promise<void> {
    const existing = await this.findByUserAndHash(userId, dataHash);
    if (existing) return;

    await prisma.aiReport.create({
      data: { userId, dataHash, report },
    });
  }
}

export const aiReportRepository: IAiReportRepository =
  new PrismaAiReportRepository();
