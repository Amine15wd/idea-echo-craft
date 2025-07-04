
import { Button } from "@/components/ui/button";
import { Mic, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-background via-background to-blue-950/20 pt-20">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-float">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Pitch Optimization</span>
        </div>

        {/* Main heading */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight px-4">
          Transform Your
          <br />
          <span className="text-primary">Raw Ideas</span> Into
          <br />
          Perfect Pitches
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed px-4">
          Record your voice or type your startup idea and watch AI transform it into a 
          <span className="text-primary font-semibold"> compelling one-liner</span> and a 
          <span className="text-accent font-semibold"> Guy Kawasaki-style pitch deck structure</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 px-4">
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 animate-pulse-glow group w-full sm:w-auto"
            >
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 group-hover:animate-pulse" />
              Build Your Perfect Pitch
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-primary/30 text-primary hover:bg-primary/10 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            See How It Works
          </Button>
        </div>

        {/* Social proof */}
        <div className="text-center text-muted-foreground px-4">
          <p className="text-sm mb-4">Trusted by founders worldwide</p>
          <div className="flex justify-center items-center gap-4 sm:gap-8 opacity-60">
            <div className="w-16 sm:w-24 h-6 sm:h-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded animate-pulse" />
            <div className="w-12 sm:w-20 h-6 sm:h-8 bg-gradient-to-r from-accent/20 to-primary/20 rounded animate-pulse delay-300" />
            <div className="w-20 sm:w-28 h-6 sm:h-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded animate-pulse delay-700" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
