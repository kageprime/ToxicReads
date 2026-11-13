import { useRef, useState } from "react";
import { toast } from "sonner";
import { PiImage, PiUploadSimple, PiX, PiLinkSimple } from "react-icons/pi";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Retained for caller compatibility; inherits theme tokens automatically. */
  variant?: "dark" | "light";
}

export default function ImageUpload({
  value,
  onChange,
  label = "Cover image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover image must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const resp = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.url) {
        onChange(data.url);
        toast.success("Cover image uploaded");
      } else {
        toast.error(data.error || "Failed to upload cover image.");
      }
    } catch {
      toast.error("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="field-label">{label}</span>
        <button
          type="button"
          onClick={() => setShowUrlInput((s) => !s)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <PiLinkSimple className="h-3.5 w-3.5" aria-hidden="true" />
          {showUrlInput ? "Upload file instead" : "Use image URL"}
        </button>
      </div>

      {value ? (
        <div className="relative rounded-xl border border-border bg-secondary/40 p-3 flex items-center gap-4">
          <div className="w-16 aspect-[2/3] rounded-sm overflow-hidden bg-secondary cover-frame shrink-0">
            <img
              src={value}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Cover ready
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
              {value}
            </p>
            <div className="flex items-center gap-3 mt-2.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs font-medium text-foreground hover:text-signal transition-colors"
              >
                Replace file
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                <PiX className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          disabled={uploading}
          className={`w-full rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
            dragOver
              ? "border-foreground bg-secondary/80"
              : "border-input bg-card hover:bg-secondary/40"
          }`}
        >
          <div className="mx-auto mb-2.5 h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
            {uploading ? (
              <PiUploadSimple className="h-5 w-5 animate-pulse" aria-hidden="true" />
            ) : (
              <PiImage className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <p className="text-sm font-medium text-foreground">
            {uploading ? "Uploading cover..." : "Click or drop a book cover"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, or WebP up to 5 MB (portrait 2:3 recommended)
          </p>
        </button>
      )}

      {showUrlInput && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/cover.jpg"
          className="field-input"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
