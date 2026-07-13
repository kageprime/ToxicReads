import type { ReactNode } from "react";

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="field-label mb-1.5">
        {label}
        {required && (
          <span style={{ color: "rgb(var(--color-p-red-fg))" }}> *</span>
        )}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-[13px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
