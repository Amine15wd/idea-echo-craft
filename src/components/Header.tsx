
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();

  const MobileMenu = () => (
    <div className="flex flex-col gap-4 p-4">
      <Link to="/auth">
        <Button variant="ghost" className="w-full text-foreground hover:text-primary">
          Sign in
        </Button>
      </Link>
      <Link to="/auth">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Let's get started
        </Button>
      </Link>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">PitchPal AI</h1>
        </div>

        {/* Desktop Action Buttons */}
        {!isMobile && (
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
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <MobileMenu />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
};

export default Header;
