import "dotenv/config";
import { getDb } from "../server/queries/connection.js";
import { localUsers } from "./schema.js";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding ToxicReads database...");

  // 1. Seed admin user
  const existingUsers = await getDb().select().from(localUsers);
  if (existingUsers.length === 0) {
    const passwordHash = await bcrypt.hash("123456", 12);
    await getDb().insert(localUsers).values({
      username: "admin",
      passwordHash,
      name: "Admin",
      role: "admin",
    });
    console.log("  Created admin user (admin / 123456)");
  } else {
    console.log("  Admin user already exists");
  }

  console.log("Seed complete!");
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
