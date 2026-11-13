import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PiFileText } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Field } from "@/components/Field";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "sonner";

export default function AddBook() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const [contentUploading, setContentUploading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { data: categories } = trpc.book.categories.useQuery();
  const categoryList = categories || ["Sci-Fi", "Horror", "Thriller"];

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    content: "",
    price: "",
    coverImage: "",
    category: categoryList[0] || "Sci-Fi",
  });

  const createBook = trpc.book.create.useMutation({
    onSuccess: () => {
      utils.book.list.invalidate();
      utils.book.adminList.invalidate();
      toast.success("Edition published to catalog");
      navigate("/home");
    },
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [authLoading, isAdmin, navigate]);

  if (authLoading || !isAdmin) return null;

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
        credentials: "include",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.text) {
        setForm((f) => ({ ...f, content: data.text }));
        toast.success("Manuscript text imported");
      } else {
        toast.error(data.error || "Could not extract text from file.");
      }
    } catch {
      toast.error("Failed to extract text from file.");
    } finally {
      setContentUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!form.title.trim() || !form.author.trim() || !form.price.trim() || !form.description.trim()) {
      setValidationError("Title, author, cover price, and description are required.");
      return;
    }
    if (!form.coverImage.trim()) {
      setValidationError("Upload a cover image or supply an image URL.");
      return;
    }

    createBook.mutate({
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim(),
      content: form.content,
      price: form.price.trim(),
      coverImage: form.coverImage.trim(),
      category: form.category,
    });
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-20">
        <div className="grid md:grid-cols-[270px_1fr] gap-10 lg:gap-14 items-start">
          {/* Sticky Meta Rail */}
          <aside className="md:sticky md:top-8 space-y-5">
            <div>
              <p className="text-xs font-medium text-signal mb-1.5">
                Editorial publishing
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground leading-[1.08]">
                Add edition
              </h1>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed text-pretty">
                Publish a finished edition directly to the live storefront without a queue step.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-foreground mb-2.5">
                Typical word counts (words)
              </p>
              <div className="spec-row">
                <span>Short fiction</span>
                <span className="font-mono tnum">1,000 - 7,500</span>
              </div>
              <div className="spec-row">
                <span>Novella</span>
                <span className="font-mono tnum">7,500 - 17,500</span>
              </div>
              <div className="spec-row">
                <span>Novel</span>
                <span className="font-mono tnum">17,500 - 40,000+</span>
              </div>
            </div>
          </aside>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Book title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Title of the work"
                  className="field-input"
                />
              </Field>

              <Field label="Author name" required>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Author name"
                  className="field-input"
                />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Cover price (NGN)" required>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="1000"
                  className="field-input font-mono tnum"
                />
              </Field>

              <Field label="Genre" required>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="field-input cursor-pointer"
                >
                  {categoryList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <ImageUpload
              label="Book cover *"
              value={form.coverImage}
              onChange={(url) => {
                setForm((f) => ({ ...f, coverImage: url }));
                if (validationError) setValidationError("");
              }}
            />

            <Field label="Synopsis" required>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Book blurb and editorial description..."
                className="field-input"
              />
            </Field>

            <Field
              label="Manuscript text"
              hint="Optional. Paste text or import a .docx / .txt document."
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <label className="field-action">
                    <PiFileText className="h-4 w-4" aria-hidden="true" />
                    {contentUploading
                      ? "Extracting text..."
                      : "Import .docx / .txt file"}
                    <input
                      type="file"
                      accept=".txt,.md,.doc,.docx"
                      onChange={handleContentUpload}
                      disabled={contentUploading}
                      className="hidden"
                    />
                  </label>

                  {form.content && (
                    <span className="font-mono text-xs text-muted-foreground tnum">
                      {form.content.length.toLocaleString()} chars
                    </span>
                  )}
                </div>

                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Paste full edition content here..."
                  className="field-input font-serif text-[16px]"
                />
              </div>
            </Field>

            {(validationError || createBook.error) && (
              <div role="alert" className="form-note form-note--alert text-sm">
                {validationError || createBook.error?.message}
              </div>
            )}

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="w-full sm:w-auto rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createBook.isPending}
                className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground px-7 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {createBook.isPending ? "Publishing..." : "Publish edition"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
