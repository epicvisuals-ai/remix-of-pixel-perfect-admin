import { useRef, useState, useCallback, TouchEvent } from "react";

interface UseSwipeToDismissOptions {
  onDismiss: () => void;
  threshold?: number; // Percentage of width to trigger dismiss (0-1)
  direction?: "left" | "right" | "both";
}

interface SwipeState {
  startX: number;
  currentX: number;
  isDragging: boolean;
}

export function useSwipeToDismiss({
  onDismiss,
  threshold = 0.4,
  direction = "right",
}: UseSwipeToDismissOptions) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    currentX: 0,
    isDragging: false,
  });
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDismissing, setIsDismissing] = useState(false);

  const getTranslateX = useCallback(() => {
    if (!swipeState.isDragging) return 0;
    const delta = swipeState.currentX - swipeState.startX;
    
    // Restrict direction
    if (direction === "right" && delta < 0) return 0;
    if (direction === "left" && delta > 0) return 0;
    
    return delta;
  }, [swipeState, direction]);

  const getOpacity = useCallback(() => {
    if (!elementRef.current || !swipeState.isDragging) return 1;
    const width = elementRef.current.offsetWidth;
    const translateX = Math.abs(getTranslateX());
    const progress = translateX / width;
    return Math.max(0.3, 1 - progress * 0.7);
  }, [swipeState, getTranslateX]);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (isDismissing) return;
    setSwipeState({
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
      isDragging: true,
    });
  }, [isDismissing]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!swipeState.isDragging || isDismissing) return;
    setSwipeState((prev) => ({
      ...prev,
      currentX: e.touches[0].clientX,
    }));
  }, [swipeState.isDragging, isDismissing]);

  const handleTouchEnd = useCallback(() => {
    if (!swipeState.isDragging || isDismissing) return;

    const element = elementRef.current;
    if (!element) {
      setSwipeState({ startX: 0, currentX: 0, isDragging: false });
      return;
    }

    const width = element.offsetWidth;
    const translateX = getTranslateX();
    const absTranslate = Math.abs(translateX);

    if (absTranslate / width >= threshold) {
      // Trigger dismiss animation
      setIsDismissing(true);
      const dismissDirection = translateX > 0 ? 1 : -1;
      element.style.transition = "transform 0.2s ease-out, opacity 0.2s ease-out";
      element.style.transform = `translateX(${dismissDirection * width}px)`;
      element.style.opacity = "0";
      
      setTimeout(() => {
        onDismiss();
        setIsDismissing(false);
        if (element) {
          element.style.transition = "";
          element.style.transform = "";
          element.style.opacity = "";
        }
      }, 200);
    }

    setSwipeState({ startX: 0, currentX: 0, isDragging: false });
  }, [swipeState.isDragging, isDismissing, threshold, getTranslateX, onDismiss]);

  const style = {
    transform: swipeState.isDragging ? `translateX(${getTranslateX()}px)` : undefined,
    opacity: swipeState.isDragging ? getOpacity() : undefined,
    transition: swipeState.isDragging ? "none" : undefined,
    touchAction: "pan-y" as const,
  };

  return {
    ref: elementRef,
    style,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isDragging: swipeState.isDragging,
    isDismissing,
  };
}
