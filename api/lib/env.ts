import "dotenv/config";

export const env = {
  appId: process.env.APP_ID ?? "",
  appSecret: process.env.APP_SECRET ?? "dev-secret-change-in-prod",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.TURSO_DATABASE_URL ?? (() => { throw new Error("TURSO_DATABASE_URL is not set"); })(),
  databaseAuthToken: process.env.TURSO_AUTH_TOKEN ?? "",
};