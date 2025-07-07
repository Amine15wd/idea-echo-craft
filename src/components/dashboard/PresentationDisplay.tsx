import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Save, Sparkles, Star, Zap, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const presentationRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadPDF = async () => {
    if (!presentationRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(presentationRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${presentation.title.replace(/[^\w\s]/gi, '').substring(0, 30)}.pdf`;
      pdf.save(filename);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
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


  // Add emojis to section titles
  const getSectionEmoji = (index: number) => {
    const emojis = ['🚀', '💡', '⭐', '🎯', '🔥', '✨', '💎', '🌟', '⚡', '🎪'];
    return emojis[index % emojis.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-6">
      <div className="max-w-6xl mx-auto" ref={presentationRef}>
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
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl shadow-lg">
                    {section.section.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || getSectionEmoji(index)}
                  </div>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {section.section}
                  </span>
                  <Zap className="w-6 h-6 text-accent ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
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
        <div className="flex flex-wrap gap-4 justify-center">
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
            onClick={downloadPDF}
            disabled={isDownloading}
            variant="outline" 
            className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 shadow-lg"
            size="lg"
          >
            {isDownloading ? (
              <>
                <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                📄 Download PDF
              </>
            )}
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