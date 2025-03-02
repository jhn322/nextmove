"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const DebugPage = () => {
  const { session, status, signIn, signOut } = useAuth();
  const [supabaseStatus, setSupabaseStatus] = useState<string>("Checking...");
  const [envVars, setEnvVars] = useState<{ [key: string]: string | undefined }>(
    {}
  );

  useEffect(() => {
    // Check Supabase connection
    const checkSupabase = async () => {
      try {
        const { error } = await supabase.from("users").select("count").limit(1);
        if (error) {
          setSupabaseStatus(`Error: ${error.message}`);
        } else {
          setSupabaseStatus("Connected successfully");
        }
      } catch (error) {
        setSupabaseStatus(`Exception: ${(error as Error).message}`);
      }
    };

    // Get public environment variables
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
    });

    checkSupabase();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Auth Status</h3>
              <p className="text-muted-foreground">{status}</p>
            </div>

            {session && (
              <div>
                <h3 className="text-lg font-medium">Session Info</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto mt-2">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium">Supabase Status</h3>
              <p className="text-muted-foreground">{supabaseStatus}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">
                Public Environment Variables
              </h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto mt-2">
                {JSON.stringify(envVars, null, 2)}
              </pre>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => signIn("google")}>Sign In</Button>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPage;
