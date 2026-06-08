import { useNavigate } from "react-router";
import ShaderCanvas from "./ShaderCanvas";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  "Fiction", "Non-Fiction", "Sci-Fi", "Design", "Psychology", "History", "Philosophy", "Art", "Technology", "Poetry"
];

export default function LeftColumn() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <aside
      className="hidden md:block"
      style={{
        width: "240px",
        borderRight: "1px solid var(--border-light)",
        height: "100vh",
        position: "fixed",
        top: "40px",
        left: 0,
        overflow: "hidden",
        willChange: "transform",
      }}
    >
      <ShaderCanvas />

      <div
        className="flex flex-col"
        style={{
          mixBlendMode: "difference",
          height: "100vh",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: 400,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              marginBottom: "16px",
              lineHeight: 1.4,
            }}
          >
            TOXICREADS
          </h2>
          <p
            style={{
              fontSize: "11px",
              lineHeight: 1.8,
              color: "#FFFFFF",
            }}
          >
            A community-driven marketplace for pre-loved books. Admins curate the collection, and users can submit their own books for sale after vetting.
          </p>
        </div>

        <div style={{ flex: 1, overflow: "hidden", marginTop: "24px" }}>
          <h3
            style={{
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "12px",
            }}
          >
            CATEGORIES
          </h3>
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <span
                key={cat}
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "3px 8px",
                  fontFamily: "'VT323', monospace",
                  letterSpacing: "0.03em",
                }}
              >
                {cat.toUpperCase()}
              </span>
            ))}
          </div>

          {isAuthenticated && (
            <div className="mt-8">
              <h3
                style={{
                  fontSize: "10px",
                  fontWeight: 400,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "12px",
                }}
              >
                MY ACCOUNT
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/my-purchases")}
                  style={{
                    fontSize: "11px",
                    color: "#FFFFFF",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'VT323', monospace",
                    padding: 0,
                    display: "block",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                  }}
                >
                  MY PURCHASES
                </button>
                <button
                  onClick={() => navigate("/submit-book")}
                  style={{
                    fontSize: "11px",
                    color: "#FFFFFF",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'VT323', monospace",
                    padding: 0,
                    display: "block",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                  }}
                >
                  SELL A BOOK
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "'VT323', monospace" }}>
            &copy; 2026 TOXICREADS
          </p>
        </div>
      </div>
    </aside>
  );
}