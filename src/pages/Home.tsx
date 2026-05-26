import { MapPin, AlertCircle, BarChart3, Map, Route, Shield, Mic, Lock, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Home = () => {
  const actionCards = [
    {
      icon: MapPin,
      title: "Check Area Risk",
      description: "Get AI-powered safety insights for any location with real-time risk scoring",
      link: "/risk-prediction",
      color: "bg-primary/10 hover:bg-primary/20",
      iconColor: "text-primary",
    },
    {
      icon: AlertCircle,
      title: "Send SOS Alert",
      description: "Instant emergency alerts with voice trigger — just say \"Help me\"",
      link: "/sos-alert",
      color: "bg-destructive/10 hover:bg-destructive/20",
      iconColor: "text-destructive",
    },
    {
      icon: Map,
      title: "Safety Heatmap",
      description: "View interactive danger zone maps with real-time hotspot data",
      link: "/safety-heatmap",
      color: "bg-orange-500/10 hover:bg-orange-500/20",
      iconColor: "text-orange-500",
    },
    {
      icon: Route,
      title: "Safe Routes",
      description: "Find the safest path to your destination with AI-scored routes",
      link: "/safety-routes",
      color: "bg-green-500/10 hover:bg-green-500/20",
      iconColor: "text-green-500",
    },
    {
      icon: FileText,
      title: "Location Logs",
      description: "Encrypted history of your location checks for personal safety",
      link: "/location-logs",
      color: "bg-blue-500/10 hover:bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      icon: BarChart3,
      title: "Admin Dashboard",
      description: "Analyze reports, hotspots, and incidents with detailed analytics",
      link: "/dashboard",
      color: "bg-accent/10 hover:bg-accent/20",
      iconColor: "text-accent",
    },
  ];

  const features = [
    { icon: Mic, title: "Voice Activated SOS", desc: "Say \"Help me\" or \"Bachao\" to auto-trigger emergency alerts via Web Speech API" },
    { icon: Shield, title: "AI Risk Prediction", desc: "ML model analyzes location type, time, crime index, crowd density & lighting" },
    { icon: Map, title: "Interactive Heatmaps", desc: "Leaflet.js powered maps showing real-time danger zones across the city" },
    { icon: Lock, title: "Encrypted Logs", desc: "All location data is encrypted before storage for maximum privacy" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="gradient-soft min-h-[60vh] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl animate-wave"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-wave" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-destructive rounded-full blur-3xl animate-wave" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                AI-Powered Women's Safety Platform
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Welcome to <span className="text-primary">Rakshika AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Your Smart Safety Companion
              </p>
              <p className="text-base md:text-lg text-muted-foreground italic">
                "Empowering Women Through AI and Awareness"
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link to="/risk-prediction">
                  <Button size="lg" className="shadow-soft text-base px-8">
                    <MapPin className="mr-2 h-5 w-5" />
                    Check Location Risk
                  </Button>
                </Link>
                <Link to="/sos-alert">
                  <Button size="lg" variant="destructive" className="text-base px-8">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Emergency SOS
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6 -mt-32 relative z-20">
            {actionCards.map((card, index) => (
              <Link key={index} to={card.link}>
                <Card className={`${card.color} transition-all duration-300 hover:shadow-soft hover:scale-105 cursor-pointer h-full border-0`}>
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background shadow-card">
                      <card.icon className={`h-8 w-8 ${card.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
                    <p className="text-muted-foreground text-sm">{card.description}</p>
                    <Button className="w-full mt-4" variant="default">
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">How SAFER Protects You</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge AI and real-time data analysis to keep you safe wherever you go
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-0 shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary mx-auto flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="container mx-auto px-4 py-12 pb-20">
          <Card className="border-0 shadow-card bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center text-foreground mb-6">Tech Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { name: "React.js", desc: "Frontend UI" },
                  { name: "Tailwind CSS", desc: "Styling" },
                  { name: "Leaflet.js", desc: "Interactive Maps" },
                  { name: "Web Speech API", desc: "Voice Triggers" },
                  { name: "Python Flask", desc: "ML Risk API" },
                  { name: "scikit-learn", desc: "AI/ML Models" },
                  { name: "Supabase", desc: "Database" },
                  { name: "Recharts", desc: "Data Viz" },
                ].map((tech, i) => (
                  <div key={i} className="p-3 rounded-lg bg-background/50">
                    <p className="font-semibold text-primary text-sm">{tech.name}</p>
                    <p className="text-xs text-muted-foreground">{tech.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
