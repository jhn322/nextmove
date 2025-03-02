import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface GameHistory {
  id: string;
  user_id: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  date: string;
  moves_count: number;
  time_taken: number;
  difficulty: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  preferred_difficulty: string;
  theme_preference: string;
  sound_enabled: boolean;
  notifications_enabled: boolean;
  piece_set?: string;
  default_color?: string;
  show_coordinates?: boolean;
  enable_animations?: boolean;
}
