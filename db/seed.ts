import "dotenv/config";
import { getDb } from "../api/queries/connection.js";
import { books, localUsers } from "./schema.js";
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

  // 2. Seed sample books
  const existingBooks = await getDb().select().from(books);
  if (existingBooks.length === 0) {
    const seedBooks = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "A masterpiece of American fiction, The Great Gatsby is the story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when The New York Times noted \"gin was the national drink and sex the national obsession,\" it is an exquisitely crafted tale of America in the 1920s.",
        price: "12.99",
        coverImage: "/images/blog-1.jpg",
        category: "Fiction",
        condition: "good" as const,
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "1984",
        author: "George Orwell",
        description: "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real. Published in 1949, the book offers political satirist George Orwell's nightmare vision of a totalitarian, bureaucratic world and one poor stiff's attempt to find individuality.",
        price: "10.99",
        coverImage: "/images/blog-2.jpg",
        category: "Fiction",
        condition: "like-new" as const,
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        description: "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be human.",
        price: "18.50",
        coverImage: "/images/blog-3.jpg",
        category: "Non-Fiction",
        condition: "new" as const,
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. Compassionate, dramatic, and deeply moving, To Kill A Mockingbird takes readers to the roots of human behavior - to innocence and experience, kindness and cruelty, love and hatred, humor and pathos.",
        price: "9.99",
        coverImage: "/images/blog-4.jpg",
        category: "Fiction",
        condition: "fair" as const,
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "The Design of Everyday Things",
        author: "Don Norman",
        description: "Even the smartest among us can feel inept as we fail to figure out which light switch or oven burner to turn on, or whether to push, pull, or slide a door. The fault, argues this ingenious -- even liberating -- book, lies not in ourselves, but in product design that ignores the needs of users.",
        price: "15.99",
        coverImage: "/images/blog-5.jpg",
        category: "Design",
        condition: "good" as const,
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        description: "The major New York Times bestseller that has captured the world's attention. Daniel Kahneman, recipient of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.",
        price: "14.99",
        coverImage: "/images/blog-6.jpg",
        category: "Psychology",
        condition: "like-new" as const,
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        description: "The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield. Through circumstances that tend to preclude adult, secondhand description, he leaves his prep school in Pennsylvania and goes underground in New York City for three days.",
        price: "8.99",
        coverImage: "/images/hero-art.jpg",
        category: "Fiction",
        condition: "good" as const,
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the \"spice\" melange, a drug capable of extending life and enhancing consciousness.",
        price: "13.49",
        coverImage: "/images/portrait.jpg",
        category: "Sci-Fi",
        condition: "new" as const,
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
    ];

    for (const book of seedBooks) {
      await getDb().insert(books).values(book);
    }
    console.log(`  Seeded ${seedBooks.length} books`);
  } else {
    console.log(`  ${existingBooks.length} books already exist`);
  }

  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
