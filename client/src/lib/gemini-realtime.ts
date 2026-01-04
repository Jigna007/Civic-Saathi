// Browser Speech Recognition client for live speech-to-text
// Uses the Web Speech API (SpeechRecognition) built into modern browsers
// Falls back to browser's native speech recognition instead of Gemini WebSocket

export type RealtimeClient = {
  start: () => Promise<void>;
  stop: () => void;
  isActive: () => boolean;
};

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror:
  | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
  | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult:
  | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
  | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function createGeminiRealtimeClient(opts: {
  onTextDelta: (delta: string) => void;
  onError?: (e: any) => void;
  instructions?: string;
}): RealtimeClient {
  const onTextDelta = opts.onTextDelta;
  const onError = opts.onError ?? (() => { });

  let recognition: SpeechRecognition | null = null;
  let active = false;

  async function start() {
    if (active) return;

    // Check if browser supports Speech Recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError(
        new Error(
          "Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari."
        )
      );
      return;
    }

    try {
      recognition = new SpeechRecognition();
      // "Definitive Fix" for Android Repetition:
      // 1. Disable continuous: resets internal buffer after every sentence.
      // 2. Disable interimResults: prevents "ladder" duplication (A, AB, ABC).
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        // Only set active if it's the initial start, not a restart
        if (!active) {
          active = true;
          console.log("Speech recognition started");
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // With continuous=false, we only get one result at index 0
        if (event.results.length > 0) {
          const result = event.results[0];
          if (result.isFinal) {
            const transcript = result[0].transcript;
            if (transcript.trim()) {
              onTextDelta(transcript.trim() + " ");
            }
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Ignore 'no-speech' as it just means silence -> we'll likely restart or stop
        if (event.error === "no-speech") {
          return;
        }

        console.error("Speech recognition error:", event.error);
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          active = false; // Stop trying to restart
          onError(
            new Error(
              "Microphone permission denied. Please allow microphone access."
            )
          );
        } else if (event.error === "network") {
          active = false;
          onError(
            new Error(
              "Network error. Please check connection."
            )
          );
        } else {
          // For other errors, we might want to stop or just log
          // active = false;
          // onError(new Error(`Speech error: ${event.error}`));
        }
      };

      recognition.onend = () => {
        // If we are still "active" (user hasn't clicked stop), restart immediately
        if (active) {
          try {
            recognition?.start();
          } catch (e) {
            // If start fails (e.g. not allowed), stop effectively
            active = false;
            console.error("Failed to restart recognition", e);
          }
        } else {
          console.log("Speech recognition stopped by user");
        }
      };

      recognition.start();
      active = true;
    } catch (err) {
      onError(err);
      active = false;
    }
  }

  function stop() {
    active = false;
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
      recognition = null;
    }
  }

  function isActive() {
    return active;
  }

  return { start, stop, isActive };
}
