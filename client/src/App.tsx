import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider, useLanguage } from "@/lib/i18n";
import { MobileLayout } from "@/components/MobileLayout";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Login from "@/pages/login";
import ConnectGmail from "@/pages/connect-gmail";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import Notifications from "@/pages/notifications";
import AuthCallback from "@/pages/auth-callback";
import { initializeOAuthHandler, cleanupOAuthHandler } from "@/lib/auth-utils";

import SubscriptionDetailScreen from "@/screens/SubscriptionDetailScreen";

function Router() {
  const { dir } = useLanguage();
  
  return (
    <MobileLayout>
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/login" component={Login} />
        <Route path="/connect-gmail" component={ConnectGmail} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/settings" component={Settings} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/subscription/:id" component={SubscriptionDetailScreen} />
        <Route component={NotFound} />
        <Route path="/auth/callback" component={AuthCallback} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  // Initialize OAuth deep link handler for Capacitor
  useEffect(() => {
    initializeOAuthHandler();
    return () => {
      cleanupOAuthHandler();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Toaster />
        <Router />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
