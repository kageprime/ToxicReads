import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Field } from "@/components/Field";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [usernameOverride, setUsernameOverride] = useState<string | null>(null);
  const [locationOverride, setLocationOverride] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const name = nameOverride ?? user?.name ?? "";
  const username = usernameOverride ?? user?.username ?? "";
  const location = locationOverride ?? user?.location ?? "";

  const updateMutation = trpc.auth.updateCredentials.useMutation({
    onSuccess: () => {
      setSuccess("Profile settings saved.");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      setNameOverride(null);
      setUsernameOverride(null);
      setLocationOverride(null);
      utils.auth.me.invalidate();
    },
    onError: (err) => {
      setError(err.message);
      setSuccess("");
    },
  });

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!currentPassword) {
      setError("Enter your current password to confirm changes.");
      return;
    }
    const changedName = name !== (user?.name || "");
    const changedUsername = username !== user?.username;
    const changedPassword = newPassword.length > 0;
    const changedLocation = location !== (user?.location || "");
    if (!changedName && !changedUsername && !changedPassword && !changedLocation) {
      setError("No changes detected.");
      return;
    }
    updateMutation.mutate({
      currentPassword,
      newName: changedName ? name : undefined,
      newUsername: changedUsername ? username : undefined,
      newPassword: changedPassword ? newPassword : undefined,
      newLocation: changedLocation ? location : undefined,
    });
  };

  const initial = (user?.name || user?.username || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-8 pb-20">
        <div className="grid md:grid-cols-[260px_1fr] gap-10 lg:gap-14 items-start">
          {/* Sticky left identity rail */}
          <aside className="md:sticky md:top-8 space-y-4">
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
              Account
            </h1>

            <div className="flex items-center gap-3.5 pt-2">
              <div className="h-12 w-12 rounded-full border border-border bg-card flex items-center justify-center font-serif text-xl font-medium text-foreground shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role || "Reader"} account
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              Update your display name, handle, location, or password. Current password is required for security.
            </p>
          </aside>

          {/* Settings form card */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Display name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setNameOverride(e.target.value)}
                  placeholder="Your name"
                  className="field-input"
                />
              </Field>

              <Field label="Username" required>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsernameOverride(e.target.value)}
                  placeholder="Username"
                  className="field-input"
                />
              </Field>
            </div>

            <Field label="Location" hint="Optional. Shown alongside reader profile activity.">
              <select
                value={location}
                onChange={(e) => setLocationOverride(e.target.value)}
                className="field-input cursor-pointer"
              >
                <option value="">Prefer not to say</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </Field>

            <div className="pt-5 border-t border-border grid sm:grid-cols-2 gap-5">
              <Field label="Current password" required>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required to save changes"
                  autoComplete="current-password"
                  className="field-input"
                />
              </Field>

              <Field label="New password" hint="Leave blank to keep your current password.">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="field-input"
                />
              </Field>
            </div>

            {error && (
              <div role="alert" className="form-note form-note--alert text-sm">
                {error}
              </div>
            )}

            {success && (
              <div role="status" className="form-note form-note--ok text-sm">
                {success}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-full bg-primary text-primary-foreground px-7 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
