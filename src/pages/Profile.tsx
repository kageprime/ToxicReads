import { useState } from "react";
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

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [location, setLocation] = useState(user?.location || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateMutation = trpc.auth.updateCredentials.useMutation({
    onSuccess: () => {
      setSuccess("Profile updated");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      utils.auth.me.invalidate();
    },
    onError: err => {
      setError(err.message);
      setSuccess("");
    },
  });

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleSubmit = () => {
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    const changedName = name !== (user?.name || "");
    const changedUsername = username !== user?.username;
    const changedPassword = newPassword.length > 0;
    const changedLocation = location !== (user?.location || "");
    if (!changedName && !changedUsername && !changedPassword && !changedLocation) {
      setError("No changes to save");
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
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="mx-auto measure" style={{ padding: "40px 24px 96px" }}>
        <div className="grid md:grid-cols-[280px_1fr] gap-12">
          <aside className="md:sticky md:top-24 self-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Settings
            </p>
            <h1 className="font-serif text-foreground mb-6" style={{ fontSize: "42px", lineHeight: 1.04, letterSpacing: "-0.02em", fontWeight: 400 }}>
              Account
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center rounded-full" style={{ width: "52px", height: "52px", border: "1px solid hsl(var(--border))", fontFamily: '"Newsreader", Georgia, serif', fontSize: "24px", color: "hsl(var(--foreground))", flexShrink: 0 }}>
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate" style={{ fontSize: "16px" }}>{user?.name || user?.username}</p>
                <p className="font-mono uppercase text-muted-foreground truncate" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>{user?.role || "user"}</p>
              </div>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: "14px", lineHeight: 1.6 }}>
              Update your display name, username, location, or password.
            </p>
          </aside>

          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Display Name">
                <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </Field>
              <Field label="Username">
                <input className="field-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
              </Field>
            </div>

            <Field label="Location (State)">
              <select className="field-input" value={location} onChange={e => setLocation(e.target.value)}>
                <option value="">Select your state</option>
                {NIGERIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            <div className="pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <p className="font-mono uppercase text-foreground mb-5 mt-6" style={{ fontSize: "12px", letterSpacing: "0.16em" }}>
                Password
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Current Password" required>
                  <input className="field-input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Required to save" />
                </Field>
                <Field label="New Password" hint="Leave blank to keep current">
                  <input className="field-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
                </Field>
              </div>
            </div>

            {error && <p className="text-[14px]" style={{ color: "rgb(var(--color-p-red-fg))" }}>{error}</p>}
            {success && <p className="text-[14px]" style={{ color: "rgb(var(--color-p-green-fg))" }}>{success}</p>}

            <button type="submit" disabled={updateMutation.isPending} className="w-full py-3 bg-primary text-primary-foreground font-mono uppercase tracking-[0.14em] text-[13px] hover:bg-[#333333] active:scale-[0.985] transition disabled:opacity-70">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
