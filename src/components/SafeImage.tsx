import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function SafeImage({ src, alt, className, style }: SafeImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%", ...style }} className={className}>
      {!loaded && !error && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--border-light)",
        }}>
          <div style={{
            width: 24, height: 24,
            border: "2px solid var(--border-light)",
            borderTopColor: "var(--text-charcoal)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
      )}
      {error ? (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--border-light)",
          fontSize: "9px", color: "var(--text-grey)",
          fontFamily: "'Space Mono', monospace",
          letterSpacing: "0.05em",
        }}>
          NO IMAGE
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            opacity: loaded ? 1 : 0, transition: "opacity 0.3s",
          }}
          loading="lazy"
        />
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
