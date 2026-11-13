import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PiWarningCircle } from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import AuthShell from "@/components/AuthShell";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/home");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/home");
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Enter both your username and password.");
      return;
    }
    loginMutation.mutate({
      username: username.trim(),
      password: password.trim(),
    });
  };

  return (
    <AuthShell
      backHref="/"
      eyebrow="Reader sign in"
      title="Welcome back"
      sub="Sign in to access your library and bookmarks."
      switchText="New to ToxicReads?"
      switchLabel="Create an account"
      switchHref="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-username" className="field-label mb-1.5">
            Username
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="Your username"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="field-label mb-1.5">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Your password"
            className="field-input"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="form-note form-note--alert flex items-start gap-2.5 text-sm"
          >
            <PiWarningCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
