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
    <div className="space-y-1.5">
      <label className="field-label">
        {label}
        {required && (
          <span className="ml-1 text-signal" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div>{children}</div>
      {hint && <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>}
    </div>
  );
}
