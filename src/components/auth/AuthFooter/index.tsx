import { Button } from "@/components/ui/button";
import type { AuthFooterProps } from "./types";

export const AuthFooter = ({ mode, onNavigate }: AuthFooterProps) => (
  <p className="text-sm text-muted-foreground ">
    {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
    <Button variant="link" className="p-0" onClick={onNavigate}>
      {mode === "login" ? "Register" : "Sign In"}
    </Button>
  </p>
);
