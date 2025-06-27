
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Trash2, Copy, Download, Calendar, Clock } from "lucide-react";

// Mock data - this will be replaced with real data from Supabase later
const mockPitches = [
  {
    id: 1,
    title: "AI-Powered Customer Support",
    oneLiner: "We help SaaS companies reduce support costs by 60% through intelligent AI chatbots that understand context and emotion.",
    createdAt: "2024-01-15",
    duration: "2:34",
    status: "completed"
  },
  {
    id: 2,
    title: "Sustainable Fashion Marketplace",
    oneLiner: "The first marketplace connecting eco-conscious consumers with verified sustainable fashion brands worldwide.",
    createdAt: "2024-01-12",
    duration: "3:21",
    status: "completed"
  },
  {
    id: 3,
    title: "Remote Team Productivity",
    oneLiner: "A productivity platform that increases remote team efficiency by 40% through smart task automation and async collaboration.",
    createdAt: "2024-01-10",
    duration: "1:58",
    status: "processing"
  }
];

const LibraryView = () => {
  const [selectedPitch, setSelectedPitch] = useState<number | null>(null);

  const handleEdit = (pitchId: number) => {
    console.log("Edit pitch:", pitchId);
    // TODO: Implement edit functionality
  };

  const handleDelete = (pitchId: number) => {
    console.log("Delete pitch:", pitchId);
    // TODO: Implement delete functionality
  };

  const handleCopy = (oneLiner: string) => {
    navigator.clipboard.writeText(oneLiner);
    // TODO: Show toast notification
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/10 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Your Pitch Library
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage and refine your AI-generated pitches
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card/50 border border-border/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-2xl font-bold text-primary mb-1">12</div>
            <div className="text-sm text-muted-foreground">Total Pitches</div>
          </div>
          <div className="bg-card/50 border border-border/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-2xl font-bold text-accent mb-1">8</div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </div>
          <div className="bg-card/50 border border-border/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-2xl font-bold text-foreground mb-1">2.5 min</div>
            <div className="text-sm text-muted-foreground">Avg. Duration</div>
          </div>
        </div>

        {/* Pitch List */}
        <div className="space-y-4">
          {mockPitches.map((pitch) => (
            <div
              key={pitch.id}
              className="bg-card/50 border border-border/20 rounded-xl p-6 backdrop-blur-sm hover:bg-card/70 transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedPitch(selectedPitch === pitch.id ? null : pitch.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{pitch.title}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pitch.status === 'completed' 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      {pitch.status}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {pitch.oneLiner}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {pitch.createdAt}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {pitch.duration}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(pitch.oneLiner);
                    }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(pitch.id);
                    }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pitch.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedPitch === pitch.id && (
                <div className="mt-6 pt-6 border-t border-border/20">
                  <Tabs defaultValue="oneliner" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="oneliner">One-Liner</TabsTrigger>
                      <TabsTrigger value="structure">Pitch Structure</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="oneliner" className="space-y-4">
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <h4 className="font-medium text-primary mb-2">Optimized One-Liner</h4>
                        <p className="text-foreground">{pitch.oneLiner}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCopy(pitch.oneLiner)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="structure" className="space-y-4">
                      <div className="grid gap-3">
                        {["Problem", "Solution", "Market Size", "Business Model", "Competition", "Traction"].map((section, index) => (
                          <div key={section} className="bg-muted/20 border border-border/20 rounded-lg p-4">
                            <h4 className="font-medium text-foreground mb-2">{index + 1}. {section}</h4>
                            <p className="text-sm text-muted-foreground">
                              AI-generated content for {section.toLowerCase()} section will appear here...
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export Deck
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockPitches.length === 0 && (
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
        )}
      </div>
    </div>
  );
};

export default LibraryView;
