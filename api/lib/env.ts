import "dotenv/config";

export const env = {
  appId: process.env.APP_ID ?? "",
  appSecret: process.env.APP_SECRET ?? "dev-secret-change-in-prod",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || (() => { throw new Error("DATABASE_URL or TURSO_DATABASE_URL is required"); })(),
  databaseAuthToken: (process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN) ?? "",
};