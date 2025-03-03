"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DebugPage = () => {
  const { status, session, signIn, signOut } = useAuth();

  // Get public environment variables
  const envVars = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

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
