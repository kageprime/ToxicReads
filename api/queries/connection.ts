import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let client: ReturnType<typeof createClient>;

export function getDb() {
  if (!instance) {
    client = createClient({ url: env.databaseUrl, authToken: env.databaseAuthToken });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

export function getClient() {
  if (!client) {
    client = createClient({ url: env.databaseUrl, authToken: env.databaseAuthToken });
  }
  return client;
}