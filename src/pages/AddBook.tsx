import { useState } from "react";
import { useNavigate } from "react-router";
import { PiWarningCircle, PiUpload, PiFileText } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Field } from "@/components/Field";

export default function AddBook() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const [uploading, setUploading] = useState(false);
  const [contentUploading, setContentUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    content: "",
    price: "",
    coverImage: "",
    category: "Sci-Fi",
  });

  const [coverError, setCoverError] = useState(false);

  const createBook = trpc.book.create.useMutation({
    onSuccess: () => {
      utils.book.list.invalidate();
      navigate("/home");
    },
  });

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm({ ...form, coverImage: data.url });
      }
    } catch {
      // fallback to default
    } finally {
      setUploading(false);
    }
  };

  const handleContentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setContentUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.text) {
        setForm({ ...form, content: data.text });
      }
    } catch {
      // fallback
    } finally {
      setContentUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.author || !form.price || !form.description) return;
    if (!form.coverImage) {
      setCoverError(true);
      return;
    }
    createBook.mutate({
      title: form.title,
      author: form.author,
      description: form.description,
      content: form.content,
      price: form.price,
      coverImage: form.coverImage,
      category: form.category,
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <div
        className="mx-auto measure"
        style={{ padding: "40px 24px 96px" }}
      >
        <div className="grid md:grid-cols-[280px_1fr] gap-12">
          {/* ── Meta rail ── */}
          <aside className="md:sticky md:top-24 self-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Admin
            </p>
            <h1
              className="font-serif text-foreground mb-4"
              style={{
                fontSize: "42px",
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              Add Book
            </h1>
            <p
              className="text-muted-foreground mb-6"
              style={{ fontSize: "16px", lineHeight: 1.6 }}
            >
              Publish a new title directly to the catalog — no review step
              required.
            </p>

            <div className="form-note form-note--alert mb-6">
              <div className="flex gap-2.5 items-start">
                <PiWarningCircle
                  size={16}
                  style={{
                    color: "rgb(var(--color-p-red-fg))",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    className="font-mono uppercase"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.14em",
                      color: "rgb(var(--color-p-red-fg))",
                    }}
                  >
                    No AI content
                  </p>
                  <p
                    className="text-foreground"
                    style={{ fontSize: "14px", lineHeight: 1.55, marginTop: "4px" }}
                  >
                    ToxicReads does not accept AI-generated work. Every
                    submission is reviewed.
                  </p>
                </div>
              </div>
            </div>

            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1">
              Accepted formats
            </p>
            <div>
              <div className="spec-row">
                <span>Flash Fiction</span>
                <span>&lt; 1,000</span>
              </div>
              <div className="spec-row">
                <span>Short Story</span>
                <span>1,000 – 7,500</span>
              </div>
              <div className="spec-row">
                <span>Novelette</span>
                <span>7,500 – 17,500</span>
              </div>
              <div className="spec-row">
                <span>Novella</span>
                <span>17,500 – 40,000</span>
              </div>
              <div className="spec-row">
                <span>Novel</span>
                <span>40,000+</span>
              </div>
            </div>
          </aside>

          {/* ── Form ── */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-7"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Title" required>
                <input
                  className="field-input"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="The Last Frequency"
                />
              </Field>
              <Field label="Author" required>
                <input
                  className="field-input"
                  value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })}
                  placeholder="A. Okafor"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Price" required hint="Nigerian Naira">
                <input
                  className="field-input"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="₦2,500"
                />
              </Field>
              <Field label="Genre">
                <select
                  className="field-input"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {["Sci-Fi", "Horror", "Thriller"].map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Cover Image" required>
              <div className="flex gap-4 items-start">
                <div
                  style={{
                    width: "96px",
                    height: "128px",
                    border: "1px solid hsl(var(--border))",
                    flexShrink: 0,
                    overflow: "hidden",
                    backgroundColor: "hsl(var(--muted))",
                  }}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center h-full">
                      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                        Uploading
                      </span>
                    </div>
                  ) : form.coverImage ? (
                    <img
                      src={form.coverImage}
                      alt="Cover preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full px-2">
                      <span className="font-mono text-[11px] text-center text-muted-foreground">
                        No file
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    style={{ display: "none" }}
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload" className="field-action">
                    <PiUpload size={14} />
                    {uploading ? "Uploading..." : "Choose file"}
                  </label>
                  {coverError && !form.coverImage && (
                    <p
                      className="mt-2 text-[13px]"
                      style={{ color: "rgb(var(--color-p-red-fg))" }}
                    >
                      Please upload a cover image
                    </p>
                  )}
                </div>
              </div>
            </Field>

            <Field label="Description" required>
              <textarea
                className="field-input"
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="A short, compelling summary of your book."
              />
            </Field>

            <Field
              label="Reading Content"
              hint="Optional — paste text or upload a document."
            >
              <input
                type="file"
                accept=".docx,.pdf,.epub"
                onChange={handleContentUpload}
                style={{ display: "none" }}
                id="content-upload"
              />
              <label htmlFor="content-upload" className="field-action">
                <PiFileText size={14} />
                {contentUploading
                  ? "Extracting..."
                  : "Upload .docx / .pdf / .epub"}
              </label>
              <textarea
                className="field-input mt-3"
                rows={8}
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Paste your content here, or upload a document above."
              />
            </Field>

            <button
              type="submit"
              disabled={createBook.isPending}
              className="w-full py-3 bg-primary text-primary-foreground font-mono uppercase tracking-[0.14em] text-[13px] hover:opacity-90 active:scale-[0.985] transition disabled:opacity-70"
            >
              {createBook.isPending ? "Adding..." : "Add Book"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
