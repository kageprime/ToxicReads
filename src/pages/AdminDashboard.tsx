import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { PiWarningCircle, PiPencilSimple, PiCheck, PiX } from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

type Tab = "pending" | "books" | "purchases";

interface BookFormData {
  title: string;
  author: string;
  description: string;
  price: string;
  category: string;
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

  const { data: pendingBooks, isLoading: pendingLoading } =
    trpc.book.pendingList.useQuery(undefined, { enabled: isAdmin });

  const { data: allBooks, isLoading: booksLoading } =
    trpc.book.adminList.useQuery(undefined, { enabled: isAdmin });

  const { data: allPurchases, isLoading: purchasesLoading } =
    trpc.purchase.adminList.useQuery(undefined, { enabled: isAdmin });

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
    category: "Sci-Fi",
    coverImage: "",
    content: "",
  });

  if (authLoading || !isAdmin) {
    return null;
  }

  const statusColors: Record<string, string> = {
    pending: "var(--color-p-yellow-fg)",
    approved: "var(--color-p-green-fg)",
    rejected: "var(--color-p-red-fg)",
  };

  const categories = ["Sci-Fi", "Horror", "Thriller"];

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
      setSelectedBooks(new Set(books.map(b => b.id)));
    }
  };

  const bulkApprove = () => {
    selectedBooks.forEach(id => approveMutation.mutate({ id }));
    setSelectedBooks(new Set());
  };

  const bulkReject = () => {
    selectedBooks.forEach(id => rejectMutation.mutate({ id }));
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
      category: "Sci-Fi",
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
    fontSize: "18px",
    padding: "8px 10px",
    border: "1px solid var(--border)",
    outline: "none",
    color: "var(--foreground)",
    fontFamily: "var(--font-mono)",
    background: "transparent",
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: "960px", padding: "32px 24px 80px" }}
      >
          <h1
            style={{
              fontSize: "34px",
              fontWeight: 400,
              fontFamily: "var(--font-serif)",
              color: "var(--foreground)",
              marginBottom: "24px",
              letterSpacing: "-0.01em",
            }}
          >
            Admin Dashboard
          </h1>

        <div className="flex items-center justify-between mb-6">
          <div
            style={{
              display: "flex",
              gap: "1px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {(["pending", "books", "purchases"] as Tab[]).map(tab => {
              const count =
                tab === "pending"
                  ? pendingBooks?.length
                  : tab === "books"
                    ? allBooks?.length
                    : allPurchases?.length;
              const labels = {
                pending: "Pending",
                books: "All Books",
                purchases: "Purchases",
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    fontSize: "17px",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.05em",
                    padding: "8px 16px",
                    border: "none",
                    borderBottom:
                      activeTab === tab
                        ? "2px solid var(--foreground)"
                        : "2px solid transparent",
                    background: "transparent",
                    color:
                      activeTab === tab
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
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
              <span
                style={{
                  fontSize: "17px",
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-mono)",
                  alignSelf: "center",
                }}
              >
                {selectedBooks.size} selected
              </span>
              <button
                onClick={bulkApprove}
                disabled={approveMutation.isPending}
                style={{
                  fontSize: "16px",
                  fontFamily: "var(--font-mono)",
                  color: "#fff",
                  background: "var(--color-p-green-fg)",
                  border: "none",
                  padding: "6px 12px",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                Approve All
              </button>
              <button
                onClick={bulkReject}
                disabled={rejectMutation.isPending}
                style={{
                  fontSize: "16px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-p-red-fg)",
                  background: "transparent",
                  border: "1px solid var(--color-p-red-fg)",
                  padding: "6px 12px",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                Reject All
              </button>
            </div>
          )}
        </div>

        {activeTab === "pending" && (
          <div>
            <div
              style={{
                border: "1px solid var(--color-p-yellow-fg)",
                padding: "10px 14px",
                marginBottom: "16px",
                backgroundColor: "rgba(243, 156, 18, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start",
                }}
              >
                <PiWarningCircle
                  size={12}
                  style={{ color: "var(--color-p-yellow-fg)", marginTop: "3px", flexShrink: 0 }}
                />
                <p
                  style={{
                    fontSize: "15px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--foreground)",
                    lineHeight: 1.6,
                  }}
                >
                  Before approving, verify: accurate title/author, appropriate
                  description, and original content (no AI). Reject submissions
                  that violate our content policies.
                </p>
              </div>
            </div>
            {pendingLoading ? (
              <p
                style={{
                  fontSize: "18px",
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                LOADING...
              </p>
            ) : pendingBooks && pendingBooks.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedBooks.size === pendingBooks.length &&
                      pendingBooks.length > 0
                    }
                    onChange={() => selectAll(pendingBooks)}
                    style={{ cursor: "pointer" }}
                  />
                  <span
                    style={{
                      fontSize: "16px",
                      color: "var(--muted-foreground)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Select All
                  </span>
                </div>
                {pendingBooks.map(book => (
                  <div
                    key={book.id}
                    style={{
                      border: "1px solid var(--border)",
                      padding: "16px",
                    }}
                  >
                    <div className="flex gap-4">
                      <input
                        type="checkbox"
                        checked={selectedBooks.has(book.id)}
                        onChange={() => toggleSelect(book.id)}
                        style={{ marginTop: "40px", cursor: "pointer" }}
                      />
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        style={{
                          width: "80px",
                          height: "105px",
                          objectFit: "cover",
                          flexShrink: 0,
                          cursor: "pointer",
                          border: "1px solid var(--border)",
                        }}
                        onClick={() => navigate(`/book/${book.id}`)}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              style={{
                                fontSize: "21px",
                                fontWeight: 400,
                                fontFamily: "var(--font-serif)",
                                color: "var(--foreground)",
                                marginBottom: "4px",
                              }}
                            >
                              {book.title}
                            </h3>
                            <p
                              style={{
                                fontSize: "18px",
                                color: "var(--muted-foreground)",
                                marginBottom: "4px",
                              }}
                            >
                              {book.author}
                            </p>
                            <p
                              style={{
                                fontSize: "18px",
                                fontFamily: "var(--font-mono)",
                                color: "var(--foreground)",
                                marginBottom: "4px",
                              }}
                            >
                              ₦{book.price}
                            </p>
                            <p
                              style={{
                                fontSize: "16px",
                                color: "var(--muted-foreground)",
                              }}
                            >
                              {book.category}
                            </p>
                          </div>
                          <span
                            style={{
                              fontSize: "15px",
                              fontFamily: "var(--font-mono)",
                              color: statusColors[book.status],
                              border: `1px solid ${statusColors[book.status]}`,
                              padding: "2px 8px",
                            }}
                          >
                            {book.status?.toUpperCase()}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "18px",
                            color: "var(--foreground)",
                            lineHeight: 1.6,
                            marginBottom: "12px",
                            maxWidth: "600px",
                          }}
                        >
                          {book.description}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              approveMutation.mutate({ id: book.id })
                            }
                            disabled={approveMutation.isPending}
                            style={{
                              fontSize: "16px",
                              fontFamily: "var(--font-mono)",
                              color: "#fff",
                              background: "var(--color-p-green-fg)",
                              border: "none",
                              padding: "6px 16px",
                              cursor: "pointer",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              rejectMutation.mutate({ id: book.id })
                            }
                            disabled={rejectMutation.isPending}
                            style={{
                              fontSize: "16px",
                              fontFamily: "var(--font-mono)",
                              color: "var(--color-p-red-fg)",
                              background: "transparent",
                              border: "1px solid var(--color-p-red-fg)",
                              padding: "6px 16px",
                              cursor: "pointer",
                              letterSpacing: "0.05em",
                            }}
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
              <p
                style={{
                  fontSize: "19px",
                  color: "var(--muted-foreground)",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                No pending submissions
              </p>
            )}
          </div>
        )}

        {activeTab === "books" && (
          <div>
            {booksLoading ? (
              <p
                style={{
                  fontSize: "18px",
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                LOADING...
              </p>
            ) : allBooks && allBooks.length > 0 ? (
              <div>
                <div
                  className="hidden md:flex items-center gap-4"
                  style={{
                    padding: "8px 0",
                    borderBottom: "2px solid var(--foreground)",
                    fontSize: "16px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  <div style={{ width: "40px" }}></div>
                  <div style={{ width: "100px" }}>COVER</div>
                  <div className="flex-1">TITLE / AUTHOR</div>
                  <div style={{ width: "60px" }}>PRICE</div>
                  <div style={{ width: "70px" }}>STATUS</div>
                  <div style={{ width: "60px" }}>ACTIONS</div>
                </div>
                {allBooks.map(book => (
                  <div key={book.id}>
                    {editingBook === book.id ? (
                      <div
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid var(--border)",
                          backgroundColor: "rgba(0,0,0,0.02)",
                        }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              style={{
                                fontSize: "16px",
                                color: "var(--muted-foreground)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Title
                            </label>
                            <input
                              value={editForm.title}
                              onChange={e =>
                                setEditForm({
                                  ...editForm,
                                  title: e.target.value,
                                })
                              }
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "16px",
                                color: "var(--muted-foreground)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Author
                            </label>
                            <input
                              value={editForm.author}
                              onChange={e =>
                                setEditForm({
                                  ...editForm,
                                  author: e.target.value,
                                })
                              }
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "16px",
                                color: "var(--muted-foreground)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Price
                            </label>
                            <input
                              value={editForm.price}
                              onChange={e =>
                                setEditForm({
                                  ...editForm,
                                  price: e.target.value,
                                })
                              }
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "16px",
                                color: "var(--muted-foreground)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Category
                            </label>
                            <select
                              value={editForm.category}
                              onChange={e =>
                                setEditForm({
                                  ...editForm,
                                  category: e.target.value,
                                })
                              }
                              style={inputStyle}
                            >
                              {categories.map(c => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "16px",
                                color: "var(--muted-foreground)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Cover Image URL
                            </label>
                            <input
                              value={editForm.coverImage}
                              onChange={e =>
                                setEditForm({
                                  ...editForm,
                                  coverImage: e.target.value,
                                })
                              }
                              style={inputStyle}
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label
                            style={{
                              fontSize: "16px",
                              color: "var(--muted-foreground)",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            Description
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={e =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                            rows={2}
                            style={{ ...inputStyle, resize: "vertical" }}
                          />
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                            style={{
                              fontSize: "16px",
                              fontFamily: "var(--font-mono)",
                              color: "#fff",
                              background: "var(--color-p-green-fg)",
                              border: "none",
                              padding: "6px 16px",
                              cursor: "pointer",
                              letterSpacing: "0.05em",
                            }}
                          >
                            <PiCheck size={12} style={{ marginRight: "4px" }} />{" "}
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              fontSize: "16px",
                              fontFamily: "var(--font-mono)",
                              color: "var(--color-p-red-fg)",
                              background: "transparent",
                              border: "1px solid var(--color-p-red-fg)",
                              padding: "6px 16px",
                              cursor: "pointer",
                              letterSpacing: "0.05em",
                            }}
                          >
                            <PiX size={12} style={{ marginRight: "4px" }} />{" "}
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 transition-colors hover:bg-accent"
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          <div
                            style={{
                              width: "40px",
                              height: "52px",
                              objectFit: "cover",
                              border: "1px solid var(--border)",
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                cursor: "pointer",
                              }}
                              onClick={() => navigate(`/book/${book.id}`)}
                            />
                          </div>
                          <div className="flex-1 min-w-0 md:hidden">
                            <p
                              style={{
                                fontSize: "19px",
                                fontFamily: "var(--font-serif)",
                                color: "var(--foreground)",
                                cursor: "pointer",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              onClick={() => navigate(`/book/${book.id}`)}
                            >
                              {book.title}
                            </p>
                            <p
                              style={{
                                fontSize: "17px",
                                color: "var(--muted-foreground)",
                              }}
                            >
                              {book.author}
                            </p>
                          </div>
                        </div>
                        <div className="hidden md:block flex-1 min-w-0">
                          <p
                            style={{
                              fontSize: "19px",
                              color: "var(--foreground)",
                              cursor: "pointer",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => navigate(`/book/${book.id}`)}
                          >
                            {book.title}
                          </p>
                          <p
                            style={{
                              fontSize: "17px",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            {book.author}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4 ml-[52px] md:ml-0">
                          <span
                            style={{
                              fontSize: "18px",
                              fontFamily: "var(--font-mono)",
                              color: "var(--foreground)",
                              width: "60px",
                            }}
                          >
                            ₦{book.price}
                          </span>
                          <span
                            style={{
                              fontSize: "15px",
                              fontFamily: "var(--font-mono)",
                              color: statusColors[book.status],
                              border: `1px solid ${statusColors[book.status]}`,
                              padding: "2px 6px",
                              textAlign: "center",
                            }}
                          >
                            {book.status?.toUpperCase()}
                          </span>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={() => startEdit(book)}
                              style={{
                                fontSize: "15px",
                                fontFamily: "var(--font-mono)",
                                color: "var(--foreground)",
                                background: "none",
                                border: "1px solid var(--border)",
                                padding: "4px 6px",
                                cursor: "pointer",
                              }}
                              title="Edit"
                            >
                              <PiPencilSimple size={10} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Delete this book?"))
                                  deleteMutation.mutate({ id: book.id });
                              }}
                              style={{
                                fontSize: "15px",
                                fontFamily: "var(--font-mono)",
                                color: "var(--color-p-red-fg)",
                                background: "none",
                                border: "1px solid var(--color-p-red-fg)",
                                padding: "4px 6px",
                                cursor: "pointer",
                              }}
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
              <p
                style={{
                  fontSize: "19px",
                  color: "var(--muted-foreground)",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                No books
              </p>
            )}
          </div>
        )}

        {activeTab === "purchases" && (
          <div>
            {purchasesLoading ? (
              <p
                style={{
                  fontSize: "18px",
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                LOADING...
              </p>
            ) : allPurchases && allPurchases.length > 0 ? (
              <div>
                <div
                  className="hidden md:flex items-center gap-4"
                  style={{
                    padding: "8px 0",
                    borderBottom: "2px solid var(--foreground)",
                    fontSize: "16px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  <div style={{ width: "40px" }}>ID</div>
                  <div style={{ width: "100px" }}>BOOK</div>
                  <div className="flex-1">TITLE</div>
                  <div style={{ width: "80px" }}>BUYER</div>
                  <div style={{ width: "60px" }}>PRICE</div>
                  <div style={{ width: "80px" }}>DATE</div>
                </div>
                {allPurchases.map(purchase => (
                  <div
                    key={purchase.id}
                    className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <span
                        className="md:hidden"
                        style={{
                          fontSize: "16px",
                          color: "var(--muted-foreground)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        #{purchase.id}
                      </span>
                      <div
                        style={{
                          width: "40px",
                          height: "52px",
                          objectFit: "cover",
                          border: "1px solid var(--border)",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={purchase.book?.coverImage || ""}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate(`/book/${purchase.book?.id}`)}
                        />
                      </div>
                      <div className="flex-1 min-w-0 md:hidden">
                        <p
                          style={{
                            fontSize: "19px",
                            color: "var(--foreground)",
                            cursor: "pointer",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => navigate(`/book/${purchase.book?.id}`)}
                        >
                          {purchase.book?.title}
                        </p>
                        <p
                          style={{
                            fontSize: "17px",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {purchase.book?.author}
                        </p>
                      </div>
                    </div>
                    <span
                      className="hidden md:inline"
                      style={{
                        fontSize: "17px",
                        color: "var(--muted-foreground)",
                        fontFamily: "var(--font-mono)",
                        width: "40px",
                      }}
                    >
                      #{purchase.id}
                    </span>
                    <div
                      className="hidden md:block"
                      style={{
                        width: "40px",
                        height: "52px",
                        objectFit: "cover",
                        border: "1px solid var(--border)",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={purchase.book?.coverImage || ""}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => navigate(`/book/${purchase.book?.id}`)}
                      />
                    </div>
                    <div className="hidden md:block flex-1 min-w-0">
                      <p
                        style={{
                          fontSize: "19px",
                          color: "var(--foreground)",
                          cursor: "pointer",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        onClick={() => navigate(`/book/${purchase.book?.id}`)}
                      >
                        {purchase.book?.title}
                      </p>
                      <p
                        style={{ fontSize: "17px", color: "var(--muted-foreground)" }}
                      >
                        {purchase.book?.author}
                      </p>
                    </div>
                    <div
                      className="flex flex-wrap items-center gap-2 ml-[52px] md:ml-0 text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <span
                        style={{
                          color: "var(--foreground)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {purchase.buyer?.username || "—"}
                      </span>
                      <span>·</span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--foreground)",
                        }}
                      >
                        ₦{purchase.purchasePrice}
                      </span>
                      <span>·</span>
                      <span>
                        {purchase.createdAt
                          ? new Date(purchase.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontSize: "19px",
                  color: "var(--muted-foreground)",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                No purchases
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
