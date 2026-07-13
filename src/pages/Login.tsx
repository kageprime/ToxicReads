import { useState } from "react";
import { useNavigate } from "react-router";
import { PiCaretLeft } from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      window.location.href = "/home";
    },
    onError: err => {
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
    if (!username.trim() || !password.trim()) return;
    loginMutation.mutate({
      username: username.trim(),
      password: password.trim(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center h-14 px-4 border-b border-border">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <PiCaretLeft size={16} />
          Back
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-none">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-center mb-2">
            Sign in
          </p>
          <h1 className="font-serif text-3xl text-foreground tracking-tight text-center">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-1.5">
            Log in to keep reading.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.05em] text-muted-foreground mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                className="field-input"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.05em] text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="field-input"
              />
            </div>

            {error && <p className="text-sm text-p-red-fg">{error}</p>}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-[#333333] active:scale-[0.98] transition disabled:opacity-70"
            >
              {loginMutation.isPending ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
            Default account — admin / 123456
          </p>

          <p className="text-sm text-muted-foreground text-center mt-3">
            New here?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-foreground font-medium hover:underline underline-offset-4"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
