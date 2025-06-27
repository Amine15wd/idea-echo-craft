
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Brain, FileText, BookOpen, Edit3, Trash2 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Mic,
      title: "Voice Recording",
      description: "Simply speak your startup idea naturally. No scripts, no preparation needed.",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Advanced AI transcribes and analyzes your pitch using proven frameworks.",
      gradient: "from-accent/20 to-accent/5"
    },
    {
      icon: FileText,
      title: "Optimized One-Liner",
      description: "Get a crystal-clear, compelling one-sentence description of your idea.",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: BookOpen,
      title: "Kawasaki Structure",
      description: "Receive a complete pitch deck outline following Guy Kawasaki's proven formula.",
      gradient: "from-accent/20 to-accent/5"
    },
    {
      icon: Edit3,
      title: "Edit & Refine",
      description: "Fine-tune your optimized pitches with our intuitive editing tools.",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Trash2,
      title: "Manage Library",
      description: "Organize all your pitch variations in your personal library.",
      gradient: "from-accent/20 to-accent/5"
    }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            From Raw Idea to Perfect Pitch
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered process transforms your thoughts into investor-ready presentations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:border-primary/30 group"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
