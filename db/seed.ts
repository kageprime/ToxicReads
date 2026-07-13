import "dotenv/config";
import { getDb } from "../server/queries/connection.js";
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
        title: "The Seer of Lagos",
        author: "Tade Thompson",
        description:
          "In a near-future Lagos where the Veil between worlds is thinning, a seer must navigate military coups, alien consciousness, and ancestral spirits to prevent an apocalypse. A gripping blend of sci-fi and Yoruba cosmology.",
        price: "12.99",
        coverImage: "/images/blog-1.jpg",
        category: "Sci-Fi",
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "The Night Market",
        author: "Nnedi Okorafor",
        description:
          "After the rains stopped, the Night Market emerged from the Sahara — a place where djinn bargain for human memories. When a young hacker follows her missing brother there, she discovers technology older than any computer.",
        price: "10.99",
        coverImage: "/images/blog-2.jpg",
        category: "Horror",
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "Beneath the Red Baobab",
        author: "Namwali Serpell",
        description:
          "A village in Zimbabwe is terrorized by an entity that wears the skin of the dead. When a xenobiologist arrives to investigate, she uncovers a conspiracy that reaches the highest levels of government — and something far older buried beneath the ancestral tree.",
        price: "18.50",
        coverImage: "/images/blog-3.jpg",
        category: "Horror",
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "Rosewater",
        author: "Tade Thompson",
        description:
          "In 2066, a mysterious alien biodome has opened in a small Nigerian town, drawing the desperate and the curious. Kaaro, a banker with psychic abilities, is pulled into a web of government secrets, alien biology, and a looming threat that could consume humanity.",
        price: "9.99",
        coverImage: "/images/blog-4.jpg",
        category: "Sci-Fi",
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "The Last Train to Accra",
        author: "Bolu Babalola",
        description:
          "A pulse-pounding thriller set in a Ghana on the brink of collapse. A journalist investigating a series of disappearances discovers a human trafficking ring that reaches from the slums of Accra to the highest offices in the land.",
        price: "15.99",
        coverImage: "/images/blog-5.jpg",
        category: "Thriller",
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "Children of the Veil",
        author: "Namwali Serpell",
        description:
          "In an alternate Africa where colonialism never ended, a group of children born with the ability to phase between dimensions become the only hope for liberation. A mind-bending sci-fi epic about identity, power, and freedom.",
        price: "14.99",
        coverImage: "/images/blog-6.jpg",
        category: "Sci-Fi",
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "The Whispering Dark",
        author: "Nnedi Okorafor",
        description:
          "Something ancient wakes beneath the streets of Nairobi. When a deaf photographer captures images of shadow figures no one else can see, she becomes the target of both a secret government agency and the entity itself. A terrifying horror thriller set in modern Kenya.",
        price: "8.99",
        coverImage: "/images/hero-art.jpg",
        category: "Horror",
        sellerId: 1,
        sellerType: "admin" as const,
        status: "approved" as const,
      },
      {
        title: "Blood and Silicon",
        author: "Tade Thompson",
        description:
          "In 2088, Lagos is a city of AI overlords and human rebels. When a tech mogul is found dead with his consciousness uploaded to the cloud, detective Amara Okafor must navigate a world where the line between human and machine is razor thin.",
        price: "13.49",
        coverImage: "/images/portrait.jpg",
        category: "Sci-Fi",
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

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
