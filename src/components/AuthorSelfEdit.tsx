import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";

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
    setForm((f) => ({ ...f, [k]: value }));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3.5 p-4 text-left transition-colors hover:bg-secondary/45"
      >
        <div className="h-11 w-11 rounded-full border border-border bg-secondary overflow-hidden flex items-center justify-center shrink-0">
          {form.avatar || author.avatar ? (
            <img
              src={form.avatar || author.avatar || ""}
              alt={author.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-serif text-lg font-medium text-foreground">
              {author.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-medium text-foreground truncate">
            {author.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {author.bio ? "Public profile live" : "Add a bio and social links"}
          </p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground shrink-0">
          {open ? (
            <>
              Close <PiCaretUp className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          ) : (
            <>
              Edit <PiCaretDown className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          )}
        </span>
      </button>

      {open && (
        <div className="border-t border-border p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label mb-1.5">Location</label>
              <input
                type="text"
                className="field-input"
                placeholder="Lagos, Nigeria"
                value={form.location}
                onChange={(e) => set("location")(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label mb-1.5">Avatar URL</label>
              <input
                type="url"
                className="field-input"
                placeholder="https://example.com/photo.jpg"
                value={form.avatar}
                onChange={(e) => set("avatar")(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="field-label mb-1.5">Author bio</label>
            <textarea
              rows={3}
              className="field-input"
              placeholder="Write a brief biography for readers..."
              value={form.bio}
              onChange={(e) => set("bio")(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label mb-1.5">Dedication quote</label>
            <input
              type="text"
              className="field-input"
              placeholder="Optional epigraph or dedication shown in italics"
              value={form.dedication}
              onChange={(e) => set("dedication")(e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label mb-1.5">Website</label>
              <input
                type="text"
                className="field-input"
                placeholder="author.com"
                value={form.website}
                onChange={(e) => set("website")(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label mb-1.5">X / Twitter</label>
              <input
                type="text"
                className="field-input"
                placeholder="@handle"
                value={form.twitter}
                onChange={(e) => set("twitter")(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label mb-1.5">Instagram</label>
              <input
                type="text"
                className="field-input"
                placeholder="@handle"
                value={form.instagram}
                onChange={(e) => set("instagram")(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate({ id: author.id, ...form })}
              className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saveMutation.isPending ? "Saving..." : "Save profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
