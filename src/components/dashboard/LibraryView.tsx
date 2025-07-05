
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Mic, Save, X, Download, Sun, Moon, FileText, Presentation } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PresentationDisplay from "./PresentationDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Presentation {
  id: string;
  title: string;
  oneLiner: string;
  createdAt: string;
  duration: string;
  transcript?: string;
  audioUrl?: string;  // Add audio URL field
  structure?: {
    section: string;
    content: string;
  }[];
}

const LibraryView = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showDarkModeToggle, setShowDarkModeToggle] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPresentations();
  }, [user]);

  const fetchPresentations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPresentations = data.map(p => ({
        id: p.id,
        title: p.title,
        oneLiner: p.one_liner,
        createdAt: new Date(p.created_at).toLocaleDateString(),
        duration: p.duration || '',
        transcript: p.transcript || '',
        audioUrl: p.audio_url || '',  // Include audio URL
        structure: p.structure as any
      }));

      setPresentations(formattedPresentations);
    } catch (error) {
      console.error('Error fetching presentations:', error);
      toast.error('Failed to load presentations');
    }
  };

  const handleDelete = async (presentationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('presentations')
        .delete()
        .eq('id', presentationId);

      if (error) throw error;

      setPresentations(prev => prev.filter(p => p.id !== presentationId));
      toast.success("Presentation deleted");
    } catch (error) {
      console.error('Error deleting presentation:', error);
      toast.error('Failed to delete presentation');
    }
  };

  const handleEdit = (presentation: Presentation) => {
    setEditingPresentation({ ...presentation });
    setIsEditSheetOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPresentation || !user) return;

    try {
      const { error } = await supabase
        .from('presentations')
        .update({
          title: editingPresentation.title,
          one_liner: editingPresentation.oneLiner,
          structure: editingPresentation.structure
        })
        .eq('id', editingPresentation.id);

      if (error) throw error;

      const updatedPresentations = presentations.map(p => 
        p.id === editingPresentation.id ? editingPresentation : p
      );
      
      setPresentations(updatedPresentations);
      setIsEditSheetOpen(false);
      setEditingPresentation(null);
      toast.success("Presentation updated successfully");
    } catch (error) {
      console.error('Error updating presentation:', error);
      toast.error('Failed to update presentation');
    }
  };

  const updateEditingPresentation = (field: string, value: string) => {
    if (!editingPresentation) return;
    setEditingPresentation({
      ...editingPresentation,
      [field]: value
    });
  };

  const updateStructureSection = (index: number, field: 'section' | 'content', value: string) => {
    if (!editingPresentation?.structure) return;
    
    const updatedStructure = [...editingPresentation.structure];
    updatedStructure[index] = {
      ...updatedStructure[index],
      [field]: value
    };
    
    setEditingPresentation({
      ...editingPresentation,
      structure: updatedStructure
    });
  };

  const handleDownloadPDF = async (presentation: Presentation) => {
    try {
      // Create a temporary div with the presentation content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
      tempDiv.style.color = isDarkMode ? '#ffffff' : '#000000';
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      
      // Build HTML content
      let htmlContent = `
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; margin-bottom: 20px; color: ${isDarkMode ? '#3b82f6' : '#1e40af'};">
            ${presentation.title || 'Untitled Presentation'}
          </h1>
          <p style="font-size: 18px; font-style: italic; margin-bottom: 20px;">
            ${presentation.oneLiner}
          </p>
          <p style="font-size: 14px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'};">
            Created: ${presentation.createdAt} | Duration: ${presentation.duration}
          </p>
        </div>
      `;
      
      if (presentation.structure) {
        presentation.structure.forEach((section, index) => {
          htmlContent += `
            <div style="margin-bottom: 30px; page-break-inside: avoid;">
              <h2 style="font-size: 20px; margin-bottom: 15px; color: ${isDarkMode ? '#10b981' : '#059669'}; border-bottom: 2px solid ${isDarkMode ? '#10b981' : '#059669'}; padding-bottom: 5px;">
                ${index + 1}. ${section.section}
              </h2>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                ${section.content}
              </p>
            </div>
          `;
        });
      }
      
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);
      
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff'
      });
      
      // Remove temporary div
      document.body.removeChild(tempDiv);
      
      // Create PDF
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
      
      pdf.save(`${presentation.title || 'presentation'}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleViewPresentation = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
  };

  // Show presentation display if a presentation is selected
  if (selectedPresentation) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <PresentationDisplay
          presentation={{
            title: selectedPresentation.title,
            oneLiner: selectedPresentation.oneLiner,
            structure: selectedPresentation.structure || []
          }}
          transcript={selectedPresentation.transcript || ''}
          recordingTime={0}
          initialAudioUrl={selectedPresentation.audioUrl}  // Pass stored audio URL
          onDelete={() => setSelectedPresentation(null)}
          onSave={() => setSelectedPresentation(null)}
        />
      </div>
    );
  }

  if (presentations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 flex items-center justify-center p-8">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Mic className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">No presentations yet 📝</h3>
          <p className="text-muted-foreground mb-6">Create your first presentation to get started ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">📚 Your Presentation Library</h1>
            <p className="text-muted-foreground">Manage and refine your AI-generated presentations ✨</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {presentations.map((presentation, index) => {
            const emojiIndex = index % 8;
            const emojis = ['🎯', '💡', '🚀', '⭐', '🎨', '📊', '🔥', '✨'];
            const emoji = emojis[emojiIndex];
            
            return (
            <div
              key={presentation.id}
              className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 hover:shadow-xl hover:bg-white transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{emoji}</span>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                    {presentation.title || presentation.oneLiner}
                  </h3>
                </div>
                <p className="text-sm text-blue-600 bg-blue-50/80 p-3 rounded-lg text-center border border-blue-100">
                  {presentation.oneLiner}
                </p>
              </div>
              
              <div className="text-xs text-gray-500 mb-4 space-y-1 bg-gray-50/50 p-2 rounded">
                <div>📅 Created: {presentation.createdAt}</div>
                {presentation.duration && <div>⏱️ Duration: {presentation.duration}</div>}
                {presentation.structure && <div>📑 Sections: {presentation.structure.length}</div>}
                {presentation.audioUrl && <div>🎙️ Audio available</div>}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewPresentation(presentation)}
                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Presentation className="w-4 h-4 mr-1" />
                  View
                </Button>
                
                <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(presentation)}
                      className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Edit Presentation</SheetTitle>
                    </SheetHeader>
                    
                    {editingPresentation && (
                      <div className="space-y-6 mt-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Title</label>
                          <Input
                            value={editingPresentation.title}
                            onChange={(e) => updateEditingPresentation('title', e.target.value)}
                            placeholder="Presentation title"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">One-Liner Summary</label>
                          <Textarea
                            value={editingPresentation.oneLiner}
                            onChange={(e) => updateEditingPresentation('oneLiner', e.target.value)}
                            placeholder="Compelling one-line summary"
                            rows={2}
                          />
                        </div>

                        {editingPresentation.structure && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Presentation Structure</label>
                            <div className="space-y-4">
                              {editingPresentation.structure.map((section, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                  <Input
                                    value={section.section}
                                    onChange={(e) => updateStructureSection(index, 'section', e.target.value)}
                                    placeholder="Section title"
                                    className="mb-2"
                                  />
                                  <Textarea
                                    value={section.content}
                                    onChange={(e) => updateStructureSection(index, 'content', e.target.value)}
                                    placeholder="Section content"
                                    rows={3}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsEditSheetOpen(false)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-auto">
                    <SheetHeader>
                      <SheetTitle>Download PDF Options</SheetTitle>
                    </SheetHeader>
                    <div className="flex items-center justify-center gap-6 py-6">
                      <div className="flex items-center gap-3">
                        <Sun className="w-4 h-4" />
                        <Switch
                          checked={isDarkMode}
                          onCheckedChange={setIsDarkMode}
                        />
                        <Moon className="w-4 h-4" />
                        <span className="text-sm">{isDarkMode ? 'Dark' : 'Light'} Mode</span>
                      </div>
                      <Button
                        onClick={() => handleDownloadPDF(presentation)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(presentation.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
};

export default LibraryView;
