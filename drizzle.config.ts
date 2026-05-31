import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? (() => { throw new Error("TURSO_DATABASE_URL is not set"); })(),
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});