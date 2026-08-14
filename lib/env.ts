/**
 * Validation des variables d'environnement au démarrage
 */

const REQUIRED_SERVER_VARS = [
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "GEMINI_API_KEY",
] as const;

const REQUIRED_PUBLIC_VARS = ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] as const;

type ServerVar = (typeof REQUIRED_SERVER_VARS)[number];
type PublicVar = (typeof REQUIRED_PUBLIC_VARS)[number];

function validateEnv() {
  const missing: string[] = [];

  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of REQUIRED_PUBLIC_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `
        \n\n variable d'environnement maquantes :\n\n` +
        missing.map((key) => ` -${key}`).join("\n") +
        `\n\n Concultez .env.example pour la liste complete \n`,
    );
  }
}
