import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { PiCaretLeft } from "react-icons/pi";

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

/** Split editorial auth layout: cover panel + form. */
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
  return (
    <div className="flex min-h-dvh bg-background">
      {/* Cover panel */}
      <div className="relative hidden w-[44%] shrink-0 overflow-hidden lg:block">
        <img
          src="/images/terrazites-hero.jpeg"
          alt="Cover art for The Terrazites of Akarfia"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute inset-x-0 top-0 flex items-center p-6">
          <button
            onClick={() => navigate("/")}
            className="font-serif text-2xl tracking-tight text-[#F7F6F3]"
          >
            Toxic<span className="opacity-60">Reads</span>
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-8">
          <p className="max-w-sm font-display text-3xl italic leading-snug text-[#F7F6F3]">
            “Nothing is really a coincidence in this life.”
          </p>
          <p className="tnum mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#F7F6F3]/70">
            The Terrazites of Akarfia — live now
          </p>
        </div>
      </div>

      {/* Form column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center px-4">
          <button
            onClick={() => navigate(backHref)}
            className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <PiCaretLeft size={16} />
            Back
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm animate-fade-up">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="text-balance font-serif text-4xl tracking-tight text-baobab">
              {title}
            </h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground">{sub}</p>
            <div className="mt-7">{children}</div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {switchText}{" "}
              <button
                onClick={() => navigate(switchHref)}
                className="font-medium text-foreground underline-offset-4 hover:underline"
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
