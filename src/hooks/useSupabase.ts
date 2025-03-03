import { useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@/context/auth-context";

/**
 * Custom hook to get an authenticated Supabase client
 * This ensures the client is properly initialized with the current session
 */
export function useSupabaseClient(): {
  client: SupabaseClient | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { session, status } = useAuth();
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't try to initialize if we're still loading the auth state
    if (status === "loading") {
      return;
    }

    try {
      // Get the Supabase URL and API key directly from environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables");
      }

      console.log("Creating Supabase client with direct API key");

      // Create headers for the client
      const headers: Record<string, string> = {
        apikey: supabaseAnonKey,
      };

      // Add user ID and token if available
      if (session?.user?.id) {
        headers["x-user-id"] = session.user.id;

        if (session.supabaseToken) {
          headers["Authorization"] = `Bearer ${session.supabaseToken}`;
        }
      }

      console.log(
        "Headers being used:",
        JSON.stringify({
          apikey: "PRESENT",
          "x-user-id": session?.user?.id ? "PRESENT" : "MISSING",
          Authorization: session?.supabaseToken ? "PRESENT" : "MISSING",
        })
      );

      // Create a new client with the headers
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers,
        },
      });

      setClient(supabaseClient);
      setError(null);
    } catch (err) {
      console.error("Error initializing Supabase client:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to initialize Supabase client")
      );
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  return { client, isLoading, error };
}
