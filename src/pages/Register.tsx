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
      setError("Username and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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
      eyebrow="New account"
      title="Create your account"
      sub="Save editions, sync reading progress, and submit manuscripts."
      switchText="Already have an account?"
      switchLabel="Sign in"
      switchHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-username" className="field-label mb-1.5">
            Username
          </label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="Choose a username"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="reg-name" className="field-label mb-1.5">
            Display name{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Your name or pen name"
            className="field-input"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-password" className="field-label mb-1.5">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="reg-confirm" className="field-label mb-1.5">
              Confirm password
            </label>
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Repeat password"
              className="field-input"
            />
          </div>
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
          disabled={registerMutation.isPending}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
