import { Leaf } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-2 font-display font-bold text-lg text-primary">
            <Leaf className="h-5 w-5" />
            EcoRoute
          </a>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#routes" className="hover:text-foreground transition-colors">Routes</a>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 EcoRoute. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
