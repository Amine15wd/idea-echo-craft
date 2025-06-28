
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">PitchPal AI</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Sign in
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Let's get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
