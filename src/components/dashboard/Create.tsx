
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Loader2 } from "lucide-react";

const Create = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual recording logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    // TODO: Implement transcription and AI processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

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
                onClick={isRecording ? handleStopRecording : handleStartRecording}
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
                  <span className="text-red-500 text-sm font-medium">Recording</span>
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
                <p className="text-sm">AI is analyzing your recording and creating your pitch deck structure</p>
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
