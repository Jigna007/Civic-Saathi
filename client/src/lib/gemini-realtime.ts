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
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        active = true;
        console.log("Speech recognition started");
      };

      let processedIndex = 0;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Ensure we strictly process new results based on our own counter
        // processedIndex tracks the number of final results we've already handled
        let newIndex = processedIndex;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];

          // Only process if it's a new result we haven't handled yet
          if (i >= processedIndex && result.isFinal) {
            const transcript = result[0].transcript;
            onTextDelta(transcript.trim() + " ");
            newIndex = i + 1;
          }
        }
        processedIndex = newIndex;
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          onError(
            new Error(
              "Microphone permission denied. Please allow microphone access."
            )
          );
        } else if (event.error === "no-speech") {
          // Don't treat no-speech as an error, just continue
          console.log("No speech detected");
        } else if (event.error === "network") {
          onError(
            new Error(
              "Network error during speech recognition. Please check your internet connection."
            )
          );
        } else {
          onError(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      recognition.onend = () => {
        active = false;
        console.log("Speech recognition ended");
      };

      recognition.start();
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
