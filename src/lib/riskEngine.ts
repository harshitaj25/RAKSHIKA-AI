// AI Risk Prediction Engine - Simulates Flask ML API
// Predicts safety risk based on location type, time, crime index, crowd level, lighting

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskFactors {
  locationType: string;
  hour: number;
  crimeIndex: number;
  crowdLevel: string;
  lightingCondition: string;
}

export interface RiskResult {
  level: RiskLevel;
  score: number; // 0-100
  insight: string;
  recommendations: string[];
  factors: {
    label: string;
    value: number;
    maxValue: number;
  }[];
}

// Location types with base risk scores
const locationRiskMap: Record<string, number> = {
  "railway_station": 65,
  "bus_stop": 55,
  "metro_station": 40,
  "alley": 80,
  "park": 50,
  "market": 35,
  "residential": 30,
  "highway": 70,
  "college": 25,
  "office": 20,
  "hospital": 15,
  "mall": 25,
  "temple": 20,
  "unknown": 50,
};

// Time risk multiplier (0-23 hours)
function getTimeRisk(hour: number): number {
  if (hour >= 0 && hour < 5) return 90;
  if (hour >= 5 && hour < 7) return 60;
  if (hour >= 7 && hour < 9) return 25;
  if (hour >= 9 && hour < 17) return 15;
  if (hour >= 17 && hour < 19) return 30;
  if (hour >= 19 && hour < 21) return 55;
  if (hour >= 21 && hour < 23) return 75;
  return 85; // 23-0
}

// Crowd level risk
function getCrowdRisk(level: string): number {
  switch (level) {
    case "empty": return 90;
    case "low": return 65;
    case "moderate": return 35;
    case "high": return 15;
    case "very_high": return 10;
    default: return 50;
  }
}

// Lighting condition risk
function getLightingRisk(condition: string): number {
  switch (condition) {
    case "well_lit": return 10;
    case "moderate": return 35;
    case "dim": return 65;
    case "dark": return 90;
    default: return 50;
  }
}

function getInsight(level: RiskLevel, locationType: string, hour: number): string {
  const timeStr = hour >= 19 || hour < 6 ? "nighttime" : hour >= 6 && hour < 12 ? "morning" : "daytime";
  
  switch (level) {
    case "critical":
      return `⚠️ CRITICAL: This ${locationType.replace("_", " ")} area is extremely unsafe during ${timeStr}. Avoid if possible. Crime index is very high and conditions are dangerous.`;
    case "high":
      return `🔴 HIGH RISK: This ${locationType.replace("_", " ")} has significant safety concerns during ${timeStr}. Multiple risk factors detected. Travel with companions and stay alert.`;
    case "medium":
      return `🟡 MODERATE RISK: This ${locationType.replace("_", " ")} shows moderate risk levels. Higher incidents reported during ${timeStr} hours. Stay cautious and keep emergency contacts ready.`;
    case "low":
      return `🟢 LOW RISK: This ${locationType.replace("_", " ")} is relatively safe during ${timeStr}. Minimal reported incidents. Standard precautions recommended.`;
  }
}

function getRecommendations(level: RiskLevel, factors: RiskFactors): string[] {
  const base = [
    "Keep your emergency contacts updated",
    "Share your live location with a trusted contact",
  ];

  if (level === "critical" || level === "high") {
    return [
      "🚨 Avoid traveling alone in this area",
      "📱 Keep SOS alert ready on your phone",
      "🚕 Use verified cab services instead of walking",
      "📍 Share real-time location with family/friends",
      "🔦 Carry a flashlight or use phone torch",
      "👥 Travel in groups whenever possible",
      ...base,
    ];
  }

  if (level === "medium") {
    return [
      "⚡ Stay in well-lit areas",
      "📱 Keep your phone charged and accessible",
      "🗺️ Stick to main roads and busy routes",
      "⏰ Avoid unnecessary late-night travel",
      ...base,
    ];
  }

  return [
    "✅ Area is generally safe",
    "📱 Keep your phone accessible just in case",
    "🗺️ Follow standard safety practices",
    ...base,
  ];
}

