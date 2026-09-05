import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router";
import BookList from "./components/BookList";
import LeftColumn from "./components/LeftColumn";
import BookDetail from "./components/BookDetail";
import BottomNav from "./components/BottomNav";
import NotificationsBell from "./components/NotificationsBell";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { BookGridSkeleton } from "@/components/Skeleton";
import type { BookDisplay } from "../contracts/blog";
import { toBookDisplay } from "../contracts/blog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AddBook from "./pages/AddBook";
import SubmitBook from "./pages/SubmitBook";
import MyPurchases from "./pages/MyPurchases";
import MySubmissions from "./pages/MySubmissions";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Reader from "./pages/Reader";
import PaymentCallback from "./pages/PaymentCallback";
import Landing from "./pages/Landing";
import SellerDashboard from "./pages/SellerDashboard";
import AuthorProfile from "./pages/AuthorProfile";
import WishlistPage from "./pages/WishlistPage";
import { PiCaretRight } from "react-icons/pi";
import { Toaster } from "sonner";

function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="bottom-center"
      toastOptions={{
        style: {
          background: "hsl(var(--popover))",
          color: "hsl(var(--popover-foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius)",
        },
      }}
    />
  );
}

function AppShell() {
  const location = useLocation();
  const { isMobile, collapsed, setCollapsed } = useSidebar();

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [location.pathname, isMobile, setCollapsed]);

  return (
    <div
      className="flex"
      style={{ height: "100vh", backgroundColor: "hsl(var(--background))" }}
    >
      <LeftColumn />
      <div className="flex-1 flex flex-col min-w-0">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <main id="main-content" className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      {/* Mobile overlay bell: zero layout space, one-tap access */}
      {isMobile && collapsed && (
        <div
          className="fixed z-40 rounded-full border border-border bg-background/90 backdrop-blur md:hidden"
          style={{ right: "12px", top: "max(12px, env(safe-area-inset-top))" }}
        >
          <NotificationsBell />
        </div>
      )}
      <FloatingOpen />
    </div>
  );
}

function HomePage() {
  const { data: dbBooks, isLoading } = trpc.book.list.useQuery();
  const books: BookDisplay[] = dbBooks ? dbBooks.map(toBookDisplay) : [];

  // The library reads best after dark: pin the theme while mounted.
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute("data-theme") ?? "dark";
    root.setAttribute("data-theme", "dark");
    return () => {
      root.setAttribute("data-theme", prev);
    };
  }, []);

  return (
    <div className="min-h-full">
      {isLoading ? (
        <div className="px-4 pt-4 sm:px-6 md:px-10 md:pt-8">
          <BookGridSkeleton count={10} />
        </div>
      ) : (
        <BookList books={books} />
      )}
    </div>
  );
}

function BookPage() {
  return <BookDetail />;
}

function FloatingOpen() {
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();

  if (!collapsed || location.pathname === "/") return null;

  return (
    <button
      onClick={() => setCollapsed(false)}
      className="fixed top-1/2 -translate-y-1/2 z-50 p-2 transition-all duration-300 ease-out hover:opacity-80"
      style={{
        left: "12px",
        backgroundColor: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
      }}
      title="Open sidebar"
    >
      <PiCaretRight size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
    </button>
  );
}

function AuthSplash() {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        height: "100vh",
        backgroundColor: "hsl(var(--background))",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <span className="font-serif text-[26px] tracking-tight text-foreground">
          ToxicReads
        </span>
        <span
          className="inline-block w-5 h-5 border-2 border-border border-t-foreground rounded-full animate-spin"
          aria-label="Loading"
        />
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthLoading } = useAuth();

  // Block first paint only while the initial auth.me is in flight. React Query's
  // `isLoading` is true solely on the first fetch (no cached data), so background
  // refetches never re-trigger the splash and the sidebar never flashes the
  // wrong Login/Logout button.
  if (isAuthLoading) {
    return <AuthSplash />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<AppShell />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/book/:slug" element={<BookPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="/submit-book" element={<SubmitBook />} />
              <Route path="/my-purchases" element={<MyPurchases />} />
              <Route path="/my-submissions" element={<MySubmissions />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/author/:slug" element={<AuthorProfile />} />
              <Route path="/wishlist" element={<WishlistPage />} />
            </Route>
            <Route path="/read/:id" element={<Reader />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
          <AppToaster />
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
