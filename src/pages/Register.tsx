import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      window.location.href = "/home";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  if (isAuthenticated) {
    navigate("/home");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    registerMutation.mutate({
      username: username.trim(),
      password: password.trim(),
      name: name.trim() || undefined,
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--bg-warm-white)" }}
    >
      <header 
        className="fixed top-0 left-0 right-0 flex items-center px-4"
        style={{ height: "48px", borderBottom: "1px solid var(--border-light)" }}
      >
        <button 
          onClick={() => navigate("/login")}
          className="flex items-center gap-1 text-xs font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      </header>

      <div
        className="w-full max-w-sm mx-4"
        style={{
          border: "1px solid var(--border-light)",
          padding: "32px",
        }}
      >
        <h2
          style={{
            fontSize: "14px",
            fontWeight: 400,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--text-charcoal)",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              style={{
                fontSize: "11px",
                color: "var(--text-grey)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid var(--border-light)",
                padding: "10px 12px",
                fontSize: "12px",
                color: "var(--text-charcoal)",
                fontFamily: "'VT323', monospace",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "11px",
                color: "var(--text-grey)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Display Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid var(--border-light)",
                padding: "10px 12px",
                fontSize: "12px",
                color: "var(--text-charcoal)",
                fontFamily: "'VT323', monospace",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "11px",
                color: "var(--text-grey)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid var(--border-light)",
                padding: "10px 12px",
                fontSize: "12px",
                color: "var(--text-charcoal)",
                fontFamily: "'VT323', monospace",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "11px",
                color: "var(--text-grey)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid var(--border-light)",
                padding: "10px 12px",
                fontSize: "12px",
                color: "var(--text-charcoal)",
                fontFamily: "'VT323', monospace",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: "11px", color: "#E74C3C" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "12px",
              fontFamily: "'VT323', monospace",
              color: "var(--bg-warm-white)",
              background: "var(--text-charcoal)",
              border: "none",
              cursor: registerMutation.isPending ? "wait" : "pointer",
              opacity: registerMutation.isPending ? 0.7 : 1,
              letterSpacing: "0.05em",
            }}
          >
            {registerMutation.isPending ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p
          style={{
            fontSize: "11px",
            color: "var(--text-grey)",
            marginTop: "16px",
            textAlign: "center",
            fontFamily: "'VT323', monospace",
          }}
        >
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            style={{
              color: "var(--text-charcoal)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}