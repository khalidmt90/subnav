import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    (async () => {
      try {
        // parses the URL and persists the session
        await supabase.auth.getSession();
      } finally {
        setLocation("/connect-gmail");
      }
    })();
  }, [setLocation]);

  return null;
}
