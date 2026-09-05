import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

interface SelfAuthor {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  dedication: string | null;
  avatar: string | null;
  location: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
}

/** Seller self-service author profile editor. */
export default function AuthorSelfEdit({
  author,
  onSaved,
}: {
  author: SelfAuthor;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    bio: author.bio || "",
    dedication: author.dedication || "",
    avatar: author.avatar || "",
    location: author.location || "",
    website: author.website || "",
    twitter: author.twitter || "",
    instagram: author.instagram || "",
  });

  const saveMutation = trpc.author.updateOwn.useMutation({
    onSuccess: () => {
      toast.success("Author profile updated");
      setOpen(false);
      onSaved();
    },
    onError: (err: { message: string }) => {
      toast.error(err.message);
    },
  });

  const set = (k: keyof typeof form) => (value: string) =>
    setForm(f => ({ ...f, [k]: value }));

  return (
    <div
      className="border border-border bg-card"
      style={{ marginBottom: "12px" }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-accent"
      >
        {form.avatar || author.avatar ? (
          <img
            src={form.avatar || author.avatar || ""}
            alt={author.name}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "9999px",
              objectFit: "cover",
              border: "1px solid hsl(var(--border))",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            className="flex items-center justify-center"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "9999px",
              border: "1px solid hsl(var(--border))",
              fontFamily: "var(--font-serif)",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            {author.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] text-foreground">
            {author.name}
          </span>
          <span className="block font-mono text-xs text-muted-foreground">
            /author/{author.slug} · {open ? "close" : "edit profile"}
          </span>
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border p-4">
          <div>
            <label className="field-label mb-1.5" htmlFor={`bio-${author.id}`}>
              Bio
            </label>
            <textarea
              id={`bio-${author.id}`}
              value={form.bio}
              onChange={e => set("bio")(e.target.value)}
              placeholder="Who you are, what you write"
              rows={3}
              maxLength={2000}
              className="field-input"
            />
          </div>
          <div>
            <label
              className="field-label mb-1.5"
              htmlFor={`dedication-${author.id}`}
            >
              Dedication
            </label>
            <input
              id={`dedication-${author.id}`}
              value={form.dedication}
              onChange={e => set("dedication")(e.target.value)}
              placeholder="e.g. Dedicated to freedom fighters"
              maxLength={500}
              className="field-input"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                className="field-label mb-1.5"
                htmlFor={`avatar-${author.id}`}
              >
                Photo URL
              </label>
              <input
                id={`avatar-${author.id}`}
                value={form.avatar}
                onChange={e => set("avatar")(e.target.value)}
                placeholder="https://…"
                className="field-input"
              />
            </div>
            <div>
              <label
                className="field-label mb-1.5"
                htmlFor={`location-${author.id}`}
              >
                Location
              </label>
              <input
                id={`location-${author.id}`}
                value={form.location}
                onChange={e => set("location")(e.target.value)}
                placeholder="City, Country"
                maxLength={120}
                className="field-input"
              />
            </div>
            <div>
              <label
                className="field-label mb-1.5"
                htmlFor={`website-${author.id}`}
              >
                Website
              </label>
              <input
                id={`website-${author.id}`}
                value={form.website}
                onChange={e => set("website")(e.target.value)}
                placeholder="https://…"
                className="field-input"
              />
            </div>
            <div>
              <label
                className="field-label mb-1.5"
                htmlFor={`twitter-${author.id}`}
              >
                X handle
              </label>
              <input
                id={`twitter-${author.id}`}
                value={form.twitter}
                onChange={e => set("twitter")(e.target.value)}
                placeholder="without @"
                maxLength={120}
                className="field-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                className="field-label mb-1.5"
                htmlFor={`instagram-${author.id}`}
              >
                Instagram
              </label>
              <input
                id={`instagram-${author.id}`}
                value={form.instagram}
                onChange={e => set("instagram")(e.target.value)}
                placeholder="without @"
                maxLength={120}
                className="field-input"
              />
            </div>
          </div>
          <button
            onClick={() => saveMutation.mutate({ id: author.id, ...form })}
            disabled={saveMutation.isPending}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {saveMutation.isPending ? "Saving…" : "Save profile"}
          </button>
        </div>
      )}
    </div>
  );
}
