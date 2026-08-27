import { useState } from "react";
import { useNavigate } from "react-router";
import { PiCaretLeft } from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/home");
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
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center h-14 px-4 border-b border-border">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <PiCaretLeft size={16} />
          Back
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-none">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-center mb-2">
            Create account
          </p>
          <h1 className="font-serif text-3xl text-foreground tracking-tight text-center">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-1.5">
            Join to buy, read, and publish.
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
                Display name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
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
                autoComplete="new-password"
                className="field-input"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.05em] text-muted-foreground mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="field-input"
              />
            </div>

            {error && <p className="text-sm text-p-red-fg">{error}</p>}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-[#333333] active:scale-[0.98] transition disabled:opacity-70"
            >
              {registerMutation.isPending ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-foreground font-medium hover:underline underline-offset-4"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
