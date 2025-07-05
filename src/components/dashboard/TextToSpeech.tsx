
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Type, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PresentationDisplay from "./PresentationDisplay";

interface TextToSpeechProps {
  onPresentationGenerated: (presentation: any) => void;
  onProcessingChange: (isProcessing: boolean) => void;
}

const TextToSpeech = ({ onPresentationGenerated, onProcessingChange }: TextToSpeechProps) => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPresentation, setGeneratedPresentation] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error("Please enter some text to create a presentation");
      return;
    }

    setIsProcessing(true);
    onProcessingChange(true);
    setError(null);

    try {
      console.log('Creating presentation from text:', text);
      
      const { data, error } = await supabase.functions.invoke('generate-presentation', {
        body: { transcript: text.trim() }
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
      onPresentationGenerated(data);
      toast.success("Presentation created successfully!");
    } catch (error) {
      console.error('Error generating presentation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error generating presentation: ${errorMessage}`);
      toast.error('Error generating presentation. Please try again.');
    } finally {
      setIsProcessing(false);
      onProcessingChange(false);
    }
  };

  // Show presentation display if generated
  if (generatedPresentation) {
    return (
      <PresentationDisplay
        presentation={generatedPresentation}
        transcript={text}
        recordingTime={0} // Text input doesn't have recording time
        onDelete={() => {
          setGeneratedPresentation(null);
          setText("");
          toast.success('Ready to create a new presentation');
        }}
        onSave={(audioUrl) => {
          const presentationData = {
            id: Date.now(),
            title: generatedPresentation.title,
            oneLiner: generatedPresentation.oneLiner,
            transcript: text,
            structure: generatedPresentation.structure,
            createdAt: new Date().toISOString().split('T')[0],
            duration: "Text input",
            audioUrl: audioUrl
          };
          
          const existingPresentations = JSON.parse(localStorage.getItem('pitches') || '[]');
          existingPresentations.unshift(presentationData);
          localStorage.setItem('pitches', JSON.stringify(existingPresentations));
          
          toast.success('Presentation saved to library!');
          setGeneratedPresentation(null);
          setText("");
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-6 h-6" />
            Create Presentation from Text
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">
                Enter your content (in Arabic or English)
              </Label>
              <Textarea
                id="text-input"
                placeholder="Type your presentation content here... Tell us about your topic, ideas, or any subject you'd like to turn into a presentation."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-none"
                disabled={isProcessing}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isProcessing || !text.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Presentation...
                </>
              ) : (
                'Generate Presentation'
              )}
            </Button>
          </form>

          {isProcessing && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                AI is processing your text and creating a comprehensive presentation...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextToSpeech;
