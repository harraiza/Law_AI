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
  message?: string;
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
let timeoutId: number | undefined;

export function checkSpeechRecognitionSupport(): boolean {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

async function requestMicrophonePermission(): Promise<boolean> {
  try {
    // First check if we already have permission
    const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    if (permissionStatus.state === 'granted') {
      return true;
    }

    // If not granted, request permission
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    // Clean up the stream after checking permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission error:', error);
    return false;
  }
}

export async function startRecording(language: string = 'en-US'): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!checkSpeechRecognitionSupport()) {
        throw new Error('Speech recognition is not supported in this browser. Please try using Chrome, Edge, or Safari.');
      }

      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone access is required for voice recording. Please grant permission in your browser settings.');
      }

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Support both English and Urdu with fallback
      try {
        recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';
      } catch (e) {
        console.warn('Language not supported, falling back to en-US');
        recognition.lang = 'en-US';
      }

      recognition.onstart = () => {
        isRecording = true;
        // Set a timeout to stop recording if no speech is detected
        timeoutId = window.setTimeout(() => {
          if (isRecording) {
            stopRecording();
            reject(new Error('No speech detected. Please try again.'));
          }
        }, 10000); // 10 second timeout
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (timeoutId) window.clearTimeout(timeoutId);
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (timeoutId) window.clearTimeout(timeoutId);
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'An error occurred during voice recording. ';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech was detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage += 'No microphone was found. Please check your microphone settings.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone permission was denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage += 'Network error occurred. Please check your internet connection.';
            break;
          default:
            errorMessage += event.message || 'Please try again.';
        }
        
        reject(new Error(errorMessage));
      };

      recognition.onend = () => {
        if (timeoutId) window.clearTimeout(timeoutId);
        isRecording = false;
      };

      recognition.start();
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      reject(error);
    }
  });
}

export function stopRecording(): void {
  if (recognition && isRecording) {
    try {
      if (timeoutId) window.clearTimeout(timeoutId);
      recognition.stop();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
    isRecording = false;
  }
}
