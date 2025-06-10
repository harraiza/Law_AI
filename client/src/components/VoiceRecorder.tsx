import { useState } from 'react';
import type { ReactElement } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startRecording, stopRecording, checkSpeechRecognitionSupport } from "@/lib/speechUtils";

interface VoiceRecorderProps {
  onResult: (transcript: string) => void;
  onRecordingChange: (isRecording: boolean) => void;
  language?: string;
  className?: string;
}

export default function VoiceRecorder({ onResult, onRecordingChange, language = 'en', className }: VoiceRecorderProps): ReactElement {
  const [isRecording, setIsRecording] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleStartRecording = async () => {
    if (!checkSpeechRecognitionSupport()) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Please type your question instead.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsRecording(true);
      setIsDialogOpen(true);
      onRecordingChange(true);

      const transcript = await startRecording(language);
      
      if (transcript) {
        onResult(transcript);
        toast({
          title: "Voice Recognized",
          description: "Your question has been transcribed successfully.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Recording Failed", 
        description: errorMessage,
        variant: "destructive"
      });
      console.error('Voice recording error:', error);
    } finally {
      handleStopRecording();
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    setIsRecording(false);
    setIsDialogOpen(false);
    onRecordingChange(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStartRecording}
        disabled={isRecording}
        className={`text-gray-400 hover:text-pakistan-green transition-colors ${className}`}
        title={`Click to start voice recording in ${language === 'ur' ? 'Urdu' : 'English'}`}
      >
        <Mic className="h-4 w-4" />
      </Button>

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open: boolean) => {
          if (!open) handleStopRecording();
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-sm mx-4">
          <div className="text-center p-4">
            <div className="voice-recording w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <Mic className="text-white h-8 w-8" />
              <div className="absolute inset-0 rounded-full border-4 border-white border-opacity-30 animate-pulse-ring"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recording...</h3>
            <p className="text-gray-600 mb-4">
              Speak your legal question in {language === 'ur' ? 'Urdu' : 'English'}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleStopRecording}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
