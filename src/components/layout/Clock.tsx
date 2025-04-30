"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
// Remove unused import
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Define valid clock formats explicitly
type ClockFormat = "12" | "24";

export default function Clock() {
  const { session, status } = useAuth();
  const [time, setTime] = useState(new Date());
  // Default timezone and format
  const [timezone, setTimezone] = useState("UTC");
  const [clockFormat, setClockFormat] = useState<ClockFormat>("24");

  useEffect(() => {
    // Set timezone and format from session if available
    if (status === "authenticated" && session?.user) {
      setTimezone(session.user.timezone || "UTC");
      // Ensure clockFormat is either "12" or "24", default to "24"
      const formatFromSession = session.user.clockFormat;
      setClockFormat(formatFromSession === "12" ? "12" : "24");
    } else {
      // Optionally load from localStorage if not authenticated (or reset to defaults)
      // For simplicity, we'll just use defaults if not logged in
      setTimezone("UTC");
      setClockFormat("24");
    }
  }, [session?.user, status]); // Depend on session user object

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Use a try-catch block for timezone conversion as invalid zones can cause errors
  let timeString = "--:--";
  try {
    const zonedTime = toZonedTime(time, timezone);
    timeString = format(zonedTime, clockFormat === "12" ? "hh:mm a" : "HH:mm");
  } catch (error) {
    console.error(`Invalid timezone specified: ${timezone}`, error);
    // Keep default timeString or handle error display
  }

  return (
    <div className="font-mono text-sm text-muted-foreground">{timeString}</div>
  );
}
