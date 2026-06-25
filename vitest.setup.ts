import { vi } from "vitest";

/**
 * Les repositories importent `{ prisma } from "@/lib/prisma"`, ce qui crée
 * un vrai PrismaClient dès que le fichier est chargé — même si le test
 * n'utilise que le repository factice. On remplace ce module par une
 * coquille vide : aucun test ne doit jamais avoir besoin du vrai Prisma.
 */
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
