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
    coverImage: "/images/hero-art.jpg",
    category: "Fiction",
    condition: "good" as "new" | "like-new" | "good" | "fair",
  });

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
    submitBook.mutate({
      title: form.title,
      author: form.author,
      description: form.description,
      content: form.content,
      price: form.price,
      coverImage: form.coverImage,
      category: form.category,
      condition: form.condition,
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

  const handleContentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setContentUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-text", { method: "POST", body: fd });
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
    fontSize: "12px",
    padding: "8px 10px",
    border: "1px solid var(--border-light)",
    outline: "none",
    color: "var(--text-charcoal)",
    fontFamily: "'VT323', monospace",
    background: "transparent",
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-warm-white)" }}>
        <div className="text-center" style={{ maxWidth: "400px", padding: "24px", border: "1px solid var(--border-light)" }}>
          <p style={{ fontSize: "14px", color: "#2ECC71", fontFamily: "'VT323', monospace", marginBottom: "16px", letterSpacing: "0.05em" }}>
            Submitted! Your book will be listed after admin review.
          </p>
          <button onClick={() => navigate("/home")} style={{ fontSize: "12px", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      <header 
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-50"
        style={{ 
          height: "48px", 
          backgroundColor: "var(--bg-warm-white)", 
          borderBottom: "1px solid var(--border-light)" 
        }}
      >
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/home")} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
            <ChevronLeft size={18} style={{ color: "var(--text-charcoal)" }} />
          </button>
          <button onClick={() => navigate("/home")} className="text-xs font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity">
            TOXICREADS
          </button>
          <span style={{ fontSize: "11px", color: "var(--text-grey)", marginLeft: "8px" }}>/ Submit Book</span>
        </div>
        </header>

      <div className="mx-auto" style={{ maxWidth: "800px", padding: "64px 24px 80px" }}>
        <div style={{ border: "1px solid var(--border-light)", padding: "32px", backgroundColor: "var(--bg-warm-white)" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "4px" }}>Sell Your Book</h1>
          <p style={{ fontSize: "11px", color: "var(--text-grey)", marginBottom: "32px", lineHeight: 1.6, fontFamily: "'VT323', monospace" }}>
            Your book will be reviewed by an admin before being listed.
          </p>

          <div style={{ border: "1px solid #F39C12", padding: "12px 16px", marginBottom: "16px", backgroundColor: "rgba(243, 156, 18, 0.08)" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <AlertTriangle size={14} style={{ color: "#F39C12", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "10px", fontFamily: "'VT323', monospace", color: "var(--text-charcoal)", fontWeight: 600, marginBottom: "4px" }}>AI CONTENT DISCLOSURE</p>
                <p style={{ fontSize: "10px", fontFamily: "'VT323', monospace", color: "var(--text-charcoal)", lineHeight: 1.6 }}>
                  When listing a book that contains AI-generated content (text, images, or translations), you <strong>must clearly disclose this</strong> in the description. Books found to contain undisclosed AI-generated content may be rejected or removed without notice.
                </p>
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid var(--border-light)", padding: "16px", marginBottom: "24px" }}>
            <p style={{ fontSize: "10px", fontFamily: "'VT323', monospace", color: "var(--text-grey)", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.05em" }}>SUBMISSION GUIDELINES</p>
            <ul style={{ fontSize: "10px", fontFamily: "'VT323', monospace", color: "var(--text-grey)", lineHeight: 2, paddingLeft: "16px", margin: 0 }}>
              <li>Only submit books you have the right to sell</li>
              <li>Provide accurate title, author, and description</li>
              <li>No hate speech, illegal content, or explicit material</li>
              <li>AI-generated content must be disclosed (see warning above)</li>
              <li>Condition must accurately reflect the book's state</li>
              <li>Admins reserve the right to reject or remove listings</li>
            </ul>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Author *</label>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Price *</label>
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} placeholder="10.00" />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                  {["Fiction", "Non-Fiction", "Sci-Fi", "Design", "Psychology", "History", "Philosophy", "Art", "Technology", "Poetry"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Condition</label>
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as "new" | "like-new" | "good" | "fair" })} style={inputStyle}>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Cover Image</label>
                <div className="flex gap-3 items-start">
                  <div style={{ width: "100px", height: "133px", border: "1px solid var(--border-light)", flexShrink: 0, overflow: "hidden", backgroundColor: "var(--border-light)" }}>
                    {uploading ? (
                      <div className="flex items-center justify-center h-full">
                        <p style={{ fontSize: "9px", color: "var(--text-grey)", fontFamily: "'VT323', monospace" }}>Uploading...</p>
                      </div>
                    ) : (
                      <img src={form.coverImage} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} id="submit-cover-upload" />
                    <label htmlFor="submit-cover-upload" style={{ display: "inline-block", padding: "8px 16px", fontSize: "10px", fontFamily: "'VT323', monospace", color: "var(--text-charcoal)", border: "1px solid var(--border-light)", cursor: "pointer", letterSpacing: "0.05em" }}>
                      Choose File
                    </label>
                    {form.coverImage !== "/images/hero-art.jpg" && (
                      <p style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'VT323', monospace", wordBreak: "break-all", marginTop: "4px" }}>
                        {form.coverImage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Reading Content (optional)</label>
              <div className="flex gap-2 mb-2">
                <input type="file" accept=".docx,.pdf,.epub" onChange={handleContentUpload} style={{ display: "none" }} id="content-upload" />
                <label htmlFor="content-upload" style={{ display: "inline-block", padding: "6px 12px", fontSize: "9px", fontFamily: "'VT323', monospace", color: "var(--text-charcoal)", border: "1px solid var(--border-light)", cursor: "pointer", letterSpacing: "0.05em" }}>
                  {contentUploading ? "Extracting..." : "Upload .docx / .pdf / .epub"}
                </label>
              </div>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Paste your content here, or upload a .docx file..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            {submitBook.error && (
              <p style={{ fontSize: "11px", color: "#E74C3C", fontFamily: "'VT323', monospace" }}>
                {submitBook.error.message}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitBook.isPending}
              style={{
                width: "100%", padding: "14px", fontSize: "12px", fontFamily: "'VT323', monospace",
                color: "var(--bg-warm-white)", background: "var(--text-charcoal)", border: "none",
                cursor: submitBook.isPending ? "wait" : "pointer", opacity: submitBook.isPending ? 0.7 : 1,
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