export function predictRisk(factors: RiskFactors): RiskResult {
  const baseRisk = locationRiskMap[factors.locationType] || 50;
  const timeRisk = getTimeRisk(factors.hour);
  const crowdRisk = getCrowdRisk(factors.crowdLevel);
  const lightRisk = getLightingRisk(factors.lightingCondition);
  const crimeRisk = Math.min(factors.crimeIndex * 10, 100);

  // Weighted average
  const score = Math.round(
    baseRisk * 0.2 +
    timeRisk * 0.25 +
    crimeRisk * 0.25 +
    crowdRisk * 0.15 +
    lightRisk * 0.15
  );

  let level: RiskLevel;
  if (score >= 75) level = "critical";
  else if (score >= 55) level = "high";
  else if (score >= 35) level = "medium";
  else level = "low";

  return {
    level,
    score,
    insight: getInsight(level, factors.locationType, factors.hour),
    recommendations: getRecommendations(level, factors),
    factors: [
      { label: "Location Type", value: baseRisk, maxValue: 100 },
      { label: "Time of Day", value: timeRisk, maxValue: 100 },
      { label: "Crime Index", value: crimeRisk, maxValue: 100 },
      { label: "Crowd Density", value: crowdRisk, maxValue: 100 },
      { label: "Lighting", value: lightRisk, maxValue: 100 },
    ],
  };
}

// Heatmap data points
export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  area: string;
  crimeType: string;
  incidents: number;
  timeRange: string;
}

export const delhiHeatmapData: HeatmapPoint[] = [
  { lat: 28.6448, lng: 77.2167, intensity: 0.9, area: "Connaught Place", crimeType: "Harassment", incidents: 145, timeRange: "8PM-12AM" },
  { lat: 28.6328, lng: 77.2197, intensity: 0.85, area: "Paharganj", crimeType: "Theft & Assault", incidents: 132, timeRange: "9PM-2AM" },
  { lat: 28.5672, lng: 77.2100, intensity: 0.75, area: "Saket", crimeType: "Stalking", incidents: 89, timeRange: "7PM-11PM" },
  { lat: 28.6129, lng: 77.2295, intensity: 0.95, area: "Old Delhi", crimeType: "Chain Snatching", incidents: 167, timeRange: "6PM-1AM" },
  { lat: 28.6692, lng: 77.4538, intensity: 0.7, area: "Noida Sec 62", crimeType: "Eve Teasing", incidents: 78, timeRange: "8PM-11PM" },
  { lat: 28.4595, lng: 77.0266, intensity: 0.8, area: "Gurugram Sector 29", crimeType: "Assault", incidents: 112, timeRange: "10PM-3AM" },
  { lat: 28.7041, lng: 77.1025, intensity: 0.65, area: "Civil Lines", crimeType: "Stalking", incidents: 56, timeRange: "7PM-10PM" },
  { lat: 28.5355, lng: 77.3910, intensity: 0.72, area: "Greater Noida", crimeType: "Harassment", incidents: 67, timeRange: "9PM-12AM" },
  { lat: 28.6304, lng: 77.0851, intensity: 0.6, area: "Rajouri Garden", crimeType: "Eve Teasing", incidents: 45, timeRange: "6PM-10PM" },
  { lat: 28.6850, lng: 77.3187, intensity: 0.88, area: "Shahdara", crimeType: "Assault", incidents: 134, timeRange: "8PM-2AM" },
  { lat: 28.5494, lng: 77.2001, intensity: 0.55, area: "Hauz Khas", crimeType: "Stalking", incidents: 38, timeRange: "10PM-1AM" },
  { lat: 28.6280, lng: 77.3649, intensity: 0.78, area: "Anand Vihar", crimeType: "Chain Snatching", incidents: 98, timeRange: "7PM-11PM" },
  { lat: 28.6139, lng: 77.2090, intensity: 0.92, area: "Karol Bagh", crimeType: "Harassment", incidents: 156, timeRange: "8PM-1AM" },
  { lat: 28.5921, lng: 77.0460, intensity: 0.68, area: "Dwarka", crimeType: "Eve Teasing", incidents: 72, timeRange: "7PM-11PM" },
  { lat: 28.6618, lng: 77.2273, intensity: 0.82, area: "Chandni Chowk", crimeType: "Theft", incidents: 124, timeRange: "6PM-12AM" },
  { lat: 28.5245, lng: 77.1855, intensity: 0.45, area: "Vasant Kunj", crimeType: "Stalking", incidents: 28, timeRange: "9PM-12AM" },
  { lat: 28.6508, lng: 77.1855, intensity: 0.58, area: "Patel Nagar", crimeType: "Eve Teasing", incidents: 42, timeRange: "7PM-10PM" },
  { lat: 28.7495, lng: 77.1183, intensity: 0.76, area: "Jahangirpuri", crimeType: "Assault", incidents: 95, timeRange: "8PM-2AM" },
  { lat: 28.5013, lng: 77.2719, intensity: 0.62, area: "Faridabad", crimeType: "Harassment", incidents: 55, timeRange: "8PM-11PM" },
  { lat: 28.4089, lng: 77.3178, intensity: 0.71, area: "Palwal", crimeType: "Assault", incidents: 68, timeRange: "9PM-1AM" },
];

