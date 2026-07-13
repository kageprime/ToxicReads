import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4"
        >
          Error 404
        </p>
        <h1
          className="font-serif font-normal text-foreground mb-3"
          style={{ fontSize: "72px", lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          Not Found
        </h1>
        <p className="text-muted-foreground mb-8" style={{ fontSize: "17px" }}>
          The page you are looking for does not exist.
        </p>
        <Button asChild className="w-full">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
