import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, Clock, Users, Sun, Building2, AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { predictRisk, type RiskResult, type RiskLevel, saveLocationLog } from "@/lib/riskEngine";
import { useCity } from "@/hooks/useCity";

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

const RiskPrediction = () => {
  const { city } = useCity();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [locationType, setLocationType] = useState("unknown");
  const [crowdLevel, setCrowdLevel] = useState("moderate");
  const [lightingCondition, setLightingCondition] = useState("moderate");
  const [mapCenter, setMapCenter] = useState<[number, number]>(city.coords);
  const [showMap, setShowMap] = useState(false);
  const [locationName, setLocationName] = useState("");

  // Update map center if city changes and no location is selected
  useEffect(() => {
    if (!latitude || !longitude) {
      setMapCenter(city.coords);
    }
  }, [city, latitude, longitude]);

  const detectLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setShowMap(true);
          setLoading(false);
          toast.success("Location detected successfully!");
        },
        () => {
          setLoading(false);
          toast.error("Unable to detect location. Please enter manually.");
        }
      );
    } else {
      setLoading(false);
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const searchLocation = async () => {
    if (!locationName.trim()) {
      toast.error("Please enter a location name");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setLatitude(parseFloat(data[0].lat).toFixed(6));
        setLongitude(parseFloat(data[0].lon).toFixed(6));
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setShowMap(true);
        toast.success(`Found: ${data[0].display_name.split(",").slice(0, 3).join(",")}`);
      } else {
        toast.error("Location not found. Try a different search.");
      }
    } catch {
      toast.error("Search failed. Please try coordinates.");
    }
    setLoading(false);
  };

  const checkRisk = () => {
    if (!latitude || !longitude) {
      toast.error("Please enter or detect location first.");
      return;
    }

    setLoading(true);
    setShowMap(true);
    setMapCenter([parseFloat(latitude), parseFloat(longitude)]);

    // Simulate API call delay
    setTimeout(() => {
      const currentHour = new Date().getHours();
      const crimeIndex = Math.floor(Math.random() * 10) + 1;

      const result = predictRisk({
        locationType,
        hour: currentHour,
        crimeIndex,
        crowdLevel,
        lightingCondition,
      });

      setRiskResult(result);
      setLoading(false);
      toast.success("Risk analysis complete!");

      // Save to encrypted logs
      saveLocationLog({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        riskLevel: result.level,
        riskScore: result.score,
        encrypted: true,
      });
    }, 1500);
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "low": return { bg: "bg-green-500", text: "text-green-500", hex: "#22c55e" };
      case "medium": return { bg: "bg-yellow-500", text: "text-yellow-500", hex: "#eab308" };
      case "high": return { bg: "bg-orange-500", text: "text-orange-500", hex: "#f97316" };
      case "critical": return { bg: "bg-red-600", text: "text-red-600", hex: "#dc2626" };
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case "low": return <ShieldCheck className="h-8 w-8 text-green-500" />;
      case "medium": return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case "high": return <ShieldAlert className="h-8 w-8 text-orange-500" />;
      case "critical": return <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 gradient-soft py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">AI Risk Prediction</h1>
              <p className="text-muted-foreground">Get AI-powered safety insights using our ML risk scoring engine</p>
            </div>

            {/* Location Search */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Enter Location
                </CardTitle>
                <CardDescription>Search by name, enter coordinates, or detect your current location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Name Search */}
                <div className="space-y-2">
                  <Label htmlFor="locationName">Search Location by Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="locationName"
                      placeholder={city.id === 'delhi' ? "e.g. Connaught Place Delhi, Paharganj..." : "e.g. Malviya Nagar Jaipur, C-Scheme..."}
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchLocation()}
                    />
                    <Button onClick={searchLocation} disabled={loading} variant="outline">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                    </Button>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      placeholder="28.7041"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      step="any"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      placeholder="77.1025"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      step="any"
                    />
                  </div>
                </div>

                <Button
                  onClick={detectLocation}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  Detect My Location (GPS)
                </Button>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Risk Factors (ML Model Input)
                </CardTitle>
                <CardDescription>These parameters feed into our AI risk prediction model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Location Type
                    </Label>
                    <Select value={locationType} onValueChange={setLocationType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unknown">Auto Detect</SelectItem>
                        <SelectItem value="railway_station">Railway Station</SelectItem>
                        <SelectItem value="bus_stop">Bus Stop</SelectItem>
                        <SelectItem value="metro_station">Metro Station</SelectItem>
                        <SelectItem value="alley">Alley / Narrow Lane</SelectItem>
                        <SelectItem value="park">Park / Garden</SelectItem>
                        <SelectItem value="market">Market / Bazaar</SelectItem>
                        <SelectItem value="residential">Residential Area</SelectItem>
                        <SelectItem value="highway">Highway / Road</SelectItem>
                        <SelectItem value="college">College / University</SelectItem>
                        <SelectItem value="office">Office Area</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="mall">Shopping Mall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Crowd Density
                    </Label>
                    <Select value={crowdLevel} onValueChange={setCrowdLevel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">Empty / Deserted</SelectItem>
                        <SelectItem value="low">Low Crowd</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">Crowded</SelectItem>
                        <SelectItem value="very_high">Very Crowded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Lighting Condition
                    </Label>
                    <Select value={lightingCondition} onValueChange={setLightingCondition}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="well_lit">Well Lit</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="dim">Dim / Poor</SelectItem>
                        <SelectItem value="dark">Dark / No Light</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Current Time: <strong>{new Date().toLocaleTimeString()}</strong> (auto-detected for risk calculation)
                  </span>
                </div>

                <Button onClick={checkRisk} className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShieldAlert className="mr-2 h-5 w-5" />
                  )}
                  Analyze Risk Level
                </Button>
              </CardContent>
            </Card>

            {/* Map Display */}
            {showMap && (
              <Card className="shadow-card border-0 overflow-hidden animate-fade-in">
                <CardContent className="p-0">
                  <div className="h-[400px] w-full">
                    <MapContainer
                      center={mapCenter}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapUpdater center={mapCenter} />
                      <Marker position={mapCenter}>
                        <Popup>
                          <div className="text-center">
                            <strong>Selected Location</strong><br />
                            Lat: {mapCenter[0].toFixed(4)}, Lng: {mapCenter[1].toFixed(4)}
                            {riskResult && (
                              <div className="mt-2">
                                <strong>Risk: {riskResult.level.toUpperCase()}</strong><br />
                                Score: {riskResult.score}/100
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                      {riskResult && (
                        <Circle
                          center={mapCenter}
                          radius={500}
                          pathOptions={{
                            color: getRiskColor(riskResult.level).hex,
                            fillColor: getRiskColor(riskResult.level).hex,
                            fillOpacity: 0.2,
                          }}
                        />
                      )}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Result */}
            {riskResult && (
              <Card className="shadow-card border-0 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {getRiskIcon(riskResult.level)}
                    Risk Assessment Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Risk Score */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                        <circle
                          cx="60" cy="60" r="50" fill="none"
                          stroke={getRiskColor(riskResult.level).hex}
                          strokeWidth="10"
                          strokeDasharray={`${(riskResult.score / 100) * 314} 314`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getRiskColor(riskResult.level).text}`}>
                          {riskResult.score}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                      </div>
                    </div>
                    <Badge className={`${getRiskColor(riskResult.level).bg} text-white text-lg py-2 px-6`}>
                      {riskResult.level.toUpperCase()} RISK
                    </Badge>
                  </div>

                  {/* AI Insight */}
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-foreground">
                      <strong>🧠 AI Insight:</strong> {riskResult.insight}
                    </p>
                  </div>

                  {/* Factor Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Risk Factor Breakdown</h4>
                    {riskResult.factors.map((factor, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{factor.label}</span>
                          <span className="font-medium">{factor.value}%</span>
                        </div>
                        <Progress value={factor.value} className="h-2" />
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">🛡️ Safety Recommendations</h4>
                    <div className="grid gap-2">
                      {riskResult.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm text-muted-foreground">{rec}</span>
                        </div>
                      ))}
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

export default RiskPrediction;
