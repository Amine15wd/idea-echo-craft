
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Mic, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Presentation {
  id: number;
  title: string;
  oneLiner: string;
  createdAt: string;
  duration: string;
  transcript?: string;
  structure?: {
    section: string;
    content: string;
  }[];
}

const LibraryView = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  useEffect(() => {
    const savedPresentations = JSON.parse(localStorage.getItem('pitches') || '[]');
    setPresentations(savedPresentations);
  }, []);

  const handleDelete = (presentationId: number) => {
    const updatedPresentations = presentations.filter(p => p.id !== presentationId);
    setPresentations(updatedPresentations);
    localStorage.setItem('pitches', JSON.stringify(updatedPresentations));
    toast.success("Presentation deleted");
  };

  const handleEdit = (presentation: Presentation) => {
    setEditingPresentation({ ...presentation });
    setIsEditSheetOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingPresentation) return;

    const updatedPresentations = presentations.map(p => 
      p.id === editingPresentation.id ? editingPresentation : p
    );
    
    setPresentations(updatedPresentations);
    localStorage.setItem('pitches', JSON.stringify(updatedPresentations));
    setIsEditSheetOpen(false);
    setEditingPresentation(null);
    toast.success("Presentation updated successfully");
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

  if (presentations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 flex items-center justify-center p-8">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Mic className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">No presentations yet</h3>
          <p className="text-muted-foreground mb-6">Create your first presentation to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Your Presentation Library</h1>
          <p className="text-muted-foreground">Manage and refine your AI-generated presentations</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {presentations.map((presentation) => (
            <div
              key={presentation.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {presentation.title || presentation.oneLiner}
                </h3>
                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded text-center">
                  {presentation.oneLiner}
                </p>
              </div>
              
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <div>Created: {presentation.createdAt}</div>
                {presentation.duration && <div>Duration: {presentation.duration}</div>}
              </div>

              <div className="flex gap-2">
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default LibraryView;
