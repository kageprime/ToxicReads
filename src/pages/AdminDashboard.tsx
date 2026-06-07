import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, ChevronLeft, Edit2, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

type Tab = "pending" | "books" | "purchases";

interface BookFormData {
  title: string;
  author: string;
  description: string;
  price: string;
  category: string;
  condition: "new" | "like-new" | "good" | "fair";
  coverImage: string;
  content: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/home");
    }
  }, [authLoading, isAdmin, navigate]);

  const { data: pendingBooks, isLoading: pendingLoading } = trpc.book.pendingList.useQuery(
    undefined,
    { enabled: isAdmin },
  );

  const { data: allBooks, isLoading: booksLoading } = trpc.book.adminList.useQuery(
    undefined,
    { enabled: isAdmin },
  );

  const { data: allPurchases, isLoading: purchasesLoading } = trpc.purchase.adminList.useQuery(
    undefined,
    { enabled: isAdmin },
  );

  const approveMutation = trpc.book.approve.useMutation({
    onSuccess: () => {
      utils.book.pendingList.invalidate();
      utils.book.adminList.invalidate();
    },
  });

  const rejectMutation = trpc.book.reject.useMutation({
    onSuccess: () => {
      utils.book.pendingList.invalidate();
      utils.book.adminList.invalidate();
    },
  });

  const updateMutation = trpc.book.update.useMutation({
    onSuccess: () => {
      utils.book.adminList.invalidate();
      utils.book.list.invalidate();
      setEditingBook(null);
    },
  });

  const deleteMutation = trpc.book.delete.useMutation({
    onSuccess: () => {
      utils.book.adminList.invalidate();
      utils.book.list.invalidate();
    },
  });

  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [editingBook, setEditingBook] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<BookFormData>({
    title: "",
    author: "",
    description: "",
    price: "",
    category: "Fiction",
    condition: "good",
    coverImage: "",
    content: "",
  });

  if (authLoading || !isAdmin) {
    return null;
  }

  const statusColors: Record<string, string> = {
    pending: "#F39C12",
    approved: "#2ECC71",
    rejected: "#E74C3C",
  };

  const categories = ["Fiction", "Non-Fiction", "Sci-Fi", "Design", "Psychology", "History", "Philosophy", "Art", "Technology", "Poetry"];
  const conditions = ["new", "like-new", "good", "fair"];

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedBooks);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedBooks(newSet);
  };

  const selectAll = (books: typeof allBooks) => {
    if (!books) return;
    if (selectedBooks.size === books.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(books.map((b) => b.id)));
    }
  };

  const bulkApprove = () => {
    selectedBooks.forEach((id) => approveMutation.mutate({ id }));
    setSelectedBooks(new Set());
  };

  const bulkReject = () => {
    selectedBooks.forEach((id) => rejectMutation.mutate({ id }));
    setSelectedBooks(new Set());
  };

  const startEdit = (book: NonNullable<typeof allBooks>[number]) => {
    setEditingBook(book.id);
    setEditForm({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      category: book.category,
      condition: book.condition as "new" | "like-new" | "good" | "fair",
      coverImage: book.coverImage,
      content: book.content || "",
    });
  };

  const cancelEdit = () => {
    setEditingBook(null);
    setEditForm({
      title: "",
      author: "",
      description: "",
      price: "",
      category: "Fiction",
      condition: "good" as const,
      coverImage: "",
      content: "",
    });
  };

  const saveEdit = () => {
    if (!editingBook) return;
    updateMutation.mutate({
      id: editingBook,
      ...editForm,
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
            <button onClick={() => navigate("/")} className="text-xs font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity">
              TOXICREADS
            </button>
            <button onClick={() => navigate("/home")} style={{ fontSize: "11px", color: "var(--text-grey)", marginLeft: "8px", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", padding: 0 }}>
              / Browse
            </button>
            <span style={{ fontSize: "11px", color: "var(--text-grey)", marginLeft: "4px" }}>/ Admin</span>
        </div>
        
      </header>

      <div className="mx-auto" style={{ maxWidth: "960px", padding: "64px 24px 80px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "24px" }}>Admin Dashboard</h1>

        <div className="flex items-center justify-between mb-6">
          <div style={{ display: "flex", gap: "1px", borderBottom: "1px solid var(--border-light)" }}>
            {(["pending", "books", "purchases"] as Tab[]).map((tab) => {
              const count = tab === "pending" ? pendingBooks?.length : tab === "books" ? allBooks?.length : allPurchases?.length;
              const labels = { pending: "Pending", books: "All Books", purchases: "Purchases" };
              return (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    fontSize: "11px",
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "0.05em",
                    padding: "8px 16px",
                    border: "none",
                    borderBottom: activeTab === tab ? "2px solid var(--text-charcoal)" : "2px solid transparent",
                    background: "transparent",
                    color: activeTab === tab ? "var(--text-charcoal)" : "var(--text-grey)",
                    cursor: "pointer",
                  }}
                >
                  {labels[tab].toUpperCase()} {count ? `(${count})` : ""}
                </button>
              );
            })}
          </div>

          {activeTab === "pending" && selectedBooks.size > 0 && (
            <div className="flex gap-2">
              <span style={{ fontSize: "11px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", alignSelf: "center" }}>
                {selectedBooks.size} selected
              </span>
              <button
                onClick={bulkApprove}
                disabled={approveMutation.isPending}
                style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "#fff", background: "#2ECC71", border: "none", padding: "6px 12px", cursor: "pointer", letterSpacing: "0.05em" }}
              >
                Approve All
              </button>
              <button
                onClick={bulkReject}
                disabled={rejectMutation.isPending}
                style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "#E74C3C", background: "transparent", border: "1px solid #E74C3C", padding: "6px 12px", cursor: "pointer", letterSpacing: "0.05em" }}
              >
                Reject All
              </button>
            </div>
          )}
        </div>

        {activeTab === "pending" && (
          <div>
            <div style={{ border: "1px solid #F39C12", padding: "10px 14px", marginBottom: "16px", backgroundColor: "rgba(243, 156, 18, 0.08)" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <AlertTriangle size={12} style={{ color: "#F39C12", marginTop: "3px", flexShrink: 0 }} />
                <p style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", lineHeight: 1.6 }}>
                  Before approving, verify: accurate title/author, appropriate description, disclosed AI content (if any), and valid condition. Reject submissions that violate our content policies.
                </p>
              </div>
            </div>
            {pendingLoading ? (
              <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>LOADING...</p>
            ) : pendingBooks && pendingBooks.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedBooks.size === pendingBooks.length && pendingBooks.length > 0}
                    onChange={() => selectAll(pendingBooks)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>Select All</span>
                </div>
                {pendingBooks.map((book) => (
                  <div key={book.id} style={{ border: "1px solid var(--border-light)", padding: "16px" }}>
                    <div className="flex gap-4">
                      <input
                        type="checkbox"
                        checked={selectedBooks.has(book.id)}
                        onChange={() => toggleSelect(book.id)}
                        style={{ marginTop: "40px", cursor: "pointer" }}
                      />
                      <img src={book.coverImage} alt={book.title} style={{ width: "80px", height: "105px", objectFit: "cover", flexShrink: 0, cursor: "pointer", border: "1px solid var(--border-light)" }} onClick={() => navigate(`/book/${book.id}`)} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 style={{ fontSize: "15px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "4px" }}>{book.title}</h3>
                            <p style={{ fontSize: "12px", color: "var(--text-grey)", marginBottom: "4px" }}>{book.author}</p>
                            <p style={{ fontSize: "12px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", marginBottom: "4px" }}>${book.price}</p>
                            <p style={{ fontSize: "10px", color: "var(--text-grey)" }}>{book.category} · {book.condition}</p>
                          </div>
                          <span style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", color: statusColors[book.status], border: `1px solid ${statusColors[book.status]}`, padding: "2px 8px" }}>
                            {book.status?.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-charcoal)", lineHeight: 1.6, marginBottom: "12px", maxWidth: "600px" }}>{book.description}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveMutation.mutate({ id: book.id })}
                            disabled={approveMutation.isPending}
                            style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "#fff", background: "#2ECC71", border: "none", padding: "6px 16px", cursor: "pointer", letterSpacing: "0.05em" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate({ id: book.id })}
                            disabled={rejectMutation.isPending}
                            style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "#E74C3C", background: "transparent", border: "1px solid #E74C3C", padding: "6px 16px", cursor: "pointer", letterSpacing: "0.05em" }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text-grey)", textAlign: "center", padding: "40px 0" }}>No pending submissions</p>
            )}
          </div>
        )}

        {activeTab === "books" && (
          <div>
            {booksLoading ? (
              <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>LOADING...</p>
            ) : allBooks && allBooks.length > 0 ? (
              <div>
                <div className="hidden md:flex items-center gap-4" style={{ padding: "8px 0", borderBottom: "2px solid var(--text-charcoal)", fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)" }}>
                  <div style={{ width: "40px" }}></div>
                  <div style={{ width: "100px" }}>COVER</div>
                  <div className="flex-1">TITLE / AUTHOR</div>
                  <div style={{ width: "60px" }}>PRICE</div>
                  <div style={{ width: "70px" }}>STATUS</div>
                  <div style={{ width: "60px" }}>ACTIONS</div>
                </div>
                {allBooks.map((book) => (
                  <div key={book.id}>
                    {editingBook === book.id ? (
                      <div style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Title</label>
                            <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Author</label>
                            <input value={editForm.author} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Price</label>
                            <input value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Category</label>
                            <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} style={inputStyle}>
                              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Condition</label>
                            <select value={editForm.condition} onChange={(e) => setEditForm({ ...editForm, condition: e.target.value as "new" | "like-new" | "good" | "fair" })} style={inputStyle}>
                              {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Cover Image URL</label>
                            <input value={editForm.coverImage} onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })} style={inputStyle} />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Description</label>
                          <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                            style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "#fff", background: "#2ECC71", border: "none", padding: "6px 16px", cursor: "pointer", letterSpacing: "0.05em" }}
                          >
                            <Check size={12} style={{ marginRight: "4px" }} /> Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "#E74C3C", background: "transparent", border: "1px solid #E74C3C", padding: "6px 16px", cursor: "pointer", letterSpacing: "0.05em" }}
                          >
                            <X size={12} style={{ marginRight: "4px" }} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4" style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                        <div className="flex items-center gap-3 md:gap-4">
                          <div style={{ width: "40px", height: "52px", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0 }}>
                            <img src={book.coverImage} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} onClick={() => navigate(`/book/${book.id}`)} />
                          </div>
                          <div className="flex-1 min-w-0 md:hidden">
                            <p style={{ fontSize: "13px", color: "var(--text-charcoal)", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => navigate(`/book/${book.id}`)}>{book.title}</p>
                            <p style={{ fontSize: "11px", color: "var(--text-grey)" }}>{book.author}</p>
                          </div>
                        </div>
                        <div className="hidden md:block flex-1 min-w-0">
                          <p style={{ fontSize: "13px", color: "var(--text-charcoal)", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => navigate(`/book/${book.id}`)}>{book.title}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-grey)" }}>{book.author}</p>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4 ml-[52px] md:ml-0">
                          <span style={{ fontSize: "12px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", width: "60px" }}>${book.price}</span>
                          <span style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", color: statusColors[book.status], border: `1px solid ${statusColors[book.status]}`, padding: "2px 6px", textAlign: "center" }}>
                            {book.status?.toUpperCase()}
                          </span>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={() => startEdit(book)}
                              style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", background: "none", border: "1px solid var(--border-light)", padding: "4px 6px", cursor: "pointer" }}
                              title="Edit"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={() => { if (confirm("Delete this book?")) deleteMutation.mutate({ id: book.id }); }}
                              style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", color: "#E74C3C", background: "none", border: "1px solid #E74C3C", padding: "4px 6px", cursor: "pointer" }}
                              title="Delete"
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text-grey)", textAlign: "center", padding: "40px 0" }}>No books</p>
            )}
          </div>
        )}

        {activeTab === "purchases" && (
          <div>
            {purchasesLoading ? (
              <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>LOADING...</p>
            ) : allPurchases && allPurchases.length > 0 ? (
              <div>
                <div className="hidden md:flex items-center gap-4" style={{ padding: "8px 0", borderBottom: "2px solid var(--text-charcoal)", fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)" }}>
                  <div style={{ width: "40px" }}>ID</div>
                  <div style={{ width: "100px" }}>BOOK</div>
                  <div className="flex-1">TITLE</div>
                  <div style={{ width: "80px" }}>BUYER</div>
                  <div style={{ width: "60px" }}>PRICE</div>
                  <div style={{ width: "80px" }}>DATE</div>
                </div>
                {allPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4" style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="md:hidden" style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>#{purchase.id}</span>
                      <div style={{ width: "40px", height: "52px", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0 }}>
                        <img src={purchase.book?.coverImage || ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} onClick={() => navigate(`/book/${purchase.book?.id}`)} />
                      </div>
                      <div className="flex-1 min-w-0 md:hidden">
                        <p style={{ fontSize: "13px", color: "var(--text-charcoal)", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => navigate(`/book/${purchase.book?.id}`)}>{purchase.book?.title}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-grey)" }}>{purchase.book?.author}</p>
                      </div>
                    </div>
                    <span className="hidden md:inline" style={{ fontSize: "11px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", width: "40px" }}>#{purchase.id}</span>
                    <div className="hidden md:block" style={{ width: "40px", height: "52px", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0 }}>
                      <img src={purchase.book?.coverImage || ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} onClick={() => navigate(`/book/${purchase.book?.id}`)} />
                    </div>
                    <div className="hidden md:block flex-1 min-w-0">
                      <p style={{ fontSize: "13px", color: "var(--text-charcoal)", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => navigate(`/book/${purchase.book?.id}`)}>{purchase.book?.title}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-grey)" }}>{purchase.book?.author}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 ml-[52px] md:ml-0 text-xs" style={{ color: "var(--text-grey)" }}>
                      <span style={{ color: "var(--text-charcoal)", fontFamily: "'Space Mono', monospace" }}>{purchase.buyer?.username || "—"}</span>
                      <span>·</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)" }}>${purchase.purchasePrice}</span>
                      <span>·</span>
                      <span>{purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text-grey)", textAlign: "center", padding: "40px 0" }}>No purchases</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}