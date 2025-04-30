import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <Loader2 className={cn("h-6 w-6 animate-spin text-primary", className)} />
  );
};
