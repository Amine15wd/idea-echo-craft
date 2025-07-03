import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Save, Play, Pause, Volume2, Download, Sparkles, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PresentationDisplayProps {
  presentation: {
    title: string;
    oneLiner: string;
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
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Create full presentation text for narration
  const getFullPresentationText = () => {
    let fullText = `${presentation.title}. ${presentation.oneLiner}. `;
    presentation.structure.forEach((section, index) => {
      fullText += `Section ${index + 1}: ${section.section}. ${section.content}. `;
    });
    return fullText;
  };

  const generateAudioNarration = async () => {
    setIsGeneratingAudio(true);
    try {
      const fullText = getFullPresentationText();
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: fullText,
          voice: 'alloy' // Professional, clear voice
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate audio');
      }

      if (!data || !data.audioContent) {
        throw new Error('No audio data received');
      }

      // Convert base64 to blob and create URL
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      toast.success("🎙️ Audio narration generated successfully!");
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio narration. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}_narration.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("🎵 Audio downloaded successfully!");
  };

  // Add emojis to section titles
  const getSectionEmoji = (index: number) => {
    const emojis = ['🚀', '💡', '⭐', '🎯', '🔥', '✨', '💎', '🌟', '⚡', '🎪'];
    return emojis[index % emojis.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              <h1 className="text-5xl font-bold text-foreground bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {presentation.title}
              </h1>
              <Star className="w-8 h-8 text-accent animate-pulse" />
            </div>
            
            <div className="relative p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl animate-pulse-glow" />
              <p className="text-2xl text-foreground font-medium relative z-10">
                ✨ {presentation.oneLiner} ✨
              </p>
            </div>

            {/* Audio Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                🎤 {formatTime(recordingTime)} recorded
              </Badge>
              
              {!audioUrl ? (
                <Button
                  onClick={generateAudioNarration}
                  disabled={isGeneratingAudio}
                  className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white shadow-lg"
                >
                  {isGeneratingAudio ? (
                    <>
                      <Volume2 className="w-5 h-5 mr-2 animate-spin" />
                      🎙️ Generating Audio...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      🎙️ Generate Voice Narration
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={togglePlayback}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        🎵 Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        🎵 Play Narration
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={downloadAudio}
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    💾 Download Audio
                  </Button>
                </div>
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
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl shadow-lg">
                    {getSectionEmoji(index)}
                  </div>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {section.section}
                  </span>
                  <Zap className="w-6 h-6 text-accent ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <p className="text-lg text-foreground/90 leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 justify-center">
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
            onClick={onSave} 
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-xl"
            size="lg"
          >
            <Save className="w-5 h-5 mr-2" />
            💾 Save to Library
          </Button>
        </div>

        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
};

export default PresentationDisplay;