import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

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
    coverImage: "/images/hero-art.jpg",
    category: "Fiction",
    condition: "new" as "new" | "like-new" | "good" | "fair",
  });

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

  const handleSubmit = () => {
    if (!form.title || !form.author || !form.price || !form.description) return;
    createBook.mutate({
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

  const inputStyle = {
    width: "100%",
    fontSize: "12px",
    padding: "8px 10px",
    border: "1px solid var(--border-light)",
    outline: "none",
    color: "var(--text-charcoal)",
    fontFamily: "'Space Mono', monospace",
    background: "transparent",
  };

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
          <span style={{ fontSize: "11px", color: "var(--text-grey)", marginLeft: "8px" }}>/ Add Book</span>
        </div>
      </header>

      <div className="mx-auto" style={{ maxWidth: "680px", padding: "64px 24px 80px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "32px" }}>Add Book</h1>

        <div className="space-y-4">
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="The Great Gatsby" />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Author *</label>
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} style={inputStyle} placeholder="F. Scott Fitzgerald" />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Price *</label>
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} placeholder="12.99" />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
              {["Fiction", "Non-Fiction", "Sci-Fi", "Design", "Psychology", "History", "Philosophy", "Art", "Technology", "Poetry"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

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
                    <p style={{ fontSize: "9px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>Uploading...</p>
                  </div>
                ) : (
                  <img src={form.coverImage} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  style={{ display: "none" }}
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    fontSize: "10px",
                    fontFamily: "'Space Mono', monospace",
                    color: "var(--text-charcoal)",
                    border: "1px solid var(--border-light)",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                    marginBottom: "8px",
                  }}
                >
                  Choose File
                </label>
                {form.coverImage !== "/images/hero-art.jpg" && (
                  <p style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", wordBreak: "break-all" }}>
                    {form.coverImage}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="A brief description..." />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Reading Content</label>
            <div className="flex gap-2 mb-2">
              <input type="file" accept=".docx,.pdf,.epub" onChange={handleContentUpload} style={{ display: "none" }} id="content-upload" />
              <label htmlFor="content-upload" style={{ display: "inline-block", padding: "6px 12px", fontSize: "9px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", border: "1px solid var(--border-light)", cursor: "pointer", letterSpacing: "0.05em" }}>
                {contentUploading ? "Extracting..." : "Upload .docx / .pdf / .epub"}
              </label>
            </div>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} placeholder="Paste your content here, or upload a .docx file..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={createBook.isPending}
            style={{
              width: "100%", padding: "12px", fontSize: "12px", fontFamily: "'Space Mono', monospace",
              color: "var(--bg-warm-white)", background: "var(--text-charcoal)", border: "none",
              cursor: createBook.isPending ? "wait" : "pointer", opacity: createBook.isPending ? 0.7 : 1,
              letterSpacing: "0.05em", marginTop: "16px",
            }}
          >
            {createBook.isPending ? "Adding..." : "Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
}