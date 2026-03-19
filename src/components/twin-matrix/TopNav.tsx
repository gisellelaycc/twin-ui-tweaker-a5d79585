import { Link } from "react-router-dom";
import twin3Logo from "@/assets/twin3-logo.svg";

export const TopNav = () => (
  <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-md">
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
      <Link to="/" className="flex items-center gap-2">
        <img src={twin3Logo} alt="Twin3" className="h-8" />
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/verify" className="text-muted-foreground hover:text-foreground transition-colors">Verify</Link>
        <Link to="/mint" className="text-muted-foreground hover:text-foreground transition-colors">Mint</Link>
        <Link to="/matrix" className="text-muted-foreground hover:text-foreground transition-colors">Matrix</Link>
        <Link to="/agents" className="text-muted-foreground hover:text-foreground transition-colors">Agents</Link>
      </div>
    </div>
  </nav>
);

export default TopNav;
