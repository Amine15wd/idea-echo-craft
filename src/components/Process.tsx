
import { ArrowRight, Mic, Zap, Presentation } from "lucide-react";

const Process = () => {
  const steps = [
    {
      icon: Mic,
      title: "Record",
      description: "Speak naturally about your startup idea for 2-5 minutes",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Transform",
      description: "AI analyzes and optimizes your pitch using proven frameworks",
      color: "text-accent"
    },
    {
      icon: Presentation,
      title: "Present",
      description: "Get your polished one-liner and complete pitch deck structure",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-r from-secondary/10 via-background to-secondary/10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
          Simple 3-Step Process
        </h2>
        <p className="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto">
          Transform your raw ideas into investor-ready pitches in minutes, not hours
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col items-center relative">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center mb-6 hover:scale-110 transition-all duration-300 hover:border-primary animate-float`}>
                  <Icon className={`w-10 h-10 ${step.color}`} />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground max-w-xs text-center leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-12 top-10 w-8 h-8 text-primary/40 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Process;
