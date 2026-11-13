import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PiWarningCircle, PiFileText, PiCheckCircle } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Field } from "@/components/Field";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "sonner";

export default function SubmitBook() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const utils = trpc.useUtils();

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

  const [validationError, setValidationError] = useState("");
  const [contentUploading, setContentUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitBook = trpc.book.submit.useMutation({
    onSuccess: () => {
      utils.book.list.invalidate();
      utils.book.mySubmissions.invalidate();
      setSubmitted(true);
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || !isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!form.title.trim() || !form.author.trim() || !form.price.trim() || !form.description.trim()) {
      setValidationError("Fill in the title, author, cover price, and description before submitting.");
      return;
    }
    if (!form.coverImage.trim()) {
      setValidationError("Upload a book cover or enter a cover image URL.");
      return;
    }

    submitBook.mutate({
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim(),
      content: form.content,
      price: form.price.trim(),
      coverImage: form.coverImage.trim(),
      category: form.category,
    });
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
        credentials: "include",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.text) {
        setForm((f) => ({ ...f, content: data.text }));
        toast.success("Manuscript text imported");
      } else {
        toast.error(data.error || "Could not extract text from that file.");
      }
    } catch {
      toast.error("Failed to read file. Please try again.");
    } finally {
      setContentUploading(false);
      e.target.value = "";
    }
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-p-green text-p-green-fg flex items-center justify-center">
            <PiCheckCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground tracking-tight">
            Manuscript submitted
          </h1>
          <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed text-pretty">
            Your book is queued for editorial review. You can check status anytime under Submissions.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => navigate("/my-submissions")}
              className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              View submissions
            </button>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Back to catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-20">
        <div className="grid md:grid-cols-[270px_1fr] gap-10 lg:gap-14 items-start">
          {/* Sticky Metadata Rail */}
          <aside className="md:sticky md:top-8 space-y-5">
            <div>
              <p className="text-xs font-medium text-signal mb-1.5">
                Independent publishing
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground leading-[1.08]">
                Submit a book
              </h1>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed text-pretty">
                Send a finished novel, novella, or collection for editorial review.
              </p>
            </div>

            <div className="form-note flex items-start gap-2.5 text-xs">
              <PiWarningCircle
                className="h-4 w-4 text-signal shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-muted-foreground leading-relaxed">
                <strong className="font-medium text-foreground">
                  Human authorship required.
                </strong>{" "}
                AI-generated manuscripts are declined during editorial review.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-foreground mb-2.5">
                Suggested format &amp; price bands
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
                  placeholder="Pen name or full name"
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
                  placeholder="1500"
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

            <Field label="Synopsis" required hint="Shown on the book page and catalog previews.">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Write a compelling description for readers..."
                className="field-input"
              />
            </Field>

            <Field
              label="Manuscript text"
              hint="Optional during listing submission. Paste text or import a .docx / .txt file."
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
                  placeholder="Paste full chapters or manuscript text here..."
                  className="field-input font-serif text-[16px]"
                />
              </div>
            </Field>

            {(validationError || submitBook.error) && (
              <div role="alert" className="form-note form-note--alert text-sm">
                {validationError || submitBook.error?.message}
              </div>
            )}

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="w-full sm:w-auto rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitBook.isPending}
                className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground px-7 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitBook.isPending ? "Submitting..." : "Submit for review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
