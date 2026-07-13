import "dotenv/config";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const dbUrl =
  process.env.TURSO_DATABASE_URL ??
  (() => {
    throw new Error("TURSO_DATABASE_URL is not set");
  })();
const authToken = process.env.TURSO_AUTH_TOKEN ?? undefined;

const now = Date.now();

async function seed() {
  const client = createClient({
    url: dbUrl,
    authToken: authToken || undefined,
  });

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
    const seedBooks: [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      number,
      string,
      string,
    ][] = [
      [
        "The Seer of Lagos",
        "Tade Thompson",
        "In a near-future Lagos where the Veil between worlds is thinning, a seer must navigate military coups, alien consciousness, and ancestral spirits to prevent an apocalypse.",
        "The Veil had been thinning for years before anyone noticed. It wasn't the kind of thing that made the news — not until the first full manifestation in the middle of Oshodi market at rush hour.\n\nA woman had walked straight through a moving bus. Not around it, not under it. Through it. Commuters screamed. The bus driver slammed his brakes and hit three motorcycles. By the time the police arrived, the woman was gone.\n\nBut I saw her. I always saw.\n\nMy name is Adebayo Ogunlesi, and I am what the old people call a Seer. It's not a gift, despite what my grandmother told me. It's a door that never closes, a constant whisper of things that exist just beyond this world.\n\nLagos in 2074 is a city of contrasts — gleaming AI towers rising above flooded slums, drone taxis buzzing past rusted buses, and everywhere, the smell of jollof rice and ozone. The military government claims they have everything under control. They don't.\n\nThe Veil is collapsing, and I'm the only one who can see what's coming through.",
        "12.99",
        "/images/blog-1.jpg",
        "Sci-Fi",
        1,
        "admin",
        "approved",
      ],
      [
        "The Night Market",
        "Nnedi Okorafor",
        "After the rains stopped, the Night Market emerged from the Sahara. A young hacker follows her missing brother there and discovers technology older than any computer.",
        "The Night Market appears only when the conditions are right — when the harmattan winds carry the scent of roasted plantain and ozone, when the moon hangs low and fat over the dunes, when the boundary between worlds grows thin.\n\nI had heard stories about it my whole life. My grandmother used to warn me: never eat the food, never accept a gift, never make eye contact with the merchants who have no faces.\n\nBut my brother had vanished, and the last ping from his phone placed him somewhere in the Ténéré desert, a place where no network should exist.\n\nI am Chioma Eze, a systems architect from Enugu, and I build neural networks that can predict election outcomes with 99.8% accuracy. I thought I understood the architecture of reality.\n\nI was wrong.\n\nThe Night Market runs on a different kind of code — one written in the language of djinn and forgotten gods. And my brother had come here looking for something called the Black Algorithm.",
        "10.99",
        "/images/blog-2.jpg",
        "Horror",
        1,
        "admin",
        "approved",
      ],
      [
        "Beneath the Red Baobab",
        "Namwali Serpell",
        "A village in Zimbabwe is terrorized by an entity that wears the skin of the dead. A xenobiologist uncovers a conspiracy reaching the highest levels of government.",
        "The first death was written off as a heart attack. The second, a stroke. By the time the seventh body was discovered beneath the red baobab tree, the village of Mwanga had stopped pretending.\n\nSomething was wrong.\n\nI arrived on a Tuesday, carrying a field kit designed for biological sampling, not whatever this was. Dr. Amara Dube, xenobiologist, Rhodes University. My specialty was extremophiles — organisms that thrive in impossible conditions.\n\nNothing in my training prepared me for a corpse that moved.\n\nThe village elders spoke in whispers of the Nyami Nyami, the river spirit of Zambezi legend. The government sent soldiers. I sent samples to the lab.\n\nWhen the results came back, I wished I hadn't.\n\nThe entity beneath the baobab wasn't supernatural. It was biological. And it was growing.",
        "18.50",
        "/images/blog-3.jpg",
        "Horror",
        1,
        "admin",
        "approved",
      ],
      [
        "Rosewater",
        "Tade Thompson",
        "In 2066, an alien biodome appears in Nigeria. Kaaro, a banker with psychic abilities, is pulled into a web of government secrets and alien biology.",
        "The biodome appeared on a Tuesday morning in January 2066, emerging from the ground like a bubble rising through mud. It was translucent, warm to the touch, and it smelled of things no human nose had ever encountered.\n\nThe government cordoned off the area and called it a containment zone. The media called it the Rosewater Exclusion Zone. The people who lived nearby called it trouble.\n\nI was working at a bank in Lagos when the first wave of psychic outbreaks began. People across the city started hearing voices — not their own, not anyone they knew. The government blamed mass hysteria. I knew better.\n\nMy name is Kaaro, and I've been able to read minds since I was a child. It's not a power; it's a curse. But when the authorities came knocking, they didn't care about the distinction.\n\nThey wanted me to go into the biodome. They wanted me to talk to whatever was inside.",
        "9.99",
        "/images/blog-4.jpg",
        "Sci-Fi",
        1,
        "admin",
        "approved",
      ],
      [
        "The Last Train to Accra",
        "Bolu Babalola",
        "A journalist investigating disappearances in Ghana discovers a trafficking ring reaching from the slums to the highest offices.",
        "The last train to Accra left Nkawkaw station at 11:47 PM. It carried 237 passengers that night. Only 236 arrived.\n\nWhen I first heard about the disappearances, I was skeptical. People go missing every day in Ghana — that's what the police told me, what the government told me, what everyone told me. But twenty-three people in six months, all on the same route, all last seen boarding the 11:47?\n\nMy editor called it a career killer. I called it a story.\n\nMy name is Afia Mensah, and I've been an investigative journalist for twelve years. I've uncovered corruption in ministries, exposed embezzlement in state enterprises, and broken stories that made powerful men sweat.\n\nBut nothing prepared me for what I found on that train.\n\nThe disappearances weren't random. They were coordinated. And they led all the way to the top.",
        "15.99",
        "/images/blog-5.jpg",
        "Thriller",
        1,
        "admin",
        "approved",
      ],
      [
        "Children of the Veil",
        "Namwali Serpell",
        "In an alternate Africa where colonialism never ended, children born with dimensional-phase abilities become the only hope for liberation.",
        "We were born in the dark, all of us. Born in underground hospitals lit by bioluminescent fungi, born to mothers who never saw our faces, born into a world that had already decided we were monsters.\n\nThe year is 1952 in the calendar of the Empire — the year of our Lord, they call it, as if God took sides in colonization. In reality, it is the eighty-seventh year of the Occupation.\n\nAfrica never gained independence in this world. The Berlin Conference of 1885 never ended. The colonial powers divided and subdivided, fought and reconquered, until the entire continent was a patchwork of corporate holdings and imperial territories.\n\nBut then something changed.\n\nChildren started being born with the Veil — the ability to phase between dimensions, to step sideways out of reality and into the spaces between. The Empire called it a disease. They called us abominations.\n\nWe called ourselves freedom.",
        "14.99",
        "/images/blog-6.jpg",
        "Sci-Fi",
        1,
        "admin",
        "approved",
      ],
      [
        "The Whispering Dark",
        "Nnedi Okorafor",
        "Something ancient wakes beneath Nairobi. A deaf photographer captures shadow figures and becomes the target of a secret agency.",
        "The first image was an accident. I was photographing the new expressway for a government contract — boring infrastructure work, the kind that pays the rent — when something moved in my peripheral vision.\n\nI didn't hear it. I never hear anything. But I felt it — a vibration in the air, a pressure change, the kind of thing you notice when one of your senses has been compensating for another your whole life.\n\nMy name is Wanjiku Kimani, and I've been deaf since birth. I see the world through a lens, literally and figuratively. And what I saw that day changed everything.\n\nThe figure in my photograph was wrong. It had too many angles, shadows that fell in directions light couldn't reach. It was standing behind a group of construction workers, and none of them noticed.\n\nI posted the photo online. Within hours, men in dark suits were at my door.\n\nThey said they were from the Ministry of Information. They were lying.",
        "8.99",
        "/images/hero-art.jpg",
        "Horror",
        1,
        "admin",
        "approved",
      ],
      [
        "Blood and Silicon",
        "Tade Thompson",
        "In 2088 Lagos, a tech mogul is found dead with his consciousness uploaded to the cloud. Detective Amara Okafor investigates.",
        "Death used to mean something in Lagos. Now it's just a technical problem.\n\nWhen billionaire tech mogul Olumide Bakare was found dead in his penthouse — body temperature 98.6, heart stopped, brain activity flat — the initial report listed it as cardiac arrest. Open and shut.\n\nExcept his consciousness was still active on the Grid.\n\nI stood in his penthouse, watching the holographic display flicker with his last neural backup. The law is clear: when a citizen's consciousness survives their body, it's not murder. It's data corruption.\n\nMy name is Amara Okafor, Detective Inspector, Lagos Homicide Division. I've been on the force for fifteen years, and I've seen everything from ritual killings to corporate hits. But this case was different.\n\nBecause Olumide Bakare wasn't just dead. He was everywhere — his mind scattered across a thousand servers, pieces of his personality embedded in the city's AI infrastructure, his memories playing on loop in the neural network that controlled traffic lights and water pumps.\n\nSomeone had killed him. And then someone had weaponized his ghost.",
        "13.49",
        "/images/portrait.jpg",
        "Sci-Fi",
        1,
        "admin",
        "approved",
      ],
    ];

    for (const book of seedBooks) {
      await client.execute({
        sql: "INSERT INTO books (title, author, description, content, price, coverImage, category, sellerId, sellerType, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
