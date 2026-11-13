import { Link } from "react-router";
import BrandMark from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-8">
        <BrandMark to="/" />
      </div>

      <p className="font-mono text-xs text-signal tnum mb-2">404</p>
      <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md text-pretty leading-relaxed">
        The edition or page you are looking for may have moved or been removed from the catalog.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/home"
          className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Browse catalog
        </Link>
        <Link
          to="/"
          className="rounded-full border border-border bg-card text-foreground px-5 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
