import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EloBadgeProps {
  elo?: number;
  className?: string;
  colorClassName?: string;
}

export const EloBadge = ({ elo, className, colorClassName }: EloBadgeProps) => (
  <Badge
    variant="outline"
    className={cn(
      "px-2 py-0.5 text-xs font-semibold rounded-full",
      colorClassName,
      className
    )}
  >
    ELO: {typeof elo === "number" ? elo : "N/A"}
  </Badge>
);

export default EloBadge;
