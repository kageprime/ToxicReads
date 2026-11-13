import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router";
import BookList from "./components/BookList";
import LeftColumn from "./components/LeftColumn";
import BookDetail from "./components/BookDetail";
import BottomNav from "./components/BottomNav";
import NotificationsBell from "./components/NotificationsBell";
import BrandMark from "./components/BrandMark";
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
import { PiList } from "react-icons/pi";
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
    <div className="flex h-dvh bg-background text-foreground overflow-hidden">
      <LeftColumn />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        {/* Mobile utility bar triggers (drawer + notifications) */}
        {isMobile && collapsed && (
          <div className="fixed top-[max(12px,env(safe-area-inset-top))] inset-x-3 z-30 flex items-center justify-between pointer-events-none md:hidden">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Open menu"
              className="pointer-events-auto h-9 w-9 rounded-full border border-border bg-background/90 backdrop-blur-md flex items-center justify-center text-foreground shadow-xs hover:bg-secondary transition-colors"
            >
              <PiList className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="pointer-events-auto">
              <NotificationsBell />
            </div>
          </div>
        )}

        <main
          id="main-content"
          className="flex-1 overflow-y-auto pb-20 md:pb-10"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function HomePage() {
  const { data: dbBooks, isLoading } = trpc.book.list.useQuery();
  const books: BookDisplay[] = dbBooks ? dbBooks.map(toBookDisplay) : [];

  return (
    <div className="min-h-full">
      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 pt-14 sm:px-6 lg:px-8 md:pt-8 pb-12">
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

function AuthSplash() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <BrandMark to={null} />
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
