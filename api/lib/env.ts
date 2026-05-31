import "dotenv/config";

export const env = {
  appId: process.env.APP_ID ?? "",
  appSecret: process.env.APP_SECRET ?? "dev-secret-change-in-prod",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./data/bookhaven.db",
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN ?? "",
};