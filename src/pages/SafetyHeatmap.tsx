import { useState, useMemo } from "react";
import { Map, Filter, Info, AlertTriangle, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { type HeatmapPoint } from "@/lib/riskEngine";
import { useCity } from "@/hooks/useCity";

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function getIntensityColor(intensity: number): string {
  if (intensity >= 0.85) return "#dc2626"; // red
  if (intensity >= 0.7) return "#f97316"; // orange
  if (intensity >= 0.5) return "#eab308"; // yellow
  return "#22c55e"; // green
}

function getIntensityLabel(intensity: number): string {
  if (intensity >= 0.85) return "Critical";
  if (intensity >= 0.7) return "High";
  if (intensity >= 0.5) return "Medium";
  return "Low";
}

const SafetyHeatmap = () => {
  const { city } = useCity();
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const filteredData = useMemo(() => {
    return city.heatmapData.filter((point) => {
      if (filterType !== "all" && point.crimeType !== filterType) return false;
      if (filterSeverity === "high" && point.intensity < 0.7) return false;
      if (filterSeverity === "medium" && (point.intensity < 0.5 || point.intensity >= 0.7)) return false;
      if (filterSeverity === "low" && point.intensity >= 0.5) return false;
      return true;
    });
  }, [filterType, filterSeverity]);

  const crimeTypes = [...new Set(city.heatmapData.map((d) => d.crimeType))];

  const stats = useMemo(() => {
    const total = city.heatmapData.reduce((sum, d) => sum + d.incidents, 0);
    const critical = city.heatmapData.filter((d) => d.intensity >= 0.85).length;
    const high = city.heatmapData.filter((d) => d.intensity >= 0.7 && d.intensity < 0.85).length;
    return { total, critical, high, zones: city.heatmapData.length };
  }, [city]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 gradient-soft py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-2 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Safety Heatmap: {city.name}</h1>
              <p className="text-muted-foreground">Interactive danger zone visualization across {city.name}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.zones}</p>
                  <p className="text-xs text-muted-foreground">Monitored Zones</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
                  <p className="text-xs text-muted-foreground">Critical Zones</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">{stats.high}</p>
                  <p className="text-xs text-muted-foreground">High Risk Zones</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Incidents</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="shadow-card border-0">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Crime Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Crime Types</SelectItem>
                      {crimeTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="high">Critical & High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-600"></div>
                      <span className="text-xs">Critical</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-xs">High</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs">Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs">Low</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="shadow-card border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[500px] w-full">
                  <MapContainer
                    center={city.coords}
                    zoom={city.zoom}
                    key={`${city.id}-${city.coords[0]}`} // Force re-render on city change
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredData.map((point, index) => (
                      <CircleMarker
                        key={index}
                        center={[point.lat, point.lng]}
                        radius={point.intensity * 25}
                        pathOptions={{
                          color: getIntensityColor(point.intensity),
                          fillColor: getIntensityColor(point.intensity),
                          fillOpacity: 0.5,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="min-w-[200px]">
                            <h3 className="font-bold text-base mb-2">{point.area}</h3>
                            <div className="space-y-1 text-sm">
                              <p className="flex items-center gap-1">
                                <strong>Crime Type:</strong> {point.crimeType}
                              </p>
                              <p className="flex items-center gap-1">
                                <strong>Risk Level:</strong>{" "}
                                <span style={{ color: getIntensityColor(point.intensity), fontWeight: "bold" }}>
                                  {getIntensityLabel(point.intensity)}
                                </span>
                              </p>
                              <p><strong>Incidents:</strong> {point.incidents}</p>
                              <p><strong>Peak Time:</strong> {point.timeRange}</p>
                              <p><strong>Intensity:</strong> {(point.intensity * 100).toFixed(0)}%</p>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>

            {/* Hotspot List */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Top Danger Zones
                </CardTitle>
                <CardDescription>Areas with highest reported incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...filteredData]
                    .sort((a, b) => b.intensity - a.intensity)
                    .slice(0, 8)
                    .map((point, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getIntensityColor(point.intensity) }}
                          ></div>
                          <div>
                            <p className="font-medium text-sm">{point.area}</p>
                            <p className="text-xs text-muted-foreground">{point.crimeType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">{point.incidents} incidents</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {point.timeRange}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: getIntensityColor(point.intensity),
                              color: getIntensityColor(point.intensity),
                            }}
                          >
                            {getIntensityLabel(point.intensity)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Source */}
            <Card className="shadow-card border-0 bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Data Source</p>
                    <p className="text-xs text-muted-foreground">
                      Heatmap data is based on NCRB crime statistics and simulated incident reports for {city.name} region.
                      This visualization is for awareness and educational purposes. Real-time data integration with police
                      APIs planned for future versions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SafetyHeatmap;
