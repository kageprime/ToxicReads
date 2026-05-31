import { Routes, Route, useLocation } from "react-router";
import LeftColumn from "./components/LeftColumn";
import BookList from "./components/BookList";
import RightColumn from "./components/RightColumn";
import BookDetail from "./components/BookDetail";
import BottomNav from "./components/BottomNav";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";
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

function ToggleBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded hover:bg-gray-100 transition-colors"
      title={theme === "light" ? "Dark mode" : "Light mode"}
    >
      {theme === "light" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-charcoal)" }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-charcoal)" }}>
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )}
    </button>
  );
}

function HomePage() {
  const { data: dbBooks, isLoading } = trpc.book.list.useQuery();
  const books: BookDisplay[] = dbBooks ? dbBooks.map(toBookDisplay) : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      <header 
        className="flex items-center justify-between px-4 sm:px-6 z-50" 
        style={{ height: "40px", position: "fixed", top: 0, left: 0, right: 0, backgroundColor: "var(--bg-warm-white)", borderBottom: "1px solid var(--border-light)" }}
      >
        <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-charcoal)" }}>
          TOXICREADS
        </span>
        <ToggleBar />
      </header>

      <div className="flex" style={{ height: "100vh", paddingTop: "40px" }}>
        <LeftColumn />
        <main className="flex-1 overflow-y-auto ml-0 md:ml-[240px]" style={{ borderRight: "1px solid var(--border-light)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center" style={{ paddingTop: "40vh" }}>
              <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>LOADING...</p>
            </div>
          ) : (
            <BookList books={books} />
          )}
        </main>
        <RightColumn />
      </div>
    </div>
  );
}

function BookPage() {
  return (
    <div style={{ height: "100vh", backgroundColor: "var(--bg-warm-white)" }}>
      <header 
        className="flex items-center justify-between px-6 z-50" 
        style={{ height: "48px", position: "fixed", top: 0, left: 0, right: 0, backgroundColor: "var(--bg-warm-white)", borderBottom: "1px solid var(--border-light)" }}
      >
        <button 
          onClick={() => window.history.back()}
          className="text-xs font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity"
        >
          TOXICREADS
        </button>
        <ToggleBar />
      </header>
      <div className="flex" style={{ height: "100vh", paddingTop: "48px" }}>
        <div className="flex-1 overflow-y-auto">
          <BookDetail />
        </div>
        <RightColumn />
      </div>
    </div>
  );
}

function FloatingOpen() {
  const location = useLocation();
  const { collapsed, setCollapsed, isMobile } = useSidebar();

  if (!collapsed || location.pathname === "/") return null;

  return (
    <button
      onClick={() => setCollapsed(false)}
      className="fixed z-50 p-2 transition-all duration-300 ease-out hover:opacity-80"
      style={{
        right: "12px",
        [isMobile ? "bottom" : "top"]: isMobile ? "calc(80px + env(safe-area-inset-bottom, 0px))" : "50%",
        transform: isMobile ? "none" : "translateY(-50%)",
        backgroundColor: "var(--bg-warm-white)",
        border: "1px solid var(--border-light)",
      }}
      title="Open sidebar"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-grey)" }}>
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/book/:id" element={<BookPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-book" element={<AddBook />} />
          <Route path="/submit-book" element={<SubmitBook />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route path="/my-submissions" element={<MySubmissions />} />
          <Route path="/read/:id" element={<Reader />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FloatingOpen />
        <BottomNav />
      </SidebarProvider>
    </ThemeProvider>
  );
}