
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Loader2, RotateCcw } from "lucide-react";

const Create = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [generatedRingtone, setGeneratedRingtone] = useState<{
    oneLiner: string;
    structure: string[];
  } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        
        // Create audio element for playback
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current = new Audio(audioUrl);
        
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecording(true);
      setIsProcessing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // For now, using a mock transcription
      // In a real implementation, you would send the audioBlob to a transcription service
      setTimeout(() => {
        const mockTranscript = "This is a mock transcript of your recorded audio. In a real application, this would be the actual transcription from a service like OpenAI's Whisper API or similar speech-to-text service.";
        setTranscript(mockTranscript);
        setIsProcessing(false);
      }, 2000);
      
      // Real implementation would look like:
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // const response = await fetch('/api/transcribe', {
      //   method: 'POST',
      //   body: formData
      // });
      // const { transcript } = await response.json();
      // setTranscript(transcript);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setTranscript("Error transcribing audio. Please try again.");
      setIsProcessing(false);
    }
  };

  const reRecord = () => {
    setHasRecording(false);
    setTranscript("");
    setGeneratedRingtone(null);
    setRecordingTime(0);
    if (audioRef.current) {
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
  };

  const createRingtone = async () => {
    setIsProcessing(true);
    
    try {
      // Mock AI generation - replace with actual OpenAI API call
      setTimeout(() => {
        const mockRingtone = {
          oneLiner: "AI-powered voice assistant that transforms spoken ideas into memorable ringtones.",
          structure: [
            "Hook: Catchy opening that grabs attention",
            "Problem: Current ringtones are generic and boring", 
            "Solution: AI analyzes your voice and creates personalized tones",
            "Benefits: Unique, memorable, and perfectly matched to your personality",
            "Call to Action: Try it now and make your phone truly yours"
          ]
        };
        setGeneratedRingtone(mockRingtone);
        setIsProcessing(false);
      }, 3000);

      // Real OpenAI implementation would look like:
      // const response = await fetch('/api/generate-ringtone', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ transcript })
      // });
      // const ringtone = await response.json();
      // setGeneratedRingtone(ringtone);
    } catch (error) {
      console.error('Error generating ringtone:', error);
      alert('Error generating ringtone. Please try again.');
      setIsProcessing(false);
    }
  };

  const saveRingtone = () => {
    if (!generatedRingtone) return;
    
    const ringtoneData = {
      id: Date.now(),
      title: generatedRingtone.oneLiner.split(' ').slice(0, 4).join(' ') + '...',
      oneLiner: generatedRingtone.oneLiner,
      transcript,
      structure: generatedRingtone.structure,
      createdAt: new Date().toISOString().split('T')[0],
      duration: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
    };
    
    const existingRingtones = JSON.parse(localStorage.getItem('pitches') || '[]');
    existingRingtones.unshift(ringtoneData);
    localStorage.setItem('pitches', JSON.stringify(existingRingtones));
    
    alert('Ringtone saved to library!');
    reRecord();
  };

  const deleteRingtone = () => {
    setGeneratedRingtone(null);
    reRecord();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generated Ringtone Display
  if (generatedRingtone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
              Your Generated Ringtone
            </h1>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">One-Liner</h3>
                <p className="text-gray-800 text-lg">{generatedRingtone.oneLiner}</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ringtone Structure</h3>
                <div className="space-y-3">
                  {generatedRingtone.structure.map((section, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border">
                      <p className="text-sm text-gray-600">{section}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8 justify-center">
              <Button onClick={saveRingtone} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save to Library
              </Button>
              <Button onClick={deleteRingtone} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                Delete & Re-record
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Recording Complete State
  if (hasRecording && !isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 flex items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Recording Complete
            </h1>
            <p className="text-lg text-muted-foreground">
              Duration: {formatTime(recordingTime)}
            </p>
          </div>

          {transcript && (
            <div className="bg-card/50 border border-border/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3">Transcript</h3>
              <p className="text-muted-foreground">{transcript}</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={createRingtone} className="bg-primary hover:bg-primary/90">
              Create Ringtone
            </Button>
            <Button onClick={reRecord} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Re-record
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Recording Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Create Your Ringtone
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Record yourself speaking about any topic and let AI transform it into a personalized ringtone
          </p>
        </div>

        {/* Recording Interface */}
        <div className="relative">
          {/* Main Record Button */}
          <div className="relative mb-8">
            <div className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500/20 border-4 border-red-500 animate-pulse' 
                : 'bg-primary/10 border-4 border-primary/30 hover:border-primary/50 hover:bg-primary/20'
            }`}>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isRecording ? (
                  <Square className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            </div>
            
            {/* Recording indicator */}
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

          {/* Instructions */}
          <div className="space-y-4 text-muted-foreground">
            {!isRecording && !isProcessing && (
              <>
                <p className="text-lg font-medium">Click to start recording</p>
                <div className="text-sm space-y-2">
                  <p>• Speak clearly in Arabic or English</p>
                  <p>• Talk about any topic you'd like</p>
                  <p>• Keep it natural and conversational</p>
                </div>
              </>
            )}
            
            {isRecording && (
              <>
                <p className="text-lg font-medium text-red-500">Recording in progress...</p>
                <p className="text-sm">Click the stop button when you're done</p>
              </>
            )}
            
            {isProcessing && (
              <>
                <p className="text-lg font-medium text-primary">Processing your recording...</p>
                <p className="text-sm">AI is transcribing your audio</p>
              </>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-16 p-6 bg-card/50 border border-border/20 rounded-xl backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-3 text-foreground">💡 Pro Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Be Clear:</strong> Speak at a normal pace with good pronunciation
            </div>
            <div>
              <strong className="text-foreground">Stay Focused:</strong> 30-60 seconds is usually perfect
            </div>
            <div>
              <strong className="text-foreground">Be Creative:</strong> Any topic can become an interesting ringtone
            </div>
            <div>
              <strong className="text-foreground">Have Fun:</strong> Let your personality shine through
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
