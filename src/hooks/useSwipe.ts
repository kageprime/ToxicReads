import { useEffect, useRef, type RefObject } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  element?: RefObject<HTMLElement | null>;
  edgeOnly?: "left" | "right" | null;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  element,
  edgeOnly,
}: SwipeOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  useEffect(() => {
    const el = element?.current ?? document;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      // Edge-only: only track touches within 40px of the specified edge
      if (edgeOnly === "right" && touch.clientX < window.innerWidth - 40) return;
      if (edgeOnly === "left" && touch.clientX > 40) return;

      startX.current = touch.clientX;
      startY.current = touch.clientY;
      tracking.current = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking.current) return;
      tracking.current = false;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;

      // Only horizontal swipes (ignore vertical scrolling)
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return;

      if (dx > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    };

    const opts = { passive: true } as AddEventListenerOptions;
    el.addEventListener("touchstart", onTouchStart, opts);
    el.addEventListener("touchend", onTouchEnd, opts);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, element, edgeOnly]);
}
