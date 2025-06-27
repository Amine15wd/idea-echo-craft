
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Loader2, RotateCcw } from "lucide-react";

const Create = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [generatedPitch, setGeneratedPitch] = useState<{
    oneLiner: string;
    structure: string[];
  } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    // Mock transcription - in real app, you'd send to a transcription service
    setTimeout(() => {
      const mockTranscript = "This is a mock transcript of your pitch. In a real application, this would be the actual transcription of your recording from a service like OpenAI's Whisper API.";
      setTranscript(mockTranscript);
      setIsProcessing(false);
    }, 2000);
  };

  const reRecord = () => {
    setHasRecording(false);
    setTranscript("");
    setGeneratedPitch(null);
    setRecordingTime(0);
  };

  const createPitch = async () => {
    setIsProcessing(true);
    
    // Mock AI generation - in real app, you'd call OpenAI API
    setTimeout(() => {
      const mockPitch = {
        oneLiner: "Revolutionary AI-powered pitch assistant that transforms your ideas into compelling presentations.",
        structure: [
          "Problem: Entrepreneurs struggle to articulate their vision clearly",
          "Solution: AI-powered voice analysis and pitch optimization",
          "Market: $50B presentation software market growing at 15% annually",
          "Business Model: SaaS subscription with tiered pricing",
          "Competition: Traditional presentation tools lack AI optimization",
          "Traction: Early beta users show 300% improvement in pitch clarity"
        ]
      };
      setGeneratedPitch(mockPitch);
      setIsProcessing(false);
    }, 3000);
  };

  const savePitch = () => {
    // In real app, save to database/library
    const pitchData = {
      id: Date.now(),
      title: generatedPitch?.oneLiner.split(' ').slice(0, 4).join(' ') + '...',
      oneLiner: generatedPitch?.oneLiner,
      transcript,
      createdAt: new Date().toISOString().split('T')[0],
      duration: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
    };
    
    // Store in localStorage for now
    const existingPitches = JSON.parse(localStorage.getItem('pitches') || '[]');
    existingPitches.unshift(pitchData);
    localStorage.setItem('pitches', JSON.stringify(existingPitches));
    
    alert('Pitch saved to library!');
    reRecord();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (generatedPitch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 border border-border/20 rounded-xl p-8 backdrop-blur-sm">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Your Generated Pitch
            </h1>
            
            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">One-Liner</h3>
                <p className="text-foreground text-lg">{generatedPitch.oneLiner}</p>
              </div>
              
              <div className="bg-muted/20 border border-border/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Pitch Structure</h3>
                <div className="space-y-3">
                  {generatedPitch.structure.map((section, index) => (
                    <div key={index} className="p-3 bg-card/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">{section}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8 justify-center">
              <Button onClick={savePitch} className="bg-primary hover:bg-primary/90">
                Save to Library
              </Button>
              <Button onClick={reRecord} variant="outline">
                Delete & Re-record
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <Button onClick={createPitch} className="bg-primary hover:bg-primary/90">
              Create Pitch
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Create Your Pitch
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Record yourself talking about your startup idea and let AI transform it into a compelling pitch
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
                  <p>• Speak clearly about your startup idea</p>
                  <p>• Describe your problem, solution, and target market</p>
                  <p>• Keep it conversational and natural</p>
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
                <p className="text-lg font-medium text-primary">Processing your pitch...</p>
                <p className="text-sm">AI is analyzing your recording and creating your pitch</p>
              </>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-16 p-6 bg-card/50 border border-border/20 rounded-xl backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-3 text-foreground">💡 Pro Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Be Specific:</strong> Mention concrete details about your solution
            </div>
            <div>
              <strong className="text-foreground">Show Passion:</strong> Let your enthusiasm come through
            </div>
            <div>
              <strong className="text-foreground">Include Numbers:</strong> Market size, potential revenue, etc.
            </div>
            <div>
              <strong className="text-foreground">Stay Focused:</strong> 2-3 minutes is usually enough
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
