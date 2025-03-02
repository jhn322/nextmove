"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

interface UserSettings {
  display_name: string;
  avatar_url: string;
  preferred_difficulty: string;
  sound_enabled: boolean;
  notifications_enabled: boolean;
}

export default function SettingsPage() {
  const { session, status } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    display_name: "",
    avatar_url: "",
    preferred_difficulty: "medium",
    sound_enabled: true,
    notifications_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserSettings() {
      if (status === "authenticated" && session?.user?.id) {
        setLoading(true);
        setError(null);

        try {
          const { error: permissionCheckError } = await supabase
            .from("user_settings")
            .select("count")
            .limit(1);

          if (permissionCheckError) {
            setError(
              "You don't have permission to access settings. Please contact support."
            );
            setLoading(false);
            return;
          }

          // Check if settings exist
          const { data, error } = await supabase
            .from("user_settings")
            .select("*")
            .filter("user_id", "eq", session.user.id)
            .maybeSingle();

          if (error && error.code !== "PGRST116") {
            // PGRST116 is the error code for "no rows returned"
            console.error("Error fetching settings:", error);
            setSaveMessage("Failed to load settings");
            setError(error.message);
          } else if (data) {
            // Settings exist, update state
            setSettings({
              display_name: data.display_name,
              avatar_url: data.avatar_url,
              preferred_difficulty: data.preferred_difficulty,
              sound_enabled: data.sound_enabled,
              notifications_enabled: data.notifications_enabled,
            });
          } else {
            // Settings don't exist, but don't try to create them automatically
            setError(
              "No settings found. Please save your settings to create them."
            );
          }
        } catch (error: unknown) {
          console.error("Unexpected error:", error);
          setError(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred"
          );
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        setLoading(false);
      }
    }

    loadUserSettings();
  }, [session, status]);

  const handleSaveSettings = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data: existingSettings, error: checkError } = await supabase
        .from("user_settings")
        .select("id")
        .filter("user_id", "eq", session.user.id)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        setError(checkError.message);
        setLoading(false);
        return;
      }

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from("user_settings")
          .update({
            display_name: settings.display_name,
            avatar_url: settings.avatar_url,
            preferred_difficulty: settings.preferred_difficulty,
            sound_enabled: settings.sound_enabled,
            notifications_enabled: settings.notifications_enabled,
          })
          .filter("user_id", "eq", session.user.id);

        if (error) {
          console.error("Error updating settings:", error);
          setSaveMessage("Failed to save settings");
          setError(error.message);
        } else {
          setSaveMessage("Settings saved successfully");
          setError(null);
          setTimeout(() => setSaveMessage(""), 3000);
        }
      } else {
        // Create new settings
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: session.user.id,
            display_name:
              settings.display_name || session.user.name || "Chess Player",
            avatar_url:
              settings.avatar_url ||
              session.user.image ||
              "/default-avatar.png",
            preferred_difficulty: settings.preferred_difficulty,
            theme_preference: "dark",
            sound_enabled: settings.sound_enabled,
            notifications_enabled: settings.notifications_enabled,
          });

        if (insertError) {
          console.error("Error creating settings:", insertError);
          setSaveMessage("Failed to create settings");
          setError(insertError.message);
        } else {
          setSaveMessage("Settings created successfully");
          setError(null);
          setTimeout(() => setSaveMessage(""), 3000);
        }
      }
    } catch (error: unknown) {
      console.error("Unexpected error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>
              Please sign in to view your settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={settings.display_name}
              onChange={(e) =>
                setSettings({ ...settings, display_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              value={settings.avatar_url}
              onChange={(e) =>
                setSettings({ ...settings, avatar_url: e.target.value })
              }
            />
            {settings.avatar_url && (
              <div className="mt-2">
                <Image
                  src={settings.avatar_url}
                  alt="Avatar Preview"
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_difficulty">Preferred Difficulty</Label>
            <select
              id="preferred_difficulty"
              className="w-full p-2 border rounded-md"
              value={settings.preferred_difficulty}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  preferred_difficulty: e.target.value,
                })
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sound_enabled">Sound</Label>
            <input
              type="checkbox"
              id="sound_enabled"
              checked={settings.sound_enabled}
              onChange={(e) =>
                setSettings({ ...settings, sound_enabled: e.target.checked })
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifications_enabled">Notifications</Label>
            <input
              type="checkbox"
              id="notifications_enabled"
              checked={settings.notifications_enabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications_enabled: e.target.checked,
                })
              }
              className="h-4 w-4"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <Button onClick={handleSaveSettings} disabled={loading}>
            Save Settings
          </Button>
          {saveMessage && !error && (
            <p
              className={
                saveMessage.includes("Failed")
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              {saveMessage}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
