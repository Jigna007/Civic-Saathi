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
  const onError = opts.onError ?? (() => {});

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

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Only process results from the current event, not all accumulated results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          // Only send final results to avoid duplication
          // Interim results are shown in real-time but get replaced by final ones
          if (event.results[i].isFinal) {
            // Send the finalized transcript with a space
            onTextDelta(transcript + " ");
          }
        }
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
