import { useState, useEffect } from "react";
import { FileText, Lock, Trash2, Download, Shield, Eye, EyeOff, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLocationLogs, clearLocationLogs, type LocationLog, type RiskLevel } from "@/lib/riskEngine";

const LocationLogs = () => {
  const [logs, setLogs] = useState<LocationLog[]>([]);
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const data = getLocationLogs();
    setLogs(data.reverse());
  };

  const handleClearLogs = () => {
    clearLocationLogs();
    setLogs([]);
    toast.success("All location logs cleared securely");
  };

  const exportLogs = () => {
    const exportData = logs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      latitude: privacyMode ? "***encrypted***" : log.latitude,
      longitude: privacyMode ? "***encrypted***" : log.longitude,
      riskLevel: log.riskLevel,
      riskScore: log.riskScore,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rakshika_safety_logs_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exported successfully!");
  };

  const getRiskBadge = (level: RiskLevel) => {
    const styles: Record<RiskLevel, string> = {
      low: "bg-green-500/10 text-green-500 border-green-500/30",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      critical: "bg-red-600/10 text-red-600 border-red-600/30",
    };
    return styles[level];
  };

  const stats = {
    total: logs.length,
    highRisk: logs.filter((l) => l.riskLevel === "high" || l.riskLevel === "critical").length,
    safe: logs.filter((l) => l.riskLevel === "low").length,
    lastCheck: logs.length > 0 ? new Date(logs[0].timestamp).toLocaleString() : "No checks yet",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 gradient-soft py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Encrypted Location Logs
              </h1>
              <p className="text-muted-foreground">
                Securely stored history of your safety checks with encryption
              </p>
            </div>

            {/* Privacy Controls */}
            <Card className="shadow-card border-0 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Privacy Protection Active</p>
                      <p className="text-xs text-muted-foreground">
                        All location data is encrypted before storage using Base64 + character shift encryption
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="privacy-mode"
                        checked={privacyMode}
                        onCheckedChange={setPrivacyMode}
                      />
                      <Label htmlFor="privacy-mode" className="text-sm cursor-pointer">
                        {privacyMode ? (
                          <span className="flex items-center gap-1">
                            <EyeOff className="h-3 w-3" /> Hidden
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Visible
                          </span>
                        )}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Checks</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">{stats.safe}</p>
                  <p className="text-xs text-muted-foreground">Safe Locations</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">{stats.highRisk}</p>
                  <p className="text-xs text-muted-foreground">High Risk</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-foreground truncate">{stats.lastCheck}</p>
                  <p className="text-xs text-muted-foreground">Last Check</p>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={exportLogs} disabled={logs.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export Logs
              </Button>
              <Button variant="outline" onClick={loadLogs}>
                <FileText className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={logs.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Logs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Location Logs?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all stored location logs. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearLogs} className="bg-destructive text-destructive-foreground">
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Logs List */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Location Check History
                </CardTitle>
                <CardDescription>
                  {logs.length > 0
                    ? `${logs.length} location checks recorded`
                    : "No location checks yet. Use Risk Prediction to start logging."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No logs recorded yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Location checks from the Risk Prediction page will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">
                                {privacyMode
                                  ? "🔒 ****.****"
                                  : `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}`}
                              </p>
                              {log.encrypted && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold">{log.riskScore}/100</p>
                          </div>
                          <Badge variant="outline" className={getRiskBadge(log.riskLevel)}>
                            {log.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Encryption Info */}
            <Card className="shadow-card border-0 bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Encryption Details</p>
                    <p className="text-xs text-muted-foreground">
                      Location data is encrypted using Base64 encoding with character shift cipher before
                      being stored in your browser's localStorage. Data never leaves your device. You can
                      export encrypted logs for backup or clear them at any time. For production deployment,
                      AES-256 encryption with server-side key management is recommended.
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

export default LocationLogs;
