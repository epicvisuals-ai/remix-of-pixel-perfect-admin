import { useCallback, useRef, useEffect } from "react";

// Create a simple notification sound using Web Audio API
const createNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };
};

export function useNotificationSound() {
  const playSound = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (!playSound.current) {
        try {
          playSound.current = createNotificationSound();
        } catch (e) {
          console.warn("Could not initialize notification sound:", e);
        }
      }
      document.removeEventListener("click", initAudio);
    };
    
    document.addEventListener("click", initAudio);
    return () => document.removeEventListener("click", initAudio);
  }, []);

  const play = useCallback(() => {
    if (playSound.current) {
      try {
        playSound.current();
      } catch (e) {
        console.warn("Could not play notification sound:", e);
      }
    }
  }, []);

  return { play };
}
