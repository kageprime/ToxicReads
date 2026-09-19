import {
  PiPlayFill,
  PiPauseFill,
  PiStopFill,
  PiCaretLeft,
  PiCaretRight,
  PiX,
  PiHeadphones,
} from "react-icons/pi";

interface ListenBarProps {
  theme: "light" | "dark";
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  currentPara: number;
  totalParas: number;
  rate: number;
  onRateChange: (rate: number) => void;
  voices: SpeechSynthesisVoice[];
  voiceURI: string;
  onVoiceChange: (uri: string) => void;
  onPlay: () => void;
  onPauseResume: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

const RATES = [0.75, 1, 1.25, 1.5, 2];

export default function ListenBar(props: ListenBarProps) {
  const {
    theme,
    isPlaying,
    isPaused,
    isSupported,
    currentPara,
    totalParas,
    rate,
    onRateChange,
    voices,
    voiceURI,
    onVoiceChange,
    onPlay,
    onPauseResume,
    onStop,
    onPrev,
    onNext,
    onClose,
  } = props;

  const dark = theme === "dark";
  const barBg = dark ? "#141414" : "#fff";
  const borderColor = dark ? "#333" : "#e8e4df";
  const textColor = dark ? "#e8e6e3" : "#2a2520";
  const muted = dark ? "#888" : "#888";

  const pct =
    totalParas > 0
      ? Math.min(100, Math.round(((currentPara + 1) / totalParas) * 100))
      : 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: barBg,
        borderTop: `1px solid ${borderColor}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      role="region"
      aria-label="Listen to this book"
    >
      <div style={{ height: "3px", backgroundColor: borderColor }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: dark ? "#888" : "#2a2520",
            transition: "width 0.3s",
          }}
        />
      </div>
      <div
        className="mx-auto flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4"
        style={{ maxWidth: "680px" }}
      >
        <span
          className="hidden sm:flex items-center gap-1 shrink-0"
          style={{
            fontSize: "13px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em",
            color: muted,
          }}
        >
          <PiHeadphones size={14} /> LISTEN
        </span>

        {!isSupported ? (
          <p style={{ fontSize: "15px", color: muted }}>
            Audio playback is not supported in this browser.
          </p>
        ) : !isPlaying ? (
          <button
            onClick={onPlay}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "15px",
              fontFamily: "var(--font-mono)",
              color: dark ? "#141414" : "#fff",
              background: dark ? "#e8e6e3" : "#2a2520",
              border: "none",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            <PiPlayFill size={14} /> Play
          </button>
        ) : (
          <>
            <button
              onClick={onPrev}
              title="Previous paragraph"
              aria-label="Previous paragraph"
              style={{
                background: "none",
                border: `1px solid ${borderColor}`,
                color: textColor,
                padding: "7px",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              <PiCaretLeft size={15} />
            </button>
            <button
              onClick={onPauseResume}
              title={isPaused ? "Resume" : "Pause"}
              aria-label={isPaused ? "Resume" : "Pause"}
              style={{
                background: dark ? "#e8e6e3" : "#2a2520",
                border: "none",
                color: dark ? "#141414" : "#fff",
                padding: "7px 10px",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              {isPaused ? <PiPlayFill size={15} /> : <PiPauseFill size={15} />}
            </button>
            <button
              onClick={onNext}
              title="Next paragraph"
              aria-label="Next paragraph"
              style={{
                background: "none",
                border: `1px solid ${borderColor}`,
                color: textColor,
                padding: "7px",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              <PiCaretRight size={15} />
            </button>
            <button
              onClick={onStop}
              title="Stop"
              aria-label="Stop"
              style={{
                background: "none",
                border: "none",
                color: muted,
                padding: "7px",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              <PiStopFill size={14} />
            </button>
          </>
        )}

        <span
          className="tnum shrink-0"
          style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: muted }}
        >
          {totalParas > 0 ? `${Math.min(currentPara + 1, totalParas)}/${totalParas}` : "—"}
        </span>

        <select
          value={String(rate)}
          onChange={e => onRateChange(Number(e.target.value))}
          title="Playback speed"
          aria-label="Playback speed"
          style={{
            fontSize: "13px",
            fontFamily: "var(--font-mono)",
            color: textColor,
            background: "none",
            border: `1px solid ${borderColor}`,
            padding: "6px 4px",
            cursor: "pointer",
          }}
        >
          {RATES.map(r => (
            <option key={r} value={r}>
              {r}x
            </option>
          ))}
        </select>

        {voices.length > 0 && (
          <select
            value={voiceURI}
            onChange={e => onVoiceChange(e.target.value)}
            title="Voice"
            aria-label="Voice"
            className="hidden sm:block"
            style={{
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
              color: textColor,
              background: "none",
              border: `1px solid ${borderColor}`,
              padding: "6px 4px",
              cursor: "pointer",
              maxWidth: "160px",
            }}
          >
            <option value="">Default voice</option>
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name.slice(0, 28)}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={onClose}
          title="Close player"
          aria-label="Close player"
          style={{
            background: "none",
            border: "none",
            color: muted,
            padding: "6px",
            cursor: "pointer",
            marginLeft: "auto",
            lineHeight: 1,
          }}
        >
          <PiX size={15} />
        </button>
      </div>
    </div>
  );
}