export const jaipurHeatmapData: HeatmapPoint[] = [
  { lat: 26.9124, lng: 75.7873, intensity: 0.85, area: "Pink City (Johari Bazar)", crimeType: "Theft & Harassment", incidents: 112, timeRange: "6PM-10PM" },
  { lat: 26.9110, lng: 75.8030, intensity: 0.65, area: "C-Scheme", crimeType: "Stalking", incidents: 45, timeRange: "8PM-12AM" },
  { lat: 26.8530, lng: 75.8240, intensity: 0.9, area: "Malviya Nagar (GT)", crimeType: "Eve Teasing", incidents: 134, timeRange: "7PM-11PM" },
  { lat: 26.8500, lng: 75.7600, intensity: 0.75, area: "Mansarovar", crimeType: "Harassment", incidents: 88, timeRange: "8PM-1AM" },
  { lat: 26.8980, lng: 75.8200, intensity: 0.8, area: "Raja Park", crimeType: "Stalking", incidents: 92, timeRange: "7PM-11PM" },
  { lat: 26.9070, lng: 75.7360, intensity: 0.72, area: "Vaishali Nagar", crimeType: "Chain Snatching", incidents: 67, timeRange: "8PM-12AM" },
  { lat: 26.8700, lng: 75.8000, intensity: 0.68, area: "Tonk Road", crimeType: "Harassment", incidents: 54, timeRange: "9PM-2AM" },
  { lat: 26.9850, lng: 75.8510, intensity: 0.55, area: "Amer Road", crimeType: "Theft", incidents: 32, timeRange: "6PM-9PM" },
  { lat: 26.9400, lng: 75.7200, intensity: 0.78, area: "Jhotwara", crimeType: "Assault", incidents: 76, timeRange: "8PM-1AM" },
  { lat: 26.8200, lng: 75.7800, intensity: 0.7, area: "Sanganer", crimeType: "Eve Teasing", incidents: 59, timeRange: "7PM-10PM" },
  { lat: 26.9280, lng: 75.7980, intensity: 0.6, area: "Bani Park", crimeType: "Stalking", incidents: 42, timeRange: "8PM-12AM" },
  { lat: 26.9010, lng: 75.7850, intensity: 0.82, area: "Civil Lines", crimeType: "Harassment", incidents: 95, timeRange: "7PM-11PM" },
];


// Incident reports for admin dashboard
export interface IncidentReport {
  id: string;
  date: string;
  time: string;
  location: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "investigating" | "resolved" | "dismissed";
  description: string;
  reportedBy: string;
}

