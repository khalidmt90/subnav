import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://obdzaqfjdohizqvfugqh.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_JtI8YDrODpmszB2iOcEzog_aqRTZZR_";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
