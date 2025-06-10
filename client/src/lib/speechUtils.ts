// Add global type declarations for speech recognition
interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

let recognition: SpeechRecognition | null = null;
let isRecording = false;

export function checkSpeechRecognitionSupport(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function startRecording(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!checkSpeechRecognitionSupport()) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    // Use webkitSpeechRecognition for Chrome/Safari compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // TODO: Add language switching for Urdu

    recognition.onstart = () => {
      isRecording = true;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      isRecording = false;
    };

    recognition.start();
  });
}

export function stopRecording(): void {
  if (recognition && isRecording) {
    recognition.stop();
    isRecording = false;
  }
}
