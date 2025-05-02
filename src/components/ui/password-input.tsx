"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Infer props type from the Input component
type PasswordInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "type"
>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleTogglePassword = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)} // Add padding for the button
          ref={ref}
          {...props}
        />
        <Button
          type="button" // Prevent form submission
          variant="ghost"
          size="icon"
          className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
          onClick={handleTogglePassword}
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1} // Prevent button from being focused directly
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
