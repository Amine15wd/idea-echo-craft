
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Type } from "lucide-react";
import Create from "./Create";
import TextToSpeech from "./TextToSpeech";

const CreateTabs = () => {
  const [generatedPresentation, setGeneratedPresentation] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePresentationGenerated = (presentation: any) => {
    setGeneratedPresentation(presentation);
  };

  const handleProcessingChange = (processing: boolean) => {
    setIsProcessing(processing);
  };

  const resetPresentation = () => {
    setGeneratedPresentation(null);
  };

  // If we have a generated presentation, show it regardless of the tab
  if (generatedPresentation) {
    return (
      <Create 
        initialPresentation={generatedPresentation}
        onReset={resetPresentation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10">
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Create Your Presentation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose how you'd like to create your presentation
            </p>
          </div>

          <Tabs defaultValue="record" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="record" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Record Audio
              </TabsTrigger>
              <TabsTrigger value="type" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Type Text
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="record">
              <Create 
                onPresentationGenerated={handlePresentationGenerated}
                onProcessingChange={handleProcessingChange}
                isProcessing={isProcessing}
              />
            </TabsContent>
            
            <TabsContent value="type">
              <TextToSpeech 
                onPresentationGenerated={handlePresentationGenerated}
                onProcessingChange={handleProcessingChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CreateTabs;
