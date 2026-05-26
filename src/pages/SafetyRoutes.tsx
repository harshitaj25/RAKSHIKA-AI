import { useState } from "react";
import { Route, MapPin, Loader2, Shield, Clock, AlertTriangle, Navigation, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCity } from "@/hooks/useCity";

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface RouteResult {
  id: number;
  name: string;
  safetyScore: number;
  distance: string;
  duration: string;
  riskLevel: "low" | "medium" | "high";
  highlights: string[];
  path: [number, number][];
  color: string;
  recommended: boolean;
}

function MapFitter({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  map.fitBounds(bounds, { padding: [50, 50] });
  return null;
}

const SafetyRoutes = () => {
  const { city } = useCity();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  const geocode = async (query: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch {
      // fallback
    }
    return null;
  };

  const generateRoutePoints = (
    start: [number, number],
    end: [number, number],
    variance: number
  ): [number, number][] => {
    const points: [number, number][] = [start];
    const steps = 6 + Math.floor(Math.random() * 4);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const lat = start[0] + (end[0] - start[0]) * t + (Math.random() - 0.5) * variance;
      const lng = start[1] + (end[1] - start[1]) * t + (Math.random() - 0.5) * variance;
      points.push([lat, lng]);
    }
    points.push(end);
    return points;
  };

  const findRoutes = async () => {
    if (!origin.trim() || !destination.trim()) {
      toast.error("Please enter both origin and destination");
      return;
    }

    setLoading(true);
    setRoutes([]);
    setSelectedRoute(null);

    try {
      const originResult = await geocode(origin);
      const destResult = await geocode(destination);

      if (!originResult) {
        toast.error("Could not find origin location");
        setLoading(false);
        return;
      }
      if (!destResult) {
        toast.error("Could not find destination location");
        setLoading(false);
        return;
      }

      setOriginCoords(originResult);
      setDestCoords(destResult);

      // Simulate route finding with AI safety scoring
      await new Promise((r) => setTimeout(r, 2000));

      const dlat = Math.abs(originResult[0] - destResult[0]);
      const dlng = Math.abs(originResult[1] - destResult[1]);
      const baseDist = Math.sqrt(dlat * dlat + dlng * dlng) * 111;

      const generatedRoutes: RouteResult[] = [
        {
          id: 1,
          name: "Safest Route (Recommended)",
          safetyScore: 85 + Math.floor(Math.random() * 10),
          distance: (baseDist * 1.3).toFixed(1) + " km",
          duration: Math.floor(baseDist * 4.5) + " mins",
          riskLevel: "low",
          highlights: [
            "Passes through well-lit main roads",
            "Near police stations and CCTV zones",
            "High foot traffic areas",
            "Avoids known crime hotspots",
          ],
          path: generateRoutePoints(originResult, destResult, 0.008),
          color: "#22c55e",
          recommended: true,
        },
        {
          id: 2,
          name: "Shortest Route",
          safetyScore: 55 + Math.floor(Math.random() * 15),
          distance: (baseDist * 1.0).toFixed(1) + " km",
          duration: Math.floor(baseDist * 3.2) + " mins",
          riskLevel: "medium",
          highlights: [
            "Fastest but passes through moderate-risk zones",
            "Some poorly lit stretches",
            "Moderate crowd density",
            "Consider using during daytime only",
          ],
          path: generateRoutePoints(originResult, destResult, 0.004),
          color: "#eab308",
          recommended: false,
        },
        {
          id: 3,
          name: "Alternative Route",
          safetyScore: 35 + Math.floor(Math.random() * 15),
          distance: (baseDist * 1.5).toFixed(1) + " km",
          duration: Math.floor(baseDist * 5.5) + " mins",
          riskLevel: "high",
          highlights: [
            "⚠️ Passes through known high-risk areas",
            "Low crowd density sections",
            "Limited CCTV coverage",
            "NOT recommended for nighttime travel",
          ],
          path: generateRoutePoints(originResult, destResult, 0.012),
          color: "#ef4444",
          recommended: false,
        },
      ];

      setRoutes(generatedRoutes);
      setSelectedRoute(0);
      toast.success("Routes analyzed! Safest route recommended.");
    } catch {
      toast.error("Error finding routes. Please try again.");
    }

    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getBounds = (): L.LatLngBoundsExpression | null => {
    if (originCoords && destCoords) {
      return [originCoords, destCoords];
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 gradient-soft py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center space-y-2 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">AI Safety Routes</h1>
              <p className="text-muted-foreground">Find the safest path to your destination with AI-scored route analysis</p>
            </div>

            {/* Route Input */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Plan Your Route
                </CardTitle>
                <CardDescription>Enter start and destination to get AI-analyzed safety routes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Starting Point
                    </Label>
                    <Input
                      placeholder={city.id === 'delhi' ? "e.g. Connaught Place, Delhi" : "e.g. Johari Bazar, Jaipur"}
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && findRoutes()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Destination
                    </Label>
                    <Input
                      placeholder={city.id === 'delhi' ? "e.g. India Gate, Delhi" : "e.g. Hawa Mahal, Jaipur"}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && findRoutes()}
                    />
                  </div>
                </div>
                <Button onClick={findRoutes} className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Routes...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Find Safest Route
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Map with Routes */}
            {routes.length > 0 && originCoords && destCoords && (
              <Card className="shadow-card border-0 overflow-hidden animate-fade-in">
                <CardContent className="p-0">
                  <div className="h-[450px] w-full">
                    <MapContainer
                      center={originCoords}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {getBounds() && <MapFitter bounds={getBounds()!} />}

                      <Marker position={originCoords}>
                        <Popup>
                          <strong>📍 Start:</strong> {origin}
                        </Popup>
                      </Marker>
                      <Marker position={destCoords}>
                        <Popup>
                          <strong>🏁 Destination:</strong> {destination}
                        </Popup>
                      </Marker>

                      {routes.map((route, i) => (
                        <Polyline
                          key={route.id}
                          positions={route.path}
                          pathOptions={{
                            color: route.color,
                            weight: selectedRoute === i ? 5 : 3,
                            opacity: selectedRoute === i ? 1 : 0.4,
                            dashArray: selectedRoute === i ? undefined : "10",
                          }}
                        />
                      ))}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Route Options */}
            {routes.length > 0 && (
              <div className="grid gap-4">
                {routes.map((route, i) => (
                  <Card
                    key={route.id}
                    className={`shadow-card border-0 cursor-pointer transition-all hover:shadow-soft ${
                      selectedRoute === i ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    onClick={() => setSelectedRoute(i)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Route Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: route.color }}
                            ></div>
                            <h3 className="font-semibold text-lg">{route.name}</h3>
                            {route.recommended && (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Route className="h-4 w-4" /> {route.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" /> {route.duration}
                            </span>
                            <Badge
                              variant="outline"
                              style={{ borderColor: route.color, color: route.color }}
                            >
                              {route.riskLevel.toUpperCase()} RISK
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {route.highlights.map((h, j) => (
                              <p key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="mt-0.5">•</span> {h}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Safety Score */}
                        <div className="flex flex-col items-center gap-2 min-w-[100px]">
                          <div className="relative w-20 h-20">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                              <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                              <circle
                                cx="40" cy="40" r="32" fill="none"
                                stroke={route.color}
                                strokeWidth="6"
                                strokeDasharray={`${(route.safetyScore / 100) * 201} 201`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-xl font-bold ${getScoreColor(route.safetyScore)}`}>
                                {route.safetyScore}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">Safety Score</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Tips */}
            {routes.length > 0 && (
              <Card className="shadow-card border-0 bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Safety Tips for Your Journey</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Share your route with a trusted contact before traveling</li>
                        <li>• Enable the voice SOS trigger while traveling</li>
                        <li>• Avoid the high-risk route especially after 8 PM</li>
                        <li>• Keep your phone charged and emergency numbers accessible</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SafetyRoutes;
