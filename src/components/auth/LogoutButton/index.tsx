"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/auth/constants/auth";
import { LogOut } from "lucide-react"; // Importera ikon

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export const LogoutButton = ({ children, className }: LogoutButtonProps) => {
  const handleLogout = () => {
    signOut({
      callbackUrl: AUTH_ROUTES.LOGIN, // Omdirigera till login-sidan efter utloggning
      redirect: true, // Se till att omdirigering sker
    });
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost" // Eller annan passande variant
      className={`flex items-center gap-2 ${className || ""}`}
    >
      {children || (
        <>
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </>
      )}
    </Button>
  );
};
