import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  PiWarningCircle,
  PiPencilSimple,
  PiCheck,
  PiX,
  PiPlus,
  PiUser,
  PiUserMinus,
  PiTrash,
  PiStar,
  PiStarFill,
  PiCaretUp,
  PiCaretDown,
} from "react-icons/pi";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { bookUrl } from "../../contracts/blog";
import { RowsSkeleton } from "@/components/Skeleton";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";

type Tab = "pending" | "books" | "featured" | "authors" | "purchases" | "users";

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
  const [searchParams] = useSearchParams();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const t = searchParams.get("tab");
    return t === "pending" ||
      t === "books" ||
      t === "featured" ||
      t === "authors" ||
      t === "purchases" ||
      t === "users"
      ? t
      : "pending";
  });
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

  const { data: allUsers, isLoading: usersLoading } =
    trpc.auth.adminList.useQuery(undefined, { enabled: isAdmin });

  const approveMutation = trpc.book.approve.useMutation({
    onSuccess: () => {
      utils.book.pendingList.invalidate();
      utils.book.adminList.invalidate();
      toast.success("Book approved and live");
    },
  });

  const rejectMutation = trpc.book.reject.useMutation({
    onSuccess: () => {
      utils.book.pendingList.invalidate();
      utils.book.adminList.invalidate();
      toast.success("Submission rejected");
    },
  });

  const updateMutation = trpc.book.update.useMutation({
    onSuccess: () => {
      utils.book.adminList.invalidate();
      utils.book.list.invalidate();
      setEditingBook(null);
      toast.success("Book updated");
    },
  });

  const deleteMutation = trpc.book.delete.useMutation({
    onSuccess: () => {
      utils.book.adminList.invalidate();
      utils.book.list.invalidate();
      toast.success("Book deleted");
    },
  });

  const updateUserStatusMutation = trpc.auth.adminUpdateStatus.useMutation({
    onSuccess: () => {
      utils.auth.adminList.invalidate();
      toast.success("User status updated");
    },
  });

  const deleteUserMutation = trpc.auth.adminDelete.useMutation({
    onSuccess: () => {
      utils.auth.adminList.invalidate();
      toast.success("User deleted");
    },
  });

  const { data: featuredBooks, isLoading: featuredLoading } =
    trpc.book.featuredList.useQuery(undefined, { enabled: isAdmin });

  const setFeaturedMutation = trpc.book.setFeatured.useMutation({
    onSuccess: (_data, variables) => {
      utils.book.featuredList.invalidate();
      utils.book.adminList.invalidate();
      utils.book.list.invalidate();
      toast.success(
        variables.featured ? "Added to landing carousel" : "Removed from carousel"
      );
    },
  });

  const moveFeaturedMutation = trpc.book.moveFeatured.useMutation({
    onSuccess: () => {
      utils.book.featuredList.invalidate();
    },
  });

  const { data: allAuthors, isLoading: authorsLoading } =
    trpc.author.adminList.useQuery(undefined, { enabled: isAdmin });

  const updateAuthorMutation = trpc.author.update.useMutation({
    onSuccess: () => {
      utils.author.adminList.invalidate();
      setEditingAuthor(null);
      toast.success("Author profile updated");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message);
    },
  });

  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [confirmState, setConfirmState] = useState<null | {
    title: string;
    body: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>(null);  const [editingBook, setEditingBook] = useState<number | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<number | null>(null);
  const [authorForm, setAuthorForm] = useState({
    bio: "",
    dedication: "",
    avatar: "",
    location: "",
    website: "",
    twitter: "",
    instagram: "",
  });  const [editForm, setEditForm] = useState<BookFormData>({
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
    pending: "rgb(var(--color-p-yellow-fg))",
    approved: "rgb(var(--color-p-green-fg))",
    rejected: "rgb(var(--color-p-red-fg))",
  };

  const userStatusColors: Record<string, string> = {
    active: "rgb(var(--color-p-green-fg))",
    banned: "rgb(var(--color-p-red-fg))",
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

  const startAuthorEdit = (
    author: NonNullable<typeof allAuthors>[number]
  ) => {
    setEditingAuthor(author.id);
    setAuthorForm({
      bio: author.bio || "",
      dedication: author.dedication || "",
      avatar: author.avatar || "",
      location: author.location || "",
      website: author.website || "",
      twitter: author.twitter || "",
      instagram: author.instagram || "",
    });
  };

  const cancelAuthorEdit = () => {
    setEditingAuthor(null);
    setAuthorForm({
      bio: "",
      dedication: "",
      avatar: "",
      location: "",
      website: "",
      twitter: "",
      instagram: "",
    });
  };

  const saveAuthorEdit = () => {
    if (!editingAuthor) return;
    updateAuthorMutation.mutate({
      id: editingAuthor,
      ...authorForm,
    });
  };

  const toggleUserStatus = (user: NonNullable<typeof allUsers>[number]) => {
    const nextStatus = user.status === "banned" ? "active" : "banned";
    const action = user.status === "banned" ? "Unban" : "Ban";
    setConfirmState({
      title: `${action} @${user.username}?`,
      body:
        action === "Ban"
          ? "They immediately lose access to their account and library."
          : "Their account and library access will be restored.",
      confirmLabel: `${action} user`,
      onConfirm: () => updateUserStatusMutation.mutate({ id: user.id, status: nextStatus }),
    });
  };

  const deleteUser = (user: NonNullable<typeof allUsers>[number]) => {
    setConfirmState({
      title: `Delete @${user.username}?`,
      body: "Their account and history are removed. This cannot be undone.",
      confirmLabel: "Delete user",
      onConfirm: () => deleteUserMutation.mutate({ id: user.id }),
    });
  };

  const formatNgn = (price: string | number) => {
    const value = typeof price === "string" ? Number(price) : price;
    return `₦${value.toLocaleString("en-NG")}`;
  };

  const totalRevenue =
    allPurchases?.reduce(
      (sum: number, p: { purchasePrice: string }) =>
        sum + Number(p.purchasePrice || 0),
      0,
    ) || 0;

  const inputStyle = {
    width: "100%",
    fontSize: "18px",
    padding: "8px 10px",
    border: "1px solid hsl(var(--border))",
    outline: "none",
    color: "hsl(var(--foreground))",
    fontFamily: "var(--font-mono)",
    background: "transparent",
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title ?? ""}
        body={confirmState?.body ?? ""}
        confirmLabel={confirmState?.confirmLabel ?? "Confirm"}
        onConfirm={() => {
          confirmState?.onConfirm();
          setConfirmState(null);
        }}
        onCancel={() => setConfirmState(null)}
      />
      <div
        className="mx-auto"
        style={{ maxWidth: "960px", padding: "32px 24px 80px" }}
      >
        <h1
          style={{
            fontSize: "34px",
            fontWeight: 400,
            fontFamily: "var(--font-serif)",
            color: "hsl(var(--foreground))",
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
              borderBottom: "1px solid hsl(var(--border))",
            }}
          >
            {(["pending", "books", "featured", "authors", "purchases", "users"] as Tab[]).map(tab => {
              const count =
                tab === "pending"
                  ? pendingBooks?.length
                  : tab === "books"
                    ? allBooks?.length
                    : tab === "featured"
                      ? featuredBooks?.length
                      : tab === "authors"
                        ? allAuthors?.length
                        : tab === "purchases"
                          ? allPurchases?.length
                          : allUsers?.length;
              const labels = {
                pending: "Pending",
                books: "All Books",
                featured: "Featured",
                authors: "Authors",
                purchases: "Purchases",
                users: "Users",
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
                        ? "2px solid hsl(var(--foreground))"
                        : "2px solid transparent",
                    background: "transparent",
                    color:
                      activeTab === tab
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--muted-foreground))",
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
                  color: "hsl(var(--muted-foreground))",
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
                  background: "rgb(var(--color-p-green-fg))",
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
                  color: "rgb(var(--color-p-red-fg))",
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
                  style={{ color: "rgb(var(--color-p-yellow-fg))", marginTop: "3px", flexShrink: 0 }}
                />
                <p
                  style={{
                    fontSize: "15px",
                    fontFamily: "var(--font-mono)",
                    color: "hsl(var(--foreground))",
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
              <RowsSkeleton count={6} />
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
                      color: "hsl(var(--muted-foreground))",
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
                      border: "1px solid hsl(var(--border))",
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
                          border: "1px solid hsl(var(--border))",
                        }}
                        onClick={() => navigate(bookUrl(book))}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              style={{
                                fontSize: "21px",
                                fontWeight: 400,
                                fontFamily: "var(--font-serif)",
                                color: "hsl(var(--foreground))",
                                marginBottom: "4px",
                              }}
                            >
                              {book.title}
                            </h3>
                            <p
                              style={{
                                fontSize: "18px",
                                color: "hsl(var(--muted-foreground))",
                                marginBottom: "4px",
                              }}
                            >
                              {book.author}
                            </p>
                            <p
                              style={{
                                fontSize: "18px",
                                fontFamily: "var(--font-mono)",
                                color: "hsl(var(--foreground))",
                                marginBottom: "4px",
                              }}
                            >
                              ₦{book.price}
                            </p>
                            <p
                              style={{
                                fontSize: "16px",
                                color: "hsl(var(--muted-foreground))",
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
                            color: "hsl(var(--foreground))",
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
                              background: "rgb(var(--color-p-green-fg))",
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
                              color: "rgb(var(--color-p-red-fg))",
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
                  color: "hsl(var(--muted-foreground))",
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
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 400,
                  fontFamily: "var(--font-serif)",
                  color: "hsl(var(--foreground))",
                }}
              >
                All Books
              </h2>
              <button
                onClick={() => navigate("/add-book")}
                style={{
                  fontSize: "16px",
                  fontFamily: "var(--font-mono)",
                  color: "#fff",
                  background: "rgb(var(--color-p-green-fg))",
                  border: "none",
                  padding: "8px 14px",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <PiPlus size={14} /> Add Book
              </button>
            </div>
            {booksLoading ? (
              <RowsSkeleton count={6} />
            ) : allBooks && allBooks.length > 0 ? (
              <div>
                <div
                  className="hidden md:flex items-center gap-4"
                  style={{
                    padding: "8px 0",
                    borderBottom: "2px solid hsl(var(--foreground))",
                    fontSize: "16px",
                    fontFamily: "var(--font-mono)",
                    color: "hsl(var(--muted-foreground))",
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
                          borderBottom: "1px solid hsl(var(--border))",
                          backgroundColor: "rgba(0,0,0,0.02)",
                        }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              style={{
                                fontSize: "16px",
                                color: "hsl(var(--muted-foreground))",
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
                                color: "hsl(var(--muted-foreground))",
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
                                color: "hsl(var(--muted-foreground))",
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
                                color: "hsl(var(--muted-foreground))",
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
                                color: "hsl(var(--muted-foreground))",
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
                              color: "hsl(var(--muted-foreground))",
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
                              background: "rgb(var(--color-p-green-fg))",
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
                              color: "rgb(var(--color-p-red-fg))",
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
                          borderBottom: "1px solid hsl(var(--border))",
                        }}
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          <div
                            style={{
                              width: "40px",
                              height: "52px",
                              objectFit: "cover",
                              border: "1px solid hsl(var(--border))",
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
                              onClick={() => navigate(bookUrl(book))}
                            />
                          </div>
                          <div className="flex-1 min-w-0 md:hidden">
                            <p
                              style={{
                                fontSize: "19px",
                                fontFamily: "var(--font-serif)",
                                color: "hsl(var(--foreground))",
                                cursor: "pointer",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              onClick={() => navigate(bookUrl(book))}
                            >
                              {book.title}
                            </p>
                            <p
                              style={{
                                fontSize: "17px",
                                color: "hsl(var(--muted-foreground))",
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
                              color: "hsl(var(--foreground))",
                              cursor: "pointer",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => navigate(bookUrl(book))}
                          >
                            {book.title}
                          </p>
                          <p
                            style={{
                              fontSize: "17px",
                              color: "hsl(var(--muted-foreground))",
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
                              color: "hsl(var(--foreground))",
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
                              onClick={() =>
                                setFeaturedMutation.mutate({
                                  id: book.id,
                                  featured: !book.isFeatured,
                                })
                              }
                              style={{
                                fontSize: "15px",
                                fontFamily: "var(--font-mono)",
                                color: book.isFeatured
                                  ? "rgb(var(--color-p-yellow-fg))"
                                  : "hsl(var(--muted-foreground))",
                                background: book.isFeatured
                                  ? "rgb(var(--color-p-yellow))"
                                  : "none",
                                border: "1px solid hsl(var(--border))",
                                padding: "4px 6px",
                                cursor: "pointer",
                              }}
                              title={
                                book.isFeatured
                                  ? "Remove from landing carousel"
                                  : "Feature on landing carousel"
                              }
                            >
                              {book.isFeatured ? (
                                <PiStarFill size={10} />
                              ) : (
                                <PiStar size={10} />
                              )}
                            </button>
                            <button
                              onClick={() => startEdit(book)}
                              style={{
                                fontSize: "15px",
                                fontFamily: "var(--font-mono)",
                                color: "hsl(var(--foreground))",
                                background: "none",
                                border: "1px solid hsl(var(--border))",
                                padding: "4px 6px",
                                cursor: "pointer",
                              }}
                              title="Edit"
                            >
                              <PiPencilSimple size={10} />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmState({
                                  title: "Delete this book?",
                                  body: `"${book.title}" will be removed from the catalogue for everyone. This cannot be undone.`,
                                  confirmLabel: "Delete book",
                                  onConfirm: () =>
                                    deleteMutation.mutate({ id: book.id }),
                                })
                              }
                              style={{
                                fontSize: "15px",
                                fontFamily: "var(--font-mono)",
                                color: "rgb(var(--color-p-red-fg))",
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
                  color: "hsl(var(--muted-foreground))",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                No books
              </p>
            )}
          </div>
        )}

        {activeTab === "featured" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 400,
                  fontFamily: "var(--font-serif)",
                  color: "hsl(var(--foreground))",
                }}
              >
                Landing Carousel
              </h2>
            </div>
            <p
              style={{
                fontSize: "15px",
                color: "hsl(var(--muted-foreground))",
                marginBottom: "16px",
              }}
            >
              Star books in All Books to add them here, then order the midday
              carousel. Only approved books appear on the landing page.
            </p>
            {featuredLoading ? (
              <RowsSkeleton count={4} />
            ) : featuredBooks && featuredBooks.length > 0 ? (
              <div>
                {featuredBooks.map((book, i) => (
                  <div key={book.id}>
                    <div
                      className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 transition-colors hover:bg-accent"
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid hsl(var(--border))",
                      }}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <span
                          style={{
                            fontSize: "16px",
                            fontFamily: "var(--font-mono)",
                            color: "hsl(var(--muted-foreground))",
                            width: "28px",
                            textAlign: "center",
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <div
                          style={{
                            width: "40px",
                            height: "52px",
                            objectFit: "cover",
                            border: "1px solid hsl(var(--border))",
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
                            onClick={() => navigate(bookUrl(book))}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          style={{
                            fontSize: "19px",
                            color: "hsl(var(--foreground))",
                            cursor: "pointer",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => navigate(bookUrl(book))}
                        >
                          {book.title}
                        </p>
                        <p
                          style={{
                            fontSize: "17px",
                            color: "hsl(var(--muted-foreground))",
                          }}
                        >
                          {book.author}
                          {book.status !== "approved" && (
                            <span
                              style={{
                                fontSize: "13px",
                                fontFamily: "var(--font-mono)",
                                color: "rgb(var(--color-p-red-fg))",
                                marginLeft: "8px",
                              }}
                            >
                              {book.status?.toUpperCase()} — HIDDEN ON LANDING
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-[52px] md:ml-0">
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() =>
                              moveFeaturedMutation.mutate({
                                id: book.id,
                                direction: "up",
                              })
                            }
                            disabled={i === 0 || moveFeaturedMutation.isPending}
                            style={{
                              fontSize: "15px",
                              fontFamily: "var(--font-mono)",
                              color: "hsl(var(--foreground))",
                              background: "none",
                              border: "1px solid hsl(var(--border))",
                              padding: "4px 6px",
                              cursor: "pointer",
                              opacity:
                                i === 0 || moveFeaturedMutation.isPending
                                  ? 0.35
                                  : 1,
                            }}
                            title="Move earlier"
                          >
                            <PiCaretUp size={10} />
                          </button>
                          <button
                            onClick={() =>
                              moveFeaturedMutation.mutate({
                                id: book.id,
                                direction: "down",
                              })
                            }
                            disabled={
                              i === (featuredBooks?.length ?? 0) - 1 ||
                              moveFeaturedMutation.isPending
                            }
                            style={{
                              fontSize: "15px",
                              fontFamily: "var(--font-mono)",
                              color: "hsl(var(--foreground))",
                              background: "none",
                              border: "1px solid hsl(var(--border))",
                              padding: "4px 6px",
                              cursor: "pointer",
                              opacity:
                                i === (featuredBooks?.length ?? 0) - 1 ||
                                moveFeaturedMutation.isPending
                                  ? 0.35
                                  : 1,
                            }}
                            title="Move later"
                          >
                            <PiCaretDown size={10} />
                          </button>
                          <button
                            onClick={() =>
                              setFeaturedMutation.mutate({
                                id: book.id,
                                featured: false,
                              })
                            }
                            style={{
                              fontSize: "15px",
                              fontFamily: "var(--font-mono)",
                              color: "rgb(var(--color-p-red-fg))",
                              background: "none",
                              border: "1px solid var(--color-p-red-fg)",
                              padding: "4px 6px",
                              cursor: "pointer",
                            }}
                            title="Remove from carousel"
                          >
                            <PiX size={10} />
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
                  color: "hsl(var(--muted-foreground))",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                Nothing featured — star books in All Books to fill the carousel
              </p>
            )}
          </div>
        )}

        {activeTab === "authors" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 400,
                  fontFamily: "var(--font-serif)",
                  color: "hsl(var(--foreground))",
                }}
              >
                Authors
              </h2>
            </div>
            <p
              style={{
                fontSize: "15px",
                color: "hsl(var(--muted-foreground))",
                marginBottom: "16px",
              }}
            >
              Profiles are created automatically from book authors. Add bios,
              photos and links here — they show on each author's public page.
            </p>
            {authorsLoading ? (
              <RowsSkeleton count={4} />
            ) : allAuthors && allAuthors.length > 0 ? (
              <div>
                {allAuthors.map(author => (
                  <div key={author.id}>
                    {editingAuthor === author.id ? (
                      <div
                        style={{
                          padding: "16px",
                          border: "1px solid hsl(var(--border))",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          className="flex items-center gap-4"
                          style={{ marginBottom: "12px" }}
                        >
                          {authorForm.avatar ? (
                            <img
                              src={authorForm.avatar}
                              alt={author.name}
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "9999px",
                                objectFit: "cover",
                                border: "1px solid hsl(var(--border))",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              className="flex items-center justify-center"
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "9999px",
                                border: "1px solid hsl(var(--border))",
                                fontFamily: "var(--font-serif)",
                                fontSize: "24px",
                                flexShrink: 0,
                              }}
                            >
                              {author.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p
                              style={{
                                fontSize: "19px",
                                color: "hsl(var(--foreground))",
                              }}
                            >
                              {author.name}
                            </p>
                            <p
                              style={{
                                fontSize: "14px",
                                fontFamily: "var(--font-mono)",
                                color: "hsl(var(--muted-foreground))",
                              }}
                            >
                              /author/{author.slug}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gap: "10px",
                            marginBottom: "12px",
                          }}
                        >
                          <textarea
                            value={authorForm.bio}
                            onChange={e =>
                              setAuthorForm({ ...authorForm, bio: e.target.value })
                            }
                            placeholder="Short bio — who they are, what they write"
                            rows={3}
                            className="field-input"
                          />
                          <input
                            value={authorForm.dedication}
                            onChange={e =>
                              setAuthorForm({
                                ...authorForm,
                                dedication: e.target.value,
                              })
                            }
                            placeholder="Dedication e.g. Dedicated to freedom fighters"
                            style={inputStyle}
                          />
                          <input
                            value={authorForm.avatar}
                            onChange={e =>
                              setAuthorForm({ ...authorForm, avatar: e.target.value })
                            }
                            placeholder="Photo URL"
                            style={inputStyle}
                          />
                          <div
                            className="grid sm:grid-cols-2"
                            style={{ gap: "10px" }}
                          >
                            <input
                              value={authorForm.location}
                              onChange={e =>
                                setAuthorForm({
                                  ...authorForm,
                                  location: e.target.value,
                                })
                              }
                              placeholder="Location e.g. Lagos, Nigeria"
                              style={inputStyle}
                            />
                            <input
                              value={authorForm.website}
                              onChange={e =>
                                setAuthorForm({
                                  ...authorForm,
                                  website: e.target.value,
                                })
                              }
                              placeholder="Website URL"
                              style={inputStyle}
                            />
                            <input
                              value={authorForm.twitter}
                              onChange={e =>
                                setAuthorForm({
                                  ...authorForm,
                                  twitter: e.target.value,
                                })
                              }
                              placeholder="X handle (without @)"
                              style={inputStyle}
                            />
                            <input
                              value={authorForm.instagram}
                              onChange={e =>
                                setAuthorForm({
                                  ...authorForm,
                                  instagram: e.target.value,
                                })
                              }
                              placeholder="Instagram handle (without @)"
                              style={inputStyle}
                            />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={saveAuthorEdit}
                            disabled={updateAuthorMutation.isPending}
                            style={{
                              fontSize: "16px",
                              fontFamily: "var(--font-mono)",
                              color: "#fff",
                              background: "rgb(var(--color-p-green-fg))",
                              border: "none",
                              padding: "6px 16px",
                              cursor: "pointer",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelAuthorEdit}
                            style={{
                              fontSize: "16px",
                              fontFamily: "var(--font-mono)",
                              color: "rgb(var(--color-p-red-fg))",
                              background: "transparent",
                              border: "1px solid var(--color-p-red-fg)",
                              padding: "6px 16px",
                              cursor: "pointer",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 transition-colors hover:bg-accent"
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid hsl(var(--border))",
                        }}
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          {author.avatar ? (
                            <img
                              src={author.avatar}
                              alt={author.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "9999px",
                                objectFit: "cover",
                                border: "1px solid hsl(var(--border))",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              className="flex items-center justify-center"
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "9999px",
                                border: "1px solid hsl(var(--border))",
                                fontFamily: "var(--font-serif)",
                                fontSize: "18px",
                                flexShrink: 0,
                              }}
                            >
                              {author.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            style={{
                              fontSize: "19px",
                              color: "hsl(var(--foreground))",
                              cursor: "pointer",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => navigate(`/author/${author.slug}`)}
                          >
                            {author.name}
                          </p>
                          <p
                            style={{
                              fontSize: "15px",
                              fontFamily: "var(--font-mono)",
                              color: "hsl(var(--muted-foreground))",
                            }}
                          >
                            {author.bookCount} book{author.bookCount !== 1 ? "s" : ""}
                            {author.bio ? " · has bio" : " · no bio"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4 ml-[52px] md:ml-0">
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={() => startAuthorEdit(author)}
                              style={{
                                fontSize: "15px",
                                fontFamily: "var(--font-mono)",
                                color: "hsl(var(--foreground))",
                                background: "none",
                                border: "1px solid hsl(var(--border))",
                                padding: "4px 6px",
                                cursor: "pointer",
                              }}
                              title="Edit profile"
                            >
                              <PiPencilSimple size={10} />
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
                  color: "hsl(var(--muted-foreground))",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                No authors yet — they appear when books are added
              </p>
            )}
          </div>
        )}

        {activeTab === "purchases" && (
          <div>
            {purchasesLoading ? (
              <RowsSkeleton count={6} />
            ) : allPurchases && allPurchases.length > 0 ? (
              <div>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
                >
                  <div
                    style={{
                      border: "1px solid hsl(var(--border))",
                      padding: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        fontFamily: "var(--font-mono)",
                        color: "hsl(var(--muted-foreground))",
                        letterSpacing: "0.05em",
                        marginBottom: "8px",
                      }}
                    >
                      TOTAL PURCHASES
                    </p>
                    <p
                      style={{
                        fontSize: "28px",
                        fontFamily: "var(--font-mono)",
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      {allPurchases.length}
                    </p>
                  </div>
                  <div
                    style={{
                      border: "1px solid hsl(var(--border))",
                      padding: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        fontFamily: "var(--font-mono)",
                        color: "hsl(var(--muted-foreground))",
                        letterSpacing: "0.05em",
                        marginBottom: "8px",
                      }}
                    >
                      TOTAL REVENUE
                    </p>
                    <p
                      style={{
                        fontSize: "28px",
                        fontFamily: "var(--font-mono)",
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      {formatNgn(totalRevenue)}
                    </p>
                  </div>
                </div>
                <div
                  className="hidden md:flex items-center gap-4"
                  style={{
                    padding: "8px 0",
                    borderBottom: "2px solid hsl(var(--foreground))",
                    fontSize: "16px",
                    fontFamily: "var(--font-mono)",
                    color: "hsl(var(--muted-foreground))",
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
                      borderBottom: "1px solid hsl(var(--border))",
                    }}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <span
                        className="md:hidden"
                        style={{
                          fontSize: "16px",
                          color: "hsl(var(--muted-foreground))",
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
                          border: "1px solid hsl(var(--border))",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={purchase.book?.coverImage || ""}
                          alt={purchase.book ? `Cover of ${purchase.book.title}` : "Book cover"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate(purchase.book ? bookUrl(purchase.book) : "/home")}
                        />
                      </div>
                      <div className="flex-1 min-w-0 md:hidden">
                        <p
                          style={{
                            fontSize: "19px",
                            color: "hsl(var(--foreground))",
                            cursor: "pointer",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => navigate(purchase.book ? bookUrl(purchase.book) : "/home")}
                        >
                          {purchase.book?.title}
                        </p>
                        <p
                          style={{
                            fontSize: "17px",
                            color: "hsl(var(--muted-foreground))",
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
                        color: "hsl(var(--muted-foreground))",
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
                        border: "1px solid hsl(var(--border))",
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
                        onClick={() => navigate(purchase.book ? bookUrl(purchase.book) : "/home")}
                      />
                    </div>
                    <div className="hidden md:block flex-1 min-w-0">
                      <p
                        style={{
                          fontSize: "19px",
                          color: "hsl(var(--foreground))",
                          cursor: "pointer",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        onClick={() => navigate(purchase.book ? bookUrl(purchase.book) : "/home")}
                      >
                        {purchase.book?.title}
                      </p>
                      <p
                        style={{ fontSize: "17px", color: "hsl(var(--muted-foreground))" }}
                      >
                        {purchase.book?.author}
                      </p>
                    </div>
                    <div
                      className="flex flex-wrap items-center gap-2 ml-[52px] md:ml-0 text-xs"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      <span
                        style={{
                          color: "hsl(var(--foreground))",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {purchase.buyer?.username || "—"}
                      </span>
                      <span>·</span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "hsl(var(--foreground))",
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
                  color: "hsl(var(--muted-foreground))",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                No purchases
              </p>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div>
            {usersLoading ? (
              <RowsSkeleton count={6} />
            ) : allUsers && allUsers.length > 0 ? (
              <div>
                <div
                  className="hidden md:flex items-center gap-4"
                  style={{
                    padding: "8px 0",
                    borderBottom: "2px solid hsl(var(--foreground))",
                    fontSize: "16px",
                    fontFamily: "var(--font-mono)",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  <div className="flex-1">USER</div>
                  <div style={{ width: "80px" }}>ROLE</div>
                  <div style={{ width: "80px" }}>STATUS</div>
                  <div style={{ width: "120px" }}>JOINED</div>
                  <div style={{ width: "100px" }}>ACTIONS</div>
                </div>
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid hsl(var(--border))",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <PiUser
                          size={16}
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        />
                        <span
                          style={{
                            fontSize: "19px",
                            color: "hsl(var(--foreground))",
                            fontFamily: "var(--font-serif)",
                          }}
                        >
                          {user.username}
                        </span>
                        {user.role === "admin" && (
                          <span
                            style={{
                              fontSize: "13px",
                              fontFamily: "var(--font-mono)",
                              color: "rgb(var(--color-p-green-fg))",
                              border: "1px solid rgb(var(--color-p-green-fg))",
                              padding: "1px 6px",
                            }}
                          >
                            ADMIN
                          </span>
                        )}
                      </div>
                      {user.name && (
                        <p
                          style={{
                            fontSize: "17px",
                            color: "hsl(var(--muted-foreground))",
                            marginTop: "2px",
                          }}
                        >
                          {user.name}
                        </p>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-2 md:gap-4 ml-[20px] md:ml-0"
                    >
                      <span
                        style={{
                          fontSize: "16px",
                          fontFamily: "var(--font-mono)",
                          color: "hsl(var(--foreground))",
                          width: "80px",
                          textTransform: "uppercase",
                        }}
                      >
                        {user.role}
                      </span>
                      <span
                        style={{
                          fontSize: "15px",
                          fontFamily: "var(--font-mono)",
                          color: userStatusColors[user.status],
                          border: `1px solid ${userStatusColors[user.status]}`,
                          padding: "2px 6px",
                          textAlign: "center",
                          width: "80px",
                        }}
                      >
                        {user.status?.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: "16px",
                          color: "hsl(var(--muted-foreground))",
                          fontFamily: "var(--font-mono)",
                          width: "120px",
                        }}
                      >
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          width: "100px",
                        }}
                      >
                        {user.role === "admin" ? (
                          <span
                            style={{
                              fontSize: "14px",
                              fontFamily: "var(--font-mono)",
                              color: "hsl(var(--muted-foreground))",
                            }}
                          >
                            Protected
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleUserStatus(user)}
                              disabled={updateUserStatusMutation.isPending}
                              style={{
                                fontSize: "15px",
                                fontFamily: "var(--font-mono)",
                                color:
                                  user.status === "banned"
                                    ? "rgb(var(--color-p-green-fg))"
                                    : "rgb(var(--color-p-yellow-fg))",
                                background: "none",
                                border: "1px solid hsl(var(--border))",
                                padding: "4px 6px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title={
                                user.status === "banned" ? "Unban user" : "Ban user"
                              }
                            >
                              <PiUserMinus size={10} />
                              {user.status === "banned" ? "Unban" : "Ban"}
                            </button>
                            <button
                              onClick={() => deleteUser(user)}
                              disabled={deleteUserMutation.isPending}
                              style={{
                                fontSize: "15px",
                                fontFamily: "var(--font-mono)",
                                color: "rgb(var(--color-p-red-fg))",
                                background: "none",
                                border: "1px solid var(--color-p-red-fg)",
                                padding: "4px 6px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title="Delete user"
                            >
                              <PiTrash size={10} /> Del
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontSize: "19px",
                  color: "hsl(var(--muted-foreground))",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                No users
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
