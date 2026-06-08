import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
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
    onError: (err) => {
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
    if (!changedName && !changedUsername && !changedPassword) {
      setError("No changes to save");
      return;
    }
    updateMutation.mutate({
      currentPassword,
      newName: changedName ? name : undefined,
      newUsername: changedUsername ? username : undefined,
      newPassword: changedPassword ? newPassword : undefined,
    });
  };

  const inputStyle = {
    width: "100%",
    fontSize: "12px",
    padding: "8px 10px",
    border: "1px solid var(--border-light)",
    outline: "none",
    color: "var(--text-charcoal)",
    fontFamily: "'Space Mono', monospace",
    background: "transparent",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      <header 
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-50"
        style={{ height: "48px", backgroundColor: "var(--bg-warm-white)", borderBottom: "1px solid var(--border-light)" }}
      >
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/home")} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
            <ChevronLeft size={18} style={{ color: "var(--text-charcoal)" }} />
          </button>
          <button onClick={() => navigate("/home")} className="text-xs font-normal tracking-wider uppercase text-charcoal hover:opacity-70 transition-opacity">
            TOXICREADS
          </button>
          <span style={{ fontSize: "11px", color: "var(--text-grey)", marginLeft: "8px" }}>/ Account</span>
        </div>
      </header>

      <div className="mx-auto" style={{ maxWidth: "640px", padding: "64px 24px 80px", animation: "pageIn 0.4s ease-out both" }}>
        <div style={{ border: "1px solid var(--border-light)", padding: "32px", backgroundColor: "var(--bg-warm-white)" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "4px" }}>Account Settings</h1>
          <p style={{ fontSize: "11px", color: "var(--text-grey)", marginBottom: "32px", fontFamily: "'Space Mono', monospace" }}>
            {user?.username}
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Display Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Your name" />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} placeholder="username" />
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "24px" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "16px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Password
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>Current Password *</label>
                  <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" style={inputStyle} placeholder="Required to save changes" />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>New Password</label>
                  <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" style={inputStyle} placeholder="Leave blank to keep current" />
                </div>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: "11px", color: "#E74C3C", fontFamily: "'Space Mono', monospace" }}>{error}</p>
            )}
            {success && (
              <p style={{ fontSize: "11px", color: "#2ECC71", fontFamily: "'Space Mono', monospace" }}>{success}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              style={{
                width: "100%", padding: "14px", fontSize: "12px", fontFamily: "'Space Mono', monospace",
                color: "var(--bg-warm-white)", background: "var(--text-charcoal)", border: "none",
                cursor: updateMutation.isPending ? "wait" : "pointer", opacity: updateMutation.isPending ? 0.7 : 1,
                letterSpacing: "0.05em",
              }}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}