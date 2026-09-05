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
    onError: err => {
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
    if (!username.trim() || !password.trim()) return;
    loginMutation.mutate({
      username: username.trim(),
      password: password.trim(),
    });
  };

  return (
    <AuthShell
      backHref="/"
      eyebrow="Sign in"
      title="Welcome back"
      sub="Log in to keep reading."
      switchText="New here?"
      switchLabel="Create an account"
      switchHref="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-username"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Username
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            className="field-input"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            className="field-input"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 border border-p-red-fg bg-p-red px-3 py-2.5 text-sm text-p-red-fg"
          >
            <PiWarningCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
        >
          {loginMutation.isPending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}
