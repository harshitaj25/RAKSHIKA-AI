import { Mail, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-6">
            <Button variant="ghost" size="icon" asChild>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="mailto:contact@rakshika.ai">
                <Mail className="h-5 w-5" />
              </a>
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            🛡️ Rakshika AI © 2025 | Designed for Women's Safety & Empowerment
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:contact@rakshika.ai">Contact Developer</a>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
