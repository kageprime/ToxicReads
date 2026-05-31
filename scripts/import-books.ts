import "dotenv/config";
import mammoth from "mammoth";
import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || (() => { throw new Error("DATABASE_URL or TURSO_DATABASE_URL is required"); })();
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;
const client = createClient({ url: dbUrl, authToken });

const booksDir = "./books";

interface BookInfo {
  title: string;
  author: string;
  description: string;
  content: string;
}

function extractTitle(filename: string): string {
  const name = path.basename(filename, ".docx");
  const cleaned = name
    .replace(/_\d+$/, "")
    .replace(/AutoRecovered.*$/i, "")
    .replace(/_/g, " ")
    .replace(/^\d+\s*/, "")
    .trim();
  return cleaned || name;
}

async function readDocx(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function importBooks() {
  const files = fs.readdirSync(booksDir).filter(f => f.endsWith(".docx"));

  console.log(`Found ${files.length} docx files`);

  const now = Date.now();

  for (const file of files) {
    try {
      const filePath = path.join(booksDir, file);
      const title = extractTitle(file);
      const content = await readDocx(filePath);

      const author = "Unknown Author";
      const description = `An immersive reading experience.`;
      const price = (Math.random() * 15 + 5).toFixed(2);
      const coverImage = "/images/hero-art.jpg";
      const category = "Fiction";
      const condition = "good";
      const status = "approved";

      await client.execute({
        sql: "INSERT INTO books (title, author, description, content, price, coverImage, category, condition, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [title, author, description, content, price, coverImage, category, condition, status, now, now],
      });
      console.log(`Imported: ${title}`);
    } catch (err) {
      console.error(`Failed to import ${file}:`, err);
    }
  }

  console.log("Done!");
  client.close();
}

importBooks().catch(console.error);