import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { ChevronRight, BookOpen, ShoppingBag, Send, Moon, Sun } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useState, useEffect } from "react";

function LandingContent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [featuredBooks, setFeaturedBooks] = useState<Array<{id: number, title: string, author: string, coverImage: string, price: string}>>([]);

  const { data: books } = trpc.book.list.useQuery();

  useEffect(() => {
    if (books && books.length > 0) {
      setFeaturedBooks(books.slice(0, 4));
    }
  }, [books]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      <header 
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 z-50"
        style={{ 
          height: "48px", 
          backgroundColor: "var(--bg-warm-white)", 
          borderBottom: "1px solid var(--border-light)" 
        }}
      >
        <button 
          onClick={() => navigate("/")}
          className="text-xs font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity"
        >
          TOXICREADS
        </button>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate("/home")}
                style={{
                  fontSize: "10px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-charcoal)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                  letterSpacing: "0.05em",
                }}
              >
                BROWSE
              </button>
              <button
                onClick={() => navigate("/my-purchases")}
                style={{
                  fontSize: "10px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-charcoal)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                  letterSpacing: "0.05em",
                }}
              >
                MY BOOKS
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  fontSize: "10px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-charcoal)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                  letterSpacing: "0.05em",
                }}
              >
                LOG IN
              </button>
            </>
          )}
          <button
            onClick={toggleTheme}
            style={{
              fontSize: "10px",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-charcoal)",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.2s ease",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {theme === "light" ? <Moon size={12} /> : <Sun size={12} />}
            {theme === "light" ? "DARK" : "LIGHT"}
          </button>
        </div>
      </header>

      <main style={{ paddingTop: "48px" }}>
        {/* Hero Section */}
        <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-2xl">
            <p style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em", color: "var(--text-grey)", marginBottom: "16px" }}>
              A MARKETPLACE FOR THE UNCONVENTIONAL
            </p>
            <h1 style={{ fontSize: "clamp(40px, 10vw, 96px)", fontWeight: 400, letterSpacing: "-0.02em", color: "var(--text-charcoal)", marginBottom: "8px", lineHeight: 0.95 }}>
              TOXIC
              <br />
              READS
            </h1>
            
            <p style={{ fontSize: "14px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", lineHeight: 1.8, marginTop: "24px", marginBottom: "40px", maxWidth: "440px", margin: "24px auto 40px" }}>
              Buy and sell unique books directly from readers.
              Every purchase unlocks exclusive reading content you can enjoy right in your browser.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/home")}
                style={{
                  padding: "14px 32px",
                  fontSize: "11px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--bg-warm-white)",
                  background: "var(--text-charcoal)",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.1em",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = "0.8"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}
              >
                BROWSE BOOKS
              </button>
              
              <button
                onClick={() => navigate(isAuthenticated ? "/submit-book" : "/register")}
                style={{
                  padding: "14px 32px",
                  fontSize: "11px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-charcoal)",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                  letterSpacing: "0.1em",
                  transition: "border-color 0.2s ease",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "var(--text-charcoal)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-light)"; }}
              >
                {isAuthenticated ? "SELL A BOOK" : "CREATE ACCOUNT"}
              </button>
            </div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <p style={{ fontSize: "9px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em" }}>
              SCROLL TO EXPLORE
            </p>
            <ChevronRight size={14} style={{ color: "var(--text-grey)", transform: "rotate(90deg)", marginTop: "8px" }} />
          </div>
        </section>

        {/* Featured Books */}
        {featuredBooks.length > 0 && (
          <section className="py-20 px-6" style={{ borderTop: "1px solid var(--border-light)" }}>
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", color: "var(--text-grey)" }}>
                  FEATURED BOOKS
                </h2>
                <button 
                  onClick={() => navigate("/home")}
                  style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}
                >
                  VIEW ALL →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {featuredBooks.map((book) => (
                  <div 
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="cursor-pointer group"
                  >
                    <div style={{ border: "1px solid var(--border-light)", aspectRatio: "3/4", marginBottom: "12px", overflow: "hidden", transition: "border-color 0.2s" }} className="group-hover:border-charcoal">
                      <img 
                        src={book.coverImage} 
                        alt={book.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                        className="group-hover:scale-105"
                      />
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-charcoal)", fontWeight: 400, marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {book.title}
                    </p>
                    <p style={{ fontSize: "10px", color: "var(--text-grey)", marginBottom: "4px" }}>
                      {book.author}
                    </p>
                    <p style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)" }}>
                      ${book.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-24 px-6" style={{ borderTop: "1px solid var(--border-light)", backgroundColor: "rgba(0,0,0,0.015)" }}>
          <div className="max-w-4xl mx-auto">
            <h2 style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", color: "var(--text-grey)", marginBottom: "48px", textAlign: "center" }}>
              HOW IT WORKS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                { 
                  icon: <BookOpen size={20} />,
                  num: "01", 
                  title: "Browse", 
                  desc: "Explore our curated collection of books. Filter by category, condition, or search for specific titles and authors." 
                },
                { 
                  icon: <ShoppingBag size={20} />,
                  num: "02", 
                  title: "Purchase", 
                  desc: "Buy books instantly with secure checkout. Each purchase includes access to exclusive reading content." 
                },
                { 
                  icon: <Send size={20} />,
                  num: "03", 
                  title: "Submit", 
                  desc: "Have books to sell? Submit your own listings for review. Once approved, they appear in our marketplace." 
                },
              ].map((step) => (
                <div key={step.num} className="text-center md:text-left">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "28px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", opacity: 0.2 }}>
                      {step.num}
                    </span>
                    <div style={{ color: "var(--text-charcoal)" }}>
                      {step.icon}
                    </div>
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "8px" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-grey)", lineHeight: 1.7 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reading Experience */}
        <section className="py-24 px-6" style={{ borderTop: "1px solid var(--border-light)" }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", color: "var(--text-grey)", marginBottom: "16px" }}>
                  READ ANYWHERE
                </h2>
                <p style={{ fontSize: "15px", color: "var(--text-charcoal)", lineHeight: 1.7, marginBottom: "16px" }}>
                  Once you purchase a book, read it directly in your browser with our built-in reader.
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-grey)", lineHeight: 1.7, marginBottom: "24px" }}>
                  Customize your reading experience with adjustable font sizes and theme options.
                  Your progress is saved automatically as you read.
                </p>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "4px", alignItems: "baseline" }}>
                    {["A", "A", "A"].map((_, idx) => (
                      <span 
                        key={idx}
                        style={{ 
                          fontSize: `${10 + idx * 6}px`,
                          fontFamily: "'Space Mono', monospace",
                          color: "var(--text-grey)",
                        }}
                      >
                        A
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>
                    |
                  </span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <div style={{ width: "16px", height: "16px", border: "1px solid var(--border-light)" }}></div>
                    <div style={{ width: "16px", height: "16px", border: "1px solid var(--border-light)", backgroundColor: "var(--text-charcoal)" }}></div>
                  </div>
                </div>
              </div>
              <div style={{ border: "1px solid var(--border-light)", padding: "32px", textAlign: "center" }}>
                <p style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)", marginBottom: "24px", letterSpacing: "0.1em" }}>
                  READER PREVIEW
                </p>
                <p style={{ fontSize: "18px", color: "var(--text-charcoal)", lineHeight: 2, fontStyle: "italic", marginBottom: "16px" }}>
                  "The quick brown fox jumps over the lazy dog."
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-grey)" }}>
                  Adjustable font sizes · Light/Dark themes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-24 px-6" style={{ borderTop: "1px solid var(--border-light)", backgroundColor: "rgba(0,0,0,0.015)" }}>
          <div className="max-w-4xl mx-auto">
            <h2 style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", color: "var(--text-grey)", marginBottom: "32px", textAlign: "center" }}>
              BROWSE BY CATEGORY
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {["Fiction", "Non-Fiction", "Sci-Fi", "Design", "Psychology", "History", "Philosophy", "Art", "Technology", "Poetry"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => navigate("/home")}
                  style={{
                    padding: "10px 20px",
                    fontSize: "11px",
                    fontFamily: "'Space Mono', monospace",
                    color: "var(--text-charcoal)",
                    background: "transparent",
                    border: "1px solid var(--border-light)",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { 
                    (e.target as HTMLElement).style.backgroundColor = "var(--text-charcoal)"; 
                    (e.target as HTMLElement).style.color = "var(--bg-warm-white)"; 
                  }}
                  onMouseLeave={(e) => { 
                    (e.target as HTMLElement).style.backgroundColor = "transparent"; 
                    (e.target as HTMLElement).style.color = "var(--text-charcoal)"; 
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6" style={{ borderTop: "1px solid var(--border-light)" }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", color: "var(--text-grey)", marginBottom: "16px" }}>
              {isAuthenticated ? "READY TO START READING?" : "JOIN TOXICREADS"}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-charcoal)", lineHeight: 1.7, marginBottom: "32px" }}>
              {isAuthenticated 
                ? "Continue exploring our collection and discover your next favorite book."
                : "Create a free account to start browsing, buying, and selling books today."}
            </p>
            <button
              onClick={() => navigate(isAuthenticated ? "/home" : "/register")}
              style={{
                padding: "14px 40px",
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                color: "var(--bg-warm-white)",
                background: "var(--text-charcoal)",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.1em",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = "0.8"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}
            >
              {isAuthenticated ? "BROWSE NOW" : "GET STARTED"}
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-6" style={{ borderTop: "1px solid var(--border-light)", backgroundColor: "rgba(0,0,0,0.015)" }}>
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
            {[
              { value: books?.length || "—", label: "Books Available" },
              { value: "100%", label: "Digital Access" },
              { value: "24/7", label: "Reading Time" },
            ].map((stat) => (
              <div key={stat.label}>
                <p style={{ fontSize: "28px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", marginBottom: "4px" }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)", letterSpacing: "0.1em" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-8 px-6" style={{ borderTop: "1px solid var(--border-light)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)", letterSpacing: "0.1em" }}>
            TOXICREADS
          </span>
          <div style={{ display: "flex", gap: "16px" }}>
            <button onClick={() => navigate("/home")} style={{ fontSize: "10px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer" }}>Browse</button>
            <button onClick={() => navigate(isAuthenticated ? "/submit-book" : "/register")} style={{ fontSize: "10px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer" }}>Sell</button>
            {isAuthenticated && (
              <button onClick={() => navigate("/my-purchases")} style={{ fontSize: "10px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer" }}>My Books</button>
            )}
          </div>
          <span style={{ fontSize: "10px", color: "var(--text-grey)" }}>
            2025
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function Landing() {
  return (
    <ThemeProvider>
      <LandingContent />
    </ThemeProvider>
  );
}