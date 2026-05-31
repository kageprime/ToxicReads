import mammoth from "mammoth";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("data/bookhaven.db");

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

  const insertBook = db.prepare(`
    INSERT INTO books (title, author, description, content, price, coverImage, category, condition, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

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

      insertBook.run(title, author, description, content, price, coverImage, category, condition, status, now, now);
      console.log(`Imported: ${title}`);
    } catch (err) {
      console.error(`Failed to import ${file}:`, err);
    }
  }

  console.log("Done!");
  db.close();
}

importBooks().catch(console.error);