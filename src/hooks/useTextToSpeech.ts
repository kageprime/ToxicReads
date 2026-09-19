import { useCallback, useEffect, useRef, useState } from "react";

export interface SpeakItem {
  paraIndex: number;
  text: string;
}

/**
 * Split a paragraph into TTS-safe utterance chunks (~180 chars).
 * Browsers truncate very long utterances, so we split at sentence
 * boundaries and pack sentences up to maxLen.
 */
export function splitParagraphForTTS(
  paragraph: string,
  maxLen = 200
): string[] {
  const text = paragraph.trim().replace(/\s+/g, " ");
  if (!text) return [];
  if (text.length <= maxLen) return [text];

  const sentences =
    text.match(/[^.!?]+[.!?]+["'”)]?\s*|\S(?:[^.!?]*)$/g) ?? [text];
  const chunks: string[] = [];
  let current = "";

  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if (sentence.length > maxLen) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      for (let i = 0; i < sentence.length; i += maxLen) {
        const slice = sentence.slice(i, i + maxLen);
        const cut =
          slice.length === maxLen
            ? (slice.slice(0, slice.lastIndexOf(" ") > 80
                ? slice.lastIndexOf(" ")
                : maxLen) || slice)
            : slice;
        chunks.push(cut.trim());
      }
      continue;
    }
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= maxLen) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

/** Flatten paragraphs into a speak queue starting at a paragraph index. */
export function buildSpeakQueue(
  paragraphs: string[],
  startPara = 0
): SpeakItem[] {
  const queue: SpeakItem[] = [];
  for (let i = startPara; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    if (!para || !para.trim()) continue;
    for (const chunk of splitParagraphForTTS(para)) {
      queue.push({ paraIndex: i, text: chunk });
    }
  }
  return queue;
}

interface EngineOptions {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  onParagraph: (paraIndex: number) => void;
  onEnd: () => void;
}

export function useTextToSpeechEngine(options: EngineOptions) {
  const { voice, rate } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const queueRef = useRef<SpeakItem[]>([]);
  const idxRef = useRef(0);
  const stoppedRef = useRef(true);
  const optsRef = useRef(options);
  const speakNextRef = useRef<() => void>(() => undefined);
  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const supportedRef = useRef(isSupported);

  useEffect(() => {
    optsRef.current = options;
  }, [options]);

  useEffect(() => {
    supportedRef.current = isSupported;
  }, [isSupported]);

  const speakNext = useCallback(() => {
    if (!supportedRef.current) return;
    const synth = window.speechSynthesis;
    if (stoppedRef.current) return;
    if (idxRef.current >= queueRef.current.length) {
      stoppedRef.current = true;
      setIsSpeaking(false);
      setIsPaused(false);
      optsRef.current.onEnd();
      return;
    }
    const item = queueRef.current[idxRef.current];
    const utter = new SpeechSynthesisUtterance(item.text);
    if (optsRef.current.voice) utter.voice = optsRef.current.voice;
    utter.rate = optsRef.current.rate;
    utter.pitch = 1;
    utter.onstart = () => {
      optsRef.current.onParagraph(item.paraIndex);
    };
    utter.onend = () => {
      if (stoppedRef.current) return;
      idxRef.current += 1;
      speakNextRef.current();
    };
    utter.onerror = () => {
      if (stoppedRef.current) return;
      // Skip failed chunk rather than stalling the whole book.
      idxRef.current += 1;
      speakNextRef.current();
    };
    synth.speak(utter);
  }, []);

  useEffect(() => {
    speakNextRef.current = speakNext;
  }, [speakNext]);

  /** Replace the queue and start from the beginning of `items`. */
  const speak = useCallback((items: SpeakItem[]) => {
    if (!supportedRef.current) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    queueRef.current = items;
    idxRef.current = 0;
    stoppedRef.current = items.length === 0;
    if (items.length === 0) {
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }
    setIsSpeaking(true);
    setIsPaused(false);
    // Cancel is async on some browsers — queue first utterance on next tick.
    window.setTimeout(() => {
      if (!stoppedRef.current) speakNextRef.current();
    }, 30);
  }, []);

  /** Append more items (used when further content chunks finish loading). */
  const append = useCallback((items: SpeakItem[]) => {
    if (items.length === 0) return;
    const wasFinished =
      !stoppedRef.current && idxRef.current >= queueRef.current.length;
    queueRef.current = [...queueRef.current, ...items];
    if (wasFinished) {
      speakNextRef.current();
    }
  }, []);

  const pause = useCallback(() => {
    if (!supportedRef.current) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!supportedRef.current) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (supportedRef.current) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Keep voice/rate live for upcoming utterances without restarting.
  useEffect(() => {
    optsRef.current.voice = voice;
    optsRef.current.rate = rate;
  }, [voice, rate]);

  // Chrome can stall long queues — nudge it while speaking.
  useEffect(() => {
    if (!isSupported || !isSpeaking || isPaused) return;
    const t = window.setInterval(() => {
      const synth = window.speechSynthesis;
      if (synth.speaking && synth.paused) synth.resume();
    }, 5000);
    return () => window.clearInterval(t);
  }, [isSupported, isSpeaking, isPaused]);

  useEffect(() => stop, [stop]);

  return { isSupported, isSpeaking, isPaused, speak, append, pause, resume, stop };
}

/** Load browser voices (async on most browsers). */
export function useTTSVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return voices;
}
