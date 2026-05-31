import "dotenv/config";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || (() => { throw new Error("DATABASE_URL or TURSO_DATABASE_URL is required"); })();
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || "";

const now = Date.now();

async function seed() {
  const client = createClient({ url: dbUrl, authToken: authToken || undefined });

  await client.execute(`CREATE TABLE IF NOT EXISTS localUsers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    price TEXT NOT NULL,
    coverImage TEXT NOT NULL,
    category TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    sellerId INTEGER,
    sellerType TEXT DEFAULT 'user' NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyerId INTEGER NOT NULL,
    bookId INTEGER NOT NULL,
    purchasePrice TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  )`);

  const adminExists = await client.execute({
    sql: "SELECT id FROM localUsers WHERE username = ?",
    args: ["admin"],
  });
  if (adminExists.rows.length === 0) {
    const hash = await bcrypt.hash("123456", 4);
    await client.execute({
      sql: "INSERT INTO localUsers (username, passwordHash, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
      args: ["admin", hash, "Admin", "admin", now, now],
    });
    console.log("Created admin user (admin / 123456)");
  } else {
    console.log("Admin user already exists");
  }

  const bookCount = await client.execute("SELECT COUNT(*) as count FROM books");
  const count = Number((bookCount.rows[0] as Record<string, unknown>).count);
  if (count === 0) {
    const seedBooks: [string, string, string, string, string, string, string, string, number, string, string][] = [
      ["The Great Gatsby", "F. Scott Fitzgerald", "A masterpiece of American fiction set in the Jazz Age.", "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.\n\n\"Whenever you feel like criticizing anyone,\" he told me, \"just remember that all the people in this world haven't had the advantages that you've had.\"\n\nHe didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.\n\nIn consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.\n\nThe abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men.\n\nMost of the confidences were unsought—frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quivering on the way.", "12.99", "/images/blog-1.jpg", "Fiction", "good", 1, "admin", "approved"],
      ["1984", "George Orwell", "A dystopian social science fiction novel.", "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.\n\nThe hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster had been stuck on the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features.\n\nWinston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working, and at present the electricity was cut off during the hours of daylight. It was part of the economy drive in preparation for Hate Week.\n\nHis flat was seven flights up, and thirty-three-year-old Winston Smith, who had a weak spot in his left calf that always gave him a slight limp, went rather slowly, resting several times on the way.\n\nOn each landing, opposite the lift-shaft, the poster with the large face gazed from the wall. It was one of those pictures which are so constructed that the eyes follow you about when you move. BIG BROTHER IS WATCHING YOU, the caption beneath it ran.", "10.99", "/images/blog-2.jpg", "Fiction", "like-new", 1, "admin", "approved"],
      ["Sapiens", "Yuval Noah Harari", "A groundbreaking narrative of humanity's creation.", "About 13.5 billion years ago, matter, energy, time and space came into being in what we call the Big Bang. The story of these fundamental features of our universe is called physics.\n\nAbout 300,000 years after their appearance, matter and energy started to coalesce into complex structures, called atoms, which then combined into molecules. The story of atoms, molecules and their interactions is called chemistry.\n\nAbout 3.8 billion years ago, on a planet called Earth, certain molecules combined to form particularly large and intricate structures called organisms. The story of organisms is called biology.\n\nAbout 70,000 years ago, organisms belonging to the species Homo sapiens started to form particularly intricate structures called cultures. The subsequent development of human cultures is called history.\n\nThree important revolutions shaped the course of history. The Cognitive Revolution kick-started the spread of Homo sapiens around the entire planet. The Agricultural Revolution accelerated the pace of history. The Scientific Revolution, which started only 500 years ago, may well end history as we know it and start something completely different.", "18.50", "/images/blog-3.jpg", "Non-Fiction", "new", 1, "admin", "approved"],
      ["To Kill a Mockingbird", "Harper Lee", "A classic exploring racial injustice.", "When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow. When it healed, and Jem's fears of being forever distinguished from his classmates were long unnecessary; he was never tortured by the agonized appointments of puberty.\n\nA boy named Charles Baker Harris, who wore a carefully pressed white shirt and trousers and a blue bow tie, sat cross-legged in the middle aisle. He had probably been taught to say 'sir' at home. His name was Dill, a name shortened from the one his mother called her husband, and he did not know what to do with his hands.\n\nI didn't go home for lunch because I was saving baseball and didn't want to waste it on a bunch of tailors, so I went to the diner and got a hamburger and sat in the corner booth and ate it slowly.\n\nWe gained the top of the hill and found a picnic table in the park, and under the park's old oak we ate our lunch in two minutes.\n\nAtticus said to me one evening, \"Before Jem looks at anyone, he looks at himself. If he finds he can't do something, he never tries it. That's why he doesn't have the nerve to go fishing.\"", "9.99", "/images/blog-4.jpg", "Fiction", "fair", 1, "admin", "approved"],
      ["The Design of Everyday Things", "Don Norman", "A powerful primer on user-centered design.", "Everything has an affordance. The term, introduced by psychologist James J. Gibson in his 1977 book, The Ecological Approach to Visual Perception, describes the perceived and actual properties of the thing, primarily those fundamental properties that determine just how the thing could possibly be used.\n\nAffordances provide the crucial clues to the operation of things. A chair affords sitting, and also affords standing upon if one needs to change a light bulb. A water glass affords grasping, and the curved shape, the slightly spreading top, the thinness of the material all combine to signal this.\n\nWhen affordances are taken advantage of, the user knows what to do just by looking: no picture, label, or instruction is required. When affordances are absent, poorly designed, or hidden, the user must discover the correct operation through trial and error, often accompanied by confusion and frustration.\n\nVisibility is crucial. The better the designer makes the operation visible, the more quickly people can scan the device and understand what they can and cannot do with it. Good design emphasizes the relevant cues and suppresses irrelevant ones.\n\nEveryday things require two types of knowledge: knowledge of action, of how to operate things, and knowledge of effect, of what happens when we operate them.", "15.99", "/images/blog-5.jpg", "Design", "good", 1, "admin", "approved"],
      ["Thinking, Fast and Slow", "Daniel Kahneman", "Nobel laureate explains the two systems of thought.", "In this chapter I shall introduce you to the two characters who dominate the book. System 1 and System 2. I will call them throughout the book as I have in my professional work and in my teaching.\n\nSystem 1 operates automatically and quickly, with little or no effort and no sense of voluntary control. Think of how you would determine the distance of a sound you just heard, or complete the phrase 'bread and...', or notice disgust when viewing a gruesome image.\n\nSystem 2 allocates attention to the effortful mental activities that demand it, including complex computations. The operations of System 2 are often associated with the subjective experience of agency, choice, and concentration.\n\nThe two systems are not literal entities with physical locations in the brain. They are best understood as a set of capacities, dispositions, and tendencies that are embodied in the brain.\n\nSystem 1 includes the operation that we call intuitive judgment. It proposes intuitive answers to challenging questions, and these are usually correct. But System 1 is also prone to systematic errors in certain situations.\n\nThe key to understanding these errors is recognizing that System 1 operates automatically and cannot be turned off. We are stuck with it, but we can learn to recognize situations in which its answers are likely to be poor ones.", "14.99", "/images/blog-6.jpg", "Psychology", "like-new", 1, "admin", "approved"],
      ["The Catcher in the Rye", "J.D. Salinger", "A timeless portrait of adolescent alienation.", "If I do have to write about myself, I'm supposed to write about all the phony stuff, because that's the only thing I really know about.\n\nThat and all about the guy with the red hair. His name was James Cagallardo, or something, and he played the piano like a madman. He was pretty good, too. He lived on the second floor, in the back of the building.\n\nI like it when a girl gets real close to you and reads something she's rehearsed, because most of the time you can tell the girls that do it just because they've got nice voices. The other ones, the ones that are just doing it because they have to, they usually sound like they're reading a laundry list.\n\nI'm not sure if I told you this, but my older brother D.B. was in the army. He was a corporal, and after the war he quit the army and went to Hollywood. He was in the war for about a year and a half, and then he got this letter from this guy he was in the army with, and this guy told him that Hollywood was where you could be a writer, so that's where he went.\n\nI was only thirteen at the time, and I didn't know too much about it, but I knew it wasn't right. It wasn't that I wanted to be in a war or anything like that, but I didn't want to have to put on a uniform and pretend I was some kind of hero.", "8.99", "/images/hero-art.jpg", "Fiction", "good", 1, "admin", "approved"],
      ["Dune", "Frank Herbert", "A landmark science fiction epic.", "A beginning is the time for taking the most delicate care that the balances are correct. This every sister of the Bene Gesserit knows.\n\nBegin your exercise of awareness with the smell of the spice. Let it become so familiar to you that you cannot imagine a time without it.\n\nThe controlled explosion that bloomed beneath the mountain rippled outward through the rock strata, shaking the sands in every direction for what would have seemed a great distance to anyone capable of feeling it.\n\nPaul Atreides sat at the window, watching the twin moons trace their paths across a sky filled with stars. He was thinking about his mother, about the order she had given him, about the terrible choice he would have to make.\n\n\"Remember,\" she had said, \"the test is not whether you can survive. The test is whether you can remain human.\"\n\nThe desert stretched endlessly in all directions, a sea of sand that had swallowed civilizations and spat out their bones. The Fremen called it Shai-Hulud, the Old Man of the Desert, and they treated it with a respect born of centuries of struggle against its harshness.", "13.49", "/images/portrait.jpg", "Sci-Fi", "new", 1, "admin", "approved"],
    ];

    for (const book of seedBooks) {
      await client.execute({
        sql: "INSERT INTO books (title, author, description, content, price, coverImage, category, condition, sellerId, sellerType, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [...book, now, now],
      });
    }
    console.log("Seeded " + seedBooks.length + " books");
  } else {
    console.log("Books already seeded (" + count + " found)");
  }

  client.close();
  console.log("Seed complete!");
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });