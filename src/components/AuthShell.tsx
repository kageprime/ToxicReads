import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { PiCaretLeft, PiMoon, PiSun } from "react-icons/pi";
import { useTheme } from "@/contexts/ThemeContext";
import { PressColophon } from "./BrandMark";

interface AuthShellProps {
  backHref: string;
  eyebrow: string;
  title: string;
  sub: string;
  children: ReactNode;
  switchText: string;
  switchLabel: string;
  switchHref: string;
}

/** Split editorial auth layout: studio press photography panel + form column. */
export default function AuthShell({
  backHref,
  eyebrow,
  title,
  sub,
  children,
  switchText,
  switchLabel,
  switchHref,
}: AuthShellProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Studio backdrop panel */}
      <div className="relative hidden w-[44%] shrink-0 overflow-hidden bg-[#141413] lg:block">
        <img
          src="/images/press-desk.jpg"
          alt="Open hardcover book and manuscript proofs on an editorial desk"
          className="absolute inset-0 h-full w-full object-cover opacity-85"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,18,17,0.45) 0%, rgba(18,18,17,0.18) 45%, rgba(18,18,17,0.82) 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 flex items-center p-7">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-[#F7F7F4] hover:opacity-85 transition-opacity"
          >
            <PressColophon className="h-5 w-5" />
            <span className="font-serif text-xl font-semibold tracking-tight">
              ToxicReads
            </span>
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-8 space-y-2.5">
          <p className="max-w-sm font-serif text-2xl leading-snug text-[#F7F7F4]">
            Independent African science fiction, horror, and psychological thrillers.
          </p>
          <p className="text-xs text-[#F7F7F4]/75">
            Direct from writers in naira. Read in your browser or listen on the go.
          </p>
        </div>
      </div>

      {/* Form column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(backHref)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <PiCaretLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="h-9 w-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {theme === "dark" ? (
              <PiSun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PiMoon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <div className="w-full max-w-sm animate-fade-up">
            <p className="mb-1.5 text-xs font-medium text-signal">
              {eyebrow}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground text-balance">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
              {sub}
            </p>
            <div className="mt-7">{children}</div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {switchText}{" "}
              <button
                type="button"
                onClick={() => navigate(switchHref)}
                className="font-medium text-foreground underline underline-offset-4 hover:text-signal transition-colors"
              >
                {switchLabel}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
