import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router";
import BookList from "./components/BookList";
import LeftColumn from "./components/LeftColumn";
import BookDetail from "./components/BookDetail";
import BottomNav from "./components/BottomNav";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { trpc } from "@/providers/trpc";
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
import Landing from "./pages/Landing";
import { PiList, PiSun, PiMoon, PiCaretRight } from "react-icons/pi";

function ToggleBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded hover:bg-accent transition-colors"
      title={theme === "light" ? "Dark mode" : "Light mode"}
    >
      {theme === "light" ? (
        <PiMoon size={16} style={{ color: "var(--foreground)" }} />
      ) : (
        <PiSun size={16} style={{ color: "var(--foreground)" }} />
      )}
    </button>
  );
}

function TopBar() {
  const { isMobile, setCollapsed } = useSidebar();
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-12 px-4 bg-background border-b border-border">
      <div className="flex items-center gap-1">
        {isMobile && (
          <button
            onClick={() => setCollapsed(false)}
            className="h-9 w-9 -ml-2 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <PiList size={18} style={{ color: "var(--foreground)" }} />
          </button>
        )}
      </div>
      <ToggleBar />
    </header>
  );
}

function AppShell() {
  const location = useLocation();
  const { isMobile, setCollapsed } = useSidebar();

  // Always collapse the overlay when navigating on mobile
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [location.pathname, isMobile, setCollapsed]);

  return (
    <div
      className="flex"
      style={{ height: "100vh", backgroundColor: "var(--background)" }}
    >
      <LeftColumn />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <FloatingOpen />
    </div>
  );
}

function HomePage() {
  const { data: dbBooks, isLoading } = trpc.book.list.useQuery();
  const books: BookDisplay[] = dbBooks ? dbBooks.map(toBookDisplay) : [];

  return (
    <div className="min-h-full">
      {isLoading ? (
        <div
          className="flex items-center justify-center"
          style={{ paddingTop: "40vh" }}
        >
          <p style={{ fontSize: "18px", color: "var(--muted-foreground)" }}>
            LOADING...
          </p>
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
  const { collapsed, setCollapsed, isMobile } = useSidebar();

  if (!collapsed || location.pathname === "/" || isMobile) return null;

  return (
    <button
      onClick={() => setCollapsed(false)}
      className="fixed top-1/2 -translate-y-1/2 z-50 p-2 transition-all duration-300 ease-out hover:opacity-80"
      style={{
        left: "12px",
        backgroundColor: "var(--background)",
        border: "1px solid var(--border)",
      }}
      title="Open sidebar"
    >
      <PiCaretRight size={16} style={{ color: "var(--muted-foreground)" }} />
    </button>
  );
}

export default function App() {
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
              <Route path="/book/:id" element={<BookPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="/submit-book" element={<SubmitBook />} />
              <Route path="/my-purchases" element={<MyPurchases />} />
              <Route path="/my-submissions" element={<MySubmissions />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route path="/read/:id" element={<Reader />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
