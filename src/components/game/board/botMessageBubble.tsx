import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BotMessageBubbleProps {
  message: string;
  isVisible: boolean;
  position?: "top" | "bottom";
}

const BotMessageBubble = ({
  message,
  isVisible,
  position = "top",
}: BotMessageBubbleProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === "top" ? 30 : -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === "top" ? -30 : 30 }}
          className={cn(
            "absolute z-10 max-w-[200px] px-4 py-2 rounded-lg",
            "bg-background border border-border",
            "shadow-lg dark:shadow-none",
            position === "top" ? "-top-16" : "-bottom-26",
            "left-1/5 -translate-x-1/2"
          )}
        >
          <div className="relative">
            <p className="text-sm text-foreground">{message}</p>
            <div
              className={cn(
                "absolute w-3 h-3 bg-background rotate-45 border border-border",
                position === "top"
                  ? "bottom-[-18px] border-t-0 border-l-0"
                  : "top-[-18px] border-b-0 border-r-0",
                "left-1/2 -translate-x-1/2"
              )}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BotMessageBubble;
