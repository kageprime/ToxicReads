import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function SubmitBook() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

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

  const [uploading, setUploading] = useState(false);
  const [contentUploading, setContentUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitBook = trpc.book.submit.useMutation({
    onSuccess: () => {
      utils.book.list.invalidate();
      setSubmitted(true);
    },
  });

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleSubmit = () => {
    if (!form.title || !form.author || !form.price || !form.description) return;
    if (!form.coverImage) { setCoverError(true); return; }
    submitBook.mutate({
      title: form.title,
      author: form.author,
      description: form.description,
      content: form.content,
      price: form.price,
      coverImage: form.coverImage,
      category: form.category,
    });
  };

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

  const inputStyle = {
    width: "100%",
    fontSize: "18px",
    padding: "8px 10px",
    border: "1px solid var(--border-light)",
    outline: "none",
    color: "var(--text-charcoal)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    background: "transparent",
  };

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-warm-white)" }}
      >
        <div
          className="text-center"
          style={{
            maxWidth: "400px",
            padding: "24px",
            border: "1px solid var(--border-light)",
          }}
        >
          <p
            style={{
              fontSize: "20px",
              color: "#2ECC71",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              marginBottom: "16px",
              letterSpacing: "0.05em",
            }}
          >
            Submitted! Your book will be listed after admin review.
          </p>
          <button
            onClick={() => navigate("/home")}
            style={{
              fontSize: "18px",
              color: "var(--text-charcoal)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-warm-white)" }}
    >
      <header
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-50"
        style={{
          height: "48px",
          backgroundColor: "var(--bg-warm-white)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/home")}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={18} style={{ color: "var(--text-charcoal)" }} />
          </button>
          <button
            onClick={() => navigate("/home")}
            className="text-sm font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity"
          >
            TOXICREADS
          </button>
          <span
            style={{
              fontSize: "17px",
              color: "var(--text-grey)",
              marginLeft: "8px",
            }}
          >
            / Submit Book
          </span>
        </div>
      </header>

      <div
        className="mx-auto"
        style={{ maxWidth: "800px", padding: "64px 24px 80px" }}
      >
        <div
          style={{
            border: "1px solid var(--border-light)",
            padding: "32px",
            backgroundColor: "var(--bg-warm-white)",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 400,
              color: "var(--text-charcoal)",
              marginBottom: "4px",
            }}
          >
            Sell Your Book
          </h1>
          <p
            style={{
              fontSize: "17px",
              color: "var(--text-grey)",
              marginBottom: "32px",
              lineHeight: 1.6,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            Your book will be reviewed by an admin before being listed.
          </p>

          <div
            style={{
              border: "2px solid #E74C3C",
              padding: "14px 18px",
              marginBottom: "16px",
              backgroundColor: "rgba(231, 76, 60, 0.06)",
            }}
          >
            <div
              style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}
            >
              <AlertTriangle
                size={16}
                style={{ color: "#E74C3C", marginTop: "2px", flexShrink: 0 }}
              />
              <div>
                <p
                  style={{
                    fontSize: "17px",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    color: "#E74C3C",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  NO AI GENERATED CONTENT
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    color: "var(--text-charcoal)",
                    lineHeight: 1.6,
                  }}
                >
                  ToxicReads does <strong>not</strong> accept any AI-generated
                  content. Every submission is reviewed. Violations will be
                  rejected or removed without notice.
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              border: "1px solid var(--border-light)",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: "var(--text-charcoal)",
                fontWeight: 700,
                marginBottom: "10px",
                letterSpacing: "0.05em",
              }}
            >
              SUBMISSION GUIDELINES
            </p>
            <p
              style={{
                fontSize: "16px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: "var(--text-grey)",
                lineHeight: 1.6,
                marginBottom: "12px",
              }}
            >
              Make sure your submission matches one of these formats:
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 16px",
                fontSize: "16px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: "var(--text-grey)",
                lineHeight: 2,
                padding: "8px 12px",
                backgroundColor: "rgba(0,0,0,0.02)",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontWeight: 600 }}>Flash Fiction</span>
              <span>&lt; 1,000 words</span>
              <span style={{ fontWeight: 600 }}>Short Story</span>
              <span>1,000 – 7,500 words</span>
              <span style={{ fontWeight: 600 }}>Novelette</span>
              <span>7,500 – 17,500 words</span>
              <span style={{ fontWeight: 600 }}>Novella</span>
              <span>17,500 – 40,000 words</span>
              <span style={{ fontWeight: 600 }}>Novel</span>
              <span>40,000+ words</span>
            </div>
            <ul
              style={{
                fontSize: "16px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: "var(--text-grey)",
                lineHeight: 2,
                paddingLeft: "16px",
                margin: 0,
              }}
            >
              <li>Only submit original work you have the right to sell</li>
              <li>Provide accurate title, author, and description</li>
              <li>No hate speech, illegal content, or explicit material</li>
              <li>No AI-generated content — zero tolerance</li>
              <li>All books are digital — no physical copies will be handled</li>
              <li>Admins reserve the right to reject or remove listings</li>
            </ul>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  style={{
                    fontSize: "17px",
                    color: "var(--text-grey)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "17px",
                    color: "var(--text-grey)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Author *
                </label>
                <input
                  value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  style={{
                    fontSize: "17px",
                    color: "var(--text-grey)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Price *
                </label>
                <input
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  style={inputStyle}
                  placeholder="₦2,500"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "17px",
                    color: "var(--text-grey)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Genre
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  style={inputStyle}
                >
                  {["Sci-Fi", "Horror", "Thriller"].map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: "17px",
                  color: "var(--text-grey)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Cover Image *
              </label>
              <div className="flex gap-3 items-start">
                <div
                  style={{
                    width: "100px",
                    height: "133px",
                    border: "1px solid var(--border-light)",
                    flexShrink: 0,
                    overflow: "hidden",
                    backgroundColor: "var(--border-light)",
                  }}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center h-full">
                      <p
                        style={{
                          fontSize: "15px",
                          color: "var(--text-grey)",
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                        }}
                      >
                        Uploading...
                      </p>
                    </div>
                  ) : form.coverImage ? (
                    <img
                      src={form.coverImage}
                      alt="Cover preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text-grey)",
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                          textAlign: "center",
                          padding: "4px",
                        }}
                      >
                        No file
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    style={{ display: "none" }}
                    id="submit-cover-upload"
                  />
                  <label
                    htmlFor="submit-cover-upload"
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      fontSize: "16px",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      color: "var(--text-charcoal)",
                      border: "1px solid var(--border-light)",
                      cursor: "pointer",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Choose File
                  </label>
                  {coverError && !form.coverImage && (
                    <p
                      style={{
                        fontSize: "15px",
                        color: "#E74C3C",
                        marginTop: "4px",
                      }}
                    >
                      Please upload a cover image
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: "17px",
                  color: "var(--text-grey)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "17px",
                  color: "var(--text-grey)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Reading Content (optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="file"
                  accept=".docx,.pdf,.epub"
                  onChange={handleContentUpload}
                  style={{ display: "none" }}
                  id="content-upload"
                />
                <label
                  htmlFor="content-upload"
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    fontSize: "15px",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    color: "var(--text-charcoal)",
                    border: "1px solid var(--border-light)",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                  }}
                >
                  {contentUploading
                    ? "Extracting..."
                    : "Upload .docx / .pdf / .epub"}
                </label>
              </div>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                rows={8}
                placeholder="Paste your content here, or upload a .docx file..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {submitBook.error && (
              <p
                style={{
                  fontSize: "17px",
                  color: "#E74C3C",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                {submitBook.error.message}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitBook.isPending}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "18px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: "var(--bg-warm-white)",
                background: "var(--text-charcoal)",
                border: "none",
                cursor: submitBook.isPending ? "wait" : "pointer",
                opacity: submitBook.isPending ? 0.7 : 1,
                letterSpacing: "0.05em",
              }}
            >
              {submitBook.isPending ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
