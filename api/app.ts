import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import mammoth from "mammoth";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// ── File Upload ───────────────────────────────────────────────

app.post("/api/upload", async (c) => {
  try {
    const body = await c.req.parseBody({ all: false });
    const file = body.file as File | undefined;

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    if (!file.type.startsWith("image/")) {
      return c.json({ error: "Only image files are allowed" }, 400);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const filename = `${timestamp}-${random}.${ext}`;

    const uploadDir = env.isProduction
      ? join(process.cwd(), "dist", "public", "uploads")
      : join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return c.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("[upload] error:", err);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// ── Text Extraction (docx, pdf, epub) ─────────────────────────

app.post("/api/extract-text", async (c) => {
  try {
    const body = await c.req.parseBody({ all: false });
    const file = body.file as File | undefined;

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["docx", "pdf", "epub"].includes(ext)) {
      return c.json({ error: "Supported formats: .docx, .pdf, .epub" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";

    if (ext === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (ext === "pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
      parser.destroy();
    } else if (ext === "epub") {
      const EPub = (await import("epub")).default;
      const epub = new EPub(buffer);
      await epub.parse();
      const texts: string[] = [];
      for (const item of epub.spine.contents) {
        try {
          const chapter = await epub.getChapter(item.id);
          if (chapter) texts.push(chapter);
        } catch {
          // skip unreadable chapters
        }
      }
      text = texts.join("\n\n").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    }

    return c.json({ text });
  } catch (err) {
    console.error("[extract-text] error:", err);
    return c.json({ error: "Text extraction failed" }, 500);
  }
});

// ── tRPC ──────────────────────────────────────────────────────

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