export const mockIncidents: IncidentReport[] = [
  { id: "INC-001", date: "2025-12-15", time: "22:30", location: "Connaught Place, Delhi", type: "Harassment", severity: "high", status: "investigating", description: "Woman reported being followed by unknown men near outer circle.", reportedBy: "Anonymous" },
  { id: "INC-002", date: "2025-12-14", time: "21:15", location: "Paharganj, Delhi", type: "Assault", severity: "critical", status: "reported", description: "Physical assault attempt near Main Bazaar road. Victim managed to escape.", reportedBy: "Priya S." },
  { id: "INC-003", date: "2025-12-13", time: "19:45", location: "Saket Metro Station, Delhi", type: "Stalking", severity: "medium", status: "resolved", description: "Repeated stalking by same individual for 3 days near metro exit gate 2.", reportedBy: "Meera K." },
  { id: "INC-004", date: "2025-12-12", time: "23:00", location: "Gurugram Sec 29, Delhi", type: "Eve Teasing", severity: "medium", status: "investigating", description: "Group of men making obscene remarks near CyberHub entrance.", reportedBy: "Anita R." },
  { id: "INC-005", date: "2025-12-11", time: "20:30", location: "Old Delhi Railway Station", type: "Chain Snatching", severity: "high", status: "resolved", description: "Chain snatching incident near platform 5 ticket counter area.", reportedBy: "Sunita D." },
  { id: "INC-A01", date: "2025-12-15", time: "21:30", location: "GT Central, Jaipur", type: "Eve Teasing", severity: "high", status: "investigating", description: "Group of youth passing remarks at the mall entrance.", reportedBy: "Tanya M." },
  { id: "INC-A02", date: "2025-12-14", time: "23:45", location: "Raja Park market, Jaipur", type: "Stalking", severity: "medium", status: "reported", description: "Woman followed by a biker for 500 meters.", reportedBy: "Neha J." },
  { id: "INC-A03", date: "2025-12-13", time: "22:15", location: "Mansarovar Metro, Jaipur", type: "Harassment", severity: "high", status: "investigating", description: "Verbal abuse and threats near station parking lot.", reportedBy: "Anjali S." },
  { id: "INC-A04", date: "2025-12-12", time: "20:00", location: "Johari Bazar, Jaipur", type: "Theft", severity: "medium", status: "resolved", description: "Bag snatching in the crowded market area.", reportedBy: "Pooja B." },
];

export interface CityConfig {
  id: string;
  name: string;
  coords: [number, number];
  zoom: number;
  heatmapData: HeatmapPoint[];
  incidents: IncidentReport[];
}

export const CITIES: Record<string, CityConfig> = {
  delhi: {
    id: "delhi",
    name: "Delhi NCR",
    coords: [28.6139, 77.2090],
    zoom: 11,
    heatmapData: delhiHeatmapData,
    incidents: mockIncidents.filter(inc => inc.location.includes("Delhi") || inc.location.includes("Noida") || inc.location.includes("Gurugram") || inc.location.includes("Old Delhi")),
  },
  jaipur: {
    id: "jaipur",
    name: "Jaipur",
    coords: [26.9124, 75.7873],
    zoom: 12,
    heatmapData: jaipurHeatmapData,
    incidents: mockIncidents.filter(inc => inc.location.includes("Jaipur")),
  }
};


// Encrypted location log utilities
export interface LocationLog {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  riskLevel: RiskLevel;
  riskScore: number;
  encrypted: boolean;
}

export function encryptData(data: string): string {
  // Simple encryption for demo - Base64 + character shift
  const base64 = btoa(data);
  return base64.split('').map(c => 
    String.fromCharCode(c.charCodeAt(0) + 3)
  ).join('');
}

export function decryptData(encrypted: string): string {
  const shifted = encrypted.split('').map(c => 
    String.fromCharCode(c.charCodeAt(0) - 3)
  ).join('');
  return atob(shifted);
}

export function saveLocationLog(log: LocationLog): void {
  const logs = getLocationLogs();
  const encryptedLog = {
    ...log,
    encrypted: true,
    latitude: parseFloat(encryptData(log.latitude.toString())[0] + log.latitude.toString()),
    longitude: parseFloat(encryptData(log.longitude.toString())[0] + log.longitude.toString()),
  };
  logs.push(encryptedLog);
  localStorage.setItem('rakshika_location_logs', JSON.stringify(logs));
}

export function getLocationLogs(): LocationLog[] {
  const data = localStorage.getItem('rakshika_location_logs');
  return data ? JSON.parse(data) : [];
}

export function clearLocationLogs(): void {
  localStorage.removeItem('rakshika_location_logs');
}
