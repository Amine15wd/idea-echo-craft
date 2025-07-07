
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, RotateCcw, Trash2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PresentationDisplay from "./PresentationDisplay";

interface CreateProps {
  onPresentationGenerated?: (presentation: any) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
  isProcessing?: boolean;
  initialPresentation?: any;
  onReset?: () => void;
}

const Create = ({ 
  onPresentationGenerated, 
  onProcessingChange, 
  isProcessing: externalProcessing,
  initialPresentation,
  onReset
}: CreateProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [generatedPresentation, setGeneratedPresentation] = useState<{
    title: string;
    oneLiner: string;
    language?: string;
    structure: {
      section: string;
      content: string;
    }[];
  } | null>(initialPresentation || null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Handle external processing state
  const currentlyProcessing = externalProcessing || isProcessing;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setProcessingError(null);
      setRetryCount(0);
      toast.success("Recording started");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecording(true);
      setIsProcessing(true);
      onProcessingChange?.(true);
      toast.success("Recording stopped, processing...");
    }
  };

  const transcribeAudio = async (audioBlob: Blob, isRetry: boolean = false) => {
    try {
      if (!isRetry) {
        setProcessingError(null);
      }
      
      console.log('Starting transcription...', { isRetry, retryCount });
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
      const base64Audio = btoa(binaryString);
      
      console.log('Calling transcribe-audio function...');
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Transcription failed');
      }

      if (!data || !data.text) {
        throw new Error('No transcription text received');
      }

      console.log('Transcription successful:', data.text);
      setTranscript(data.text);
      setIsProcessing(false);
      onProcessingChange?.(false);
      setProcessingError(null);
      toast.success("Audio transcribed successfully");
    } catch (err) {
      console.error('Transcription error:', err);
      handleTranscriptionError(err as Error, audioBlob);
    }
  };

  const handleTranscriptionError = (error: Error, audioBlob?: Blob) => {
    console.error('Transcription error details:', error);
    
    let errorMessage = "Error transcribing audio. ";
    
    if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
      errorMessage = "API quota exceeded. Please check your API settings or try again later.";
    } else if (error.message.includes('invalid') || error.message.includes('authentication')) {
      errorMessage = "API authentication error. Please check your API key configuration.";
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else {
      errorMessage += error.message;
    }
    
    setProcessingError(errorMessage);
    setIsProcessing(false);
    onProcessingChange?.(false);
    toast.error(errorMessage);
    
    if (audioBlob) {
      audioChunksRef.current = [audioBlob];
    }
  };

  const retryTranscription = async () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = audioChunksRef.current[0];
      setIsProcessing(true);
      onProcessingChange?.(true);
      setRetryCount(prev => prev + 1);
      toast.info(`Retrying transcription... (Attempt ${retryCount + 1})`);
      await transcribeAudio(audioBlob, true);
    }
  };

  const createPresentation = async () => {
    setIsProcessing(true);
    onProcessingChange?.(true);
    setProcessingError(null);
    
    try {
      console.log('Creating presentation with transcript:', transcript);
      
      const { data, error } = await supabase.functions.invoke('generate-presentation', {
        body: { transcript }
      });

      if (error) {
        console.error('Presentation generation error:', error);
        throw new Error(error.message || 'Failed to generate presentation');
      }

      if (!data) {
        throw new Error('No presentation data received');
      }

      console.log('Presentation generated successfully:', data);
      setGeneratedPresentation(data);
      onPresentationGenerated?.(data);
      setIsProcessing(false);
      onProcessingChange?.(false);
      toast.success("Presentation created successfully!");
    } catch (error) {
      console.error('Error generating presentation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setProcessingError(`Error generating presentation: ${errorMessage}`);
      toast.error('Error generating presentation. Please try again.');
      setIsProcessing(false);
      onProcessingChange?.(false);
    }
  };

  const { user } = useAuth();

  const savePresentation = async () => {
    if (!generatedPresentation || !user) return;
    
    try {
      const { error } = await supabase
        .from('presentations')
        .insert({
          user_id: user.id,
          title: generatedPresentation.title,
          one_liner: generatedPresentation.oneLiner,
          transcript,
          structure: generatedPresentation.structure,
          duration: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
        });

      if (error) throw error;

      toast.success('Presentation saved to library!');
      resetForm();
    } catch (error) {
      console.error('Error saving presentation:', error);
      toast.error('Failed to save presentation');
    }
  };

  const deleteAndReRecord = () => {
    setGeneratedPresentation(null);
    onReset?.();
    resetForm();
    toast.success('Ready to record again');
  };

  const resetForm = () => {
    setHasRecording(false);
    setTranscript("");
    setGeneratedPresentation(null);
    setRecordingTime(0);
  };

  const reRecord = () => {
    setTranscript("");
    setHasRecording(false);
    setRecordingTime(0);
    toast.success('Ready to record again');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generated Presentation Display
  if (generatedPresentation) {
    return (
      <PresentationDisplay
        presentation={generatedPresentation}
        transcript={transcript}
        recordingTime={recordingTime}
        onDelete={deleteAndReRecord}
        onSave={savePresentation}
      />
    );
  }

  // Recording Complete State
  if (hasRecording && !currentlyProcessing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              {processingError ? "Processing Error" : "Recording Complete"}
            </h1>
            <p className="text-lg text-muted-foreground">
              Duration: {formatTime(recordingTime)}
            </p>
            
            {processingError ? (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Transcription Failed</span>
                </div>
                <p className="text-sm text-red-700 mb-4">{processingError}</p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={retryTranscription} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry Transcription
                  </Button>
                  <Button 
                    onClick={reRecord} 
                    variant="outline"
                    size="sm"
                  >
                    Record Again
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-md text-muted-foreground mt-2">
                Transcription ready. What would you like to do next?
              </p>
            )}
          </div>

          {!processingError && (
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={createPresentation} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Generate Pitch
              </Button>
              <Button 
                onClick={reRecord} 
                variant="outline"
                size="lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Re-record
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Processing State
  if (currentlyProcessing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-48 h-48 mx-auto rounded-full flex items-center justify-center bg-primary/10 border-4 border-primary/30 mb-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Processing your content...
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              AI is working on your presentation
            </p>
            <p className="text-sm text-muted-foreground">
              This usually takes 10-30 seconds. Please wait...
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-yellow-600 mt-2">
                Retry attempt {retryCount}...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Recording Interface
  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="relative">
          <div className="relative mb-8">
            <div className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500/20 border-4 border-red-500 animate-pulse' 
                : 'bg-primary/10 border-4 border-primary/30 hover:border-primary/50 hover:bg-primary/20'
            }`}>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={currentlyProcessing}
                className={`w-24 h-24 rounded-full transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {isRecording ? (
                  <Square className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            </div>
            
            {isRecording && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-500 text-sm font-medium">
                    Recording {formatTime(recordingTime)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 text-muted-foreground">
            {!isRecording && !currentlyProcessing && (
              <>
                <p className="text-lg font-medium">Click to start recording</p>
                <div className="text-sm space-y-2">
                  <p>• Speak clearly in Arabic or English</p>
                  <p>• Talk about any topic you'd like</p>
                  <p>• AI will create a comprehensive presentation</p>
                </div>
              </>
            )}
            
            {isRecording && (
              <>
                <p className="text-lg font-medium text-red-500">Recording in progress...</p>
                <p className="text-sm">Click the stop button when you're done</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
