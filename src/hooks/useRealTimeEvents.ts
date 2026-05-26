import { useState, useEffect } from 'react';
import { type IncidentReport, type CityConfig } from '../lib/riskEngine';
import { useCity } from './useCity';
import { toast } from "sonner";

export const useRealTimeEvents = () => {
  const { city } = useCity();
  const [liveIncidents, setLiveIncidents] = useState<IncidentReport[]>([]);

  useEffect(() => {
    // Initial incidents from city config
    setLiveIncidents(city.incidents);

    // Simulate real-time incident updates
    const interval = setInterval(() => {
      const shouldAdd = Math.random() > 0.7; // 30% chance every 30s
      if (shouldAdd) {
        const newIncident: IncidentReport = {
          id: `LIVE-${Math.floor(Math.random() * 1000)}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: city.heatmapData[Math.floor(Math.random() * city.heatmapData.length)].area + `, ${city.name}`,
          type: ["Harassment", "Stalking", "Eve Teasing", "Theft"][Math.floor(Math.random() * 4)],
          severity: ["medium", "high", "critical"][Math.floor(Math.random() * 3)] as any,
          status: "reported",
          description: "SIMULATED REAL-TIME ALERT: Reported incident in progress. Emergency services notified.",
          reportedBy: "Real-time AI Sensor"
        };

        setLiveIncidents(prev => [newIncident, ...prev]);
        
        // Show notification
        toast.error(`NEW ALERT: ${newIncident.type} reported at ${newIncident.location}`, {
          description: "Police and emergency services have been alerted.",
          duration: 5000,
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [city]);

  return { liveIncidents };
};
