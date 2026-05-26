import { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, Phone, MapPin, Plus, Trash2, Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface AlertLog {
  id: string;
  timestamp: string;
  type: "button" | "voice";
  trigger: string;
  location: string;
}

const TRIGGER_WORDS = ["help me", "help", "bachao", "emergency", "save me", "danger", "sos"];

const SOSAlert = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [autoLocation, setAutoLocation] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Emergency Contact", phone: "+91 9876543210" },
  ]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Voice trigger states
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
    }

    // Load saved logs
    const saved = localStorage.getItem("rakshika_alert_logs");
    if (saved) setAlertLogs(JSON.parse(saved));

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const triggerSOS = useCallback((type: "button" | "voice", trigger: string) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;

      const message = `🚨 EMERGENCY ALERT!\nName: ${name || "Unknown"}\nLocation: ${mapLink}\nTriggered by: ${type === "voice" ? `Voice ("${trigger}")` : "SOS Button"}`;

      const phoneNumber = contacts[0]?.phone.replace(/\s+/g, "");
      if (phoneNumber) {
        const smsLink = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        window.location.href = smsLink;
      }

      // Save alert log
      const log: AlertLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type,
        trigger,
        location: `${lat}, ${lon}`,
      };
      const newLogs = [log, ...alertLogs].slice(0, 50);
      setAlertLogs(newLogs);
      localStorage.setItem("rakshika_alert_logs", JSON.stringify(newLogs));

      setShowSuccessDialog(true);
      toast.success("🚨 SOS Alert Triggered!");
    });
  }, [name, contacts, alertLogs]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      transcript = transcript.toLowerCase().trim();
      setLastTranscript(transcript);

      // Check for trigger words
      for (const word of TRIGGER_WORDS) {
        if (transcript.includes(word)) {
          toast.warning(`🎤 Voice trigger detected: "${word}"! Sending SOS in 3 seconds...`);
          recognition.stop();
          setIsListening(false);

          // Countdown before sending
          let count = 3;
          setSosCountdown(count);
          countdownRef.current = setInterval(() => {
            count--;
            setSosCountdown(count);
            if (count <= 0) {
              clearInterval(countdownRef.current);
              setSosCountdown(null);
              triggerSOS("voice", word);
            }
          }, 1000);
          return;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        toast.error(`Voice recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListening && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    toast.success("🎤 Voice listener activated! Say 'Help me' to trigger SOS");
  }, [isListening, triggerSOS]);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setLastTranscript("");
    toast.info("🎤 Voice listener deactivated");
  };

  const cancelCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      setSosCountdown(null);
      toast.info("SOS countdown cancelled");
    }
  };

  const addContact = () => {
    if (!newContactName || !newContactPhone) {
      toast.error("Please fill in contact details.");
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      phone: newContactPhone,
    };

    setContacts([...contacts, newContact]);
    setNewContactName("");
    setNewContactPhone("");
    toast.success("Contact added successfully!");
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    toast.success("Contact removed.");
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation(`${lat}, ${lon}`);
        toast.success("Location detected!");
      },
      (error) => {
        console.error("Location error:", error);
        toast.error("Unable to detect location.");
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 gradient-soft py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Send Instant SOS Alert
              </h1>
              <p className="text-muted-foreground">
                Emergency alerts to your trusted contacts — via button or voice command
              </p>
            </div>

            {/* Voice Trigger Card */}
            <Card className={`shadow-card border-0 transition-all ${isListening ? "ring-2 ring-destructive ring-offset-2" : ""}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  Voice Trigger (Web Speech API)
                </CardTitle>
                <CardDescription>
                  Enable microphone to auto-detect distress phrases: "Help me", "Bachao", "Emergency", "SOS"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {isListening ? (
                      <div className="relative">
                        <Mic className="h-8 w-8 text-destructive animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping"></div>
                      </div>
                    ) : (
                      <MicOff className="h-8 w-8 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {isListening ? "🔴 Listening for distress words..." : "Voice listener inactive"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {voiceSupported ? "Web Speech API supported" : "⚠️ Not supported in this browser"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    onClick={isListening ? stopListening : startListening}
                    disabled={!voiceSupported}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" /> Stop
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" /> Start Listening
                      </>
                    )}
                  </Button>
                </div>

                {lastTranscript && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Last heard:</p>
                    <p className="text-sm font-medium italic">"{lastTranscript}"</p>
                  </div>
                )}

                {sosCountdown !== null && (
                  <div className="p-4 bg-destructive/10 rounded-lg text-center animate-pulse">
                    <p className="text-lg font-bold text-destructive">
                      🚨 SOS triggering in {sosCountdown} seconds...
                    </p>
                    <Button variant="outline" size="sm" onClick={cancelCountdown} className="mt-2">
                      Cancel
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <p className="text-xs text-muted-foreground w-full">Trigger words:</p>
                  {TRIGGER_WORDS.map((word) => (
                    <Badge key={word} variant="outline" className="text-xs">
                      "{word}"
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  Provide your details for the alert message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location">Current Location</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-location"
                        checked={autoLocation}
                        onCheckedChange={(checked) => {
                          setAutoLocation(checked);
                          if (checked) detectLocation();
                        }}
                      />
                      <Label htmlFor="auto-location" className="text-sm cursor-pointer">
                        Auto-detect
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      id="location"
                      placeholder="Enter your current address or coordinates"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={autoLocation}
                    />
                    {!autoLocation && (
                      <Button variant="outline" size="icon" onClick={detectLocation}>
                        <MapPin className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>
                  Add contacts who will receive your SOS alert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.phone}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <Label className="text-sm font-medium">Add New Contact</Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Contact Name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                    />
                    <Input
                      placeholder="Phone Number"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                    />
                  </div>
                  <Button onClick={addContact} variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SOS Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={() => triggerSOS("button", "Manual SOS Button")}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full md:w-auto px-16 py-8 text-xl animate-heartbeat rounded-2xl shadow-lg"
              >
                <AlertCircle className="mr-3 h-8 w-8" />
                SEND SOS ALERT
              </Button>
            </div>

            {/* Alert History */}
            {alertLogs.length > 0 && (
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                    Alert History
                  </CardTitle>
                  <CardDescription>Recent SOS alerts triggered from this device</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {alertLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {log.type === "voice" ? (
                            <Mic className="h-4 w-4 text-destructive" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {log.type === "voice" ? `Voice: "${log.trigger}"` : "Manual SOS"}
                            </p>
                            <p className="text-xs text-muted-foreground">{log.location}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-2xl">
              🚨 Alert Sent Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your SOS alert has been triggered with your current location.
              Emergency contacts have been notified. Stay safe!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="w-full">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default SOSAlert;
