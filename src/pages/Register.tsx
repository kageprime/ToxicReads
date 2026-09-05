import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PiWarningCircle } from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import AuthShell from "@/components/AuthShell";

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

  useEffect(() => {
    if (isAuthenticated) navigate("/home");
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

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
    <AuthShell
      backHref="/login"
      eyebrow="Create account"
      title="Join the story"
      sub="Buy, read, and publish African speculative fiction."
      switchText="Already have an account?"
      switchLabel="Log in"
      switchHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="reg-username"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Username
          </label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            className="field-input"
          />
        </div>

        <div>
          <label
            htmlFor="reg-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Display name{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            className="field-input"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reg-password"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              className="field-input"
            />
          </div>

          <div>
            <label
              htmlFor="reg-confirm"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Confirm
            </label>
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="field-input"
            />
          </div>
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
          disabled={registerMutation.isPending}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
        >
          {registerMutation.isPending ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </AuthShell>
  );
}
