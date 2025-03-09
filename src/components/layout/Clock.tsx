"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { getUserSettings } from "@/lib/mongodb-service";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export default function Clock() {
  const { session, status } = useAuth();
  const [time, setTime] = useState(new Date());
  const [timezone, setTimezone] = useState("UTC");
  const [clockFormat, setClockFormat] = useState<"12" | "24">("24");

  useEffect(() => {
    const loadSettings = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const settings = await getUserSettings(session.user.id);
          if (settings) {
            setTimezone(settings.timezone || "UTC");
            setClockFormat(settings.clock_format || "24");
          }
        } catch (error) {
          console.error("Error loading user settings:", error);
        }
      }
    };

    loadSettings();
  }, [session, status]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const zonedTime = toZonedTime(time, timezone);
  const timeString = format(
    zonedTime,
    clockFormat === "12" ? "hh:mm a" : "HH:mm"
  );

  return (
    <div className="font-mono text-sm text-muted-foreground">{timeString}</div>
  );
}
