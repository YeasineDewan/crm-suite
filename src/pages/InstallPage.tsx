import { Apple, Smartphone, Share2, MoreVertical, Download, ArrowLeft, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPage() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone) {
      setIsStandalone(true);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Download className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Already Installed!</h1>
            <p className="text-muted-foreground">CRM Pro is already running as an installed app on your device.</p>
            <Button onClick={() => navigate("/")} className="mt-4">Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Step = ({ number, icon, title, description }: { number: number; icon: React.ReactNode; title: string; description: string }) => (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Install CRM Pro</h1>
          <p className="text-muted-foreground text-sm">Add CRM Pro to your home screen for instant access and offline support.</p>
        </div>

        {deferredPrompt && (
          <Card className="border-primary">
            <CardContent className="pt-6 text-center space-y-3">
              <p className="text-sm font-medium text-foreground">Your browser supports one-tap install!</p>
              <Button onClick={handleInstall} size="lg" className="w-full gap-2">
                <Download className="w-4 h-4" /> Install Now
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="ios" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ios" className="gap-1.5"><Apple className="w-4 h-4" /> iPhone / iPad</TabsTrigger>
            <TabsTrigger value="android" className="gap-1.5"><Smartphone className="w-4 h-4" /> Android</TabsTrigger>
          </TabsList>

          <TabsContent value="ios" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Install on Safari (iOS)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Step
                  number={1}
                  icon={<Share2 className="w-4 h-4 text-primary" />}
                  title='Tap the "Share" button'
                  description="Find the share icon at the bottom of Safari (a square with an arrow pointing up)."
                />
                <Step
                  number={2}
                  icon={<Plus className="w-4 h-4 text-primary" />}
                  title='"Add to Home Screen"'
                  description='Scroll down in the share menu and tap "Add to Home Screen".'
                />
                <Step
                  number={3}
                  icon={<Download className="w-4 h-4 text-primary" />}
                  title='Tap "Add"'
                  description='Confirm the name and tap "Add" in the top-right corner. CRM Pro will appear on your home screen.'
                />
                <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  <strong>Note:</strong> You must use Safari on iOS. Chrome and other browsers on iPhone do not support "Add to Home Screen."
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="android" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Install on Chrome (Android)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Step
                  number={1}
                  icon={<MoreVertical className="w-4 h-4 text-primary" />}
                  title="Open browser menu"
                  description="Tap the three-dot menu icon in the top-right corner of Chrome."
                />
                <Step
                  number={2}
                  icon={<Plus className="w-4 h-4 text-primary" />}
                  title='"Add to Home screen"'
                  description='Select "Add to Home screen" or "Install app" from the menu.'
                />
                <Step
                  number={3}
                  icon={<Download className="w-4 h-4 text-primary" />}
                  title='Tap "Install"'
                  description='Confirm by tapping "Install." CRM Pro will appear in your app drawer and home screen.'
                />
                <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  <strong>Tip:</strong> If you see an "Install" banner at the bottom of the screen, you can tap it directly to install.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
