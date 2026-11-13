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
  const surfaceBg = dark ? "#1A1A18" : "#FFFFFF";
  const borderCol = dark ? "#2C2B27" : "#E4E3DD";
  const ink = dark ? "#F2F1EC" : "#141413";
  const mutedInk = dark ? "#A09D94" : "#5C5A55";
  const accentCol = dark ? "#DF5348" : "#B82E24";

  const pct =
    totalParas > 0
      ? Math.min(100, Math.round(((currentPara + 1) / totalParas) * 100))
      : 0;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t transition-colors"
      style={{
        backgroundColor: surfaceBg,
        borderColor: borderCol,
        color: ink,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      role="region"
      aria-label="Audio narration controls"
    >
      {/* Top progress strip */}
      <div
        className="h-0.5 w-full"
        style={{ backgroundColor: borderCol }}
        aria-hidden="true"
      >
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: accentCol }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-6 h-14 flex items-center gap-2 sm:gap-3">
        <span
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium shrink-0"
          style={{ color: mutedInk }}
        >
          <PiHeadphones className="h-4 w-4" aria-hidden="true" />
          Audio
        </span>

        {!isSupported ? (
          <p className="text-xs sm:text-sm flex-1" style={{ color: mutedInk }}>
            Audio playback is not supported in this browser.
          </p>
        ) : !isPlaying ? (
          <button
            type="button"
            onClick={onPlay}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: ink,
              color: dark ? "#121211" : "#F7F7F4",
            }}
          >
            <PiPlayFill className="h-3.5 w-3.5" aria-hidden="true" />
            Play
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrev}
              title="Previous paragraph"
              aria-label="Previous paragraph"
              className="h-8 w-8 rounded-full border flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ borderColor: borderCol, color: ink }}
            >
              <PiCaretLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onPauseResume}
              title={isPaused ? "Resume" : "Pause"}
              aria-label={isPaused ? "Resume" : "Pause"}
              className="h-8 px-3.5 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                backgroundColor: ink,
                color: dark ? "#121211" : "#F7F7F4",
              }}
            >
              {isPaused ? (
                <PiPlayFill className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <PiPauseFill className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={onNext}
              title="Next paragraph"
              aria-label="Next paragraph"
              className="h-8 w-8 rounded-full border flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ borderColor: borderCol, color: ink }}
            >
              <PiCaretRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onStop}
              title="Stop narration"
              aria-label="Stop narration"
              className="h-8 w-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ color: mutedInk }}
            >
              <PiStopFill className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        <span
          className="font-mono text-xs tnum shrink-0"
          style={{ color: mutedInk }}
        >
          {totalParas > 0
            ? `${Math.min(currentPara + 1, totalParas)}/${totalParas}`
            : "-"}
        </span>

        <select
          value={String(rate)}
          onChange={(e) => onRateChange(Number(e.target.value))}
          title="Playback speed"
          aria-label="Playback speed"
          className="h-8 rounded-full border bg-transparent px-2.5 font-mono text-xs cursor-pointer"
          style={{ borderColor: borderCol, color: ink }}
        >
          {RATES.map((r) => (
            <option key={r} value={r} style={{ backgroundColor: surfaceBg, color: ink }}>
              {r}x
            </option>
          ))}
        </select>

        {voices.length > 0 && (
          <select
            value={voiceURI}
            onChange={(e) => onVoiceChange(e.target.value)}
            title="Voice"
            aria-label="Narration voice"
            className="hidden sm:block h-8 max-w-[165px] rounded-full border bg-transparent px-3 text-xs cursor-pointer truncate"
            style={{ borderColor: borderCol, color: ink }}
          >
            <option value="" style={{ backgroundColor: surfaceBg, color: ink }}>
              Default voice
            </option>
            {voices.map((v) => (
              <option
                key={v.voiceURI}
                value={v.voiceURI}
                style={{ backgroundColor: surfaceBg, color: ink }}
              >
                {v.name.slice(0, 28)}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={onClose}
          title="Close audio player"
          aria-label="Close audio player"
          className="ml-auto h-8 w-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 shrink-0"
          style={{ color: mutedInk }}
        >
          <PiX className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
