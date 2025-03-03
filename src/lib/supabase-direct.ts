import { Session } from "next-auth";

export interface UserSettings {
  user_id: string;
  display_name: string;
  avatar_url: string;
  preferred_difficulty: string;
  sound_enabled: boolean;
  piece_set: string;
  default_color: string;
  show_coordinates: boolean;
  enable_animations: boolean;
}

export interface GameHistory {
  id: string;
  user_id: string;
  opponent: string;
  result: string;
  date: string;
  moves_count: number;
  time_taken: number;
  difficulty: string;
}

/**
 * Makes a direct authenticated request to Supabase REST API
 * This bypasses the Supabase client and ensures the API key is included
 */
export async function fetchFromSupabase<T = unknown>(
  path: string,
  options: RequestInit = {},
  session: Session | null = null
): Promise<T> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const url = `${supabaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  // Create headers with API key
  const headers = new Headers(options.headers);
  headers.set("apikey", supabaseKey);
  headers.set("Content-Type", "application/json");

  // Add authorization if session exists
  if (session?.supabaseToken) {
    headers.set("Authorization", `Bearer ${session.supabaseToken}`);
  }

  // Add user ID if available
  if (session?.user?.id) {
    headers.set("x-user-id", session.user.id);
  }

  console.log("Direct Supabase request to:", url);
  console.log("Headers:", {
    apikey: "PRESENT",
    "Content-Type": headers.get("Content-Type"),
    Authorization: headers.has("Authorization") ? "PRESENT" : "MISSING",
    "x-user-id": headers.has("x-user-id") ? "PRESENT" : "MISSING",
  });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Supabase API error:", response.status, errorText);
    throw new Error(`Supabase API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Get user settings using direct fetch
 */
export async function getUserSettings(
  userId: string,
  session: Session | null
): Promise<UserSettings[]> {
  return fetchFromSupabase<UserSettings[]>(
    `/rest/v1/user_settings?user_id=eq.${userId}&select=*`,
    { method: "GET" },
    session
  );
}

/**
 * Get user game history using direct fetch
 */
export async function getUserGameHistory(
  userId: string,
  session: Session | null
): Promise<GameHistory[]> {
  return fetchFromSupabase<GameHistory[]>(
    `/rest/v1/game_history?user_id=eq.${userId}&order=date.desc&select=*`,
    { method: "GET" },
    session
  );
}

/**
 * Save user settings using direct fetch
 */
export async function saveUserSettings(
  userId: string,
  settings: Record<string, unknown>,
  session: Session | null
) {
  return fetchFromSupabase(
    `/rest/v1/user_settings`,
    {
      method: "POST",
      body: JSON.stringify({
        ...settings,
        user_id: userId,
      }),
      headers: {
        Prefer: "return=representation",
      },
    },
    session
  );
}

/**
 * Clear user game history using direct fetch
 */
export async function clearUserGameHistory(
  userId: string,
  session: Session | null
) {
  return fetchFromSupabase(
    `/rest/v1/game_history?user_id=eq.${userId}`,
    { method: "DELETE" },
    session
  );
}
