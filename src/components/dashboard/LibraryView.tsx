
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Mic } from "lucide-react";

interface Pitch {
  id: number;
  title: string;
  oneLiner: string;
  createdAt: string;
  duration: string;
}

const LibraryView = () => {
  const [pitches, setPitches] = useState<Pitch[]>([]);

  useEffect(() => {
    // Load pitches from localStorage
    const savedPitches = JSON.parse(localStorage.getItem('pitches') || '[]');
    setPitches(savedPitches);
  }, []);

  const handleDelete = (pitchId: number) => {
    const updatedPitches = pitches.filter(pitch => pitch.id !== pitchId);
    setPitches(updatedPitches);
    localStorage.setItem('pitches', JSON.stringify(updatedPitches));
  };

  const handleEdit = (pitchId: number) => {
    console.log("Edit pitch:", pitchId);
    // TODO: Implement edit functionality
  };

  if (pitches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 flex items-center justify-center p-8">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Mic className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">No pitches yet</h3>
          <p className="text-muted-foreground mb-6">Create your first pitch to get started</p>
          <Button className="bg-primary hover:bg-primary/90">
            <Mic className="w-4 h-4 mr-2" />
            Create First Pitch
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Your Pitches</h1>
        </div>

        {/* Pitch List */}
        <div className="space-y-4">
          {pitches.map((pitch) => (
            <div
              key={pitch.id}
              className="bg-card/50 border border-border/20 rounded-xl p-6 backdrop-blur-sm hover:bg-card/70 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {pitch.oneLiner || pitch.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>Created on {pitch.createdAt}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    This is a mock transcript of your pitch. In a real application, this would be the actual transcription of your recording from a service like OpenAI's Whisper API.
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(pitch.id)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="ml-2 text-sm">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(pitch.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="ml-2 text-sm">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LibraryView;
