import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Session } from "next-auth";

// Extend the Session type to include our custom properties
declare module "next-auth" {
  interface Session {
    supabaseToken?: string;
  }
}

// Make sure we have the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  // Provide fallbacks for development to prevent crashes
  // In production, this should never happen
}

// Global variable to store the client instance
let globalSupabaseClient: SupabaseClient | null = null;

/**
 * Creates a Supabase client with the given options
 */
const createSupabaseClient = (): SupabaseClient => {
  // Only create a new client if one doesn't exist
  if (!globalSupabaseClient && typeof window !== "undefined") {
    console.log("Creating new Supabase client (browser)");
    console.log("API Key available:", !!supabaseAnonKey);

    globalSupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          apikey: supabaseAnonKey!,
        },
      },
    });
  }

  // For SSR, create a minimal client that will be replaced on the client side
  if (!globalSupabaseClient) {
    console.log("Creating new Supabase client (server)");
    console.log("API Key available:", !!supabaseAnonKey);

    globalSupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          apikey: supabaseAnonKey!,
        },
      },
    });
  }

  return globalSupabaseClient;
};

/**
 * Get the Supabase client (singleton)
 */
export const supabase = createSupabaseClient();

/**
 * Get the authenticated Supabase client
 * This creates a new client with the user's session for proper RLS
 */
export const getAuthenticatedSupabaseClient = (
  session: Session | null
): SupabaseClient => {
  // If we're on the server or there's no session, return the base client
  if (typeof window === "undefined") {
    console.log("Using server-side Supabase client");
    return supabase;
  }

  // If there's no session or user ID, return the base client
  // but log a warning to help with debugging
  if (!session?.user?.id) {
    console.warn(
      "getAuthenticatedSupabaseClient called without a valid session"
    );
    return supabase;
  }

  console.log(
    "Creating authenticated Supabase client for user:",
    session.user.id
  );
  console.log("API Key available:", !!supabaseAnonKey);
  console.log("Supabase token available:", !!session.supabaseToken);

  // Create headers object for debugging
  const headers = {
    // Always include the API key
    apikey: supabaseAnonKey!,
    // Set the custom header with the user ID for RLS policies
    "x-user-id": session.user.id,
    // Add the token if available
    ...(session.supabaseToken && {
      Authorization: `Bearer ${session.supabaseToken}`,
    }),
  };

  console.log("Request headers:", headers);

  // For authenticated requests, create a new client with auth headers
  // This is necessary for RLS policies to work correctly
  const client = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers,
    },
  });

  return client;
};

/**
 * Clear the Supabase client cache
 */
export const clearSupabaseClientCache = (): void => {
  globalSupabaseClient = null;
  console.log("Supabase client cache cleared");
};

export interface GameHistory {
  id: string;
  user_id: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  date: string;
  moves_count: number;
  time_taken: number;
  difficulty: string;
  fen?: string;
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
