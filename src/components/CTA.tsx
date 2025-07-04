
import { Button } from "@/components/ui/button";
import { Mic, ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Ready to Transform Your Pitch?</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
          Stop Struggling With
          <br />
          Your Pitch
        </h2>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of founders who've already transformed their ideas into 
          <span className="text-primary font-semibold"> compelling pitches</span> that investors love.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-semibold rounded-xl transition-all duration-300 hover:scale-105 animate-pulse-glow group w-full sm:w-auto"
          >
            <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3 group-hover:animate-pulse" />
            Build Your First Pitch
            <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          No credit card required • Free trial • Transform unlimited pitches
        </p>
      </div>
    </section>
  );
};

export default CTA;
