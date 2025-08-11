import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Save, Sparkles, Star, Zap, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PresentationDisplayProps {
  presentation: {
    title: string;
    oneLiner: string;
    language?: string;
    structure: {
      section: string;
      content: string;
    }[];
  };
  transcript: string;
  recordingTime: number;
  onDelete: () => void;
  onSave: () => void;
}

const PresentationDisplay = ({ 
  presentation, 
  transcript, 
  recordingTime, 
  onDelete, 
  onSave 
}: PresentationDisplayProps) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const presentationRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatContent = (content: string) => {
    // Split content by bullet points and format them nicely
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        return (
          <div key={index} className="flex items-start gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-3 flex-shrink-0" />
            <span className="text-foreground/90 leading-relaxed">{trimmedLine.substring(1).trim()}</span>
          </div>
        );
      }
      return (
        <p key={index} className="text-foreground/90 leading-relaxed mb-3">{trimmedLine}</p>
      );
    });
  };


  const generatePowerPoint = async () => {
    if (!user) {
      toast.error("Please sign in to generate PowerPoint");
      return;
    }

    setIsGeneratingPPTX(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-pptx', {
        body: { 
          presentation,
          userId: user.id
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate PowerPoint');
      }

      if (data?.downloadUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `${presentation.title || 'presentation'}.pptx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("💎 PowerPoint generated and downloaded successfully!");
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      toast.error('Failed to generate PowerPoint. Please try again.');
    } finally {
      setIsGeneratingPPTX(false);
    }
  };

  // Add emojis to section titles
  const getSectionEmoji = (index: number) => {
    const emojis = ['🚀', '💡', '⭐', '🎯', '🔥', '✨', '💎', '🌟', '⚡', '🎪'];
    return emojis[index % emojis.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto" ref={presentationRef}>
        {/* Header Section */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent text-center">
                {presentation.title}
              </h1>
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-accent animate-pulse" />
            </div>
            
            <div className="relative p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl animate-pulse-glow" />
              <p className="text-lg sm:text-xl lg:text-2xl text-foreground font-medium relative z-10 text-center">
                ✨ {presentation.oneLiner} ✨
              </p>
            </div>

            {/* Recording Status */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                🎤 {formatTime(recordingTime)} recorded
              </Badge>
              {presentation.language && (
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  🌍 {presentation.language.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 mb-8">
          {presentation.structure.map((section, index) => (
            <Card 
              key={index} 
              className="group relative bg-card/60 backdrop-blur-sm border border-primary/20 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-primary/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0">
                    {section.section.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || getSectionEmoji(index)}
                  </div>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex-1 min-w-0">
                    {section.section}
                  </span>
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="text-lg">
                  {formatContent(section.content)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button 
            onClick={onDelete} 
            variant="outline" 
            className="border-red-400/30 text-red-400 hover:bg-red-500/10 hover:border-red-400/50 shadow-lg"
            size="lg"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            🗑️ Delete & Create New
          </Button>

          <Button 
            onClick={generatePowerPoint}
            disabled={isGeneratingPPTX}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-xl"
            size="lg"
            title="Fully editable presentations for PowerPoint"
          >
            <FileText className="w-5 h-5 mr-2" />
            💎 {isGeneratingPPTX ? 'Generating...' : 'Generate PowerPoint'}
          </Button>

          <Button 
            onClick={() => onSave()}
            disabled={isSaving}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-xl"
            size="lg"
          >
            <Save className="w-5 h-5 mr-2" />
            💾 Save to Library
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PresentationDisplay;