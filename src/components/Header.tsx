import { Shield, Menu, X, MapPin, AlertCircle, BarChart3, Map, Route, FileText, Globe } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCity } from "@/hooks/useCity";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const navItems = [
  { path: "/", label: "Home", icon: Shield },
  { path: "/risk-prediction", label: "Risk Check", icon: MapPin },
  { path: "/sos-alert", label: "SOS Alert", icon: AlertCircle },
  { path: "/safety-heatmap", label: "Heatmap", icon: Map },
  { path: "/safety-routes", label: "Safe Routes", icon: Route },
  { path: "/location-logs", label: "Logs", icon: FileText },
  { path: "/dashboard", label: "Admin", icon: BarChart3 },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { city, setCity, allCities } = useCity();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-primary rounded-full p-2 transition-transform group-hover:scale-110">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Rakshika AI</h1>
              <p className="text-[10px] text-muted-foreground leading-none">Your Smart Safety Companion</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`text-sm transition-all ${
                      isActive ? "shadow-soft" : "hover:bg-primary/10"
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-1.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            <div className="ml-4 pl-4 border-l border-border flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={city.id} onValueChange={setCity}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {allCities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="lg:hidden mt-4 pb-2 border-t border-border pt-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={city.id} onValueChange={(val) => { setCity(val); setMobileOpen(false); }}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {allCities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start text-sm"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
