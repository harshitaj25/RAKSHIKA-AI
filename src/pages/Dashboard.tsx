import { useState, useMemo } from "react";
import { BarChart3, TrendingDown, TrendingUp, Info, AlertTriangle, Search, Filter, MapPin, Clock, Shield, Users, FileWarning, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { type IncidentReport, type HeatmapPoint } from "@/lib/riskEngine";
import { useCity } from "@/hooks/useCity";
import { useRealTimeEvents } from "@/hooks/useRealTimeEvents";

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const mockTrendData = [
  { year: "2018", incidents: 33356 },
  { year: "2019", incidents: 32033 },
  { year: "2020", incidents: 28153 },
  { year: "2021", incidents: 29776 },
  { year: "2022", incidents: 31853 },
  { year: "2023", incidents: 30456 },
];

const crimeTypeDistribution = [
  { name: "Harassment", value: 8234, color: "#dc2626" },
  { name: "Stalking", value: 6543, color: "#f97316" },
  { name: "Domestic Violence", value: 7654, color: "#eab308" },
  { name: "Kidnapping", value: 3421, color: "#8b5cf6" },
  { name: "Cyber Crimes", value: 4654, color: "#3b82f6" },
  { name: "Eve Teasing", value: 5123, color: "#ec4899" },
];

const hourlyData = [
  { hour: "12AM", incidents: 45 },
  { hour: "2AM", incidents: 32 },
  { hour: "4AM", incidents: 18 },
  { hour: "6AM", incidents: 12 },
  { hour: "8AM", incidents: 15 },
  { hour: "10AM", incidents: 22 },
  { hour: "12PM", incidents: 28 },
  { hour: "2PM", incidents: 25 },
  { hour: "4PM", incidents: 30 },
  { hour: "6PM", incidents: 52 },
  { hour: "8PM", incidents: 78 },
  { hour: "10PM", incidents: 95 },
];

const monthlyData = [
  { month: "Jan", reports: 45, resolved: 38 },
  { month: "Feb", reports: 52, resolved: 44 },
  { month: "Mar", reports: 48, resolved: 41 },
  { month: "Apr", reports: 61, resolved: 50 },
  { month: "May", reports: 55, resolved: 48 },
  { month: "Jun", reports: 67, resolved: 55 },
  { month: "Jul", reports: 72, resolved: 60 },
  { month: "Aug", reports: 58, resolved: 52 },
  { month: "Sep", reports: 63, resolved: 56 },
  { month: "Oct", reports: 70, resolved: 58 },
  { month: "Nov", reports: 65, resolved: 55 },
  { month: "Dec", reports: 59, resolved: 50 },
];

const Dashboard = () => {
  const { city } = useCity();
  const { liveIncidents } = useRealTimeEvents();
  const [selectedYear, setSelectedYear] = useState("2023");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const filteredIncidents = useMemo(() => {
    return liveIncidents.filter((inc) => {
      if (filterStatus !== "all" && inc.status !== filterStatus) return false;
      if (filterSeverity !== "all" && inc.severity !== filterSeverity) return false;
      if (searchQuery && !inc.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !inc.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [filterStatus, filterSeverity, searchQuery]);

  const getTrendPercentage = () => {
    const current = mockTrendData.find((d) => d.year === selectedYear)?.incidents || 0;
    const previous = mockTrendData.find((d) => d.year === String(Number(selectedYear) - 1))?.incidents || 0;
    if (!previous) return "N/A";
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  const trendPercentage = getTrendPercentage();
  const isPositiveTrend = Number(trendPercentage) < 0;

  const severityColors: Record<string, string> = {
    low: "bg-green-500/10 text-green-500 border-green-500/30",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    critical: "bg-red-600/10 text-red-600 border-red-600/30",
  };

  const statusColors: Record<string, string> = {
    reported: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    investigating: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    resolved: "bg-green-500/10 text-green-500 border-green-500/30",
    dismissed: "bg-gray-500/10 text-gray-500 border-gray-500/30",
  };

  const overviewStats = {
    totalIncidents: liveIncidents.length,
    critical: liveIncidents.filter((i) => i.severity === "critical").length,
    investigating: liveIncidents.filter((i) => i.status === "investigating").length,
    resolved: liveIncidents.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 gradient-soft py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col items-center justify-center space-y-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="animate-pulse bg-red-500/10 text-red-500 border-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  LIVE FEED ACTIVE
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Admin Dashboard: {city.name}</h1>
              </div>
              <p className="text-muted-foreground">Comprehensive analytics for safety monitoring in {city.name}</p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="incidents">Incidents</TabsTrigger>
                <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="shadow-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileWarning className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{overviewStats.totalIncidents}</p>
                          <p className="text-xs text-muted-foreground">Total Reports</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-500">{overviewStats.critical}</p>
                          <p className="text-xs text-muted-foreground">Critical</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                          <Search className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-500">{overviewStats.investigating}</p>
                          <p className="text-xs text-muted-foreground">Investigating</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-500">{overviewStats.resolved}</p>
                          <p className="text-xs text-muted-foreground">Resolved</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trend + YoY */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="shadow-card border-0 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Incidents Trend (2018-2023)
                      </CardTitle>
                      <CardDescription>National Crime Records Bureau data — {city.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={mockTrendData}>
                          <defs>
                            <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="incidents"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#colorIncidents)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <Card className="shadow-card border-0">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Incidents ({selectedYear})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {mockTrendData.find((d) => d.year === selectedYear)?.incidents.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-card border-0">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Year-over-Year Change
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <div className={`text-3xl font-bold ${isPositiveTrend ? "text-green-500" : "text-destructive"}`}>
                            {trendPercentage}%
                          </div>
                          {isPositiveTrend ? (
                            <TrendingDown className="h-6 w-6 text-green-500" />
                          ) : (
                            <TrendingUp className="h-6 w-6 text-destructive" />
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-card border-0">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Select Year
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {mockTrendData.map((d) => (
                              <SelectItem key={d.year} value={d.year}>
                                {d.year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Crime Types Pie + Monthly Reports */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle>Crime Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={crimeTypeDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {crimeTypeDistribution.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle>Monthly Reports vs Resolved</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="reports" fill="hsl(var(--primary))" name="Reports" />
                          <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* INCIDENTS TAB */}
              <TabsContent value="incidents" className="space-y-6">
                {/* Filters */}
                <Card className="shadow-card border-0">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <Input
                          placeholder="Search by location or description..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="reported">Reported</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Severity</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Incidents Table */}
                <Card className="shadow-card border-0">
                  <CardHeader>
                    <CardTitle>Incident Reports ({filteredIncidents.length})</CardTitle>
                    <CardDescription>All reported safety incidents with status tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {filteredIncidents.map((inc) => (
                        <div key={inc.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">{inc.id}</span>
                              <Badge variant="outline" className={severityColors[inc.severity]}>
                                {inc.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className={statusColors[inc.status]}>
                                {inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {inc.date} {inc.time}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-medium">{inc.location}</span>
                              <Badge variant="secondary" className="text-xs">{inc.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">{inc.description}</p>
                            <p className="text-xs text-muted-foreground pl-6">
                              <Users className="h-3 w-3 inline mr-1" />
                              Reported by: {inc.reportedBy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* HOTSPOTS TAB */}
              <TabsContent value="hotspots" className="space-y-6">
                <Card className="shadow-card border-0 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Hotspot Analysis Map: {city.name}
                    </CardTitle>
                    <CardDescription>Visualization of crime hotspots across {city.name} region</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[500px] w-full">
                      <MapContainer
                        center={city.coords}
                        zoom={city.zoom}
                        key={`${city.id}-dashboard`}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {city.heatmapData.map((point, i) => (
                          <CircleMarker
                            key={i}
                            center={[point.lat, point.lng]}
                            radius={point.intensity * 20}
                            pathOptions={{
                              color: point.intensity >= 0.8 ? "#dc2626" : point.intensity >= 0.6 ? "#f97316" : "#eab308",
                              fillColor: point.intensity >= 0.8 ? "#dc2626" : point.intensity >= 0.6 ? "#f97316" : "#eab308",
                              fillOpacity: 0.4,
                            }}
                          >
                            <Popup>
                              <div>
                                <strong>{point.area}</strong><br />
                                Type: {point.crimeType}<br />
                                Incidents: {point.incidents}<br />
                                Peak: {point.timeRange}
                              </div>
                            </Popup>
                          </CircleMarker>
                        ))}
                      </MapContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ANALYTICS TAB */}
              <TabsContent value="analytics" className="space-y-6">
                {/* Hourly Pattern */}
                <Card className="shadow-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Hourly Incident Pattern
                    </CardTitle>
                    <CardDescription>When do most incidents occur — critical for patrol planning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={hourlyData}>
                        <defs>
                          <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="incidents"
                          stroke="#dc2626"
                          fillOpacity={1}
                          fill="url(#colorHourly)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Crime Types Bar */}
                <Card className="shadow-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Crime Types Distribution ({selectedYear})
                    </CardTitle>
                    <CardDescription>Breakdown by type of incident</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={crimeTypeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Incidents">
                          {crimeTypeDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <Card className="shadow-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: "Peak Crime Hours", value: city.id === "delhi" ? "8 PM - 12 AM" : "7 PM - 11 PM", icon: Clock, detail: city.id === "delhi" ? "78% of incidents occur between evening and midnight" : "65% of incidents occur in late evening hours" },
                        { label: "Most Affected Area", value: city.id === "delhi" ? "Old Delhi" : "Malviya Nagar", icon: MapPin, detail: city.id === "delhi" ? "167 incidents reported in the last recorded period" : "High density of reports near commercial hubs" },
                        { label: "Top Crime Type", value: "Harassment", icon: AlertTriangle, detail: "Accounts for 23% of all reported incidents" },
                        { label: "Resolution Rate", value: city.id === "delhi" ? "72%" : "81%", icon: CheckCircle, detail: "Cases resolved within 30 days of reporting" },
                      ].map((insight, i) => (
                        <div key={i} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <insight.icon className="h-4 w-4 text-primary" />
                            <p className="text-sm text-muted-foreground">{insight.label}</p>
                          </div>
                          <p className="text-xl font-bold text-foreground">{insight.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{insight.detail}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Data Source */}
            <Card className="shadow-card border-0 bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Data Source</p>
                    <p className="text-xs text-muted-foreground">
                      All statistics are based on National Crime Records Bureau (NCRB) India data and represent
                      reported incidents in {city.name}. This dashboard is designed for awareness, educational purposes,
                      and NGO/police simulation. Incident reports are simulated for demonstration.
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

export default Dashboard;
