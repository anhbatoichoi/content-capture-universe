
import { CopyIcon } from "lucide-react";
import logo from "/lovable-uploads/62de8656-5215-4276-9691-3aba7e715c17.png";

const Header = () => {
  return (
    <header className="bg-gti-dark px-4 py-3 border-b border-gti-blue">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={logo} 
            alt="GTI Research" 
            className="h-8 w-8"
          />
          <div>
            <h1 className="text-gti-gold font-bold text-lg leading-none">
              GTI Research
            </h1>
            <p className="text-gti-blue text-xs leading-none">
              Content Capture
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted">
            Beta
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
