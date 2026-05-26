import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RiskPrediction from "./pages/RiskPrediction";
import SOSAlert from "./pages/SOSAlert";
import Dashboard from "./pages/Dashboard";
import SafetyHeatmap from "./pages/SafetyHeatmap";
import SafetyRoutes from "./pages/SafetyRoutes";
import LocationLogs from "./pages/LocationLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/risk-prediction" element={<RiskPrediction />} />
          <Route path="/sos-alert" element={<SOSAlert />} />
          <Route path="/safety-heatmap" element={<SafetyHeatmap />} />
          <Route path="/safety-routes" element={<SafetyRoutes />} />
          <Route path="/location-logs" element={<LocationLogs />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
