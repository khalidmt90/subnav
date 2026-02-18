import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import { isNativeApp } from "@/lib/auth-utils";

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log('🌐 Web auth callback triggered');
    console.log('📱 Is native app:', isNativeApp());

    // This route should only handle web OAuth, not native deep links
    if (isNativeApp()) {
      console.log('⚠️ Native app - redirecting to login (deep link handler should handle this)');
      setLocation("/login");
      return;
    }

    (async () => {
      try {
        console.log('🔄 Getting session from URL params...');
        // parses the URL and persists the session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting session:', error);
        } else {
          console.log('✅ Session obtained:', data.session?.user?.email);
        }
      } finally {
        console.log('🚀 Redirecting to connect-gmail');
        setLocation("/connect-gmail");
      }
    })();
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Processing login...</p>
    </div>
  );
}
