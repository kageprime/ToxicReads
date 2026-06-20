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

// ── Security Headers ───────────────────────────────────────────

app.use("*", async (c, next) => {
  await next();
  c.res.headers.set("X-Content-Type-Options", "nosniff");
  c.res.headers.set("X-Frame-Options", "DENY");
  c.res.headers.set("X-XSS-Protection", "1; mode=block");
  c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  c.res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (env.isProduction) {
    c.res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  c.res.headers.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://toxic-reads.vercel.app; font-src 'self' data:;");
});

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// ── Helpers ────────────────────────────────────────────────────

const IMAGE_MAGIC_BYTES: Record<string, Uint8Array[]> = {
  "image/jpeg": [new Uint8Array([0xFF, 0xD8, 0xFF])],
  "image/png": [new Uint8Array([0x89, 0x50, 0x4E, 0x47])],
  "image/gif": [new Uint8Array([0x47, 0x49, 0x46])],
  "image/webp": [
    new Uint8Array([0x52, 0x49, 0x46, 0x46]),
    new Uint8Array([0x57, 0x45, 0x42, 0x50]),
  ],
};
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isAllowedImageMagic(buffer: Uint8Array, mimeType: string): boolean {
  const signatures = IMAGE_MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some(sig =>
    sig.length <= buffer.length && sig.every((b, i) => buffer[i] === b),
  );
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

function getClientIp(c: { req: { raw: Request } }): string {
  return c.req.raw.headers.get("x-forwarded-for")
    || c.req.raw.headers.get("cf-connecting-ip")
    || "unknown";
}

// ── File Upload ───────────────────────────────────────────────

app.post("/api/upload", async (c) => {
  try {
    const body = await c.req.parseBody({ all: false });
    const file = body.file as File | undefined;

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return c.json({ error: "File exceeds maximum size of 10MB" }, 400);
    }

    if (!file.type.startsWith("image/")) {
      return c.json({ error: "Only image files are allowed" }, 400);
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    if (!isAllowedImageMagic(buffer, file.type)) {
      return c.json({ error: "Invalid or spoofed image file" }, 400);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const filename = `${timestamp}-${random}.${ext}`;

    const uploadDir = env.isProduction
      ? join(process.cwd(), "dist", "public", "uploads")
      : join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, Buffer.from(buffer));

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
