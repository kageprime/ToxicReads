import "dotenv/config";

export const env = {
  appId: process.env.APP_ID ?? "",
  appSecret: process.env.APP_SECRET ?? (() => { throw new Error("APP_SECRET is not set"); })(),
  readTokenSecret: process.env.READ_TOKEN_SECRET ?? process.env.APP_SECRET ?? (() => { throw new Error("APP_SECRET or READ_TOKEN_SECRET is not set"); })(),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.TURSO_DATABASE_URL ?? (() => { throw new Error("TURSO_DATABASE_URL is not set"); })(),
  databaseAuthToken: process.env.TURSO_AUTH_TOKEN ?? "",
  rateLimitWindowMs: 3600000,
  rateLimitMaxAttempts: 5,
};